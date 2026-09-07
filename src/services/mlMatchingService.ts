import { Listing, User, MLMatchResult } from '../types';

export interface MLMatchResponse {
  status: 'success' | 'empty' | 'unavailable';
  matches: MLMatchResult[];
  evaluatedCandidatesCount?: number;
  error?: string;
}

const ML_SERVICE_URL = 'http://127.0.0.1:5000/api/match';

/**
 * Filter real Firebase users to extract eligible candidate buyers.
 * Must have BUYER role, must not be the listing seller, and must be active.
 */
export const extractEligibleCandidateBuyers = (users: User[], sellerId: string): any[] => {
  if (!users || !Array.isArray(users)) return [];

  return users
    .filter(u => {
      const uid = u.id || u.uid;
      // 1. Must not be the seller of this listing (Self-matching prevention)
      if (uid === sellerId) return false;

      // 2. Must have BUYER role
      const hasBuyerRole = (u.roles && u.roles.includes('BUYER')) || u.role === 'buyer';
      if (!hasBuyerRole) return false;

      // 3. Exclude pure admin or pure logistics accounts unless they explicitly have BUYER role
      const isPureAdmin = u.role === 'admin' && (!u.roles || !u.roles.includes('BUYER'));
      const isPureLogistics = u.role === 'logistics' && (!u.roles || !u.roles.includes('BUYER'));
      if (isPureAdmin || isPureLogistics) return false;

      return true;
    })
    .map(u => {
      const uid = u.id || u.uid || '';
      return {
        buyerId: uid,
        buyerName: u.contactPerson || u.name || u.company || 'Enterprise Buyer',
        buyerCompany: u.company || u.businessName || u.name || 'Registered Enterprise',
        buyerIndustry: u.industry || 'Industrial Manufacturing',
        buyerNace: u.industry || '',
        buyerLocation: u.location || 'Regional Hub',
        city: (u as any).city,
        state: (u as any).state,
        latitude: (u as any).latitude,
        longitude: (u as any).longitude,
        preferredCategories: u.materialsOfInterest || [],
        materialRequirement: (u.materialsOfInterest || []).length > 0
          ? `${(u.materialsOfInterest || []).join(', ')} - ${u.industry || u.company}`
          : u.industry || u.company,
        acceptsHazardous: true
      };
    });
};

/**
 * Calls the Python ML service endpoint with real Firebase candidate buyers.
 * Provides failure fallback if the service is unreachable.
 */
export const evaluateMLMatches = async (
  listing: Partial<Listing>,
  allUsers: User[]
): Promise<MLMatchResponse> => {
  const sellerId = listing.sellerId || '';
  const candidateBuyers = extractEligibleCandidateBuyers(allUsers, sellerId);

  if (candidateBuyers.length === 0) {
    return {
      status: 'empty',
      matches: [],
      evaluatedCandidatesCount: 0,
      error: 'No registered buyer accounts available in platform.'
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

    const payload = {
      listing: {
        id: listing.id,
        title: listing.title || '',
        description: listing.description || '',
        category: listing.category || 'Industrial Waste',
        subType: listing.subType || '',
        quantity: listing.quantity || 100,
        unit: listing.unit || 'kg',
        condition: listing.condition || '',
        sellerId: sellerId,
        sellerNace: listing.sellerId || '',
        location: listing.location || '',
        city: (listing as any).city,
        state: (listing as any).state,
        latitude: (listing as any).latitude,
        longitude: (listing as any).longitude,
        hazardous: false
      },
      candidateBuyers: candidateBuyers
    };

    const res = await fetch(ML_SERVICE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`ML Service HTTP ${res.status}`);
    }

    const data = await res.json();
    if (data && data.success) {
      return {
        status: data.status === 'empty' ? 'empty' : 'success',
        matches: data.matches || [],
        evaluatedCandidatesCount: data.evaluatedCandidatesCount || candidateBuyers.length
      };
    } else {
      throw new Error(data?.error || 'ML Match evaluation failed');
    }
  } catch (err: any) {
    console.warn('[ML CLIENT] ML Service call failed or timed out:', err);
    return {
      status: 'unavailable',
      matches: [],
      evaluatedCandidatesCount: candidateBuyers.length,
      error: err?.message || 'ML matching service unavailable'
    };
  }
};
