import React from 'react';
import { useEcoNexus } from '../../context/EcoNexusContext';
import { Stepper } from '../common/Stepper';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { 
  Truck, 
  MapPin, 
  Building2, 
  CheckCircle2, 
  Clock, 
  PhoneCall, 
  FileText,
  ShieldCheck,
  PackageCheck
} from 'lucide-react';

export const SellerTransactionView: React.FC = () => {
  const { transactions, currentUser, selectedTransaction, setSelectedTransaction } = useEcoNexus();

  if (!currentUser) return null;

  const sellerTransactions = transactions.filter(
    t => t.sellerId === currentUser.id || currentUser.role === 'admin'
  );

  const activeTx = selectedTransaction || (sellerTransactions.length > 0 ? sellerTransactions[0] : null);

  if (!activeTx) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <Truck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="font-bold text-base text-slate-900">No Active Sales Transactions</h3>
        <p className="text-xs text-slate-500 mt-1">Once you accept a buyer bid, sales logistics tracking will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 uppercase">
              Confirmed Sales Transaction
            </span>
            <span className="text-xs text-slate-400 font-mono">#{activeTx.id.toUpperCase()}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {activeTx.listingTitle}
          </h1>
        </div>

        {sellerTransactions.length > 1 && (
          <select
            value={activeTx.id}
            onChange={(e) => {
              const found = sellerTransactions.find(t => t.id === e.target.value);
              if (found) setSelectedTransaction(found);
            }}
            className="bg-white border border-slate-300 rounded-lg p-2 text-xs font-semibold text-slate-800"
          >
            {sellerTransactions.map(t => (
              <option key={t.id} value={t.id}>
                {t.id.toUpperCase()} — {t.buyerCompany} ({t.quantity} {t.unit})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Stepper Logistics Tracker Bar */}
      <Card padded space-y-3 className="bg-white border-emerald-200 shadow-subtle">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Real-Time Logistics Status Progress
            </h2>
          </div>
          <Badge variant="info">
            {activeTx.currentStatus.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>

        <Stepper timeline={activeTx.timeline} currentStatus={activeTx.currentStatus} />
      </Card>

      {/* Transaction Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Deal Information & Addresses */}
        <div className="lg:col-span-2 space-y-6">
          <Card padded space-y-4>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              1. Agreed Deal Terms & Escrow Summary
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] block">Accepted Buyer</span>
                <span className="font-bold text-slate-900">{activeTx.buyerCompany}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Agreed Unit Rate</span>
                <span className="font-bold text-emerald-700">₹{activeTx.agreedPrice} / {activeTx.unit}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Total Volume</span>
                <span className="font-bold text-slate-900">{activeTx.quantity} {activeTx.unit}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Total Amount</span>
                <span className="font-extrabold text-slate-900 text-sm">₹{activeTx.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  Seller Pickup Warehouse:
                </span>
                <p className="text-slate-600 leading-relaxed">{activeTx.pickupAddress}</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  Buyer Delivery Destination:
                </span>
                <p className="text-slate-600 leading-relaxed">{activeTx.deliveryAddress}</p>
              </div>
            </div>
          </Card>

          {/* Carrier & Vehicle Details */}
          <Card padded space-y-3>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              2. Assigned Freight Logistics Partner
            </h3>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div>
                <span className="font-bold text-slate-900 text-sm block">{activeTx.logisticsPartner}</span>
                <span className="text-slate-500">Scheduled Pickup Date: {activeTx.scheduledPickupDate}</span>
              </div>

              {activeTx.vehicleNumber && (
                <div className="bg-slate-900 text-white p-3 rounded-xl space-y-1">
                  <span className="text-[10px] text-emerald-400 font-bold block">ASSIGNED VEHICLE & DRIVER</span>
                  <p className="font-semibold text-xs">{activeTx.vehicleNumber}</p>
                  <p className="text-[11px] text-slate-300 flex items-center gap-1">
                    <PhoneCall className="w-3 h-3 text-emerald-400" />
                    {activeTx.driverContact}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Gate Pass & Escrow Status */}
        <div className="space-y-6">
          <Card padded space-y-4 className="bg-slate-900 text-white border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Escrow & Payment Clearance
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Escrow Deposit:</span>
                <span className="font-bold text-emerald-400">₹{activeTx.totalAmount.toLocaleString()} Locked</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Release Trigger:</span>
                <span className="font-medium text-white">Buyer Weight Receipt Verification</span>
              </div>
            </div>

            <div className="bg-slate-800/80 p-3 rounded-xl text-[11px] text-slate-300 space-y-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400 mb-1" />
              <p>Payout will be automatically released to Ramesh Textiles bank account upon driver weighbridge confirmation at Vijayawada warehouse.</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
