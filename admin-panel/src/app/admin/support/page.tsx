"use client";

import { useAdminStore } from '@/frontend/store/adminStore';
import { Search, Plus, CheckCircle2, User, HelpCircle } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function SupportDesk() {
  const { supportTickets, resolveTicket, addSupportTicket } = useAdminStore();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [custName, setCustName] = useState('');
  const [subject, setSubject] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('low');

  const handleAddTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName || !subject) return;

    addSupportTicket({
      customerName: custName,
      subject,
      priority,
    });

    setCustName('');
    setSubject('');
    setShowAddModal(false);
  };

  const getPriorityStyle = (prio: string) => {
    switch (prio) {
      case 'critical': return 'bg-emergency/15 text-emergency border-emergency/35 animate-pulse';
      case 'high': return 'bg-warning/15 text-warning border-warning/35';
      case 'medium': return 'bg-blue-500/15 text-blue-400 border-blue-500/35';
      default: return 'bg-white/5 text-foreground/45 border-white/5';
    }
  };

  const filteredTickets = supportTickets.filter(t =>
    t.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider">Help Desk & Dispatch Escalations</h1>
          <p className="text-xs text-foreground/45 uppercase tracking-wider font-semibold mt-1">
            Resolve customer complaints, track support feedback, and manage critical towing SLA escalations
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-background font-black px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-primary/25 cursor-pointer self-start"
        >
          <Plus size={14} className="stroke-[3]" />
          <span>New Ticket</span>
        </button>
      </div>

      {/* Control filters */}
      <div className="glass-panel p-5 rounded-2xl border border-white/5">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/35" size={16} />
          <input
            type="text"
            placeholder="Search tickets by ID, requester, issue subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-background border border-white/5 focus:border-primary/50 text-xs px-11 py-3 rounded-xl outline-none text-white font-semibold transition-all"
          />
        </div>
      </div>

      {/* Ticket Grid list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTickets.map((t) => (
          <div key={t.id} className={`glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between hover:shadow-lg transition-all duration-300 relative overflow-hidden group ${
            t.priority === 'critical' && t.status !== 'resolved' ? 'border-emergency/35 shadow-lg shadow-emergency/5' : ''
          }`}>
            <div>
              {/* Card Header */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center font-bold text-xs text-white">
                    <User size={16} className="text-foreground/45" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-white uppercase tracking-wider">{t.customerName}</h3>
                    <span className="text-[9px] font-mono text-foreground/30 font-bold block mt-0.5">{t.id}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded border text-[9px] font-black uppercase tracking-wider ${getPriorityStyle(t.priority)}`}>
                    {t.priority}
                  </span>
                  
                  <span className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider ${
                    t.status === 'resolved' 
                      ? 'bg-success/10 text-success border-success/35'
                      : 'bg-warning/10 text-warning border-warning/35'
                  }`}>
                    {t.status}
                  </span>
                </div>
              </div>

              {/* Subject */}
              <p className="text-xs text-foreground/75 leading-relaxed font-semibold mb-6">
                &ldquo;{t.subject}&rdquo;
              </p>
            </div>

            {/* Footer actions */}
            <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
              <span className="text-[9px] text-foreground/30 font-bold uppercase tracking-wider">
                Logged {t.createdTime}
              </span>

              {t.status !== 'resolved' ? (
                <button
                  onClick={() => resolveTicket(t.id)}
                  className="px-3 py-1.5 bg-success hover:bg-success/80 text-background font-black rounded-lg text-[10px] uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-success/10"
                >
                  Resolve Issue
                </button>
              ) : (
                <span className="text-[10px] text-success flex items-center gap-1 font-bold uppercase tracking-wider">
                  <CheckCircle2 size={12} />
                  <span>Case Closed</span>
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* CREATE NEW SUPPORT TICKET MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md glass-panel p-6 rounded-2xl border border-white/10"
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
              <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-1.5">
                <HelpCircle size={16} className="text-primary" />
                <span>Create Support Escalation</span>
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-foreground/45 hover:text-white p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddTicket} className="space-y-4">
              <div>
                <label className="block text-[9px] text-foreground/45 font-bold uppercase tracking-wider mb-1.5">Customer Profile Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shikhar Dhawan"
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  className="w-full bg-background border border-white/10 focus:border-primary/50 text-xs p-2.5 rounded-lg outline-none text-white font-semibold"
                />
              </div>

              <div>
                <label className="block text-[9px] text-foreground/45 font-bold uppercase tracking-wider mb-1.5">Issue details subject</label>
                <textarea
                  required
                  placeholder="Provide precise details of dispatcher delay or checkout issues..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-background border border-white/10 focus:border-primary/50 text-xs p-2.5 rounded-lg outline-none text-white font-semibold min-h-[90px]"
                />
              </div>

              <div>
                <label className="block text-[9px] text-foreground/45 font-bold uppercase tracking-wider mb-1.5">Severity Scale Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full bg-background border border-white/10 focus:border-primary/50 text-xs p-2.5 rounded-lg outline-none text-white font-semibold cursor-pointer"
                >
                  <option value="low">Low - General query</option>
                  <option value="medium">Medium - Checkout delay</option>
                  <option value="high">High - Dispatcher delay</option>
                  <option value="critical">🚨 Critical - Tow escalation</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-primary hover:bg-primary-hover text-background font-black rounded-lg text-xs uppercase tracking-wider mt-4 transition-all hover:shadow-lg hover:shadow-primary/20 cursor-pointer"
              >
                Open Ticket & Assign Staff
              </button>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}
