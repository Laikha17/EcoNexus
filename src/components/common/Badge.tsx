import React from 'react';
import { clsx } from 'clsx';
import { Sparkles, CheckCircle2, AlertCircle, Clock, Truck, ShieldCheck } from 'lucide-react';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'match' | 'status' | 'category' | 'info' | 'success' | 'warning' | 'danger' | 'verified';
  size?: 'sm' | 'md' | 'lg';
  percentage?: number;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'info',
  size = 'md',
  percentage,
  className
}) => {
  // If variant is 'match' and percentage is provided
  if (variant === 'match' && typeof percentage === 'number') {
    const isHigh = percentage >= 85;
    const isMedium = percentage >= 70 && percentage < 85;

    return (
      <span
        className={clsx(
          'inline-flex items-center gap-1 font-semibold rounded-full border shadow-2xs',
          size === 'sm' && 'text-xs px-2 py-0.5',
          size === 'md' && 'text-xs px-2.5 py-1',
          size === 'lg' && 'text-sm px-3 py-1.5',
          isHigh && 'bg-emerald-50 text-emerald-700 border-emerald-300/80',
          isMedium && 'bg-amber-50 text-amber-800 border-amber-300',
          !isHigh && !isMedium && 'bg-slate-100 text-slate-700 border-slate-300',
          className
        )}
      >
        <Sparkles className={clsx(
          'shrink-0',
          size === 'sm' && 'w-3 h-3',
          size === 'md' && 'w-3.5 h-3.5',
          size === 'lg' && 'w-4 h-4',
          isHigh ? 'text-emerald-600' : 'text-amber-600'
        )} />
        <span>{percentage}% Match</span>
      </span>
    );
  }

  const base = 'inline-flex items-center gap-1 font-medium rounded-full border';
  
  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5'
  };

  const variantStyles = {
    match: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    status: 'bg-slate-100 text-slate-700 border-slate-200',
    category: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    info: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    verified: 'bg-teal-50 text-teal-700 border-teal-200'
  };

  return (
    <span className={clsx(base, sizeStyles[size], variantStyles[variant], className)}>
      {variant === 'verified' && <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />}
      {children}
    </span>
  );
};
