import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { HomePage } from './pages/HomePage';
import { BookRidePage } from './pages/BookRidePage';
import { CurrentRidePage } from './pages/CurrentRidePage';
import { MyRidesPage } from './pages/MyRidesPage';
import { ServicesPage } from './pages/ServicesPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { HelpSupportPage } from './pages/HelpSupportPage';
import { AboutPage } from './pages/AboutPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { DriverDashboardPage } from './pages/driver/DriverDashboardPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';

const AppLayout: React.FC = () => {
  const location = useLocation();

  // Hide public navbar and footer on dedicated driver or admin operational consoles
  const isDriverOrAdmin =
    location.pathname.startsWith('/driver') || location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-gray-900 font-sans antialiased selection:bg-emerald-500 selection:text-white">
      {!isDriverOrAdmin && <Navbar />}
      <main className="flex-grow">
        <Routes>
          {/* Public & Customer Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/book" element={<BookRidePage />} />
          <Route path="/current-ride" element={<CurrentRidePage />} />
          <Route path="/my-rides" element={<MyRidesPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/fleet" element={<ServicesPage />} />
          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/help" element={<HelpSupportPage />} />
          <Route path="/about" element={<AboutPage />} />

          {/* Authentication Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Specialized Portals */}
          <Route path="/driver/dashboard" element={<DriverDashboardPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        </Routes>
      </main>
      {!isDriverOrAdmin && <Footer />}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#0f172a',
              color: '#f8fafc',
              fontSize: '12px',
              borderRadius: '12px',
              border: '1px solid #334155',
            },
          }}
        />
        <AppLayout />
      </BrowserRouter>
    </AuthProvider>
  );
}
