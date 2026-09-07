import pandas as pd

file_path = "ml/data/Exchanges-database.xlsm"
df = pd.read_excel(file_path, sheet_name="Database")

print("--- Sheet: Database ---")
print("Shape:", df.shape)
print("\nColumns:")
for i, col in enumerate(df.columns):
    non_null = df[col].notnull().sum()
    sample_val = df[col].dropna().iloc[0] if non_null > 0 else "N/A"
    print(f"{i:2d}. {str(col):<45} | Non-null: {non_null}/{len(df)} | Sample: {str(sample_val)[:60]}")

print("\nFirst 3 rows sample:")
print(df.head(3).to_string())
