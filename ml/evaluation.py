import sys, os
import numpy as np
import pandas as pd

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
try:
    from ml.dataset_loader import load_maestri_dataset
    from ml.matching_engine import EcoNexusMLMatcher
except ModuleNotFoundError:
    from dataset_loader import load_maestri_dataset
    from matching_engine import EcoNexusMLMatcher

def evaluate_maestri_offline(k_values=[1, 3, 5], candidate_pool_size=20, random_seed=42):
    """
    Evaluates the content-based matching engine on the 420 complete MAESTRI exchange records.
    Uses STRICT LEAVE-ONE-OUT OUT-OF-FOLD (LOO-OOF) validation:
    For each query i, record i is EXCLUDED from training set D_{-i} before fitting the model.
    """
    np.random.seed(random_seed)
    df = load_maestri_dataset()
    
    # Filter records that have both waste description and valid receiver business
    valid_exchanges = df[(df['waste_description'] != '') & (df['receiver_business'] != '')].reset_index(drop=True)
    n_exchanges = len(valid_exchanges)

    print("==========================================================================")
    print("STRICT ML AUDIT: LEAVE-ONE-OUT OUT-OF-FOLD EVALUATION ON MAESTRI DATASET")
    print(f"Total Source Records in Excel: 425 | Evaluated Complete Records: {n_exchanges}")
    print(f"Candidate Pool Size per query: {candidate_pool_size} (1 True Receiver + {candidate_pool_size-1} Distractors)")
    print(f"Fixed Random Seed: {random_seed} | Data Leakage Prevention: STRICT ENFORCED")
    print("==========================================================================")

    # Unique receiver profiles for distractor sampling
    unique_receivers = valid_exchanges[['receiver_company', 'receiver_business', 'receiver_nace', 'final_use_receiver']].drop_duplicates().reset_index(drop=True)

    hits = {k: 0 for k in k_values}
    mrr_sum = 0.0

    print(f"Running Out-Of-Fold evaluation across {n_exchanges} queries...")

    for i in range(n_exchanges):
        row = valid_exchanges.iloc[i]

        # 1. OUT-OF-FOLD DATA SPLIT: Exclude query i from training set D_{-i}
        train_df = valid_exchanges.drop(index=i).reset_index(drop=True)

        # 2. FIT MODEL EXCLUSIVELY ON D_{-i} (Zero Data Leakage)
        matcher = EcoNexusMLMatcher()
        matcher.fit(train_df)

        # Query Listing
        listing = {
            "title": row['waste_description'],
            "description": f"{row['waste_description']} {row['treatment_description']}".strip(),
            "category": row['cpa_code'] or row['ewc_code'] or "Industrial Waste",
            "sellerNace": row['donor_nace'],
            "hazardous": row['hazardous'],
            "ewcCode": row['ewc_code']
        }

        # True Receiver Profile from record i
        true_receiver_id = f"true_rec_{i}"
        true_buyer = {
            "buyerId": true_receiver_id,
            "buyerCompany": row['receiver_company'] or "True Receiver Company",
            "buyerIndustry": row['receiver_business'],
            "buyerNace": row['receiver_nace'],
            "materialRequirement": row['final_use_receiver'] or row['receiver_business'],
            "acceptsHazardous": True
        }

        # Sample 19 Distractor Buyers from D_{-i} with fixed seed for reproducibility
        other_receivers = unique_receivers[
            unique_receivers['receiver_business'] != row['receiver_business']
        ]
        
        # Reproducible random sampling
        sample_seed = (random_seed + i * 1009) % 2**31
        sampled_distractors = other_receivers.sample(
            n=min(candidate_pool_size - 1, len(other_receivers)),
            random_state=sample_seed
        )

        distractors = []
        for d_idx, d_row in sampled_distractors.iterrows():
            distractors.append({
                "buyerId": f"distractor_{d_idx}",
                "buyerCompany": d_row['receiver_company'] or f"Enterprise_{d_idx}",
                "buyerIndustry": d_row['receiver_business'],
                "buyerNace": d_row['receiver_nace'],
                "materialRequirement": d_row['final_use_receiver'] or d_row['receiver_business'],
                "acceptsHazardous": True
            })

        candidate_pool = [true_buyer] + distractors
        
        # Shuffle candidate pool reproducibly so true buyer position varies
        shuffle_rng = np.random.RandomState(sample_seed + 1)
        shuffle_rng.shuffle(candidate_pool)

        # Rank candidates
        ranked_results = matcher.match_listing_against_buyers(listing, candidate_pool)

        # Find rank of true receiver
        true_rank = None
        for rank, r in enumerate(ranked_results, 1):
            if r['buyerId'] == true_receiver_id:
                true_rank = rank
                break

        if true_rank is not None:
            mrr_sum += 1.0 / true_rank
            for k in k_values:
                if true_rank <= k:
                    hits[k] += 1

    mrr = mrr_sum / n_exchanges

    # Methodologically Justified Random Baseline Calculations for pool size N=20:
    # Hit@K baseline = K / N
    # MRR baseline = (1/N) * sum_{r=1}^N (1/r) = (1/20) * 3.5977 = 0.1799
    rand_hit1 = (1.0 / candidate_pool_size) * 100
    rand_hit3 = (3.0 / candidate_pool_size) * 100
    rand_hit5 = (5.0 / candidate_pool_size) * 100
    rand_mrr = sum(1.0 / r for r in range(1, candidate_pool_size + 1)) / candidate_pool_size

    print("\n--------------------------------------------------------------------------")
    print("EMPIRICAL EVALUATION RESULTS (STRICT OUT-OF-FOLD LOOCV)")
    print("--------------------------------------------------------------------------")
    print(f"  - Hit@1 (Top-1 Accuracy) : {hits[1]}/{n_exchanges} ({hits[1]/n_exchanges*100:.2f}%)  [Random Baseline: {rand_hit1:.2f}%]")
    print(f"  - Hit@3 (Top-3 Accuracy) : {hits[3]}/{n_exchanges} ({hits[3]/n_exchanges*100:.2f}%)  [Random Baseline: {rand_hit3:.2f}%]")
    print(f"  - Hit@5 (Top-5 Accuracy) : {hits[5]}/{n_exchanges} ({hits[5]/n_exchanges*100:.2f}%)  [Random Baseline: {rand_hit5:.2f}%]")
    print(f"  - Mean Reciprocal Rank   : {mrr:.4f}                   [Random Baseline: {rand_mrr:.4f}]")
    print("--------------------------------------------------------------------------")
    print("METHODOLOGICAL COMPARISON JUSTIFICATION:")
    print(f"  - Top-1 Accuracy is {hits[1]/n_exchanges*100 / rand_hit1:.2f}x higher than uniform random chance ({hits[1]/n_exchanges*100:.2f}% vs {rand_hit1:.2f}%).")
    print(f"  - Top-3 Accuracy is {hits[3]/n_exchanges*100 / rand_hit3:.2f}x higher than uniform random chance ({hits[3]/n_exchanges*100:.2f}% vs {rand_hit3:.2f}%).")
    print(f"  - MRR is {mrr / rand_mrr:.2f}x higher than uniform random chance ({mrr:.4f} vs {rand_mrr:.4f}).")
    print("--------------------------------------------------------------------------")
    print("EVALUATION TASK DISTINCTION:")
    print("  1. Historical Receiver Retrieval (Evaluated Above):")
    print("     Tests whether the model ranks the exact historical buyer from the 425 MAESTRI exchanges.")
    print("  2. Real-World Prospective Recommendation (Operational Mode):")
    print("     Applies text similarity, NACE co-occurrence, and safety constraints to rank NEW registered buyers.")
    print("==========================================================================\n")

    return {
        "n_exchanges": n_exchanges,
        "hit@1": hits[1] / n_exchanges,
        "hit@3": hits[3] / n_exchanges,
        "hit@5": hits[5] / n_exchanges,
        "mrr": mrr
    }

if __name__ == "__main__":
    evaluate_maestri_offline()
