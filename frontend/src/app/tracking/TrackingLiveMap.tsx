"use client";

import { useEffect, useRef, useState } from "react";
import { Truck } from "lucide-react";
import "leaflet/dist/leaflet.css";

interface TrackingLiveMapProps {
  customerLat: number;
  customerLng: number;
  status: string;
  subStatus: string | null;
  technicianName: string | null;
  progress: number;
  technicianLocation: { lat: number; lng: number } | null;
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

export default function TrackingLiveMap({
  customerLat,
  customerLng,
  status,
  subStatus,
  technicianName,
  progress,
  technicianLocation,
}: TrackingLiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  
  // Marker Refs
  const hubMarkerRef = useRef<any>(null);
  const techMarkerRef = useRef<any>(null);
  const customerMarkerRef = useRef<any>(null);
  const routeLineRef = useRef<any>(null);

  const [distance, setDistance] = useState<number>(0);
  const [smoothProgress, setSmoothProgress] = useState<number>(0); // Sleek linear interpolation (lerp) state

  // Calculate geodesic distance on coordinates update
  useEffect(() => {
    const dist = calculateDistance(HUB_LAT, HUB_LNG, customerLat, customerLng);
    setDistance(dist);
  }, [customerLat, customerLng]);

  // Smoothly interpolate progress en-route over the 4-second refresh cycle
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
    const duration = 4000; // 4-second simulation interval
    const initialProgress = smoothProgress;
    const targetProgress = progress;

    const animate = () => {
      const elapsed = Date.now() - start;
      const t = Math.min(1, elapsed / duration);
      
      // Linear progression slider
      const nextProgress = initialProgress + t * (targetProgress - initialProgress);
      setSmoothProgress(nextProgress);

      if (t < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [progress, status, subStatus]);

  // Leaflet initialization and dynamic pin updates
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let L: any;
    
    import("leaflet").then((leafletModule) => {
      L = leafletModule;

      // Fix default Leaflet asset lookup paths
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      // 1. Initialize Map
      if (!mapRef.current) {
        const bounds = L.latLngBounds(
          [HUB_LAT, HUB_LNG],
          [customerLat, customerLng]
        );

        const mapInstance = L.map(mapContainerRef.current!, {
          zoomControl: true,
          attributionControl: false,
        }).fitBounds(bounds.pad(0.3));

        // Dark tiles for automotive cyberpunk aesthetic
        L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
          {
            maxZoom: 19,
          }
        ).addTo(mapInstance);

        mapRef.current = mapInstance;

        // Custom HTML Icons
        const hubIcon = L.divIcon({
          className: "custom-hub-icon",
          html: `<div class="w-7 h-7 rounded-full bg-gradient-to-br from-[#FF3366] to-indigo-600 border border-white/20 flex items-center justify-center shadow-lg relative">
                  <div class="absolute -inset-1 rounded-full bg-[#FF3366]/20 blur animate-ping" />
                  <span class="text-[8px] font-black text-white">HUB</span>
                 </div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const customerIcon = L.divIcon({
          className: "custom-customer-icon",
          html: `<div class="w-7 h-7 rounded-full bg-gradient-to-br from-red-500 to-red-800 border border-white/20 flex items-center justify-center shadow-lg relative">
                  <div class="absolute -inset-1 rounded-full bg-red-500/30 blur animate-pulse" />
                  <span class="text-[8px] font-black text-white">SOS</span>
                 </div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        hubMarkerRef.current = L.marker([HUB_LAT, HUB_LNG], { icon: hubIcon })
          .addTo(mapInstance)
          .bindPopup("<b>Erina Ops Central Hub</b><br>Kadugodi Station");

        customerMarkerRef.current = L.marker([customerLat, customerLng], {
          icon: customerIcon,
        })
          .addTo(mapInstance)
          .bindPopup("<b>Your Breakdown Site</b>");
      }

      const map = mapRef.current;

      // 2. Add and Update Technician Marker
      if (technicianName && (status === "assigned" || status === "in-progress")) {
        let techLat = HUB_LAT;
        let techLng = HUB_LNG;

        if (status === "in-progress") {
          if (subStatus === "leaving_hub") {
            techLat = HUB_LAT + smoothProgress * (customerLat - HUB_LAT);
            techLng = HUB_LNG + smoothProgress * (customerLng - HUB_LNG);
          } else if (subStatus === "arrived") {
            techLat = customerLat;
            techLng = customerLng;
          }
        }

        const techIcon = L.divIcon({
          className: "custom-tech-icon",
          html: `<div class="w-9 h-9 rounded-full bg-gray-900 border-2 border-[#FF3366] flex items-center justify-center shadow-xl relative">
                  <div class="absolute -inset-1 rounded-full bg-[#FF3366]/20 blur animate-pulse" />
                  <span class="text-[9px] font-black text-[#FF3366]">tech</span>
                 </div>`,
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        if (!techMarkerRef.current) {
          techMarkerRef.current = L.marker([techLat, techLng], { icon: techIcon })
            .addTo(map)
            .bindPopup(`<b>Rescue Technician: ${technicianName}</b>`);
        } else {
          techMarkerRef.current.setLatLng([techLat, techLng]);
        }

        const pathCoords = [
          [HUB_LAT, HUB_LNG],
          [techLat, techLng],
          [customerLat, customerLng],
        ];

        if (!routeLineRef.current) {
          routeLineRef.current = L.polyline(pathCoords, {
            color: "#FF3366",
            weight: 2.5,
            dashArray: "6, 6",
            opacity: 0.8,
          }).addTo(map);
        } else {
          routeLineRef.current.setLatLngs(pathCoords);
        }
      } else {
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
  }, [customerLat, customerLng, status, subStatus, technicianName, smoothProgress]);

  // Component unmount map cleanup
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
    <div className="w-full h-full relative">
      <div ref={mapContainerRef} className="w-full h-full bg-[#0B0F19]" />
      
      {/* Dynamic Geodesic Telemetry Overlay */}
      <div className="absolute bottom-4 left-4 z-40 bg-gray-900/90 backdrop-blur-md border border-white/10 rounded-2xl p-3 shadow-2xl max-w-[280px]">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[#FF3366]/10 rounded-lg text-[#FF3366]">
            <Truck size={16} />
          </div>
          <div>
            <span className="text-[10px] font-black text-[#FF3366] uppercase tracking-wider block">
              {status === "completed" 
                ? "RESCUE RESOLVED" 
                : status === "assigned"
                  ? "LOADING TOOLS AT HUB"
                  : status === "in-progress" && subStatus === "leaving_hub"
                    ? "EN ROUTE TO YOU"
                    : status === "in-progress" && subStatus === "arrived"
                      ? "OPERATOR ON-SCENE"
                      : "AWAITING DISPATCH"}
            </span>
            <p className="text-[10px] text-gray-300 font-semibold mt-1">
              Hub Geodesic Distance: <span className="font-mono text-white">{distance.toFixed(1)} km</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
