"use client";

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { MapPin, Phone, MessageSquare, Star, Clock, CheckCircle2, CircleDashed, Search, Navigation, XCircle } from 'lucide-react';
import dynamic from 'next/dynamic';

const TrackingLiveMap = dynamic(() => import('./TrackingLiveMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#0B0F19] animate-pulse rounded-3xl flex items-center justify-center font-bold text-xs text-[#FF3366]/40 uppercase tracking-widest min-h-[500px]">
      Initializing GPS Tracking Map...
    </div>
  )
});

function TrackingContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Search input
  const [searchId, setSearchId] = useState('');

  // Realtime Firestore WebSocket Active Listener with REST fallback
  useEffect(() => {
    if (!id) return;

    let unsubscribeFirestore: any = null;

    const fetchBookingFromAPI = async () => {
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

    const setupLiveTracking = async () => {
      setLoading(true);
      
      try {
        const { db } = await import('@/lib/firebase');
        const { doc, onSnapshot } = await import('firebase/firestore');

        if (db && typeof db.app !== 'undefined') {
          // Listen directly to Cloud Firestore active tracking document!
          unsubscribeFirestore = onSnapshot(doc(db, "active_bookings", id), (docSnap) => {
            if (docSnap.exists()) {
              const activeData = docSnap.data();
              // Format structure for compatibility with frontend view variables
              setBooking({
                ...activeData,
                customerPhone: activeData.customerPhone || '',
                location: activeData.location || { lat: 12.9716, lng: 77.5946 },
                serviceLabel: activeData.serviceLabel || 'Roadside Rescue',
                vehiclePlate: activeData.vehiclePlate || '',
                vehicleName: activeData.vehicleName || 'Vehicle',
                phone: activeData.customerPhone || ''
              });
              setLoading(false);
              setError('');
            } else {
              // Active booking not in Firestore (e.g. was archived/completed) -> Fallback to MongoDB API fetch
              fetchBookingFromAPI().finally(() => setLoading(false));
            }
          }, (err) => {
            console.error("Firestore onSnapshot error:", err);
            // On Firestore error, fallback to HTTP API fetch
            fetchBookingFromAPI().finally(() => setLoading(false));
          });
        } else {
          fetchBookingFromAPI().finally(() => setLoading(false));
        }
      } catch (err) {
        console.error("Failed to load Firebase Firestore module dynamically:", err);
        fetchBookingFromAPI().finally(() => setLoading(false));
      }
    };

    setupLiveTracking();

    return () => {
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }
    };
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

  const status = booking.status || 'pending';
  const subStatus = booking.subStatus || null;
  
  // Calculate dynamic steps based on Mongoose status
  const steps = [
    { title: 'Booking Confirmed', time: 'Received', completed: true },
    { 
      title: 'Technician Assigned', 
      time: booking.technicianId 
        ? (subStatus === 'collecting_tools' ? 'Preparing Gear' : 'Assigned') 
        : 'Searching...', 
      completed: !!booking.technicianId,
      current: !booking.technicianId 
    },
    { 
      title: 'Outbound (Left Hub)', 
      time: (status === 'in-progress' && (subStatus === 'leaving_hub' || subStatus === 'arrived')) || status === 'completed'
        ? 'En Route' 
        : (status === 'assigned' ? 'Loading Rig' : 'Pending'), 
      completed: (status === 'in-progress' && (subStatus === 'leaving_hub' || subStatus === 'arrived')) || status === 'completed',
      current: status === 'assigned' || (status === 'in-progress' && subStatus === 'collecting_tools')
    },
    { 
      title: 'Arrived at Location', 
      time: (status === 'in-progress' && subStatus === 'arrived') || status === 'completed'
        ? 'At Scene' 
        : 'Pending', 
      completed: (status === 'in-progress' && subStatus === 'arrived') || status === 'completed',
      current: status === 'in-progress' && subStatus === 'leaving_hub'
    },
    { 
      title: 'Assistance Resolved', 
      time: status === 'completed' ? 'Resolved' : 'Pending', 
      completed: status === 'completed',
      current: status === 'in-progress' && subStatus === 'arrived'
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
          <div className="lg:col-span-2 bg-[#0B0F19] rounded-3xl min-h-[500px] relative overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col">
            <TrackingLiveMap 
              customerLat={booking.location?.lat || 12.9716}
              customerLng={booking.location?.lng || 77.5946}
              status={booking.status}
              subStatus={booking.subStatus || null}
              technicianName={booking.technicianName}
            />
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
