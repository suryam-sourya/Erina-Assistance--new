"use client";

import { useState } from 'react';
import { useAdminStore, Booking, Technician } from '@/store/adminStore';
import { 
  Search, 
  Filter, 
  UserCheck, 
  Flame, 
  MapPin, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  DollarSign, 
  CreditCard,
  User,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function BookingsManagement() {
  const { bookings, technicians, assignTechnician, updateBookingStatus } = useAdminStore();
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');

  // Assign Tech Modal State
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Filter Bookings
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' ? true : booking.status === statusFilter;
    const matchesService = serviceFilter === 'all' ? true : booking.serviceType === serviceFilter;

    return matchesSearch && matchesStatus && matchesService;
  });

  const getAvailableTechsForService = (serviceType: Booking['serviceType']) => {
    // Return technicians that are available (or evenbusy if we want to show busy ones, but let's prioritize available)
    return technicians.filter(t => t.availability === 'available');
  };

  const handleAssignTech = (technicianId: string) => {
    if (!selectedBooking) return;
    assignTechnician(selectedBooking.id, technicianId);
    
    // Automatically progress from 'emergency' or 'pending' to 'assigned'
    if (selectedBooking.status === 'pending' || selectedBooking.status === 'emergency') {
      updateBookingStatus(selectedBooking.id, 'assigned');
    }
    
    setSelectedBooking(null);
  };

  const getStatusBadgeStyles = (status: Booking['status']) => {
    switch (status) {
      case 'emergency': return 'bg-emergency/15 text-emergency border-emergency/35 animate-pulse';
      case 'pending': return 'bg-warning/15 text-warning border-warning/35';
      case 'assigned': return 'bg-blue-500/15 text-blue-400 border-blue-500/35';
      case 'in-progress': return 'bg-orange-500/15 text-orange-400 border-orange-500/35';
      case 'completed': return 'bg-success/15 text-success border-success/35';
      default: return 'bg-muted/15 text-muted border-muted/35';
    }
  };

  const getServiceBadgeStyles = (type: Booking['serviceType']) => {
    switch (type) {
      case 'towing': return 'bg-[#3B82F6]/15 text-[#60A5FA] border-[#3B82F6]/30';
      case 'battery': return 'bg-[#F59E0B]/15 text-[#FBBF24] border-[#F59E0B]/30';
      case 'ev': return 'bg-[#10B981]/15 text-[#34D399] border-[#10B981]/30';
      case 'lockout': return 'bg-[#8B5CF6]/15 text-[#A78BFA] border-[#8B5CF6]/30';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header section */}
      <div>
        <h1 className="text-2xl font-black text-white uppercase tracking-wider">Bookings Queue</h1>
        <p className="text-xs text-foreground/45 uppercase tracking-wider font-semibold mt-1">
          Monitor dispatch metrics, track rescue cycles, and manage live technician deployments
        </p>
      </div>

      {/* Control Filters Area */}
      <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/35" size={16} />
            <input
              type="text"
              placeholder="Search by ID, name, location, license plate..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-background border border-white/5 focus:border-primary/50 text-xs px-11 py-3 rounded-xl outline-none text-white font-semibold transition-all"
            />
          </div>

          {/* Quick Filter Selection */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Status Select */}
            <div className="flex items-center gap-1.5 bg-background border border-white/5 px-3 py-1.5 rounded-xl">
              <Filter size={12} className="text-foreground/40" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent border-none text-[10px] font-black uppercase tracking-wider text-foreground/80 outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="emergency">🚨 Emergency</option>
                <option value="pending">⏳ Pending</option>
                <option value="assigned">👤 Assigned</option>
                <option value="in-progress">⚙️ In Progress</option>
                <option value="completed">✅ Completed</option>
              </select>
            </div>

            {/* Service Select */}
            <div className="flex items-center gap-1.5 bg-background border border-white/5 px-3 py-1.5 rounded-xl">
              <Filter size={12} className="text-foreground/40" />
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="bg-transparent border-none text-[10px] font-black uppercase tracking-wider text-foreground/80 outline-none cursor-pointer"
              >
                <option value="all">All Services</option>
                <option value="towing">Flatbed Towing</option>
                <option value="battery">Battery jump</option>
                <option value="ev">Mobile EV Charge</option>
                <option value="lockout">Lockout help</option>
              </select>
            </div>

          </div>
        </div>
      </div>

      {/* Bookings Queue Grid */}
      <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-black/20 text-foreground/45 font-black uppercase tracking-widest">
                <th className="py-4 px-5">Case ID</th>
                <th className="py-4 px-5">Customer Profile</th>
                <th className="py-4 px-5">Service Category</th>
                <th className="py-4 px-5">Vehicle & Plates</th>
                <th className="py-4 px-5">Dispatched Tech</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5">Fare</th>
                <th className="py-4 px-5 text-right">Dispatch Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-semibold">
              {filteredBookings.length > 0 ? (
                filteredBookings.map((booking) => (
                  <tr 
                    key={booking.id}
                    className={`hover:bg-white/3 transition-colors ${booking.status === 'emergency' ? 'bg-emergency/5' : ''}`}
                  >
                    {/* Booking ID */}
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-white text-xs">{booking.id}</span>
                        {booking.status === 'emergency' && (
                          <span className="w-2 h-2 rounded-full bg-emergency animate-ping" />
                        )}
                      </div>
                      <span className="text-[9px] text-foreground/30 font-bold block mt-1 tracking-wider uppercase">
                        {booking.createdTime}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="py-4 px-5">
                      <div className="font-black text-white">{booking.customerName}</div>
                      <div className="text-[10px] text-foreground/40 mt-0.5">{booking.customerPhone}</div>
                    </td>

                    {/* Service */}
                    <td className="py-4 px-5">
                      <span className={`px-2.5 py-0.8 rounded-md border text-[9px] font-black uppercase tracking-wider ${getServiceBadgeStyles(booking.serviceType)}`}>
                        {booking.serviceLabel}
                      </span>
                    </td>

                    {/* Vehicle */}
                    <td className="py-4 px-5">
                      <div className="text-foreground/80">{booking.vehicleName}</div>
                      <div className="font-mono text-[9px] text-foreground/40 mt-1 uppercase tracking-wider">{booking.vehiclePlate}</div>
                    </td>

                    {/* Technician */}
                    <td className="py-4 px-5">
                      {booking.technicianName ? (
                        <div>
                          <div className="flex items-center gap-1 text-white font-bold">
                            <UserCheck size={12} className="text-primary" />
                            <span>{booking.technicianName}</span>
                          </div>
                          <span className="text-[9px] text-foreground/35 block mt-0.5">{booking.location}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-foreground/30 italic">
                          <AlertCircle size={12} className="text-foreground/20" />
                          <span>No Tech Dispatched</span>
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-5">
                      <span className={`px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${getStatusBadgeStyles(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>

                    {/* Payment */}
                    <td className="py-4 px-5">
                      <div className="text-white font-bold">₹{booking.paymentAmount.toLocaleString('en-IN')}</div>
                      <span className={`text-[9px] font-black uppercase tracking-wider mt-0.5 block ${booking.paymentStatus === 'completed' ? 'text-success' : 'text-warning'}`}>
                        {booking.paymentStatus}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 text-right">
                      <div className="flex justify-end items-center gap-2">
                        {booking.status === 'completed' ? (
                          <span className="text-[10px] text-success flex items-center gap-1 justify-end font-bold uppercase tracking-wider">
                            <CheckCircle2 size={12} />
                            <span>Archived Case</span>
                          </span>
                        ) : (
                          <>
                            {/* If unassigned, show Assign Technician */}
                            {!booking.technicianId ? (
                              <button
                                onClick={() => setSelectedBooking(booking)}
                                className="px-3 py-1.5 bg-primary hover:bg-primary-hover text-background font-black rounded-lg text-[10px] uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-primary/20"
                              >
                                Dispatch Technician
                              </button>
                            ) : (
                              <>
                                {/* Assigned -> In Progress */}
                                {booking.status === 'assigned' && (
                                  <button
                                    onClick={() => updateBookingStatus(booking.id, 'in-progress')}
                                    className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white font-black rounded-lg text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                                  >
                                    Progress case
                                  </button>
                                )}

                                {/* In Progress -> Completed */}
                                {booking.status === 'in-progress' && (
                                  <button
                                    onClick={() => updateBookingStatus(booking.id, 'completed')}
                                    className="px-3 py-1.5 bg-success hover:bg-success/80 text-background font-black rounded-lg text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                                  >
                                    Mark Complete
                                  </button>
                                )}

                                {/* Emergency with Tech -> Progress */}
                                {booking.status === 'emergency' && (
                                  <button
                                    onClick={() => updateBookingStatus(booking.id, 'in-progress')}
                                    className="px-3 py-1.5 bg-emergency hover:bg-emergency/80 text-white font-black rounded-lg text-[10px] uppercase tracking-wider transition-all cursor-pointer animate-pulse"
                                  >
                                    Activate Case
                                  </button>
                                )}
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-foreground/30 font-bold uppercase tracking-widest">
                    No active rescue operations match this sector query
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* TECHNICIAN DISPATCH/ASSIGNMENT MODAL */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg glass-panel p-6 rounded-2xl border border-white/10"
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Select Rescue Operator</h3>
                <p className="text-[9px] text-foreground/45 uppercase tracking-wider font-semibold mt-1">
                  Assign unit to Booking {selectedBooking.id} ({selectedBooking.serviceLabel})
                </p>
              </div>
              <button 
                onClick={() => setSelectedBooking(null)}
                className="text-foreground/45 hover:text-white p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Active Case Summary */}
            <div className="bg-background/50 border border-white/5 rounded-xl p-4 mb-5 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-foreground/45 font-bold uppercase tracking-wider">Sector Location</span>
                <span className="text-white font-bold flex items-center gap-1">
                  <MapPin size={12} className="text-red-500" />
                  {selectedBooking.location}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-foreground/45 font-bold uppercase tracking-wider">Requester</span>
                <span className="text-white font-bold">{selectedBooking.customerName}</span>
              </div>
            </div>

            {/* List Available Technicians */}
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
              <h4 className="text-[10px] text-foreground/45 font-black uppercase tracking-widest mb-2">Available Dispatch Units</h4>
              
              {getAvailableTechsForService(selectedBooking.serviceType).length > 0 ? (
                getAvailableTechsForService(selectedBooking.serviceType).map((tech) => (
                  <div 
                    key={tech.id}
                    className="bg-background/40 hover:bg-white/3 border border-white/5 hover:border-primary/30 p-4 rounded-xl flex items-center justify-between gap-4 transition-all group"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-white">{tech.name}</span>
                        <span className="text-[9px] bg-success/20 text-success border border-success/35 px-2 py-0.2 rounded-full font-black uppercase tracking-wider">
                          {tech.rating} ★
                        </span>
                      </div>
                      <div className="text-[10px] text-foreground/45 mt-1 font-semibold">
                        {tech.vehicleType} | {tech.serviceArea}
                      </div>
                    </div>

                    <button
                      onClick={() => handleAssignTech(tech.id)}
                      className="px-3.5 py-2 bg-primary hover:bg-primary-hover text-background font-black rounded-lg text-[10px] uppercase tracking-wider transition-all cursor-pointer group-hover:shadow-md group-hover:shadow-primary/20 flex items-center gap-1"
                    >
                      <span>Deploy Unit</span>
                      <ChevronRight size={12} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="border border-white/5 rounded-xl p-6 text-center text-foreground/30 font-bold uppercase tracking-widest text-[11px] leading-relaxed">
                  ⚠️ No available technicians in this sector. <br />
                  <span className="text-[9px] font-semibold text-foreground/20">Go to Technicians panel and set off-duty units to Available.</span>
                </div>
              )}
            </div>

          </motion.div>
        </div>
      )}

    </div>
  );
}
