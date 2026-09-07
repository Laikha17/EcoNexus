import React from 'react';
import { useEcoNexus } from '../../context/EcoNexusContext';
import { UserRole } from '../../types';
import { RefreshCw, Shield, Truck, ShoppingBag, Factory, Globe } from 'lucide-react';
import { clsx } from 'clsx';

export const RoleSwitcherBar: React.FC = () => {
  const { currentRole, switchDemoAccount, resetDemoData, isAuthenticated, currentUser } = useEcoNexus();

  const demoAccounts: { role: UserRole; label: string; name: string; icon: React.ReactNode; color: string }[] = [
    {
      role: 'seller',
      label: 'Seller Account',
      name: 'Ramesh Textiles',
      icon: <Factory className="w-3.5 h-3.5" />,
      color: 'bg-emerald-500'
    },
    {
      role: 'buyer',
      label: 'Buyer Account',
      name: 'Comfort Cushion',
      icon: <ShoppingBag className="w-3.5 h-3.5" />,
      color: 'bg-emerald-600'
    },
    {
      role: 'logistics',
      label: 'Logistics Account',
      name: 'Apex Freight',
      icon: <Truck className="w-3.5 h-3.5" />,
      color: 'bg-emerald-600'
    },
    {
      role: 'admin',
      label: 'Admin Account',
      name: 'EcoNexus Ops',
      icon: <Shield className="w-3.5 h-3.5" />,
      color: 'bg-amber-500'
    },
    {
      role: 'guest',
      label: 'Public Visitor View',
      name: 'Unauthenticated Public',
      icon: <Globe className="w-3.5 h-3.5" />,
      color: 'bg-slate-500'
    }
  ];

  return (
    <div className="bg-slate-900 text-white text-xs py-2 px-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-40 shadow-xs">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-md border border-amber-800/50">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          INTERACTIVE PROTOTYPE DEMO — Switch Demo Account
        </span>
        <span className="hidden md:inline text-slate-400 text-[11px]">
          ({isAuthenticated && currentUser ? `Active Account: ${currentUser.company}` : 'Public Landing Page'})
        </span>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
        {demoAccounts.map((acc) => {
          const isActive = currentRole === acc.role;
          return (
            <button
              key={acc.role}
              onClick={() => switchDemoAccount(acc.role)}
              className={clsx(
                'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all shrink-0',
                isActive
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              )}
              title={`Switch demo session to ${acc.name}`}
            >
              <span className={clsx('w-2 h-2 rounded-full', acc.color)} />
              {acc.icon}
              <span>{acc.name}</span>
            </button>
          );
        })}

        <div className="h-4 w-px bg-slate-800 mx-1 hidden sm:block" />

        <button
          onClick={resetDemoData}
          className="inline-flex items-center gap-1 text-slate-400 hover:text-white px-2 py-1 rounded-md hover:bg-slate-800 transition-colors shrink-0"
          title="Reset demo data state"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Reset Demo State</span>
        </button>
      </div>
    </div>
  );
};
