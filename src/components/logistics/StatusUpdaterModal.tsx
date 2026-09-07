import React from 'react';
import { useEcoNexus } from '../../context/EcoNexusContext';
import { Transaction, LogisticsStatus } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Truck, CheckCircle2, Clock, Package, MapPin } from 'lucide-react';

interface StatusUpdaterModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction;
}

export const StatusUpdaterModal: React.FC<StatusUpdaterModalProps> = ({
  isOpen,
  onClose,
  transaction
}) => {
  const { updateLogisticsStatus } = useEcoNexus();

  const handleUpdate = (nextStatus: LogisticsStatus) => {
    updateLogisticsStatus(transaction.id, nextStatus);
    onClose();
  };

  const statusActions: { status: LogisticsStatus; label: string; desc: string; icon: React.ReactNode }[] = [
    {
      status: 'pickup_scheduled',
      label: 'Accept Pickup & Assign Vehicle',
      desc: 'Confirm vehicle dispatch and schedule pickup window at seller yard.',
      icon: <Clock className="w-4 h-4 text-emerald-600" />
    },
    {
      status: 'picked_up',
      label: 'Mark Picked Up',
      desc: 'Material verified, weighed, and loaded onto container truck.',
      icon: <Package className="w-4 h-4 text-emerald-600" />
    },
    {
      status: 'in_transit',
      label: 'Mark In Transit',
      desc: 'Vehicle dispatched on highway towards buyer destination facility.',
      icon: <Truck className="w-4 h-4 text-emerald-600" />
    },
    {
      status: 'delivered',
      label: 'Mark Delivered',
      desc: 'Consignment safely handed over at buyer warehouse & weighbridge slip signed.',
      icon: <MapPin className="w-4 h-4 text-teal-600" />
    },
    {
      status: 'completed',
      label: 'Mark Fully Completed',
      desc: 'All documentation verified, trigger seller payment release.',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />
    }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Shipment Status"
      subtitle={`Consignment #${transaction.id.toUpperCase()} • ${transaction.listingTitle}`}
      maxWidth="md"
    >
      <div className="space-y-3">
        <p className="text-xs text-slate-500">
          Select the next operational step for Apex Freight dispatch tracking:
        </p>

        <div className="space-y-2">
          {statusActions.map((action) => {
            const isCurrent = transaction.currentStatus === action.status;
            return (
              <div
                key={action.status}
                onClick={() => handleUpdate(action.status)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                  isCurrent
                    ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20'
                    : 'bg-white border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                }`}
              >
                <div className="p-2 bg-white rounded-lg border border-slate-200 shrink-0 mt-0.5">
                  {action.icon}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{action.label}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{action.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};
