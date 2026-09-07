import React, { useState } from 'react';
import { useEcoNexus } from '../../context/EcoNexusContext';
import { Listing } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Gavel, Sparkles, AlertCircle } from 'lucide-react';
import { calculatePriceDiscovery } from '../../services/priceDiscoveryService';

interface PlaceBidModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing;
}

export const PlaceBidModal: React.FC<PlaceBidModalProps> = ({ isOpen, onClose, listing }) => {
  const { placeBid, currentUser, addToast, bids, transactions, listings } = useEcoNexus();
  const [offerPrice, setOfferPrice] = useState<string>(
    listing.highestBid ? (listing.highestBid + 2).toString() : listing.expectedPrice.toString()
  );
  const [quantity, setQuantity] = useState<string>(listing.quantity.toString());
  const [message, setMessage] = useState<string>(
    'We require this material for immediate manufacturing requirements. Fast pickup ready.'
  );
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const priceSignals = React.useMemo(() => {
    return calculatePriceDiscovery(listing, bids, transactions, listings);
  }, [listing, bids, transactions, listings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (listing.sellerId === currentUser?.id) {
      addToast('Self-purchasing is prohibited. You cannot bid on your own listing.', 'error');
      onClose();
      return;
    }

    if (!offerPrice || Number(offerPrice) <= 0 || !quantity || Number(quantity) <= 0) {
      addToast('Please enter a valid offer rate and quantity.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await placeBid({
        listingId: listing.id,
        offerPrice: Number(offerPrice),
        quantity: Number(quantity),
        message
      });
      onClose();
    } catch (err: any) {
      console.error('Error placing bid:', err);
      addToast(err?.message || 'Failed to place bid.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalAmount = Number(offerPrice) * Number(quantity);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Submit B2B Purchase Offer (Place Bid)"
      subtitle={`Submitting offer for "${listing.title}" listed by ${listing.sellerCompany}`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Info & Price Signals Banner */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 space-y-1 text-xs text-emerald-900">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-bold">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              Seller Asking Rate: ₹{listing.expectedPrice} / {listing.unit}
            </span>
            {listing.highestBid ? (
              <span className="font-semibold text-emerald-800">
                Highest Active Bid: ₹{listing.highestBid} / {listing.unit}
              </span>
            ) : null}
          </div>
          {priceSignals.status === 'available' ? (
            <p className="text-[11px] text-emerald-700">
              Observed Market Range: <strong>₹{priceSignals.suggestedLow} – ₹{priceSignals.suggestedHigh} / {listing.unit}</strong> (Sample Size: N={priceSignals.totalDataPoints} data points).
            </p>
          ) : (
            <p className="text-[11px] text-emerald-700">
              Market signals will accumulate as buyers submit bids. Enter your competitive B2B offer rate below.
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label={`Offer Rate (₹ per ${listing.unit})`}
            type="number"
            prefixSymbol="₹"
            value={offerPrice}
            onChange={(e) => setOfferPrice(e.target.value)}
            required
          />

          <Input
            label={`Quantity Required (${listing.unit})`}
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            hint={`Max available: ${listing.quantity} ${listing.unit}`}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Optional Message to Seller
          </label>
          <textarea
            rows={3}
            className="w-full bg-white border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Specify your processing requirements or pickup timeline..."
          />
        </div>

        {/* Calculated Total Value Box */}
        <div className="bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">Total B2B Commitment</span>
            <span className="text-xs text-slate-300">
              {quantity} {listing.unit} × ₹{offerPrice}/{listing.unit}
            </span>
          </div>
          <span className="text-2xl font-extrabold text-emerald-400">
            ₹{isNaN(totalAmount) ? 0 : totalAmount.toLocaleString()}
          </span>
        </div>

        <div className="pt-2 flex items-center justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            disabled={isSubmitting}
            icon={<Gavel className="w-4 h-4" />}
          >
            {isSubmitting ? 'Submitting Bid...' : 'Submit Official Bid'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
