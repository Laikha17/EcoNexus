import React, { useState } from 'react';
import { useEcoNexus } from '../../context/EcoNexusContext';
import { ListingStatus, Listing } from '../../types';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { 
  PlusCircle, 
  Eye, 
  Gavel, 
  MapPin, 
  Sparkles,
  CheckCircle2,
  Filter
} from 'lucide-react';
import { clsx } from 'clsx';

export const SellerListings: React.FC = () => {
  const { listings, setActivePage, setSelectedListing, currentUser } = useEcoNexus();
  const [filterStatus, setFilterStatus] = useState<string>('all');

  if (!currentUser) return null;

  const sellerListings = listings.filter(l => l.sellerId === currentUser.id);

  const filteredListings = sellerListings.filter(l => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'active') return l.status === 'active' || l.status === 'bidding';
    if (filterStatus === 'sold') return l.status === 'sold';
    return l.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">My Listed Materials</h1>
          <p className="text-xs text-slate-500">
            Manage your active, bidding, and completed industrial waste listings.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setActivePage('create-listing')}
          icon={<PlusCircle className="w-4 h-4" />}
        >
          List New Material
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        {[
          { id: 'all', label: `All (${sellerListings.length})` },
          { id: 'active', label: `Active / Bidding (${sellerListings.filter(l => l.status === 'active' || l.status === 'bidding').length})` },
          { id: 'sold', label: `Sold / Completed (${sellerListings.filter(l => l.status === 'sold').length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            className={clsx(
              'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0',
              filterStatus === tab.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredListings.map((item) => {
          const topMatch = item.mlMatches && item.mlMatches.length > 0 ? item.mlMatches[0] : null;

          return (
            <Card key={item.id} hoverable padded={false} className="flex flex-col">
              {/* Image & Status Badge */}
              <div className="relative aspect-video bg-slate-100 overflow-hidden">
                <img
                  src={item.images[0]}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge variant="category">{item.category}</Badge>
                </div>
                <div className="absolute top-3 right-3">
                  <Badge
                    variant={
                      item.status === 'bidding' ? 'warning' :
                      item.status === 'active' ? 'success' : 'status'
                    }
                  >
                    {item.status.toUpperCase()}
                  </Badge>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-bold text-base text-slate-900 line-clamp-1">{item.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {item.location}
                  </p>

                  <div className="mt-3 grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Quantity</span>
                      <span className="font-bold text-slate-900">{item.quantity} {item.unit}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Expected Base</span>
                      <span className="font-bold text-emerald-700">₹{item.expectedPrice}/{item.unit}</span>
                    </div>
                  </div>

                  {/* ML Match Preview pill */}
                  {topMatch && (
                    <div className="mt-3 flex items-center justify-between bg-emerald-50/70 border border-emerald-200/80 p-2 rounded-lg text-xs">
                      <div className="flex items-center gap-1.5 text-emerald-800 font-medium">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="line-clamp-1">{topMatch.buyerCompany}</span>
                      </div>
                      <Badge variant="match" percentage={topMatch.matchPercentage} size="sm" />
                    </div>
                  )}
                </div>

                {/* Footer Bids & Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700">
                    <Gavel className="w-4 h-4" />
                    <span>{item.currentBidsCount} Bids</span>
                  </div>

                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => {
                      setSelectedListing(item);
                      setActivePage('listing-details');
                    }}
                    icon={<Eye className="w-3.5 h-3.5" />}
                  >
                    View Bids & Details
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
