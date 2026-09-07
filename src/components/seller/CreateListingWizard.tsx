import React, { useState } from 'react';
import { useEcoNexus } from '../../context/EcoNexusContext';
import { MaterialCategory, MaterialCondition, Listing, MLMatchResult } from '../../types';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Input, Select } from '../common/Input';
import { MLMatchResults } from './MLMatchResults';
import { 
  Sparkles, 
  Upload, 
  ArrowLeft, 
  CheckCircle2, 
  Info,
  MapPin,
  Tag,
  Boxes
} from 'lucide-react';

export const CreateListingWizard: React.FC = () => {
  const { createListing, setActivePage, addToast } = useEcoNexus();
  const [createdListing, setCreatedListing] = useState<Listing | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form State
  const [title, setTitle] = useState('100% Pure Cotton Fabric Waste (Combed Offcuts)');
  const [category, setCategory] = useState<MaterialCategory>('Textiles & Fabric');
  const [subType, setSubType] = useState('Cotton Fabric Clippings');
  const [quantity, setQuantity] = useState('150');
  const [unit, setUnit] = useState('kg');
  const [condition, setCondition] = useState<MaterialCondition>('Grade A (Sorted & Clean)');
  const [description, setDescription] = useState('Clean un-dyed pure cotton fabric clippings from garment cutting floor. Free from synthetic blends, stored in dry burlap bales.');
  const [expectedPrice, setExpectedPrice] = useState('45');
  const [location, setLocation] = useState('Bhimavaram, Andhra Pradesh');
  const [composition, setComposition] = useState('100% Combed Cotton');
  const [moistureContent, setMoistureContent] = useState('< 5%');

  // Sample image options
  const sampleImages = [
    'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=800&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&auto=format&fit=crop&q=80'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!title.trim() || !quantity || Number(quantity) <= 0 || !expectedPrice || Number(expectedPrice) <= 0) {
      addToast('Please provide valid title, quantity, and expected price.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const newListing = await createListing({
        title,
        category,
        subType,
        quantity: Number(quantity),
        unit,
        condition,
        description,
        expectedPrice: Number(expectedPrice),
        location,
        composition,
        moistureContent,
        images: sampleImages
      });

      setCreatedListing(newListing);
    } catch (err: any) {
      console.error('Error creating listing:', err);
      addToast(err?.message || 'Failed to create listing.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (createdListing) {
    return (
      <MLMatchResults
        listing={createdListing}
        onDone={() => {
          setActivePage('my-listings');
        }}
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => setActivePage('dashboard')}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">List Industrial Waste / Resource</h1>
          <p className="text-xs text-slate-500">
            Submit your material specifications to trigger real-time ML buyer matching across regional industrial hubs.
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-semibold">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>Instant ML Buyer Match Preview</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Classification & Type */}
        <Card padded space-y-4>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
            <Boxes className="w-4 h-4 text-emerald-600" />
            1. Material Classification & Sub-type
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Material Category"
              value={category}
              onChange={(e) => setCategory(e.target.value as MaterialCategory)}
              options={[
                { label: 'Textiles & Fabric', value: 'Textiles & Fabric' },
                { label: 'Plastics & Polymers', value: 'Plastics & Polymers' },
                { label: 'Metals & Alloys', value: 'Metals & Alloys' },
                { label: 'Paper & Packaging', value: 'Paper & Packaging' },
                { label: 'Chemicals & Solvents', value: 'Chemicals & Solvents' },
                { label: 'Rubber & Tyres', value: 'Rubber & Tyres' },
              ]}
            />

            <Input
              label="Material Sub-Type"
              placeholder="e.g. Cotton Clippings, HDPE Flakes, Denim Scrap"
              value={subType}
              onChange={(e) => setSubType(e.target.value)}
              required
            />
          </div>

          <Input
            label="Listing Title"
            placeholder="Descriptive title for industrial marketplace"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </Card>

        {/* Section 2: Quantity & Base Pricing */}
        <Card padded space-y-4>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
            <Tag className="w-4 h-4 text-emerald-600" />
            2. Quantity, Quality & Base Price
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Available Quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />

            <Select
              label="Unit of Measurement"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              options={[
                { label: 'Kilograms (kg)', value: 'kg' },
                { label: 'Metric Tons (MT)', value: 'MT' },
                { label: 'Liters (L)', value: 'L' },
                { label: 'Bales', value: 'bales' },
              ]}
            />

            <Input
              label="Expected Price (₹ / unit)"
              type="number"
              prefixSymbol="₹"
              value={expectedPrice}
              onChange={(e) => setExpectedPrice(e.target.value)}
              hint="Starting base price for buyer bidding"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Material Quality / Condition"
              value={condition}
              onChange={(e) => setCondition(e.target.value as MaterialCondition)}
              options={[
                { label: 'Grade A (Sorted & Clean)', value: 'Grade A (Sorted & Clean)' },
                { label: 'Grade B (Mixed Offcuts)', value: 'Grade B (Mixed Offcuts)' },
                { label: 'Raw Unsorted Scrap', value: 'Raw Unsorted Scrap' },
                { label: 'Shredded / Processed Flakes', value: 'Shredded / Processed Flakes' },
              ]}
            />

            <Input
              label="Location / Dispatch City"
              placeholder="e.g. Bhimavaram, Andhra Pradesh"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              prefixSymbol={<MapPin className="w-4 h-4" />}
              required
            />
          </div>
        </Card>

        {/* Section 3: Technical Specs & Description */}
        <Card padded space-y-4>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
            <Info className="w-4 h-4 text-emerald-600" />
            3. Technical Specifications & Photos
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Chemical / Fiber Composition"
              placeholder="e.g. 100% Cotton, HDPE 99.5%"
              value={composition}
              onChange={(e) => setComposition(e.target.value)}
            />

            <Input
              label="Moisture Content %"
              placeholder="e.g. < 5%"
              value={moistureContent}
              onChange={(e) => setMoistureContent(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Material Description
            </label>
            <textarea
              rows={3}
              className="w-full bg-white border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="Provide details about storage, contamination levels, and packaging..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Image Upload Preview */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Material Photographs (Attached Seed Samples)
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {sampleImages.map((img, idx) => (
                <div key={idx} className="relative rounded-lg overflow-hidden border border-slate-200 aspect-video">
                  <img src={img} alt="Sample" className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 left-1 bg-slate-900/80 text-white text-[10px] px-1.5 py-0.5 rounded">
                    Photo {idx + 1}
                  </span>
                </div>
              ))}

              <div className="border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center p-3 text-center cursor-pointer hover:bg-slate-50 transition-colors">
                <Upload className="w-5 h-5 text-slate-400 mb-1" />
                <span className="text-[11px] font-semibold text-slate-600">Add Photo</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setActivePage('dashboard')}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isSubmitting}
            disabled={isSubmitting}
            icon={<Sparkles className="w-5 h-5" />}
          >
            {isSubmitting ? 'Publishing Listing...' : 'Submit Listing & Evaluate ML Matches'}
          </Button>
        </div>
      </form>
    </div>
  );
};
