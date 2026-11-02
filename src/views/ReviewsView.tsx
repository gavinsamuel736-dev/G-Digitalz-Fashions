import React, { useState, useMemo } from 'react';
import { Star, ThumbsUp, CheckCircle, MessageSquare, PenTool, Award, Sparkles } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const ReviewsView: React.FC = () => {
  const { reviews, likeReview, setIsReviewModalOpen, products, openProductPage } = useShop();

  const [selectedRatingFilter, setSelectedRatingFilter] = useState<number | 'all'>('all');
  const [filterSearch, setFilterSearch] = useState('');

  const averageRating = (
    reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1)
  ).toFixed(1);

  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      if (selectedRatingFilter !== 'all' && r.rating !== selectedRatingFilter) {
        return false;
      }
      if (filterSearch.trim()) {
        const q = filterSearch.toLowerCase();
        return (
          r.author.toLowerCase().includes(q) ||
          r.location.toLowerCase().includes(q) ||
          r.productName.toLowerCase().includes(q) ||
          r.comment.toLowerCase().includes(q) ||
          r.title.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [reviews, selectedRatingFilter, filterSearch]);

  const ratingCounts = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      if (r.rating in counts) {
        counts[r.rating as keyof typeof counts]++;
      }
    });
    return counts;
  }, [reviews]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="pb-8 border-b border-[#E8E2D9]">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-[#8E6C3B] font-semibold">
              Patron Accolades & Feedback
            </span>
            <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#1A1816] mt-1">
              Client Journal & Reviews
            </h1>
          </div>
          <button
            onClick={() => setIsReviewModalOpen(true)}
            className="px-6 py-3 bg-[#1A1816] text-[#FAF8F5] text-xs uppercase tracking-widest font-semibold hover:bg-[#322D27] transition-colors flex items-center gap-2 self-start md:self-auto shadow-sm"
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Write a Client Review</span>
          </button>
        </div>
      </div>

      {/* Aggregate Rating & Verification Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-10 p-6 sm:p-8 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xs">
        {/* Left: Score Box (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col justify-center items-center text-center sm:border-r sm:border-[#E8E2D9] pr-0 sm:pr-8">
          <span className="text-[11px] uppercase tracking-widest text-[#7A7165] font-semibold">
            Overall Client Satisfaction
          </span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="font-editorial text-5xl font-bold text-[#1A1816]">{averageRating}</span>
            <span className="text-[#7A7165] font-editorial text-xl">/ 5.0</span>
          </div>
          <div className="flex items-center gap-1 text-[#8E6C3B] my-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="w-4 h-4 fill-current" />
            ))}
          </div>
          <p className="text-xs text-[#7A7165]">
            Based on <span className="font-semibold text-[#1A1816]">{reviews.length} verified client reviews</span>
          </p>
          <span className="mt-2 text-[10px] text-[#2F6B45] font-semibold bg-[#EBF6EE] px-2.5 py-0.5 rounded">
            99.2% Client Reorder Rate
          </span>
        </div>

        {/* Center: Rating Distribution (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col justify-center space-y-2 text-xs">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = ratingCounts[stars as keyof typeof ratingCounts] || 0;
            const pct = Math.round((count / (reviews.length || 1)) * 100);
            return (
              <div key={stars} className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedRatingFilter(selectedRatingFilter === stars ? 'all' : stars)}
                  className="flex items-center gap-1 w-14 hover:text-[#8E6C3B]"
                >
                  <span className="font-semibold text-[#1A1816]">{stars}</span>
                  <Star className="w-3 h-3 fill-[#8E6C3B] text-[#8E6C3B]" />
                </button>
                <div className="flex-1 bg-[#E8E2D9] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#8E6C3B] h-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-8 text-right text-[11px] text-[#7A7165] tabular-nums">
                  {count}
                </span>
              </div>
            );
          })}
        </div>

        {/* Right: Atelier Guarantee (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col justify-center bg-[#EFECE6] p-5 rounded-xs space-y-2 text-xs text-[#4A433A]">
          <div className="flex items-center gap-2 font-semibold text-[#1A1816]">
            <Award className="w-4 h-4 text-[#8E6C3B]" />
            <span>Kampala Atelier Quality Standard</span>
          </div>
          <p className="leading-relaxed">
            Every review is gathered from genuine patrons who commissioned bespoke tailoring or ordered from our Kampala collection.
          </p>
          <div className="pt-1 flex items-center gap-1.5 text-[#2F6B45] font-medium">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>100% Authentic Verified Client Testimonials</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar for Reviews */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 border-b border-[#E8E2D9]">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#7A7165]">Filter by rating:</span>
          <button
            onClick={() => setSelectedRatingFilter('all')}
            className={`px-3 py-1 rounded-xs transition-colors ${
              selectedRatingFilter === 'all'
                ? 'bg-[#1A1816] text-[#FAF8F5]'
                : 'bg-[#EFECE6] text-[#595045] hover:text-[#1A1816]'
            }`}
          >
            All Ratings ({reviews.length})
          </button>
          {[5, 4].map((star) => (
            <button
              key={star}
              onClick={() => setSelectedRatingFilter(star)}
              className={`px-3 py-1 rounded-xs transition-colors ${
                selectedRatingFilter === star
                  ? 'bg-[#1A1816] text-[#FAF8F5]'
                  : 'bg-[#EFECE6] text-[#595045] hover:text-[#1A1816]'
              }`}
            >
              {star} Stars
            </button>
          ))}
        </div>

        <input
          type="text"
          value={filterSearch}
          onChange={(e) => setFilterSearch(e.target.value)}
          placeholder="Search by patron name, town, or garment..."
          className="w-full sm:w-64 bg-white border border-[#D5CDC1] px-3 py-1.5 text-xs text-[#1A1816] rounded-xs focus:outline-none focus:border-[#8E6C3B]"
        />
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
        {filteredReviews.map((rev) => (
          <div
            key={rev.id}
            className="p-6 bg-[#FAF8F5] border border-[#E8E2D9] rounded-xs space-y-4 hover:shadow-sm transition-all"
          >
            {/* Top row */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1 text-[#8E6C3B]">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <h3 className="font-editorial text-lg font-semibold text-[#1A1816] mt-1.5 leading-snug">
                  {rev.title}
                </h3>
              </div>
              <span className="text-[11px] text-[#7A7165]">{rev.date}</span>
            </div>

            {/* Comment */}
            <p className="text-xs text-[#595045] leading-relaxed">
              &ldquo;{rev.comment}&rdquo;
            </p>

            {/* Garment tag */}
            <div className="pt-2 text-xs text-[#7A7165] flex items-center justify-between border-t border-[#EFECE6]">
              <div>
                <span className="font-semibold text-[#1A1816]">{rev.author}</span>
                <span className="text-[11px] text-[#7A7165] ml-1.5">· {rev.location}</span>
                <p className="text-[11px] text-[#8E6C3B] font-medium mt-0.5">
                  Piece: {rev.productName}
                </p>
              </div>

              {/* Likes / Helpful */}
              <button
                onClick={() => likeReview(rev.id)}
                className="flex items-center gap-1.5 text-xs text-[#7A7165] hover:text-[#1A1816] transition-colors p-1"
                title="Mark this review as helpful"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span className="tabular-nums font-medium">{rev.likes}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
