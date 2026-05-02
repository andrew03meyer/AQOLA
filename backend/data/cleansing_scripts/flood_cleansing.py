import sys
import os
from dotenv import load_dotenv
from pathlib import Path
import pandas as pd
from constants import Cleansing
from testing.error_logging import error_process

load_dotenv()

def find_output_file_path(env_var: str):
    """Find the output path to place the processed CSV"""
    # We will have varying priorities of where we can find these file paths

    # 1st priority: ENV file
    env_path = Path(env_var + "/flood_data/", "flood_data.csv")
    if env_path is not None:
        return env_path

    print("output env variable not found, using backup")
    # Fallback
    fallback = Path(__file__).parent / ".output"
    fallback.mkdir(exist_ok=True)
    return fallback / "flood_data.csv"

def find_input_file_path(env_var: str):
    """Find the input path to create the processed CSV"""

    # 1st priority: ENV file
    env_path = Path(env_var + "/flood_data/raw/")
    if env_path is not None and env_path.exists():
        return env_path
    
    print("input env variable not found, using backup")
    # Fallback
    fallback = Path(__file__).parent / ".input"
    if fallback.exists():
        return env_path
    else:
        print("Error! no input")

def find_file_paths():

    # Looks for DATA_PATH_DEV in the .env file
    env_var = os.environ.get("DATA_PATH_DEV")

    output = find_output_file_path(env_var)
    input = find_input_file_path(env_var)
    postcode_df_path = Path(env_var + "/postcodes/postcodes.csv")
    
    return input, output, postcode_df_path

def find_valid_postcode_beginnings(postcode: str, postcode_df):
    try:
        valid_postcode_list = postcode_df[postcode_df["postcode"].str.contains(postcode[0:-1])]
        return valid_postcode_list.postcode.to_list()
    
    except Exception as e:
        print(f"Failed when searching postcodes. -> {e}")
        return

def read_and_transform_flood_shapefile(shapefile_path: Path):
    """Reads the flood shapefile and transforms it to the correct coordinate reference system (CRS)"""
    try:
        import geopandas as gpd
        flood_gdf = gpd.read_file(shapefile_path)
        flood_gdf = flood_gdf.to_crs(epsg=4326)  # Transform to WGS 84
        print(flood_gdf.sample(5))
        print(flood_gdf.shape)
    
        return flood_gdf

    except Exception as e:
        print(f"Error reading or transforming flood shapefile: {e}")
        sys.exit(1)

