import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../services/api';
import { Phone, Mail, ShieldCheck, Heart, Home, Briefcase, Save } from 'lucide-react';
import { FiUser } from 'react-icons/fi';
import toast from 'react-hot-toast';

export const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [emergencyName, setEmergencyName] = useState(user?.emergencyContact?.name || 'Pooja Sharma (Spouse)');
  const [emergencyPhone, setEmergencyPhone] = useState(user?.emergencyContact?.phone || '+91 98200 12345');
  const [emergencyRelation, setEmergencyRelation] = useState(user?.emergencyContact?.relation || 'Spouse');
  const [homeAddress, setHomeAddress] = useState(user?.savedPlaces?.home || 'Bandra West, Mumbai');
  const [workAddress, setWorkAddress] = useState(user?.savedPlaces?.work || 'One BKC, Bandra Kurla Complex, Mumbai');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const { data } = await apiClient.put('/auth/profile', {
        name,
        phone,
        emergencyContact: {
          name: emergencyName,
          phone: emergencyPhone,
          relation: emergencyRelation,
        },
        savedPlaces: {
          home: homeAddress,
          work: workAddress,
        },
      });

      updateUser(data.user);
      toast.success('Profile and emergency contacts updated!');
    } catch {
      toast.error('Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Clean text-based user profile overview */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0">
              <FiUser className="w-6 h-6 text-slate-700" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">{user?.name || 'Customer Account'}</h1>
              <p className="text-xs text-gray-500 font-medium">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize">
              {user?.role?.toLowerCase() || 'customer'} Account
            </span>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Personal Info Card */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs">
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FiUser className="w-4 h-4 text-emerald-600" />
              <span>Personal Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-xs text-gray-900 focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Mobile Number (+91)</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-xs text-gray-900 focus:outline-emerald-600"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 p-2.5 text-xs text-gray-500"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">
                  Email is verified and linked to your DriveNow customer account.
                </span>
              </div>
            </div>
          </div>

          {/* Emergency Contact Card (Key safety feature in India) */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-rose-600" />
                <span>Emergency Safety Contact (SOS Broadcast)</span>
              </h3>
              <span className="text-[11px] text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded">
                Active in SOS
              </span>
            </div>

            <p className="text-xs text-gray-500 mb-4">
              If you tap the emergency SOS button during a ride, this contact automatically receives an SMS with your driver's details, vehicle plate number, and live tracking GPS coordinates.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Contact Name</label>
                <input
                  type="text"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  placeholder="Parent, Spouse, Friend"
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-xs text-gray-900 focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Emergency Phone</label>
                <input
                  type="text"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-xs text-gray-900 focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Relationship</label>
                <input
                  type="text"
                  value={emergencyRelation}
                  onChange={(e) => setEmergencyRelation(e.target.value)}
                  placeholder="Spouse / Father / Colleague"
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-xs text-gray-900 focus:outline-emerald-600"
                />
              </div>
            </div>
          </div>

          {/* Saved Places */}
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs">
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Home className="w-4 h-4 text-emerald-600" />
              <span>Saved Frequent Destinations</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                  <Home className="w-3.5 h-3.5 text-gray-400" />
                  <span>Home Address</span>
                </label>
                <input
                  type="text"
                  value={homeAddress}
                  onChange={(e) => setHomeAddress(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-xs text-gray-900 focus:outline-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                  <span>Work / Office Address</span>
                </label>
                <input
                  type="text"
                  value={workAddress}
                  onChange={(e) => setWorkAddress(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 p-2.5 text-xs text-gray-900 focus:outline-emerald-600"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
