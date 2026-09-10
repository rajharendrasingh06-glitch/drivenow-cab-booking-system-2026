import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Filter, Car, IndianRupee, ShieldCheck, Fuel, Users, Gauge, ChevronRight } from 'lucide-react';
import { apiClient } from '../services/api';
import { CabCategory, Vehicle } from '../types';
import { INDIAN_CITIES } from '../data/indianCities';
import { CarCard } from '../components/CarCard';

export const ServicesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [totalCount, setTotalCount] = useState<number>(400);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<any>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>(searchParams.get('cat') || 'ALL');
  const [cityFilter, setCityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const fetchVehicles = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (categoryFilter !== 'ALL') params.append('category', categoryFilter);
      if (cityFilter !== 'ALL') params.append('city', cityFilter);
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      params.append('page', String(page));
      params.append('limit', '24');

      const { data } = await apiClient.get(`/vehicles?${params.toString()}`);
      setVehicles(data.vehicles || []);
      setTotalCount(data.totalCount || 400);
      setTotalPages(data.totalPages || 1);
      setStats(data.stats);
    } catch (err) {
      console.error('Failed to load fleet vehicles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, [categoryFilter, cityFilter, statusFilter, searchQuery, page]);

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Exact 400 Commercial Indian Vehicles</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
            DriveNow Chauffeur-Driven Fleet Catalog
          </h1>
          <p className="text-sm text-gray-600 mt-2">
            Every vehicle is an authentic Indian passenger model driven exclusively by a verified DriveNow commercial chauffeur. Zero self-drive rentals.
          </p>
        </div>

        {/* Fleet Stat Summary Badges */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-4 border border-gray-200 text-center shadow-xs">
              <span className="text-xs text-gray-500 font-medium block">Total Active Fleet</span>
              <span className="text-2xl font-black text-gray-900">{stats.total} Cabs</span>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-200 text-center shadow-xs">
              <span className="text-xs text-gray-500 font-medium block">Mini Category</span>
              <span className="text-2xl font-black text-emerald-600">{stats.mini} Cabs</span>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-200 text-center shadow-xs">
              <span className="text-xs text-gray-500 font-medium block">Sedan & Prime</span>
              <span className="text-2xl font-black text-blue-600">{stats.sedan + stats.prime} Cabs</span>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-200 text-center shadow-xs">
              <span className="text-xs text-gray-500 font-medium block">SUV Fleet</span>
              <span className="text-2xl font-black text-orange-600">{stats.suv} Cabs</span>
            </div>
          </div>
        )}

        {/* Filters Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-gray-200 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search Swift, Creta, Nexon, MH 02..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-emerald-600"
              />
            </div>

            {/* Category */}
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full py-2 px-3 text-xs rounded-xl border border-gray-300 focus:outline-emerald-600 bg-white"
              >
                <option value="ALL">All Categories (Mini, Sedan, Prime, SUV)</option>
                <option value="Mini">Mini (₹11.5/km - Swift, WagonR)</option>
                <option value="Sedan">Sedan (₹14.5/km - Dzire, Aura, Amaze)</option>
                <option value="Prime">Prime (₹16.5/km - Baleno, City, Glanza)</option>
                <option value="SUV">SUV (₹21.0/km - Creta, Brezza, Nexon)</option>
              </select>
            </div>

            {/* City */}
            <div>
              <select
                value={cityFilter}
                onChange={(e) => {
                  setCityFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full py-2 px-3 text-xs rounded-xl border border-gray-300 focus:outline-emerald-600 bg-white"
              >
                <option value="ALL">All 14 Operational Cities</option>
                {INDIAN_CITIES.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name} ({c.fleetCount} Vehicles)
                  </option>
                ))}
              </select>
            </div>

            {/* Availability */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full py-2 px-3 text-xs rounded-xl border border-gray-300 focus:outline-emerald-600 bg-white"
              >
                <option value="ALL">All Statuses</option>
                <option value="AVAILABLE">Available for Booking</option>
                <option value="ON_TRIP">Currently On Trip</option>
                <option value="OFFLINE">Offline</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-64 bg-white rounded-2xl animate-pulse border border-gray-200"></div>
            ))}
          </div>
        ) : vehicles.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
            <Car className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-900">No vehicles match your filter</h3>
            <p className="text-xs text-gray-500 mt-1 mb-4">
              Try clearing filters or searching for another Indian model.
            </p>
            <button
              onClick={() => {
                setCategoryFilter('ALL');
                setCityFilter('ALL');
                setStatusFilter('ALL');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {vehicles.map((vehicle) => (
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-10 border-t border-gray-200 pt-6">
                <span className="text-xs text-gray-500">
                  Showing {(page - 1) * 24 + 1} to {Math.min(page * 24, totalCount)} of {totalCount} vehicles
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-3 py-1.5 rounded-lg border text-xs font-semibold disabled:opacity-40 bg-white"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1.5 text-xs font-bold text-gray-700">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="px-3 py-1.5 rounded-lg border text-xs font-semibold disabled:opacity-40 bg-white"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
