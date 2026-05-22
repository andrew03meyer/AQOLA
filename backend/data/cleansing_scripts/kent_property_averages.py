import pandas as pd
import os
import numpy as np
from pathlib import Path
from dotenv import load_dotenv

def export_to_csv(data, output_folder):
    output_path = output_folder / "kent_property_averages.csv"
    data.to_csv(output_path, index=False)

def property_averages_process():
    load_dotenv()
    base_dir = Path(os.getenv("DATA_PATH_DEV"))
    
    raw_input_file = base_dir / "property_data" / "raw" / "kent_property_data.csv"
    cleaned_transactions_file = base_dir / "property_transactions" / "property_transactions.csv"
    output_dir = base_dir / "kent_property_averages"

    # Check to ensure the property transactions file exists as it is a prerquisite
    if not cleaned_transactions_file.exists():
        print("Error: Cleaned transactions file not found. Please run property_transactions.py first.")
        return


    # Load raw data to preserve the 'type' attribute for unmapped historical rows
    df_raw = pd.read_csv(raw_input_file, usecols=['transaction_id', 'type', 'date'])
    df_raw.columns = [c.strip().lower() for c in df_raw.columns]
    
    # Load cleaned transactions to get exact values
    df_clean_trans = pd.read_csv(cleaned_transactions_file, usecols=['transaction_id', 'price', 'price_per_sqm'])

    # Combine datasets on transaction identity tokens
    df_merged = pd.merge(df_clean_trans, df_raw, on='transaction_id', how='inner')

    # Standardise property type labels
    df_merged['property_type'] = df_merged['type'].str.strip().str.upper()
    
    # Property type 'O' (Other) is not used in calculations
    df_merged = df_merged[df_merged['property_type'].isin(['D', 'S', 'T', 'F'])]

    # Generate quarterly period string (e.g. 1995-02-14 -> Q1-1995)
    df_merged['date_dt'] = pd.to_datetime(df_merged['date'])
    df_merged['period'] = 'Q' + df_merged['date_dt'].dt.quarter.astype(str) + '-' + df_merged['date_dt'].dt.year.astype(str)

    
    # Group by target composite primary keys
    grouped = df_merged.groupby(['property_type', 'period'])

    # Calculate average values 
    summary_df = grouped.agg(
        avg_price=('price', lambda x: int(round(x.mean()))),
        avg_price_sqm=('price_per_sqm', lambda x: int(round(x.mean())) if x.notna().any() else np.nan),
        count=('transaction_id', 'count')
    ).reset_index()

    # Prevents NaN values from being converted into floats in pandas
    summary_df['avg_price_sqm'] = summary_df['avg_price_sqm'].apply(
        lambda x: int(x) if pd.notnull(x) else np.nan
    )

    # Sort data in order of timeline
    summary_df['year_sort'] = summary_df['period'].str.split('-').str[1].astype(int)
    summary_df['quarter_sort'] = summary_df['period'].str.split('-').str[0].str[1].astype(int)
    summary_df = summary_df.sort_values(by=['year_sort', 'quarter_sort', 'property_type']).drop(columns=['year_sort', 'quarter_sort'])

    final_columns = [
        "property_type",
        "period",
        "avg_price",
        "avg_price_sqm",
        "count"
    ]
    
    final_output = summary_df[final_columns]

    export_to_csv(final_output, output_dir)
    print(f"Successfully processed and exported {len(final_output)} distinct summary periods")

if __name__ == "__main__":
    property_averages_process()