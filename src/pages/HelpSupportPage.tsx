import React, { useState } from 'react';
import { PhoneCall, Mail, ShieldAlert, HelpCircle, ChevronDown, ChevronUp, MessageSquare, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const HelpSupportPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');

  const faqs = [
    {
      q: 'Is DriveNow a self-drive rental or a chauffeur cab service?',
      a: 'DriveNow is strictly a 100% chauffeur-driven cab booking platform, similar to Ola and Uber in India. When you book a cab, a verified DriveNow professional commercial driver drives the vehicle. Customers are never asked for a driving licence or security deposits.',
    },
    {
      q: 'How does the 4-digit ride OTP work?',
      a: 'Whenever you book a cab and a driver is assigned, your screen displays a secure 4-digit OTP. When the cab arrives, board the vehicle and share this code with the driver. The driver verifies this on their device to begin your trip.',
    },
    {
      q: 'How is the fare calculated and does it include GST?',
      a: 'All fares are calculated dynamically using: Base Fare + Distance Rate (per km) + Time Rate (per min) + DriveNow Platform Fee + 5% Indian Passenger Transport GST. The fare displayed upon booking is comprehensive, with zero hidden surcharges.',
    },
    {
      q: 'What payment methods can I use?',
      a: 'We support all major Indian digital payment modes via Razorpay, including UPI (Google Pay, PhonePe, Paytm, BHIM), RuPay, Visa & Mastercard debit/credit cards, Net Banking across 50+ Indian banks, as well as Cash directly to the driver.',
    },
    {
      q: 'What emergency safety features are available during my ride?',
      a: 'Every ride features a 24x7 Emergency SOS button. Tapping it instantly dispatches your live GPS coordinates to Police Control Room (112), DriveNow Safety Central HQ, and your designated emergency contact. You can also share your live trip tracking link with family in one click.',
    },
  ];

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketMessage.trim()) return;
    toast.success('Support ticket submitted! Ticket ID: TKT-' + Math.floor(10000 + Math.random() * 90000) + '. Our safety team will respond within 15 minutes.');
    setTicketSubject('');
    setTicketMessage('');
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-3 py-1 rounded-full">
            Customer Care & Safety Desk
          </span>
          <h1 className="text-3xl font-black text-gray-900 mt-3 tracking-tight">
            How Can We Assist Your Journey?
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            24x7 helpline, safety escorts, lost & found assistance, and ticket resolution.
          </p>
        </div>

        {/* 3 Quick Help Channels */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs text-center">
            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
              <PhoneCall className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-gray-900">24x7 Toll-Free Helpline</h3>
            <p className="text-xs text-gray-500 mt-1 mb-3">Toll-free customer support</p>
            <a
              href="tel:18002008899"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg inline-block"
            >
              1800-200-8899
            </a>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs text-center">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-gray-900">Emergency Police SOS</h3>
            <p className="text-xs text-gray-500 mt-1 mb-3">Direct link to 112 control room</p>
            <a
              href="tel:112"
              className="text-xs font-bold text-rose-700 hover:text-rose-800 bg-rose-50 px-3 py-1.5 rounded-lg inline-block"
            >
              Dial 112 (India)
            </a>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs text-center">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-gray-900">Email Support</h3>
            <p className="text-xs text-gray-500 mt-1 mb-3">Queries, billing & lost property</p>
            <a
              href="mailto:support@drivenow.in"
              className="text-xs font-bold text-blue-700 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg inline-block"
            >
              support@drivenow.in
            </a>
          </div>
        </div>

        {/* FAQs */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs mb-10">
          <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-emerald-600" />
            <span>Frequently Asked Questions</span>
          </h2>

          <div className="divide-y divide-gray-100">
            {faqs.map((faq, idx) => (
              <div key={idx} className="py-3.5">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between text-left text-xs font-bold text-gray-900 hover:text-emerald-700 transition-colors"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                  )}
                </button>
                {openFaq === idx && (
                  <p className="text-xs text-gray-600 mt-2 leading-relaxed pl-1">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Raise a Support Ticket Form */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs">
          <h2 className="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-600" />
            <span>Raise a Support or Safety Ticket</span>
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            Report an issue regarding a completed trip, lost belongings, or driver behavior.
          </p>

          <form onSubmit={handleSubmitTicket} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Subject / Issue Type</label>
              <input
                type="text"
                required
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                placeholder="E.g. Item left in cab, Fare inquiry, Driver feedback..."
                className="w-full rounded-xl border border-gray-300 p-2.5 text-xs text-gray-900 focus:outline-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Detailed Description</label>
              <textarea
                required
                rows={3}
                value={ticketMessage}
                onChange={(e) => setTicketMessage(e.target.value)}
                placeholder="Provide relevant trip ID, date, vehicle registration number, and details..."
                className="w-full rounded-xl border border-gray-300 p-2.5 text-xs text-gray-900 focus:outline-emerald-600"
              ></textarea>
            </div>

            <button
              type="submit"
              className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all"
            >
              Submit Ticket to DriveNow Support
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
