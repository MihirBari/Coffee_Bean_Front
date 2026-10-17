import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { closeReturnPolicyModal } from '../store/settingsSlice';
import { 
  X, 
  ShieldCheck, 
  RotateCcw, 
  Truck, 
  CheckCircle2, 
  PhoneCall, 
  Mail, 
  Sparkles, 
  AlertCircle,
  HelpCircle,
  PackageCheck
} from 'lucide-react';

export default function ReturnPolicyModal() {
  const dispatch = useDispatch();
  const { isReturnModalOpen, settings } = useSelector((state) => state.settings);

  if (!isReturnModalOpen) return null;

  const returnDays = settings?.return_window_days || 7;
  const returnTitle = settings?.return_policy_title || `${returnDays}-Day Roastery Freshness & Replacement Guarantee`;
  const supportEmail = settings?.support_email || 'support@coffeebean.com';
  const helpline = settings?.roastery_helpline || '+91 98765 43210';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div 
        className="relative bg-[#231815] border-2 border-[#4A2E27] text-[#F5EFC6] rounded-3xl max-w-2xl w-full max-h-[90dvh] overflow-y-auto shadow-2xl p-4 sm:p-8 touch-scroll"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => dispatch(closeReturnPolicyModal())}
          className="absolute top-4 right-4 p-2 rounded-full bg-[#4A2E27]/80 hover:bg-[#4D0E12] text-[#F5EFC6] border border-[#F5EFC6]/20 transition-all z-10"
          aria-label="Close Return Policy"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start space-x-3 sm:space-x-4 mb-6 pr-8">
          <div className="w-12 h-12 rounded-2xl bg-[#4D0E12] border border-[#F5EFC6]/30 flex items-center justify-center text-[#F5EFC6] shadow-xl flex-shrink-0">
            <ShieldCheck className="w-6 h-6 text-[#A5BCD6]" />
          </div>
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-[10px] font-subhead font-bold uppercase tracking-wider text-[#A5BCD6] bg-[#2F201C] px-2.5 py-0.5 rounded-full border border-[#4A2E27]">
                Amazon & Flipkart Grade Assurance
              </span>
              <span className="text-[10px] font-subhead text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
                100% Risk Free
              </span>
            </div>
            <h2 className="font-headline font-black text-xl sm:text-2xl text-[#F5EFC6] uppercase tracking-tight">
              {returnTitle}
            </h2>
            <p className="font-body text-xs text-[#A5BCD6] mt-0.5">
              Hassle-free {returnDays}-day returns, instant replacements, or 100% refunds on all specialty coffee gummy orders.
            </p>
          </div>
        </div>

        {/* 3 Step Return Process */}
        <div className="mb-6 p-4 rounded-2xl bg-[#2F201C] border border-[#4A2E27]">
          <h3 className="font-headline font-bold text-xs uppercase tracking-wider text-[#A5BCD6] mb-3 flex items-center space-x-1.5">
            <RotateCcw className="w-4 h-4 text-[#A5BCD6]" />
            <span>How Our {returnDays}-Day Easy Return Process Works</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-[#18100E] p-3 rounded-xl border border-[#4A2E27]/80">
              <div className="w-6 h-6 rounded-lg bg-[#4D0E12] text-[#F5EFC6] font-black text-xs flex items-center justify-center mb-2">
                1
              </div>
              <h4 className="font-headline font-bold text-xs text-[#F5EFC6] mb-1">Request Return</h4>
              <p className="font-body text-[11px] text-[#F5EFC6]/70 leading-relaxed">
                Contact roastery support within {returnDays} days of parcel delivery with your order ID.
              </p>
            </div>

            <div className="bg-[#18100E] p-3 rounded-xl border border-[#4A2E27]/80">
              <div className="w-6 h-6 rounded-lg bg-[#4D0E12] text-[#F5EFC6] font-black text-xs flex items-center justify-center mb-2">
                2
              </div>
              <h4 className="font-headline font-bold text-xs text-[#F5EFC6] mb-1">Quick Verification</h4>
              <p className="font-body text-[11px] text-[#F5EFC6]/70 leading-relaxed">
                Share a quick photo/video of damaged canister or incorrect item. No tedious interrogations.
              </p>
            </div>

            <div className="bg-[#18100E] p-3 rounded-xl border border-[#4A2E27]/80">
              <div className="w-6 h-6 rounded-lg bg-[#4D0E12] text-[#F5EFC6] font-black text-xs flex items-center justify-center mb-2">
                3
              </div>
              <h4 className="font-headline font-bold text-xs text-[#F5EFC6] mb-1">Replacement or Refund</h4>
              <p className="font-body text-[11px] text-[#F5EFC6]/70 leading-relaxed">
                Receive free replacement dispatch in 24 hrs OR 100% refund credited back to UPI/Card in 3-5 days.
              </p>
            </div>
          </div>
        </div>

        {/* Eligibility Checklist */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-800/60">
            <h4 className="font-headline font-bold text-xs uppercase tracking-wider text-emerald-400 mb-2 flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Eligible for Free Return / Replacement</span>
            </h4>
            <ul className="space-y-1.5 text-[11px] text-[#F5EFC6]/80 font-body">
              <li className="flex items-start space-x-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>Canister seal arrived broken, unsealed, or compromised.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>Exterior packaging severely crushed or damaged in transit.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>Wrong gummy flavor or pack size delivered.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>Manufacturing taste, texture, or expiration defect.</span>
              </li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-red-950/30 border border-red-900/60">
            <h4 className="font-headline font-bold text-xs uppercase tracking-wider text-red-400 mb-2 flex items-center space-x-1.5">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span>Non-Returnable Exceptions</span>
            </h4>
            <ul className="space-y-1.5 text-[11px] text-[#F5EFC6]/80 font-body">
              <li className="flex items-start space-x-2">
                <span className="text-red-400 font-bold">•</span>
                <span>Requests filed after {returnDays} days of parcel delivery date.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-red-400 font-bold">•</span>
                <span>Canister fully consumed or tampered with by customer.</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-red-400 font-bold">•</span>
                <span>Personal flavor preference change after unsealing intact product.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Free Delivery Rule Highlight */}
        <div className="mb-6 p-4 rounded-2xl bg-[#4D0E12]/40 border border-[#F5EFC6]/20 flex items-center space-x-3.5">
          <Truck className="w-6 h-6 text-[#A5BCD6] flex-shrink-0" />
          <div className="text-xs">
            <span className="font-bold text-[#F5EFC6] block mb-0.5">
              🚚 Domestic India Delivery Guarantee (India Shipping Only 🇮🇳)
            </span>
            <p className="text-[#A5BCD6] text-[11px]">
              We ship exclusively within India across all 28 states and 8 union territories (International shipping unavailable). Orders with more than 2 products enjoy <strong>FREE Express Delivery</strong>. For orders with 2 or fewer products, standard delivery charge is ₹{settings?.delivery_charge || 55} (or FREE for orders over ₹{settings?.free_delivery_min_order || 500}).
            </p>
          </div>
        </div>

        {/* Contact Support */}
        <div className="p-4 rounded-2xl bg-[#18100E] border border-[#4A2E27] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-bold text-[#F5EFC6] block">Need to initiate a return or replacement?</span>
            <span className="text-[11px] text-[#A5BCD6]">Our roaster support team responds within 2 hours</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={`mailto:${supportEmail}?subject=Return%20Request%20-%20Order%20Support`}
              className="px-3.5 py-2 rounded-xl bg-[#2F201C] hover:bg-[#4A2E27] text-[#F5EFC6] font-bold text-xs flex items-center space-x-1.5 border border-[#4A2E27] transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-[#A5BCD6]" />
              <span>Email Support</span>
            </a>
            <a
              href={`tel:${helpline.replace(/\s+/g, '')}`}
              className="px-3.5 py-2 rounded-xl bg-[#4D0E12] hover:bg-[#4D0E12]/90 text-[#F5EFC6] font-bold text-xs flex items-center space-x-1.5 border border-[#F5EFC6]/30 transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5 text-[#F5EFC6]" />
              <span>Call Helpline</span>
            </a>
          </div>
        </div>

        {/* Bottom Close */}
        <div className="mt-5 text-center">
          <button
            onClick={() => dispatch(closeReturnPolicyModal())}
            className="px-6 py-2.5 rounded-xl bg-[#4A2E27] hover:bg-[#4D0E12] text-[#F5EFC6] font-bold text-xs uppercase tracking-wider border border-[#F5EFC6]/20 transition-all"
          >
            Got It • Continue Shopping
          </button>
        </div>

      </div>
    </div>
  );
}
