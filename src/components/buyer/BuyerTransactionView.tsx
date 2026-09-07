import React from 'react';
import { useEcoNexus } from '../../context/EcoNexusContext';
import { Stepper } from '../common/Stepper';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { 
  Truck, 
  MapPin, 
  Building2, 
  CheckCircle2, 
  ShieldCheck,
  PhoneCall
} from 'lucide-react';

export const BuyerTransactionView: React.FC = () => {
  const { transactions, currentUser, selectedTransaction, setSelectedTransaction } = useEcoNexus();

  if (!currentUser) return null;

  const buyerTransactions = transactions.filter(
    t => t.buyerId === currentUser.id || currentUser.role === 'admin'
  );

  const activeTx = selectedTransaction || (buyerTransactions.length > 0 ? buyerTransactions[0] : null);

  if (!activeTx) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <Truck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="font-bold text-base text-slate-900">No Active Resource Orders</h3>
        <p className="text-xs text-slate-500 mt-1">When a seller accepts your bid, active orders and delivery tracking will be shown here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 uppercase">
              Won Procurement Order
            </span>
            <span className="text-xs text-slate-400 font-mono">#{activeTx.id.toUpperCase()}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {activeTx.listingTitle}
          </h1>
        </div>
      </div>

      {/* Stepper Status Bar */}
      <Card padded space-y-3 className="bg-white border-emerald-200 shadow-subtle">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Live Delivery Shipment Progress
            </h2>
          </div>
          <Badge variant="info">
            {activeTx.currentStatus.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>

        <Stepper timeline={activeTx.timeline} currentStatus={activeTx.currentStatus} />
      </Card>

      {/* Order Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card padded space-y-4>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              Consignment & Price Summary
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] block">Material Seller</span>
                <span className="font-bold text-slate-900">{activeTx.sellerCompany}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Agreed Price</span>
                <span className="font-bold text-emerald-700">₹{activeTx.agreedPrice} / {activeTx.unit}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Order Volume</span>
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
                  Origin Warehouse (Seller):
                </span>
                <p className="text-slate-600 leading-relaxed">{activeTx.pickupAddress}</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block mb-1 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  Your Delivery Warehouse:
                </span>
                <p className="text-slate-600 leading-relaxed">{activeTx.deliveryAddress}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <Card padded space-y-3 className="bg-slate-900 text-white border-slate-800">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Freight Dispatcher
            </h3>
            <span className="font-bold text-sm text-emerald-400 block">{activeTx.logisticsPartner}</span>

            {activeTx.vehicleNumber && (
              <div className="bg-slate-800/90 p-3 rounded-xl text-xs space-y-1">
                <span className="text-[10px] font-bold text-slate-400 block">CONTAINER & DRIVER</span>
                <p className="font-semibold">{activeTx.vehicleNumber}</p>
                <p className="text-[11px] text-slate-300 flex items-center gap-1">
                  <PhoneCall className="w-3.5 h-3.5 text-emerald-400" />
                  {activeTx.driverContact}
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
