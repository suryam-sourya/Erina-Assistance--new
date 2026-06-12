"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, X, AlertTriangle, MapPin, Loader2 } from 'lucide-react';

export default function EmergencyButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const handleGPSSOS = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser. Please call the helpline.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setIsLocating(false);
        const { latitude, longitude } = position.coords;
        
        // Silently log to backend as a full Emergency Booking
        let trackingId = "";
        try {
          const res = await fetch('/api/bookings/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              location: { lat: latitude, lng: longitude },
              status: 'emergency',
              serviceType: 'other',
              customerName: 'Emergency GPS Dispatch',
              phone: 'Pending WhatsApp Verification'
            })
          });
          const data = await res.json();
          if (data.success && data.booking) {
            trackingId = data.booking._id || data.booking.id || data.booking.ticketId;
          }
        } catch (e) {
          console.error("Failed to log SOS alert to backend", e);
        }

        const mapsLink = `https://maps.google.com/?q=${latitude},${longitude}`;
        const trackingLink = trackingId ? `\n\nTrack my case live: https://erinaassistance.in/tracking?id=${trackingId}` : "";
        const message = `🚨 URGENT: I am stranded and need roadside assistance!\n\nMy exact location is here:\n${mapsLink}${trackingLink}\n\nPlease send a technician immediately!`;
        const whatsappUrl = `https://wa.me/917340066655?text=${encodeURIComponent(message)}`;
        // Avoid window.open('_blank') inside async callbacks to bypass strict mobile Safari popup blockers.
        // Navigate to WhatsApp deep link directly.
        window.location.href = whatsappUrl;
        
        // Redirect browser to tracking page after a slight delay, so when they return to Chrome, the map is waiting.
        setTimeout(() => {
          if (trackingId) {
            window.location.href = `/tracking?id=${trackingId}`;
          }
        }, 800);
      },
      (error) => {
        setIsLocating(false);
        alert("Unable to retrieve your location. Please check your browser permissions or call the helpline directly.");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="mb-4 flex flex-col gap-3"
          >
            {/* 1-Click GPS SOS */}
            <button
              onClick={handleGPSSOS}
              disabled={isLocating}
              className="flex items-center gap-3 bg-red-600 text-white px-5 py-3.5 rounded-2xl shadow-xl shadow-red-500/30 hover:scale-105 transition-transform text-left disabled:opacity-70 disabled:hover:scale-100 glow-emergency"
            >
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                {isLocating ? <Loader2 size={18} className="animate-spin" /> : <MapPin size={18} />}
              </div>
              <div>
                <span className="font-bold text-sm block">1-Click GPS SOS</span>
                <span className="text-[10px] text-red-100 font-semibold">
                  {isLocating ? "Finding your location..." : "Share location & send alert"}
                </span>
              </div>
            </button>

            {/* Call */}
            <Link
              href="tel:+917340066655"
              className="flex items-center gap-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-5 py-3.5 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700/60 hover:scale-105 transition-transform"
            >
              <div className="w-10 h-10 bg-primary/15 rounded-full flex items-center justify-center text-primary shrink-0">
                <Phone size={18} />
              </div>
              <div>
                <span className="font-bold text-sm block">Call Helpline</span>
                <span className="text-[10px] text-foreground/50 font-semibold">+91 73400 66655</span>
              </div>
            </Link>

            {/* WhatsApp */}
            <Link
              href="https://wa.me/917340066655"
              target="_blank"
              className="flex items-center gap-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-5 py-3.5 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700/60 hover:scale-105 transition-transform"
            >
              <div className="w-10 h-10 bg-[#25D366]/15 rounded-full flex items-center justify-center shrink-0">
                <Image src="/whatsapp.png" alt="WhatsApp" width={20} height={20} />
              </div>
              <div>
                <span className="font-bold text-sm block">WhatsApp Chat</span>
                <span className="text-[10px] text-foreground/50 font-semibold">Instant response</span>
              </div>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 rounded-full bg-emergency text-white flex items-center justify-center shadow-lg transition-all duration-300 relative z-50 cursor-pointer glow-emergency group"
        aria-label="Emergency assistance"
      >
        {isOpen ? (
          <X size={26} />
        ) : (
          <div className="flex flex-col items-center gap-0.5">
            <AlertTriangle size={20} className="animate-pulse" />
            <span className="text-[7px] font-black uppercase tracking-wider">SOS</span>
          </div>
        )}
      </button>
    </div>
  );
}
