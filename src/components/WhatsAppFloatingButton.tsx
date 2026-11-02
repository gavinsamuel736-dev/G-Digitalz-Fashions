import React, { useState } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const WhatsAppFloatingButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [customMsg, setCustomMsg] = useState('');
  const { selectedProduct, currentView, branding } = useShop();

  const phoneNumber = branding?.whatsappNumber?.replace(/[^0-9]/g, '') || '256772987654';

  const getSmartDefaultMessage = () => {
    const brand = branding?.storeName || 'G-Digitalz Fashions';
    if (currentView === 'product' && selectedProduct) {
      return `Hello ${brand} Concierge! I am interested in "${selectedProduct.name}" (UGX ${selectedProduct.priceUGX.toLocaleString()}). Could you assist me with availability and bespoke sizing?`;
    }
    return `Hello ${brand} Concierge! I would like to inquire about bespoke tailoring and orders at your Nakasero atelier.`;
  };

  const handleSendWhatsApp = (text: string) => {
    const encoded = encodeURIComponent(text || getSmartDefaultMessage());
    const waUrl = `https://wa.me/${phoneNumber}?text=${encoded}`;
    // Safe standard navigation link without window.open
    const link = document.createElement('a');
    link.href = waUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.click();
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {/* Concierge Popover */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 bg-[#FAF8F5] border border-[#D5CDC1] rounded-lg shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-200">
          {/* Header */}
          <div className="bg-[#1A1816] text-[#FAF8F5] p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#25D366]/20 border border-[#25D366]/40 flex items-center justify-center text-[#25D366]">
                <MessageCircle className="w-5 h-5 fill-current" />
              </div>
              <div>
                <h4 className="font-editorial text-base font-medium tracking-wide">
                  {branding?.storeName || 'G-Digitalz'} VIP Concierge
                </h4>
                <p className="text-[11px] text-[#C5A880] tracking-wide font-body">
                  Nakasero Atelier · Kampala, Uganda
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#A3998C] hover:text-white transition-colors"
              aria-label="Close concierge"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-3 text-xs text-[#4A433A]">
            <div className="bg-[#EFECE6] p-3 rounded text-[#322D27] leading-relaxed">
              <p className="font-medium text-[#1A1816] mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#8E6C3B]" />
                Direct Ugandan WhatsApp Support
              </p>
              We are online to assist with bespoke measurements, same-day Kampala deliveries, and wedding entourage styling.
            </div>

            {/* Quick Actions */}
            <div className="space-y-1.5">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-[#7A7165]">
                Quick Prompts:
              </p>
              <button
                onClick={() =>
                  handleSendWhatsApp(
                    `Hello! I need assistance with sizing for a bespoke piece. Could you guide me?`
                  )
                }
                className="w-full text-left p-2 rounded bg-white hover:bg-[#EFECE6] border border-[#E8E2D9] text-[#1A1816] transition-colors truncate"
              >
                1. Sizing & Custom Fitting Inquiry
              </button>
              <button
                onClick={() =>
                  handleSendWhatsApp(
                    `Hello! I would like to schedule a private fitting appointment at your Nakasero atelier in Kampala.`
                  )
                }
                className="w-full text-left p-2 rounded bg-white hover:bg-[#EFECE6] border border-[#E8E2D9] text-[#1A1816] transition-colors truncate"
              >
                2. Book Nakasero Atelier Fitting
              </button>
              {currentView === 'product' && selectedProduct && (
                <button
                  onClick={() => handleSendWhatsApp(getSmartDefaultMessage())}
                  className="w-full text-left p-2 rounded bg-[#EBF6EE] hover:bg-[#DCF0E2] border border-[#BDE3C8] text-[#1F5432] font-medium transition-colors truncate"
                >
                  3. Inquire about {selectedProduct.name}
                </button>
              )}
            </div>

            {/* Custom Input */}
            <div className="pt-1 flex gap-2">
              <input
                type="text"
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 text-xs bg-white border border-[#D5CDC1] px-3 py-2 rounded text-[#1A1816] focus:outline-none focus:border-[#25D366]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendWhatsApp(customMsg);
                }}
              />
              <button
                onClick={() => handleSendWhatsApp(customMsg)}
                className="bg-[#25D366] text-white px-3 py-2 rounded hover:bg-[#1EBE5D] transition-colors flex items-center justify-center"
                aria-label="Send via WhatsApp"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2.5 bg-[#1A1816] hover:bg-[#2A2622] text-white px-4 py-3 rounded-full shadow-xl transition-all duration-300 border border-[#403B33] hover:border-[#8E6C3B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8E6C3B]"
        aria-label="WhatsApp Concierge"
      >
        <div className="w-6 h-6 rounded-full bg-[#25D366] flex items-center justify-center text-white">
          <MessageCircle className="w-4 h-4 fill-current" />
        </div>
        <div className="text-left hidden sm:block">
          <span className="block text-[10px] uppercase tracking-widest text-[#C5A880] font-semibold leading-tight">
            WhatsApp
          </span>
          <span className="block text-xs font-medium leading-tight">
            Kampala Concierge
          </span>
        </div>
      </button>
    </div>
  );
};
