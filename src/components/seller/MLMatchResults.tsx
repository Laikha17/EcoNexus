import React from 'react';
import { Listing, MLMatchResult } from '../../types';
import { useEcoNexus } from '../../context/EcoNexusContext';
import { calculatePriceDiscovery } from '../../services/priceDiscoveryService';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  MapPin, 
  Building2, 
  Check, 
  Tag,
  Info
} from 'lucide-react';

interface MLMatchResultsProps {
  listing: Listing;
  onDone: () => void;
}

export const MLMatchResults: React.FC<MLMatchResultsProps> = ({ listing, onDone }) => {
  const { bids, transactions, listings } = useEcoNexus();
  const [sortBy, setSortBy] = React.useState<'score' | 'distance'>('score');
  const rawMatches = listing.mlMatches || [];

  const priceSignals = React.useMemo(() => {
    return calculatePriceDiscovery(listing, bids, transactions, listings);
  }, [listing, bids, transactions, listings]);

  const matches = React.useMemo(() => {
    const list = [...rawMatches];
    if (sortBy === 'distance') {
      list.sort((a, b) => {
        const dA = a.distanceKm && a.distanceKm > 0 ? a.distanceKm : 99999;
        const dB = b.distanceKm && b.distanceKm > 0 ? b.distanceKm : 99999;
        return dA - dB;
      });
    } else {
      list.sort((a, b) => b.matchPercentage - a.matchPercentage);
    }
    return list;
  }, [rawMatches, sortBy]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-2xl p-6 text-white shadow-modal border border-emerald-700/50">
        <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4" />
          <span>ML Engine Evaluation Complete</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          ML Buyer Matches
        </h1>
        <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-xl">
          Listing <span className="font-semibold text-emerald-300">"{listing.title}"</span> has been evaluated against real registered enterprise buyers in Cloud Firestore.
        </p>

        <div className="mt-4 inline-flex items-center gap-2 bg-emerald-950/90 border border-emerald-600/50 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{matches.length} Verified Firebase Buyer Matches Identified</span>
        </div>
      </div>

      {/* Recommended Buyers Grid & Sort Controls */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>Ranked Enterprise Buyers</span>
            <span className="text-xs text-slate-500 font-normal">({matches.length} matches)</span>
          </h2>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg self-start sm:self-auto">
            <button
              onClick={() => setSortBy('score')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                sortBy === 'score'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Best Match Score
            </button>
            <button
              onClick={() => setSortBy('distance')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                sortBy === 'distance'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Nearest Buyer
            </button>
          </div>
        </div>

        {matches.length === 0 ? (
          <Card padded className="text-center py-8 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">No Compatible Registered Buyers Found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              No registered buyer profiles currently match this specific material requirement in Cloud Firestore.
              Your listing is published and visible on the marketplace for direct buyer bids.
            </p>
          </Card>
        ) : (
          matches.map((match: MLMatchResult, index: number) => (
            <Card key={match.buyerId} padded className="hover:border-emerald-300 transition-all space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-extrabold text-sm flex items-center justify-center shrink-0">
                    #{index + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-base text-slate-900">{match.buyerCompany}</h3>
                      <Badge variant="verified">Registered Buyer</Badge>
                      {match.distanceKm && match.distanceKm > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                          <MapPin className="w-3 h-3 text-emerald-600" />
                          {match.distanceKm} km away
                        </span>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" />
                        {match.buyerIndustry}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {match.buyerLocation}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Match Score Badge */}
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <Badge variant="match" percentage={match.matchPercentage} size="lg" />
                </div>
              </div>

              {/* Material Requirement Box */}
              <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Buyer Procurement Preference
                </span>
                <p className="text-xs font-medium text-slate-800 italic">
                  "{match.materialRequirement}"
                </p>
              </div>

              {/* Why This Matches Breakdown */}
              <div>
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  ML Compatibility Analysis:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {match.matchReasons.map((reason, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 bg-emerald-50/60 p-2 rounded-lg border border-emerald-100">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Price Discovery Section */}
      <Card padded space-y-3>
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Price Discovery
            </h2>
          </div>
          <Badge variant={priceSignals.status === 'available' ? 'success' : 'info'}>
            {priceSignals.status === 'available' ? 'Market Signals Available' : 'Insufficient Data'}
          </Badge>
        </div>

        {priceSignals.status === 'available' ? (
          <div className="space-y-3">
            <div className="flex items-baseline justify-between bg-emerald-50/70 border border-emerald-200 rounded-xl p-3.5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Observed Market Range</span>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                    Sample Size: N={priceSignals.totalDataPoints}
                  </span>
                </div>
                <span className="text-xl font-extrabold text-emerald-900">
                  ₹{priceSignals.suggestedLow} – ₹{priceSignals.suggestedHigh} <span className="text-xs font-normal text-slate-600">/ {priceSignals.unit}</span>
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-500 block">Seller Asking Rate</span>
                <span className="text-sm font-bold text-slate-800">₹{priceSignals.askingPrice} / {priceSignals.unit}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
              {priceSignals.factors.map((f, idx) => (
                <div key={idx} className="flex items-center gap-1.5 bg-slate-50 p-2 rounded-lg border border-slate-200/80">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{f}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center space-y-1">
            <p className="text-xs font-semibold text-slate-700">
              Not enough transaction data yet.
            </p>
            <p className="text-[11px] text-slate-500">
              Current market signals will appear as buyers submit bids. Seller asking price: ₹{priceSignals.askingPrice} / {priceSignals.unit}.
            </p>
          </div>
        )}
      </Card>

      {/* Done Action Bar */}
      <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200">
        <p className="text-xs text-slate-500">
          Match results and market signals saved to Cloud Firestore. Bidding remains the price discovery mechanism.
        </p>
        <Button variant="primary" onClick={onDone} icon={<ArrowRight className="w-4 h-4" />}>
          Proceed to My Listings
        </Button>
      </div>
    </div>
  );
};
