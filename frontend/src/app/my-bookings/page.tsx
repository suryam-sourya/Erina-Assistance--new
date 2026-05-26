"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  Phone, 
  MapPin, 
  CreditCard, 
  ChevronRight, 
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
  Clock
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

export default function MyBookingsPage() {
  const [phoneInput, setPhoneInput] = useState("");
  const [storedPhone, setStoredPhone] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSubmittingPhone, setIsSubmittingPhone] = useState(false);
  const router = useRouter();

  // Load phone number on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPhone = localStorage.getItem("erina_user_phone");
      if (savedPhone) {
        setStoredPhone(savedPhone);
        fetchBookings(savedPhone);
      }
    }
  }, []);

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

  const activeBookings = bookings.filter(b => b.status.toLowerCase() !== "completed" && b.status.toLowerCase() !== "cancelled");
  const pastBookings = bookings.filter(b => b.status.toLowerCase() === "completed" || b.status.toLowerCase() === "cancelled");

  return (
    <div className="min-h-screen bg-[#0A0D14] text-foreground pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-primary/30 selection:text-primary-foreground">
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
            <div className="glass-panel border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
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
                      className="w-full bg-[#111622] border border-white/10 hover:border-white/20 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 rounded-2xl py-4 pl-12 pr-4 text-foreground placeholder:text-foreground/20 font-bold transition-all text-lg tracking-wider"
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
                  className="w-full py-4.5 rounded-2xl bg-gradient-to-r from-primary to-orange-600 hover:from-primary/95 hover:to-orange-600/95 text-white font-black uppercase tracking-wider text-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                    className="text-primary hover:underline font-bold text-xs uppercase tracking-widest pl-2 border-l border-white/10"
                  >
                    Change Phone
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => fetchBookings(storedPhone)}
                  disabled={isLoading}
                  className="px-4.5 py-2.5 rounded-xl glass-panel border border-white/10 hover:bg-white/5 transition-colors font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer disabled:opacity-50"
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
                  <div key={i} className="glass-panel border border-white/5 rounded-3xl p-6.5 animate-pulse space-y-4">
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
                className="text-center glass-panel border border-white/10 rounded-3xl p-16 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary/30 via-orange-500/30 to-primary/30" />
                
                <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6 text-foreground/40">
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
                    className="px-8 py-3.5 rounded-2xl glass-panel border border-white/10 hover:bg-white/5 font-bold uppercase tracking-wider text-xs transition-colors"
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
                        <motion.div
                          key={b.id}
                          layoutId={b.id}
                          className="glass-panel border-2 border-emerald-500/20 hover:border-emerald-500/40 rounded-3xl p-6.5 relative overflow-hidden shadow-xl shadow-emerald-500/5 transition-all"
                        >
                          <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
                          
                          {/* Top Row: Ticket Info and live track button */}
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5 border-b border-white/5 pb-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs text-foreground/45 font-bold">TICKET: {b.id.substring(0, 8).toUpperCase()}</span>
                                <span className={getStatusBadgeClass(b.status)}>
                                  {getStatusLabel(b.status, b.subStatus)}
                                </span>
                              </div>
                              <h4 className="text-lg font-black text-primary mt-1.5 uppercase">{b.serviceLabel}</h4>
                            </div>

                            <Link
                              href={`/tracking?id=${b.id}`}
                              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-[#070A0F] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all cursor-pointer group"
                            >
                              <span>Track Live Rescue Map</span>
                              <ChevronRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                            </Link>
                          </div>

                          {/* Middle Grid: Detail blocks */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm mb-5">
                            <div className="space-y-1">
                              <span className="text-[10px] uppercase font-bold text-foreground/45 tracking-widest block">Stranded Vehicle</span>
                              <div className="flex items-center gap-2 font-bold text-foreground/80">
                                <Car size={16} className="text-primary/70" />
                                <span>{b.vehicleType}</span>
                              </div>
                              {b.vehicleNumber && (
                                <span className="text-xs font-mono font-bold bg-white/5 text-foreground/70 border border-white/10 px-2 py-0.5 rounded-md inline-block mt-1">
                                  {b.vehicleNumber}
                                </span>
                              )}
                            </div>

                            <div className="space-y-1">
                              <span className="text-[10px] uppercase font-bold text-foreground/45 tracking-widest block">Dispatch Location</span>
                              <div className="flex items-start gap-1.5 font-bold text-foreground/80">
                                <MapPin size={16} className="text-primary/70 shrink-0 mt-0.5" />
                                <span className="line-clamp-2 leading-relaxed text-xs">{b.address}</span>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <span className="text-[10px] uppercase font-bold text-foreground/45 tracking-widest block">Payment Setup</span>
                              <div className="flex items-center gap-2 font-bold text-foreground/80">
                                <CreditCard size={16} className="text-primary/70" />
                                <span>
                                  {b.paymentMethod === "ONLINE" ? "Paid Online (Simulation)" : "Pay on Delivery (Cash/UPI)"}
                                </span>
                              </div>
                              {b.paymentAmount !== undefined && (
                                <span className="text-xs font-bold text-emerald-400 block mt-1.5">
                                  Amount Billed: ₹{b.paymentAmount.toLocaleString("en-IN")}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Live Dispatcher Ticker / Steps */}
                          <div className="bg-[#111622] border border-white/5 rounded-2xl p-4.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                <Clock size={20} className="animate-spin" />
                              </div>
                              <div>
                                <h5 className="font-bold text-xs uppercase tracking-wider text-foreground/75">
                                  {b.technicianName ? `Responder: ${b.technicianName}` : "Dispatcher Allocation Phase"}
                                </h5>
                                <p className="text-[11px] text-foreground/45 mt-0.5">
                                  {b.estimatedArrivalTime 
                                    ? `Estimated Arrival Time: ${b.estimatedArrivalTime}`
                                    : "Matching closest certified motorist mechanic team..."}
                                </p>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="text-[10px] uppercase font-bold text-primary tracking-widest animate-pulse">
                                Live Session Open
                              </span>
                            </div>
                          </div>
                        </motion.div>
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
                        className="glass-panel border border-white/10 hover:border-white/15 rounded-2xl p-5.5 relative overflow-hidden transition-all"
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
                            <span className="text-emerald-400 font-bold">Archived Safely in DB</span>
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
