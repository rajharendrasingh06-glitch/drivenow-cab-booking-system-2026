import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Car,
  Power,
  MapPin,
  Navigation,
  CheckCircle,
  XCircle,
  IndianRupee,
  Star,
  PhoneCall,
  KeyRound,
  ShieldCheck,
  Clock,
  Compass,
  UserCheck,
} from 'lucide-react';
import { FiUser } from 'react-icons/fi';
import { apiClient } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Driver, Ride, Vehicle } from '../../types';
import toast from 'react-hot-toast';

export const DriverDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [driver, setDriver] = useState<Driver | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [activeRide, setActiveRide] = useState<Ride | null>(null);
  const [recentRides, setRecentRides] = useState<Ride[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isTogglingStatus, setIsTogglingStatus] = useState<boolean>(false);
  const [otpInput, setOtpInput] = useState<string>('');

  const fetchDashboard = async () => {
    try {
      const { data } = await apiClient.get('/driver/dashboard');
      setDriver(data.driver);
      setVehicle(data.vehicle);
      setActiveRide(data.activeRide);
      setRecentRides(data.recentRides || []);
      setStats(data.stats);
    } catch (err) {
      console.error('Failed to load driver dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=/driver/dashboard');
      return;
    }
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 4000);
    return () => clearInterval(interval);
  }, [user]);

  // Toggle Online/Offline
  const handleToggleStatus = async () => {
    if (!driver) return;
    const nextStatus = driver.status === 'ONLINE' ? 'OFFLINE' : 'ONLINE';
    setIsTogglingStatus(true);
    try {
      const { data } = await apiClient.post('/driver/status', { status: nextStatus });
      setDriver(data.driver);
      toast.success(`You are now ${nextStatus}`);
      fetchDashboard();
    } catch {
      toast.error('Failed to toggle driver status.');
    } finally {
      setIsTogglingStatus(false);
    }
  };

  // Status transitions from Driver side
  const handleDriverAction = async (status: string) => {
    if (!activeRide) return;
    try {
      const payload: any = { status };
      if (status === 'TRIP_STARTED') {
        if (!otpInput || otpInput.length !== 4) {
          toast.error('Please enter the 4-digit ride OTP given by the customer.');
          return;
        }
        payload.otpProvided = otpInput;
      }

      const { data } = await apiClient.put(`/rides/${activeRide.id}/status`, payload);
      setActiveRide(data.ride);
      setOtpInput('');
      toast.success(`Ride status updated to ${status}`);
      fetchDashboard();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Action failed.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs font-semibold">Connecting to DriveNow Driver Dispatch Network...</p>
        </div>
      </div>
    );
  }

  const isOnline = driver?.status === 'ONLINE';

  return (
    <div className="bg-slate-900 min-h-screen text-slate-100 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Driver Header & Online Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 bg-slate-800/80 rounded-2xl p-6 border border-slate-700">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 border-2 border-emerald-500/80 flex items-center justify-center text-emerald-400 shadow-md shrink-0">
              <FiUser className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white">{driver?.name}</h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  Verified Chauffeur
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                License: {driver?.licenseNumber} • City: {driver?.city}
              </p>
              <div className="flex items-center gap-3 text-xs text-slate-300 mt-1">
                <span className="text-amber-400 font-bold flex items-center">
                  ★ {driver?.rating} ({driver?.totalRatingsCount} ratings)
                </span>
                <span>•</span>
                <span>{driver?.completedRides} Trips Completed</span>
              </div>
            </div>
          </div>

          {/* Online/Offline Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleStatus}
              disabled={isTogglingStatus}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs shadow-lg transition-all ${
                isOnline
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white ring-4 ring-emerald-500/20'
                  : 'bg-rose-600 hover:bg-rose-500 text-white ring-4 ring-rose-500/20'
              }`}
            >
              <Power className="w-4 h-4" />
              <span>{isOnline ? 'ONLINE (ACCEPTING RIDES)' : 'OFFLINE (TAP TO GO ONLINE)'}</span>
            </button>
          </div>
        </div>

        {/* Assigned Vehicle Card */}
        {vehicle && (
          <div className="rounded-2xl bg-slate-800/50 border border-slate-700 p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center text-slate-300">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                  Assigned DriveNow Vehicle
                </span>
                <span className="text-sm font-bold text-white">
                  {vehicle.brand} {vehicle.model} ({vehicle.category})
                </span>
                <span className="text-xs text-slate-400 block">{vehicle.color} • {vehicle.fuelType}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                Commercial Plate Number
              </span>
              <span className="text-xs font-mono font-black text-amber-400 bg-amber-950/60 border border-amber-500/40 px-2.5 py-1 rounded">
                {vehicle.registrationNumber}
              </span>
            </div>
          </div>
        )}

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
            <span className="text-[11px] text-slate-400 block">Today's Earnings</span>
            <div className="text-2xl font-black text-emerald-400 flex items-center mt-1">
              <IndianRupee className="w-5 h-5 mr-0.5" />
              <span>{stats?.todayEarnings || 0}</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">80% Net Chauffeur Share</span>
          </div>

          <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
            <span className="text-[11px] text-slate-400 block">Total Lifetime Earnings</span>
            <div className="text-2xl font-black text-white flex items-center mt-1">
              <IndianRupee className="w-5 h-5 mr-0.5" />
              <span>{stats?.totalEarnings || 0}</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">Transferred to bank via UPI</span>
          </div>

          <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
            <span className="text-[11px] text-slate-400 block">Completed Trips</span>
            <div className="text-2xl font-black text-white mt-1">
              {stats?.totalRides || 0}
            </div>
            <span className="text-[10px] text-emerald-400 mt-1 block">100% Acceptance Rate</span>
          </div>

          <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
            <span className="text-[11px] text-slate-400 block">Chauffeur Rating</span>
            <div className="text-2xl font-black text-amber-400 mt-1 flex items-center gap-1">
              <span>★</span>
              <span>{stats?.rating || 4.9}</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">Customer Feedback</span>
          </div>
        </div>

        {/* Active Trip Controller for Driver */}
        {activeRide ? (
          <div className="bg-slate-800 rounded-2xl p-6 border-2 border-emerald-500 mb-8 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-700 pb-4 mb-4 gap-2">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                  Active Dispatch Mission
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  Ride #{activeRide.id} • Status: {activeRide.status.replace(/_/g, ' ')}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Customer Fare</span>
                <span className="text-xl font-black text-emerald-400">
                  ₹{activeRide.fare.totalFare}
                </span>
              </div>
            </div>

            {/* Customer Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase block">Passenger Details</span>
                <div className="font-bold text-white text-sm mt-0.5">{activeRide.customerName}</div>
                <a
                  href={`tel:${activeRide.customerPhone}`}
                  className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 mt-1 font-semibold"
                >
                  <PhoneCall className="w-3 h-3" />
                  <span>{activeRide.customerPhone}</span>
                </a>
              </div>

              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase block">Route Information</span>
                <div className="text-xs text-slate-200 mt-1 truncate">
                  🟢 <b>Pickup:</b> {activeRide.pickup.address}
                </div>
                <div className="text-xs text-slate-200 mt-1 truncate">
                  🔴 <b>Destination:</b> {activeRide.drop.address}
                </div>
              </div>
            </div>

            {/* Workflow Action Buttons for Driver */}
            <div className="space-y-3 bg-slate-900/80 p-4 rounded-xl border border-slate-700">
              <span className="text-xs font-bold text-slate-300 block">
                Chauffeur Actions for Current Trip:
              </span>

              {activeRide.status === 'DRIVER_ASSIGNED' && (
                <button
                  onClick={() => handleDriverAction('DRIVER_ARRIVING')}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white"
                >
                  Confirm: Heading to Customer Pickup Location →
                </button>
              )}

              {activeRide.status === 'DRIVER_ARRIVING' && (
                <button
                  onClick={() => handleDriverAction('DRIVER_ARRIVED')}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white"
                >
                  Confirm: I Have Arrived at Pickup Point →
                </button>
              )}

              {activeRide.status === 'DRIVER_ARRIVED' && (
                <div className="space-y-2">
                  <div className="text-xs text-slate-300">
                    Ask passenger for their 4-digit ride OTP (Shown on customer's screen: <b className="text-emerald-400 font-mono">{activeRide.otp}</b>):
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={4}
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value)}
                      placeholder="Enter 4-digit OTP"
                      className="w-48 bg-slate-800 border border-slate-600 rounded-xl px-4 py-2 text-center text-sm font-mono text-white tracking-widest focus:outline-emerald-500"
                    />
                    <button
                      onClick={() => handleDriverAction('TRIP_STARTED')}
                      className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white"
                    >
                      Verify OTP & Start Trip
                    </button>
                  </div>
                </div>
              )}

              {activeRide.status === 'TRIP_STARTED' && (
                <button
                  onClick={() => handleDriverAction('TRIP_COMPLETED')}
                  className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 font-bold text-xs text-white shadow-lg"
                >
                  Arrived at Destination: End Trip & Complete Fare Collection →
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 text-center mb-8">
            <Compass className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">
              {isOnline ? 'Searching for Nearby Ride Requests...' : 'You are currently Offline'}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {isOnline
                ? 'Your GPS location is transmitting. As soon as a customer books in your city/category, the ride mission will appear here.'
                : 'Toggle your status to ONLINE above to start receiving ride bookings.'}
            </p>
          </div>
        )}

        {/* Driver Recent Rides History */}
        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-700 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Recent Chauffeur Trips
            </h3>
            <span className="text-xs text-slate-400">{recentRides.length} Trips</span>
          </div>

          <div className="divide-y divide-slate-700">
            {recentRides.map((r) => (
              <div key={r.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{r.customerName}</span>
                    <span className="font-mono text-slate-400">({r.id})</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                      {r.status}
                    </span>
                  </div>
                  <div className="text-slate-400 mt-1 truncate max-w-md">
                    {r.pickup.address} → {r.drop.address}
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-emerald-400 text-sm">₹{r.fare.totalFare}</div>
                  <span className="text-[10px] text-slate-500">{new Date(r.requestedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
