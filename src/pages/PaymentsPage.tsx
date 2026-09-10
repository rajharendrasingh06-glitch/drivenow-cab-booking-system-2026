import React, { useState, useEffect } from 'react';
import { IndianRupee, Download, CheckCircle2, AlertCircle, FileText, Smartphone, CreditCard, ShieldCheck } from 'lucide-react';
import { apiClient } from '../services/api';
import { PaymentRecord } from '../types';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export const PaymentsPage: React.FC = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [gatewayStatus, setGatewayStatus] = useState<any>(null);

  useEffect(() => {
    apiClient.get('/payments/config').then(({ data }) => setGatewayStatus(data)).catch(() => {});
    apiClient
      .get('/payments/history')
      .then(({ data }) => setPayments(data.payments || []))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleDownloadInvoice = (pay: PaymentRecord) => {
    const invoiceContent = `=====================================================
DRIVENOW INDIA TECHNOLOGIES PVT. LTD.
TAX INVOICE / CASH RECEIPT (GST COMPLIANT)
=====================================================
Invoice No: ${pay.invoiceNumber}
Date: ${new Date(pay.createdAt).toLocaleDateString('en-IN')}
Trip ID: ${pay.rideId}
Payment Ref: ${pay.razorpayPaymentId}
Payment Mode: ${pay.method}

Billed To:
Customer: ${pay.customerName}
Driver Assigned: ${pay.driverName || 'Verified Driver'}

-----------------------------------------------------
Item Description                       Amount (INR)
-----------------------------------------------------
Chauffeur-Driven Passenger Transport    Rs. ${(pay.amount / 1.05).toFixed(2)}
GST (5% Government Transport Tax)      Rs. ${(pay.amount - pay.amount / 1.05).toFixed(2)}
-----------------------------------------------------
TOTAL AMOUNT PAID                      Rs. ${pay.amount}.00
=====================================================
Thank you for riding safely with DriveNow.
Helpline: 1800-200-8899 | Email: support@drivenow.in
`;

    const blob = new Blob([invoiceContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${pay.invoiceNumber}.txt`;
    link.click();
    toast.success(`Invoice ${pay.invoiceNumber} downloaded.`);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Payments & Invoices</h1>
          <p className="text-xs text-gray-500 mt-1">
            View transaction history, payment statuses, and download official Indian GST invoices.
          </p>
        </div>

        {/* Razorpay Gateway Status */}
        {gatewayStatus && (
          <div className="rounded-2xl bg-white border border-gray-200 p-4 shadow-xs mb-6 flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-gray-900 block">
                  Payment Gateway: {gatewayStatus.configured ? 'Razorpay Live' : 'DriveNow Sandboxed Simulator'}
                </span>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {gatewayStatus.notice}
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full shrink-0">
              UPI • RuPay • Cards
            </span>
          </div>
        )}

        {/* Transactions List */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
              Recent Transactions
            </h3>
            <span className="text-xs text-gray-400">{payments.length} Records</span>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-xs text-gray-400">Loading receipts...</div>
          ) : payments.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-gray-700">No payment receipts logged yet</p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Receipts will appear here as soon as you complete a ride payment.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {payments.map((pay) => (
                <div key={pay.id} className="p-5 flex items-center justify-between gap-4 hover:bg-gray-50/60 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                      <IndianRupee className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-900">₹{pay.amount}.00</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {pay.status}
                        </span>
                        <span className="text-[11px] text-gray-400 font-mono">
                          via {pay.method}
                        </span>
                      </div>
                      <div className="text-[11px] text-gray-500 mt-1">
                        Invoice: <span className="font-mono text-gray-700">{pay.invoiceNumber}</span> • Ref: {pay.razorpayPaymentId}
                      </div>
                      <div className="text-[10px] text-gray-400 mt-0.5">
                        {new Date(pay.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDownloadInvoice(pay)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Invoice</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
