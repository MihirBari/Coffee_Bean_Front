import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  toggleCart, 
  removeFromCart, 
  updateQuantity, 
  clearCart, 
  applyPromoCode,
  validatePromoCode,
  removePromoCode
} from '../store/cartSlice';
import { fetchAddresses, addAddress } from '../store/marketplaceSlice';
import { getCurrentLocationAddress, searchAddressOptions } from '../services/mapService';
import { trackPageView } from '../services/analytics';
import { 
  X, 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  Tag, 
  Check, 
  Coffee,
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCcw,
  MapPin,
  Locate,
  Loader2,
  Search,
  ChevronDown,
  ChevronUp,
  Plus
} from 'lucide-react';

import { openAuthModal } from '../store/authSlice';
import { openReturnPolicyModal } from '../store/settingsSlice';
import { setSelectedProduct } from '../store/productsSlice';

const INDIAN_STATES = [
  'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar',
  'Chandigarh', 'Chhattisgarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka',
  'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
  'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

export default function CartDrawer({ onProceedToCheckout }) {
  const dispatch = useDispatch();
  const { items, isOpen, promoCode, discountPercent, notification } = useSelector((state) => state.cart);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { settings } = useSelector((state) => state.settings);
  const { addresses } = useSelector((state) => state.marketplace);
  const [promoInput, setPromoInput] = useState('');

  // Local saved address cache for instant 1-click column display
  const [localAddresses, setLocalAddresses] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('coffee_bean_saved_addresses') || '[]');
      return Array.isArray(stored) ? stored : [];
    } catch (e) {
      return [];
    }
  });

  const [selectedAddress, setSelectedAddress] = useState(() => {
    try {
      const active = localStorage.getItem('coffee_bean_active_address');
      return active ? JSON.parse(active) : null;
    } catch (e) {
      return null;
    }
  });

  const [isAddressExpanded, setIsAddressExpanded] = useState(false);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState(''); // '' | 'saving' | 'saved'
  const autoSaveTimerRef = useRef(null);
  const lastSavedAddressRef = useRef('');

  // Structured Address State in Cart
  const [cartAddressParts, setCartAddressParts] = useState({
    house_flat: '',
    street_locality: '',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: ''
  });
  const [streetSuggestions, setStreetSuggestions] = useState([]);
  const [isSearchingStreet, setIsSearchingStreet] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationNotice, setLocationNotice] = useState('');
  const [locationError, setLocationError] = useState('');

  // Merged saved addresses displayed in 2-column book
  const allDisplayedAddresses = useMemo(() => {
    const list = [...(addresses || [])];
    const seen = new Set(list.map((a) => (a.address_line || '').toLowerCase().trim()));
    localAddresses.forEach((localAddr) => {
      const line = (localAddr.address_line || '').toLowerCase().trim();
      if (line && !seen.has(line)) {
        seen.add(line);
        list.push(localAddr);
      }
    });
    return list;
  }, [addresses, localAddresses]);

  // Sync addresses on cart open
  useEffect(() => {
    if (isOpen) {
      try {
        const stored = JSON.parse(localStorage.getItem('coffee_bean_saved_addresses') || '[]');
        if (Array.isArray(stored)) setLocalAddresses(stored);
      } catch (e) {}
      if (isAuthenticated) {
        dispatch(fetchAddresses());
      }
    }
  }, [isOpen, isAuthenticated, dispatch]);

  // Set initial selected address if none selected yet
  useEffect(() => {
    if (!selectedAddress && allDisplayedAddresses.length > 0) {
      const defaultAddr = allDisplayedAddresses.find((a) => a.is_default) || allDisplayedAddresses[0];
      if (defaultAddr) {
        setSelectedAddress(defaultAddr);
        try {
          localStorage.setItem('coffee_bean_active_address', JSON.stringify(defaultAddr));
        } catch (e) {}
      }
    }
  }, [allDisplayedAddresses, selectedAddress]);

  // Automatic Address Saver into customer address book columns
  const triggerAutoSaveAddress = (parts, immediate = false) => {
    const cleanPin = (parts?.pincode || '').replace(/\D/g, '').trim();
    if (cleanPin.length !== 6) return;
    if (!parts?.street_locality || parts.street_locality.trim().length < 3) return;

    const city = parts.city?.trim() || 'Bengaluru';
    const state = parts.state || 'Karnataka';
    const main = [parts.house_flat, parts.street_locality, city, state].filter(Boolean).join(', ');
    const fullStr = main ? `${main} - ${cleanPin}` : '';
    if (!fullStr || fullStr === lastSavedAddressRef.current) return;

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    const performSave = async () => {
      lastSavedAddressRef.current = fullStr;
      setAutoSaveStatus('saving');

      const recipientName = (user?.name || 'Customer').trim();
      const contactPhone = (user?.phone || '').trim();

      const addrPayload = {
        label: 'Cart Address',
        recipient_name: recipientName,
        phone: contactPhone,
        address_line: fullStr,
        house_flat: parts.house_flat || '',
        street_locality: parts.street_locality || '',
        city,
        state,
        pincode: cleanPin,
        is_default: allDisplayedAddresses.length === 0 ? 1 : 0
      };

      // 1. Immediately update local addresses state & localStorage so the columns update instantly
      setLocalAddresses((prev) => {
        const filtered = prev.filter((a) => a.address_line !== fullStr);
        const updated = [{ id: 'local_' + Date.now(), ...addrPayload }, ...filtered];
        try {
          localStorage.setItem('coffee_bean_saved_addresses', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });

      setSelectedAddress(addrPayload);
      try {
        localStorage.setItem('coffee_bean_active_address', JSON.stringify(addrPayload));
      } catch (e) {}

      // 2. If authenticated, persist to backend customer_addresses in MariaDB
      if (isAuthenticated) {
        try {
          await dispatch(addAddress(addrPayload));
        } catch (err) {
          console.warn('Could not sync address to server:', err);
        }
      }

      setAutoSaveStatus('saved');
      setTimeout(() => setAutoSaveStatus(''), 4000);
    };

    if (immediate) {
      performSave();
    } else {
      autoSaveTimerRef.current = setTimeout(performSave, 800);
    }
  };

  const handleDetectLocation = async () => {
    setIsDetectingLocation(true);
    setLocationNotice('');
    setLocationError('');
    try {
      const loc = await getCurrentLocationAddress();
      const updated = {
        house_flat: loc.house_flat || cartAddressParts.house_flat,
        street_locality: loc.street_locality || cartAddressParts.street_locality,
        city: loc.city || cartAddressParts.city || 'Bengaluru',
        state: loc.state || cartAddressParts.state || 'Karnataka',
        pincode: loc.pincode || cartAddressParts.pincode
      };
      setCartAddressParts(updated);
      triggerAutoSaveAddress(updated, true);
      setLocationNotice(`📍 Detected: ${loc.street_locality || loc.city || 'Your Area'}`);
    } catch (err) {
      setLocationError(err.message || 'Could not fetch GPS location.');
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const handleStreetChange = async (val) => {
    const updated = { ...cartAddressParts, street_locality: val };
    setCartAddressParts(updated);
    triggerAutoSaveAddress(updated, false);

    if (val.trim().length >= 2) {
      setIsSearchingStreet(true);
      try {
        const results = await searchAddressOptions(val);
        setStreetSuggestions(results);
        setShowSuggestions(true);
      } catch (err) {
        setStreetSuggestions([]);
      } finally {
        setIsSearchingStreet(false);
      }
    } else {
      setStreetSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = (sug) => {
    const updated = {
      ...cartAddressParts,
      street_locality: sug.street_locality || sug.description,
      city: sug.city || cartAddressParts.city,
      state: sug.state || cartAddressParts.state,
      pincode: sug.pincode || cartAddressParts.pincode
    };
    setCartAddressParts(updated);
    triggerAutoSaveAddress(updated, true);
    setShowSuggestions(false);
  };

  const handleSelectSavedAddress = (addr) => {
    setSelectedAddress(addr);
    try {
      localStorage.setItem('coffee_bean_active_address', JSON.stringify(addr));
    } catch (e) {}
  };

  useEffect(() => {
    if (isOpen) {
      trackPageView('/cart', 'Shopping Cart Drawer');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Dynamic delivery charge rules configured by Admin
  const deliveryCharge = Number(settings?.delivery_charge ?? 55);
  const freeItemThreshold = Number(settings?.free_delivery_item_threshold ?? 2); // > 2 items gets free delivery
  const freeMinOrder = Number(settings?.free_delivery_min_order ?? 500); // Orders >= 500 get free delivery
  const returnDays = settings?.return_window_days || 7;

  const totalProductCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const rawSubtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discountAmount = (rawSubtotal * discountPercent) / 100;
  const discountedSubtotal = rawSubtotal - discountAmount;

  // Free if more than 2 items (i.e. >= 3) OR discounted subtotal >= 500
  const isFreeDelivery = totalProductCount > freeItemThreshold || discountedSubtotal >= freeMinOrder;
  const shippingFee = items.length === 0 ? 0 : (isFreeDelivery ? 0 : deliveryCharge);
  const finalTotal = items.length === 0 ? 0 : discountedSubtotal + shippingFee;

  // Progress towards free delivery
  const countNeeded = Math.max(0, (freeItemThreshold + 1) - totalProductCount);
  const amountNeeded = Math.max(0, freeMinOrder - discountedSubtotal);
  const progressPercent = Math.min(100, Math.max(
    (totalProductCount / (freeItemThreshold + 1)) * 100,
    (discountedSubtotal / freeMinOrder) * 100
  ));

  const handleApplyPromo = (e) => {
    e.preventDefault();
    if (promoInput.trim()) {
      dispatch(validatePromoCode({ code: promoInput.trim(), subtotal: rawSubtotal }));
      setPromoInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={() => dispatch(toggleCart(false))}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-full sm:max-w-md bg-[#231815] border-l border-[#4A2E27] text-[#F5EFC6] shadow-2xl flex flex-col justify-between">
          
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-[#4A2E27] flex items-center justify-between bg-[#2F201C]/60">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-[#4D0E12] border border-[#F5EFC6]/30 flex items-center justify-center text-[#F5EFC6]">
                <ShoppingBag className="w-5 h-5 text-[#F5EFC6]" />
              </div>
              <div>
                <h2 className="font-headline font-black text-lg text-[#F5EFC6] uppercase">Your Gummy Cart</h2>
                <span className="font-subhead text-xs text-[#A5BCD6]">
                  {items.length} {items.length === 1 ? 'tin' : 'tins'} selected
                </span>
              </div>
            </div>
            <button
              onClick={() => dispatch(toggleCart(false))}
              className="p-2 rounded-full hover:bg-[#4A2E27] text-[#F5EFC6]/80 hover:text-[#F5EFC6] transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Notification pill */}
          {notification && (
            <div className="px-6 py-2 bg-[#4D0E12]/80 text-[#F5EFC6] text-xs font-subhead flex items-center justify-between border-b border-[#F5EFC6]/20">
              <span className="flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#A5BCD6]" />
                <span>{notification}</span>
              </span>
            </div>
          )}

          {/* Amazon/Flipkart Dynamic Delivery Progress Banner */}
          {items.length > 0 && (
            <div className="px-6 py-2.5 bg-[#2F201C] border-b border-[#4A2E27] text-xs">
              {isFreeDelivery ? (
                <div className="flex items-center space-x-2 text-emerald-400 font-bold">
                  <Truck className="w-4 h-4 text-emerald-400 flex-shrink-0 animate-bounce" />
                  <span>
                    🎉 You unlocked FREE Delivery! {totalProductCount > freeItemThreshold ? `(${totalProductCount} products in cart)` : `(Order over ₹${freeMinOrder})`}
                  </span>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-1.5">
                    <span className="flex items-center space-x-1.5 text-[#F5EFC6]/90 font-medium">
                      <Truck className="w-3.5 h-3.5 text-[#A5BCD6]" />
                      <span>Delivery Fee: <strong>₹{shippingFee}</strong></span>
                    </span>
                    <span className="text-[#A5BCD6] font-semibold text-[10px]">
                      Add {countNeeded} item{countNeeded > 1 ? 's' : ''} or ₹{amountNeeded.toFixed(0)} for FREE
                    </span>
                  </div>
                  <div className="w-full bg-[#18100E] h-1.5 rounded-full overflow-hidden border border-[#4A2E27]">
                    <div 
                      className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full transition-all duration-300 rounded-full" 
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Delivery Destination (India) & Auto-Save Address Columns */}
          {items.length > 0 && (
            <div className="px-4 sm:px-6 py-2.5 bg-[#1D1412] border-b border-[#4A2E27] text-xs">
              <div className="flex items-center justify-between">
                <div 
                  onClick={() => setIsAddressExpanded((prev) => !prev)}
                  className="flex items-center space-x-2 text-[#F5EFC6] cursor-pointer hover:text-amber-300 transition-colors flex-1 min-w-0"
                >
                  <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <div className="truncate">
                    <span className="font-subhead text-[10px] uppercase text-[#A5BCD6] block leading-tight">
                      Deliver to (India):
                    </span>
                    <span className="font-bold text-xs truncate block text-[#F5EFC6]">
                      {selectedAddress
                        ? `${selectedAddress.recipient_name || 'My Address'} • ${selectedAddress.house_flat ? `${selectedAddress.house_flat}, ` : ''}${selectedAddress.street_locality || selectedAddress.address_line} (${selectedAddress.pincode})`
                        : 'Enter delivery address...'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                  {autoSaveStatus === 'saving' && (
                    <span className="text-[10px] text-amber-300 flex items-center space-x-1 animate-pulse">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span className="hidden sm:inline">Saving to columns...</span>
                    </span>
                  )}
                  {autoSaveStatus === 'saved' && (
                    <span className="text-[10px] text-emerald-400 font-bold flex items-center space-x-1">
                      <Check className="w-3 h-3" />
                      <span className="hidden sm:inline">Saved</span>
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsAddressExpanded((prev) => !prev)}
                    className="px-2 py-1 rounded-lg bg-[#2F201C] hover:bg-[#4A2E27] text-[#A5BCD6] hover:text-[#F5EFC6] text-[11px] font-semibold border border-[#4A2E27] flex items-center space-x-1 transition-colors"
                  >
                    <span>{isAddressExpanded ? 'Hide' : 'Change'}</span>
                    {isAddressExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3 text-[#A5BCD6]" />}
                  </button>
                </div>
              </div>

              {/* Expanded Saved Address Columns & Input Form */}
              {isAddressExpanded && (
                <div className="mt-3 pt-3 border-t border-[#4A2E27] space-y-3 animate-fade-in">
                  
                  {/* Saved Address Columns (2-column grid) */}
                  {allDisplayedAddresses.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-subhead uppercase tracking-wider text-[#A5BCD6] font-bold">
                          Saved Address Columns ({allDisplayedAddresses.length}):
                        </span>
                        <span className="text-[10px] text-amber-400 font-subhead">
                          1-Click Select
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                        {allDisplayedAddresses.map((addr) => {
                          const fullAddrStr = addr.house_flat
                            ? `${addr.house_flat}, ${addr.street_locality || addr.address_line}${addr.city ? `, ${addr.city}` : ''}${addr.state ? `, ${addr.state}` : ''} - ${addr.pincode}`
                            : (addr.address_line?.includes(addr.pincode) ? addr.address_line : `${addr.address_line} - ${addr.pincode}`);
                          const isSelected = selectedAddress?.address_line === fullAddrStr || 
                            (selectedAddress?.pincode === addr.pincode && (selectedAddress?.street_locality === (addr.street_locality || addr.address_line)));

                          return (
                            <div
                              key={addr.id}
                              onClick={() => handleSelectSavedAddress(addr)}
                              className={`p-2 rounded-xl border cursor-pointer transition-all text-xs flex items-start gap-1.5 ${
                                isSelected
                                  ? 'bg-[#4D0E12] border-amber-400 text-[#F5EFC6] shadow ring-1 ring-amber-400/40'
                                  : 'bg-[#18100E] border-[#4A2E27] text-[#F5EFC6]/70 hover:border-[#A5BCD6]/50'
                              }`}
                            >
                              <MapPin className={`w-3 h-3 mt-0.5 flex-shrink-0 ${isSelected ? 'text-amber-400' : 'text-[#A5BCD6]'}`} />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-headline font-bold text-[11px] text-[#F5EFC6] truncate">
                                    {addr.recipient_name || 'Delivery'}
                                  </span>
                                  <span className="text-[8px] uppercase px-1 py-0.2 rounded bg-[#2F201C] border border-[#4A2E27] text-amber-300 font-bold">
                                    {addr.label || 'Saved'}
                                  </span>
                                </div>
                                <p className="text-[10px] truncate text-[#A5BCD6] mt-0.5">{fullAddrStr}</p>
                                {isSelected && (
                                  <span className="text-[9px] text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                                    <Check className="w-2.5 h-2.5" /> Selected
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Toggle to Add / Enter New Address */}
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowNewAddressForm((prev) => !prev)}
                      className="w-full py-1.5 px-2.5 rounded-lg bg-[#231815] hover:bg-[#2F201C] border border-[#4A2E27] text-[11px] text-amber-300 font-bold flex items-center justify-between transition-colors"
                    >
                      <span className="flex items-center space-x-1.5">
                        <Plus className="w-3.5 h-3.5 text-amber-400" />
                        <span>{showNewAddressForm ? 'Close Address Entry' : '+ Enter New Address (Auto-Saves to Columns)'}</span>
                      </span>
                      <span className="text-[10px] text-[#A5BCD6] font-normal">
                        {showNewAddressForm ? 'Cancel' : 'Auto-save enabled'}
                      </span>
                    </button>

                    {showNewAddressForm && (
                      <div className="mt-2.5 p-3 rounded-xl bg-[#18100E] border border-[#4A2E27] space-y-2.5">
                        
                        {/* GPS Auto-detect button */}
                        <button
                          type="button"
                          onClick={handleDetectLocation}
                          disabled={isDetectingLocation}
                          className="w-full px-3 py-1.5 rounded-lg bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 font-bold text-[11px] uppercase tracking-wider border border-amber-500/40 shadow flex items-center justify-center space-x-1.5 transition-all disabled:opacity-50"
                        >
                          {isDetectingLocation ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                          ) : (
                            <Locate className="w-3.5 h-3.5 text-amber-400" />
                          )}
                          <span>{isDetectingLocation ? 'Detecting GPS...' : '📍 Auto-Detect My Location'}</span>
                        </button>

                        {locationNotice && (
                          <p className="text-[10px] text-emerald-400 font-semibold">{locationNotice}</p>
                        )}
                        {locationError && (
                          <p className="text-[10px] text-red-300">{locationError}</p>
                        )}

                        {/* Form Fields with immediate debounced auto-save */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-[#A5BCD6] block mb-0.5">House / Flat / Apt</label>
                            <input
                              type="text"
                              value={cartAddressParts.house_flat}
                              onChange={(e) => {
                                const updated = { ...cartAddressParts, house_flat: e.target.value };
                                setCartAddressParts(updated);
                                triggerAutoSaveAddress(updated, false);
                              }}
                              placeholder="e.g. Flat 101, Lotus Apts"
                              className="w-full bg-[#231815] border border-[#4A2E27] rounded-lg px-2.5 py-1.5 text-xs text-[#F5EFC6] focus:outline-none focus:border-amber-400"
                            />
                          </div>

                          <div className="relative">
                            <div className="flex items-center justify-between mb-0.5">
                              <label className="text-[10px] text-[#A5BCD6] block">
                                Street / Locality *
                              </label>
                              {isSearchingStreet && (
                                <span className="text-[9px] text-amber-300 flex items-center space-x-1">
                                  <Loader2 className="w-2.5 h-2.5 animate-spin" />
                                  <span>Searching...</span>
                                </span>
                              )}
                            </div>
                            <div className="relative">
                              <input
                                type="text"
                                value={cartAddressParts.street_locality}
                                onChange={(e) => handleStreetChange(e.target.value)}
                                onFocus={() => {
                                  if (streetSuggestions.length > 0) setShowSuggestions(true);
                                }}
                                placeholder="Type street (e.g. Indiranagar)"
                                className="w-full bg-[#231815] border border-[#4A2E27] rounded-lg pl-7 pr-2.5 py-1.5 text-xs text-[#F5EFC6] focus:outline-none focus:border-amber-400"
                              />
                              <Search className="w-3 h-3 text-[#A5BCD6] absolute left-2 top-1/2 -translate-y-1/2" />
                            </div>

                            {showSuggestions && streetSuggestions.length > 0 && (
                              <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-[#1D1412] border border-amber-600/50 rounded-xl shadow-xl max-h-36 overflow-y-auto">
                                {streetSuggestions.map((sug, idx) => (
                                  <div
                                    key={idx}
                                    onClick={() => handleSelectSuggestion(sug)}
                                    className="px-2.5 py-1.5 border-b border-[#36211C] hover:bg-[#341F1A] cursor-pointer text-[11px]"
                                  >
                                    <p className="font-bold text-[#F5EFC6] truncate">{sug.street_locality}</p>
                                    <p className="text-[9px] text-[#A5BCD6] truncate">
                                      {[sug.city, sug.state, sug.pincode].filter(Boolean).join(', ')}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="text-[10px] text-[#A5BCD6] block mb-0.5">City</label>
                            <input
                              type="text"
                              value={cartAddressParts.city}
                              onChange={(e) => {
                                const updated = { ...cartAddressParts, city: e.target.value };
                                setCartAddressParts(updated);
                                triggerAutoSaveAddress(updated, false);
                              }}
                              placeholder="Bengaluru"
                              className="w-full bg-[#231815] border border-[#4A2E27] rounded-lg px-2.5 py-1.5 text-xs text-[#F5EFC6] focus:outline-none focus:border-amber-400"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] text-[#A5BCD6] block mb-0.5">State</label>
                            <select
                              value={cartAddressParts.state}
                              onChange={(e) => {
                                const updated = { ...cartAddressParts, state: e.target.value };
                                setCartAddressParts(updated);
                                triggerAutoSaveAddress(updated, false);
                              }}
                              style={{ colorScheme: 'dark' }}
                              className="w-full bg-[#231815] border border-[#4A2E27] rounded-lg px-1.5 py-1.5 text-[11px] text-[#F5EFC6] focus:outline-none focus:border-amber-400"
                            >
                              {INDIAN_STATES.map((st) => (
                                <option key={st} value={st}>{st}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="text-[10px] text-[#A5BCD6] block mb-0.5">PIN Code *</label>
                            <input
                              type="text"
                              maxLength={6}
                              value={cartAddressParts.pincode}
                              onChange={(e) => {
                                const updated = { ...cartAddressParts, pincode: e.target.value.replace(/\D/g, '') };
                                setCartAddressParts(updated);
                                triggerAutoSaveAddress(updated, false);
                              }}
                              placeholder="560038"
                              className="w-full bg-[#231815] border border-[#4A2E27] rounded-lg px-2.5 py-1.5 text-xs font-mono text-[#F5EFC6] focus:outline-none focus:border-amber-400"
                            />
                          </div>
                        </div>

                        {/* Status footer for address input */}
                        <div className="flex items-center justify-between text-[10px] pt-1 border-t border-[#4A2E27]">
                          <span className="text-[#A5BCD6]">
                            ⚡ Auto-saves to your saved columns as you type
                          </span>
                          {autoSaveStatus === 'saved' && (
                            <span className="text-emerald-400 font-bold flex items-center space-x-1">
                              <Check className="w-3 h-3" />
                              <span>✓ Saved to columns</span>
                            </span>
                          )}
                          {autoSaveStatus === 'saving' && (
                            <span className="text-amber-300 font-semibold flex items-center space-x-1">
                              <Loader2 className="w-2.5 h-2.5 animate-spin" />
                              <span>Saving...</span>
                            </span>
                          )}
                        </div>

                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>
          )}

          {/* Line Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 touch-scroll">
            {items.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-28 mx-auto mb-4 flex items-center justify-center p-2 bg-[#18100E] rounded-3xl border border-[#4A2E27] shadow-xl">
                  <img src="/assets/brand/mascot-seal-badge.jpg" alt="Béano Mascot Seal" className="w-full h-full object-contain filter drop-shadow rounded-2xl" />
                </div>
                <h3 className="font-headline font-bold text-lg text-[#F5EFC6] mb-1 uppercase">Your Cart is Empty</h3>
                <p className="font-body text-xs text-[#A5BCD6] italic mb-6 max-w-xs mx-auto">
                  "Béano is waiting! Add some plant-based coffee gummies to Chew the Brew."
                </p>
                <button
                  onClick={() => dispatch(toggleCart(false))}
                  className="px-6 py-2.5 rounded-xl bg-[#4D0E12] text-[#F5EFC6] font-headline font-bold text-xs tracking-wider uppercase border border-[#F5EFC6]/30 shadow-lg hover:bg-[#4D0E12]/80 transition-all"
                >
                  Browse Coffee Gummies
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.cartKey}
                  className="p-3.5 rounded-2xl bg-[#2F201C]/60 border border-[#4A2E27] flex items-center space-x-4 relative group"
                >
                  {/* Thumbnail */}
                  <img
                    src={item.image_url || 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=400&q=80'}
                    alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover bg-[#18100E] border border-[#4A2E27] flex-shrink-0 cursor-pointer hover:opacity-85 transition-opacity"
                    onClick={() => {
                      dispatch(setSelectedProduct(item));
                      dispatch(toggleCart(false));
                    }}
                    title={`View ${item.name}`}
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=400&q=80';
                    }}
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 
                      onClick={() => {
                        dispatch(setSelectedProduct(item));
                        dispatch(toggleCart(false));
                      }}
                      className="font-headline font-bold text-sm text-[#F5EFC6] truncate uppercase cursor-pointer hover:text-[#D6A56E] transition-colors"
                      title={`View ${item.name}`}
                    >
                      {item.name}
                    </h4>
                    <div className="font-subhead text-[10px] text-[#A5BCD6] flex items-center space-x-1.5 mb-2">
                      <span>Pack: <strong>{item.grindType}</strong></span>
                      <span>•</span>
                      <span>₹{item.price.toFixed(2)}</span>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-2 bg-[#231815] border border-[#4A2E27] rounded-lg px-2 py-1">
                        <button
                          onClick={() => dispatch(updateQuantity({ cartKey: item.cartKey, quantity: item.quantity - 1 }))}
                          className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold hover:text-[#A5BCD6]"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => dispatch(updateQuantity({ cartKey: item.cartKey, quantity: item.quantity + 1 }))}
                          disabled={item.quantity >= (item.stock_quantity || 999)}
                          className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold hover:text-[#A5BCD6] disabled:opacity-30"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => dispatch(removeFromCart(item.cartKey))}
                        className="text-xs text-red-400 hover:text-red-300 p-1 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Item Subtotal */}
                  <div className="text-right">
                    <span className="font-serif text-sm font-bold text-[#F5EFC6]">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Footer & Checkout */}
          {items.length > 0 && (
            <div className="p-4 sm:p-6 border-t border-[#4A2E27] bg-[#2F201C]/80 space-y-3.5 sm:space-y-4">
              
              {/* Promo Code Input or Active Chip */}
              {promoCode ? (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-xs">
                  <div className="flex items-center space-x-2 text-emerald-300">
                    <Tag className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="font-bold tracking-wider">{promoCode}</span>
                      <span className="text-[10px] text-emerald-200/80 ml-2">({discountPercent}% OFF Applied)</span>
                    </div>
                  </div>
                  <button
                    onClick={() => dispatch(removePromoCode())}
                    className="p-1 hover:bg-emerald-900 rounded text-emerald-400 hover:text-emerald-200"
                    title="Remove coupon code"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-4 h-4 text-[#A5BCD6] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      placeholder="Coupon e.g. FRIENDS20"
                      className="w-full bg-[#231815] border border-[#4A2E27] rounded-xl pl-9 pr-3 py-2 text-xs text-[#F5EFC6] placeholder-[#F5EFC6]/40 uppercase focus:outline-none focus:border-[#A5BCD6]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#4A2E27] hover:bg-[#4D0E12] text-[#F5EFC6] rounded-xl text-xs font-semibold tracking-wider uppercase border border-[#F5EFC6]/20 transition-colors"
                  >
                    Apply
                  </button>
                </form>
              )}

              {/* Price Calculations */}
              <div className="space-y-1.5 text-xs text-[#F5EFC6]/80 pt-2 border-t border-[#4A2E27]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-[#F5EFC6]">₹{rawSubtotal.toFixed(2)}</span>
                </div>
                
                {discountPercent > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount ({discountPercent}% OFF)</span>
                    <span>-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span>Shipping Fee</span>
                  <span>
                    {shippingFee === 0 ? (
                      <span className="text-emerald-400 font-bold">
                        FREE {totalProductCount > freeItemThreshold ? `(> ${freeItemThreshold} Products)` : `(Over ₹${freeMinOrder})`}
                      </span>
                    ) : (
                      <span className="text-[#F5EFC6] font-medium">₹{shippingFee.toFixed(2)}</span>
                    )}
                  </span>
                </div>

                <div className="flex justify-between text-base font-bold text-[#F5EFC6] pt-2 border-t border-[#4A2E27]">
                  <span>Total</span>
                  <span className="font-serif text-lg text-emerald-300">₹{finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* 7-Day Return Policy Quick Link */}
              <button
                type="button"
                onClick={() => dispatch(openReturnPolicyModal())}
                className="w-full py-2 px-3 rounded-xl bg-[#231815] hover:bg-[#18100E] border border-[#4A2E27] text-[11px] text-[#A5BCD6] hover:text-[#F5EFC6] flex items-center justify-center space-x-2 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>🛡️ {returnDays}-Day Freshness Return Policy • Click to read</span>
              </button>

              {/* Checkout CTA */}
              <button
                onClick={() => {
                  if (selectedAddress) {
                    try {
                      localStorage.setItem('coffee_bean_active_address', JSON.stringify(selectedAddress));
                    } catch (e) {}
                  }
                  if (!isAuthenticated) {
                    dispatch(toggleCart(false));
                    dispatch(openAuthModal({ 
                      mode: 'login', 
                      reason: 'Please sign in or create an account to complete checkout and place your order.' 
                    }));
                  } else {
                    dispatch(toggleCart(false));
                    onProceedToCheckout();
                  }
                }}
                className="w-full py-4 rounded-xl bg-[#4D0E12] hover:bg-[#4D0E12]/90 text-[#F5EFC6] font-bold text-xs uppercase tracking-wider shadow-2xl flex items-center justify-center space-x-2 border border-[#F5EFC6]/40 transition-all active:scale-95"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4 text-[#A5BCD6]" />
              </button>

              <div className="flex justify-between items-center text-[10px] text-[#F5EFC6]/50 pt-1">
                <button
                  onClick={() => dispatch(clearCart())}
                  className="hover:text-red-400 transition-colors"
                >
                  Clear Shopping Cart
                </button>
                <span>Secure SSL Checkout</span>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
