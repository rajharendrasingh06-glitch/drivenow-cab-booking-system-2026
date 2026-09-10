import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Car, IndianRupee, ShieldAlert, Clock } from 'lucide-react';
import { apiClient } from '../services/api';
import { NotificationItem } from '../types';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchNotifs = async () => {
    try {
      const { data } = await apiClient.get('/notifications');
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleMarkAllAsRead = async () => {
    try {
      await apiClient.post('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success('All notifications marked as read.');
    } catch {
      toast.error('Failed to mark notifications.');
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'RIDE':
        return <Car className="w-4 h-4 text-emerald-600" />;
      case 'PAYMENT':
        return <IndianRupee className="w-4 h-4 text-blue-600" />;
      case 'SAFETY':
        return <ShieldAlert className="w-4 h-4 text-rose-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Notifications</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Live alerts about chauffeur arrivals, ride updates, and payments.
            </p>
          </div>
          {notifications.some((n) => !n.read) && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark All as Read</span>
            </button>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-gray-400">Loading alerts...</div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-gray-700">No notifications yet</p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Ride updates and driver arrival alerts will be shown here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 flex items-start gap-3 transition-colors ${
                    notif.read ? 'bg-white' : 'bg-emerald-50/30'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-gray-900">{notif.title}</h4>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap">
                        {new Date(notif.createdAt).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">{notif.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
