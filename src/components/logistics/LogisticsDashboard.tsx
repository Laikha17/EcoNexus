import React, { useState, useEffect } from 'react';
import { useEcoNexus } from '../../context/EcoNexusContext';
import { Transaction } from '../../types';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Stepper } from '../common/Stepper';
import { EmptyState } from '../common/EmptyState';
import { StatusUpdaterModal } from './StatusUpdaterModal';
import { 
  Truck, 
  MapPin, 
  Building2, 
  Clock, 
  CheckCircle2, 
  Package, 
  SlidersHorizontal,
  RefreshCw
} from 'lucide-react';
import { clsx } from 'clsx';

interface LogisticsDashboardProps {
  defaultTab?: string;
}

export const LogisticsDashboard: React.FC<LogisticsDashboardProps> = ({ defaultTab = 'all' }) => {
  const { getLogisticsShipments, currentUser, resetDemoData } = useEcoNexus();
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [filterTab, setFilterTab] = useState<string>(defaultTab);

  useEffect(() => {
    if (defaultTab) {
      setFilterTab(defaultTab);
    }
  }, [defaultTab]);

  if (!currentUser) return null;

  const logisticsShipments = getLogisticsShipments();

  const assignedPickups = logisticsShipments.filter(t => t.currentStatus === 'confirmed' || t.currentStatus === 'pickup_scheduled');
  const activeDeliveries = logisticsShipments.filter(t => t.currentStatus === 'picked_up' || t.currentStatus === 'in_transit');
  const completedDeliveries = logisticsShipments.filter(t => t.currentStatus === 'delivered' || t.currentStatus === 'completed');

  const filteredTransactions = logisticsShipments.filter(t => {
    if (filterTab === 'assigned') return t.currentStatus === 'confirmed' || t.currentStatus === 'pickup_scheduled';
    if (filterTab === 'active') return t.currentStatus === 'picked_up' || t.currentStatus === 'in_transit';
    if (filterTab === 'completed') return t.currentStatus === 'delivered' || t.currentStatus === 'completed';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-2xl p-6 text-white shadow-card border border-emerald-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs mb-1">
            <Truck className="w-4 h-4" />
            <span>Industrial Freight Logistics Operations Portal</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {currentUser.company}
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Dispatch, pickup, and heavy container transport tracking for EcoNexus industrial circular trade.
          </p>
        </div>

        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => resetDemoData()}
          className="text-white border-emerald-700/60 hover:bg-emerald-900/50 shrink-0"
          icon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Sync Firestore Data
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card 
          padded 
          onClick={() => setFilterTab('assigned')}
          className="border-l-4 border-l-emerald-600 cursor-pointer hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Assigned Pickups</span>
            <div className="p-2 bg-emerald-50 text-emerald-800 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{assignedPickups.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">Pending pickup dispatch at seller yard</p>
        </Card>

        <Card 
          padded 
          onClick={() => setFilterTab('active')}
          className="border-l-4 border-l-amber-500 cursor-pointer hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Deliveries</span>
            <div className="p-2 bg-amber-50 text-amber-700 rounded-lg">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{activeDeliveries.length}</p>
          <p className="text-[11px] text-amber-600 font-semibold mt-1">Currently in transit on highway</p>
        </Card>

        <Card 
          padded 
          onClick={() => setFilterTab('completed')}
          className="border-l-4 border-l-emerald-500 cursor-pointer hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed Deliveries</span>
            <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{completedDeliveries.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">Weighbridge slip signed</p>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        {[
          { id: 'all', label: `All Shipments (${logisticsShipments.length})` },
          { id: 'assigned', label: `Assigned Pickups (${assignedPickups.length})` },
          { id: 'active', label: `Active Deliveries (${activeDeliveries.length})` },
          { id: 'completed', label: `Completed Deliveries (${completedDeliveries.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterTab(tab.id)}
            className={clsx(
              'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0',
              filterTab === tab.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Delivery Cards Grid or Empty State */}
      {filteredTransactions.length === 0 ? (
        <EmptyState
          icon={<Truck className="w-12 h-12 text-slate-300" />}
          title="No Logistics Shipments Found"
          description="There are currently no active or assigned shipments matching this operational filter in Cloud Firestore."
        />
      ) : (
        <div className="space-y-6">
          {filteredTransactions.map((tx) => (
            <Card key={tx.id} padded space-y-4 className="hover:border-slate-300 transition-all">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-slate-900 text-emerald-400 rounded-xl">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-400 uppercase font-mono">#{tx.id.toUpperCase()}</span>
                      <Badge variant="category">{tx.category}</Badge>
                    </div>
                    <h3 className="font-bold text-base text-slate-900">{tx.listingTitle}</h3>
                  </div>
                </div>

                {/* Status Update Button */}
                <div className="flex items-center gap-2">
                  <Badge variant="info" size="md">
                    {tx.currentStatus.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => {
                      setSelectedTx(tx);
                      setShowStatusModal(true);
                    }}
                    icon={<SlidersHorizontal className="w-3.5 h-3.5" />}
                  >
                    Update Status Actions
                  </Button>
                </div>
              </div>

              {/* Logistics Stepper Bar */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                <Stepper timeline={tx.timeline} currentStatus={tx.currentStatus} />
              </div>

              {/* Details Grid (Pickup, Delivery, Material, Quantity, Seller, Buyer) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                    SELLER & PICKUP LOCATION
                  </span>
                  <p className="font-bold text-slate-900">{tx.sellerCompany}</p>
                  <p className="text-slate-600 mt-1 flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{tx.pickupAddress}</span>
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                    BUYER & DELIVERY DESTINATION
                  </span>
                  <p className="font-bold text-slate-900">{tx.buyerCompany}</p>
                  <p className="text-slate-600 mt-1 flex items-start gap-1">
                    <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{tx.deliveryAddress}</span>
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                      MATERIAL & WEIGHT VOLUME
                    </span>
                    <p className="font-bold text-slate-900 text-sm">{tx.quantity} {tx.unit}</p>
                    <p className="text-emerald-700 font-semibold mt-0.5">₹{tx.agreedPrice}/{tx.unit} • Total: ₹{tx.totalAmount.toLocaleString()}</p>
                  </div>

                  {tx.vehicleNumber && (
                    <span className="text-[11px] font-medium text-slate-500 mt-2 block">
                      Driver: {tx.driverContact}
                    </span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Status Modal */}
      {showStatusModal && selectedTx && (
        <StatusUpdaterModal
          isOpen={showStatusModal}
          onClose={() => setShowStatusModal(false)}
          transaction={selectedTx}
        />
      )}
    </div>
  );
};
