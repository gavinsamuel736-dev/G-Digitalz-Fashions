import React, { useState } from 'react';
import { Mail, ArrowRight, MapPin, Phone, MessageCircle, Shield } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const Footer: React.FC = () => {
  const { setCurrentView, setActiveCategory, triggerNotification, setIsSizeGuideOpen, branding, paymentMethods } = useShop();
  const [newsletterEmail, setNewsletterEmail] = useState('');

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      triggerNotification('Welcome to G-Digitalz Fashions Private Client Circle.');
      setNewsletterEmail('');
    }
  };

  const navigateTo = (view: any, cat?: string) => {
    if (cat) setActiveCategory(cat);
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const storeName = branding?.storeName || 'G-Digitalz Fashions';
  const address = branding?.physicalAddress || 'Plot 14 Nakasero Hill Road, Kampala, Uganda';
  const phone = branding?.phone || '+256 (0) 772 987 654';
  const whatsapp = branding?.whatsappNumber || '+256 772 987 654';

  return (
    <footer className="bg-[#141210] text-[#D8C7B0] border-t border-[#26221D] mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
          
          {/* Brand & Manifesto */}
          <div className="lg:col-span-2 space-y-4">
            <span className="font-editorial text-2xl sm:text-3xl font-semibold tracking-wider text-white uppercase block">
              {storeName}
            </span>
            <p className="text-xs text-[#A89885] leading-relaxed max-w-sm font-body">
              A contemporary Ugandan luxury fashion house based in Kampala. We marry centuries-old East African textile heritage with refined architectural tailoring, creating bespoke modern couture for discerning clients across Uganda and worldwide.
            </p>
            
            <div className="pt-2 space-y-2 text-xs text-[#C5A880]">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 shrink-0 text-[#8E6C3B]" />
                <span>{address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 shrink-0 text-[#8E6C3B]" />
                <span>{phone} · Studio Appointments</span>
              </div>
              <div className="flex items-center gap-2.5">
                <MessageCircle className="w-4 h-4 shrink-0 text-[#25D366]" />
                <span>WhatsApp VIP Concierge: {whatsapp}</span>
              </div>
            </div>
          </div>

          {/* Navigation Column 1 */}
          <div className="space-y-4 text-xs">
            <h4 className="uppercase tracking-[0.2em] font-semibold text-white text-[11px]">
              Collections
            </h4>
            <ul className="space-y-2.5 text-[#A89885]">
              <li>
                <button
                  onClick={() => navigateTo('catalogue', 'all')}
                  className="hover:text-white transition-colors"
                >
                  All Creations
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('catalogue', 'women')}
                  className="hover:text-white transition-colors"
                >
                  Women's Haute Couture
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('catalogue', 'men')}
                  className="hover:text-white transition-colors"
                >
                  Men's Bespoke Tailoring
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('catalogue', 'couture')}
                  className="hover:text-white transition-colors"
                >
                  Gown & Bridal Ensemble
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('catalogue', 'accessories')}
                  className="hover:text-white transition-colors"
                >
                  Handcrafted Leather Goods
                </button>
              </li>
            </ul>
          </div>

          {/* Navigation Column 2 */}
          <div className="space-y-4 text-xs">
            <h4 className="uppercase tracking-[0.2em] font-semibold text-white text-[11px]">
              Client Care & Admin
            </h4>
            <ul className="space-y-2.5 text-[#A89885]">
              <li>
                <button
                  onClick={() => setIsSizeGuideOpen(true)}
                  className="hover:text-white transition-colors"
                >
                  Kampala Sizing Guide
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('reviews')}
                  className="hover:text-white transition-colors"
                >
                  Client Reviews & Stories
                </button>
              </li>
              <li>
                <span className="text-[#8E8070] cursor-default">
                  Same-Day Kampala Delivery
                </span>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('admin')}
                  className="text-[#C5A880] hover:text-white font-medium flex items-center gap-1 transition-colors"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Administrator Portal</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="space-y-4 text-xs">
            <h4 className="uppercase tracking-[0.2em] font-semibold text-white text-[11px]">
              Private Circle
            </h4>
            <p className="text-[#A89885] leading-relaxed">
              Receive private invitations to seasonal runway debuts and private salon fittings in Nakasero.
            </p>

            <form onSubmit={handleNewsletter} className="space-y-2">
              <div className="relative">
                <input
                  type="email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full bg-[#1F1C18] border border-[#3A342D] px-3 py-2 text-xs text-white placeholder-[#786E62] focus:outline-none focus:border-[#C5A880]"
                />
                <button
                  type="submit"
                  aria-label="Subscribe to newsletter"
                  className="absolute right-1 top-1 bottom-1 px-2.5 bg-[#8E6C3B] text-white hover:bg-[#A37D46] transition-colors flex items-center justify-center"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Lower Bar with Payments and Copyright */}
        <div className="mt-16 pt-8 border-t border-[#26221D] flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-[#7A7165]">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[#A89885]">Payment Accepted in Uganda:</span>
            {paymentMethods.map((pm) => (
              <span
                key={pm.id}
                className="font-medium text-white border border-[#3A342D] px-2 py-0.5 rounded text-[11px]"
              >
                {pm.name}
              </span>
            ))}
          </div>

          <div className="text-center md:text-right">
            <p>© {new Date().getFullYear()} {storeName} Ltd. All Rights Reserved. Kampala, Uganda.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
