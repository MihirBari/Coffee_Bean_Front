import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateStoreSettings, clearUpdateSuccess } from '../store/settingsSlice';
import { 
  Truck, 
  RotateCcw, 
  ShieldCheck, 
  Save, 
  Check, 
  IndianRupee, 
  Sparkles, 
  AlertCircle, 
  HelpCircle,
  Package,
  Layers,
  Phone,
  Mail,
  Zap,
  RefreshCw
} from 'lucide-react';

export default function SettingsTab({ showNotice }) {
  const dispatch = useDispatch();
  const { settings, updateSuccess } = useSelector((state) => state.settings);

  const [formData, setFormData] = useState({
    delivery_charge: 55,
    free_delivery_item_threshold: 2,
    free_delivery_min_order: 500,
    return_window_days: 7,
    return_policy_title: '7-Day Roastery Freshness & Replacement Guarantee',
    return_policy_summary: 'Hassle-free 7-day returns for damaged tins, broken seals, or defective items with 100% refund or free replacement.',
    return_policy_content: 'We craft every canister of The Bean Co. Coffee Gummies using specialty Arabica extract and plant-based pectin. If your order arrives damaged, unsealed, broken, with a missing seal, or with quality defects, you are eligible for an immediate free replacement dispatch or 100% refund within 7 calendar days of delivery.',
    roastery_helpline: '+91 98765 43210',
    support_email: 'support@coffeebean.com'
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        delivery_charge: settings.delivery_charge ?? 55,
        free_delivery_item_threshold: settings.free_delivery_item_threshold ?? 2,
        free_delivery_min_order: settings.free_delivery_min_order ?? 500,
        return_window_days: settings.return_window_days ?? 7,
        return_policy_title: settings.return_policy_title || '7-Day Roastery Freshness & Replacement Guarantee',
        return_policy_summary: settings.return_policy_summary || '',
        return_policy_content: settings.return_policy_content || '',
        roastery_helpline: settings.roastery_helpline || '+91 98765 43210',
        support_email: settings.support_email || 'support@coffeebean.com'
      });
    }
  }, [settings]);

  useEffect(() => {
    if (updateSuccess) {
      setSaveToast(true);
      if (showNotice) showNotice('Store Delivery & Return Policy saved successfully!');
      const timer = setTimeout(() => {
        setSaveToast(false);
        dispatch(clearUpdateSuccess());
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [updateSuccess, dispatch, showNotice]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (parseFloat(value) || 0) : value
    }));
  };

  const handleApplyPreset = (presetType) => {
    if (presetType === 'default') {
      setFormData((prev) => ({
        ...prev,
        delivery_charge: 55,
        free_delivery_item_threshold: 2, // More than 2 items is free
        free_delivery_min_order: 500
      }));
    } else if (presetType === 'free_all') {
      setFormData((prev) => ({
        ...prev,
        delivery_charge: 0,
        free_delivery_item_threshold: 0,
        free_delivery_min_order: 0
      }));
    } else if (presetType === 'high_tier') {
      setFormData((prev) => ({
        ...prev,
        delivery_charge: 75,
        free_delivery_item_threshold: 3,
        free_delivery_min_order: 799
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    await dispatch(updateStoreSettings(formData));
    setIsSaving(false);
  };

  return (
    <div className="space-y-8 animate-fade-in font-body">
      
      {/* Tab Header Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#2F201C] border-2 border-[#4A2E27] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 paper-crease-h">
        <div>
          <div className="flex items-center space-x-2 text-xs font-subhead text-[#A5BCD6] uppercase tracking-wider font-bold mb-1">
            <Truck className="w-4 h-4 text-[#A5BCD6]" />
            <span>Marketplace Operations & Logistics Policy</span>
          </div>
          <h2 className="font-headline font-black text-2xl text-[#F5EFC6] uppercase tracking-tight">
            Delivery Charges & Return Policy Settings
          </h2>
          <p className="text-xs text-[#F5EFC6]/75 mt-0.5">
            Configure dynamic customer delivery charges, free shipping thresholds, and official return policy terms.
          </p>
        </div>

        {saveToast && (
          <div className="px-4 py-2.5 rounded-2xl bg-emerald-950 border border-emerald-600 text-emerald-300 text-xs font-subhead font-bold flex items-center space-x-2 animate-fade-in shadow-xl">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Saved to MariaDB Database!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* ============================================================== */}
        {/* SECTION 1: DELIVERY CHARGES & FREE SHIPPING RULES */}
        {/* ============================================================== */}
        <div className="p-5 sm:p-6 rounded-3xl bg-[#2F201C] border-2 border-[#4A2E27] shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-[#4A2E27]">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-[#4D0E12] border border-[#F5EFC6]/30 flex items-center justify-center text-[#F5EFC6] shadow-md">
                <Truck className="w-5 h-5 text-[#A5BCD6]" />
              </div>
              <div>
                <h3 className="font-headline font-bold text-lg text-[#F5EFC6] uppercase tracking-wide">
                  Delivery Charge & Free Shipping Rules
                </h3>
                <span className="font-subhead text-[11px] text-[#A5BCD6]">
                  Rule: Free for &gt; 2 products, otherwise standard fee applies (or free if order &gt;= ₹500)
                </span>
              </div>
            </div>

            {/* Quick Rule Presets */}
            <div className="flex flex-wrap items-center gap-2 font-subhead">
              <span className="text-[10px] uppercase text-[#F5EFC6]/60 font-bold hidden xs:inline">Quick Presets:</span>
              <button
                type="button"
                onClick={() => handleApplyPreset('default')}
                className="px-2.5 py-1 text-[11px] rounded-lg bg-[#18100E] hover:bg-[#4A2E27] text-[#A5BCD6] border border-[#4A2E27] transition-colors"
                title="Default: 500 threshold + 55 delivery charge"
              >
                ₹55 Standard (Default)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('free_all')}
                className="px-2.5 py-1 text-[11px] rounded-lg bg-[#18100E] hover:bg-[#4A2E27] text-emerald-400 border border-[#4A2E27] transition-colors"
                title="Festive: Free Delivery on everything"
              >
                Free Everywhere (₹0)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
            
            {/* Field 1: Base Delivery Charge */}
            <div className="p-4 rounded-2xl bg-[#18100E] border border-[#4A2E27] space-y-2">
              <label className="font-headline font-bold text-xs uppercase tracking-wider text-[#A5BCD6] flex items-center justify-between">
                <span>Standard Delivery Fee</span>
                <span className="text-[10px] text-[#F5EFC6]/60 font-normal">Changeable</span>
              </label>
              <div className="relative">
                <IndianRupee className="w-4 h-4 text-[#A5BCD6] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  step="1"
                  min="0"
                  name="delivery_charge"
                  value={formData.delivery_charge}
                  onChange={handleChange}
                  className="w-full bg-[#231815] border border-[#4A2E27] rounded-xl pl-9 pr-3 py-2 text-sm font-bold text-emerald-400 focus:outline-none focus:border-[#A5BCD6]"
                />
              </div>
              <p className="text-[11px] text-[#F5EFC6]/70 leading-relaxed font-body">
                Charged when total product quantity is 2 or less and order is under ₹{formData.free_delivery_min_order}.
              </p>
            </div>

            {/* Field 2: Free Delivery Quantity Threshold */}
            <div className="p-4 rounded-2xl bg-[#18100E] border border-[#4A2E27] space-y-2">
              <label className="font-headline font-bold text-xs uppercase tracking-wider text-[#A5BCD6] flex items-center justify-between">
                <span>Free Item Threshold</span>
                <span className="text-[10px] text-[#F5EFC6]/60 font-normal">&gt; Threshold</span>
              </label>
              <div className="relative">
                <Package className="w-4 h-4 text-[#A5BCD6] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  step="1"
                  min="1"
                  name="free_delivery_item_threshold"
                  value={formData.free_delivery_item_threshold}
                  onChange={handleChange}
                  className="w-full bg-[#231815] border border-[#4A2E27] rounded-xl pl-9 pr-3 py-2 text-sm font-bold text-[#F5EFC6] focus:outline-none focus:border-[#A5BCD6]"
                />
              </div>
              <p className="text-[11px] text-[#F5EFC6]/70 leading-relaxed font-body">
                Set to <strong>{formData.free_delivery_item_threshold}</strong>: Any order with <strong>more than {formData.free_delivery_item_threshold} products</strong> (i.e. {formData.free_delivery_item_threshold + 1}+ items) gets <strong>FREE delivery</strong>!
              </p>
            </div>

            {/* Field 3: Free Delivery Min Order Amount */}
            <div className="p-4 rounded-2xl bg-[#18100E] border border-[#4A2E27] space-y-2">
              <label className="font-headline font-bold text-xs uppercase tracking-wider text-[#A5BCD6] flex items-center justify-between">
                <span>Free Min Order Value</span>
                <span className="text-[10px] text-[#F5EFC6]/60 font-normal">&gt;= Amount</span>
              </label>
              <div className="relative">
                <IndianRupee className="w-4 h-4 text-[#A5BCD6] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  step="1"
                  min="0"
                  name="free_delivery_min_order"
                  value={formData.free_delivery_min_order}
                  onChange={handleChange}
                  className="w-full bg-[#231815] border border-[#4A2E27] rounded-xl pl-9 pr-3 py-2 text-sm font-bold text-[#F5EFC6] focus:outline-none focus:border-[#A5BCD6]"
                />
              </div>
              <p className="text-[11px] text-[#F5EFC6]/70 leading-relaxed font-body">
                For 2 or fewer products: If cart subtotal reaches <strong>₹{formData.free_delivery_min_order}</strong>, delivery is also completely <strong>FREE</strong>.
              </p>
            </div>

          </div>

          {/* Live Customer Simulation Preview Card */}
          <div className="p-4 rounded-2xl bg-[#231815] border border-[#4A2E27]">
            <h4 className="font-headline font-bold text-xs uppercase tracking-wider text-[#A5BCD6] mb-3 flex items-center space-x-1.5">
              <Zap className="w-4 h-4 text-amber-300" />
              <span>Live Storefront Calculation Logic Preview</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#18100E] border border-[#4A2E27]">
                <span className="font-bold text-[#F5EFC6] block mb-1">🛒 1 Canister (₹299)</span>
                <span className="text-[11px] text-[#F5EFC6]/70 block mb-1">Quantity: 1 • Under ₹{formData.free_delivery_min_order}</span>
                <span className="font-bold text-amber-400">Delivery Fee: ₹{formData.delivery_charge}</span>
              </div>

              <div className="p-3 rounded-xl bg-[#18100E] border border-[#4A2E27]">
                <span className="font-bold text-[#F5EFC6] block mb-1">🛒 2 Canisters (₹598)</span>
                <span className="text-[11px] text-[#F5EFC6]/70 block mb-1">Quantity: 2 • Over ₹{formData.free_delivery_min_order}</span>
                <span className="font-bold text-emerald-400">Delivery Fee: FREE (₹0)</span>
              </div>

              <div className="p-3 rounded-xl bg-[#18100E] border border-[#4A2E27]">
                <span className="font-bold text-[#F5EFC6] block mb-1">🛒 3 Canisters (₹897)</span>
                <span className="text-[11px] text-[#F5EFC6]/70 block mb-1">Quantity: 3 (&gt; {formData.free_delivery_item_threshold} items)</span>
                <span className="font-bold text-emerald-400">Delivery Fee: FREE (₹0)</span>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* SECTION 2: OFFICIAL RETURN POLICY CONFIGURATION */}
        {/* ============================================================== */}
        <div className="p-5 sm:p-6 rounded-3xl bg-[#2F201C] border-2 border-[#4A2E27] shadow-xl">
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-[#4A2E27]">
            <div className="w-10 h-10 rounded-xl bg-[#4D0E12] border border-[#F5EFC6]/30 flex items-center justify-center text-[#F5EFC6] shadow-md">
              <RotateCcw className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-headline font-bold text-lg text-[#F5EFC6] uppercase tracking-wide">
                Customer Return Policy Configuration
              </h3>
              <span className="font-subhead text-[11px] text-[#A5BCD6]">
                Displayed on Product Pages, Cart Drawer, Checkout, and Customer Footer
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
            {/* Return Window in Days */}
            <div className="p-4 rounded-2xl bg-[#18100E] border border-[#4A2E27] space-y-2">
              <label className="font-headline font-bold text-xs uppercase tracking-wider text-[#A5BCD6] block">
                Return Window (Days)
              </label>
              <input
                type="number"
                step="1"
                min="1"
                max="90"
                name="return_window_days"
                value={formData.return_window_days}
                onChange={handleChange}
                className="w-full bg-[#231815] border border-[#4A2E27] rounded-xl px-3 py-2 text-sm font-bold text-[#F5EFC6] focus:outline-none focus:border-[#A5BCD6]"
              />
              <span className="text-[11px] text-[#F5EFC6]/60 block font-body">
                Amazon/Flipkart standard is 7 days from delivery date.
              </span>
            </div>

            {/* Helpline Phone */}
            <div className="p-4 rounded-2xl bg-[#18100E] border border-[#4A2E27] space-y-2">
              <label className="font-headline font-bold text-xs uppercase tracking-wider text-[#A5BCD6] block">
                Roastery Support Helpline
              </label>
              <input
                type="text"
                name="roastery_helpline"
                value={formData.roastery_helpline}
                onChange={handleChange}
                className="w-full bg-[#231815] border border-[#4A2E27] rounded-xl px-3 py-2 text-xs font-semibold text-[#F5EFC6] focus:outline-none focus:border-[#A5BCD6]"
              />
              <span className="text-[11px] text-[#F5EFC6]/60 block font-body">
                Phone number for customer return verification calls.
              </span>
            </div>

            {/* Support Email */}
            <div className="p-4 rounded-2xl bg-[#18100E] border border-[#4A2E27] space-y-2">
              <label className="font-headline font-bold text-xs uppercase tracking-wider text-[#A5BCD6] block">
                Return Support Email
              </label>
              <input
                type="email"
                name="support_email"
                value={formData.support_email}
                onChange={handleChange}
                className="w-full bg-[#231815] border border-[#4A2E27] rounded-xl px-3 py-2 text-xs font-semibold text-[#F5EFC6] focus:outline-none focus:border-[#A5BCD6]"
              />
              <span className="text-[11px] text-[#F5EFC6]/60 block font-body">
                Destination email for customer return request photo uploads.
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="font-headline font-bold text-xs uppercase tracking-wider text-[#A5BCD6] block mb-1.5">
                Policy Headline
              </label>
              <input
                type="text"
                name="return_policy_title"
                value={formData.return_policy_title}
                onChange={handleChange}
                className="w-full bg-[#18100E] border border-[#4A2E27] rounded-xl px-3 py-2 text-xs font-bold text-[#F5EFC6] focus:outline-none focus:border-[#A5BCD6]"
              />
            </div>

            <div>
              <label className="font-headline font-bold text-xs uppercase tracking-wider text-[#A5BCD6] block mb-1.5">
                Customer Return Policy Detailed Terms & Instructions
              </label>
              <textarea
                rows={4}
                name="return_policy_content"
                value={formData.return_policy_content}
                onChange={handleChange}
                className="w-full bg-[#18100E] border border-[#4A2E27] rounded-xl px-3 py-2 text-xs text-[#F5EFC6] focus:outline-none focus:border-[#A5BCD6] leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* SUBMIT BUTTON BAR */}
        {/* ============================================================== */}
        <div className="flex items-center justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-[#4D0E12] hover:bg-[#4D0E12]/90 text-[#F5EFC6] font-headline font-black text-xs uppercase tracking-wider border-2 border-[#F5EFC6]/40 shadow-2xl flex items-center justify-center space-x-2 transition-all active:scale-95 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-[#A5BCD6]" />
                <span>Saving Store Settings...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-[#A5BCD6]" />
                <span>Save Delivery Charges & Return Policy</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
}
