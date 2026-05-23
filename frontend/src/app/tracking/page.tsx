"use client";

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { MapPin, Phone, MessageSquare, Star, Clock, CheckCircle2, CircleDashed, Search, Navigation, XCircle } from 'lucide-react';

function TrackingContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Search input
  const [searchId, setSearchId] = useState('');

  // Polling updates
  useEffect(() => {
    if (!id) return;

    const fetchBooking = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
        const response = await fetch(`${apiUrl}/api/bookings/${id}`);
        const data = await response.json();
        if (data.success) {
          setBooking(data.booking);
          setError('');
        } else {
          setError(data.error || 'Booking not found');
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch live updates.');
      }
    };

    setLoading(true);
    fetchBooking().finally(() => setLoading(false));

    // Poll database updates every 8 seconds
    const interval = setInterval(fetchBooking, 8000);
    return () => clearInterval(interval);
  }, [id]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;
    window.location.href = `/tracking?id=${searchId.trim()}`;
  };

  // State 1: No ID provided -> Show gorgeous Search Case Screen
  if (!id) {
    return (
      <div className="min-h-screen pt-28 pb-16 bg-light dark:bg-[#0B0F19] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-800 space-y-6"
        >
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-2">
              <Navigation size={32} className="animate-pulse" />
            </div>
            <h2 className="text-3xl font-extrabold text-foreground">Track Live Rescue</h2>
            <p className="text-sm text-foreground/50">Enter your Booking ID to view real-time technician coordinates and updates.</p>
          </div>

          <form onSubmit={handleSearchSubmit} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text"
                required
                placeholder="Enter Booking ID (e.g. 64b8...)"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary-hover text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 cursor-pointer"
            >
              Search Booking
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // State 2: Loading State
  if (loading && !booking) {
    return (
      <div className="min-h-screen pt-28 pb-16 bg-light dark:bg-[#0B0F19] flex items-center justify-center">
        <div className="text-center space-y-4">
          <CircleDashed className="animate-spin text-primary mx-auto" size={48} />
          <p className="text-sm font-semibold text-foreground/60">Fetching live rescue details...</p>
        </div>
      </div>
    );
  }

  // State 3: Error State
  if (error || !booking) {
    return (
      <div className="min-h-screen pt-28 pb-16 bg-light dark:bg-[#0B0F19] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="max-w-md w-full bg-white dark:bg-gray-900 rounded-3xl shadow-xl p-8 border border-gray-100 dark:border-gray-800 text-center space-y-6"
        >
          <div className="w-16 h-16 bg-emergency/10 text-emergency rounded-full flex items-center justify-center mx-auto">
            <XCircle size={32} />
          </div>
          <h2 className="text-2xl font-extrabold text-foreground">Rescue ID Not Found</h2>
          <p className="text-sm text-foreground/55 leading-relaxed">
            We couldn't locate a roadside assistance request with ID <span className="font-mono font-black text-foreground break-all">{id}</span>. Please verify the ID or request new assistance.
          </p>
          <div className="flex gap-3">
            <a href="/tracking" className="flex-1 bg-gray-100 dark:bg-gray-800 py-3.5 rounded-xl font-bold hover:bg-gray-200 text-center text-foreground transition-all">
              Search Again
            </a>
            <a href="/booking" className="flex-1 bg-primary text-white py-3.5 rounded-xl font-bold hover:bg-primary-hover text-center transition-all">
              Request Help
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  // State 4: Booking found -> Map fields and render Live timeline
  const status = booking.status || 'pending';
  
  // Calculate dynamic steps based on Mongoose status
  const steps = [
    { title: 'Booking Confirmed', time: 'Received', completed: true },
    { 
      title: 'Technician Assigned', 
      time: booking.technicianId ? 'Assigned' : 'Searching Units...', 
      completed: !!booking.technicianId,
      current: !booking.technicianId 
    },
    { 
      title: 'Technician En Route', 
      time: (status === 'assigned' || status === 'in-progress') ? 'En Route' : 'Pending', 
      completed: status === 'in-progress' || status === 'completed',
      current: status === 'assigned' 
    },
    { 
      title: 'Arrived at Location', 
      time: status === 'in-progress' ? 'Active' : status === 'completed' ? 'Arrived' : 'Pending', 
      completed: status === 'completed',
      current: status === 'in-progress' 
    },
    { 
      title: 'Job Completed', 
      time: status === 'completed' ? 'Resolved' : 'Pending', 
      completed: status === 'completed' 
    }
  ];

  return (
    <div className="min-h-screen pt-28 pb-16 bg-light dark:bg-[#0B0F19]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-sm mb-4">
              <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
              Live Tracking
            </div>
            <h1 className="text-3xl font-extrabold text-foreground">Booking #{booking.id || booking._id}</h1>
            <p className="text-foreground/60 mt-2">{booking.serviceLabel} • {booking.address}</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 px-6 py-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-full text-primary">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground/60">Case Status</p>
              <p className="text-2xl font-black uppercase text-foreground">{status}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Map Section */}
          <div className="lg:col-span-2 bg-gray-200 dark:bg-gray-800 rounded-3xl min-h-[500px] relative overflow-hidden border border-gray-200 dark:border-gray-700 flex items-center justify-center">
            <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
            <div className="absolute inset-0 bg-blue-50/20 dark:bg-blue-900/10" />
            
            {/* User Pin */}
            <motion.div 
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
            >
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center animate-pulse">
                <div className="w-8 h-8 bg-primary rounded-full border-4 border-white dark:border-gray-900 shadow-xl" />
              </div>
            </motion.div>

            {/* Technician Pin (if assigned) */}
            {booking.technicianId && (
              <motion.div 
                initial={{ x: -100, y: 100 }}
                animate={{ x: 0, y: 0 }}
                transition={{ duration: 10, repeat: Infinity, repeatType: 'reverse' }}
                className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 z-10"
              >
                <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 flex flex-col items-center gap-2 mb-2">
                  <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-100 dark:border-gray-750">
                    <span className="font-bold text-xs">{booking.technicianName}</span>
                    <span className="text-[9px] bg-green-150 text-green-700 px-1.5 py-0.2 rounded-full font-black uppercase tracking-wider">En Route</span>
                  </div>
                </div>
                <div className="w-10 h-10 bg-secondary rounded-full border-4 border-white dark:border-gray-900 shadow-xl mx-auto flex items-center justify-center text-white">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M19 13.5A5.5 5.5 0 0 1 13.5 19H5.5A2.5 2.5 0 0 1 3 16.5V9.114a2.5 2.5 0 0 1 1.096-2.067l4.5-3.085A2.5 2.5 0 0 1 10.024 4h5.476A3.5 3.5 0 0 1 19 7.5v6Z"/></svg>
                </div>
              </motion.div>
            )}
            
            {/* If not assigned, show Radar sweeping effect */}
            {!booking.technicianId && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[1px]">
                <div className="relative w-72 h-72 rounded-full border-2 border-primary/20 flex items-center justify-center animate-ping">
                  <div className="w-48 h-48 rounded-full border-2 border-primary/30 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full bg-primary/10 animate-pulse flex items-center justify-center">
                      <CircleDashed size={32} className="animate-spin text-primary" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-8">
            {/* Technician Card */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-gray-800">
              <h3 className="font-bold text-lg mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">Assigned Technician</h3>
              {booking.technicianId ? (
                <>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden relative border-2 border-primary flex-shrink-0">
                      <img src="https://images.unsplash.com/photo-1544717297-fa95b6ee9643?q=80&w=2069&auto=format&fit=crop" alt="Technician" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xl text-foreground">{booking.technicianName}</h4>
                      <div className="flex items-center gap-1 text-yellow-500 mt-1">
                        <Star size={16} fill="currentColor" />
                        <span className="font-semibold text-sm">4.9</span>
                        <span className="text-foreground/45 text-xs ml-1">Operator Profile</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mb-6 text-sm font-medium">
                    <div className="flex justify-between mb-2">
                      <span className="text-foreground/60">Dispatched Vehicle</span>
                      <span className="text-foreground">{booking.vehicleName} ({booking.vehiclePlate})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-foreground/60">Contact Operator</span>
                      <span className="text-foreground">{booking.phone}</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <a href={`tel:${booking.phone}`} className="flex-1 bg-primary text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-hover transition-colors text-center shadow-md shadow-primary/20">
                      <Phone size={18} /> Call Unit
                    </a>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 space-y-4">
                  <div className="relative w-12 h-12 mx-auto">
                    <CircleDashed className="animate-spin text-warning absolute inset-0" size={48} />
                  </div>
                  <p className="text-sm font-semibold text-foreground/50 leading-relaxed uppercase tracking-wider text-xs">
                    Dispatching Nearest <br /> Rescue Operator...
                  </p>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-gray-800">
              <h3 className="font-bold text-lg mb-6">Tracking Status</h3>
              <div className="space-y-6">
                {steps.map((step, index) => (
                  <div key={index} className="flex gap-4 relative">
                    {index !== steps.length - 1 && (
                      <div className={`absolute left-3 top-8 bottom-[-24px] w-0.5 ${step.completed ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`} />
                    )}
                    <div className="relative z-10">
                      {step.completed ? (
                        <CheckCircle2 className="text-primary bg-white dark:bg-gray-900 rounded-full" size={24} />
                      ) : step.current ? (
                        <div className="w-6 h-6 rounded-full border-4 border-primary bg-white dark:bg-gray-900 shadow-[0_0_10px_rgba(255,51,102,0.5)] animate-pulse" />
                      ) : (
                        <CircleDashed className="text-gray-300 dark:text-gray-600 bg-white dark:bg-gray-900 rounded-full" size={24} />
                      )}
                    </div>
                    <div>
                      <h4 className={`font-bold ${step.completed || step.current ? 'text-foreground' : 'text-foreground/40'}`}>{step.title}</h4>
                      <p className="text-xs text-foreground/60 mt-1">{step.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TrackingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-28 pb-16 bg-light dark:bg-[#0B0F19] flex items-center justify-center">
        <CircleDashed className="animate-spin text-primary" size={48} />
      </div>
    }>
      <TrackingContent />
    </Suspense>
  );
}
