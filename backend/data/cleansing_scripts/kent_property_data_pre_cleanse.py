'''NOTE: This pre cleansing script was made to filter property data only for Kent as the original dataset pp-complete.csv was far too large (5 million + MB)

From the original government dataset, only the necessary columns for the schema were fitlered and compiled to get property data for Kent specifically'''

import pandas as pd
import csv
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

base_dir = Path(os.getenv("DATA_PATH_DEV"))

input_path = base_dir /"property_data"/"raw"/"pp-complete.csv"

headers = ["transaction_id", "price", "date", "postcode", "type", "old/new", "PAON", "SAON", "street", "locality", "town", "district", "county"]

output_path = base_dir /"property_data"/"raw"/"kent_property_data.csv"

# These indices match the official Land Registry columns
cols_to_keep = [0, 1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 13]


try:
    with open(input_path, 'r', encoding='utf-8') as f_in, \
        open(output_path, 'w', newline='', encoding='utf-8') as f_out:
        
        reader = csv.reader(f_in)
        writer = csv.writer(f_out)
        
        writer.writerow(headers)
        
        count = 0
        kent_count = 0
        
        
        for row in reader:

            count += 1
            
            if len(row) > 13 and row[13].strip().upper() == 'KENT':
                reduced_row = [row[i] for i in cols_to_keep]
                writer.writerow(reduced_row)
                kent_count += 1
                
            
            if count % 1000000 == 0:
                print(f"Checked {count // 1000000} million rows... Found {kent_count} Kent records so far.")
        
        
    print(f"\nSuccess! Total rows checked: {count}")
    print(f"Total Kent records saved: {kent_count}")

except Exception as e:
    print(f"An error occurred: {e}")
    
print(os.getcwd())


