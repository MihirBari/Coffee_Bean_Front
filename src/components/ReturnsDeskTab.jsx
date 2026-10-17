import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchReturnRequests, updateReturnStatus } from '../store/marketplaceSlice';
import { 
  RotateCcw, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  RefreshCw, 
  ShieldCheck, 
  Search,
  MessageSquare,
  Truck,
  Camera,
  ExternalLink,
  Image as ImageIcon
} from 'lucide-react';

export default function ReturnsDeskTab({ onShowNotice }) {
  const dispatch = useDispatch();
  const { returnRequests } = useSelector((state) => state.marketplace);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    dispatch(fetchReturnRequests());
  }, [dispatch]);

  const filteredRequests = returnRequests.filter((r) => {
    if (filter !== 'All' && r.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        r.order_number?.toLowerCase().includes(q) ||
        r.customer_name?.toLowerCase().includes(q) ||
        r.reason?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleUpdateStatus = async (id, newStatus) => {
    setUpdating(true);
    await dispatch(updateReturnStatus({ id, status: newStatus, resolution_notes: resolutionNotes }));
    setUpdating(false);
    setSelectedRequest(null);
    setResolutionNotes('');
    if (onShowNotice) onShowNotice(`Return request #${id} marked as ${newStatus}!`);
  };

  return (
    <div className="space-y-6 animate-fade-in font-subhead">
      
      {/* Header Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#2F201C] border-2 border-[#4A2E27] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 paper-crease-h">
        <div>
          <div className="flex items-center space-x-2 text-xs text-red-400 font-bold uppercase tracking-wider mb-1">
            <RotateCcw className="w-4 h-4 text-red-400" />
            <span>Reverse Logistics & Customer Assurance</span>
          </div>
          <h2 className="font-headline font-black text-2xl text-[#F5EFC6] uppercase tracking-tight">
            Customer Returns & Replacements Desk
          </h2>
          <p className="font-body text-xs text-[#F5EFC6]/75 mt-0.5">
            Manage incoming returns, verify transit damage claims, and approve instant replacements or refunds.
          </p>
        </div>

        <button
          onClick={() => dispatch(fetchReturnRequests())}
          className="px-3.5 py-2 rounded-xl bg-[#18100E] hover:bg-[#4A2E27] text-xs font-bold uppercase tracking-wider text-[#A5BCD6] border border-[#4A2E27] flex items-center space-x-1.5 transition-colors w-fit"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2 overflow-x-auto touch-scroll no-scrollbar">
          {['All', 'Pending', 'Approved - Replacement Dispatched', 'Approved - Refund Processed', 'Rejected'].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded-xl uppercase tracking-wider text-[11px] font-bold whitespace-nowrap transition-colors ${
                filter === st
                  ? 'bg-[#4D0E12] text-[#F5EFC6] border border-[#F5EFC6]/30 shadow-md'
                  : 'bg-[#18100E] text-[#F5EFC6]/70 hover:bg-[#2F201C] border border-[#4A2E27]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-[#A5BCD6] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order # or Customer..."
            className="w-full bg-[#18100E] border border-[#4A2E27] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#F5EFC6] placeholder-[#F5EFC6]/40 focus:outline-none focus:border-[#A5BCD6]"
          />
        </div>
      </div>

      {/* Returns Queue Table */}
      <div className="bg-[#2F201C] border-2 border-[#4A2E27] rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#18100E] border-b border-[#4A2E27] text-[#A5BCD6] text-[10px] uppercase font-bold tracking-wider">
                <th className="py-3 px-4">Req ID</th>
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Claim Reason</th>
                <th className="py-3 px-4">Filed Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#4A2E27]/60">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-[#A5BCD6]">
                    No return claims match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-[#18100E]/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#A5BCD6]">#{req.id}</td>
                    <td className="py-3.5 px-4 font-bold text-[#F5EFC6]">{req.order_number}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold block text-[#F5EFC6]">{req.customer_name}</span>
                      <span className="text-[10px] text-[#A5BCD6]">{req.customer_email}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-start space-x-2.5">
                        {req.image_url && (
                          <a
                            href={req.image_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Click to view uploaded product photo"
                            className="flex-shrink-0 w-9 h-9 rounded-lg overflow-hidden border border-amber-500/40 hover:border-amber-400 hover:scale-105 transition-all shadow-sm"
                          >
                            <img src={req.image_url} alt="Proof" className="w-full h-full object-cover" />
                          </a>
                        )}
                        <div>
                          <span className="font-bold text-amber-300 block">{req.reason}</span>
                          {req.details && (
                            <span className="text-[10px] text-[#F5EFC6]/70 line-clamp-1 font-body">{req.details}</span>
                          )}
                          {req.image_url && (
                            <span className="inline-flex items-center space-x-1 text-[9px] text-emerald-400 font-bold mt-0.5">
                              <Camera className="w-2.5 h-2.5" />
                              <span>Photo Clarification</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[11px] text-[#F5EFC6]/80">
                      {new Date(req.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        req.status.includes('Approved')
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : req.status === 'Rejected'
                          ? 'bg-red-950 text-red-300 border border-red-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedRequest(req);
                          setResolutionNotes(req.resolution_notes || '');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-[#4D0E12] hover:bg-[#4D0E12]/90 text-[#F5EFC6] text-xs font-bold uppercase tracking-wider border border-[#F5EFC6]/20 transition-all shadow-sm"
                      >
                        Review Claim
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review & Resolution Modal Dialog */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in text-xs font-subhead">
          <div className="bg-[#2F201C] border-2 border-[#4A2E27] text-[#F5EFC6] rounded-3xl max-w-lg w-full p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between pb-3 border-b border-[#4A2E27]">
              <div>
                <span className="text-[10px] uppercase text-[#A5BCD6] font-bold block">
                  Return Review #{selectedRequest.id}
                </span>
                <h4 className="font-headline font-black text-base text-[#F5EFC6] uppercase">
                  Order: {selectedRequest.order_number}
                </h4>
              </div>
              <button onClick={() => setSelectedRequest(null)} className="p-1 text-[#F5EFC6]/60 hover:text-[#F5EFC6]">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 bg-[#18100E] p-3.5 rounded-xl border border-[#4A2E27]">
              <div className="flex justify-between">
                <span className="text-[#A5BCD6]">Customer:</span>
                <span className="font-bold">{selectedRequest.customer_name} ({selectedRequest.customer_email})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A5BCD6]">Claim Reason:</span>
                <span className="font-bold text-amber-300">{selectedRequest.reason}</span>
              </div>
              {selectedRequest.details && (
                <div className="pt-1 border-t border-[#4A2E27]/50 font-body text-[11px] text-[#F5EFC6]/85">
                  "{selectedRequest.details}"
                </div>
              )}
            </div>

            {/* Attached Clarification Photo */}
            {selectedRequest.image_url && (
              <div className="space-y-2 p-3 rounded-xl bg-[#18100E] border border-[#4A2E27]">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase text-[#A5BCD6] font-bold flex items-center space-x-1.5">
                    <Camera className="w-3.5 h-3.5 text-amber-400" />
                    <span>Attached Product Photo</span>
                  </span>
                  <a
                    href={selectedRequest.image_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-[10px] text-amber-300 hover:text-amber-200 underline font-bold"
                  >
                    <span>Full Resolution</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="relative rounded-lg overflow-hidden border border-[#4A2E27] max-h-60 bg-black/40 flex items-center justify-center p-1">
                  <img
                    src={selectedRequest.image_url}
                    alt="Customer clarification"
                    className="max-h-56 max-w-full rounded object-contain"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-[10px] uppercase text-[#A5BCD6] block mb-1 font-bold">
                Resolution Directive & Customer Note
              </label>
              <textarea
                rows={2}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="e.g. Free replacement canister dispatched via Roastery Express (AWB: RE-90412)..."
                className="w-full bg-[#18100E] border border-[#4A2E27] rounded-xl px-3 py-2 text-xs text-[#F5EFC6] focus:outline-none focus:border-[#A5BCD6]"
              />
            </div>

            {/* Decision Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
              <button
                disabled={updating}
                onClick={() => handleUpdateStatus(selectedRequest.id, 'Approved - Replacement Dispatched')}
                className="p-2.5 rounded-xl bg-emerald-900 hover:bg-emerald-800 text-white font-bold text-[11px] uppercase tracking-wider border border-emerald-600 transition-all text-center"
              >
                ✓ Replacement
              </button>

              <button
                disabled={updating}
                onClick={() => handleUpdateStatus(selectedRequest.id, 'Approved - Refund Processed')}
                className="p-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-[11px] uppercase tracking-wider border border-blue-600 transition-all text-center"
              >
                💳 Issue Refund
              </button>

              <button
                disabled={updating}
                onClick={() => handleUpdateStatus(selectedRequest.id, 'Rejected')}
                className="p-2.5 rounded-xl bg-red-950 hover:bg-red-900 text-red-200 font-bold text-[11px] uppercase tracking-wider border border-red-800 transition-all text-center"
              >
                ✕ Reject Claim
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
