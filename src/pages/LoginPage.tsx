import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Car, Lock, Mail, Shield, ArrowRight } from 'lucide-react';
import { FiUser } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  const { login } = useAuth();
  const [email, setEmail] = useState('rahul.sharma@example.com');
  const [password, setPassword] = useState('password123');
  const [role, setRole] = useState<UserRole>('CUSTOMER');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const ok = await login(email, password, role);
    setIsSubmitting(false);

    if (ok) {
      if (role === 'DRIVER') {
        navigate('/driver/dashboard');
      } else if (role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate(redirectPath);
      }
    }
  };

  const handleSelectPersona = (selectedRole: UserRole) => {
    setRole(selectedRole);
    if (selectedRole === 'CUSTOMER') {
      setEmail('rahul.sharma@example.com');
      setPassword('password123');
    } else if (selectedRole === 'DRIVER') {
      setEmail('rajesh.driver@drivenow.in');
      setPassword('driver123');
    } else if (selectedRole === 'ADMIN') {
      setEmail('admin@drivenow.in');
      setPassword('admin123');
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12 flex items-center justify-center px-4 sm:px-6">
      <div className="max-w-md w-full">
        {/* Brand */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md">
            <Car className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            Sign In to <span className="text-emerald-600">DriveNow</span>
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Access customer rides, driver dispatch, or fleet admin console
          </p>
        </div>

        {/* Quick Demo Credentials Box */}
        <div className="bg-white rounded-2xl p-4 mb-4 border border-gray-200 shadow-xs">
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2 text-center">
            One-Click Test Persona Login
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleSelectPersona('CUSTOMER')}
              className={`p-2 rounded-xl border text-xs font-semibold flex flex-col items-center transition-all ${
                role === 'CUSTOMER'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-500'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FiUser className="w-4 h-4 mb-1 text-emerald-600" />
              <span>Customer</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectPersona('DRIVER')}
              className={`p-2 rounded-xl border text-xs font-semibold flex flex-col items-center transition-all ${
                role === 'DRIVER'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-500'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Car className="w-4 h-4 mb-1 text-emerald-600" />
              <span>Driver</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectPersona('ADMIN')}
              className={`p-2 rounded-xl border text-xs font-semibold flex flex-col items-center transition-all ${
                role === 'ADMIN'
                  ? 'border-purple-600 bg-purple-50 text-purple-800 ring-1 ring-purple-500'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Shield className="w-4 h-4 mb-1 text-purple-600" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-emerald-600 text-gray-900"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-gray-700">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-gray-300 focus:outline-emerald-600 text-gray-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <span>{isSubmitting ? 'Verifying...' : `Sign In as ${role}`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-gray-100 text-center text-xs text-gray-500">
            Don't have a customer account?{' '}
            <Link to="/register" className="font-bold text-emerald-700 hover:text-emerald-800">
              Register Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
