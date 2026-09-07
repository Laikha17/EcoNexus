import React, { useState } from 'react';
import { useEcoNexus } from '../../context/EcoNexusContext';
import { MaterialCategory, Listing } from '../../types';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Input, Select } from '../common/Input';
import { 
  Search, 
  Filter, 
  MapPin, 
  Sparkles, 
  Gavel, 
  Grid, 
  List as ListIcon,
  SlidersHorizontal,
  RefreshCw
} from 'lucide-react';
import { clsx } from 'clsx';

export const DiscoverMarketplace: React.FC = () => {
  const { listings, setSelectedListing, setActivePage } = useEcoNexus();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredListings = listings.filter((item) => {
    if (item.status === 'sold') return false;

    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesRegion = selectedRegion === 'all' || item.location.includes(selectedRegion);
    const matchesPrice = !maxPrice || item.expectedPrice <= Number(maxPrice);

    return matchesSearch && matchesCategory && matchesRegion && matchesPrice;
  });

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Discover Waste & Resources</h1>
          <p className="text-xs text-slate-500">
            Browse ML-matched industrial waste materials available for circular recycling & manufacturing.
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={clsx(
              'p-1.5 rounded-md text-slate-600 transition-colors',
              viewMode === 'grid' && 'bg-slate-100 text-slate-900 font-bold'
            )}
            title="Grid View"
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={clsx(
              'p-1.5 rounded-md text-slate-600 transition-colors',
              viewMode === 'list' && 'bg-slate-100 text-slate-900 font-bold'
            )}
            title="List View"
          >
            <ListIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search & Multi-Filter Bar */}
      <Card padded className="space-y-4 bg-white border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2">
            <Input
              placeholder="Search by material (e.g. Cotton, HDPE, Box scrap, Denim)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              prefixSymbol={<Search className="w-4 h-4" />}
            />
          </div>

          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            options={[
              { label: 'All Material Categories', value: 'all' },
              { label: 'Textiles & Fabric', value: 'Textiles & Fabric' },
              { label: 'Plastics & Polymers', value: 'Plastics & Polymers' },
              { label: 'Metals & Alloys', value: 'Metals & Alloys' },
              { label: 'Paper & Packaging', value: 'Paper & Packaging' },
            ]}
          />

          <Select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            options={[
              { label: 'All Locations / Regions', value: 'all' },
              { label: 'Bhimavaram', value: 'Bhimavaram' },
              { label: 'Vijayawada', value: 'Vijayawada' },
              { label: 'Guntur', value: 'Guntur' },
              { label: 'Kakinada', value: 'Kakinada' },
            ]}
          />
        </div>
      </Card>

      {/* Active Results Counter */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>Showing <strong className="text-slate-900 font-bold">{filteredListings.length}</strong> available material lots</span>
        <span className="flex items-center gap-1 font-semibold text-emerald-700">
          <Sparkles className="w-3.5 h-3.5" /> Sorted by AI Match Score
        </span>
      </div>

      {/* Marketplace Listings View */}
      {filteredListings.length === 0 ? (
        <Card padded className="text-center p-12 space-y-3">
          <p className="text-sm font-semibold text-slate-700">No materials match your current filter criteria.</p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedRegion('all');
              setMaxPrice('');
            }}
          >
            Reset Filters
          </Button>
        </Card>
      ) : (
        <div className={clsx(
          viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'
        )}>
          {filteredListings.map((item) => {
            const isTextile = item.category === 'Textiles & Fabric';
            const matchScore = isTextile ? 92 : 74;

            return (
              <Card
                key={item.id}
                hoverable
                padded={false}
                className={clsx(
                  'flex flex-col',
                  viewMode === 'list' && 'md:flex-row'
                )}
              >
                {/* Thumbnail & ML Match Badge */}
                <div className={clsx(
                  'relative bg-slate-100 overflow-hidden',
                  viewMode === 'grid' ? 'aspect-video' : 'md:w-56 aspect-video md:aspect-auto shrink-0'
                )}>
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge variant="match" percentage={matchScore} size="md" />
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge variant="category" size="sm">{item.category}</Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 line-clamp-1">{item.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {item.location} • <span className="font-semibold text-slate-700">{item.sellerCompany}</span>
                    </p>

                    {/* Exact Prompt Spec Box format: "150 kg", "Bhimavaram", "₹45/kg" */}
                    <div className="mt-3.5 grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs">
                      <div>
                        <span className="text-slate-400 text-[10px] block">Quantity</span>
                        <span className="font-extrabold text-slate-900">{item.quantity} {item.unit}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Location</span>
                        <span className="font-bold text-slate-800 line-clamp-1">{item.location.split(',')[0]}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[10px] block">Starting Price</span>
                        <span className="font-extrabold text-emerald-700">₹{item.expectedPrice}/{item.unit}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-400">{item.currentBidsCount} Active Bids</span>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => {
                        setSelectedListing(item);
                        setActivePage('buyer-listing-details');
                      }}
                      icon={<Gavel className="w-3.5 h-3.5" />}
                    >
                      View & Place Bid
                    </Button>
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
