import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setSelectedProduct } from '../store/productsSlice';
import { addToCart, openCheckout } from '../store/cartSlice';
import { openReturnPolicyModal } from '../store/settingsSlice';
import { trackPageView, trackProductEvent } from '../services/analytics';
import BrandLogo from './BrandLogo';
import axios from 'axios';
import { 
  X, 
  ShoppingBag, 
  Check, 
  Sparkles, 
  Zap, 
  Leaf, 
  Coffee, 
  ShieldCheck, 
  Package,
  RotateCcw,
  Truck,
  MapPin,
  Star,
  CheckCircle2,
  MessageSquare,
  ThumbsUp,
  CreditCard,
  Send,
  Repeat,
  CheckSquare,
  Square,
  HelpCircle,
  Plus,
  ChevronDown,
  ChevronUp,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { openAuthModal } from '../store/authSlice';

export default function ProductDetailModal() {
  const dispatch = useDispatch();
  const product = useSelector((state) => state.products.selectedProduct);
  const allProducts = useSelector((state) => state.products.items);
  const { isAuthenticated, user, token, isAdmin } = useSelector((state) => state.auth);
  const { settings } = useSelector((state) => state.settings);

  const [quantity, setQuantity] = useState(1);
  const [packFormat, setPackFormat] = useState('Single Canister (5 Gummies)');
  const [justAdded, setJustAdded] = useState(false);

  // Subscribe & Save State (Amazon/Flipkart Feature)
  const [isSubscription, setIsSubscription] = useState(false);
  const [subscriptionFrequency, setSubscriptionFrequency] = useState('Every 1 Month (Recommended)');

  // Frequently Bought Together Bundle State (Commented out)
  // const complementaryProduct = (allProducts || []).find((p) => p.id !== product?.id) || null;
  // const [bundleIncludeAddon, setBundleIncludeAddon] = useState(true);
  // const [bundleAdded, setBundleAdded] = useState(false);

  // Community Q&A State
  const [questions, setQuestions] = useState([]);
  const [isAskingQuestion, setIsAskingQuestion] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [askerName, setAskerName] = useState(user?.name || '');
  const [questionSubmitting, setQuestionSubmitting] = useState(false);
  const [questionSuccessMsg, setQuestionSuccessMsg] = useState('');

  // Delivery Pincode Estimator State (Amazon/Flipkart feature - India Exclusive)
  const [pincode, setPincode] = useState('560001');
  const [pincodeChecked, setPincodeChecked] = useState(true);
  const [pincodeError, setPincodeError] = useState('');
  const [estimatedDeliveryText, setEstimatedDeliveryText] = useState('🇮🇳 Express Delivery to 560001 (India) by Thursday, 2 PM (Within 2-3 Days)');

  // Customer Reviews State (Amazon/Flipkart feature)
  const [reviewsData, setReviewsData] = useState({
    average_rating: 4.8,
    count: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    reviews: []
  });
  const [isWritingReview, setIsWritingReview] = useState(false);
  const [newReviewForm, setNewReviewForm] = useState({
    rating: 5,
    title: '',
    comment: '',
    reviewer_name: user?.name || ''
  });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState('');

  // Review Edit/Delete States
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editingReviewForm, setEditingReviewForm] = useState({
    rating: 5,
    title: '',
    comment: ''
  });
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [deleteSubmittingId, setDeleteSubmittingId] = useState(null);

  useEffect(() => {
    if (user?.name && !newReviewForm.reviewer_name) {
      setNewReviewForm((prev) => ({ ...prev, reviewer_name: user.name }));
    }
  }, [user?.name]);

  // Fetch reviews & community Q&A whenever selected product changes
  useEffect(() => {
    if (product?.id) {
      trackPageView(`/product/${product.id}`, `Gummy Details - ${product.name}`);
      trackProductEvent(product.id, 'view');

      // Fetch reviews from backend
      axios.get(`http://localhost:5000/api/reviews/product/${product.id}`)
        .then((res) => {
          if (res.data.success) {
            setReviewsData({
              average_rating: res.data.average_rating,
              count: res.data.count,
              distribution: res.data.distribution,
              reviews: res.data.reviews
            });
          }
        })
        .catch((err) => {
          console.warn('Could not load reviews:', err.message);
        });

      // Fetch Community Q&A from backend
      axios.get(`http://localhost:5000/api/marketplace/questions/${product.id}`)
        .then((res) => {
          if (res.data.success) {
            setQuestions(res.data.data || []);
          }
        })
        .catch((err) => {
          console.warn('Could not load Q&A:', err.message);
        });
    }
  }, [product?.id]);

  if (!product) return null;

  const isOutOfStock = product.stock_quantity <= 0;
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 10;

  const deliveryCharge = Number(settings?.delivery_charge ?? 55);
  const freeThreshold = Number(settings?.free_delivery_item_threshold ?? 2);
  const freeMinOrder = Number(settings?.free_delivery_min_order ?? 500);
  const returnDays = settings?.return_window_days || 7;

  // Subscribe & Save pricing math
  const effectiveProduct = isSubscription
    ? { ...product, price: (parseFloat(product.price) * 0.9).toFixed(2) }
    : product;
  const effectiveGrind = isSubscription
    ? `${packFormat} [Subscribe & Save: ${subscriptionFrequency}]`
    : packFormat;

  // Handle Pincode Check (Strict India Shipping Criteria)
  const handleCheckPincode = (e) => {
    e.preventDefault();
    setPincodeError('');

    const cleanPin = (pincode || '').trim();
    const indianPinRegex = /^[1-9][0-9]{5}$/;

    if (!cleanPin) {
      setPincodeError('Please enter your 6-digit Indian Postal PIN code (e.g. 560001).');
      setPincodeChecked(false);
      return;
    }

    if (!indianPinRegex.test(cleanPin)) {
      setPincodeError('We currently only ship within India. Please enter a valid 6-digit Indian Postal PIN code (100001 - 999999). International shipping is not available.');
      setPincodeChecked(false);
      return;
    }

    const daysFromNow = new Date();
    daysFromNow.setDate(daysFromNow.getDate() + 2);
    const dateStr = daysFromNow.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });
    setEstimatedDeliveryText(`🇮🇳 Pan-India Express Delivery to PIN ${cleanPin} by ${dateStr} • Dispatched via Roastery Express Hub`);
    setPincodeChecked(true);
  };

  const handleAddToCart = () => {
    trackProductEvent(product.id, 'add_to_cart');

    if (!isAuthenticated) {
      dispatch(setSelectedProduct(null));
      dispatch(
        openAuthModal({
          mode: 'login',
          reason: `Please sign in or create an account to add "${product.name}" to your cart.`,
          pendingAction: {
            type: 'addToCart',
            payload: { product: effectiveProduct, quantity, grindType: effectiveGrind },
          },
        })
      );
      return;
    }

    dispatch(addToCart({ product: effectiveProduct, quantity, grindType: effectiveGrind }));
    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
      dispatch(setSelectedProduct(null));
    }, 900);
  };

  // Amazon/Flipkart 1-Click "Buy Now" handler
  const handleBuyNow = () => {
    trackProductEvent(product.id, 'buy_now');

    if (!isAuthenticated) {
      dispatch(setSelectedProduct(null));
      dispatch(
        openAuthModal({
          mode: 'login',
          reason: `Please sign in or create an account to complete 1-Click Buy Now for "${product.name}".`,
          pendingAction: {
            type: 'addToCart',
            payload: { product: effectiveProduct, quantity, grindType: effectiveGrind },
          },
        })
      );
      return;
    }

    // Add to cart and immediately open Checkout modal directly
    dispatch(addToCart({ product: effectiveProduct, quantity, grindType: effectiveGrind }));
    dispatch(setSelectedProduct(null));
    dispatch(openCheckout());
  };

  // Frequently Bought Together Add Bundle Handler (Commented out)
  /*
  const handleAddBundle = () => {
    if (!isAuthenticated) {
      dispatch(setSelectedProduct(null));
      dispatch(
        openAuthModal({
          mode: 'login',
          reason: 'Please sign in or create an account to add this bundle to your cart.'
        })
      );
      return;
    }

    dispatch(addToCart({ product, quantity: 1, grindType: packFormat }));
    if (bundleIncludeAddon && complementaryProduct) {
      const discountedAddon = {
        ...complementaryProduct,
        price: (parseFloat(complementaryProduct.price) * 0.85).toFixed(2)
      };
      dispatch(addToCart({
        product: discountedAddon,
        quantity: 1,
        grindType: 'Bundle Pairing (15% OFF)'
      }));
    }
    setBundleAdded(true);
    setTimeout(() => setBundleAdded(false), 2500);
  };
  */

  // Submit Community Question Handler
  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!questionText.trim()) return;
    setQuestionSubmitting(true);
    try {
      const res = await axios.post('http://localhost:5000/api/marketplace/questions', {
        product_id: product.id,
        question: questionText,
        asker_name: askerName || 'Curious Patron'
      });
      if (res.data.success) {
        setQuestionSuccessMsg('Question posted! Our roastmasters will answer shortly.');
        setQuestionText('');
        setIsAskingQuestion(false);
        const qRes = await axios.get(`http://localhost:5000/api/marketplace/questions/${product.id}`);
        if (qRes.data.success) {
          setQuestions(qRes.data.data || []);
        }
        setTimeout(() => setQuestionSuccessMsg(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit question');
    } finally {
      setQuestionSubmitting(false);
    }
  };

  // Submit Customer Review
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!newReviewForm.reviewer_name || !newReviewForm.comment) {
      alert('Please enter your name and review comment');
      return;
    }
    setReviewSubmitting(true);
    try {
      const res = await axios.post(
        'http://localhost:5000/api/reviews',
        {
          product_id: product.id,
          reviewer_name: newReviewForm.reviewer_name,
          rating: newReviewForm.rating,
          title: newReviewForm.title,
          comment: newReviewForm.comment
        },
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : ''
          }
        }
      );

      if (res.data.success) {
        setReviewSuccessMsg('Thank you! Your verified review has been published.');
        setIsWritingReview(false);
        setNewReviewForm({ rating: 5, title: '', comment: '', reviewer_name: user?.name || '' });
        // Refresh reviews
        const refreshRes = await axios.get(`http://localhost:5000/api/reviews/product/${product.id}`);
        if (refreshRes.data.success) {
          setReviewsData({
            average_rating: refreshRes.data.average_rating,
            count: refreshRes.data.count,
            distribution: refreshRes.data.distribution,
            reviews: refreshRes.data.reviews
          });
        }
        setTimeout(() => setReviewSuccessMsg(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Review Edit & Delete Handlers (Author or Admin)
  const handleStartEditReview = (rev) => {
    setEditingReviewId(rev.id);
    setEditingReviewForm({
      rating: rev.rating || 5,
      title: rev.title || '',
      comment: rev.comment || ''
    });
  };

  const handleCancelEditReview = () => {
    setEditingReviewId(null);
    setEditingReviewForm({ rating: 5, title: '', comment: '' });
  };

  const handleSaveEditReview = async (reviewId) => {
    if (!editingReviewForm.comment.trim()) {
      alert('Review comment cannot be empty');
      return;
    }
    setEditSubmitting(true);
    try {
      const res = await axios.put(
        `http://localhost:5000/api/reviews/${reviewId}`,
        {
          rating: editingReviewForm.rating,
          title: editingReviewForm.title,
          comment: editingReviewForm.comment
        },
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : ''
          }
        }
      );

      if (res.data.success) {
        setReviewSuccessMsg('Review updated successfully!');
        setEditingReviewId(null);
        // Refresh reviews
        const refreshRes = await axios.get(`http://localhost:5000/api/reviews/product/${product.id}`);
        if (refreshRes.data.success) {
          setReviewsData({
            average_rating: refreshRes.data.average_rating,
            count: refreshRes.data.count,
            distribution: refreshRes.data.distribution,
            reviews: refreshRes.data.reviews
          });
        }
        setTimeout(() => setReviewSuccessMsg(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update review');
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete your review? This action cannot be undone.')) {
      return;
    }
    setDeleteSubmittingId(reviewId);
    try {
      const res = await axios.delete(
        `http://localhost:5000/api/reviews/${reviewId}`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : ''
          }
        }
      );

      if (res.data.success) {
        setReviewSuccessMsg('Review deleted successfully.');
        if (editingReviewId === reviewId) {
          setEditingReviewId(null);
        }
        // Refresh reviews
        const refreshRes = await axios.get(`http://localhost:5000/api/reviews/product/${product.id}`);
        if (refreshRes.data.success) {
          setReviewsData({
            average_rating: refreshRes.data.average_rating,
            count: refreshRes.data.count,
            distribution: refreshRes.data.distribution,
            reviews: refreshRes.data.reviews
          });
        }
        setTimeout(() => setReviewSuccessMsg(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete review');
    } finally {
      setDeleteSubmittingId(null);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in selection:bg-[#4D0E12] selection:text-[#F5EFC6] overflow-y-auto"
      onClick={() => dispatch(setSelectedProduct(null))}
    >
      <div 
        className="relative bg-[#231815] border-2 border-[#4A2E27] text-[#F5EFC6] rounded-3xl max-w-4xl w-full max-h-[92dvh] overflow-y-auto shadow-2xl p-4 sm:p-7 paper-crease-h"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => dispatch(setSelectedProduct(null))}
          className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 p-2 rounded-full bg-[#4A2E27] hover:bg-[#4D0E12] text-[#F5EFC6] border border-[#F5EFC6]/20 transition-colors z-20"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Product Showcase Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-start mb-8">
          
          {/* Left: Product Image & Urgency Badges */}
          <div className="space-y-4">
            <div className="relative rounded-2xl overflow-hidden aspect-square bg-[#18100E] border-2 border-[#4A2E27] shadow-xl">
              <img
                src={product.image_url || '/assets/brand/packaging-canisters.jpg'}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = '/assets/brand/packaging-canisters.jpg';
                }}
              />
              <div className="absolute top-3 left-3 flex flex-col gap-1.5 font-subhead">
                <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-lg bg-[#4D0E12] text-[#F5EFC6] border border-[#F5EFC6]/30 shadow-md">
                  {product.roast_level}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-[#18100E]/90 text-[#A5BCD6] border border-[#A5BCD6]/40 backdrop-blur-md flex items-center space-x-1">
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>50mg Caffeine / Gummy</span>
                </span>
              </div>

              {/* Social Proof Badge (Amazon/Flipkart Style) */}
              <div className="absolute bottom-3 left-3 right-3 bg-[#231815]/90 backdrop-blur-md p-2 rounded-xl border border-[#4A2E27] flex items-center justify-between text-[11px] font-subhead">
                <span className="flex items-center space-x-1 text-emerald-400 font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Bean Co. Assured Quality</span>
                </span>
                <span className="text-[#A5BCD6]">🔥 28 bought today</span>
              </div>
            </div>

            {/* Flipkart/Amazon 4-Point Trust Grid */}
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 text-[11px] font-subhead">
              {/* Return Policy clickable pill */}
              <button
                type="button"
                onClick={() => dispatch(openReturnPolicyModal())}
                className="p-2.5 rounded-xl bg-[#2F201C] hover:bg-[#4A2E27] border border-[#4A2E27] flex items-center space-x-2 text-left transition-colors cursor-pointer group"
                title="Click to view Return Policy"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-950/80 border border-emerald-700 flex items-center justify-center flex-shrink-0 text-emerald-400 group-hover:scale-105 transition-transform">
                  <RotateCcw className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-bold text-[#F5EFC6] block leading-tight">{returnDays}-Day Returns</span>
                  <span className="text-[10px] text-emerald-400 font-medium">100% Replacement ➔</span>
                </div>
              </button>

              {/* Free Delivery promo pill */}
              <div className="p-2.5 rounded-xl bg-[#2F201C] border border-[#4A2E27] flex items-center space-x-2 text-left">
                <div className="w-7 h-7 rounded-lg bg-[#4D0E12] border border-[#F5EFC6]/20 flex items-center justify-center flex-shrink-0 text-[#A5BCD6]">
                  <Truck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-bold text-[#F5EFC6] block leading-tight">FREE Delivery</span>
                  <span className="text-[10px] text-[#A5BCD6]">On &gt; 2 items (or &gt; ₹{freeMinOrder})</span>
                </div>
              </div>

              {/* Plant based ingredient pill */}
              <div className="p-2.5 rounded-xl bg-[#2F201C] border border-[#4A2E27] flex items-center space-x-2 text-left">
                <div className="w-7 h-7 rounded-lg bg-[#18100E] border border-[#4A2E27] flex items-center justify-center flex-shrink-0 text-emerald-400">
                  <Leaf className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-bold text-[#F5EFC6] block leading-tight">Plant-Based</span>
                  <span className="text-[10px] text-[#F5EFC6]/70">100% Pectin • Vegan</span>
                </div>
              </div>

              {/* Payment methods pill */}
              <div className="p-2.5 rounded-xl bg-[#2F201C] border border-[#4A2E27] flex items-center space-x-2 text-left">
                <div className="w-7 h-7 rounded-lg bg-[#18100E] border border-[#4A2E27] flex items-center justify-center flex-shrink-0 text-amber-400">
                  <CreditCard className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="font-bold text-[#F5EFC6] block leading-tight">Pay on Delivery</span>
                  <span className="text-[10px] text-[#F5EFC6]/70">UPI • Cards • COD</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Product Details, Delivery Estimator & Buy Actions */}
          <div className="flex flex-col justify-between">
            <div>
              {/* Brand Tag & Rating Star Summary */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <BrandLogo className="w-4 h-5" variant="cream" />
                  <span className="font-subhead text-[11px] font-bold uppercase tracking-widest text-[#A5BCD6]">
                    The Bean Co. • Chew The Brew
                  </span>
                </div>

                {/* Rating Badge */}
                <div className="flex items-center space-x-1.5 bg-[#4D0E12] px-2.5 py-1 rounded-lg border border-[#F5EFC6]/20">
                  <Star className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                  <span className="font-headline font-bold text-xs text-[#F5EFC6]">{reviewsData.average_rating}</span>
                  <span className="text-[10px] text-[#A5BCD6]">({reviewsData.count || 3} ratings)</span>
                </div>
              </div>

              {/* Title */}
              <h2 className="font-headline font-black text-2xl sm:text-3xl text-[#F5EFC6] mb-1.5 leading-tight uppercase">
                {product.name}
              </h2>

              {/* Tagline */}
              <p className="font-subhead text-xs text-[#A5BCD6] italic mb-3">
                "{product.tagline || 'Plant-based coffee gummies with measured energy'}"
              </p>

              {/* Price & Discount */}
              <div className="flex items-baseline space-x-3 mb-4">
                <span className="font-headline font-black text-3xl text-emerald-400">
                  ₹{parseFloat(product.price).toFixed(2)}
                </span>
                <span className="text-xs text-[#F5EFC6]/50 line-through">
                  ₹{(parseFloat(product.price) * 1.2).toFixed(2)}
                </span>
                <span className="text-xs font-bold font-subhead text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                  Save 20%
                </span>
              </div>

              {/* Description */}
              <p className="font-body text-xs text-[#F5EFC6]/85 leading-relaxed mb-4">
                {product.description}
              </p>

              {/* Pincode & Delivery Checker (India Exclusive Shipping Criteria) */}
              <div className="mb-5 p-3.5 rounded-2xl bg-[#2F201C] border border-[#4A2E27]">
                <div className="flex flex-wrap items-center justify-between gap-1 mb-2">
                  <div className="flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span className="font-subhead text-[11px] font-bold uppercase tracking-wider text-[#F5EFC6]">
                      Check Delivery & Pincode
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#4D0E12] text-[#F5EFC6] border border-[#F5EFC6]/20 flex items-center space-x-1">
                      <span>🇮🇳</span>
                      <span>India Only</span>
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold">
                    Delivery ₹{deliveryCharge} (FREE on &gt; 2 items)
                  </span>
                </div>

                <form onSubmit={handleCheckPincode} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => {
                      setPincode(e.target.value.replace(/\D/g, ''));
                      if (pincodeError) setPincodeError('');
                    }}
                    placeholder="Enter 6-digit Indian Pincode (e.g. 560001)"
                    className="flex-1 bg-[#18100E] border border-[#4A2E27] rounded-xl px-3 py-1.5 text-xs text-[#F5EFC6] focus:outline-none focus:border-amber-400 font-mono tracking-wider"
                  />
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#4A2E27] hover:bg-[#4D0E12] text-[#F5EFC6] text-xs font-bold rounded-xl border border-[#F5EFC6]/20 transition-colors uppercase"
                  >
                    Check
                  </button>
                </form>

                {/* India Only Criteria Notice */}
                <p className="text-[10.5px] text-[#A5BCD6] font-subhead mb-2 flex items-center space-x-1.5 leading-snug">
                  <span className="text-xs">🇮🇳</span>
                  <span><strong>Shipping Criteria:</strong> We deliver exclusively to addresses within India (All 28 States &amp; 8 UTs). International delivery is not supported.</span>
                </p>

                {/* Validation Error Message */}
                {pincodeError && (
                  <div className="text-[11px] font-subhead text-red-300 flex items-start space-x-1.5 bg-red-950/70 p-2.5 rounded-xl border border-red-800 animate-fade-in mb-2">
                    <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                    <span>{pincodeError}</span>
                  </div>
                )}

                {/* Success Estimated Delivery */}
                {pincodeChecked && !pincodeError && (
                  <div className="text-[11px] font-subhead text-emerald-300 flex items-center space-x-1.5 bg-emerald-950/40 p-2 rounded-xl border border-emerald-900/60">
                    <Truck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                    <span>{estimatedDeliveryText}</span>
                  </div>
                )}
              </div>

              {/* Pack Format & Quantity Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                <div>
                  <label className="font-subhead text-[10px] uppercase tracking-wider text-[#A5BCD6] block mb-1 font-bold">
                    Select Pack Format:
                  </label>
                  <select
                    value={packFormat}
                    onChange={(e) => setPackFormat(e.target.value)}
                    style={{ colorScheme: 'dark' }}
                    className="w-full bg-[#18100E] border border-[#4A2E27] rounded-xl px-3 py-2 font-subhead text-xs text-[#F5EFC6] focus:outline-none focus:border-[#A5BCD6]"
                  >
                    <option value="Single Canister (5 Gummies)" className="bg-[#18100E] text-[#F5EFC6]">Single Canister (5 Gummies)</option>
                    <option value="3-Pack Bundle (15 Gummies)" className="bg-[#18100E] text-[#F5EFC6]">3-Pack Bundle (15 Gummies)</option>
                    <option value="5-Pack Monthly Stash (25 Gummies)" className="bg-[#18100E] text-[#F5EFC6]">5-Pack Monthly Stash (25 Gummies)</option>
                  </select>
                </div>

                <div>
                  <label className="font-subhead text-[10px] uppercase tracking-wider text-[#A5BCD6] block mb-1 font-bold">
                    Quantity:
                  </label>
                  <div className="flex items-center space-x-3 bg-[#18100E] border border-[#4A2E27] rounded-xl px-3 py-1.5 w-fit">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-7 h-7 rounded-lg bg-[#4A2E27] hover:bg-[#4D0E12] flex items-center justify-center text-sm font-bold transition-colors font-headline"
                    >
                      -
                    </button>
                    <span className="font-headline text-sm font-bold w-6 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock_quantity || 10, quantity + 1))}
                      disabled={quantity >= (product.stock_quantity || 10)}
                      className="w-7 h-7 rounded-lg bg-[#4A2E27] hover:bg-[#4D0E12] disabled:opacity-40 flex items-center justify-center text-sm font-bold transition-colors font-headline"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Amazon / Flipkart Style: Subscribe & Save 10% Module (Disabled - uncomment to enable)
              <div className="mb-4 p-3.5 rounded-2xl bg-[#18100E] border border-[#4A2E27] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-subhead text-[11px] font-bold uppercase tracking-wider text-[#F5EFC6] flex items-center space-x-1.5">
                    <Repeat className="w-3.5 h-3.5 text-amber-400" />
                    <span>Purchase Preference</span>
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-600/40">
                    Amazon Style Auto-Ship
                  </span>
                </div>

                <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 text-xs">
                  // Option A: One-time purchase
                  <label
                    onClick={() => setIsSubscription(false)}
                    className={`flex items-center space-x-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                      !isSubscription
                        ? 'bg-[#2F201C] border-[#F5EFC6]/60 text-[#F5EFC6] shadow-md'
                        : 'bg-[#18100E] border-[#4A2E27] text-[#F5EFC6]/60 hover:border-[#A5BCD6]/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="purchase_type"
                      checked={!isSubscription}
                      onChange={() => setIsSubscription(false)}
                      className="accent-[#4D0E12]"
                    />
                    <div>
                      <span className="font-headline font-bold block text-xs">One-Time Order</span>
                      <span className="text-[10px] text-[#A5BCD6]">₹{parseFloat(product.price).toFixed(2)}/canister</span>
                    </div>
                  </label>

                  // Option B: Subscribe & Save 10%
                  <label
                    onClick={() => setIsSubscription(true)}
                    className={`flex items-center space-x-2.5 p-2.5 rounded-xl border cursor-pointer transition-all ${
                      isSubscription
                        ? 'bg-amber-950/40 border-amber-500/80 text-[#F5EFC6] shadow-md'
                        : 'bg-[#18100E] border-[#4A2E27] text-[#F5EFC6]/60 hover:border-amber-500/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="purchase_type"
                      checked={isSubscription}
                      onChange={() => setIsSubscription(true)}
                      className="accent-amber-400"
                    />
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="font-headline font-black text-xs text-amber-300">Subscribe & Save</span>
                        <span className="text-[9px] font-black bg-amber-400 text-[#231815] px-1 rounded">10% OFF</span>
                      </div>
                      <span className="text-[10px] text-amber-300/90 font-bold">
                        ₹{(parseFloat(product.price) * 0.9).toFixed(2)}/canister
                      </span>
                    </div>
                  </label>
                </div>

                {isSubscription && (
                  <div className="pt-1.5 flex items-center justify-between gap-2 border-t border-[#4A2E27] text-xs animate-fade-in">
                    <span className="text-[11px] text-[#A5BCD6] font-subhead">Delivery Frequency:</span>
                    <select
                      value={subscriptionFrequency}
                      onChange={(e) => setSubscriptionFrequency(e.target.value)}
                      className="bg-[#2F201C] text-[#F5EFC6] border border-amber-500/40 rounded-lg px-2.5 py-1 text-xs font-headline font-bold focus:outline-none"
                    >
                      <option value="Every 2 Weeks">Every 2 Weeks</option>
                      <option value="Every 1 Month (Recommended)">Every 1 Month (Recommended)</option>
                      <option value="Every 2 Months">Every 2 Months</option>
                    </select>
                  </div>
                )}
              </div>
              */}

              {/* DUAL ACTION BUTTONS: "Add To Cart" + Amazon "⚡ Buy Now" */}
              <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                
                {/* 1. Add To Cart Button */}
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`flex-1 py-3.5 px-4 rounded-xl font-headline font-bold text-xs uppercase tracking-wider shadow-xl flex items-center justify-center space-x-2 transition-all ${
                    isOutOfStock
                      ? 'bg-[#4A2E27] text-[#F5EFC6]/40 cursor-not-allowed'
                      : justAdded
                      ? 'bg-emerald-700 text-white border border-emerald-400'
                      : 'bg-[#4A2E27] hover:bg-[#4D0E12] text-[#F5EFC6] border border-[#F5EFC6]/30 active:scale-95'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4 text-[#A5BCD6]" />
                  <span>{justAdded ? 'Added To Cart!' : `Add To Cart • ₹${(parseFloat(effectiveProduct.price) * quantity).toFixed(2)}`}</span>
                </button>

                {/* 2. Amazon 1-Click "⚡ Buy Now" Button */}
                <button
                  onClick={handleBuyNow}
                  disabled={isOutOfStock}
                  className="flex-1 py-3.5 px-4 rounded-xl bg-[#4D0E12] hover:bg-[#6b151a] text-[#F5EFC6] font-headline font-black text-xs uppercase tracking-wider border-2 border-[#F5EFC6]/50 shadow-2xl flex items-center justify-center space-x-2 transition-all active:scale-95 disabled:opacity-40"
                >
                  <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                  <span>⚡ Buy Now (Express)</span>
                </button>

              </div>

              {/* Stock info */}
              <div className="mt-2.5 font-subhead text-[10px] text-[#F5EFC6]/60 flex items-center justify-between">
                <span>
                  {quantity > freeThreshold ? (
                    <strong className="text-emerald-400">✨ Eligible for FREE Delivery (Selected &gt; {freeThreshold} items)</strong>
                  ) : (
                    <span>Add {freeThreshold - quantity + 1} more for FREE delivery</span>
                  )}
                </span>
                {isOutOfStock ? (
                  <span className="text-red-400 font-semibold">Out of Stock</span>
                ) : isLowStock ? (
                  <span className="text-amber-400 font-semibold">⚡ Only {product.stock_quantity} left!</span>
                ) : (
                  <span>In Stock ({product.stock_quantity} available)</span>
                )}
              </div>

            </div>
          </div>

        </div>

        {/* ============================================================== */}
        {/* FREQUENTLY BOUGHT TOGETHER BUNDLE (Amazon & Flipkart Core Feature) */}
        {/* Frequently Bought Together Bundle (Disabled) */}

        {/* ============================================================== */}
        {/* CUSTOMER REVIEWS & RATINGS SECTION (Amazon & Flipkart Style) */}
        {/* ============================================================== */}
        <div className="border-t-2 border-[#4A2E27] pt-6 mt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="font-headline font-black text-lg sm:text-xl text-[#F5EFC6] uppercase tracking-wide flex items-center space-x-2">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                <span>Customer Reviews & Ratings</span>
              </h3>
              <p className="font-body text-xs text-[#A5BCD6]">
                Verified buyer feedback and authentic tasting experiences
              </p>
            </div>

            <button
              onClick={() => setIsWritingReview(!isWritingReview)}
              className="px-4 py-2 rounded-xl bg-[#2F201C] hover:bg-[#4D0E12] text-[#F5EFC6] font-bold text-xs uppercase tracking-wider border border-[#4A2E27] transition-colors flex items-center space-x-2 w-fit"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#A5BCD6]" />
              <span>{isWritingReview ? 'Cancel Review' : 'Write a Review'}</span>
            </button>
          </div>

          {/* Success Toast */}
          {reviewSuccessMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-600 text-emerald-300 text-xs font-subhead flex items-center space-x-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{reviewSuccessMsg}</span>
            </div>
          )}

          {/* Write Review Form */}
          {isWritingReview && (
            <form onSubmit={handleSubmitReview} className="mb-8 p-4 sm:p-5 rounded-2xl bg-[#18100E] border border-[#4A2E27] space-y-3 animate-fade-in">
              <h4 className="font-headline font-bold text-xs uppercase tracking-wider text-[#A5BCD6]">
                Share Your Canister Experience
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[#F5EFC6]/80 block mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={newReviewForm.reviewer_name}
                    onChange={(e) => setNewReviewForm({ ...newReviewForm, reviewer_name: e.target.value })}
                    placeholder="e.g. Aditi Sharma"
                    className="w-full bg-[#231815] border border-[#4A2E27] rounded-xl px-3 py-2 text-xs text-[#F5EFC6] focus:outline-none focus:border-[#A5BCD6]"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-[#F5EFC6]/80 block mb-1">Star Rating</label>
                  <div className="flex items-center space-x-2 py-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReviewForm({ ...newReviewForm, rating: star })}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star 
                          className={`w-6 h-6 ${
                            star <= newReviewForm.rating 
                              ? 'text-amber-400 fill-amber-400' 
                              : 'text-gray-600'
                          }`} 
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-amber-300 ml-2">{newReviewForm.rating} / 5 Stars</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[11px] text-[#F5EFC6]/80 block mb-1">Review Headline</label>
                <input
                  type="text"
                  value={newReviewForm.title}
                  onChange={(e) => setNewReviewForm({ ...newReviewForm, title: e.target.value })}
                  placeholder="e.g. Incredible roasted aroma and zero crash!"
                  className="w-full bg-[#231815] border border-[#4A2E27] rounded-xl px-3 py-2 text-xs text-[#F5EFC6] focus:outline-none focus:border-[#A5BCD6]"
                />
              </div>

              <div>
                <label className="text-[11px] text-[#F5EFC6]/80 block mb-1">Detailed Tasting Review</label>
                <textarea
                  required
                  rows={3}
                  value={newReviewForm.comment}
                  onChange={(e) => setNewReviewForm({ ...newReviewForm, comment: e.target.value })}
                  placeholder="How did the flavor, texture, and caffeine boost feel? Would you recommend it?"
                  className="w-full bg-[#231815] border border-[#4A2E27] rounded-xl px-3 py-2 text-xs text-[#F5EFC6] focus:outline-none focus:border-[#A5BCD6]"
                />
              </div>

              <button
                type="submit"
                disabled={reviewSubmitting}
                className="px-5 py-2.5 rounded-xl bg-[#4D0E12] hover:bg-[#4D0E12]/90 text-[#F5EFC6] text-xs font-bold uppercase tracking-wider border border-[#F5EFC6]/30 shadow-lg flex items-center space-x-2 transition-all disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5 text-[#A5BCD6]" />
                <span>{reviewSubmitting ? 'Publishing...' : 'Submit Verified Review'}</span>
              </button>
            </form>
          )}

          {/* Rating Breakdown & Customer Reviews List */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left 4 Cols: Rating Breakdown Bar Chart */}
            <div className="lg:col-span-4 p-4 rounded-2xl bg-[#18100E] border border-[#4A2E27]">
              <div className="text-center pb-4 border-b border-[#4A2E27] mb-3">
                <span className="font-headline font-black text-4xl text-[#F5EFC6] block">
                  {reviewsData.average_rating}
                </span>
                <div className="flex items-center justify-center space-x-1 my-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <span className="text-[10px] text-[#A5BCD6] font-subhead">
                  Based on {reviewsData.count || reviewsData.reviews.length} verified reviews
                </span>
              </div>

              {/* Star Distribution Bars */}
              <div className="space-y-1.5 text-[11px] font-subhead">
                {[5, 4, 3, 2, 1].map((ratingNum) => {
                  const count = reviewsData.distribution[ratingNum] || 0;
                  const total = reviewsData.count || 1;
                  const pct = Math.round((count / total) * 100);
                  return (
                    <div key={ratingNum} className="flex items-center space-x-2">
                      <span className="w-10 text-right text-[#F5EFC6]/80">{ratingNum} ★</span>
                      <div className="flex-1 bg-[#231815] h-2 rounded-full overflow-hidden border border-[#4A2E27]">
                        <div 
                          className="bg-amber-400 h-full rounded-full transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="w-8 text-[10px] text-[#A5BCD6] text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right 8 Cols: Reviews Feed */}
            <div className="lg:col-span-8 space-y-3.5">
              {reviewsData.reviews.length === 0 ? (
                <div className="p-6 rounded-2xl bg-[#18100E] border border-[#4A2E27] text-center">
                  <p className="text-xs text-[#A5BCD6] italic">
                    Be the first coffee lover to review "{product.name}"!
                  </p>
                </div>
              ) : (
                reviewsData.reviews.map((rev) => {
                  const isAuthor = Boolean(
                    user && (
                      (rev.user_id && Number(rev.user_id) === Number(user.id)) ||
                      (user.name && rev.reviewer_name && user.name.trim().toLowerCase() === rev.reviewer_name.trim().toLowerCase())
                    )
                  );
                  const canManage = isAuthor || isAdmin;
                  const isEditingThis = editingReviewId === rev.id;

                  return (
                    <div key={rev.id} className="p-4 rounded-2xl bg-[#18100E] border border-[#4A2E27] space-y-2.5 transition-all">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-headline font-bold text-xs text-[#F5EFC6]">
                            {rev.reviewer_name}
                          </span>
                          <span className="text-[9px] font-subhead text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800 flex items-center space-x-1">
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                            <span>Verified Purchase</span>
                          </span>
                          {rev.updated_at && rev.created_at && new Date(rev.updated_at).getTime() - new Date(rev.created_at).getTime() > 2000 && (
                            <span className="text-[9px] font-subhead text-[#A5BCD6]/70 italic">
                              (Edited)
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] text-[#F5EFC6]/50 font-subhead">
                            {new Date(rev.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>

                          {/* Author & Admin Edit/Delete Controls */}
                          {canManage && !isEditingThis && (
                            <div className="flex items-center space-x-1 ml-1.5 border-l border-[#4A2E27] pl-2">
                              <button
                                type="button"
                                onClick={() => handleStartEditReview(rev)}
                                className="px-2 py-1 rounded-lg text-[11px] font-subhead text-[#A5BCD6] hover:text-[#F5EFC6] hover:bg-[#4A2E27] border border-[#4A2E27] hover:border-[#F5EFC6]/30 transition-all flex items-center space-x-1"
                                title="Edit your review"
                              >
                                <Pencil className="w-3 h-3 text-amber-400" />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteReview(rev.id)}
                                disabled={deleteSubmittingId === rev.id}
                                className="px-2 py-1 rounded-lg text-[11px] font-subhead text-red-300 hover:text-red-200 hover:bg-red-950/40 border border-[#4A2E27] hover:border-red-500/40 transition-all flex items-center space-x-1 disabled:opacity-50"
                                title="Delete your review"
                              >
                                {deleteSubmittingId === rev.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin text-red-400" />
                                ) : (
                                  <Trash2 className="w-3 h-3 text-red-400" />
                                )}
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Inline Review Edit Form */}
                      {isEditingThis ? (
                        <div className="pt-2 border-t border-[#4A2E27] space-y-3 animate-fade-in bg-[#231815]/70 p-3.5 rounded-xl border border-[#4A2E27]">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-headline font-bold text-amber-300 uppercase tracking-wider">
                              Editing Review
                            </span>
                            <div className="flex items-center space-x-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setEditingReviewForm({ ...editingReviewForm, rating: star })}
                                  className="p-1 hover:scale-110 transition-transform"
                                >
                                  <Star
                                    className={`w-4 h-4 ${
                                      star <= editingReviewForm.rating
                                        ? 'text-amber-400 fill-amber-400'
                                        : 'text-gray-600'
                                    }`}
                                  />
                                </button>
                              ))}
                              <span className="text-xs font-bold text-amber-300 ml-1.5">
                                {editingReviewForm.rating}/5
                              </span>
                            </div>
                          </div>

                          <div>
                            <label className="text-[10px] text-[#F5EFC6]/70 block mb-1">Headline</label>
                            <input
                              type="text"
                              value={editingReviewForm.title}
                              onChange={(e) => setEditingReviewForm({ ...editingReviewForm, title: e.target.value })}
                              placeholder="Review Headline"
                              className="w-full bg-[#18100E] border border-[#4A2E27] rounded-lg px-2.5 py-1.5 text-xs text-[#F5EFC6] focus:outline-none focus:border-[#A5BCD6]"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] text-[#F5EFC6]/70 block mb-1">Review Comment</label>
                            <textarea
                              rows={3}
                              value={editingReviewForm.comment}
                              onChange={(e) => setEditingReviewForm({ ...editingReviewForm, comment: e.target.value })}
                              placeholder="Your thoughts on roast, notes, and aroma..."
                              className="w-full bg-[#18100E] border border-[#4A2E27] rounded-lg px-2.5 py-1.5 text-xs text-[#F5EFC6] focus:outline-none focus:border-[#A5BCD6]"
                            />
                          </div>

                          <div className="flex items-center space-x-2 pt-1">
                            <button
                              type="button"
                              onClick={() => handleSaveEditReview(rev.id)}
                              disabled={editSubmitting}
                              className="px-3.5 py-1.5 rounded-lg bg-[#4D0E12] hover:bg-[#4D0E12]/90 text-[#F5EFC6] text-xs font-bold uppercase tracking-wider border border-[#F5EFC6]/30 flex items-center space-x-1.5 transition-all disabled:opacity-50"
                            >
                              {editSubmitting ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              )}
                              <span>{editSubmitting ? 'Saving...' : 'Save Changes'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={handleCancelEditReview}
                              disabled={editSubmitting}
                              className="px-3 py-1.5 rounded-lg bg-[#2F201C] hover:bg-[#4A2E27] text-[#A5BCD6] hover:text-[#F5EFC6] text-xs font-subhead border border-[#4A2E27] transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Stars & Title */}
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star 
                                  key={s} 
                                  className={`w-3 h-3 ${s <= rev.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}`} 
                                />
                              ))}
                            </div>
                            {rev.title && (
                              <h5 className="font-headline font-bold text-xs text-[#F5EFC6]">
                                {rev.title}
                              </h5>
                            )}
                          </div>

                          {/* Comment */}
                          <p className="text-xs text-[#F5EFC6]/85 font-body leading-relaxed">
                            {rev.comment}
                          </p>

                          <div className="pt-1 flex items-center space-x-3 text-[10px] text-[#A5BCD6] font-subhead">
                            <span className="flex items-center space-x-1 hover:text-[#F5EFC6] cursor-pointer">
                              <ThumbsUp className="w-3 h-3" />
                              <span>Helpful</span>
                            </span>
                            <span>•</span>
                            <span>Certified Arabica Batch</span>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })
              )}
            </div>

          </div>
        </div>

        {/* ============================================================== */}
        {/* COMMUNITY QUESTIONS & ANSWERS (Amazon & Flipkart Q&A Engine) */}
        {/* ============================================================== */}
        <div className="border-t-2 border-[#4A2E27] pt-6 mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#4D0E12] text-[#F5EFC6] border border-[#F5EFC6]/30">
                  Amazon Style Q&A
                </span>
                <span className="text-xs text-[#A5BCD6] font-body">Direct Roastmaster Verification</span>
              </div>
              <h3 className="font-headline font-black text-lg sm:text-xl text-[#F5EFC6] uppercase tracking-wide flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-400" />
                <span>Customer Questions & Answers</span>
              </h3>
            </div>

            <button
              onClick={() => setIsAskingQuestion(!isAskingQuestion)}
              className="px-4 py-2 rounded-xl bg-[#2F201C] hover:bg-[#4D0E12] text-[#F5EFC6] font-headline font-bold text-xs uppercase tracking-wider border border-[#4A2E27] hover:border-[#F5EFC6]/40 transition-all flex items-center gap-2 self-start sm:self-auto"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#A5BCD6]" />
              <span>{isAskingQuestion ? 'Cancel Question' : 'Ask a Question'}</span>
            </button>
          </div>

          {/* Success toast */}
          {questionSuccessMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-600 text-emerald-300 text-xs font-headline font-bold flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{questionSuccessMsg}</span>
            </div>
          )}

          {/* Ask Question Form */}
          {isAskingQuestion && (
            <form onSubmit={handleAskQuestion} className="mb-6 p-4 sm:p-5 rounded-2xl bg-[#18100E] border border-[#4A2E27] space-y-3 animate-fade-in">
              <h4 className="font-headline font-bold text-xs uppercase tracking-wider text-[#A5BCD6]">
                Post a question about ingredients, roast level, or caffeine dosage
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-[#F5EFC6]/80 block mb-1 font-bold">Your Name</label>
                  <input
                    type="text"
                    required
                    value={askerName}
                    onChange={(e) => setAskerName(e.target.value)}
                    placeholder="e.g. Rahul Sen"
                    className="w-full bg-[#231815] border border-[#4A2E27] rounded-xl px-3 py-2 text-xs text-[#F5EFC6] focus:outline-none focus:border-[#A5BCD6]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-[#F5EFC6]/80 block mb-1 font-bold">Your Question</label>
                <textarea
                  required
                  rows="2"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="e.g. Are these gummies vegan? How long do they stay fresh after opening?"
                  className="w-full bg-[#231815] border border-[#4A2E27] rounded-xl px-3 py-2 text-xs text-[#F5EFC6] focus:outline-none focus:border-[#A5BCD6]"
                />
              </div>

              <button
                type="submit"
                disabled={questionSubmitting}
                className="px-5 py-2.5 rounded-xl bg-[#4D0E12] hover:bg-[#4D0E12]/90 text-[#F5EFC6] font-headline font-black text-xs uppercase tracking-wider border border-[#F5EFC6]/30 shadow-md flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5 text-[#F5EFC6]" />
                <span>{questionSubmitting ? 'Posting...' : 'Post Question'}</span>
              </button>
            </form>
          )}

          {/* Questions list */}
          <div className="space-y-3">
            {questions.length === 0 ? (
              <div className="p-6 rounded-2xl bg-[#18100E] border border-[#4A2E27] text-center text-xs text-[#A5BCD6]">
                <HelpCircle className="w-8 h-8 mx-auto mb-2 opacity-40 text-amber-400" />
                <p className="font-headline font-bold uppercase text-[#F5EFC6]">No Questions Yet</p>
                <p className="mt-1">Have queries regarding shelf-life or Arabica origins? Click "Ask a Question" above.</p>
              </div>
            ) : (
              questions.map((q) => (
                <div
                  key={q.id}
                  className="p-4 rounded-2xl bg-[#18100E] border border-[#4A2E27] space-y-2 hover:border-[#A5BCD6]/40 transition-colors"
                >
                  <div className="flex items-start gap-2">
                    <span className="font-headline font-black text-xs text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-600/40">
                      Q
                    </span>
                    <div className="flex-1">
                      <p className="font-headline font-bold text-xs sm:text-sm text-[#F5EFC6]">
                        {q.question}
                      </p>
                      <span className="text-[10px] text-[#A5BCD6] font-subhead block mt-0.5">
                        Asked by {q.asker_name || 'Curious Patron'} • {new Date(q.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {q.answer ? (
                    <div className="flex items-start gap-2 pl-4 border-l-2 border-[#4D0E12] mt-2 pt-1">
                      <span className="font-headline font-black text-xs text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-600/40">
                        A
                      </span>
                      <div className="flex-1">
                        <p className="font-body text-xs text-[#F5EFC6]/90 leading-relaxed">
                          {q.answer}
                        </p>
                        <span className="text-[10px] font-headline font-bold text-emerald-400 flex items-center gap-1 mt-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>The Bean Co. Roastmaster Team (Verified Answer)</span>
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="pl-6 text-[11px] text-[#A5BCD6]/60 italic font-subhead">
                      Awaiting roastmaster response...
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
