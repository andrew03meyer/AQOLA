import pandas as pd
import os
from pathlib import Path
from dotenv import load_dotenv
from testing.error_logging import error_process_batch

# Standardises the full address
def standardise_address_key(address_series):
    return address_series.astype(str).str.lower().str.replace(r'[^a-z0-9]', '', regex=True)

# Loads and standardises spatial reference data
def get_spatial_lookup(postcodes_path):
    if not postcodes_path.exists():
        print(f"Warning: {postcodes_path.name} not found.")
        return pd.DataFrame()
    
    spatial_cols = ['postcode', 'lsoa_id']
    df = pd.read_csv(postcodes_path, usecols=spatial_cols)
    # Standardise postcodes
    df['postcode'] = df['postcode'].str.replace(r'\s+', '', regex=True).str.upper()
    return df

# Loads raw Kent CSV and standardises headers
def load_raw_property_data(input_path):
    if not input_path.exists():
        return pd.DataFrame()
    df = pd.read_csv(input_path)
    df.columns = [c.strip().lower() for c in df.columns]
    return df

# Loads target identity and structural area metrics from the raw energy price certificate file
def load_epc_lookup(epc_path):
    if not epc_path.exists():
        print(f"Warning: energy price certificate dataset not found at {epc_path}")
        return pd.DataFrame()
    
    df = pd.read_csv(epc_path, usecols=['address', 'postcode', 'uprn', 'total_floor_area'])
    
    null_postcodes = df['postcode'].isna().sum()
    if null_postcodes > 0:
        print(f"Found {null_postcodes} records with missing postcodes. The records have been dropped from the lookup.")
        
    df = df.dropna(subset=['uprn', 'total_floor_area', 'postcode'])
    
    df['clean_epc_addr'] = standardise_address_key(df['address'])
    df['postcode'] = df['postcode'].astype(str).str.replace(r'\s+', '', regex=True).str.upper()
    df['uprn'] = df['uprn'].astype(str).str.split('.').str[0].str.strip()
    df['square_metres'] = df['total_floor_area'].astype(int)
    
    return df[['clean_epc_addr', 'postcode', 'uprn', 'square_metres']]

# Load the exact Ordnance Survey UPRN coordinates lookup
def load_uprn_coordinates(coords_path):
    if not coords_path.exists():
        print(f"Warning: UPRN coordinates file not found at {coords_path}")
        return pd.DataFrame()
    df = pd.read_csv(coords_path)
    df['property_id'] = df['property_id'].astype(str).str.split('.').str[0].str.strip()
    return df[['property_id', 'latitude', 'longitude']]

# Creates a single address string from PAON, SAON, and Street.
def construct_full_address(df):
    def format_row(row):
        parts = [
            str(row['saon']).strip() if pd.notnull(row['saon']) else "",
            str(row['paon']).strip() if pd.notnull(row['paon']) else "",
            str(row['street']).strip() if pd.notnull(row['street']) else ""
        ]
        return ", ".join([p for p in parts if p])

    df['full_address'] = df.apply(format_row, axis=1)
    return df

# Handles deduplication, address creation, and spatial data
def build_property_registry(df_kent, df_spatial, df_epc, df_coords):
    identity_cols = ['paon', 'saon', 'street', 'postcode', 'type']
    properties = df_kent[identity_cols].drop_duplicates().copy()
    properties['postcode'] = properties['postcode'].str.replace(r'\s+', '', regex=True).str.upper()
    properties = construct_full_address(properties)
    
    properties['clean_prop_addr'] = standardise_address_key(properties['full_address'])
    
    # Match against EPC dataset for uprn and floor area metrics
    properties = properties.merge(df_epc, left_on=['clean_prop_addr', 'postcode'], right_on=['clean_epc_addr', 'postcode'], how='left')
    
    # Match against spatial lookup to get LSOA
    if not df_spatial.empty:
        properties = properties.merge(df_spatial, on='postcode', how='left')
        
    properties = properties.rename(columns={'type': 'property_type', 'uprn': 'property_id'})
    
    # Match against the exact UPRN coordinate mapping table
    if not df_coords.empty:
        properties = properties.merge(df_coords, on='property_id', how='left')
        
    return properties

# Saves the final dataframe to output path
def export_to_csv(data, output_folder):
    output_path = output_folder / "property_data.csv"
    data.to_csv(output_path, index=False)

def property_process():
    load_dotenv()
    base_dir = Path(os.getenv("DATA_PATH_DEV"))
    
    input_file = base_dir / "property_data" / "raw" / "kent_property_data.csv"
    epc_file = base_dir / "property_data" / "raw" / "kent_domestic_energy_performance_certificate.csv"
    spatial_file = base_dir / "postcodes" / "postcodes.csv"
    coords_file = base_dir / "property_data" / "raw" / "kent_uprn_coordinates.csv"
    output_dir = base_dir / "property_data"
    
    df_raw = load_raw_property_data(input_file)
    df_spatial = get_spatial_lookup(spatial_file)
    df_epc = load_epc_lookup(epc_file)
    df_coords = load_uprn_coordinates(coords_file)
    
    if df_raw.empty or df_epc.empty:
        print("Error: Missing core raw datasets. Execution halted.")
        return

    processed_registry = build_property_registry(df_raw, df_spatial, df_epc, df_coords)
    
    # Log records missing an EPC reference mapping
    dropped_epc = processed_registry[processed_registry['property_id'].isna()]
    if not dropped_epc.empty:
        print(f"Logging {len(dropped_epc)} unmatched EPC records...")
        epc_errors = [
            {
                "data": [f"Address: {row['full_address']}, Postcode: {row['postcode']}"],
                "where": ["property_cleansing.py"],
                "desc": ["Missing target EPC reference mapping match"],
                "impact":["Property omitted from structural metric dashboard"],
                "cause": ["Address/Postcode lookup failed to match EPC registry"]
            }
            for row in dropped_epc[['full_address', 'postcode']].to_dict('records')
        ]
    
    error_process_batch(epc_errors)
    
    valid_registry = processed_registry.dropna(subset=['property_id']).copy()
    
    # Log records missing an LSOA link
    dropped_lsoa = valid_registry[valid_registry['lsoa_id'].isna()]
    if not dropped_lsoa.empty:
        print(f"Logging {len(dropped_lsoa)} unmatched spatial records...")
    
        lsoa_errors = [
            {
                "data": [f"UPRN: {row['property_id']}, Address: {row['full_address']}",],
                "where": ["property_cleansing -> spatial_validation"],
                "desc": ["Property dropped: no spatial lsoa link"],
                "impact": ["Excluded from ingestion due to missing boundary context"],
                "cause": ["Postcode could not be resolved against master lookup schema"]
            }
            for row in dropped_lsoa[['property_id', 'full_address']].to_dict('records')
        ]
    
    error_process_batch(lsoa_errors)
            
    # Drop rows missing structural data or boundary contexts
    valid_registry = valid_registry.dropna(subset=['lsoa_id', 'latitude', 'longitude'])
    # Enforce database uniqueness constraints using UPRN
    valid_registry = valid_registry.drop_duplicates(subset=['property_id'])
    
    final_columns = [
        "property_id",
        "full_address",
        "postcode",
        "lsoa_id",
        "property_type",
        "square_metres",
        "latitude",
        "longitude"
    ]
    
    final_output = valid_registry[final_columns]
    export_to_csv(final_output, output_dir)
    print(f"Successfully processed and exported {len(final_output)} unique properties")

if __name__ == "__main__":
    property_process()