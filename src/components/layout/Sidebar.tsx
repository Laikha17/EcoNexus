import React from 'react';
import { useEcoNexus } from '../../context/EcoNexusContext';
import { 
  LayoutDashboard, 
  PlusCircle, 
  ListFilter, 
  Gavel, 
  Truck, 
  Search, 
  ShoppingBag, 
  Users, 
  ShieldCheck, 
  FileText, 
  User, 
  TrendingUp,
  Package,
  Activity,
  BarChart2,
  Settings,
  Clock
} from 'lucide-react';
import { clsx } from 'clsx';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  highlight?: boolean;
  badge?: string | number;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { currentRole, activePage, setActivePage, bids, listings, transactions } = useEcoNexus();

  const pendingBidsCount = bids.filter(b => b.status === 'pending').length;
  const activeListingsCount = listings.filter(l => l.status === 'active' || l.status === 'bidding').length;

  const sellerNav: NavItem[] = [
    { id: 'dashboard', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'my-listings', label: 'My Listings', icon: <ListFilter className="w-4 h-4" />, badge: activeListingsCount },
    { id: 'create-listing', label: 'List Waste', icon: <PlusCircle className="w-4 h-4 text-emerald-600" />, highlight: true },
    { id: 'bids-received', label: 'Bids Received', icon: <Gavel className="w-4 h-4" />, badge: pendingBidsCount > 0 ? `${pendingBidsCount} New` : undefined },
    { id: 'transactions', label: 'Sales & Logistics', icon: <Truck className="w-4 h-4" /> },
    { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
  ];

  const buyerNav: NavItem[] = [
    { id: 'dashboard', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'discover', label: 'Discover Materials', icon: <Search className="w-4 h-4 text-emerald-600" />, highlight: true },
    { id: 'my-bids', label: 'My Bids', icon: <Gavel className="w-4 h-4" /> },
    { id: 'transactions', label: 'My Purchases', icon: <ShoppingBag className="w-4 h-4" /> },
    { id: 'transactions', label: 'Delivery Tracking', icon: <Truck className="w-4 h-4" /> },
    { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
  ];

  const logisticsNav: NavItem[] = [
    { id: 'dashboard', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'assigned', label: 'Assigned Deliveries', icon: <Clock className="w-4 h-4 text-emerald-600" /> },
    { id: 'active', label: 'Active Shipments', icon: <Truck className="w-4 h-4 text-emerald-600" />, highlight: true },
    { id: 'completed', label: 'Completed Deliveries', icon: <Package className="w-4 h-4" /> },
    { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
  ];

  const adminNav: NavItem[] = [
    { id: 'dashboard', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'users', label: 'Users', icon: <Users className="w-4 h-4" /> },
    { id: 'listings', label: 'Listings', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'transactions', label: 'Transactions', icon: <FileText className="w-4 h-4" /> },
    { id: 'transactions', label: 'Platform Activity', icon: <Activity className="w-4 h-4" /> },
    { id: 'dashboard', label: 'Reports', icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'profile', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const navMap = {
    seller: sellerNav,
    buyer: buyerNav,
    logistics: logisticsNav,
    admin: adminNav,
    guest: []
  };

  const currentNav = navMap[currentRole] || [];

  if (currentRole === 'guest') return null;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={clsx(
          'fixed lg:sticky top-[65px] left-0 z-20 h-[calc(100vh-65px)] w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 ease-in-out shrink-0 overflow-y-auto',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="p-4 flex-1 space-y-6">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
              Workspace Menu
            </p>
            <nav className="space-y-1">
              {currentNav.map((item, idx) => {
                const isActive = activePage === item.id;
                return (
                  <button
                    key={`${item.id}-${idx}`}
                    onClick={() => {
                      setActivePage(item.id);
                      onClose();
                    }}
                    className={clsx(
                      'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150',
                      isActive
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-2xs font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50',
                      item.highlight && !isActive && 'text-emerald-700 bg-emerald-50/50'
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-[11px] text-slate-400 text-center">
          EcoNexus Workspace • B2B Platform
        </div>
      </aside>
    </>
  );
};
