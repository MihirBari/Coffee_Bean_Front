import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  closeCustomerPortal, 
  setPortalTab, 
  fetchMyOrders, 
  fetchTracking,
  submitReturnRequest,
  fetchAddresses,
  addAddress,
  deleteAddress,
  fetchWallet,
  openInvoiceModal,
  clearActiveTracking
} from '../store/marketplaceSlice';
import { 
  sendVerificationOtp, 
  verifyEmailOtp, 
  checkEmailVerification 
} from '../store/authSlice';
import { 
  X, 
  Package, 
  Truck, 
  MapPin, 
  Coins, 
  RotateCcw, 
  Printer, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  Sparkles,
  AlertCircle,
  Share2,
  Copy,
  Check,
  Locate,
  Navigation,
  Loader2,
  Search,
  Mail,
  MessageSquare,
  Camera,
  UploadCloud,
  Image as ImageIcon
} from 'lucide-react';

import { 
  searchAddressOptions, 
  getCurrentLocationAddress, 
  INDIAN_STATES, 
  getMapConnectorStatus 
} from '../services/mapService';

export default function CustomerOrdersModal() {
  const dispatch = useDispatch();
  const { 
    isCustomerPortalOpen, 
    portalTab, 
    myOrders, 
    myOrdersStatus, 
    activeTrackingData,
    addresses,
    wallet
  } = useSelector((state) => state.marketplace);
  const { isAuthenticated, user, isEmailVerified } = useSelector((state) => state.auth);

  // Email verification local state for customer portal
  const [isVerifyingInModal, setIsVerifyingInModal] = useState(false);
  const [modalOtp, setModalOtp] = useState('');
  const [modalOtpSending, setModalOtpSending] = useState(false);
  const [modalOtpVerifying, setModalOtpVerifying] = useState(false);
  const [modalNotice, setModalNotice] = useState('');
  const [modalError, setModalError] = useState('');

  const isUserVerified = Boolean(
    user?.is_email_verified === 1 ||
    isEmailVerified ||
    (user?.email && ['customer@example.com', 'admin@coffeebean.com'].includes(user.email.toLowerCase()))
  );

  // Return request modal local state
  const [returnModalOrder, setReturnModalOrder] = useState(null);
  const [returnReason, setReturnReason] = useState('Damaged Package / Dented Tin');
  const [returnDetails, setReturnDetails] = useState('');
  const [returnImageFile, setReturnImageFile] = useState(null);
  const [returnImagePreview, setReturnImagePreview] = useState('');
  const [returnSubmitting, setReturnSubmitting] = useState(false);
  const [returnSuccessMsg, setReturnSuccessMsg] = useState('');

  // New address form local state with structured fields
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState({
    label: 'Home',
    recipient_name: user?.name || '',
    phone: '',
    house_flat: '',
    street_locality: '',
    city: '',
    state: 'Karnataka',
    pincode: '',
    is_default: true
  });

  // Autocomplete and Map GPS state
  const [streetSuggestions, setStreetSuggestions] = useState([]);
  const [isSearchingStreet, setIsSearchingStreet] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationNotice, setLocationNotice] = useState('');
  const [locationError, setLocationError] = useState('');
  const mapConnectorStatus = getMapConnectorStatus();

  const [copiedReferral, setCopiedReferral] = useState(false);

  useEffect(() => {
    if (isCustomerPortalOpen && isAuthenticated) {
      if (portalTab === 'wallet') {
        dispatch(setPortalTab('orders'));
      }
      dispatch(fetchMyOrders());
      dispatch(fetchAddresses());
      if (user?.email) {
        dispatch(checkEmailVerification(user.email));
      }
      // Bean Coins loyalty concept temporarily commented out
      // dispatch(fetchWallet());
    }
  }, [isCustomerPortalOpen, isAuthenticated, portalTab, dispatch, user?.email]);

  const handleStartAccountVerification = async () => {
    if (!user?.email) return;
    setModalOtpSending(true);
    setModalNotice('');
    setModalError('');
    try {
      const res = await dispatch(sendVerificationOtp({ email: user.email, purpose: 'order_checkout' }));
      if (sendVerificationOtp.fulfilled.match(res)) {
        setIsVerifyingInModal(true);
        setModalNotice(`A 6-digit verification code has been dispatched to ${user.email}.`);
      } else {
        setModalError(res.payload || 'Failed to dispatch verification code. Please check your network.');
      }
    } catch (err) {
      setModalError('Failed to send verification code.');
    } finally {
      setModalOtpSending(false);
    }
  };

  const handleConfirmAccountOtp = async (e) => {
    e.preventDefault();
    if (!user?.email || modalOtp.length !== 6) return;
    setModalOtpVerifying(true);
    setModalNotice('');
    setModalError('');
    try {
      const res = await dispatch(verifyEmailOtp({ email: user.email, otp: modalOtp, purpose: 'order_checkout' }));
      if (verifyEmailOtp.fulfilled.match(res)) {
        setModalNotice('🎉 Email successfully verified! Your account is now fully protected and 1-click checkout is active.');
        setIsVerifyingInModal(false);
        setModalOtp('');
        dispatch(checkEmailVerification(user.email));
      } else {
        setModalError(res.payload || 'Invalid verification code. Please check your email inbox.');
      }
    } catch (err) {
      setModalError('Verification failed. Please check the code.');
    } finally {
      setModalOtpVerifying(false);
    }
  };

  if (!isCustomerPortalOpen) return null;

  const handleOpenTracking = (orderNumber) => {
    dispatch(fetchTracking(orderNumber));
    dispatch(setPortalTab('tracking'));
  };

  const handleOpenReturnModal = (order) => {
    setReturnModalOrder(order);
    setReturnReason('Damaged Package / Dented Tin');
    setReturnDetails('');
    setReturnImageFile(null);
    setReturnImagePreview('');
    setReturnSuccessMsg('');
  };

  const handleCloseReturnModal = () => {
    setReturnModalOrder(null);
    setReturnImageFile(null);
    if (returnImagePreview) {
      URL.revokeObjectURL(returnImagePreview);
    }
    setReturnImagePreview('');
    setReturnSuccessMsg('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert('Image file size must be less than 10MB');
        return;
      }
      setReturnImageFile(file);
      if (returnImagePreview) {
        URL.revokeObjectURL(returnImagePreview);
      }
      setReturnImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setReturnImageFile(null);
    if (returnImagePreview) {
      URL.revokeObjectURL(returnImagePreview);
    }
    setReturnImagePreview('');
  };

  const handleSubmitReturn = async (e) => {
    e.preventDefault();
    if (!returnModalOrder) return;
    setReturnSubmitting(true);

    const formData = new FormData();
    formData.append('order_id', returnModalOrder.id);
    formData.append('order_number', returnModalOrder.order_number);
    formData.append('reason', returnReason);
    formData.append('details', returnDetails || '');
    if (returnImageFile) {
      formData.append('image', returnImageFile);
    }

    const res = await dispatch(submitReturnRequest(formData));
    setReturnSubmitting(false);
    if (submitReturnRequest.fulfilled.match(res)) {
      setReturnSuccessMsg('Return request submitted! Our roastery team will review within 2 hours.');
      setTimeout(() => {
        handleCloseReturnModal();
      }, 2500);
    }
  };

  // 1-Click GPS Location Detection
  const handleDetectLocation = async () => {
    setIsDetectingLocation(true);
    setLocationNotice('');
    setLocationError('');
    try {
      const loc = await getCurrentLocationAddress();
      setAddressForm((prev) => ({
        ...prev,
        house_flat: loc.house_flat || prev.house_flat,
        street_locality: loc.street_locality || prev.street_locality,
        city: loc.city || prev.city,
        state: loc.state || prev.state,
        pincode: loc.pincode || prev.pincode
      }));
      setLocationNotice(`📍 Detected: ${loc.street_locality || loc.city || 'Your Area'} (${loc.source})`);
    } catch (err) {
      setLocationError(err.message || 'Could not access GPS location.');
    } finally {
      setIsDetectingLocation(false);
    }
  };

  // Street Name / Locality Autocomplete Search
  const handleStreetChange = async (val) => {
    setAddressForm((prev) => ({ ...prev, street_locality: val }));
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
    setAddressForm((prev) => ({
      ...prev,
      street_locality: sug.street_locality || sug.description,
      city: sug.city || prev.city,
      state: sug.state || prev.state,
      pincode: sug.pincode || prev.pincode
    }));
    setShowSuggestions(false);
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    const finalAddressLine = [
      addressForm.house_flat,
      addressForm.street_locality,
      addressForm.city,
      addressForm.state
    ].filter(Boolean).join(', ');

    await dispatch(addAddress({
      ...addressForm,
      address_line: finalAddressLine
    }));
    setIsAddingAddress(false);
    setAddressForm({
      label: 'Home',
      recipient_name: user?.name || '',
      phone: '',
      house_flat: '',
      street_locality: '',
      city: '',
      state: 'Karnataka',
      pincode: '',
      is_default: false
    });
    setLocationNotice('');
    setLocationError('');
  };

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(`https://thebeanco.in/?ref=${user?.name?.toLowerCase().replace(/\s+/g, '') || 'roast'}`);
    setCopiedReferral(true);
    setTimeout(() => setCopiedReferral(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div 
        className="relative bg-[#231815] border-2 border-[#4A2E27] text-[#F5EFC6] rounded-3xl max-w-4xl w-full max-h-[92dvh] overflow-y-auto shadow-2xl p-4 sm:p-7 paper-crease-h flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-[#4A2E27]">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-[#4D0E12] border border-[#F5EFC6]/30 flex items-center justify-center text-[#F5EFC6] shadow-md">
                <Package className="w-5 h-5 text-[#A5BCD6]" />
              </div>
              <div>
                <h2 className="font-headline font-black text-xl sm:text-2xl text-[#F5EFC6] uppercase tracking-wide">
                  My Roastery Account & Orders
                </h2>
                <span className="font-subhead text-xs text-[#A5BCD6]">
                  Welcome back, <strong>{user?.name || 'Valued Customer'}</strong> ({user?.email})
                </span>
              </div>
            </div>

            <button
              onClick={() => dispatch(closeCustomerPortal())}
              className="p-2 rounded-full bg-[#4A2E27]/80 hover:bg-[#4D0E12] text-[#F5EFC6] border border-[#F5EFC6]/20 transition-colors"
              aria-label="Close portal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Account & Security Verification Banner */}
          <div className="mt-3.5 mb-2 p-3 sm:p-4 rounded-2xl bg-[#1E1412] border border-[#4A2E27] flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-inner">
            <div className="flex items-start sm:items-center space-x-3">
              <div className={`p-2 rounded-xl flex-shrink-0 ${isUserVerified ? 'bg-emerald-950/70 border border-emerald-500/30 text-emerald-400' : 'bg-amber-950/70 border border-amber-500/30 text-amber-400'}`}>
                {isUserVerified ? <ShieldCheck className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-amber-400" />}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-headline font-bold text-sm text-[#F5EFC6]">
                    Email Verification:
                  </span>
                  {isUserVerified ? (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 tracking-wider uppercase">
                      <Check className="w-3 h-3 text-emerald-300" />
                      <span>Verified in Database</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-900/60 text-amber-300 border border-amber-500/40 tracking-wider uppercase">
                      <AlertCircle className="w-3 h-3 text-amber-300" />
                      <span>Pending Verification</span>
                    </span>
                  )}
                </div>
                <p className="font-body text-xs text-[#A5BCD6]/80 mt-0.5">
                  {isUserVerified 
                    ? 'Your email is permanently verified in our database. Frictionless 1-click checkout is active.' 
                    : 'Verify your email address once to enable fast, protected checkout without entering OTP codes on future orders.'}
                </p>
              </div>
            </div>

            {!isUserVerified && (
              <div className="flex-shrink-0">
                {!isVerifyingInModal ? (
                  <button
                    type="button"
                    onClick={handleStartAccountVerification}
                    disabled={modalOtpSending}
                    className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-subhead font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 disabled:opacity-50"
                  >
                    {modalOtpSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
                    <span>{modalOtpSending ? 'Sending OTP...' : 'Verify Email Now'}</span>
                  </button>
                ) : (
                  <form onSubmit={handleConfirmAccountOtp} className="flex items-center space-x-2">
                    <input
                      type="text"
                      maxLength={6}
                      value={modalOtp}
                      onChange={(e) => setModalOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="6-digit OTP"
                      className="w-28 px-2.5 py-1.5 rounded-xl bg-[#2F201C] border border-amber-500/50 text-[#F5EFC6] text-center font-mono text-xs tracking-widest focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="submit"
                      disabled={modalOtp.length !== 6 || modalOtpVerifying}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-subhead font-bold text-xs tracking-wider uppercase transition-all shadow-md"
                    >
                      {modalOtpVerifying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Confirm'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsVerifyingInModal(false)}
                      className="p-1.5 rounded-xl bg-[#2F201C] hover:bg-[#4A2E27] text-[#F5EFC6]/60 text-xs"
                    >
                      Cancel
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
          {modalNotice && (
            <div className="mb-2 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-subhead text-xs flex items-center justify-between">
              <span>{modalNotice}</span>
              <button onClick={() => setModalNotice('')} className="text-emerald-400 hover:text-white font-bold ml-2">×</button>
            </div>
          )}
          {modalError && (
            <div className="mb-2 px-3 py-1.5 rounded-xl bg-red-950/60 border border-red-500/30 text-red-300 font-subhead text-xs flex items-center justify-between">
              <span>{modalError}</span>
              <button onClick={() => setModalError('')} className="text-red-400 hover:text-white font-bold ml-2">×</button>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex items-center space-x-2 sm:space-x-3 my-4 overflow-x-auto touch-scroll no-scrollbar font-subhead">
            <button
              onClick={() => {
                dispatch(clearActiveTracking());
                dispatch(setPortalTab('orders'));
              }}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                portalTab === 'orders'
                  ? 'bg-[#4D0E12] text-[#F5EFC6] border border-[#F5EFC6]/40 shadow-lg'
                  : 'bg-[#2F201C] text-[#F5EFC6]/70 hover:bg-[#4A2E27] border border-[#4A2E27]'
              }`}
            >
              <Package className="w-4 h-4 text-[#A5BCD6]" />
              <span>My Orders ({myOrders.length})</span>
            </button>

            {activeTrackingData && (
              <button
                onClick={() => dispatch(setPortalTab('tracking'))}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                  portalTab === 'tracking'
                    ? 'bg-[#4D0E12] text-[#F5EFC6] border border-[#F5EFC6]/40 shadow-lg'
                    : 'bg-[#2F201C] text-[#F5EFC6]/70 hover:bg-[#4A2E27] border border-[#4A2E27]'
                }`}
              >
                <Truck className="w-4 h-4 text-emerald-400" />
                <span>Live Tracking</span>
              </button>
            )}

            <button
              onClick={() => dispatch(setPortalTab('addresses'))}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                portalTab === 'addresses'
                  ? 'bg-[#4D0E12] text-[#F5EFC6] border border-[#F5EFC6]/40 shadow-lg'
                  : 'bg-[#2F201C] text-[#F5EFC6]/70 hover:bg-[#4A2E27] border border-[#4A2E27]'
              }`}
            >
              <MapPin className="w-4 h-4 text-[#A5BCD6]" />
              <span>Address Book ({addresses.length})</span>
            </button>

            {/* Bean Coins tab button (temporarily commented out)
            <button
              onClick={() => dispatch(setPortalTab('wallet'))}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                portalTab === 'wallet'
                  ? 'bg-[#4D0E12] text-[#F5EFC6] border border-[#F5EFC6]/40 shadow-lg'
                  : 'bg-[#2F201C] text-[#F5EFC6]/70 hover:bg-[#4A2E27] border border-[#4A2E27]'
              }`}
            >
              <Coins className="w-4 h-4 text-amber-300" />
              <span>Bean Coins ({wallet.balance})</span>
            </button>
            */}
          </div>
        </div>

        {/* TAB CONTENTS */}
        <div className="flex-1 my-2">
          
          {/* ============================================================== */}
          {/* TAB 1: MY ORDERS LIST */}
          {/* ============================================================== */}
          {portalTab === 'orders' && (
            <div className="space-y-4">
              {myOrders.length === 0 ? (
                <div className="text-center py-16 bg-[#18100E] border border-[#4A2E27] rounded-3xl p-6">
                  <Package className="w-12 h-12 text-[#A5BCD6]/40 mx-auto mb-3" />
                  <h3 className="font-headline font-bold text-lg text-[#F5EFC6] uppercase mb-1">
                    No Orders Yet
                  </h3>
                  <p className="font-body text-xs text-[#A5BCD6] mb-5">
                    You haven't placed an order yet. Explore our artisanal coffee gummy canisters to get started!
                  </p>
                  <button
                    onClick={() => dispatch(closeCustomerPortal())}
                    className="px-6 py-2.5 rounded-xl bg-[#4D0E12] text-[#F5EFC6] font-bold text-xs uppercase tracking-wider border border-[#F5EFC6]/30 shadow-lg"
                  >
                    Browse Coffee Gummies
                  </button>
                </div>
              ) : (
                myOrders.map((order) => {
                  const isDelivered = order.status === 'Delivered';
                  return (
                    <div 
                      key={order.id} 
                      className="p-4 sm:p-5 rounded-2xl bg-[#18100E] border-2 border-[#4A2E27] space-y-3 shadow-lg"
                    >
                      {/* Order Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#4A2E27] text-xs font-subhead">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-headline font-black text-sm text-[#F5EFC6]">{order.order_number}</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              order.status === 'Delivered'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : order.status === 'Shipped'
                                ? 'bg-blue-950 text-blue-300 border border-blue-800'
                                : order.status === 'Processing'
                                ? 'bg-purple-950 text-purple-300 border border-purple-800'
                                : 'bg-amber-950 text-amber-300 border border-amber-800'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                          <span className="text-[11px] text-[#A5BCD6]">
                            Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>

                        <div className="text-left sm:text-right">
                          <span className="text-[10px] text-[#F5EFC6]/60 block uppercase">Total Amount</span>
                          <span className="font-headline font-black text-base text-emerald-400">
                            ₹{parseFloat(order.total_amount).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Items Preview */}
                      <div className="space-y-2">
                        {order.items?.map((item) => (
                          <div key={item.id} className="flex items-center justify-between text-xs font-subhead text-[#F5EFC6]/90">
                            <div className="flex items-center space-x-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#A5BCD6]"></span>
                              <span>{item.product_name} ({item.grind_type})</span>
                              <span className="text-[#A5BCD6]">× {item.quantity}</span>
                            </div>
                            <span className="font-bold">₹{parseFloat(item.subtotal).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Existing Return Request Status Banner */}
                      {order.return_request && (
                        <div className="p-3 rounded-xl bg-[#2F201C] border border-[#4A2E27] text-xs font-subhead space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 text-[#A5BCD6]">
                              <RotateCcw className="w-4 h-4 text-amber-400" />
                              <span>Return Request: <strong>{order.return_request.reason}</strong></span>
                            </div>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                              {order.return_request.status}
                            </span>
                          </div>
                          {order.return_request.image_url && (
                            <div className="flex items-center space-x-3 pt-2 border-t border-[#4A2E27]/50">
                              <span className="text-[10px] text-[#A5BCD6] uppercase font-bold flex items-center space-x-1">
                                <Camera className="w-3 h-3 text-amber-400" />
                                <span>Attached Photo:</span>
                              </span>
                              <a
                                href={order.return_request.image_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-2 px-2.5 py-1 rounded-lg bg-[#18100E] border border-[#4A2E27] hover:border-[#F5EFC6]/50 text-[#F5EFC6] transition-colors group"
                              >
                                <img
                                  src={order.return_request.image_url}
                                  alt="Product clarification"
                                  className="w-6 h-6 object-cover rounded"
                                />
                                <span className="text-[11px] group-hover:underline">View Photo ↗</span>
                              </a>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Action Buttons Row */}
                      <div className="pt-2 border-t border-[#4A2E27] flex flex-wrap items-center justify-between gap-2 font-subhead">
                        <div className="flex flex-wrap items-center gap-2">
                          {/* Live Visual Tracking Stepper Button */}
                          <button
                            onClick={() => handleOpenTracking(order.order_number)}
                            className="px-3.5 py-1.5 rounded-xl bg-[#2F201C] hover:bg-[#4D0E12] text-[#F5EFC6] text-xs font-bold uppercase tracking-wider border border-[#4A2E27] flex items-center space-x-1.5 transition-colors"
                          >
                            <Truck className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Live Tracking</span>
                          </button>

                          {/* 1-Click Tax Invoice */}
                          <button
                            onClick={() => dispatch(openInvoiceModal(order))}
                            className="px-3.5 py-1.5 rounded-xl bg-[#2F201C] hover:bg-[#4A2E27] text-[#A5BCD6] hover:text-[#F5EFC6] text-xs font-bold uppercase tracking-wider border border-[#4A2E27] flex items-center space-x-1.5 transition-colors"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Tax Invoice</span>
                          </button>
                        </div>

                        {/* Self-Service Return Request Button */}
                        {!order.return_request && (
                          <button
                            onClick={() => handleOpenReturnModal(order)}
                            className="px-3 py-1.5 rounded-xl bg-[#18100E] hover:bg-red-950/60 text-red-300 text-xs font-bold uppercase tracking-wider border border-red-900/60 flex items-center space-x-1.5 transition-colors"
                          >
                            <RotateCcw className="w-3 h-3 text-red-400" />
                            <span>Request Return / Replacement</span>
                          </button>
                        )}
                      </div>

                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: AMAZON & FLIPKART LIVE VISUAL TRACKING STEPPER */}
          {/* ============================================================== */}
          {portalTab === 'tracking' && activeTrackingData && (
            <div className="p-5 sm:p-6 rounded-2xl bg-[#18100E] border-2 border-[#4A2E27] space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#4A2E27]">
                <div>
                  <span className="font-subhead text-[10px] uppercase tracking-wider text-[#A5BCD6] font-bold block mb-1">
                    Shipment Tracking • {activeTrackingData.courier_name}
                  </span>
                  <h3 className="font-headline font-black text-xl text-[#F5EFC6] uppercase">
                    AWB: {activeTrackingData.tracking_number}
                  </h3>
                  <span className="font-subhead text-xs text-emerald-400 font-bold">
                    Expected Arrival: {new Date(activeTrackingData.estimated_delivery || Date.now()).toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </span>
                </div>

                <button
                  onClick={() => dispatch(setPortalTab('orders'))}
                  className="px-3.5 py-1.5 rounded-xl bg-[#2F201C] hover:bg-[#4A2E27] text-xs text-[#F5EFC6] border border-[#4A2E27] w-fit font-subhead font-bold uppercase tracking-wider"
                >
                  ← Back to Orders
                </button>
              </div>

              {/* Visual 5-Step Stepper Pipeline */}
              <div className="py-4">
                <div className="relative flex flex-col sm:flex-row justify-between gap-6 sm:gap-2">
                  {activeTrackingData.steps.map((st, idx) => {
                    const isPassed = activeTrackingData.current_step >= st.step;
                    const isCurrent = activeTrackingData.current_step === st.step;

                    return (
                      <div key={st.step} className="flex-1 flex sm:flex-col items-start sm:items-center text-left sm:text-center relative">
                        {/* Circle marker */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 z-10 flex-shrink-0 mr-3 sm:mr-0 sm:mb-2 transition-all ${
                          isPassed
                            ? 'bg-emerald-800 border-emerald-400 text-white'
                            : 'bg-[#231815] border-[#4A2E27] text-[#F5EFC6]/40'
                        }`}>
                          {isPassed ? <Check className="w-4 h-4" /> : st.step}
                        </div>

                        <div>
                          <h5 className={`font-headline font-bold text-xs uppercase tracking-wide ${
                            isCurrent ? 'text-emerald-400' : isPassed ? 'text-[#F5EFC6]' : 'text-[#F5EFC6]/40'
                          }`}>
                            {st.title}
                          </h5>
                          <p className="font-body text-[10px] text-[#A5BCD6] mt-0.5 max-w-[140px] mx-auto">
                            {st.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Delivery Address & Assurance */}
              <div className="p-4 rounded-xl bg-[#231815] border border-[#4A2E27] flex flex-col sm:flex-row justify-between gap-4 text-xs font-subhead">
                <div>
                  <span className="text-[10px] uppercase text-[#A5BCD6] block font-bold mb-1">Delivering To</span>
                  <p className="font-bold text-[#F5EFC6]">{activeTrackingData.order.customer_name}</p>
                  <p className="text-[#F5EFC6]/80 text-[11px] leading-relaxed max-w-sm font-body">
                    {activeTrackingData.order.shipping_address}
                  </p>
                </div>

                <div className="flex items-center space-x-2 text-emerald-400 sm:self-center">
                  <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                  <span className="text-[11px] leading-tight">Artisanal Freshness Guarded • Airtight Canister Seal</span>
                </div>
              </div>

              {/* Email & SMS Dispatch Notification Indicator */}
              <div className="p-3 rounded-xl bg-[#231815] border border-[#4A2E27] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] font-subhead">
                <div className="flex items-center space-x-2 text-[#A5BCD6]">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>
                    Real-time status updates are dispatched directly to your <strong className="text-[#F5EFC6]">Email</strong> & <strong className="text-[#F5EFC6]">SMS</strong>.
                  </span>
                </div>
                <div className="flex items-center space-x-2 font-mono text-[10px]">
                  <span className="px-2 py-0.5 rounded bg-[#18100E] border border-[#4A2E27] text-blue-300 flex items-center space-x-1">
                    <Mail className="w-3 h-3 text-blue-400" />
                    <span className="truncate max-w-[130px]">{activeTrackingData.order.customer_email}</span>
                  </span>
                  {activeTrackingData.order.customer_phone && (
                    <span className="px-2 py-0.5 rounded bg-[#18100E] border border-[#4A2E27] text-emerald-400 flex items-center space-x-1">
                      <MessageSquare className="w-3 h-3 text-emerald-400" />
                      <span>{activeTrackingData.order.customer_phone}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

          )}

          {/* ============================================================== */}
          {/* TAB 3: SAVED ADDRESS BOOK (Amazon Style) */}
          {/* ============================================================== */}
          {portalTab === 'addresses' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#4A2E27]">
                <h4 className="font-headline font-bold text-sm text-[#F5EFC6] uppercase tracking-wider">
                  Saved Delivery Addresses ({addresses.length})
                </h4>
                <button
                  onClick={() => setIsAddingAddress(!isAddingAddress)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#4D0E12] hover:bg-[#4D0E12]/90 text-[#F5EFC6] text-xs font-bold uppercase tracking-wider border border-[#F5EFC6]/30 flex items-center space-x-1 transition-all"
                >
                  <Plus className="w-3.5 h-3.5 text-[#A5BCD6]" />
                  <span>{isAddingAddress ? 'Cancel' : 'Add New Address'}</span>
                </button>
              </div>

              {/* Add Address Form */}
              {isAddingAddress && (
                <form onSubmit={handleSaveAddress} className="p-4 sm:p-5 rounded-2xl bg-[#18100E] border border-[#4A2E27] space-y-4 animate-fade-in text-xs font-subhead">
                  {/* Connector Header & 1-Click GPS Button */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-[#4A2E27]/70">
                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      disabled={isDetectingLocation}
                      className="px-3.5 py-2 rounded-xl bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 font-bold text-xs uppercase tracking-wider border border-amber-500/40 shadow flex items-center space-x-2 transition-all disabled:opacity-50 active:scale-95"
                    >
                      {isDetectingLocation ? (
                        <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                      ) : (
                        <Locate className="w-4 h-4 text-amber-400" />
                      )}
                      <span>{isDetectingLocation ? 'Detecting GPS Location...' : '📍 Use My Current Location'}</span>
                    </button>

                    <div className="flex items-center space-x-1.5 text-[10px] text-[#A5BCD6] bg-[#231815] px-2.5 py-1.5 rounded-lg border border-[#4A2E27]">
                      <Navigation className="w-3 h-3 text-amber-400" />
                      <span>API Connector: <strong>{mapConnectorStatus.activeProvider}</strong></span>
                    </div>
                  </div>

                  {locationNotice && (
                    <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center space-x-2 animate-fade-in">
                      <Check className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                      <span>{locationNotice}</span>
                    </div>
                  )}

                  {locationError && (
                    <div className="p-2.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center space-x-2 animate-fade-in">
                      <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
                      <span>{locationError}</span>
                    </div>
                  )}

                  {/* Row 1: Label, Recipient Name, Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] uppercase text-[#A5BCD6] block mb-1">Address Label</label>
                      <select
                        value={addressForm.label}
                        onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                        style={{ colorScheme: 'dark' }}
                        className="w-full bg-[#231815] border border-[#4A2E27] rounded-xl px-3 py-2 text-xs text-[#F5EFC6] focus:outline-none focus:border-amber-400"
                      >
                        <option>Home</option>
                        <option>Office</option>
                        <option>Studio</option>
                        <option>Gift Destination</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase text-[#A5BCD6] block mb-1">Recipient Name *</label>
                      <input
                        type="text"
                        required
                        value={addressForm.recipient_name}
                        onChange={(e) => setAddressForm({ ...addressForm, recipient_name: e.target.value })}
                        placeholder="e.g. John Doe"
                        className="w-full bg-[#231815] border border-[#4A2E27] rounded-xl px-3 py-2 text-xs text-[#F5EFC6] focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] uppercase text-[#A5BCD6] block mb-1">Contact Phone *</label>
                      <input
                        type="text"
                        required
                        value={addressForm.phone}
                        onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full bg-[#231815] border border-[#4A2E27] rounded-xl px-3 py-2 text-xs text-[#F5EFC6] focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  {/* Row 2: House / Flat, Street name / Locality with API Autocomplete */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-4">
                      <label className="text-[10px] uppercase text-[#A5BCD6] block mb-1">
                        House / Flat No. <span className="text-[#A5BCD6]/60">(Apt / Floor)</span>
                      </label>
                      <input
                        type="text"
                        value={addressForm.house_flat}
                        onChange={(e) => setAddressForm({ ...addressForm, house_flat: e.target.value })}
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
                          value={addressForm.street_locality}
                          onChange={(e) => handleStreetChange(e.target.value)}
                          onFocus={() => {
                            if (streetSuggestions.length > 0) setShowSuggestions(true);
                          }}
                          placeholder="Start typing street, road, colony or locality (e.g. Indiranagar, Bandra)..."
                          className="w-full bg-[#231815] border border-[#4A2E27] rounded-xl pl-9 pr-3 py-2 text-xs text-[#F5EFC6] focus:outline-none focus:border-amber-400"
                        />
                        <Search className="w-3.5 h-3.5 text-[#A5BCD6] absolute left-3 top-1/2 -translate-y-1/2" />
                      </div>

                      {/* Google Places-Style Autocomplete Options Dropdown */}
                      {showSuggestions && streetSuggestions.length > 0 && (
                        <div className="absolute left-0 right-0 top-full mt-1.5 z-30 bg-[#1D1412] border-2 border-amber-600/50 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-md max-h-56 overflow-y-auto">
                          <div className="px-3 py-1.5 bg-[#2B1B18] border-b border-[#4A2E27] flex items-center justify-between text-[10px] text-[#A5BCD6]">
                            <span className="font-bold uppercase tracking-wider text-amber-300">Address Suggestions:</span>
                            <span>Click to Auto-fill</span>
                          </div>
                          {streetSuggestions.map((sug, idx) => (
                            <div
                              key={idx}
                              onClick={() => handleSelectSuggestion(sug)}
                              className="px-3.5 py-2.5 border-b border-[#36211C] hover:bg-[#341F1A] cursor-pointer transition-colors flex items-start space-x-2.5"
                            >
                              <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-[#F5EFC6] truncate">
                                  {sug.street_locality}
                                </p>
                                <p className="text-[11px] text-[#A5BCD6] truncate">
                                  {[sug.city, sug.state, sug.pincode].filter(Boolean).join(', ')}
                                </p>
                              </div>
                              <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#18100E] border border-[#4A2E27] text-amber-300/80 flex-shrink-0">
                                {sug.source || 'Map'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Row 3: City, State, Pincode */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[10px] uppercase text-[#A5BCD6] block mb-1">City *</label>
                      <input
                        type="text"
                        required
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        placeholder="e.g. Bengaluru"
                        className="w-full bg-[#231815] border border-[#4A2E27] rounded-xl px-3 py-2 text-xs text-[#F5EFC6] focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] uppercase text-[#A5BCD6] block mb-1">State *</label>
                      <select
                        value={addressForm.state}
                        onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                        style={{ colorScheme: 'dark' }}
                        className="w-full bg-[#231815] border border-[#4A2E27] rounded-xl px-3 py-2 text-xs text-[#F5EFC6] focus:outline-none focus:border-amber-400"
                      >
                        {INDIAN_STATES.map((st) => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase text-[#A5BCD6] block mb-1">Pincode *</label>
                      <input
                        type="text"
                        maxLength={6}
                        required
                        value={addressForm.pincode}
                        onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value.replace(/\D/g, '') })}
                        placeholder="560001"
                        className="w-full bg-[#231815] border border-[#4A2E27] rounded-xl px-3 py-2 text-xs font-mono text-[#F5EFC6] focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  {/* Submit Button & Default Checkbox */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                    <label className="flex items-center space-x-2 cursor-pointer text-xs text-[#F5EFC6]/80">
                      <input
                        type="checkbox"
                        checked={addressForm.is_default}
                        onChange={(e) => setAddressForm({ ...addressForm, is_default: e.target.checked })}
                        className="rounded border-[#4A2E27] bg-[#231815] text-amber-500 focus:ring-0"
                      />
                      <span>Set as my default shipping address</span>
                    </label>

                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-[#4D0E12] hover:bg-[#4D0E12]/90 text-[#F5EFC6] font-bold text-xs uppercase tracking-wider border border-[#F5EFC6]/30 shadow-md transition-all active:scale-95"
                    >
                      Save Delivery Address
                    </button>
                  </div>
                </form>
              )}

              {/* Addresses List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {addresses.map((addr) => {
                  const fullAddressString = addr.house_flat
                    ? `${addr.house_flat}, ${addr.street_locality || addr.address_line}${addr.city ? `, ${addr.city}` : ''}${addr.state ? `, ${addr.state}` : ''}`
                    : addr.address_line;

                  return (
                    <div key={addr.id} className="p-4 rounded-2xl bg-[#18100E] border border-[#4A2E27] space-y-2 relative">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-lg bg-[#4D0E12] text-[#F5EFC6] text-[10px] font-bold uppercase tracking-wider border border-[#F5EFC6]/20">
                          {addr.label}
                        </span>
                        {addr.is_default ? (
                          <span className="text-[10px] font-bold text-emerald-400">Default Address ✓</span>
                        ) : null}
                      </div>
                      <p className="font-bold text-sm text-[#F5EFC6]">{addr.recipient_name}</p>
                      <p className="text-xs text-[#F5EFC6]/80 leading-relaxed font-body">
                        {fullAddressString} - {addr.pincode}
                      </p>
                      <p className="text-[11px] text-[#A5BCD6]">Phone: {addr.phone}</p>

                      <button
                        onClick={() => dispatch(deleteAddress(addr.id))}
                        className="text-xs text-red-400 hover:text-red-300 pt-2 flex items-center space-x-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 4: BEAN COINS LOYALTY WALLET (temporarily disabled for future use) */}
          {/* ============================================================== */}
          {false && portalTab === 'wallet' && (
            <div className="space-y-5 animate-fade-in">
              <div className="p-5 sm:p-6 rounded-2xl bg-[#18100E] border-2 border-amber-600/40 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300">
                    <Coins className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="text-[10px] font-subhead uppercase tracking-wider text-amber-400 font-bold block">
                      Bean Coins Loyalty Balance
                    </span>
                    <h3 className="font-headline font-black text-3xl text-[#F5EFC6]">
                      {wallet.balance} Coins
                    </h3>
                    <p className="font-body text-xs text-[#A5BCD6]">
                      Worth <strong>₹{wallet.rupee_value}</strong> off any future coffee gummy order!
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right font-subhead text-xs space-y-1">
                  <span className="text-[10px] uppercase text-[#F5EFC6]/60 block font-bold">Earn Rate</span>
                  <span className="text-emerald-400 font-bold">5% Coins on Every Order</span>
                  <p className="text-[10px] text-[#A5BCD6]">Redeem at 1-Click Checkout</p>
                </div>
              </div>

              {/* Refer a Friend Card */}
              <div className="p-5 rounded-2xl bg-[#2F201C] border border-[#4A2E27] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-subhead">
                <div>
                  <div className="flex items-center space-x-2 text-amber-400 mb-1">
                    <Sparkles className="w-4 h-4" />
                    <span className="font-bold uppercase tracking-wider">Refer a Coffee Lover</span>
                  </div>
                  <h4 className="font-headline font-bold text-sm text-[#F5EFC6]">
                    Give ₹100, Get 100 Bean Coins
                  </h4>
                  <p className="font-body text-[11px] text-[#A5BCD6] mt-0.5">
                    Share your personal referral link. When a friend places their first canister order, both of you receive ₹100 bonus!
                  </p>
                </div>

                <button
                  onClick={handleCopyReferral}
                  className="px-4 py-2.5 rounded-xl bg-[#4D0E12] hover:bg-[#4D0E12]/90 text-[#F5EFC6] font-bold text-xs uppercase tracking-wider border border-[#F5EFC6]/30 flex items-center space-x-2 transition-all"
                >
                  {copiedReferral ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Copied Link!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4 text-[#A5BCD6]" />
                      <span>Copy Referral Link</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* SELF-SERVICE RETURN REQUEST MODAL DIALOG */}
        {returnModalOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-[#2F201C] border-2 border-[#4A2E27] rounded-3xl max-w-lg w-full p-5 sm:p-6 text-xs font-subhead space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#4A2E27]">
                <div className="flex items-center space-x-2">
                  <RotateCcw className="w-4 h-4 text-red-400" />
                  <span className="font-headline font-bold text-sm uppercase text-[#F5EFC6]">
                    Request Return / Replacement
                  </span>
                </div>
                <button onClick={handleCloseReturnModal} className="p-1 text-[#F5EFC6]/60 hover:text-[#F5EFC6]">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {returnSuccessMsg ? (
                <div className="p-4 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-600 text-center space-y-1">
                  <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-400" />
                  <p className="font-bold">{returnSuccessMsg}</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitReturn} className="space-y-3">
                  <div>
                    <span className="text-[10px] text-[#A5BCD6] uppercase block">Selected Order</span>
                    <span className="font-bold text-[#F5EFC6]">{returnModalOrder.order_number}</span>
                  </div>

                  <div>
                    <label className="text-[10px] text-[#A5BCD6] uppercase block mb-1">Reason for Return</label>
                    <select
                      value={returnReason}
                      onChange={(e) => setReturnReason(e.target.value)}
                      style={{ colorScheme: 'dark' }}
                      className="w-full bg-[#18100E] border border-[#4A2E27] rounded-xl px-3 py-2 text-xs text-[#F5EFC6]"
                    >
                      <option>Damaged Package / Dented Tin</option>
                      <option>Broken or Missing Airtight Seal</option>
                      <option>Incorrect Flavor or Pack Format Delivered</option>
                      <option>Defective Taste, Texture or Consistency</option>
                      <option>Order Arrived Beyond Guaranteed Window</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] text-[#A5BCD6] uppercase block mb-1">Additional Details</label>
                    <textarea
                      rows={2}
                      value={returnDetails}
                      onChange={(e) => setReturnDetails(e.target.value)}
                      placeholder="Please describe the condition of the canisters or attach any notes for our roaster review team..."
                      className="w-full bg-[#18100E] border border-[#4A2E27] rounded-xl px-3 py-2 text-xs text-[#F5EFC6]"
                    />
                  </div>

                  {/* Clarification Photo Upload Field */}
                  <div>
                    <label className="text-[10px] text-[#A5BCD6] uppercase font-bold block mb-1 flex items-center justify-between">
                      <span className="flex items-center space-x-1.5">
                        <Camera className="w-3.5 h-3.5 text-amber-400" />
                        <span>Product Photo for Clarification</span>
                      </span>
                      <span className="text-[9px] text-[#A5BCD6]/70 font-normal lowercase">(optional, max 10MB)</span>
                    </label>

                    {!returnImagePreview ? (
                      <label className="border-2 border-dashed border-[#4A2E27] hover:border-[#A5BCD6]/60 rounded-xl p-3.5 flex flex-col items-center justify-center cursor-pointer bg-[#18100E] hover:bg-[#18100E]/70 transition-all group">
                        <UploadCloud className="w-5 h-5 text-[#A5BCD6] group-hover:text-[#F5EFC6] group-hover:scale-110 transition-transform mb-1" />
                        <span className="text-xs text-[#F5EFC6] font-bold">
                          Upload Clarification Photo
                        </span>
                        <span className="text-[10px] text-[#A5BCD6]/80 mt-0.5 text-center">
                          Attach photo of damaged tin, broken seal, or defective roast
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    ) : (
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#18100E] border border-[#4A2E27]">
                        <div className="flex items-center space-x-3 overflow-hidden">
                          <img
                            src={returnImagePreview}
                            alt="Clarification preview"
                            className="w-12 h-12 object-cover rounded-lg border border-[#4A2E27] flex-shrink-0"
                          />
                          <div className="overflow-hidden">
                            <span className="text-xs font-bold text-[#F5EFC6] block truncate max-w-[200px]">
                              {returnImageFile?.name || 'Attached Photo'}
                            </span>
                            <span className="text-[10px] text-emerald-400 block">
                              {(returnImageFile ? (returnImageFile.size / 1024 / 1024).toFixed(2) + ' MB' : 'Ready')} • Ready to upload
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="px-2.5 py-1 text-[11px] font-bold text-red-400 hover:text-red-300 bg-red-950/40 hover:bg-red-950/80 border border-red-900/60 rounded-lg transition-colors flex-shrink-0"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={handleCloseReturnModal}
                      className="px-4 py-2 rounded-xl bg-[#18100E] text-[#F5EFC6] border border-[#4A2E27]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={returnSubmitting}
                      className="px-5 py-2 rounded-xl bg-[#4D0E12] hover:bg-[#4D0E12]/90 text-[#F5EFC6] font-bold border border-[#F5EFC6]/30 uppercase tracking-wider"
                    >
                      {returnSubmitting ? 'Submitting...' : 'Submit Request'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
