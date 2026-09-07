import React, { useState } from 'react';
import { useEcoNexus } from '../../context/EcoNexusContext';
import { Transaction } from '../../types';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Stepper } from '../common/Stepper';
import { 
  FileText, 
  Eye, 
  ShieldCheck, 
  Truck, 
  Sparkles, 
  ArrowRight, 
  Building2, 
  MapPin, 
  CheckCircle2,
  Boxes,
  Gavel,
  DollarSign
} from 'lucide-react';

export const TransactionOverview: React.FC = () => {
  const { transactions } = useEcoNexus();
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(
    transactions.length > 0 ? transactions[0] : null
  );

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="verified">Platform-Wide Governance</Badge>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Admin End-to-End Transaction Monitoring
        </h1>
        <p className="text-xs text-slate-500">
          Inspect full transaction lifecycles across Sellers, Buyers, ML Matching Engine, and Logistics Partners.
        </p>
      </div>

      {/* Selected Transaction Lifecycle Inspection Panel */}
      {selectedTx && (
        <Card padded space-y-6 className="bg-white border-slate-300 shadow-card">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-extrabold text-slate-900 font-mono bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                  TRANSACTION #{selectedTx.id.toUpperCase()}
                </span>
                <Badge variant="info">{selectedTx.currentStatus.replace('_', ' ').toUpperCase()}</Badge>
              </div>
              <h2 className="text-xl font-bold text-slate-900">{selectedTx.listingTitle}</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Created on {new Date(selectedTx.createdAt).toLocaleString()} • Escrow Locked: ₹{selectedTx.totalAmount.toLocaleString()}
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 block">Agreed Settlement Rate</span>
              <span className="text-2xl font-extrabold text-emerald-700">₹{selectedTx.agreedPrice} / {selectedTx.unit}</span>
              <span className="text-xs font-bold text-slate-800 block">Total Volume: {selectedTx.quantity} {selectedTx.unit}</span>
            </div>
          </div>

          {/* End-to-End 10-Step Lifecycle Flow Diagram */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Complete 10-Stage Transaction Audit Trail Flow
            </h3>

            <div className="bg-slate-900 text-white rounded-2xl p-5 overflow-x-auto">
              <div className="flex items-center gap-2 min-w-[900px] text-xs font-medium">
                <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-center shrink-0">
                  <span className="text-[10px] text-emerald-400 font-bold block">1. LISTING CREATED</span>
                  <span className="font-semibold">{selectedTx.sellerCompany}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />

                <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-center shrink-0">
                  <span className="text-[10px] text-emerald-400 font-bold block">2. ML MATCHING</span>
                  <span className="font-semibold text-emerald-300">92% AI Score</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />

                <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-center shrink-0">
                  <span className="text-[10px] text-emerald-400 font-bold block">3. DISCOVERY</span>
                  <span className="font-semibold">{selectedTx.buyerCompany}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />

                <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-center shrink-0">
                  <span className="text-[10px] text-emerald-400 font-bold block">4. BID PLACED</span>
                  <span className="font-semibold text-emerald-300">₹{selectedTx.agreedPrice}/{selectedTx.unit}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />

                <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-center shrink-0">
                  <span className="text-[10px] text-emerald-400 font-bold block">5. ACCEPTED</span>
                  <span className="font-semibold text-emerald-400">Escrow Locked</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />

                <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-center shrink-0">
                  <span className="text-[10px] text-emerald-400 font-bold block">6. LOGISTICS DISPATCH</span>
                  <span className="font-semibold">{selectedTx.logisticsPartner}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stepper Status Component */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <Stepper timeline={selectedTx.timeline} currentStatus={selectedTx.currentStatus} />
          </div>

          {/* Parties & Logistics Audit Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">SELLER (WASTE GENERATOR)</span>
              <p className="font-bold text-slate-900 text-sm">{selectedTx.sellerCompany}</p>
              <p className="text-slate-600">{selectedTx.sellerName} • {selectedTx.sellerLocation}</p>
              <p className="text-slate-500 text-[11px] mt-2">Pickup: {selectedTx.pickupAddress}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">BUYER (RESOURCE PURCHASER)</span>
              <p className="font-bold text-slate-900 text-sm">{selectedTx.buyerCompany}</p>
              <p className="text-slate-600">{selectedTx.buyerName} • {selectedTx.buyerLocation}</p>
              <p className="text-slate-500 text-[11px] mt-2">Delivery: {selectedTx.deliveryAddress}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">LOGISTICS TRANSPORT CARRIER</span>
              <p className="font-bold text-slate-900 text-sm">{selectedTx.logisticsPartner}</p>
              <p className="text-slate-600">Vehicle: {selectedTx.vehicleNumber || 'AP 16 TJ 4521'}</p>
              <p className="text-emerald-700 font-semibold text-[11px] mt-2">Driver: {selectedTx.driverContact}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Transaction Directory Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-subtle overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wider">All Platform Transactions ({transactions.length})</h3>
          <span className="text-xs text-slate-500">Click any transaction row to inspect audit timeline</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700 uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Tx Ref</th>
                <th className="p-3.5">Material & Category</th>
                <th className="p-3.5">Seller</th>
                <th className="p-3.5">Buyer</th>
                <th className="p-3.5">Agreed Price</th>
                <th className="p-3.5">Total Amount</th>
                <th className="p-3.5">Current Status</th>
                <th className="p-3.5 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {transactions.map((tx) => {
                const isSelected = selectedTx?.id === tx.id;
                return (
                  <tr
                    key={tx.id}
                    onClick={() => setSelectedTx(tx)}
                    className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                      isSelected ? 'bg-emerald-50/60 font-semibold' : ''
                    }`}
                  >
                    <td className="p-3.5 font-bold font-mono text-slate-900">#{tx.id.toUpperCase()}</td>
                    <td className="p-3.5">
                      <span className="font-bold text-slate-900 block">{tx.listingTitle}</span>
                      <span className="text-[10px] text-slate-500">{tx.category}</span>
                    </td>
                    <td className="p-3.5 text-slate-800">{tx.sellerCompany}</td>
                    <td className="p-3.5 text-slate-800">{tx.buyerCompany}</td>
                    <td className="p-3.5 font-bold text-emerald-700">₹{tx.agreedPrice}/{tx.unit}</td>
                    <td className="p-3.5 font-extrabold text-slate-900">₹{tx.totalAmount.toLocaleString()}</td>
                    <td className="p-3.5">
                      <Badge variant="info">{tx.currentStatus.replace('_', ' ').toUpperCase()}</Badge>
                    </td>
                    <td className="p-3.5 text-right">
                      <Button
                        size="sm"
                        variant={isSelected ? 'primary' : 'outline'}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTx(tx);
                        }}
                        icon={<Eye className="w-3.5 h-3.5" />}
                      >
                        {isSelected ? 'Inspecting' : 'Audit'}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
