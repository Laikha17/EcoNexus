import React from 'react';
import { useEcoNexus } from '../../context/EcoNexusContext';
import { Bid, Listing } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { 
  Check, 
  Sparkles, 
  MapPin, 
  Building2, 
  DollarSign, 
  MessageSquare,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

interface BidComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing;
  bids: Bid[];
}

export const BidComparisonModal: React.FC<BidComparisonModalProps> = ({
  isOpen,
  onClose,
  listing,
  bids
}) => {
  const { acceptBid, rejectBid } = useEcoNexus();

  const handleAccept = (bidId: string) => {
    acceptBid(bidId);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Side-by-Side Visual Bid Matrix"
      subtitle={`Comparing ${bids.length} buyer bids received for "${listing.title}"`}
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Helper Tip */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center justify-between text-xs text-emerald-900">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Highest offered bid: <strong className="text-emerald-700 font-extrabold">₹{Math.max(...bids.map(b => b.offerPrice))}/{listing.unit}</strong>. Accept the optimal offer to lock escrow.</span>
          </div>
        </div>

        {/* Comparison Matrix Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-subtle">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-900 text-white font-semibold">
                <th className="p-4 border-r border-slate-800 w-44">Attribute</th>
                {bids.map((bid, idx) => (
                  <th key={bid.id} className="p-4 min-w-[240px] border-r border-slate-800 last:border-r-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm">Bid Option #{idx + 1}</span>
                      {bid.offerPrice === Math.max(...bids.map(b => b.offerPrice)) && (
                        <span className="text-[10px] bg-emerald-500 text-slate-900 px-2 py-0.5 rounded font-extrabold uppercase">
                          Highest Offer
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700 font-medium">
              {/* Buyer Name & Company */}
              <tr>
                <td className="p-4 font-bold bg-slate-50 border-r border-slate-200">Buyer Company</td>
                {bids.map(bid => (
                  <td key={bid.id} className="p-4 border-r border-slate-200 last:border-r-0">
                    <p className="font-bold text-slate-900 text-sm">{bid.buyerCompany}</p>
                    <p className="text-xs text-slate-500">{bid.buyerName}</p>
                  </td>
                ))}
              </tr>

              {/* Offer Price */}
              <tr>
                <td className="p-4 font-bold bg-slate-50 border-r border-slate-200">Offer Price</td>
                {bids.map(bid => (
                  <td key={bid.id} className="p-4 border-r border-slate-200 last:border-r-0">
                    <span className="text-lg font-extrabold text-emerald-700">
                      ₹{bid.offerPrice} <span className="text-xs text-slate-500 font-normal">/ {bid.unit}</span>
                    </span>
                    <span className="block text-[11px] text-slate-400">Expected base: ₹{listing.expectedPrice}</span>
                  </td>
                ))}
              </tr>

              {/* Total Value */}
              <tr>
                <td className="p-4 font-bold bg-slate-50 border-r border-slate-200">Total Deal Value</td>
                {bids.map(bid => (
                  <td key={bid.id} className="p-4 border-r border-slate-200 last:border-r-0 font-bold text-slate-900 text-sm">
                    ₹{bid.totalAmount.toLocaleString()}
                  </td>
                ))}
              </tr>

              {/* Match Score */}
              <tr>
                <td className="p-4 font-bold bg-slate-50 border-r border-slate-200">AI Match Confidence</td>
                {bids.map(bid => (
                  <td key={bid.id} className="p-4 border-r border-slate-200 last:border-r-0">
                    <Badge variant="match" percentage={bid.matchScore} size="md" />
                  </td>
                ))}
              </tr>

              {/* Location */}
              <tr>
                <td className="p-4 font-bold bg-slate-50 border-r border-slate-200">Buyer Hub & Proximity</td>
                {bids.map(bid => (
                  <td key={bid.id} className="p-4 border-r border-slate-200 last:border-r-0 text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {bid.buyerLocation}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Message */}
              <tr>
                <td className="p-4 font-bold bg-slate-50 border-r border-slate-200">Buyer Message</td>
                {bids.map(bid => (
                  <td key={bid.id} className="p-4 border-r border-slate-200 last:border-r-0 text-xs italic text-slate-600 bg-slate-50/40">
                    "{bid.message}"
                  </td>
                ))}
              </tr>

              {/* Action row */}
              <tr>
                <td className="p-4 font-bold bg-slate-50 border-r border-slate-200">Selection Action</td>
                {bids.map(bid => (
                  <td key={bid.id} className="p-4 border-r border-slate-200 last:border-r-0 space-y-2">
                    {bid.status === 'accepted' ? (
                      <div className="p-2 bg-emerald-100 text-emerald-800 font-bold rounded-lg text-center text-xs flex items-center justify-center gap-1">
                        <Check className="w-4 h-4" />
                        Accepted Offer
                      </div>
                    ) : (
                      <>
                        <Button
                          className="w-full"
                          variant="primary"
                          onClick={() => handleAccept(bid.id)}
                          icon={<Check className="w-4 h-4" />}
                        >
                          Accept This Bid
                        </Button>
                        <Button
                          className="w-full"
                          variant="ghost"
                          size="sm"
                          onClick={() => rejectBid(bid.id)}
                        >
                          Decline
                        </Button>
                      </>
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Modal>
  );
};
