import sys
import os
from dotenv import load_dotenv
from pathlib import Path
import pandas as pd
import geopandas as gpd
from constants import Cleansing
from shapely import wkt
from testing.error_logging import error_process

load_dotenv()

def find_output_file_path(env_var: str):
    """Find the output path to place the processed CSV"""
    # We will have varying priorities of where we can find these file paths

    # 1st priority: ENV file
    env_path = Path(env_var + "/flood_occurrences/", "flood_occurrences.csv")
    if env_path is not None:
        return env_path

    print("output env variable not found, using backup")
    # Fallback
    fallback = Path(__file__).parent / ".output"
    fallback.mkdir(exist_ok=True)
    return fallback / "flood_occurrence.csv"

def find_input_file_path(env_var: str):
    """Find the input path to create the processed CSV"""

    # 1st priority: ENV file
    env_path = Path(env_var + "/flood_occurrences/raw/")
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
    output_postcode_flood_path = Path(env_var + "/postcode_flood_occurrences/postcode_flood_occurrences.csv")
    postcode_df_path = Path(env_var + "/postcodes/postcodes.csv")

    return input, output, postcode_df_path, output_postcode_flood_path

def read_and_transform_flood_shapefile(shapefile_path: Path):
    """Reads the flood shapefile and transforms it to the correct coordinate reference system (CRS)"""
    try:
        import geopandas as gpd
        flood_gdf = gpd.read_file(shapefile_path)
        flood_gdf = flood_gdf.to_crs(epsg=4326)  # Transform to WGS 84
        return flood_gdf

    except Exception as e:
        print(f"Error reading or transforming flood shapefile: {e}")
        sys.exit(1)

def prepare_data_for_db(flood_occurrence_df, postcode_df):

    # Copy the df so we can edit this without cahnging the original.
    flood_occurrence_df = flood_occurrence_df.copy()

    flood_occurrence_df_filtered = flood_occurrence_df[['rec_out_id', "rec_grp_id", "name", "start_date", "end_date", "flood_src", "flood_caus", "hfm_status", "data_src", "fluvial_f", "coastal_f", "tidal_f", "geometry"]]

    postcode_df["geometry"] = postcode_df["boundary"].apply(wkt.loads)

    postcode_polygons = gpd.GeoDataFrame(
        postcode_df,
        geometry="geometry",
        crs="EPSG:4326"
    )

    kent_floods = gpd.sjoin(flood_occurrence_df, postcode_polygons, how="inner", predicate="intersects")
    postcode_floods = kent_floods[["postcode", "rec_out_id"]] 
    flood_occurrences_df_filtered = kent_floods[['rec_out_id', "rec_grp_id", "name", "start_date", "end_date", "flood_src", "flood_caus", "hfm_status", "data_src", "fluvial_f", "coastal_f", "tidal_f", "geometry"]]
    print(kent_floods.sample(10))

    # Convert geometry to WKT for DB insertion
    flood_occurrences_df_filtered = flood_occurrences_df_filtered.copy()
    flood_occurrences_df_filtered["geometry"] = flood_occurrences_df_filtered["geometry"].apply(lambda g: g.wkt)

    # Rename to match DB column name
    flood_occurrences_df_filtered = flood_occurrences_df_filtered.rename(columns={"geometry": "boundary"})

    postcode_flood_occurrences = postcode_floods.to_dict()
    flood_occurrences = flood_occurrences_df_filtered.to_dict()

    return postcode_flood_occurrences, flood_occurrences

def make_csv_from_json(flood_occurrence, output_path: Path):
    """Utility function to create a CSV from Flood occurrence data for inspection."""
    df = pd.DataFrame(flood_occurrence)
    df.to_csv(output_path, index=False)
    print(f"CSV written to {output_path}")

def flood_occurance_process():

    pd.set_option('display.max_columns', None)

    INPUT_PATH, OUTPUT_PATH, POSTCODE_PATH, OUTPUT_POSTCODE_FLOOD_OCCURRENCES_PATH = find_file_paths()
    # rofrs = Risk of Flooding from Rivers and Seas
    flood_shapefile_filepath = INPUT_PATH / "Recorded_Flood_Outlines.gdb"
    
    if not flood_shapefile_filepath.exists():
        print(f"Error: Flood shapefile not found at {flood_shapefile_filepath}")
        sys.exit(1)
    

    try:

        flood_outlines = read_and_transform_flood_shapefile(flood_shapefile_filepath)

        postcodes_df = pd.read_csv(POSTCODE_PATH)

        postcode_flood_occurrences, flood_data_rows = prepare_data_for_db(flood_outlines, postcodes_df)
        make_csv_from_json(flood_data_rows, OUTPUT_PATH)
        make_csv_from_json(postcode_flood_occurrences, OUTPUT_POSTCODE_FLOOD_OCCURRENCES_PATH)

    except Exception as e:
        print(f"Error -> : {e}")
        sys.exit(1)
