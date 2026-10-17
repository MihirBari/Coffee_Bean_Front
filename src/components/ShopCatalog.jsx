import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setFilter, resetFilters, setSelectedProduct } from '../store/productsSlice';
import { addToCart, applyPromoCodeDirect } from '../store/cartSlice';
import { openAuthModal, toggleWishlist } from '../store/authSlice';
import { fetchLightningDeal } from '../store/promotionsSlice';
import BrandLogo from './BrandLogo';
import BeanoMascot from './BeanoMascot';
import { 
  Search, 
  RotateCcw, 
  ShoppingBag, 
  Heart, 
  Sparkles, 
  Zap, 
  ArrowRight, 
  Check, 
  AlertCircle, 
  Truck, 
  ShieldCheck, 
  Tag, 
  Copy,
  Coffee,
  Star
} from 'lucide-react';
import { trackProductEvent } from '../services/analytics';

export default function ShopCatalog({ onNavigate }) {
  const dispatch = useDispatch();
  const { items: products, status, error, filters } = useSelector((state) => state.products);
  const { isAuthenticated, wishlist } = useSelector((state) => state.auth);
  const { settings } = useSelector((state) => state.settings);
  const { lightningDeal } = useSelector((state) => state.promotions);

  const [selectedPacks, setSelectedPacks] = useState({});
  const [addedItemNotice, setAddedItemNotice] = useState(null);
  const [copiedDealCoupon, setCopiedDealCoupon] = useState(false);

  useEffect(() => {
    dispatch(fetchLightningDeal());
  }, [dispatch]);

  // Deal countdown timer
  const [dealTimeLeft, setDealTimeLeft] = useState({ hours: 4, minutes: 30, seconds: 0, expired: false });

  useEffect(() => {
    if (!lightningDeal) return;
    const updateCountdown = () => {
      if (!lightningDeal?.ends_at) {
        setDealTimeLeft({
          hours: lightningDeal?.duration_hours || 4,
          minutes: 0,
          seconds: 0,
          expired: false
        });
        return;
      }
      const target = new Date(lightningDeal.ends_at).getTime();
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setDealTimeLeft({ hours: 0, minutes: 0, seconds: 0, expired: true });
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setDealTimeLeft({ hours, minutes, seconds, expired: false });
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [lightningDeal]);

  const handleCopyDealCoupon = (e) => {
    e.stopPropagation();
    if (lightningDeal?.coupon_code) {
      navigator.clipboard?.writeText(lightningDeal.coupon_code);
      setCopiedDealCoupon(true);
      dispatch(
        applyPromoCodeDirect({
          code: lightningDeal.coupon_code,
          discountPercent: lightningDeal.discount_percent || 20,
          description: `${lightningDeal.discount_percent || 20}% OFF Flash Deal`
        })
      );
      setTimeout(() => setCopiedDealCoupon(false), 3000);
    }
  };

  const availableRoasts = Array.from(new Set(products.map((p) => p.roast_level).filter(Boolean)));
  const flavorOptions = ['All', ...availableRoasts];

  const handlePackChange = (productId, pack) => {
    setSelectedPacks((prev) => ({ ...prev, [productId]: pack }));
  };

  const handleAddToCart = (product) => {
    const chosenPack = selectedPacks[product.id] || 'Single Canister (5 Gummies)';
    trackProductEvent(product.id, 'add_to_cart');

    if (!isAuthenticated) {
      dispatch(
        openAuthModal({
          mode: 'login',
          reason: `Please sign in to add "${product.name}" to your cart.`,
          pendingAction: {
            type: 'addToCart',
            payload: { product, quantity: 1, grindType: chosenPack },
          },
        })
      );
      return;
    }

    dispatch(addToCart({ product, quantity: 1, grindType: chosenPack }));
    setAddedItemNotice(product.id);
    setTimeout(() => {
      setAddedItemNotice(null);
    }, 2000);
  };

  const handleToggleWishlist = (product) => {
    trackProductEvent(product.id, 'wishlist');
    if (!isAuthenticated) {
      dispatch(
        openAuthModal({
          mode: 'login',
          reason: `Please sign in to save "${product.name}" to your wishlist.`,
          pendingAction: {
            type: 'toggleWishlist',
            payload: product,
          },
        })
      );
      return;
    }

    dispatch(toggleWishlist(product));
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    if (filters.roast !== 'All' && p.roast_level !== filters.roast) return false;
    if (filters.inStockOnly && p.stock_quantity <= 0) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const match = 
        p.name?.toLowerCase().includes(q) ||
        p.tagline?.toLowerCase().includes(q) ||
        p.flavor_notes?.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  }).sort((a, b) => {
    if (filters.sort === 'price_asc') return a.price - b.price;
    if (filters.sort === 'price_desc') return b.price - a.price;
    if (filters.sort === 'stock') return b.stock_quantity - a.stock_quantity;
    if (filters.sort === 'name') return a.name.localeCompare(b.name);
    return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
  });

  return (
    <div className="bg-[#16100E] text-[#F6F2E8] min-h-screen py-8 sm:py-14 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto selection:bg-[#5A1217] selection:text-[#F6F2E8]">
      
      {/* ============================================================== */}
      {/* 1. EDITORIAL REFINED HERO SECTION */}
      {/* ============================================================== */}
      <section className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 pt-2 sm:pt-4">
        
        {/* Subtle pill tag */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-[11px] font-medium text-[#D6A56E] mb-5 tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-[#D6A56E]" />
          <span>The Bean Co. • Plant-Based Caffeine Gummies</span>
        </div>

        {/* Clean, bold headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#F6F2E8] mb-4 leading-[1.1]">
          Coffee, Reimagined <br className="hidden sm:inline" />
          <span className="text-[#D6A56E]">To Chew.</span>
        </h1>

        {/* Evocative description */}
        <p className="text-sm sm:text-base text-[#C7BCB3] max-w-2xl mx-auto leading-relaxed mb-8 font-normal">
          The rich aroma and ritual of specialty roast coffee, captured in clean plant-based pectin gummies. 
          Each pocket canister delivers a measured 50mg caffeine boost with zero liquid spills.
        </p>

        {/* Minimalist 3-Point Specs Ribbon */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-xl mx-auto text-center border-y border-white/[0.06] py-3.5 text-xs sm:text-sm">
          <div>
            <span className="font-bold text-[#F6F2E8] block text-base sm:text-lg">50mg</span>
            <span className="text-[11px] text-[#A89B93]">Caffeine per Chew</span>
          </div>
          <div className="border-x border-white/[0.06]">
            <span className="font-bold text-[#D6A56E] block text-base sm:text-lg">100% Vegan</span>
            <span className="text-[11px] text-[#A89B93]">Plant Pectin Base</span>
          </div>
          <div>
            <span className="font-bold text-[#F6F2E8] block text-base sm:text-lg">Pocket Tin</span>
            <span className="text-[11px] text-[#A89B93]">Zero-Spill Ritual</span>
          </div>
        </div>

        {/* Discreet Flash Deal Callout if active */}
        {Boolean(lightningDeal?.is_active && !dealTimeLeft.expired) ? (
          <div className="mt-6 inline-flex items-center flex-wrap justify-center gap-2.5 px-4 py-2 rounded-2xl bg-[#5A1217]/40 border border-[#D6A56E]/30 text-xs shadow-sm">
            <span className="font-semibold text-[#D6A56E] flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>{lightningDeal.title || 'Roastery Special'}</span>
            </span>
            <span className="text-[#C7BCB3]">•</span>
            <button
              onClick={handleCopyDealCoupon}
              className="inline-flex items-center gap-1.5 text-xs text-[#F6F2E8] hover:text-[#D6A56E] font-medium transition-colors cursor-pointer"
            >
              <span>Use code <strong className="underline decoration-[#D6A56E]">{lightningDeal.coupon_code}</strong> for {lightningDeal.discount_percent || 20}% off</span>
              {copiedDealCoupon ? (
                <span className="text-emerald-400 text-[11px] font-semibold flex items-center gap-0.5">
                  <Check className="w-3 h-3" /> Applied
                </span>
              ) : (
                <Copy className="w-3 h-3 text-[#D6A56E]" />
              )}
            </button>
          </div>
        ) : null}

      </section>

      {/* ============================================================== */}
      {/* 2. MINIMALIST FILTER & SEARCH TOOLBAR */}
      {/* ============================================================== */}
      <div className="mb-10 bg-[#1D1412] border border-white/[0.08] rounded-2xl p-3 sm:p-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5">
          
          {/* Flavor Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
            {flavorOptions.map((flavor) => (
              <button
                key={flavor}
                onClick={() => dispatch(setFilter({ roast: flavor }))}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  filters.roast === flavor
                    ? 'bg-[#5A1217] text-[#F6F2E8] shadow-sm'
                    : 'bg-white/[0.04] text-[#A89B93] hover:text-[#F6F2E8] hover:bg-white/[0.08]'
                }`}
              >
                {flavor === 'All' ? 'All Flavors' : flavor}
              </button>
            ))}
          </div>

          {/* Search & Sort Controls */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex-1 sm:w-60">
              <Search className="w-3.5 h-3.5 text-[#A89B93] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => dispatch(setFilter({ search: e.target.value }))}
                placeholder="Search flavors..."
                className="w-full bg-[#140E0C] border border-white/[0.08] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#F6F2E8] placeholder-[#A89B93]/50 focus:outline-none focus:border-[#D6A56E]/50 transition-colors"
              />
              {filters.search && (
                <button
                  onClick={() => dispatch(setFilter({ search: '' }))}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#A89B93] hover:text-[#F6F2E8]"
                >
                  ×
                </button>
              )}
            </div>

            <select
              value={filters.sort}
              onChange={(e) => dispatch(setFilter({ sort: e.target.value }))}
              style={{ colorScheme: 'dark' }}
              className="bg-[#140E0C] border border-white/[0.08] rounded-xl px-2.5 py-1.5 text-xs text-[#EAE2D9] focus:outline-none focus:border-[#D6A56E]/50"
            >
              <option value="featured">Featured</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name">Alphabetical</option>
            </select>

            {(filters.roast !== 'All' || filters.search || filters.sort !== 'featured') && (
              <button
                onClick={() => dispatch(resetFilters())}
                className="p-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-[#A89B93] hover:text-[#F6F2E8] transition-colors"
                title="Reset filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. PRODUCT CATALOG GRID */}
      {/* ============================================================== */}
      {error && (
        <div className="p-4 rounded-2xl bg-red-950/40 border border-red-800/60 text-red-200 text-xs mb-8 flex items-center gap-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>Error loading products: {error}</span>
        </div>
      )}

      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-[#1D1412] border border-white/[0.08] rounded-3xl p-8">
          <Coffee className="w-10 h-10 text-[#D6A56E] mx-auto mb-3 opacity-60" />
          <h3 className="font-semibold text-lg text-[#F6F2E8] mb-1">
            No Gummies Match Your Selection
          </h3>
          <p className="text-xs text-[#A89B93] mb-5 max-w-sm mx-auto">
            Try adjusting your search query or reset filters to explore our full collection.
          </p>
          <button
            onClick={() => dispatch(resetFilters())}
            className="px-5 py-2 rounded-xl bg-[#5A1217] text-[#F6F2E8] text-xs font-medium hover:bg-[#6E161C] transition-colors"
          >
            Show All Flavors
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredProducts.map((product) => {
            const isOutOfStock = product.stock_quantity <= 0;
            const currentPack = selectedPacks[product.id] || 'Single Canister (5 Gummies)';
            const isWishlisted = wishlist.some((w) => w.id === product.id);

            return (
              <div
                key={product.id}
                className="group bg-[#1E1513] border border-white/[0.08] hover:border-[#D6A56E]/40 rounded-3xl overflow-hidden transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-xl hover:-translate-y-1"
              >
                {/* Canister Image & Wishlist Button */}
                <div className="relative aspect-[4/3] bg-[#140E0C] overflow-hidden">
                  <img
                    src={product.image_url || '/assets/brand/packaging-canisters.jpg'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    onError={(e) => {
                      e.target.src = '/assets/brand/packaging-canisters.jpg';
                    }}
                  />

                  {/* Clean flavor pill */}
                  <div className="absolute top-3.5 left-3.5 z-10">
                    <span className="px-2.5 py-1 rounded-lg bg-[#140E0C]/80 backdrop-blur-md text-[11px] font-medium text-[#F6F2E8] border border-white/[0.1] shadow-sm">
                      {product.roast_level || 'Artisanal'}
                    </span>
                  </div>

                  {/* Wishlist Button */}
                  <button
                    onClick={() => handleToggleWishlist(product)}
                    className="absolute top-3.5 right-3.5 z-10 p-2 rounded-full bg-[#140E0C]/75 hover:bg-[#140E0C] text-[#F6F2E8] backdrop-blur-md transition-all active:scale-90 border border-white/[0.08]"
                    title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    aria-label="Wishlist"
                  >
                    <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'text-red-400 fill-red-400' : 'text-[#EAE2D9]'}`} />
                  </button>

                  {/* Subtle caffeine & stock note */}
                  <div className="absolute bottom-3 left-3.5 z-10 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-[#140E0C]/80 backdrop-blur-md text-[10px] font-medium text-[#D6A56E] border border-white/[0.08]">
                      50mg Pure Caffeine
                    </span>
                    {isOutOfStock && (
                      <span className="px-2 py-0.5 rounded-md bg-red-950/80 backdrop-blur-md text-[10px] font-medium text-red-200 border border-red-700/50">
                        Sold Out
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Tasting notes */}
                    {product.flavor_notes && (
                      <p className="text-[11px] font-medium text-[#D6A56E] uppercase tracking-wider mb-1 line-clamp-1">
                        {product.flavor_notes}
                      </p>
                    )}

                    {/* Title */}
                    <h3 
                      onClick={() => dispatch(setSelectedProduct(product))}
                      className="text-lg font-bold text-[#F6F2E8] hover:text-[#D6A56E] cursor-pointer transition-colors leading-tight mb-2"
                    >
                      {product.name}
                    </h3>

                    {/* Short Description */}
                    <p className="text-xs text-[#A89B93] line-clamp-2 leading-relaxed mb-4">
                      {product.tagline || product.description}
                    </p>
                  </div>

                  {/* Bottom Options & CTA */}
                  <div className="pt-4 border-t border-white/[0.06] space-y-3">
                    
                    {/* Pack Format Selector */}
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-[#A89B93] block mb-1 font-medium">
                        Canister Format:
                      </label>
                      <select
                        value={currentPack}
                        disabled={isOutOfStock}
                        onChange={(e) => handlePackChange(product.id, e.target.value)}
                        style={{ colorScheme: 'dark' }}
                        className="w-full bg-[#140E0C] border border-white/[0.08] rounded-xl px-2.5 py-1.5 text-xs text-[#EAE2D9] focus:outline-none focus:border-[#D6A56E]/50 disabled:opacity-50"
                      >
                        <option value="Single Canister (5 Gummies)">Single Canister (5 Gummies • 250mg)</option>
                        <option value="3-Pack Bundle (15 Gummies)">3-Pack Multi-Tin (15 Gummies)</option>
                        <option value="5-Pack Monthly Stash (25 Gummies)">5-Pack Stash (25 Gummies)</option>
                      </select>
                    </div>

                    {/* Price & Add to Cart button */}
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] text-[#A89B93] block leading-none">Starting at</span>
                        <span className="text-xl font-bold text-[#F6F2E8] block mt-0.5">
                          ₹{parseFloat(product.price).toFixed(2)}
                        </span>
                      </div>

                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={isOutOfStock}
                        className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm ${
                          isOutOfStock
                            ? 'bg-white/[0.05] text-white/30 cursor-not-allowed border border-white/[0.05]'
                            : addedItemNotice === product.id
                            ? 'bg-emerald-700 text-white'
                            : 'bg-[#5A1217] hover:bg-[#6E161C] text-[#F6F2E8] active:scale-95'
                        }`}
                      >
                        {isOutOfStock ? (
                          <span>Unavailable</span>
                        ) : addedItemNotice === product.id ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Added to Cart</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>Add to Cart</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Micro Assurances */}
                    <div className="pt-2 flex items-center justify-between text-[11px] text-[#A89B93]">
                      <span className="flex items-center gap-1 text-emerald-400">
                        <Truck className="w-3 h-3" />
                        <span>Free delivery &gt; 2 items</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-[#D6A56E]" />
                        <span>7-Day Returns</span>
                      </span>
                    </div>

                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. TASTING & CAFFEINE GUIDE (ELEGANT EDITORIAL SECTION) */}
      {/* ============================================================== */}
      <section className="mt-20 bg-[#1D1412] border border-white/[0.08] rounded-3xl p-6 sm:p-10 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          <div className="md:col-span-4 text-center md:text-left">
            <div className="w-20 h-24 mx-auto md:mx-0 mb-3 opacity-90">
              <BeanoMascot className="w-full h-full" mood="running" strokeColor="#D6A56E" />
            </div>
            <h3 className="text-xl font-bold text-[#F6F2E8] mb-1">
              Precision Dosage
            </h3>
            <p className="text-xs text-[#A89B93] leading-relaxed">
              Every gummy delivers exactly 50mg of natural caffeine extracted from single-origin Arabica.
            </p>
          </div>

          <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-[#140E0C] p-4 rounded-2xl border border-white/[0.06]">
              <span className="text-sm font-bold text-[#F6F2E8] block mb-1">1 Gummy • 50mg</span>
              <p className="text-[#A89B93] leading-relaxed">Gentle morning alertness. Equivalent to half a cup of standard roast.</p>
            </div>
            <div className="bg-[#140E0C] p-4 rounded-2xl border border-white/[0.06]">
              <span className="text-sm font-bold text-[#D6A56E] block mb-1">2 Gummies • 100mg</span>
              <p className="text-[#A89B93] leading-relaxed">Deep sustained focus. Ideal for intensive work sprints or pre-workout.</p>
            </div>
            <div className="bg-[#140E0C] p-4 rounded-2xl border border-white/[0.06]">
              <span className="text-sm font-bold text-[#F6F2E8] block mb-1">Plant Pectin</span>
              <p className="text-[#A89B93] leading-relaxed">Clean chew that won't stick to your teeth. 100% gelatin-free and vegan.</p>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
