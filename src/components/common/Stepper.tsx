import React from 'react';
import { StatusTimelineStep, LogisticsStatus } from '../../types';
import { Check, Clock, Truck, Package, ShieldCheck, MapPin, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

interface StepperProps {
  timeline: StatusTimelineStep[];
  currentStatus: LogisticsStatus;
  onStepClick?: (stepKey: LogisticsStatus) => void;
}

export const Stepper: React.FC<StepperProps> = ({ timeline, currentStatus, onStepClick }) => {
  const getIcon = (stepKey: LogisticsStatus, isCompleted: boolean, isCurrent: boolean) => {
    if (isCompleted && !isCurrent) return <Check className="w-4 h-4 text-white" />;
    switch (stepKey) {
      case 'confirmed':
        return <ShieldCheck className="w-4 h-4" />;
      case 'pickup_scheduled':
        return <Clock className="w-4 h-4" />;
      case 'picked_up':
        return <Package className="w-4 h-4" />;
      case 'in_transit':
        return <Truck className="w-4 h-4" />;
      case 'delivered':
        return <MapPin className="w-4 h-4" />;
      case 'completed':
        return <Check className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-full py-4">
      {/* Desktop Horizontal Stepper */}
      <div className="hidden md:flex items-center justify-between relative">
        {/* Background line */}
        <div className="absolute top-5 left-8 right-8 h-1 bg-slate-200 -z-0" />

        {timeline.map((step, idx) => {
          const isCompleted = step.completed;
          const isCurrent = step.current;

          return (
            <div
              key={step.stepKey}
              onClick={() => onStepClick && onStepClick(step.stepKey)}
              className={clsx(
                'relative z-10 flex flex-col items-center group text-center max-w-[120px]',
                onStepClick && 'cursor-pointer'
              )}
            >
              {/* Step Circle */}
              <div
                className={clsx(
                  'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-200 border-2',
                  isCompleted && !isCurrent && 'bg-emerald-600 border-emerald-600 text-white shadow-xs',
                  isCurrent && 'bg-white border-emerald-600 text-emerald-600 ring-4 ring-emerald-100 shadow-md',
                  !isCompleted && !isCurrent && 'bg-white border-slate-300 text-slate-400'
                )}
              >
                {getIcon(step.stepKey, isCompleted, isCurrent)}
              </div>

              {/* Title & Timestamp */}
              <div className="mt-2.5">
                <span
                  className={clsx(
                    'block text-xs font-semibold',
                    isCurrent && 'text-emerald-700 font-bold',
                    isCompleted && !isCurrent && 'text-slate-800',
                    !isCompleted && !isCurrent && 'text-slate-400'
                  )}
                >
                  {step.title}
                </span>
                {step.timestamp && (
                  <span className="block text-[10px] text-slate-400 mt-0.5 font-normal">
                    {step.timestamp}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile Vertical Stepper */}
      <div className="md:hidden space-y-4 relative pl-6 border-l-2 border-slate-200 ml-3">
        {timeline.map((step) => {
          const isCompleted = step.completed;
          const isCurrent = step.current;

          return (
            <div
              key={step.stepKey}
              onClick={() => onStepClick && onStepClick(step.stepKey)}
              className="relative group"
            >
              {/* Circle Marker */}
              <div
                className={clsx(
                  'absolute -left-[31px] top-0 w-6 h-6 rounded-full flex items-center justify-center border-2',
                  isCompleted && !isCurrent && 'bg-emerald-600 border-emerald-600 text-white',
                  isCurrent && 'bg-white border-emerald-600 text-emerald-600 ring-2 ring-emerald-100',
                  !isCompleted && !isCurrent && 'bg-white border-slate-300 text-slate-400'
                )}
              >
                {isCompleted && !isCurrent ? (
                  <Check className="w-3 h-3 text-white" />
                ) : (
                  <div className={clsx('w-2 h-2 rounded-full', isCurrent ? 'bg-emerald-600' : 'bg-slate-300')} />
                )}
              </div>

              <div className="pl-2">
                <span
                  className={clsx(
                    'text-sm font-semibold block',
                    isCurrent && 'text-emerald-700',
                    isCompleted && !isCurrent && 'text-slate-800',
                    !isCompleted && !isCurrent && 'text-slate-400'
                  )}
                >
                  {step.title}
                </span>
                <p className="text-xs text-slate-500 mt-0.5">{step.description}</p>
                {step.timestamp && (
                  <span className="text-[11px] text-emerald-600 font-medium block mt-1">
                    {step.timestamp}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
