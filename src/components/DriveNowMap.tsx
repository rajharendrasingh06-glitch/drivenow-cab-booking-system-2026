import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Compass, AlertCircle, Car, ShieldAlert } from 'lucide-react';
import { Coordinates, RideStatus } from '../types';

interface DriveNowMapProps {
  pickup?: Coordinates | null;
  drop?: Coordinates | null;
  driverLocation?: { lat: number; lng: number } | null;
  nearbyCabs?: { id: string; model: string; lat: number; lng: number }[];
  rideStatus?: RideStatus;
  onMapClick?: (coords: { lat: number; lng: number }) => void;
  height?: string;
  interactive?: boolean;
}

export const DriveNowMap: React.FC<DriveNowMapProps> = ({
  pickup,
  drop,
  driverLocation,
  nearbyCabs = [],
  rideStatus,
  onMapClick,
  height = '420px',
  interactive = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState<boolean>(false);
  const [googleMapsError, setGoogleMapsError] = useState<string | null>(null);
  const googleApiKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY;

  // Real Google Maps Initialization if Key exists
  useEffect(() => {
    if (!googleApiKey) {
      return;
    }

    const scriptId = 'google-maps-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${googleApiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setGoogleMapsLoaded(true);
      script.onerror = () => setGoogleMapsError('Failed to load Google Maps SDK with provided key.');
      document.head.appendChild(script);
    } else {
      setGoogleMapsLoaded(true);
    }
  }, [googleApiKey]);

  // Center coordinate for the map
  const defaultCenter = pickup
    ? { lat: pickup.lat, lng: pickup.lng }
    : drop
    ? { lat: drop.lat, lng: drop.lng }
    : { lat: 19.076, lng: 72.8777 }; // Default Mumbai

  // Simulated GPS Driver animation towards pickup if DRIVER_ARRIVING
  const [animatedDriverLoc, setAnimatedDriverLoc] = useState<{ lat: number; lng: number } | null>(
    driverLocation || null
  );

  useEffect(() => {
    if (driverLocation) {
      setAnimatedDriverLoc(driverLocation);
    } else if (pickup && rideStatus === 'DRIVER_ARRIVING') {
      setAnimatedDriverLoc({
        lat: pickup.lat + 0.005,
        lng: pickup.lng + 0.004,
      });
    }
  }, [driverLocation, pickup, rideStatus]);

  // Relative pixel positioning on interactive map view
  const calculateRelativePercent = (lat: number, lng: number) => {
    const latSpan = 0.08;
    const lngSpan = 0.08;
    const centerLat = defaultCenter.lat;
    const centerLng = defaultCenter.lng;

    const yPercent = 50 - ((lat - centerLat) / latSpan) * 100;
    const xPercent = 50 + ((lng - centerLng) / lngSpan) * 100;

    return {
      top: `${Math.min(90, Math.max(10, yPercent))}%`,
      left: `${Math.min(90, Math.max(10, xPercent))}%`,
    };
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !onMapClick) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const xRatio = (x / rect.width - 0.5) * 0.08;
    const yRatio = -(y / rect.height - 0.5) * 0.08;

    const clickedLat = Number((defaultCenter.lat + yRatio).toFixed(5));
    const clickedLng = Number((defaultCenter.lng + xRatio).toFixed(5));

    onMapClick({ lat: clickedLat, lng: clickedLng });
  };

  return (
    <div
      id="drivenow-map-container"
      ref={mapContainerRef}
      style={{ height }}
      className="relative w-full rounded-2xl overflow-hidden border border-gray-200 bg-slate-100 select-none shadow-xs"
    >
      {/* Missing Google Maps API Key Notice (Mandated by requirements) */}
      {!googleApiKey && (
        <div className="absolute top-3 left-3 right-3 z-30 flex items-start gap-2 bg-amber-50/95 border border-amber-200 text-amber-900 px-3 py-2 rounded-lg text-xs backdrop-blur-xs shadow-xs">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Google Maps API key not configured in environment.</span>
            <p className="text-[11px] text-amber-700 mt-0.5">
              Live Google Maps requires <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">VITE_GOOGLE_MAPS_API_KEY</code>. Displaying interactive DriveNow GPS Simulation Engine.
            </p>
          </div>
        </div>
      )}

      {/* Map Interactive Canvas */}
      <div
        onClick={handleCanvasClick}
        className={`w-full h-full relative cursor-crosshair overflow-hidden ${
          interactive ? 'cursor-pointer' : ''
        }`}
      >
        {/* Stylized Indian City Grid SVG Background */}
        <svg className="w-full h-full absolute inset-0 opacity-40" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="city-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#cbd5e1" strokeWidth="1" />
              <circle cx="30" cy="30" r="1.5" fill="#94a3b8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="#f1f5f9" />
          <rect width="100%" height="100%" fill="url(#city-grid)" />
          {/* Arterial Road Lines */}
          <line x1="0" y1="28%" x2="100%" y2="35%" stroke="#ffffff" strokeWidth="10" />
          <line x1="0" y1="28%" x2="100%" y2="35%" stroke="#cbd5e1" strokeWidth="6" strokeDasharray="6 4" />
          <line x1="15%" y1="0" x2="45%" y2="100%" stroke="#ffffff" strokeWidth="12" />
          <line x1="15%" y1="0" x2="45%" y2="100%" stroke="#cbd5e1" strokeWidth="8" strokeDasharray="8 6" />
          <line x1="40%" y1="0" x2="90%" y2="100%" stroke="#ffffff" strokeWidth="14" />
          <line x1="40%" y1="0" x2="90%" y2="100%" stroke="#e2e8f0" strokeWidth="10" />
        </svg>

        {/* Route Line SVG between Pickup and Drop */}
        {pickup && drop && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
            {(() => {
              const pPos = calculateRelativePercent(pickup.lat, pickup.lng);
              const dPos = calculateRelativePercent(drop.lat, drop.lng);
              return (
                <line
                  x1={pPos.left}
                  y1={pPos.top}
                  x2={dPos.left}
                  y2={dPos.top}
                  stroke="#10b981"
                  strokeWidth="4"
                  strokeDasharray="8 4"
                  className="animate-pulse"
                />
              );
            })()}
          </svg>
        )}

        {/* Pickup Pin Marker */}
        {pickup && (
          <div
            style={calculateRelativePercent(pickup.lat, pickup.lng)}
            className="absolute z-20 -translate-x-1/2 -translate-y-full transition-all duration-300 pointer-events-none"
          >
            <div className="flex flex-col items-center">
              <div className="bg-emerald-600 text-white font-bold text-[11px] px-2 py-0.5 rounded shadow-md whitespace-nowrap mb-1 flex items-center gap-1 border border-white">
                <MapPin className="w-3 h-3 text-white" />
                <span>Pickup</span>
              </div>
              <div className="w-4 h-4 bg-emerald-600 rounded-full border-2 border-white shadow-md flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        )}

        {/* Drop Pin Marker */}
        {drop && (
          <div
            style={calculateRelativePercent(drop.lat, drop.lng)}
            className="absolute z-20 -translate-x-1/2 -translate-y-full transition-all duration-300 pointer-events-none"
          >
            <div className="flex flex-col items-center">
              <div className="bg-rose-600 text-white font-bold text-[11px] px-2 py-0.5 rounded shadow-md whitespace-nowrap mb-1 flex items-center gap-1 border border-white">
                <Navigation className="w-3 h-3 text-white" />
                <span>Destination</span>
              </div>
              <div className="w-4 h-4 bg-rose-600 rounded-full border-2 border-white shadow-md flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
        )}

        {/* Assigned Driver Live Location Marker */}
        {animatedDriverLoc && (
          <div
            style={calculateRelativePercent(animatedDriverLoc.lat, animatedDriverLoc.lng)}
            className="absolute z-20 -translate-x-1/2 -translate-y-1/2 transition-all duration-700 pointer-events-none"
          >
            <div className="relative flex items-center justify-center">
              <div className="absolute w-10 h-10 bg-emerald-500/20 rounded-full animate-ping"></div>
              <div className="w-8 h-8 bg-black text-white rounded-full shadow-lg flex items-center justify-center border-2 border-white">
                <Car className="w-4 h-4 text-amber-400" />
              </div>
              <span className="absolute -bottom-5 bg-black/80 text-white text-[9px] px-1.5 py-0.2 rounded whitespace-nowrap">
                Driver Moving
              </span>
            </div>
          </div>
        )}

        {/* Nearby Available Cabs */}
        {!drop &&
          nearbyCabs.map((cab) => (
            <div
              key={cab.id}
              style={calculateRelativePercent(cab.lat, cab.lng)}
              className="absolute z-10 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-500"
            >
              <div className="w-6 h-6 bg-white rounded-full shadow border border-gray-300 flex items-center justify-center text-gray-800">
                <Car className="w-3.5 h-3.5 text-gray-700" />
              </div>
            </div>
          ))}

        {/* Compass & Map Controls */}
        <div className="absolute bottom-3 right-3 z-30 flex flex-col gap-1.5">
          <div className="bg-white/90 backdrop-blur-xs border border-gray-200 rounded-lg p-2 shadow-xs text-gray-600 flex items-center gap-1 text-xs">
            <Compass className="w-4 h-4 text-emerald-600" />
            <span className="font-medium text-[11px]">DriveNow GPS</span>
          </div>
        </div>

        {/* Click-to-pick indicator if in interactive mode without drop */}
        {interactive && !drop && (
          <div className="absolute bottom-3 left-3 z-30 bg-white/95 backdrop-blur-xs border border-gray-200 px-3 py-1.5 rounded-lg text-xs text-gray-600 shadow-xs">
            💡 Click anywhere on map to pin {pickup ? 'destination' : 'pickup point'}
          </div>
        )}
      </div>
    </div>
  );
};
