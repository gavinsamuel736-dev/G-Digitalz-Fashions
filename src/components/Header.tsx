import React, { useState } from 'react';
import { ShoppingBag, Search, Menu, X, Shield, Lock } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useAdmin } from '../context/AdminContext';

export const Header: React.FC = () => {
  const {
    cartCount,
    setIsCartOpen,
    currentView,
    setCurrentView,
    currency,
    setCurrency,
    setActiveCategory,
    setSearchQuery,
    branding,
    homepage,
  } = useShop();

  const { isAuthenticated } = useAdmin();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [localSearch, setLocalSearch] = useState('');

  const handleNavClick = (view: any, category?: string) => {
    if (category) {
      setActiveCategory(category);
    } else {
      setActiveCategory('all');
    }
    setCurrentView(view);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearch.trim()) {
      setSearchQuery(localSearch.trim());
      setCurrentView('catalogue');
      setShowSearchInput(false);
    }
  };

  const storeName = branding?.storeName || 'G-Digitalz Fashions';
  const tagline = branding?.tagline || 'Kampala · Haute Couture';
  const announcement = homepage?.announcementStrip || 'Complimentary Kampala Express Delivery on orders over UGX 1,500,000 · WhatsApp Concierge: +256 772 987 654';

  return (
    <>
      {/* Top Quiet Announcement Strip */}
      {homepage?.sectionVisibility?.announcement !== false && (
        <div className="bg-[#1A1816] text-[#D8C7B0] text-xs py-2 px-4 text-center tracking-wider font-light flex items-center justify-center gap-2 border-b border-[#2C2824]">
          <span>{announcement}</span>
        </div>
      )}

      {/* Main Navigation adhering to Top Bar Contract */}
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E8E2D9] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-8">
          
          {/* Zone 1: Wordmark or Logo */}
          <button
            onClick={() => handleNavClick('home')}
            className="text-left group cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#9E7A4A] flex items-center gap-3"
          >
            {branding?.logoUrl ? (
              <img
                src={branding.logoUrl}
                alt={storeName}
                className="h-10 w-auto object-contain"
              />
            ) : null}
            <div>
              <span className="font-editorial text-2xl sm:text-3xl font-semibold tracking-wider text-[#1A1816] uppercase whitespace-nowrap shrink-0 group-hover:text-[#8E6C3B] transition-colors">
                {storeName}
              </span>
              <span className="block text-[9px] tracking-[0.25em] text-[#7A7165] uppercase font-body -mt-1 font-medium">
                {tagline}
              </span>
            </div>
          </button>

          {/* Zone 2: 4-5 single-line clean nav links */}
          <nav className="hidden lg:flex items-center gap-8 text-xs uppercase tracking-[0.16em] font-medium text-[#4A433A]">
            <button
              onClick={() => handleNavClick('home')}
              className={`hover:text-[#1A1816] transition-colors cursor-pointer py-1 relative whitespace-nowrap shrink-0 ${
                currentView === 'home' ? 'text-[#1A1816] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1px] after:bg-[#1A1816]' : ''
              }`}
            >
              Atelier
            </button>
            <button
              onClick={() => handleNavClick('catalogue', 'all')}
              className={`hover:text-[#1A1816] transition-colors cursor-pointer py-1 relative whitespace-nowrap shrink-0 ${
                currentView === 'catalogue' ? 'text-[#1A1816] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1px] after:bg-[#1A1816]' : ''
              }`}
            >
              Creations
            </button>
            <button
              onClick={() => handleNavClick('catalogue', 'women')}
              className="hover:text-[#1A1816] transition-colors cursor-pointer py-1 whitespace-nowrap shrink-0"
            >
              Women
            </button>
            <button
              onClick={() => handleNavClick('catalogue', 'men')}
              className="hover:text-[#1A1816] transition-colors cursor-pointer py-1 whitespace-nowrap shrink-0"
            >
              Men
            </button>
            <button
              onClick={() => handleNavClick('reviews')}
              className={`hover:text-[#1A1816] transition-colors cursor-pointer py-1 relative whitespace-nowrap shrink-0 ${
                currentView === 'reviews' ? 'text-[#1A1816] font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1px] after:bg-[#1A1816]' : ''
              }`}
            >
              Client Journal
            </button>
          </nav>

          {/* Zone 3: Primary Action & Essential Utilities */}
          <div className="flex items-center gap-4 sm:gap-5 shrink-0">
            {/* Currency Switcher */}
            <div className="hidden sm:flex items-center text-xs tracking-wider font-medium text-[#655D52] bg-[#EFECE6] rounded px-2 py-1">
              <button
                onClick={() => setCurrency('UGX')}
                className={`px-1.5 py-0.5 rounded transition-colors ${
                  currency === 'UGX' ? 'bg-[#1A1816] text-white font-semibold' : 'hover:text-[#1A1816]'
                }`}
                title="Ugandan Shillings"
              >
                UGX
              </button>
              <span className="text-[#BBB3A8] mx-0.5">/</span>
              <button
                onClick={() => setCurrency('USD')}
                className={`px-1.5 py-0.5 rounded transition-colors ${
                  currency === 'USD' ? 'bg-[#1A1816] text-white font-semibold' : 'hover:text-[#1A1816]'
                }`}
                title="US Dollars"
              >
                USD
              </button>
            </div>

            {/* Search Icon Trigger */}
            <div className="relative">
              {showSearchInput ? (
                <form onSubmit={handleSearchSubmit} className="flex items-center">
                  <input
                    type="text"
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    placeholder="Search silk, linen, suit..."
                    autoFocus
                    className="w-40 sm:w-52 text-xs bg-white border border-[#D5CDC1] px-3 py-1.5 rounded-l text-[#1A1816] focus:outline-none focus:border-[#8E6C3B]"
                  />
                  <button
                    type="submit"
                    className="bg-[#1A1816] text-white px-2.5 py-1.5 rounded-r text-xs font-medium hover:bg-[#322D27]"
                  >
                    Go
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowSearchInput(false)}
                    className="ml-1 p-1 text-[#7A7165] hover:text-[#1A1816]"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setShowSearchInput(true)}
                  className="p-1.5 text-[#4A433A] hover:text-[#1A1816] transition-colors cursor-pointer"
                  aria-label="Search Collection"
                >
                  <Search className="w-5 h-5 stroke-[1.5]" />
                </button>
              )}
            </div>

            {/* Shopping Bag Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 p-1.5 text-[#1A1816] hover:text-[#8E6C3B] transition-colors cursor-pointer"
              aria-label="View Shopping Bag"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.5]" />
              <span className="hidden sm:inline text-xs uppercase tracking-wider font-medium">Bag</span>
              {cartCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#8E6C3B] text-white text-[10px] font-semibold flex items-center justify-center -ml-1">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Dedicated Admin Portal Direct Button */}
            <button
              onClick={() => handleNavClick('admin')}
              className={`p-1.5 text-xs font-semibold rounded transition-colors flex items-center gap-1.5 cursor-pointer ${
                currentView === 'admin'
                  ? 'bg-[#1A1816] text-[#C5A880]'
                  : 'text-[#4A433A] hover:text-[#1A1816] bg-[#EFECE6]/70 hover:bg-[#EFECE6]'
              }`}
              title="Administrator Dashboard & Customizer"
            >
              <Shield className="w-4 h-4 text-[#8E6C3B]" />
              <span className="hidden md:inline text-[11px] uppercase tracking-wider">
                {isAuthenticated ? 'Admin' : 'Admin'}
              </span>
            </button>

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-[#1A1816] lg:hidden hover:text-[#8E6C3B] transition-colors cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Flyout Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#FAF8F5] border-b border-[#E8E2D9] px-6 py-6 animate-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col gap-4 text-sm uppercase tracking-widest font-medium text-[#4A433A]">
              <button
                onClick={() => handleNavClick('home')}
                className="text-left py-2 border-b border-[#EFECE6] hover:text-[#1A1816]"
              >
                Atelier Story
              </button>
              <button
                onClick={() => handleNavClick('catalogue', 'all')}
                className="text-left py-2 border-b border-[#EFECE6] hover:text-[#1A1816]"
              >
                All Creations
              </button>
              <button
                onClick={() => handleNavClick('catalogue', 'women')}
                className="text-left py-2 border-b border-[#EFECE6] hover:text-[#1A1816]"
              >
                Women's Couture
              </button>
              <button
                onClick={() => handleNavClick('catalogue', 'men')}
                className="text-left py-2 border-b border-[#EFECE6] hover:text-[#1A1816]"
              >
                Men's Bespoke Tailoring
              </button>
              <button
                onClick={() => handleNavClick('reviews')}
                className="text-left py-2 border-b border-[#EFECE6] hover:text-[#1A1816]"
              >
                Customer Reviews
              </button>
              <button
                onClick={() => handleNavClick('admin')}
                className="text-left py-2 text-[#8E6C3B] font-bold border-b border-[#EFECE6] flex items-center justify-between"
              >
                <span>Atelier Admin Console</span>
                <Shield className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
