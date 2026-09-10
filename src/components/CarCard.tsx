import React, { useState } from 'react';
import { Users, Fuel, Gauge, ShieldCheck, IndianRupee } from 'lucide-react';
import { Vehicle, CabCategory } from '../types';

interface CarCardProps {
  vehicle: Vehicle;
  isSelected?: boolean;
  onSelect?: () => void;
  showPricing?: boolean;
}

// Color dot hex map for realistic visual rendering
const COLOR_HEX_MAP: Record<string, string> = {
  'Arctic White': '#f8fafc',
  'Pearl White': '#f1f5f9',
  'Calgary White': '#f8fafc',
  'Silky Silver': '#cbd5e1',
  'Magma Grey': '#64748b',
  'Daytona Grey': '#475569',
  'Titan Grey': '#334155',
  'Granite Grey': '#1e293b',
  'Oxford Blue': '#1e3a8a',
  'Nexa Blue': '#172554',
  'Phoenix Red': '#dc2626',
  'Blazing Red': '#b91c1c',
  'Pearl Midnight Black': '#0f172a',
};

export const CarCard: React.FC<CarCardProps> = ({
  vehicle,
  isSelected = false,
  onSelect,
  showPricing = true,
}) => {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const isImageFailed = failedUrl === vehicle.image;

  const getCategoryColor = (cat: CabCategory) => {
    switch (cat) {
      case 'Mini':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Sedan':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Prime':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'SUV':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const dotColor = COLOR_HEX_MAP[vehicle.color] || '#94a3b8';

  return (
    <div
      id={`vehicle-card-${vehicle.id}`}
      onClick={onSelect}
      className={`group relative rounded-xl border p-4 transition-all duration-200 cursor-pointer bg-white ${
        isSelected
          ? 'border-emerald-600 ring-2 ring-emerald-500/20 shadow-md bg-emerald-50/20'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${getCategoryColor(
                vehicle.category
              )}`}
            >
              {vehicle.category}
            </span>
            <span className="text-xs text-gray-500 font-mono tracking-wide">
              {vehicle.registrationNumber}
            </span>
          </div>
          <h4 className="text-base font-bold text-gray-900 mt-1">
            {vehicle.brand} {vehicle.model}
          </h4>
          <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
            <span>{vehicle.variant}</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <span
                className="w-2.5 h-2.5 rounded-full inline-block border border-gray-400 shadow-2xs"
                style={{ backgroundColor: dotColor }}
                title={vehicle.color}
              />
              <span className="text-gray-600">{vehicle.color}</span>
            </span>
          </p>
        </div>

        {showPricing && (
          <div className="text-right">
            <div className="flex items-center justify-end text-emerald-700 font-bold text-base">
              <IndianRupee className="w-3.5 h-3.5 mr-0.5" />
              <span>{vehicle.perKmFare}</span>
              <span className="text-xs font-normal text-gray-500 ml-1">/km</span>
            </div>
            <div className="text-[11px] text-gray-500">
              Base: ₹{vehicle.dailyBaseFare}
            </div>
          </div>
        )}
      </div>

      {/* Exact distinct car image */}
      <div className="relative h-36 w-full rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center mb-3 border border-gray-100">
        {!isImageFailed ? (
          <img
            src={vehicle.image}
            alt={`${vehicle.brand} ${vehicle.model} (${vehicle.color})`}
            referrerPolicy="no-referrer"
            onError={() => setFailedUrl(vehicle.image)}
            className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-linear-to-br from-gray-100 to-gray-200 text-gray-700">
            <div className="text-2xl mb-1">🚗</div>
            <span className="text-xs font-bold text-gray-800">
              {vehicle.brand} {vehicle.model}
            </span>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">
              Verified {vehicle.category} Fleet
            </span>
          </div>
        )}
        <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-xs px-2 py-0.5 rounded text-[11px] font-semibold text-gray-800 shadow-xs flex items-center gap-1 border border-gray-200/50">
          <span className="text-amber-500">★</span>
          <span>{vehicle.rating}</span>
        </div>
        <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] font-medium text-white shadow-xs">
          {vehicle.brand} {vehicle.model}
        </div>
      </div>

      {/* Key Specifications */}
      <div className="grid grid-cols-3 gap-2 py-2 border-t border-gray-100 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <Users className="w-3.5 h-3.5 text-gray-400" />
          <span>{vehicle.seats} Seats</span>
        </div>
        <div className="flex items-center gap-1">
          <Fuel className="w-3.5 h-3.5 text-gray-400" />
          <span>{vehicle.fuelType}</span>
        </div>
        <div className="flex items-center gap-1">
          <Gauge className="w-3.5 h-3.5 text-gray-400" />
          <span>{vehicle.transmission}</span>
        </div>
      </div>

      {/* Driver info */}
      {vehicle.assignedDriverName && (
        <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1 truncate">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">{vehicle.assignedDriverName}</span>
          </span>
          <span className="text-emerald-700 font-medium shrink-0">DriveNow Verified</span>
        </div>
      )}
    </div>
  );
};
