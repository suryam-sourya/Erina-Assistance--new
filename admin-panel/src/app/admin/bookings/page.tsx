"use client";

import { useState, useEffect, Fragment } from 'react';
import { useAdminStore, Booking, Technician } from '@/frontend/store/adminStore';
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
  ChevronRight,
  Truck,
  Wrench,
  Activity,
  Package,
  FileText,
  Plus,
  Minus,
  Trash2
} from 'lucide-react';
import { motion } from 'framer-motion';
import LiveTrackingMap from './LiveTrackingMap';

export default function BookingsManagement() {
  const { bookings, technicians, assignTechnician, updateBookingStatus } = useAdminStore();
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');

  // Assign Tech Modal State
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Incident Image Preview State
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Expanded visual dispatch progress row
  const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);

  // Product Selector Modal State
  const [selectedBookingForProducts, setSelectedBookingForProducts] = useState<Booking | null>(null);
  const [availableProducts, setAvailableProducts] = useState<any[]>([]);
  const [selectedProductQuantities, setSelectedProductQuantities] = useState<Record<string, number>>({});
  const [isSubmittingProducts, setIsSubmittingProducts] = useState(false);
  const [productSearch, setProductSearch] = useState('');

  // Fetch products when modal opens
  useEffect(() => {
    if (!selectedBookingForProducts) return;
    const loadProducts = async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        if (data.success) {
          setAvailableProducts(data.products || []);
        }
      } catch (err) {
        console.error('Failed to load products:', err);
      }
    };
    loadProducts();
    setSelectedProductQuantities({});
    setProductSearch('');
  }, [selectedBookingForProducts]);

  const adjustProductQty = (productId: string, delta: number, maxStock: number) => {
    setSelectedProductQuantities(prev => {
      const current = prev[productId] || 0;
      const next = current + delta;
      if (next <= 0) {
        const updated = { ...prev };
        delete updated[productId];
        return updated;
      }
      return { ...prev, [productId]: Math.min(next, maxStock) };
    });
  };

  const handleResolveWithProducts = async () => {
    if (!selectedBookingForProducts) return;
    const bookingId = selectedBookingForProducts.id;

    // Build soldProducts payload
    const soldProducts = Object.entries(selectedProductQuantities)
      .map(([productId, qty]) => ({ productId, qty }));

    if (soldProducts.length === 0) {
      alert("Please select at least one product or click 'Mark Complete' on the table for service-only resolution.");
      return;
    }

    setIsSubmittingProducts(true);
    try {
      // 1. Attach products and generate invoice
      const response = await fetch(`/api/bookings/${bookingId}/add-products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ soldProducts }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to attach products.");
      }

      // 2. Mark booking as completed
      await updateBookingStatus(bookingId, 'completed');

      // 3. Open invoice in new tab
      window.open(`/admin/invoice/${bookingId}`, '_blank');

      // 4. Close modal
      setSelectedBookingForProducts(null);
    } catch (err: any) {
      alert(`Error resolving booking: ${err.message}`);
    } finally {
      setIsSubmittingProducts(false);
    }
  };

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
                filteredBookings.map((booking) => {
                  const techInfo = technicians.find(t => t.id === booking.technicianId);
                  
                  return (
                    <Fragment key={booking.id}>
                      {/* Interactive Case Row */}
                      <tr 
                        key={booking.id}
                        onClick={() => setExpandedBookingId(expandedBookingId === booking.id ? null : booking.id)}
                        className={`hover:bg-white/3 transition-all cursor-pointer ${booking.status === 'emergency' ? 'bg-emergency/5' : ''} ${
                          expandedBookingId === booking.id ? 'bg-white/5 border-l-2 border-primary' : ''
                        }`}
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
                          <div className="flex items-center gap-2">
                            {booking.imageUrl && (
                              <div 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPreviewImage(booking.imageUrl || null);
                                }}
                                className="relative w-8 h-8 rounded-lg overflow-hidden border border-white/10 hover:border-primary/50 cursor-pointer flex-shrink-0 group/thumb"
                                title="Click to view incident photo"
                              >
                                <img src={booking.imageUrl} alt="Incident" className="object-cover w-full h-full group-hover/thumb:scale-110 transition-all" />
                              </div>
                            )}
                            <div>
                              <div className="text-foreground/80">{booking.vehicleName}</div>
                              <div className="font-mono text-[9px] text-foreground/40 mt-1 uppercase tracking-wider">{booking.vehiclePlate}</div>
                            </div>
                          </div>
                        </td>

                        {/* Technician */}
                        <td className="py-4 px-5">
                          {booking.technicianName ? (
                            <div>
                              <div className="flex items-center gap-1 text-white font-bold">
                                <UserCheck size={12} className="text-primary" />
                                <span>{booking.technicianName}</span>
                              </div>
                              <span className="text-[9px] text-foreground/35 block mt-0.5 max-w-[140px] truncate">{booking.location}</span>
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
                          <span className={`px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${
                            booking.status === 'assigned'
                              ? 'bg-blue-500/15 text-blue-400 border-blue-500/35'
                              : booking.status === 'in-progress' && booking.subStatus === 'leaving_hub'
                                ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/35 animate-pulse'
                                : booking.status === 'in-progress' && booking.subStatus === 'arrived'
                                  ? 'bg-orange-500/15 text-orange-400 border-orange-500/35'
                                  : getStatusBadgeStyles(booking.status)
                          }`}>
                            {booking.status === 'assigned'
                              ? 'Assigned (Preparing)'
                              : booking.status === 'in-progress' && booking.subStatus === 'leaving_hub'
                                ? 'En Route (Left Hub)'
                                : booking.status === 'in-progress' && booking.subStatus === 'arrived'
                                  ? 'Unit On-Scene'
                                  : booking.status}
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
                        <td className="py-4 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-end items-center gap-2">
                            {booking.status === 'completed' ? (
                              <div className="flex items-center gap-2 justify-end">
                                <a
                                  href={`/admin/invoice/${booking.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 font-bold rounded-lg text-[10px] uppercase tracking-wider transition-all"
                                >
                                  <FileText size={11} /> Invoice
                                </a>
                                <span className="text-[10px] text-success flex items-center gap-1 font-bold uppercase tracking-wider">
                                  <CheckCircle2 size={12} />
                                  <span>Resolved</span>
                                </span>
                              </div>
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
                                    {/* Assigned (collecting_tools) -> En Route (leaving_hub) */}
                                    {booking.status === 'assigned' && (
                                      <button
                                        onClick={() => updateBookingStatus(booking.id, 'in-progress', 'leaving_hub')}
                                        className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white font-black rounded-lg text-[10px] uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-indigo-500/10"
                                        title="Collect gear at Kadugodi Central Hub & start outbound travel"
                                      >
                                        Set En Route
                                      </button>
                                    )}

                                    {/* En Route (leaving_hub) -> Arrived (arrived) */}
                                    {booking.status === 'in-progress' && booking.subStatus === 'leaving_hub' && (
                                      <button
                                        onClick={() => updateBookingStatus(booking.id, 'in-progress', 'arrived')}
                                        className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-lg text-[10px] uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-orange-500/10"
                                        title="Confirm responder has arrived at motorists stranded site"
                                      >
                                        Mark Arrived
                                      </button>
                                    )}

                                    {/* Arrived (arrived) -> Resolved (completed) */}
                                    {booking.status === 'in-progress' && booking.subStatus === 'arrived' && (
                                      <div className="flex items-center gap-1.5">
                                        <button
                                          onClick={() => updateBookingStatus(booking.id, 'completed')}
                                          className="px-2.5 py-1.5 bg-success hover:bg-success/80 text-background font-black rounded-lg text-[10px] uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-success/15"
                                          title="Resolve incident and close command ticket"
                                        >
                                          Mark Complete
                                        </button>
                                        <button
                                          onClick={() => setSelectedBookingForProducts(booking)}
                                          className="px-2.5 py-1.5 bg-[#FF6B35] hover:bg-[#FF6B35]/80 text-white font-black rounded-lg text-[10px] uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-[#FF6B35]/15 flex items-center gap-1"
                                          title="Suggest parts/products, compile live invoice & close ticket"
                                        >
                                          <Package size={11} /> Add Products
                                        </button>
                                      </div>
                                    )}

                                    {/* Fallback for other en-route / in-progress states */}
                                    {booking.status === 'in-progress' && !booking.subStatus && (
                                      <div className="flex items-center gap-1.5">
                                        <button
                                          onClick={() => updateBookingStatus(booking.id, 'completed')}
                                          className="px-2.5 py-1.5 bg-success hover:bg-success/80 text-background font-black rounded-lg text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                                        >
                                          Mark Complete
                                        </button>
                                        <button
                                          onClick={() => setSelectedBookingForProducts(booking)}
                                          className="px-2.5 py-1.5 bg-[#FF6B35] hover:bg-[#FF6B35]/80 text-white font-black rounded-lg text-[10px] uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1"
                                        >
                                          <Package size={11} /> Add Products
                                        </button>
                                      </div>
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

                      {/* Expandable Visual Journey Timeline */}
                      {expandedBookingId === booking.id && (
                        <tr className="bg-black/30 border-b border-border">
                          <td colSpan={8} className="p-6">
                            <motion.div 
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex flex-col lg:flex-row items-stretch justify-between gap-6"
                            >
                              
                              {/* Left Panel: Central Ops Hub & Stage Radar Stack */}
                              <div className="lg:w-2/5 flex flex-col gap-4">
                                {/* Central Ops Hub Badge card */}
                                <div className="space-y-3.5 bg-card/60 p-5 rounded-2xl border border-white/5 text-left relative overflow-hidden">
                                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/2 rounded-full blur-xl pointer-events-none" />
                                  <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                    <h4 className="text-[10px] font-black text-white uppercase tracking-wider">Erina Ops Central Hub</h4>
                                  </div>
                                  
                                  <p className="text-[11px] text-foreground/75 leading-relaxed font-medium">
                                    <strong>Central Hub Address:</strong><br />
                                    Shop No. 02, Dinnur Main Road, Kadugodi Colony, Opp: Srihalli Cafe, Bengaluru, Karnataka — 560067
                                  </p>
                                  
                                  <div className="flex items-center justify-between text-[9px] text-foreground/45 border-t border-white/5 pt-2.5 font-bold uppercase tracking-wider">
                                    <span>Station Coordinates</span>
                                    <span className="text-primary font-mono">12.9902° N, 77.7602° E</span>
                                  </div>
                                  
                                  {techInfo && (
                                    <div className="text-[9px] text-foreground/50 border-t border-white/5 pt-2.5 font-semibold">
                                      <strong>Dispatched Unit:</strong> {techInfo.name} <br />
                                      <span className="text-foreground/40">{techInfo.vehicleType}</span>
                                    </div>
                                  )}
                                </div>

                                {/* Interactive Stages Map Progress Timeline */}
                                <div className="flex-1 flex flex-col justify-center bg-card/25 p-5 rounded-2xl border border-white/5 min-h-[180px]">
                                  <h4 className="text-[10px] font-black text-white uppercase tracking-wider mb-6 text-left flex items-center gap-1.5">
                                    <Activity size={12} className="text-primary animate-pulse" />
                                    <span>Live Dispatch Stage Radar</span>
                                  </h4>

                                  <div className="relative flex items-center justify-between w-full px-2">
                                    {/* Horizontal connector line */}
                                    <div className="absolute left-8 right-8 top-5 h-[2px] bg-white/5 -z-10" />
                                    
                                    {/* Milestone Nodes */}
                                    {/* Node 1: Setup */}
                                    <div className="flex flex-col items-center text-center max-w-[70px]">
                                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${
                                        booking.status !== 'pending' && booking.status !== 'emergency'
                                          ? 'bg-success/20 text-success border-success/35 shadow-lg shadow-success/5'
                                          : 'bg-card text-foreground/30 border-white/5'
                                      }`}>
                                        <Clock size={16} />
                                      </div>
                                      <span className="text-[9px] font-black uppercase tracking-wider mt-2.5 text-white">Hub Setup</span>
                                      <span className="text-[8px] text-foreground/40 mt-1 font-semibold leading-normal">
                                        {booking.status === 'pending' || booking.status === 'emergency' ? 'Pending Queue' : 'Incident Logged'}
                                      </span>
                                    </div>

                                    {/* Node 2: Collecting Tools */}
                                    <div className="flex flex-col items-center text-center max-w-[90px]">
                                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${
                                        booking.status === 'completed' || (booking.status === 'in-progress') || (booking.status === 'assigned' && booking.subStatus !== 'collecting_tools')
                                          ? 'bg-success/20 text-success border-success/35 shadow-lg shadow-success/5'
                                          : (booking.status === 'assigned' && booking.subStatus === 'collecting_tools')
                                            ? 'bg-blue-500/20 text-blue-400 border-blue-500/50 animate-pulse shadow-md shadow-blue-500/10'
                                            : 'bg-card text-foreground/30 border-white/5'
                                      }`}>
                                        <Wrench size={16} />
                                      </div>
                                      <span className="text-[9px] font-black uppercase tracking-wider mt-2.5 text-white">Collecting Tools</span>
                                      <span className="text-[8px] text-foreground/40 mt-1 font-semibold leading-normal">
                                        {booking.status === 'assigned' && booking.subStatus === 'collecting_tools' ? 'Gathering Gear' : (booking.status === 'pending' || booking.status === 'emergency' ? 'Awaiting Dispatch' : 'Unit Loaded')}
                                      </span>
                                    </div>

                                    {/* Node 3: Outbound */}
                                    <div className="flex flex-col items-center text-center max-w-[90px]">
                                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${
                                        booking.status === 'completed' || (booking.status === 'in-progress' && booking.subStatus === 'arrived')
                                          ? 'bg-success/20 text-success border-success/35 shadow-lg shadow-success/5'
                                          : (booking.status === 'in-progress' && booking.subStatus === 'leaving_hub')
                                            ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/50 animate-pulse shadow-md shadow-indigo-500/10'
                                            : 'bg-card text-foreground/30 border-white/5'
                                      }`}>
                                        <Truck size={16} />
                                      </div>
                                      <span className="text-[9px] font-black uppercase tracking-wider mt-2.5 text-white">Leaving Hub</span>
                                      <span className="text-[8px] text-foreground/40 mt-1 font-semibold leading-normal">
                                        {booking.status === 'in-progress' && booking.subStatus === 'leaving_hub' ? 'Leaving station' : (booking.status === 'completed' || (booking.status === 'in-progress' && booking.subStatus === 'arrived') ? 'Left Hub' : 'En-route')}
                                      </span>
                                    </div>

                                    {/* Node 4: On-Scene */}
                                    <div className="flex flex-col items-center text-center max-w-[90px]">
                                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${
                                        booking.status === 'completed'
                                          ? 'bg-success/20 text-success border-success/35 shadow-lg shadow-success/5'
                                          : (booking.status === 'in-progress' && booking.subStatus === 'arrived')
                                            ? 'bg-orange-500/20 text-orange-400 border-orange-500/50 animate-pulse shadow-md shadow-orange-500/10'
                                            : 'bg-card text-foreground/30 border-white/5'
                                      }`}>
                                        <MapPin size={16} />
                                      </div>
                                      <span className="text-[9px] font-black uppercase tracking-wider mt-2.5 text-white">Arrived Scene</span>
                                      <span className="text-[8px] text-foreground/40 mt-1 font-semibold leading-normal">
                                        {booking.status === 'in-progress' && booking.subStatus === 'arrived' ? 'Active Rescue' : (booking.status === 'completed' ? 'Arrived' : 'On-Scene')}
                                      </span>
                                    </div>

                                    {/* Node 5: Success */}
                                    <div className="flex flex-col items-center text-center max-w-[70px]">
                                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${
                                        booking.status === 'completed'
                                          ? 'bg-success/20 text-success border-success/35 shadow-lg shadow-success/5'
                                          : 'bg-card text-foreground/30 border-white/5'
                                      }`}>
                                        <CheckCircle2 size={16} />
                                      </div>
                                      <span className="text-[9px] font-black uppercase tracking-wider mt-2.5 text-white">Resolved</span>
                                      <span className="text-[8px] text-foreground/40 mt-1 font-semibold leading-normal">
                                        {booking.status === 'completed' ? 'Case Resolved' : 'Ticket Open'}
                                      </span>
                                    </div>

                                  </div>
                                </div>
                              </div>

                              {/* Right Panel: Interactive Dispatch Live Map */}
                              <div className="flex-1 flex flex-col bg-card/60 p-5 rounded-2xl border border-white/5 min-h-[350px]">
                                <h4 className="text-[10px] font-black text-white uppercase tracking-wider mb-4 text-left flex items-center gap-1.5">
                                  <MapPin size={12} className="text-primary animate-pulse" />
                                  <span>Live Operations Radar Map</span>
                                </h4>
                                <div className="flex-1 min-h-[280px]">
                                  <LiveTrackingMap 
                                    bookingId={booking.id}
                                    customerLat={booking.coordinates?.lat || 12.9716}
                                    customerLng={booking.coordinates?.lng || 77.5946}
                                    status={booking.status}
                                    subStatus={booking.subStatus || null}
                                    technicianName={booking.technicianName}
                                  />
                                </div>
                              </div>

                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })
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

      {/* INCIDENT IMAGE FULL PREVIEW MODAL */}
      {previewImage && (
        <div 
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setPreviewImage(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative max-w-3xl w-full rounded-2xl overflow-hidden glass-panel border border-white/10 p-2 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute right-4 top-4 z-10">
              <button 
                onClick={() => setPreviewImage(null)}
                className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 border border-white/10 text-white flex items-center justify-center transition-all cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>
            <div className="relative aspect-video w-full bg-black/40 rounded-xl overflow-hidden flex items-center justify-center">
              <img 
                src={previewImage} 
                alt="Incident Vehicle Zoom" 
                className="max-w-full max-h-[80vh] object-contain rounded-xl"
              />
            </div>
          </motion.div>
        </div>
      )}

      {/* PRODUCT SELECTOR & COMBINED INVOICE GENERATOR MODAL */}
      {selectedBookingForProducts && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-4xl glass-panel rounded-3xl border border-white/10 overflow-hidden flex flex-col md:flex-row max-h-[85vh]"
          >
            {/* LEFT SIDE: PRODUCT INVENTORY SELECTOR */}
            <div className="flex-1 p-6 flex flex-col min-h-0 border-b md:border-b-0 md:border-r border-white/5">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-1.5">
                    <Package className="text-primary" size={16} /> Hub Parts Inventory
                  </h3>
                  <p className="text-[9px] text-foreground/45 uppercase tracking-wider font-semibold mt-1">
                    Select suggested products to add to booking {selectedBookingForProducts.id}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedBookingForProducts(null)}
                  className="md:hidden text-foreground/45 hover:text-white p-1 cursor-pointer font-bold text-sm"
                >
                  ✕
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/35" size={14} />
                <input
                  type="text"
                  placeholder="Search parts, battery, tyres..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full bg-background/50 border border-white/5 focus:border-primary/50 text-xs px-9 py-2.5 rounded-xl outline-none text-white font-semibold transition-all"
                />
              </div>

              {/* Products List */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 min-h-[200px] md:min-h-0">
                {availableProducts.filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase())).length > 0 ? (
                  availableProducts
                    .filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()))
                    .map((product) => {
                      const selectedQty = selectedProductQuantities[product._id] || 0;
                      const hasLowStock = product.stock > 0 && product.stock <= 3;
                      const isOutOfStock = product.stock <= 0;

                      return (
                        <div
                          key={product._id}
                          className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                            selectedQty > 0
                              ? 'bg-primary/5 border-primary/45 shadow-sm shadow-primary/5'
                              : 'bg-background/30 border-white/5 hover:border-white/10'
                          }`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-white">{product.name}</span>
                              {isOutOfStock ? (
                                <span className="text-[8px] bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.2 rounded-full font-black uppercase">
                                  Out of Stock
                                </span>
                              ) : hasLowStock ? (
                                <span className="text-[8px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.2 rounded-full font-black uppercase animate-pulse">
                                  Only {product.stock} Left
                                </span>
                              ) : null}
                            </div>
                            <div className="flex items-center gap-1.5 text-[9px] text-foreground/45 mt-1 font-semibold uppercase tracking-wider">
                              <span>{product.category}</span>
                              {product.sku && (
                                <>
                                  <span>•</span>
                                  <span className="font-mono text-foreground/35">{product.sku}</span>
                                </>
                              )}
                            </div>
                            <div className="text-[11px] font-black text-white mt-1">
                              ₹{product.sellingPrice.toLocaleString('en-IN')}
                            </div>
                          </div>

                          {/* Controls */}
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            {selectedQty > 0 ? (
                              <div className="flex items-center bg-black/40 border border-white/5 rounded-lg overflow-hidden">
                                <button
                                  onClick={() => adjustProductQty(product._id, -1, product.stock)}
                                  className="p-1.5 text-foreground/50 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                                >
                                  <Minus size={12} />
                                </button>
                                <span className="px-3 text-xs font-black text-white font-mono">
                                  {selectedQty}
                                </span>
                                <button
                                  disabled={selectedQty >= product.stock}
                                  onClick={() => adjustProductQty(product._id, 1, product.stock)}
                                  className={`p-1.5 text-foreground/50 hover:text-white hover:bg-white/5 transition-colors cursor-pointer ${
                                    selectedQty >= product.stock ? 'opacity-30 cursor-not-allowed' : ''
                                  }`}
                                >
                                  <Plus size={12} />
                                </button>
                              </div>
                            ) : (
                              <button
                                disabled={isOutOfStock}
                                onClick={() => adjustProductQty(product._id, 1, product.stock)}
                                className={`px-3 py-1.5 bg-white/5 hover:bg-primary hover:text-background border border-white/10 hover:border-transparent font-black rounded-lg text-[9px] uppercase tracking-wider transition-all cursor-pointer ${
                                  isOutOfStock ? 'opacity-30 cursor-not-allowed bg-transparent border-white/5 text-foreground/20' : ''
                                }`}
                              >
                                {isOutOfStock ? 'Sold Out' : 'Select'}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                ) : (
                  <div className="border border-white/5 rounded-xl py-8 text-center text-foreground/30 font-bold uppercase tracking-widest text-[9px]">
                    No items in inventory match search
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT SIDE: LIVE ESTIMATE BILL & INVOICE SUMMARY */}
            <div className="w-full md:w-[350px] bg-black/40 p-6 flex flex-col min-h-0 justify-between">
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex justify-between items-start mb-5 pb-3 border-b border-white/5">
                  <div>
                    <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-1.5">
                      <FileText className="text-[#FF6B35]" size={14} /> Estimate Bill
                    </h3>
                    <p className="text-[8px] text-foreground/45 uppercase tracking-wider font-semibold mt-0.5">
                      Combined Fare Breakdown & Tax
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedBookingForProducts(null)}
                    className="hidden md:block text-foreground/45 hover:text-white p-1 cursor-pointer font-bold text-sm"
                  >
                    ✕
                  </button>
                </div>

                {/* Items Breakdown list */}
                <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 text-xs mb-4">
                  {/* Service Fare Item */}
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-[11px] font-black text-white">{selectedBookingForProducts.serviceLabel}</div>
                      <div className="text-[8px] text-foreground/45 uppercase font-bold tracking-wider mt-0.5">Stranded On-Scene Assistance Fare</div>
                    </div>
                    <div className="font-bold text-white font-mono">₹{selectedBookingForProducts.paymentAmount.toLocaleString('en-IN')}</div>
                  </div>

                  {/* Products Fare Items */}
                  {Object.entries(selectedProductQuantities).map(([productId, qty]) => {
                    const product = availableProducts.find(p => p._id === productId);
                    if (!product) return null;
                    return (
                      <div key={productId} className="flex justify-between items-start pt-3 border-t border-white/5">
                        <div>
                          <div className="text-[11px] font-black text-white">{product.name}</div>
                          <div className="text-[8px] text-foreground/45 uppercase font-bold tracking-wider mt-0.5">
                            Qty: {qty} × ₹{product.sellingPrice.toLocaleString('en-IN')}
                          </div>
                        </div>
                        <div className="font-bold text-white font-mono">₹{(product.sellingPrice * qty).toLocaleString('en-IN')}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Summary calculations */}
              <div className="border-t border-white/5 pt-4 space-y-2.5">
                {/* Math */}
                {(() => {
                  const serviceFare = selectedBookingForProducts.paymentAmount || 0;
                  const productsFare = Object.entries(selectedProductQuantities).reduce((acc, [id, qty]) => {
                    const p = availableProducts.find(item => item._id === id);
                    return acc + (p ? p.sellingPrice * qty : 0);
                  }, 0);
                  const subtotal = serviceFare + productsFare;
                  const gst = Math.round(subtotal * 0.18);
                  const grandTotal = subtotal + gst;

                  return (
                    <>
                      <div className="flex justify-between text-[10px] text-foreground/45 uppercase tracking-wider font-bold">
                        <span>Items Subtotal</span>
                        <span className="font-mono text-white">₹{subtotal.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-[10px] text-foreground/45 uppercase tracking-wider font-bold">
                        <span>GST (18% standard)</span>
                        <span className="font-mono text-white">₹{gst.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between items-center border-t border-white/5 pt-3">
                        <span className="text-[10px] text-white uppercase tracking-widest font-black">Grand Total Bill</span>
                        <span className="text-sm font-black text-primary font-mono">₹{grandTotal.toLocaleString('en-IN')}</span>
                      </div>

                      {/* Action buttons */}
                      <div className="mt-4 space-y-2">
                        <button
                          disabled={isSubmittingProducts || Object.keys(selectedProductQuantities).length === 0}
                          onClick={handleResolveWithProducts}
                          className={`w-full py-2.5 bg-[#FF6B35] hover:bg-[#FF6B35]/80 text-white font-black rounded-xl text-[10px] uppercase tracking-widest transition-all cursor-pointer shadow-lg shadow-orange-500/10 flex items-center justify-center gap-2 ${
                            (isSubmittingProducts || Object.keys(selectedProductQuantities).length === 0) ? 'opacity-40 cursor-not-allowed' : ''
                          }`}
                        >
                          {isSubmittingProducts ? (
                            <>
                              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>Compiling...</span>
                            </>
                          ) : (
                            <>
                              <FileText size={12} />
                              <span>Generate Invoice & Resolve</span>
                            </>
                          )}
                        </button>

                        <button
                          disabled={isSubmittingProducts}
                          onClick={() => setSelectedBookingForProducts(null)}
                          className="w-full py-2 bg-transparent hover:bg-white/5 text-foreground/45 hover:text-white border border-white/5 font-black rounded-xl text-[9px] uppercase tracking-widest transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
