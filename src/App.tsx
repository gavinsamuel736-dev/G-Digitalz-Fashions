import React from 'react';
import { ShopProvider, useShop } from './context/ShopContext';
import { AdminProvider, useAdmin } from './context/AdminContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { WhatsAppFloatingButton } from './components/WhatsAppFloatingButton';
import { SizeGuideModal } from './components/SizeGuideModal';
import { ReviewModal } from './components/ReviewModal';

import { HomeView } from './views/HomeView';
import { CatalogueView } from './views/CatalogueView';
import { ProductView } from './views/ProductView';
import { CartView } from './views/CartView';
import { CheckoutView } from './views/CheckoutView';
import { ReviewsView } from './views/ReviewsView';

import { AdminLogin } from './views/admin/AdminLogin';
import { AdminLayout } from './views/admin/AdminLayout';
import { Check } from 'lucide-react';

const StorefrontApp: React.FC = () => {
  const { currentView, notificationMessage, appearance } = useShop();
  const { isAuthenticated, isLoading } = useAdmin();

  // If viewing admin route
  if (currentView === 'admin') {
    if (isLoading) {
      return (
        <div className="min-h-screen bg-[#141210] flex items-center justify-center text-xs text-[#C5A880]">
          Verifying security credentials...
        </div>
      );
    }
    return isAuthenticated ? <AdminLayout /> : <AdminLogin />;
  }

  return (
    <div
      className="min-h-screen flex flex-col font-body selection:bg-[#C5A880]/30 selection:text-[#1A1816] transition-colors duration-200"
      style={{
        backgroundColor: appearance?.backgroundColor || '#FAF8F5',
        color: appearance?.primaryColor || '#1A1816',
      }}
    >
      {/* Toast Notification banner */}
      {notificationMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-[#1A1816] text-[#FAF8F5] px-5 py-3 rounded-full shadow-2xl text-xs font-medium flex items-center gap-2 border border-[#403B33] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="w-4 h-4 rounded-full bg-[#8E6C3B] text-white flex items-center justify-center shrink-0">
            <Check className="w-2.5 h-2.5 stroke-[3]" />
          </div>
          <span>{notificationMessage}</span>
        </div>
      )}

      {/* Header conforming to Top Bar Contract */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentView === 'home' && <HomeView />}
        {currentView === 'catalogue' && <CatalogueView />}
        {currentView === 'product' && <ProductView />}
        {currentView === 'cart' && <CartView />}
        {currentView === 'checkout' && <CheckoutView />}
        {currentView === 'reviews' && <ReviewsView />}
      </main>

      {/* Modals & Overlays */}
      <CartDrawer />
      <SizeGuideModal />
      <ReviewModal />
      <WhatsAppFloatingButton />

      {/* Luxury Footer */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <ShopProvider>
      <AdminProvider>
        <StorefrontApp />
      </AdminProvider>
    </ShopProvider>
  );
}
