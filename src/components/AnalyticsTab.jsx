import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAnalyticsDashboard, setTimeRange } from '../store/analyticsSlice';
import { 
  TrendingUp, 
  BarChart3, 
  Clock, 
  Activity, 
  Calendar, 
  Users, 
  Flame, 
  Award, 
  AlertCircle, 
  ArrowUpRight, 
  CheckCircle2, 
  Layers, 
  Compass, 
  RefreshCw,
  ShoppingBag,
  DollarSign,
  Eye,
  Coffee,
  PackageCheck
} from 'lucide-react';

export default function AnalyticsTab({ onSwitchToStockPlanning }) {
  const dispatch = useDispatch();
  const { data: analyticsData, timeRange, status, error } = useSelector((state) => state.analytics);
  const [selectedDayDetail, setSelectedDayDetail] = useState(null);

  useEffect(() => {
    dispatch(fetchAnalyticsDashboard(timeRange));
  }, [dispatch, timeRange]);

  const handleRangeChange = (newRange) => {
    dispatch(setTimeRange(newRange));
    dispatch(fetchAnalyticsDashboard(newRange));
  };

  const handleRefresh = () => {
    dispatch(fetchAnalyticsDashboard(timeRange));
  };

  if (status === 'loading' && !analyticsData) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center space-y-3 font-subhead">
        <RefreshCw className="w-8 h-8 text-[#A5BCD6] animate-spin" />
        <p className="text-sm font-bold text-[#F5EFC6] uppercase tracking-wider">Aggregating store traffic logs & order telemetry...</p>
      </div>
    );
  }

  if (error && !analyticsData) {
    return (
      <div className="p-8 rounded-2xl bg-red-950/40 border-2 border-red-800 text-center text-red-200 font-body">
        <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-400" />
        <p className="font-headline font-bold text-sm uppercase">Failed to load analytics telemetry</p>
        <p className="text-xs text-red-300 mt-1">{error}</p>
        <button
          onClick={handleRefresh}
          className="mt-4 px-4 py-2 bg-[#4D0E12] text-[#F5EFC6] rounded-xl text-xs font-headline font-bold uppercase tracking-wider hover:bg-[#4D0E12]/80 border border-[#F5EFC6]/20"
        >
          Try Again
        </button>
      </div>
    );
  }

  const kpis = analyticsData?.kpis || {};
  const pageTraffic = analyticsData?.pageTraffic || [];
  const productSales = analyticsData?.productSales || { ranked: [], grindPreferences: [], slowMovers: [] };
  const dailyTrends = analyticsData?.dailyTrends || [];
  const hourlyDistribution = analyticsData?.hourlyDistribution || [];

  // Calculate maximum values for relative chart bar heights
  const maxDailyViews = Math.max(...dailyTrends.map(d => d.views), 1);
  const maxHourlyViews = Math.max(...hourlyDistribution.map(h => h.views), 1);

  return (
    <div className="space-y-8 animate-fade-in text-xs font-body">
      
      {/* ============================================================== */}
      {/* 1. TOP HEADER & TIME RANGE CONTROLS */}
      {/* ============================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#2F201C] border-2 border-[#4A2E27] shadow-xl">
        <div>
          <div className="flex items-center space-x-2 mb-1.5 font-subhead">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#A5BCD6] bg-[#4D0E12] px-2.5 py-0.5 rounded-full border border-[#F5EFC6]/20">
              Live Store Telemetry
            </span>
            <span className="text-[10px] text-emerald-400 flex items-center space-x-1 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Telemetry Active</span>
            </span>
          </div>
          <h2 className="font-headline font-black text-xl sm:text-2xl text-[#F5EFC6] uppercase tracking-wide">
            Traffic, Page Hits & Gummy Sales Performance
          </h2>
          <p className="text-[#A5BCD6] text-xs font-body">
            Monitor which pages customers visit, what coffee gummies they buy most, and daily traffic patterns
          </p>
        </div>

        {/* Range Selector & Sync Button */}
        <div className="flex items-center space-x-2 flex-wrap gap-y-2 font-subhead">
          <div className="inline-flex rounded-xl bg-[#18100E] p-1 border border-[#4A2E27]">
            {[
              { id: 'today', label: 'Today' },
              { id: '7d', label: 'Last 7 Days' },
              { id: '30d', label: 'Last 30 Days' },
              { id: 'all', label: 'All Time' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleRangeChange(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  timeRange === tab.id
                    ? 'bg-[#4D0E12] text-[#F5EFC6] shadow-sm border border-[#F5EFC6]/20'
                    : 'text-[#F5EFC6]/60 hover:text-[#F5EFC6]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleRefresh}
            className="flex items-center space-x-1 px-3 py-2 rounded-xl bg-[#2F201C] hover:bg-[#4A2E27] text-[#A5BCD6] border border-[#4A2E27] transition-colors"
            title="Refresh analytics data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${status === 'loading' ? 'animate-spin text-emerald-400' : ''}`} />
            <span className="text-xs">Refresh</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. EXECUTIVE KPI CARDS */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Total Page Views */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#2F201C] border-2 border-[#4A2E27] shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] uppercase tracking-wider text-[#A5BCD6] font-subhead font-bold">Total Page Views</span>
              <div className="w-8 h-8 rounded-lg bg-[#4D0E12] flex items-center justify-center text-[#F5EFC6]">
                <Eye className="w-4 h-4 text-[#F5EFC6]" />
              </div>
            </div>
            <p className="font-headline font-black text-2xl sm:text-3xl text-[#F5EFC6]">
              {kpis.totalViews?.toLocaleString() || 0}
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-[#4A2E27]/60 flex items-center justify-between text-[11px] font-subhead">
            <span className="text-[#A5BCD6]">Today's Hits:</span>
            <span className="text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
              +{kpis.todayViews || 0} views
            </span>
          </div>
        </div>

        {/* Unique Visitors */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#2F201C] border-2 border-[#4A2E27] shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] uppercase tracking-wider text-[#A5BCD6] font-subhead font-bold">Unique Visitors</span>
              <div className="w-8 h-8 rounded-lg bg-[#4D0E12] flex items-center justify-center text-[#A5BCD6]">
                <Users className="w-4 h-4 text-[#A5BCD6]" />
              </div>
            </div>
            <p className="font-headline font-black text-2xl sm:text-3xl text-[#F5EFC6]">
              {kpis.uniqueVisitors?.toLocaleString() || 0}
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-[#4A2E27]/60 flex items-center justify-between text-[11px] font-subhead">
            <span className="text-[#A5BCD6]">Today's Visitors:</span>
            <span className="text-[#F5EFC6] font-semibold">
              {kpis.todayVisitors || 0} distinct
            </span>
          </div>
        </div>

        {/* Total Orders & Conversion Rate */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#2F201C] border-2 border-[#4A2E27] shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] uppercase tracking-wider text-[#A5BCD6] font-subhead font-bold">Orders & Conversion</span>
              <div className="w-8 h-8 rounded-lg bg-[#4D0E12] flex items-center justify-center text-[#F5EFC6]">
                <ShoppingBag className="w-4 h-4 text-[#F5EFC6]" />
              </div>
            </div>
            <div className="flex items-baseline space-x-2">
              <p className="font-headline font-black text-2xl sm:text-3xl text-[#F5EFC6]">
                {kpis.totalOrders || 0}
              </p>
              <span className="text-xs text-[#A5BCD6] font-subhead">orders</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[#4A2E27]/60 flex items-center justify-between text-[11px] font-subhead">
            <span className="text-[#A5BCD6]">Conversion Rate:</span>
            <span className="text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
              {kpis.conversionRate}%
            </span>
          </div>
        </div>

        {/* Gross Revenue & AOV */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#2F201C] border-2 border-[#4A2E27] shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] uppercase tracking-wider text-[#A5BCD6] font-subhead font-bold">Gross Revenue</span>
              <div className="w-8 h-8 rounded-lg bg-[#4D0E12] flex items-center justify-center text-[#F5EFC6]">
                <DollarSign className="w-4 h-4 text-[#F5EFC6]" />
              </div>
            </div>
            <p className="font-headline font-black text-2xl sm:text-3xl text-[#F5EFC6]">
              ${parseFloat(kpis.grossRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-[#4A2E27]/60 flex items-center justify-between text-[11px] font-subhead">
            <span className="text-[#A5BCD6]">Avg Order Value:</span>
            <span className="text-[#F5EFC6] font-bold">
              ${parseFloat(kpis.avgOrderValue || 0).toFixed(2)}
            </span>
          </div>
        </div>

      </div>

      {/* ============================================================== */}
      {/* 3. "HOW MANY TIMES A DAY" - DAILY TIMELINE & 24-HOUR CLOCK */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Daily Activity Trends (Bar Chart across days) - 2 cols */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#2F201C] border-2 border-[#4A2E27] shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#4A2E27] pb-3">
            <div>
              <h3 className="font-headline font-black text-lg text-[#F5EFC6] flex items-center space-x-2 uppercase tracking-wide">
                <Calendar className="w-4 h-4 text-[#A5BCD6]" />
                <span>Daily Traffic & Orders Volume</span>
              </h3>
              <p className="text-[11px] text-[#A5BCD6] font-body">How many times a day customers browse and order</p>
            </div>
            
            <div className="flex items-center space-x-4 text-[11px] font-subhead">
              <span className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded bg-[#A5BCD6]"></span>
                <span className="text-[#A5BCD6]">Page Views</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-3 h-3 rounded bg-[#4D0E12] border border-[#F5EFC6]/40"></span>
                <span className="text-[#F5EFC6]">Orders</span>
              </span>
            </div>
          </div>

          {/* Scaled Visual Bar Chart */}
          <div className="pt-6 pb-2 overflow-x-auto touch-scroll admin-tabs-scroll">
            <div className="min-w-[440px] sm:min-w-0">
              <div className="h-48 flex items-end justify-between gap-2 border-b border-[#4A2E27]/80 px-2 pb-1">
                {dailyTrends.map((d, idx) => {
                  const heightPercent = Math.max(8, Math.round((d.views / maxDailyViews) * 100));
                  const orderHeightPercent = d.orders > 0 ? Math.min(80, Math.max(15, d.orders * 25)) : 0;
                  const isSelected = selectedDayDetail?.date === d.date;

                  return (
                    <div
                      key={d.date || idx}
                      onClick={() => setSelectedDayDetail(d)}
                      className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                    >
                      {/* Tooltip on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-[#18100E] border border-[#4A2E27] text-[#F5EFC6] p-2 rounded-lg text-[10px] shadow-2xl absolute -translate-y-24 pointer-events-none z-20 whitespace-nowrap font-subhead">
                        <p className="font-bold text-[#A5BCD6]">{d.label} ({d.date})</p>
                        <p>👁️ Views: <span className="font-semibold">{d.views}</span></p>
                        <p>👥 Visitors: <span className="font-semibold">{d.visitors}</span></p>
                        <p>🛒 Orders: <span className="font-semibold text-emerald-400">{d.orders}</span></p>
                        <p>💰 Sales: <span className="font-semibold text-[#F5EFC6]">${d.revenue.toFixed(2)}</span></p>
                      </div>

                      {/* Bars pair */}
                      <div className="w-full flex items-end justify-center space-x-1 h-full pb-1">
                        {/* Views bar */}
                        <div 
                          style={{ height: `${heightPercent}%` }}
                          className={`w-1/2 max-w-[24px] rounded-t-md transition-all ${
                            isSelected ? 'bg-[#F5EFC6]' : 'bg-[#A5BCD6] group-hover:bg-[#F5EFC6]'
                          }`}
                        ></div>
                        {/* Orders bar */}
                        {d.orders > 0 && (
                          <div 
                            style={{ height: `${orderHeightPercent}%` }}
                            className="w-1/2 max-w-[24px] rounded-t-md bg-[#4D0E12] border border-[#F5EFC6]/40 transition-all group-hover:brightness-125"
                          ></div>
                        )}
                      </div>

                      {/* X-axis Label */}
                      <span className="text-[10px] text-[#A5BCD6] truncate w-full text-center mt-2 group-hover:text-[#F5EFC6] font-subhead">
                        {d.label.split(',')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Selected day detail info banner */}
          {selectedDayDetail && (
            <div className="p-3 rounded-xl bg-[#18100E] border border-[#4A2E27] flex items-center justify-between text-xs font-subhead">
              <div className="flex items-center space-x-2">
                <span className="font-headline font-bold text-[#F5EFC6] uppercase">{selectedDayDetail.label}:</span>
                <span className="text-[#A5BCD6]">{selectedDayDetail.views} views • {selectedDayDetail.visitors} visitors</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-emerald-400 font-semibold">{selectedDayDetail.orders} orders placed</span>
                <span className="text-[#F5EFC6] font-bold">${selectedDayDetail.revenue.toFixed(2)}</span>
                <button 
                  onClick={() => setSelectedDayDetail(null)}
                  className="text-[#A5BCD6] hover:text-[#F5EFC6] text-[10px]"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

        </div>

        {/* 24-Hour Traffic Curve (Peak Hour Window) - 1 col */}
        <div className="p-6 rounded-2xl bg-[#2F201C] border-2 border-[#4A2E27] shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="border-b border-[#4A2E27] pb-3 mb-4">
              <h3 className="font-headline font-black text-lg text-[#F5EFC6] flex items-center space-x-2 uppercase tracking-wide">
                <Clock className="w-4 h-4 text-[#A5BCD6]" />
                <span>Peak Hours of the Day</span>
              </h3>
              <p className="text-[11px] text-[#A5BCD6] font-body">24-hour distribution of customer visits</p>
            </div>

            {/* Peak window badge */}
            <div className="p-3 rounded-xl bg-[#4D0E12] border border-[#F5EFC6]/30 mb-4 flex items-center space-x-3">
              <Flame className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#F5EFC6]/70 block font-subhead font-semibold">
                  Peak Daily Window
                </span>
                <p className="font-headline font-bold text-sm text-[#F5EFC6] uppercase">
                  {kpis.peakHourWindow || '8 AM - 11 AM Morning Rush'}
                </p>
              </div>
            </div>

            {/* Hourly Distribution Micro Bars */}
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 font-subhead">
              {hourlyDistribution.filter(h => h.views > 0).slice(0, 7).map((h) => {
                const pct = Math.round((h.views / maxHourlyViews) * 100);
                return (
                  <div key={h.hour} className="flex items-center space-x-2 text-[11px]">
                    <span className="w-14 text-[#A5BCD6] text-right font-mono">{h.label}</span>
                    <div className="flex-1 bg-[#18100E] rounded-full h-3 overflow-hidden border border-[#4A2E27]">
                      <div 
                        style={{ width: `${pct}%` }}
                        className="bg-gradient-to-r from-[#4D0E12] to-[#A5BCD6] h-full rounded-full"
                      ></div>
                    </div>
                    <span className="w-16 text-right text-[#F5EFC6] font-semibold">{h.views} hits</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-[#4A2E27] text-[11px] text-[#A5BCD6] flex items-center justify-between font-subhead">
            <span>Morning Caffeine Surge:</span>
            <span className="text-[#F5EFC6] font-semibold">8:00 AM – 11:30 AM</span>
          </div>
        </div>

      </div>

      {/* ============================================================== */}
      {/* 4. "WHICH PAGE WAS ACCESSED MORE" (PAGE TRAFFIC LEADERBOARD) */}
      {/* ============================================================== */}
      <div className="p-6 rounded-2xl bg-[#2F201C] border-2 border-[#4A2E27] shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#4A2E27] pb-3">
          <div>
            <div className="flex items-center space-x-2">
              <Compass className="w-4 h-4 text-[#A5BCD6]" />
              <h3 className="font-headline font-black text-lg text-[#F5EFC6] uppercase tracking-wide">
                Most Accessed Pages & Navigation Flow
              </h3>
            </div>
            <p className="text-[11px] text-[#A5BCD6] font-body">
              Detailed breakdown of which store sections customers spend time in
            </p>
          </div>
          <span className="text-[11px] text-[#A5BCD6] bg-[#18100E] px-3 py-1 rounded-lg border border-[#4A2E27] font-subhead">
            Ranked by total page hits
          </span>
        </div>

        {/* Table of Pages */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-body">
            <thead>
              <tr className="border-b border-[#4A2E27] text-[#A5BCD6] font-subhead font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3">Rank</th>
                <th className="py-3 px-3">Page Name / Section</th>
                <th className="py-3 px-3">Route Path</th>
                <th className="py-3 px-3 text-right">Total Hits</th>
                <th className="py-3 px-3 text-right">Unique Visitors</th>
                <th className="py-3 px-3 text-right">Traffic Share</th>
                <th className="py-3 px-3">Visual Distribution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#4A2E27]/40">
              {pageTraffic.map((page, idx) => {
                const isTop1 = idx === 0;
                return (
                  <tr key={page.path || idx} className="hover:bg-[#3B2822]/40 transition-colors">
                    
                    {/* Rank */}
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold text-xs font-headline ${
                        isTop1 
                          ? 'bg-[#F5EFC6] text-[#231815] shadow-md' 
                          : idx === 1 
                          ? 'bg-[#A5BCD6] text-[#231815]' 
                          : 'bg-[#18100E] text-[#A5BCD6] border border-[#4A2E27]'
                      }`}>
                        {page.rank}
                      </span>
                    </td>

                    {/* Page Title */}
                    <td className="py-3 px-3">
                      <div className="flex items-center space-x-2">
                        <span className="font-headline font-bold text-[#F5EFC6]">{page.title}</span>
                        {isTop1 && (
                          <span className="text-[9px] uppercase tracking-wider bg-[#4D0E12] text-[#F5EFC6] px-2 py-0.5 rounded-full border border-[#F5EFC6]/40 font-subhead font-bold">
                            #1 Most Visited
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Path */}
                    <td className="py-3 px-3 font-mono text-[11px] text-[#A5BCD6]">
                      {page.path}
                    </td>

                    {/* Total Views */}
                    <td className="py-3 px-3 text-right font-bold text-[#F5EFC6] font-subhead">
                      {page.views.toLocaleString()}
                    </td>

                    {/* Unique Visitors */}
                    <td className="py-3 px-3 text-right text-[#A5BCD6] font-subhead">
                      {page.uniqueVisitors.toLocaleString()}
                    </td>

                    {/* Percentage */}
                    <td className="py-3 px-3 text-right font-bold text-[#F5EFC6] font-subhead">
                      {page.percentage}%
                    </td>

                    {/* Progress Bar */}
                    <td className="py-3 px-3 min-w-[140px]">
                      <div className="w-full bg-[#18100E] rounded-full h-2.5 overflow-hidden border border-[#4A2E27]">
                        <div
                          style={{ width: `${page.percentage}%` }}
                          className={`h-full rounded-full transition-all duration-500 ${
                            isTop1 ? 'bg-[#F5EFC6]' : 'bg-[#A5BCD6]'
                          }`}
                        ></div>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 5. "WHICH PRODUCT WERE BOUGHT MORE" (TOP GUMMIES LEADERBOARD) */}
      {/* ============================================================== */}
      <div className="p-6 rounded-2xl bg-[#2F201C] border-2 border-[#4A2E27] shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#4A2E27] pb-3">
          <div>
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4 text-amber-400" />
              <h3 className="font-headline font-black text-lg text-[#F5EFC6] uppercase tracking-wide">
                Top Selling Coffee Gummies & Conversion Leaderboard
              </h3>
            </div>
            <p className="text-[11px] text-[#A5BCD6] font-body">
              Which gummy flavors generated the most units, gross revenue, and customer view conversions
            </p>
          </div>

          <button
            onClick={onSwitchToStockPlanning}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#4D0E12] hover:bg-[#4D0E12]/80 text-[#F5EFC6] border border-[#F5EFC6]/30 transition-all font-headline font-bold text-xs uppercase tracking-wider"
          >
            <TrendingUp className="w-3.5 h-3.5 text-[#F5EFC6]" />
            <span>Open Stock Planning</span>
          </button>
        </div>

        {/* Table of Top Products */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-body">
            <thead>
              <tr className="border-b border-[#4A2E27] text-[#A5BCD6] font-subhead font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3">Bestseller Rank</th>
                <th className="py-3 px-3">Gummy Flavor</th>
                <th className="py-3 px-3">Flavor Profile</th>
                <th className="py-3 px-3 text-right">Units Sold</th>
                <th className="py-3 px-3 text-right">Gross Revenue</th>
                <th className="py-3 px-3 text-right">Canisters Stock</th>
                <th className="py-3 px-3 text-right">View-to-Buy Conv.</th>
                <th className="py-3 px-3">Sales Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#4A2E27]/40">
              {productSales.ranked.map((prod, idx) => {
                return (
                  <tr key={prod.id || idx} className="hover:bg-[#3B2822]/40 transition-colors">
                    
                    {/* Rank Badge */}
                    <td className="py-3 px-3 font-headline">
                      <div className="flex items-center space-x-1">
                        {idx === 0 && <span className="text-base" title="Top Bestseller">🥇</span>}
                        {idx === 1 && <span className="text-base" title="2nd Bestseller">🥈</span>}
                        {idx === 2 && <span className="text-base" title="3rd Bestseller">🥉</span>}
                        <span className="font-bold text-[#F5EFC6]">#{prod.rank}</span>
                      </div>
                    </td>

                    {/* Product Name & Thumbnail */}
                    <td className="py-3 px-3">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={prod.image_url || '/assets/brand/packaging-canisters.jpg'} 
                          alt={prod.name}
                          className="w-9 h-9 rounded-lg object-cover border border-[#4A2E27] bg-[#18100E]"
                          onError={(e) => {
                            e.target.src = '/assets/brand/packaging-canisters.jpg';
                          }}
                        />
                        <div>
                          <p className="font-headline font-bold text-[#F5EFC6] uppercase">{prod.name}</p>
                          <span className="text-[10px] text-[#A5BCD6] font-subhead">${prod.price?.toFixed(2)} / canister</span>
                        </div>
                      </div>
                    </td>

                    {/* Flavor Profile */}
                    <td className="py-3 px-3 font-subhead">
                      <span className="bg-[#18100E] border border-[#4A2E27] px-2 py-0.5 rounded text-[10px] text-[#A5BCD6]">
                        {prod.roast_level}
                      </span>
                    </td>

                    {/* Units Sold */}
                    <td className="py-3 px-3 text-right font-subhead">
                      <span className="font-bold text-sm text-[#F5EFC6] bg-[#4D0E12]/60 px-2.5 py-0.5 rounded border border-[#F5EFC6]/20">
                        {prod.units_sold} canisters
                      </span>
                    </td>

                    {/* Gross Revenue */}
                    <td className="py-3 px-3 text-right font-bold text-[#F5EFC6] font-subhead">
                      ${prod.total_revenue?.toFixed(2)}
                    </td>

                    {/* Stock Remaining */}
                    <td className="py-3 px-3 text-right font-subhead">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        prod.stock_quantity <= 10 
                          ? 'bg-red-950 text-red-300 border border-red-800'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}>
                        {prod.stock_quantity} in stock
                      </span>
                    </td>

                    {/* Conversion Rate */}
                    <td className="py-3 px-3 text-right font-mono text-emerald-400 font-bold">
                      {prod.conversion_rate}%
                    </td>

                    {/* Sales Share % */}
                    <td className="py-3 px-3 min-w-[120px]">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-[#18100E] rounded-full h-2 overflow-hidden border border-[#4A2E27]">
                          <div 
                            style={{ width: `${prod.share_of_sales}%` }}
                            className="bg-emerald-400 h-full rounded-full"
                          ></div>
                        </div>
                        <span className="text-[10px] text-[#A5BCD6] w-7 text-right font-mono">{prod.share_of_sales}%</span>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 6. PACK PREFERENCES & SLOW-MOVING INVENTORY ALERT */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Customer Pack Selection Breakdown */}
        <div className="p-5 rounded-2xl bg-[#2F201C] border-2 border-[#4A2E27] shadow-xl space-y-3">
          <div className="border-b border-[#4A2E27] pb-3">
            <h3 className="font-headline font-bold text-base text-[#F5EFC6] flex items-center space-x-2 uppercase tracking-wide">
              <Coffee className="w-4 h-4 text-[#A5BCD6]" />
              <span>Customer Pack Selection Preferences</span>
            </h3>
            <p className="text-[11px] text-[#A5BCD6] font-body">How customers select their coffee gummy packaging formats</p>
          </div>

          <div className="space-y-2 pt-1 font-subhead">
            {productSales.grindPreferences?.map((g, idx) => (
              <div key={g.grind_type || idx} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-[#F5EFC6]">{g.grind_type}</span>
                  <span className="text-[#A5BCD6]">{g.units_sold} canisters ({g.percentage}%)</span>
                </div>
                <div className="w-full bg-[#18100E] rounded-full h-2 overflow-hidden border border-[#4A2E27]">
                  <div 
                    style={{ width: `${g.percentage}%` }}
                    className="bg-[#A5BCD6] h-full rounded-full"
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Slow-Moving Products Advisory */}
        <div className="p-5 rounded-2xl bg-[#2F201C] border-2 border-[#4A2E27] shadow-xl space-y-3 flex flex-col justify-between">
          <div>
            <div className="border-b border-[#4A2E27] pb-3 mb-3">
              <h3 className="font-headline font-bold text-base text-[#F5EFC6] flex items-center space-x-2 uppercase tracking-wide">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span>Low-Turnover Gummy Varieties Advisory</span>
              </h3>
              <p className="text-[11px] text-[#A5BCD6] font-body">Flavors with lowest turnover requiring restock balance</p>
            </div>

            <div className="space-y-2 font-subhead">
              {productSales.slowMovers?.slice(0, 3).map((item) => (
                <div key={item.id} className="p-2.5 rounded-xl bg-[#18100E] border border-[#4A2E27] flex items-center justify-between">
                  <div>
                    <p className="font-headline font-bold text-[#F5EFC6] uppercase">{item.name}</p>
                    <span className="text-[10px] text-[#A5BCD6]">{item.units_sold} canisters sold • {item.stock_quantity} left</span>
                  </div>
                  <span className="text-[10px] text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800 font-semibold">
                    Low Velocity
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[#4A2E27] flex items-center justify-between font-subhead">
            <span className="text-[11px] text-[#A5BCD6]">Want to reorder or rebalance stock?</span>
            <button
              onClick={onSwitchToStockPlanning}
              className="px-3 py-1.5 rounded-lg bg-[#4D0E12] hover:bg-[#4D0E12]/80 text-[#F5EFC6] font-headline font-bold text-xs uppercase tracking-wider border border-[#F5EFC6]/20 transition-all flex items-center space-x-1"
            >
              <span>View Stock Plan</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
