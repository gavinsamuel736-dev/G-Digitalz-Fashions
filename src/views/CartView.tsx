import React, { useState } from 'react';
import { Trash2, Plus, Minus, ArrowRight, ArrowLeft, ShieldCheck, ShoppingBag, Truck } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const CartView: React.FC = () => {
  const {
    cart,
    updateQuantity,
    removeFromCart,
    cartSubtotalUGX,
    cartSubtotalUSD,
    formatPrice,
    setCurrentView,
    currency,
  } = useShop();

  const [orderNote, setOrderNote] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState<string | null>(null);

  const freeDeliveryThreshold = 1500000;
  const remainingForFreeShipping = freeDeliveryThreshold - cartSubtotalUGX;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'KAMPALA10') {
      const disc = Math.round(cartSubtotalUGX * 0.1);
      setAppliedDiscount(disc);
      setPromoMessage('10% Kampala Atelier VIP discount applied!');
    } else {
      setPromoMessage('Invalid voucher code. Try code "KAMPALA10".');
    }
  };

  const estimatedDelivery = cartSubtotalUGX >= freeDeliveryThreshold ? 0 : 15000;
  const totalUGX = cartSubtotalUGX + estimatedDelivery - appliedDiscount;
  const totalUSD = Math.round(totalUGX / 3750);

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-[#EFECE6] flex items-center justify-center mx-auto text-[#8E6C3B] mb-4">
          <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
        </div>
        <h2 className="font-editorial text-3xl font-semibold text-[#1A1816]">Your Shopping Bag is Empty</h2>
        <p className="text-xs text-[#7A7165] max-w-sm mx-auto mt-2 mb-8">
          Discover our bespoke garments and artisan leather accessories crafted with pride in Kampala.
        </p>
        <button
          onClick={() => setCurrentView('catalogue')}
          className="px-8 py-3.5 bg-[#1A1816] text-[#FAF8F5] text-xs uppercase tracking-widest font-semibold hover:bg-[#322D27] transition-colors"
        >
          Explore Atelier Collection
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="pb-6 border-b border-[#E8E2D9] flex items-center justify-between">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#8E6C3B]">
            Bag Review
          </span>
          <h1 className="font-editorial text-3xl sm:text-4xl font-semibold text-[#1A1816] mt-1">
            Your Shopping Bag
          </h1>
        </div>
        <button
          onClick={() => setCurrentView('catalogue')}
          className="text-xs uppercase tracking-wider text-[#7A7165] hover:text-[#1A1816] flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Continue Shopping</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-8 items-start">
        {/* Left Side: Cart Items Table (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Complimentary Shipping Notice */}
          <div className="p-4 bg-[#F3EFEA] border border-[#E8E2D9] rounded-xs text-xs">
            {remainingForFreeShipping > 0 ? (
              <p className="text-[#595045]">
                Add <span className="font-semibold text-[#1A1816] tabular-nums">{currency === 'USD' ? `$${Math.round(remainingForFreeShipping / 3750)}` : `UGX ${remainingForFreeShipping.toLocaleString()}`}</span> more to qualify for <span className="font-medium text-[#8E6C3B]">Complimentary Express Kampala Delivery</span>!
              </p>
            ) : (
              <p className="text-[#2F6B45] font-medium flex items-center gap-1.5">
                <span>✓</span> You have unlocked complimentary Kampala Express Delivery!
              </p>
            )}
          </div>

          <div className="divide-y divide-[#E8E2D9] border-y border-[#E8E2D9]">
            {cart.map((item) => (
              <div key={`${item.product.id}-${item.size}`} className="py-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
                <div className="flex gap-4 items-center">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    referrerPolicy="no-referrer"
                    className="w-24 h-32 object-cover object-top rounded-xs bg-[#EFECE6] border border-[#E8E2D9]"
                  />
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-wider text-[#7A7165]">
                      {item.product.category}
                    </span>
                    <h3 className="font-editorial text-lg font-semibold text-[#1A1816]">
                      {item.product.name}
                    </h3>
                    <p className="text-xs text-[#595045]">
                      Selected Size: <span className="font-semibold text-[#1A1816]">{item.size}</span>
                    </p>
                    <p className="text-xs text-[#7A7165]">
                      Unit: {formatPrice(item.product.priceUGX, item.product.priceUSD)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between w-full sm:w-auto gap-6 sm:gap-8">
                  {/* Quantity */}
                  <div className="flex items-center border border-[#D5CDC1] rounded bg-white">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}
                      className="px-2.5 py-1 text-xs text-[#4A433A] hover:bg-[#FAF8F5]"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-3 text-xs font-medium tabular-nums">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}
                      className="px-2.5 py-1 text-xs text-[#4A433A] hover:bg-[#FAF8F5]"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Line Total */}
                  <span className="font-body text-sm font-semibold tabular-nums text-[#1A1816] min-w-28 text-right">
                    {formatPrice(item.product.priceUGX * item.quantity, item.product.priceUSD * item.quantity)}
                  </span>

                  {/* Remove */}
                  <button
                    onClick={() => removeFromCart(item.product.id, item.size)}
                    className="text-[#9C9284] hover:text-[#B91C1C] transition-colors p-1"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Special Instructions Note */}
          <div className="p-4 bg-white border border-[#E8E2D9] rounded-xs space-y-2">
            <label className="block text-xs uppercase tracking-wider font-semibold text-[#1A1816]">
              Bespoke Tailoring Notes / Delivery Instructions:
            </label>
            <textarea
              rows={2}
              value={orderNote}
              onChange={(e) => setOrderNote(e.target.value)}
              placeholder="e.g. Please hem trousers to 102cm, or deliver to Nakasero plot after 4:00 PM."
              className="w-full text-xs p-2.5 border border-[#D5CDC1] rounded focus:outline-none focus:border-[#8E6C3B]"
            />
          </div>
        </div>

        {/* Right Side: Order Summary (4 Cols) */}
        <div className="lg:col-span-4 bg-[#FAF8F5] border border-[#E8E2D9] p-6 space-y-6 rounded-xs shadow-xs">
          <h2 className="font-editorial text-xl font-semibold text-[#1A1816] pb-3 border-b border-[#E8E2D9]">
            Order Summary
          </h2>

          <div className="space-y-3 text-xs text-[#595045]">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-medium text-[#1A1816] tabular-nums">
                {formatPrice(cartSubtotalUGX, cartSubtotalUSD)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-[#8E6C3B]" />
                Kampala Express Courier
              </span>
              <span className="font-medium text-[#1A1816] tabular-nums">
                {estimatedDelivery === 0 ? 'FREE' : formatPrice(15000, 4)}
              </span>
            </div>

            {appliedDiscount > 0 && (
              <div className="flex justify-between text-[#2F6B45]">
                <span>VIP Discount (10%)</span>
                <span className="tabular-nums">- {formatPrice(appliedDiscount, Math.round(appliedDiscount / 3750))}</span>
              </div>
            )}

            <div className="pt-3 border-t border-[#E8E2D9] flex justify-between items-baseline text-base font-semibold text-[#1A1816]">
              <span>Estimated Total</span>
              <span className="font-body text-xl tabular-nums">
                {formatPrice(totalUGX, totalUSD)}
              </span>
            </div>
          </div>

          {/* Promo Code Form */}
          <form onSubmit={handleApplyPromo} className="pt-2">
            <label className="block text-[11px] uppercase tracking-wider font-semibold text-[#7A7165] mb-1.5">
              Have an Atelier Promo Code?
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="Try KAMPALA10"
                className="flex-1 bg-white border border-[#D5CDC1] px-3 py-2 text-xs uppercase text-[#1A1816] rounded-xs focus:outline-none focus:border-[#8E6C3B]"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-[#EFECE6] text-[#1A1816] text-xs font-semibold rounded-xs hover:bg-[#D5CDC1] transition-colors"
              >
                Apply
              </button>
            </div>
            {promoMessage && (
              <p className={`text-[11px] mt-1.5 ${appliedDiscount > 0 ? 'text-[#2F6B45]' : 'text-[#B91C1C]'}`}>
                {promoMessage}
              </p>
            )}
          </form>

          {/* Proceed to Checkout Button */}
          <button
            onClick={() => {
              setCurrentView('checkout');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="w-full py-4 bg-[#1A1816] text-[#FAF8F5] text-xs uppercase tracking-widest font-semibold hover:bg-[#322D27] transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="space-y-2 pt-2 border-t border-[#E8E2D9] text-[11px] text-[#7A7165]">
            <div className="flex items-center gap-2 text-[#595045]">
              <ShieldCheck className="w-4 h-4 text-[#8E6C3B] shrink-0" />
              <span>Complimentary bespoke fitting guarantee</span>
            </div>
            <p>
              We accept MTN Mobile Money, Airtel Money, Visa, Mastercard, and Cash on Delivery in Kampala.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
