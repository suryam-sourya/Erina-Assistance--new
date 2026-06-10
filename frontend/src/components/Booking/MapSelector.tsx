"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation } from "lucide-react";
import "leaflet/dist/leaflet.css";
import { useUserStore } from "@/store/userStore";
import { calculateDistance } from "@/lib/location";

const ERINA_HUB_LAT = 12.9902;
const ERINA_HUB_LNG = 77.7602;
const MAX_SERVICE_RADIUS_KM = 10;

interface MapSelectorProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  initialLat?: number;
  initialLng?: number;
}

export default function MapSelector({
  onLocationSelect,
  initialLat = 12.9928671, // Erina Hub Lat
  initialLng = 77.7529829  // Erina Hub Lng
}: MapSelectorProps) {
  const { detectedLocation, isServiceable, setLocation } = useUserStore();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  
  const [detecting, setDetecting] = useState(false);
  const [address, setAddress] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const ignoreNextSearch = useRef(false);

  useEffect(() => {
    if (!searchQuery || searchQuery.length < 3) {
      setSearchResults([]);
      return;
    }

    if (ignoreNextSearch.current) {
      ignoreNextSearch.current = false;
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      handleSearch(searchQuery);
    }, 400); // 400ms debounce to prevent API rate-limits

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Helper: OpenStreetMap Nominatim Reverse Geocoding
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            "Accept-Language": "en",
            "User-Agent": "Erina-Assistance-RSA"
          }
        }
      );
      const data = await response.json();
      const formattedAddress = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      setAddress(formattedAddress);
      
      const distanceKm = calculateDistance(lat, lng, ERINA_HUB_LAT, ERINA_HUB_LNG);
      const serviceable = distanceKm <= MAX_SERVICE_RADIUS_KM;
      setLocation({ lat, lng, address: formattedAddress }, serviceable);

      onLocationSelect(lat, lng, formattedAddress);
    } catch (err) {
      console.error("Reverse geocoding failed:", err);
      const fallback = `Coordinates: ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      setAddress(fallback);
      
      const distanceKm = calculateDistance(lat, lng, ERINA_HUB_LAT, ERINA_HUB_LNG);
      const serviceable = distanceKm <= MAX_SERVICE_RADIUS_KM;
      setLocation({ lat, lng, address: fallback }, serviceable);

      onLocationSelect(lat, lng, fallback);
    }
  };

  // Helper: Search address (Nominatim Geocoding)
  const handleSearch = async (query: string) => {
    if (!query || query.length < 3) return;
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query + ", Bangalore"
        )}&limit=5&addressdetails=1`,
        {
          headers: {
            "Accept-Language": "en",
            "User-Agent": "Erina-Assistance-RSA"
          }
        }
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle selecting a search result
  const selectResult = (result: any) => {
    const lat = Number(result.lat);
    const lng = Number(result.lon);
    const formattedAddress = result.display_name;
    
    setAddress(formattedAddress);
    ignoreNextSearch.current = true;
    setSearchQuery(result.name || result.display_name.split(",")[0]);
    setSearchResults([]);
    
    onLocationSelect(lat, lng, formattedAddress);

    if (mapRef.current && markerRef.current) {
      mapRef.current.setView([lat, lng], 16);
      markerRef.current.setLatLng([lat, lng]);
    }
  };

  // Handle GPS location detection
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert("Browser GPS Geolocation is not supported in this browser.");
      return;
    }
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        if (mapRef.current && markerRef.current) {
          mapRef.current.setView([lat, lng], 16);
          markerRef.current.setLatLng([lat, lng]);
        }
        
        reverseGeocode(lat, lng);
        setDetecting(false);
      },
      (error) => {
        console.error("GPS tracking error:", error);
        setDetecting(false);
        alert("GPS detection failed. Please search or drop a pin manually.");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Initialize Leaflet Map on Mount
  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    // Dynamically load Leaflet client-side to prevent Node SSR window crashes
    import("leaflet").then((L) => {
      if (mapRef.current) {
    return;
  }
      // Fix default Leaflet icon paths in Webpack/Next.js
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const startLat = detectedLocation ? detectedLocation.lat : initialLat;
      const startLng = detectedLocation ? detectedLocation.lng : initialLng;

      // 1. Initialize Map
      const mapInstance = L.map(mapContainerRef.current!, {
        zoomControl: false,
        attributionControl: false
      }).setView([startLat, startLng], 14);

      // 2. Add OpenStreetMap Tiles (100% Free Tile Server)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(mapInstance);

      // 3. Add Custom Draggable Marker Pin
      const markerInstance = L.marker([startLat, startLng], {
        draggable: true,
      }).addTo(mapInstance);

      // 4. Bind Dragging Events to reverse geocode coordinate drops
      markerInstance.on("dragend", () => {
        const position = markerInstance.getLatLng();
        reverseGeocode(position.lat, position.lng);
      });

      // 5. Click on Map to jump pin
      mapInstance.on("click", (e) => {
        const position = e.latlng;
        markerInstance.setLatLng(position);
        reverseGeocode(position.lat, position.lng);
      });

      // 6. Save references
      mapRef.current = mapInstance;
      markerRef.current = markerInstance;

      // Initial reverse geocode load
      reverseGeocode(startLat, startLng);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Smart Search Autocomplete Box */}
      <div className="flex gap-3 relative">
        <div className="relative flex-grow">
          {isSearching ? (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          ) : (
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          )}
          <input
            type="text"
            placeholder="Search address or type location..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
            }}
            className="w-full pl-12 pr-5 py-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-semibold"
          />
        </div>

        <button
          type="button"
          onClick={handleDetectGPS}
          disabled={detecting}
          className="flex items-center justify-center gap-2 px-6 py-4 bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 disabled:opacity-50 text-white rounded-xl font-bold transition-all whitespace-nowrap text-sm cursor-pointer shadow-md"
        >
          {detecting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Navigation size={16} />
              <span>Location</span>
            </>
          )}
        </button>

        {/* Real-time search results drop down panel */}
        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-xl shadow-xl z-[999] overflow-hidden max-h-60 overflow-y-auto">
            {searchResults.map((result, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => selectResult(result)}
                className="w-full text-left px-4 py-3 text-xs border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 text-foreground font-semibold flex items-start gap-2.5 transition-colors cursor-pointer"
              >
                <MapPin size={14} className="text-primary shrink-0 mt-0.5" />
                <span className="truncate">{result.display_name}</span>
              </button>
            ))}
          </div>
        )}

        {searchResults.length === 0 && searchQuery.length >= 3 && !isSearching && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-xl shadow-xl z-[999] p-4 text-center text-xs text-foreground/50 font-semibold">
            No locations found. Try moving the map pin manually.
          </div>
        )}
      </div>

      {/* Selected Address Display */}
      {address && (
        <div className={`text-xs border rounded-xl px-4 py-3 font-semibold leading-relaxed flex items-start gap-2 transition-colors ${
          isServiceable === false 
            ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400' 
            : 'bg-primary/5 border-primary/15 text-foreground/80'
        }`}>
          <span className={isServiceable === false ? "text-red-500" : "text-primary"}>📍</span>
          <div className="flex flex-col gap-1">
            <span>{address}</span>
            {isServiceable === false && (
              <span className="text-[10px] font-bold tracking-wide uppercase mt-1 opacity-80">
                ⚠️ Out of Service Area (10km Hub Limit)
              </span>
            )}
          </div>
        </div>
      )}

      {/* Live Interactive Map Box */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-52 bg-gray-100 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-800/80 shadow-inner overflow-hidden z-10"
      />
    </div>
  );
}
