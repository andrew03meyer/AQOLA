import pandas as pd
import os
from pathlib import Path
from dotenv import load_dotenv
from testing.error_logging import error_process

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
    output_dir = base_dir / "property_transactions"

    df = pd.read_csv(input_file)
    
    # Standardise headers to lowercase
    df.columns = [c.strip().lower() for c in df.columns]
    
    # Standardise postcodes
    df['postcode'] = df['postcode'].str.replace(r'\s+', '', regex=True).str.upper()
    

    # temporary dataframe of the records with missing postcodes that are to be removed
    missing_postcodes = df[df['postcode'].isna()]

    # Logging the dropped rows in error log
    if not missing_postcodes.empty:
        print(f"Logging {len(missing_postcodes)} transactions with missing postcodes...")
        for _, row in missing_postcodes.iterrows():
            errNoPostcode = {
                # Use transaction_id as the unique identifier for this table
                "data": [f"Transaction ID: {row['transaction_id']}"], 
                "where": ["property_transactions_cleansing -> clean_transactions"],
                "desc": ["Transaction dropped due to missing postcode"],
                "impact": ["Sale record excluded; cannot be linked to a specific property"],
                "cause": ["Postcode field is NaN in the raw Land Registry data"]
            }
            error_process(errNoPostcode)
    
    # Drop rows with missing postcodes
    df = df.dropna(subset=['postcode'])

    # Build the full address for the ingestion script to link to the property table
    df = construct_full_address(df)

    # Format Dates for PostgreSQL into standard YYYY-MM-DD
    df['sale_date'] = pd.to_datetime(df['date']).dt.strftime('%Y-%m-%d')

    final_columns = [
        "transaction_id", 
        "full_address", 
        "postcode", 
        "sale_date", 
        "price"
    ]
    
    final_output = df[final_columns]
    
    export_to_csv(final_output, output_dir)

if __name__ == "__main__":
    property_transactions_process()