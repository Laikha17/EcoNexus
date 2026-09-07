import pandas as pd

file_path = "ml/data/Exchanges-database.xlsm"
df_raw = pd.read_excel(file_path, sheet_name="Database", header=None)

for r in range(12, 17):
    row_vals = [f"Col {i}: '{x}'" for i, x in enumerate(df_raw.iloc[r].values) if pd.notnull(x)]
    print(f"Row {r:2d}: {row_vals}\n")
