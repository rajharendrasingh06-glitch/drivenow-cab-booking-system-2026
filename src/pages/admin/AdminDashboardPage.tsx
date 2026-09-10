import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Car,
  Users,
  IndianRupee,
  ShieldAlert,
  MapPin,
  TrendingUp,
  Search,
  Filter,
  Download,
  AlertCircle,
  CheckCircle2,
  Clock,
  Eye,
  Settings,
} from 'lucide-react';
import { FiUser } from 'react-icons/fi';
import { apiClient } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { INDIAN_CITIES } from '../../data/indianCities';
import { Vehicle, Ride, Driver } from '../../types';
import toast from 'react-hot-toast';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'fleet' | 'rides' | 'drivers' | 'safety' | 'cities'>('fleet');
  const [stats, setStats] = useState<any>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [rides, setRides] = useState<Ride[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [safetyAlerts, setSafetyAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fleet tab filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const fetchAdminData = async () => {
    try {
      const [statsRes, fleetRes, ridesRes, driversRes, safetyRes] = await Promise.all([
        apiClient.get('/admin/stats'),
        apiClient.get('/vehicles?limit=100'),
        apiClient.get('/admin/rides'),
        apiClient.get('/admin/drivers'),
        apiClient.get('/admin/safety-alerts'),
      ]);

      setStats(statsRes.data);
      setVehicles(fleetRes.data.vehicles || []);
      setRides(ridesRes.data.rides || []);
      setDrivers(driversRes.data.drivers || []);
      setSafetyAlerts(safetyRes.data.alerts || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'ADMIN') {
      navigate('/login?redirect=/admin/dashboard');
      return;
    }
    fetchAdminData();
  }, [user]);

  // Filter vehicles
  const filteredVehicles = vehicles.filter((v) => {
    if (selectedCity !== 'ALL' && v.city !== selectedCity) return false;
    if (selectedCategory !== 'ALL' && v.category !== selectedCategory) return false;
    if (selectedStatus !== 'ALL' && v.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        v.brand.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        v.registrationNumber.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const exportCSV = (type: string) => {
    let csvData = '';
    let filename = '';

    if (type === 'fleet') {
      csvData = 'ID,Brand,Model,Category,RegNumber,City,Status,Fuel\n';
      vehicles.forEach((v) => {
        csvData += `"${v.id}","${v.brand}","${v.model}","${v.category}","${v.registrationNumber}","${v.city}","${v.status}","${v.fuelType}"\n`;
      });
      filename = 'drivenow_fleet_400.csv';
    } else {
      csvData = 'ID,Customer,Driver,Vehicle,Amount,Status,Date\n';
      rides.forEach((r) => {
        csvData += `"${r.id}","${r.customerName}","${r.driverName}","${r.vehicleRegNo}","${r.fare.totalFare}","${r.status}","${r.requestedAt}"\n`;
      });
      filename = 'drivenow_rides.csv';
    }

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    toast.success(`Exported ${filename}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs font-semibold">Loading DriveNow Fleet Master Console...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 min-h-screen text-slate-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-slate-800/80 rounded-2xl p-6 border border-slate-700">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                Super Admin Console
              </span>
              <span className="text-xs text-slate-400">14 Metros • 400 Indian Commercial Cabs</span>
            </div>
            <h1 className="text-2xl font-black text-white mt-1">DriveNow Enterprise Central Dispatch</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportCSV('fleet')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Fleet CSV</span>
            </button>
            <button
              onClick={() => exportCSV('rides')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Trips CSV</span>
            </button>
          </div>
        </div>

        {/* 5 KPI Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
          <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
            <span className="text-[11px] text-slate-400 block">Total Vehicles</span>
            <div className="text-2xl font-black text-white mt-1">{stats?.totalFleet || 400}</div>
            <span className="text-[10px] text-emerald-400 mt-0.5 block">20 Indian Models x 20</span>
          </div>

          <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
            <span className="text-[11px] text-slate-400 block">Active Chauffeurs</span>
            <div className="text-2xl font-black text-emerald-400 mt-1">
              {stats?.activeDrivers || drivers.length}
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">Commercial Certified</span>
          </div>

          <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
            <span className="text-[11px] text-slate-400 block">Live Active Rides</span>
            <div className="text-2xl font-black text-blue-400 mt-1">
              {stats?.liveRides || rides.filter((r) => r.status !== 'TRIP_COMPLETED' && r.status !== 'CANCELLED').length}
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">On GPS Tracking</span>
          </div>

          <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
            <span className="text-[11px] text-slate-400 block">Total Gross Revenue</span>
            <div className="text-2xl font-black text-amber-400 flex items-center mt-1">
              <IndianRupee className="w-5 h-5 mr-0.5" />
              <span>{stats?.totalRevenue || 148500}</span>
            </div>
            <span className="text-[10px] text-slate-400 mt-0.5 block">incl. 5% GST</span>
          </div>

          <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 col-span-2 sm:col-span-1">
            <span className="text-[11px] text-slate-400 block">Safety SOS Events</span>
            <div className="text-2xl font-black text-rose-400 mt-1">{safetyAlerts.length}</div>
            <span className="text-[10px] text-rose-300 mt-0.5 block">112 Police Dispatched</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-700 pb-3 mb-6 overflow-x-auto">
          {[
            { id: 'fleet', label: 'Fleet Management (400)', icon: Car },
            { id: 'rides', label: 'Rides & Dispatch', icon: Clock },
            { id: 'drivers', label: 'Drivers Registry', icon: Users },
            { id: 'safety', label: 'SOS & Safety Logs', icon: ShieldAlert },
            { id: 'cities', label: 'City Operations', icon: MapPin },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: FLEET MANAGEMENT */}
        {activeTab === 'fleet' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter brand, model, reg no..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white focus:outline-purple-500"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="ALL">All Categories</option>
                <option value="Mini">Mini (Swift, WagonR)</option>
                <option value="Sedan">Sedan (Dzire, Aura, Amaze)</option>
                <option value="Prime">Prime (Baleno, City, Glanza)</option>
                <option value="SUV">SUV (Creta, Brezza, Nexon)</option>
              </select>

              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="ALL">All 14 Operational Cities</option>
                {INDIAN_CITIES.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="ALL">All Statuses</option>
                <option value="AVAILABLE">AVAILABLE</option>
                <option value="ON_TRIP">ON_TRIP</option>
                <option value="OFFLINE">OFFLINE</option>
              </select>
            </div>

            {/* Fleet Table */}
            <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-700">
                  <tr>
                    <th className="p-3.5">Vehicle</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Plate Number</th>
                    <th className="p-3.5">Base City</th>
                    <th className="p-3.5">Fuel & Specs</th>
                    <th className="p-3.5">Assigned Chauffeur</th>
                    <th className="p-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {filteredVehicles.slice(0, 30).map((v) => (
                    <tr key={v.id} className="hover:bg-slate-700/40 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={v.imageUrl}
                            alt={v.model}
                            referrerPolicy="no-referrer"
                            className="w-12 h-8 rounded object-cover bg-slate-900"
                          />
                          <div>
                            <span className="font-bold text-white block">{v.brand} {v.model}</span>
                            <span className="text-[10px] text-slate-400">{v.color} • {v.year}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-full bg-slate-700 text-slate-200 font-medium">
                          {v.category}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono font-bold text-amber-400">
                        {v.registrationNumber}
                      </td>
                      <td className="p-3.5 text-slate-300">{v.city}</td>
                      <td className="p-3.5 text-slate-400">
                        {v.fuelType} • {v.transmission} • {v.seatingCapacity} Seats
                      </td>
                      <td className="p-3.5 text-emerald-400 font-medium">
                        {v.assignedDriverName}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            v.status === 'AVAILABLE'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : v.status === 'ON_TRIP'
                              ? 'bg-blue-500/20 text-blue-400'
                              : 'bg-rose-500/20 text-rose-400'
                          }`}
                        >
                          {v.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-3 text-center text-xs text-slate-400 border-t border-slate-700">
                Showing {Math.min(30, filteredVehicles.length)} of {filteredVehicles.length} matched fleet units
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: RIDES & DISPATCH */}
        {activeTab === 'rides' && (
          <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-700">
                <tr>
                  <th className="p-3.5">Trip ID</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Chauffeur</th>
                  <th className="p-3.5">Route</th>
                  <th className="p-3.5">Fare</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {rides.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-700/40">
                    <td className="p-3.5 font-mono text-purple-400 font-bold">{r.id}</td>
                    <td className="p-3.5">
                      <div className="font-bold text-white">{r.customerName}</div>
                      <div className="text-[10px] text-slate-400">{r.customerPhone}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="text-emerald-400 font-medium">{r.driverName}</div>
                      <div className="text-[10px] text-slate-400">{r.vehicleRegNo}</div>
                    </td>
                    <td className="p-3.5 max-w-xs truncate text-slate-300">
                      {r.pickup.address} → {r.drop.address}
                    </td>
                    <td className="p-3.5 font-bold text-white">₹{r.fare.totalFare}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-700 text-slate-200">
                        {r.status}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="text-[11px] text-emerald-400 font-semibold">
                        {r.paymentStatus} ({r.paymentMethod})
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: DRIVERS REGISTRY */}
        {activeTab === 'drivers' && (
          <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-700">
                <tr>
                  <th className="p-3.5">Chauffeur</th>
                  <th className="p-3.5">City</th>
                  <th className="p-3.5">Commercial License</th>
                  <th className="p-3.5">Rating</th>
                  <th className="p-3.5">Completed Rides</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {drivers.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-700/40">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 border border-emerald-500/80 flex items-center justify-center text-emerald-400 shrink-0">
                          <FiUser className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                          <span className="font-bold text-white block">{d.name}</span>
                          <span className="text-[10px] text-slate-400">{d.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 text-slate-300">{d.city}</td>
                    <td className="p-3.5 font-mono text-amber-400">{d.licenseNumber}</td>
                    <td className="p-3.5 text-amber-400 font-bold">★ {d.rating}</td>
                    <td className="p-3.5 text-white font-medium">{d.completedRides}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          d.status === 'ONLINE'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-slate-700 text-slate-400'
                        }`}
                      >
                        {d.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 4: SOS & SAFETY LOGS */}
        {activeTab === 'safety' && (
          <div className="space-y-4">
            <div className="bg-rose-950/40 border border-rose-800/60 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldAlert className="w-6 h-6 text-rose-400" />
                <div>
                  <h4 className="text-sm font-bold text-white">Emergency Response Central Link</h4>
                  <p className="text-xs text-rose-200">
                    Direct integration with Indian Police 112 Command Centres across Maharashtra, Karnataka, Delhi-NCR, Tamil Nadu, and Telangana.
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-rose-300 bg-rose-900/60 px-3 py-1.5 rounded-lg border border-rose-700">
                24x7 Escort Active
              </span>
            </div>

            <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-700">
                  <tr>
                    <th className="p-3.5">Alert ID</th>
                    <th className="p-3.5">Trip ID</th>
                    <th className="p-3.5">Customer & Phone</th>
                    <th className="p-3.5">GPS Location</th>
                    <th className="p-3.5">Triggered Time</th>
                    <th className="p-3.5">Police 112 Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {safetyAlerts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        No active safety alarms in the last 24 hours. All trips safe and nominal.
                      </td>
                    </tr>
                  ) : (
                    safetyAlerts.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-700/40">
                        <td className="p-3.5 font-mono text-rose-400 font-bold">{a.id}</td>
                        <td className="p-3.5 font-mono text-purple-400">{a.rideId}</td>
                        <td className="p-3.5 text-white">{a.customerName}</td>
                        <td className="p-3.5 font-mono text-slate-300">
                          {a.coordinates?.lat}, {a.coordinates?.lng}
                        </td>
                        <td className="p-3.5 text-slate-400">{new Date(a.timestamp).toLocaleTimeString()}</td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400">
                            DISPATCHED
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: CITY OPERATIONS */}
        {activeTab === 'cities' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {INDIAN_CITIES.map((c) => (
              <div key={c.name} className="bg-slate-800 rounded-2xl p-5 border border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-bold text-white">{c.name}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {c.state}
                  </span>
                </div>
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Deployed Fleet</span>
                    <span className="font-bold text-white">{c.fleetCount} Cabs</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Central Hub Coords</span>
                    <span className="font-mono text-slate-400">
                      {c.centerLat}, {c.centerLng}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Major Landmarks</span>
                    <span className="text-slate-200">{c.landmarks.length} Active Nodes</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
