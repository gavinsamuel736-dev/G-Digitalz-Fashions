import React, { useState, useMemo } from 'react';
import { Search, Filter, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { Product } from '../types';

export const CatalogueView: React.FC = () => {
  const {
    products,
    openProductPage,
    formatPrice,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    addToCart,
  } = useShop();

  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating'>('featured');
  const [selectedSize, setSelectedSize] = useState<string>('all');
  const [quickAddedId, setQuickAddedId] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'All Creations' },
    { id: 'women', label: "Women's Couture" },
    { id: 'men', label: "Men's Tailoring" },
    { id: 'couture', label: 'Evening & Bridal' },
    { id: 'accessories', label: 'Artisan Goods' },
  ];

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category filter
        if (activeCategory !== 'all' && p.category !== activeCategory) {
          return false;
        }
        // Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = p.name.toLowerCase().includes(q);
          const matchTagline = p.tagline.toLowerCase().includes(q);
          const matchDesc = p.description.toLowerCase().includes(q);
          const matchFabric = p.fabric.toLowerCase().includes(q);
          if (!matchName && !matchTagline && !matchDesc && !matchFabric) {
            return false;
          }
        }
        // Size filter
        if (selectedSize !== 'all') {
          const hasSize = p.availableSizes.some((s) => s.toLowerCase().includes(selectedSize.toLowerCase()));
          if (!hasSize) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.priceUGX - b.priceUGX;
        if (sortBy === 'price-high') return b.priceUGX - a.priceUGX;
        if (sortBy === 'rating') return b.rating - a.rating;
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      });
  }, [products, activeCategory, searchQuery, selectedSize, sortBy]);

  const handleQuickAdd = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    const defaultSize = product.availableSizes[0] || 'M';
    addToCart(product, defaultSize, 1);
    setQuickAddedId(product.id);
    setTimeout(() => setQuickAddedId(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header Banner */}
      <div className="pb-8 border-b border-[#E8E2D9]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-[#8E6C3B] font-semibold">
              The Complete Wardrobe
            </span>
            <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#1A1816] mt-1">
              Atelier Product Catalogue
            </h1>
          </div>
          <p className="text-xs text-[#7A7165] max-w-md font-body leading-relaxed">
            Every garment is tailored with surgical precision in Kampala. We use organic African linens, Mulberry silks, and genuine artisan cowhide.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="py-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Category Tabs (Interactive Segmented Control) */}
          <div className="flex items-center gap-1 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-xs whitespace-nowrap transition-colors cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-[#1A1816] text-[#FAF8F5]'
                    : 'text-[#655D52] hover:text-[#1A1816] bg-[#EFECE6]/70'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Right Utilities: Search & Sort */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Bar */}
            <div className="relative flex-1 sm:flex-initial">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search garments, silk, linen..."
                className="w-full sm:w-60 bg-white border border-[#D5CDC1] px-3 py-1.5 pl-8 text-xs text-[#1A1816] focus:outline-none focus:border-[#8E6C3B] rounded-xs"
              />
              <Search className="w-3.5 h-3.5 text-[#9C9284] absolute left-2.5 top-2.5" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-[#9C9284] hover:text-[#1A1816]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Size Filter */}
            <div className="flex items-center gap-1.5 text-xs text-[#655D52]">
              <span className="hidden sm:inline">Size:</span>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="bg-white border border-[#D5CDC1] px-2.5 py-1.5 text-xs rounded-xs text-[#1A1816] focus:outline-none focus:border-[#8E6C3B]"
              >
                <option value="all">All Sizes</option>
                <option value="XS">XS</option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="Bespoke">Bespoke</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 text-xs text-[#655D52]">
              <ArrowUpDown className="w-3.5 h-3.5 hidden sm:inline" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white border border-[#D5CDC1] px-2.5 py-1.5 text-xs rounded-xs text-[#1A1816] focus:outline-none focus:border-[#8E6C3B]"
              >
                <option value="featured">Featured First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filters Bar */}
        {(activeCategory !== 'all' || searchQuery || selectedSize !== 'all') && (
          <div className="flex items-center gap-2 pt-1 text-xs text-[#7A7165]">
            <span>Active filters:</span>
            {activeCategory !== 'all' && (
              <span className="bg-[#EFECE6] px-2 py-0.5 rounded text-[#1A1816] flex items-center gap-1">
                Category: {activeCategory}
                <button onClick={() => setActiveCategory('all')} className="hover:text-red-600">×</button>
              </span>
            )}
            {searchQuery && (
              <span className="bg-[#EFECE6] px-2 py-0.5 rounded text-[#1A1816] flex items-center gap-1">
                &ldquo;{searchQuery}&rdquo;
                <button onClick={() => setSearchQuery('')} className="hover:text-red-600">×</button>
              </span>
            )}
            {selectedSize !== 'all' && (
              <span className="bg-[#EFECE6] px-2 py-0.5 rounded text-[#1A1816] flex items-center gap-1">
                Size: {selectedSize}
                <button onClick={() => setSelectedSize('all')} className="hover:text-red-600">×</button>
              </span>
            )}
            <button
              onClick={() => {
                setActiveCategory('all');
                setSearchQuery('');
                setSelectedSize('all');
              }}
              className="text-[#8E6C3B] underline ml-2 hover:text-[#1A1816]"
            >
              Reset all
            </button>
          </div>
        )}
      </div>

      {/* Product Grid (Uniform Cards, 65-75% Image Height) */}
      {filteredProducts.length === 0 ? (
        <div className="py-20 text-center bg-[#F3EFEA] border border-[#E8E2D9] rounded-sm my-8">
          <p className="font-editorial text-2xl text-[#1A1816]">No creations match your selected filters</p>
          <p className="text-xs text-[#7A7165] mt-1 max-w-sm mx-auto">
            Try adjusting your search query, selecting another category, or contact our WhatsApp concierge for bespoke requests.
          </p>
          <button
            onClick={() => {
              setActiveCategory('all');
              setSearchQuery('');
              setSelectedSize('all');
            }}
            className="mt-6 px-6 py-2.5 bg-[#1A1816] text-[#FAF8F5] text-xs uppercase tracking-widest font-semibold hover:bg-[#322D27]"
          >
            Show All Creations
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => openProductPage(product)}
              className="group cursor-pointer flex flex-col justify-between"
            >
              {/* Product Image Slot */}
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#EFECE6] border border-[#E8E2D9]">
                <img
                  src={product.image}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
                />

                {product.badge && (
                  <div className="absolute top-3 left-3 bg-[#FAF8F5]/90 backdrop-blur-xs text-[#1A1816] text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 border border-[#E8E2D9]">
                    {product.badge}
                  </div>
                )}

                {/* Quick Add Overlay */}
                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  <button
                    onClick={(e) => handleQuickAdd(e, product)}
                    className="flex-1 bg-[#FAF8F5] text-[#1A1816] text-[11px] uppercase tracking-wider font-semibold py-2 px-3 shadow-md text-center hover:bg-[#1A1816] hover:text-white transition-colors"
                  >
                    {quickAddedId === product.id ? 'Added ✓' : 'Quick Add'}
                  </button>
                  <span className="bg-[#1A1816] text-white text-[11px] uppercase tracking-wider font-semibold py-2 px-3 shadow-md text-center">
                    Details
                  </span>
                </div>
              </div>

              {/* Product Info */}
              <div className="pt-3.5 space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#7A7165]">
                  <span>{product.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{product.rating} ★ ({product.reviewCount} reviews)</span>
                </div>

                <h3 className="font-editorial text-xl font-medium text-[#1A1816] group-hover:text-[#8E6C3B] transition-colors leading-snug">
                  {product.name}
                </h3>

                <p className="text-xs text-[#7A7165] line-clamp-1 font-body">
                  {product.tagline}
                </p>

                <div className="flex items-center justify-between pt-1.5">
                  <span className="font-body text-sm font-semibold tabular-nums text-[#1A1816]">
                    {formatPrice(product.priceUGX, product.priceUSD)}
                  </span>
                  <span className="text-[11px] text-[#8E6C3B] font-medium">
                    {product.availableSizes.length} sizes available
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
