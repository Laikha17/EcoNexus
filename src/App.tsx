import React, { useState } from 'react';
import { EcoNexusProvider, useEcoNexus } from './context/EcoNexusContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { ToastContainer } from './components/common/ToastContainer';
import { DemoModeDrawer } from './components/layout/DemoModeDrawer';

// Public Pages
import { LandingPage } from './components/global/LandingPage';
import { LoginPage } from './components/global/LoginPage';
import { SignupPage } from './components/global/SignupPage';

// Workspace Pages
import { SellerDashboard } from './components/seller/SellerDashboard';
import { CreateListingWizard } from './components/seller/CreateListingWizard';
import { SellerListings } from './components/seller/SellerListings';
import { ListingDetails } from './components/seller/ListingDetails';
import { SellerTransactionView } from './components/seller/SellerTransactionView';

import { BuyerDashboard } from './components/buyer/BuyerDashboard';
import { DiscoverMarketplace } from './components/buyer/DiscoverMarketplace';
import { BuyerListingDetails } from './components/buyer/BuyerListingDetails';
import { MyBids } from './components/buyer/MyBids';
import { BuyerTransactionView } from './components/buyer/BuyerTransactionView';
import { BuyerProfile } from './components/buyer/BuyerProfile';

import { LogisticsDashboard } from './components/logistics/LogisticsDashboard';

import { AdminDashboard } from './components/admin/AdminDashboard';
import { UserManagement } from './components/admin/UserManagement';
import { ListingModeration } from './components/admin/ListingModeration';
import { TransactionOverview } from './components/admin/TransactionOverview';

const AppContent: React.FC = () => {
  const { isAuthenticated, currentRole, activePage, setActivePage } = useEcoNexus();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Unauthenticated Public Experience
  if (!isAuthenticated) {
    if (activePage === 'login') {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
          <Navbar onGoToLogin={() => setActivePage('login')} onGoToSignup={() => setActivePage('signup')} />
          <LoginPage onGoToSignup={() => setActivePage('signup')} onGoToLanding={() => setActivePage('landing')} />
          <ToastContainer />
          <DemoModeDrawer />
        </div>
      );
    }

    if (activePage === 'signup') {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
          <Navbar onGoToLogin={() => setActivePage('login')} onGoToSignup={() => setActivePage('signup')} />
          <SignupPage onGoToLogin={() => setActivePage('login')} onGoToLanding={() => setActivePage('landing')} />
          <ToastContainer />
          <DemoModeDrawer />
        </div>
      );
    }

    // Default Public Landing Page
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar onGoToLogin={() => setActivePage('login')} onGoToSignup={() => setActivePage('signup')} />
        <LandingPage onGoToLogin={() => setActivePage('login')} onGoToSignup={() => setActivePage('signup')} />
        <ToastContainer />
        <DemoModeDrawer />
      </div>
    );
  }

  // Authenticated Role Workspaces
  const renderWorkspacePage = () => {
    // SELLER WORKSPACE ("Waste Generator / Seller")
    if (currentRole === 'seller') {
      switch (activePage) {
        case 'create-listing':
          return <CreateListingWizard />;
        case 'my-listings':
          return <SellerListings />;
        case 'listing-details':
        case 'bids-received':
          return <ListingDetails />;
        case 'transactions':
          return <SellerTransactionView />;
        case 'profile':
          return <BuyerProfile />;
        case 'dashboard':
        default:
          return <SellerDashboard />;
      }
    }

    // BUYER WORKSPACE ("Resource Buyer")
    if (currentRole === 'buyer') {
      switch (activePage) {
        case 'discover':
          return <DiscoverMarketplace />;
        case 'buyer-listing-details':
          return <BuyerListingDetails />;
        case 'my-bids':
          return <MyBids />;
        case 'transactions':
          return <BuyerTransactionView />;
        case 'profile':
          return <BuyerProfile />;
        case 'dashboard':
        default:
          return <BuyerDashboard />;
      }
    }

    // LOGISTICS WORKSPACE ("Logistics Operations")
    if (currentRole === 'logistics') {
      switch (activePage) {
        case 'profile':
          return <BuyerProfile />;
        case 'assigned':
          return <LogisticsDashboard defaultTab="assigned" />;
        case 'active':
          return <LogisticsDashboard defaultTab="active" />;
        case 'completed':
          return <LogisticsDashboard defaultTab="completed" />;
        case 'dashboard':
        default:
          return <LogisticsDashboard defaultTab="all" />;
      }
    }

    // ADMIN WORKSPACE ("Platform Operations Portal")
    if (currentRole === 'admin') {
      switch (activePage) {
        case 'users':
          return <UserManagement />;
        case 'listings':
          return <ListingModeration />;
        case 'transactions':
          return <TransactionOverview />;
        case 'dashboard':
        default:
          return <AdminDashboard />;
      }
    }

    return <SellerDashboard />;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* SaaS Product Workspace Navbar */}
      <Navbar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="flex-1 flex w-full max-w-7xl mx-auto">
        {/* Role-Specific Workspace Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Workspace Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-hidden">
          {renderWorkspacePage()}
        </main>
      </div>

      {/* Global Toast Engine */}
      <ToastContainer />

      {/* Compact Floating Demo Control Widget */}
      <DemoModeDrawer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <EcoNexusProvider>
      <AppContent />
    </EcoNexusProvider>
  );
};

export default App;
