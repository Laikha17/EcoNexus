import React from 'react';
import { useEcoNexus } from '../../context/EcoNexusContext';
import { 
  Recycle, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Factory, 
  ShoppingBag, 
  Truck, 
  ShieldCheck, 
  MapPin,
  Lock
} from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface LandingPageProps {
  onGoToLogin: () => void;
  onGoToSignup: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGoToLogin, onGoToSignup }) => {
  const { getPublicListings } = useEcoNexus();
  const publicListings = getPublicListings().slice(0, 3);

  const categories = [
    { title: 'Textiles & Fabric Waste', count: 'Active Exchange', icon: '🧵', desc: 'Cotton offcuts, denim scrap, yarn waste, synthetic trimmings' },
    { title: 'Plastics & Polymers', count: 'Active Exchange', icon: '♻️', desc: 'HDPE regrind flakes, PET bottles, PP industrial bags, packaging films' },
    { title: 'Metals & Alloys', count: 'Multi-Industry Ready', icon: '⚙️', desc: 'Aluminum turnings, copper scrap, stainless steel offcuts' },
    { title: 'Paper & Packaging', count: 'Active Exchange', icon: '📦', desc: 'OCC corrugated bales, Kraft pulp scrap, paperboard trimmings' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAF9] flex flex-col font-sans">
      {/* Premium Light Neutral Hero Section */}
      <section className="relative overflow-hidden bg-[#F8FAF9] text-slate-900 pt-16 pb-20 md:pt-24 md:pb-28 border-b border-slate-200/70">
        {/* Subtle grid accent background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] opacity-35 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Connecting Industrial Waste to New Value</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              One industry’s waste can become another industry’s <span className="text-emerald-600 underline decoration-emerald-200 decoration-wavy underline-offset-8">raw material.</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto font-medium">
              EcoNexus is an ML-powered B2B resource exchange connecting waste-generating factories with manufacturing buyers using intelligent material matching and verified freight logistics.
            </p>

            {/* Public Action CTAs */}
            <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
              <Button
                size="lg"
                variant="primary"
                onClick={onGoToSignup}
                icon={<ArrowRight className="w-5 h-5" />}
              >
                Create Business Account
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-white text-slate-900 border-slate-300 hover:bg-slate-100 shadow-2xs"
                onClick={onGoToLogin}
                icon={<Lock className="w-4 h-4 text-slate-500" />}
              >
                Sign In to Workspace
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Demonstration Corridor Banner */}
      <section className="bg-emerald-50/80 text-slate-900 py-5 border-b border-emerald-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🧵</span>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 block">Initial Demonstration Use Case</span>
              <p className="text-sm font-bold text-slate-900">Textile & Fabric Waste Exchange (Coastal Andhra Industrial Hub)</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs font-semibold text-slate-600">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Cotton & Denim Scrap</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>92% ML Buyer Match</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Verified B2B Escrow</span>
            </div>
          </div>
        </div>
      </section>

      {/* How EcoNexus Works */}
      <section className="py-16 md:py-24 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <h2 className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Simple 4-Step Process</h2>
            <p className="text-3xl font-extrabold text-slate-900">How the EcoNexus Marketplace Works</p>
            <p className="text-sm text-slate-600">Transforming industrial by-products into high-value secondary resources.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="p-6 rounded-2xl bg-[#F8FAF9] border border-slate-200 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold text-base flex items-center justify-center mb-4">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">List Waste Material</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Factories list surplus scrap, quantity (kg), composition, quality grade, and expected price.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F8FAF9] border border-slate-200 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold text-base flex items-center justify-center mb-4">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">ML Demand Matching</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Our algorithm evaluates buyer processing specs, location proximity, and assigns match scores.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F8FAF9] border border-slate-200 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold text-base flex items-center justify-center mb-4">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Competitive Bidding</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Buyers place purchase offers. Sellers visually compare bids and accept optimal terms.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F8FAF9] border border-slate-200 shadow-2xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold text-base flex items-center justify-center mb-4">
                4
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">Tracked Logistics</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Assigned freight partners manage pickup, gate pass verification, and delivery tracking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Public Marketplace Preview */}
      <section className="py-16 bg-[#F8FAF9] border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
            <div>
              <h2 className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Public Directory Preview</h2>
              <p className="text-2xl font-bold text-slate-900">Active Material Listings</p>
            </div>
            <Button variant="outline" onClick={onGoToLogin} className="bg-white border-slate-300">
              Sign In to View Full Marketplace
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {publicListings.map((item) => (
              <div key={item.id} className="bg-white rounded-xl border border-slate-200 p-5 space-y-3 shadow-subtle hover:border-slate-300 transition-colors">
                <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden relative">
                  <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2">
                    <Badge variant="category" size="sm">{item.category}</Badge>
                  </div>
                </div>

                <h3 className="font-bold text-sm text-slate-900 line-clamp-1">{item.title}</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {item.location}
                </p>

                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded-lg text-xs font-medium border border-slate-100">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Quantity</span>
                    <span className="font-bold text-slate-900">{item.quantity} {item.unit}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Starting Price</span>
                    <span className="font-bold text-emerald-700">₹{item.expectedPrice}/{item.unit}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Multi-Industry Architecture</h2>
            <p className="text-2xl font-bold text-slate-900">Supported Material Categories</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <div key={cat.title} className="bg-[#F8FAF9] p-6 rounded-xl border border-slate-200">
                <span className="text-3xl block mb-3">{cat.icon}</span>
                <h3 className="font-bold text-sm text-slate-900 mb-1">{cat.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">{cat.desc}</p>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {cat.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-10 border-t border-slate-800 text-xs mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">
              E
            </div>
            <span className="font-bold text-white text-sm">EcoNexus Platform</span>
            <span>— ML-Powered Industrial Resource Exchange</span>
          </div>

          <p>© 2026 EcoNexus Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
