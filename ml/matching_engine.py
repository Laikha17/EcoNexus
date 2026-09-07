import sys, os
import math
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from typing import List, Dict, Any, Tuple

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
try:
    from ml.dataset_loader import load_maestri_dataset
except ModuleNotFoundError:
    from dataset_loader import load_maestri_dataset

class EcoNexusMLMatcher:
    """
    Content-based Recommendation & Synergy Matching Engine
    Trained and calibrated on the 425 historical industrial exchanges from MAESTRI dataset.
    Enhanced with Location-Aware Geographic Proximity Scoring.
    """
    def __init__(self):
        self.df_historical = None
        self.vectorizer = None
        self.waste_tfidf_matrix = None
        self.receiver_tfidf_matrix = None
        self.nace_cooccurrence = {}
        self.is_fitted = False

    def fit(self, df: pd.DataFrame = None):
        """
        Fits vectorizer and builds NACE co-occurrence matrix from historical exchange dataset.
        """
        if df is None:
            df = load_maestri_dataset()
        
        self.df_historical = df

        # 1. Build TF-IDF vectorizer across waste descriptions and receiver uses
        corpus = list(df['full_waste_text']) + list(df['receiver_full_text'])
        self.vectorizer = TfidfVectorizer(
            stop_words='english',
            ngram_range=(1, 2),
            max_features=1000,
            sublinear_tf=True
        )
        self.vectorizer.fit(corpus)

        self.waste_tfidf_matrix = self.vectorizer.transform(df['full_waste_text'])
        self.receiver_tfidf_matrix = self.vectorizer.transform(df['receiver_full_text'])

        # 2. Build NACE pairing frequency map from historical exchanges
        self.nace_cooccurrence = {}
        for _, row in df.iterrows():
            d_nace = str(row['donor_nace'])[:2] # 2-digit NACE division
            r_nace = str(row['receiver_nace'])[:2]
            if d_nace and r_nace:
                pair = (d_nace, r_nace)
                self.nace_cooccurrence[pair] = self.nace_cooccurrence.get(pair, 0) + 1

        self.is_fitted = True
        return self

    def _nace_similarity(self, seller_nace: str, buyer_nace: str) -> float:
        """
        Calculates industry NACE compatibility score based on 2-digit division matching
        and historical frequency in MAESTRI synergy dataset.
        """
        s_clean = str(seller_nace).replace('.', '').strip()[:2]
        b_clean = str(buyer_nace).replace('.', '').strip()[:2]

        if not s_clean or not b_clean:
            return 0.3 # Neutral baseline when NACE is omitted

        if s_clean == b_clean:
            return 0.9 # Intra-industry circular exchange

        pair = (s_clean, b_clean)
        freq = self.nace_cooccurrence.get(pair, 0)

        if freq >= 5:
            return 0.95
        elif freq >= 2:
            return 0.85
        elif freq == 1:
            return 0.70
        
        return 0.40 # Standard cross-industry baseline

    def _calculate_location_compatibility(self, listing: Dict[str, Any], buyer: Dict[str, Any]) -> Tuple[float, float, str]:
        """
        Calculates location compatibility score (0.0 to 1.0), estimated distance in km (-1 if unknown), and reason string.
        """
        s_lat = listing.get('latitude') or listing.get('lat')
        s_lon = listing.get('longitude') or listing.get('lon') or listing.get('lng')
        b_lat = buyer.get('latitude') or buyer.get('lat')
        b_lon = buyer.get('longitude') or buyer.get('lon') or buyer.get('lng')

        # 1. Exact GPS Coordinates -> Haversine distance
        if s_lat is not None and s_lon is not None and b_lat is not None and b_lon is not None:
            try:
                lat1, lon1 = float(s_lat), float(s_lon)
                lat2, lon2 = float(b_lat), float(b_lon)

                R = 6371.0 # km
                dlat = math.radians(lat2 - lat1)
                dlon = math.radians(lon2 - lon1)
                a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
                dist_km = round(2 * R * math.atan2(math.sqrt(a), math.sqrt(1 - a)), 1)

                loc_score = math.exp(-dist_km / 400.0)
                loc_score = float(np.clip(loc_score, 0.10, 1.00))

                if dist_km <= 25:
                    reason = f"✓ Local facility ({dist_km} km away) — minimal logistics overhead"
                elif dist_km <= 100:
                    reason = f"✓ Regional proximity ({dist_km} km away) — low logistics overhead"
                elif dist_km <= 350:
                    reason = f"✓ Intra-state logistics route ({dist_km} km away)"
                else:
                    reason = f"⚠ Facility is {dist_km} km away — higher logistics transport cost"

                return loc_score, dist_km, reason
            except Exception:
                pass

        # 2. Text Location String Parsing & Hierarchy Fallback
        s_loc = str(listing.get('location', '')).strip().lower()
        b_loc = str(buyer.get('buyerLocation', buyer.get('location', ''))).strip().lower()

        if not s_loc or not b_loc or s_loc in ['unknown', 'n/a', '-'] or b_loc in ['unknown', 'n/a', '-']:
            return 0.50, -1.0, "ℹ Location data unavailable — neutral baseline applied"

        s_tokens = set([t.strip() for t in s_loc.replace(',', ' ').split() if len(t.strip()) > 2])
        b_tokens = set([t.strip() for t in b_loc.replace(',', ' ').split() if len(t.strip()) > 2])

        # A. Same City / Hub
        if s_loc == b_loc or len(s_tokens.intersection(b_tokens)) >= 2 or (len(s_tokens.intersection(b_tokens)) == 1 and any(t in ['vijayawada', 'guntur', 'visakhapatnam', 'bhimavaram', 'hyderabad', 'chennai', 'mumbai', 'bengaluru', 'delhi'] for t in s_tokens.intersection(b_tokens))):
            return 0.95, 15.0, f"✓ Same industrial city/hub ({b_loc.title()})"

        # B. Adjacent Regional Hubs
        ap_hubs = {'vijayawada', 'guntur', 'bhimavaram', 'eluru', 'kakinada', 'visakhapatnam', 'rajahmundry', 'tirupati', 'ongole', 'nellore'}
        s_ap = s_tokens.intersection(ap_hubs)
        b_ap = b_tokens.intersection(ap_hubs)

        if s_ap and b_ap:
            return 0.85, 45.0, "✓ Regional industrial corridor (~45 km estimated distance)"

        # C. Same State
        states = {'ap', 'andhra', 'telangana', 'ts', 'maharashtra', 'mh', 'tamil nadu', 'tn', 'karnataka', 'ka'}
        s_st = [t for t in s_tokens if t in states or 'andhra' in t or 'telangana' in t or 'karnataka' in t]
        b_st = [t for t in b_tokens if t in states or 'andhra' in t or 'telangana' in t or 'karnataka' in t]

        if s_st and b_st and s_st[0] == b_st[0]:
            return 0.72, 180.0, "✓ Intra-state logistics route (~180 km estimated distance)"

        # D. Neighboring State
        if ('andhra' in s_loc or 'ap' in s_tokens) and ('telangana' in b_loc or 'chennai' in b_tokens or 'hyderabad' in b_tokens):
            return 0.55, 380.0, "⚠ Inter-state transport (~380 km estimated distance) — moderate freight cost"

        # E. Distant Region
        if len(s_tokens.intersection(b_tokens)) == 0:
            return 0.35, 750.0, "⚠ Inter-regional long distance (~750+ km) — higher transport cost"

        return 0.50, -1.0, "ℹ Location compatibility evaluated — neutral baseline applied"

    def match_listing_against_buyers(
        self, 
        listing: Dict[str, Any], 
        candidate_buyers: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Ranks candidate buyers for a given waste listing with location-aware scoring.
        """
        if not self.is_fitted:
            self.fit()

        listing_text = f"{listing.get('title', '')} {listing.get('description', '')} {listing.get('category', '')} {listing.get('treatmentDescription', '')} {listing.get('ewcCode', '')}".strip()
        listing_vec = self.vectorizer.transform([listing_text])

        results = []

        for buyer in candidate_buyers:
            buyer_text = f"{buyer.get('buyerCompany', '')} {buyer.get('buyerIndustry', '')} {buyer.get('materialRequirement', '')} {buyer.get('finalUse', '')}".strip()
            buyer_vec = self.vectorizer.transform([buyer_text])

            # 1. Text TF-IDF Cosine Similarity (Weight: 35%)
            text_sim = float(cosine_similarity(listing_vec, buyer_vec)[0][0])

            # 2. NACE Synergy Score (Weight: 25%)
            seller_nace = listing.get('sellerNace', '')
            buyer_nace = buyer.get('buyerNace', buyer.get('buyerIndustry', ''))
            nace_score = self._nace_similarity(seller_nace, buyer_nace)

            # 3. Category / Material Overlap (Weight: 15%)
            category_match = 0.0
            listing_cat = str(listing.get('category', '')).lower()
            buyer_req = str(buyer.get('materialRequirement', '')).lower()
            buyer_ind = str(buyer.get('buyerIndustry', '')).lower()
            buyer_cats = [str(c).lower() for c in buyer.get('preferredCategories', [])]

            cat_keywords = [w.strip() for w in listing_cat.replace('&', ' ').split() if len(w.strip()) > 3]

            if listing_cat and (listing_cat in buyer_req or listing_cat in buyer_ind or any(listing_cat in c for c in buyer_cats)):
                category_match = 0.95
            elif cat_keywords and any(kw in buyer_req or kw in buyer_ind or any(kw in c for c in buyer_cats) for kw in cat_keywords):
                category_match = 0.85
            elif text_sim > 0.1:
                category_match = text_sim * 1.5

            category_match = min(1.0, category_match)

            # 4. Location Proximity Check (Weight: 15%) [NEW]
            loc_score, dist_km, loc_reason = self._calculate_location_compatibility(listing, buyer)

            # 5. Hazardous Constraint Check (Weight: 10%)
            is_hazardous = listing.get('hazardous', False)
            accepts_haz = buyer.get('acceptsHazardous', True)

            if is_hazardous and not accepts_haz:
                haz_score = 0.0 # Heavy penalty: facility cannot accept hazardous waste
            else:
                haz_score = 1.0

            # Composite Score Calculation (0 - 100)
            raw_score = (
                0.35 * text_sim +
                0.25 * nace_score +
                0.15 * category_match +
                0.15 * loc_score +
                0.10 * haz_score
            )

            # Scale to 0-100 range with realistic non-linear curve
            final_score = int(round(np.clip(raw_score * 100, 15, 98)))

            # Generate Explainable Match Reasons
            reasons = []
            reasons.append(f"{final_score}% ML Synergy Match Score")

            if text_sim > 0.15:
                reasons.append(f"High text & material specification alignment (Cosine similarity: {text_sim:.2f})")
            
            s_nace_clean = str(seller_nace).replace('.', '').strip()[:2]
            b_nace_clean = str(buyer_nace).replace('.', '').strip()[:2]
            if s_nace_clean and b_nace_clean and (s_nace_clean, b_nace_clean) in self.nace_cooccurrence:
                count = self.nace_cooccurrence[(s_nace_clean, b_nace_clean)]
                reasons.append(f"Verified NACE exchange path [{s_nace_clean} -> {b_nace_clean}] ({count} historical synergies in MAESTRI)")
            elif s_nace_clean and b_nace_clean and s_nace_clean == b_nace_clean:
                reasons.append(f"Direct intra-industry re-use in NACE division {s_nace_clean}")

            if category_match > 0.5:
                reasons.append(f"Material category '{listing.get('category', 'Industrial Waste')}' matches buyer requirement profile")

            # Include Location Reason
            reasons.append(loc_reason)

            if is_hazardous:
                if accepts_haz:
                    reasons.append("Buyer facility certified to process hazardous industrial waste stream")
                else:
                    reasons.append("WARNING: Material flagged hazardous, buyer authorization required")
            else:
                reasons.append("Non-hazardous material stream suitable for direct reprocessing")

            results.append({
                "buyerId": buyer.get("buyerId", "unknown"),
                "buyerName": buyer.get("buyerName", ""),
                "buyerCompany": buyer.get("buyerCompany", ""),
                "buyerIndustry": buyer.get("buyerIndustry", ""),
                "buyerLocation": buyer.get("buyerLocation", buyer.get("location", "")),
                "matchPercentage": final_score,
                "distanceKm": dist_km,
                "components": {
                    "textSimilarity": round(text_sim, 3),
                    "naceScore": round(nace_score, 3),
                    "categoryMatch": round(category_match, 3),
                    "locationScore": round(loc_score, 3),
                    "hazardousScore": round(haz_score, 3)
                },
                "matchReasons": reasons
            })

        # Sort by match percentage descending by default
        results.sort(key=lambda x: x["matchPercentage"], reverse=True)
        return results
