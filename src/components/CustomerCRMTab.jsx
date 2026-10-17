import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCRMCustomers } from '../store/marketplaceSlice';
import axios from 'axios';
import { API_BASE } from '../config/api';
import {
  Users,
  Award,
  Coins,
  ShoppingBag,
  Download,
  Search,
  Filter,
  ArrowUpDown,
  Mail,
  Phone,
  Calendar,
  MapPin,
  ExternalLink,
  FileSpreadsheet,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function CustomerCRMTab() {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const { crmCustomers } = useSelector((state) => state.marketplace);

  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('ltv'); // 'ltv' | 'orders' | 'coins' | 'recent'
  const [downloadingOrders, setDownloadingOrders] = useState(false);
  const [downloadingInventory, setDownloadingInventory] = useState(false);
  const [exportNotice, setExportNotice] = useState(null);

  useEffect(() => {
    dispatch(fetchCRMCustomers());
  }, [dispatch]);

  const handleExport = async (type) => {
    const isOrders = type === 'orders';
    const setDownloading = isOrders ? setDownloadingOrders : setDownloadingInventory;
    const endpoint = isOrders ? `${API_BASE}/marketplace/export-orders` : `${API_BASE}/marketplace/export-inventory`;
    const defaultFilename = isOrders ? 'orders_export.csv' : 'inventory_export.csv';

    try {
      setDownloading(true);
      const res = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });

      // Extract filename from header if present
      const contentDisposition = res.headers['content-disposition'];
      let filename = defaultFilename;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) filename = match[1];
      }

      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setExportNotice(`Successfully downloaded ${filename}`);
      setTimeout(() => setExportNotice(null), 4000);
    } catch (err) {
      console.error('Export failed:', err);
      setExportNotice('Failed to download CSV export. Please try again.');
      setTimeout(() => setExportNotice(null), 4000);
    } finally {
      setDownloading(false);
    }
  };

  const handleToggleVerification = async (customerId, isVerified) => {
    try {
      await axios.put(
        `${API_BASE}/marketplace/crm-customers/${customerId}/verify`,
        { is_verified: isVerified },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      dispatch(fetchCRMCustomers());
      setExportNotice(`Customer #${customerId} verification updated!`);
      setTimeout(() => setExportNotice(null), 3000);
    } catch (err) {
      console.error('Failed to update verification:', err);
    }
  };

  // Filter and sort customers
  const filteredCustomers = (crmCustomers || []).filter((cust) => {
    const matchesSearch =
      (cust.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cust.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cust.phone || '').includes(searchQuery);

    const matchesTier = tierFilter === 'ALL' || cust.tier === tierFilter;
    return matchesSearch && matchesTier;
  }).sort((a, b) => {
    if (sortBy === 'ltv') return (b.total_spend || 0) - (a.total_spend || 0);
    if (sortBy === 'orders') return (b.total_orders || 0) - (a.total_orders || 0);
    if (sortBy === 'coins') return (b.bean_coins_balance || 0) - (a.bean_coins_balance || 0);
    if (sortBy === 'recent') return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    return 0;
  });

  // Calculate aggregates
  const totalCustomers = crmCustomers?.length || 0;
  const totalLTV = (crmCustomers || []).reduce((acc, c) => acc + (parseFloat(c.total_spend) || 0), 0);
  const totalOrders = (crmCustomers || []).reduce((acc, c) => acc + (parseInt(c.total_orders) || 0), 0);
  const totalCoins = (crmCustomers || []).reduce((acc, c) => acc + (parseInt(c.bean_coins_balance) || 0), 0);

  const getTierBadge = (tier) => {
    switch (tier) {
      case 'Platinum Roaster':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-950/80 text-purple-300 border border-purple-500/40">
            <Sparkles className="w-3 h-3 text-purple-300" /> Platinum Roaster
          </span>
        );
      case 'Gold Barista':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-950/80 text-amber-300 border border-amber-500/40">
            <Award className="w-3 h-3 text-amber-300" /> Gold Barista
          </span>
        );
      case 'Silver Brewer':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-950/80 text-sky-300 border border-sky-500/40">
            <Award className="w-3 h-3 text-sky-300" /> Silver Brewer
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#2F201C] text-[#F5EFC6]/80 border border-[#4A2E27]">
            Bronze Explorer
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Export Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#2F201C] border-2 border-[#4A2E27] p-5 sm:p-6 rounded-3xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#4D0E12] text-[#F5EFC6] border border-[#F5EFC6]/30">
              Flipkart & Amazon Grade CRM
            </span>
            <span className="text-xs text-[#A5BCD6] font-body">Customer Intelligence & Retention</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black font-headline uppercase tracking-tight text-[#F5EFC6]">
            Customer 360 & Data Exports
          </h2>
          <p className="text-xs text-[#A5BCD6] font-body mt-0.5">
            Monitor customer Lifetime Value (LTV), loyalty patron engagement, and export fulfillment datasets.
          </p>
        </div>

        {/* Bulk CSV Export Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => handleExport('orders')}
            disabled={downloadingOrders}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#18100E] hover:bg-[#4D0E12] text-[#F5EFC6] border border-[#4A2E27] hover:border-[#F5EFC6]/50 text-xs font-headline font-bold uppercase tracking-wider shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            {downloadingOrders ? (
              <RefreshCw className="w-4 h-4 text-amber-300 animate-spin" />
            ) : (
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            )}
            <span>Export Orders CSV</span>
          </button>

          <button
            onClick={() => handleExport('inventory')}
            disabled={downloadingInventory}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#18100E] hover:bg-[#4D0E12] text-[#F5EFC6] border border-[#4A2E27] hover:border-[#F5EFC6]/50 text-xs font-headline font-bold uppercase tracking-wider shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            {downloadingInventory ? (
              <RefreshCw className="w-4 h-4 text-amber-300 animate-spin" />
            ) : (
              <Download className="w-4 h-4 text-[#A5BCD6]" />
            )}
            <span>Export Inventory CSV</span>
          </button>

          <button
            onClick={() => dispatch(fetchCRMCustomers())}
            title="Refresh CRM Data"
            className="p-2.5 rounded-xl bg-[#18100E] hover:bg-[#4A2E27] text-[#A5BCD6] hover:text-[#F5EFC6] border border-[#4A2E27] transition-all"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Export notification notice */}
      {exportNotice && (
        <div className="p-3 bg-emerald-950/70 border border-emerald-500/40 rounded-2xl text-xs text-emerald-300 font-headline font-bold flex items-center justify-between animate-fade-in">
          <span>{exportNotice}</span>
          <button onClick={() => setExportNotice(null)} className="text-emerald-400 hover:text-emerald-200">
            Dismiss
          </button>
        </div>
      )}

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-[#2F201C] border border-[#4A2E27] shadow-lg">
          <div className="flex items-center justify-between text-[#A5BCD6] mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider">Registered Patrons</span>
            <Users className="w-4 h-4 text-[#A5BCD6]" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-headline text-[#F5EFC6]">
            {totalCustomers}
          </div>
          <p className="text-[10px] text-[#A5BCD6]/70 font-body mt-0.5">Active member accounts</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#2F201C] border border-[#4A2E27] shadow-lg">
          <div className="flex items-center justify-between text-[#A5BCD6] mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider">Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-headline text-emerald-400">
            {totalOrders}
          </div>
          <p className="text-[10px] text-[#A5BCD6]/70 font-body mt-0.5">Dispatched & ongoing</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#2F201C] border border-[#4A2E27] shadow-lg">
          <div className="flex items-center justify-between text-[#A5BCD6] mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider">Total Roastery LTV</span>
            <Award className="w-4 h-4 text-amber-300" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-headline text-amber-300">
            ₹{totalLTV.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <p className="text-[10px] text-[#A5BCD6]/70 font-body mt-0.5">
            Avg ₹{totalCustomers ? (totalLTV / totalCustomers).toFixed(0) : 0}/patron
          </p>
        </div>

        {/* Bean Coins metric card (temporarily commented out for future use)
        <div className="p-4 rounded-2xl bg-[#2F201C] border border-[#4A2E27] shadow-lg">
          <div className="flex items-center justify-between text-[#A5BCD6] mb-1">
            <span className="text-[10px] uppercase font-bold tracking-wider">Coins Circulating</span>
            <Coins className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-headline text-amber-400">
            {totalCoins}
          </div>
          <p className="text-[10px] text-[#A5BCD6]/70 font-body mt-0.5">Loyalty points held</p>
        </div>
        */}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#2F201C] border border-[#4A2E27] p-3 rounded-2xl">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#A5BCD6] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patron by name, email or phone..."
            className="w-full bg-[#18100E] border border-[#4A2E27] rounded-xl pl-10 pr-4 py-2 text-xs font-body text-[#F5EFC6] placeholder-[#A5BCD6]/50 focus:outline-none focus:border-[#F5EFC6]/50"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#18100E] border border-[#4A2E27] rounded-xl px-2.5 py-1.5">
            <Filter className="w-3.5 h-3.5 text-[#A5BCD6]" />
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="bg-transparent text-xs text-[#F5EFC6] focus:outline-none font-subhead font-bold"
            >
              <option value="ALL" className="bg-[#18100E]">All Tiers</option>
              <option value="Platinum Roaster" className="bg-[#18100E]">Platinum Roaster</option>
              <option value="Gold Barista" className="bg-[#18100E]">Gold Barista</option>
              <option value="Silver Brewer" className="bg-[#18100E]">Silver Brewer</option>
              <option value="Bronze Explorer" className="bg-[#18100E]">Bronze Explorer</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-[#18100E] border border-[#4A2E27] rounded-xl px-2.5 py-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#A5BCD6]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-xs text-[#F5EFC6] focus:outline-none font-subhead font-bold"
            >
              <option value="ltv" className="bg-[#18100E]">Sort: Highest LTV</option>
              <option value="orders" className="bg-[#18100E]">Sort: Most Orders</option>
              {/* <option value="coins" className="bg-[#18100E]">Sort: Bean Coins</option> */}
              <option value="recent" className="bg-[#18100E]">Sort: Newest Patrons</option>
            </select>
          </div>
        </div>
      </div>

      {/* Customer 360 Table for Desktop/Tablet */}
      <div className="bg-[#2F201C] border-2 border-[#4A2E27] rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto touch-scroll">
          <table className="w-full text-left text-xs font-body">
            <thead className="bg-[#18100E] text-[#A5BCD6] font-subhead uppercase tracking-wider font-bold border-b-2 border-[#4A2E27]">
              <tr>
                <th className="py-4 px-4">Patron Identity</th>
                <th className="py-4 px-4">Loyalty Tier</th>
                <th className="py-4 px-4 text-center">Orders</th>
                <th className="py-4 px-4">Lifetime Spend (LTV)</th>
                <th className="py-4 px-4">Avg Order Value</th>
                <th className="py-4 px-4 text-center">Email Verification</th>
                {/* <th className="py-4 px-4 text-center">Bean Coins</th> */}
                <th className="py-4 px-4">Last Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#4A2E27]">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-[#A5BCD6]">
                    <Users className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="font-headline font-bold text-sm uppercase text-[#F5EFC6]">No Patrons Found</p>
                    <p className="text-xs">Try adjusting your search criteria or tier filter.</p>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-[#18100E]/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#4D0E12] border border-[#F5EFC6]/30 flex items-center justify-center font-headline font-black text-xs text-[#F5EFC6] uppercase flex-shrink-0">
                          {cust.name ? cust.name.charAt(0) : 'P'}
                        </div>
                        <div>
                          <div className="font-headline font-bold text-[#F5EFC6] text-sm">
                            {cust.name || 'Anonymous Patron'}
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-[#A5BCD6]">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" /> {cust.email}
                            </span>
                            {cust.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" /> {cust.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {getTierBadge(cust.tier)}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="font-headline font-black text-sm text-[#F5EFC6]">
                        {cust.total_orders || 0}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-headline font-black text-sm text-amber-300">
                        ₹{parseFloat(cust.total_spend || 0).toFixed(2)}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-headline font-bold text-xs text-[#A5BCD6]">
                        ₹{parseFloat(cust.avg_order_value || 0).toFixed(2)}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {cust.is_email_verified ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-bold text-[10px]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleToggleVerification(cust.id, true)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-950/60 hover:bg-amber-900 border border-amber-500/40 text-amber-300 font-bold text-[10px] transition-colors"
                          title="Click to mark this customer as verified in MariaDB"
                        >
                          <AlertCircle className="w-3 h-3 text-amber-400" />
                          <span>Unverified (Click to Verify)</span>
                        </button>
                      )}
                    </td>

                    {/* Bean Coins cell (temporarily commented out for future use)
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-300 font-headline font-bold text-xs">
                        <Coins className="w-3 h-3 text-amber-400" />
                        <span>{cust.bean_coins_balance || 0}</span>
                      </div>
                    </td>
                    */}

                    <td className="py-3.5 px-4 text-[11px] text-[#A5BCD6]">
                      {cust.last_order_date ? (
                        <span>
                          {new Date(cust.last_order_date).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      ) : (
                        <span className="text-[#F5EFC6]/40 italic">Never Ordered</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
