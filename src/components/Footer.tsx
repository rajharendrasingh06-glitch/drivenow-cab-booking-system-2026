import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Shield, PhoneCall, Mail, MapPin, Heart, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-10">
          {/* Col 1: Brand & Mission */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                <Car className="w-6 h-6" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Drive<span className="text-emerald-500">Now</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm mb-4">
              India's premier chauffeur-driven on-demand cab booking platform. Operating an active fleet of 400 modern, verified commercial passenger vehicles across 14 major Indian metropolitan regions.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Chauffeur-Driven Only • Certified Commercial Drivers</span>
            </div>
          </div>

          {/* Col 2: Services */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Ride Categories
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/book?cat=Mini" className="hover:text-emerald-400 transition-colors">
                  DriveNow Mini (Swift, WagonR)
                </Link>
              </li>
              <li>
                <Link to="/book?cat=Sedan" className="hover:text-emerald-400 transition-colors">
                  DriveNow Sedan (Dzire, Aura, Amaze)
                </Link>
              </li>
              <li>
                <Link to="/book?cat=Prime" className="hover:text-emerald-400 transition-colors">
                  DriveNow Prime (Baleno, City, Glanza)
                </Link>
              </li>
              <li>
                <Link to="/book?cat=SUV" className="hover:text-emerald-400 transition-colors">
                  DriveNow SUV (Creta, Brezza, Nexon)
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-emerald-400 transition-colors">
                  Airport Drops & Pickups
                </Link>
              </li>
              <li>
                <Link to="/services" className="hover:text-emerald-400 transition-colors">
                  Outstation & Intercity Rides
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Operational Cities */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Active Cities
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>Mumbai & Navi Mumbai</li>
              <li>Delhi NCR & Gurugram</li>
              <li>Bengaluru (Bangalore)</li>
              <li>Pune & Hyderabad</li>
              <li>Chennai & Ahmedabad</li>
              <li>Jaipur & Kolkata</li>
              <li>Goa & Thane</li>
            </ul>
          </div>

          {/* Col 4: Safety & Support */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              24x7 Safety & Help
            </h4>
            <div className="space-y-3 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <PhoneCall className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-white font-semibold block">Toll-Free Control Room</span>
                  <a href="tel:18002008899" className="hover:text-emerald-400">1800-200-8899</a>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-white font-semibold block">Support Desk</span>
                  <a href="mailto:support@drivenow.in" className="hover:text-emerald-400">support@drivenow.in</a>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-white font-semibold block">Police Integration</span>
                  <span>Emergency SOS connected to 112</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 mt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} DriveNow India Technologies Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Powered by Razorpay & Google Maps Platform</span>
            <span>•</span>
            <Link to="/about" className="hover:text-slate-400">Privacy Policy</Link>
            <span>•</span>
            <Link to="/about" className="hover:text-slate-400">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
