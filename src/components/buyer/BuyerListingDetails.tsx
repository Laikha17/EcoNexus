import React, { useState } from 'react';
import { useEcoNexus } from '../../context/EcoNexusContext';
import { PlaceBidModal } from './PlaceBidModal';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { 
  ArrowLeft, 
  MapPin, 
  Sparkles, 
  Check, 
  Building2, 
  Gavel, 
  ShieldCheck, 
  Info,
  Layers
} from 'lucide-react';

export const BuyerListingDetails: React.FC = () => {
  const { selectedListing, bids, setActivePage, currentUser } = useEcoNexus();
  const [showBidModal, setShowBidModal] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  if (!selectedListing) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500 text-sm">No material selected.</p>
        <Button className="mt-4" onClick={() => setActivePage('discover')}>
          Back to Marketplace
        </Button>
      </div>
    );
  }

  const isTextile = selectedListing.category === 'Textiles & Fabric';
  const matchScore = isTextile ? 92 : 74;
  const listingBids = bids.filter(b => b.listingId === selectedListing.id);

  const matchReasons = [
    '92% AI Match Confidence',
    'Same material category: Textiles & Fabric',
    'Buyer requires cotton fabric waste for padding & stuffing',
    'Same region (Coastal Andhra Pradesh Industrial Corridor)',
    'Volume aligns with buyer\'s monthly demand profile'
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <button
          onClick={() => setActivePage('discover')}
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Discover Materials
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="match" percentage={matchScore} size="md" />
              <Badge variant="category">{selectedListing.category}</Badge>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {selectedListing.title}
            </h1>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {selectedListing.location} • Listed by <strong className="text-slate-800 font-bold">{selectedListing.sellerCompany}</strong>
            </p>
          </div>

          {selectedListing.sellerId === currentUser?.id ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 bg-slate-100 border border-slate-200 px-3 py-2 rounded-lg">
                Your Listing (Self-Bidding Prohibited)
              </span>
            </div>
          ) : (
            <Button
              size="lg"
              variant="primary"
              onClick={() => setShowBidModal(true)}
              icon={<Gavel className="w-5 h-5" />}
            >
              Place Bid / Offer Rate
            </Button>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Image Gallery, Specs, Why this matches */}
        <div className="lg:col-span-2 space-y-6">
          {/* Large Image Showcase */}
          <Card padded={false} className="overflow-hidden">
            <div className="aspect-video bg-slate-900 relative">
              <img
                src={selectedListing.images[activeImageIdx] || selectedListing.images[0]}
                alt={selectedListing.title}
                className="w-full h-full object-cover"
              />
            </div>
            {selectedListing.images.length > 1 && (
              <div className="p-3 bg-slate-50 flex gap-2 border-t border-slate-200">
                {selectedListing.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                      activeImageIdx === idx ? 'border-emerald-600 ring-2 ring-emerald-600/30' : 'border-slate-200'
                    }`}
                  >
                    <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </Card>

          {/* Why This Matches You Breakdown */}
          <Card padded space-y-3 className="bg-emerald-50/50 border-emerald-200">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Why This Material Matches Comfort Cushion Works</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {matchReasons.map((reason, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 bg-white p-2 rounded-lg border border-emerald-100">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Material Specifications & Description */}
          <Card padded space-y-4>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              Complete Material Specifications
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
                <span className="text-slate-400 text-[10px] block">Moisture Content</span>
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
        </div>

        {/* Right Column: Pricing & Seller Info Box */}
        <div className="space-y-6">
          <Card padded space-y-4 className="bg-slate-900 text-white border-slate-800">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Procurement Terms
            </span>

            <div className="space-y-3">
              <div>
                <span className="text-xs text-slate-400 block">Available Quantity</span>
                <span className="text-2xl font-extrabold text-white">{selectedListing.quantity} {selectedListing.unit}</span>
              </div>

              <div className="border-t border-slate-800 pt-3">
                <span className="text-xs text-slate-400 block">Starting Expected Base Rate</span>
                <span className="text-2xl font-extrabold text-emerald-400">₹{selectedListing.expectedPrice} / {selectedListing.unit}</span>
              </div>
            </div>

            <Button
              className="w-full mt-4"
              variant="primary"
              size="lg"
              onClick={() => setShowBidModal(true)}
              icon={<Gavel className="w-5 h-5" />}
            >
              Place Bid Now
            </Button>
          </Card>

          {/* Seller Information */}
          <Card padded space-y-3>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">
              Seller Information
            </h3>

            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-slate-900">{selectedListing.sellerCompany}</h4>
                <Badge variant="verified">GST Verified</Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Contact: {selectedListing.sellerName}</p>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {selectedListing.location}
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Place Bid Modal */}
      {showBidModal && (
        <PlaceBidModal
          isOpen={showBidModal}
          onClose={() => setShowBidModal(false)}
          listing={selectedListing}
        />
      )}
    </div>
  );
};
