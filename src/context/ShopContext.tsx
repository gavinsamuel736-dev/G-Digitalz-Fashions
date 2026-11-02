import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Product,
  CartItem,
  Review,
  ViewType,
  Order,
  ShippingDetails,
  PaymentMethodType,
  Currency,
  StoreBranding,
  HomepageContent,
  AppearanceSettings,
  Category,
  ShippingZone,
  PaymentMethodConfig,
} from '../types';

interface ShopContextType {
  products: Product[];
  categories: Category[];
  branding: StoreBranding | null;
  homepage: HomepageContent | null;
  appearance: AppearanceSettings | null;
  shippingZones: ShippingZone[];
  paymentMethods: PaymentMethodConfig[];
  reviews: Review[];
  cart: CartItem[];
  addToCart: (product: Product, size: string, quantity?: number, color?: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  removeFromCart: (productId: string, size: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotalUGX: number;
  cartSubtotalUSD: number;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  formatPrice: (priceUGX: number, priceUSD?: number) => string;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  selectedProduct: Product | null;
  openProductPage: (product: Product) => void;
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSizeGuideOpen: boolean;
  setIsSizeGuideOpen: (open: boolean) => void;
  isReviewModalOpen: boolean;
  setIsReviewModalOpen: (open: boolean) => void;
  notificationMessage: string | null;
  triggerNotification: (msg: string) => void;
  activeOrder: Order | null;
  setActiveOrder: (order: Order | null) => void;
  submitOrder: (details: ShippingDetails, paymentMethod: PaymentMethodType, momoNumber?: string, discountCode?: string) => Promise<{ success: boolean; order?: any; error?: string }>;
  submitReview: (review: { author: string; location: string; rating: number; title: string; comment: string; productName?: string; productId?: string }) => Promise<{ success: boolean; message?: string; error?: string }>;
  likeReview: (id: string) => void;
  refreshStore: () => Promise<void>;
  isLoadingStore: boolean;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [branding, setBranding] = useState<StoreBranding | null>(null);
  const [homepage, setHomepage] = useState<HomepageContent | null>(null);
  const [appearance, setAppearance] = useState<AppearanceSettings | null>(null);
  const [shippingZones, setShippingZones] = useState<ShippingZone[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodConfig[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoadingStore, setIsLoadingStore] = useState<boolean>(true);

  // Cart stored in localStorage for customer convenience across page refreshes
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('gdigitalz_cart') || localStorage.getItem('peterz_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [currency, setCurrency] = useState<Currency>('UGX');
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState<boolean>(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);

  // Save cart to local storage
  useEffect(() => {
    localStorage.setItem('gdigitalz_cart', JSON.stringify(cart));
  }, [cart]);

  const triggerNotification = (msg: string) => {
    setNotificationMessage(msg);
    setTimeout(() => {
      setNotificationMessage(null);
    }, 4000);
  };

  // Fetch live bootstrap data from backend database
  const refreshStore = useCallback(async () => {
    try {
      const res = await fetch('/api/store/bootstrap');
      if (!res.ok) throw new Error('Failed to fetch store data');
      const data = await res.json();

      setProducts(data.products || []);
      setCategories(data.categories || []);
      setBranding(data.branding || null);
      setHomepage(data.homepage || null);
      setAppearance(data.appearance || null);
      setShippingZones(data.shippingZones || []);
      setPaymentMethods(data.paymentMethods || []);
      setReviews(data.reviews || []);

      if (!selectedProduct && data.products && data.products.length > 0) {
        setSelectedProduct(data.products[0]);
      }
    } catch (err) {
      console.error('Error bootstrapping store:', err);
    } finally {
      setIsLoadingStore(false);
    }
  }, [selectedProduct]);

  // Initial load + periodic synchronization (every 10 seconds for live updates from admin)
  useEffect(() => {
    refreshStore();
    const interval = setInterval(() => {
      refreshStore();
    }, 10000);
    return () => clearInterval(interval);
  }, [refreshStore]);

  const addToCart = (product: Product, size: string, quantity = 1, color?: string) => {
    setCart((prev) => {
      const existing = prev.find(
        (item) => item.product.id === product.id && item.size === size && item.color === color
      );
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id && item.size === size && item.color === color
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, size, color, quantity }];
    });
    triggerNotification(`Added "${product.name}" (${size}) to your Shopping Bag`);
    setIsCartOpen(true);
  };

  const updateQuantity = (productId: string, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId && item.size === size
          ? { ...item, quantity }
          : item
      )
    );
  };

