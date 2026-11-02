import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Sparkles,
  Palette,
  Globe,
  Truck,
  CreditCard,
  Star,
  Users,
  ShieldAlert,
  LogOut,
  ExternalLink,
  Menu,
  X,
  CheckCircle,
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { useShop } from '../../context/ShopContext';

import { AdminOverview } from './AdminOverview';
import { AdminProducts } from './AdminProducts';
import { AdminCategories } from './AdminCategories';
import { AdminOrders } from './AdminOrders';
import { AdminHomepageEditor } from './AdminHomepageEditor';
import { AdminAppearance } from './AdminAppearance';
import { AdminBranding } from './AdminBranding';
import { AdminShipping } from './AdminShipping';
import { AdminPayments } from './AdminPayments';
import { AdminReviews } from './AdminReviews';
import { AdminUsers } from './AdminUsers';
import { AdminAuditLogs } from './AdminAuditLogs';

export const AdminLayout: React.FC = () => {
  const { adminUser, logout, adminActiveTab, setAdminActiveTab, adminAlert } = useAdmin();
  const { setCurrentView, branding } = useShop();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'products', label: 'Products & Inventory', icon: Package },
    { id: 'categories', label: 'Wardrobe Categories', icon: Layers },
    { id: 'orders', label: 'Orders & Fulfillment', icon: ShoppingBag },
    { id: 'homepage', label: 'Homepage Customizer', icon: Sparkles },
    { id: 'appearance', label: 'Website Appearance', icon: Palette },
    { id: 'branding', label: 'Store Branding & Info', icon: Globe },
    { id: 'shipping', label: 'Shipping & Delivery', icon: Truck },
    { id: 'payments', label: 'Uganda Payments', icon: CreditCard },
    { id: 'reviews', label: 'Customer Reviews', icon: Star },
    // Owner-only tabs
    ...(adminUser?.role === 'OWNER'
      ? [
          { id: 'users', label: 'Administrator Team', icon: Users },
          { id: 'audit', label: 'Security & Audit Logs', icon: ShieldAlert },
        ]
      : []),
  ];

  const handleTabClick = (tabId: string) => {
    setAdminActiveTab(tabId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F5F2EB] text-[#1A1816] flex flex-col font-body selection:bg-[#8E6C3B]/30 selection:text-[#1A1816]">
      {/* Admin Alert Notification */}
      {adminAlert && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2.5 rounded-sm shadow-xl text-xs font-semibold flex items-center gap-2 border animate-in fade-in slide-in-from-top-2 duration-200 ${
            adminAlert.type === 'success'
              ? 'bg-[#1A1816] text-[#FAF8F5] border-[#8E6C3B]'
              : 'bg-[#B91C1C] text-white border-red-800'
          }`}
        >
          <CheckCircle className="w-3.5 h-3.5 text-[#C5A880]" />
          <span>{adminAlert.message}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-[#1A1816] text-[#FAF8F5] border-b border-[#2C2824] h-16 px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 text-[#D8C7B0] hover:text-white"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <div>
            <span className="font-editorial text-xl font-semibold tracking-wide text-white uppercase block leading-tight">
              {branding?.storeName || 'G-Digitalz Fashions'}
            </span>
            <span className="text-[9px] uppercase tracking-widest text-[#C5A880] block font-mono">
              Atelier Management Console
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {/* Quick link to live customer storefront */}
          <button
            onClick={() => setCurrentView('home')}
            className="px-3 py-1.5 bg-[#2A2622] hover:bg-[#38332E] text-[#D8C7B0] hover:text-white text-xs rounded-xs flex items-center gap-1.5 transition-colors border border-[#3E3832]"
            title="Inspect live customer storefront"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">View Storefront</span>
          </button>

          {/* Admin User Badge */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-[#D8C7B0] pl-2 border-l border-[#3E3832]">
            <div className="text-right">
              <span className="block font-medium text-white leading-tight">{adminUser?.fullName}</span>
              <span className="block text-[10px] text-[#C5A880] font-mono leading-tight">{adminUser?.role}</span>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={() => logout()}
            className="p-1.5 text-[#A89885] hover:text-[#EF4444] rounded hover:bg-[#2A2622] transition-colors"
            title="Log out of admin session"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Body with Desktop Sidebar & Mobile Menu */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar (Left) */}
        <aside className="hidden lg:block w-64 bg-[#FAF8F5] border-r border-[#E8E2D9] py-6 px-4 space-y-1 shrink-0">
          <div className="px-3 pb-3 text-[10px] uppercase tracking-widest font-bold text-[#8C7E70]">
            Atelier Navigation
          </div>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = adminActiveTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xs text-xs font-medium transition-colors text-left cursor-pointer ${
                  isActive
                    ? 'bg-[#1A1816] text-[#FAF8F5] font-semibold shadow-xs'
                    : 'text-[#595045] hover:bg-[#EFECE6] hover:text-[#1A1816]'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#C5A880]' : 'text-[#8C7E70]'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Mobile Flyout Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />
            <div className="relative w-72 bg-[#FAF8F5] border-r border-[#D5CDC1] h-full p-4 space-y-1 overflow-y-auto z-10">
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-[#E8E2D9]">
                <span className="font-editorial text-lg font-bold text-[#1A1816]">Atelier Sections</span>
                <button onClick={() => setMobileMenuOpen(false)}>
                  <X className="w-5 h-5 text-[#7A7165]" />
                </button>
              </div>

              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = adminActiveTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-xs font-medium text-left ${
                      isActive ? 'bg-[#1A1816] text-white font-semibold' : 'text-[#4A433A] hover:bg-[#EFECE6]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              <div className="pt-4 border-t border-[#E8E2D9] space-y-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setCurrentView('home');
                  }}
                  className="w-full py-2 px-3 border border-[#1A1816] text-xs font-semibold rounded text-center"
                >
                  View Storefront
                </button>
                <button
                  onClick={() => logout()}
                  className="w-full py-2 px-3 bg-[#B91C1C] text-white text-xs font-semibold rounded text-center"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Workspace Area (Right) */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          {adminActiveTab === 'overview' && <AdminOverview />}
          {adminActiveTab === 'products' && <AdminProducts />}
          {adminActiveTab === 'categories' && <AdminCategories />}
          {adminActiveTab === 'orders' && <AdminOrders />}
          {adminActiveTab === 'homepage' && <AdminHomepageEditor />}
          {adminActiveTab === 'appearance' && <AdminAppearance />}
          {adminActiveTab === 'branding' && <AdminBranding />}
          {adminActiveTab === 'shipping' && <AdminShipping />}
          {adminActiveTab === 'payments' && <AdminPayments />}
          {adminActiveTab === 'reviews' && <AdminReviews />}
          {adminActiveTab === 'users' && <AdminUsers />}
          {adminActiveTab === 'audit' && <AdminAuditLogs />}
        </main>
      </div>
    </div>
  );
};
