import React, { useState } from 'react';
import { useEcoNexus } from '../../context/EcoNexusContext';
import { ListingStatus } from '../../types';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Layers, ShieldCheck, Check, Archive, Eye } from 'lucide-react';

export const ListingModeration: React.FC = () => {
  const { listings, toggleListingStatus, setSelectedListing, setActivePage } = useEcoNexus();
  const [filter, setFilter] = useState<string>('all');

  const filtered = listings.filter(l => {
    if (filter === 'all') return true;
    return l.status === filter;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Listing Moderation & Verification</h1>
        <p className="text-xs text-slate-500">
          Inspect industrial waste listings for compliance, quality grade standards, and seller specifications.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        {['all', 'active', 'bidding', 'sold', 'archived'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider shrink-0 transition-all ${
              filter === status
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Listings Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700 uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Listing Title & Category</th>
                <th className="p-3.5">Seller Enterprise</th>
                <th className="p-3.5">Quantity & Unit</th>
                <th className="p-3.5">Base Rate</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5">
                    <div className="flex items-center gap-3">
                      <img src={item.images[0]} alt={item.title} className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0" />
                      <div>
                        <p className="font-bold text-slate-900 text-xs">{item.title}</p>
                        <span className="text-[10px] text-slate-500">{item.category} • {item.subType}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5 font-bold text-slate-900">{item.sellerCompany}</td>
                  <td className="p-3.5 font-bold text-slate-800">{item.quantity} {item.unit}</td>
                  <td className="p-3.5 font-bold text-emerald-700">₹{item.expectedPrice}/{item.unit}</td>
                  <td className="p-3.5">
                    <Badge variant={item.status === 'active' ? 'success' : item.status === 'bidding' ? 'warning' : 'status'}>
                      {item.status.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="p-3.5 text-right space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedListing(item);
                        setActivePage('listing-details');
                      }}
                      icon={<Eye className="w-3.5 h-3.5" />}
                    >
                      Inspect
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleListingStatus(item.id, item.status === 'archived' ? 'active' : 'archived')}
                    >
                      {item.status === 'archived' ? 'Unarchive' : 'Archive'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
