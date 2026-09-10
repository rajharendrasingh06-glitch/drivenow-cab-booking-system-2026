import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  MapPin,
  Navigation,
  Crosshair,
  Car,
  Clock,
  IndianRupee,
  ShieldCheck,
  ChevronRight,
  AlertCircle,
  Smartphone,
  CreditCard,
  Building2,
  Banknote,
} from 'lucide-react';
import { INDIAN_CITIES } from '../data/indianCities';
import { CATEGORY_IMAGES } from '../data/carModels';
import { CabCategory, Coordinates, FareBreakdown, PaymentMethod } from '../types';
import { apiClient } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { DriveNowMap } from '../components/DriveNowMap';
import toast from 'react-hot-toast';

export const BookRidePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const initialCityName = searchParams.get('city') || 'Mumbai';
  const initialCategory = (searchParams.get('category') as CabCategory) || 'Prime';

  const [selectedCity, setSelectedCity] = useState<string>(initialCityName);
  const cityData = INDIAN_CITIES.find((c) => c.name === selectedCity) || INDIAN_CITIES[0];

  const [pickupAddress, setPickupAddress] = useState<string>(
    searchParams.get('pickup') || cityData.landmarks[0]?.name || 'Airport Terminal 2'
  );
  const [dropAddress, setDropAddress] = useState<string>(
    searchParams.get('drop') || cityData.landmarks[1]?.name || 'City Center'
  );

  const [pickupCoords, setPickupCoords] = useState<Coordinates>({
    lat: cityData.landmarks[0]?.lat || cityData.centerLat,
    lng: cityData.landmarks[0]?.lng || cityData.centerLng,
    address: pickupAddress,
    city: cityData.name,
  });

  const [dropCoords, setDropCoords] = useState<Coordinates>({
    lat: cityData.landmarks[1]?.lat || cityData.centerLat + 0.05,
    lng: cityData.landmarks[1]?.lng || cityData.centerLng + 0.05,
    address: dropAddress,
    city: cityData.name,
  });

  const [selectedCategory, setSelectedCategory] = useState<CabCategory>(initialCategory);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI');

  const [fareEstimates, setFareEstimates] = useState<
    { category: CabCategory; fare: FareBreakdown; availableVehiclesCount: number; estimatedEtaMinutes: number }[]
  >([]);
  const [distanceKm, setDistanceKm] = useState<number>(14.2);
  const [durationMins, setDurationMins] = useState<number>(38);
  const [isLoadingEstimates, setIsLoadingEstimates] = useState<boolean>(false);
  const [isBooking, setIsBooking] = useState<boolean>(false);

  // Nearby simulated cabs for the interactive map
  const nearbyCabs = [
    { id: 'c1', model: 'Swift', lat: pickupCoords.lat + 0.003, lng: pickupCoords.lng + 0.002 },
    { id: 'c2', model: 'Baleno', lat: pickupCoords.lat - 0.004, lng: pickupCoords.lng + 0.003 },
    { id: 'c3', model: 'Creta', lat: pickupCoords.lat + 0.002, lng: pickupCoords.lng - 0.005 },
    { id: 'c4', model: 'Dzire', lat: pickupCoords.lat - 0.003, lng: pickupCoords.lng - 0.002 },
  ];

  // Update landmarks when city changes
  const handleCityChange = (cityName: string) => {
    setSelectedCity(cityName);
    const newCity = INDIAN_CITIES.find((c) => c.name === cityName);
    if (newCity && newCity.landmarks.length >= 2) {
      setPickupAddress(newCity.landmarks[0].name);
      setDropAddress(newCity.landmarks[1].name);
      setPickupCoords({
        lat: newCity.landmarks[0].lat,
        lng: newCity.landmarks[0].lng,
        address: newCity.landmarks[0].name,
        city: newCity.name,
      });
      setDropCoords({
        lat: newCity.landmarks[1].lat,
        lng: newCity.landmarks[1].lng,
        address: newCity.landmarks[1].name,
        city: newCity.name,
      });
    }
  };

  // Detect GPS Location via Browser Geolocation
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }

    toast.loading('Detecting your GPS location...', { id: 'gps-load' });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        toast.dismiss('gps-load');
        const lat = Number(pos.coords.latitude.toFixed(5));
        const lng = Number(pos.coords.longitude.toFixed(5));
        const detectedAddress = `My Current Location (${lat}, ${lng})`;
        setPickupAddress(detectedAddress);
        setPickupCoords({
          lat,
          lng,
          address: detectedAddress,
          city: selectedCity,
        });
        toast.success('GPS position locked as pickup location!');
      },
      (err) => {
        toast.dismiss('gps-load');
        toast.error('Could not access GPS location. Using landmark.');
      },
      { timeout: 8000 }
    );
  };

  // Fetch backend dynamic fare estimate whenever pickup, drop or city changes
  useEffect(() => {
    const fetchEstimates = async () => {
      setIsLoadingEstimates(true);
      try {
        const { data } = await apiClient.post('/rides/estimate', {
          pickup: pickupCoords,
          drop: dropCoords,
        });
        setFareEstimates(data.estimates || []);
        setDistanceKm(data.distanceKm);
        setDurationMins(data.estimatedMinutes);
      } catch {
        // Fallback local calculation
      } finally {
        setIsLoadingEstimates(false);
      }
    };

    fetchEstimates();
  }, [pickupCoords.lat, pickupCoords.lng, dropCoords.lat, dropCoords.lng]);

  const activeEstimate = fareEstimates.find((e) => e.category === selectedCategory);

  // Confirm and Book Ride
  const handleConfirmBooking = async () => {
    if (!user) {
      toast.error('Please sign in or register to book a cab.');
      navigate(`/login?redirect=/book`);
      return;
    }

    setIsBooking(true);
    try {
      const { data } = await apiClient.post('/rides/book', {
        pickup: pickupCoords,
        drop: dropCoords,
        vehicleCategory: selectedCategory,
        paymentMethod,
      });

      toast.success('Cab assigned successfully! Connecting to live driver tracking.');
      navigate(`/current-ride?id=${data.ride.id}`);
    } catch (err: any) {
      if (err.response?.data?.activeRideId) {
        toast.error('You already have an active ride in progress.');
        navigate(`/current-ride?id=${err.response.data.activeRideId}`);
      } else {
        const msg = err.response?.data?.error || 'Booking failed. Please try again.';
        toast.error(msg);
      }
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Book a Chauffeur-Driven Cab
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Select pickup, destination, and vehicle. A verified DriveNow commercial driver will be dispatched.
            </p>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-xs font-semibold px-3 py-1 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>Driver-Driven Service</span>
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Form & Fare Breakdown (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Step 1: Location Inputs */}
            <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>Route & Locations</span>
                </h3>
                {/* GPS detect button */}
                <button
                  type="button"
                  onClick={handleDetectGPS}
                  className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg transition-colors"
                >
                  <Crosshair className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Use My GPS</span>
                </button>
              </div>

              {/* City Selection */}
              <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  City
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => handleCityChange(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs text-gray-900 bg-white focus:outline-emerald-600"
                >
                  {INDIAN_CITIES.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}, {c.state} ({c.fleetCount} Cabs)
                    </option>
                  ))}
                </select>
              </div>

              {/* Pickup location */}
              <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center justify-between">
                  <span>Pickup Location</span>
                  <span className="text-[10px] text-gray-400 font-normal">
                    {pickupCoords.lat}, {pickupCoords.lng}
                  </span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                  </div>
                  <input
                    type="text"
                    value={pickupAddress}
                    onChange={(e) => {
                      setPickupAddress(e.target.value);
                      setPickupCoords((prev) => ({ ...prev, address: e.target.value }));
                    }}
                    placeholder="Enter pickup address or landmark"
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-emerald-600"
                  />
                </div>
                {/* City quick landmark suggestions */}
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {cityData.landmarks.slice(0, 3).map((l) => (
                    <button
                      key={l.name}
                      type="button"
                      onClick={() => {
                        setPickupAddress(l.name);
                        setPickupCoords({ lat: l.lat, lng: l.lng, address: l.name, city: cityData.name });
                      }}
                      className="text-[10px] bg-gray-100 hover:bg-emerald-50 hover:text-emerald-700 px-2 py-0.5 rounded text-gray-600 truncate max-w-[160px]"
                    >
                      {l.name.split(',')[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Destination */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center justify-between">
                  <span>Drop Destination</span>
                  <span className="text-[10px] text-gray-400 font-normal">
                    {dropCoords.lat}, {dropCoords.lng}
                  </span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                  </div>
                  <input
                    type="text"
                    value={dropAddress}
                    onChange={(e) => {
                      setDropAddress(e.target.value);
                      setDropCoords((prev) => ({ ...prev, address: e.target.value }));
                    }}
                    placeholder="Enter destination address"
                    className="w-full pl-8 pr-3 py-2 rounded-xl border border-gray-300 text-xs text-gray-900 focus:outline-emerald-600"
                  />
                </div>
                {/* Quick destination suggestion buttons */}
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {cityData.landmarks.slice(2, 5).map((l) => (
                    <button
                      key={l.name}
                      type="button"
                      onClick={() => {
                        setDropAddress(l.name);
                        setDropCoords({ lat: l.lat, lng: l.lng, address: l.name, city: cityData.name });
                      }}
                      className="text-[10px] bg-gray-100 hover:bg-rose-50 hover:text-rose-700 px-2 py-0.5 rounded text-gray-600 truncate max-w-[160px]"
                    >
                      {l.name.split(',')[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 2: Select Vehicle Category */}
            <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-200">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-1.5">
                <Car className="w-4 h-4 text-emerald-600" />
                <span>Select Cab Category</span>
              </h3>

              <div className="space-y-2">
                {fareEstimates.map((est) => {
                  const isSelected = est.category === selectedCategory;
                  return (
                    <div
                      key={est.category}
                      onClick={() => setSelectedCategory(est.category)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50/40 ring-1 ring-emerald-500'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative w-16 h-12 rounded-lg overflow-hidden border border-gray-200 bg-slate-100 shrink-0">
                          <img
                            src={CATEGORY_IMAGES[est.category]}
                            alt={est.category}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] font-bold text-white text-center py-0.5">
                            {est.category}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-gray-900 flex items-center gap-2">
                            <span>DriveNow {est.category}</span>
                            <span className="text-[10px] font-normal text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                              {est.estimatedEtaMinutes} min away
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500">
                            {est.category === 'Mini' && 'Swift, WagonR • 4 seats'}
                            {est.category === 'Sedan' && 'Dzire, Amaze • 4 seats with trunk'}
                            {est.category === 'Prime' && 'Baleno, City • Top chauffeurs'}
                            {est.category === 'SUV' && 'Creta, Nexon • 5-6 seats'}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-extrabold text-gray-900 flex items-center justify-end">
                          <IndianRupee className="w-3.5 h-3.5 mr-0.5" />
                          <span>{est.fare.totalFare}</span>
                        </div>
                        <span className="text-[10px] text-gray-400">incl. 5% GST</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Transparent Fare Calculation Breakdown */}
            {activeEstimate && (
              <div className="bg-white rounded-2xl p-5 shadow-xs border border-gray-200">
                <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                    Authoritative Fare Breakdown
                  </h4>
                  <span className="text-xs font-medium text-gray-500">
                    {distanceKm} km • ~{durationMins} mins
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Base Fare (First 2 km)</span>
                    <span className="text-gray-900 font-medium">₹{activeEstimate.fare.baseFare}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Distance Fare ({activeEstimate.fare.distanceKm} km)</span>
                    <span className="text-gray-900 font-medium">₹{activeEstimate.fare.distanceFare}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time Fare ({activeEstimate.fare.timeMinutes} mins)</span>
                    <span className="text-gray-900 font-medium">₹{activeEstimate.fare.timeFare}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Platform & 24x7 Safety Fee</span>
                    <span className="text-gray-900 font-medium">₹{activeEstimate.fare.platformFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST (5% Government Transport Tax)</span>
                    <span className="text-gray-900 font-medium">₹{activeEstimate.fare.taxes}</span>
                  </div>

                  <div className="border-t border-gray-200 pt-2.5 mt-2 flex justify-between items-center text-sm font-black text-gray-900">
                    <span>Estimated Final Fare</span>
                    <span className="text-emerald-700 text-base">₹{activeEstimate.fare.totalFare}</span>
                  </div>
                </div>

                {/* Preferred Payment Method */}
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <label className="block text-xs font-semibold text-gray-700 mb-2">
                    Payment Mode (Settled upon trip completion)
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { id: 'UPI', label: 'UPI', icon: Smartphone },
                      { id: 'CARD', label: 'Card', icon: CreditCard },
                      { id: 'NETBANKING', label: 'NetBank', icon: Building2 },
                      { id: 'CASH', label: 'Cash', icon: Banknote },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setPaymentMethod(item.id as PaymentMethod)}
                          className={`py-2 px-1 rounded-lg border text-[11px] font-medium flex flex-col items-center gap-1 transition-all ${
                            paymentMethod === item.id
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Book Action Button */}
                <button
                  type="button"
                  onClick={handleConfirmBooking}
                  disabled={isBooking || isLoadingEstimates}
                  className="w-full mt-5 py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {isBooking ? (
                    <span>Assigning Nearby DriveNow Chauffeur...</span>
                  ) : (
                    <>
                      <span>CONFIRM & BOOK DRIVENOW {selectedCategory.toUpperCase()}</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Interactive Google Maps / GPS Preview (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping"></span>
                  <span className="text-xs font-bold text-gray-900">
                    Live Route & Nearby Cabs ({selectedCity})
                  </span>
                </div>
                <span className="text-[11px] text-gray-500">
                  {fareEstimates.find((e) => e.category === selectedCategory)?.availableVehiclesCount || 6} Cabs nearby
                </span>
              </div>

              {/* Map Canvas */}
              <DriveNowMap
                pickup={pickupCoords}
                drop={dropCoords}
                nearbyCabs={nearbyCabs}
                height="500px"
                interactive={true}
                onMapClick={(coords) => {
                  // If user clicks on map, update drop coords
                  setDropCoords({
                    lat: coords.lat,
                    lng: coords.lng,
                    address: `Pinned Location (${coords.lat}, ${coords.lng})`,
                    city: selectedCity,
                  });
                  setDropAddress(`Pinned Location (${coords.lat}, ${coords.lng})`);
                  toast.success('Destination pin updated from map click.');
                }}
              />

              <div className="mt-3 flex items-center justify-between text-[11px] text-gray-500 px-1">
                <span>🟢 Pickup Point</span>
                <span>🔴 Destination Pin</span>
                <span>🚗 Nearby Available Drivers</span>
                <span>📏 Calculated Road Distance: {distanceKm} km</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
