import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toggleCart } from '../store/cartSlice';
import { openAuthModal, logout, toggleWishlistDrawer } from '../store/authSlice';
import { openCustomerPortal, fetchWallet } from '../store/marketplaceSlice';
import BrandLogo from './BrandLogo';
import { 
  ShoppingBag, 
  Heart, 
  User, 
  LogOut, 
  Menu, 
  X, 
  Package, 
  Coins, 
  Truck, 
  ShieldCheck, 
  ChevronDown,
  ArrowRight
} from 'lucide-react';

export default function Navbar({ currentView: propCurrentView, setCurrentView }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const activeView = propCurrentView || (
    location.pathname.startsWith('/admin')
      ? 'admin'
      : (location.pathname === '/' || location.pathname === '/story' ? 'story' : 'shop')
  );

  const goTo = (view) => {
    if (setCurrentView) setCurrentView(view);
    if (view === 'story') {
      navigate('/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (view === 'shop' || view === 'store') {
      navigate('/shop');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (view === 'admin') {
      navigate('/admin');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate(view.startsWith('/') ? view : `/${view}`);
    }
  };

  const cartItems = useSelector((state) => state.cart.items);
  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const { isAuthenticated, user, isAdmin, wishlist } = useSelector((state) => state.auth);
  const { wallet } = useSelector((state) => state.marketplace);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWallet());
    }
  }, [isAuthenticated, dispatch]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
  }, [location.pathname]);

  // ==========================================
  // ADMIN VIEW CONSOLE HEADER
  // ==========================================
  if (activeView === 'admin') {
    return (
      <header className="sticky top-0 z-40 bg-[#140E0C]/95 backdrop-blur-md border-b border-white/[0.08] shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-[#201714] p-1.5 flex items-center justify-center border border-white/[0.1] shadow-sm flex-shrink-0">
                <BrandLogo className="w-full h-full" variant="cream" />
              </div>
              <div>
                <span className="font-semibold text-sm sm:text-base text-[#F6F2E8] tracking-tight block">The Bean Co. • Operations Console</span>
                <span className="text-[10px] text-[#A89B93] uppercase tracking-wider hidden sm:block">Gummy Inventory & Order Telemetry</span>
              </div>
            </div>

            <div className="flex items-center space-x-2.5">
              <button
                onClick={() => goTo('shop')}
                className="px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-medium text-[#F6F2E8] border border-white/[0.08] transition-colors"
              >
                Storefront
              </button>

              <button
                onClick={() => {
                  dispatch(logout());
                  goTo('shop');
                }}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900/80 text-xs font-medium text-red-200 border border-red-800/60 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Exit</span>
              </button>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // ==========================================
  // ELEGANT UNIFIED BRAND & STORE NAVIGATION
  // ==========================================
  const isStory = location.pathname === '/' || location.pathname === '/story';
  const isShop = location.pathname === '/shop' || location.pathname === '/store';

  return (
    <header className="sticky top-0 z-40 bg-[#16100E]/85 backdrop-blur-xl border-b border-white/[0.06] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Left: Brand Identity */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group select-none" 
            onClick={() => goTo(isStory ? 'shop' : 'story')}
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#221815] border border-white/[0.1] flex items-center justify-center p-1.5 shadow-sm group-hover:border-[#D6A56E]/40 transition-all flex-shrink-0">
              <BrandLogo className="w-full h-full" variant="cream" />
            </div>
            <div>
              <span className="font-bold tracking-tight text-base sm:text-lg text-[#F6F2E8] group-hover:text-[#D6A56E] transition-colors block leading-tight">
                The Bean Co.
              </span>
              <span className="text-[10px] text-[#A89B93] tracking-wider uppercase font-medium block leading-none mt-0.5">
                Chew the brew
              </span>
            </div>
          </div>

          {/* Center: Clean Nav Links (Desktop) */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2 bg-white/[0.03] border border-white/[0.06] px-2 py-1.5 rounded-full">
            <button
              onClick={() => goTo('story')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                isStory 
                  ? 'bg-white/[0.12] text-[#F6F2E8] shadow-sm' 
                  : 'text-[#C7BCB3] hover:text-[#F6F2E8] hover:bg-white/[0.05]'
              }`}
            >
              Brand Story
            </button>
            <button
              onClick={() => goTo('shop')}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                isShop 
                  ? 'bg-white/[0.12] text-[#F6F2E8] shadow-sm' 
                  : 'text-[#C7BCB3] hover:text-[#F6F2E8] hover:bg-white/[0.05]'
              }`}
            >
              Shop Gummies
            </button>
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Orders & Tracking Button */}
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  dispatch(openAuthModal({ mode: 'login', reason: 'Sign in to access your orders and live tracking.' }));
                } else {
                  dispatch(openCustomerPortal({ tab: 'orders' }));
                }
              }}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-[#EAE2D9] transition-all flex items-center space-x-1.5"
              title="Track Orders"
              aria-label="Orders"
            >
              <Package className="w-4 h-4 text-[#D6A56E]" />
              <span className="hidden lg:inline text-xs font-medium">Orders</span>
              {/* Bean Coins badge hidden for future release */}
              {/* {isAuthenticated && (wallet?.balance || 0) > 0 && (
                <span className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-950/60 border border-amber-500/30 text-amber-300 text-[10px] font-semibold">
                  <Coins className="w-2.5 h-2.5 text-amber-400" />
                  {wallet.balance}
                </span>
              )} */}
            </button>

            {/* Wishlist Button */}
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  dispatch(openAuthModal({ mode: 'login', reason: 'Sign in to view your saved wishlist.' }));
                } else {
                  dispatch(toggleWishlistDrawer(true));
                }
              }}
              className="relative p-2 sm:p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-[#EAE2D9] transition-all"
              title="Saved Wishlist"
              aria-label="Saved Wishlist"
            >
              <Heart className={`w-4 h-4 ${wishlist.length > 0 ? 'text-red-400 fill-red-400' : 'text-[#EAE2D9]'}`} />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#5A1217] text-[#F6F2E8] font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center border border-white/[0.2]">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Shopping Cart Button */}
            <button
              onClick={() => dispatch(toggleCart())}
              className="relative px-3 py-2 sm:px-4 sm:py-2 rounded-xl bg-[#5A1217] hover:bg-[#6E161C] border border-white/[0.1] text-[#F6F2E8] transition-all flex items-center space-x-1.5 shadow-sm active:scale-95"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-4 h-4 text-[#F6F2E8]" />
              <span className="hidden sm:inline text-xs font-semibold">Cart</span>
              {totalCartCount > 0 && (
                <span className="bg-[#F6F2E8] text-[#18110E] font-bold text-[10px] w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shadow-md">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* User Profile / Auth State */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-1.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-xs font-medium text-[#F6F2E8]"
                >
                  <div className="w-6 h-6 rounded-full bg-[#5A1217] text-[#F6F2E8] flex items-center justify-center text-[10px] font-bold">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <span className="hidden md:inline max-w-[80px] truncate">{user?.name}</span>
                  <ChevronDown className="w-3 h-3 text-white/50" />
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-[#1C1310] border border-white/[0.1] shadow-2xl py-1.5 z-50 text-xs text-[#EAE2D9]">
                    <div className="px-4 py-2.5 border-b border-white/[0.08]">
                      <p className="font-semibold text-sm text-[#F6F2E8] truncate">{user?.name}</p>
                      <p className="text-[11px] text-[#A89B93] truncate">{user?.email}</p>
                      {isAdmin && (
                        <span className="inline-block mt-1 text-[9px] uppercase tracking-wider px-2 py-0.5 rounded bg-[#5A1217] text-[#F6F2E8]">
                          Administrator
                        </span>
                      )}
                    </div>

                    {isAdmin && (
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          goTo('admin');
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-white/[0.06] flex items-center space-x-2 text-[#D6A56E]"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Operations Dashboard</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        dispatch(openCustomerPortal({ tab: 'orders' }));
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-white/[0.06] flex items-center space-x-2"
                    >
                      <Package className="w-4 h-4 text-[#D6A56E]" />
                      <span>My Orders & Tracking</span>
                    </button>

                    {/* Bean Coins Wallet (temporarily hidden for future release)
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        dispatch(openCustomerPortal({ tab: 'wallet' }));
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-white/[0.06] flex items-center justify-between text-amber-300"
                    >
                      <div className="flex items-center space-x-2">
                        <Coins className="w-4 h-4 text-amber-400" />
                        <span>Bean Coins Wallet</span>
                      </div>
                      <span className="text-[10px] font-bold bg-amber-950 px-1.5 py-0.5 rounded border border-amber-500/30">
                        {wallet?.balance || 0}
                      </span>
                    </button>
                    */}

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        dispatch(openCustomerPortal({ tab: 'addresses' }));
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-white/[0.06] flex items-center space-x-2"
                    >
                      <Truck className="w-4 h-4 text-[#D6A56E]" />
                      <span>Delivery Addresses</span>
                    </button>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        dispatch(toggleWishlistDrawer(true));
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-white/[0.06] flex items-center space-x-2 text-red-300"
                    >
                      <Heart className="w-4 h-4 text-red-400" />
                      <span>Saved Wishlist ({wishlist.length})</span>
                    </button>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        dispatch(logout());
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-red-950/40 text-red-300 flex items-center space-x-2 border-t border-white/[0.08]"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => dispatch(openAuthModal({ mode: 'login' }))}
                className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-xs font-medium text-[#F6F2E8] border border-white/[0.08] transition-colors"
              >
                <User className="w-3.5 h-3.5 text-[#D6A56E]" />
                <span>Sign In</span>
              </button>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-[#F6F2E8] transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-[#F6F2E8]" /> : <Menu className="w-5 h-5 text-[#D6A56E]" />}
            </button>

          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/[0.08] py-4 space-y-2 animate-fade-in text-sm font-medium">
            <button
              onClick={() => goTo('story')}
              className={`w-full text-left px-4 py-2.5 rounded-xl flex items-center justify-between ${
                isStory ? 'bg-white/[0.08] text-[#F6F2E8]' : 'hover:bg-white/[0.04] text-[#C7BCB3]'
              }`}
            >
              <span>Brand Story & Vision</span>
              <ArrowRight className="w-4 h-4 opacity-40" />
            </button>

            <button
              onClick={() => goTo('shop')}
              className={`w-full text-left px-4 py-2.5 rounded-xl flex items-center justify-between ${
                isShop ? 'bg-[#5A1217]/60 text-[#F6F2E8]' : 'hover:bg-white/[0.04] text-[#C7BCB3]'
              }`}
            >
              <span>Shop Coffee Gummies</span>
              <ArrowRight className="w-4 h-4 opacity-40" />
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (!isAuthenticated) {
                  dispatch(openAuthModal({ mode: 'login', reason: 'Sign in to access your saved wishlist.' }));
                } else {
                  dispatch(toggleWishlistDrawer(true));
                }
              }}
              className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-white/[0.04] flex items-center justify-between text-[#C7BCB3]"
            >
              <span>Saved Wishlist</span>
              {wishlist.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#5A1217] text-[10px] font-bold text-[#F6F2E8]">
                  {wishlist.length}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (!isAuthenticated) {
                  dispatch(openAuthModal({ mode: 'login', reason: 'Sign in to access your orders and live tracking.' }));
                } else {
                  dispatch(openCustomerPortal({ tab: 'orders' }));
                }
              }}
              className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-white/[0.04] flex items-center justify-between text-[#C7BCB3]"
            >
              <span>Orders & Live Tracking</span>
              {/* Bean Coins badge hidden for future release */}
              {/* {isAuthenticated && (wallet?.balance || 0) > 0 && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-950 border border-amber-500/30 text-amber-300 text-[10px]">
                  <Coins className="w-3 h-3 text-amber-400" />
                  {wallet.balance}
                </span>
              )} */}
            </button>

            {!isAuthenticated ? (
              <div className="pt-2 border-t border-white/[0.08]">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    dispatch(openAuthModal({ mode: 'login' }));
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-center text-xs font-medium text-[#F6F2E8] border border-white/[0.08]"
                >
                  Sign In / Create Account
                </button>
              </div>
            ) : (
              <div className="pt-2 border-t border-white/[0.08] space-y-1">
                <div className="px-4 py-1 text-xs text-[#A89B93]">
                  Signed in as <strong className="text-[#F6F2E8]">{user?.name}</strong>
                </div>

                {isAdmin && (
                  <button
                    onClick={() => goTo('admin')}
                    className="w-full text-left px-4 py-2 rounded-xl hover:bg-white/[0.06] text-amber-300 text-xs"
                  >
                    Operations Console
                  </button>
                )}

                <button
                  onClick={() => dispatch(logout())}
                  className="w-full text-left px-4 py-2 rounded-xl hover:bg-red-950/40 text-red-300 text-xs flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </header>
  );
}
