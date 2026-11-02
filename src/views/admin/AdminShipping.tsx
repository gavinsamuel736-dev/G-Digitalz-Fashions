import React, { useEffect, useState } from 'react';
import { Truck, Check, Edit2, Save, X, AlertCircle } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { useShop } from '../../context/ShopContext';
import { ShippingZone } from '../../types';

export const AdminShipping: React.FC = () => {
  const { authFetch, showAdminNotification } = useAdmin();
  const { formatPrice, refreshStore } = useShop();

  const [zones, setZones] = useState<ShippingZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingZone, setEditingZone] = useState<ShippingZone | null>(null);

  const loadZones = async () => {
    try {
      setLoading(true);
      const res = await authFetch('/api/admin/shipping');
      if (res.ok) {
        const data = await res.json();
        setZones(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadZones();
  }, []);

  const handleSaveZone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingZone) return;

    try {
      const res = await authFetch(`/api/admin/shipping/${editingZone.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingZone),
      });

      if (res.ok) {
        showAdminNotification(`Shipping zone "${editingZone.name}" updated`);
        setEditingZone(null);
        await loadZones();
        await refreshStore();
      } else {
        alert('Failed to update zone');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-xs text-[#7A7165]">Loading shipping settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[#E8E2D9]">
        <h2 className="font-editorial text-2xl font-semibold text-[#1A1816]">Shipping & Delivery Configuration</h2>
        <p className="text-xs text-[#7A7165]">
          Set delivery zones, fees in UGX, courier dispatch times, and free shipping thresholds applied during checkout
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {zones.map((zone) => (
          <div key={zone.id} className="bg-white border border-[#E8E2D9] rounded-xs p-6 shadow-xs space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#EFECE6] flex items-center justify-center text-[#8E6C3B]">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-editorial text-lg font-medium text-[#1A1816]">{zone.name}</h3>
                  <span className="text-[11px] text-[#7A7165]">{zone.estimated_time}</span>
                </div>
              </div>
              <button
                onClick={() => setEditingZone(zone)}
                className="p-1.5 text-[#4A433A] hover:text-[#1A1816] hover:bg-[#EFECE6] rounded"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 pt-2 text-xs border-t border-[#EFECE6]">
              <div className="flex justify-between">
                <span className="text-[#7A7165]">Delivery Fee:</span>
                <span className="font-bold text-[#1A1816] tabular-nums">{formatPrice(zone.fee_ugx)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7A7165]">Free Delivery Above:</span>
                <span className="font-medium tabular-nums">{formatPrice(zone.free_threshold_ugx)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7A7165]">Status:</span>
                <span className={`font-semibold ${zone.is_active ? 'text-[#2F6B45]' : 'text-[#A89885]'}`}>
                  {zone.is_active ? 'Active at Checkout' : 'Disabled'}
                </span>
              </div>
            </div>

            {zone.notes && (
              <p className="text-[11px] text-[#595045] bg-[#FAF8F5] p-2.5 rounded-xs border border-[#E8E2D9]">
                {zone.notes}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Edit Zone Modal */}
      {editingZone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-[#FAF8F5] border border-[#D5CDC1] rounded-lg max-w-md w-full p-6 shadow-2xl space-y-4 text-[#1A1816]">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8E2D9]">
              <h3 className="font-editorial text-xl font-semibold">Edit Shipping Zone</h3>
              <button onClick={() => setEditingZone(null)}>
                <X className="w-5 h-5 text-[#7A7165]" />
              </button>
            </div>

            <form onSubmit={handleSaveZone} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#595045] mb-1">
                  Zone Title
                </label>
                <input
                  type="text"
                  required
                  value={editingZone.name}
                  onChange={(e) => setEditingZone({ ...editingZone, name: e.target.value })}
                  className="w-full bg-white border border-[#D5CDC1] px-3 py-2 rounded text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#595045] mb-1">
                    Delivery Fee (UGX)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    required
                    value={editingZone.fee_ugx}
                    onChange={(e) => setEditingZone({ ...editingZone, fee_ugx: Number(e.target.value) })}
                    className="w-full bg-white border border-[#D5CDC1] px-3 py-2 rounded text-xs font-semibold tabular-nums"
                  />
                </div>
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-[#595045] mb-1">
                    Free Threshold (UGX)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={50000}
                    required
                    value={editingZone.free_threshold_ugx}
                    onChange={(e) =>
                      setEditingZone({ ...editingZone, free_threshold_ugx: Number(e.target.value) })
                    }
                    className="w-full bg-white border border-[#D5CDC1] px-3 py-2 rounded text-xs tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#595045] mb-1">
                  Estimated Delivery Time
                </label>
                <input
                  type="text"
                  required
                  value={editingZone.estimated_time}
                  onChange={(e) => setEditingZone({ ...editingZone, estimated_time: e.target.value })}
                  className="w-full bg-white border border-[#D5CDC1] px-3 py-2 rounded text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#595045] mb-1">
                  Courier Notes / Instructions
                </label>
                <textarea
                  rows={2}
                  value={editingZone.notes || ''}
                  onChange={(e) => setEditingZone({ ...editingZone, notes: e.target.value })}
                  className="w-full bg-white border border-[#D5CDC1] px-3 py-2 rounded text-xs"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(editingZone.is_active)}
                    onChange={(e) => setEditingZone({ ...editingZone, is_active: e.target.checked })}
                    className="accent-[#1A1816]"
                  />
                  <span className="font-semibold text-[#1A1816]">Active and selectable during checkout</span>
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-[#E8E2D9]">
                <button
                  type="button"
                  onClick={() => setEditingZone(null)}
                  className="px-4 py-2 border border-[#D5CDC1] text-[#595045] rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1A1816] text-[#FAF8F5] font-semibold uppercase tracking-wider rounded"
                >
                  Save Zone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
