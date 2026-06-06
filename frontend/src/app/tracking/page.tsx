"use client";

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MapPin, Phone, MessageSquare, Star, Clock, CheckCircle2, CircleDashed, Search, Navigation, XCircle, Heart, ThumbsUp, Share2 } from 'lucide-react';
import dynamic from 'next/dynamic';
const TrackingLiveMap = dynamic(() => import('./TrackingLiveMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-[#0B0F19] animate-pulse rounded-3xl flex items-center justify-center font-bold text-xs text-[#FF3366]/40 uppercase tracking-widest h-[340px] lg:h-[500px]">
      Initializing GPS Tracking Map...
    </div>
  )
});

const TECHNICIAN_PHONES: Record<string, string> = {
  "Wahid": "+91 99010 08741",
  "Syed Suhel": "+91 99862 03946",
  "Fayaz": "+91 89706 68830",
  "Siraj": "+91 76600 66655",
};

function TrackingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id');

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Search input
  const [searchId, setSearchId] = useState('');

  // Cancellation Option States (30-second window)
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState('');
  const [cancelSuccess, setCancelSuccess] = useState(false);

  // SLA Countdown States
  const [slaTimeRemaining, setSlaTimeRemaining] = useState<string>('');
  const [isSlaOverdue, setIsSlaOverdue] = useState<boolean>(false);

  // Feedback System States
  const [feedbackRating, setFeedbackRating] = useState<number>(0);
  const [feedbackHoverRating, setFeedbackHoverRating] = useState<number>(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [feedbackComment, setFeedbackComment] = useState<string>('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState<boolean>(false);
  const [feedbackError, setFeedbackError] = useState<string>('');

  // SLA 30-Minute Guarantee Countdown Ticker
  useEffect(() => {
    if (!booking) return;
    
    const rawStatus = (booking.status || 'pending').toLowerCase();
    const status = rawStatus === 'in_progress' ? 'in-progress' : rawStatus;
    
    if (status === 'completed' || status === 'cancelled') {
      setSlaTimeRemaining('');
      return;
    }

    const confirmedAtStr = booking.timeline?.confirmedAt || booking.createdAt;
    if (!confirmedAtStr) return;

    const calculateSla = () => {
      const confirmedTime = new Date(confirmedAtStr).getTime();
      const targetTime = confirmedTime + 30 * 60 * 1000; // 30 minutes
      const now = Date.now();
      const difference = targetTime - now;

      if (difference <= 0) {
        setIsSlaOverdue(true);
        const overdueMs = Math.abs(difference);
        const mins = Math.floor(overdueMs / 60000);
        const secs = Math.floor((overdueMs % 60000) / 1000);
        setSlaTimeRemaining(`${mins}m ${secs}s`);
      } else {
        setIsSlaOverdue(false);
        const mins = Math.floor(difference / 60000);
        const secs = Math.floor((difference % 60000) / 1000);
        setSlaTimeRemaining(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
      }
    };

    calculateSla();
    const interval = setInterval(calculateSla, 1000);

    return () => clearInterval(interval);
  }, [booking]);

  // Zomato-style Real-Time GPS simulation loop (runs every 4 seconds when driver is en-route)
  useEffect(() => {
    if (!booking || !id) return;

    const rawStatus = (booking.status || 'pending').toLowerCase();
    const status = rawStatus === 'in_progress' ? 'in-progress' : rawStatus;
    const rawSubStatus = booking.subStatus ? booking.subStatus.toLowerCase() : null;
    const subStatus = rawSubStatus === 'leaving-hub' ? 'leaving_hub' : rawSubStatus;

    if (status !== 'in-progress' || subStatus !== 'leaving_hub') return;

    // Kadugodi Ops Central Hub Coordinates
    const HUB_LAT = 12.9902;
    const HUB_LNG = 77.7602;
    const targetLat = booking.location?.lat || booking.location?.coordinates?.[1] || 12.9716;
    const targetLng = booking.location?.lng || booking.location?.coordinates?.[0] || 77.5946;

    const runSimulation = async () => {
      try {
        const currentProgress = booking.progress !== undefined ? booking.progress : 0;
        if (currentProgress >= 1.0) return;

        // Increase en-route progress by 2.5% every 4 seconds (takes 160 seconds to fully complete route)
        const nextProgress = Math.min(1.0, currentProgress + 0.025);
        
        // Geodesic Linear Interpolation along Hub -> breakdown site route
        const techLat = HUB_LAT + nextProgress * (targetLat - HUB_LAT);
        const techLng = HUB_LNG + nextProgress * (targetLng - HUB_LNG);

        // Import firestore actions dynamically
        const { db } = await import('@/lib/firebase');
        const { doc, updateDoc } = await import('firebase/firestore');

        if (db && typeof db.app !== 'undefined') {
          const docRef = doc(db, "active_bookings", id);
          const updates: Record<string, any> = {
            progress: nextProgress,
            technicianLocation: { lat: techLat, lng: techLng }
          };

          // Once 100% en-route progress is achieved, transition subStatus to arrived automatically!
          if (nextProgress >= 1.0) {
            updates.subStatus = "arrived";
          }

          await updateDoc(docRef, updates);
        }
      } catch (err) {
        console.error("Failed en-route GPS simulation update:", err);
      }
    };

    // Run simulation tick every 4 seconds (4000ms)
    const interval = setInterval(runSimulation, 4000);
    return () => clearInterval(interval);
  }, [booking, id]);

  // Monitor cancellation window eligibility
  useEffect(() => {
    if (!booking) return;

    const rawStatus = (booking.status || 'pending').toLowerCase();
    const canCancel = (rawStatus === 'pending' || rawStatus === 'emergency');

    if (!canCancel || !booking.createdAt) {
      setSecondsRemaining(null);
      return;
    }

    const calculateRemaining = () => {
      const createdTime = new Date(booking.createdAt).getTime();
      const elapsed = (Date.now() - createdTime) / 1000;
      const remaining = Math.max(0, Math.ceil(300 - elapsed));
      return remaining;
    };

    const initialRemaining = calculateRemaining();
    if (initialRemaining <= 0) {
      setSecondsRemaining(null);
      return;
    }

    setSecondsRemaining(initialRemaining);

    const interval = setInterval(() => {
      const rem = calculateRemaining();
      if (rem <= 0) {
        setSecondsRemaining(null);
        clearInterval(interval);
      } else {
        setSecondsRemaining(rem);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [booking]);

  const handleCancelBooking = async () => {
    if (!id) return;
    setIsCancelling(true);
    setCancelError('');
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const response = await fetch(`${apiUrl}/api/bookings/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
  setCancelSuccess(true);

  setBooking((prev: any) => ({
    ...prev,
    status: 'cancelled',
    paymentStatus: 'cancelled',
  }));

  setSecondsRemaining(null);

  window.alert(
    "Request cancelled successfully."
  );

  router.push("/");
} else {
        setCancelError(data.error || 'Failed to cancel the booking request.');
      }
    } catch (err) {
      console.error(err);
      setCancelError('Network error occurred. Unable to cancel request.');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleFeedbackSubmit = async () => {
    if (feedbackRating < 1 || !id) return;
    setIsSubmittingFeedback(true);
    setFeedbackError('');
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const response = await fetch(`${apiUrl}/api/bookings/${id}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: feedbackRating,
          tags: selectedTags,
          comment: feedbackComment,
        }),
      });
      const data = await response.json();
      if (data.success) {
        // Update local booking document state instantly to show the submitted state
        setBooking((prev: any) => ({
          ...prev,
          feedback: data.feedback,
        }));
      } else {
        setFeedbackError(data.error || 'Failed to submit your feedback.');
      }
    } catch (err) {
      console.error(err);
      setFeedbackError('Network error occurred. Unable to submit review.');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  // Auto-redirect to home page when feedback is submitted or already present on completed booking
  useEffect(() => {
    if (!booking) return;
    const rawStatus = (booking.status || 'pending').toLowerCase();
    const isCompleted = rawStatus === 'completed';
    const hasFeedback = booking.feedback && booking.feedback.rating > 0;

    if (isCompleted && hasFeedback) {
      const redirectTimer = setTimeout(() => {
        router.push("/");
      }, 4000); // 4 seconds so they can read the Thank You card chimes

      return () => clearTimeout(redirectTimer);
    }
  }, [booking, router]);

  // Realtime Firestore WebSocket Active Listener with REST fallback
  useEffect(() => {
    if (!id) return;

    let unsubscribeFirestore: any = null;
    let firstSnapshotReceived = false;

    const fetchBookingFromAPI = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
        const response = await fetch(`${apiUrl}/api/bookings/${id}`);
        const data = await response.json();
        if (data.success) {
          setBooking(data.booking);
          setError('');

          // If we resolved by ticketId (e.g. RSA-3323), data.booking.id is the real MongoDB ObjectId.
          // Start a new Firestore listener with the correct MongoDB ObjectId to enable real-time map tracking.
          if (data.booking.id && data.booking.id !== id) {
            try {
              const { db } = await import('@/lib/firebase');
              const { doc, onSnapshot } = await import('firebase/firestore');
              if (db && typeof db.app !== 'undefined') {
                if (unsubscribeFirestore) {
                  unsubscribeFirestore();
                }
                unsubscribeFirestore = onSnapshot(doc(db, "active_bookings", data.booking.id), (docSnap) => {
                  if (docSnap.exists()) {
                    const activeData = docSnap.data();
                    setBooking({
                      ...activeData,
                      customerPhone: activeData.customerPhone || '',
                      location: activeData.location || { lat: 12.9716, lng: 77.5946 },
                      serviceLabel: activeData.serviceLabel || 'Roadside Rescue',
                      vehiclePlate: activeData.vehiclePlate || '',
                      vehicleName: activeData.vehicleName || 'Vehicle',
                      phone: activeData.customerPhone || '',
                      technicianPhone: activeData.technicianPhone || null
                    });
                  }
                });
              }
            } catch (fsErr) {
              console.error("Failed to setup upgraded Firestore listener:", fsErr);
            }
          }
        } else {
          setError(data.error || 'Booking not found');
        }
      } catch (err) {
        console.error("MongoDB API fetch failed:", err);
        setError('Failed to fetch live updates.');
      }
    };

    // Fast 3-second timeout to bypass slow Firestore socket handshakes on poor mobile networks
    const timeoutTimer = setTimeout(() => {
      if (!firstSnapshotReceived) {
        console.warn("Firestore connection slow/pending. Falling back to MongoDB REST API.");
        fetchBookingFromAPI().finally(() => setLoading(false));
      }
    }, 3000);

    const setupLiveTracking = async () => {
      setLoading(true);
      
      try {
        const { db } = await import('@/lib/firebase');
        const { doc, onSnapshot } = await import('firebase/firestore');

        if (db && typeof db.app !== 'undefined') {
          // Listen directly to Cloud Firestore active tracking document!
          unsubscribeFirestore = onSnapshot(doc(db, "active_bookings", id), (docSnap) => {
            firstSnapshotReceived = true;
            clearTimeout(timeoutTimer);
            
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
                phone: activeData.customerPhone || '',
                technicianPhone: activeData.technicianPhone || null
              });
              setLoading(false);
              setError('');
            } else {
              // Active booking not in Firestore (e.g. was archived/completed) -> Fallback to MongoDB API fetch
              fetchBookingFromAPI().finally(() => setLoading(false));
            }
          }, (err) => {
            clearTimeout(timeoutTimer);
            console.error("Firestore onSnapshot error:", err);
            // On Firestore error, fallback to HTTP API fetch
            fetchBookingFromAPI().finally(() => setLoading(false));
          });
        } else {
          clearTimeout(timeoutTimer);
          fetchBookingFromAPI().finally(() => setLoading(false));
        }
      } catch (err) {
        clearTimeout(timeoutTimer);
        console.error("Failed to load Firebase Firestore module dynamically:", err);
        fetchBookingFromAPI().finally(() => setLoading(false));
      }
    };

    setupLiveTracking();

    return () => {
      clearTimeout(timeoutTimer);
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

  // Normalize status and subStatus to handle any hyphen/underscore mismatches between Firestore, MongoDB, and local components
  const rawStatus = (booking.status || 'pending').toLowerCase();
  const status = rawStatus === 'in_progress' ? 'in-progress' : rawStatus;
  
  const rawSubStatus = booking.subStatus ? booking.subStatus.toLowerCase() : null;
  const subStatus = rawSubStatus === 'collecting-tools' ? 'collecting_tools' : 
                    rawSubStatus === 'leaving-hub' ? 'leaving_hub' : 
                    rawSubStatus;

  const getDisplayStatusHeader = () => {
    if (status === 'completed') return 'Resolved';
    if (status === 'cancelled') return 'Cancelled';
    if (status === 'pending') return 'Searching...';
    if (status === 'emergency') return 'Emergency Queue';
    if (status === 'assigned') {
      if (subStatus === 'collecting_tools') return 'Preparing Gear';
      return 'Technician Assigned';
    }
    if (status === 'in-progress') {
      if (subStatus === 'leaving_hub') return 'En Route';
      if (subStatus === 'arrived') return 'Unit On-Scene';
      return 'En Route';
    }
    return status;
  };

  const formatTime = (dateInput: any) => {
    if (!dateInput) return null;
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return null;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Calculate dynamic steps based on Mongoose status
  const steps = [
    { 
      title: 'Booking Confirmed', 
      time: formatTime(booking.timeline?.confirmedAt || booking.createdAt) 
        ? `Confirmed at ${formatTime(booking.timeline?.confirmedAt || booking.createdAt)}` 
        : 'Received', 
      completed: true 
    },
    { 
      title: 'Technician Assigned', 
      time: formatTime(booking.timeline?.assignedAt)
        ? `Assigned at ${formatTime(booking.timeline.assignedAt)}`
        : (booking.technicianId 
            ? (subStatus === 'collecting_tools' ? 'Preparing Gear' : 'Assigned') 
            : 'Searching...'), 
      completed: !!booking.technicianId,
      current: !booking.technicianId 
    },
    { 
      title: 'Outbound (Left Hub)', 
      time: formatTime(booking.timeline?.enRouteAt)
        ? `Dispatched at ${formatTime(booking.timeline.enRouteAt)}`
        : ((status === 'in-progress' && (subStatus === 'leaving_hub' || subStatus === 'arrived')) || status === 'completed'
            ? 'En Route' 
            : (status === 'assigned' ? 'Loading Rig' : 'Pending')), 
      completed: (status === 'in-progress' && (subStatus === 'leaving_hub' || subStatus === 'arrived')) || status === 'completed',
      current: status === 'assigned' || (status === 'in-progress' && subStatus === 'collecting_tools')
    },
    { 
      title: 'Arrived at Location', 
      time: formatTime(booking.timeline?.arrivedAt)
        ? `Arrived at ${formatTime(booking.timeline.arrivedAt)}`
        : ((status === 'in-progress' && subStatus === 'arrived') || status === 'completed'
            ? 'At Scene' 
            : 'Pending'), 
      completed: (status === 'in-progress' && subStatus === 'arrived') || status === 'completed',
      current: status === 'in-progress' && subStatus === 'leaving_hub'
    },
    { 
      title: 'Assistance Resolved', 
      time: formatTime(booking.timeline?.completedAt)
        ? `Resolved at ${formatTime(booking.timeline.completedAt)}`
        : (status === 'completed' ? 'Resolved' : 'Pending'), 
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
            <h1 className="text-3xl font-extrabold text-foreground">
              Booking #{(booking.id || booking._id || "").substring(0, 8).toUpperCase()}
            </h1>
            <p className="text-foreground/60 mt-2">{booking.serviceLabel} • {booking.address}</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 px-6 py-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-full text-primary">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground/60">Case Status</p>
              <p className="text-2xl font-black uppercase text-foreground">{getDisplayStatusHeader()}</p>
            </div>
          </div>
        </div>

       {status === 'cancelled' && (
  <div className="mb-8 p-6 bg-[#FF3366]/10 border border-[#FF3366]/20 text-[#FF3366] rounded-3xl flex items-center gap-4 shadow-sm animate-pulse">
    <XCircle size={32} className="shrink-0" />

    <div>
      <h3 className="font-extrabold text-lg uppercase tracking-wide">
        Request Cancelled
      </h3>

      <p className="text-sm text-foreground/60 mt-1">
        This roadside assistance booking has been successfully cancelled.
        If you still need help, please submit a new request or call our hotline.
      </p>
    </div>
  </div>
)}

{booking.paymentAmount > 0 && (
  <div className="mb-8 bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-xl border border-[#FF3366]/20">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-lg font-black uppercase tracking-wider text-[#FF3366]">
          Price Estimate
        </h3>

        <p className="text-sm text-foreground/50 mt-1">
          Estimated service amount
        </p>
      </div>

      <div className="text-right">
        <div className="text-4xl font-black text-[#FF3366]">
          ₹{booking.paymentAmount?.toLocaleString()}
        </div>

        <div className="text-xs text-foreground/50 mt-1">
          Final amount confirmed by dispatcher
        </div>
      </div>
    </div>
  </div>
)}


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
  <div className="lg:col-span-2 space-y-8">

          {/* Map Section */}
          <div className="lg:col-span-2 bg-[#0B0F19] rounded-3xl h-[340px] lg:h-[500px] relative overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col">
            {booking && status === 'in-progress' && subStatus === 'leaving_hub' && (
              <div className="absolute top-4 left-4 z-[1000] inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#111827]/90 backdrop-blur-md text-emerald-400 font-mono text-[9px] uppercase tracking-widest border border-emerald-500/20 shadow-2xl">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>WebSocket Sync: Connected (4s refresh)</span>
              </div>
            )}
            <TrackingLiveMap 
              customerLat={booking.location?.lat || 12.9716}
              customerLng={booking.location?.lng || 77.5946}
              status={booking.status}
              subStatus={booking.subStatus || null}
              technicianName={booking.technicianName}
              progress={booking.progress !== undefined ? booking.progress : 0}
              technicianLocation={booking.technicianLocation || null}
            />
          </div>
          {/* Timeline */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-gray-800">

  <h3 className="font-bold text-lg mb-8">
    Tracking Status
  </h3>

  <div className="relative">

    {/* Progress Line */}
    <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 rounded-full">
      <div
        className="h-1 bg-primary rounded-full transition-all duration-700"
        style={{
          width: `${
            ((steps.filter(s => s.completed).length - 1) /
              (steps.length - 1)) *
            100
          }%`
        }}
      />
    </div>

    <div className="flex justify-between relative">

      {steps.map((step, index) => (
        <div
          key={index}
          className="flex flex-col items-center text-center w-24"
        >

          {/* Circle */}
          <div
            className={`
              z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 bg-white dark:bg-gray-900

              ${
                step.completed
                  ? "border-primary bg-primary text-white"
                  : step.current
                  ? "border-primary text-primary animate-pulse"
                  : "border-gray-300 dark:border-gray-600 text-gray-400"
              }
            `}
          >
            {step.completed ? (
              <CheckCircle2 size={18} />
            ) : (
              <CircleDashed size={18} />
            )}
          </div>

          {/* Title */}
          <p
            className={`
              mt-3 text-xs font-bold

              ${
                step.completed || step.current
                  ? "text-foreground"
                  : "text-foreground/40"
              }
            `}
          >
            {step.title}
          </p>

          {/* Time */}
          <p className="text-[10px] text-foreground/50 mt-1">
            {step.time}
          </p>

        </div>
      ))}

    </div>

  </div>

</div>
            </div>

            {/* Right Sidebar */}
          <div className="space-y-8">
            {/* Cancellation option */}
            {secondsRemaining !== null && secondsRemaining > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-xl border border-[#FF3366]/20 bg-[#FF3366]/5 space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#FF3366]/10 text-[#FF3366] flex items-center justify-center font-bold">
                    <Clock size={20} className="animate-spin-slow" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-foreground text-sm tracking-tight">Need to Cancel?</h3>
                    <p className="text-[10px] text-foreground/50 mt-0.5 leading-tight">
                      You can cancel this request within the first 5 minutes.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-foreground">
                  <span>Time Remaining:</span>
                  <span className="text-[#FF3366] font-black text-sm tracking-wider">
                    {Math.floor(secondsRemaining / 60)}:
                    {(secondsRemaining % 60).toString().padStart(2, "0")}
                    </span>
                </div>

                {cancelError && (
                  <p className="text-[10px] font-semibold text-[#FF3366]">{cancelError}</p>
                )}

                <button
                  type="button"
                  disabled={isCancelling}
                  onClick={handleCancelBooking}
                  className="w-full bg-[#FF3366] hover:bg-[#E02E5A] text-white py-3 rounded-xl font-bold transition-all text-xs flex items-center justify-center gap-2 shadow-md shadow-[#FF3366]/20 disabled:opacity-50 cursor-pointer"
                >
                  {isCancelling ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Cancel Service Request"
                  )}
                </button>
              </motion.div>
            )}

            {cancelSuccess && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-xl border border-success/20 bg-success/5 p-4 text-center text-xs font-bold text-success"
              >
                ✓ Request cancelled successfully.
              </motion.div>
            )}

            {/* Zomato-style Premium Feedback Card */}
            {status?.toLowerCase() === 'completed' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-xl border border-yellow-500/20 bg-yellow-500/5 space-y-6 text-left"
              >
                {booking.feedback && booking.feedback.rating ? (
                  // Submitted State (Show Review Summary)
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-yellow-500/10 text-yellow-500 flex items-center justify-center font-bold">
                        <Heart size={20} className="fill-yellow-500 animate-pulse" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-foreground text-sm tracking-tight">Thank You!</h3>
                        <p className="text-[10px] text-emerald-400 font-bold mt-0.5 leading-tight flex items-center gap-1 animate-pulse">
                          <span>✓ Saved! Redirecting to home page...</span>
                        </p>
                      </div>
                    </div>

                    <div className="bg-white/50 dark:bg-black/20 p-4 rounded-2xl border border-gray-100 dark:border-white/5 space-y-3">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={18}
                            className={star <= booking.feedback.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300 dark:text-gray-700"}
                          />
                        ))}
                        <span className="text-[11px] font-bold text-foreground/60 ml-2">({booking.feedback.rating}/5)</span>
                      </div>

                      {booking.feedback.tags && booking.feedback.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {booking.feedback.tags.map((tag: string) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 border border-yellow-500/25 text-[9px] font-black uppercase tracking-wider"
                            >
                              {tag.replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                      )}

                      {booking.feedback.comment && (
                        <p className="text-[11px] text-foreground/75 leading-relaxed font-semibold italic border-l-2 border-yellow-500 pl-2.5">
                          "{booking.feedback.comment}"
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  // Active Rating/Feedback Form State
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-yellow-500/10 text-yellow-500 flex items-center justify-center">
                        <ThumbsUp size={20} className="fill-yellow-500" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-foreground text-sm tracking-tight">Rate Your Rescue</h3>
                        <p className="text-[10px] text-foreground/50 mt-0.5 leading-tight">
                          {booking.technicianName ? `How was your experience with ${booking.technicianName}?` : "Help us improve our roadside assistance standard"}
                        </p>
                      </div>
                    </div>

                    {/* Star Rating Row */}
                    <div className="flex items-center gap-2.5 py-1 justify-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setFeedbackHoverRating(star)}
                          onMouseLeave={() => setFeedbackHoverRating(0)}
                          onClick={() => {
                            setFeedbackRating(star);
                            setSelectedTags([]); // Reset tags on rating change to load dynamic ones
                          }}
                          className="transition-transform duration-150 hover:scale-125 focus:outline-none"
                        >
                          <Star
                            size={32}
                            className={`transition-colors duration-150 cursor-pointer ${
                              star <= (feedbackHoverRating || feedbackRating)
                                ? "text-yellow-500 fill-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]"
                                : "text-gray-300 dark:text-gray-700"
                            }`}
                          />
                        </button>
                      ))}
                    </div>

                    {/* Dynamic Zomato-style Tags */}
                    {feedbackRating > 0 && (
                      <div className="space-y-3.5 pt-1">
                        <label className="block text-[10px] text-foreground/60 font-black uppercase tracking-wider">
                          What went {feedbackRating >= 4 ? "great" : "wrong"}?
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {(feedbackRating >= 4
                            ? ["Super Fast", "Polite & Expert", "Clean Rig", "Highly Recommend", "Fair Price"]
                            : ["Delayed Arrival", "Unprofessional", "Lack of Tools", "Poor Comms", "Overcharged"]
                          ).map((tag) => {
                            const isSelected = selectedTags.includes(tag);
                            return (
                              <button
                                key={tag}
                                type="button"
                                onClick={() => {
                                  if (isSelected) {
                                    setSelectedTags(prev => prev.filter(t => t !== tag));
                                  } else {
                                    setSelectedTags(prev => [...prev, tag]);
                                  }
                                }}
                                className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
                                  isSelected
                                    ? "bg-yellow-500 border-yellow-500 text-black shadow-md shadow-yellow-500/10 scale-105"
                                    : "bg-transparent border-gray-200 dark:border-gray-800 text-foreground/50 hover:text-foreground hover:border-foreground/30"
                                }`}
                              >
                                {tag}
                              </button>
                            );
                          })}
                        </div>

                        {/* Optional Comments */}
                        <div className="space-y-1.5">
                          <label className="block text-[10px] text-foreground/60 font-black uppercase tracking-wider">
                            Share additional details (Optional)
                          </label>
                          <textarea
                            rows={2}
                            placeholder="Tell us more about the service rescue..."
                            value={feedbackComment}
                            onChange={(e) => setFeedbackComment(e.target.value)}
                            className="w-full text-[11px] p-3 rounded-2xl bg-gray-50 dark:bg-[#0B0F19] border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 text-foreground"
                          />
                        </div>

                        {feedbackError && (
                          <p className="text-[10px] font-semibold text-emergency">{feedbackError}</p>
                        )}

                        {/* Submit Button */}
                        <button
                          type="button"
                          disabled={isSubmittingFeedback}
                          onClick={handleFeedbackSubmit}
                          className="w-full bg-yellow-500 hover:bg-yellow-400 text-black py-3 rounded-xl font-black transition-all text-xs flex items-center justify-center gap-2 shadow-md shadow-yellow-500/10 disabled:opacity-50 cursor-pointer uppercase tracking-wider"
                        >
                          {isSubmittingFeedback ? (
                            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                          ) : (
                            "Submit Review"
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* Premium SLA Countdown HUD */}
            {booking && status !== 'completed' && status !== 'cancelled' && slaTimeRemaining && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-3xl p-6 shadow-xl border text-left overflow-hidden relative transition-all ${
                  isSlaOverdue 
                    ? "bg-[#FF3366]/5 border-[#FF3366]/20 text-[#FF3366]" 
                    : "bg-emerald-500/5 border-emerald-500/20 text-emerald-500"
                }`}
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-current opacity-[0.02] rounded-full blur-xl pointer-events-none" />
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold shrink-0 ${
                    isSlaOverdue ? "bg-[#FF3366]/10" : "bg-emerald-500/10"
                  }`}>
                    <Clock size={24} className={isSlaOverdue ? "animate-pulse" : "animate-spin-slow"} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-extrabold text-foreground text-sm uppercase tracking-wider">
                      30-Min Rescue SLA
                    </h3>
                    <p className="text-[11px] text-foreground/50 mt-1 font-semibold leading-relaxed">
                      {isSlaOverdue 
                        ? "SLA Breach — Operations command is actively expediting dispatch." 
                        : "We guarantee arrival of our roadside technician within 30 minutes."}
                    </p>
                  </div>
                </div>

                <div className="mt-5 border-t border-foreground/5 pt-4 flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground/60">
                    {isSlaOverdue ? "Time Overdue:" : "Guaranteed Arrival In:"}
                  </span>
                  <span className={`font-black text-2xl tracking-wider ${
                    isSlaOverdue ? "text-[#FF3366] animate-pulse" : "text-emerald-500"
                  }`}>
                    {slaTimeRemaining}
                  </span>
                </div>
              </motion.div>
            )}

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
                  {(() => {
                    const operatorPhone = booking.technicianPhone || (booking.technicianName ? TECHNICIAN_PHONES[booking.technicianName] : null) || "+91 73400 66655";
                    return (
                      <>
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mb-6 text-sm font-medium">
                          <div className="flex justify-between mb-2">
                            <span className="text-foreground/60">Dispatched Vehicle</span>
                            <span className="text-foreground">{booking.vehicleName} ({booking.vehiclePlate})</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-foreground/60">Contact Operator</span>
                            <span className="text-foreground">{operatorPhone}</span>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <a href={`tel:${operatorPhone}`} className="flex-1 bg-primary text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-hover transition-colors text-center shadow-md shadow-primary/20">
                            <Phone size={18} /> Call Unit
                          </a>
                          <button
                            type="button"
                            onClick={() => {
                              const shareText = `Erina RSA: Dispatched Technician ${booking.technicianName} (${operatorPhone}) is on their way in vehicle ${booking.vehicleName} (${booking.vehiclePlate}).`;
                              if (navigator.share) {
                                navigator.share({
                                  title: 'Erina RSA Dispatch',
                                  text: shareText,
                                  url: window.location.href
                                }).catch(console.error);
                              } else {
                                navigator.clipboard.writeText(shareText);
                                alert("Operator contact details copied to clipboard!");
                              }
                            }}
                            className="bg-gray-100 dark:bg-gray-800 text-foreground/80 hover:text-foreground py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shadow-sm cursor-pointer"
                            title="Share Operator Contact"
                          >
                            <Share2 size={18} /> Share Contact
                          </button>
                        </div>
                      </>
                    );
                  })()}
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

            {/* Timeline
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
            </div> */}
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
