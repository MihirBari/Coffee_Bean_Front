import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchActiveAnnouncement, fetchLightningDeal } from '../store/promotionsSlice';
import { applyPromoCodeDirect } from '../store/cartSlice';
import { ArrowRight, X, Copy, Check, Sparkles } from 'lucide-react';

export default function AnnouncementBar({ onNavigate }) {
  const dispatch = useDispatch();
  const { activeAnnouncement, lightningDeal } = useSelector((state) => state.promotions);
  const [isCopied, setIsCopied] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    dispatch(fetchActiveAnnouncement());
    dispatch(fetchLightningDeal());
  }, [dispatch]);

  if (!activeAnnouncement || !activeAnnouncement.is_active || isDismissed) {
    return null;
  }

  const {
    message,
    coupon_code = 'BEANO20',
    link_text,
    link_url = 'shop',
  } = activeAnnouncement;

  const handleCopyCoupon = (e) => {
    e.stopPropagation();
    if (coupon_code) {
      navigator.clipboard?.writeText(coupon_code);
      setIsCopied(true);
      dispatch(applyPromoCodeDirect({ code: coupon_code, discountPercent: 20 }));
      setTimeout(() => setIsCopied(false), 2200);
    }
  };

  const handleActionClick = () => {
    if (link_url && onNavigate) {
      onNavigate(link_url);
    }
  };

  return (
    <div className="relative w-full z-40 bg-[#1A1210] border-b border-white/[0.06] text-[#EAE2D9] text-[11px] sm:text-xs py-2 px-4 select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        
        {/* Main message & CTA (Centered) */}
        <div className="flex-1 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center">
          <div className="flex items-center gap-1.5 font-medium text-[#F6F2E8]">
            <Sparkles className="w-3 h-3 text-[#D6A56E] flex-shrink-0" />
            <span>{message || 'Pure Specialty Coffee, Transformed Into 50mg Caffeine Gummies'}</span>
          </div>

          {coupon_code && (
            <button
              onClick={handleCopyCoupon}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-[#D6A56E] border border-white/[0.08] transition-all cursor-pointer font-sans"
              title="Click to copy and apply discount"
            >
              <span>Code: <strong className="text-[#F6F2E8] font-semibold">{coupon_code}</strong></span>
              {isCopied ? (
                <span className="flex items-center gap-0.5 text-emerald-400 font-medium ml-1">
                  <Check className="w-3 h-3" /> Applied
                </span>
              ) : (
                <span className="flex items-center gap-0.5 text-white/50 hover:text-white/80 font-normal ml-1">
                  <Copy className="w-2.5 h-2.5" /> 20% Off
                </span>
              )}
            </button>
          )}

          {link_text && (
            <button
              onClick={handleActionClick}
              className="inline-flex items-center gap-1 text-[#D6A56E] hover:text-[#F6F2E8] font-medium transition-colors"
            >
              <span>{link_text}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Minimal dismiss button */}
        <button
          onClick={() => setIsDismissed(true)}
          className="text-white/40 hover:text-white/80 transition-colors p-1 rounded-md"
          title="Dismiss announcement"
          aria-label="Dismiss announcement"
        >
          <X className="w-3.5 h-3.5" />
        </button>

      </div>
    </div>
  );
}
