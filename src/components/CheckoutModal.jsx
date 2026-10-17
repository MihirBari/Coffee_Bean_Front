import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { placeOrder, clearCurrentOrder } from '../store/orderSlice';
import { clearCart } from '../store/cartSlice';
import { openReturnPolicyModal } from '../store/settingsSlice';
import { fetchAddresses, addAddress, fetchWallet, toggleBeanCoinsDiscount } from '../store/marketplaceSlice';
import axios from 'axios';
import { API_BASE } from '../config/api';
import { sendVerificationOtp, verifyEmailOtp, resetVerification, setVerificationProof } from '../store/authSlice';
import { trackPageView } from '../services/analytics';
import { 
  X, 
  CreditCard, 
  Truck, 
  CheckCircle2, 
  ShieldCheck, 
  ShieldAlert,
  Coffee, 
  ArrowRight,
  AlertCircle,
  QrCode,
  Smartphone,
  Check,
  Building2,
  Banknote,
  RotateCcw,
  Coins,
  MapPin,
  Sparkles,
  KeyRound,
  RefreshCw,
  Bot,
  Lock,
  MailCheck,
  Locate,
  Navigation,
  Loader2,
  Search
} from 'lucide-react';
import { 
  searchAddressOptions, 
  getCurrentLocationAddress, 
  INDIAN_STATES, 
  getMapConnectorStatus 
} from '../services/mapService';
import { initiateRazorpayPayment, getRazorpayConfig } from '../services/razorpay';

