import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from './store/productsSlice';
import { fetchWishlist } from './store/authSlice';
import { fetchSettings } from './store/settingsSlice';
import { trackPageView } from './services/analytics';
import Navbar from './components/Navbar';
import AnnouncementBar from './components/AnnouncementBar';
import StoryLanding from './components/StoryLanding';
import ShopCatalog from './components/ShopCatalog';
import ProductDetailModal from './components/ProductDetailModal';
import CartDrawer from './components/CartDrawer';
import WishlistDrawer from './components/WishlistDrawer';
import CheckoutModal from './components/CheckoutModal';
import AuthModal from './components/AuthModal';
import AdminDashboard from './components/AdminDashboard';
import MascotWidget from './components/MascotWidget';
import ReturnPolicyModal from './components/ReturnPolicyModal';
import CustomerOrdersModal from './components/CustomerOrdersModal';
import InvoiceModal from './components/InvoiceModal';
import { openCheckout, closeCheckout } from './store/cartSlice';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { isCheckoutOpen } = useSelector((state) => state.cart);

  // Derive current view from current route
  const currentView = location.pathname.startsWith('/admin')
    ? 'admin'
    : (location.pathname === '/shop' || location.pathname === '/store' ? 'shop' : 'story');

  useEffect(() => {
    // Fetch products and store settings on mount
    dispatch(fetchProducts());
    dispatch(fetchSettings());
  }, [dispatch]);

  // Track page views on route navigation
  useEffect(() => {
    if (location.pathname.startsWith('/admin')) {
      trackPageView('/admin', 'The Bean Co. Admin Operations Console');
    } else if (location.pathname === '/shop' || location.pathname === '/store') {
      trackPageView('/shop', 'The Bean Co. Coffee Gummies Catalog');
    } else {
      trackPageView('/', 'The Bean Co. Brand Vision & Story');
    }
  }, [location.pathname]);

  useEffect(() => {
    // If logged in, fetch user wishlist
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, isAuthenticated]);

  const handleExploreShop = () => {
    navigate('/shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (dest) => {
    if (!dest) return;
    if (dest === 'shop' || dest === '/shop' || dest === 'store' || dest === '/store') {
      navigate('/shop');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (dest === 'story' || dest === '/') {
      navigate('/');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (dest === 'admin' || dest === '/admin') {
      navigate('/admin');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate(dest.startsWith('/') ? dest : `/${dest}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#16100E] text-[#F6F2E8] flex flex-col justify-between selection:bg-[#5A1217] selection:text-[#F6F2E8]">
      
      {/* Top Moving / Static Announcement Bar */}
      <AnnouncementBar onNavigate={handleNavigate} />

      {/* Top Navigation */}
      <Navbar currentView={currentView} setCurrentView={handleNavigate} />

      {/* Main Content Area with React Router Routes */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<StoryLanding onExploreShop={handleExploreShop} />} />
          <Route path="/story" element={<Navigate to="/" replace />} />
          <Route path="/shop" element={<ShopCatalog onNavigate={handleNavigate} />} />
          <Route path="/store" element={<Navigate to="/shop" replace />} />
          <Route path="/admin" element={<AdminDashboard onNavigate={handleNavigate} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Product Detail Cupping Modal */}
      <ProductDetailModal />

      {/* Customer Authentication Modal */}
      <AuthModal />

      {/* Customer Saved Wishlist Drawer */}
      <WishlistDrawer />

      {/* Sliding Cart Drawer */}
      <CartDrawer onProceedToCheckout={() => dispatch(openCheckout())} />

      <ErrorBoundary>
        {/* Checkout Modal */}
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => dispatch(closeCheckout())}
          onOrderCompleted={(order) => {
            // Success view stays active until customer closes
          }}
        />

        {/* 7-Day Roastery Return Policy Modal */}
        <ReturnPolicyModal />

        {/* Amazon / Flipkart Post-Purchase Portal (Orders, Visual Tracking, Returns, Loyalty Wallet, Addresses) */}
        <CustomerOrdersModal />

        {/* Printable GST Tax Invoice Modal */}
        <InvoiceModal />
      </ErrorBoundary>

      {/* Interactive Mascot Companion Guide */}
      {currentView !== 'admin' && (
        <MascotWidget onExploreShop={handleExploreShop} />
      )}

      {/* Brand Footer */}
      <Footer setCurrentView={handleNavigate} />

    </div>
  );
}
