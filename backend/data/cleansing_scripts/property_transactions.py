import pandas as pd
import os
import numpy as np
from pathlib import Path
from dotenv import load_dotenv
# from testing.error_logging import error_process

# Standardises the full address
def standardise_address_key(address_series):
    return address_series.astype(str).str.lower().str.replace(r'[^a-z0-9]', '', regex=True)

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

# Saves the final dataframe to output path
def export_to_csv(data, output_folder):
    output_path = output_folder / "property_transactions.csv"
    data.to_csv(output_path, index=False)

def property_transactions_process():
    load_dotenv()
    base_dir = Path(os.getenv("DATA_PATH_DEV"))
    
    # Define Explicit File Paths
    input_file = base_dir / "property_data" / "raw" / "kent_property_data.csv"
    cleaned_property_registry = base_dir / "property_data" / "property_data.csv"
    output_dir = base_dir / "property_transactions"

    if not cleaned_property_registry.exists():
        print("Error: Cleaned property master registry file not found. Please run property_cleansing.py first.")
        return

    df_prop_master = pd.read_csv(cleaned_property_registry, usecols=['property_id', 'full_address', 'postcode', 'square_meters'])
    
    # Prepare the lookup columns using a combination of standardised address and postcode
    df_prop_master['clean_prop_addr'] = standardise_address_key(df_prop_master['full_address'])
    df_prop_master['postcode'] = df_prop_master['postcode'].str.replace(r'\s+', '', regex=True).str.upper()
    
    df_lookup = df_prop_master[['clean_prop_addr', 'postcode', 'property_id', 'square_meters']].drop_duplicates()

    df_trans = pd.read_csv(input_file)
    df_trans.columns = [c.strip().lower() for c in df_trans.columns]
    df_trans['postcode'] = df_trans['postcode'].str.replace(r'\s+', '', regex=True).str.upper()
    
    # temporary dataframe of the records with missing postcodes that are to be removed
    # missing_postcodes = df_trans[df_trans['postcode'].isna()]
    # Logging the dropped rows in error log
    # if not missing_postcodes.empty:
    #     print(f"Logging {len(missing_postcodes)} transactions with missing postcodes...")
    #     for _, row in missing_postcodes.iterrows():
    #         errNoPostcode = {
    #             "data": [f"Transaction ID: {row['transaction_id']}"], 
    #             "where": ["property_transactions_cleansing -> clean_transactions"],
    #             "desc": ["Transaction dropped due to missing postcode"],
    #             "impact": ["Sale record excluded; cannot be linked to a specific property"],
    #             "cause": ["Postcode field is NaN in the raw Land Registry data"]
    #         }
    #         error_process(errNoPostcode)
    
    # Drop rows with missing postcodes
    df_trans = df_trans.dropna(subset=['postcode'])

    # Build full address for the mapping join token
    df_trans = construct_full_address(df_trans)
    df_trans['clean_trans_addr'] = standardise_address_key(df_trans['full_address'])
    
    df_lookup_distinct = df_lookup.drop_duplicates(
    subset=['clean_prop_addr', 'postcode'], 
    keep='first'
    )

    df_merged = df_trans.merge(
    df_lookup_distinct, 
    left_on=['clean_trans_addr', 'postcode'], 
    right_on=['clean_prop_addr', 'postcode'], 
    how='left'
    )

    
    def calculate_price_per_sqm(row):
        if pd.notnull(row['square_meters']) and row['square_meters'] > 0:
            return int(round(row['price'] / row['square_meters']))
        return np.nan
    
    def clean_property_id(val):
        if pd.isna(val) or val == '' or str(val).strip().lower() == 'nan':
            return None
        try:
            # This strips out '.0' from floats and keeps it as a clean string integer
            return str(int(float(val)))
        except (ValueError, TypeError):
            # Fallback just in case there's an unexpected text string in the column
            return str(val)

    df_merged['price_per_sqm'] = df_merged.apply(calculate_price_per_sqm, axis=1)
    df_merged['is_new_build'] = df_merged['old/new'].str.strip().str.upper()
    df_merged['sale_date'] = pd.to_datetime(df_merged['date']).dt.strftime('%Y-%m-%d')

    df_merged['property_id'] = df_merged['property_id'].apply(clean_property_id)
    
    # Set any IDs not present in property_data to None
    valid_property_ids = set(df_prop_master['property_id'].astype(str))
    df_merged['property_id'] = df_merged['property_id'].apply(
        lambda x: x if (x is None or str(x) in valid_property_ids) else None
    )
    

    final_columns = [
        "transaction_id", 
        "property_id", 
        "is_new_build", 
        "sale_date", 
        "price", 
        "price_per_sqm"
    ]
    
    final_output = df_merged[final_columns]
    
    final_output = final_output.dropna(subset=['transaction_id', 'sale_date', 'price'])
    
    os.makedirs(output_dir, exist_ok=True)
    export_to_csv(final_output, output_dir)
    print(f"Successfully processed and exported {len(final_output)} property transactions")

if __name__ == "__main__":
    property_transactions_process()