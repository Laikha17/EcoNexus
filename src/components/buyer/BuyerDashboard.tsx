import React from 'react';
import { useEcoNexus } from '../../context/EcoNexusContext';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { 
  ShoppingBag, 
  Search, 
  Sparkles, 
  Gavel, 
  CheckCircle2, 
  TrendingUp, 
  MapPin,
  ChevronRight,
  ArrowUpRight
} from 'lucide-react';

export const BuyerDashboard: React.FC = () => {
  const { listings, bids, transactions, setActivePage, setSelectedListing, currentUser } = useEcoNexus();

  if (!currentUser) return null;

  const buyerBids = bids.filter(b => b.buyerId === currentUser.id);
  const activeBids = buyerBids.filter(b => b.status === 'pending');
  const acceptedBids = buyerBids.filter(b => b.status === 'accepted');
  const buyerTransactions = transactions.filter(t => t.buyerId === currentUser.id);

  // Recommended materials based on buyer profile (Textile & Fabric)
  const recommendedListings = listings.filter(l => l.category === 'Textiles & Fabric' && l.status !== 'sold');

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-2xl p-6 text-white shadow-card border border-emerald-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs mb-1">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Verified Resource Buyer Portal</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {currentUser.company}
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Sourcing preference: <span className="font-semibold text-emerald-300">Cotton Fabric Waste, Textiles & Rubber Scrap</span> for cushion & upholstery manufacturing.
          </p>
        </div>

        <Button
          size="lg"
          variant="primary"
          onClick={() => setActivePage('discover')}
          icon={<Search className="w-5 h-5" />}
        >
          Discover Marketplace Materials
        </Button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card padded className="border-l-4 border-l-emerald-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Placed Bids</span>
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
              <Gavel className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{activeBids.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">Pending seller review</p>
        </Card>

        <Card padded className="border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Won Transactions</span>
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{acceptedBids.length + buyerTransactions.length}</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">Bids accepted by sellers</p>
        </Card>

        <Card padded className="border-l-4 border-l-emerald-600">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Matched Lots Available</span>
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{recommendedListings.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">Textiles & Fabric in Coastal AP</p>
        </Card>

        <Card padded className="border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Freight Shipments</span>
            <div className="p-2 bg-amber-50 text-amber-700 rounded-lg">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{buyerTransactions.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">In transit with Apex Freight</p>
        </Card>
      </div>

      {/* Recommended Materials Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Recommended Materials for You (ML Scored)</span>
            </h2>
            <p className="text-xs text-slate-500">Listings dynamically matched to your industrial procurement profile</p>
          </div>

          <button
            onClick={() => setActivePage('discover')}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            Explore All Marketplace
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendedListings.map((item) => (
            <Card key={item.id} hoverable padded={false} className="flex flex-col sm:flex-row">
              <div className="sm:w-44 aspect-video sm:aspect-auto bg-slate-100 relative shrink-0">
                <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2">
                  <Badge variant="match" percentage={92} size="sm" />
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{item.category}</span>
                  <h3 className="font-bold text-sm text-slate-900 line-clamp-1">{item.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {item.location} ({item.sellerCompany})
                  </p>
                </div>

                <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Available</span>
                    <span className="font-bold text-slate-900">{item.quantity} {item.unit}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Base Rate</span>
                    <span className="font-bold text-emerald-700">₹{item.expectedPrice}/{item.unit}</span>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="primary"
                  className="w-full"
                  onClick={() => {
                    setSelectedListing(item);
                    setActivePage('buyer-listing-details');
                  }}
                >
                  View Details & Place Bid
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
