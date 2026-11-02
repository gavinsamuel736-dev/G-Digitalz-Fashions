import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle,
  Truck,
  CreditCard,
  Phone,
  MessageCircle,
  ArrowRight,
  ShoppingBag,
  Clock,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { ShippingDetails, PaymentMethodType, Order } from '../types';

export const CheckoutView: React.FC = () => {
  const {
    cart,
    cartSubtotalUGX,
    cartSubtotalUSD,
    formatPrice,
    submitOrder,
    activeOrder,
    setCurrentView,
    shippingZones,
    paymentMethods,
    branding,
  } = useShop();

  // Active zones and methods from backend
  const availableZones = shippingZones.filter((z) => z.is_active);
  const activePayMethods = paymentMethods.filter((p) => p.is_enabled);

  const defaultZone = availableZones[0] || {
    id: 'zone-kampala-express',
    name: 'Kampala Express Same-Day (Within 3 Hours)',
    fee_ugx: 15000,
    free_threshold_ugx: 1500000,
  };

  const [formData, setFormData] = useState<ShippingDetails>({
    fullName: 'Grace Nakamya',
    email: 'grace.nakamya@gmail.com',
    phone: '+256 772 123 456',
    address: 'Plot 28 Elizabeth Avenue, Kololo',
    landmark: 'Near Kololo Airstrip / Acacia Mall access lane',
    city: 'Kampala',
    district: 'Kampala Central',
    deliveryMethod: defaultZone.name,
    deliveryZoneId: defaultZone.id,
    deliveryNotes: 'Please call security gate on arrival or message via WhatsApp.',
  });

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('mtn-momo');
  const [momoNumber, setMomoNumber] = useState('0772 123 456');
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('883');
  const [discountCode, setDiscountCode] = useState('');

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<any | null>(activeOrder);

  // Calculate live delivery fee based on active selected zone
  const currentZone = availableZones.find((z) => z.id === formData.deliveryZoneId) || defaultZone;
  const isFreeDelivery = cartSubtotalUGX >= currentZone.free_threshold_ugx;
  const deliveryFeeUGX = isFreeDelivery ? 0 : currentZone.fee_ugx;

  const appliedDiscount = discountCode.toUpperCase() === 'KAMPALA10' ? Math.round(cartSubtotalUGX * 0.1) : 0;
  const grandTotalUGX = cartSubtotalUGX + deliveryFeeUGX - appliedDiscount;
  const grandTotalUSD = Math.round(grandTotalUGX / 3750);

  const handleInputChange = (field: keyof ShippingDetails, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleZoneChange = (zone: any) => {
    setFormData((prev) => ({
      ...prev,
      deliveryMethod: zone.name,
      deliveryZoneId: zone.id,
    }));
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMessage(null);

    const result = await submitOrder(formData, paymentMethod, momoNumber, discountCode);
    setIsProcessing(false);

    if (result.success) {
      setConfirmedOrder(result.order);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setErrorMessage(result.error || 'Failed to place order');
    }
  };

  const openWhatsAppConfirmation = (order: any) => {
    const brand = branding?.storeName || 'G-Digitalz Fashions';
    const waNumber = branding?.whatsappNumber?.replace(/[^0-9]/g, '') || '256772987654';
    const text = `Hello ${brand} Concierge! I have just placed order *#${order.orderNumber || order.id}* on your website.\n\nTotal: UGX ${order.totalUGX.toLocaleString()}\nDelivery to: ${formData.address}, ${formData.city}\nPayment: ${paymentMethod.toUpperCase()}.\n\nPlease confirm receipt and dispatch time!`;
    const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`;
    const link = document.createElement('a');
    link.href = waUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.click();
  };

  // If order was confirmed, display live persistent confirmation
  if (confirmedOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="bg-[#FAF8F5] border border-[#D5CDC1] p-8 sm:p-12 rounded-sm shadow-xl space-y-8">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-[#EBF6EE] text-[#2F6B45] flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10" />
            </div>
            <span className="text-xs uppercase tracking-[0.25em] text-[#8E6C3B] font-semibold">
              Order Confirmed & Logged to Backend
            </span>
            <h1 className="font-editorial text-3xl sm:text-4xl font-semibold text-[#1A1816]">
              Thank You, {formData.fullName}
            </h1>
            <p className="text-xs text-[#595045] max-w-md mx-auto">
              Your bespoke creation has been received by our Nakasero atelier and saved in our persistent database.
            </p>
          </div>

          {/* Order Details Badge */}
          <div className="p-4 bg-[#EFECE6] rounded-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-[#7A7165]">Order Reference:</span>
              <span className="font-bold text-[#1A1816] ml-1.5 tabular-nums text-sm">
                #{confirmedOrder.orderNumber || confirmedOrder.id}
              </span>
            </div>
            <div>
              <span className="text-[#7A7165]">Status:</span>
              <span className="font-semibold text-[#8E6C3B] ml-1.5">
                {confirmedOrder.status || 'Confirmed'}
              </span>
            </div>
            <div>
              <span className="text-[#7A7165]">Payment:</span>
              <span className="font-semibold text-[#2F6B45] ml-1.5">
                {confirmedOrder.paymentStatus || 'Pending Verification'}
              </span>
            </div>
          </div>

          {/* Itemized Snapshot */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-wider font-semibold text-[#1A1816] border-b border-[#E8E2D9] pb-2">
              Purchased Creations (Immutable Snapshot)
            </h3>
            <div className="divide-y divide-[#EFECE6]">
              {(confirmedOrder.items || confirmedOrder.verifiedItems || []).map((item: any, idx: number) => (
                <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image || item.image_snapshot}
                      alt={item.name || item.product_name_snapshot}
                      referrerPolicy="no-referrer"
                      className="w-12 h-16 object-cover object-top rounded-xs border border-[#E8E2D9]"
                    />
                    <div>
                      <p className="font-medium text-[#1A1816]">
                        {item.name || item.product_name_snapshot}
                      </p>
                      <p className="text-[#7A7165] text-[11px]">
                        Size: {item.size || item.size_snapshot} · Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span className="font-semibold tabular-nums text-[#1A1816]">
                    UGX {(item.lineTotal || item.line_total_ugx || (item.unitPrice * item.quantity)).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-[#E8E2D9] space-y-1.5 text-xs text-[#595045]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="tabular-nums">
                  UGX {(confirmedOrder.subtotalUGX || confirmedOrder.subtotal_ugx).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className="tabular-nums">
                  UGX {(confirmedOrder.deliveryFee ?? confirmedOrder.delivery_fee_ugx).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between font-bold text-sm text-[#1A1816] pt-2 border-t border-[#E8E2D9]">
                <span>Total Amount</span>
                <span className="tabular-nums">
                  UGX {(confirmedOrder.totalUGX || confirmedOrder.total_ugx).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => openWhatsAppConfirmation(confirmedOrder)}
              className="flex-1 py-3.5 bg-[#25D366] text-white text-xs uppercase tracking-widest font-semibold hover:bg-[#1EBE5D] transition-colors flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Send Receipt to WhatsApp Concierge</span>
            </button>
            <button
              onClick={() => {
                setConfirmedOrder(null);
                setCurrentView('catalogue');
              }}
              className="py-3.5 px-6 border border-[#1A1816] text-[#1A1816] text-xs uppercase tracking-widest font-semibold hover:bg-[#1A1816] hover:text-white transition-colors cursor-pointer"
            >
              Back to Boutique
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If cart is empty
  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <h2 className="font-editorial text-3xl font-semibold text-[#1A1816]">No items to checkout</h2>
        <p className="text-xs text-[#7A7165] mt-2 mb-6">
          Your shopping bag is currently empty.
        </p>
        <button
          onClick={() => setCurrentView('catalogue')}
          className="px-6 py-2.5 bg-[#1A1816] text-[#FAF8F5] text-xs uppercase tracking-widest cursor-pointer"
        >
          View Collection
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="pb-6 border-b border-[#E8E2D9]">
        <span className="text-xs uppercase tracking-[0.2em] font-semibold text-[#8E6C3B]">
          Secure Checkout
        </span>
        <h1 className="font-editorial text-3xl sm:text-4xl font-semibold text-[#1A1816] mt-1">
          Complete Your Atelier Order
        </h1>
      </div>

      {errorMessage && (
        <div className="my-6 p-4 bg-[#FEE2E2] border border-[#FCA5A5] text-[#991B1B] text-xs rounded-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10 mt-8 items-start">
        {/* Left Column (7 Cols) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* 1. Customer & Delivery Address */}
          <div className="bg-[#FAF8F5] border border-[#E8E2D9] p-6 rounded-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#E8E2D9]">
              <Truck className="w-4 h-4 text-[#8E6C3B]" />
              <h2 className="font-editorial text-lg font-semibold text-[#1A1816]">
                1. Doorstep Delivery & Contact Details
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block uppercase tracking-wider font-semibold text-[#595045] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="w-full bg-white border border-[#D5CDC1] px-3 py-2 text-xs text-[#1A1816] rounded-xs focus:outline-none focus:border-[#8E6C3B]"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider font-semibold text-[#595045] mb-1">
                  Uganda Phone Number (for Courier & MoMo) *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full bg-white border border-[#D5CDC1] px-3 py-2 text-xs text-[#1A1816] rounded-xs focus:outline-none focus:border-[#8E6C3B]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block uppercase tracking-wider font-semibold text-[#595045] mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full bg-white border border-[#D5CDC1] px-3 py-2 text-xs text-[#1A1816] rounded-xs focus:outline-none focus:border-[#8E6C3B]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block uppercase tracking-wider font-semibold text-[#595045] mb-1">
                  Street Address / Plot / Residence Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full bg-white border border-[#D5CDC1] px-3 py-2 text-xs text-[#1A1816] rounded-xs focus:outline-none focus:border-[#8E6C3B]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block uppercase tracking-wider font-semibold text-[#595045] mb-1">
                  Prominent Landmark / Boda Delivery Directions
                </label>
                <input
                  type="text"
                  value={formData.landmark}
                  onChange={(e) => handleInputChange('landmark', e.target.value)}
                  className="w-full bg-white border border-[#D5CDC1] px-3 py-2 text-xs text-[#1A1816] rounded-xs focus:outline-none focus:border-[#8E6C3B]"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider font-semibold text-[#595045] mb-1">
                  City / Town *
                </label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full bg-white border border-[#D5CDC1] px-3 py-2 text-xs text-[#1A1816] rounded-xs focus:outline-none focus:border-[#8E6C3B]"
                />
              </div>

              <div>
                <label className="block uppercase tracking-wider font-semibold text-[#595045] mb-1">
                  District / Sub-Region *
                </label>
                <input
                  type="text"
                  required
                  value={formData.district}
                  onChange={(e) => handleInputChange('district', e.target.value)}
                  className="w-full bg-white border border-[#D5CDC1] px-3 py-2 text-xs text-[#1A1816] rounded-xs focus:outline-none focus:border-[#8E6C3B]"
                />
              </div>
            </div>
          </div>

          {/* 2. Dynamic Shipping Zones */}
          <div className="bg-[#FAF8F5] border border-[#E8E2D9] p-6 rounded-xs space-y-3">
            <h2 className="font-editorial text-lg font-semibold text-[#1A1816] pb-2 border-b border-[#E8E2D9]">
              2. Delivery Method (Live Atelier Rates)
            </h2>

            <div className="space-y-2 text-xs">
              {availableZones.map((zone) => {
                const isSelected = formData.deliveryZoneId === zone.id;
                const freeEligible = cartSubtotalUGX >= zone.free_threshold_ugx;
                return (
                  <label
                    key={zone.id}
                    onClick={() => handleZoneChange(zone)}
                    className={`flex items-center justify-between p-3.5 border rounded-xs cursor-pointer transition-colors ${
                      isSelected ? 'border-[#1A1816] bg-white' : 'border-[#D5CDC1] bg-[#FAF8F5] hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="deliveryMethod"
                        checked={isSelected}
                        onChange={() => handleZoneChange(zone)}
                        className="accent-[#1A1816]"
                      />
                      <div>
                        <span className="font-semibold text-[#1A1816] block">{zone.name}</span>
                        <span className="text-[#7A7165] text-[11px]">{zone.estimated_time}</span>
                      </div>
                    </div>
                    <span className="font-semibold tabular-nums text-[#1A1816]">
                      {freeEligible ? 'FREE' : formatPrice(zone.fee_ugx)}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* 3. Ugandan Payment Options */}
          <div className="bg-[#FAF8F5] border border-[#E8E2D9] p-6 rounded-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#E8E2D9]">
              <CreditCard className="w-4 h-4 text-[#8E6C3B]" />
              <h2 className="font-editorial text-lg font-semibold text-[#1A1816]">
                3. Payment Method
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {activePayMethods.map((m) => {
                const methodCode: PaymentMethodType = m.provider.includes('mtn')
                  ? 'mtn-momo'
                  : m.provider.includes('airtel')
                  ? 'airtel-money'
                  : m.provider.includes('cash')
                  ? 'cash-on-delivery'
                  : 'card';

                const isSelected = paymentMethod === methodCode;
                return (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => setPaymentMethod(methodCode)}
                    className={`p-3 rounded-xs border text-center transition-all ${
                      isSelected
                        ? 'border-[#1A1816] bg-[#1A1816] text-[#FAF8F5] font-semibold'
                        : 'border-[#D5CDC1] bg-white text-[#595045]'
                    }`}
                  >
                    <span className="block font-bold text-xs">{m.name}</span>
                    <span className="text-[10px] opacity-80">{m.instructions?.substring(0, 20)}...</span>
                  </button>
                );
              })}
            </div>

            {/* MTN Mobile Money Input */}
            {paymentMethod === 'mtn-momo' && (
              <div className="p-4 bg-white border border-[#FFCC00]/40 rounded-xs space-y-2 text-xs">
                <div className="flex items-center gap-2 text-[#997A00] font-semibold">
                  <Phone className="w-4 h-4" />
                  <span>MTN Mobile Money Instant USSD Prompt</span>
                </div>
                <p className="text-[#595045]">
                  Enter your MTN number. When you place order, an instant PIN authorization prompt will be pushed to your handset.
                </p>
                <input
                  type="tel"
                  required
                  value={momoNumber}
                  onChange={(e) => setMomoNumber(e.target.value)}
                  placeholder="077X XXX XXX or 078X XXX XXX"
                  className="w-full bg-[#FAF8F5] border border-[#D5CDC1] px-3 py-2 rounded text-xs font-medium text-[#1A1816]"
                />
              </div>
            )}

            {/* Airtel Money Input */}
            {paymentMethod === 'airtel-money' && (
              <div className="p-4 bg-white border border-[#FF2E2E]/30 rounded-xs space-y-2 text-xs">
                <div className="flex items-center gap-2 text-[#D60000] font-semibold">
                  <Phone className="w-4 h-4" />
                  <span>Airtel Money Instant Push</span>
                </div>
                <input
                  type="tel"
                  required
                  value={momoNumber}
                  onChange={(e) => setMomoNumber(e.target.value)}
                  placeholder="070X XXX XXX or 075X XXX XXX"
                  className="w-full bg-[#FAF8F5] border border-[#D5CDC1] px-3 py-2 rounded text-xs font-medium text-[#1A1816]"
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Summary (5 Cols) */}
        <div className="lg:col-span-5 bg-[#FAF8F5] border border-[#E8E2D9] p-6 space-y-6 rounded-xs sticky top-28 shadow-xs">
          <h2 className="font-editorial text-xl font-semibold text-[#1A1816] pb-3 border-b border-[#E8E2D9]">
            Order Summary ({cart.reduce((t, i) => t + i.quantity, 0)} Items)
          </h2>

          <div className="divide-y divide-[#EFECE6] max-h-60 overflow-y-auto pr-1">
            {cart.map((item) => (
              <div key={`${item.product.id}-${item.size}`} className="py-3 flex gap-3 text-xs">
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  referrerPolicy="no-referrer"
                  className="w-12 h-16 object-cover object-top rounded-xs border border-[#E8E2D9]"
                />
                <div className="flex-1 flex justify-between">
                  <div>
                    <p className="font-medium text-[#1A1816]">{item.product.name}</p>
                    <p className="text-[#7A7165] text-[11px]">Size: {item.size}</p>
                    <p className="text-[#7A7165] text-[11px]">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-semibold tabular-nums text-[#1A1816]">
                    {formatPrice(
                      (item.product.price_ugx || item.product.priceUGX) * item.quantity,
                      (item.product.price_usd || item.product.priceUSD) * item.quantity
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-[#E8E2D9] space-y-2 text-xs text-[#595045]">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-[#1A1816] tabular-nums">
                {formatPrice(cartSubtotalUGX, cartSubtotalUSD)}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Delivery ({currentZone.name})</span>
              <span className="font-semibold text-[#1A1816] tabular-nums">
                {deliveryFeeUGX === 0 ? 'FREE' : formatPrice(deliveryFeeUGX)}
              </span>
            </div>

            <div className="pt-3 border-t border-[#E8E2D9] flex justify-between items-baseline text-base font-semibold text-[#1A1816]">
              <span>Final Total</span>
              <span className="font-body text-xl tabular-nums">
                {formatPrice(grandTotalUGX, grandTotalUSD)}
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-4 bg-[#1A1816] text-[#FAF8F5] text-xs uppercase tracking-widest font-semibold hover:bg-[#322D27] disabled:opacity-75 transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 animate-spin text-[#C5A880]" />
                Authorizing {paymentMethod.toUpperCase()}...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span>Place Confirmed Order</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
