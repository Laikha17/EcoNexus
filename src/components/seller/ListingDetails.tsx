import React, { useState } from 'react';
import { useEcoNexus } from '../../context/EcoNexusContext';
import { calculatePriceDiscovery } from '../../services/priceDiscoveryService';
import { BidComparisonModal } from './BidComparisonModal';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { 
  ArrowLeft, 
  MapPin, 
  Gavel, 
  Sparkles, 
  Check, 
  Layers, 
  Boxes, 
  ShieldCheck,
  Building2,
  SlidersHorizontal,
  Tag
} from 'lucide-react';

export const ListingDetails: React.FC = () => {
  const { selectedListing, bids, transactions, listings, setActivePage, acceptBid, rejectBid } = useEcoNexus();
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const priceSignals = React.useMemo(() => {
    if (!selectedListing) return null;
    return calculatePriceDiscovery(selectedListing, bids, transactions, listings);
  }, [selectedListing, bids, transactions, listings]);

  if (!selectedListing) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500 text-sm">No listing selected.</p>
        <Button className="mt-4" onClick={() => setActivePage('my-listings')}>
          Back to Listings
        </Button>
      </div>
    );
  }

  const listingBids = bids.filter(b => b.listingId === selectedListing.id);
  const topMatch = selectedListing.mlMatches && selectedListing.mlMatches.length > 0 ? selectedListing.mlMatches[0] : null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back button & title */}
      <div>
        <button
          onClick={() => setActivePage('my-listings')}
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Listings
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="category">{selectedListing.category}</Badge>
              <Badge
                variant={
                  selectedListing.status === 'bidding' ? 'warning' :
                  selectedListing.status === 'active' ? 'success' : 'status'
                }
              >
                {selectedListing.status.toUpperCase()}
              </Badge>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {selectedListing.title}
            </h1>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {selectedListing.location} • Listed on {new Date(selectedListing.createdAt).toLocaleDateString()}
            </p>
          </div>

          {listingBids.length > 1 && (
            <Button
              variant="secondary"
              onClick={() => setShowCompareModal(true)}
              icon={<SlidersHorizontal className="w-4 h-4 text-emerald-400" />}
            >
              Side-by-Side Compare Bids ({listingBids.length})
            </Button>
          )}
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Image Gallery & Specs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Gallery */}
          <Card padded={false} className="overflow-hidden">
            <div className="aspect-video bg-slate-900 relative">
              <img
                src={selectedListing.images[activeImageIdx] || selectedListing.images[0]}
                alt={selectedListing.title}
                className="w-full h-full object-cover"
              />
            </div>
            {selectedListing.images.length > 1 && (
              <div className="p-3 bg-slate-50 flex gap-2 overflow-x-auto border-t border-slate-200">
                {selectedListing.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                      activeImageIdx === idx ? 'border-emerald-600 ring-2 ring-emerald-600/30' : 'border-slate-200'
                    }`}
                  >
                    <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </Card>

          {/* Description & Technical Specs */}
          <Card padded space-y-4>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              Material Description & Technical Audit
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              {selectedListing.description}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] block">Composition</span>
                <span className="font-bold text-slate-900">{selectedListing.specifications.composition}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Moisture Rate</span>
                <span className="font-bold text-slate-900">{selectedListing.specifications.moistureContent}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Contamination</span>
                <span className="font-bold text-slate-900">{selectedListing.specifications.contaminationRate}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Packaging</span>
                <span className="font-bold text-slate-900">{selectedListing.specifications.packagingType}</span>
              </div>
            </div>
          </Card>

          {/* Bids Received Table */}
          <Card padded space-y-4>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Gavel className="w-4 h-4 text-emerald-600" />
                Bids Received ({listingBids.length})
              </h2>

              {listingBids.length > 1 && (
                <button
                  onClick={() => setShowCompareModal(true)}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                >
                  Visual Side-by-Side Comparison Matrix
                </button>
              )}
            </div>

            {listingBids.length === 0 ? (
              <p className="text-xs text-slate-500 p-4 text-center">
                No buyer bids submitted yet. AI notifications sent to registered buyers.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {listingBids.map((bid) => (
                  <div key={bid.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900">{bid.buyerCompany}</h4>
                        <Badge variant="match" percentage={bid.matchScore} size="sm" />
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{bid.buyerName} • {bid.buyerLocation}</p>
                      <p className="text-xs text-slate-600 mt-2 italic bg-slate-50 p-2 rounded-lg border border-slate-200">
                        "{bid.message}"
                      </p>
                    </div>

                    <div className="sm:text-right space-y-2 shrink-0">
                      <div>
                        <span className="text-lg font-extrabold text-emerald-700">₹{bid.offerPrice}</span>
                        <span className="text-xs text-slate-500"> / {bid.unit}</span>
                        <span className="block text-xs font-semibold text-slate-800">
                          Total: ₹{bid.totalAmount.toLocaleString()}
                        </span>
                      </div>

                      {bid.status === 'accepted' ? (
                        <div className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded border border-emerald-300 inline-flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Accepted
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => acceptBid(bid.id)}
                            icon={<Check className="w-3.5 h-3.5" />}
                          >
                            Accept Bid
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => rejectBid(bid.id)}
                          >
                            Decline
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Listing Overview & Top ML Match */}
        <div className="space-y-6">
          <Card padded space-y-4 className="bg-slate-900 text-white border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lot Financial Summary</h3>

            <div className="space-y-3">
              <div>
                <span className="text-xs text-slate-400 block">Available Quantity</span>
                <span className="text-xl font-bold text-white">{selectedListing.quantity} {selectedListing.unit}</span>
              </div>
              <div className="border-t border-slate-800 pt-3">
                <span className="text-xs text-slate-400 block">Expected Base Rate</span>
                <span className="text-xl font-bold text-emerald-400">₹{selectedListing.expectedPrice} / {selectedListing.unit}</span>
              </div>
              <div className="border-t border-slate-800 pt-3">
                <span className="text-xs text-slate-400 block">Highest Active Bid</span>
                <span className="text-xl font-bold text-emerald-300">
                  {selectedListing.highestBid ? `₹${selectedListing.highestBid} / ${selectedListing.unit}` : 'No Bids Yet'}
                </span>
              </div>
            </div>
          </Card>

          {/* Price Discovery Box */}
          {priceSignals && (
            <Card padded space-y-3 className="bg-white border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-1.5 text-slate-900 font-bold text-xs">
                  <Tag className="w-4 h-4 text-emerald-600" />
                  <span>Price Discovery</span>
                </div>
                <Badge variant={priceSignals.status === 'available' ? 'success' : 'info'} size="sm">
                  {priceSignals.status === 'available' ? 'Signals Active' : 'Insufficient Data'}
                </Badge>
              </div>

              {priceSignals.status === 'available' ? (
                <div className="space-y-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-slate-500 font-semibold block">Observed Market Range</span>
                      <span className="text-[9px] font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        N={priceSignals.totalDataPoints}
                      </span>
                    </div>
                    <span className="text-base font-extrabold text-emerald-900">
                      ₹{priceSignals.suggestedLow} – ₹{priceSignals.suggestedHigh} / {selectedListing.unit}
                    </span>
                  </div>
                  <div className="space-y-1 pt-1 border-t border-slate-100 text-[11px] text-slate-600">
                    {priceSignals.factors.map((f, idx) => (
                      <p key={idx} className="flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>{f}</span>
                      </p>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">
                  Not enough transaction data yet. Current market signals will appear as buyers submit bids.
                </p>
              )}
            </Card>
          )}

          {/* Top ML Match Box */}
          {topMatch && (
            <Card padded space-y-3 className="bg-emerald-50/60 border-emerald-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Top AI Buyer Match</span>
                </div>
                <Badge variant="match" percentage={topMatch.matchPercentage} size="sm" />
              </div>

              <div>
                <h4 className="font-bold text-sm text-slate-900">{topMatch.buyerCompany}</h4>
                <p className="text-xs text-slate-500">{topMatch.buyerIndustry} • {topMatch.buyerLocation}</p>
              </div>

              <div className="text-xs text-slate-700 bg-white p-2.5 rounded-lg border border-emerald-200/80">
                <span className="font-semibold block text-slate-900 mb-1">Requirement:</span>
                "{topMatch.materialRequirement}"
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Bid Comparison Modal */}
      {showCompareModal && (
        <BidComparisonModal
          isOpen={showCompareModal}
          onClose={() => setShowCompareModal(false)}
          listing={selectedListing}
          bids={listingBids}
        />
      )}
    </div>
  );
};
