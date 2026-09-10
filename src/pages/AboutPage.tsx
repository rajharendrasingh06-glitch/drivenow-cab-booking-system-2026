import React from 'react';
import { ShieldCheck, Car, Users, Award, MapPin, CheckCircle2 } from 'lucide-react';
import { INDIAN_CITIES } from '../data/indianCities';

export const AboutPage: React.FC = () => {
  return (
    <div className="bg-white min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-3 py-1 rounded-full">
            About DriveNow India
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mt-3 tracking-tight">
            Chauffeur-Driven Mobility Built for India's Cities
          </h1>
          <p className="text-sm text-gray-600 mt-2 leading-relaxed">
            DriveNow is an Indian on-demand commercial cab network designed from the ground up to deliver safe, dignified, and predictable Chauffeur-driven cab transport across 14 major metropolitan regions.
          </p>
        </div>

        {/* Clear Non-Self-Drive Policy Notice */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 mb-12 text-emerald-950">
          <h3 className="text-sm font-bold flex items-center gap-2 mb-2 text-emerald-900">
            <CheckCircle2 className="w-5 h-5 text-emerald-700" />
            <span>Strict Chauffeur-Driven Mandate (Zero Self-Drive)</span>
          </h3>
          <p className="text-xs text-emerald-800 leading-relaxed">
            DriveNow is strictly NOT a self-drive car rental company. Customers never drive the vehicles and are never asked to present personal driving licenses, undergo vehicle damage inspections, or pay security deposits. All rides are piloted by certified, background-checked Indian commercial drivers holding valid commercial transport permits.
          </p>
        </div>

        {/* Key Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="rounded-2xl border border-gray-200 p-6 bg-slate-50">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
              <Car className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-2">400-Vehicle Verified Fleet</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Consisting of 20 ubiquitous Indian models (Maruti Swift, Dzire, Baleno, Hyundai Creta, Tata Nexon, etc.) maintained to strict commercial safety and emission standards.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 p-6 bg-slate-50">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-2">Comprehensive 24x7 Safety</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Integrated with Indian Police Emergency 112, 4-digit ride OTP verification before boarding, live GPS route telemetry, and round-the-clock incident response units.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 p-6 bg-slate-50">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-2">Fair & Dignified Driver Earnings</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Our partner chauffeurs retain over 80% of trip fares with immediate digital UPI settlement, medical benefits, and recognized commercial certification.
            </p>
          </div>
        </div>

        {/* Operational Cities Grid */}
        <div className="rounded-2xl border border-gray-200 p-6 bg-white shadow-xs">
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>Active Across 14 Indian Metros</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {INDIAN_CITIES.map((c) => (
              <div key={c.name} className="p-2.5 rounded-xl border border-gray-100 bg-gray-50 flex flex-col">
                <span className="font-bold text-gray-900">{c.name}</span>
                <span className="text-[11px] text-gray-500">{c.state}</span>
                <span className="text-[10px] text-emerald-700 font-semibold mt-1">
                  {c.fleetCount} Active Cabs
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
