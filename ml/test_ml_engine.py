import unittest
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
try:
    from ml.dataset_loader import load_maestri_dataset
    from ml.matching_engine import EcoNexusMLMatcher
except ModuleNotFoundError:
    from dataset_loader import load_maestri_dataset
    from matching_engine import EcoNexusMLMatcher

class TestEcoNexusMLEngineAudit(unittest.TestCase):
    
    def test_01_dataset_integrity(self):
        """Verify exact record counts and non-fabrication of source data."""
        df = load_maestri_dataset("ml/data/Exchanges-database.xlsm")
        self.assertEqual(len(df), 425, "Expected exactly 425 source records in MAESTRI database")
        
        # Verify complete evaluation records (excluding 5 missing receiver business records)
        valid_eval = df[(df['waste_description'] != '') & (df['receiver_business'] != '')]
        self.assertEqual(len(valid_eval), 420, "Expected exactly 420 complete evaluation records")

    def test_02_matcher_fitting_and_out_of_fold(self):
        """Verify model fitting on real data subset."""
        df = load_maestri_dataset("ml/data/Exchanges-database.xlsm")
        sub_df = df.iloc[1:].reset_index(drop=True) # Hold out row 0
        
        matcher = EcoNexusMLMatcher()
        matcher.fit(sub_df)
        
        self.assertTrue(matcher.is_fitted)
        self.assertEqual(len(matcher.df_historical), 424)

    def test_03_ranking_on_real_maestri_records(self):
        """Verify ranking on actual MAESTRI exchange record #0."""
        df = load_maestri_dataset("ml/data/Exchanges-database.xlsm")
        row0 = df.iloc[0]
        
        matcher = EcoNexusMLMatcher()
        matcher.fit(df.iloc[1:].reset_index(drop=True))

        query_listing = {
            "title": row0['waste_description'],
            "description": row0['waste_description'],
            "category": row0['cpa_code'] or "Industrial Byproduct",
            "sellerNace": row0['donor_nace'],
            "hazardous": row0['hazardous']
        }

        # Real candidate receivers extracted directly from dataset
        candidates = []
        for idx in [0, 5, 10, 15]:
            r = df.iloc[idx]
            candidates.append({
                "buyerId": f"rec_{idx}",
                "buyerCompany": r['receiver_company'] or f"Receiver #{idx}",
                "buyerIndustry": r['receiver_business'],
                "buyerNace": r['receiver_nace'],
                "materialRequirement": r['final_use_receiver'] or r['receiver_business'],
                "acceptsHazardous": True
            })

        matches = matcher.match_listing_against_buyers(query_listing, candidates)
        self.assertEqual(len(matches), 4)
        top_buyer_ids = [m['buyerId'] for m in matches[:3]]
        # Assert true receiver is in Top-3 (consistent with Hit@3 metric)
        self.assertIn("rec_0", top_buyer_ids, "True receiver rec_0 should be ranked in Top-3 for query #0")
        self.assertGreater(matches[0]['matchPercentage'], 0)

if __name__ == "__main__":
    unittest.main()
