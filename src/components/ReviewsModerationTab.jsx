import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import {
  MessageSquare,
  Star,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Package,
  Calendar,
  ThumbsUp,
  Loader2
} from 'lucide-react';

export default function ReviewsModerationTab({ onShowNotice }) {
  const token = useSelector((state) => state.auth.token);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState('ALL');
  const [deletingId, setDeletingId] = useState(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/reviews/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setReviews(res.data.data || []);
      }
    } catch (err) {
      console.error('Error loading reviews:', err);
      if (onShowNotice) {
        onShowNotice(err.response?.data?.message || 'Failed to load reviews', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchReviews();
    }
  }, [token]);

  const handleDeleteReview = async (review) => {
    const confirmMsg = `Are you sure you want to permanently delete this comment from "${review.reviewer_name}" on "${review.product_name || 'Product'}"?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      setDeletingId(review.id);
      const res = await axios.delete(`http://localhost:5000/api/reviews/${review.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setReviews((prev) => prev.filter((r) => r.id !== review.id));
        if (onShowNotice) {
          onShowNotice(`Comment #${review.id} deleted successfully.`, 'success');
        }
      }
    } catch (err) {
      console.error('Failed to delete review:', err);
      alert(err.response?.data?.message || 'Failed to delete review');
    } finally {
      setDeletingId(null);
    }
  };

  // Filter reviews
  const filteredReviews = reviews.filter((r) => {
    const matchesSearch =
      (r.reviewer_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.product_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.comment || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRating =
      ratingFilter === 'ALL' || Number(r.rating) === Number(ratingFilter);

    return matchesSearch && matchesRating;
  });

  // Calculate Metrics
  const totalReviews = reviews.length;
  const avgRating =
    totalReviews > 0
      ? (reviews.reduce((acc, r) => acc + Number(r.rating), 0) / totalReviews).toFixed(1)
      : '5.0';
  const fiveStarCount = reviews.filter((r) => Number(r.rating) === 5).length;
  const verifiedCount = reviews.filter((r) => r.is_verified_purchase).length;

  return (
    <div className="space-y-6 animate-fade-in font-body text-xs text-[#F5EFC6]">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#4D0E12] text-[#F5EFC6] border border-[#F5EFC6]/30">
              Administrative Control
            </span>
            <span className="text-xs text-[#A5BCD6] font-subhead">Storewide Moderation Desk</span>
          </div>
          <h2 className="font-headline font-black text-2xl uppercase tracking-tight text-[#F5EFC6] flex items-center space-x-2">
            <MessageSquare className="w-6 h-6 text-amber-400" />
            <span>Customer Reviews & Comments Moderation</span>
          </h2>
          <p className="font-body text-xs text-[#A5BCD6]">
            Review, audit, or delete customer comments across all coffee gummy products.
          </p>
        </div>

        <button
          onClick={fetchReviews}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl bg-[#2F201C] hover:bg-[#4A2E27] text-[#F5EFC6] font-subhead font-bold uppercase tracking-wider border border-[#4A2E27] hover:border-[#F5EFC6]/30 transition-all flex items-center space-x-2 self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#A5BCD6] ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Comments</span>
        </button>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-[#2F201C] border border-[#4A2E27] shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-subhead uppercase tracking-wider text-[#A5BCD6] font-bold">Total Reviews</span>
            <MessageSquare className="w-4 h-4 text-amber-400" />
          </div>
          <span className="font-headline font-black text-2xl text-[#F5EFC6] block">{totalReviews}</span>
          <span className="text-[10px] text-[#A5BCD6]/70">Published across all products</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#2F201C] border border-[#4A2E27] shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-subhead uppercase tracking-wider text-[#A5BCD6] font-bold">Store Average</span>
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="font-headline font-black text-2xl text-amber-300">{avgRating}</span>
            <span className="text-xs text-[#A5BCD6]">/ 5.0</span>
          </div>
          <span className="text-[10px] text-[#A5BCD6]/70">Aggregated customer satisfaction</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#2F201C] border border-[#4A2E27] shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-subhead uppercase tracking-wider text-[#A5BCD6] font-bold">5-Star Ratings</span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="font-headline font-black text-2xl text-emerald-400 block">{fiveStarCount}</span>
          <span className="text-[10px] text-[#A5BCD6]/70">
            {totalReviews > 0 ? Math.round((fiveStarCount / totalReviews) * 100) : 0}% of all reviews
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#2F201C] border border-[#4A2E27] shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-subhead uppercase tracking-wider text-[#A5BCD6] font-bold">Verified Purchases</span>
            <CheckCircle2 className="w-4 h-4 text-sky-400" />
          </div>
          <span className="font-headline font-black text-2xl text-sky-400 block">{verifiedCount}</span>
          <span className="text-[10px] text-[#A5BCD6]/70">Verified roastery patrons</span>
        </div>
      </div>

      {/* SEARCH & FILTERS BAR */}
      <div className="bg-[#2F201C] p-3 sm:p-4 rounded-2xl border border-[#4A2E27] flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#A5BCD6] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, product, or comment keywords..."
            className="w-full bg-[#18100E] border border-[#4A2E27] rounded-xl pl-9 pr-4 py-2 text-xs text-[#F5EFC6] focus:outline-none focus:border-[#A5BCD6]"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5 text-[#A5BCD6]" />
          <span className="text-[10px] uppercase font-bold text-[#A5BCD6] font-subhead">Filter Rating:</span>
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            style={{ colorScheme: 'dark' }}
            className="bg-[#18100E] border border-[#4A2E27] text-[#F5EFC6] rounded-xl px-3 py-2 text-xs font-subhead font-bold focus:outline-none focus:border-[#A5BCD6]"
          >
            <option value="ALL">All Ratings ({reviews.length})</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>
        </div>
      </div>

      {/* REVIEWS LIST */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center bg-[#2F201C] border border-[#4A2E27] rounded-3xl">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin mx-auto mb-2" />
            <p className="text-xs text-[#A5BCD6]">Loading all customer reviews from roastery database...</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="p-12 text-center bg-[#2F201C] border border-[#4A2E27] rounded-3xl space-y-2">
            <MessageSquare className="w-8 h-8 text-[#A5BCD6]/40 mx-auto" />
            <p className="text-sm font-headline font-bold text-[#F5EFC6]">No customer reviews found</p>
            <p className="text-xs text-[#A5BCD6]">
              {searchQuery || ratingFilter !== 'ALL'
                ? 'Try adjusting your search keywords or rating filter.'
                : 'Customer reviews will appear here once published on products.'}
            </p>
          </div>
        ) : (
          filteredReviews.map((rev) => (
            <div
              key={rev.id}
              className="p-4 sm:p-5 rounded-2xl bg-[#2F201C] border-2 border-[#4A2E27] hover:border-[#A5BCD6]/40 transition-all space-y-3 shadow-lg"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#4A2E27]">
                
                {/* Left: Product & Reviewer Info */}
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#18100E] border border-[#4A2E27] flex-shrink-0">
                    <img
                      src={rev.product_image || '/assets/brand/packaging-canisters.jpg'}
                      alt={rev.product_name || 'Product'}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = '/assets/brand/packaging-canisters.jpg'; }}
                    />
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-headline font-black text-sm text-[#F5EFC6]">
                        {rev.product_name || `Product #${rev.product_id}`}
                      </span>
                      <span className="text-[10px] font-subhead text-[#A5BCD6] bg-[#18100E] px-2 py-0.5 rounded-lg border border-[#4A2E27]">
                        Review #{rev.id}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <span className="font-bold text-[#A5BCD6]">{rev.reviewer_name}</span>
                      {rev.is_verified_purchase ? (
                        <span className="text-[9px] font-subhead text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800 flex items-center space-x-1">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                          <span>Verified Purchase</span>
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Right: Date and Delete Action */}
                <div className="flex items-center space-x-3 self-end sm:self-auto">
                  <div className="text-right">
                    <span className="text-[10px] text-[#A5BCD6] font-subhead block">
                      {new Date(rev.created_at).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                    <span className="text-[9px] text-[#A5BCD6]/60 font-mono">
                      {new Date(rev.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* ADMIN DELETE BUTTON */}
                  <button
                    onClick={() => handleDeleteReview(rev)}
                    disabled={deletingId === rev.id}
                    className="px-3 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900 text-red-200 border border-red-700/60 hover:border-red-500 text-xs font-subhead font-bold uppercase tracking-wider flex items-center space-x-1.5 transition-all active:scale-95 disabled:opacity-50"
                    title="Permanently delete this comment as Administrator"
                  >
                    {deletingId === rev.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-red-400" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    )}
                    <span>Delete Comment</span>
                  </button>
                </div>
              </div>

              {/* STARS & HEADLINE */}
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={`w-3.5 h-3.5 ${
                        s <= rev.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-600'
                      }`}
                    />
                  ))}
                </div>
                {rev.title && (
                  <h4 className="font-headline font-bold text-xs text-[#F5EFC6]">
                    "{rev.title}"
                  </h4>
                )}
              </div>

              {/* COMMENT BODY */}
              <p className="font-body text-xs text-[#F5EFC6]/90 bg-[#18100E] p-3 rounded-xl border border-[#4A2E27] leading-relaxed">
                {rev.comment}
              </p>

              {/* FOOTER METADATA */}
              <div className="flex items-center justify-between text-[10px] text-[#A5BCD6] font-subhead pt-1">
                <div className="flex items-center space-x-3">
                  <span>Author User ID: <strong className="font-mono text-[#F5EFC6]">{rev.user_id || 'Guest Patron'}</strong></span>
                  <span>•</span>
                  <span>Product ID: <strong className="font-mono text-[#F5EFC6]">{rev.product_id}</strong></span>
                </div>
                {rev.updated_at && rev.created_at && new Date(rev.updated_at).getTime() - new Date(rev.created_at).getTime() > 2000 && (
                  <span className="italic text-[#A5BCD6]/70">
                    Edited by user on {new Date(rev.updated_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
