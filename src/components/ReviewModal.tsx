import React, { useState } from 'react';
import { X, Star } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const ReviewModal: React.FC = () => {
  const { isReviewModalOpen, setIsReviewModalOpen, submitReview, products, branding } = useShop();

  const [author, setAuthor] = useState('');
  const [location, setLocation] = useState('Kampala, Uganda');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [productName, setProductName] = useState(products[0]?.name || 'The Kampala Imperial Silk Gown');
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isReviewModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !comment.trim() || !title.trim()) return;

    setSubmitting(true);
    const chosenProduct = products.find((p) => p.name === productName);
    await submitReview({
      author: author.trim(),
      location: location.trim(),
      rating,
      productName,
      productId: chosenProduct?.id,
      title: title.trim(),
      comment: comment.trim(),
    });

    setSubmitting(false);
    setIsReviewModalOpen(false);
    setAuthor('');
    setTitle('');
    setComment('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div
        onClick={() => setIsReviewModalOpen(false)}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      <div className="relative bg-[#FAF8F5] border border-[#D5CDC1] rounded-lg max-w-lg w-full p-6 sm:p-8 shadow-2xl z-10 text-[#1A1816]">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-[#E8E2D9]">
          <div>
            <h3 className="font-editorial text-2xl font-semibold">Share Your Experience</h3>
            <p className="text-xs text-[#7A7165]">Review a piece tailored by {branding?.storeName || 'G-Digitalz Fashions'}</p>
          </div>
          <button
            onClick={() => setIsReviewModalOpen(false)}
            className="p-1.5 text-[#7A7165] hover:text-[#1A1816] rounded-full hover:bg-[#EFECE6]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-xs">
          {/* Rating */}
          <div>
            <label className="block uppercase tracking-wider font-semibold text-[#595045] mb-1.5">
              Your Rating
            </label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 text-[#8E6C3B] focus:outline-none"
                >
                  <Star
                    className={`w-5 h-5 ${
                      (hoverRating || rating) >= star
                        ? 'fill-[#8E6C3B] text-[#8E6C3B]'
                        : 'text-[#D5CDC1]'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 font-medium text-[#1A1816]">
                {rating === 5 ? 'Exceptional (5/5)' : `${rating} Stars`}
              </span>
            </div>
          </div>

          {/* Product Select */}
          <div>
            <label className="block uppercase tracking-wider font-semibold text-[#595045] mb-1">
              Garment / Accessory
            </label>
            <select
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full bg-white border border-[#D5CDC1] rounded px-3 py-2 text-xs text-[#1A1816] focus:outline-none focus:border-[#8E6C3B]"
            >
              {products.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block uppercase tracking-wider font-semibold text-[#595045] mb-1">
                Your Full Name
              </label>
              <input
                type="text"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g. Christine Namuganza"
                className="w-full bg-white border border-[#D5CDC1] rounded px-3 py-2 text-xs text-[#1A1816] focus:outline-none focus:border-[#8E6C3B]"
              />
            </div>
            <div>
              <label className="block uppercase tracking-wider font-semibold text-[#595045] mb-1">
                Location (City / District)
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Kololo, Kampala"
                className="w-full bg-white border border-[#D5CDC1] rounded px-3 py-2 text-xs text-[#1A1816] focus:outline-none focus:border-[#8E6C3B]"
              />
            </div>
          </div>

          {/* Review Title */}
          <div>
            <label className="block uppercase tracking-wider font-semibold text-[#595045] mb-1">
              Headline
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Exquisite tailoring, turned heads at the reception"
              className="w-full bg-white border border-[#D5CDC1] rounded px-3 py-2 text-xs text-[#1A1816] focus:outline-none focus:border-[#8E6C3B]"
            />
          </div>

          {/* Review Comment */}
          <div>
            <label className="block uppercase tracking-wider font-semibold text-[#595045] mb-1">
              Detailed Review
            </label>
            <textarea
              required
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Describe the fabric quality, fit, tailoring details, packaging, and delivery experience..."
              className="w-full bg-white border border-[#D5CDC1] rounded px-3 py-2 text-xs text-[#1A1816] focus:outline-none focus:border-[#8E6C3B]"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsReviewModalOpen(false)}
              className="px-4 py-2 border border-[#D5CDC1] text-[#595045] rounded hover:bg-[#EFECE6]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#1A1816] text-[#FAF8F5] uppercase tracking-wider font-medium rounded hover:bg-[#322D27]"
            >
              Publish Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
