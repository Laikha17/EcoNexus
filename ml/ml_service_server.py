import sys
import os
import json
from flask import Flask, request, jsonify

# Ensure parent directory is in path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
try:
    from ml.dataset_loader import load_maestri_dataset
    from ml.matching_engine import EcoNexusMLMatcher
except ModuleNotFoundError:
    from dataset_loader import load_maestri_dataset
    from matching_engine import EcoNexusMLMatcher

app = Flask(__name__)

# Initialize and fit matcher on startup using MAESTRI historical exchange dataset
print("[ML SERVER] Loading MAESTRI dataset and initializing EcoNexus ML Matcher...")
maestri_df = load_maestri_dataset()
matcher = EcoNexusMLMatcher()
matcher.fit(maestri_df)
print(f"[ML SERVER] Matcher successfully fitted on {len(maestri_df)} historical MAESTRI exchange records.")

@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    return response

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "ok",
        "service": "EcoNexus ML Matching Service",
        "datasetRecords": len(maestri_df) if maestri_df is not None else 0,
        "isFitted": matcher.is_fitted
    })

@app.route('/api/match', methods=['POST', 'OPTIONS'])
def match_listing():
    if request.method == 'OPTIONS':
        return jsonify({"status": "ok"}), 200

    try:
        data = request.get_json() or {}
        listing = data.get('listing', {})
        candidate_buyers = data.get('candidateBuyers', [])

        seller_id = listing.get('sellerId') or listing.get('seller_id')

        # 1. Eligibility & Self-Matching Prevention
        # Exclude candidates where buyerId == listing.sellerId
        filtered_candidates = [
            b for b in candidate_buyers 
            if str(b.get('buyerId')) != str(seller_id)
        ]

        if not filtered_candidates:
            return jsonify({
                "success": True,
                "status": "empty",
                "matches": [],
                "message": "No eligible candidate buyers provided for matching."
            }), 200

        # 2. Run verified ML Matcher against real candidate buyers
        raw_matches = matcher.match_listing_against_buyers(listing, filtered_candidates)

        # 3. Add ranking metadata
        matches = []
        for rank, m in enumerate(raw_matches, 1):
            m['rank'] = rank
            matches.append(m)

        return jsonify({
            "success": True,
            "status": "success",
            "evaluatedCandidatesCount": len(filtered_candidates),
            "matches": matches
        }), 200

    except Exception as e:
        print(f"[ML SERVER ERROR] {str(e)}")
        return jsonify({
            "success": False,
            "status": "error",
            "error": str(e),
            "matches": []
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    print(f"[ML SERVER] Starting EcoNexus ML Flask API on http://127.0.0.1:{port}")
    app.run(host='127.0.0.1', port=port, debug=False)
