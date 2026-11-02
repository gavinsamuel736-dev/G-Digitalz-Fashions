import React, { useState } from 'react';
import {
  Star,
  Truck,
  Scissors,
  Ruler,
  Check,
  ChevronDown,
  MessageCircle,
  ArrowLeft,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const ProductView: React.FC = () => {
  const {
    selectedProduct,
    addToCart,
    formatPrice,
    setCurrentView,
    setIsSizeGuideOpen,
    setIsReviewModalOpen,
    reviews,
    products,
    openProductPage,
    branding,
  } = useShop();

  if (!selectedProduct) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p>No product selected.</p>
        <button
          onClick={() => setCurrentView('catalogue')}
          className="mt-4 px-6 py-2 bg-[#1A1816] text-white text-xs uppercase tracking-widest"
        >
          Back to Catalogue
        </button>
      </div>
    );
  }

  const [activeImage, setActiveImage] = useState(selectedProduct.image);
  const [selectedSize, setSelectedSize] = useState(selectedProduct.availableSizes[0] || 'M');
  const [quantity, setQuantity] = useState(1);
  const [activeAccordion, setActiveAccordion] = useState<'fabric' | 'shipping' | 'tailoring' | null>('fabric');

  const toggleAccordion = (section: 'fabric' | 'shipping' | 'tailoring') => {
    setActiveAccordion(activeAccordion === section ? null : section);
  };

  const productReviews = reviews.filter((r) => r.productName === selectedProduct.name);

  // WhatsApp concierge direct buy link
  const openWhatsAppOrder = () => {
    const brand = branding?.storeName || 'G-Digitalz Fashions';
    const waNumber = branding?.whatsappNumber?.replace(/[^0-9]/g, '') || '256772987654';
    const text = `Hello ${brand}! I would like to order "${selectedProduct.name}" in size ${selectedSize} (UGX ${selectedProduct.priceUGX.toLocaleString()}). Please confirm delivery to my Kampala/Uganda address.`;
    const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`;
    const link = document.createElement('a');
    link.href = waUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.click();
  };

  // Other creations to complete the look
  const relatedProducts = products
    .filter((p) => p.id !== selectedProduct.id)
    .slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-[#7A7165] mb-6">
        <button
          onClick={() => setCurrentView('home')}
          className="hover:text-[#1A1816] transition-colors"
        >
          Home
        </button>
        <span>/</span>
        <button
          onClick={() => setCurrentView('catalogue')}
          className="hover:text-[#1A1816] transition-colors"
        >
          Creations
        </button>
        <span>/</span>
        <span className="text-[#1A1816] font-medium truncate max-w-xs sm:max-w-md">
          {selectedProduct.name}
        </span>
      </div>

      {/* Main 2-Column Split: Sticky Gallery Left & Contiguous Purchase Module Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
        
        {/* Left Column: Gallery (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[3/4] w-full bg-[#EFECE6] border border-[#E8E2D9] overflow-hidden rounded-xs">
            <img
              src={activeImage}
              alt={selectedProduct.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-top transition-all duration-300"
            />
            {selectedProduct.badge && (
              <div className="absolute top-4 left-4 bg-[#FAF8F5]/90 backdrop-blur-xs text-[#1A1816] text-xs uppercase tracking-wider font-semibold px-3 py-1 border border-[#E8E2D9]">
                {selectedProduct.badge}
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {selectedProduct.gallery.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {selectedProduct.gallery.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-20 h-24 shrink-0 rounded-xs overflow-hidden border-2 transition-all ${
                    activeImage === img ? 'border-[#1A1816]' : 'border-[#E8E2D9] opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Contiguous Purchase Module (5 Cols) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
          {/* Header */}
          <div className="space-y-2 border-b border-[#E8E2D9] pb-6">
            <div className="flex items-center justify-between text-xs uppercase tracking-wider text-[#7A7165]">
              <span>Category: {selectedProduct.category}</span>
              <div className="flex items-center gap-1 text-[#8E6C3B]">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span className="font-semibold text-[#1A1816]">{selectedProduct.rating}</span>
                <span>({selectedProduct.reviewCount} verified reviews)</span>
              </div>
            </div>

            <h1 className="font-editorial text-3xl sm:text-4xl font-semibold text-[#1A1816] leading-tight">
              {selectedProduct.name}
            </h1>

            <p className="font-body text-xs sm:text-sm text-[#7A7165] leading-relaxed">
              {selectedProduct.tagline}
            </p>

            <div className="pt-2 flex items-baseline gap-3">
              <span className="font-body text-2xl font-bold tabular-nums text-[#1A1816]">
                {formatPrice(selectedProduct.priceUGX, selectedProduct.priceUSD)}
              </span>
              <span className="text-xs text-[#2F6B45] font-medium flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Hand-finished in Kampala
              </span>
            </div>
          </div>

          {/* Size Selector */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#1A1816]">
                Select Atelier Size
              </span>
              <button
                onClick={() => setIsSizeGuideOpen(true)}
                className="text-xs text-[#8E6C3B] hover:text-[#1A1816] flex items-center gap-1 font-medium transition-colors cursor-pointer"
              >
                <Ruler className="w-3.5 h-3.5" />
                <span>Size & Measurement Guide</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {selectedProduct.availableSizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-3.5 py-2 text-xs font-medium border transition-all rounded-xs cursor-pointer ${
                    selectedSize === size
                      ? 'border-[#1A1816] bg-[#1A1816] text-[#FAF8F5]'
                      : 'border-[#D5CDC1] bg-white text-[#4A433A] hover:border-[#1A1816]'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Selector & Primary Actions */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#7A7165]">
                Quantity:
              </span>
              <div className="flex items-center border border-[#D5CDC1] rounded bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1.5 text-xs text-[#4A433A] hover:bg-[#FAF8F5]"
                >
                  -
                </button>
                <span className="px-3 text-xs font-medium tabular-nums">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1.5 text-xs text-[#4A433A] hover:bg-[#FAF8F5]"
                >
                  +
                </button>
              </div>
            </div>

            {/* Primary Add To Bag */}
            <button
              onClick={() => addToCart(selectedProduct, selectedSize, quantity)}
              className="w-full py-4 bg-[#1A1816] text-[#FAF8F5] text-xs uppercase tracking-widest font-semibold hover:bg-[#322D27] transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add to Shopping Bag</span>
            </button>

            {/* Direct WhatsApp Concierge Order */}
            <button
              onClick={openWhatsAppOrder}
              className="w-full py-3.5 bg-[#25D366] text-white text-xs uppercase tracking-widest font-semibold hover:bg-[#1EBE5D] transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Order via WhatsApp Concierge</span>
            </button>
          </div>

          {/* Delivery Note */}
          <div className="p-3.5 bg-[#F3EFEA] border border-[#E8E2D9] rounded-xs text-xs text-[#595045] space-y-1">
            <div className="flex items-center gap-2 text-[#1A1816] font-semibold">
              <Truck className="w-4 h-4 text-[#8E6C3B]" />
              <span>Greater Kampala Express Delivery</span>
            </div>
            <p className="leading-relaxed">
              Order before 3:00 PM for same-day delivery to Kololo, Nakasero, Bugolobi, and Entebbe. Upcountry Uganda & DHL Worldwide dispatch within 24 hours.
            </p>
          </div>

          {/* Accordions */}
          <div className="border-t border-[#E8E2D9] divide-y divide-[#E8E2D9] text-xs">
            {/* 1. Fabric & Care */}
            <div>
              <button
                onClick={() => toggleAccordion('fabric')}
                className="w-full py-4 flex items-center justify-between text-left font-semibold text-[#1A1816] hover:text-[#8E6C3B] transition-colors"
              >
                <span>Fabric Composition & Care</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    activeAccordion === 'fabric' ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {activeAccordion === 'fabric' && (
                <div className="pb-4 space-y-2 text-[#595045] leading-relaxed">
                  <p>
                    <strong className="text-[#1A1816]">Composition:</strong> {selectedProduct.fabric}
                  </p>
                  <p className="text-[#1A1816] font-medium pt-1">Atelier Details:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    {selectedProduct.details.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                  <p className="text-[#1A1816] font-medium pt-1">Care Guide:</p>
                  <ul className="list-disc pl-4 space-y-1">
                    {selectedProduct.care.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* 2. Delivery & Returns */}
            <div>
              <button
                onClick={() => toggleAccordion('shipping')}
                className="w-full py-4 flex items-center justify-between text-left font-semibold text-[#1A1816] hover:text-[#8E6C3B] transition-colors"
              >
                <span>Delivery & Return Policy</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    activeAccordion === 'shipping' ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {activeAccordion === 'shipping' && (
                <div className="pb-4 space-y-2 text-[#595045] leading-relaxed">
                  <p>
                    <strong>Kampala Delivery:</strong> Same-day boda/van delivery (UGX 15,000) or standard next-day (UGX 8,000). Free for orders over UGX 1,500,000.
                  </p>
                  <p>
                    <strong>Upcountry Uganda:</strong> Mbarara, Gulu, Jinja, Mbale, Fort Portal delivered via vetted regional express couriers within 48 hours (UGX 25,000).
                  </p>
                  <p>
                    <strong>International:</strong> Shipped via DHL Express tracked courier to Kenya, Rwanda, UK, US, and Europe (3-5 business days).
                  </p>
                </div>
              )}
            </div>

            {/* 3. Bespoke Alterations */}
            <div>
              <button
                onClick={() => toggleAccordion('tailoring')}
                className="w-full py-4 flex items-center justify-between text-left font-semibold text-[#1A1816] hover:text-[#8E6C3B] transition-colors"
              >
                <span>Bespoke Tailoring & Atelier Fitting</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    activeAccordion === 'tailoring' ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {activeAccordion === 'tailoring' && (
                <div className="pb-4 space-y-2 text-[#595045] leading-relaxed">
                  <p>
                    Every {branding?.storeName || 'G-Digitalz Fashions'} purchase comes with complimentary fitting adjustments at our Nakasero Hill atelier. If you selected &quot;Bespoke Made-to-Measure&quot;, our head tailor will contact you via WhatsApp within 2 hours to confirm your measurements.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section on PDP */}
      <div className="mt-20 pt-12 border-t border-[#E8E2D9]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h3 className="font-editorial text-2xl sm:text-3xl font-semibold text-[#1A1816]">
              Customer Experiences & Reviews
            </h3>
            <p className="text-xs text-[#7A7165] mt-1">
              Feedback from verified patrons who own {selectedProduct.name}
            </p>
          </div>
          <button
            onClick={() => setIsReviewModalOpen(true)}
            className="px-5 py-2.5 border border-[#1A1816] text-[#1A1816] text-xs uppercase tracking-widest font-semibold hover:bg-[#1A1816] hover:text-white transition-colors"
          >
            Write a Review
          </button>
        </div>

        {productReviews.length === 0 ? (
          <div className="p-8 bg-[#F3EFEA] text-center rounded-sm">
            <p className="text-sm font-editorial text-[#1A1816]">Be the first to review this atelier piece</p>
            <p className="text-xs text-[#7A7165] mt-1">Share your fitting experience and styling feedback.</p>
            <button
              onClick={() => setIsReviewModalOpen(true)}
              className="mt-4 px-5 py-2 bg-[#1A1816] text-white text-xs uppercase tracking-wider font-medium"
            >
              Submit Review
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {productReviews.map((rev) => (
              <div
                key={rev.id}
                className="p-6 bg-[#FAF8F5] border border-[#E8E2D9] rounded-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1 text-[#8E6C3B]">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                  <span className="text-[11px] text-[#7A7165]">{rev.date}</span>
                </div>
                <h4 className="font-editorial text-base font-medium text-[#1A1816]">
                  &ldquo;{rev.title}&rdquo;
                </h4>
                <p className="text-xs text-[#595045] leading-relaxed">
                  {rev.comment}
                </p>
                <div className="pt-2 text-xs text-[#7A7165] flex items-center justify-between border-t border-[#EFECE6]">
                  <div>
                    <span className="font-semibold text-[#1A1816]">{rev.author}</span>
                    <span className="text-[11px] text-[#7A7165] ml-1">({rev.location})</span>
                  </div>
                  <span className="text-[10px] text-[#2F6B45] font-medium bg-[#EBF6EE] px-2 py-0.5 rounded">
                    Verified
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Complete the Look Section */}
      <div className="mt-20 pt-12 border-t border-[#E8E2D9]">
        <div className="mb-8">
          <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#8E6C3B]">
            Curated Styling
          </span>
          <h3 className="font-editorial text-2xl sm:text-3xl font-semibold text-[#1A1816] mt-1">
            Complete The Look
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {relatedProducts.map((item) => (
            <div
              key={item.id}
              onClick={() => openProductPage(item)}
              className="group cursor-pointer flex flex-col justify-between"
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#EFECE6] border border-[#E8E2D9]">
                <img
                  src={item.image}
                  alt={item.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="pt-3 space-y-1">
                <span className="text-[10px] uppercase tracking-wider text-[#7A7165]">
                  {item.category}
                </span>
                <h4 className="font-editorial text-base font-medium text-[#1A1816] group-hover:text-[#8E6C3B] transition-colors leading-snug">
                  {item.name}
                </h4>
                <p className="font-body text-xs font-semibold tabular-nums text-[#1A1816]">
                  {formatPrice(item.priceUGX, item.priceUSD)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
