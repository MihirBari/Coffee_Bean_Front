import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { openReturnPolicyModal } from '../store/settingsSlice';
import BrandLogo from './BrandLogo';
import BeanoMascot from './BeanoMascot';
import { 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  ArrowRight, 
  Check, 
  RotateCcw,
  Leaf,
  Zap,
  Sparkles
} from 'lucide-react';

export default function Footer({ setCurrentView }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { settings } = useSelector((state) => state.settings);
  const freeThreshold = Number(settings?.free_delivery_item_threshold ?? 2);
  const returnDays = settings?.return_window_days || 7;
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (newsletterEmail.trim() && newsletterEmail.includes('@')) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 5000);
      setNewsletterEmail('');
    }
  };

  const navigateTo = (view, sectionId = null) => {
    if (setCurrentView) setCurrentView(view);
    const targetPath = view === 'story' ? '/' : (view === 'shop' ? '/shop' : (view === 'admin' ? '/admin' : (view.startsWith('/') ? view : `/${view}`)));
    navigate(targetPath);
    if (sectionId) {
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        else window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-[#120B09] border-t border-white/[0.06] text-[#EAE2D9] pt-14 pb-12 relative overflow-hidden">
      
      {/* Subtle ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-24 bg-[#5A1217]/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* TIER 1: NEWSLETTER SIGNUP */}
        <div className="bg-[#1C1310] border border-white/[0.08] rounded-3xl p-6 sm:p-8 md:p-10 mb-14 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.04] text-[#D6A56E] border border-white/[0.06] text-xs font-medium mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>The Roastery Club</span>
              </div>
              <h3 className="font-extrabold text-2xl sm:text-3xl text-[#F6F2E8] mb-2 tracking-tight">
                Join The Bean Co. Society
              </h3>
              <p className="text-xs sm:text-sm text-[#A89B93] leading-relaxed max-w-xl">
                Get <strong className="text-[#F6F2E8]">10% off</strong> your first canister order, early access to limited gummy drops, and caffeine micro-dosing notes.
              </p>
            </div>

            <div className="lg:col-span-5">
              <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                <div className="flex flex-col xs:flex-row gap-2">
                  <div className="relative flex-1">
                    <Mail className="w-4 h-4 text-[#A89B93] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={newsletterEmail}
                      onChange={(e) => setNewsletterEmail(e.target.value)}
                      placeholder="Enter your email..."
                      className="w-full bg-[#140E0C] border border-white/[0.08] rounded-xl pl-10 pr-4 py-2.5 text-xs text-[#F6F2E8] placeholder-[#A89B93]/50 focus:outline-none focus:border-[#D6A56E]/50 transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#5A1217] hover:bg-[#6E161C] text-[#F6F2E8] font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm active:scale-95 whitespace-nowrap"
                  >
                    <span>Subscribe</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                {subscribed ? (
                  <p className="text-xs text-emerald-400 font-medium flex items-center gap-1.5 pt-1 animate-fade-in">
                    <Check className="w-3.5 h-3.5" />
                    <span>Welcome to the club! Check your inbox for your 10% coupon.</span>
                  </p>
                ) : (
                  <p className="text-[11px] text-[#A89B93]/60">
                    No spam. Unsubscribe anytime.
                  </p>
                )}
              </form>
            </div>

          </div>
        </div>

        {/* TIER 2: 4-COLUMN FOOTER LINKS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 pb-12 border-b border-white/[0.06] text-xs">
          
          {/* Column 1: Brand */}
          <div className="sm:col-span-2 lg:col-span-4 space-y-4">
            <div 
              onClick={() => navigateTo('story')}
              className="flex items-center space-x-3 cursor-pointer group w-fit"
            >
              <div className="w-10 h-10 rounded-xl bg-[#1C1310] border border-white/[0.1] flex items-center justify-center p-2 shadow-sm group-hover:scale-105 transition-transform">
                <BrandLogo className="w-full h-full" variant="cream" />
              </div>
              <div>
                <span className="font-bold text-base text-[#F6F2E8] group-hover:text-[#D6A56E] transition-colors block">
                  THE BEAN CO.
                </span>
                <span className="text-[10px] text-[#A89B93] uppercase tracking-wider block">
                  Chew the brew
                </span>
              </div>
            </div>

            <p className="text-xs text-[#A89B93] leading-relaxed pr-4">
              Specialty roast coffee transformed into pocket-portable 100% plant-based pectin gummies. 50mg of measured caffeine per piece.
            </p>

            <div className="space-y-1.5 pt-1 text-[#C7BCB3]">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#D6A56E]" />
                <a href={`mailto:${settings?.support_email || 'info@thebean.company'}`} className="hover:text-[#F6F2E8] transition-colors">
                  {settings?.support_email || 'info@thebean.company'}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#D6A56E]" />
                <span>Indiranagar, Bengaluru, KA 560038</span>
              </div>
            </div>
          </div>

          {/* Column 2: Collection */}
          <div className="lg:col-span-3 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#D6A56E] block mb-3">
              Gummy Collection
            </span>
            <ul className="space-y-2 text-[#A89B93]">
              <li>
                <button onClick={() => navigateTo('shop')} className="hover:text-[#F6F2E8] transition-colors text-left">
                  Classic Espresso Gummy (50mg)
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('shop')} className="hover:text-[#F6F2E8] transition-colors text-left">
                  Vanilla Bean Roast (50mg)
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('shop')} className="hover:text-[#F6F2E8] transition-colors text-left">
                  Creamy Oat Milk Latte (50mg)
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('shop')} className="hover:text-[#F6F2E8] transition-colors text-left">
                  3-Pack Multi-Tin Sampler
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Brand Story */}
          <div className="lg:col-span-3 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#D6A56E] block mb-3">
              Brand Vision
            </span>
            <ul className="space-y-2 text-[#A89B93]">
              <li>
                <button onClick={() => navigateTo('story')} className="hover:text-[#F6F2E8] transition-colors text-left">
                  Brand Manifesto
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('story')} className="hover:text-[#F6F2E8] transition-colors text-left">
                  The Dot Matrix Bean Story
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('story')} className="hover:text-[#F6F2E8] transition-colors text-left">
                  Meet Béano (Our Mascot)
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('story')} className="hover:text-[#F6F2E8] transition-colors text-left">
                  Pantone Swatches & Typography
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Customer Care & Policies */}
          <div className="lg:col-span-2 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#D6A56E] block mb-3">
              Customer Care
            </span>
            <ul className="space-y-2 text-[#A89B93]">
              <li>
                <button onClick={() => navigateTo('shop')} className="hover:text-[#F6F2E8] transition-colors text-left">
                  Storefront
                </button>
              </li>
              <li>
                <button 
                  onClick={() => dispatch(openReturnPolicyModal())} 
                  className="hover:text-emerald-400 transition-colors text-left flex items-center gap-1 text-emerald-400"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{returnDays}-Day Return Policy</span>
                </button>
              </li>
              <li>
                <span className="block text-[#A89B93]/70">🇮🇳 Domestic India Shipping Only</span>
              </li>
              <li>
                <span className="block text-[#A89B93]/70">Free Shipping on more than {freeThreshold} Canisters</span>
              </li>
              <li className="pt-2 border-t border-white/[0.06]">
                <button 
                  onClick={() => navigateTo('admin')}
                  className="hover:text-[#D6A56E] text-white/40 transition-colors flex items-center gap-1"
                >
                  <ShieldCheck className="w-3 h-3" />
                  <span>Operations Console</span>
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* TIER 3: COPYRIGHT & PAYMENT METHODS */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-[#A89B93] gap-4">
          <div className="text-center md:text-left">
            <p className="text-[#C7BCB3]">
              © 2026 The Bean Co. Chew The Brew™. All rights reserved.
            </p>
            <p className="text-[11px] text-[#A89B93]/60 mt-0.5">
              100% plant-based coffee caffeine gummies packed in pocket canisters.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-[10px] text-[#A89B93] uppercase tracking-wider mr-1">Secured:</span>
            {['UPI', 'Google Pay', 'PhonePe', 'Paytm', 'RuPay', 'Visa', 'Mastercard'].map((method) => (
              <span key={method} className="bg-white/[0.04] text-[#C7BCB3] text-[10px] px-2 py-0.5 rounded-md border border-white/[0.06]">
                {method}
              </span>
            ))}
          </div>
        </div>

      </div>
    </footer>
  );
}
