import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  fetchProducts, 
  addProduct, 
  updateProduct, 
  updateProductStock, 
  removeProductImage, 
  deleteProduct 
} from '../store/productsSlice';
import { 
  fetchOrders, 
  updateOrderStatus, 
  fetchDashboardStats 
} from '../store/orderSlice';
import { fetchSettings, updateStoreSettings } from '../store/settingsSlice';
import { logout } from '../store/authSlice';
import AdminLogin from './AdminLogin';
import AnalyticsTab from './AnalyticsTab';
import StockPlanningTab from './StockPlanningTab';
import PromotionsTab from './PromotionsTab';
import SettingsTab from './SettingsTab';
import ReturnsDeskTab from './ReturnsDeskTab';
import ShippingFulfillmentTab from './ShippingFulfillmentTab';
import CustomerCRMTab from './CustomerCRMTab';
import ReviewsModerationTab from './ReviewsModerationTab';
import SecurityShieldTab from './SecurityShieldTab';
import BrandLogo from './BrandLogo';
import BeanoMascot, { BeanoSeal } from './BeanoMascot';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Image as ImageIcon, 
  ImageOff, 
  Check, 
  X, 
  Eye, 
  RefreshCw, 
  AlertTriangle, 
  IndianRupee, 
  Package, 
  ShoppingBag, 
  Search, 
  CheckCircle2, 
  LogOut,
  ArrowLeft,
  ShieldCheck,
  ShieldAlert,
  BarChart3,
  TrendingUp,
  Megaphone,
  Tag,
  History,
  Truck,
  Archive,
  CheckCheck,
  Sparkles,
  Zap,
  Coffee,
  Compass,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Printer,
  Users,
  Mail,
  MessageSquare,
  Upload
} from 'lucide-react';


