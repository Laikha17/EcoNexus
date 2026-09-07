import pandas as pd

file_path = "ml/data/Exchanges-database.xlsm"
df_raw = pd.read_excel(file_path, sheet_name="Database", header=None)

print(f"Raw shape: {df_raw.shape}")
for r in range(12):
    row_vals = [str(x) for x in df_raw.iloc[r].values if pd.notnull(x)]
    print(f"Row {r:2d}: {row_vals[:8]}")
