"use client";

import { useState, useEffect } from 'react';
import { useAdminStore } from '@/store/adminStore';
import { 
  BarChart, 
  Bar, 
  Cell,
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { LineChart as ChartIcon, Calendar, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react';

const categoryData = [
  { name: 'Flatbed Towing', value: 38, fill: '#00F0FF' },
  { name: 'Battery jump', value: 27, fill: '#F59E0B' },
  { name: 'EV Charge van', value: 20, fill: '#10B981' },
  { name: 'Lockout tools', value: 15, fill: '#8B5CF6' },
];

const dispatchHourlyData = [
  { hour: '00:00', load: 4, limit: 10 },
  { hour: '04:00', load: 8, limit: 12 },
  { hour: '08:00', load: 22, limit: 25 },
  { hour: '12:00', load: 18, limit: 25 },
  { hour: '16:00', load: 29, limit: 30 },
  { hour: '20:00', load: 15, limit: 20 },
];

export default function AnalyticsDesk() {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white uppercase tracking-wider">Operational Analytics Desk</h1>
        <p className="text-xs text-foreground/45 uppercase tracking-wider font-semibold mt-1">
          Perform high-fidelity regional sector queries, review hourly call distribution loads, and evaluate towing SLA scores
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Call Breakdown Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
          <div className="mb-6">
            <h3 className="text-xs font-black text-white uppercase tracking-wider">Rescue Category Breakdown</h3>
            <p className="text-[10px] text-foreground/35 uppercase tracking-wider font-semibold">Today's call categories distribution</p>
          </div>

          <div className="h-64 w-full">
            {isMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={9} />
                  <YAxis stroke="rgba(255,255,255,0.2)" fontSize={9} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#111827', 
                      borderColor: 'rgba(255,255,255,0.08)',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: '11px'
                    }} 
                  />
                  <Bar dataKey="value" fill="#00F0FF" radius={[6, 6, 0, 0]}>
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-foreground/30 font-bold uppercase tracking-widest">Initializing Category Graph...</div>
            )}
          </div>
        </div>

        {/* Load Distribution Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
          <div className="mb-6">
            <h3 className="text-xs font-black text-white uppercase tracking-wider">Dispatcher Load Distribution</h3>
            <p className="text-[10px] text-foreground/35 uppercase tracking-wider font-semibold">Live load volume compared to fleet capacity limits</p>
          </div>

          <div className="h-64 w-full">
            {isMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dispatchHourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="hour" stroke="rgba(255,255,255,0.2)" fontSize={9} />
                  <YAxis stroke="rgba(255,255,255,0.2)" fontSize={9} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#111827', 
                      borderColor: 'rgba(255,255,255,0.08)',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: '11px'
                    }} 
                  />
                  <Legend wrapperStyle={{ fontSize: '10px', marginTop: '10px' }} />
                  <Line type="monotone" dataKey="load" stroke="#00F0FF" strokeWidth={2.5} name="Active Dispatches" dot={{ fill: '#00F0FF' }} />
                  <Line type="monotone" dataKey="limit" stroke="#EF4444" strokeWidth={1.5} strokeDasharray="4 4" name="Fleet Threshold" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-foreground/30 font-bold uppercase tracking-widest">Initializing Load Graph...</div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
