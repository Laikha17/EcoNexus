import React, { useState } from 'react';
import { useEcoNexus } from '../../context/EcoNexusContext';
import { UserRole, RoleType } from '../../types';
import { 
  Recycle, 
  Bell, 
  User as UserIcon, 
  LogOut, 
  Check, 
  Sparkles, 
  ChevronDown, 
  Menu, 
  X,
  Lock,
  ArrowRightLeft,
  Factory,
  ShoppingBag,
  Truck,
  Shield
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { clsx } from 'clsx';

interface NavbarProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
  onGoToLogin?: () => void;
  onGoToSignup?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onToggleSidebar, 
  isSidebarOpen,
  onGoToLogin,
  onGoToSignup
}) => {
  const { 
    isAuthenticated, 
    currentRole, 
    activeWorkspaceMode,
    setActiveWorkspaceMode,
    currentUser, 
    notifications, 
    markNotificationRead, 
    logout,
    setActivePage 
  } = useEcoNexus();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const roleNotifications = notifications.filter(
    n => n.targetRole === currentRole || n.targetRole === 'admin'
  );
  const unreadCount = roleNotifications.filter(n => !n.read).length;

  const roleBadgeText: Record<string, string> = {
    seller: 'Waste Generator / Seller',
    buyer: 'Resource Buyer',
    logistics: 'Logistics Operations',
    admin: 'Platform Operations Portal',
    guest: 'Public User'
  };

  const getCompositeBadge = (): string => {
    if (!currentUser || !currentUser.roles) return roleBadgeText[currentRole] || 'Public User';
    if (currentUser.roles.includes('ADMIN')) return 'Platform Operations Portal';
    return currentUser.roles.map(r => r === 'SELLER' ? 'Seller' : r === 'BUYER' ? 'Buyer' : 'Logistics').join(' & ');
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand Logo & Sidebar Toggle */}
          <div className="flex items-center gap-6">
            {isAuthenticated && (
              <button
                onClick={onToggleSidebar}
                className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              >
                {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            )}

            <div 
              onClick={() => {
                if (!isAuthenticated) setActivePage('landing');
                else setActivePage('dashboard');
              }} 
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <img 
                src="/econexus-logo.jpg" 
                alt="EcoNexus Logo" 
                className="w-9 h-9 rounded-xl object-cover ring-1 ring-emerald-500/20 shadow-xs group-hover:scale-105 transition-transform" 
              />
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-slate-900">Eco<span className="text-emerald-600">Nexus</span></span>
              </div>
            </div>

            {/* Public Navigation Links (Unauthenticated) */}
            {!isAuthenticated && (
              <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-600">
                <button onClick={() => setActivePage('landing')} className="hover:text-emerald-600 transition-colors">
                  Home
                </button>
                <a href="#how-it-works" className="hover:text-emerald-600 transition-colors">
                  How It Works
                </a>
                <a href="#industries" className="hover:text-emerald-600 transition-colors">
                  Industries
                </a>
                <a href="#about" className="hover:text-emerald-600 transition-colors">
                  About
                </a>
              </nav>
            )}

            {/* Authenticated Workspace Composite Badge & Mode Switcher */}
            {isAuthenticated && currentUser && (
              <div className="hidden md:flex items-center gap-3">
                <Badge variant="verified">
                  {getCompositeBadge()}
                </Badge>

                {/* Workspace Mode Switcher for Multi-Role Accounts */}
                {currentUser.roles && currentUser.roles.length > 1 && !currentUser.roles.includes('ADMIN') && (
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                    {currentUser.roles.includes('SELLER') && (
                      <button
                        onClick={() => {
                          setActiveWorkspaceMode('seller');
                          setActivePage('dashboard');
                        }}
                        className={clsx(
                          'px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1.5 transition-all',
                          activeWorkspaceMode === 'seller'
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        )}
                      >
                        <Factory className="w-3 h-3" />
                        Seller Mode
                      </button>
                    )}

                    {currentUser.roles.includes('BUYER') && (
                      <button
                        onClick={() => {
                          setActiveWorkspaceMode('buyer');
                          setActivePage('dashboard');
                        }}
                        className={clsx(
                          'px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1.5 transition-all',
                          activeWorkspaceMode === 'buyer'
                            ? 'bg-emerald-700 text-white shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        )}
                      >
                        <ShoppingBag className="w-3 h-3" />
                        Buyer Mode
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Actions: Public CTAs or Authenticated Workspace User Profile */}
          <div className="flex items-center gap-3">
            {!isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onGoToLogin} 
                  icon={<Lock className="w-3.5 h-3.5" />}
                >
                  Sign In
                </Button>
                <Button 
                  variant="primary" 
                  size="sm" 
                  onClick={onGoToSignup}
                >
                  Create Business Account
                </Button>
              </div>
            ) : currentUser ? (
              <>
                {/* Notification Bell */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none"
                    title="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-emerald-600 text-white font-bold text-[10px] rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Drawer */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-modal border border-slate-200 py-2 z-50 animate-fadeIn">
                      <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-slate-900">Notifications</h4>
                          {unreadCount > 0 && (
                            <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => roleNotifications.forEach(n => markNotificationRead(n.id))}
                          className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                        >
                          Mark all read
                        </button>
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                        {roleNotifications.length === 0 ? (
                          <div className="p-6 text-center text-xs text-slate-400">
                            No notifications.
                          </div>
                        ) : (
                          roleNotifications.map((notif) => (
                            <div
                              key={notif.id}
                              onClick={() => {
                                markNotificationRead(notif.id);
                                if (notif.actionPath) setActivePage(notif.actionPath);
                                setShowNotifications(false);
                              }}
                              className={clsx(
                                'p-3.5 hover:bg-slate-50 cursor-pointer transition-colors flex items-start gap-3',
                                !notif.read && 'bg-emerald-50/40'
                              )}
                            >
                              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 shrink-0 mt-0.5">
                                <Sparkles className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-slate-900 leading-tight">
                                  {notif.title}
                                </p>
                                <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                                  {notif.message}
                                </p>
                                <span className="text-[10px] text-slate-400 mt-1.5 block">
                                  {notif.time}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Authenticated Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none border border-slate-200"
                  >
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                    />
                    <div className="hidden sm:block text-left">
                      <span className="block text-xs font-semibold text-slate-900 leading-tight">
                        {currentUser.company}
                      </span>
                      <span className="block text-[10px] text-slate-500 font-medium">
                        {currentUser.roles ? currentUser.roles.join(', ') : currentUser.role.toUpperCase()}
                      </span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>

                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-modal border border-slate-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-xs font-semibold text-slate-900">{currentUser.company}</p>
                        <p className="text-xs text-slate-500">{currentUser.email}</p>
                        <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <Check className="w-3 h-3 text-emerald-600" />
                          VERIFIED BUSINESS ENTITY
                        </div>
                      </div>

                      <div className="py-1">
                        <button
                          onClick={() => {
                            setActivePage('profile');
                            setShowProfileMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <UserIcon className="w-4 h-4 text-slate-400" />
                          Company Profile
                        </button>
                      </div>

                      <div className="border-t border-slate-100 pt-1">
                        <button
                          onClick={() => {
                            logout();
                            setShowProfileMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-semibold"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
};
