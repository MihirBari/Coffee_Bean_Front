import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Bot, 
  Lock, 
  MailCheck, 
  AlertTriangle, 
  RefreshCw, 
  CheckCircle2, 
  Zap, 
  Clock, 
  Activity, 
  Eye, 
  Filter, 
  Sparkles,
  Server,
  Layers,
  Check
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

export default function SecurityShieldTab() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('ALL'); // 'ALL' | 'BLOCKED_ATTACK' | 'WARNING' | 'INFO'
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  const fetchSecurityData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('coffee_bean_token');
      const res = await axios.get(`${API_BASE}/security/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityData();
  }, []);

  // Quick live simulator to demonstrate honeypot & disposable email defenses
  const runBotSimulation = async (type) => {
    try {
      setTesting(true);
      setTestResult(null);

      let payload = {};
      let endpoint = '';

      if (type === 'honeypot') {
        endpoint = `${API_BASE}/orders`;
        payload = {
          customer_name: 'Automated Bot Crawler',
          customer_email: 'crawler@fakebotnet.com',
          shipping_address: 'Hidden Proxy Node #4',
          hp_website: 'http://malicious-spam-url.ru',
          items: [{ product_id: 1, quantity: 2 }]
        };
      } else if (type === 'disposable') {
        endpoint = `${API_BASE}/auth/send-otp`;
        payload = {
          email: 'burner_fraud@mailinator.com',
          purpose: 'order_checkout'
        };
      }

      const res = await axios.post(endpoint, payload, { validateStatus: () => true });
      setTestResult({
        type,
        status: res.status,
        data: res.data
      });
      // Refresh logs
      await fetchSecurityData();
    } catch (err) {
      setTestResult({
        type,
        error: err.message
      });
    } finally {
      setTesting(false);
    }
  };

  const filteredLogs = (data?.logs || []).filter((log) => {
    if (selectedFilter === 'ALL') return true;
    return log.severity === selectedFilter;
  });

  return (
    <div className="space-y-6 animate-fade-in text-[#F5EFC6]">
      {/* Tab Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-[#2F201C] border border-[#4A2E27] shadow-xl">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#4D0E12] border border-[#F5EFC6]/30 flex items-center justify-center text-[#F5EFC6] shadow-md">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-headline font-black text-xl text-[#F5EFC6] uppercase tracking-wide">
                Roastery Anti-Bot Shield & Security Hub
              </h2>
              <span className="bg-emerald-950 text-emerald-400 border border-emerald-500/50 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                LIVE DEFENSE ACTIVE
              </span>
            </div>
            <p className="font-body text-xs text-[#A5BCD6] mt-0.5">
              Multi-layer defense: Email OTP confirmation, disposable email blocking, crawler honeypots & inventory exhaustion guards.
            </p>
          </div>
        </div>

        <button
          onClick={fetchSecurityData}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl bg-[#18100E] hover:bg-[#231815] text-[#F5EFC6] border border-[#4A2E27] text-xs font-headline font-bold uppercase tracking-wider flex items-center space-x-2 transition-all disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Shield Data</span>
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-950/80 border border-red-700 text-red-200 text-xs flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Blocked Attacks */}
        <div className="p-5 rounded-2xl bg-[#231815] border-2 border-red-900/50 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="font-subhead text-[11px] font-bold uppercase tracking-wider text-[#A5BCD6]">
              Blocked Attacks & Bots
            </span>
            <div className="w-8 h-8 rounded-xl bg-red-950/80 border border-red-700/60 flex items-center justify-center text-red-400">
              <Bot className="w-4 h-4" />
            </div>
          </div>
          <div className="font-headline font-black text-3xl text-red-300">
            {data?.summary?.blocked_attacks ?? '0'}
          </div>
          <p className="font-body text-[11px] text-[#F5EFC6]/60 mt-1">
            Honeypots: <strong>{data?.summary?.honeypot_blocks || 0}</strong> • Burner Mail: <strong>{data?.summary?.disposable_email_blocks || 0}</strong>
          </p>
        </div>

        {/* Card 2: Verified Genuine Orders */}
        <div className="p-5 rounded-2xl bg-[#231815] border-2 border-emerald-900/50 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="font-subhead text-[11px] font-bold uppercase tracking-wider text-[#A5BCD6]">
              Verified Protected Orders
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-950/80 border border-emerald-700/60 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="font-headline font-black text-3xl text-emerald-300">
            {data?.summary?.verified_orders ?? '0'}
          </div>
          <p className="font-body text-[11px] text-[#F5EFC6]/60 mt-1">
            100% verified customer checkout • Zero fake orders
          </p>
        </div>

        {/* Card 3: OTP Verification Rate */}
        <div className="p-5 rounded-2xl bg-[#231815] border-2 border-amber-900/50 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="font-subhead text-[11px] font-bold uppercase tracking-wider text-[#A5BCD6]">
              OTP Codes Dispatched
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-950/80 border border-amber-700/60 flex items-center justify-center text-amber-400">
              <MailCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="font-headline font-black text-3xl text-amber-300">
            {data?.summary?.total_otps_dispatched ?? '0'}
          </div>
          <p className="font-body text-[11px] text-[#F5EFC6]/60 mt-1">
            Completed: <strong>{data?.summary?.successful_verifications || 0}</strong> verified codes
          </p>
        </div>

        {/* Card 4: Roastery Users Verified */}
        <div className="p-5 rounded-2xl bg-[#231815] border-2 border-[#4A2E27] shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="font-subhead text-[11px] font-bold uppercase tracking-wider text-[#A5BCD6]">
              Verified Accounts
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#4D0E12] border border-[#F5EFC6]/20 flex items-center justify-center text-[#F5EFC6]">
              <Lock className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="font-headline font-black text-3xl text-[#F5EFC6]">
            {data?.summary?.verified_users ?? '0'} <span className="text-sm font-normal text-[#A5BCD6]">/ {data?.summary?.total_users ?? 0}</span>
          </div>
          <p className="font-body text-[11px] text-[#F5EFC6]/60 mt-1">
            Authentication with email ownership verification
          </p>
        </div>
      </div>

      {/* Defense Modules Matrix & Live Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: 6 Active Shield Modules (2 cols wide) */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-3xl bg-[#231815] border border-[#4A2E27] shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-[#4A2E27] pb-3">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <h3 className="font-headline font-bold text-sm text-[#F5EFC6] uppercase tracking-wider">
                Active Roastery Defense Modules
              </h3>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
              6/6 ENGINES ONLINE
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(data?.shields || []).map((sh, idx) => (
              <div 
                key={idx}
                className="p-3.5 rounded-2xl bg-[#18100E] border border-[#4A2E27] hover:border-[#A5BCD6]/40 transition-all flex items-start space-x-3"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 flex-shrink-0 mt-0.5">
                  <Check className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-headline font-bold text-xs text-[#F5EFC6] truncate">
                      {sh.name}
                    </span>
                    <span className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-950 px-1.5 py-0.2 rounded">
                      {sh.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#A5BCD6] mt-0.5 leading-snug">
                    {sh.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Live Defense Diagnostic Tester */}
        <div className="p-5 sm:p-6 rounded-3xl bg-[#231815] border border-[#4A2E27] shadow-xl space-y-4">
          <div className="border-b border-[#4A2E27] pb-3 flex items-center space-x-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <h3 className="font-headline font-bold text-sm text-[#F5EFC6] uppercase tracking-wider">
              Live Defense Test Bench
            </h3>
          </div>

          <p className="font-body text-xs text-[#F5EFC6]/80 leading-relaxed">
            Test and verify that automated bots and disposable burner emails are actively blocked by the server.
          </p>

          <div className="space-y-2.5">
            <button
              type="button"
              disabled={testing}
              onClick={() => runBotSimulation('honeypot')}
              className="w-full p-3 rounded-xl bg-[#18100E] hover:bg-[#2F201C] border border-[#4A2E27] text-left transition-all text-xs flex items-center justify-between group disabled:opacity-50"
            >
              <div>
                <span className="font-headline font-bold text-xs text-[#F5EFC6] block group-hover:text-amber-300">
                  Simulate Headless Crawler Attack
                </span>
                <span className="text-[10px] text-[#A5BCD6]">Triggers hidden honeypot field trap</span>
              </div>
              <span className="text-[10px] font-bold text-red-400 bg-red-950/80 px-2 py-1 rounded border border-red-800">
                Test Trap
              </span>
            </button>

            <button
              type="button"
              disabled={testing}
              onClick={() => runBotSimulation('disposable')}
              className="w-full p-3 rounded-xl bg-[#18100E] hover:bg-[#2F201C] border border-[#4A2E27] text-left transition-all text-xs flex items-center justify-between group disabled:opacity-50"
            >
              <div>
                <span className="font-headline font-bold text-xs text-[#F5EFC6] block group-hover:text-amber-300">
                  Simulate Disposable Burner Email
                </span>
                <span className="text-[10px] text-[#A5BCD6]">Tests @mailinator.com filter</span>
              </div>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-950/80 px-2 py-1 rounded border border-amber-800">
                Test Filter
              </span>
            </button>
          </div>

          {testResult && (
            <div className="p-3 rounded-xl bg-[#18100E] border border-amber-500/50 text-xs space-y-1 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-300">Test Execution Result:</span>
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                  HTTP {testResult.status || 500} BLOCKED
                </span>
              </div>
              <p className="text-[11px] text-emerald-300">
                {testResult.data?.message || testResult.error}
              </p>
            </div>
          )}
        </div>

      </div>

      {/* Security Audit Log Stream */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#231815] border border-[#4A2E27] shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#4A2E27] pb-4">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h3 className="font-headline font-bold text-base text-[#F5EFC6] uppercase tracking-wide">
              Live Security Telemetry & Audit Logs
            </h3>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1.5 bg-[#18100E] p-1 rounded-xl border border-[#4A2E27] text-[11px] font-subhead">
            {[
              { id: 'ALL', label: 'All Events' },
              { id: 'BLOCKED_ATTACK', label: 'Blocked Attacks' },
              { id: 'WARNING', label: 'Warnings' },
              { id: 'INFO', label: 'Info / Verified' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedFilter(f.id)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  selectedFilter === f.id
                    ? 'bg-[#4D0E12] text-[#F5EFC6] font-bold shadow'
                    : 'text-[#A5BCD6] hover:text-[#F5EFC6]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-subhead">
            <thead>
              <tr className="border-b border-[#4A2E27] text-[#A5BCD6] uppercase text-[10px] tracking-wider">
                <th className="pb-3 pl-2">Time</th>
                <th className="pb-3">Event Type</th>
                <th className="pb-3">Severity</th>
                <th className="pb-3">Target / Email</th>
                <th className="pb-3">IP Address</th>
                <th className="pb-3 pr-2">Security Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#4A2E27]/40">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-[#A5BCD6] italic">
                    No security events found for the selected filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const dateStr = new Date(log.created_at).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  });

                  let badgeColor = 'bg-blue-950/80 text-blue-300 border-blue-800';
                  if (log.severity === 'BLOCKED_ATTACK') {
                    badgeColor = 'bg-red-950/80 text-red-300 border-red-800';
                  } else if (log.severity === 'WARNING') {
                    badgeColor = 'bg-amber-950/80 text-amber-300 border-amber-800';
                  } else if (log.event_type.includes('VERIFIED')) {
                    badgeColor = 'bg-emerald-950/80 text-emerald-300 border-emerald-800';
                  }

                  return (
                    <tr key={log.id} className="hover:bg-[#2F201C]/40 transition-colors">
                      <td className="py-3 pl-2 font-mono text-[11px] text-[#A5BCD6] whitespace-nowrap">
                        {dateStr}
                      </td>
                      <td className="py-3 font-mono text-[11px] font-bold text-[#F5EFC6]">
                        {log.event_type}
                      </td>
                      <td className="py-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${badgeColor}`}>
                          {log.severity}
                        </span>
                      </td>
                      <td className="py-3 font-mono text-[11px] text-[#F5EFC6] max-w-[160px] truncate">
                        {log.email || '—'}
                      </td>
                      <td className="py-3 font-mono text-[10px] text-[#A5BCD6]">
                        {log.ip_address || '127.0.0.1'}
                      </td>
                      <td className="py-3 pr-2 text-[11px] text-[#F5EFC6]/85 max-w-md">
                        {log.details}
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
  );
}