  const removeFromCart = (productId: string, size: string) => {
    setCart((prev) => prev.filter((item) => !(item.product.id === productId && item.size === size)));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('gdigitalz_cart');
    localStorage.removeItem('peterz_cart');
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const cartSubtotalUGX = cart.reduce(
    (total, item) => total + (item.product.price_ugx || item.product.priceUGX || 0) * item.quantity,
    0
  );

  const cartSubtotalUSD = cart.reduce(
    (total, item) => total + (item.product.price_usd || item.product.priceUSD || Math.round((item.product.priceUGX || 0) / 3750)) * item.quantity,
    0
  );

  const formatPrice = (priceUGX: number, priceUSD?: number) => {
    if (currency === 'USD') {
      const usdVal = priceUSD !== undefined ? priceUSD : Math.round(priceUGX / 3750);
      return `$${usdVal.toLocaleString()}`;
    }
    return `UGX ${priceUGX.toLocaleString()}`;
  };

  const openProductPage = (product: Product) => {
    setSelectedProduct(product);
    setCurrentView('product');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Submit Order to backend (server-side validates inventory & creates immutable snapshot)
  const submitOrder = async (
    shippingDetails: ShippingDetails,
    paymentMethod: PaymentMethodType,
    momoNumber?: string,
    discountCode?: string
  ) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.map((i) => ({
            productId: i.product.id,
            size: i.size,
            color: i.color,
            quantity: i.quantity,
          })),
          shippingDetails,
          paymentMethod,
          momoNumber,
          discountCode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to place order' };
      }

      setActiveOrder({
        id: data.order.orderId,
        order_number: data.order.orderNumber,
        customer_name: shippingDetails.fullName,
        customer_email: shippingDetails.email,
        customer_phone: shippingDetails.phone,
        delivery_address: shippingDetails.address,
        delivery_city: shippingDetails.city,
        delivery_district: shippingDetails.district,
        delivery_method: shippingDetails.deliveryMethod,
        delivery_fee_ugx: data.order.deliveryFee,
        subtotal_ugx: data.order.subtotalUGX,
        discount_ugx: data.order.discountUGX,
        total_ugx: data.order.totalUGX,
        status: data.order.status,
        payment_method: paymentMethod,
        payment_status: data.order.paymentStatus,
        momo_number: momoNumber,
        created_at: new Date().toISOString(),
        items: data.order.verifiedItems,
      });

      clearCart();
      await refreshStore(); // Refresh products stock
      return { success: true, order: data.order };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error while placing order' };
    }
  };

  // Submit Review to backend
  const submitReview = async (rev: {
    author: string;
    location: string;
    rating: number;
    title: string;
    comment: string;
    productName?: string;
    productId?: string;
  }) => {
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rev),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to submit review' };
      }

      triggerNotification(data.message || 'Review submitted for verification');
      return { success: true, message: data.message };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error' };
    }
  };

  const likeReview = (id: string) => {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, likes: (r.likes || 0) + 1 } : r))
    );
  };

  return (
    <ShopContext.Provider
      value={{
        products,
        categories,
        branding,
        homepage,
        appearance,
        shippingZones,
        paymentMethods,
        reviews,
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        cartSubtotalUGX,
        cartSubtotalUSD,
        currency,
        setCurrency,
        formatPrice,
        isCartOpen,
        setIsCartOpen,
        currentView,
        setCurrentView,
        selectedProduct,
        openProductPage,
        activeCategory,
        setActiveCategory,
        searchQuery,
        setSearchQuery,
        isSizeGuideOpen,
        setIsSizeGuideOpen,
        isReviewModalOpen,
        setIsReviewModalOpen,
        notificationMessage,
        triggerNotification,
        activeOrder,
        setActiveOrder,
        submitOrder,
        submitReview,
        likeReview,
        refreshStore,
        isLoadingStore,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
