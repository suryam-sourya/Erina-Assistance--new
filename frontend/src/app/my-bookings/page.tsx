"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/store/userStore";
import { 
  Phone, 
  MapPin, 
  CreditCard, 
  ChevronRight, 
  ChevronUp,
  ChevronDown,
  AlertCircle, 
  CheckCircle2, 
  RefreshCw, 
  Car, 
  Search, 
  ArrowRight, 
  Calendar, 
  ExternalLink,
  Info,
  DollarSign,
  Wrench,
  Clock,
  Truck,
  Zap,
  Droplet,
  Key,
  Compass,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Booking {
  id: string;
  customerName: string;
  phone: string;
  vehicleType: string;
  vehicleNumber: string;
  vehiclePlate: string;
  serviceLabel: string;
  serviceType: string;
  address: string;
  status: string;
  subStatus: string | null;
  paymentStatus: string;
  paymentMethod?: string;
  paymentAmount?: number;
  createdAt: string;
  estimatedArrivalTime?: string | null;
  technicianName?: string | null;
}

// Module-level Helper Functions
const getStatusBadgeClass = (status: string) => {
  const s = status.toLowerCase();
  if (s === "completed") return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
  if (s === "emergency" || s === "cancelled") return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
  if (s === "pending") return "bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse";
  return "bg-sky-500/10 text-sky-400 border border-sky-500/20"; // assigned, in_progress, en_route
};

const getStatusLabel = (status: string, subStatus: string | null) => {
  const s = status.toLowerCase();
  if (s === "completed") return "Resolved Successfully";
  if (s === "cancelled") return "Cancelled";
  if (s === "pending") return "Searching for Motorist";
  if (s === "emergency") return "High Priority Rescue Queue";
  
  if (s === "assigned") {
    if (subStatus === "collecting_tools") return "Technician Gathering Tools";
    return "Technician Assigned";
  }
  if (s === "in_progress" || s === "en_route") {
    if (subStatus === "nearly_there") return "Technician Approaching Site";
    return "Technician En Route";
  }
  return status;
};

const getServiceIcon = (serviceType: string) => {
  const type = serviceType?.toLowerCase() || '';
  if (type.includes('towing') && type.includes('car')) {
    return {
      icon: <Truck size={26} />,
      bgColor: 'bg-rose-50 dark:bg-rose-950/20',
      textColor: 'text-rose-500'
    };
  }
  if (type.includes('towing') || type.includes('bike') || type.includes('assistance')) {
    return {
      icon: <Wrench size={26} />,
      bgColor: 'bg-red-50 dark:bg-red-950/20',
      textColor: 'text-red-500'
    };
  }
  if (type.includes('battery')) {
    return {
      icon: <Zap size={26} />,
      bgColor: 'bg-amber-50 dark:bg-amber-950/20',
      textColor: 'text-amber-500'
    };
  }
  if (type.includes('fuel')) {
    return {
      icon: <Droplet size={26} />,
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
      textColor: 'text-emerald-500'
    };
  }
  if (type.includes('lockout')) {
    return {
      icon: <Key size={26} />,
      bgColor: 'bg-purple-50 dark:bg-purple-950/20',
      textColor: 'text-purple-500'
    };
  }
  if (type.includes('ev')) {
    return {
      icon: <Zap size={26} />,
      bgColor: 'bg-cyan-50 dark:bg-cyan-950/20',
      textColor: 'text-cyan-500'
    };
  }
  return {
    icon: <Sparkles size={26} />,
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    textColor: 'text-blue-500'
  };
};

function ActiveBookingCard({ b }: { b: Booking }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const bookingDate = new Date(b.createdAt).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });

  const bookingTime = new Date(b.createdAt).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });

  const maskedPhone = b.phone.length > 2 
    ? "*".repeat(b.phone.length - 2) + b.phone.slice(-2) 
    : b.phone;

  const statusLabel = getStatusLabel(b.status, b.subStatus);

  let dispatcherPhase = "Active Rescue Monitoring";
  const s = b.status.toLowerCase();
  if (s === "pending" || s === "emergency") {
    dispatcherPhase = "Allocation in Progress";
  } else if (s === "assigned") {
    dispatcherPhase = "Dispatch Route Preparation";
  } else if (s === "in_progress" || s === "en_route") {
    dispatcherPhase = "Technician En Route";
  }

  const serviceIconInfo = getServiceIcon(b.serviceType);

  return (
    <motion.div
      layoutId={b.id}
      className="glass-panel bg-white dark:bg-gray-900/80 border border-gray-150 dark:border-gray-800 rounded-3xl p-6 relative overflow-hidden shadow-lg transition-all"
    >
      <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
      
      {/* Top Row: Ticket Info, status indicator and live track button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5 border-b border-gray-100 dark:border-gray-800/80 pb-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex flex-col">
            <span className="text-[10px] text-foreground/45 uppercase tracking-wider font-bold">Ticket</span>
            <span className="font-mono text-sm font-black text-foreground">{b.id.substring(0, 8).toUpperCase()}</span>
          </div>
          
          <div className="hidden sm:block w-px h-8 bg-gray-150 dark:bg-gray-800" />
          
          <div className="flex flex-col">
            <span className="text-[10px] text-foreground/45 uppercase tracking-wider font-bold">Status</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${
                b.status.toLowerCase() === 'emergency' ? 'bg-rose-500 animate-pulse' :
                b.status.toLowerCase() === 'pending' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
              }`} />
              <span className={`text-xs font-bold ${
                b.status.toLowerCase() === 'emergency' ? 'text-rose-500' :
                b.status.toLowerCase() === 'pending' ? 'text-amber-500' : 'text-emerald-500'
              }`}>{statusLabel}</span>
            </div>
          </div>
        </div>

        <Link
          href={`/tracking?id=${b.id}`}
          className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10 transition-all cursor-pointer group"
        >
          <Compass size={14} className="animate-spin text-white" />
          <span>Track Live Rescue Map</span>
          <ChevronRight size={16} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* Main Service Block */}
      <div className="flex items-start gap-4">
        {/* Service Type Circular Icon */}
        <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 shadow-sm ${serviceIconInfo.bgColor} ${serviceIconInfo.textColor}`}>
          {serviceIconInfo.icon}
        </div>
        
        <div className="flex-grow space-y-4">
          <h4 className="text-base font-extrabold text-primary tracking-wide uppercase mt-1">
            {b.serviceLabel}
          </h4>
          
          {/* Middle Grid: Detail blocks */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-150 dark:border-gray-800 flex items-center justify-center text-primary/70 shrink-0">
                <Car size={18} />
              </div>
              <div className="space-y-0.5">
                <span className="text-[9px] uppercase font-bold text-foreground/45 tracking-widest block">Vehicle</span>
                <span className="text-xs font-bold text-foreground block uppercase leading-tight">{b.vehicleType}</span>
                {b.vehicleNumber && (
                  <span className="text-[10px] font-mono font-bold text-foreground/60 block">
                    {b.vehicleNumber}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-150 dark:border-gray-800 flex items-center justify-center text-primary/70 shrink-0">
                <MapPin size={18} />
              </div>
              <div className="space-y-0.5 min-w-0">
                <span className="text-[9px] uppercase font-bold text-foreground/45 tracking-widest block">Dispatch Location</span>
                <span className="text-xs font-semibold text-foreground/80 line-clamp-2 leading-relaxed block">{b.address}</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-150 dark:border-gray-800 flex items-center justify-center text-primary/70 shrink-0">
                <CreditCard size={18} />
              </div>
              <div className="space-y-0.5">
                <span className="text-[9px] uppercase font-bold text-foreground/45 tracking-widest block">Payment Setup</span>
                <span className="text-xs font-bold text-foreground block leading-tight">
                  {b.paymentMethod === "ONLINE" ? "Paid Online (Simulation)" : "Pay on Delivery (Cash/UPI)"}
                </span>
                {b.paymentAmount !== undefined && (
                  <span className="text-xs font-bold text-emerald-500 block mt-0.5">
                    Amount Billed: ₹{b.paymentAmount.toLocaleString("en-IN")}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Collapse Trigger Link */}
      {!isExpanded && (
        <div className="border-t border-gray-100 dark:border-gray-800/80 mt-5 pt-3 flex justify-end">
          <button
            onClick={() => setIsExpanded(true)}
            className="text-primary hover:text-primary-hover font-bold text-xs uppercase tracking-widest flex items-center gap-1 cursor-pointer select-none"
          >
            <span>More Info</span>
            <ChevronDown size={14} />
          </button>
        </div>
      )}

      {/* Expanded Details Section */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-gray-100 dark:border-gray-800/80 mt-5 pt-5"
          >
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr] gap-6 text-sm text-foreground/85">
              {/* Col 1: Booking Details */}
              <div className="space-y-3">
                <h5 className="font-extrabold text-xs uppercase tracking-wider text-foreground/50 flex items-center gap-1.5 mb-4">
                  <Calendar size={14} className="text-primary" />
                  Booking Details
                </h5>
                <div className="space-y-2 text-xs">
                  <div className="grid grid-cols-[100px_1fr] gap-2">
                    <span className="text-foreground/50">Service Type</span>
                    <span className="font-bold text-foreground">: {b.serviceLabel}</span>
                  </div>
                  <div className="grid grid-cols-[100px_1fr] gap-2">
                    <span className="text-foreground/50">Booking Date</span>
                    <span className="font-bold text-foreground">: {bookingDate}</span>
                  </div>
                  <div className="grid grid-cols-[100px_1fr] gap-2">
                    <span className="text-foreground/50">Booking Time</span>
                    <span className="font-bold text-foreground">: {bookingTime}</span>
                  </div>
                  <div className="grid grid-cols-[100px_1fr] gap-2">
                    <span className="text-foreground/50">Customer Name</span>
                    <span className="font-bold text-foreground">: {b.customerName}</span>
                  </div>
                  <div className="grid grid-cols-[100px_1fr] gap-2">
                    <span className="text-foreground/50">Contact Number</span>
                    <span className="font-bold text-foreground">: {maskedPhone}</span>
                  </div>
                </div>
              </div>

              {/* Vertical Separator */}
              <div className="hidden md:block w-px bg-gray-150 dark:bg-gray-800/80 self-stretch" />

              {/* Col 2: Dispatch Details */}
              <div className="space-y-3">
                <h5 className="font-extrabold text-xs uppercase tracking-wider text-foreground/50 flex items-center gap-1.5 mb-4">
                  <Compass size={14} className="text-primary animate-pulse" />
                  Dispatch Details
                </h5>
                <div className="space-y-2 text-xs">
                  <div className="grid grid-cols-[100px_1fr] gap-2">
                    <span className="text-foreground/50">Current Status</span>
                    <span className={`font-bold ${
                      b.status.toLowerCase() === 'emergency' ? 'text-rose-500' :
                      b.status.toLowerCase() === 'pending' ? 'text-amber-500' : 'text-emerald-500'
                    }`}>: {statusLabel}</span>
                  </div>
                  <div className="grid grid-cols-[100px_1fr] gap-2">
                    <span className="text-foreground/50">Dispatcher Phase</span>
                    <span className="font-bold text-foreground">: {dispatcherPhase}</span>
                  </div>
                  <div className="grid grid-cols-[100px_1fr] gap-2">
                    <span className="text-foreground/50">Live Session</span>
                    <span className="font-bold text-emerald-500">: Open</span>
                  </div>
                  <div className="grid grid-cols-[100px_1fr] gap-2">
                    <span className="text-foreground/50">ETA</span>
                    <span className="font-bold text-foreground">: {b.estimatedArrivalTime || "Calculating..."}</span>
                  </div>
                </div>
              </div>

              {/* Vertical Separator */}
              <div className="hidden md:block w-px bg-gray-150 dark:bg-gray-800/80 self-stretch" />

              {/* Col 3: Payment Details */}
              <div className="space-y-3">
                <h5 className="font-extrabold text-xs uppercase tracking-wider text-foreground/50 flex items-center gap-1.5 mb-4">
                  <CreditCard size={14} className="text-primary" />
                  Payment Details
                </h5>
                <div className="space-y-2 text-xs">
                  <div className="grid grid-cols-[100px_1fr] gap-2">
                    <span className="text-foreground/50">Amount</span>
                    <span className="font-bold text-foreground">: ₹{b.paymentAmount?.toLocaleString("en-IN") || "0"}</span>
                  </div>
                  <div className="grid grid-cols-[100px_1fr] gap-2">
                    <span className="text-foreground/50">Payment Method</span>
                    <span className="font-bold text-foreground">: {b.paymentMethod === "ONLINE" ? "Card / Netbanking" : "Cash / UPI"}</span>
                  </div>
                  <div className="grid grid-cols-[100px_1fr] gap-2">
                    <span className="text-foreground/50">Payment Status</span>
                    <span className="font-bold text-foreground">: {b.paymentStatus || "Pending"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Less Info Button */}
            <div className="flex justify-end pt-5 border-t border-gray-100 dark:border-gray-800/80 mt-5">
              <button
                onClick={() => setIsExpanded(false)}
                className="text-primary hover:text-primary-hover font-bold text-xs uppercase tracking-widest flex items-center gap-1 cursor-pointer select-none"
              >
                <span>Less Info</span>
                <ChevronUp size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function MyBookingsPage() {
  const [phoneInput, setPhoneInput] = useState("");
  const [storedPhone, setStoredPhone] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSubmittingPhone, setIsSubmittingPhone] = useState(false);
  const router = useRouter();
  const { user } = useUserStore();

  // Load phone number on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPhone = localStorage.getItem("erina_user_phone");
      if (savedPhone) {
        setStoredPhone(savedPhone);
        fetchBookings(savedPhone);
      } else if (user?.phoneNumber) {
        // Sanitize and set user phone number from firebase authentication profile
        const cleanPhone = user.phoneNumber.replace(/[^\d+]/g, "").trim();
        if (cleanPhone) {
          localStorage.setItem("erina_user_phone", cleanPhone);
          setStoredPhone(cleanPhone);
          fetchBookings(cleanPhone);
        }
      }
    }
  }, [user]);

  const fetchBookings = async (phone: string) => {
    setIsLoading(true);
    setError("");
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const res = await fetch(`${apiUrl}/api/bookings/by-phone?phone=${encodeURIComponent(phone)}`);
      const data = await res.json();
      
      if (data.success) {
        setBookings(data.bookings || []);
      } else {
        setError(data.error || "Failed to retrieve bookings");
      }
    } catch (err: any) {
      console.error("Fetch bookings failed:", err);
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneInput.trim()) return;
    
    setIsSubmittingPhone(true);
    const sanitizedPhone = phoneInput.replace(/[^\d+]/g, "").trim();
    
    if (sanitizedPhone.length < 5 || sanitizedPhone.length > 15) {
      setError("Please enter a valid phone number (5 to 15 digits).");
      setIsSubmittingPhone(false);
      return;
    }

    if (typeof window !== "undefined") {
      localStorage.setItem("erina_user_phone", sanitizedPhone);
    }
    setStoredPhone(sanitizedPhone);
    fetchBookings(sanitizedPhone);
    setIsSubmittingPhone(false);
  };

  const handleLogoutPhone = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("erina_user_phone");
    }
    setStoredPhone(null);
    setBookings([]);
    setError("");
    setPhoneInput("");
  };

  // Removed class-level getStatusBadgeClass and getStatusLabel (now at module scope)

  const activeBookings = bookings.filter(b => b.status.toLowerCase() !== "completed" && b.status.toLowerCase() !== "cancelled");
  const pastBookings = bookings.filter(b => b.status.toLowerCase() === "completed" || b.status.toLowerCase() === "cancelled");

  return (
    <div className="min-h-screen bg-background text-foreground pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-primary/30 selection:text-primary-foreground">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[450px] h-[450px] rounded-full bg-orange-500/5 blur-[150px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* State A: Phone number retrieval form */}
        {!storedPhone ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto"
          >
            <div className="glass-panel border border-black/5 dark:border-white/10 rounded-3xl p-8 shadow-2xl dark:shadow-none relative overflow-hidden bg-white/60 dark:bg-gray-900/60">
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-primary to-orange-500" />
              
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Wrench size={32} className="animate-pulse" />
                </div>
              </div>

              <h1 className="text-2xl font-black text-center tracking-tight mb-2">
                RETRIEVE YOUR RESCUES
              </h1>
              <p className="text-xs text-foreground/50 text-center mb-8 uppercase tracking-wider font-semibold">
                Enter your registered mobile number to see active trackings and billing summaries
              </p>

              <form onSubmit={handlePhoneSubmit} className="space-y-5">
                <div>
                  <label htmlFor="phone" className="block text-xs font-bold text-foreground/60 uppercase tracking-widest mb-2 pl-1">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30" size={18} />
                    <input
                      id="phone"
                      type="tel"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      placeholder="+91 XXXXX XXXXX"
                      required
                      className="w-full bg-gray-50 dark:bg-[#111622] border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 rounded-2xl py-4 pl-12 pr-4 text-foreground placeholder:text-foreground/30 font-bold transition-all text-lg tracking-wider"
                    />
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-center gap-2"
                  >
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={isSubmittingPhone}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-orange-600 hover:from-primary/95 hover:to-orange-600/95 text-white font-black uppercase tracking-wider text-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmittingPhone ? "Connecting..." : "Retrieve Rescue History"}
                  <ArrowRight size={16} />
                </button>
              </form>

              <div className="mt-8 pt-6 border-t border-white/5 text-center">
                <p className="text-[10px] text-foreground/35 uppercase tracking-widest font-semibold">
                  Erina Kadugodi Ops Hub Service Region
                </p>
                <div className="flex items-center justify-center gap-1.5 mt-2 text-primary font-bold text-xs">
                  <MapPin size={12} />
                  <span>Kanpur / Bengaluru Metropolitan Area</span>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          /* State B: Active history grid list */
          <div className="space-y-10">
            {/* Header Portal Info */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
              <div>
                <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                  Motorist Portal
                </div>
                <h1 className="text-3xl font-black tracking-tight">MY ROADSIDE ASSISTS</h1>
                <div className="flex items-center gap-2 mt-1.5 text-foreground/45 text-sm font-semibold">
                  <span>Registered: {storedPhone}</span>
                  <button 
                    onClick={handleLogoutPhone}
                    className="text-primary hover:underline font-bold text-xs uppercase tracking-widest pl-2 border-l border-gray-200 dark:border-white/10"
                  >
                    Change Phone
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => fetchBookings(storedPhone)}
                  disabled={isLoading}
                  className="px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 transition-colors font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw size={14} className={isLoading ? "animate-spin text-primary" : ""} />
                  Refresh List
                </button>

                <Link
                  href="/booking"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-orange-500 text-white font-black text-xs uppercase tracking-wider hover:shadow-md hover:shadow-primary/10 transition-all"
                >
                  Book New Rescue
                </Link>
              </div>
            </div>

            {isLoading && bookings.length === 0 ? (
              /* Loading Skeleton Screen */
              <div className="space-y-6">
                {[1, 2].map((i) => (
                  <div key={i} className="glass-panel border border-black/5 dark:border-white/5 rounded-3xl p-6 animate-pulse space-y-4 bg-white/30 dark:bg-[#111622]/30">
                    <div className="h-6 w-1/3 bg-white/5 rounded-lg" />
                    <div className="h-4 w-2/3 bg-white/5 rounded-lg" />
                    <div className="h-10 w-24 bg-white/5 rounded-lg" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-bold flex items-center gap-3.5">
                <AlertCircle size={20} className="shrink-0" />
                <span>{error}</span>
              </div>
            ) : bookings.length === 0 ? (
              /* Beautiful Empty State */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center glass-panel bg-white/50 dark:bg-gray-900/50 border border-black/5 dark:border-white/10 rounded-3xl p-16 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary/30 via-orange-500/30 to-primary/30" />
                
                <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center mx-auto mb-6 text-foreground/40">
                  <Car size={36} />
                </div>
                
                <h3 className="text-xl font-black uppercase tracking-wide">No Rescues Registered Yet</h3>
                <p className="text-sm text-foreground/50 max-w-md mx-auto mt-2 leading-relaxed">
                  We couldn't find any roadside dispatch requests under the phone number <span className="text-primary font-bold">{storedPhone}</span>.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row gap-3.5 justify-center">
                  <Link
                    href="/booking"
                    className="px-8 py-3.5 rounded-2xl bg-primary text-white font-black uppercase tracking-wider text-xs shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:bg-primary/95 transition-all"
                  >
                    Request Emergency Assistance Now
                  </Link>
                  <button
                    onClick={handleLogoutPhone}
                    className="px-8 py-3.5 rounded-2xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 font-bold uppercase tracking-wider text-xs transition-colors"
                  >
                    Try Another Number
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-12">
                
                {/* 1. Active Dispatch Cases Section */}
                {activeBookings.length > 0 && (
                  <div className="space-y-5">
                    <h3 className="text-sm font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2 pl-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      Active Dispatch Trackers ({activeBookings.length})
                    </h3>

                    <div className="grid gap-6">
                      {activeBookings.map((b) => (
                        <ActiveBookingCard key={b.id} b={b} />
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Completed / Archived Cases Section */}
                <div className="space-y-5">
                  <h3 className="text-sm font-black uppercase tracking-widest text-foreground/50 pl-1">
                    Archived Incident History ({pastBookings.length})
                  </h3>

                  <div className="grid gap-5">
                    {pastBookings.map((b) => (
                      <div
                        key={b.id}
                        className="glass-panel bg-white/40 dark:bg-gray-900/40 border border-black/5 dark:border-white/10 hover:border-black/10 dark:hover:border-white/15 rounded-2xl p-5 relative overflow-hidden transition-all"
                      >
                        {/* Upper row */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4.5 border-b border-white/5 pb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] text-foreground/35 font-bold">CASE: {b.id.substring(0, 8).toUpperCase()}</span>
                              <span className="text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-white/5 text-foreground/55 border border-white/10 flex items-center gap-1">
                                <Calendar size={10} />
                                {new Date(b.createdAt).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric"
                                })}
                              </span>
                              <span className={getStatusBadgeClass(b.status)}>
                                {getStatusLabel(b.status, b.subStatus)}
                              </span>
                            </div>
                            <h4 className="text-base font-extrabold text-foreground/80 mt-1 uppercase">{b.serviceLabel}</h4>
                          </div>

                          <div className="text-right">
                            {b.paymentAmount !== undefined && (
                              <div className="font-bold text-foreground">
                                ₹{b.paymentAmount.toLocaleString("en-IN")}
                              </div>
                            )}
                            <div className="text-[10px] text-foreground/45 mt-0.5 uppercase tracking-wider font-semibold">
                              {b.paymentMethod === "ONLINE" ? "ONLINE CARD GATEWAY" : "PAY ON DELIVERY"}
                            </div>
                          </div>
                        </div>

                        {/* Summary specifications details */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-foreground/60 mb-2">
                          <div className="flex items-center gap-1.5">
                            <Car size={13} className="text-foreground/30 shrink-0" />
                            <span className="truncate">{b.vehicleType} {b.vehicleNumber && `(${b.vehicleNumber})`}</span>
                          </div>
                          
                          <div className="flex items-center gap-1.5">
                            <MapPin size={13} className="text-foreground/30 shrink-0" />
                            <span className="truncate leading-none">{b.address}</span>
                          </div>

                          <div className="flex items-center gap-1.5 sm:justify-end">
                            <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                            <span className="text-emerald-400 font-bold">Incident Resolved</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}
            
          </div>
        )}

      </div>
    </div>
  );
}
