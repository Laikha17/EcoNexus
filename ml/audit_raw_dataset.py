import pandas as pd

file_path = "ml/data/Exchanges-database.xlsm"

# 1. Total rows in 'Database' sheet
df_all = pd.read_excel(file_path, sheet_name="Database", header=None)
print(f"Total raw rows in 'Database' sheet: {len(df_all)}")

# 2. Extract starting from header row 16 (0-indexed 16, which is row 17 in Excel)
df_data = pd.read_excel(file_path, sheet_name="Database", header=16)
print(f"Total rows in data table starting from row 17: {len(df_data)}")

# Column 1 is Exchange Identifier
id_col = df_data.columns[1]
waste_col = df_data.columns[8]
rec_bus_col = df_data.columns[6]

valid_id_count = df_data[id_col].notnull().sum()
valid_waste_count = df_data[waste_col].notnull().sum()
valid_rec_count = df_data[rec_bus_col].notnull().sum()

print(f"Non-null Exchange Identifiers: {valid_id_count}")
print(f"Non-null Waste Descriptions: {valid_waste_count}")
print(f"Non-null Receiver Main Business: {valid_rec_count}")

# Check exact records where waste_description or receiver_business is missing
df_valid_id = df_data[df_data[id_col].notnull()].copy()
print(f"\nTotal records with valid Exchange Identifier: {len(df_valid_id)}")

missing_waste = df_valid_id[df_valid_id[waste_col].isnull() | (df_valid_id[waste_col].astype(str).str.strip() == '')]
print(f"Records missing waste description: {len(missing_waste)}")

missing_rec = df_valid_id[df_valid_id[rec_bus_col].isnull() | (df_valid_id[rec_bus_col].astype(str).str.strip().isin(['', 'ND', 'nan', 'NaN']))]
print(f"Records missing receiver business / ND: {len(missing_rec)}")

valid_eval_records = df_valid_id[
    df_valid_id[waste_col].notnull() & 
    (df_valid_id[waste_col].astype(str).str.strip() != '') &
    df_valid_id[rec_bus_col].notnull() &
    (~df_valid_id[rec_bus_col].astype(str).str.strip().isin(['', 'ND', 'nan', 'NaN']))
]

print(f"\nFinal count of complete exchange records for evaluation: {len(valid_eval_records)}")
