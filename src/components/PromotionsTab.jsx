import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  fetchCoupons, 
  createCoupon, 
  updateCoupon, 
  deleteCoupon,
  fetchAnnouncements,
  saveAnnouncement,
  toggleAnnouncement,
  deleteAnnouncement,
  fetchLightningDeal,
  updateLightningDeal,
  toggleLightningDeal,
  launchFlashSale
} from '../store/promotionsSlice';
import { 
  Tag, 
  Sparkles, 
  Megaphone, 
  Copy, 
  Check, 
  Plus, 
  Trash2, 
  Edit3, 
  Share2, 
  Eye, 
  Layers, 
  RefreshCw, 
  Flame, 
  Calendar, 
  ArrowRight,
  Sliders,
  DollarSign,
  Percent,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  X,
  Zap,
  Clock,
  Power
} from 'lucide-react';

export default function PromotionsTab({ onShowNotice }) {
  const dispatch = useDispatch();
  const { coupons, announcements, lightningDeal, status } = useSelector((state) => state.promotions);

  // Active sub-section: 'lightning' | 'coupons' | 'announcements'
  const [subTab, setSubTab] = useState('lightning');

  // Lightning Deals / Flash Sale Form State
  const [dealForm, setDealForm] = useState({
    title: '⚡ Roastery Lightning Deals',
    badge_text: 'Deal of the Day',
    description: 'Fresh roasted small-batch tins at roaster-direct pricing. Free delivery on more than 2 items!',
    coupon_code: 'FLASH20',
    discount_percent: 20,
    duration_hours: 4,
    claimed_percent: 84,
    items_left: 16,
    show_in_ticker: 1,
    is_active: 1,
    reset_timer: false
  });

  // Coupon Generator Form State
  const [couponForm, setCouponForm] = useState({
    code: '',
    discount_percent: 20,
    description: 'Special 20% discount for Friends & Family',
    max_uses: 50,
    min_order_amount: 0,
    expires_at: '',
    is_active: 1,
  });
  const [copiedCode, setCopiedCode] = useState(null);
  const [copiedShareMsg, setCopiedShareMsg] = useState(null);
  const [deleteConfirmCoupon, setDeleteConfirmCoupon] = useState(null);

  // Announcement Form State
  const [announcementForm, setAnnouncementForm] = useState({
    id: null,
    message: '🍬 The Bean Co. Launch: Use code FRIENDS20 for 20% OFF Chew The Brew plant-based coffee gummies! 50mg caffeine / gummy • Pocket canisters 💥',
    banner_type: 'marquee', // 'marquee' (moving small line) | 'static'
    coupon_code: 'FRIENDS20',
    link_text: 'Shop Canisters',
    link_url: 'shop',
    theme: 'sceptre-red', // 'sceptre-red' | 'java-dark' | 'gold-crema' | 'emerald'
    is_active: 1,
  });

  useEffect(() => {
    dispatch(fetchCoupons());
    dispatch(fetchAnnouncements());
    dispatch(fetchLightningDeal());
  }, [dispatch]);

  // Synchronize dealForm with latest lightning deal from database
  useEffect(() => {
    if (lightningDeal) {
      setDealForm({
        title: lightningDeal.title || '⚡ Roastery Lightning Deals',
        badge_text: lightningDeal.badge_text || 'Deal of the Day',
        description: lightningDeal.description || '',
        coupon_code: lightningDeal.coupon_code || 'FLASH20',
        discount_percent: lightningDeal.discount_percent ?? 20,
        duration_hours: lightningDeal.duration_hours ?? 4,
        claimed_percent: lightningDeal.claimed_percent ?? 84,
        items_left: lightningDeal.items_left ?? 16,
        show_in_ticker: lightningDeal.show_in_ticker !== undefined ? lightningDeal.show_in_ticker : 1,
        is_active: lightningDeal.is_active ? 1 : 0,
        reset_timer: false
      });
    }
  }, [lightningDeal]);

  // Synchronize announcementForm with latest announcement from database
  useEffect(() => {
    if (announcements && announcements.length > 0) {
      const activeAnn = announcements.find((a) => a.is_active === 1) || announcements[0];
      setAnnouncementForm({
        id: activeAnn.id,
        message: activeAnn.message || '',
        banner_type: activeAnn.banner_type || 'marquee',
        coupon_code: activeAnn.coupon_code || '',
        link_text: activeAnn.link_text || '',
        link_url: activeAnn.link_url || 'shop',
        theme: activeAnn.theme || 'sceptre-red',
        is_active: activeAnn.is_active ? 1 : 0,
      });
    }
  }, [announcements]);

  // Generate random coupon code
  const handleGenerateRandomCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let rand = '';
    for (let i = 0; i < 4; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCouponForm((prev) => ({ ...prev, code: `FRIEND-${rand}` }));
  };

  // Create Coupon submit
  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      await dispatch(createCoupon(couponForm)).unwrap();
      if (onShowNotice) {
        onShowNotice(`Coupon code "${couponForm.code || 'FRIEND'}" generated successfully!`);
      }
      setCouponForm({
        code: '',
        discount_percent: 20,
        description: 'Special discount for Friends & Family',
        max_uses: 50,
        min_order_amount: 0,
        expires_at: '',
        is_active: 1,
      });
    } catch (err) {
      alert(`Error creating coupon: ${err}`);
    }
  };

  // Toggle coupon active status
  const handleToggleCoupon = async (coupon) => {
    try {
      await dispatch(updateCoupon({
        id: coupon.id,
        data: { is_active: coupon.is_active ? 0 : 1 }
      })).unwrap();
      if (onShowNotice) {
        onShowNotice(`Coupon "${coupon.code}" ${coupon.is_active ? 'paused' : 'activated'}!`);
      }
    } catch (err) {
      alert(`Error toggling coupon: ${err}`);
    }
  };

  // Delete Coupon - opens confirmation modal
  const handleDeleteCoupon = (coupon) => {
    setDeleteConfirmCoupon(coupon);
  };

  const handleConfirmDeleteCoupon = async () => {
    if (!deleteConfirmCoupon) return;
    try {
      await dispatch(deleteCoupon(deleteConfirmCoupon.id)).unwrap();
      if (onShowNotice) {
        onShowNotice(`Coupon "${deleteConfirmCoupon.code}" deleted.`);
      }
    } catch (err) {
      alert(`Error deleting coupon: ${err}`);
    } finally {
      setDeleteConfirmCoupon(null);
    }
  };

  // Copy shareable message for friends
  const handleCopyShareForFriends = (coupon) => {
    const storeUrl = window.location.origin || 'http://localhost:5173';
    const text = `🍬 Hey! Enjoy ${coupon.discount_percent}% off Chew The Brew plant-based coffee caffeine gummies at The Bean Co with my promo code: ${coupon.code}\n👉 Order here: ${storeUrl}`;
    navigator.clipboard?.writeText(text);
    setCopiedShareMsg(coupon.id);
    setTimeout(() => setCopiedShareMsg(null), 2500);
    if (onShowNotice) {
      onShowNotice(`Copied share message for "${coupon.code}" to send to friends!`);
    }
  };

  // Copy code only
  const handleCopyCode = (code) => {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Save Announcement
  const handleSaveAnnouncement = async (e) => {
    e.preventDefault();
    if (!announcementForm.message.trim()) {
      alert('Please enter an announcement message');
      return;
    }
    try {
      await dispatch(saveAnnouncement(announcementForm)).unwrap();
      if (onShowNotice) {
        onShowNotice('Announcement banner published live on top of the store!');
      }
      dispatch(fetchAnnouncements());
    } catch (err) {
      alert(`Error publishing announcement: ${err}`);
    }
  };

  // Instant Toggle Announcement Banner Active / Disabled on live storefront
  const handleToggleBannerActive = async () => {
    const targetId = announcementForm.id || (announcements && announcements.length > 0 ? announcements[0].id : null);
    const nextActive = announcementForm.is_active ? 0 : 1;

    // Optimistically update UI
    setAnnouncementForm((prev) => ({ ...prev, is_active: nextActive }));

    if (targetId) {
      try {
        const updated = await dispatch(toggleAnnouncement(targetId)).unwrap();
        setAnnouncementForm((prev) => ({
          ...prev,
          id: updated.id,
          is_active: updated.is_active ? 1 : 0
        }));
        dispatch(fetchAnnouncements());
        if (onShowNotice) {
          onShowNotice(
            updated.is_active
              ? 'Announcement banner is now LIVE across the storefront!'
              : 'Announcement banner has been DISABLED on the storefront.'
          );
        }
      } catch (err) {
        // Rollback
        setAnnouncementForm((prev) => ({ ...prev, is_active: nextActive ? 0 : 1 }));
        alert(`Failed to toggle banner: ${err}`);
      }
    } else {
      try {
        const res = await dispatch(saveAnnouncement({ ...announcementForm, is_active: nextActive })).unwrap();
        setAnnouncementForm((prev) => ({
          ...prev,
          id: res.id,
          is_active: res.is_active ? 1 : 0
        }));
        dispatch(fetchAnnouncements());
        if (onShowNotice) {
          onShowNotice(
            nextActive
              ? 'Announcement banner is now LIVE across the storefront!'
              : 'Announcement banner has been DISABLED on the storefront.'
          );
        }
      } catch (err) {
        setAnnouncementForm((prev) => ({ ...prev, is_active: nextActive ? 0 : 1 }));
        alert(`Failed to save banner: ${err}`);
      }
    }
  };

  // Save or update Lightning Deal
  const handleSaveDeal = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateLightningDeal(dealForm)).unwrap();
      if (onShowNotice) {
        onShowNotice('Lightning Deal / Flash Sale banner published successfully!');
      }
      dispatch(fetchLightningDeal());
    } catch (err) {
      alert(`Error saving lightning deal: ${err}`);
    }
  };

  // Instant Toggle Lightning Deal
  const handleToggleDeal = async () => {
    try {
      const res = await dispatch(toggleLightningDeal()).unwrap();
      if (onShowNotice) {
        onShowNotice(
          res.is_active
            ? 'Flash Sale banner is now LIVE across the storefront!'
            : 'Flash Sale banner is now PAUSED / hidden on the storefront.'
        );
      }
      dispatch(fetchLightningDeal());
    } catch (err) {
      alert(`Error toggling flash sale: ${err}`);
    }
  };

  // Quick Launch Flash Sale Preset
  const handleQuickLaunch = async (hours, defaultTitle, defaultBadge) => {
    try {
      await dispatch(
        launchFlashSale({
          duration_hours: hours,
          title: defaultTitle,
          badge_text: defaultBadge,
          coupon_code: dealForm.coupon_code || 'FLASH20'
        })
      ).unwrap();
      if (onShowNotice) {
        onShowNotice(`⚡ ${defaultTitle} launched LIVE for ${hours} hours!`);
      }
      dispatch(fetchLightningDeal());
    } catch (err) {
      alert(`Error launching flash sale: ${err}`);
    }
  };

  // Populate announcement form for editing
  const handleEditAnnouncement = (ann) => {
    setAnnouncementForm({
      id: ann.id,
      message: ann.message,
      banner_type: ann.banner_type || 'marquee',
      coupon_code: ann.coupon_code || '',
      link_text: ann.link_text || '',
      link_url: ann.link_url || 'shop',
      theme: ann.theme || 'sceptre-red',
      is_active: ann.is_active,
    });
  };

  return (
    <div className="space-y-8 animate-fade-in text-xs font-body">

      {/* ============================================================== */}
      {/* 1. TOP HEADER & PROMOTIONS SUB-NAV */}
      {/* ============================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#2F201C] border-2 border-[#4A2E27] shadow-xl">
        <div>
          <div className="flex items-center space-x-2 mb-1.5 font-subhead">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#A5BCD6] bg-[#4D0E12] px-2.5 py-0.5 rounded-full border border-[#F5EFC6]/20">
              Marketing & Sales Hub
            </span>
            <span className="text-[10px] text-emerald-400 flex items-center space-x-1 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Promo Engine Live</span>
            </span>
          </div>
          <h2 className="font-headline font-black text-xl sm:text-2xl text-[#F5EFC6] uppercase tracking-wide">
            Flash Sales, Coupons & Store Banners
          </h2>
          <p className="text-[#A5BCD6] text-xs font-body">
            Announce dynamic lightning deals, generate friend coupon codes, and broadcast top sales tickers
          </p>
        </div>

        {/* Sub-tab Switcher: Lightning Deals vs Coupons vs Announcements */}
        <div className="flex flex-wrap items-center gap-1 bg-[#18100E] p-1 rounded-xl border border-[#4A2E27] font-subhead overflow-x-auto touch-scroll admin-tabs-scroll">
          <button
            onClick={() => setSubTab('lightning')}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              subTab === 'lightning'
                ? 'bg-[#4D0E12] text-[#F5EFC6] shadow'
                : 'text-[#F5EFC6]/60 hover:text-[#F5EFC6]'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>⚡ Flash Sale & Lightning Deals</span>
          </button>

          <button
            onClick={() => setSubTab('coupons')}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              subTab === 'coupons'
                ? 'bg-[#4D0E12] text-[#F5EFC6] shadow'
                : 'text-[#F5EFC6]/60 hover:text-[#F5EFC6]'
            }`}
          >
            <Tag className="w-3.5 h-3.5 text-amber-300" />
            <span>Friend Coupons ({coupons.length})</span>
          </button>

          <button
            onClick={() => setSubTab('announcements')}
            className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              subTab === 'announcements'
                ? 'bg-[#4D0E12] text-[#F5EFC6] shadow'
                : 'text-[#F5EFC6]/60 hover:text-[#F5EFC6]'
            }`}
          >
            <Megaphone className="w-3.5 h-3.5 text-[#A5BCD6]" />
            <span>Top Marquee Ticker</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. SUB-TAB: DYNAMIC FLASH SALE & LIGHTNING DEALS BANNER */}
      {/* ============================================================== */}
      {subTab === 'lightning' && (
        <div className="space-y-6">
          {/* Master Status & Fast Launch Control Bar */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#2F201C] border-2 border-[#4A2E27] shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#4A2E27] pb-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-headline font-black uppercase tracking-wider ${
                    lightningDeal?.is_active
                      ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/50 shadow-lg'
                      : 'bg-red-950/80 text-red-300 border border-red-500/40'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${lightningDeal?.is_active ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></span>
                    {lightningDeal?.is_active ? '⚡ FLASH SALE IS CURRENTLY LIVE ON STORE' : '⚪ FLASH SALE IS PAUSED / HIDDEN'}
                  </span>
                  {lightningDeal?.is_active && lightningDeal?.ends_at && (
                    <span className="text-[11px] text-[#A5BCD6] font-subhead">
                      Ends: {new Date(lightningDeal.ends_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({lightningDeal.duration_hours}h duration)
                    </span>
                  )}
                </div>
                <h3 className="font-headline font-black text-lg text-[#F5EFC6] uppercase tracking-wide">
                  Live Roastery Lightning Deals Control Center
                </h3>
                <p className="text-[11px] text-[#A5BCD6] font-body">
                  Control the Amazon/Flipkart-style countdown ticker banner on the Shop Catalog and announce deals anytime.
                </p>
              </div>

              {/* Master Instant Toggle Switch */}
              <button
                type="button"
                onClick={handleToggleDeal}
                className={`flex items-center space-x-2 px-5 py-3 rounded-2xl font-headline font-black text-xs uppercase tracking-wider transition-all active:scale-95 shadow-xl border cursor-pointer ${
                  lightningDeal?.is_active
                    ? 'bg-red-900/80 hover:bg-red-800 text-red-100 border-red-500/50 shadow-red-950/50'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 shadow-emerald-950/50 animate-bounce'
                }`}
              >
                <Power className="w-4 h-4" />
                <span>{lightningDeal?.is_active ? 'Pause / Hide Sale' : '⚡ Announce Sale Live Now!'}</span>
              </button>
            </div>

            {/* Quick 1-Click Launch Presets */}
            <div>
              <span className="text-[10px] font-subhead uppercase tracking-wider text-[#A5BCD6] font-bold block mb-2">
                ⚡ Quick 1-Click Sale Launch Presets (Instant Restart)
              </span>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleQuickLaunch(3, '⚡ 3-Hour Lightning Deal', 'Flash Sale')}
                  className="p-3 rounded-xl bg-[#18100E] hover:bg-[#4D0E12] border border-amber-500/30 hover:border-amber-400 text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between text-amber-300 font-headline font-bold text-xs mb-0.5">
                    <span>⚡ 3-Hour Flash</span>
                    <Clock className="w-3.5 h-3.5 group-hover:rotate-45 transition-transform" />
                  </div>
                  <p className="text-[10px] text-[#A5BCD6]">Quick 3-hour flash deal</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLaunch(12, '🔥 Roastery Deal of the Day', 'Deal of the Day')}
                  className="p-3 rounded-xl bg-[#18100E] hover:bg-[#4D0E12] border border-amber-500/30 hover:border-amber-400 text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between text-amber-300 font-headline font-bold text-xs mb-0.5">
                    <span>🔥 Deal of the Day</span>
                    <Flame className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                  </div>
                  <p className="text-[10px] text-[#A5BCD6]">Full 12-hour day deal</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLaunch(24, '🚀 24-Hour Super Roaster Deal', 'Super Deal')}
                  className="p-3 rounded-xl bg-[#18100E] hover:bg-[#4D0E12] border border-amber-500/30 hover:border-amber-400 text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between text-amber-300 font-headline font-bold text-xs mb-0.5">
                    <span>🚀 24-Hour Super</span>
                    <Zap className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                  </div>
                  <p className="text-[10px] text-[#A5BCD6]">24 hours of savings</p>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLaunch(48, '✨ Weekend Roastery Special', 'Weekend Special')}
                  className="p-3 rounded-xl bg-[#18100E] hover:bg-[#4D0E12] border border-amber-500/30 hover:border-amber-400 text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center justify-between text-amber-300 font-headline font-bold text-xs mb-0.5">
                    <span>✨ 48-Hour Weekend</span>
                    <Sparkles className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                  </div>
                  <p className="text-[10px] text-[#A5BCD6]">Weekend roast special</p>
                </button>
              </div>
            </div>
          </div>

          {/* Live Storefront Visual Preview Box */}
          <div className="p-5 rounded-2xl bg-[#18100E] border-2 border-[#4A2E27] shadow-xl space-y-3 font-subhead">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#A5BCD6] flex items-center space-x-1.5">
                <Eye className="w-3.5 h-3.5 text-amber-300" />
                <span>Live Interactive Storefront Preview (How Patrons See It in Shop)</span>
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                dealForm.is_active ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-red-950 text-red-300'
              }`}>
                {dealForm.is_active ? '● Banner Visible' : '○ Banner Hidden'}
              </span>
            </div>

            {/* PREVIEW BANNER */}
            <div className="relative bg-gradient-to-r from-[#4D0E12] via-[#2F201C] to-[#18100E] border-2 border-amber-500/50 rounded-2xl p-4 sm:p-5 shadow-2xl overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500 text-[#231815] flex items-center justify-center font-black shadow-lg flex-shrink-0">
                    <Zap className="w-5 h-5 fill-current text-[#231815]" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-headline font-black text-sm uppercase tracking-wider text-amber-300">
                        {dealForm.title || '⚡ Roastery Lightning Deals'}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-wider bg-red-600 text-white px-2 py-0.5 rounded-full">
                        {dealForm.badge_text || 'Deal of the Day'}
                      </span>
                    </div>
                    <p className="text-xs text-[#F5EFC6]/85 font-body mt-0.5">
                      {dealForm.description || 'Fresh roasted small-batch tins at roaster-direct pricing. Free delivery on more than 2 items!'}
                    </p>
                    {dealForm.coupon_code && (
                      <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#18100E] border border-amber-400/50 text-amber-300 text-[11px] font-headline font-bold">
                        <Tag className="w-3 h-3 text-amber-400" />
                        <span>Use Code: <strong className="text-[#F5EFC6]">{dealForm.coupon_code}</strong></span>
                        <span className="bg-emerald-500/20 text-emerald-400 px-1 py-0.2 rounded text-[9px] font-black">
                          {dealForm.discount_percent}% OFF
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 self-start md:self-auto">
                  <div className="flex items-center gap-1 font-headline">
                    <span className="text-[10px] uppercase tracking-wider text-[#A5BCD6] font-bold mr-1">Ends In:</span>
                    <div className="bg-[#18100E] border border-amber-500/50 px-2 py-1 rounded-lg text-center min-w-[32px]">
                      <span className="text-xs font-black text-amber-300">0{dealForm.duration_hours}</span>
                      <span className="text-[7px] block text-[#A5BCD6] uppercase font-bold">hr</span>
                    </div>
                    <span className="text-amber-400 font-bold">:</span>
                    <div className="bg-[#18100E] border border-amber-500/50 px-2 py-1 rounded-lg text-center min-w-[32px]">
                      <span className="text-xs font-black text-amber-300">00</span>
                      <span className="text-[7px] block text-[#A5BCD6] uppercase font-bold">min</span>
                    </div>
                    <span className="text-amber-400 font-bold">:</span>
                    <div className="bg-[#18100E] border border-amber-500/50 px-2 py-1 rounded-lg text-center min-w-[32px]">
                      <span className="text-xs font-black text-amber-300">00</span>
                      <span className="text-[7px] block text-[#A5BCD6] uppercase font-bold">sec</span>
                    </div>
                  </div>

                  <div className="min-w-[120px]">
                    <div className="flex items-center justify-between text-[9px] font-subhead mb-1">
                      <span className="text-amber-300 font-bold">{dealForm.claimed_percent}% Claimed</span>
                      <span className="text-[#A5BCD6]">{dealForm.items_left} left</span>
                    </div>
                    <div className="w-full bg-[#18100E] h-1.5 rounded-full overflow-hidden border border-[#4A2E27]">
                      <div className="bg-gradient-to-r from-amber-500 to-red-500 h-full rounded-full" style={{ width: `${dealForm.claimed_percent}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Configuration Card */}
          <div className="p-6 rounded-2xl bg-[#2F201C] border-2 border-[#4A2E27] shadow-xl space-y-5">
            <h3 className="font-headline font-black text-base text-[#F5EFC6] uppercase tracking-wide border-b border-[#4A2E27] pb-3 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-300" />
              <span>Customize Flash Sale Details, Coupon & Timer</span>
            </h3>

            <form onSubmit={handleSaveDeal} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-subhead font-bold uppercase tracking-wider text-[#A5BCD6] block mb-1.5">
                    Sale Headline / Title
                  </label>
                  <input
                    type="text"
                    value={dealForm.title}
                    onChange={(e) => setDealForm({ ...dealForm, title: e.target.value })}
                    placeholder="e.g. ⚡ Roastery Lightning Deals"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#18100E] border border-[#4A2E27] focus:border-amber-400 text-[#F5EFC6] text-xs font-body"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-subhead font-bold uppercase tracking-wider text-[#A5BCD6] block mb-1.5">
                    Pill Badge Text
                  </label>
                  <input
                    type="text"
                    value={dealForm.badge_text}
                    onChange={(e) => setDealForm({ ...dealForm, badge_text: e.target.value })}
                    placeholder="e.g. Deal of the Day / Flash Sale"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#18100E] border border-[#4A2E27] focus:border-amber-400 text-[#F5EFC6] text-xs font-body"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-subhead font-bold uppercase tracking-wider text-[#A5BCD6] block mb-1.5">
                  Deal Offer Subtitle / Description
                </label>
                <textarea
                  value={dealForm.description}
                  onChange={(e) => setDealForm({ ...dealForm, description: e.target.value })}
                  rows={2}
                  placeholder="Fresh roasted small-batch tins at roaster-direct pricing. Free delivery on more than 2 items!"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#18100E] border border-[#4A2E27] focus:border-amber-400 text-[#F5EFC6] text-xs font-body resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-[11px] font-subhead font-bold uppercase tracking-wider text-[#A5BCD6] block mb-1.5">
                    Attach Coupon Code
                  </label>
                  <input
                    type="text"
                    value={dealForm.coupon_code}
                    onChange={(e) => setDealForm({ ...dealForm, coupon_code: e.target.value.toUpperCase() })}
                    placeholder="e.g. FLASH20"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#18100E] border border-[#4A2E27] focus:border-amber-400 text-amber-300 font-headline font-bold text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-subhead font-bold uppercase tracking-wider text-[#A5BCD6] block mb-1.5">
                    Discount Percentage (%)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={dealForm.discount_percent}
                    onChange={(e) => setDealForm({ ...dealForm, discount_percent: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#18100E] border border-[#4A2E27] focus:border-amber-400 text-[#F5EFC6] text-xs font-body"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-subhead font-bold uppercase tracking-wider text-[#A5BCD6] block mb-1.5">
                    Sale Duration (Hours)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="168"
                    value={dealForm.duration_hours}
                    onChange={(e) => setDealForm({ ...dealForm, duration_hours: parseInt(e.target.value, 10) || 4 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#18100E] border border-[#4A2E27] focus:border-amber-400 text-[#F5EFC6] text-xs font-body"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-subhead font-bold uppercase tracking-wider text-[#A5BCD6] block mb-1.5">
                    Claim Progress (% Claimed)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={dealForm.claimed_percent}
                    onChange={(e) => setDealForm({ ...dealForm, claimed_percent: parseInt(e.target.value, 10) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#18100E] border border-[#4A2E27] focus:border-amber-400 text-[#F5EFC6] text-xs font-body"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="text-[11px] font-subhead font-bold uppercase tracking-wider text-[#A5BCD6] block mb-1.5">
                    Items Left Count (Visual Urgency)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={dealForm.items_left}
                    onChange={(e) => setDealForm({ ...dealForm, items_left: parseInt(e.target.value, 10) || 0 })}
                    placeholder="e.g. 16"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#18100E] border border-[#4A2E27] focus:border-amber-400 text-[#F5EFC6] text-xs font-body"
                  />
                </div>

                <div className="flex flex-col justify-end space-y-2">
                  <label className="flex items-center space-x-2 text-xs font-subhead text-[#F5EFC6] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dealForm.reset_timer}
                      onChange={(e) => setDealForm({ ...dealForm, reset_timer: e.target.checked })}
                      className="accent-amber-500 rounded"
                    />
                    <span>Restart / Reset Countdown Clock to {dealForm.duration_hours} Hours from NOW</span>
                  </label>
                  <label className="flex items-center space-x-2 text-xs font-subhead text-[#F5EFC6] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dealForm.show_in_ticker}
                      onChange={(e) => setDealForm({ ...dealForm, show_in_ticker: e.target.checked ? 1 : 0 })}
                      className="accent-amber-500 rounded"
                    />
                    <span>Also Broadcast Flash Sale in Top Marquee Ticker Bar across all pages</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-[#4A2E27] flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleToggleDeal}
                  className="px-4 py-2.5 rounded-xl bg-[#18100E] hover:bg-[#2F201C] text-[#F5EFC6] font-subhead font-bold text-xs border border-[#4A2E27] transition-all cursor-pointer"
                >
                  {dealForm.is_active ? 'Pause / Hide Banner' : 'Activate Banner'}
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#4D0E12] hover:bg-[#4D0E12]/90 text-[#F5EFC6] font-headline font-bold text-xs uppercase tracking-wider border border-[#F5EFC6]/30 shadow-xl flex items-center space-x-2 cursor-pointer transition-all active:scale-95"
                >
                  <Zap className="w-4 h-4 text-amber-300" />
                  <span>Save & Announce Sale Live</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. SUB-TAB: COUPON CODE GENERATOR FOR FRIENDS */}
      {/* ============================================================== */}
      {subTab === 'coupons' && (
        <div className="space-y-6">
          
          {/* Coupon Generator Form Card */}
          <div className="p-6 rounded-2xl bg-[#2F201C] border-2 border-[#4A2E27] shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#4A2E27] pb-3">
              <div>
                <h3 className="font-headline font-black text-lg text-[#F5EFC6] flex items-center space-x-2 uppercase tracking-wide">
                  <Tag className="w-4 h-4 text-amber-300" />
                  <span>Generate New Coupon for Friends & Customers</span>
                </h3>
                <p className="text-[11px] text-[#A5BCD6] font-body">
                  Create custom or randomized promo codes that friends can enter in their shopping cart
                </p>
              </div>

              <button
                type="button"
                onClick={handleGenerateRandomCode}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#18100E] hover:bg-[#231815] text-amber-300 text-xs border border-amber-500/30 font-subhead font-semibold self-start sm:self-auto transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>🎲 Generate Random Code</span>
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-4 font-subhead">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Code Input */}
                <div>
                  <label className="text-[#A5BCD6] font-semibold block mb-1">Coupon Code *</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="e.g. FRIENDS25 or BEANO50"
                      value={couponForm.code}
                      onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                      className="w-full bg-[#18100E] border border-[#4A2E27] rounded-xl px-3 py-2 text-[#F5EFC6] uppercase font-mono font-bold focus:outline-none focus:border-[#A5BCD6]"
                    />
                  </div>
                  <span className="text-[10px] text-[#A5BCD6]/70 mt-0.5 block font-body">Leave blank & click Generate for random code</span>
                </div>

                {/* Discount Percentage Selector */}
                <div>
                  <label className="text-[#A5BCD6] font-semibold block mb-1">Discount Percentage *</label>
                  <div className="flex items-center space-x-1.5">
                    {[10, 15, 20, 25, 30].map((pct) => (
                      <button
                        key={pct}
                        type="button"
                        onClick={() => setCouponForm({ ...couponForm, discount_percent: pct })}
                        className={`flex-1 py-2 rounded-xl font-bold transition-all ${
                          couponForm.discount_percent === pct
                            ? 'bg-[#4D0E12] text-[#F5EFC6] border border-[#F5EFC6]/40 shadow-sm'
                            : 'bg-[#18100E] text-[#A5BCD6] hover:text-[#F5EFC6] border border-[#4A2E27]'
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                    <input
                      type="number"
                      min="1"
                      max="100"
                      placeholder="Custom"
                      value={couponForm.discount_percent}
                      onChange={(e) => setCouponForm({ ...couponForm, discount_percent: parseInt(e.target.value, 10) || 0 })}
                      className="w-16 bg-[#18100E] border border-[#4A2E27] rounded-xl px-2 py-2 text-center text-[#F5EFC6] font-bold focus:outline-none focus:border-[#A5BCD6]"
                    />
                  </div>
                </div>

                {/* Max Uses */}
                <div>
                  <label className="text-[#A5BCD6] font-semibold block mb-1">Max Uses Limit</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 50 uses"
                    value={couponForm.max_uses}
                    onChange={(e) => setCouponForm({ ...couponForm, max_uses: parseInt(e.target.value, 10) || 100 })}
                    className="w-full bg-[#18100E] border border-[#4A2E27] rounded-xl px-3 py-2 text-[#F5EFC6] focus:outline-none focus:border-[#A5BCD6]"
                  />
                  <span className="text-[10px] text-[#A5BCD6]/70 mt-0.5 block font-body">Total times friends can redeem this code</span>
                </div>

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Description */}
                <div className="sm:col-span-2">
                  <label className="text-[#A5BCD6] font-semibold block mb-1">Description / Promo Title</label>
                  <input
                    type="text"
                    placeholder="e.g. 20% off Chew The Brew gummy variety canisters"
                    value={couponForm.description}
                    onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                    className="w-full bg-[#18100E] border border-[#4A2E27] rounded-xl px-3 py-2 text-[#F5EFC6] focus:outline-none focus:border-[#A5BCD6]"
                  />
                </div>

                {/* Expiration Date */}
                <div>
                  <label className="text-[#A5BCD6] font-semibold block mb-1">Expiration Date (Optional)</label>
                  <input
                    type="date"
                    value={couponForm.expires_at}
                    onChange={(e) => setCouponForm({ ...couponForm, expires_at: e.target.value })}
                    className="w-full bg-[#18100E] border border-[#4A2E27] rounded-xl px-3 py-2 text-[#F5EFC6] focus:outline-none focus:border-[#A5BCD6]"
                  />
                </div>

              </div>

              {/* Submit Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#4D0E12] hover:bg-[#4D0E12]/80 text-[#F5EFC6] font-headline font-bold text-xs uppercase tracking-wider border border-[#F5EFC6]/30 shadow-xl flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4 text-[#F5EFC6]" />
                  <span>Create & Activate Coupon</span>
                </button>
              </div>

            </form>
          </div>

          {/* Active Coupons List */}
          <div className="p-6 rounded-2xl bg-[#2F201C] border-2 border-[#4A2E27] shadow-xl space-y-4">
            <div className="border-b border-[#4A2E27] pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-headline font-black text-lg text-[#F5EFC6] uppercase tracking-wide">
                  Active & Generated Coupons ({coupons.length})
                </h3>
                <p className="text-[11px] text-[#A5BCD6] font-body">
                  Share these codes with friends or copy the pre-written invitation message
                </p>
              </div>
              <span className="text-[11px] text-emerald-400 font-subhead font-semibold bg-emerald-950/60 px-3 py-1 rounded-lg border border-emerald-800">
                Works instantly in checkout cart
              </span>
            </div>

            {/* Coupons Table */}
            <div className="overflow-x-auto touch-scroll">
              <table className="w-full text-left text-xs font-body">
                <thead>
                  <tr className="border-b border-[#4A2E27] text-[#A5BCD6] font-subhead font-semibold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-3">Promo Code</th>
                    <th className="py-3 px-3">Discount</th>
                    <th className="py-3 px-3">Description</th>
                    <th className="py-3 px-3">Usage Progress</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-3 text-right">Share with Friends</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#4A2E27]/40">
                  {coupons.map((coupon) => {
                    const usagePercent = Math.min(100, Math.round((coupon.used_count / (coupon.max_uses || 1)) * 100));
                    const isShareCopied = copiedShareMsg === coupon.id;

                    return (
                      <tr key={coupon.id} className="hover:bg-[#3B2822]/40 transition-colors">
                        
                        {/* Coupon Code Pill */}
                        <td className="py-3 px-3">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-bold text-sm text-[#F5EFC6] bg-[#18100E] px-2.5 py-1 rounded-lg border border-[#4A2E27]">
                              {coupon.code}
                            </span>
                            <button
                              onClick={() => handleCopyCode(coupon.code)}
                              className="p-1 text-[#A5BCD6] hover:text-[#F5EFC6]"
                              title="Copy code only"
                            >
                              {copiedCode === coupon.code ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5 opacity-70" />
                              )}
                            </button>
                          </div>
                        </td>

                        {/* Discount % */}
                        <td className="py-3 px-3 font-subhead">
                          <span className="font-bold text-sm text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                            {coupon.discount_percent}% OFF
                          </span>
                        </td>

                        {/* Description */}
                        <td className="py-3 px-3 text-[#A5BCD6]">
                          {coupon.description || 'Special Friend Discount'}
                        </td>

                        {/* Usage Progress */}
                        <td className="py-3 px-3 min-w-[130px] font-subhead">
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] text-[#A5BCD6]">
                              <span>{coupon.used_count} used</span>
                              <span>{coupon.max_uses} limit</span>
                            </div>
                            <div className="w-full bg-[#18100E] rounded-full h-1.5 overflow-hidden border border-[#4A2E27]">
                              <div
                                style={{ width: `${usagePercent}%` }}
                                className="bg-amber-400 h-full rounded-full"
                              ></div>
                            </div>
                          </div>
                        </td>

                        {/* Status Toggle */}
                        <td className="py-3 px-3 text-center font-subhead">
                          <button
                            onClick={() => handleToggleCoupon(coupon)}
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                              coupon.is_active
                                ? 'bg-emerald-950 text-emerald-300 border-emerald-800 hover:bg-emerald-900'
                                : 'bg-[#18100E] text-[#A5BCD6]/60 border-[#4A2E27] hover:text-[#F5EFC6]'
                            }`}
                          >
                            {coupon.is_active ? 'Active' : 'Paused'}
                          </button>
                        </td>

                        {/* 1-Click Share for Friends Button */}
                        <td className="py-3 px-3 text-right font-subhead">
                          <button
                            onClick={() => handleCopyShareForFriends(coupon)}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-[#4D0E12] hover:bg-[#4D0E12]/80 text-[#F5EFC6] text-[11px] font-semibold border border-[#F5EFC6]/20 transition-all shadow-sm"
                            title="Copy ready-to-send invite message to send via WhatsApp, email or message"
                          >
                            {isShareCopied ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-300">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Share2 className="w-3 h-3 text-amber-300" />
                                <span>Share with Friends</span>
                              </>
                            )}
                          </button>
                        </td>

                        {/* Delete */}
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => handleDeleteCoupon(coupon)}
                            className="p-1 rounded hover:bg-red-950 text-red-400 hover:text-red-200 transition-colors"
                            title="Delete coupon"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* 3. SUB-TAB: ANNOUNCE SALE / MOVING TOP BANNER CONTROL */}
      {/* ============================================================== */}
      {subTab === 'announcements' && (
        <div className="space-y-6">
          
          {/* Live Storefront Preview */}
          <div className="p-5 rounded-2xl bg-[#18100E] border-2 border-[#4A2E27] shadow-xl space-y-3 font-subhead">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#A5BCD6] flex items-center space-x-1.5">
                <Eye className="w-3.5 h-3.5 text-amber-300" />
                <span>Live Storefront Top Banner Preview (How Visitors See It)</span>
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                announcementForm.is_active ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-red-950 text-red-300'
              }`}>
                {announcementForm.is_active ? '● Live on Store' : '○ Disabled'}
              </span>
            </div>

            {/* Interactive Preview Render */}
            <div className={`p-2.5 rounded-xl border text-xs overflow-hidden select-none ${
              announcementForm.theme === 'sceptre-red' ? 'bg-[#4D0E12] text-[#F5EFC6] border-[#F5EFC6]/30' :
              announcementForm.theme === 'gold-crema' ? 'bg-[#F5EFC6] text-[#231815] border-[#231815]/30' :
              announcementForm.theme === 'emerald' ? 'bg-emerald-950 text-emerald-100 border-emerald-800' :
              'bg-[#18100E] text-[#F5EFC6] border-[#4A2E27]'
            }`}>
              {announcementForm.banner_type === 'marquee' ? (
                <div className="flex items-center overflow-hidden whitespace-nowrap">
                  <div className="inline-flex items-center space-x-6 animate-marquee">
                    <span className="flex items-center space-x-1.5 font-medium">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                      <span>{announcementForm.message}</span>
                    </span>
                    {announcementForm.coupon_code && (
                      <span className="px-2 py-0.5 rounded-full bg-black/40 text-[#F5EFC6] font-mono font-bold border border-[#F5EFC6]/20">
                        🏷️ CODE: {announcementForm.coupon_code} (Click to Apply)
                      </span>
                    )}
                    {announcementForm.link_text && (
                      <span className="underline font-bold text-[11px]">
                        {announcementForm.link_text} &rarr;
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-4">
                  <span className="font-medium flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>{announcementForm.message}</span>
                  </span>
                  {announcementForm.coupon_code && (
                    <span className="px-2 py-0.5 rounded-full bg-black/40 font-mono font-bold text-[#F5EFC6] border border-[#F5EFC6]/20">
                      🏷️ {announcementForm.coupon_code}
                    </span>
                  )}
                  {announcementForm.link_text && (
                    <span className="underline font-bold">
                      {announcementForm.link_text} &rarr;
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Banner Settings Form */}
          <div className="p-6 rounded-2xl bg-[#2F201C] border-2 border-[#4A2E27] shadow-xl space-y-5">
            <div className="border-b border-[#4A2E27] pb-3 flex items-center justify-between">
              <div>
                <h3 className="font-headline font-black text-lg text-[#F5EFC6] flex items-center space-x-2 uppercase tracking-wide">
                  <Megaphone className="w-4 h-4 text-[#A5BCD6]" />
                  <span>Configure Announcement & Sale Broadcast</span>
                </h3>
                <p className="text-[11px] text-[#A5BCD6] font-body">
                  Control whether a moving ticker line or static banner appears across the site
                </p>
              </div>

              {/* Master Active / Disabled Toggle */}
              <div className="flex items-center space-x-2.5 bg-[#18100E] px-3.5 py-2 rounded-xl border border-[#4A2E27] font-subhead">
                <span className="text-xs font-semibold text-[#A5BCD6]">Banner Active:</span>
                <button
                  type="button"
                  onClick={handleToggleBannerActive}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                    announcementForm.is_active ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-zinc-700 hover:bg-zinc-600'
                  }`}
                  title={announcementForm.is_active ? 'Click to disable banner' : 'Click to activate banner'}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      announcementForm.is_active ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  ></div>
                </button>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                  announcementForm.is_active ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-red-950 text-red-300 border-red-800'
                }`}>
                  {announcementForm.is_active ? 'LIVE' : 'DISABLED'}
                </span>
              </div>
            </div>

            <form onSubmit={handleSaveAnnouncement} className="space-y-4 font-subhead">
              
              {/* Banner Style Switcher */}
              <div>
                <label className="text-[#A5BCD6] font-semibold block mb-1">Banner Motion & Display Style</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAnnouncementForm({ ...announcementForm, banner_type: 'marquee' })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      announcementForm.banner_type === 'marquee'
                        ? 'bg-[#4D0E12] border-[#F5EFC6]/40 text-[#F5EFC6] shadow'
                        : 'bg-[#18100E] border-[#4A2E27] text-[#A5BCD6] hover:text-[#F5EFC6]'
                    }`}
                  >
                    <p className="font-bold text-xs flex items-center space-x-1.5">
                      <span>🏃 Moving Small Line (Continuous Marquee Ticker)</span>
                    </p>
                    <p className="text-[11px] text-[#A5BCD6] mt-0.5 font-body">
                      Smooth scrolling line across the top of the screen that pauses gently on hover
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAnnouncementForm({ ...announcementForm, banner_type: 'static' })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      announcementForm.banner_type === 'static'
                        ? 'bg-[#4D0E12] border-[#F5EFC6]/40 text-[#F5EFC6] shadow'
                        : 'bg-[#18100E] border-[#4A2E27] text-[#A5BCD6] hover:text-[#F5EFC6]'
                    }`}
                  >
                    <p className="font-bold text-xs flex items-center space-x-1.5">
                      <span>📌 Static Centered Announcement Bar</span>
                    </p>
                    <p className="text-[11px] text-[#A5BCD6] mt-0.5 font-body">
                      Fixed modern announcement bar centered on top of navigation
                    </p>
                  </button>
                </div>
              </div>

              {/* Announcement Message Text */}
              <div>
                <label className="text-[#A5BCD6] font-semibold block mb-1">Announcement Message *</label>
                <textarea
                  rows="2"
                  required
                  placeholder="e.g. 🍬 The Bean Co Launch: 20% OFF pocket coffee gummies with code FRIENDS20 • 50mg caffeine/chew! 💥"
                  value={announcementForm.message}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, message: e.target.value })}
                  className="w-full bg-[#18100E] border border-[#4A2E27] rounded-xl px-3 py-2 text-[#F5EFC6] focus:outline-none focus:border-[#A5BCD6]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Highlight Coupon Code */}
                <div>
                  <label className="text-[#A5BCD6] font-semibold block mb-1">Highlight Coupon Code</label>
                  <input
                    type="text"
                    placeholder="e.g. FRIENDS20"
                    value={announcementForm.coupon_code}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, coupon_code: e.target.value.toUpperCase() })}
                    className="w-full bg-[#18100E] border border-[#4A2E27] rounded-xl px-3 py-2 text-[#F5EFC6] uppercase font-mono font-bold focus:outline-none focus:border-[#A5BCD6]"
                  />
                  <span className="text-[10px] text-[#A5BCD6]/70 mt-0.5 block font-body">Shows a 1-click copy badge in the banner</span>
                </div>

                {/* Call To Action Text */}
                <div>
                  <label className="text-[#A5BCD6] font-semibold block mb-1">Action Link Text (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Shop Canisters or Chew The Brew"
                    value={announcementForm.link_text}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, link_text: e.target.value })}
                    className="w-full bg-[#18100E] border border-[#4A2E27] rounded-xl px-3 py-2 text-[#F5EFC6] focus:outline-none focus:border-[#A5BCD6]"
                  />
                </div>

                {/* Theme Selector */}
                <div>
                  <label className="text-[#A5BCD6] font-semibold block mb-1">Banner Color Palette</label>
                  <select
                    value={announcementForm.theme}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, theme: e.target.value })}
                    style={{ colorScheme: 'dark' }}
                    className="w-full bg-[#18100E] border border-[#4A2E27] rounded-xl px-3 py-2 text-[#F5EFC6] focus:outline-none focus:border-[#A5BCD6]"
                  >
                    <option value="sceptre-red" className="bg-[#18100E] text-[#F5EFC6]">Sceptre Red (#4D0E12) - Primary</option>
                    <option value="java-dark" className="bg-[#18100E] text-[#F5EFC6]">Java Espresso (#18100E) - Stealth Dark</option>
                    <option value="gold-crema" className="bg-[#18100E] text-[#F5EFC6]">Crema Gold (#F5EFC6) - High Contrast</option>
                    <option value="emerald" className="bg-[#18100E] text-[#F5EFC6]">Emerald Forest (#064E3B) - Special Event</option>
                  </select>
                </div>

              </div>

              {/* Submit / Publish Button */}
              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#4D0E12] hover:bg-[#4D0E12]/80 text-[#F5EFC6] font-headline font-bold text-xs uppercase tracking-wider border border-[#F5EFC6]/30 shadow-xl flex items-center space-x-2"
                >
                  <Megaphone className="w-4 h-4 text-[#F5EFC6]" />
                  <span>Publish Top Announcement Banner</span>
                </button>
              </div>

            </form>
          </div>

        </div>
      )}

      {/* Coupon Delete Confirmation Modal */}
      {deleteConfirmCoupon && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={() => setDeleteConfirmCoupon(null)}
        >
          <div
            className="relative w-full max-w-md bg-[#18100E] border-2 border-red-900/60 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 text-center overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setDeleteConfirmCoupon(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-[#2F201C] hover:bg-[#4D0E12] text-[#F5EFC6] border border-[#4A2E27] transition-colors"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mx-auto w-16 h-16 rounded-2xl bg-red-950/70 border-2 border-red-600/40 flex items-center justify-center shadow-lg shadow-red-950/50">
              <Trash2 className="w-8 h-8 text-red-400 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h3 className="font-headline font-black text-xl sm:text-2xl text-[#F5EFC6] uppercase tracking-wide">
                Delete Promo Coupon
              </h3>
              <p className="font-body text-xs sm:text-sm text-[#A5BCD6] leading-relaxed">
                Are you sure you want to delete coupon code{' '}
                <strong className="text-amber-300 font-bold">"{deleteConfirmCoupon.code}"</strong>?
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#2F201C] border border-red-900/40 text-left flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-[11px] leading-tight space-y-1">
                <span className="font-bold text-amber-300 block uppercase tracking-wider text-[10px]">
                  Warning: Irreversible Action
                </span>
                <span className="text-[#F5EFC6]/75 block">
                  Shoppers will no longer be able to redeem this coupon at checkout.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmCoupon(null)}
                className="flex-1 py-3 px-4 rounded-xl bg-[#2F201C] hover:bg-[#4A2E27] text-[#F5EFC6] font-headline font-bold text-xs uppercase tracking-wider border border-[#4A2E27] transition-all"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDeleteCoupon}
                className="flex-1 py-3 px-4 rounded-xl bg-red-700 hover:bg-red-800 active:scale-95 text-white font-headline font-black text-xs uppercase tracking-wider border border-red-500/40 shadow-xl shadow-red-950/60 transition-all flex items-center justify-center space-x-2"
              >
                <Trash2 className="w-4 h-4 text-white" />
                <span>Yes, Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
