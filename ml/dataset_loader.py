import pandas as pd
import re
import os

def load_maestri_dataset(file_path: str = "ml/data/Exchanges-database.xlsm") -> pd.DataFrame:
    """
    Loads and cleans the 425 exchange records from the MAESTRI dataset Excel file.
    
    Fields extracted & cleaned:
    - exchange_id: Exchange Identifier
    - waste_description: Description of the waste / material exchanged
    - donor_business: Main business of the donor/seller
    - donor_nace: NACE code of the donor
    - receiver_business: Main business of the receiver/buyer
    - receiver_nace: NACE code of the receiver
    - ewc_code: European Waste Catalogue code (if available)
    - cpa_code: Statistical Classification of Products by Activity (if available)
    - cas_code: Chemical Abstracts Service registry number (if available)
    - hazardous: Whether EWC indicates hazardous waste (Yes/No/Unknown -> bool/str)
    - treatment_description: Brief description of treatment required/applied
    - final_use_receiver: Final use of waste by receiver
    - exchange_status: Implemented / Planned / Under feasibility study
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"MAESTRI dataset not found at {file_path}")

    # Read raw sheet starting from header row 16 (0-indexed 16)
    df_raw = pd.read_excel(file_path, sheet_name="Database", header=16)

    # Column mapping based on verified excel schema
    column_mapping = {
        df_raw.columns[1]: 'exchange_id',
        df_raw.columns[2]: 'donor_company',
        df_raw.columns[3]: 'donor_business',
        df_raw.columns[4]: 'donor_nace',
        df_raw.columns[5]: 'receiver_company',
        df_raw.columns[6]: 'receiver_business',
        df_raw.columns[7]: 'receiver_nace',
        df_raw.columns[8]: 'waste_description',
        df_raw.columns[9]: 'ewc_code',
        df_raw.columns[10]: 'cpa_code',
        df_raw.columns[11]: 'cas_code',
        df_raw.columns[12]: 'hazardous_raw',
        df_raw.columns[13]: 'treatment_owner',
        df_raw.columns[14]: 'treatment_description',
        df_raw.columns[18]: 'final_use_receiver',
        df_raw.columns[21]: 'exchange_status'
    }

    df = df_raw.rename(columns=column_mapping)

    # Filter out empty rows or rows without waste description or exchange_id
    df = df[df['exchange_id'].notnull() & df['waste_description'].notnull()].copy()

    # Data Cleaning helper function
    def clean_str(val):
        if pd.isnull(val):
            return ""
        s = str(val).strip()
        if s.upper() in ["ND", "NOT DEFINED", "UNKNOWN", "N/A", "NAN", "-", "NONE"]:
            return ""
        return s

    def clean_nace(val):
        s = clean_str(val)
        if not s:
            return ""
        # Extract digits
        digits = re.sub(r'[^\d]', '', s)
        return digits

    def clean_hazardous(val):
        s = clean_str(val).lower()
        if 'yes' in s or 'true' in s or 'h' in s or '*' in s or 'hazardous' in s:
            return True
        if 'no' in s or 'false' in s or 'non-hazardous' in s:
            return False
        return False

    df['exchange_id'] = df['exchange_id'].apply(clean_str)
    df['donor_company'] = df['donor_company'].apply(clean_str)
    df['donor_business'] = df['donor_business'].apply(clean_str)
    df['donor_nace'] = df['donor_nace'].apply(clean_nace)
    
    df['receiver_company'] = df['receiver_company'].apply(clean_str)
    df['receiver_business'] = df['receiver_business'].apply(clean_str)
    df['receiver_nace'] = df['receiver_nace'].apply(clean_nace)

    df['waste_description'] = df['waste_description'].apply(clean_str)
    df['ewc_code'] = df['ewc_code'].apply(clean_str)
    df['cpa_code'] = df['cpa_code'].apply(clean_str)
    df['cas_code'] = df['cas_code'].apply(clean_str)

    df['hazardous'] = df['hazardous_raw'].apply(clean_hazardous)
    df['treatment_description'] = df['treatment_description'].apply(clean_str)
    df['final_use_receiver'] = df['final_use_receiver'].apply(clean_str)
    df['exchange_status'] = df['exchange_status'].apply(clean_str)

    # Composite text for feature representation
    df['full_waste_text'] = (
        df['waste_description'] + " " + 
        df['treatment_description'] + " " + 
        df['ewc_code'] + " " + 
        df['cpa_code']
    ).str.strip()

    df['receiver_full_text'] = (
        df['receiver_business'] + " " + 
        df['final_use_receiver']
    ).str.strip()

    return df.reset_index(drop=True)

if __name__ == "__main__":
    df = load_maestri_dataset()
    print(f"Loaded {len(df)} cleaned MAESTRI exchange records.")
    print("\nDataset Summary:")
    print(f"  - Unique Donors with NACE: {(df['donor_nace'] != '').sum()}/{len(df)}")
    print(f"  - Unique Receivers with NACE: {(df['receiver_nace'] != '').sum()}/{len(df)}")
    print(f"  - Hazardous Exchanges: {df['hazardous'].sum()}/{len(df)}")
    print(f"  - Exchanges with Treatment Info: {(df['treatment_description'] != '').sum()}/{len(df)}")
    print(f"  - Exchanges with EWC Code: {(df['ewc_code'] != '').sum()}/{len(df)}")
    print(f"  - Exchange Statuses: {df['exchange_status'].value_counts().to_dict()}")
    print("\nSample clean record #0:")
    for col in df.columns:
        print(f"  {col}: {df.iloc[0][col]}")
