import pandas as pd
import os
from pathlib import Path
from dotenv import load_dotenv
from testing.error_logging import error_process

# Loads and standardises spatial reference data
def get_spatial_lookup(postcodes_path):
    if not postcodes_path.exists():
        print(f"Warning: {postcodes_path.name} not found.")
        return pd.DataFrame()
    
    spatial_cols = ['postcode', 'lsoa_id', 'latitude', 'longitude', 'centroid']
    df = pd.read_csv(postcodes_path, usecols=spatial_cols)
    
    # Standardise postcodes
    df['postcode'] = df['postcode'].str.replace(r'\s+', '', regex=True).str.upper()
    return df

# Loads raw Kent CSV and standardises headers
def load_raw_property_data(input_path):
    if not input_path.exists():
        return pd.DataFrame()
    
    df = pd.read_csv(input_path)
    # Standardise headers to lowercase and strip whitespace
    df.columns = [c.strip().lower() for c in df.columns]
    return df

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
def build_property_registry(df_kent, df_spatial):
    
    # Define identity columns for distinct properties
    identity_cols = ['paon', 'saon', 'street', 'postcode', 'type', 'old/new']
    properties = df_kent[identity_cols].drop_duplicates().copy()
    
    # Standardise property postcodes
    properties['postcode'] = properties['postcode'].str.replace(r'\s+', '', regex=True).str.upper()

    # Apply address construction
    properties = construct_full_address(properties)

    # Merge spatial data
    if not df_spatial.empty:
        properties = properties.merge(df_spatial, on='postcode', how='left')
    
    # Rename for SQL Schema consistency
    properties = properties.rename(columns={
        'type': 'property_type',
        'old/new': 'property_age'
    })
    
    return properties

# Saves the final dataframe to output path
def export_to_csv(data, output_folder):
    output_path = output_folder / "property_data.csv"
    data.to_csv(output_path, index=False)

def property_process():
    load_dotenv()
    base_dir = Path(os.getenv("DATA_PATH_DEV"))
    
    input_file = base_dir / "property_data" / "raw" / "kent_property_data.csv"
    spatial_file = base_dir / "postcodes" / "postcodes.csv"
    output_dir = base_dir / "property_data"
    
    
    df_raw = load_raw_property_data(input_file)
    if df_raw.empty:
        print("Error: No raw data found.")
        return

    df_spatial = get_spatial_lookup(spatial_file)
    

    final_properties = build_property_registry(df_raw, df_spatial)
    
    final_columns = [
        "full_address",
        "postcode",
        "lsoa_id",
        "property_type", 
        "property_age",
        "centroid",
        "latitude",
        "longitude"
    ]
    
    # temporary dataframe of the records with missing lsoa that are to be removed
    dropped_rows = final_properties[final_properties['lsoa_id'].isna()]

    # Logging the dropped rows in error log
    if not dropped_rows.empty:
        for _, row in dropped_rows.iterrows():
            errNoLSOA = {
                "data": [f"{row['full_address']}, {row['postcode']}"],
                "where": ["property_cleansing -> build_property_registry"],
                "desc": ["Property dropped: no spatial LSOA link"],
                "impact": ["Excluded from database ingestion"],
                "cause": ["LSOA ID is NaN; spatial join failed to find a polygon match"]
            }
            error_process(errNoLSOA)
    

    
    # Drop rows that didn't match a spatial LSOA for data integrity
    final_output = final_properties.dropna(subset=['lsoa_id'])[final_columns]
    
    
    export_to_csv(final_output, output_dir)

if __name__ == "__main__":
    property_process()