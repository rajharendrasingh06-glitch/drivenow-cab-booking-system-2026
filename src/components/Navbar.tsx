import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Car, Bell, Menu, X, Shield, LogOut, ChevronDown, PhoneCall, LayoutDashboard, Navigation2 } from 'lucide-react';
import { FiUser } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/api';
import { Ride } from '../types';

export const Navbar: React.FC = () => {
  const { user, logout, switchDemoRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeRide, setActiveRide] = useState<Ride | null>(null);

  useEffect(() => {
    if (user && user.role === 'CUSTOMER') {
      // Check active ride
      apiClient.get('/rides/active').then(({ data }) => {
        setActiveRide(data.ride);
      }).catch(() => {});

      // Check notifications
      apiClient.get('/notifications').then(({ data }) => {
        const unread = (data.notifications || []).filter((n: any) => !n.read).length;
        setUnreadCount(unread);
      }).catch(() => {});
    }
  }, [user, location.pathname]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200">
      {/* Top emergency & trust bar */}
      <div className="bg-slate-900 text-slate-300 text-[11px] py-1 px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-emerald-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            DriveNow 400-Cab Fleet Active Across 14 Indian Cities
          </span>
          <span className="hidden md:inline text-slate-400">|</span>
          <span className="hidden md:inline text-slate-400">
            100% Chauffeur-Driven • Zero Self-Drive
          </span>
        </div>
        <div className="flex items-center gap-4">
          <a href="tel:18002008899" className="flex items-center gap-1 hover:text-white transition-colors">
            <PhoneCall className="w-3 h-3 text-emerald-400" />
            <span>24x7 Safety Helpline: 1800-200-8899</span>
          </a>
          {/* Persona Switcher for demonstration testing */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-800 px-2 py-0.5 rounded text-[10px] text-slate-200">
            <span className="text-slate-400">Quick Portal:</span>
            <button
              onClick={() => switchDemoRole('CUSTOMER')}
              className={`hover:text-emerald-400 ${user?.role === 'CUSTOMER' ? 'font-bold text-emerald-400' : ''}`}
            >
              Rider
            </button>
            <span>•</span>
            <button
              onClick={() => {
                switchDemoRole('DRIVER');
                navigate('/driver/dashboard');
              }}
              className={`hover:text-emerald-400 ${user?.role === 'DRIVER' ? 'font-bold text-emerald-400' : ''}`}
            >
              Driver
            </button>
            <span>•</span>
            <button
              onClick={() => {
                switchDemoRole('ADMIN');
                navigate('/admin/dashboard');
              }}
              className={`hover:text-emerald-400 ${user?.role === 'ADMIN' ? 'font-bold text-emerald-400' : ''}`}
            >
              Admin
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-gray-900">
                Drive<span className="text-emerald-600">Now</span>
              </span>
              <span className="block text-[9px] font-semibold tracking-wider uppercase text-gray-700">
                India's Trusted Cabs
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link
              to="/"
              className={`transition-colors ${
                isActive('/') ? 'text-emerald-600 font-semibold' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Home
            </Link>

            <Link
              to="/book"
              className={`flex items-center gap-1 transition-colors ${
                isActive('/book') ? 'text-emerald-600 font-semibold' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Navigation2 className="w-4 h-4 text-emerald-600" />
              <span>Book a Ride</span>
            </Link>

            {/* Active Ride Badge Link */}
            {activeRide && (
              <Link
                to="/current-ride"
                className="flex items-center gap-1.5 bg-emerald-100 text-emerald-900 font-semibold px-2.5 py-1 rounded-full text-xs border border-emerald-300 animate-pulse"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                <span>Ride In Progress</span>
              </Link>
            )}

            <Link
              to="/services"
              className={`transition-colors ${
                isActive('/services') ? 'text-emerald-600 font-semibold' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Services & Fleet
            </Link>

            <Link
              to="/about"
              className={`transition-colors ${
                isActive('/about') ? 'text-emerald-600 font-semibold' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              About Us
            </Link>

            <Link
              to="/help"
              className={`transition-colors ${
                isActive('/help') ? 'text-emerald-600 font-semibold' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Support
            </Link>

            {/* Driver Dashboard Link for Drivers */}
            {user?.role === 'DRIVER' && (
              <Link
                to="/driver/dashboard"
                className="flex items-center gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-lg text-xs font-semibold"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Driver Panel</span>
              </Link>
            )}

            {/* Admin Dashboard Link for Admins */}
            {user?.role === 'ADMIN' && (
              <Link
                to="/admin/dashboard"
                className="flex items-center gap-1 text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1 rounded-lg text-xs font-semibold"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin Console</span>
              </Link>
            )}
          </nav>

          {/* User Profile / Notifications / Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                {/* Notifications icon */}
                <Link
                  to="/notifications"
                  className="relative p-2 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Link>

                {/* Profile dropdown trigger */}
                <div className="relative group">
                  <button
                    type="button"
                    aria-label="User profile menu"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors bg-white shadow-2xs"
                  >
                    <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700 shrink-0">
                      <FiUser className="w-3.5 h-3.5 text-gray-700" />
                    </div>
                    <div className="text-left leading-tight hidden lg:block">
                      <span className="text-xs font-bold text-gray-900 block max-w-[120px] truncate">
                        {user.name}
                      </span>
                      <span className="text-[10px] text-emerald-700 font-semibold capitalize block">
                        {user.role.toLowerCase()}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  </button>

                  {/* Dropdown Menu */}
                  <div className="absolute right-0 top-full mt-1.5 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 hidden group-hover:block transition-all z-50">
                    <div className="px-4 py-2.5 border-b border-gray-100 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-700 shrink-0">
                        <FiUser className="w-4 h-4 text-gray-700" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate">{user.name}</p>
                        <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                      </div>
                    </div>

                    {user.role === 'CUSTOMER' && (
                      <>
                        <Link
                          to="/current-ride"
                          className="block px-4 py-2 text-xs text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"
                        >
                          Current Ride
                        </Link>
                        <Link
                          to="/my-rides"
                          className="block px-4 py-2 text-xs text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"
                        >
                          My Rides History
                        </Link>
                        <Link
                          to="/payments"
                          className="block px-4 py-2 text-xs text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"
                        >
                          Payments & Invoices
                        </Link>
                      </>
                    )}

                    {user.role === 'DRIVER' && (
                      <Link
                        to="/driver/dashboard"
                        className="block px-4 py-2 text-xs text-emerald-700 font-semibold hover:bg-emerald-50"
                      >
                        Driver Dashboard
                      </Link>
                    )}

                    {user.role === 'ADMIN' && (
                      <Link
                        to="/admin/dashboard"
                        className="block px-4 py-2 text-xs text-purple-700 font-semibold hover:bg-purple-50"
                      >
                        Admin Dashboard
                      </Link>
                    )}

                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-xs text-gray-700 hover:bg-gray-50"
                    >
                      My Profile
                    </Link>

                    <div className="border-t border-gray-100 my-1"></div>

                    <button
                      onClick={logout}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold text-gray-700 hover:text-gray-900 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center gap-2">
            {activeRide && (
              <Link
                to="/current-ride"
                className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"
                title="Active Ride"
              ></Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-gray-800"
          >
            Home
          </Link>
          <Link
            to="/book"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-emerald-700 font-semibold"
          >
            Book a Ride
          </Link>
          {activeRide && (
            <Link
              to="/current-ride"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-emerald-600"
            >
              Current Active Ride
            </Link>
          )}
          <Link
            to="/my-rides"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-gray-800"
          >
            My Rides
          </Link>
          <Link
            to="/services"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-gray-800"
          >
            Services & Fleet (400 Cars)
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-gray-800"
          >
            About Us
          </Link>
          <Link
            to="/help"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-gray-800"
          >
            Help & 24x7 Support
          </Link>

          <div className="border-t border-gray-100 pt-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Role Switcher
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  switchDemoRole('CUSTOMER');
                  setMobileMenuOpen(false);
                }}
                className="flex-1 py-1.5 rounded-lg border text-xs font-semibold text-gray-700 bg-gray-50"
              >
                Rider
              </button>
              <button
                onClick={() => {
                  switchDemoRole('DRIVER');
                  setMobileMenuOpen(false);
                  navigate('/driver/dashboard');
                }}
                className="flex-1 py-1.5 rounded-lg border text-xs font-semibold text-emerald-800 bg-emerald-50"
              >
                Driver
              </button>
              <button
                onClick={() => {
                  switchDemoRole('ADMIN');
                  setMobileMenuOpen(false);
                  navigate('/admin/dashboard');
                }}
                className="flex-1 py-1.5 rounded-lg border text-xs font-semibold text-purple-800 bg-purple-50"
              >
                Admin
              </button>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-3">
            {user ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 mb-2 p-2.5 bg-gray-50 rounded-xl border border-gray-200/70">
                  <div className="w-8 h-8 rounded-lg bg-gray-200/80 flex items-center justify-center text-gray-700 shrink-0">
                    <FiUser className="w-4 h-4 text-gray-700" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-gray-900 block truncate">{user.name}</span>
                    <span className="text-[10px] text-gray-500 block truncate">{user.email}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-2 text-xs font-semibold text-rose-600 bg-rose-50 rounded-lg"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-xs font-semibold text-gray-700 border border-gray-200 rounded-lg"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 text-center py-2 text-xs font-semibold text-white bg-emerald-600 rounded-lg"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
