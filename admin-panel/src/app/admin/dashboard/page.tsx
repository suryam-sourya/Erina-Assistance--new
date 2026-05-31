"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAdminStore, Booking } from '@/frontend/store/adminStore';
import { 
  Flame, 
  UserCheck, 
  CreditCard, 
  Wrench, 
  Plus, 
  AlertOctagon, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  Activity, 
  FileSpreadsheet,
  Zap,
  MapPin,
  User
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';

// Seed chart data
const initialChartData = [
  { time: '08:00', revenue: 4000, bookings: 3 },
  { time: '10:00', revenue: 9000, bookings: 6 },
  { time: '12:00', revenue: 15000, bookings: 9 },
  { time: '14:00', revenue: 16800, bookings: 11 },
  { time: '16:00', revenue: 21300, bookings: 13 },
  { time: '18:00', revenue: 26000, bookings: 16 },
  { time: '20:00', revenue: 30300, bookings: 18 },
];

export default function Dashboard() {
  const { 
    bookings, 
    technicians, 
    recentActivities, 
    getStats, 
    triggerEmergencyDispatch,
    addBooking,
    updateBookingStatus
  } = useAdminStore();
  
  const stats = getStats();
  
  // Mounted state to handle Recharts hydration in Next.js
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Modal states
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [showTechModal, setShowTechModal] = useState(false);

  // Dispatch Form States
  const [customerName, setCustomerName] = useState('');
  const [location, setLocation] = useState('');
  const [serviceType, setServiceType] = useState<'towing' | 'battery' | 'ev' | 'lockout'>('towing');
  const [isEmergency, setIsEmergency] = useState(false);

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !location) return;

    if (isEmergency) {
      triggerEmergencyDispatch(serviceType, location, customerName);
    } else {
      const serviceLabels = {
        towing: 'Flatbed Towing',
        battery: 'Battery Jumpstart',
        ev: 'Mobile EV Charging',
        lockout: 'Lockout Assistance',
      };
      
      addBooking({
        customerName,
        customerPhone: '+91 98450 ' + Math.floor(10000 + Math.random() * 90000),
        serviceType,
        serviceLabel: serviceLabels[serviceType],
        vehicleName: 'Sedan SUV (Standard)',
        vehiclePlate: 'KA-03-MY-' + Math.floor(1000 + Math.random() * 9000),
        technicianId: null,
        technicianName: null,
        status: 'pending',
        paymentStatus: 'pending',
        paymentAmount: serviceType === 'towing' ? 4500 : 1800,
        location,
      });
    }

    // Reset and Close
    setCustomerName('');
    setLocation('');
    setShowDispatchModal(false);
  };

  return (
    <div className="space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wider">Ops Command Desk</h1>
          <p className="text-xs text-foreground/45 uppercase tracking-wider font-semibold mt-1">Realtime dispatch queue & regional operational monitoring</p>
        </div>
        
        {/* Rapid Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => { setIsEmergency(true); setShowDispatchModal(true); }}
            className="flex items-center gap-2 bg-emergency hover:bg-emergency/85 text-white font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-emergency/20 border border-emergency/35 cursor-pointer emergency-glow"
          >
            <AlertOctagon size={14} className="animate-pulse" />
            <span>Emergency Dispatch</span>
          </button>
          
          <button
            onClick={() => { setIsEmergency(false); setShowDispatchModal(true); }}
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-background font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-primary/25 cursor-pointer"
          >
            <Plus size={14} className="stroke-[3]" />
            <span>New Dispatch</span>
          </button>
        </div>
      </div>

      {/* Operations Stat Cards Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Requests Card */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/5 rounded-full pointer-events-none group-hover:scale-110 transition-transform" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-foreground/45 font-black uppercase tracking-widest">Total Logs Today</span>
            <div className="p-2 bg-white/5 rounded-lg border border-white/5 text-foreground/60">
              <FileSpreadsheet size={16} />
            </div>
          </div>
          <h3 className="text-3xl font-black text-white mt-4">{stats.totalRequests}</h3>
          <div className="flex items-center gap-1.5 text-[10px] text-success font-bold uppercase tracking-wider mt-2">
            <TrendingUp size={12} />
            <span>+12.4% Active Volume</span>
          </div>
        </div>

        {/* Active Emergencies Card */}
        <div className={`glass-panel p-6 rounded-2xl border border-white/5 relative overflow-hidden group transition-all ${stats.activeEmergencies > 0 ? 'border-emergency/35 shadow-lg shadow-emergency/5' : ''}`}>
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-emergency/5 rounded-full pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-foreground/45 font-black uppercase tracking-widest">Active Emergencies</span>
            <div className={`p-2 rounded-lg border ${stats.activeEmergencies > 0 ? 'bg-emergency/20 border-emergency/35 text-emergency animate-pulse' : 'bg-white/5 border-white/5 text-foreground/60'}`}>
              <Flame size={16} />
            </div>
          </div>
          <h3 className="text-3xl font-black mt-4 text-white">{stats.activeEmergencies}</h3>
          <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider mt-2 ${stats.activeEmergencies > 0 ? 'text-emergency' : 'text-foreground/40'}`}>
            <Clock size={12} className={stats.activeEmergencies > 0 ? 'animate-spin' : ''} />
            <span>{stats.activeEmergencies > 0 ? 'Critical Dispatch Queue' : 'Zero Active Alarms'}</span>
          </div>
        </div>

        {/* Available Technicians Card */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/5 rounded-full pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-foreground/45 font-black uppercase tracking-widest">Available Techs</span>
            <div className="p-2 bg-white/5 rounded-lg border border-white/5 text-foreground/60">
              <UserCheck size={16} />
            </div>
          </div>
          <h3 className="text-3xl font-black text-white mt-4">{stats.availableTechnicians}</h3>
          <div className="flex items-center gap-1.5 text-[10px] text-success font-bold uppercase tracking-wider mt-2">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            <span>Ready for Dispatch</span>
          </div>
        </div>

        {/* Revenue Today Card */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 relative overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/5 rounded-full pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-foreground/45 font-black uppercase tracking-widest">Today's Settlements</span>
            <div className="p-2 bg-white/5 rounded-lg border border-white/5 text-foreground/60">
              <CreditCard size={16} />
            </div>
          </div>
          <h3 className="text-3xl font-black text-white mt-4">₹{stats.revenueToday.toLocaleString('en-IN')}</h3>
          <div className="flex items-center gap-1.5 text-[10px] text-primary font-bold uppercase tracking-wider mt-2">
            <CheckCircle2 size={12} />
            <span>100% SLA Audit Settled</span>
          </div>
        </div>

      </div>

      {/* Main Board Layout: Charts + Live Actions Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Operations Chart (2 columns width) */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xs font-black text-white uppercase tracking-wider">Revenue & Operations Trends</h3>
              <p className="text-[10px] text-foreground/35 uppercase tracking-wider font-semibold">Live revenue dispatch analysis today</p>
            </div>
            <span className="text-[9px] bg-primary/20 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-black uppercase tracking-widest">Active Stats</span>
          </div>

          <div className="h-64 w-full">
            {isMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={initialChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#00F0FF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="time" stroke="rgba(255,255,255,0.2)" fontSize={9} />
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
                  <Area type="monotone" dataKey="revenue" stroke="#00F0FF" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-foreground/30 font-bold uppercase tracking-widest">Initializing Operations Graph...</div>
            )}
          </div>
        </div>

        {/* Quick Operations panel */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col">
          <h3 className="text-xs font-black text-white uppercase tracking-wider mb-6 flex items-center gap-1.5">
            <Activity size={14} className="text-primary" />
            <span>Operations Log Feed</span>
          </h3>

          <div className="flex-1 space-y-4 max-h-[270px] overflow-y-auto pr-1">
            {recentActivities.slice(0, 5).map((act) => (
              <div key={act.id} className="flex gap-3 border-l-2 border-white/5 pl-3.5 py-0.5 group hover:border-primary/30 transition-all">
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-foreground/70 leading-relaxed font-semibold">
                    {act.message}
                  </p>
                  <span className="text-[9px] text-foreground/30 font-bold uppercase mt-1 block tracking-wider">
                    {act.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Live Active Bookings Queue */}
      <div className="glass-panel rounded-2xl border border-white/5 p-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-wider">Live Booking Queue</h3>
            <p className="text-[10px] text-foreground/35 uppercase tracking-wider font-semibold">Realtime incoming customer rescue requests</p>
          </div>
          
          <span className="text-[10px] bg-primary/20 text-primary border border-primary/20 px-3 py-1 rounded-full font-black uppercase tracking-wider">
            {bookings.filter(b => b.status !== 'completed').length} Active Cases
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border text-foreground/45 font-black uppercase tracking-widest">
                <th className="py-3 px-4">Booking ID</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Technician</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-semibold">
              {bookings.slice(0, 5).map((booking) => {
                const getStatusColor = (status: Booking['status']) => {
                  switch (status) {
                    case 'emergency': return 'bg-emergency/15 text-emergency border-emergency/35 animate-pulse';
                    case 'pending': return 'bg-warning/15 text-warning border-warning/35';
                    case 'assigned': return 'bg-[#6366F1]/15 text-[#818CF8] border-[#6366F1]/35';
                    case 'in-progress': return 'bg-orange-500/15 text-orange-400 border-orange-500/35';
                    case 'completed': return 'bg-success/15 text-success border-success/35';
                    case 'cancelled': return 'bg-emergency/15 text-emergency border-emergency/35';
                    default: return 'bg-muted/15 text-muted border-muted/35';
                  }
                };

                return (
                  <tr 
                    key={booking.id} 
                    className={`hover:bg-white/3 transition-colors ${booking.status === 'emergency' ? 'bg-emergency/5' : ''}`}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-white">{booking.id}</td>
                    <td className="py-3.5 px-4 font-black">{booking.customerName}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 uppercase tracking-wider text-[10px]">
                        {booking.serviceLabel}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-foreground/60 font-medium truncate max-w-[150px]">{booking.location}</td>
                    <td className="py-3.5 px-4">
                      {booking.technicianName ? (
                        <div className="flex items-center gap-1.5">
                          <User size={12} className="text-primary" />
                          <span>{booking.technicianName}</span>
                        </div>
                      ) : (
                        <span className="text-foreground/30 italic">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full border text-[9px] font-black uppercase tracking-wider ${getStatusColor(booking.status)}`}>
                        {booking.status?.toLowerCase() === 'cancelled' ? 'booking cancelled' : booking.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {booking.status?.toLowerCase() === 'in-progress' && (
                        <button
                          onClick={() => updateBookingStatus(booking.id, 'completed')}
                          className="px-2.5 py-1 bg-success hover:bg-success/80 text-background font-bold rounded-lg text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                        >
                          Complete Case
                        </button>
                      )}
                      
                      {booking.status?.toLowerCase() === 'emergency' && (
                        <button
                          onClick={() => updateBookingStatus(booking.id, 'assigned')}
                          className="px-2.5 py-1 bg-emergency hover:bg-emergency/80 text-white font-bold rounded-lg text-[10px] uppercase tracking-wider transition-all cursor-pointer animate-pulse"
                        >
                          Assign Unit
                        </button>
                      )}

                      {booking.status?.toLowerCase() === 'pending' && (
                        <span className="text-[10px] text-foreground/30">Needs Assignment</span>
                      )}

                      {booking.status?.toLowerCase() === 'completed' && (
                        <span className="text-[10px] text-success flex items-center gap-1 justify-end">
                          <CheckCircle2 size={12} />
                          <span>Archived</span>
                        </span>
                      )}

                      {booking.status?.toLowerCase() === 'cancelled' && (
                        <span className="text-[10px] text-emergency flex items-center gap-1 justify-end font-bold uppercase tracking-wider">
                          <AlertOctagon size={12} className="shrink-0" />
                          <span>Cancelled</span>
                        </span>
                      )}

                      {booking.status?.toLowerCase() === 'assigned' && (
                        <button
                          onClick={() => updateBookingStatus(booking.id, 'in-progress')}
                          className="px-2.5 py-1 bg-primary hover:bg-primary-hover text-background font-bold rounded-lg text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                        >
                          Mark Active
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* DISPATCH COMMAND MODAL (HIGH FIDELITY PROTO) */}
      {showDispatchModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md glass-panel p-6 rounded-2xl border border-white/10"
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
              <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-1.5">
                <Wrench size={16} className={isEmergency ? 'text-emergency animate-pulse' : 'text-primary'} />
                <span>{isEmergency ? '⚠️ Critical Emergency Dispatch' : '🆕 Standard Dispatch Ticket'}</span>
              </h3>
              <button 
                onClick={() => setShowDispatchModal(false)}
                className="text-foreground/45 hover:text-white p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDispatch} className="space-y-4">
              <div>
                <label className="block text-[9px] text-foreground/45 font-bold uppercase tracking-wider mb-1.5">Customer Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30" size={14} />
                  <input
                    type="text"
                    required
                    placeholder="Enter customer name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-background border border-white/10 focus:border-primary/50 text-xs px-9 py-2.5 rounded-lg outline-none text-white font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] text-foreground/45 font-bold uppercase tracking-wider mb-1.5">Rescue Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30" size={14} />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Koramangala Outer Ring Road, Bangalore"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-background border border-white/10 focus:border-primary/50 text-xs px-9 py-2.5 rounded-lg outline-none text-white font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] text-foreground/45 font-bold uppercase tracking-wider mb-1.5">Service Segment</label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value as any)}
                    className="w-full bg-background border border-white/10 focus:border-primary/50 text-xs p-2.5 rounded-lg outline-none text-white font-semibold cursor-pointer"
                  >
                    <option value="towing">Towing Service</option>
                    <option value="battery">Battery Service</option>
                    <option value="ev">Mobile EV Charge</option>
                    <option value="lockout">Lockout Service</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] text-foreground/45 font-bold uppercase tracking-wider mb-1.5">Priority Sector</label>
                  <div className="flex items-center h-[38px]">
                    <span className={`px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-wider ${
                      isEmergency 
                        ? 'bg-emergency/20 text-emergency border-emergency/35' 
                        : 'bg-primary/20 text-primary border-primary/35'
                    }`}>
                      {isEmergency ? 'Critical SLA' : 'Standard SLA'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className={`w-full py-3 rounded-lg text-xs font-black uppercase tracking-wider mt-4 transition-all hover:shadow-lg cursor-pointer ${
                  isEmergency 
                    ? 'bg-emergency hover:bg-emergency/85 text-white hover:shadow-emergency/20 shadow-md border border-emergency/25' 
                    : 'bg-primary hover:bg-primary-hover text-background hover:shadow-primary/20'
                }`}
              >
                {isEmergency ? '⚠️ Dispatch Rapid Rescue Unit' : '🚀 Log Dispatch & Notify Team'}
              </button>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}
