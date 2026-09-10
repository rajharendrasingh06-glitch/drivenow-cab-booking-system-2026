import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Car,
  MapPin,
  Navigation,
  Clock,
  IndianRupee,
  Star,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Filter,
} from 'lucide-react';
import { apiClient } from '../services/api';
import { Ride, RideStatus } from '../types';
import { useAuth } from '../context/AuthContext';

export const MyRidesPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rides, setRides] = useState<Ride[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/my-rides');
      return;
    }

    apiClient
      .get('/rides/user/my-rides')
      .then(({ data }) => {
        setRides(data.rides || []);
      })
      .catch((err) => console.error('Failed to load rides:', err))
      .finally(() => setIsLoading(false));
  }, [user]);

  const filteredRides = rides.filter((r) => {
    if (statusFilter === 'ALL') return true;
    if (statusFilter === 'COMPLETED') return r.status === 'TRIP_COMPLETED';
    if (statusFilter === 'ACTIVE')
      return ['REQUESTED', 'DRIVER_ASSIGNED', 'DRIVER_ARRIVING', 'DRIVER_ARRIVED', 'TRIP_STARTED'].includes(
        r.status
      );
    if (statusFilter === 'CANCELLED') return r.status === 'CANCELLED';
    return true;
  });

  const getStatusBadge = (st: RideStatus) => {
    switch (st) {
      case 'TRIP_COMPLETED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'CANCELLED':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200 animate-pulse';
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">My Ride History</h1>
            <p className="text-xs text-gray-500 mt-1">
              Review your past chauffeur-driven bookings, invoices, and ratings.
            </p>
          </div>
          <Link
            to="/book"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
          >
            <Car className="w-4 h-4" />
            <span>Book New Cab</span>
          </Link>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
          {['ALL', 'ACTIVE', 'COMPLETED', 'CANCELLED'].map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                statusFilter === f
                  ? 'bg-gray-900 text-white shadow-xs'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f === 'ALL' ? 'All Rides' : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-white rounded-2xl animate-pulse border border-gray-200"></div>
            ))}
          </div>
        ) : filteredRides.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
            <Car className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-900">No rides found</h3>
            <p className="text-xs text-gray-500 mt-1 mb-4">
              You have no {statusFilter !== 'ALL' ? statusFilter.toLowerCase() : ''} cab bookings logged yet.
            </p>
            <Link
              to="/book"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
            >
              Book a Ride Now
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRides.map((ride) => {
              const isActive = [
                'REQUESTED',
                'DRIVER_ASSIGNED',
                'DRIVER_ARRIVING',
                'DRIVER_ARRIVED',
                'TRIP_STARTED',
              ].includes(ride.status);

              return (
                <div
                  key={ride.id}
                  className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs hover:border-gray-300 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-3 mb-3 gap-2">
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                          ride.status
                        )}`}
                      >
                        {ride.status.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs font-mono font-semibold text-gray-500">
                        {ride.id}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(ride.requestedAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-gray-900 flex items-center">
                        <IndianRupee className="w-3.5 h-3.5" />
                        <span>{ride.fare.totalFare}</span>
                      </span>
                      <span className="text-[10px] text-gray-400 font-medium uppercase">
                        ({ride.paymentStatus})
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    {/* Route */}
                    <div className="md:col-span-2 space-y-2 text-xs">
                      <div className="flex items-start gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 mt-1"></div>
                        <span className="text-gray-800 font-medium truncate">{ride.pickup.address}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0 mt-1"></div>
                        <span className="text-gray-800 font-medium truncate">{ride.drop.address}</span>
                      </div>
                    </div>

                    {/* Vehicle & Chauffeur */}
                    <div className="border-t md:border-t-0 md:border-l border-gray-100 pt-2 md:pt-0 md:pl-4 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-gray-900">{ride.vehicleModel}</div>
                        <div className="text-[11px] text-gray-500">{ride.vehicleRegNo} • Chauffeur: {ride.driverName}</div>
                        {ride.rating && (
                          <div className="text-amber-500 font-bold text-[11px] mt-0.5">
                            ★ {ride.rating.stars}/5 rated
                          </div>
                        )}
                      </div>

                      <div>
                        {isActive ? (
                          <Link
                            to={`/current-ride?id=${ride.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                          >
                            <span>Live Track</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        ) : (
                          <Link
                            to={`/current-ride?id=${ride.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-xs"
                          >
                            <span>Details</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
