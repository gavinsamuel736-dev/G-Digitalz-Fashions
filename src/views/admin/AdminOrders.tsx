import React, { useEffect, useState } from 'react';
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  Truck,
  Clock,
  XCircle,
  MessageCircle,
  Phone,
  FileText,
  X,
  ShieldCheck,
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { useShop } from '../../context/ShopContext';
import { Order } from '../../types';

export const AdminOrders: React.FC = () => {
  const { authFetch, showAdminNotification } = useAdmin();
  const { formatPrice } = useShop();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected Order for Detail View
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [internalNotes, setInternalNotes] = useState('');

  const loadOrders = async () => {
    try {
      setLoading(true);
      let url = '/api/admin/orders?';
      if (statusFilter !== 'all') url += `status=${statusFilter}&`;
      if (paymentFilter !== 'all') url += `payment_status=${paymentFilter}&`;
      if (searchTerm.trim()) url += `search=${encodeURIComponent(searchTerm.trim())}`;

      const res = await authFetch(url);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter, paymentFilter]);

  const openOrderDetail = async (orderId: string) => {
    try {
      setLoadingDetail(true);
      const res = await authFetch(`/api/admin/orders/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedOrder(data);
        setInternalNotes(data.internal_notes || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await authFetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        showAdminNotification(`Order marked as ${newStatus}`);
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
        await loadOrders();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdatePayment = async (orderId: string, newPaymentStatus: string) => {
    try {
      const res = await authFetch(`/api/admin/orders/${orderId}/payment`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_status: newPaymentStatus }),
      });
      if (res.ok) {
        showAdminNotification(`Payment status updated to ${newPaymentStatus}`);
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, payment_status: newPaymentStatus });
        }
        await loadOrders();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedOrder) return;
    try {
      const res = await authFetch(`/api/admin/orders/${selectedOrder.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: internalNotes }),
      });
      if (res.ok) {
        showAdminNotification('Internal atelier notes saved');
        setSelectedOrder({ ...selectedOrder, internal_notes: internalNotes });
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-[#E8E2D9]">
        <h2 className="font-editorial text-2xl font-semibold text-[#1A1816]">Order Fulfillment Console</h2>
        <p className="text-xs text-[#7A7165]">
          Manage incoming orders, delivery dispatches across Kampala & verify mobile money receipts
        </p>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xs border border-[#E8E2D9]">
        <div className="relative w-full lg:w-72">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadOrders()}
            placeholder="Search by Order # or Customer..."
            className="w-full bg-[#FAF8F5] border border-[#D5CDC1] px-3 py-2 pl-9 text-xs text-[#1A1816] rounded-xs focus:outline-none focus:border-[#8E6C3B]"
          />
          <Search className="w-3.5 h-3.5 text-[#7A7165] absolute left-3 top-3" />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-[#7A7165]">Order Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#FAF8F5] border border-[#D5CDC1] px-2.5 py-1.5 rounded-xs text-[#1A1816]"
            >
              <option value="all">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[#7A7165]">Payment:</span>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="bg-[#FAF8F5] border border-[#D5CDC1] px-2.5 py-1.5 rounded-xs text-[#1A1816]"
            >
              <option value="all">All Payments</option>
              <option value="Paid">Paid</option>
              <option value="Pending Verification">Pending Verification</option>
              <option value="Unpaid">Unpaid</option>
              <option value="Failed">Failed</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>

          <button
            onClick={loadOrders}
            className="px-3 py-1.5 bg-[#1A1816] text-[#FAF8F5] text-xs font-medium rounded-xs"
          >
            Apply Filter
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-[#E8E2D9] rounded-xs shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#FAF8F5] border-b border-[#E8E2D9] text-[#7A7165] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 font-medium">Order Number</th>
                <th className="py-3 px-4 font-medium">Client Contact</th>
                <th className="py-3 px-4 font-medium">Delivery Destination</th>
                <th className="py-3 px-4 font-medium">Total (UGX)</th>
                <th className="py-3 px-4 font-medium">Order Status</th>
                <th className="py-3 px-4 font-medium">Payment Status</th>
                <th className="py-3 px-4 font-medium text-right">View Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFECE6]">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#7A7165]">
                    No orders match the selected filters.
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="py-3 px-4 font-semibold text-[#1A1816] tabular-nums">
                      {ord.order_number}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-[#1A1816] block">{ord.customer_name}</span>
                      <span className="text-[11px] text-[#7A7165] block">{ord.customer_phone}</span>
                    </td>
                    <td className="py-3 px-4 text-[#4A433A]">
                      <span className="block truncate max-w-xs">{ord.delivery_address}</span>
                      <span className="text-[11px] text-[#7A7165]">{ord.delivery_district}</span>
                    </td>
                    <td className="py-3 px-4 font-semibold tabular-nums text-[#1A1816]">
                      {formatPrice(ord.total_ugx)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-semibold ${
                          ord.status === 'Confirmed' || ord.status === 'Delivered'
                            ? 'bg-[#EBF6EE] text-[#2F6B45]'
                            : ord.status === 'Cancelled'
                            ? 'bg-[#FEE2E2] text-[#B91C1C]'
                            : 'bg-[#FEF3C7] text-[#92400E]'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-semibold ${
                          ord.payment_status === 'Paid'
                            ? 'bg-[#EBF6EE] text-[#2F6B45]'
                            : ord.payment_status === 'Failed'
                            ? 'bg-[#FEE2E2] text-[#B91C1C]'
                            : 'bg-[#FEF3C7] text-[#92400E]'
                        }`}
                      >
                        {ord.payment_status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => openOrderDetail(ord.id)}
                        className="px-3 py-1.5 bg-[#FAF8F5] hover:bg-[#EFECE6] border border-[#D5CDC1] text-[#1A1816] rounded transition-colors inline-flex items-center gap-1.5 font-medium cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 overflow-y-auto">
          <div className="bg-[#FAF8F5] border border-[#D5CDC1] rounded-lg max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto text-[#1A1816]">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-[#E8E2D9]">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#8E6C3B] font-semibold">
                  Order Dossier
                </span>
                <h3 className="font-editorial text-2xl font-bold">
                  Order #{selectedOrder.order_number}
                </h3>
                <p className="text-xs text-[#7A7165]">
                  Created {new Date(selectedOrder.created_at).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-[#7A7165] hover:text-[#1A1816] rounded-full hover:bg-[#EFECE6]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Modification Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-[#EFECE6]/70 rounded-xs text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#595045] mb-1">
                  Update Fulfillment Status:
                </label>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
                  className="w-full bg-white border border-[#D5CDC1] px-3 py-2 rounded text-xs font-semibold text-[#1A1816]"
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Processing">Processing (Atelier Tailoring)</option>
                  <option value="Shipped">Shipped (With Courier)</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#595045] mb-1">
                  Update Payment Status:
                </label>
                <select
                  value={selectedOrder.payment_status}
                  onChange={(e) => handleUpdatePayment(selectedOrder.id, e.target.value)}
                  className="w-full bg-white border border-[#D5CDC1] px-3 py-2 rounded text-xs font-semibold text-[#1A1816]"
                >
                  <option value="Unpaid">Unpaid</option>
                  <option value="Pending Verification">Pending Verification (MoMo/Airtel)</option>
                  <option value="Paid">Paid (Verified)</option>
                  <option value="Failed">Failed</option>
                  <option value="Refunded">Refunded</option>
                </select>
              </div>
            </div>

            {/* Line Items Snapshot */}
            <div className="space-y-3">
              <h4 className="text-xs uppercase tracking-wider font-semibold text-[#595045] border-b border-[#E8E2D9] pb-1.5">
                Purchased Pieces (Immutable Historic Snapshot)
              </h4>
              <div className="divide-y divide-[#EFECE6]">
                {selectedOrder.items?.map((item: any) => (
                  <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image_snapshot}
                        alt={item.product_name_snapshot}
                        referrerPolicy="no-referrer"
                        className="w-12 h-16 object-cover object-top rounded-xs border border-[#E8E2D9]"
                      />
                      <div>
                        <p className="font-medium text-[#1A1816]">{item.product_name_snapshot}</p>
                        <p className="text-[11px] text-[#7A7165]">
                          Size: {item.size_snapshot} {item.color_snapshot ? `· ${item.color_snapshot}` : ''} · Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-semibold tabular-nums text-[#1A1816]">
                      {formatPrice(item.line_total_ugx)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="pt-2 border-t border-[#E8E2D9] space-y-1 text-xs text-[#595045]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="tabular-nums">{formatPrice(selectedOrder.subtotal_ugx)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery ({selectedOrder.delivery_method})</span>
                  <span className="tabular-nums">{formatPrice(selectedOrder.delivery_fee_ugx)}</span>
                </div>
                {selectedOrder.discount_ugx > 0 && (
                  <div className="flex justify-between text-[#2F6B45]">
                    <span>Discount</span>
                    <span className="tabular-nums">- {formatPrice(selectedOrder.discount_ugx)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-[#1A1816] pt-1.5 border-t border-[#E8E2D9]">
                  <span>Total Amount</span>
                  <span className="tabular-nums font-body text-base">{formatPrice(selectedOrder.total_ugx)}</span>
                </div>
              </div>
            </div>

            {/* Customer Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-white border border-[#E8E2D9] rounded-xs text-xs">
              <div>
                <p className="font-semibold uppercase tracking-wider text-[#7A7165] mb-1">
                  Recipient Information
                </p>
                <p className="font-medium text-[#1A1816]">{selectedOrder.customer_name}</p>
                <p className="text-[#595045]">{selectedOrder.customer_phone}</p>
                <p className="text-[#595045]">{selectedOrder.customer_email}</p>
              </div>

              <div>
                <p className="font-semibold uppercase tracking-wider text-[#7A7165] mb-1">
                  Delivery Destination
                </p>
                <p className="text-[#1A1816]">{selectedOrder.delivery_address}</p>
                {selectedOrder.delivery_landmark && (
                  <p className="text-[#7A7165] italic">Landmark: {selectedOrder.delivery_landmark}</p>
                )}
                <p className="text-[#595045]">{selectedOrder.delivery_city}, {selectedOrder.delivery_district}</p>
                {selectedOrder.delivery_notes && (
                  <p className="text-[#8E6C3B] mt-1">Note: {selectedOrder.delivery_notes}</p>
                )}
              </div>
            </div>

            {/* Internal Notes */}
            <div className="space-y-2">
              <label className="block text-xs uppercase tracking-wider font-semibold text-[#595045]">
                Internal Atelier Notes (Staff Only)
              </label>
              <textarea
                rows={2}
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="e.g. Verified MTN MoMo payment receipt #948271. Dispatched with driver Ronald."
                className="w-full bg-white border border-[#D5CDC1] p-2.5 rounded text-xs text-[#1A1816]"
              />
              <button
                type="button"
                onClick={handleSaveNotes}
                className="px-4 py-1.5 bg-[#1A1816] text-[#FAF8F5] text-xs font-semibold rounded hover:bg-[#322D27]"
              >
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
