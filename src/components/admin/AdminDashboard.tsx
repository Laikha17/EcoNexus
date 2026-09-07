import React from 'react';
import { useEcoNexus } from '../../context/EcoNexusContext';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { 
  Users, 
  Layers, 
  Truck, 
  ShieldCheck, 
  TrendingUp, 
  CheckCircle2, 
  FileText,
  Building2,
  ChevronRight
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { users, listings, transactions, bids, setActivePage } = useEcoNexus();

  const sellers = users.filter(u => u.role === 'seller');
  const buyers = users.filter(u => u.role === 'buyer');
  const activeTransactions = transactions.filter(t => t.currentStatus !== 'completed');
  const completedTransactions = transactions.filter(t => t.currentStatus === 'completed' || t.currentStatus === 'delivered');

  const totalGMV = transactions.reduce((sum, t) => sum + t.totalAmount, 0);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 rounded-2xl p-6 text-white shadow-card border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Platform Governance & Administration</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            EcoNexus Central Operations Control
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Monitor platform entities, moderate industrial listings, and verify B2B transactions.
          </p>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <Card padded className="border-l-4 border-l-slate-700">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Total Users</span>
          <p className="text-xl font-extrabold text-slate-900 mt-1">{users.length}</p>
        </Card>

        <Card padded className="border-l-4 border-l-emerald-500">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Sellers</span>
          <p className="text-xl font-extrabold text-slate-900 mt-1">{sellers.length}</p>
        </Card>

        <Card padded className="border-l-4 border-l-emerald-600">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Buyers</span>
          <p className="text-xl font-extrabold text-slate-900 mt-1">{buyers.length}</p>
        </Card>

        <Card padded className="border-l-4 border-l-emerald-600">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Listings</span>
          <p className="text-xl font-extrabold text-slate-900 mt-1">{listings.length}</p>
        </Card>

        <Card padded className="border-l-4 border-l-amber-500">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Active Deals</span>
          <p className="text-xl font-extrabold text-slate-900 mt-1">{activeTransactions.length}</p>
        </Card>

        <Card padded className="border-l-4 border-l-teal-500">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Completed</span>
          <p className="text-xl font-extrabold text-slate-900 mt-1">{completedTransactions.length}</p>
        </Card>
      </div>

      {/* Platform Navigation Quick Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          hoverable
          padded
          onClick={() => setActivePage('users')}
          className="flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">User Directory</h3>
              <p className="text-xs text-slate-500">{users.length} entities • GST Verification</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </Card>

        <Card
          hoverable
          padded
          onClick={() => setActivePage('listings')}
          className="flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Listing Moderation</h3>
              <p className="text-xs text-slate-500">{listings.length} items • Quality Audit</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </Card>

        <Card
          hoverable
          padded
          onClick={() => setActivePage('transactions')}
          className="flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Transaction Audit</h3>
              <p className="text-xs text-slate-500">{transactions.length} deals • Logged Escrow</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </Card>
      </div>
    </div>
  );
};
