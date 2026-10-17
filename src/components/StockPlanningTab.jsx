import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAnalyticsDashboard, restockProductFromPlanning } from '../store/analyticsSlice';
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Flame, 
  Package, 
  Plus, 
  RefreshCw, 
  ArrowUpRight, 
  Sliders, 
  ShieldAlert, 
  Clock, 
  Layers,
  Sparkles,
  HelpCircle,
  Coffee
} from 'lucide-react';

export default function StockPlanningTab({ onShowNotice }) {
  const dispatch = useDispatch();
  const { data: analyticsData, timeRange, status } = useSelector((state) => state.analytics);

  // Target safety buffer days (14, 21, or 30 days)
  const [targetBufferDays, setTargetBufferDays] = useState(21);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [customRestockInputs, setCustomRestockInputs] = useState({});
  const [isUpdatingId, setIsUpdatingId] = useState(null);

  useEffect(() => {
    if (!analyticsData) {
      dispatch(fetchAnalyticsDashboard('7d'));
    }
  }, [dispatch, analyticsData]);

  const stockInfo = analyticsData?.stockPlanning || { summary: {}, products: [] };
  const products = stockInfo.products || [];
  const summary = stockInfo.summary || {};

  // Handle 1-click batch restock
  const handleQuickRestock = async (product, addQty) => {
    setIsUpdatingId(product.id);
    const newStock = product.stock_quantity + addQty;
    try {
      await dispatch(restockProductFromPlanning({ productId: product.id, newStock })).unwrap();
      if (onShowNotice) {
        onShowNotice(`Restocked ${product.name} (+${addQty} canisters)! New stock: ${newStock}`);
      }
    } catch (err) {
      alert(`Failed to restock: ${err}`);
    } finally {
      setIsUpdatingId(null);
    }
  };

  // Handle custom numeric restock input
  const handleCustomRestock = async (product) => {
    const val = parseInt(customRestockInputs[product.id], 10);
    if (isNaN(val) || val <= 0) return;

    setIsUpdatingId(product.id);
    const newStock = product.stock_quantity + val;
    try {
      await dispatch(restockProductFromPlanning({ productId: product.id, newStock })).unwrap();
      setCustomRestockInputs((prev) => ({ ...prev, [product.id]: '' }));
      if (onShowNotice) {
        onShowNotice(`Restocked ${product.name} (+${val} canisters)! New stock: ${newStock}`);
      }
    } catch (err) {
      alert(`Failed to restock: ${err}`);
    } finally {
      setIsUpdatingId(null);
    }
  };

  // Filter products by status
  const filteredProducts = products.filter((prod) => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'CRITICAL') return prod.status === 'CRITICAL' || prod.status === 'OUT_OF_STOCK';
    if (statusFilter === 'RESTOCK_SOON') return prod.status === 'RESTOCK_SOON';
    if (statusFilter === 'OPTIMAL') return prod.status === 'OPTIMAL';
    if (statusFilter === 'OVERSTOCKED') return prod.status === 'OVERSTOCKED' || prod.status === 'LOW_SLOW';
    return true;
  });

  return (
    <div className="space-y-8 animate-fade-in text-xs font-body">

      {/* ============================================================== */}
      {/* 1. TOP BANNER & TARGET BUFFER CONTROLS */}
      {/* ============================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#2F201C] border-2 border-[#4A2E27] shadow-xl">
        <div>
          <div className="flex items-center space-x-2 mb-1.5 font-subhead">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#A5BCD6] bg-[#4D0E12] px-2.5 py-0.5 rounded-full border border-[#F5EFC6]/20">
              Canister Batch Telemetry
            </span>
            <span className="text-[10px] text-amber-300 flex items-center space-x-1 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Predictive Run-Out Forecasting Active</span>
            </span>
          </div>
          <h2 className="font-headline font-black text-xl sm:text-2xl text-[#F5EFC6] uppercase tracking-wide">
            Canister Inventory & Stock Run-Out Projections
          </h2>
          <p className="text-[#A5BCD6] text-xs font-body">
            Calculate daily canister burn rates, project stockout timelines, and execute planned batch replenishment
          </p>
        </div>

        {/* Target Safety Buffer Setting */}
        <div className="flex items-center space-x-3 bg-[#18100E] px-4 py-2.5 rounded-xl border border-[#4A2E27]">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-[#A5BCD6] block">Safety Stock Target</span>
            <span className="text-xs text-[#F5EFC6] font-semibold">{targetBufferDays}-Day Buffer</span>
          </div>
          <div className="flex items-center space-x-1 bg-[#2F201C] p-1 rounded-lg border border-[#4A2E27]">
            {[14, 21, 30].map((days) => (
              <button
                key={days}
                onClick={() => setTargetBufferDays(days)}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                  targetBufferDays === days
                    ? 'bg-[#4D0E12] text-[#F5EFC6] shadow'
                    : 'text-[#A5BCD6] hover:text-[#F5EFC6]'
                }`}
              >
                {days}d
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. EXECUTIVE STATUS PILL SUMMARY CARDS */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 font-subhead">
        
        {/* Critical Attention */}
        <div 
          onClick={() => setStatusFilter(statusFilter === 'CRITICAL' ? 'ALL' : 'CRITICAL')}
          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
            statusFilter === 'CRITICAL' 
              ? 'bg-red-950/90 border-red-500 shadow-xl ring-2 ring-red-500/40' 
              : 'bg-red-950/40 border-red-900/80 hover:bg-red-950/60'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase tracking-wider text-red-300 font-semibold">Critical Stockout Risk</span>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <p className="font-headline font-black text-3xl text-red-100">
            {summary.criticalCount || 0}
          </p>
          <span className="text-[10px] text-red-300 block mt-1 font-body">Depleting in &le; 4 days or stock &le; 10 canisters</span>
        </div>

        {/* Restock Soon */}
        <div 
          onClick={() => setStatusFilter(statusFilter === 'RESTOCK_SOON' ? 'ALL' : 'RESTOCK_SOON')}
          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
            statusFilter === 'RESTOCK_SOON' 
              ? 'bg-amber-950/90 border-amber-500 shadow-xl ring-2 ring-amber-500/40' 
              : 'bg-amber-950/40 border-amber-900/80 hover:bg-amber-950/60'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase tracking-wider text-amber-300 font-semibold">Restock Needed Soon</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="font-headline font-black text-3xl text-amber-100">
            {summary.restockSoonCount || 0}
          </p>
          <span className="text-[10px] text-amber-300 block mt-1 font-body">Depletes within 5 – 10 days</span>
        </div>

        {/* Optimal Buffer */}
        <div 
          onClick={() => setStatusFilter(statusFilter === 'OPTIMAL' ? 'ALL' : 'OPTIMAL')}
          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
            statusFilter === 'OPTIMAL' 
              ? 'bg-emerald-950/90 border-emerald-500 shadow-xl ring-2 ring-emerald-500/40' 
              : 'bg-emerald-950/40 border-emerald-900/80 hover:bg-emerald-950/60'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase tracking-wider text-emerald-300 font-semibold">Healthy Inventory</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="font-headline font-black text-3xl text-emerald-100">
            {summary.optimalCount || 0}
          </p>
          <span className="text-[10px] text-emerald-300 block mt-1 font-body">11 – 30 days coverage available</span>
        </div>

        {/* Overstocked / Slow Movers */}
        <div 
          onClick={() => setStatusFilter(statusFilter === 'OVERSTOCKED' ? 'ALL' : 'OVERSTOCKED')}
          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
            statusFilter === 'OVERSTOCKED' 
              ? 'bg-blue-950/90 border-blue-500 shadow-xl ring-2 ring-blue-500/40' 
              : 'bg-blue-950/40 border-blue-900/80 hover:bg-blue-950/60'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] uppercase tracking-wider text-blue-300 font-semibold">Slow Mover / Overstocked</span>
            <Layers className="w-4 h-4 text-blue-400" />
          </div>
          <p className="font-headline font-black text-3xl text-blue-100">
            {summary.overstockedCount || 0}
          </p>
          <span className="text-[10px] text-blue-300 block mt-1 font-body">&gt; 30 days stock or slow turnover</span>
        </div>

      </div>

      {/* ============================================================== */}
      {/* 3. ROASTER'S STRATEGIC PRODUCTION DIRECTIVES */}
      {/* ============================================================== */}
      <div className="p-5 rounded-2xl bg-[#2F201C] border-2 border-[#4A2E27] shadow-xl space-y-3">
        <div className="flex items-center space-x-2 border-b border-[#4A2E27] pb-2.5">
          <ShieldAlert className="w-4 h-4 text-[#A5BCD6]" />
          <h3 className="font-headline font-bold text-base text-[#F5EFC6] uppercase tracking-wide">
            Batch Production Recommendations & Strategic Directives
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 font-body">
          {products.filter(p => p.priority <= 3).map((item) => (
            <div key={item.id} className="p-3 rounded-xl bg-[#18100E] border border-red-900/60 flex items-start space-x-3">
              <span className="text-lg">🔥</span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-headline font-bold text-[#F5EFC6] text-xs uppercase">{item.name}</p>
                  <span className="text-[10px] bg-red-950 text-red-300 px-2 py-0.5 rounded border border-red-800 font-subhead font-semibold">
                    {item.days_remaining} Days Left
                  </span>
                </div>
                <p className="text-[11px] text-[#A5BCD6] mt-0.5">{item.action_advice}</p>
              </div>
            </div>
          ))}

          {products.filter(p => p.status === 'OVERSTOCKED').slice(0, 2).map((item) => (
            <div key={item.id} className="p-3 rounded-xl bg-[#18100E] border border-blue-900/60 flex items-start space-x-3">
              <span className="text-lg">📦</span>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-headline font-bold text-[#F5EFC6] text-xs uppercase">{item.name}</p>
                  <span className="text-[10px] bg-blue-950 text-blue-300 px-2 py-0.5 rounded border border-blue-800 font-subhead font-semibold">
                    Overstocked
                  </span>
                </div>
                <p className="text-[11px] text-[#A5BCD6] mt-0.5">{item.action_advice}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. INTERACTIVE STOCK RUN-OUT & REPLENISHMENT TABLE */}
      {/* ============================================================== */}
      <div className="p-6 rounded-2xl bg-[#2F201C] border-2 border-[#4A2E27] shadow-xl space-y-4">
        
        {/* Filter Tab bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#4A2E27] pb-3">
          <div>
            <h3 className="font-headline font-black text-lg text-[#F5EFC6] flex items-center space-x-2 uppercase tracking-wide">
              <Package className="w-4 h-4 text-[#A5BCD6]" />
              <span>Coffee Gummy Canisters & 1-Click Replenishment</span>
            </h3>
            <p className="text-[11px] text-[#A5BCD6] font-body">
              Real-time calculations based on recent canister sales velocity
            </p>
          </div>

          <div className="flex items-center space-x-1 bg-[#18100E] p-1 rounded-xl border border-[#4A2E27] flex-wrap font-subhead">
            {[
              { id: 'ALL', label: `All (${products.length})` },
              { id: 'CRITICAL', label: `🚨 Critical (${summary.criticalCount || 0})` },
              { id: 'RESTOCK_SOON', label: `⚠️ Soon (${summary.restockSoonCount || 0})` },
              { id: 'OPTIMAL', label: `✅ Healthy (${summary.optimalCount || 0})` },
              { id: 'OVERSTOCKED', label: `📦 Overstock (${summary.overstockedCount || 0})` }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  statusFilter === f.id
                    ? 'bg-[#4D0E12] text-[#F5EFC6] border border-[#F5EFC6]/20'
                    : 'text-[#A5BCD6] hover:text-[#F5EFC6]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* The Table */}
        <div className="overflow-x-auto touch-scroll">
          <table className="w-full text-left text-xs font-body">
            <thead>
              <tr className="border-b border-[#4A2E27] text-[#A5BCD6] font-subhead font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-3">Gummy Flavor</th>
                <th className="py-3 px-3 text-right">Current Stock</th>
                <th className="py-3 px-3 text-right">Sales Velocity</th>
                <th className="py-3 px-3">Run-Out Projection</th>
                <th className="py-3 px-3 text-center">Stock Health</th>
                <th className="py-3 px-3 text-right">Suggested Restock</th>
                <th className="py-3 px-3">1-Click Quick Restock Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#4A2E27]/40">
              {filteredProducts.map((prod) => {
                // Calculate dynamic suggested reorder based on selected target buffer
                const calculatedBufferRestock = Math.max(
                  0,
                  Math.ceil(prod.daily_burn_rate * targetBufferDays) - prod.stock_quantity
                );
                const isCritical = prod.status === 'CRITICAL' || prod.status === 'OUT_OF_STOCK';
                const isUpdating = isUpdatingId === prod.id;

                return (
                  <tr key={prod.id} className="hover:bg-[#3B2822]/40 transition-colors">
                    
                    {/* Product Name & Image */}
                    <td className="py-3 px-3">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={prod.image_url || '/assets/brand/packaging-canisters.jpg'} 
                          alt={prod.name}
                          className="w-10 h-10 rounded-xl object-cover border border-[#4A2E27] bg-[#18100E] shrink-0"
                          onError={(e) => {
                            e.target.src = '/assets/brand/packaging-canisters.jpg';
                          }}
                        />
                        <div>
                          <p className="font-headline font-bold text-[#F5EFC6] text-xs uppercase">{prod.name}</p>
                          <div className="flex items-center space-x-1.5 mt-0.5">
                            <span className="text-[10px] text-[#A5BCD6] font-subhead">{prod.roast_level}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Current Stock */}
                    <td className="py-3 px-3 text-right font-subhead">
                      <span className={`font-mono font-bold text-sm px-2.5 py-1 rounded-lg border ${
                        prod.stock_quantity <= 10 
                          ? 'bg-red-950 text-red-300 border-red-800' 
                          : 'bg-[#18100E] text-[#F5EFC6] border-[#4A2E27]'
                      }`}>
                        {prod.stock_quantity} canisters
                      </span>
                    </td>

                    {/* Sales Velocity (burn rate) */}
                    <td className="py-3 px-3 text-right font-subhead">
                      <div className="flex flex-col items-end">
                        <span className="font-mono font-bold text-xs text-[#F5EFC6]">
                          {prod.daily_burn_rate}
                        </span>
                        <span className="text-[9px] text-[#A5BCD6]">canisters / day</span>
                      </div>
                    </td>

                    {/* Days Until Out (Visual meter + countdown) */}
                    <td className="py-3 px-3 min-w-[150px]">
                      <div className="space-y-1">
                        <div className="flex justify-between items-baseline text-[11px] font-subhead">
                          <span className={`font-bold ${
                            isCritical ? 'text-red-400' : (prod.status === 'RESTOCK_SOON' ? 'text-amber-400' : 'text-emerald-400')
                          }`}>
                            {prod.days_remaining} Days
                          </span>
                          <span className="text-[9px] text-[#A5BCD6]">estimated</span>
                        </div>
                        
                        <div className="w-full bg-[#18100E] rounded-full h-2 overflow-hidden border border-[#4A2E27]">
                          <div
                            style={{ 
                              width: `${Math.min(100, prod.days_remaining_num === 999 ? 100 : Math.round((prod.days_remaining_num / 30) * 100))}%` 
                            }}
                            className={`h-full rounded-full transition-all duration-500 ${
                              isCritical 
                                ? 'bg-red-500' 
                                : prod.status === 'RESTOCK_SOON' 
                                ? 'bg-amber-400' 
                                : 'bg-emerald-400'
                            }`}
                          ></div>
                        </div>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-3 text-center font-subhead">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        prod.status === 'OUT_OF_STOCK'
                          ? 'bg-red-950 text-red-200 border-red-800'
                          : prod.status === 'CRITICAL'
                          ? 'bg-red-950 text-red-300 border-red-800 animate-pulse'
                          : prod.status === 'RESTOCK_SOON'
                          ? 'bg-amber-950 text-amber-300 border-amber-800'
                          : prod.status === 'OPTIMAL'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : 'bg-blue-950 text-blue-300 border-blue-800'
                      }`}>
                        {prod.statusLabel}
                      </span>
                    </td>

                    {/* Suggested Restock Batch */}
                    <td className="py-3 px-3 text-right font-subhead">
                      {calculatedBufferRestock > 0 ? (
                        <span className="font-bold text-xs text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
                          +{calculatedBufferRestock} canisters
                        </span>
                      ) : (
                        <span className="text-[#A5BCD6] text-[11px]">— Buffer Met —</span>
                      )}
                    </td>

                    {/* Quick Restock Action Buttons */}
                    <td className="py-3 px-3 font-subhead">
                      <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                        
                        {/* +10 Button */}
                        <button
                          disabled={isUpdating}
                          onClick={() => handleQuickRestock(prod, 10)}
                          className="px-2 py-1 rounded-lg bg-[#2F201C] hover:bg-[#4D0E12] text-[#F5EFC6] text-[10px] font-semibold border border-[#4A2E27] transition-all disabled:opacity-50"
                          title="Add 10 canisters to inventory"
                        >
                          +10
                        </button>

                        {/* +25 Button */}
                        <button
                          disabled={isUpdating}
                          onClick={() => handleQuickRestock(prod, 25)}
                          className="px-2 py-1 rounded-lg bg-[#2F201C] hover:bg-[#4D0E12] text-[#F5EFC6] text-[10px] font-semibold border border-[#4A2E27] transition-all disabled:opacity-50"
                          title="Add 25 canisters to inventory"
                        >
                          +25
                        </button>

                        {/* +50 Button */}
                        <button
                          disabled={isUpdating}
                          onClick={() => handleQuickRestock(prod, 50)}
                          className="px-2 py-1 rounded-lg bg-[#2F201C] hover:bg-[#4D0E12] text-[#F5EFC6] text-[10px] font-semibold border border-[#4A2E27] transition-all disabled:opacity-50"
                          title="Add 50 canisters to inventory"
                        >
                          +50
                        </button>

                        {/* Custom Input */}
                        <div className="flex items-center space-x-1">
                          <input
                            type="number"
                            min="1"
                            placeholder="Qty"
                            value={customRestockInputs[prod.id] || ''}
                            onChange={(e) => setCustomRestockInputs({ ...customRestockInputs, [prod.id]: e.target.value })}
                            className="w-14 bg-[#18100E] border border-[#4A2E27] rounded-lg px-2 py-1 text-[10px] text-[#F5EFC6] focus:outline-none focus:border-[#A5BCD6]"
                          />
                          <button
                            disabled={isUpdating || !customRestockInputs[prod.id]}
                            onClick={() => handleCustomRestock(prod)}
                            className="p-1 rounded-lg bg-[#4D0E12] hover:bg-[#4D0E12]/80 text-[#F5EFC6] border border-[#F5EFC6]/20 transition-all disabled:opacity-40"
                            title="Apply custom restock quantity"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
