import React, { useEffect, useState } from 'react';
import {
  ShoppingBag,
  Clock,
  CheckCircle,
  Truck,
  DollarSign,
  AlertTriangle,
  ArrowUpRight,
  Package,
  Layers,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { useShop } from '../../context/ShopContext';

export const AdminOverview: React.FC = () => {
  const { authFetch, setAdminActiveTab, adminUser } = useAdmin();
  const { formatPrice, branding } = useShop();

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await authFetch('/api/admin/dashboard/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-[#7A7165]">
        Loading atelier performance metrics...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Welcome Banner */}
      <div className="bg-[#1A1816] text-[#FAF8F5] p-6 rounded-xs border border-[#2C2824] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest text-[#C5A880] font-semibold">
              Live Atelier Telemetry
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#8E6C3B]/20 text-[#C5A880] font-medium border border-[#8E6C3B]/40">
              Role: {adminUser?.role}
            </span>
          </div>
          <h1 className="font-editorial text-2xl sm:text-3xl font-semibold mt-1">
            Welcome back, {adminUser?.fullName}
          </h1>
          <p className="text-xs text-[#D8C7B0] font-body mt-0.5">
            Real-time management of {branding?.storeName || 'G-Digitalz Fashions'} customer storefront, products, orders, and Nakasero atelier settings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setAdminActiveTab('orders')}
            className="px-4 py-2 bg-[#FAF8F5] text-[#1A1816] hover:bg-[#EFECE6] text-xs uppercase tracking-wider font-semibold rounded-xs transition-colors"
          >
            Review Orders ({stats?.pendingOrders || 0} Pending)
          </button>
          <button
            onClick={() => setAdminActiveTab('homepage')}
            className="px-4 py-2 border border-[#8E6C3B] text-[#C5A880] hover:bg-[#8E6C3B] hover:text-white text-xs uppercase tracking-wider font-semibold rounded-xs transition-colors"
          >
            Edit Homepage
          </button>
        </div>
      </div>

      {/* Main Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Verified Revenue */}
        <div className="bg-white p-5 rounded-xs border border-[#E8E2D9] space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-[#7A7165]">
            <span className="text-xs uppercase tracking-wider font-semibold">Verified Sales</span>
            <div className="w-8 h-8 rounded-full bg-[#EBF6EE] flex items-center justify-center text-[#2F6B45]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="font-editorial text-2xl sm:text-3xl font-bold text-[#1A1816] tabular-nums">
            {formatPrice(stats?.verifiedRevenueUGX || 0)}
          </p>
          <p className="text-[11px] text-[#2F6B45] flex items-center gap-1 font-medium">
            <CheckCircle className="w-3 h-3" />
            <span>Strictly verified paid orders</span>
          </p>
        </div>

        {/* Total Orders */}
        <div className="bg-white p-5 rounded-xs border border-[#E8E2D9] space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-[#7A7165]">
            <span className="text-xs uppercase tracking-wider font-semibold">Total Orders</span>
            <div className="w-8 h-8 rounded-full bg-[#EFECE6] flex items-center justify-center text-[#8E6C3B]">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="font-editorial text-2xl sm:text-3xl font-bold text-[#1A1816] tabular-nums">
            {stats?.totalOrders || 0}
          </p>
          <div className="text-[11px] text-[#7A7165] flex items-center gap-2">
            <span className="text-[#8E6C3B] font-medium">{stats?.confirmedOrders || 0} confirmed</span>
            <span>·</span>
            <span className="text-[#2F6B45] font-medium">{stats?.completedOrders || 0} delivered</span>
          </div>
        </div>

        {/* Low Stock Warning */}
        <div className="bg-white p-5 rounded-xs border border-[#E8E2D9] space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-[#7A7165]">
            <span className="text-xs uppercase tracking-wider font-semibold">Low Stock Items</span>
            <div className="w-8 h-8 rounded-full bg-[#FEF3C7] flex items-center justify-center text-[#D97706]">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="font-editorial text-2xl sm:text-3xl font-bold text-[#1A1816] tabular-nums">
            {stats?.lowStockProducts || 0}
          </p>
          <button
            onClick={() => setAdminActiveTab('products')}
            className="text-[11px] text-[#8E6C3B] hover:underline flex items-center gap-1 font-medium"
          >
            <span>View products with ≤ 5 units</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        {/* Total Products */}
        <div className="bg-white p-5 rounded-xs border border-[#E8E2D9] space-y-2 shadow-xs">
          <div className="flex items-center justify-between text-[#7A7165]">
            <span className="text-xs uppercase tracking-wider font-semibold">Atelier Catalog</span>
            <div className="w-8 h-8 rounded-full bg-[#EFECE6] flex items-center justify-center text-[#1A1816]">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="font-editorial text-2xl sm:text-3xl font-bold text-[#1A1816] tabular-nums">
            {stats?.totalProducts || 0}
          </p>
          <p className="text-[11px] text-[#7A7165]">
            {stats?.pendingReviews || 0} customer reviews awaiting moderation
          </p>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white border border-[#E8E2D9] rounded-xs shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E8E2D9]">
          <div>
            <h3 className="font-editorial text-xl font-semibold text-[#1A1816]">Recent Customer Orders</h3>
            <p className="text-xs text-[#7A7165]">Live feed of transactions across Kampala & global dispatch</p>
          </div>
          <button
            onClick={() => setAdminActiveTab('orders')}
            className="text-xs font-semibold text-[#8E6C3B] hover:text-[#1A1816] flex items-center gap-1"
          >
            <span>Open All Orders</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {stats?.recentOrders?.length === 0 ? (
          <p className="text-xs text-[#7A7165] py-4 text-center">No orders registered yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#E8E2D9] text-[#7A7165] uppercase tracking-wider">
                  <th className="py-2.5 font-medium">Order Reference</th>
                  <th className="py-2.5 font-medium">Client Name</th>
                  <th className="py-2.5 font-medium">Amount</th>
                  <th className="py-2.5 font-medium">Order Status</th>
                  <th className="py-2.5 font-medium">Payment</th>
                  <th className="py-2.5 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFECE6]">
                {stats?.recentOrders?.map((ord: any) => (
                  <tr key={ord.id} className="hover:bg-[#FAF8F5]">
                    <td className="py-3 font-semibold text-[#1A1816] tabular-nums">{ord.order_number}</td>
                    <td className="py-3 text-[#4A433A]">{ord.customer_name}</td>
                    <td className="py-3 font-medium tabular-nums text-[#1A1816]">
                      {formatPrice(ord.total_ugx)}
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        ord.status === 'Confirmed' || ord.status === 'Delivered'
                          ? 'bg-[#EBF6EE] text-[#2F6B45]'
                          : ord.status === 'Cancelled'
                          ? 'bg-[#FEE2E2] text-[#B91C1C]'
                          : 'bg-[#FEF3C7] text-[#92400E]'
                      }`}>
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        ord.payment_status === 'Paid'
                          ? 'bg-[#EBF6EE] text-[#2F6B45]'
                          : ord.payment_status === 'Failed'
                          ? 'bg-[#FEE2E2] text-[#B91C1C]'
                          : 'bg-[#FEF3C7] text-[#92400E]'
                      }`}>
                        {ord.payment_status}
                      </span>
                    </td>
                    <td className="py-3 text-[#7A7165]">{new Date(ord.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
