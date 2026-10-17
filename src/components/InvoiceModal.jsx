import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { closeInvoiceModal } from '../store/marketplaceSlice';
import BrandLogo from './BrandLogo';
import { 
  X, 
  Printer, 
  Download, 
  CheckCircle2, 
  ShieldCheck, 
  FileText,
  Building2,
  Calendar,
  CreditCard
} from 'lucide-react';

export default function InvoiceModal() {
  const dispatch = useDispatch();
  const invoiceOrder = useSelector((state) => state.marketplace.invoiceOrder);

  if (!invoiceOrder) return null;

  const handlePrint = () => {
    window.print();
  };

  const invoiceDate = new Date(invoiceOrder.created_at || Date.now()).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const subtotal = invoiceOrder.items?.reduce((sum, item) => sum + (parseFloat(item.subtotal) || 0), 0) || parseFloat(invoiceOrder.total_amount);
  const shippingFee = parseFloat(invoiceOrder.shipping_fee) || 0;
  const discountAmount = parseFloat(invoiceOrder.discount_amount) || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-sm animate-fade-in overflow-y-auto print:p-0 print:bg-white">
      <div 
        className="relative bg-[#231815] border-2 border-[#4A2E27] text-[#F5EFC6] rounded-3xl max-w-2xl w-full max-h-[92dvh] overflow-y-auto shadow-2xl p-5 sm:p-8 print:border-none print:shadow-none print:text-black print:bg-white print:max-h-full print:w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar (Hidden during print) */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#4A2E27] print:hidden">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-[#A5BCD6]" />
            <span className="font-headline font-bold text-sm text-[#F5EFC6] uppercase tracking-wider">
              Official Tax Invoice Receipt
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-[#4D0E12] hover:bg-[#4D0E12]/90 text-[#F5EFC6] font-headline font-bold text-xs uppercase tracking-wider border border-[#F5EFC6]/30 flex items-center space-x-1.5 shadow-md transition-all active:scale-95"
            >
              <Printer className="w-4 h-4 text-[#A5BCD6]" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={() => dispatch(closeInvoiceModal())}
              className="p-2 rounded-full bg-[#4A2E27]/80 hover:bg-[#4D0E12] text-[#F5EFC6] border border-[#F5EFC6]/20 transition-colors"
              aria-label="Close invoice"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* INVOICE PAPER CONTENT */}
        <div className="bg-[#18100E] border border-[#4A2E27] rounded-2xl p-5 sm:p-7 space-y-6 print:bg-white print:text-black print:border-gray-300">
          
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#4A2E27] print:border-gray-300">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-[#4D0E12] border border-[#F5EFC6]/30 flex items-center justify-center p-2 print:border-black">
                <BrandLogo className="w-full h-full" variant="cream" />
              </div>
              <div>
                <h1 className="font-headline font-black text-xl text-[#F5EFC6] uppercase tracking-wide print:text-black">
                  THE BEAN CO.
                </h1>
                <p className="font-subhead text-[10px] text-[#A5BCD6] uppercase tracking-wider font-semibold print:text-gray-600">
                  CHEW THE BREW • Specialty Coffee Roastery
                </p>
                <p className="text-[9px] text-[#F5EFC6]/60 print:text-gray-500">
                  GSTIN: 29AABCB1234F1Z8 • FSSAI Lic: 11224333000912
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right font-subhead text-xs">
              <div className="font-bold text-[#A5BCD6] print:text-gray-700">TAX INVOICE</div>
              <div className="font-mono text-sm font-bold text-[#F5EFC6] print:text-black">{invoiceOrder.order_number}</div>
              <div className="text-[11px] text-[#F5EFC6]/70 print:text-gray-600">Date: {invoiceDate}</div>
              <div className="text-[10px] text-emerald-400 font-bold print:text-green-700">STATUS: {invoiceOrder.status}</div>
            </div>
          </div>

          {/* Billed To / Shipped To Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-subhead pb-4 border-b border-[#4A2E27] print:border-gray-300">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#A5BCD6] block mb-1 print:text-gray-600">
                Billed & Shipped To:
              </span>
              <p className="font-bold text-[#F5EFC6] print:text-black text-sm">{invoiceOrder.customer_name}</p>
              <p className="text-[#F5EFC6]/80 print:text-gray-700">{invoiceOrder.customer_email}</p>
              {invoiceOrder.customer_phone && (
                <p className="text-[#F5EFC6]/80 print:text-gray-700">{invoiceOrder.customer_phone}</p>
              )}
              <p className="text-[#F5EFC6]/75 mt-1 font-body text-[11px] leading-relaxed print:text-gray-700">
                {invoiceOrder.shipping_address}
              </p>
            </div>

            <div className="space-y-1 sm:text-right">
              <span className="text-[10px] uppercase font-bold text-[#A5BCD6] block mb-1 print:text-gray-600">
                Logistics & Payment:
              </span>
              <p className="text-[#F5EFC6]/80 print:text-gray-700">
                Method: <strong>{invoiceOrder.payment_method}</strong>
              </p>
              {invoiceOrder.tracking_number && (
                <p className="text-[#F5EFC6]/80 print:text-gray-700">
                  AWB Tracking: <strong>{invoiceOrder.tracking_number}</strong>
                </p>
              )}
              <p className="text-[#F5EFC6]/80 print:text-gray-700">
                Carrier: <strong>{invoiceOrder.courier_name || 'Roastery Express Courier'}</strong>
              </p>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-subhead">
              <thead>
                <tr className="border-b border-[#4A2E27] text-[#A5BCD6] uppercase text-[10px] print:border-gray-300 print:text-gray-700">
                  <th className="pb-2">Item Description</th>
                  <th className="pb-2 text-center">Format</th>
                  <th className="pb-2 text-center">Qty</th>
                  <th className="pb-2 text-right">Unit Price</th>
                  <th className="pb-2 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#4A2E27]/50 print:divide-gray-200">
                {invoiceOrder.items && invoiceOrder.items.length > 0 ? (
                  invoiceOrder.items.map((item, idx) => (
                    <tr key={idx} className="text-[#F5EFC6] print:text-black">
                      <td className="py-2.5 font-bold">
                        {item.product_name}
                        <span className="block text-[9px] text-[#A5BCD6] font-normal print:text-gray-500">HSN: 0901 • 5% GST Included</span>
                      </td>
                      <td className="py-2.5 text-center text-[11px] text-[#A5BCD6] print:text-gray-600">{item.grind_type}</td>
                      <td className="py-2.5 text-center font-bold">{item.quantity}</td>
                      <td className="py-2.5 text-right">₹{parseFloat(item.unit_price).toFixed(2)}</td>
                      <td className="py-2.5 text-right font-bold">₹{parseFloat(item.subtotal).toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr className="text-[#F5EFC6] print:text-black">
                    <td className="py-2.5 font-bold">Artisanal Coffee Gummy Canister Order</td>
                    <td className="py-2.5 text-center">Standard</td>
                    <td className="py-2.5 text-center">1</td>
                    <td className="py-2.5 text-right">₹{parseFloat(invoiceOrder.total_amount).toFixed(2)}</td>
                    <td className="py-2.5 text-right font-bold">₹{parseFloat(invoiceOrder.total_amount).toFixed(2)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totals Summary */}
          <div className="pt-3 border-t border-[#4A2E27] flex justify-end print:border-gray-300">
            <div className="w-full sm:w-64 space-y-1.5 text-xs font-subhead">
              <div className="flex justify-between text-[#F5EFC6]/80 print:text-gray-700">
                <span>Subtotal (Incl. GST)</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400 print:text-green-700">
                  <span>Promo Discount</span>
                  <span>-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#F5EFC6]/80 print:text-gray-700">
                <span>Courier Express Shipping</span>
                <span>{shippingFee === 0 ? <strong className="text-emerald-400 print:text-green-700">FREE</strong> : `₹${shippingFee.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between font-headline font-black text-base text-[#F5EFC6] pt-2 border-t border-[#4A2E27] print:border-gray-300 print:text-black">
                <span>Grand Total</span>
                <span className="text-emerald-400 print:text-black">₹{parseFloat(invoiceOrder.total_amount).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Roastery Seal & Notice */}
          <div className="pt-4 border-t border-[#4A2E27] flex flex-col sm:flex-row items-center justify-between text-[10px] text-[#A5BCD6] print:border-gray-300 print:text-gray-600 gap-2">
            <div className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 print:text-green-700" />
              <span>Covered by The Bean Co. 7-Day Roastery Freshness Guarantee</span>
            </div>
            <span className="italic">Computer generated invoice. No signature required.</span>
          </div>

        </div>

      </div>
    </div>
  );
}
