import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateOrderFulfillment } from '../store/marketplaceSlice';
import BrandLogo from './BrandLogo';
import { 
  Truck, 
  Printer, 
  Check, 
  QrCode, 
  Barcode, 
  Layers, 
  Search, 
  Package, 
  Calendar,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Mail,
  MessageSquare,
  Send,
  Sparkles
} from 'lucide-react';

export default function ShippingFulfillmentTab({ onShowNotice }) {
  const dispatch = useDispatch();
  const { orders } = useSelector((state) => state.orders);
  const [selectedOrder, setSelectedOrder] = useState(orders[0] || null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [courierName, setCourierName] = useState('Roastery Express Courier');
  const [orderStep, setOrderStep] = useState(3);
  const [saving, setSaving] = useState(false);

  // Sync inputs when selecting an order
  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
    setTrackingNumber(order.tracking_number || `ROAST-AWB-${order.id}9482`);
    setCourierName(order.courier_name || 'Roastery Express Courier');
    setOrderStep(order.order_step || 2);
  };

  const handleUpdateFulfillment = async () => {
    if (!selectedOrder) return;
    setSaving(true);
    let newStatus = selectedOrder.status;
    if (orderStep === 2) newStatus = 'Processing';
    if (orderStep === 3 || orderStep === 4) newStatus = 'Shipped';
    if (orderStep === 5) newStatus = 'Delivered';

    await dispatch(updateOrderFulfillment({
      id: selectedOrder.id,
      data: {
        tracking_number: trackingNumber,
        courier_name: courierName,
        order_step: orderStep,
        status: newStatus
      }
    }));
    setSaving(false);
    if (onShowNotice) {
      if (newStatus === 'Shipped') {
        onShowNotice(`Order #${selectedOrder.order_number} marked Shipped! 📧 Mail & 📱 SMS tracking dispatched to customer.`);
      } else if (newStatus === 'Delivered') {
        onShowNotice(`Order #${selectedOrder.order_number} marked Delivered! 📧 Mail & 📱 SMS delivered alert sent.`);
      } else if (newStatus === 'Processing') {
        onShowNotice(`Order #${selectedOrder.order_number} set to Processing! 📧 Mail & 📱 SMS sent.`);
      } else {
        onShowNotice(`Fulfillment & AWB for #${selectedOrder.order_number} updated! 📧 Mail & 📱 SMS sent.`);
      }
    }
  };


  const handlePrintLabel = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in font-subhead">
      
      {/* Tab Header Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#2F201C] border-2 border-[#4A2E27] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 paper-crease-h print:hidden">
        <div>
          <div className="flex items-center space-x-2 text-xs text-[#A5BCD6] font-bold uppercase tracking-wider mb-1">
            <Truck className="w-4 h-4 text-emerald-400" />
            <span>Warehouse Dispatch & Logistics Pipeline</span>
          </div>
          <h2 className="font-headline font-black text-2xl text-[#F5EFC6] uppercase tracking-tight">
            Shipping Labels & AWB Fulfillment
          </h2>
          <p className="font-body text-xs text-[#F5EFC6]/75 mt-0.5">
            Assign logistics carriers, print standard 4×6 thermal parcel labels, and progress tracking stages.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 print:block">
        
        {/* Left Column (4 cols): Orders Queue (Hidden on print) */}
        <div className="lg:col-span-4 bg-[#2F201C] border-2 border-[#4A2E27] rounded-3xl p-4 space-y-3 print:hidden">
          <div className="flex items-center justify-between pb-2 border-b border-[#4A2E27]">
            <span className="font-headline font-bold text-xs uppercase tracking-wider text-[#A5BCD6]">
              Orders to Dispatch ({orders.length})
            </span>
            <span className="text-[10px] text-[#F5EFC6]/60">Select to Print</span>
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {orders.map((o) => (
              <div
                key={o.id}
                onClick={() => handleSelectOrder(o)}
                className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                  selectedOrder?.id === o.id
                    ? 'bg-[#4D0E12] border-[#F5EFC6]/50 shadow-md ring-1 ring-[#F5EFC6]/30'
                    : 'bg-[#18100E] border-[#4A2E27] hover:border-[#A5BCD6]/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-headline font-bold text-xs text-[#F5EFC6]">{o.order_number}</span>
                  <span className="text-[10px] text-emerald-400 font-bold">₹{parseFloat(o.total_amount).toFixed(0)}</span>
                </div>
                <p className="text-[11px] text-[#A5BCD6] truncate">{o.customer_name}</p>
                <div className="flex justify-between items-center text-[10px] text-[#F5EFC6]/60 pt-1">
                  <span>{o.status}</span>
                  <span>Step {o.order_step || 2} of 5</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (8 cols): Label Preview & Fulfillment Controls */}
        <div className="lg:col-span-8 space-y-6">
          
          {selectedOrder && (
            <>
              {/* Dispatch Controls Card (Hidden on print) */}
              <div className="p-5 rounded-3xl bg-[#2F201C] border-2 border-[#4A2E27] space-y-4 print:hidden">
                <div className="flex items-center justify-between pb-3 border-b border-[#4A2E27]">
                  <h4 className="font-headline font-bold text-xs uppercase tracking-wider text-[#A5BCD6]">
                    Logistics Carrier & Tracking Stage Controls
                  </h4>
                  <button
                    onClick={handlePrintLabel}
                    className="px-4 py-2 rounded-xl bg-[#4D0E12] hover:bg-[#4D0E12]/90 text-[#F5EFC6] text-xs font-bold uppercase tracking-wider border border-[#F5EFC6]/30 flex items-center space-x-1.5 shadow-md"
                  >
                    <Printer className="w-4 h-4 text-[#A5BCD6]" />
                    <span>Print Thermal Label (4×6)</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="text-[10px] uppercase text-[#A5BCD6] block mb-1">Courier Partner</label>
                    <select
                      value={courierName}
                      onChange={(e) => setCourierName(e.target.value)}
                      style={{ colorScheme: 'dark' }}
                      className="w-full bg-[#18100E] border border-[#4A2E27] rounded-xl px-3 py-2 text-xs text-[#F5EFC6]"
                    >
                      <option>Roastery Express Logistics</option>
                      <option>Delhivery Surface & Air</option>
                      <option>BlueDart Express Priority</option>
                      <option>DTDC Smart Parcel</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase text-[#A5BCD6] block mb-1">AWB Tracking Code</label>
                    <input
                      type="text"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      className="w-full bg-[#18100E] border border-[#4A2E27] rounded-xl px-3 py-2 text-xs text-[#F5EFC6] font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase text-[#A5BCD6] block mb-1">Customer Stepper Stage</label>
                    <select
                      value={orderStep}
                      onChange={(e) => setOrderStep(parseInt(e.target.value, 10))}
                      style={{ colorScheme: 'dark' }}
                      className="w-full bg-[#18100E] border border-[#4A2E27] rounded-xl px-3 py-2 text-xs text-[#F5EFC6]"
                    >
                      <option value={1}>1: Order Confirmed</option>
                      <option value={2}>2: Packed at Roastery</option>
                      <option value={3}>3: Dispatched to Courier</option>
                      <option value={4}>4: Out for Delivery</option>
                      <option value={5}>5: Delivered</option>
                    </select>
                  </div>
                </div>

                {/* Auto-Notification Summary Badge */}
                <div className="p-3 rounded-2xl bg-[#18100E] border border-[#4A2E27] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center space-x-2 text-[#A5BCD6]">
                    <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>
                      Automatic Alerts: Customer is instantly notified via <strong className="text-[#F5EFC6]">Email</strong> & <strong className="text-[#F5EFC6]">SMS</strong> on status updates.
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-[11px] font-mono">
                    <span className="px-2 py-0.5 rounded-lg bg-[#231815] border border-[#4A2E27] text-blue-300 flex items-center space-x-1" title="Customer Email">
                      <Mail className="w-3 h-3 text-blue-400" />
                      <span className="truncate max-w-[130px]">{selectedOrder.customer_email}</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-[#231815] border border-[#4A2E27] text-emerald-400 flex items-center space-x-1" title="Customer Phone (SMS)">
                      <MessageSquare className="w-3 h-3 text-emerald-400" />
                      <span>{selectedOrder.customer_phone || 'SMS Alert'}</span>
                    </span>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    disabled={saving}
                    onClick={handleUpdateFulfillment}
                    className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider border border-emerald-500 shadow-lg transition-all flex items-center space-x-2 active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{saving ? 'Dispatching & Notifying...' : 'Sync Tracking & Send Email + SMS'}</span>
                  </button>
                </div>
              </div>


              {/* 4×6 THERMAL SHIPPING LABEL (Print Optimized) */}
              <div className="bg-white text-black p-6 rounded-2xl border-2 border-black max-w-md mx-auto shadow-2xl font-mono text-xs print:m-0 print:border-none print:shadow-none print:p-0">
                {/* Header Band */}
                <div className="flex items-center justify-between pb-3 border-b-2 border-black">
                  <div>
                    <h3 className="font-black text-lg tracking-tight uppercase leading-none">THE BEAN CO.</h3>
                    <span className="text-[10px] font-bold">ROASTERY DIRECT EXPRESS</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black uppercase bg-black text-white px-2 py-0.5">EXPRESS</span>
                  </div>
                </div>

                {/* Routing & Barcode Visual */}
                <div className="py-3 border-b-2 border-black text-center space-y-1">
                  <div className="font-bold text-sm tracking-wider">{trackingNumber}</div>
                  {/* Simulated standard thermal barcode lines */}
                  <div className="h-12 w-full bg-[repeating-linear-gradient(90deg,black_0px,black_2px,white_2px,white_4px,black_4px,black_7px,white_7px,white_9px)] mx-auto"></div>
                  <div className="text-[9px] uppercase tracking-widest">{courierName} • AIR / SURFACE CARGO</div>
                </div>

                {/* Deliver To Details */}
                <div className="py-3 border-b-2 border-black space-y-1">
                  <span className="text-[9px] uppercase font-bold block">SHIP TO:</span>
                  <div className="font-black text-sm">{selectedOrder.customer_name}</div>
                  <div className="text-xs font-semibold leading-snug">{selectedOrder.shipping_address}</div>
                  <div className="text-xs font-bold pt-1">PHONE: {selectedOrder.customer_phone || '+91 98765 43210'}</div>
                </div>

                {/* Return Address & Package Attributes */}
                <div className="py-2 border-b-2 border-black grid grid-cols-2 text-[10px] gap-2">
                  <div>
                    <span className="font-bold block">FROM:</span>
                    <span>The Bean Co. Roastery</span>
                    <span className="block">Indiranagar, Bengaluru</span>
                    <span>PIN: 560038</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold block">ORDER NO:</span>
                    <span className="font-bold">{selectedOrder.order_number}</span>
                    <span className="block">WEIGHT: 0.35 KG</span>
                    <span className="font-bold text-xs">{selectedOrder.payment_method?.startsWith('Cash') ? 'COD: COLLECT ₹' + selectedOrder.total_amount : 'PREPAID ✓'}</span>
                  </div>
                </div>

                {/* Content Verification */}
                <div className="pt-2 text-[9px] flex items-center justify-between">
                  <span>Contains: Specialty Coffee Gummy Canisters</span>
                  <span className="font-bold">HANDLE WITH CARE</span>
                </div>
              </div>
            </>
          )}

        </div>

      </div>

    </div>
  );
}
