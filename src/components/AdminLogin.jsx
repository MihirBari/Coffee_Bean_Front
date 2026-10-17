import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginAdmin } from '../store/authSlice';
import BrandLogo from './BrandLogo';
import { BeanoSeal } from './BeanoMascot';
import { ShieldCheck, Lock, Mail, ArrowLeft, KeyRound, AlertCircle, Sparkles } from 'lucide-react';

export default function AdminLogin({ onBackToStore }) {
  const dispatch = useDispatch();
  const { status, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await dispatch(loginAdmin({ email: formData.email, password: formData.password }));
  };

  const handleAutofillAdmin = () => {
    setFormData({
      email: 'admin@coffeebean.com',
      password: 'admin123'
    });
  };

  return (
    <div className="relative min-h-[90dvh] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-16 bg-[#231815] overflow-hidden selection:bg-[#4D0E12] selection:text-[#F5EFC6]">
      {/* Subtle Dot Grid Paper Texture */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#F5EFC6_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

      <div className="max-w-md w-full bg-[#2F201C] border-2 border-[#4A2E27] rounded-3xl p-5 xs:p-8 sm:p-10 shadow-2xl relative paper-crease-h z-10">
        
        {/* Back to store button */}
        <button
          onClick={onBackToStore}
          className="flex items-center space-x-1.5 font-subhead text-xs text-[#A5BCD6] hover:text-[#F5EFC6] mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Storefront</span>
        </button>

        {/* Brand Dot-Matrix Logo & Seal */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-20 rounded-2xl bg-[#18100E] border-2 border-[#A5BCD6]/40 flex items-center justify-center p-3 shadow-xl">
              <BrandLogo className="w-full h-full" variant="cream" />
            </div>
            <BeanoSeal className="w-16 h-16 text-[#A5BCD6]" />
          </div>

          <div className="inline-flex items-center space-x-1.5 bg-[#4D0E12] border border-[#F5EFC6]/30 px-3 py-1 rounded-full text-[10px] font-subhead font-bold uppercase tracking-widest text-[#F5EFC6] shadow-sm mb-3">
            <Sparkles className="w-3 h-3 text-[#A5BCD6]" />
            <span>The Bean Co. • Operations Console</span>
          </div>

          <h2 className="font-headline font-black text-2xl sm:text-3xl uppercase tracking-tight text-[#F5EFC6] mt-1">
            CHEW THE <span className="text-[#A5BCD6]">BREW</span>
          </h2>
          <p className="font-body text-xs text-[#F5EFC6]/75 mt-1.5 leading-relaxed">
            Authorized administrator portal for live gummy inventory, orders pipeline, and dispatch management.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-950/90 border border-red-700 text-xs text-red-200 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-subhead">
          <div>
            <label className="text-[10px] text-[#A5BCD6] font-bold uppercase tracking-wider block mb-1.5">
              Admin Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#A5BCD6] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="admin@coffeebean.com"
                className="w-full bg-[#18100E] border border-[#4A2E27] rounded-xl pl-10 pr-3 py-3 text-xs font-body text-[#F5EFC6] focus:outline-none focus:border-[#A5BCD6]"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-[#A5BCD6] font-bold uppercase tracking-wider block mb-1.5">
              Admin Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#A5BCD6] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full bg-[#18100E] border border-[#4A2E27] rounded-xl pl-10 pr-3 py-3 text-xs font-body text-[#F5EFC6] focus:outline-none focus:border-[#A5BCD6]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            className="w-full py-4 rounded-xl bg-[#4D0E12] hover:bg-[#4D0E12]/90 text-[#F5EFC6] font-headline font-black text-xs uppercase tracking-wider border border-[#F5EFC6]/40 shadow-xl flex items-center justify-center space-x-2 transition-all mt-2 active:scale-95"
          >
            {status === 'loading' ? (
              <span>Verifying Admin Authorization...</span>
            ) : (
              <>
                <KeyRound className="w-4 h-4 text-[#A5BCD6]" />
                <span>Access Admin Operations Console</span>
              </>
            )}
          </button>
        </form>

        {/* Demo Fast Admin Login */}
        <div className="mt-6 pt-5 border-t border-[#4A2E27] text-center">
          <button
            type="button"
            onClick={handleAutofillAdmin}
            className="w-full py-2.5 px-3 rounded-xl bg-[#18100E] hover:bg-[#231815] text-[11px] text-[#A5BCD6] border border-[#4A2E27] transition-colors flex items-center justify-center space-x-2"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Autofill Demo Admin Credentials</span>
          </button>
          <span className="text-[10px] text-[#F5EFC6]/50 block mt-2">
            admin@coffeebean.com • admin123
          </span>
        </div>

      </div>
    </div>
  );
}
