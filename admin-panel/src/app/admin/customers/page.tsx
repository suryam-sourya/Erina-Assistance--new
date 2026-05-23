"use client";

import { useAdminStore } from '@/frontend/store/adminStore';
import { Users, Search, Award, ShieldAlert, CheckCircle2, User } from 'lucide-react';
import { useState } from 'react';

export default function CustomersCRM() {
  const { customers } = useAdminStore();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = customers.filter(cust => 
    cust.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cust.phone.includes(searchTerm) ||
    cust.vehicle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'platinum': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/35';
      case 'gold': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/35';
      case 'silver': return 'bg-slate-350/15 text-slate-350 border-slate-350/30';
      case 'basic': return 'bg-white/5 text-foreground/45 border-white/5';
      default: return 'bg-white/5 text-foreground/45 border-white/5';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white uppercase tracking-wider">Customer CRM Directory</h1>
        <p className="text-xs text-foreground/45 uppercase tracking-wider font-semibold mt-1">
          Review premium driver memberships, emergency logs, and core roadside rescue statistics
        </p>
      </div>

      {/* Control Filters */}
      <div className="glass-panel p-5 rounded-2xl border border-white/5">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/35" size={16} />
          <input
            type="text"
            placeholder="Search customers by name, phone, vehicle plate..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-background border border-white/5 focus:border-primary/50 text-xs px-11 py-3 rounded-xl outline-none text-white font-semibold transition-all"
          />
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((cust) => (
          <div key={cust.id} className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between group hover:shadow-lg transition-all duration-300">
            <div>
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center font-bold text-xs text-white">
                    <User size={16} className="text-foreground/45" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-white uppercase tracking-wider">{cust.name}</h3>
                    <span className="text-[9px] font-mono text-foreground/30 font-bold block mt-0.5">{cust.id}</span>
                  </div>
                </div>

                <span className={`px-2.5 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${getPlanBadgeColor(cust.membershipPlan)}`}>
                  {cust.membershipPlan}
                </span>
              </div>

              {/* Specs */}
              <div className="space-y-2 text-xs pb-4 border-b border-white/5 mb-4">
                <div className="flex justify-between text-foreground/60">
                  <span className="text-[9px] text-foreground/35 font-bold uppercase tracking-wider">Contact</span>
                  <span className="font-semibold">{cust.phone}</span>
                </div>
                <div className="flex justify-between text-foreground/60">
                  <span className="text-[9px] text-foreground/35 font-bold uppercase tracking-wider">Primary Vehicle</span>
                  <span className="font-semibold text-white truncate max-w-[170px]">{cust.vehicle}</span>
                </div>
              </div>
            </div>

            {/* Total Rescues */}
            <div className="flex items-center justify-between mt-auto">
              <div className="flex items-center gap-1.5 text-xs text-success bg-success/5 border border-success/15 px-2.5 py-1 rounded-lg font-bold">
                <CheckCircle2 size={12} />
                <span>{cust.rescuesCount} Successful Rescues</span>
              </div>
              
              <Award size={16} className={cust.membershipPlan === 'platinum' || cust.membershipPlan === 'gold' ? 'text-yellow-500' : 'text-foreground/20'} />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
