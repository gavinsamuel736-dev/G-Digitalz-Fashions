import React from 'react';
import { ArrowRight, Sparkles, ShieldCheck, Truck, Scissors, Star, MessageCircle } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const HomeView: React.FC = () => {
  const {
    products,
    categories,
    homepage,
    branding,
    openProductPage,
    setCurrentView,
    setActiveCategory,
    formatPrice,
    reviews,
    setIsSizeGuideOpen,
  } = useShop();

  const visibility = homepage?.sectionVisibility || {
    hero: true,
    proofPillars: true,
    featuredProducts: true,
    categorySpotlight: true,
    craftsmanshipStory: true,
    customerReviews: true,
  };

  const heroHeadline = homepage?.headline || 'Ugandan Elegance, Reimagined For The Modern World.';
  const heroSupporting = homepage?.supportingText || 'Bespoke tailoring, archival craftsmanship, and contemporary African couture created at our Nakasero atelier.';
  const heroImage = homepage?.heroBannerImage || '/src/assets/images/hero_peterz_couture_1793621754106.jpg';
  const primaryCta = homepage?.primaryCtaText || 'Explore Collection';
  const secondaryCta = homepage?.secondaryCtaText || 'Book Atelier Fitting';

  const featuredProducts = products.filter((p) => p.featured || p.is_featured).slice(0, 4);
  const activeProducts = featuredProducts.length > 0 ? featuredProducts : products.slice(0, 4);

  const handleExploreCategory = (catIdOrSlug: string) => {
    setActiveCategory(catIdOrSlug);
    setCurrentView('catalogue');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openWhatsAppFitting = () => {
    const waNumber = branding?.whatsappNumber?.replace(/[^0-9]/g, '') || '256772987654';
    const storeTitle = branding?.storeName || 'G-Digitalz Fashions';
    const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(
      `Hello ${storeTitle}! I would like to book a private bespoke fitting session at your Nakasero atelier in Kampala.`
    )}`;
    const link = document.createElement('a');
    link.href = waUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.click();
  };

  return (
    <div className="space-y-20 sm:space-y-28">
      {/* Editorial Hero Section */}
      {visibility.hero && (
        <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-4 sm:pt-6">
          <div className="relative rounded-lg overflow-hidden border border-[#E8E2D9] shadow-xl bg-[#1A1816]">
            {/* Hero Image */}
            <div className="relative h-[550px] sm:h-[650px] lg:h-[720px] w-full">
              <img
                src={heroImage}
                alt={`${branding?.storeName || 'G-Digitalz Fashions'} Kampala Runway Couture`}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />
              {/* Scrim Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/15" />

              {/* Hero Copy Overlay */}
              <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-12 lg:p-16 text-white max-w-3xl">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#C5A880] font-medium">
                    <span>Kampala Atelier</span>
                    <span aria-hidden="true">·</span>
                    <span>Harmattan / Equator Couture</span>
                  </div>

                  <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-normal leading-[1.08] tracking-tight text-white max-w-2xl text-balance">
                    {heroHeadline}
                  </h1>

                  <p className="font-body text-sm sm:text-base text-[#D8C7B0] max-w-xl leading-relaxed">
                    {heroSupporting}
                  </p>

                  <div className="pt-4 flex flex-wrap items-center gap-4">
                    <button
                      onClick={() => {
                        setActiveCategory('all');
                        setCurrentView('catalogue');
                      }}
                      className="px-8 py-3.5 bg-[#FAF8F5] text-[#1A1816] hover:bg-[#EFECE6] text-xs uppercase tracking-widest font-semibold transition-colors flex items-center gap-2 shadow-lg cursor-pointer"
                    >
                      <span>{primaryCta}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={openWhatsAppFitting}
                      className="px-6 py-3.5 bg-black/40 hover:bg-black/60 text-white border border-[#C5A880]/60 text-xs uppercase tracking-widest font-medium transition-colors flex items-center gap-2 backdrop-blur-xs cursor-pointer"
                    >
                      <MessageCircle className="w-4 h-4 text-[#25D366]" />
                      <span>{secondaryCta}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4-Column Proof & Pillar Strip */}
      {visibility.proofPillars && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-8 border-y border-[#E8E2D9]">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#EFECE6] flex items-center justify-center text-[#8E6C3B] shrink-0">
                <Scissors className="w-5 h-5 stroke-[1.5]" />
              </div>
              <div>
                <h3 className="font-editorial text-base font-semibold text-[#1A1816]">
                  Nakasero Atelier Craft
                </h3>
                <p className="text-xs text-[#7A7165] mt-0.5 leading-relaxed">
                  Hand-cut, assembled, and finished by master Ugandan artisans with over 60 hours per piece.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#EFECE6] flex items-center justify-center text-[#8E6C3B] shrink-0">
                <Truck className="w-5 h-5 stroke-[1.5]" />
              </div>
              <div>
                <h3 className="font-editorial text-base font-semibold text-[#1A1816]">
                  Same-Day Kampala Delivery
                </h3>
                <p className="text-xs text-[#7A7165] mt-0.5 leading-relaxed">
                  Direct concierge courier across Kololo, Nakasero, Entebbe, and Jinja. DHL Worldwide.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#EFECE6] flex items-center justify-center text-[#8E6C3B] shrink-0">
                <Sparkles className="w-5 h-5 stroke-[1.5]" />
              </div>
              <div>
                <h3 className="font-editorial text-base font-semibold text-[#1A1816]">
                  Bespoke Made-to-Measure
                </h3>
                <p className="text-xs text-[#7A7165] mt-0.5 leading-relaxed">
                  Personalized sizing consultations via WhatsApp or at our private Kampala fitting lounge.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#EFECE6] flex items-center justify-center text-[#8E6C3B] shrink-0">
                <ShieldCheck className="w-5 h-5 stroke-[1.5]" />
              </div>
              <div>
                <h3 className="font-editorial text-base font-semibold text-[#1A1816]">
                  Ugandan MoMo & Card Pay
                </h3>
                <p className="text-xs text-[#7A7165] mt-0.5 leading-relaxed">
                  Instant checkout with MTN Mobile Money, Airtel Money, Visa, Mastercard, or Cash on Delivery.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Featured Collection Grid */}
      {visibility.featuredProducts && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-4 border-b border-[#E8E2D9]">
            <div>
              <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#8E6C3B]">
                {homepage?.featuredCollectionSubtitle || 'Archival Selection'}
              </span>
              <h2 className="font-editorial text-3xl sm:text-4xl font-semibold text-[#1A1816] mt-1">
                {homepage?.featuredCollectionTitle || 'Signature Atelier Arrivals'}
              </h2>
            </div>
            <button
              onClick={() => {
                setActiveCategory('all');
                setCurrentView('catalogue');
              }}
              className="text-xs uppercase tracking-widest font-semibold text-[#1A1816] hover:text-[#8E6C3B] flex items-center gap-1.5 transition-colors self-start sm:self-auto cursor-pointer"
            >
              <span>View All Creations</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {activeProducts.map((product) => (
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

                  <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-center">
                    <span className="bg-[#FAF8F5] text-[#1A1816] text-[11px] uppercase tracking-wider font-semibold py-2 px-4 shadow-md w-full text-center hover:bg-[#1A1816] hover:text-white transition-colors">
                      View Creation
                    </span>
                  </div>
                </div>

                {/* Clean Typography Metadata */}
                <div className="pt-3.5 space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#7A7165]">
                    <span>{product.category_name || product.category || 'Couture'}</span>
                    <span aria-hidden="true">·</span>
                    <span>{product.rating} ★ ({product.reviewCount || product.review_count || 12})</span>
                  </div>

                  <h3 className="font-editorial text-lg font-medium text-[#1A1816] group-hover:text-[#8E6C3B] transition-colors leading-snug">
                    {product.name}
                  </h3>

                  <p className="text-xs text-[#7A7165] line-clamp-1">
                    {product.tagline}
                  </p>

                  <p className="font-body text-sm font-semibold tabular-nums text-[#1A1816] pt-1">
                    {formatPrice(product.price_ugx || product.priceUGX, product.price_usd || product.priceUSD)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Dynamic Wardrobe Categories Spotlight */}
      {visibility.categorySpotlight && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.slice(0, 3).map((cat) => (
              <div
                key={cat.id}
                onClick={() => handleExploreCategory(cat.id)}
                className="group relative h-96 overflow-hidden border border-[#E8E2D9] cursor-pointer"
              >
                <img
                  src={cat.image || '/src/assets/images/product_ugandan_silk_gown_1793621754501.jpg'}
                  alt={cat.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-[#C5A880] font-semibold">
                    Atelier Division
                  </span>
                  <h3 className="font-editorial text-2xl font-medium mt-1">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-[#D8C7B0] mt-1 line-clamp-2">
                    {cat.description}
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-xs uppercase tracking-widest text-[#FAF8F5] group-hover:text-[#C5A880] transition-colors font-semibold">
                    <span>Explore Silhouettes</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Atelier Craftsmanship & Story Section */}
      {visibility.craftsmanshipStory && (
        <section className="bg-[#1A1816] text-[#FAF8F5] py-20 border-y border-[#2C2824]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="space-y-6">
                <div className="space-y-2">
                  <span className="text-xs uppercase tracking-[0.25em] text-[#C5A880] font-semibold">
                    The Nakasero Workshop
                  </span>
                  <h2 className="font-editorial text-3xl sm:text-5xl font-light leading-tight">
                    {homepage?.aboutSectionHeadline || 'Where Heritage Meets Architectural Haute Couture.'}
                  </h2>
                </div>

                <p className="font-body text-sm text-[#D8C7B0] leading-relaxed">
                  {homepage?.aboutSectionStory ||
                    `Founded in the heart of Kampala, ${branding?.storeName || 'G-Digitalz Fashions'} was born out of a desire to elevate indigenous Ugandan textiles and craftsmanship into the global luxury pantheon.`}
                </p>

                <div className="space-y-4 pt-2 text-xs text-[#BBB3A8]">
                  <div className="flex items-start gap-3">
                    <span className="text-[#8E6C3B] font-bold text-sm">01.</span>
                    <div>
                      <h4 className="font-medium text-white text-sm">Ethical Ugandan Sourcing</h4>
                      <p className="mt-0.5">We partner directly with organic cotton growers in northern Uganda and master weavers along the shores of Lake Victoria.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-[#8E6C3B] font-bold text-sm">02.</span>
                    <div>
                      <h4 className="font-medium text-white text-sm">Precision Single-Needle Tailoring</h4>
                      <p className="mt-0.5">Every seam is pressed by hand and inspected through a 24-point quality rubric before delivery to your door.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="text-[#8E6C3B] font-bold text-sm">03.</span>
                    <div>
                      <h4 className="font-medium text-white text-sm">Bespoke Fitting Guarantees</h4>
                      <p className="mt-0.5">If a garment requires subtle adjustments, our Kampala studio provides complimentary alterations within 14 days.</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex items-center gap-4">
                  <button
                    onClick={() => setIsSizeGuideOpen(true)}
                    className="px-6 py-3 border border-[#C5A880] text-[#FAF8F5] text-xs uppercase tracking-widest font-medium hover:bg-[#C5A880] hover:text-[#1A1816] transition-colors cursor-pointer"
                  >
                    View Sizing Standards
                  </button>
                  <button
                    onClick={openWhatsAppFitting}
                    className="px-6 py-3 bg-[#25D366] text-white text-xs uppercase tracking-widest font-semibold hover:bg-[#1EBE5D] transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    <span>WhatsApp Stylist</span>
                  </button>
                </div>
              </div>

              {/* Atelier Visual Card */}
              <div className="relative">
                <div className="aspect-[4/5] overflow-hidden rounded-md border border-[#3A342D] shadow-2xl">
                  <img
                    src="/src/assets/images/product_contemporary_kitenge_blazer_1793621755842.jpg"
                    alt={`${branding?.storeName || 'G-Digitalz Fashions'} Master Cutting in Kampala`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="hidden sm:block absolute -bottom-6 -left-6 bg-[#FAF8F5] text-[#1A1816] p-6 max-w-xs border border-[#D5CDC1] shadow-xl">
                  <span className="text-[10px] uppercase tracking-widest text-[#8E6C3B] font-bold">
                    Atelier Metric
                  </span>
                  <p className="font-editorial text-2xl font-semibold mt-1">Over 2,400</p>
                  <p className="text-xs text-[#595045] mt-0.5">
                    {homepage?.aboutSectionMetricsText ||
                      'Bespoke garments delivered to satisfied clients across Kampala, East Africa, and the global diaspora.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Customer Reviews & Press Quotes */}
      {visibility.customerReviews && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase tracking-[0.25em] text-[#8E6C3B] font-semibold">
              Client Journal & Accolades
            </span>
            <h2 className="font-editorial text-3xl sm:text-4xl font-semibold text-[#1A1816] mt-1">
              Praised by Discerning Clients
            </h2>
            <p className="text-xs text-[#7A7165] mt-2">
              Read verified reviews from patrons across Kampala, Entebbe, Nairobi, and London.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.slice(0, 3).map((rev) => (
              <div
                key={rev.id}
                className="p-6 bg-[#FAF8F5] border border-[#E8E2D9] rounded-sm flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-1 text-[#8E6C3B]">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#8E6C3B]" />
                    ))}
                  </div>
                  <h4 className="font-editorial text-base font-semibold text-[#1A1816] leading-snug">
                    &ldquo;{rev.title}&rdquo;
                  </h4>
                  <p className="text-xs text-[#595045] leading-relaxed">
                    {rev.comment}
                  </p>
                </div>

                <div className="pt-6 mt-4 border-t border-[#EFECE6] flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-[#1A1816]">{rev.author}</p>
                    <p className="text-[#7A7165] text-[11px]">{rev.location}</p>
                  </div>
                  <span className="text-[10px] text-[#2F6B45] font-medium bg-[#EBF6EE] px-2 py-0.5 rounded">
                    Verified Buyer
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => {
                setCurrentView('reviews');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-6 py-2.5 border border-[#1A1816] text-[#1A1816] text-xs uppercase tracking-widest font-semibold hover:bg-[#1A1816] hover:text-white transition-colors cursor-pointer"
            >
              Read All Reviews ({reviews.length})
            </button>
          </div>
        </section>
      )}
    </div>
  );
};
