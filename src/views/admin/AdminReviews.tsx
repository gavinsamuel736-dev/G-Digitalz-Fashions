import React, { useEffect, useState } from 'react';
import { Star, CheckCircle, XCircle, Trash2, ShieldCheck, Check } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { useShop } from '../../context/ShopContext';
import { Review } from '../../types';

export const AdminReviews: React.FC = () => {
  const { authFetch, showAdminNotification } = useAdmin();
  const { refreshStore } = useShop();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const res = await authFetch('/api/admin/reviews');
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleUpdateStatus = async (reviewId: string, status: 'approved' | 'rejected') => {
    try {
      const res = await authFetch(`/api/admin/reviews/${reviewId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        showAdminNotification(`Review marked as ${status}`);
        await loadReviews();
        await refreshStore();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleVerified = async (review: Review) => {
    try {
      const res = await authFetch(`/api/admin/reviews/${review.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified_buyer: !review.verifiedBuyer }),
      });
      if (res.ok) {
        showAdminNotification('Verified purchase tag updated');
        await loadReviews();
        await refreshStore();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this customer review?')) return;
    try {
      const res = await authFetch(`/api/admin/reviews/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showAdminNotification('Review deleted');
        await loadReviews();
        await refreshStore();
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-xs text-[#7A7165]">Loading customer reviews...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[#E8E2D9]">
        <h2 className="font-editorial text-2xl font-semibold text-[#1A1816]">Customer Reviews Moderation</h2>
        <p className="text-xs text-[#7A7165]">
          Approve or reject customer submissions. Only approved reviews appear on the live storefront.
        </p>
      </div>

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="py-12 text-center text-xs text-[#7A7165]">No reviews recorded yet.</p>
        ) : (
          reviews.map((rev) => (
            <div
              key={rev.id}
              className={`bg-white border rounded-xs p-6 shadow-xs space-y-3 transition-colors ${
                rev.status === 'pending'
                  ? 'border-[#8E6C3B] bg-[#FFFDF9]'
                  : 'border-[#E8E2D9]'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#EFECE6]">
                <div>
                  <div className="flex items-center gap-1.5 text-[#8E6C3B]">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                    <span className="text-xs font-bold text-[#1A1816] ml-1">
                      {rev.productName || rev.product_name}
                    </span>
                  </div>
                  <h4 className="font-editorial text-base font-semibold text-[#1A1816] mt-1">
                    &ldquo;{rev.title}&rdquo;
                  </h4>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded ${
                      rev.status === 'approved'
                        ? 'bg-[#EBF6EE] text-[#2F6B45]'
                        : rev.status === 'rejected'
                        ? 'bg-[#FEE2E2] text-[#B91C1C]'
                        : 'bg-[#FEF3C7] text-[#92400E]'
                    }`}
                  >
                    {rev.status}
                  </span>

                  <button
                    onClick={() => handleToggleVerified(rev)}
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded border transition-colors ${
                      rev.verifiedBuyer || rev.verified_buyer
                        ? 'bg-[#EBF6EE] text-[#2F6B45] border-[#BDE3C8]'
                        : 'bg-white text-[#7A7165] border-[#D5CDC1]'
                    }`}
                  >
                    {rev.verifiedBuyer || rev.verified_buyer ? '✓ Verified Buyer' : 'Unverified'}
                  </button>
                </div>
              </div>

              <p className="text-xs text-[#595045] leading-relaxed">
                {rev.comment}
              </p>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs border-t border-[#EFECE6]">
                <div className="text-[#7A7165]">
                  <span className="font-semibold text-[#1A1816]">{rev.author}</span>
                  <span className="ml-1">· {rev.location}</span>
                </div>

                <div className="flex items-center gap-2">
                  {rev.status !== 'approved' && (
                    <button
                      onClick={() => handleUpdateStatus(rev.id, 'approved')}
                      className="px-3 py-1.5 bg-[#2F6B45] hover:bg-[#255536] text-white text-[11px] font-semibold rounded flex items-center gap-1 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve for Live Store</span>
                    </button>
                  )}
                  {rev.status !== 'rejected' && (
                    <button
                      onClick={() => handleUpdateStatus(rev.id, 'rejected')}
                      className="px-3 py-1.5 border border-[#B91C1C] text-[#B91C1C] hover:bg-[#FEE2E2] text-[11px] font-semibold rounded flex items-center gap-1 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(rev.id)}
                    className="p-1.5 text-[#7A7165] hover:text-[#B91C1C] rounded"
                    title="Delete review permanently"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
