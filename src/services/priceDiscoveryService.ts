import { Listing, Bid, Transaction } from '../types';

export interface PriceDiscoveryResult {
  status: 'available' | 'insufficient_data';
  askingPrice: number;
  unit: string;
  highestBid: number | null;
  averageBid: number | null;
  bidsCount: number;
  transactionCount: number;
  totalDataPoints: number;
  suggestedLow: number | null;
  suggestedHigh: number | null;
  averagePrice: number | null;
  message: string;
  factors: string[];
}

/**
 * Calculates empirical Price Discovery signals from real Firestore bid & transaction data.
 * Does NOT use arbitrary multipliers or hardcoded target ranges.
 * Every ₹ value is 100% traceable to real Firestore documents.
 */
export const calculatePriceDiscovery = (
  listing: Partial<Listing>,
  allBids: Bid[] = [],
  allTransactions: Transaction[] = [],
  allListings: Listing[] = []
): PriceDiscoveryResult => {
  const askingPrice = Number(listing.expectedPrice) || 0;
  const unit = listing.unit || 'kg';
  const category = listing.category || '';
  const listingId = listing.id || '';

  // 1. Extract active buyer bids for this specific listing or category
  const listingBids = allBids.filter(b => b.listingId === listingId);
  const categoryBids = allBids.filter(b => b.category === category || b.listingId === listingId);

  const directBidPrices = listingBids
    .map(b => Number(b.offerPrice))
    .filter(p => !isNaN(p) && p > 0);

  const categoryBidPrices = categoryBids
    .map(b => Number(b.offerPrice))
    .filter(p => !isNaN(p) && p > 0);

  // 2. Extract completed settlement prices from transactions (P_tx)
  const categoryTransactions = allTransactions.filter(
    t => t.category === category || t.listingId === listingId
  );

  const transactionPrices = categoryTransactions
    .map(t => Number(t.agreedPrice || (t.totalAmount && t.quantity ? t.totalAmount / t.quantity : 0)))
    .filter(p => !isNaN(p) && p > 0);

  // 3. Combine real market data points S_all = S_tx U S_bid
  // S_all contains ONLY verified transaction settlement prices and buyer offer prices.
  // Asking price is NOT treated as a market transaction.
  const S_all = [...transactionPrices, ...categoryBidPrices];
  const N = S_all.length;

  const bidsCount = listingBids.length;
  const highestBid = directBidPrices.length > 0 ? Math.max(...directBidPrices) : null;
  const averageBid = directBidPrices.length > 0 
    ? Math.round(directBidPrices.reduce((a, b) => a + b, 0) / directBidPrices.length) 
    : null;

  // 4. Insufficient Data Criterion (N < 2)
  if (N < 2) {
    return {
      status: 'insufficient_data',
      askingPrice,
      unit,
      highestBid,
      averageBid,
      bidsCount,
      transactionCount: categoryTransactions.length,
      totalDataPoints: N,
      suggestedLow: null,
      suggestedHigh: null,
      averagePrice: null,
      message: 'Not enough transaction data yet. Current market signals will appear as buyers submit bids.',
      factors: [
        `✓ Asking price specified: ₹${askingPrice}/${unit}`,
        `ℹ Requires at least 2 real market price points in system (${N} available)`
      ]
    };
  }

  // 5. Sufficient Data Case (N >= 2): Traceable Min, Max, and Mean
  const suggestedLow = Math.min(...S_all);
  const suggestedHigh = Math.max(...S_all);
  const averagePrice = Math.round(S_all.reduce((a, b) => a + b, 0) / N);

  const factors: string[] = [];
  if (bidsCount > 0) {
    factors.push(`✓ Based on ${bidsCount} buyer bids submitted for this listing`);
  }
  if (categoryTransactions.length > 0) {
    factors.push(`✓ Based on ${categoryTransactions.length} completed transactions in ${category}`);
  }
  factors.push(`✓ Seller asking price: ₹${askingPrice}/${unit}`);
  factors.push(`✓ Exact market range: ₹${suggestedLow} – ₹${suggestedHigh}/${unit} (Avg: ₹${averagePrice}/${unit})`);

  return {
    status: 'available',
    askingPrice,
    unit,
    highestBid,
    averageBid,
    bidsCount,
    transactionCount: categoryTransactions.length,
    totalDataPoints: N,
    suggestedLow,
    suggestedHigh,
    averagePrice,
    message: `Observed Market Range: ₹${suggestedLow} – ₹${suggestedHigh} / ${unit} (N=${N})`,
    factors
  };
};
