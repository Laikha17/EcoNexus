import React, { useState } from 'react';
import { useEcoNexus } from '../../context/EcoNexusContext';
import { BidStatus } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { 
  Gavel, 
  Check, 
  XCircle, 
  Clock, 
  MapPin, 
  Building2,
  ChevronRight
} from 'lucide-react';
import { clsx } from 'clsx';

export const MyBids: React.FC = () => {
  const { bids, currentUser, setActivePage, setSelectedTransaction, transactions } = useEcoNexus();
  const [activeTab, setActiveTab] = useState<string>('all');

  if (!currentUser) return null;

  const buyerBids = bids.filter(b => b.buyerId === currentUser.id);

  const filteredBids = buyerBids.filter(b => {
    if (activeTab === 'all') return true;
    return b.status === activeTab;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Placed Bids</h1>
        <p className="text-xs text-slate-500">
          Track the status of your purchase offers across waste generators.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        {[
          { id: 'all', label: `All Bids (${buyerBids.length})` },
          { id: 'pending', label: `Pending (${buyerBids.filter(b => b.status === 'pending').length})` },
          { id: 'accepted', label: `Accepted (${buyerBids.filter(b => b.status === 'accepted').length})` },
          { id: 'rejected', label: `Rejected (${buyerBids.filter(b => b.status === 'rejected').length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={clsx(
              'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0',
              activeTab === tab.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      {filteredBids.length === 0 ? (
        <Card padded className="text-center p-8">
          <p className="text-xs text-slate-500">No bids match the selected filter.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredBids.map((bid) => {
            return (
              <Card key={bid.id} padded className="hover:border-slate-300 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <img
                      src={bid.listingImage}
                      alt={bid.listingTitle}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                    />

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-slate-900">{bid.listingTitle}</h3>
                        <Badge
                          variant={
                            bid.status === 'accepted' ? 'success' :
                            bid.status === 'pending' ? 'warning' : 'danger'
                          }
                        >
                          {bid.status.toUpperCase()}
                        </Badge>
                      </div>

                      <p className="text-xs text-slate-500 mt-0.5">
                        Seller: <strong className="text-slate-800 font-semibold">{bid.sellerCompany}</strong> • Submitted {new Date(bid.createdAt).toLocaleDateString()}
                      </p>

                      <p className="text-xs text-slate-600 italic bg-slate-50 p-2 rounded-lg border border-slate-200 mt-2">
                        "{bid.message}"
                      </p>
                    </div>
                  </div>

                  {/* Financial & Status Action */}
                  <div className="sm:text-right space-y-2 shrink-0">
                    <div>
                      <span className="text-xs text-slate-400 block">Offer Rate</span>
                      <span className="text-lg font-extrabold text-emerald-700">₹{bid.offerPrice} / {bid.unit}</span>
                      <span className="block text-xs font-semibold text-slate-900">Total: ₹{bid.totalAmount.toLocaleString()}</span>
                    </div>

                    {bid.status === 'accepted' && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => {
                          const tx = transactions.find(t => t.listingId === bid.listingId || t.buyerId === currentUser.id);
                          if (tx) setSelectedTransaction(tx);
                          setActivePage('transactions');
                        }}
                        icon={<ChevronRight className="w-4 h-4" />}
                      >
                        Track Order Delivery
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
