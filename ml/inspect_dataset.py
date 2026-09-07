import pandas as pd
import openpyxl

file_path = "ml/data/Exchanges-database.xlsm"
excel = pd.ExcelFile(file_path)

print(f"Sheet names: {excel.sheet_names}")

for sheet_name in excel.sheet_names:
    df = pd.read_excel(file_path, sheet_name=sheet_name)
    print(f"\n--- Sheet: {sheet_name} (Shape: {df.shape}) ---")
    print("Columns:")
    for col in df.columns:
        print(f"  - {col} (Non-null: {df[col].notnull().sum()}/{len(df)})")
    
    print("\nFirst 3 rows:")
    print(df.head(3).to_string())
