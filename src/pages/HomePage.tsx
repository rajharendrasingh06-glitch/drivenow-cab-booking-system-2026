import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  MapPin,
  Navigation,
  ShieldCheck,
  Clock,
  IndianRupee,
  Car,
  ChevronRight,
  Sparkles,
  Users,
  CheckCircle,
  PhoneCall,
  Search,
} from 'lucide-react';
import { INDIAN_CITIES } from '../data/indianCities';
import { CATEGORY_IMAGES } from '../data/carModels';
import { CabCategory, Vehicle } from '../types';
import { apiClient } from '../services/api';
import { CarCard } from '../components/CarCard';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCity, setSelectedCity] = useState('Mumbai');
  const [pickupAddress, setPickupAddress] = useState('Chhatrapati Shivaji International Airport T2');
  const [dropAddress, setDropAddress] = useState('Bandra Kurla Complex (BKC)');
  const [selectedCategory, setSelectedCategory] = useState<CabCategory>('Prime');
  const [featuredVehicles, setFeaturedVehicles] = useState<Vehicle[]>([]);

  // Update default pickup/drop when city changes
  useEffect(() => {
    const cityData = INDIAN_CITIES.find((c) => c.name === selectedCity);
    if (cityData && cityData.landmarks.length >= 2) {
      setPickupAddress(cityData.landmarks[0].name);
      setDropAddress(cityData.landmarks[1].name);
    }
  }, [selectedCity]);

  // Fetch sample fleet for the city
  useEffect(() => {
    apiClient
      .get(`/vehicles?city=${selectedCity}&limit=4`)
      .then(({ data }) => {
        setFeaturedVehicles(data.vehicles || []);
      })
      .catch(() => {});
  }, [selectedCity]);

  const handleStartBooking = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(
      `/book?city=${encodeURIComponent(selectedCity)}&pickup=${encodeURIComponent(
        pickupAddress
      )}&drop=${encodeURIComponent(dropAddress)}&category=${selectedCategory}`
    );
  };

  const categories: {
    type: CabCategory;
    title: string;
    rate: string;
    desc: string;
    models: string;
    seats: number;
    bg: string;
    image: string;
  }[] = [
    {
      type: 'Mini',
      title: 'DriveNow Mini',
      rate: '₹11.5 / km',
      desc: 'Affordable, agile compact hatchbacks for everyday urban commutes.',
      models: 'Swift, WagonR, Tiago, Grand i10, Kwid',
      seats: 4,
      bg: 'border-emerald-200 bg-emerald-50/40',
      image: CATEGORY_IMAGES['Mini'],
    },
    {
      type: 'Sedan',
      title: 'DriveNow Sedan',
      rate: '₹14.5 / km',
      desc: 'Comfortable sedans with generous legroom and spacious boot space for luggage.',
      models: 'Dzire, Aura, Amaze',
      seats: 4,
      bg: 'border-blue-200 bg-blue-50/40',
      image: CATEGORY_IMAGES['Sedan'],
    },
    {
      type: 'Prime',
      title: 'DriveNow Prime',
      rate: '₹16.5 / km',
      desc: 'Top-rated commercial chauffeurs in premium, quiet hatchbacks and sedans.',
      models: 'Baleno, City, Glanza, Altroz',
      seats: 4,
      bg: 'border-amber-200 bg-amber-50/40',
      image: CATEGORY_IMAGES['Prime'],
    },
    {
      type: 'SUV',
      title: 'DriveNow SUV',
      rate: '₹21.0 / km',
      desc: 'Spacious high-ground-clearance compact SUVs for family and airport trips.',
      models: 'Creta, Brezza, Nexon, Punch, Sonet, Triber',
      seats: 5,
      bg: 'border-orange-200 bg-orange-50/40',
      image: CATEGORY_IMAGES['SUV'],
    },
  ];

  return (
    <div className="bg-white min-h-screen text-gray-900">
      {/* Real-World Clarification Banner */}
      <div className="bg-emerald-900 text-emerald-100 px-4 py-2.5 text-center text-xs font-medium border-b border-emerald-800">
        <span className="font-bold text-white">Chauffeur-Driven Cab Service:</span> When you book a DriveNow cab, a verified professional commercial driver drives the vehicle. This is NOT a self-drive car rental service.
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-50 py-12 lg:py-20 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headings & Quick Booking Widget */}
            <div className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-4">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>India's Most Reliable On-Demand Cabs</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight leading-tight mb-4">
                Ride Smart Across 14 Indian Cities with <span className="text-emerald-600">DriveNow</span>
              </h1>
              <p className="text-base text-gray-600 mb-8 max-w-xl">
                400 modern chauffeur-driven cabs available 24x7 in Mumbai, Delhi NCR, Bengaluru, Pune, Hyderabad, Chennai, and more. Transparent distance pricing, live GPS tracking, and verified chauffeurs.
              </p>

              {/* Instant Booking Card */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Car className="w-4 h-4 text-emerald-600" />
                    <span>Book Your Chauffeur-Driven Cab</span>
                  </h3>
                  <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                    Instant Assignment
                  </span>
                </div>

                <form onSubmit={handleStartBooking} className="space-y-4">
                  {/* City Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Operating City
                    </label>
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 focus:outline-emerald-600 bg-white"
                    >
                      {INDIAN_CITIES.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name}, {c.state} ({c.fleetCount} Active Cabs)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Pickup & Drop Inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Pickup Location</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={pickupAddress}
                        onChange={(e) => setPickupAddress(e.target.value)}
                        placeholder="Airport, Railway station, Landmark, Office..."
                        className="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm text-gray-900 focus:outline-emerald-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1">
                        <Navigation className="w-3.5 h-3.5 text-rose-600" />
                        <span>Drop Destination</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={dropAddress}
                        onChange={(e) => setDropAddress(e.target.value)}
                        placeholder="Destination address, Hotel, Tech park..."
                        className="w-full rounded-xl border border-gray-300 px-3.5 py-2 text-sm text-gray-900 focus:outline-emerald-600"
                      />
                    </div>
                  </div>

                  {/* Category Radio Pills */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Select Cab Category
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(['Mini', 'Sedan', 'Prime', 'SUV'] as CabCategory[]).map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setSelectedCategory(cat)}
                          className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all text-center ${
                            selectedCategory === cat
                              ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
                              : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <div>{cat}</div>
                          <div className={`text-[10px] font-normal ${selectedCategory === cat ? 'text-emerald-100' : 'text-gray-500'}`}>
                            {cat === 'Mini' && 'From ₹11.5/km'}
                            {cat === 'Sedan' && 'From ₹14.5/km'}
                            {cat === 'Prime' && 'From ₹16.5/km'}
                            {cat === 'SUV' && 'From ₹21/km'}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submit CTA */}
                  <button
                    type="submit"
                    className="w-full mt-2 py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <span>Check Fare Estimate & Book Cab</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>

            {/* Right Column: Key Trust Metrics & Live Map Preview */}
            <div className="lg:col-span-5 space-y-6">
              <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-lg bg-white p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
                    <span className="text-xs font-bold text-gray-900">
                      Live Fleet in {selectedCity}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    24x7 Available
                  </span>
                </div>

                {/* City Hero Image */}
                <div className="relative h-56 rounded-xl overflow-hidden mb-4">
                  <img
                    src={
                      INDIAN_CITIES.find((c) => c.name === selectedCity)?.cityImage ||
                      'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=800&q=80'
                    }
                    alt={selectedCity}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-4 text-white">
                    <span className="text-xs font-medium text-emerald-300">
                      Operating in {selectedCity}
                    </span>
                    <h4 className="text-lg font-bold">
                      {INDIAN_CITIES.find((c) => c.name === selectedCity)?.landmarks[0]?.name || 'City Center'}
                    </h4>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-gray-100">
                  <div>
                    <div className="text-lg font-extrabold text-gray-900">400</div>
                    <div className="text-[11px] text-gray-500">Fleet Cabs</div>
                  </div>
                  <div>
                    <div className="text-lg font-extrabold text-emerald-600">4.8 ★</div>
                    <div className="text-[11px] text-gray-500">Driver Rating</div>
                  </div>
                  <div>
                    <div className="text-lg font-extrabold text-gray-900">&lt; 5m</div>
                    <div className="text-[11px] text-gray-500">Average Pickup</div>
                  </div>
                </div>
              </div>

              {/* Verified Safety Highlights */}
              <div className="rounded-xl border border-gray-200 bg-white p-4">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>The DriveNow Safety Guarantee</span>
                </h4>
                <ul className="space-y-2 text-xs text-gray-600">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Commercial background verification & police clearance for all drivers</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Mandatory 4-digit ride OTP verification before starting trip</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>One-touch 24x7 SOS emergency button integrated with Police 112</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Cab Categories Overview */}
      <section className="py-16 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
              Chauffeur-Driven Options
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mt-3">
              Transparent, Government GST-Compliant Indian Rates
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              No surge extortion. Calculated dynamically using standard base fare, actual distance, travel time, and 5% passenger transport GST.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((c) => (
              <div
                key={c.type}
                className={`rounded-2xl border p-5 flex flex-col justify-between transition-all hover:shadow-md ${c.bg}`}
              >
                <div>
                  <div className="relative h-36 w-full rounded-xl overflow-hidden mb-4 border border-gray-200/80 bg-white shadow-2xs">
                    <img
                      src={c.image}
                      alt={c.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] font-semibold text-white">
                      {c.type} Fleet
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-bold text-gray-900">{c.title}</h3>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white border text-gray-700">
                      {c.seats} Pax
                    </span>
                  </div>
                  <div className="text-xl font-extrabold text-emerald-700 mb-2">
                    {c.rate}
                  </div>
                  <p className="text-xs text-gray-600 mb-4 leading-relaxed">{c.desc}</p>
                  <div className="text-[11px] text-gray-500 border-t border-gray-200/60 pt-3">
                    <span className="font-semibold text-gray-700 block mb-1">
                      Models in this fleet:
                    </span>
                    <span>{c.models}</span>
                  </div>
                </div>

                <Link
                  to={`/book?category=${c.type}`}
                  className="mt-5 w-full py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold text-center block transition-colors shadow-xs"
                >
                  Book {c.type}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured 400 Indian Cars in Selected City */}
      {featuredVehicles.length > 0 && (
        <section className="py-16 bg-slate-50 border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-3 py-1 rounded-full">
                  Real 400-Vehicle Indian Fleet
                </span>
                <h2 className="text-2xl font-black text-gray-900 mt-2">
                  Active Vehicles in {selectedCity}
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Every cab displayed is an authentic Indian model with its assigned commercial driver.
                </p>
              </div>
              <Link
                to="/services"
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <span>Browse All 400 Vehicles</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredVehicles.map((vehicle) => (
                <CarCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  onSelect={() =>
                    navigate(
                      `/book?city=${encodeURIComponent(vehicle.city)}&category=${vehicle.category}`
                    )
                  }
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How It Works (Real Customer Flow) */}
      <section className="py-16 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900">
              Seamless 4-Step Booking Flow
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              No licence upload, no deposits, no vehicle inspection. Just book, board, and reach your destination safely.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 font-black text-lg flex items-center justify-center mx-auto mb-4">
                1
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1">Set Pickup & Drop</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Use your live GPS position or choose from popular Indian railway stations, airports, and city hubs.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 font-black text-lg flex items-center justify-center mx-auto mb-4">
                2
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1">Select Cab Category</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Pick from Mini, Sedan, Prime, or SUV. Review dynamic upfront fare estimate with transparent distance and tax details.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 font-black text-lg flex items-center justify-center mx-auto mb-4">
                3
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1">Driver Assigned & OTP</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Nearby driver is instantly assigned. Track live car movement on the map and share your 4-digit ride OTP upon boarding.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 font-black text-lg flex items-center justify-center mx-auto mb-4">
                4
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1">Pay via UPI & Review</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Complete trip payment seamlessly via Google Pay, PhonePe, Paytm, card, or cash. Rate driver and receive instant tax invoice.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
