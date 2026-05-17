from sqlalchemy import create_engine, inspect, text
import pandas as pd
from shapely import wkt
import psycopg2
from cleansing_scripts.data_cleansing import drop_missing_references_in_df

engine = create_engine("postgresql://aqola_user:mysecretpassword@localhost:5432/aqola")

# drop all current tables and recreate them empty
def initialise_db():
    with engine.connect() as conn:
        with open("./database/init/initialise.sql") as sqlFile:
            query = text(sqlFile.read())
            conn.execute(query)
            conn.commit()

# pushes a csv into a given table
def ingest_table(filePath, tableName, filtered_postcodes):
    inspector = inspect(engine)
    if tableName not in inspector.get_table_names():
        print(f"Table doesn't exist: {tableName}")
    else:
        try:
            # Force property_id to read as a string if processing transactions
            if tableName == "property_transactions":
                data = pd.read_csv(filePath, dtype={"property_id": str})
                
                # Strip out any '.0' and convert 'nan' back to true None
                if "property_id" in data.columns:
                    data["property_id"] = data["property_id"].apply(
                        lambda x: str(int(float(x))) if pd.notnull(x) and str(x).strip() != '' and str(x).strip().lower() != 'nan' else None
                    )
            else:
                data = pd.read_csv(filePath)
            print(f"CSV Row Count: {data.shape[0]}")
            
            # drop all data with invalid lsoa/posctode refs
            data = drop_missing_references_in_df(data, filtered_postcodes)

            # convert geometry if present as WKT
            if 'geometry' in data.columns:
                data['geometry'] = data['geometry'].apply(wkt.loads)
            
                
            data.to_sql(
                tableName,
                engine,
                if_exists="append",
                index=False
            )
        except Exception as e:
            print(f"Error ingesting {tableName}: {e}")

# get a number of rows from a given table
def get_rows(numRows, table):
    conn = psycopg2.connect(
        database = "aqola",
        user = "aqola_user",
        password="mysecretpassword",
        host="localhost",
        port = "5432"
    )
    cursor = conn.cursor()
    query = f"SELECT * FROM {table} LIMIT {numRows};"
    cursor.execute(query)
    print("=====================================================")
    print(cursor.fetchall())
    conn.close()

def get_row_count(table):
    conn = psycopg2.connect(
        database = "aqola",
        user = "aqola_user",
        password="mysecretpassword",
        host="localhost",
        port = "5432"
    )
    cursor = conn.cursor()
    query = f"SELECT COUNT(*) FROM {table};"
    cursor.execute(query)
    print(f"DB Row Count: {cursor.fetchall()}")
    conn.close()