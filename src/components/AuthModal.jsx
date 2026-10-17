import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  closeAuthModal, 
  setAuthModalMode, 
  loginCustomer, 
  registerCustomer 
} from '../store/authSlice';
import { addToCart } from '../store/cartSlice';
import { toggleWishlist } from '../store/authSlice';
import BrandLogo from './BrandLogo';
import { X, Lock, User, Mail, ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function AuthModal() {
  const dispatch = useDispatch();
  const { 
    authModalOpen, 
    authModalMode, 
    authPromptReason, 
    status, 
    error, 
    pendingAction 
  } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [clientLoadedAt] = useState(() => Date.now());
  const [hpWebsite, setHpWebsite] = useState('');

  if (!authModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    let result;
    if (authModalMode === 'login') {
      result = await dispatch(loginCustomer({ email: formData.email, password: formData.password }));
    } else {
      result = await dispatch(registerCustomer({ 
        name: formData.name, 
        email: formData.email, 
        password: formData.password,
        hp_website: hpWebsite,
        client_loaded_at: clientLoadedAt
      }));
    }

    if ((loginCustomer.fulfilled.match(result) || registerCustomer.fulfilled.match(result)) && pendingAction) {
      if (pendingAction.type === 'addToCart') {
        dispatch(addToCart(pendingAction.payload));
      } else if (pendingAction.type === 'toggleWishlist') {
        dispatch(toggleWishlist(pendingAction.payload));
      }
    }
  };

  const handleQuickDemoCustomer = async () => {
    setFormData({
      name: 'Alexander Wright',
      email: 'customer@example.com',
      password: 'coffee123'
    });
    const result = await dispatch(loginCustomer({ email: 'customer@example.com', password: 'coffee123' }));
    if (loginCustomer.fulfilled.match(result) && pendingAction) {
      if (pendingAction.type === 'addToCart') {
        dispatch(addToCart(pendingAction.payload));
      } else if (pendingAction.type === 'toggleWishlist') {
        dispatch(toggleWishlist(pendingAction.payload));
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in selection:bg-[#4D0E12] selection:text-[#F5EFC6] overflow-y-auto"
      onClick={() => dispatch(closeAuthModal())}
    >
      <div 
        className="relative bg-[#231815] border-2 border-[#4A2E27] text-[#F5EFC6] rounded-3xl max-w-md w-full max-h-[90dvh] overflow-y-auto shadow-2xl p-5 sm:p-8 paper-crease-h touch-scroll"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={() => dispatch(closeAuthModal())}
          className="absolute top-5 right-5 p-2 rounded-full bg-[#4A2E27]/80 hover:bg-[#4D0E12] text-[#F5EFC6] border border-[#F5EFC6]/20 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Icon & Heading */}
        <div className="text-center mb-6">
          <div className="w-14 h-16 rounded-2xl bg-[#18100E] border border-[#A5BCD6]/40 flex items-center justify-center p-2.5 mx-auto mb-3 shadow-lg">
            <BrandLogo className="w-full h-full" variant="cream" />
          </div>
          <h2 className="font-headline font-black text-2xl text-[#F5EFC6] uppercase tracking-tight">
            {authModalMode === 'login' ? 'Customer Sign In' : 'Create Account'}
          </h2>
          <p className="font-subhead text-[11px] text-[#A5BCD6] mt-1 uppercase tracking-wider">
            The Bean Co. • Chew The Brew™
          </p>
        </div>

        {/* Prompt Reason Banner if action was intercepted */}
        {authPromptReason && (
          <div className="mb-5 p-3 rounded-xl bg-[#4D0E12]/80 border border-[#F5EFC6]/30 text-xs font-subhead text-[#F5EFC6] flex items-center space-x-2.5">
            <ShieldAlert className="w-4 h-4 text-[#A5BCD6] flex-shrink-0" />
            <span>{authPromptReason}</span>
          </div>
        )}

        {/* Error Notice */}
        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-950/80 border border-red-700 text-xs font-subhead text-red-200">
            {error}
          </div>
        )}

        {/* Mode Switcher Tabs */}
        <div className="flex bg-[#18100E] p-1 rounded-xl border border-[#4A2E27] mb-5 font-headline">
          <button
            type="button"
            onClick={() => dispatch(setAuthModalMode('login'))}
            className={`flex-1 py-2 text-xs font-bold rounded-lg uppercase tracking-wider transition-all ${
              authModalMode === 'login'
                ? 'bg-[#4D0E12] text-[#F5EFC6] shadow'
                : 'text-[#F5EFC6]/60 hover:text-[#F5EFC6]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => dispatch(setAuthModalMode('register'))}
            className={`flex-1 py-2 text-xs font-bold rounded-lg uppercase tracking-wider transition-all ${
              authModalMode === 'register'
                ? 'bg-[#4D0E12] text-[#F5EFC6] shadow'
                : 'text-[#F5EFC6]/60 hover:text-[#F5EFC6]'
            }`}
          >
            New Account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 font-subhead text-xs">
          
          {authModalMode === 'register' && (
            <div>
              <label className="text-[11px] text-[#A5BCD6] font-bold uppercase tracking-wider block mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-[#A5BCD6] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Maya Lin"
                  className="w-full bg-[#18100E] border border-[#4A2E27] rounded-xl pl-9 pr-3 py-2.5 text-[#F5EFC6] focus:outline-none focus:border-[#A5BCD6]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-[11px] text-[#A5BCD6] font-bold uppercase tracking-wider block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#A5BCD6] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@example.com"
                className="w-full bg-[#18100E] border border-[#4A2E27] rounded-xl pl-9 pr-3 py-2.5 text-[#F5EFC6] focus:outline-none focus:border-[#A5BCD6]"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] text-[#A5BCD6] font-bold uppercase tracking-wider block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#A5BCD6] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-[#18100E] border border-[#4A2E27] rounded-xl pl-9 pr-3 py-2.5 text-[#F5EFC6] focus:outline-none focus:border-[#A5BCD6]"
              />
            </div>
          </div>

          {/* Honeypot field (hidden from humans, traps automated spam bots) */}
          <div style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }} aria-hidden="true">
            <input
              type="text"
              name="hp_website"
              value={hpWebsite}
              onChange={(e) => setHpWebsite(e.target.value)}
              tabIndex="-1"
              autoComplete="off"
            />
          </div>

          <div className="flex items-center space-x-1.5 text-[10px] text-[#A5BCD6]">
            <ShieldAlert className="w-3 h-3 text-emerald-400" />
            <span>Protected by Roastery Anti-Bot Shield • Disposable inboxes rejected</span>
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full py-3.5 rounded-xl bg-[#4D0E12] hover:bg-[#4D0E12]/90 text-[#F5EFC6] font-headline font-black text-xs uppercase tracking-wider border border-[#F5EFC6]/40 shadow-xl flex items-center justify-center space-x-2 transition-all active:scale-95"
          >
            {status === 'loading' ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>{authModalMode === 'login' ? 'Sign In & Continue' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4 text-[#A5BCD6]" />
              </>
            )}
          </button>

        </form>

        {/* Demo Fast Login Button */}
        <div className="mt-5 pt-4 border-t border-[#4A2E27] text-center font-subhead">
          <button
            type="button"
            onClick={handleQuickDemoCustomer}
            className="w-full py-2 px-3 rounded-lg bg-[#2F201C] hover:bg-[#4A2E27] text-[11px] text-[#A5BCD6] border border-[#4A2E27] transition-colors flex items-center justify-center space-x-2"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Autofill Demo Customer (customer@example.com)</span>
          </button>
        </div>

      </div>
    </div>
  );
}
