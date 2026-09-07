import pandas as pd

file_path = "ml/data/Exchanges-database.xlsm"
df_raw = pd.read_excel(file_path, sheet_name="Database", header=None)

for idx, row in df_raw.iterrows():
    non_null_vals = [f"Col {i}: {str(v)[:30]}" for i, v in enumerate(row.values) if pd.notnull(v)]
    if non_null_vals:
        print(f"Row {idx:3d} ({len(non_null_vals)} non-null): {non_null_vals[:5]}")