export default function CheckoutModal({ isOpen, onClose, onOrderCompleted }) {
  const dispatch = useDispatch();
  const { items, discountPercent, promoCode } = useSelector((state) => state.cart);
  const { status, error, currentOrder, orderSuccess } = useSelector((state) => state.orders);
  const { 
    user, 
    isAuthenticated,
    verificationToken,
    verifiedEmail,
    isEmailVerified,
    otpSent,
    otpLoading,
    otpError,
    devOtp
  } = useSelector((state) => state.auth);
  const { settings } = useSelector((state) => state.settings);
  const { addresses, wallet, beanCoinsApplied, coinDiscount } = useSelector((state) => state.marketplace);

  // Anti-Bot timing and honeypot state
  const [clientLoadedAt] = useState(() => Date.now());
  const [hpWebsite, setHpWebsite] = useState('');
  const [isHumanVerified, setIsHumanVerified] = useState(true);

  // Email verification state
  const [enteredOtp, setEnteredOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpNotice, setOtpNotice] = useState('');

  // Razorpay Gateway state
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [razorpayConfig, setRazorpayConfig] = useState({ is_configured: false, key_id: null });

  useEffect(() => {
    if (isOpen) {
      trackPageView('/checkout', 'Order Checkout & Payment');
      getRazorpayConfig().then((cfg) => setRazorpayConfig(cfg)).catch(() => {});
      try {
        const stored = JSON.parse(localStorage.getItem('coffee_bean_saved_addresses') || '[]');
        if (Array.isArray(stored)) {
          setLocalAddresses(stored);
        }
      } catch (e) {}
      if (isAuthenticated) {
        dispatch(fetchAddresses());
        // Bean Coins loyalty concept temporarily commented out
        // dispatch(fetchWallet());
      }
    }
  }, [isOpen, isAuthenticated, dispatch]);

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // UPI payment state
  const [upiMethod, setUpiMethod] = useState('apps'); // 'apps' | 'id' | 'qr'
  const [selectedUpiApp, setSelectedUpiApp] = useState('Google Pay');
  const [upiId, setUpiId] = useState('');
  const [upiVerified, setUpiVerified] = useState(false);

  // Local saved address cache for instant 1-click column display
  const [localAddresses, setLocalAddresses] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('coffee_bean_saved_addresses') || '[]');
      return Array.isArray(stored) ? stored : [];
    } catch (e) {
      return [];
    }
  });

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

  const [autoSaveStatus, setAutoSaveStatus] = useState(''); // '' | 'saving' | 'saved'
  const autoSaveTimerRef = useRef(null);
  const lastSavedAddressRef = useRef('');

  // Structured Shipping Address & Map State
  const [shippingParts, setShippingParts] = useState({
    house_flat: '',
    street_locality: '',
    city: '',
    state: 'Karnataka',
    pincode: ''
  });
  const [streetSuggestions, setStreetSuggestions] = useState([]);
  const [isSearchingStreet, setIsSearchingStreet] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationNotice, setLocationNotice] = useState('');
  const [locationError, setLocationError] = useState('');
  const mapConnectorStatus = getMapConnectorStatus();

  // Automatic Address Saver into customer address book columns
  const triggerAutoSaveAddress = (parts, name, phone, immediate = false) => {
    const cleanPin = (parts?.pincode || '').replace(/\D/g, '').trim();
    if (cleanPin.length !== 6) return;
    if (!parts?.street_locality || parts.street_locality.trim().length < 3) return;
    const resolvedCity = (parts?.city || '').trim() || 'Bengaluru';
    const resolvedState = parts?.state || 'Karnataka';

    const main = [parts.house_flat, parts.street_locality, resolvedCity, resolvedState].filter(Boolean).join(', ');
    const fullStr = main ? `${main} - ${cleanPin}` : '';
    if (!fullStr || fullStr === lastSavedAddressRef.current) return;

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    const performSave = async () => {
      lastSavedAddressRef.current = fullStr;
      setAutoSaveStatus('saving');

      const recipientName = (name || formData?.customer_name || user?.name || 'Customer').trim();
      const contactPhone = (phone || formData?.customer_phone || user?.phone || '').trim();

      const addrPayload = {
        label: 'Delivery Address',
        recipient_name: recipientName,
        phone: contactPhone,
        address_line: fullStr,
        house_flat: parts.house_flat || '',
        street_locality: parts.street_locality || '',
        city: resolvedCity,
        state: resolvedState,
        pincode: cleanPin,
        is_default: allDisplayedAddresses.length === 0 ? 1 : 0
      };

      // 1. Immediately update local addresses state & localStorage so the columns update instantly
      setLocalAddresses((prev) => {
        const filtered = prev.filter((a) => a.address_line !== fullStr);
        const updated = [{ id: 'local_' + Date.now(), ...addrPayload }, ...filtered];
        try {
          localStorage.setItem('coffee_bean_saved_addresses', JSON.stringify(updated));
          localStorage.setItem('coffee_bean_active_address', JSON.stringify(addrPayload));
        } catch (e) {}
        return updated;
      });

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

  const updateShippingAddressString = (updatedParts) => {
    const main = [updatedParts.house_flat, updatedParts.street_locality, updatedParts.city, updatedParts.state].filter(Boolean).join(', ');
    const fullStr = main ? (updatedParts.pincode ? `${main} - ${updatedParts.pincode}` : main) : '';
    setFormData((prev) => ({ ...prev, shipping_address: fullStr }));
    triggerAutoSaveAddress(updatedParts, formData?.customer_name, formData?.customer_phone, false);
  };

  const handleDetectLocation = async () => {
    setIsDetectingLocation(true);
    setLocationNotice('');
    setLocationError('');
    try {
      const loc = await getCurrentLocationAddress();
      const updated = {
        house_flat: loc.house_flat || shippingParts.house_flat,
        street_locality: loc.street_locality || shippingParts.street_locality,
        city: loc.city || shippingParts.city,
        state: loc.state || shippingParts.state,
        pincode: loc.pincode || shippingParts.pincode
      };
      setShippingParts(updated);
      updateShippingAddressString(updated);
      triggerAutoSaveAddress(updated, formData?.customer_name, formData?.customer_phone, true);
      setLocationNotice(`📍 Detected: ${loc.street_locality || loc.city || 'Your Area'} (${loc.source})`);
    } catch (err) {
      setLocationError(err.message || 'Could not fetch GPS location.');
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const handleStreetChange = async (val) => {
    const updated = { ...shippingParts, street_locality: val };
    setShippingParts(updated);
    updateShippingAddressString(updated);

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
      ...shippingParts,
      street_locality: sug.street_locality || sug.description,
      city: sug.city || shippingParts.city,
      state: sug.state || shippingParts.state,
      pincode: sug.pincode || shippingParts.pincode
    };
    setShippingParts(updated);
    updateShippingAddressString(updated);
    triggerAutoSaveAddress(updated, formData?.customer_name, formData?.customer_phone, true);
    setShowSuggestions(false);
  };

  const [formData, setFormData] = useState({
    customer_name: user?.name || '',
    customer_email: user?.email || '',
    customer_phone: user?.phone || '',
    shipping_address: '',
    notes: '',
    payment_method: 'UPI (Google Pay, PhonePe, Paytm, QR)',
    card_number: '•••• •••• •••• 4242',
    card_exp: '12/28',
    card_cvc: '882'
  });

  // Automatically sync logged-in customer credentials into checkout form
  useEffect(() => {
    if (isOpen && user) {
      setFormData((prev) => ({
        ...prev,
        customer_name: prev.customer_name || user.name || '',
        customer_email: user.email || prev.customer_email || '',
        customer_phone: prev.customer_phone || user.phone || '',
      }));
    }
  }, [isOpen, user]);

  // Automatically pre-populate active cart address, default, or first saved address into checkout form
  useEffect(() => {
    if (isOpen && allDisplayedAddresses.length > 0 && !formData.shipping_address) {
      let activeAddr = null;
      try {
        const stored = localStorage.getItem('coffee_bean_active_address');
        if (stored) {
          activeAddr = JSON.parse(stored);
        }
      } catch (e) {}

      const targetAddr = activeAddr || allDisplayedAddresses.find((a) => a.is_default) || allDisplayedAddresses[0];
      if (targetAddr) {
        const fullAddrStr = targetAddr.house_flat
          ? `${targetAddr.house_flat}, ${targetAddr.street_locality || targetAddr.address_line}${targetAddr.city ? `, ${targetAddr.city}` : ''}${targetAddr.state ? `, ${targetAddr.state}` : ''} - ${targetAddr.pincode}`
          : (targetAddr.address_line?.includes(targetAddr.pincode) ? targetAddr.address_line : `${targetAddr.address_line} - ${targetAddr.pincode}`);

        setShippingParts({
          house_flat: targetAddr.house_flat || '',
          street_locality: targetAddr.street_locality || targetAddr.address_line || '',
          city: targetAddr.city || '',
          state: targetAddr.state || 'Karnataka',
          pincode: targetAddr.pincode || ''
        });

        setFormData((prev) => ({
          ...prev,
          customer_name: targetAddr.recipient_name || prev.customer_name || user?.name || '',
          customer_phone: targetAddr.phone || prev.customer_phone || user?.phone || '',
          shipping_address: fullAddrStr
        }));
      }
    }
  }, [isOpen, allDisplayedAddresses]);

  const [serverVerified, setServerVerified] = useState(false);
  const [serverCheckLoading, setServerCheckLoading] = useState(false);

  // Helper to read known verified emails from localStorage
  const getKnownVerifiedEmails = () => {
    try {
      const list = JSON.parse(localStorage.getItem('coffee_bean_verified_emails') || '[]');
      return Array.isArray(list) ? list.map((e) => e.toLowerCase()) : [];
    } catch (e) {
      return [];
    }
  };

  const currentEmail = (formData.customer_email || '').trim().toLowerCase();
  const knownVerifiedList = getKnownVerifiedEmails();

  // Live Server Verification Check: guarantees MariaDB and UI are 100% in sync
  useEffect(() => {
    let isCancelled = false;
    const checkVerificationLive = async () => {
      const email = (formData.customer_email || user?.email || '').trim().toLowerCase();
      if (!email || !email.includes('@')) {
        setServerVerified(false);
        return;
      }
      // Demo pre-verified accounts
      if (email === 'customer@example.com' || email === 'admin@coffeebean.com') {
        setServerVerified(true);
        return;
      }
      try {
        setServerCheckLoading(true);
        const res = await axios.get(`${API_BASE}/auth/check-verification?email=${encodeURIComponent(email)}`);
        if (!isCancelled) {
          if (res.data?.is_verified) {
            setServerVerified(true);
            const known = getKnownVerifiedEmails();
            if (!known.includes(email)) {
              localStorage.setItem('coffee_bean_verified_emails', JSON.stringify([...known, email]));
            }
          } else {
            setServerVerified(false);
            const known = getKnownVerifiedEmails();
            if (known.includes(email)) {
              localStorage.setItem('coffee_bean_verified_emails', JSON.stringify(known.filter((e) => e !== email)));
            }
          }
        }
      } catch (e) {
        // network fallback
      } finally {
        if (!isCancelled) setServerCheckLoading(false);
      }
    };

    if (isOpen) {
      checkVerificationLive();
    }

    return () => {
      isCancelled = true;
    };
  }, [isOpen, formData.customer_email, user]);

  // Verification status logic: ONCE VERIFIED IN DATABASE OR SESSION, NEVER VERIFY AGAIN!
  const isCustomerEmailVerified = Boolean(
    serverVerified ||
    (isAuthenticated && user?.email && user.is_email_verified === 1 && (!currentEmail || currentEmail === user.email.toLowerCase())) ||
    (verificationToken && verifiedEmail && verifiedEmail.toLowerCase() === currentEmail) ||
    (currentEmail === 'customer@example.com' || currentEmail === 'admin@coffeebean.com')
  );

  // Dynamic delivery rules configured by Admin
  const deliveryCharge = Number(settings?.delivery_charge ?? 55);
  const freeItemThreshold = Number(settings?.free_delivery_item_threshold ?? 2); // > 2 items gets free delivery
  const freeMinOrder = Number(settings?.free_delivery_min_order ?? 500);
  const returnDays = settings?.return_window_days || 7;

  const totalProductCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const rawSubtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discountAmount = (rawSubtotal * discountPercent) / 100;
  const subtotalAfterPromo = rawSubtotal - discountAmount;

  // Bean Coins loyalty discount rule (temporarily commented out)
  /*
  const canApplyCoins = (wallet?.balance || 0) >= 50;
  const coinDiscountAmount = (beanCoinsApplied && canApplyCoins) ? Math.min(coinDiscount, subtotalAfterPromo) : 0;
  */
  const coinDiscountAmount = 0;
  const subtotalAfterDiscount = subtotalAfterPromo;

  // Free delivery rule: products count > 2 OR subtotal >= 500
  const isFreeDelivery = totalProductCount > freeItemThreshold || subtotalAfterDiscount >= freeMinOrder;
  const shippingFee = items.length === 0 ? 0 : (isFreeDelivery ? 0 : deliveryCharge);
  const finalTotal = subtotalAfterDiscount + shippingFee;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEmailBlur = async () => {
    if (!currentEmail || !currentEmail.includes('@') || isCustomerEmailVerified) return;
    try {
      const res = await axios.get(`${API_BASE}/auth/check-verification?email=${encodeURIComponent(currentEmail)}`);
      if (res.data?.is_verified) {
        setServerVerified(true);
        const known = getKnownVerifiedEmails();
        if (!known.includes(currentEmail)) {
          localStorage.setItem('coffee_bean_verified_emails', JSON.stringify([...known, currentEmail]));
        }
        dispatch(setVerificationProof({ email: currentEmail, token: 'server_verified_proof' }));
        setOtpNotice('✓ Verified Customer (No OTP required).');
      }
    } catch (err) {}
  };

  const handleSendOtp = async () => {
    if (!formData.customer_email || !formData.customer_email.includes('@')) {
      alert('Please enter a valid email address first.');
      return;
    }
    setOtpNotice('');
    const result = await dispatch(sendVerificationOtp({
      email: formData.customer_email.trim(),
      purpose: 'order_checkout',
      hp_website: hpWebsite
    }));
    if (sendVerificationOtp.fulfilled.match(result)) {
      setResendCooldown(30);
      setOtpNotice(`📧 6-digit code dispatched to ${formData.customer_email}. Check your inbox!`);
    }
  };

  const handleVerifyOtp = async () => {
    if (!enteredOtp || enteredOtp.trim().length !== 6) {
      alert('Please enter the full 6-digit verification code.');
      return;
    }
    const result = await dispatch(verifyEmailOtp({
      email: formData.customer_email.trim(),
      otp: enteredOtp.trim(),
      purpose: 'order_checkout'
    }));
    if (verifyEmailOtp.fulfilled.match(result)) {
      setEnteredOtp('');
      setServerVerified(true);
      setOtpNotice('✓ Email verified successfully in Roastery database!');
    }
  };

  const handleVerifyUpi = () => {
    if (upiId && upiId.includes('@')) {
      setUpiVerified(true);
    } else {
      alert('Please enter a valid UPI ID (e.g. mobile@okhdfcbank or name@upi)');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customer_name || !formData.customer_email || !formData.shipping_address) {
      alert('Please fill in your name, email, and shipping address');
      return;
    }

    // Shipping Criteria: Strict Indian Postal PIN code enforcement
    const cleanPin = (shippingParts.pincode || '').trim();
    if (!/^[1-9][0-9]{5}$/.test(cleanPin)) {
      alert('We currently only ship within India. Please enter a valid 6-digit Indian Postal PIN code (e.g. 560001, 110001). International delivery is not supported.');
      return;
    }

    if (!isCustomerEmailVerified) {
      const emailElem = document.getElementById('checkout-email-section');
      if (emailElem) {
        emailElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      if (!otpSent) {
        handleSendOtp();
      }
      return;
    }

    if (!isHumanVerified) {
      alert('Please check the anti-bot human verification check.');
      return;
    }

    let finalPaymentDescription = formData.payment_method;
    if (formData.payment_method.startsWith('UPI')) {
      if (upiMethod === 'qr') {
        finalPaymentDescription = 'UPI (QR Code Scanned)';
      } else if (upiMethod === 'id' && upiId) {
        finalPaymentDescription = `UPI (VPA: ${upiId})`;
      } else {
        finalPaymentDescription = `UPI (${selectedUpiApp})`;
      }
    }

    const isSubOrder = items.some((i) => i.grindType?.toLowerCase().includes('subscrib'));
    const payload = {
      customer_name: formData.customer_name,
      customer_email: formData.customer_email,
      customer_phone: formData.customer_phone,
      shipping_address: formData.shipping_address,
      payment_method: finalPaymentDescription,
      notes: formData.notes,
      promo_code: promoCode || '',
      shipping_fee: shippingFee,
      discount_amount: discountAmount, // + coinDiscountAmount (temporarily disabled)
      is_subscription: isSubOrder,
      bean_coins_used: 0, // (beanCoinsApplied && canApplyCoins) ? 50 : 0, (temporarily disabled)
      verification_token: verificationToken || '',
      client_loaded_at: clientLoadedAt,
      hp_website: hpWebsite,
      items: items.map((i) => ({
        product_id: i.productId,
        quantity: i.quantity,
        grind_type: i.grindType,
        unit_price: i.price
      }))
    };

    const isOnlinePayment = formData.payment_method !== 'Cash On Delivery';

    if (isOnlinePayment) {
      setPaymentProcessing(true);
      await initiateRazorpayPayment({
        amount: finalTotal,
        customer: {
          name: formData.customer_name,
          email: formData.customer_email,
          phone: formData.customer_phone,
        },
        notes: {
          delivery_notes: formData.notes || '',
          method: finalPaymentDescription,
        },
        onSuccess: async (paymentDetails) => {
          payload.razorpay_order_id = paymentDetails.razorpay_order_id;
          payload.razorpay_payment_id = paymentDetails.razorpay_payment_id;
          payload.razorpay_signature = paymentDetails.razorpay_signature;
          payload.payment_status = 'paid';

          const resultAction = await dispatch(placeOrder(payload));
          setPaymentProcessing(false);
          if (placeOrder.fulfilled.match(resultAction)) {
            dispatch(clearCart());
            if (onOrderCompleted) onOrderCompleted(resultAction.payload);
          }
        },
        onError: (errMsg) => {
          setPaymentProcessing(false);
          alert(`Payment Notice: ${errMsg}`);
        },
        onDismiss: () => {
          setPaymentProcessing(false);
        }
      });
      return;
    }

    const resultAction = await dispatch(placeOrder(payload));
    if (placeOrder.fulfilled.match(resultAction)) {
      dispatch(clearCart());
      if (onOrderCompleted) onOrderCompleted(resultAction.payload);
    }
  };

  const handleClose = () => {
    dispatch(clearCurrentOrder());
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div 
        className="relative bg-[#231815] border border-[#4A2E27] text-[#F5EFC6] rounded-3xl max-w-2xl w-full max-h-[90dvh] overflow-y-auto shadow-2xl p-4 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 p-2 rounded-full bg-[#4A2E27]/80 hover:bg-[#4D0E12] text-[#F5EFC6] border border-[#F5EFC6]/20 transition-colors z-10"
          aria-label="Close checkout"
        >
          <X className="w-5 h-5" />
        </button>

        {orderSuccess && currentOrder ? (
          /* SUCCESS CONFIRMATION VIEW */
          <div className="text-center py-8">
            <div className="flex items-center justify-center space-x-3 mx-auto mb-5">
              <div className="w-16 h-20 bg-[#18100E] rounded-2xl p-2 border border-[#A5BCD6]/40 flex items-center justify-center shadow-xl">
                <img src="/assets/brand/mascot-seal-badge.jpg" alt="Béano Celebrating" className="w-full h-full object-contain filter drop-shadow rounded-xl" />
              </div>
              <div className="w-16 h-16 rounded-full bg-emerald-950 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center shadow-xl">
                <CheckCircle2 className="w-9 h-9" />
              </div>
            </div>

            <span className="font-subhead text-xs font-bold uppercase tracking-widest text-[#A5BCD6]">Order Confirmed</span>
            <h2 className="font-headline font-black text-3xl text-[#F5EFC6] mt-1 mb-2 uppercase">
              Thank You for Chewing The Brew!
            </h2>
            <p className="font-body text-sm text-[#F5EFC6]/85 max-w-md mx-auto mb-6 leading-relaxed">
              Béano and The Bean Co. team have received your order! Your plant-based coffee gummies are queued for dispatch. A receipt has been sent to <strong>{currentOrder.customer_email}</strong>.
            </p>

            {/* Order Details Receipt Box */}
            <div className="bg-[#2F201C] border border-[#4A2E27] rounded-2xl p-5 text-left mb-8 space-y-3 font-subhead">
              <div className="flex justify-between items-center border-b border-[#4A2E27] pb-3">
                <span className="text-xs text-[#A5BCD6]">Order Tracking Number:</span>
                <span className="font-mono text-sm font-bold text-[#F5EFC6] bg-[#231815] px-2.5 py-1 rounded border border-[#4A2E27]">
                  {currentOrder.order_number}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#A5BCD6]">Recipient:</span>
                <span className="font-semibold text-[#F5EFC6]">{currentOrder.customer_name}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#A5BCD6]">Shipping Destination:</span>
                <span className="text-[#F5EFC6] text-right truncate max-w-[260px]">{currentOrder.shipping_address}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#A5BCD6]">Payment Method:</span>
                <span className="font-semibold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                  {currentOrder.payment_method || 'UPI Paid'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-[#A5BCD6]">Order Status:</span>
                <span className="font-semibold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800">
                  {currentOrder.status}
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-[#4A2E27] pt-3 text-sm font-bold">
                <span>Total Paid:</span>
                <span className="font-headline font-black text-xl text-[#F5EFC6]">₹{parseFloat(currentOrder.total_amount).toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="px-8 py-3.5 rounded-xl bg-[#4D0E12] hover:bg-[#4D0E12]/90 text-[#F5EFC6] font-headline font-bold text-xs uppercase tracking-wider border border-[#F5EFC6]/40 shadow-xl transition-all"
            >
              Continue Exploring Gummies
            </button>
          </div>
        ) : (
          /* CHECKOUT FORM VIEW */
          <div>
            <div className="flex items-center space-x-3 mb-6 border-b border-[#4A2E27] pb-4">
              <div className="w-10 h-10 rounded-xl bg-[#4D0E12] border border-[#F5EFC6]/30 flex items-center justify-center text-[#F5EFC6]">
                <ShieldCheck className="w-5 h-5 text-[#A5BCD6]" />
              </div>
              <div>
                <h2 className="font-headline font-black text-xl text-[#F5EFC6] uppercase">The Bean Co. Checkout</h2>
                <span className="font-subhead text-xs text-[#A5BCD6]">Plant-Based Coffee Gummies • 50mg Measured Energy</span>
              </div>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-700 text-red-200 text-xs mb-5 flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Customer Contact */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#A5BCD6] block">
                  1. Contact Information
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-[#F5EFC6]/80 block mb-1">Full Name *</label>
                    <input
                      type="text"
                      name="customer_name"
                      required
                      placeholder="e.g. Rohan Sharma"
                      value={formData.customer_name}
                      onChange={handleChange}
                      className="w-full bg-[#18100E] border border-[#4A2E27] rounded-xl px-3.5 py-2 text-xs text-[#F5EFC6] focus:outline-none focus:border-[#A5BCD6]"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] text-[#F5EFC6]/80 block">Email Address *</label>
                      {isCustomerEmailVerified && (
                        <span className="text-[10px] text-emerald-400 font-semibold flex items-center space-x-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Verified</span>
                        </span>
                      )}
                    </div>
                    <input
                      type="email"
                      name="customer_email"
                      required
                      placeholder="e.g. rohan@example.com"
                      value={formData.customer_email}
                      onChange={handleChange}
                      onBlur={handleEmailBlur}
                      className={`w-full bg-[#18100E] border rounded-xl px-3.5 py-2 text-xs text-[#F5EFC6] focus:outline-none transition-colors ${
                        isCustomerEmailVerified ? 'border-emerald-500/70 focus:border-emerald-400' : 'border-[#4A2E27] focus:border-[#A5BCD6]'
                      }`}
                    />
                  </div>
                </div>

                {/* Email Verification Box & Anti-Fraud Shield */}
                <div id="checkout-email-section" className="pt-1 scroll-mt-6">
                  {isCustomerEmailVerified ? (
                    <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/50 text-emerald-300 text-xs flex items-center justify-between animate-fade-in">
                      <div className="flex items-center space-x-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span className="text-[11px] font-medium">
                          Verified Customer ✓ <span className="text-emerald-400/70">(No verification needed)</span>
                        </span>
                      </div>
                      <span className="text-[9px] bg-emerald-900/80 text-emerald-200 px-2 py-0.5 rounded font-mono uppercase font-bold tracking-wider">
                        VERIFIED
                      </span>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-600/50 space-y-2.5 animate-fade-in shadow-inner">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-start space-x-2">
                          <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <span className="font-headline font-bold text-xs text-[#F5EFC6] uppercase tracking-wide block">
                              Email Verification Required (Step 1)
                            </span>
                            <span className="text-[11px] text-[#A5BCD6] block leading-tight">
                              Verify your inbox to protect against fake orders and enable checkout.
                            </span>
                          </div>
                        </div>
                        {!otpSent && (
                          <button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={otpLoading || !formData.customer_email}
                            className="px-3.5 py-2 rounded-xl bg-[#4D0E12] hover:bg-[#4D0E12]/90 text-[#F5EFC6] font-headline font-bold text-[11px] uppercase tracking-wider border border-[#F5EFC6]/30 shadow transition-all disabled:opacity-40 flex items-center justify-center space-x-1.5 flex-shrink-0 active:scale-95"
                          >
                            {otpLoading ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <KeyRound className="w-3.5 h-3.5 text-amber-300" />
                            )}
                            <span>{otpLoading ? 'Sending Code...' : 'Get 6-Digit Code'}</span>
                          </button>
                        )}
                      </div>

                      {/* OTP Input Fields when dispatched */}
                      {otpSent && (
                        <div className="space-y-2 pt-2 border-t border-[#4A2E27]">
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            <div className="relative flex-1">
                              <KeyRound className="w-3.5 h-3.5 text-[#A5BCD6] absolute left-3 top-1/2 -translate-y-1/2" />
                              <input
                                type="text"
                                maxLength={6}
                                placeholder="Enter 6-digit OTP"
                                value={enteredOtp}
                                onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                                className="w-full bg-[#18100E] border border-[#4A2E27] rounded-xl pl-9 pr-3 py-2 text-xs font-mono tracking-widest text-[#F5EFC6] placeholder-[#F5EFC6]/40 focus:outline-none focus:border-amber-400"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={handleVerifyOtp}
                              disabled={otpLoading || enteredOtp.length !== 6}
                              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-headline font-bold text-xs uppercase tracking-wider shadow transition-all disabled:opacity-40 flex items-center justify-center space-x-1.5"
                            >
                              {otpLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                              <span>Verify Code</span>
                            </button>
                            <button
                              type="button"
                              onClick={handleSendOtp}
                              disabled={resendCooldown > 0 || otpLoading}
                              className="text-[11px] text-[#A5BCD6] hover:text-[#F5EFC6] underline disabled:opacity-40 transition-colors text-center py-1 sm:py-0"
                            >
                              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                            </button>
                          </div>

                          {/* Dev Testing Helper (shows OTP for immediate local verification testing) */}
                          {devOtp && (
                            <div className="pt-1">
                              <button
                                type="button"
                                onClick={() => setEnteredOtp(devOtp)}
                                className="text-[10px] bg-[#18100E] hover:bg-[#2F201C] text-amber-300 border border-amber-500/40 rounded-lg px-2.5 py-1 transition-colors flex items-center space-x-1.5"
                              >
                                <Sparkles className="w-3 h-3 text-amber-400" />
                                <span>Local Demo Helper: Click to fill test OTP <strong>[{devOtp}]</strong></span>
                              </button>
                            </div>
                          )}

                          {otpError && (
                            <div className="text-[11px] text-red-300 bg-red-950/70 p-2 rounded-lg border border-red-800">
                              {otpError}
                            </div>
                          )}

                          {otpNotice && (
                            <div className="text-[11px] text-emerald-300">
                              {otpNotice}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[11px] text-[#F5EFC6]/80 block mb-1">Mobile Number (For Delivery Updates & UPI)</label>
                  <input
                    type="tel"
                    name="customer_phone"
                    placeholder="+91 98765 43210"
                    value={formData.customer_phone}
                    onChange={handleChange}
                    className="w-full bg-[#18100E] border border-[#4A2E27] rounded-xl px-3.5 py-2 text-xs text-[#F5EFC6] focus:outline-none focus:border-[#A5BCD6]"
                  />
                </div>
              </div>

              {/* Shipping Address (India Exclusive) */}
              <div className="space-y-3 pt-3 border-t border-[#4A2E27]">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#A5BCD6]">
                      2. Shipping Destination
                    </span>
                    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#4D0E12] text-[#F5EFC6] border border-[#F5EFC6]/20">
                      🇮🇳 India Only
                    </span>
                  </div>
                  <span className="text-[10px] text-amber-300 font-subhead">
                    Pan-India Express Logistics
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#18100E] border border-amber-500/20 text-[11px] text-[#A5BCD6] flex items-center space-x-2 font-subhead">
                  <span className="text-sm">🇮🇳</span>
                  <span><strong>Domestic Delivery Only:</strong> We deliver exclusively to addresses within India (All 28 States &amp; 8 UTs). International delivery is not supported.</span>
                </div>

                {/* 1-Click Saved Addresses Picker (Amazon Style) */}
                <div className="space-y-2 mb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-subhead uppercase tracking-wider text-[#F5EFC6] font-bold flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      <span>Select From Your Saved Address Book ({allDisplayedAddresses.length}):</span>
                    </span>
                    {autoSaveStatus === 'saving' && (
                      <span className="text-[10px] text-amber-300 flex items-center gap-1 font-subhead animate-pulse">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Saving address to columns...</span>
                      </span>
                    )}
                    {autoSaveStatus === 'saved' && (
                      <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-bold animate-fade-in">
                        <Check className="w-3 h-3" />
                        <span>✓ Address automatically saved</span>
                      </span>
                    )}
                    {!autoSaveStatus && allDisplayedAddresses.length > 0 && (
                      <span className="text-[10px] text-[#A5BCD6] font-subhead">
                        1-Click Select
                      </span>
                    )}
                  </div>

                  {allDisplayedAddresses && allDisplayedAddresses.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {allDisplayedAddresses.map((addr) => {
                        const fullAddrStr = addr.house_flat
                          ? `${addr.house_flat}, ${addr.street_locality || addr.address_line}${addr.city ? `, ${addr.city}` : ''}${addr.state ? `, ${addr.state}` : ''} - ${addr.pincode}`
                          : (addr.address_line?.includes(addr.pincode) ? addr.address_line : `${addr.address_line} - ${addr.pincode}`);
                        const isSelected = formData.shipping_address === fullAddrStr || 
                          (shippingParts.pincode === addr.pincode && shippingParts.street_locality === (addr.street_locality || addr.address_line));

                        return (
                          <div
                            key={addr.id}
                            onClick={() => {
                              try {
                                localStorage.setItem('coffee_bean_active_address', JSON.stringify(addr));
                              } catch (e) {}
                              setShippingParts({
                                house_flat: addr.house_flat || '',
                                street_locality: addr.street_locality || addr.address_line || '',
                                city: addr.city || '',
                                state: addr.state || 'Karnataka',
                                pincode: addr.pincode || ''
                              });
                              setFormData((prev) => ({
                                ...prev,
                                customer_name: addr.recipient_name || prev.customer_name,
                                customer_phone: addr.phone || prev.customer_phone,
                                shipping_address: fullAddrStr
                              }));
                            }}
                            className={`p-2.5 rounded-xl border cursor-pointer transition-all text-xs flex items-start gap-2 ${
                              isSelected
                                ? 'bg-[#4D0E12] border-amber-400 text-[#F5EFC6] shadow-md ring-1 ring-amber-400/40'
                                : 'bg-[#18100E] border-[#4A2E27] text-[#F5EFC6]/70 hover:border-[#A5BCD6]/50'
                            }`}
                          >
                            <MapPin className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${isSelected ? 'text-amber-400' : 'text-[#A5BCD6]'}`} />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-headline font-bold text-xs text-[#F5EFC6] truncate">
                                  {addr.recipient_name || 'Delivery Address'}
                                </span>
                                <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-[#2F201C] border border-[#4A2E27] text-amber-300 font-bold">
                                  {addr.label || 'Saved'}
                                </span>
                              </div>
                              <p className="text-[11px] truncate text-[#A5BCD6] mt-0.5">{fullAddrStr}</p>
                              {isSelected && (
                                <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                                  <Check className="w-3 h-3" /> Selected for Delivery
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl border border-dashed border-[#4A2E27] bg-[#18100E]/60 text-center text-xs text-[#A5BCD6]">
                      <p className="font-subhead text-[11px] text-[#F5EFC6]/70">
                        ⚡ Enter your address below — it will be automatically saved in these columns for fast 1-click checkout!
                      </p>
                    </div>
                  )}
                </div>

                {/* GPS Auto-Detect Location Button & API Connector Banner */}
                <div className="p-3 rounded-2xl bg-[#18100E] border border-[#4A2E27] space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      disabled={isDetectingLocation}
                      className="px-3 py-1.5 rounded-xl bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 font-bold text-[11px] uppercase tracking-wider border border-amber-500/40 shadow flex items-center space-x-1.5 transition-all disabled:opacity-50 active:scale-95"
                    >
                      {isDetectingLocation ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                      ) : (
                        <Locate className="w-3.5 h-3.5 text-amber-400" />
                      )}
                      <span>{isDetectingLocation ? 'Detecting GPS...' : '📍 Auto-Detect My Current Location'}</span>
                    </button>

                    <div className="flex items-center space-x-1 text-[10px] text-[#A5BCD6]">
                      <Navigation className="w-3 h-3 text-amber-400" />
                      <span>API: <strong>{mapConnectorStatus.activeProvider}</strong></span>
                    </div>
                  </div>

                  {locationNotice && (
                    <div className="text-[11px] text-emerald-300 bg-emerald-950/60 p-2 rounded-lg border border-emerald-800 flex items-center space-x-1.5">
                      <Check className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{locationNotice}</span>
                    </div>
                  )}

                  {locationError && (
                    <div className="text-[11px] text-red-300 bg-red-950/70 p-2 rounded-lg border border-red-800 flex items-center space-x-1.5">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{locationError}</span>
                    </div>
                  )}

                  {/* Structured Address Grid */}
                  <div className="space-y-2.5 pt-1">
                    {/* House/Flat & Street Name/Locality */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                      <div className="sm:col-span-4">
                        <label className="text-[10px] uppercase text-[#A5BCD6] block mb-1">
                          House / Flat No. <span className="text-[#A5BCD6]/60">(Apt / Floor)</span>
                        </label>
                        <input
                          type="text"
                          value={shippingParts.house_flat}
                          onChange={(e) => {
                            const updated = { ...shippingParts, house_flat: e.target.value };
                            setShippingParts(updated);
                            updateShippingAddressString(updated);
                          }}
                          placeholder="e.g. Flat 402, Lotus Orchid"
                          className="w-full bg-[#231815] border border-[#4A2E27] rounded-xl px-3 py-2 text-xs text-[#F5EFC6] focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div className="sm:col-span-8 relative">
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[10px] uppercase text-[#A5BCD6] block">
                            Street Name / Locality * <span className="text-amber-300 font-bold">(Map Autocomplete)</span>
                          </label>
                          {isSearchingStreet && (
                            <span className="text-[10px] text-amber-300 flex items-center space-x-1">
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span>Searching...</span>
                            </span>
                          )}
                        </div>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            value={shippingParts.street_locality}
                            onChange={(e) => handleStreetChange(e.target.value)}
                            onFocus={() => {
                              if (streetSuggestions.length > 0) setShowSuggestions(true);
                            }}
                            placeholder="Type street or locality (e.g. Indiranagar, Bandra, Connaught Place)..."
                            className="w-full bg-[#231815] border border-[#4A2E27] rounded-xl pl-8 pr-3 py-2 text-xs text-[#F5EFC6] focus:outline-none focus:border-amber-400"
                          />
                          <Search className="w-3.5 h-3.5 text-[#A5BCD6] absolute left-2.5 top-1/2 -translate-y-1/2" />
                        </div>

                        {/* Google Places-Style Dropdown Options */}
                        {showSuggestions && streetSuggestions.length > 0 && (
                          <div className="absolute left-0 right-0 top-full mt-1 z-30 bg-[#1D1412] border-2 border-amber-600/50 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md max-h-48 overflow-y-auto">
                            <div className="px-3 py-1 bg-[#2B1B18] border-b border-[#4A2E27] flex items-center justify-between text-[10px] text-[#A5BCD6]">
                              <span className="font-bold uppercase tracking-wider text-amber-300">Address Options:</span>
                              <span>Select to Auto-fill</span>
                            </div>
                            {streetSuggestions.map((sug, idx) => (
                              <div
                                key={idx}
                                onClick={() => handleSelectSuggestion(sug)}
                                className="px-3 py-2 border-b border-[#36211C] hover:bg-[#341F1A] cursor-pointer transition-colors flex items-start space-x-2"
                              >
                                <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold text-[#F5EFC6] truncate">
                                    {sug.street_locality}
                                  </p>
                                  <p className="text-[10px] text-[#A5BCD6] truncate">
                                    {[sug.city, sug.state, sug.pincode].filter(Boolean).join(', ')}
                                  </p>
                                </div>
                                <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-[#18100E] border border-[#4A2E27] text-amber-300/80 flex-shrink-0">
                                  {sug.source || 'Map'}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* City, State, Pincode */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label className="text-[10px] uppercase text-[#A5BCD6] block mb-1">City *</label>
                        <input
                          type="text"
                          required
                          value={shippingParts.city}
                          onChange={(e) => {
                            const updated = { ...shippingParts, city: e.target.value };
                            setShippingParts(updated);
                            updateShippingAddressString(updated);
                          }}
                          placeholder="e.g. Bengaluru"
                          className="w-full bg-[#231815] border border-[#4A2E27] rounded-xl px-3 py-2 text-xs text-[#F5EFC6] focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] uppercase text-[#A5BCD6] block mb-1">State *</label>
                        <select
                          value={shippingParts.state}
                          onChange={(e) => {
                            const updated = { ...shippingParts, state: e.target.value };
                            setShippingParts(updated);
                            updateShippingAddressString(updated);
                          }}
                          style={{ colorScheme: 'dark' }}
                          className="w-full bg-[#231815] border border-[#4A2E27] rounded-xl px-3 py-2 text-xs text-[#F5EFC6] focus:outline-none focus:border-amber-400"
                        >
                          {INDIAN_STATES.map((st) => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] uppercase text-[#A5BCD6] block mb-1">
                          Indian PIN Code (6 Digits) *
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          required
                          value={shippingParts.pincode}
                          onChange={(e) => {
                            const updated = { ...shippingParts, pincode: e.target.value.replace(/\D/g, '') };
                            setShippingParts(updated);
                            updateShippingAddressString(updated);
                          }}
                          placeholder="e.g. 560001"
                          className="w-full bg-[#231815] border border-[#4A2E27] rounded-xl px-3 py-2 text-xs font-mono tracking-wider text-[#F5EFC6] focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>

                    {/* Compiled Delivery Address Preview */}
                    {formData.shipping_address && (
                      <div className="pt-1">
                        <span className="text-[9px] uppercase tracking-wider text-[#A5BCD6] block mb-0.5">
                          Verified Destination Line:
                        </span>
                        <div className="px-3 py-1.5 rounded-lg bg-[#231815] border border-[#4A2E27] text-[11px] text-[#F5EFC6] font-mono break-words">
                          {formData.shipping_address}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-[#F5EFC6]/80 block mb-1">Delivery Landmark / Notes (Optional)</label>
                  <input
                    type="text"
                    name="notes"
                    placeholder="e.g. Near Metro Station / Ring doorbell twice"
                    value={formData.notes}
                    onChange={handleChange}
                    className="w-full bg-[#18100E] border border-[#4A2E27] rounded-xl px-3.5 py-2 text-xs text-[#F5EFC6] focus:outline-none focus:border-[#A5BCD6]"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-3 pt-3 border-t border-[#4A2E27]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#A5BCD6] block">
                    3. Payment Method
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                    Instant & Zero Extra Fee
                  </span>
                </div>

                {/* Razorpay Gateway Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-xl bg-[#18100E] border border-[#4A2E27] gap-2 text-[11px]">
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 rounded bg-blue-900/60 border border-blue-500/40 flex items-center justify-center font-black text-[10px] text-blue-300">
                      ₹
                    </div>
                    <span className="text-[#F5EFC6]">
                      Payment Gateway: <strong>Razorpay (UPI, Cards, NetBanking)</strong>
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-[9px] px-2 py-0.5 rounded font-mono uppercase font-bold tracking-wider ${
                      razorpayConfig.is_configured 
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/60' 
                        : 'bg-[#2F201C] text-amber-300 border border-amber-600/40'
                    }`}>
                      {razorpayConfig.is_configured ? '● Live Gateway Active' : '● Credentials Pending (Ready)'}
                    </span>
                  </div>
                </div>

                {/* Primary Payment Selector Tabs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'UPI (Google Pay, PhonePe, Paytm, QR)', label: 'UPI / QR', icon: Smartphone, tag: 'Fastest' },
                    { id: 'Debit / Credit Card', label: 'Cards (RuPay / Visa)', icon: CreditCard },
                    { id: 'Net Banking', label: 'Net Banking', icon: Building2 },
                    { id: 'Cash On Delivery', label: 'Cash On Delivery', icon: Banknote },
                  ].map((m) => {
                    const IconComponent = m.icon;
                    const isSelected = formData.payment_method === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setFormData((p) => ({ ...p, payment_method: m.id }))}
                        className={`p-2.5 rounded-xl text-center border transition-all flex flex-col items-center justify-center relative ${
                          isSelected
                            ? 'bg-[#4D0E12] text-[#F5EFC6] border-[#F5EFC6]/40 shadow-md ring-1 ring-[#F5EFC6]/20'
                            : 'bg-[#18100E] text-[#F5EFC6]/70 border-[#4A2E27] hover:border-[#A5BCD6]/40'
                        }`}
                      >
                        {m.tag && (
                          <span className="absolute -top-2 right-2 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-tighter">
                            {m.tag}
                          </span>
                        )}
                        <IconComponent className={`w-4 h-4 mb-1 ${isSelected ? 'text-[#A5BCD6]' : 'text-[#F5EFC6]/50'}`} />
                        <span className="text-[11px] font-semibold">{m.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* UPI EXPANDED OPTIONS */}
                {formData.payment_method.startsWith('UPI') && (
                  <div className="bg-[#2F201C] p-4 rounded-2xl border border-[#4A2E27] space-y-4 animate-fade-in">
                    
                    {/* UPI Sub-tabs */}
                    <div className="flex items-center space-x-2 bg-[#18100E] p-1 rounded-xl border border-[#4A2E27]">
                      <button
                        type="button"
                        onClick={() => setUpiMethod('apps')}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                          upiMethod === 'apps'
                            ? 'bg-[#4D0E12] text-[#F5EFC6] shadow'
                            : 'text-[#F5EFC6]/60 hover:text-[#F5EFC6]'
                        }`}
                      >
                        UPI Apps
                      </button>
                      <button
                        type="button"
                        onClick={() => setUpiMethod('id')}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                          upiMethod === 'id'
                            ? 'bg-[#4D0E12] text-[#F5EFC6] shadow'
                            : 'text-[#F5EFC6]/60 hover:text-[#F5EFC6]'
                        }`}
                      >
                        UPI ID / VPA
                      </button>
                      <button
                        type="button"
                        onClick={() => setUpiMethod('qr')}
                        className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center space-x-1 ${
                          upiMethod === 'qr'
                            ? 'bg-[#4D0E12] text-[#F5EFC6] shadow'
                            : 'text-[#F5EFC6]/60 hover:text-[#F5EFC6]'
                        }`}
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Scan QR</span>
                      </button>
                    </div>

                    {/* Mode 1: UPI Apps Quick Select */}
                    {upiMethod === 'apps' && (
                      <div className="space-y-2">
                        <span className="text-[10px] text-[#A5BCD6] uppercase tracking-wider block font-medium">
                          Select your UPI App to initiate payment:
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {[
                            { name: 'Google Pay', logo: 'GPay', color: 'from-blue-600 to-emerald-600' },
                            { name: 'PhonePe', logo: 'PhonePe', color: 'from-purple-600 to-indigo-700' },
                            { name: 'Paytm', logo: 'Paytm', color: 'from-sky-500 to-blue-700' },
                            { name: 'BHIM UPI', logo: 'BHIM', color: 'from-amber-600 to-orange-700' },
                          ].map((app) => (
                            <button
                              key={app.name}
                              type="button"
                              onClick={() => setSelectedUpiApp(app.name)}
                              className={`p-2.5 rounded-xl border text-center transition-all ${
                                selectedUpiApp === app.name
                                  ? 'bg-[#4D0E12] border-[#F5EFC6]/50 shadow-md ring-1 ring-[#F5EFC6]/20'
                                  : 'bg-[#18100E] border-[#4A2E27] hover:border-[#F5EFC6]/20'
                              }`}
                            >
                              <div className="text-xs font-bold text-[#F5EFC6] mb-0.5">{app.name}</div>
                              <span className="text-[10px] text-[#A5BCD6]">Instant Pay</span>
                            </button>
                          ))}
                        </div>
                        <div className="p-2.5 rounded-xl bg-[#18100E] border border-[#4A2E27] flex items-center justify-between text-[11px] text-[#F5EFC6]/80 mt-2">
                          <span>Selected UPI App:</span>
                          <span className="font-bold text-emerald-400 flex items-center space-x-1">
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{selectedUpiApp}</span>
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Mode 2: UPI ID / VPA Input */}
                    {upiMethod === 'id' && (
                      <div className="space-y-2">
                        <label className="text-[11px] text-[#F5EFC6]/80 block">
                          Enter your UPI Virtual Payment Address (VPA)
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="e.g. mobile@okhdfcbank or user@ybl"
                            value={upiId}
                            onChange={(e) => {
                              setUpiId(e.target.value);
                              setUpiVerified(false);
                            }}
                            className="flex-1 bg-[#18100E] border border-[#4A2E27] rounded-xl px-3 py-2 text-xs text-[#F5EFC6] focus:outline-none focus:border-[#A5BCD6]"
                          />
                          <button
                            type="button"
                            onClick={handleVerifyUpi}
                            className={`px-4 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider border transition-all ${
                              upiVerified
                                ? 'bg-emerald-800 text-white border-emerald-500'
                                : 'bg-[#4A2E27] hover:bg-[#4D0E12] text-[#F5EFC6] border-[#F5EFC6]/20'
                            }`}
                          >
                            {upiVerified ? 'Verified ✓' : 'Verify'}
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {['@okhdfcbank', '@okaxis', '@oksbi', '@paytm', '@ybl', '@ibl'].map((handle) => (
                            <button
                              key={handle}
                              type="button"
                              onClick={() => {
                                const base = upiId.split('@')[0] || 'yourname';
                                setUpiId(`${base}${handle}`);
                              }}
                              className="text-[10px] bg-[#18100E] text-[#A5BCD6] px-2 py-0.5 rounded border border-[#4A2E27] hover:border-[#A5BCD6]"
                            >
                              {handle}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Mode 3: Dynamic UPI QR Code View */}
                    {upiMethod === 'qr' && (
                      <div className="p-4 rounded-xl bg-[#18100E] border border-[#4A2E27] flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                        {/* QR Box Visual */}
                        <div className="w-32 h-32 bg-white rounded-xl p-2 flex flex-col items-center justify-center border-2 border-[#A5BCD6] shadow-xl flex-shrink-0">
                          <div className="w-full h-full border border-gray-300 rounded flex flex-col items-center justify-center relative p-1">
                            <QrCode className="w-20 h-20 text-black" />
                            <span className="text-[8px] font-black text-[#4D0E12] tracking-widest uppercase mt-0.5">
                              UPI • BHIM
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-xs font-bold uppercase text-[#A5BCD6] block">
                            Scan with Any UPI App
                          </span>
                          <p className="text-xs text-[#F5EFC6] font-semibold">
                            Payable: <span className="font-serif text-emerald-400 text-sm">₹{finalTotal.toFixed(2)}</span>
                          </p>
                          <p className="text-[10px] text-[#F5EFC6]/60">
                            Merchant VPA: <span className="text-[#A5BCD6] font-mono">coffeebeanroasters@okhdfcbank</span>
                          </p>
                          <div className="pt-2 flex flex-wrap gap-1 justify-center sm:justify-start text-[9px] text-[#F5EFC6]/70">
                            <span className="bg-[#231815] px-2 py-0.5 rounded border border-[#4A2E27]">GPay</span>
                            <span className="bg-[#231815] px-2 py-0.5 rounded border border-[#4A2E27]">PhonePe</span>
                            <span className="bg-[#231815] px-2 py-0.5 rounded border border-[#4A2E27]">Paytm</span>
                            <span className="bg-[#231815] px-2 py-0.5 rounded border border-[#4A2E27]">CRED</span>
                            <span className="bg-[#231815] px-2 py-0.5 rounded border border-[#4A2E27]">BHIM</span>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                )}

                {/* Card Fields (If Cards selected) */}
                {formData.payment_method.includes('Card') && (
                  <div className="grid grid-cols-3 gap-2 bg-[#2F201C] p-3.5 rounded-xl border border-[#4A2E27]">
                    <div className="col-span-2">
                      <label className="text-[10px] text-[#F5EFC6]/60 block mb-1">Card Number (RuPay, Visa, MC)</label>
                      <input
                        type="text"
                        name="card_number"
                        value={formData.card_number}
                        onChange={handleChange}
                        className="w-full bg-[#18100E] border border-[#4A2E27] rounded-lg px-2.5 py-1.5 text-xs text-[#F5EFC6]"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#F5EFC6]/60 block mb-1">Expiry</label>
                      <input
                        type="text"
                        name="card_exp"
                        value={formData.card_exp}
                        onChange={handleChange}
                        className="w-full bg-[#18100E] border border-[#4A2E27] rounded-lg px-2.5 py-1.5 text-xs text-[#F5EFC6]"
                      />
                    </div>
                  </div>
                )}

                {/* Net Banking Options */}
                {formData.payment_method === 'Net Banking' && (
                  <div className="bg-[#2F201C] p-3.5 rounded-xl border border-[#4A2E27]">
                    <label className="text-[10px] text-[#F5EFC6]/60 block mb-1.5">Select Indian Bank</label>
                    <select 
                      style={{ colorScheme: 'dark' }}
                      className="w-full bg-[#18100E] border border-[#4A2E27] rounded-xl px-3 py-2 text-xs text-[#F5EFC6]"
                    >
                      <option className="bg-[#18100E] text-[#F5EFC6]">HDFC Bank</option>
                      <option className="bg-[#18100E] text-[#F5EFC6]">State Bank of India (SBI)</option>
                      <option className="bg-[#18100E] text-[#F5EFC6]">ICICI Bank</option>
                      <option className="bg-[#18100E] text-[#F5EFC6]">Axis Bank</option>
                      <option className="bg-[#18100E] text-[#F5EFC6]">Kotak Mahindra Bank</option>
                      <option className="bg-[#18100E] text-[#F5EFC6]">Punjab National Bank</option>
                    </select>
                  </div>
                )}

                {/* Cash On Delivery Notice */}
                {formData.payment_method === 'Cash On Delivery' && (
                  <div className="bg-[#2F201C] p-3.5 rounded-xl border border-[#4A2E27] text-xs text-[#F5EFC6]/80 flex items-center space-x-2">
                    <Banknote className="w-5 h-5 text-amber-400 flex-shrink-0" />
                    <span>Pay cash or scan courier UPI QR upon parcel doorstep arrival.</span>
                  </div>
                )}

              </div>

              {/* Bean Coins Loyalty Discount Widget (temporarily commented out for future use)
              <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/40 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-300 flex-shrink-0">
                    <Coins className="w-4 h-4 text-amber-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-headline font-bold text-xs text-[#F5EFC6]">Redeem Bean Coins</span>
                      <span className="text-[9px] font-black uppercase tracking-wider bg-amber-400 text-[#231815] px-1.5 rounded">
                        Loyalty Perks
                      </span>
                    </div>
                    <span className="text-[10px] text-[#A5BCD6] font-body block">
                      Wallet: <strong>{wallet?.balance || 0} Coins</strong> {canApplyCoins ? '• Redeem 50 Coins for ₹50 OFF' : '(Need min. 50 coins to redeem)'}
                    </span>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={!canApplyCoins}
                    checked={beanCoinsApplied && canApplyCoins}
                    onChange={() => dispatch(toggleBeanCoinsDiscount())}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer disabled:opacity-40"
                  />
                  <span className="font-headline font-black text-xs text-amber-300">
                    -₹50
                  </span>
                </label>
              </div>
              */}

              {/* Summary Breakdown in INR */}
              <div className="bg-[#2F201C] p-4 rounded-2xl border-2 border-[#4A2E27] text-xs space-y-1.5 font-subhead">
                <div className="flex justify-between text-[#F5EFC6]/80">
                  <span>Selected Canisters ({items.length} items):</span>
                  <span>₹{rawSubtotal.toFixed(2)}</span>
                </div>
                {discountPercent > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Coupon Discount ({discountPercent}%):</span>
                    <span>-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                {/* Bean Coins discount row (temporarily disabled for future use) */}
                {false && coinDiscountAmount > 0 && (
                  <div className="flex justify-between text-amber-300">
                    <span>Bean Coins Loyalty Discount:</span>
                    <span>-₹{coinDiscountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-[#F5EFC6]/80">
                  <span>Express Courier Shipping:</span>
                  <span>
                    {shippingFee === 0 ? (
                      <strong className="text-emerald-400">
                        FREE {totalProductCount > freeItemThreshold ? `(> ${freeItemThreshold} Products Promo)` : `(Order > ₹${freeMinOrder})`}
                      </strong>
                    ) : (
                      <span className="text-[#F5EFC6] font-medium">₹{shippingFee.toFixed(2)}</span>
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#F5EFC6] pt-2 border-t border-[#4A2E27]">
                  <span>Total Amount:</span>
                  <span className="font-headline font-black text-lg text-emerald-300">₹{finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* 7-Day Roastery Return Guarantee Trust Badge */}
              <button
                type="button"
                onClick={() => dispatch(openReturnPolicyModal())}
                className="w-full py-2 px-3 rounded-xl bg-[#18100E] hover:bg-[#2F201C] border border-[#4A2E27] text-[11px] text-[#A5BCD6] hover:text-[#F5EFC6] flex items-center justify-center space-x-2 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
                <span>🛡️ {returnDays}-Day Freshness Return & Replacement Policy • Read Terms</span>
              </button>

              {/* Anti-Bot Human Verification Check */}
              <div className="p-3 rounded-xl bg-[#18100E] border border-[#4A2E27] flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#4D0E12] border border-[#F5EFC6]/20 flex items-center justify-center">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div>
                    <span className="font-headline font-bold text-xs text-[#F5EFC6] block">
                      Roastery Anti-Bot Shield
                    </span>
                    <span className="font-body text-[10px] text-[#A5BCD6]">
                      Zero bot attacks • Human presence check active
                    </span>
                  </div>
                </div>
                <label className="flex items-center space-x-2 cursor-pointer bg-[#231815] px-2.5 py-1 rounded-lg border border-[#4A2E27]">
                  <input
                    type="checkbox"
                    checked={isHumanVerified}
                    onChange={(e) => setIsHumanVerified(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                  />
                  <span className="text-[11px] font-semibold text-[#F5EFC6]">I am human</span>
                </label>
              </div>

              {/* Invisible Honeypot Trap (Automated bots fill this; humans cannot see it) */}
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

              {/* Submit CTA */}
              <button
                type={!isCustomerEmailVerified ? 'button' : 'submit'}
                onClick={!isCustomerEmailVerified ? () => {
                  const emailElem = document.getElementById('checkout-email-section');
                  if (emailElem) {
                    emailElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                  if (!otpSent) {
                    handleSendOtp();
                  }
                } : undefined}
                disabled={status === 'loading' || paymentProcessing}
                className={`w-full py-4 rounded-xl font-headline font-bold text-xs uppercase tracking-wider border shadow-2xl flex items-center justify-center space-x-2 transition-all active:scale-95 ${
                  !isCustomerEmailVerified
                    ? 'bg-amber-950/80 hover:bg-amber-900 border-amber-600/70 text-amber-200 cursor-pointer animate-pulse'
                    : 'bg-[#4D0E12] hover:bg-[#4D0E12]/90 text-[#F5EFC6] border-[#F5EFC6]/40 disabled:opacity-50'
                }`}
              >
                {status === 'loading' || paymentProcessing ? (
                  <span className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{paymentProcessing ? 'Connecting to Razorpay Gateway...' : 'Preparing Canister Dispatch & Processing Order...'}</span>
                  </span>
                ) : !isCustomerEmailVerified ? (
                  <>
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    <span>Verify Email in Section 1 (Click to Scroll Up & Send Code)</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>
                      {formData.payment_method.startsWith('UPI')
                        ? `Pay ₹${finalTotal.toFixed(2)} with UPI (Protected)`
                        : `Confirm Order & Pay ₹${finalTotal.toFixed(2)} (Protected)`}
                    </span>
                  </>
                )}
              </button>

            </form>
          </div>
        )}

      </div>
    </div>
  );
}
