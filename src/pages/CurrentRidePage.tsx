import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  PhoneCall,
  ShieldCheck,
  ShieldAlert,
  Share2,
  KeyRound,
  MapPin,
  Navigation,
  IndianRupee,
  Star,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Car,
  XCircle,
  HelpCircle,
} from 'lucide-react';
import { FiUser } from 'react-icons/fi';
import { apiClient } from '../services/api';
import { CATEGORY_IMAGES } from '../data/carModels';
import { Ride, RideStatus } from '../types';
import { DriveNowMap } from '../components/DriveNowMap';
import { SafetyModal } from '../components/SafetyModal';
import { PaymentModal } from '../components/PaymentModal';
import toast from 'react-hot-toast';

export const CurrentRidePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const rideIdFromQuery = searchParams.get('id');

  const [ride, setRide] = useState<Ride | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [safetyModalOpen, setSafetyModalOpen] = useState<boolean>(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState<boolean>(false);
  const [cancelModalOpen, setCancelModalOpen] = useState<boolean>(false);
  const [cancelReason, setCancelReason] = useState<string>('Driver taking too long');

  // Rating & Review State
  const [ratingStars, setRatingStars] = useState<number>(5);
  const [reviewFeedback, setReviewFeedback] = useState<string>('Smooth driving, courteous chauffeur and clean car!');
  const [reviewSubmitted, setReviewSubmitted] = useState<boolean>(false);

  // Poll ride state
  const fetchRide = async () => {
    try {
      if (rideIdFromQuery) {
        const { data } = await apiClient.get(`/rides/${rideIdFromQuery}`);
        setRide(data.ride);
      } else {
        const { data } = await apiClient.get('/rides/active');
        setRide(data.ride);
      }
    } catch (err) {
      console.error('Failed to fetch ride:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRide();
    const interval = setInterval(fetchRide, 3500);
    return () => clearInterval(interval);
  }, [rideIdFromQuery]);

  // Status simulation controller for interactive review testing
  const advanceRideStatus = async (nextStatus: RideStatus) => {
    if (!ride) return;
    try {
      const { data } = await apiClient.put(`/rides/${ride.id}/status`, {
        status: nextStatus,
        otpProvided: ride.otp,
      });
      setRide(data.ride);
      toast.success(`Ride status updated to ${nextStatus}`);
      if (nextStatus === 'TRIP_COMPLETED' && data.ride.paymentStatus !== 'PAID') {
        setPaymentModalOpen(true);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Could not update status');
    }
  };

  const handleCancelRide = async () => {
    if (!ride) return;
    try {
      await apiClient.post(`/rides/${ride.id}/cancel`, { reason: cancelReason });
      toast.success('Ride cancelled.');
      setCancelModalOpen(false);
      fetchRide();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to cancel ride');
    }
  };

  const handleSubmitReview = async () => {
    if (!ride) return;
    try {
      await apiClient.post(`/rides/${ride.id}/review`, {
        stars: ratingStars,
        feedback: reviewFeedback,
      });
      setReviewSubmitted(true);
      toast.success('Thank you! Your review has been recorded.');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to submit review');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-semibold text-gray-700">Connecting to DriveNow GPS Dispatch...</p>
        </div>
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-md border border-gray-200">
          <Car className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-gray-900 mb-1">No Active Ride In Progress</h2>
          <p className="text-xs text-gray-500 mb-6">
            You do not currently have any active cab bookings. Book a chauffeur-driven cab now to start your journey.
          </p>
          <div className="flex gap-3">
            <Link
              to="/book"
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700"
            >
              Book a Ride
            </Link>
            <Link
              to="/my-rides"
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-xs hover:bg-gray-50"
            >
              View Ride History
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getStatusLabel = (st: RideStatus) => {
    switch (st) {
      case 'REQUESTED':
        return { label: 'Finding Chauffeur...', color: 'bg-amber-100 text-amber-800' };
      case 'DRIVER_ASSIGNED':
        return { label: 'Chauffeur Assigned & Preparing', color: 'bg-blue-100 text-blue-800' };
      case 'DRIVER_ARRIVING':
        return { label: 'Chauffeur On The Way To Pickup', color: 'bg-emerald-100 text-emerald-800' };
      case 'DRIVER_ARRIVED':
        return { label: 'Chauffeur Arrived At Pickup Point', color: 'bg-emerald-600 text-white' };
      case 'TRIP_STARTED':
        return { label: 'Trip In Progress', color: 'bg-emerald-700 text-white' };
      case 'TRIP_COMPLETED':
        return { label: 'Trip Completed', color: 'bg-slate-800 text-white' };
      case 'CANCELLED':
        return { label: 'Ride Cancelled', color: 'bg-rose-100 text-rose-800' };
      default:
        return { label: st, color: 'bg-gray-100 text-gray-800' };
    }
  };

  const statusInfo = getStatusLabel(ride.status);

  return (
    <div className="bg-slate-50 min-h-screen py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusInfo.color}`}>
                {statusInfo.label}
              </span>
              <span className="text-xs font-mono text-gray-500">Trip ID: {ride.id}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 mt-1">
              Live Chauffeur-Driven Ride Tracking
            </h1>
          </div>

          {/* Safety SOS and Share Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSafetyModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>24x7 Safety & SOS</span>
            </button>

            <button
              onClick={() => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(
                    `Tracking DriveNow ride ${ride.id} in cab ${ride.vehicleRegNo}. Driver: ${ride.driverName}`
                  );
                  toast.success('Live trip tracking info copied to clipboard!');
                }
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-xs shadow-xs transition-all"
            >
              <Share2 className="w-4 h-4 text-emerald-600" />
              <span>Share Trip</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Driver, Vehicle, OTP, and Route Info (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Boarding OTP Box (Visible until trip is started) */}
            {['DRIVER_ASSIGNED', 'DRIVER_ARRIVING', 'DRIVER_ARRIVED'].includes(ride.status) && (
              <div className="bg-emerald-900 text-white rounded-2xl p-5 shadow-lg border border-emerald-800">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider block">
                      Boarding Verification Code
                    </span>
                    <span className="text-xs text-emerald-200">
                      Share this 4-digit code with your driver upon boarding
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white text-emerald-950 px-4 py-2 rounded-xl font-mono text-2xl font-black tracking-widest shadow-inner">
                    <KeyRound className="w-5 h-5 text-emerald-700" />
                    <span>{ride.otp}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Chauffeur Details Card */}
            <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 border-2 border-emerald-500 flex items-center justify-center text-slate-700 shadow-xs">
                      <FiUser className="w-7 h-7 text-slate-700" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-0.5 rounded-full" title="Verified Driver">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-base font-bold text-gray-900">{ride.driverName}</h3>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-full">
                        Verified Chauffeur
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                      <span className="flex items-center text-amber-500 font-bold">
                        ★ {ride.driverRating}
                      </span>
                      <span>•</span>
                      <span>Commercial Badge</span>
                    </div>
                  </div>
                </div>

                <a
                  href={`tel:${ride.driverPhone}`}
                  className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 px-3 py-2 rounded-xl text-xs font-bold transition-colors"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call</span>
                </a>
              </div>

              {/* Vehicle Specs */}
              <div className="rounded-xl bg-gray-50 border border-gray-100 p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative w-16 h-12 rounded-lg overflow-hidden border border-gray-200 bg-white shrink-0">
                    <img
                      src={CATEGORY_IMAGES[ride.vehicleCategory]}
                      alt={ride.vehicleModel}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider block">
                      Assigned Cab
                    </span>
                    <div className="text-sm font-bold text-gray-900">
                      {ride.vehicleModel}
                    </div>
                    <div className="text-xs text-gray-500">{ride.vehicleColor} • {ride.vehicleCategory}</div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider block">
                    Registration No
                  </span>
                  <div className="text-xs font-mono font-bold text-gray-900 bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-md mt-0.5">
                    {ride.vehicleRegNo}
                  </div>
                </div>
              </div>
            </div>

            {/* Route Details */}
            <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-200">
              <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">
                Route & Destination
              </h4>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                      Pickup Address
                    </span>
                    <span className="font-semibold text-gray-900">{ride.pickup.address}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Navigation className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">
                      Drop Destination
                    </span>
                    <span className="font-semibold text-gray-900">{ride.drop.address}</span>
                  </div>
                </div>
              </div>

              {/* Fare & Distance stats */}
              <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-gray-100 text-center text-xs">
                <div>
                  <span className="text-gray-400 text-[10px] block">Distance</span>
                  <span className="font-bold text-gray-900">{ride.routeDistanceKm} km</span>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] block">Duration</span>
                  <span className="font-bold text-gray-900">~{ride.estimatedDurationMins} min</span>
                </div>
                <div>
                  <span className="text-gray-400 text-[10px] block">Total Fare</span>
                  <span className="font-bold text-emerald-700">₹{ride.fare.totalFare}</span>
                </div>
              </div>
            </div>

            {/* Trip Completed Rating & Review Box */}
            {ride.status === 'TRIP_COMPLETED' && (
              <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Rate Your Chauffeur Experience
                  </h4>
                  <span className="text-xs font-semibold text-emerald-700">
                    {ride.paymentStatus === 'PAID' ? '✓ Paid' : 'Payment Due'}
                  </span>
                </div>

                {!reviewSubmitted && !ride.rating ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2 py-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setRatingStars(s)}
                          className="p-1 text-2xl transition-transform hover:scale-110"
                        >
                          <span className={s <= ratingStars ? 'text-amber-400' : 'text-gray-300'}>
                            ★
                          </span>
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={reviewFeedback}
                      onChange={(e) => setReviewFeedback(e.target.value)}
                      placeholder="Share feedback on driving quality, cleanliness, AC, courtesy..."
                      className="w-full rounded-xl border border-gray-200 p-2.5 text-xs text-gray-900 focus:outline-emerald-600"
                      rows={2}
                    ></textarea>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleSubmitReview}
                        className="flex-1 py-2 rounded-xl bg-gray-900 text-white font-bold text-xs hover:bg-black"
                      >
                        Submit Driver Review
                      </button>
                      {ride.paymentStatus !== 'PAID' && (
                        <button
                          type="button"
                          onClick={() => setPaymentModalOpen(true)}
                          className="py-2 px-4 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700"
                        >
                          Pay ₹{ride.fare.totalFare}
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>
                      Thank you for reviewing {ride.driverName} ({ride.rating?.stars || ratingStars}★)!
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Simulated Driver Lifecycle Step Progression Bar (For rapid evaluation & testing) */}
            <div className="bg-slate-100 rounded-xl p-3 border border-slate-200 text-xs">
              <span className="font-bold text-gray-700 block mb-1">
                Simulation Controls (Step through ride status):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {ride.status === 'DRIVER_ASSIGNED' && (
                  <button
                    onClick={() => advanceRideStatus('DRIVER_ARRIVING')}
                    className="bg-emerald-600 text-white font-semibold px-2.5 py-1 rounded text-[11px]"
                  >
                    Simulate: Driver En Route →
                  </button>
                )}
                {ride.status === 'DRIVER_ARRIVING' && (
                  <button
                    onClick={() => advanceRideStatus('DRIVER_ARRIVED')}
                    className="bg-emerald-600 text-white font-semibold px-2.5 py-1 rounded text-[11px]"
                  >
                    Simulate: Driver Arrived at Pickup →
                  </button>
                )}
                {ride.status === 'DRIVER_ARRIVED' && (
                  <button
                    onClick={() => advanceRideStatus('TRIP_STARTED')}
                    className="bg-emerald-700 text-white font-semibold px-2.5 py-1 rounded text-[11px]"
                  >
                    Verify OTP {ride.otp} & Start Trip →
                  </button>
                )}
                {ride.status === 'TRIP_STARTED' && (
                  <button
                    onClick={() => advanceRideStatus('TRIP_COMPLETED')}
                    className="bg-slate-900 text-white font-semibold px-2.5 py-1 rounded text-[11px]"
                  >
                    Simulate: Arrived & Complete Trip →
                  </button>
                )}

                {/* Cancel option */}
                {!['TRIP_COMPLETED', 'CANCELLED'].includes(ride.status) && (
                  <button
                    onClick={() => setCancelModalOpen(true)}
                    className="text-rose-600 bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded text-[11px] font-semibold border border-rose-200"
                  >
                    Cancel Cab
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Live GPS Route Map & Driver Location (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping"></span>
                  <span className="text-xs font-bold text-gray-900">
                    Live GPS Telemetry & Chauffeur Navigation
                  </span>
                </div>
                <span className="text-[11px] text-gray-500 font-mono">
                  {ride.driverLiveLocation?.lat.toFixed(4)}, {ride.driverLiveLocation?.lng.toFixed(4)}
                </span>
              </div>

              {/* Map */}
              <DriveNowMap
                pickup={ride.pickup}
                drop={ride.drop}
                driverLocation={ride.driverLiveLocation}
                rideStatus={ride.status}
                height="560px"
                interactive={false}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Safety & SOS Modal */}
      <SafetyModal
        isOpen={safetyModalOpen}
        onClose={() => setSafetyModalOpen(false)}
        rideId={ride.id}
        driverName={ride.driverName}
        driverPhone={ride.driverPhone}
        vehicleRegNo={ride.vehicleRegNo}
      />

      {/* Payment Modal */}
      {ride && (
        <PaymentModal
          isOpen={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          ride={ride}
          onPaymentSuccess={() => {
            fetchRide();
          }}
        />
      )}

      {/* Cancel Confirmation Modal */}
      {cancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-100">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
              <XCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900">Cancel Cab Booking?</h3>
            <p className="text-xs text-gray-500 mt-1 mb-4">
              Your driver {ride.driverName} is already assigned. Please specify the reason for cancellation.
            </p>

            <select
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-xs text-gray-900 mb-4 bg-white"
            >
              <option value="Driver taking too long">Driver taking too long</option>
              <option value="Change of plans">Change of plans</option>
              <option value="Booked wrong vehicle category">Booked wrong vehicle category</option>
              <option value="Driver asked to pay extra">Driver asked to pay extra</option>
            </select>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCancelModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700"
              >
                Keep Booking
              </button>
              <button
                type="button"
                onClick={handleCancelRide}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
              >
                Yes, Cancel Cab
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
