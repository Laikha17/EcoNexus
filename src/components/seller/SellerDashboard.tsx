import React from 'react';
import { useEcoNexus } from '../../context/EcoNexusContext';
import { 
  PlusCircle, 
  Layers, 
  Gavel, 
  CheckCircle2, 
  TrendingUp, 
  Sparkles, 
  Eye, 
  MapPin,
  ArrowUpRight,
  Clock,
  ChevronRight
} from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

export const SellerDashboard: React.FC = () => {
  const { listings, bids, transactions, setActivePage, setSelectedListing, currentUser } = useEcoNexus();

  if (!currentUser) return null;

  const sellerListings = listings.filter(l => l.sellerId === currentUser.id);
  const activeListings = sellerListings.filter(l => l.status === 'active' || l.status === 'bidding');
  const activeBids = bids.filter(b => b.sellerId === currentUser.id && b.status === 'pending');
  const completedTx = transactions.filter(t => t.sellerId === currentUser.id && (t.currentStatus === 'delivered' || t.currentStatus === 'completed'));
  
  const totalVolumeListed = sellerListings.reduce((sum, l) => sum + l.quantity, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-2xl p-6 text-white shadow-card border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Waste Generator / Seller Portal</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Welcome back, {currentUser.company}
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Turn your industrial production waste into valuable circular raw material for regional manufacturers.
          </p>
        </div>

        <Button
          size="lg"
          variant="primary"
          onClick={() => setActivePage('create-listing')}
          icon={<PlusCircle className="w-5 h-5" />}
        >
          List Waste Material
        </Button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padded className="border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Listings</span>
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{activeListings.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">Out of {sellerListings.length} total listed lots</p>
        </Card>

        <Card padded className="border-l-4 border-l-emerald-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Bids Received</span>
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
              <Gavel className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{activeBids.length}</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            {activeBids.length > 0 ? 'Pending your review & acceptance' : 'Awaiting buyer bids'}
          </p>
        </Card>

        <Card padded className="border-l-4 border-l-teal-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Volume Listed</span>
            <div className="p-2 bg-teal-50 text-teal-700 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{totalVolumeListed.toLocaleString()} <span className="text-sm font-semibold text-slate-500">kg</span></p>
          <p className="text-[11px] text-slate-500 mt-1">Textiles, Plastics & Packaging</p>
        </Card>

        <Card padded className="border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed Sales</span>
            <div className="p-2 bg-amber-50 text-amber-700 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{completedTx.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">Verified logistics delivery</p>
        </Card>
      </div>

      {/* Main Section: Active Listings Table & ML High Matches */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Active Material Listings</h2>
              <p className="text-xs text-slate-500">Listings currently open for buyer discovery and bidding</p>
            </div>
            <button
              onClick={() => setActivePage('my-listings')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              View All ({sellerListings.length})
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-subtle overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700 uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">Material & Category</th>
                    <th className="p-3.5">Quantity</th>
                    <th className="p-3.5">Expected Price</th>
                    <th className="p-3.5">Bids Received</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {sellerListings.slice(0, 4).map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.images[0]}
                            alt={item.title}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-slate-900 text-xs line-clamp-1">{item.title}</p>
                            <span className="text-[10px] text-slate-500 block">{item.category} • {item.subType}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 font-bold text-slate-900">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="p-3.5 font-bold text-emerald-700">
                        ₹{item.expectedPrice}/{item.unit}
                      </td>
                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <Gavel className="w-3 h-3" />
                          {item.currentBidsCount} Bids
                        </span>
                      </td>
                      <td className="p-3.5">
                        <Badge
                          variant={
                            item.status === 'bidding' ? 'warning' :
                            item.status === 'active' ? 'success' :
                            item.status === 'sold' ? 'info' : 'status'
                          }
                          size="sm"
                        >
                          {item.status.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedListing(item);
                            setActivePage('listing-details');
                          }}
                          icon={<Eye className="w-3.5 h-3.5" />}
                        >
                          Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Top ML Match Spotlight Panel */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Top AI Buyer Matches</span>
            </h2>
            <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Live Evaluation
            </span>
          </div>

          <Card padded className="bg-gradient-to-b from-emerald-50/40 to-white border-emerald-200 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <Badge variant="match" percentage={92} size="md" />
                <h3 className="font-bold text-sm text-slate-900 mt-2">Comfort Cushion Works</h3>
                <p className="text-xs text-slate-500">Furniture & Upholstery • Vijayawada</p>
              </div>
              <span className="text-[11px] font-bold text-slate-400">95 km away</span>
            </div>

            <div className="text-xs bg-white p-3 rounded-lg border border-emerald-200/80 space-y-1.5">
              <p className="font-semibold text-slate-800">Matched Requirement:</p>
              <p className="text-slate-600 leading-relaxed italic">
                "Requires 150kg pure cotton fabric waste for cushion stuffing & padding."
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Why this matches:</p>
              <ul className="text-xs text-slate-600 space-y-1">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Same material category: Textiles & Fabric</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Grade A combed cotton offcuts fit process</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Same region (Coastal Andhra Corridor)</span>
                </li>
              </ul>
            </div>

            <Button
              className="w-full"
              variant="primary"
              size="sm"
              onClick={() => setActivePage('bids-received')}
              icon={<Gavel className="w-4 h-4" />}
            >
              Review Received Bid (₹48/kg)
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
