"use client";

import { useState } from "react";
import { useUserStore } from "@/store/userStore";
import { calculateDistance, ERINA_HUB, MAX_SERVICE_RADIUS_KM } from "@/lib/location";
import { MapPin, CheckCircle2, AlertTriangle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LocationServiceabilityBar() {
  const { detectedLocation, isServiceable, setLocation } = useUserStore();
  const [isDetecting, setIsDetecting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPrompt, setShowPrompt] = useState(true);

  // If we already detected and it is serviceable, we don't necessarily need to keep showing the prompt
  // But if the user wants to see it, we can keep it minimised. For this, let's auto-hide on success after 5 seconds.

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg("Geolocation is not supported by your browser");
      return;
    }

    setIsDetecting(true);
    setErrorMsg("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        try {
          // Reverse geocode to get city name
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
            {
              headers: {
                "Accept-Language": "en",
                "User-Agent": "Erina-Assistance-RSA",
              },
            }
          );
          const data = await response.json();
          const address = data.address?.city || data.address?.town || data.address?.village || "Unknown Area";

          const distance = calculateDistance(ERINA_HUB.lat, ERINA_HUB.lng, lat, lng);
          const serviceable = distance <= MAX_SERVICE_RADIUS_KM;

          setLocation({ lat, lng, address }, serviceable);
        } catch (err) {
          // Fallback if reverse geocode fails
          const distance = calculateDistance(ERINA_HUB.lat, ERINA_HUB.lng, lat, lng);
          const serviceable = distance <= MAX_SERVICE_RADIUS_KM;
          setLocation({ lat, lng, address: "Your Location" }, serviceable);
        } finally {
          setIsDetecting(false);
        }
      },
      (error) => {
        setIsDetecting(false);
        setErrorMsg("Location access denied. Please enable GPS.");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  if (!showPrompt && isServiceable !== false) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        className="fixed top-20 left-0 right-0 z-40 px-4 pointer-events-none"
      >
        <div className="max-w-2xl mx-auto pointer-events-auto">
          <div className={`p-4 rounded-2xl shadow-xl border flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md ${
            isServiceable === true 
              ? "bg-emerald-500/10 border-emerald-500/20" 
              : isServiceable === false 
                ? "bg-rose-500/10 border-rose-500/20" 
                : "bg-gray-900/90 dark:bg-gray-800/90 border-white/10"
          }`}>
            
            <div className="flex items-center gap-3 w-full">
              <div className={`p-2 rounded-full shrink-0 ${
                isServiceable === true ? "bg-emerald-500/20 text-emerald-400" : 
                isServiceable === false ? "bg-rose-500/20 text-rose-400" : 
                "bg-white/10 text-white"
              }`}>
                {isServiceable === true ? <CheckCircle2 size={20} /> :
                 isServiceable === false ? <AlertTriangle size={20} /> :
                 <MapPin size={20} />}
              </div>
              
              <div className="flex-1">
                {isServiceable === true ? (
                  <>
                    <h4 className="text-sm font-bold text-emerald-500">Great! We serve {detectedLocation?.address}</h4>
                    <p className="text-xs text-emerald-500/80 mt-0.5">Technicians are available in your area.</p>
                  </>
                ) : isServiceable === false ? (
                  <>
                    <h4 className="text-sm font-bold text-rose-500">Out of Service Area</h4>
                    <p className="text-xs text-rose-500/80 mt-0.5">Currently, we only serve within 10km of our Kadugodi Hub.</p>
                  </>
                ) : (
                  <>
                    <h4 className="text-sm font-bold text-white">Check Serviceability</h4>
                    <p className="text-xs text-gray-300 mt-0.5">Find out if Erina Assistance is available in your area.</p>
                  </>
                )}
                {errorMsg && <p className="text-xs text-rose-400 mt-1">{errorMsg}</p>}
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {isServiceable === null && (
                <button
                  onClick={handleDetectLocation}
                  disabled={isDetecting}
                  className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors disabled:opacity-50 whitespace-nowrap flex items-center gap-2"
                >
                  {isDetecting && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {isDetecting ? "Detecting..." : "Detect Location"}
                </button>
              )}
              
              <button 
                onClick={() => setShowPrompt(false)}
                className="p-1 text-gray-400 hover:text-white transition-colors"
                title="Dismiss"
              >
                <X size={16} />
              </button>
            </div>

          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
