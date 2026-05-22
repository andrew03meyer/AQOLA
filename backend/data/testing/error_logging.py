import pandas as pd
from dotenv import load_dotenv
from pathlib import Path
import os

load_dotenv()

def add_error_to_logs(data):
    path = os.getenv("DATA_PATH_DEV")
    log_path = Path(path) / "error_log.csv"

    if log_path.is_file():
        data.to_csv(log_path, index=False, mode="a", header=False)
    else:
        data.to_csv(log_path, index=False, header=True)

def format_error(d):
    df = pd.DataFrame(
    {
        "time": pd.Timestamp.now(),
        "where": d.get("where"),
        "data": d.get("data"),
        "desc": d.get("desc"),
        "impact": d.get("impact"),
        "cause": d.get("cause"),
        "state" : d.get("state", "unresolved")
    })
    return df

def error_process(d):
    df = format_error(d)
    add_error_to_logs(df)

# Processes a list of error dictionaries in one go to improve performance.
def error_process_batch(errors):
    all_dfs = [format_error(error) for error in errors]

    batch_df = pd.concat(all_dfs, ignore_index=True)
    
    add_error_to_logs(batch_df)
