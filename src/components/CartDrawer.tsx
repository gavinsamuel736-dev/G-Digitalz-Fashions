import React from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    cartSubtotalUGX,
    cartSubtotalUSD,
    formatPrice,
    setCurrentView,
    currency,
  } = useShop();

  if (!isCartOpen) return null;

  const freeDeliveryThreshold = 1500000;
  const progressPercent = Math.min(100, Math.round((cartSubtotalUGX / freeDeliveryThreshold) * 100));
  const remainingForFreeShipping = freeDeliveryThreshold - cartSubtotalUGX;

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    setCurrentView('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewCartClick = () => {
    setIsCartOpen(false);
    setCurrentView('cart');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Dimmed Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#FAF8F5] text-[#1A1816] shadow-2xl flex flex-col">
          {/* Header */}
          <div className="px-6 py-5 border-b border-[#E8E2D9] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#8E6C3B]" />
              <h2 className="font-editorial text-xl font-semibold tracking-wide">
                Your Shopping Bag
              </h2>
              <span className="text-xs text-[#7A7165] font-body ml-1">
                ({cart.reduce((t, i) => t + i.quantity, 0)})
              </span>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-[#7A7165] hover:text-[#1A1816] transition-colors rounded-full hover:bg-[#EFECE6]"
              aria-label="Close Shopping Bag"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Complimentary Shipping Progress */}
          <div className="px-6 py-3 bg-[#F3EFEA] border-b border-[#E8E2D9] text-xs">
            {remainingForFreeShipping > 0 ? (
              <p className="text-[#595045]">
                Add <span className="font-semibold text-[#1A1816] tabular-nums">{currency === 'USD' ? `$${Math.round(remainingForFreeShipping / 3750)}` : `UGX ${remainingForFreeShipping.toLocaleString()}`}</span> more for <span className="font-medium text-[#8E6C3B]">Complimentary Kampala Express Delivery</span>
              </p>
            ) : (
              <p className="text-[#2F6B45] font-medium flex items-center gap-1.5">
                <span>✓</span> You have unlocked complimentary Kampala Express Delivery!
              </p>
            )}
            <div className="w-full bg-[#E3DDD4] h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-[#8E6C3B] h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-[#EFECE6]">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <ShoppingBag className="w-12 h-12 text-[#BBB3A8] stroke-[1] mb-3" />
                <h3 className="font-editorial text-lg text-[#1A1816]">Your bag is currently empty</h3>
                <p className="text-xs text-[#7A7165] max-w-xs mt-1 mb-6">
                  Explore our curated bespoke collection crafted with pride in Kampala.
                </p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    setCurrentView('catalogue');
                  }}
                  className="px-6 py-2.5 bg-[#1A1816] text-[#FAF8F5] text-xs uppercase tracking-widest font-medium hover:bg-[#322D27] transition-colors"
                >
                  Discover Creations
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div key={`${item.product.id}-${item.size}`} className="py-4 flex gap-4">
                  {/* Thumbnail */}
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    referrerPolicy="no-referrer"
                    className="w-20 h-24 object-cover object-top rounded-xs bg-[#EFECE6] border border-[#E8E2D9]"
                  />

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-editorial text-base font-medium text-[#1A1816] leading-tight">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.product.id, item.size)}
                          className="text-[#9C9284] hover:text-[#B91C1C] transition-colors p-1"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-[#7A7165] mt-0.5">
                        Size: <span className="text-[#1A1816] font-medium">{item.size}</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-[#D5CDC1] rounded bg-white">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}
                          className="px-2 py-1 text-[#4A433A] hover:bg-[#FAF8F5] transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-medium tabular-nums text-[#1A1816]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}
                          className="px-2 py-1 text-[#4A433A] hover:bg-[#FAF8F5] transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Line Item Total */}
                      <span className="font-body text-xs font-semibold tabular-nums text-[#1A1816]">
                        {formatPrice(
                          item.product.priceUGX * item.quantity,
                          item.product.priceUSD * item.quantity
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Subtotal & Action */}
          {cart.length > 0 && (
            <div className="p-6 border-t border-[#E8E2D9] bg-[#FAF8F5] space-y-4">
              <div className="space-y-1.5 text-xs text-[#595045]">
                <div className="flex justify-between items-center text-sm">
                  <span className="uppercase tracking-wider font-medium text-[#1A1816]">Subtotal</span>
                  <span className="font-semibold text-base tabular-nums text-[#1A1816]">
                    {formatPrice(cartSubtotalUGX, cartSubtotalUSD)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[#7A7165]">
                  <span>Delivery to Kampala / East Africa</span>
                  <span>Calculated at checkout</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleViewCartClick}
                  className="py-3 px-4 border border-[#1A1816] text-[#1A1816] text-xs uppercase tracking-widest font-medium hover:bg-[#EFECE6] transition-colors text-center"
                >
                  View Full Bag
                </button>
                <button
                  onClick={handleCheckoutClick}
                  className="py-3 px-4 bg-[#1A1816] text-[#FAF8F5] text-xs uppercase tracking-widest font-medium hover:bg-[#322D27] transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span>Checkout</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-[11px] text-center text-[#8C8274]">
                Direct Ugandan Mobile Money (MTN MoMo, Airtel) & Cards accepted.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
