"use client";

import { useAdminStore } from '@/frontend/store/adminStore';
import { CreditCard, Search, ArrowUpRight, DollarSign, Wallet, FileText, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

export default function PaymentsDesk() {
  const { payments, getStats } = useAdminStore();
  const [searchTerm, setSearchTerm] = useState('');
  const stats = getStats();

  const filteredPayments = payments.filter(pay =>
    pay.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pay.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pay.serviceLabel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white uppercase tracking-wider">Settlements & Finance Ledger</h1>
        <p className="text-xs text-foreground/45 uppercase tracking-wider font-semibold mt-1">
          Track transaction settlement reports, pending invoice allocations, and cumulative rescue revenues
        </p>
      </div>

      {/* Finance counter stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 bg-success/15 border border-success/35 rounded-xl flex items-center justify-center text-success">
            <Wallet size={20} />
          </div>
          <div>
            <span className="text-[9px] text-foreground/40 font-black uppercase tracking-wider block">Total Receipts Today</span>
            <h3 className="text-2xl font-black text-white mt-1">₹{stats.revenueToday.toLocaleString('en-IN')}</h3>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/15 border border-primary/35 rounded-xl flex items-center justify-center text-primary">
            <CreditCard size={20} />
          </div>
          <div>
            <span className="text-[9px] text-foreground/40 font-black uppercase tracking-wider block">Completed Settlements</span>
            <h3 className="text-2xl font-black text-white mt-1">{payments.filter(p => p.status === 'completed').length} Invoices</h3>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/5 flex items-center gap-4">
          <div className="w-12 h-12 bg-warning/15 border border-warning/35 rounded-xl flex items-center justify-center text-warning">
            <FileText size={20} />
          </div>
          <div>
            <span className="text-[9px] text-foreground/40 font-black uppercase tracking-wider block">Pending Collections</span>
            <h3 className="text-2xl font-black text-white mt-1">₹{payments.filter(p => p.status === 'pending').reduce((a, b) => a + b.amount, 0).toLocaleString('en-IN')}</h3>
          </div>
        </div>
      </div>

      {/* Search filters */}
      <div className="glass-panel p-5 rounded-2xl border border-white/5">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/35" size={16} />
          <input
            type="text"
            placeholder="Search payments by Case ID, name, or service type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-background border border-white/5 focus:border-primary/50 text-xs px-11 py-3 rounded-xl outline-none text-white font-semibold transition-all"
          />
        </div>
      </div>

      {/* Itemized transaction ledger list */}
      <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-black/20 text-foreground/45 font-black uppercase tracking-widest">
                <th className="py-4 px-5">Receipt ID</th>
                <th className="py-4 px-5">Case ID</th>
                <th className="py-4 px-5">Customer Profile</th>
                <th className="py-4 px-5">Rescue Category</th>
                <th className="py-4 px-5 text-right">Settled Amount</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5">Settlement Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-semibold">
              {filteredPayments.length > 0 ? (
                filteredPayments.map((pay) => (
                  <tr key={pay.id} className="hover:bg-white/3 transition-colors">
                    <td className="py-3.5 px-5 font-mono font-black text-white">{pay.id}</td>
                    <td className="py-3.5 px-5 font-mono text-foreground/50">{pay.bookingId}</td>
                    <td className="py-3.5 px-5 font-black text-white">{pay.customerName}</td>
                    <td className="py-3.5 px-5">
                      <span className="bg-white/5 border border-white/5 px-2 py-0.5 rounded text-[9px] uppercase tracking-wider">
                        {pay.serviceLabel}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right text-white font-black text-sm">
                      ₹{pay.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="px-2.5 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider bg-success/15 text-success border-success/35">
                        {pay.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-foreground/40">{pay.date}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-foreground/30 font-bold uppercase tracking-widest">
                    No payment settlements match this search criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
