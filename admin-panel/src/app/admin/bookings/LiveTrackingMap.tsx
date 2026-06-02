"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation, Truck, ShieldCheck, AlertTriangle } from "lucide-react";
import "leaflet/dist/leaflet.css";
import { db } from "@/frontend/lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";

interface LiveTrackingMapProps {
  bookingId: string;
  customerLat: number;
  customerLng: number;
  status: string;
  subStatus: string | null;
  technicianName: string | null;
}

// 🏢 Erina Ops Central Hub (Kadugodi, Bangalore)
const HUB_LAT = 12.9902;
const HUB_LNG = 77.7602;

// Mathematical Haversine formula to calculate exact distance in kilometers
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function LiveTrackingMap({
  bookingId,
  customerLat,
  customerLng,
  status,
  subStatus,
  technicianName,
}: LiveTrackingMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  
  // Marker Refs to manipulate positions dynamically
  const hubMarkerRef = useRef<any>(null);
  const techMarkerRef = useRef<any>(null);
  const customerMarkerRef = useRef<any>(null);
  const routeLineRef = useRef<any>(null);

  // States
  const [distance, setDistance] = useState<number>(0);
  const [isServiceable, setIsServiceable] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0); // Target en-route progress (0 to 1) synced from Firestore
  const [smoothProgress, setSmoothProgress] = useState<number>(0); // Sleek linear interpolation (lerp) state

  // Calculate distance on mount/update
  useEffect(() => {
    const dist = calculateDistance(HUB_LAT, HUB_LNG, customerLat, customerLng);
    setDistance(dist);
    // Serviceable limit: 25km radius from Kadugodi Central Hub
    setIsServiceable(dist <= 25);
  }, [customerLat, customerLng]);

  // 1. Listen directly to active Firestore GPS updates in real-time
  useEffect(() => {
    const rawStatus = (status || '').toLowerCase();
    const cleanStatus = rawStatus === 'in_progress' ? 'in-progress' : rawStatus;
    const cleanSubStatus = subStatus ? subStatus.toLowerCase() : null;

    if (cleanStatus !== "in-progress" || cleanSubStatus !== "leaving_hub" || !bookingId) {
      setProgress(0);
      return;
    }

    let unsubscribe: any;
    try {
      if (db && typeof db.app !== 'undefined') {
        unsubscribe = onSnapshot(doc(db, "active_bookings", bookingId), (docSnap) => {
          if (docSnap.exists()) {
            const activeData = docSnap.data();
            if (activeData.progress !== undefined) {
              setProgress(activeData.progress);
            }
          }
        });
      }
    } catch (err) {
      console.error("Failed to establish real-time Firestore GPS sync in admin panel map:", err);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [bookingId, status, subStatus]);

  // 2. Smoothly interpolate progress en-route over the 4-second refresh cycle
  useEffect(() => {
    const rawStatus = (status || '').toLowerCase();
    const cleanStatus = rawStatus === 'in_progress' ? 'in-progress' : rawStatus;
    const cleanSubStatus = subStatus ? subStatus.toLowerCase() : null;

    if (cleanStatus !== "in-progress" || cleanSubStatus !== "leaving_hub") {
      setSmoothProgress(0);
      return;
    }

    let animationFrame: number;
    const start = Date.now();
    const duration = 4000; // 4 seconds cycle
    const initialProgress = smoothProgress;
    const targetProgress = progress;

    const animate = () => {
      const elapsed = Date.now() - start;
      const t = Math.min(1, elapsed / duration);
      
      // Linear interpolation along progression percentage
      const nextProgress = initialProgress + t * (targetProgress - initialProgress);
      setSmoothProgress(nextProgress);

      if (t < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [progress, status, subStatus]);

  // Map Initialization & Dynamic Marker Updates
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let L: any;
    
    // Dynamically import Leaflet client-side to prevent SSR window crashes
    import("leaflet").then((leafletModule) => {
      L = leafletModule;

      // Fix Leaflet's default marker asset lookup paths in Next.js
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      // 1. Initialize Map instance
      if (!mapRef.current) {
        const bounds = L.latLngBounds(
          [HUB_LAT, HUB_LNG],
          [customerLat, customerLng]
        );

        const mapInstance = L.map(mapContainerRef.current!, {
          zoomControl: false,
          attributionControl: false,
        }).fitBounds(bounds.pad(0.35));

        // Add ultra-sleek, premium dark mode tiles
        L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
          {
            maxZoom: 19,
          }
        ).addTo(mapInstance);

        mapRef.current = mapInstance;

        // Custom HTML Marker Pins for premium cyber-automotive aesthetics
        const hubIcon = L.divIcon({
          className: "custom-hub-icon",
          html: `<div class="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-indigo-600 border border-white/20 flex items-center justify-center shadow-lg shadow-primary/30 relative">
                  <div class="absolute -inset-1.5 rounded-full bg-primary/20 blur animate-ping" />
                  <span class="text-[8px] font-black text-background">HUB</span>
                 </div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const customerIcon = L.divIcon({
          className: "custom-customer-icon",
          html: `<div class="w-7 h-7 rounded-full bg-gradient-to-br from-emergency to-red-800 border border-white/20 flex items-center justify-center shadow-lg shadow-emergency/40 relative">
                  <div class="absolute -inset-1 rounded-full bg-emergency/30 blur animate-pulse" />
                  <span class="text-[8px] font-black text-white">SOS</span>
                 </div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        // Save static markers
        hubMarkerRef.current = L.marker([HUB_LAT, HUB_LNG], { icon: hubIcon })
          .addTo(mapInstance)
          .bindPopup("<b>Erina Ops Central Hub</b><br>Kadugodi station");

        customerMarkerRef.current = L.marker([customerLat, customerLng], {
          icon: customerIcon,
        })
          .addTo(mapInstance)
          .bindPopup("<b>Motorist stranded Site</b>");
      }

      const map = mapRef.current;

      // 2. Manage Technician Journey Marker
      if (technicianName && (status === "assigned" || status === "in-progress")) {
        let techLat = HUB_LAT;
        let techLng = HUB_LNG;

        if (status === "in-progress") {
          if (subStatus === "leaving_hub") {
            // Smoothly interpolate coordinate along the line Hub -> Customer
            techLat = HUB_LAT + smoothProgress * (customerLat - HUB_LAT);
            techLng = HUB_LNG + smoothProgress * (customerLng - HUB_LNG);
          } else if (subStatus === "arrived") {
            techLat = customerLat;
            techLng = customerLng;
          }
        }

        const techIcon = L.divIcon({
          className: "custom-tech-icon",
          html: `<div class="w-9 h-9 rounded-full bg-card border border-primary/50 flex items-center justify-center shadow-lg shadow-primary/20 neon-glow relative">
                  <div class="absolute -inset-1 rounded-full bg-primary/20 blur animate-pulse" />
                  <img src="/logo-icon.svg" class="w-4 h-4 object-contain" />
                 </div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        if (!techMarkerRef.current) {
          techMarkerRef.current = L.marker([techLat, techLng], { icon: techIcon })
            .addTo(map)
            .bindPopup(`<b>Dispatched Unit: ${technicianName}</b>`);
        } else {
          techMarkerRef.current.setLatLng([techLat, techLng]);
        }

        // Draw dotted polyline path Hub -> Tech -> Customer
        const pathCoords = [
          [HUB_LAT, HUB_LNG],
          [techLat, techLng],
          [customerLat, customerLng],
        ];

        if (!routeLineRef.current) {
          routeLineRef.current = L.polyline(pathCoords, {
            color: "#00F0FF",
            weight: 2.5,
            dashArray: "6, 6",
            opacity: 0.8,
          }).addTo(map);
        } else {
          routeLineRef.current.setLatLngs(pathCoords);
        }
      } else {
        // Clear tech marker if unassigned/completed
        if (techMarkerRef.current) {
          map.removeLayer(techMarkerRef.current);
          techMarkerRef.current = null;
        }
        if (routeLineRef.current) {
          map.removeLayer(routeLineRef.current);
          routeLineRef.current = null;
        }
      }
    });

    return () => {
      // Clean up map only when fully unmounting
    };
  }, [customerLat, customerLng, status, subStatus, technicianName, smoothProgress]);

  // Clean up Leaflet completely on component unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        hubMarkerRef.current = null;
        techMarkerRef.current = null;
        customerMarkerRef.current = null;
        routeLineRef.current = null;
      }
    };
  }, []);

  return (
    <div className="flex flex-col gap-4 w-full h-full relative">
      
      {/* Sleek Floating Status & Serviceability Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#111827]/80 backdrop-blur-md border border-white/5 px-4 py-3 rounded-xl">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isServiceable ? "bg-success animate-pulse" : "bg-red-500"}`} />
          <span className="text-[10px] font-black uppercase tracking-wider text-white">
            {isServiceable ? "Serviceable Bangalore Grid" : "Out of Primary Service Area"}
          </span>
        </div>
        
        <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
          isServiceable 
            ? "bg-success/15 text-success border-success/20" 
            : "bg-red-500/10 text-red-400 border-red-500/20 animate-pulse"
        }`}>
          {isServiceable ? "Active SLA Guarantee" : "SLA Suspended"}
        </span>
      </div>

      {/* Map Container */}
      <div className="relative w-full h-64 md:h-72 rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
        <div ref={mapContainerRef} className="w-full h-full bg-[#0B0F19]" />
        
        {/* Floating Zepto-inspired ETA Pill overlay */}
        <div className="absolute bottom-4 left-4 z-40 max-w-[280px] sm:max-w-[340px] bg-[#111827]/90 backdrop-blur-lg border border-white/10 rounded-2xl p-3.5 shadow-2xl text-left flex items-start gap-3">
          <div className="p-2.5 bg-primary/10 rounded-xl text-primary animate-pulse shrink-0">
            <Truck size={16} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-primary">
                {status === "completed" 
                  ? "INCIDENT RESOLVED" 
                  : status === "assigned"
                    ? "PREPARING AT CENTRAL HUB"
                    : status === "in-progress" && subStatus === "leaving_hub"
                      ? "DISPATCH RIDE OUTBOUND"
                      : status === "in-progress" && subStatus === "arrived"
                        ? "UNIT ON-SCENE"
                        : "AWAITING DISPATCH"}
              </span>
            </div>
            
            <p className="text-[10px] text-foreground/75 leading-relaxed mt-1 font-medium">
              {status === "completed" 
                ? "Breakdown resolved successfully. Responder has been cleared."
                : status === "assigned"
                  ? `${technicianName || "Technician"} is actively loading the rescue kit at our Kadugodi station.`
                  : status === "in-progress" && subStatus === "leaving_hub"
                    ? `Leaving Hub! Dispatched unit has left Dinnur Main Road and is traveling to motorist.`
                    : status === "in-progress" && subStatus === "arrived"
                      ? "Arrived! Technical responder is performing active recovery at breakdown site."
                      : "Command desk is matching incoming customer request with nearest available responder."}
            </p>

            <div className="flex items-center justify-between text-[9px] text-foreground/40 mt-2.5 pt-2 border-t border-white/5 font-semibold uppercase tracking-wider">
              <span>SLA distance:</span>
              <span className="text-white font-mono">{distance.toFixed(1)} km from Ops Hub</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
