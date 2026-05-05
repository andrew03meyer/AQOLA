# from pathlib import Path
from dotenv import load_dotenv
import os
import glob
from cleansing_scripts.postcodes_cleansing import postcodes_process
from cleansing_scripts.lsoas_cleansing import lsoa_process
from cleansing_scripts.crime_cleansing import crime_process
from cleansing_scripts.school_cleansing import school_process
from cleansing_scripts.flood_cleansing import flood_process
from cleansing_scripts.property_cleansing import property_process
from cleansing_scripts.property_transactions import property_transactions_process
from cleansing_scripts.flood_occurrence_cleansing import flood_occurance_process
from ingestion import initialise_db, ingest_table, get_rows, get_row_count
from pathlib import Path
from testing.reference_checks import reference_check_process
from cleansing_scripts.data_cleansing import drop_missing_references_in_file, get_present_CSVs, postcode_ref_checks
import pandas as pd

load_dotenv()

# find if there are any missing CSVs (where a folder is present, but has no CSV in it)
def check_missing_CSVs(dataPath):
    folders = os.listdir(dataPath) # only works if there are just folders for the database in there
    print("=======================================================================")
    print(f"Folders: " + str(folders))
    folders = [f for f in folders if Path(dataPath / f).is_dir()] # filter out all values that aren't a subfolder (e.g. error_log.csv)
    missingCSVs = []
    for folder in folders:
        # print(folder)
        CSVs = glob.glob(str(dataPath) + "/" + folder + "/*.csv")
        if CSVs == []:
            missingCSVs.append(folder)

    return missingCSVs

# takes a list of missing CSVs and runs the appropriate script to create them
def run_csv_creation(missingCSVs):
    print("-------------------------------------------------------------------------")
    if "lsoas" in missingCSVs:
        print("Creating LSOA CSV...")
        lsoa_process()
    if "postcodes" in missingCSVs:
        # print("=======================================================================")
        print("Creating Postcodes CSV...")
        postcodes_process()
    if "crime_data" in missingCSVs:
        # print("=======================================================================")
        print("Creating Crime Data CSV...")
        crime_process()
    if "school_data" in missingCSVs:
        # print("=======================================================================")
        print("Creating School Data CSV...")
        school_process()
    if "flood_data" in missingCSVs:
        # print("=======================================================================")
        print("Creating Flood Data CSV...")
        flood_process()
    if "property_data" in missingCSVs:
        # print("=======================================================================")
        print("Creating Property Data CSV...")
        property_process()
    if "property_transactions_data" in missingCSVs:
        # print("=======================================================================")
        print("Creating Property Transactions Data CSV...")
        property_transactions_process()    
    if "flood_occurrences" in missingCSVs:
        # print("=======================================================================")
        print("Creating Flood Occurrences CSV...")
        flood_occurance_process()        

# ensures that the LSOA CSV is present, and if there's more than one to be ingest, that both the LSOA and postcodes table are there
def ingest_process(dataPath):
    presentCSVs = get_present_CSVs(dataPath)

    if (Path(dataPath / "lsoas/lsoas.csv")) not in presentCSVs:
        raise Exception("Cannot ingest data without LSOA table.")
    elif (Path(dataPath / "postcodes/postcodes.csv")) not in presentCSVs and len(presentCSVs) > 1:
        raise Exception("Cannot ingest data without postcodes table.")
    else:
        run_ingest(presentCSVs, dataPath)



# ingest LSOAs, then Postcodes, then everything else
# calls ingestion.py functions: ingest_table, get_rows, initialise_db
def run_ingest(ingestCSVs, dataPath):
    # setup database
    initialise_db()

    # create postcodes df - filtered on valid LSOAs
    filtered_postcodes = postcode_ref_checks(pd.read_csv(dataPath / "postcodes" / "postcodes.csv"))

    # # ingest LSOAs
    print("=======================================================================")
    print(f"Ingesting lsoa data...")
    ingest_table(dataPath / "lsoas" / "lsoas.csv", "lsoas", filtered_postcodes)
    ingestCSVs.remove(dataPath / "lsoas" / "lsoas.csv")
    # get_rows(5, "lsoas")
    get_row_count("lsoas")


    # then ingest postcodes
    print("=======================================================================")
    print(f"Ingesting postcode data...")
    ingest_table(dataPath / "postcodes" / "postcodes.csv", "postcodes", filtered_postcodes)
    ingestCSVs.remove(dataPath / "postcodes" / "postcodes.csv")
    # get_rows(5, "postcodes")
    get_row_count("postcodes")
    
    # Ingest property data here because it is a parent table to property_transactions (referential integrity)
    property_data_path = dataPath / "property_data" / "property_data.csv"
    if property_data_path.exists():
        print("=======================================================================")
        print("Ingesting property_data data...")
        ingest_table(property_data_path, "property_data", filtered_postcodes)
        
        # Remove from list so loop does not ingest it again
        if property_data_path in ingestCSVs: 
            ingestCSVs.remove(property_data_path)
        get_row_count("property_data")


    # then ingest everything else
    for csv in ingestCSVs:
        print("=======================================================================")
        print(f"Ingesting {csv.stem} data...")

        ingest_table(dataPath / csv, csv.stem, filtered_postcodes)
        get_row_count(csv.stem)


def main():
    dataPath = Path(os.getenv("DATA_PATH_DEV"))

    if (dataPath / Path("error_log.csv")).is_file():
        os.remove(dataPath / Path("error_log.csv"))
    
    # check for missing CSVs
    missingCsvFolders = check_missing_CSVs(dataPath)
    print("=======================================================================")
    print("Missing CSVs: " + str(missingCsvFolders))
    run_csv_creation(missingCsvFolders)

    # lsoa_detection()
    reference_check_process()
    # drop_missing_references_in_file() # drops rows with invalid LSOA or postcode refs

    ingest_process(dataPath)



if __name__ == "__main__":
    main()