def prepare_data_for_db(flood_df, postcode_df):
    # Makes a copy of passed df (so we can edit without risk of changin the original)
    flood_df = flood_df.copy()

    flood_df["postcode"] = flood_df["PC"].str.replace(" ", "", regex=False)

    # Get postcode district & filter to Kent
    flood_df["district"] = flood_df["PC"].str.split(" ").str[0]
    flood_df = flood_df[flood_df["district"].isin(Cleansing.KENT_POSTCODE_DISTRICTS)]


    # Risk band calculations
    # 4 * count(high) + 3 * count(med) + 2 * count(low) + ...
    flood_df["total_risk"] = (
        flood_df["TOT_CNT_High"] * 4 +
        flood_df["TOT_CNT_Medium"] * 3 +
        flood_df["TOT_CNT_Low"] * 2 +
        flood_df["TOT_CNT_VeryLow"] * 1
    )

    flood_df["count_sum"] = (
        flood_df["TOT_CNT_High"] +
        flood_df["TOT_CNT_Medium"] +
        flood_df["TOT_CNT_Low"] +
        flood_df["TOT_CNT_VeryLow"]
    )

    flood_df["band_value"] = (
        flood_df["total_risk"] / flood_df["count_sum"]
    ).round()

    risk_bands = {
        4: "High",
        3: "Medium",
        2: "Low",
        1: "Very_Low"
    }
    flood_df["frs_band"] = flood_df["band_value"].map(risk_bands)

    
    # Remove last digit from all postcodes, giving a lookup table for asterisk values
    postcode_df["prefix"] = postcode_df["postcode"].str[:-1]
    prefix_map = (
        postcode_df.groupby("prefix")["postcode"]
        .apply(list)
        .to_dict() # creates a dictionary, e.g.: AB123C = [AA123CA, AA123CB, AA123CC, AA123CD, ...]
    )


    asterisk_df = flood_df[flood_df["postcode"].str.endswith("*")]
    complete_pcd_df = flood_df[~flood_df["postcode"].str.endswith("*")]

    flood_data_rows = []

    # Handle non-asterisk rows
    complete_pcd_rows = complete_pcd_df[[
        "postcode",
        "frs_band",
        "TOT_CNT_High",
        "TOT_CNT_Medium",
        "TOT_CNT_Low",
        "TOT_CNT_VeryLow"
    ]].rename(columns={
        "TOT_CNT_High": "frs_count_high",
        "TOT_CNT_Medium": "frs_count_medium",
        "TOT_CNT_Low": "frs_count_low",
        "TOT_CNT_VeryLow": "frs_count_very_low",
    })

    flood_data_rows.extend(complete_pcd_rows.to_dict("records"))

    # Handle asterisk rows
    for row in asterisk_df.itertuples():
        # Take the asterisk row and get the list of postcodes for that prefix
        # i.e.: AB123CD -> AB123C -> lookup -> returns the dictionary list for that prefix
        prefix = row.postcode[:-1]
        valid_postcodes = prefix_map.get(prefix, [])

        # add every additional postcode
        for valid_postcode in valid_postcodes:
            flood_data_rows.append({
                "postcode": valid_postcode,
                "frs_band": "None",
                "frs_count_high": 0,
                "frs_count_medium": 0,
                "frs_count_low": 0,
                "frs_count_very_low": 0,
            })
            
    # note: behaviour means that values which have an asterisk, will only be updated values in postcodes.csv
    # So, if the postcode is not in postcodes.csv, then there will be missing values (not caught by the error log)
    # i.e.: AB123CB is not in the postcodes.csv, in the flood data you have AB123C*
    # Say your dictionary contains [AA123CA, AA123CC, AA123CD], the postcode AA123CB may exist, but isn't picked up
    # and the error log will not find any discrepency between the value being in flood_data.csv and postcodes.csv

    return flood_data_rows

def make_csv_from_json(flood_rows, output_path: Path):
    """Utility function to create a CSV from Flood data for inspection."""
    df = pd.DataFrame(flood_rows)
    df.to_csv(output_path, index=False)
    print(f"CSV written to {output_path}")

def flood_process():

    pd.set_option('display.max_columns', None)

    INPUT_PATH, OUTPUT_PATH, POSTCODE_PATH = find_file_paths()
    # rofrs = Risk of Flooding from Rivers and Seas
    rofrs_filepath = INPUT_PATH / "RoFRS_PostcodesAtRisk_v202501.csv"
    flood_shapefile_filepath = INPUT_PATH / "Recorded_Flood_Outlines.gdb"
    
    if not flood_shapefile_filepath.exists():
        print(f"Error: Flood shapefile not found at {flood_shapefile_filepath}")
        sys.exit(1)
    
    if not rofrs_filepath.exists():
        print(f"Error: RoFRS CSV not found at {rofrs_filepath}")
        sys.exit(1)

    try:

        flood_outlines = read_and_transform_flood_shapefile(flood_shapefile_filepath)

        flood_df = pd.read_csv(rofrs_filepath)
    
        postcodes_df = pd.read_csv(POSTCODE_PATH)

        flood_data_rows = prepare_data_for_db(flood_df, postcodes_df)
        make_csv_from_json(flood_data_rows, OUTPUT_PATH)
    
    except Exception as e:
        print(f"Error -> : {e}")
        sys.exit(1)

# if __name__ == "__main__":
#     flood_process()