export default function AdminDashboard({ onNavigate }) {
  const dispatch = useDispatch();
  const { isAdmin } = useSelector((state) => state.auth);
  const { items: products, status: productStatus } = useSelector((state) => state.products);
  const { orders, dashboardStats, status: orderStatus } = useSelector((state) => state.orders);
  const { settings } = useSelector((state) => state.settings);

  // Tabs: 'products' | 'orders' | 'order-history' | 'shipping' | 'returns' | 'crm' | 'analytics' | 'stock-planning' | 'promotions' | 'settings'
  const [activeTab, setActiveTab] = useState('products');

  // Tabs scroll tracking & navigation
  const tabsNavRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Dynamic Roastery Flavors (no hardcoded defaults - driven by products and custom flavors)
  const DEFAULT_FLAVORS = [];

  // Custom Flavors State (persisted in localStorage + backend store_settings)
  const [customFlavors, setCustomFlavors] = useState(() => {
    try {
      const stored = localStorage.getItem('coffee_bean_custom_flavors');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Could not read custom flavors from localStorage:', e);
    }
    return [];
  });

  const [isAddingFlavor, setIsAddingFlavor] = useState(false);
  const [newFlavorInput, setNewFlavorInput] = useState('');
  const [flavorError, setFlavorError] = useState('');
  const [productFlavorFilter, setProductFlavorFilter] = useState('All');

  const checkTabsScroll = () => {
    if (tabsNavRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsNavRef.current;
      setCanScrollLeft(scrollLeft > 6);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
    }
  };

  useEffect(() => {
    checkTabsScroll();
    const nav = tabsNavRef.current;
    if (nav) {
      nav.addEventListener('scroll', checkTabsScroll, { passive: true });
      window.addEventListener('resize', checkTabsScroll);
      return () => {
        nav.removeEventListener('scroll', checkTabsScroll);
        window.removeEventListener('resize', checkTabsScroll);
      };
    }
  }, [products.length, orders.length]);

  useEffect(() => {
    // When activeTab changes, auto scroll it into view if clipped
    if (tabsNavRef.current) {
      const activeEl = tabsNavRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      }
    }
    checkTabsScroll();
  }, [activeTab]);

  const scrollTabs = (offset) => {
    if (tabsNavRef.current) {
      tabsNavRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // Custom Delete Confirmation Modal State
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    type: 'product', // 'product' | 'image'
    id: null,
    name: '',
    loading: false
  });

  // Product modal state (Add / Edit)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    tagline: '',
    description: '',
    price: '',
    origin: 'India',
    roast_level: 'Medium',
    grind_types: 'Whole Bean, Pour Over, Espresso, French Press',
    flavor_notes: '',
    stock_quantity: 50,
    is_featured: 0,
    image_url: ''
  });
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // Stock edit tracking
  const [editingStockId, setEditingStockId] = useState(null);
  const [tempStockValue, setTempStockValue] = useState('');

  // Order Details Modal state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentOrderFilter, setCurrentOrderFilter] = useState('All');
  const [currentOrderSearch, setCurrentOrderSearch] = useState('');
  const [historyOrderFilter, setHistoryOrderFilter] = useState('All');
  const [historyOrderSearch, setHistoryOrderSearch] = useState('');

  // Notification message
  const [adminNotice, setAdminNotice] = useState(null);

  const showNotice = (msg) => {
    setAdminNotice(msg);
    setTimeout(() => setAdminNotice(null), 3000);
  };

  useEffect(() => {
    dispatch(fetchProducts());
    dispatch(fetchOrders());
    dispatch(fetchDashboardStats());
    dispatch(fetchSettings());
  }, [dispatch]);

  // Synchronize custom flavors from backend store settings if available
  useEffect(() => {
    if (settings?.custom_flavors) {
      try {
        const parsed = typeof settings.custom_flavors === 'string'
          ? JSON.parse(settings.custom_flavors)
          : settings.custom_flavors;
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCustomFlavors((prev) => {
            const seen = new Set(prev.map((f) => (typeof f === 'string' ? f : f.value).toLowerCase()));
            const merged = [...prev];
            parsed.forEach((item) => {
              const val = typeof item === 'string' ? item : item.value;
              if (val && !seen.has(val.toLowerCase())) {
                seen.add(val.toLowerCase());
                merged.push(val);
              }
            });
            return merged;
          });
        }
      } catch (e) {
        console.warn('Error parsing custom_flavors from settings:', e);
      }
    }
  }, [settings?.custom_flavors]);

  // Combined list of all available and dynamically added flavors
  const allAvailableFlavors = React.useMemo(() => {
    const list = [...DEFAULT_FLAVORS];
    const seen = new Set(DEFAULT_FLAVORS.map((f) => f.value.toLowerCase()));

    // Add custom flavors from state / settings
    customFlavors.forEach((cf) => {
      const val = typeof cf === 'string' ? cf : cf.value;
      const lbl = typeof cf === 'string' ? cf : (cf.label || cf.value);
      if (val && !seen.has(val.toLowerCase())) {
        seen.add(val.toLowerCase());
        list.push({ value: val, label: lbl, isCustom: true });
      }
    });

    // Add any unique flavors already present in existing products
    (products || []).forEach((p) => {
      if (p.roast_level && !seen.has(p.roast_level.toLowerCase())) {
        seen.add(p.roast_level.toLowerCase());
        list.push({ value: p.roast_level, label: p.roast_level, isCustom: true });
      }
    });

    return list;
  }, [customFlavors, products]);

  // Handle adding a new flavor dynamically
  const handleAddCustomFlavor = (name) => {
    const trimmed = (name || '').trim();
    if (!trimmed) {
      setFlavorError('Please enter a flavor name (e.g. Hazelnut)');
      return;
    }

    const exists = allAvailableFlavors.some(
      (f) => f.value.toLowerCase() === trimmed.toLowerCase()
    );
    if (exists) {
      setFlavorError(`Flavor "${trimmed}" already exists`);
      setProductForm((prev) => ({ ...prev, roast_level: trimmed }));
      return;
    }

    const updated = [...customFlavors, trimmed];
    setCustomFlavors(updated);
    try {
      localStorage.setItem('coffee_bean_custom_flavors', JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not save to localStorage:', e);
    }

    // Persist to store_settings backend
    if (dispatch) {
      dispatch(updateStoreSettings({ custom_flavors: JSON.stringify(updated) }));
    }

    // Auto-select for the product
    setProductForm((prev) => ({ ...prev, roast_level: trimmed }));
    setNewFlavorInput('');
    setIsAddingFlavor(false);
    setFlavorError('');
    showNotice(`Flavor "${trimmed}" added and selected!`);
  };

  // Handle removing a custom flavor
  const handleRemoveCustomFlavor = (valueToRemove) => {
    const updated = customFlavors.filter(
      (f) => (typeof f === 'string' ? f : f.value).toLowerCase() !== valueToRemove.toLowerCase()
    );
    setCustomFlavors(updated);
    try {
      localStorage.setItem('coffee_bean_custom_flavors', JSON.stringify(updated));
    } catch (e) {
      console.warn('Could not save to localStorage:', e);
    }
    if (dispatch) {
      dispatch(updateStoreSettings({ custom_flavors: JSON.stringify(updated) }));
    }
    if (productForm.roast_level.toLowerCase() === valueToRemove.toLowerCase()) {
      const fallback = allAvailableFlavors.find(f => f.value.toLowerCase() !== valueToRemove.toLowerCase())?.value || 'Medium';
      setProductForm((prev) => ({ ...prev, roast_level: fallback }));
    }
    showNotice(`Custom flavor "${valueToRemove}" removed.`);
  };

  // Open modal for adding
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      tagline: '',
      description: '',
      price: '',
      origin: 'India',
      roast_level: allAvailableFlavors[0]?.value || (products[0]?.roast_level) || 'Medium',
      grind_types: 'Whole Bean, Pour Over, Espresso, French Press',
      flavor_notes: '',
      stock_quantity: 50,
      is_featured: 0,
      image_url: ''
    });
    setSelectedImageFile(null);
    setImagePreview('');
    setIsAddingFlavor(false);
    setNewFlavorInput('');
    setFlavorError('');
    setIsProductModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      tagline: product.tagline || '',
      description: product.description || '',
      price: product.price,
      origin: product.origin || 'India',
      roast_level: product.roast_level || allAvailableFlavors[0]?.value || 'Medium',
      grind_types: product.grind_types || '',
      flavor_notes: product.flavor_notes || '',
      stock_quantity: product.stock_quantity,
      is_featured: product.is_featured ? 1 : 0,
      image_url: product.image_url || ''
    });
    setSelectedImageFile(null);
    setImagePreview(product.image_url || '');
    setIsAddingFlavor(false);
    setNewFlavorInput('');
    setFlavorError('');
    setIsProductModalOpen(true);
  };

  // Handle image file input
  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Handle Save Product (Add or Edit)
  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price) {
      alert('Product name and price are required');
      return;
    }

    const formData = new FormData();
    Object.keys(productForm).forEach((key) => {
      formData.append(key, productForm[key]);
    });

    if (selectedImageFile) {
      formData.append('image', selectedImageFile);
    }

    if (editingProduct) {
      await dispatch(updateProduct({ id: editingProduct.id, data: formData }));
      showNotice(`Updated product "${productForm.name}" successfully!`);
    } else {
      await dispatch(addProduct(formData));
      showNotice(`Created new product "${productForm.name}"!`);
    }

    setIsProductModalOpen(false);
    dispatch(fetchDashboardStats());
  };

  // Handle Quick Stock change
  const handleQuickStock = async (product, delta) => {
    const newQty = Math.max(0, product.stock_quantity + delta);
    await dispatch(updateProductStock({ id: product.id, stock_quantity: newQty }));
    showNotice(`Updated stock for "${product.name}" to ${newQty}`);
    dispatch(fetchDashboardStats());
  };

  const handleStockDirectSave = async (productId) => {
    const qty = parseInt(tempStockValue, 10);
    if (!isNaN(qty) && qty >= 0) {
      await dispatch(updateProductStock({ id: productId, stock_quantity: qty }));
      showNotice(`Stock updated to ${qty}`);
      dispatch(fetchDashboardStats());
    }
    setEditingStockId(null);
  };

  // Handle remove image - opens custom confirmation modal
  const handleRemoveImage = (productId, productName) => {
    setDeleteModal({
      isOpen: true,
      type: 'image',
      id: productId,
      name: productName,
      loading: false
    });
  };

  // Handle delete product - opens custom confirmation modal
  const handleDeleteProduct = (productId, productName) => {
    setDeleteModal({
      isOpen: true,
      type: 'product',
      id: productId,
      name: productName,
      loading: false
    });
  };

  // Execute deletion upon modal confirmation
  const handleConfirmDelete = async () => {
    if (!deleteModal.id) return;
    const { type, id, name } = deleteModal;
    setDeleteModal((prev) => ({ ...prev, loading: true }));

    try {
      if (type === 'product') {
        await dispatch(deleteProduct(id));
        showNotice(`Product "${name}" deleted successfully.`);
        dispatch(fetchDashboardStats());
      } else if (type === 'image') {
        await dispatch(removeProductImage(id));
        showNotice(`Artwork image removed for "${name}".`);
        dispatch(fetchDashboardStats());
      }
    } catch (err) {
      console.error('Deletion error:', err);
      showNotice('Failed to complete deletion. Please try again.');
    } finally {
      setDeleteModal({
        isOpen: false,
        type: 'product',
        id: null,
        name: '',
        loading: false
      });
    }
  };

  // Handle Order Status change with Email & SMS notification confirmations
  const handleStatusChange = async (orderId, newStatus) => {
    await dispatch(updateOrderStatus({ id: orderId, status: newStatus }));
    if (newStatus === 'Delivered') {
      showNotice(`Order #${orderId} marked as Delivered! 📧 Mail & 📱 SMS alert dispatched.`);
    } else if (newStatus === 'Shipped') {
      showNotice(`Order #${orderId} marked as Shipped! 📧 Mail & 📱 SMS tracking dispatched.`);
    } else if (newStatus === 'Processing') {
      showNotice(`Order #${orderId} set to Processing! 📧 Mail & 📱 SMS roastery alert dispatched.`);
    } else {
      showNotice(`Order #${orderId} status changed to ${newStatus}`);
    }
    dispatch(fetchDashboardStats());
  };


  // Separate active/current orders from delivered/past orders in history
  const currentOrders = orders.filter((order) => order.status !== 'Delivered' && order.status !== 'Cancelled');
  const historyOrders = orders.filter((order) => order.status === 'Delivered' || order.status === 'Cancelled');

  // Filter current active orders
  const filteredCurrentOrders = currentOrders.filter((order) => {
    if (currentOrderFilter !== 'All' && order.status !== currentOrderFilter) return false;
    if (currentOrderSearch) {
      const q = currentOrderSearch.toLowerCase();
      const match = 
        order.order_number?.toLowerCase().includes(q) ||
        order.customer_name?.toLowerCase().includes(q) ||
        order.customer_email?.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Filter archived order history
  const filteredHistoryOrders = historyOrders.filter((order) => {
    if (historyOrderFilter !== 'All' && order.status !== historyOrderFilter) return false;
    if (historyOrderSearch) {
      const q = historyOrderSearch.toLowerCase();
      const match = 
        order.order_number?.toLowerCase().includes(q) ||
        order.customer_name?.toLowerCase().includes(q) ||
        order.customer_email?.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const historyDeliveredCount = historyOrders.filter(o => o.status === 'Delivered').length;
  const historyDeliveredRevenue = historyOrders
    .filter(o => o.status === 'Delivered')
    .reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);

  const stats = dashboardStats || {};
  const productStats = stats.products || {};
  const orderStatsSummary = stats.orders || {};

  const getFlavorBadgeStyle = (flavor) => {
    switch (flavor) {
      case 'Classic':
        return 'bg-[#4A2E27] text-[#F5EFC6] border-[#A5BCD6]/40';
      case 'Vanilla':
        return 'bg-[#A5BCD6] text-[#231815] border-[#F5EFC6]/40 font-bold';
      case 'Latte':
        return 'bg-[#F5EFC6] text-[#231815] border-[#4A2E27]/40 font-bold';
      case 'Variety Pack':
        return 'bg-[#4D0E12] text-[#F5EFC6] border-[#F5EFC6]/40';
      default:
        return 'bg-amber-950/70 text-amber-200 border-amber-600/50 font-bold';
    }
  };

  // Filter products by selected flavor profile
  const displayedProducts = products.filter((product) => {
    if (productFlavorFilter !== 'All' && product.roast_level !== productFlavorFilter) {
      return false;
    }
    return true;
  });

  // If user is not authorized as Admin, show the secure Admin Login screen!
  if (!isAdmin) {
    return <AdminLogin onBackToStore={() => onNavigate && onNavigate('shop')} />;
  }

  return (
    <div className="relative bg-[#231815] text-[#F5EFC6] min-h-screen py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto selection:bg-[#4D0E12] selection:text-[#F5EFC6]">
      {/* Subtle Dot Grid Paper Texture */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#F5EFC6_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

      {/* Admin Notice Toast */}
      {adminNotice && (
        <div className="fixed top-24 right-6 z-50 bg-[#4D0E12] text-[#F5EFC6] px-5 py-3 rounded-2xl border border-[#F5EFC6]/40 shadow-2xl flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-subhead font-bold">{adminNotice}</span>
        </div>
      )}

      {/* Admin Top Header Bar matching 1st Page Theme */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-6 border-b-2 border-[#4A2E27] paper-crease-h">
        <div className="flex items-center space-x-4">
          {/* Brand Logo & Seal */}
          <div className="w-14 h-18 rounded-2xl bg-[#18100E] border-2 border-[#A5BCD6]/40 p-2.5 shadow-xl flex items-center justify-center backdrop-blur-md flex-shrink-0">
            <BrandLogo className="w-full h-full" variant="cream" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="text-[10px] font-subhead font-bold uppercase tracking-widest text-[#F5EFC6] bg-[#4D0E12] px-3 py-1 rounded-full border border-[#F5EFC6]/30 shadow-sm flex items-center space-x-1.5">
                <Sparkles className="w-3 h-3 text-[#A5BCD6]" />
                <span>The Bean Co. • Operations Console</span>
              </span>
              <span className="text-[10px] font-subhead text-emerald-300 flex items-center space-x-1.5 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Live Telemetry Active</span>
              </span>
            </div>
            
            <h1 className="font-headline font-black text-2xl sm:text-3xl text-[#F5EFC6] uppercase tracking-tight leading-tight">
              CHEW THE <span className="text-[#A5BCD6]">BREW</span> • OPERATIONS DASHBOARD
            </h1>
            <p className="font-body text-xs text-[#F5EFC6]/75 mt-0.5">
              Plant-based coffee gummy batch inventory, automated order dispatch, and customer telemetry.
            </p>
          </div>
        </div>

        {/* Action Buttons: Return to store, Refresh, Logout */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 font-subhead">
          <button
            onClick={() => onNavigate && onNavigate('shop')}
            className="flex items-center space-x-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-[#2F201C] hover:bg-[#4A2E27] text-[#F5EFC6] text-xs font-bold uppercase tracking-wider border border-[#4A2E27] transition-all shadow-md active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#A5BCD6]" />
            <span>Storefront</span>
          </button>

          <button
            onClick={() => {
              dispatch(fetchProducts());
              dispatch(fetchOrders());
              dispatch(fetchDashboardStats());
              showNotice('Inventory telemetry synchronized!');
            }}
            className="flex items-center space-x-2 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl bg-[#2F201C] hover:bg-[#4A2E27] text-[#A5BCD6] text-xs font-bold uppercase tracking-wider border border-[#4A2E27] transition-all shadow-md"
            title="Refresh database"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Sync</span>
          </button>

          <button
            onClick={() => {
              dispatch(logout());
              if (onNavigate) onNavigate('shop');
            }}
            className="flex items-center space-x-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-red-950/80 hover:bg-red-900 text-xs font-bold uppercase tracking-wider text-red-200 border border-red-800 transition-all shadow-md active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Exit Admin</span>
          </button>
        </div>
      </div>

      {/* OVERVIEW KPI METRIC CARDS */}
      <div className="relative z-10 grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        
        {/* Total Sales */}
        <div className="p-4 sm:p-5 rounded-3xl bg-[#2F201C] border-2 border-[#4A2E27] shadow-xl relative overflow-hidden paper-crease-h">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-subhead uppercase tracking-wider text-[#A5BCD6] font-bold">Total Revenue</span>
            <div className="w-8 h-8 rounded-xl bg-[#4D0E12] border border-[#F5EFC6]/20 flex items-center justify-center text-[#F5EFC6] shadow-sm">
              <IndianRupee className="w-4 h-4 text-[#F5EFC6]" />
            </div>
          </div>
          <p className="font-headline font-black text-2xl sm:text-3xl text-emerald-400">
            ₹{parseFloat(orderStatsSummary.total_revenue || 0).toFixed(2)}
          </p>
          <span className="text-[10px] font-body text-[#F5EFC6]/60">From completed checkout orders</span>
        </div>

        {/* Total Orders */}
        <div className="p-4 sm:p-5 rounded-3xl bg-[#2F201C] border-2 border-[#4A2E27] shadow-xl relative overflow-hidden paper-crease-h">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-subhead uppercase tracking-wider text-[#A5BCD6] font-bold">Orders Pipeline</span>
            <div className="w-8 h-8 rounded-xl bg-[#A5BCD6] flex items-center justify-center text-[#231815] shadow-sm">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="font-headline font-black text-2xl sm:text-3xl text-[#F5EFC6]">
            {orders.length}
          </p>
          <span className="text-[10px] font-body text-[#F5EFC6]/60">
            {currentOrders.length} Active • {historyOrders.length} History
          </span>
        </div>

        {/* Active Products */}
        <div className="p-4 sm:p-5 rounded-3xl bg-[#2F201C] border-2 border-[#4A2E27] shadow-xl relative overflow-hidden paper-crease-h">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-subhead uppercase tracking-wider text-[#A5BCD6] font-bold">Coffee Gummies</span>
            <div className="w-8 h-8 rounded-xl bg-[#4A2E27] border border-[#A5BCD6]/30 flex items-center justify-center text-[#F5EFC6] shadow-sm">
              <Package className="w-4 h-4 text-[#A5BCD6]" />
            </div>
          </div>
          <p className="font-headline font-black text-2xl sm:text-3xl text-[#F5EFC6]">
            {productStats.total_products || products.length}
          </p>
          <span className="text-[10px] font-body text-[#F5EFC6]/60">
            {productStats.total_inventory_units || 0} Total Canisters in Stock
          </span>
        </div>

        {/* Low Stock Alerts */}
        <div className="p-4 sm:p-5 rounded-3xl bg-[#2F201C] border-2 border-[#4A2E27] shadow-xl relative overflow-hidden paper-crease-h">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-subhead uppercase tracking-wider text-amber-300 font-bold">Low Stock Alert</span>
            <div className="w-8 h-8 rounded-xl bg-amber-950 border border-amber-700 flex items-center justify-center text-amber-400 shadow-sm">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="font-headline font-black text-2xl sm:text-3xl text-amber-300">
            {productStats.low_stock || 0} Flavors
          </p>
          <span className="text-[10px] font-body text-[#F5EFC6]/60">Canister inventory below 10 units</span>
        </div>

      </div>

      {/* TABS SWITCHER: PRODUCTS, ORDERS, ANALYTICS & STOCK PLANNING */}
      <div className="relative z-10 mb-6">
        {/* Left Scroll Chevron Button */}
        {canScrollLeft && (
          <button
            onClick={() => scrollTabs(-280)}
            type="button"
            aria-label="Scroll tabs left"
            className="absolute left-1 top-4 -translate-y-1/2 z-30 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#18100E] border-2 border-[#A5BCD6]/60 text-[#F5EFC6] hover:bg-[#4D0E12] hover:border-[#F5EFC6] hover:scale-110 active:scale-95 flex items-center justify-center shadow-2xl transition-all"
            title="Scroll tabs left"
          >
            <ChevronLeft className="w-4 h-4 text-[#A5BCD6]" />
          </button>
        )}

        {/* Left edge fade gradient */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-4 w-10 bg-gradient-to-r from-[#231815] to-transparent z-20 pointer-events-none rounded-l-xl" />
        )}

        {/* Scrollable Tabs Bar with Visible Branded Scrollbar */}
        <div
          ref={tabsNavRef}
          className="flex items-center space-x-2 sm:space-x-3 border-b-2 border-[#4A2E27] pb-3 overflow-x-auto touch-scroll admin-tabs-scroll font-subhead scroll-smooth px-1"
        >
          <button
            onClick={() => setActiveTab('products')}
            data-active={activeTab === 'products'}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all flex-shrink-0 ${
              activeTab === 'products'
                ? 'bg-[#4D0E12] text-[#F5EFC6] border border-[#F5EFC6]/40 shadow-xl'
                : 'bg-[#2F201C] text-[#F5EFC6]/70 hover:bg-[#4A2E27] hover:text-[#F5EFC6] border border-[#4A2E27]'
            }`}
          >
            <Package className="w-4 h-4 text-[#A5BCD6]" />
            <span>Gummy Inventory ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            data-active={activeTab === 'orders'}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all flex-shrink-0 ${
              activeTab === 'orders'
                ? 'bg-[#4D0E12] text-[#F5EFC6] border border-[#F5EFC6]/40 shadow-xl'
                : 'bg-[#2F201C] text-[#F5EFC6]/70 hover:bg-[#4A2E27] hover:text-[#F5EFC6] border border-[#4A2E27]'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-[#A5BCD6]" />
            <span>Active Orders ({currentOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('order-history')}
            data-active={activeTab === 'order-history'}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all flex-shrink-0 ${
              activeTab === 'order-history'
                ? 'bg-[#4D0E12] text-[#F5EFC6] border border-[#F5EFC6]/40 shadow-xl'
                : 'bg-[#2F201C] text-[#F5EFC6]/70 hover:bg-[#4A2E27] hover:text-[#F5EFC6] border border-[#4A2E27]'
            }`}
          >
            <History className="w-4 h-4 text-emerald-400" />
            <span>Order History ({historyOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('shipping')}
            data-active={activeTab === 'shipping'}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all flex-shrink-0 ${
              activeTab === 'shipping'
                ? 'bg-[#4D0E12] text-[#F5EFC6] border border-[#F5EFC6]/40 shadow-xl'
                : 'bg-[#2F201C] text-[#F5EFC6]/70 hover:bg-[#4A2E27] hover:text-[#F5EFC6] border border-[#4A2E27]'
            }`}
          >
            <Printer className="w-4 h-4 text-sky-400" />
            <span>Shipping & AWB Labels</span>
          </button>

          <button
            onClick={() => setActiveTab('returns')}
            data-active={activeTab === 'returns'}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all flex-shrink-0 ${
              activeTab === 'returns'
                ? 'bg-[#4D0E12] text-[#F5EFC6] border border-[#F5EFC6]/40 shadow-xl'
                : 'bg-[#2F201C] text-[#F5EFC6]/70 hover:bg-[#4A2E27] hover:text-[#F5EFC6] border border-[#4A2E27]'
            }`}
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>Returns & Exchanges</span>
          </button>

          <button
            onClick={() => setActiveTab('crm')}
            data-active={activeTab === 'crm'}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all flex-shrink-0 ${
              activeTab === 'crm'
                ? 'bg-[#4D0E12] text-[#F5EFC6] border border-[#F5EFC6]/40 shadow-xl'
                : 'bg-[#2F201C] text-[#F5EFC6]/70 hover:bg-[#4A2E27] hover:text-[#F5EFC6] border border-[#4A2E27]'
            }`}
          >
            <Users className="w-4 h-4 text-[#F5EFC6]" />
            <span>Customer CRM 360</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            data-active={activeTab === 'reviews'}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all flex-shrink-0 ${
              activeTab === 'reviews'
                ? 'bg-[#4D0E12] text-[#F5EFC6] border border-[#F5EFC6]/40 shadow-xl'
                : 'bg-[#2F201C] text-[#F5EFC6]/70 hover:bg-[#4A2E27] hover:text-[#F5EFC6] border border-[#4A2E27]'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-amber-400" />
            <span>Reviews Moderation</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            data-active={activeTab === 'analytics'}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all flex-shrink-0 ${
              activeTab === 'analytics'
                ? 'bg-[#4D0E12] text-[#F5EFC6] border border-[#F5EFC6]/40 shadow-xl'
                : 'bg-[#2F201C] text-[#F5EFC6]/70 hover:bg-[#4A2E27] hover:text-[#F5EFC6] border border-[#4A2E27]'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-[#A5BCD6]" />
            <span>Traffic & Telemetry</span>
          </button>

          <button
            onClick={() => setActiveTab('stock-planning')}
            data-active={activeTab === 'stock-planning'}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all flex-shrink-0 ${
              activeTab === 'stock-planning'
                ? 'bg-[#4D0E12] text-[#F5EFC6] border border-[#F5EFC6]/40 shadow-xl'
                : 'bg-[#2F201C] text-[#F5EFC6]/70 hover:bg-[#4A2E27] hover:text-[#F5EFC6] border border-[#4A2E27]'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-amber-300" />
            <span>Canister Stock Forecasting</span>
          </button>

          <button
            onClick={() => setActiveTab('promotions')}
            data-active={activeTab === 'promotions'}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all flex-shrink-0 ${
              activeTab === 'promotions'
                ? 'bg-[#4D0E12] text-[#F5EFC6] border border-[#F5EFC6]/40 shadow-xl'
                : 'bg-[#2F201C] text-[#F5EFC6]/70 hover:bg-[#4A2E27] hover:text-[#F5EFC6] border border-[#4A2E27]'
            }`}
          >
            <Megaphone className="w-4 h-4 text-[#A5BCD6]" />
            <span>Coupons & Ticker Banners</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            data-active={activeTab === 'settings'}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all flex-shrink-0 ${
              activeTab === 'settings'
                ? 'bg-[#4D0E12] text-[#F5EFC6] border border-[#F5EFC6]/40 shadow-xl'
                : 'bg-[#2F201C] text-[#F5EFC6]/70 hover:bg-[#4A2E27] hover:text-[#F5EFC6] border border-[#4A2E27]'
            }`}
          >
            <Truck className="w-4 h-4 text-emerald-400" />
            <span>Delivery & Return Policy</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            data-active={activeTab === 'security'}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all flex-shrink-0 ${
              activeTab === 'security'
                ? 'bg-[#4D0E12] text-[#F5EFC6] border border-[#F5EFC6]/40 shadow-xl'
                : 'bg-[#2F201C] text-[#F5EFC6]/70 hover:bg-[#4A2E27] hover:text-[#F5EFC6] border border-[#4A2E27]'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span>Anti-Bot Defense & OTP Shield</span>
          </button>
        </div>

        {/* Right edge fade gradient */}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-4 w-10 bg-gradient-to-l from-[#231815] to-transparent z-20 pointer-events-none rounded-r-xl" />
        )}

        {/* Right Scroll Chevron Button */}
        {canScrollRight && (
          <button
            onClick={() => scrollTabs(280)}
            type="button"
            aria-label="Scroll tabs right"
            className="absolute right-1 top-4 -translate-y-1/2 z-30 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#18100E] border-2 border-[#A5BCD6]/60 text-[#F5EFC6] hover:bg-[#4D0E12] hover:border-[#F5EFC6] hover:scale-110 active:scale-95 flex items-center justify-center shadow-2xl transition-all"
            title="Scroll tabs right"
          >
            <ChevronRight className="w-4 h-4 text-[#A5BCD6]" />
          </button>
        )}
      </div>

      {/* ============================================================== */}
      {/* TAB 1: PRODUCT & STOCK MANAGEMENT */}
      {/* ============================================================== */}
      {activeTab === 'products' && (
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="font-headline font-black text-2xl uppercase tracking-tight text-[#F5EFC6]">Gummy Flavors & Canister Inventory</h2>
              <p className="font-body text-xs text-[#A5BCD6]">Adjust canister stock counts, upload tin artwork, and manage coffee gummy flavors.</p>
            </div>

            <button
              onClick={handleOpenAddModal}
              className="px-5 py-3 rounded-xl bg-[#4D0E12] hover:bg-[#4D0E12]/90 text-[#F5EFC6] font-headline font-black text-xs uppercase tracking-wider border border-[#F5EFC6]/40 shadow-xl flex items-center space-x-2 self-start sm:self-auto transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 text-[#F5EFC6]" />
              <span>Add New Gummy Flavor</span>
            </button>
          </div>

          {/* Flavor Profile Quick Overview & Filter Bar */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 bg-[#18100E] p-3 rounded-2xl border border-[#4A2E27]">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-subhead font-bold uppercase tracking-wider text-[#A5BCD6] mr-1 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Flavor Profiles ({allAvailableFlavors.length}):</span>
              </span>

              <button
                onClick={() => setProductFlavorFilter('All')}
                className={`px-3 py-1 rounded-xl text-xs font-headline font-bold transition-all ${
                  productFlavorFilter === 'All'
                    ? 'bg-[#4D0E12] text-[#F5EFC6] border border-[#F5EFC6]/40 shadow-md'
                    : 'bg-[#2F201C] text-[#F5EFC6]/70 hover:text-[#F5EFC6] border border-[#4A2E27]'
                }`}
              >
                All ({products.length})
              </button>

              {allAvailableFlavors.map((flv) => {
                const count = products.filter((p) => p.roast_level === flv.value).length;
                const isSelected = productFlavorFilter === flv.value;
                return (
                  <button
                    key={flv.value}
                    onClick={() => setProductFlavorFilter(flv.value)}
                    className={`px-3 py-1 rounded-xl text-xs font-headline font-bold transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-amber-500 text-[#231815] font-black border border-amber-300 shadow-md'
                        : flv.isCustom
                        ? 'bg-amber-950/50 text-amber-200 border border-amber-700/60 hover:bg-amber-900/50'
                        : 'bg-[#2F201C] text-[#F5EFC6]/70 hover:text-[#F5EFC6] border border-[#4A2E27]'
                    }`}
                  >
                    <span>{flv.value}</span>
                    {flv.isCustom && (
                      <span className={`text-[8px] uppercase tracking-wider px-1 rounded font-bold ${
                        isSelected ? 'bg-[#231815] text-amber-300' : 'bg-amber-400/20 text-amber-300'
                      }`}>
                        Custom
                      </span>
                    )}
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected ? 'bg-[#231815] text-amber-300' : 'bg-black/40 text-[#A5BCD6]'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => {
                handleOpenAddModal();
                setIsAddingFlavor(true);
              }}
              className="text-xs text-amber-300 hover:text-amber-200 font-bold font-headline flex items-center gap-1 px-3 py-1 bg-amber-950/60 rounded-xl border border-amber-600/40 hover:bg-amber-900/60 transition-all self-end sm:self-auto shadow-sm"
              title="Add a new flavor profile"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              <span>+ Add Flavor</span>
            </button>
          </div>

          <div className="bg-[#2F201C] border-2 border-[#4A2E27] rounded-3xl overflow-hidden shadow-2xl paper-crease-h">
            <div className="overflow-x-auto touch-scroll">
              <table className="w-full text-left text-xs font-body">
                <thead className="bg-[#18100E] text-[#A5BCD6] font-subhead uppercase tracking-wider font-bold border-b-2 border-[#4A2E27]">
                  <tr>
                    <th className="py-4 px-4">Artwork</th>
                    <th className="py-4 px-4">Gummy Flavor & Notes</th>
                    <th className="py-4 px-4">Flavor Profile</th>
                    <th className="py-4 px-4">Canister Price</th>
                    <th className="py-4 px-4 text-center">Batch Stock</th>
                    <th className="py-4 px-4">Status</th>
                    <th className="py-4 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#4A2E27]">
                  {displayedProducts.map((product) => {
                    const isOutOfStock = product.stock_quantity <= 0;
                    const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 10;

                    return (
                      <tr key={product.id} className="hover:bg-[#4A2E27]/20 transition-colors">
                        
                        {/* Image Column */}
                        <td className="py-3 px-4">
                          <div className="relative group/img w-14 h-14 rounded-2xl overflow-hidden bg-[#18100E] border-2 border-[#4A2E27] flex-shrink-0">
                            {product.image_url ? (
                              <>
                                <img
                                  src={product.image_url}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.src = '/assets/brand/packaging-canisters.jpg';
                                  }}
                                />
                                <button
                                  onClick={() => handleRemoveImage(product.id, product.name)}
                                  className="absolute inset-0 bg-red-950/80 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-red-200"
                                  title="Remove image"
                                >
                                  <ImageOff className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-[#F5EFC6]/40 p-1 text-center font-subhead">
                                <ImageIcon className="w-4 h-4 mb-0.5 text-[#A5BCD6]" />
                                <span className="text-[8px] uppercase">No Artwork</span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Product Info */}
                        <td className="py-3 px-4">
                          <p className="font-headline font-bold text-sm text-[#F5EFC6] uppercase">{product.name}</p>
                          <span className="font-body text-[11px] text-[#A5BCD6] block truncate max-w-xs">
                            {product.tagline || product.flavor_notes}
                          </span>
                        </td>

                        {/* Flavor Profile Badge */}
                        <td className="py-3 px-4 font-subhead">
                          <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border shadow-sm ${getFlavorBadgeStyle(product.roast_level)}`}>
                            {product.roast_level}
                          </span>
                        </td>

                        {/* Price */}
                        <td className="py-3 px-4 font-headline font-black text-sm text-[#F5EFC6]">
                          ₹{parseFloat(product.price).toFixed(2)}
                        </td>

                        {/* Interactive Stock Adjuster */}
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => handleQuickStock(product, -1)}
                              className="w-7 h-7 rounded-lg bg-[#231815] hover:bg-[#4D0E12] border border-[#4A2E27] flex items-center justify-center font-bold text-sm text-[#F5EFC6] active:scale-90 transition-transform"
                              title="Decrease stock by 1"
                            >
                              -
                            </button>

                            {editingStockId === product.id ? (
                              <div className="flex items-center space-x-1">
                                <input
                                  type="number"
                                  min="0"
                                  autoFocus
                                  value={tempStockValue}
                                  onChange={(e) => setTempStockValue(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleStockDirectSave(product.id);
                                    if (e.key === 'Escape') setEditingStockId(null);
                                  }}
                                  className="w-16 bg-[#18100E] border border-[#A5BCD6] rounded-lg px-2 py-1 text-center text-xs text-[#F5EFC6]"
                                />
                                <button
                                  onClick={() => handleStockDirectSave(product.id)}
                                  className="p-1 rounded bg-emerald-700 text-white hover:bg-emerald-600"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  setEditingStockId(product.id);
                                  setTempStockValue(product.stock_quantity.toString());
                                }}
                                className="font-mono text-sm font-bold bg-[#231815] px-3 py-1 rounded-lg border border-[#4A2E27] hover:border-[#A5BCD6] min-w-[3rem] text-center"
                                title="Click to manually type stock number"
                              >
                                {product.stock_quantity}
                              </button>
                            )}

                            <button
                              onClick={() => handleQuickStock(product, 1)}
                              className="w-7 h-7 rounded-lg bg-[#231815] hover:bg-[#4D0E12] border border-[#4A2E27] flex items-center justify-center font-bold text-sm text-[#F5EFC6] active:scale-90 transition-transform"
                              title="Increase stock by 1"
                            >
                              +
                            </button>
                          </div>
                        </td>

                        {/* Status Pill */}
                        <td className="py-3 px-4">
                          {isOutOfStock ? (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-red-950 text-red-300 border border-red-800">
                              Out of Stock
                            </span>
                          ) : isLowStock ? (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-amber-950 text-amber-300 border border-amber-800">
                              Low Stock
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                              In Stock
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleOpenEditModal(product)}
                              className="p-1.5 rounded-lg bg-[#4A2E27] hover:bg-[#4D0E12] text-[#F5EFC6] border border-[#F5EFC6]/20 transition-colors"
                              title="Edit product details & image"
                            >
                              <Edit3 className="w-4 h-4 text-[#A5BCD6]" />
                            </button>

                            <button
                              onClick={() => handleDeleteProduct(product.id, product.name)}
                              className="p-1.5 rounded-lg bg-[#231815] hover:bg-red-950 text-red-400 border border-[#4A2E27] hover:border-red-800 transition-colors"
                              title="Delete product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>

                      </tr>
                    );
                  })}

                  {displayedProducts.length === 0 && (
                    <tr>
                      <td colSpan="7" className="py-12 text-center text-xs text-[#A5BCD6]">
                        <p className="font-headline font-bold text-sm text-[#F5EFC6] mb-1">
                          No gummy products found for flavor "{productFlavorFilter}"
                        </p>
                        <p className="text-[11px] text-[#A5BCD6]/80 mb-3">
                          You haven't assigned any products to this flavor profile yet.
                        </p>
                        <button
                          onClick={() => setProductFlavorFilter('All')}
                          className="px-4 py-1.5 rounded-xl bg-[#4A2E27] hover:bg-[#4D0E12] text-[#F5EFC6] text-xs font-headline font-bold transition-colors border border-[#F5EFC6]/20"
                        >
                          Show All Products
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: CURRENT / ACTIVE ORDERS */}
      {/* ============================================================== */}
      {activeTab === 'orders' && (
        <div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-serif text-xl font-bold text-[#F5EFC6]">Current Active Orders</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#4D0E12] text-[#F5EFC6] border border-[#F5EFC6]/30">
                  {currentOrders.length} In Queue
                </span>
              </div>
              <p className="text-xs text-[#A5BCD6] mt-0.5">
                Orders pending fulfillment. When marked <strong className="text-emerald-400">"Delivered"</strong>, orders move directly to <strong className="text-emerald-400">Order History</strong>.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-[#A5BCD6] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={currentOrderSearch}
                  onChange={(e) => setCurrentOrderSearch(e.target.value)}
                  placeholder="Search current order #, customer..."
                  className="bg-[#231815] border border-[#4A2E27] rounded-xl pl-9 pr-3 py-2 text-xs text-[#F5EFC6] focus:outline-none focus:border-[#A5BCD6]"
                />
              </div>

              <select
                value={currentOrderFilter}
                onChange={(e) => setCurrentOrderFilter(e.target.value)}
                style={{ colorScheme: 'dark' }}
                className="bg-[#231815] border border-[#4A2E27] rounded-xl px-3 py-2 text-xs text-[#F5EFC6] focus:outline-none focus:border-[#A5BCD6]"
              >
                <option value="All" className="bg-[#18100E] text-[#F5EFC6]">All Active Statuses</option>
                <option value="Pending" className="bg-[#18100E] text-[#fcd34d]">Pending</option>
                <option value="Processing" className="bg-[#18100E] text-[#d8b4fe]">Processing</option>
                <option value="Shipped" className="bg-[#18100E] text-[#93c5fd]">Shipped</option>
              </select>
            </div>
          </div>

          <div className="bg-[#2F201C] border-2 border-[#4A2E27] rounded-3xl overflow-hidden shadow-2xl paper-crease-h">
            <div className="overflow-x-auto touch-scroll">
              <table className="w-full text-left text-xs font-body">
                <thead className="bg-[#18100E] text-[#A5BCD6] font-subhead uppercase tracking-wider font-bold border-b-2 border-[#4A2E27]">
                  <tr>
                    <th className="py-4 px-4">Order #</th>
                    <th className="py-4 px-4">Customer</th>
                    <th className="py-4 px-4">Canisters</th>
                    <th className="py-4 px-4">Total</th>
                    <th className="py-4 px-4">Order Date</th>
                    <th className="py-4 px-4">Fulfillment Status</th>
                    <th className="py-4 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#4A2E27]">
                  {currentOrders.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-12 px-4">
                        <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                        <h3 className="font-headline font-black text-lg text-[#F5EFC6] uppercase">All Orders Fulfilled!</h3>
                        <p className="font-body text-xs text-[#A5BCD6] mt-1 mb-4">No active orders currently in the queue. All delivered orders are safely archived.</p>
                        <button
                          onClick={() => setActiveTab('order-history')}
                          className="px-5 py-2.5 rounded-xl bg-[#4D0E12] hover:bg-[#4D0E12]/90 text-[#F5EFC6] font-headline font-bold text-xs uppercase tracking-wider border border-[#F5EFC6]/40 inline-flex items-center space-x-2 shadow-xl active:scale-95"
                        >
                          <History className="w-4 h-4 text-emerald-300" />
                          <span>View Order History ({historyOrders.length})</span>
                        </button>
                      </td>
                    </tr>
                  ) : filteredCurrentOrders.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-12 text-[#F5EFC6]/60 font-subhead">
                        No active orders match your search or filter.
                      </td>
                    </tr>
                  ) : (
                    filteredCurrentOrders.map((order) => {
                      const itemCount = order.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;

                      return (
                        <tr key={order.id} className="hover:bg-[#4A2E27]/20 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-headline font-black text-xs text-[#A5BCD6] bg-[#18100E] px-2.5 py-1 rounded-xl border border-[#4A2E27]">
                              {order.order_number}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <p className="font-headline font-bold text-sm text-[#F5EFC6]">{order.customer_name}</p>
                            <span className="font-subhead text-[11px] text-[#A5BCD6]">{order.customer_email}</span>
                          </td>

                          <td className="py-3 px-4">
                            <span className="font-headline font-bold text-[#F5EFC6]">{itemCount} {itemCount === 1 ? 'canister' : 'canisters'}</span>
                            <span className="block text-[10px] font-body text-[#F5EFC6]/70 truncate max-w-[160px]">
                              {order.items?.map(i => i.product_name).join(', ')}
                            </span>
                          </td>

                          <td className="py-3 px-4 font-headline font-black text-sm text-[#F5EFC6]">
                            <div>₹{parseFloat(order.total_amount).toFixed(2)}</div>
                            <span className="block text-[9px] font-mono mt-0.5">
                              {order.payment_status === 'paid' ? (
                                <span className="text-emerald-400 font-bold">● PAID (Razorpay)</span>
                              ) : (
                                <span className="text-amber-300/80">{order.payment_method || 'Pending'}</span>
                              )}
                            </span>
                          </td>

                          <td className="py-3 px-4 font-subhead text-[11px] text-[#F5EFC6]/70">
                            {new Date(order.created_at).toLocaleDateString()} {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex flex-col space-y-1.5 min-w-[140px]">
                              <select
                                value={order.status}
                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                style={{ colorScheme: 'dark' }}
                                className={`rounded-xl px-2.5 py-1.5 text-xs font-headline font-bold focus:outline-none border shadow-sm transition-colors ${
                                  order.status === 'Shipped'
                                    ? 'bg-[#1e293b] text-[#93c5fd] border-[#3b82f6]'
                                    : order.status === 'Processing'
                                    ? 'bg-[#3b0764] text-[#d8b4fe] border-[#9333ea]'
                                    : order.status === 'Cancelled'
                                    ? 'bg-[#450a0a] text-[#fca5a5] border-[#dc2626]'
                                    : 'bg-[#451a03] text-[#fcd34d] border-[#d97706]'
                                }`}
                              >
                                <option value="Pending" className="bg-[#18100E] text-[#fcd34d]">Pending</option>
                                <option value="Processing" className="bg-[#18100E] text-[#d8b4fe]">Processing</option>
                                <option value="Shipped" className="bg-[#18100E] text-[#93c5fd]">Shipped</option>
                                <option value="Delivered" className="bg-[#18100E] text-emerald-300">✓ Delivered (Move to History)</option>
                                <option value="Cancelled" className="bg-[#18100E] text-[#fca5a5]">Cancelled</option>
                              </select>

                              <button
                                onClick={() => handleStatusChange(order.id, 'Delivered')}
                                className="flex items-center justify-center space-x-1 px-2.5 py-1 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 text-[10px] font-subhead font-bold uppercase tracking-wider transition-colors"
                                title="Move immediately to Order History"
                              >
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                <span>Mark Delivered</span>
                              </button>
                            </div>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="px-3.5 py-2 rounded-xl bg-[#4D0E12] hover:bg-[#4D0E12]/90 text-[#F5EFC6] text-xs font-headline font-bold uppercase tracking-wider flex items-center space-x-1.5 ml-auto border border-[#F5EFC6]/30 shadow-md transition-all active:scale-95"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#A5BCD6]" />
                              <span>Details</span>
                            </button>
                          </td>

                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: ORDER HISTORY & ARCHIVE */}
      {/* ============================================================== */}
      {activeTab === 'order-history' && (
        <div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-serif text-xl font-bold text-[#F5EFC6]">Order History & Archives</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                  {historyOrders.length} Archived
                </span>
              </div>
              <p className="text-xs text-[#A5BCD6] mt-0.5">
                Past customer orders that have been successfully delivered and completed.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-[#A5BCD6] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={historyOrderSearch}
                  onChange={(e) => setHistoryOrderSearch(e.target.value)}
                  placeholder="Search past order #, customer..."
                  className="bg-[#231815] border border-[#4A2E27] rounded-xl pl-9 pr-3 py-2 text-xs text-[#F5EFC6] focus:outline-none focus:border-[#A5BCD6]"
                />
              </div>

              <select
                value={historyOrderFilter}
                onChange={(e) => setHistoryOrderFilter(e.target.value)}
                style={{ colorScheme: 'dark' }}
                className="bg-[#231815] border border-[#4A2E27] rounded-xl px-3 py-2 text-xs text-[#F5EFC6] focus:outline-none focus:border-[#A5BCD6]"
              >
                <option value="All" className="bg-[#18100E] text-[#F5EFC6]">All Past Orders</option>
                <option value="Delivered" className="bg-[#18100E] text-emerald-300">Delivered Only</option>
                <option value="Cancelled" className="bg-[#18100E] text-[#fca5a5]">Cancelled Only</option>
              </select>
            </div>
          </div>

          {/* Quick Metrics Bar for History */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <div className="bg-[#2F201C] p-3.5 rounded-xl border border-[#4A2E27] flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#A5BCD6] block">Delivered Orders</span>
                <span className="font-serif text-lg font-bold text-emerald-400">{historyDeliveredCount}</span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-emerald-950 flex items-center justify-center text-emerald-400">
                <CheckCheck className="w-4 h-4" />
              </div>
            </div>

            <div className="bg-[#2F201C] p-3.5 rounded-xl border border-[#4A2E27] flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#A5BCD6] block">Delivered Revenue</span>
                <span className="font-serif text-lg font-bold text-[#F5EFC6]">₹{historyDeliveredRevenue.toFixed(2)}</span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-[#4D0E12] flex items-center justify-center text-[#F5EFC6]">
                <IndianRupee className="w-4 h-4" />
              </div>
            </div>

            <div className="bg-[#2F201C] p-3.5 rounded-xl border border-[#4A2E27] flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#A5BCD6] block">Avg Order Value</span>
                <span className="font-serif text-lg font-bold text-[#A5BCD6]">
                  ₹{historyDeliveredCount > 0 ? (historyDeliveredRevenue / historyDeliveredCount).toFixed(2) : '0.00'}
                </span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-[#18100E] border border-[#4A2E27] flex items-center justify-center text-[#A5BCD6]">
                <Archive className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="bg-[#2F201C] border-2 border-[#4A2E27] rounded-3xl overflow-hidden shadow-2xl paper-crease-h">
            <div className="overflow-x-auto touch-scroll">
              <table className="w-full text-left text-xs font-body">
                <thead className="bg-[#18100E] text-[#A5BCD6] font-subhead uppercase tracking-wider font-bold border-b-2 border-[#4A2E27]">
                  <tr>
                    <th className="py-4 px-4">Order #</th>
                    <th className="py-4 px-4">Customer</th>
                    <th className="py-4 px-4">Canisters Purchased</th>
                    <th className="py-4 px-4">Total Amount</th>
                    <th className="py-4 px-4">Date Placed</th>
                    <th className="py-4 px-4">Archive Status</th>
                    <th className="py-4 px-4 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#4A2E27]">
                  {filteredHistoryOrders.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-12 text-[#F5EFC6]/60 font-subhead">
                        {historyOrders.length === 0 
                          ? 'No past orders in history yet. Mark current orders as "Delivered" to archive them here.' 
                          : 'No archived orders match your search criteria.'}
                      </td>
                    </tr>
                  ) : (
                    filteredHistoryOrders.map((order) => {
                      const itemCount = order.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;

                      return (
                        <tr key={order.id} className="hover:bg-[#4A2E27]/20 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-headline font-black text-xs text-[#A5BCD6] bg-[#18100E] px-2.5 py-1 rounded-xl border border-[#4A2E27]">
                              {order.order_number}
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <p className="font-headline font-bold text-sm text-[#F5EFC6]">{order.customer_name}</p>
                            <span className="font-subhead text-[11px] text-[#A5BCD6]">{order.customer_email}</span>
                          </td>

                          <td className="py-3 px-4">
                            <span className="font-headline font-bold text-[#F5EFC6]">{itemCount} {itemCount === 1 ? 'canister' : 'canisters'}</span>
                            <span className="block text-[10px] font-body text-[#F5EFC6]/70 truncate max-w-[160px]">
                              {order.items?.map(i => i.product_name).join(', ')}
                            </span>
                          </td>

                          <td className="py-3 px-4 font-headline font-black text-sm text-emerald-400">
                            <div>₹{parseFloat(order.total_amount).toFixed(2)}</div>
                            <span className="block text-[9px] font-mono mt-0.5 text-[#A5BCD6]">
                              {order.payment_status === 'paid' ? (
                                <span className="text-emerald-400 font-bold">● PAID (Razorpay)</span>
                              ) : (
                                <span className="text-amber-300/80">{order.payment_method || 'Completed'}</span>
                              )}
                            </span>
                          </td>

                          <td className="py-3 px-4 font-subhead text-[11px] text-[#F5EFC6]/70">
                            {new Date(order.created_at).toLocaleDateString()} {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>

                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-2">
                              <select
                                value={order.status}
                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                style={{ colorScheme: 'dark' }}
                                className={`rounded-xl px-2.5 py-1.5 text-xs font-headline font-bold focus:outline-none border transition-colors ${
                                  order.status === 'Delivered'
                                    ? 'bg-[#064e3b] text-[#6ee7b7] border-[#059669]'
                                    : order.status === 'Shipped'
                                    ? 'bg-[#1e293b] text-[#93c5fd] border-[#3b82f6]'
                                    : order.status === 'Processing'
                                    ? 'bg-[#3b0764] text-[#d8b4fe] border-[#9333ea]'
                                    : order.status === 'Pending'
                                    ? 'bg-[#451a03] text-[#fcd34d] border-[#d97706]'
                                    : 'bg-[#450a0a] text-[#fca5a5] border-[#dc2626]'
                                }`}
                                title="Change status or re-open to current orders"
                              >
                                <option value="Delivered" className="bg-[#18100E] text-emerald-300">✓ Delivered</option>
                                <option value="Shipped" className="bg-[#18100E] text-[#93c5fd]">↩ Reopen (Shipped)</option>
                                <option value="Processing" className="bg-[#18100E] text-[#d8b4fe]">↩ Reopen (Processing)</option>
                                <option value="Pending" className="bg-[#18100E] text-[#fcd34d]">↩ Reopen (Pending)</option>
                                <option value="Cancelled" className="bg-[#18100E] text-[#fca5a5]">Cancelled</option>
                              </select>
                            </div>
                          </td>

                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="px-3.5 py-2 rounded-xl bg-[#4D0E12] hover:bg-[#4D0E12]/90 text-[#F5EFC6] text-xs font-headline font-bold uppercase tracking-wider flex items-center space-x-1.5 ml-auto border border-[#F5EFC6]/30 shadow-md transition-all active:scale-95"
                            >
                              <Eye className="w-3.5 h-3.5 text-[#A5BCD6]" />
                              <span>Details</span>
                            </button>
                          </td>

                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB: SHIPPING & AWB LABELS */}
      {/* ============================================================== */}
      {activeTab === 'shipping' && (
        <ShippingFulfillmentTab />
      )}

      {/* ============================================================== */}
      {/* TAB: RETURNS & EXCHANGES DESK */}
      {/* ============================================================== */}
      {activeTab === 'returns' && (
        <ReturnsDeskTab />
      )}

      {/* ============================================================== */}
      {/* TAB: CUSTOMER CRM 360 & EXPORTS */}
      {/* ============================================================== */}
      {activeTab === 'crm' && (
        <CustomerCRMTab />
      )}

      {/* ============================================================== */}
      {/* TAB: CUSTOMER REVIEWS & COMMENTS MODERATION */}
      {/* ============================================================== */}
      {activeTab === 'reviews' && (
        <ReviewsModerationTab onShowNotice={showNotice} />
      )}

      {/* ============================================================== */}
      {/* TAB 3: ROASTERY TRAFFIC & SALES ANALYTICS */}
      {/* ============================================================== */}
      {activeTab === 'analytics' && (
        <AnalyticsTab onSwitchToStockPlanning={() => setActiveTab('stock-planning')} />
      )}

      {/* ============================================================== */}
      {/* TAB 4: ROASTERY STOCK FORECASTING & PLANNING */}
      {/* ============================================================== */}
      {activeTab === 'stock-planning' && (
        <StockPlanningTab onShowNotice={showNotice} />
      )}

      {/* ============================================================== */}
      {/* TAB 5: COUPONS & SALES ANNOUNCEMENTS */}
      {/* ============================================================== */}
      {activeTab === 'promotions' && (
        <PromotionsTab onShowNotice={showNotice} />
      )}

      {/* ============================================================== */}
      {/* TAB 6: DELIVERY CHARGES & RETURN POLICY SETTINGS */}
      {/* ============================================================== */}
      {activeTab === 'settings' && (
        <SettingsTab showNotice={showNotice} />
      )}

      {/* ============================================================== */}
      {/* TAB 7: ANTI-BOT SECURITY SHIELD & TELEMETRY */}
      {/* ============================================================== */}
      {activeTab === 'security' && (
        <SecurityShieldTab />
      )}

      {/* ============================================================== */}
      {/* MODAL: ADD / EDIT PRODUCT */}
      {/* ============================================================== */}
      {isProductModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto"
          onClick={() => setIsProductModalOpen(false)}
        >
          <div 
            className="relative bg-[#231815] border-2 border-[#4A2E27] text-[#F5EFC6] rounded-3xl max-w-4xl lg:max-w-5xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-6 sm:p-8 md:p-10 paper-crease-h touch-scroll my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsProductModalOpen(false)}
              className="absolute top-5 right-5 sm:top-6 sm:right-6 p-2.5 rounded-full bg-[#18100E] hover:bg-[#4D0E12] text-[#F5EFC6] border border-[#4A2E27] transition-colors shadow-md"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="mb-6 pr-10">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#18100E] border border-[#4A2E27] text-[#A5BCD6] font-subhead text-[11px] uppercase tracking-widest font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  THE BEAN CO. • ROASTERY CATALOG MANAGEMENT
                </span>
                {editingProduct ? (
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-subhead text-[11px] font-bold">
                    Editing SKU #{editingProduct.id}
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-subhead text-[11px] font-bold">
                    ✦ New Roastery Flavor
                  </span>
                )}
              </div>
              <h2 className="font-headline font-black text-2xl sm:text-3xl uppercase tracking-tight text-[#F5EFC6]">
                {editingProduct ? 'Edit Gummy Flavor' : 'Add New Coffee Gummy Flavor'}
              </h2>
              <p className="font-body text-xs sm:text-sm text-[#F5EFC6]/70 mt-1 max-w-3xl leading-relaxed">
                Saved flavor adjustments immediately synchronize across roastery catalog pages, tasting notes, and storefront inventory.
              </p>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-5 sm:space-y-6 text-xs font-subhead">
              
              {/* Row 1: Flavor Title & Tagline */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-7">
                  <label className="text-[#A5BCD6] font-headline font-bold text-xs uppercase tracking-wider block mb-1.5">
                    Flavor Title <span className="text-amber-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    placeholder="e.g. Classic Dark Roast Gummies"
                    className="w-full bg-[#18100E] border border-[#4A2E27] rounded-xl px-4 py-2.5 font-body text-sm text-[#F5EFC6] focus:outline-none focus:border-[#A5BCD6] transition-colors"
                  />
                </div>
                <div className="md:col-span-5">
                  <label className="text-[#A5BCD6] font-headline font-bold text-xs uppercase tracking-wider block mb-1.5">
                    Tagline
                  </label>
                  <input
                    type="text"
                    value={productForm.tagline}
                    onChange={(e) => setProductForm({ ...productForm, tagline: e.target.value })}
                    placeholder="e.g. Deep Roasted Espresso • 50mg Dose"
                    className="w-full bg-[#18100E] border border-[#4A2E27] rounded-xl px-4 py-2.5 font-body text-sm text-[#F5EFC6] focus:outline-none focus:border-[#A5BCD6] transition-colors"
                  />
                </div>
              </div>

              {/* Row 2: Flavor Manifesto & Description */}
              <div>
                <label className="text-[#A5BCD6] font-headline font-bold text-xs uppercase tracking-wider block mb-1.5">
                  Flavor Manifesto & Roastery Notes
                </label>
                <textarea
                  rows="3"
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Describe tasting notes, roast extraction method, natural caffeine dosage, origins..."
                  className="w-full bg-[#18100E] border border-[#4A2E27] rounded-xl px-4 py-2.5 font-body text-sm text-[#F5EFC6] focus:outline-none focus:border-[#A5BCD6] transition-colors leading-relaxed"
                />
              </div>

              {/* Row 3: Pricing, Stock, and Flavor Profile */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-5">
                <div>
                  <label className="text-[#A5BCD6] font-headline font-bold text-xs uppercase tracking-wider block mb-1.5">
                    Canister Price (₹) <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A5BCD6] font-bold text-sm">₹</span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={productForm.price}
                      onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                      placeholder="299.00"
                      className="w-full bg-[#18100E] border border-[#4A2E27] rounded-xl pl-8 pr-4 py-2.5 font-body text-sm text-[#F5EFC6] focus:outline-none focus:border-[#A5BCD6] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[#A5BCD6] font-headline font-bold text-xs uppercase tracking-wider block mb-1.5">
                    Canister Stock <span className="text-amber-400">*</span>
                  </label>
                  <div className="relative">
                    <Package className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A5BCD6]" />
                    <input
                      type="number"
                      min="0"
                      required
                      value={productForm.stock_quantity}
                      onChange={(e) => setProductForm({ ...productForm, stock_quantity: e.target.value })}
                      placeholder="50"
                      className="w-full bg-[#18100E] border border-[#4A2E27] rounded-xl pl-10 pr-4 py-2.5 font-body text-sm text-[#F5EFC6] focus:outline-none focus:border-[#A5BCD6] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[#A5BCD6] font-headline font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Flavor Profile</span>
                    </label>
                    {/* <button
                      type="button"
                      onClick={() => {
                        setIsAddingFlavor(!isAddingFlavor);
                        setFlavorError('');
                      }}
                      className="text-[11px] text-amber-300 hover:text-amber-200 font-bold flex items-center gap-1 bg-amber-950/60 hover:bg-amber-900/60 px-2 py-0.5 rounded border border-amber-600/40 transition-colors"
                      title="Add a new custom flavor"
                    >
                      <Plus className="w-3 h-3" />
                      <span>{isAddingFlavor ? 'Cancel' : '+ New Flavor'}</span>
                    </button> */}
                  </div>

                  <select
                    value={productForm.roast_level}
                    onChange={(e) => {
                      if (e.target.value === '__add_new__') {
                        setIsAddingFlavor(true);
                        setFlavorError('');
                      } else {
                        setProductForm({ ...productForm, roast_level: e.target.value });
                      }
                    }}
                    style={{ colorScheme: 'dark' }}
                    className="w-full bg-[#18100E] border border-[#4A2E27] rounded-xl px-4 py-2.5 font-subhead text-sm text-[#F5EFC6] focus:outline-none focus:border-amber-400 transition-colors"
                  >
                    {allAvailableFlavors.length > 0 && (
                      <optgroup label="✨ Available Roastery Flavors">
                        {allAvailableFlavors.map((f) => (
                          <option key={f.value} value={f.value} className="bg-[#18100E] text-[#F5EFC6]">
                            {f.label || f.value}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    <option value="__add_new__" className="bg-[#4D0E12] text-amber-300 font-bold">
                      ➕ Add New Custom Flavor...
                    </option>
                  </select>

                  {/* Inline Add Flavor input */}
                  {isAddingFlavor && (
                    <div className="mt-2.5 p-2.5 rounded-xl bg-[#18100E] border border-amber-500/50 space-y-2 shadow-md animate-fade-in">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newFlavorInput}
                          onChange={(e) => {
                            setNewFlavorInput(e.target.value);
                            if (flavorError) setFlavorError('');
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddCustomFlavor(newFlavorInput);
                            }
                          }}
                          placeholder="e.g. Hazelnut, Mocha..."
                          className="flex-1 bg-[#231815] border border-[#4A2E27] rounded-lg px-3 py-1.5 text-xs text-[#F5EFC6] focus:outline-none focus:border-amber-400"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => handleAddCustomFlavor(newFlavorInput)}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-[#231815] font-black text-xs rounded-lg transition-all flex items-center gap-1 shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Add</span>
                        </button>
                      </div>
                      {flavorError && (
                        <p className="text-[11px] text-red-400 font-semibold">{flavorError}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Row 4: Dynamic Added Flavors Viewer & Quick-Selector */}
              {/* <div className="p-4 sm:p-5 rounded-2xl bg-[#18100E] border border-[#4A2E27] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="font-headline text-xs font-bold uppercase tracking-wider text-[#F5EFC6]">
                      Flavors Available & Added ({allAvailableFlavors.length})
                    </span>
                  </div>
                  <span className="text-xs text-[#A5BCD6]">
                    Click any chip below to immediately assign this profile
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {allAvailableFlavors.map((flv) => {
                    const isSelected = productForm.roast_level === flv.value;
                    const isCustom = flv.isCustom;
                    return (
                      <div
                        key={flv.value}
                        onClick={() => setProductForm({ ...productForm, roast_level: flv.value })}
                        className={`group inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-headline cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-amber-400 text-[#231815] font-black shadow-lg scale-105 ring-2 ring-amber-300'
                            : isCustom
                            ? 'bg-amber-950/50 text-amber-200 border border-amber-600/50 hover:bg-amber-900/60 hover:border-amber-400'
                            : 'bg-[#2F201C] text-[#F5EFC6] border border-[#4A2E27] hover:border-[#A5BCD6]/60'
                        }`}
                        title={isSelected ? 'Currently Selected' : `Click to select ${flv.value}`}
                      >
                        {isSelected ? (
                          <Check className="w-4 h-4 stroke-[3] text-[#231815]" />
                        ) : (
                          <div className={`w-2 h-2 rounded-full ${isCustom ? 'bg-amber-400' : 'bg-[#A5BCD6]'}`} />
                        )}
                        <span>{flv.label || flv.value}</span>
                        {isCustom && (
                          <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded font-black ${
                            isSelected ? 'bg-[#231815] text-amber-300' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            Added
                          </span>
                        )}
                        {isCustom && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveCustomFlavor(flv.value);
                            }}
                            className={`p-1 rounded hover:bg-red-900/60 hover:text-red-300 transition-colors ${
                              isSelected ? 'text-[#231815] hover:text-red-700' : 'text-[#A5BCD6]'
                            }`}
                            title={`Remove added flavor "${flv.value}"`}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div> */}

              {/* Row 5: Flavor Notes & Product Imagery Management (2-Column Grid) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
                {/* Left: Flavor Notes */}
                <div className="bg-[#18100E] p-4 sm:p-5 rounded-2xl border border-[#4A2E27] space-y-3 flex flex-col justify-between">
                  <div>
                    <label className="text-[#A5BCD6] font-headline font-bold text-xs uppercase tracking-wider block mb-1">
                      Flavor Notes & Nuances
                    </label>
                    <p className="text-[11px] text-[#F5EFC6]/65 mb-2.5">
                      Comma-separated notes shown on storefront product cards and canister labels.
                    </p>
                    <input
                      type="text"
                      value={productForm.flavor_notes}
                      onChange={(e) => setProductForm({ ...productForm, flavor_notes: e.target.value })}
                      placeholder="e.g. Jasmine, Honey, Meyer Lemon, Caramel"
                      className="w-full bg-[#231815] border border-[#4A2E27] rounded-xl px-4 py-2.5 font-body text-sm text-[#F5EFC6] focus:outline-none focus:border-[#A5BCD6] transition-colors"
                    />
                  </div>

                  {/* Live Tag Previews */}
                  {productForm.flavor_notes && productForm.flavor_notes.split(',').filter(n => n.trim()).length > 0 ? (
                    <div className="pt-2">
                      <span className="text-[10px] font-subhead uppercase tracking-wider text-[#A5BCD6] block mb-1.5 font-bold">
                        Live Tasting Badges:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {productForm.flavor_notes.split(',').map((tag, idx) => tag.trim() && (
                          <span key={idx} className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#2F201C] border border-[#4A2E27] text-amber-200 text-xs font-subhead">
                            ✦ {tag.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-[#F5EFC6]/40 italic pt-1">
                      Tip: Enter 3 to 4 notes for best roastery packaging card appearance.
                    </p>
                  )}
                </div>

                {/* Right: Product Image Management */}
                <div className="bg-[#18100E] p-4 sm:p-5 rounded-2xl border border-[#4A2E27] space-y-3">
                  <span className="text-xs font-headline font-bold uppercase tracking-wider text-[#A5BCD6] block">
                    Product Imagery Management
                  </span>

                  <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-[#231815] border-2 border-[#4A2E27] flex-shrink-0 relative group shadow-md">
                      {imagePreview ? (
                        <>
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setImagePreview('');
                              setSelectedImageFile(null);
                              setProductForm({ ...productForm, image_url: '' });
                            }}
                            className="absolute inset-0 bg-red-950/85 text-red-200 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-headline font-bold"
                          >
                            Remove
                          </button>
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-[#F5EFC6]/40 p-2 text-center">
                          <ImageIcon className="w-7 h-7 text-[#A5BCD6]/60 mb-1" />
                          <span className="text-[10px] font-subhead uppercase tracking-wider">No Image</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 space-y-2.5 w-full">
                      <div>
                        <label className="text-[11px] font-subhead font-bold text-[#F5EFC6]/80 block mb-1">
                          Upload Canister Image File
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileChange}
                          className="w-full text-xs text-[#F5EFC6]/70 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-headline file:font-bold file:bg-[#4D0E12] file:text-[#F5EFC6] hover:file:bg-[#4D0E12]/80 cursor-pointer"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-subhead font-bold text-[#F5EFC6]/80 block mb-1">
                          Or Paste Web Image URL
                        </label>
                        <input
                          type="url"
                          value={productForm.image_url}
                          onChange={(e) => {
                            setProductForm({ ...productForm, image_url: e.target.value });
                            setImagePreview(e.target.value);
                            setSelectedImageFile(null);
                          }}
                          placeholder="https://images.unsplash.com/..."
                          className="w-full bg-[#231815] border border-[#4A2E27] rounded-xl px-3.5 py-2 text-xs text-[#F5EFC6] focus:outline-none focus:border-[#A5BCD6] transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 6: Modal Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-5 mt-6 border-t border-[#4A2E27]">
                <div className="flex items-center space-x-2 text-xs text-[#F5EFC6]/65">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Adjustments instantly synchronize with active storefront inventory</span>
                </div>

                <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setIsProductModalOpen(false)}
                    className="px-6 py-2.5 rounded-xl bg-[#18100E] hover:bg-[#231815] text-[#F5EFC6]/75 hover:text-[#F5EFC6] border border-[#4A2E27] font-headline font-bold text-xs uppercase tracking-wider transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-2.5 rounded-xl bg-[#4D0E12] hover:bg-[#4D0E12]/90 text-[#F5EFC6] font-headline font-black text-xs uppercase tracking-wider border border-[#F5EFC6]/40 shadow-xl shadow-[#4D0E12]/30 active:scale-95 transition-all flex items-center space-x-2"
                  >
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>{editingProduct ? 'Save Flavor Changes' : 'Create Gummy Flavor'}</span>
                  </button>
                </div>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: ORDER DETAILS */}
      {/* ============================================================== */}
      {selectedOrder && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto"
          onClick={() => setSelectedOrder(null)}
        >
          <div 
            className="relative bg-[#231815] border border-[#4A2E27] text-[#F5EFC6] rounded-3xl max-w-xl w-full max-h-[90dvh] overflow-y-auto shadow-2xl p-4 sm:p-8 touch-scroll"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-[#18100E] hover:bg-[#4D0E12] text-[#F5EFC6] border border-[#4A2E27] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="font-subhead text-[10px] uppercase tracking-widest text-[#A5BCD6] font-bold block">
              THE BEAN CO. • OFFICIAL DISPATCH RECEIPT
            </span>
            <h2 className="font-headline font-black text-2xl uppercase tracking-tight text-[#F5EFC6] mt-1 mb-1">
              Order #{selectedOrder.order_number}
            </h2>
            <p className="font-body text-xs text-[#F5EFC6]/65 mb-6">
              Placed on {new Date(selectedOrder.created_at).toLocaleString()}
            </p>

            <div className="bg-[#18100E] p-4 rounded-2xl border border-[#4A2E27] mb-6 space-y-2 text-xs font-subhead">
              <div className="flex justify-between">
                <span className="text-[#A5BCD6] uppercase text-[10px]">Customer Name:</span>
                <span className="font-bold text-[#F5EFC6]">{selectedOrder.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A5BCD6] uppercase text-[10px]">Email Address:</span>
                <span className="text-[#F5EFC6] font-body">{selectedOrder.customer_email}</span>
              </div>
              {selectedOrder.customer_phone && (
                <div className="flex justify-between">
                  <span className="text-[#A5BCD6] uppercase text-[10px]">Phone:</span>
                  <span className="text-[#F5EFC6] font-body">{selectedOrder.customer_phone}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[#A5BCD6] uppercase text-[10px]">Shipping Address:</span>
                <span className="text-[#F5EFC6] text-right max-w-xs font-body">{selectedOrder.shipping_address}</span>
              </div>
              {selectedOrder.notes && (
                <div className="flex justify-between border-t border-[#4A2E27] pt-2 text-amber-300">
                  <span className="uppercase text-[10px]">Special Notes:</span>
                  <span className="font-body">{selectedOrder.notes}</span>
                </div>
              )}
            </div>

            <div className="mb-6">
              <span className="font-subhead text-[10px] uppercase tracking-wider text-[#A5BCD6] font-bold block mb-3">
                Purchased Coffee Gummies ({selectedOrder.items?.length || 0})
              </span>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedOrder.items?.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-[#18100E] border border-[#4A2E27] flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-headline font-bold text-[#F5EFC6] uppercase">{item.product_name}</p>
                      <span className="font-subhead text-[11px] text-[#A5BCD6]">
                        Format: <strong>{item.grind_type}</strong> • Qty: {item.quantity} × ₹{parseFloat(item.unit_price).toFixed(2)}
                      </span>
                    </div>
                    <span className="font-headline font-black text-sm text-[#F5EFC6]">
                      ₹{parseFloat(item.subtotal).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#4D0E12]/40 border-2 border-[#4D0E12] flex items-center justify-between mb-6 shadow-md">
              <div>
                <span className="font-subhead text-[10px] uppercase tracking-wider text-[#A5BCD6] block font-bold">Order Total</span>
                <span className="font-headline font-black text-2xl text-emerald-400">
                  ₹{parseFloat(selectedOrder.total_amount).toFixed(2)}
                </span>
              </div>

              <div className="flex items-center space-x-2 font-subhead">
                <span className="text-xs uppercase tracking-wider text-[#A5BCD6] font-bold">Status:</span>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => {
                    handleStatusChange(selectedOrder.id, e.target.value);
                    setSelectedOrder({ ...selectedOrder, status: e.target.value });
                  }}
                  style={{ colorScheme: 'dark' }}
                  className={`rounded-xl px-3 py-1.5 text-xs font-headline font-bold border transition-colors ${
                    selectedOrder.status === 'Shipped'
                      ? 'bg-[#1e293b] text-[#93c5fd] border-[#3b82f6]'
                      : selectedOrder.status === 'Processing'
                      ? 'bg-[#3b0764] text-[#d8b4fe] border-[#9333ea]'
                      : selectedOrder.status === 'Delivered'
                      ? 'bg-[#064e3b] text-[#6ee7b7] border-[#059669]'
                      : selectedOrder.status === 'Cancelled'
                      ? 'bg-[#450a0a] text-[#fca5a5] border-[#dc2626]'
                      : 'bg-[#451a03] text-[#fcd34d] border-[#d97706]'
                  }`}
                >
                  <option value="Pending" className="bg-[#18100E] text-[#fcd34d]">Pending</option>
                  <option value="Processing" className="bg-[#18100E] text-[#d8b4fe]">Processing</option>
                  <option value="Shipped" className="bg-[#18100E] text-[#93c5fd]">Shipped</option>
                  <option value="Delivered" className="bg-[#18100E] text-emerald-300">Delivered</option>
                  <option value="Cancelled" className="bg-[#18100E] text-[#fca5a5]">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Customer Notifications (Mail & SMS) Live Status Card */}
            <div className="bg-[#18100E] p-4 rounded-2xl border border-[#4A2E27] mb-6 space-y-3 text-xs font-subhead">
              <div className="flex items-center justify-between pb-2 border-b border-[#4A2E27]">
                <div className="flex items-center space-x-2 text-[#A5BCD6]">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-bold text-[10px] uppercase tracking-wider">
                    Customer Alerts (Mail & SMS)
                  </span>
                </div>
                <span className="text-[10px] text-emerald-400 font-bold">Auto-Dispatched on Status Changes</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded-xl bg-[#231815] border border-[#4A2E27] flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <div className="truncate">
                    <span className="text-[9px] uppercase text-[#A5BCD6] block font-bold">Customer Email</span>
                    <span className="text-[#F5EFC6] font-mono truncate">{selectedOrder.customer_email}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-[#231815] border border-[#4A2E27] flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <div className="truncate">
                    <span className="text-[9px] uppercase text-[#A5BCD6] block font-bold">Customer Phone (SMS)</span>
                    <span className="text-[#F5EFC6] font-mono">{selectedOrder.customer_phone || 'No phone provided'}</span>
                  </div>
                </div>
              </div>

              {/* Notification History Log (if present) */}
              {selectedOrder.notifications && selectedOrder.notifications.length > 0 && (
                <div className="pt-2 border-t border-[#4A2E27] space-y-1.5">
                  <span className="text-[10px] uppercase text-[#A5BCD6] font-bold block">
                    Dispatched Alerts History ({selectedOrder.notifications.length})
                  </span>
                  <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                    {selectedOrder.notifications.map((notif) => (
                      <div key={notif.id} className="p-2 rounded-lg bg-[#231815] border border-[#4A2E27] text-[10px] flex items-center justify-between">
                        <div className="flex items-center space-x-1.5 truncate">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${notif.channel === 'EMAIL' ? 'bg-blue-950 text-blue-300' : 'bg-emerald-950 text-emerald-300'}`}>
                            {notif.channel}
                          </span>
                          <span className="font-bold text-[#F5EFC6]">{notif.event}</span>
                          <span className="text-[#A5BCD6] truncate max-w-[140px]">{notif.subject || notif.message}</span>
                        </div>
                        <span className="text-[#A5BCD6]/60 font-mono text-[9px] flex-shrink-0 ml-2">
                          {new Date(notif.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedOrder(null)}
              className="w-full py-3.5 rounded-xl bg-[#4D0E12] hover:bg-[#4D0E12]/90 text-[#F5EFC6] font-headline font-black text-xs uppercase tracking-wider border border-[#F5EFC6]/40 shadow-xl transition-all active:scale-95"
            >
              Close Receipt
            </button>

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* CUSTOM DELETE CONFIRMATION MODAL (Replaces Browser Confirm Alert) */}
      {/* ============================================================== */}
      {deleteModal.isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
          onClick={() => {
            if (!deleteModal.loading) {
              setDeleteModal({ ...deleteModal, isOpen: false });
            }
          }}
        >
          <div
            className="relative w-full max-w-md bg-[#18100E] border-2 border-red-900/60 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 text-center overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background glowing gradients */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

            {/* Close 'X' button */}
            <button
              onClick={() => setDeleteModal({ ...deleteModal, isOpen: false })}
              disabled={deleteModal.loading}
              className="absolute top-4 right-4 p-2 rounded-full bg-[#2F201C] hover:bg-[#4D0E12] text-[#F5EFC6] border border-[#4A2E27] transition-colors disabled:opacity-40"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Trash / Danger Icon Badge */}
            <div className="mx-auto w-16 h-16 rounded-2xl bg-red-950/70 border-2 border-red-600/40 flex items-center justify-center shadow-lg shadow-red-950/50">
              <Trash2 className="w-8 h-8 text-red-400 animate-pulse" />
            </div>

            {/* Title & Description */}
            <div className="space-y-2">
              <h3 className="font-headline font-black text-xl sm:text-2xl text-[#F5EFC6] uppercase tracking-wide">
                {deleteModal.type === 'product' ? 'Confirm Deletion' : 'Remove Artwork'}
              </h3>
              <p className="font-body text-xs sm:text-sm text-[#A5BCD6] leading-relaxed">
                {deleteModal.type === 'product' ? (
                  <>
                    Are you sure you want to delete{' '}
                    <strong className="text-amber-300 font-bold">"{deleteModal.name}"</strong>?
                  </>
                ) : (
                  <>
                    Are you sure you want to remove the artwork image for{' '}
                    <strong className="text-amber-300 font-bold">"{deleteModal.name}"</strong>?
                  </>
                )}
              </p>
            </div>

            {/* Warning Callout Box */}
            <div className="p-3.5 rounded-2xl bg-[#2F201C] border border-red-900/40 text-left flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-[11px] leading-tight space-y-1">
                <span className="font-bold text-amber-300 block uppercase tracking-wider text-[10px]">
                  Warning: Irreversible Action
                </span>
                <span className="text-[#F5EFC6]/75 block">
                  {deleteModal.type === 'product'
                    ? 'This gummy product and its stock count will be permanently deleted from your store inventory.'
                    : 'The custom artwork will be removed and the canister will revert to default packaging.'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                disabled={deleteModal.loading}
                className="flex-1 py-3 px-4 rounded-xl bg-[#2F201C] hover:bg-[#4A2E27] text-[#F5EFC6] font-headline font-bold text-xs uppercase tracking-wider border border-[#4A2E27] transition-all disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleteModal.loading}
                className="flex-1 py-3 px-4 rounded-xl bg-red-700 hover:bg-red-800 active:scale-95 text-white font-headline font-black text-xs uppercase tracking-wider border border-red-500/40 shadow-xl shadow-red-950/60 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {deleteModal.loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Trash2 className="w-4 h-4 text-white" />
                )}
                <span>
                  {deleteModal.loading
                    ? 'Deleting...'
                    : deleteModal.type === 'product'
                    ? 'Yes, Delete'
                    : 'Yes, Remove'}
                </span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
