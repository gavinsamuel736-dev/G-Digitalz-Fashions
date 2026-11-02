import React, { useEffect, useState } from 'react';
import { CreditCard, Phone, CheckCircle, Shield, Edit2, X, AlertCircle } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { useShop } from '../../context/ShopContext';
import { PaymentMethodConfig } from '../../types';

export const AdminPayments: React.FC = () => {
  const { authFetch, showAdminNotification } = useAdmin();
  const { refreshStore } = useShop();

  const [methods, setMethods] = useState<PaymentMethodConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMethod, setEditingMethod] = useState<PaymentMethodConfig | null>(null);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const res = await authFetch('/api/admin/payments');
      if (res.ok) {
        const data = await res.json();
        setMethods(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMethod) return;

    try {
      const res = await authFetch(`/api/admin/payments/${editingMethod.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingMethod),
      });

      if (res.ok) {
        showAdminNotification(`Payment gateway "${editingMethod.name}" updated`);
        setEditingMethod(null);
        await loadPayments();
        await refreshStore();
      } else {
        alert('Failed to save payment method');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-xs text-[#7A7165]">Loading payment gateways...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[#E8E2D9]">
        <h2 className="font-editorial text-2xl font-semibold text-[#1A1816]">Uganda Payment Gateways & Gateways</h2>
        <p className="text-xs text-[#7A7165]">
          Enable or disable payment rails for customers (MTN Mobile Money, Airtel Money, Visa/Mastercard, Cash on Delivery)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {methods.map((method) => (
          <div key={method.id} className="bg-white border border-[#E8E2D9] rounded-xs p-6 shadow-xs space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                  method.provider.includes('mtn')
                    ? 'bg-[#FFCC00]/20 text-[#997A00]'
                    : method.provider.includes('airtel')
                    ? 'bg-[#FF2E2E]/10 text-[#D60000]'
                    : 'bg-[#EFECE6] text-[#1A1816]'
                }`}>
                  {method.provider.includes('momo') || method.provider.includes('airtel') ? (
                    <Phone className="w-4 h-4" />
                  ) : (
                    <CreditCard className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <h3 className="font-editorial text-lg font-medium text-[#1A1816]">{method.name}</h3>
                  <span className="text-[11px] text-[#7A7165] font-mono">{method.provider}</span>
                </div>
              </div>

              <button
                onClick={() => setEditingMethod(method)}
                className="p-1.5 text-[#4A433A] hover:text-[#1A1816] hover:bg-[#EFECE6] rounded"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 text-xs border-t border-[#EFECE6] pt-3">
              <div className="flex justify-between">
                <span className="text-[#7A7165]">Storefront Availability:</span>
                <span className={`font-semibold ${method.is_enabled ? 'text-[#2F6B45]' : 'text-[#A89885]'}`}>
                  {method.is_enabled ? 'Active at Checkout' : 'Disabled'}
                </span>
              </div>
              {method.merchant_account && (
                <div className="flex justify-between">
                  <span className="text-[#7A7165]">Merchant Account / MoMo #:</span>
                  <span className="font-semibold text-[#1A1816]">{method.merchant_account}</span>
                </div>
              )}
            </div>

            <p className="text-[11px] text-[#595045] bg-[#FAF8F5] p-2.5 rounded border border-[#E8E2D9]">
              {method.instructions}
            </p>
          </div>
        ))}
      </div>

      {/* Edit Payment Modal */}
      {editingMethod && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-[#FAF8F5] border border-[#D5CDC1] rounded-lg max-w-md w-full p-6 shadow-2xl space-y-4 text-[#1A1816]">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8E2D9]">
              <h3 className="font-editorial text-xl font-semibold">Configure {editingMethod.name}</h3>
              <button onClick={() => setEditingMethod(null)}>
                <X className="w-5 h-5 text-[#7A7165]" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#595045] mb-1">
                  Merchant Account / Registered Number
                </label>
                <input
                  type="text"
                  value={editingMethod.merchant_account || ''}
                  onChange={(e) => setEditingMethod({ ...editingMethod, merchant_account: e.target.value })}
                  placeholder="e.g. 0772 987 654 or MERCHANT_ID"
                  className="w-full bg-white border border-[#D5CDC1] px-3 py-2 rounded text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#595045] mb-1">
                  Customer Checkout Instructions
                </label>
                <textarea
                  rows={3}
                  value={editingMethod.instructions || ''}
                  onChange={(e) => setEditingMethod({ ...editingMethod, instructions: e.target.value })}
                  className="w-full bg-white border border-[#D5CDC1] px-3 py-2 rounded text-xs"
                />
              </div>

              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(editingMethod.is_enabled)}
                    onChange={(e) => setEditingMethod({ ...editingMethod, is_enabled: e.target.checked })}
                    className="accent-[#1A1816]"
                  />
                  <span className="font-semibold text-[#1A1816]">Enable this payment method on checkout</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(editingMethod.requires_verification)}
                    onChange={(e) =>
                      setEditingMethod({ ...editingMethod, requires_verification: e.target.checked })
                    }
                    className="accent-[#1A1816]"
                  />
                  <span className="text-[#595045]">Requires atelier phone verification before dispatch</span>
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-[#E8E2D9]">
                <button
                  type="button"
                  onClick={() => setEditingMethod(null)}
                  className="px-4 py-2 border border-[#D5CDC1] text-[#595045] rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1A1816] text-[#FAF8F5] font-semibold uppercase tracking-wider rounded"
                >
                  Save Gateway
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
