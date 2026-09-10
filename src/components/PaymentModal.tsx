import React, { useState, useEffect } from 'react';
import { IndianRupee, CreditCard, Smartphone, Building2, CheckCircle2, AlertCircle, X, ShieldCheck } from 'lucide-react';
import { apiClient } from '../services/api';
import { PaymentMethod, Ride } from '../types';
import toast from 'react-hot-toast';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  ride: Ride;
  onPaymentSuccess: (invoiceNumber: string) => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  ride,
  onPaymentSuccess,
}) => {
  const [method, setMethod] = useState<PaymentMethod>('UPI');
  const [upiId, setUpiId] = useState('rahul@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8812');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('742');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [isProcessing, setIsProcessing] = useState(false);
  const [gatewayConfig, setGatewayConfig] = useState<{ configured: boolean; notice: string } | null>(null);

  useEffect(() => {
    apiClient.get('/payments/config').then(({ data }) => {
      setGatewayConfig(data);
    }).catch(() => {});
  }, []);

  if (!isOpen) return null;

  const handlePay = async () => {
    setIsProcessing(true);
    try {
      // 1. Create order
      const { data: orderData } = await apiClient.post('/payments/create-order', {
        rideId: ride.id,
        method,
      });

      // 2. Process / Verify payment
      const { data: verifyData } = await apiClient.post('/payments/verify', {
        rideId: ride.id,
        razorpayPaymentId: `pay_${Date.now()}_in`,
        razorpayOrderId: orderData.orderId,
        method,
      });

      toast.success(`Payment of ₹${ride.fare.totalFare} successful via ${method}!`);
      onPaymentSuccess(verifyData.payment.invoiceNumber);
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Payment failed. Please try again.';
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-gray-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Complete Trip Payment</h3>
            <p className="text-xs text-gray-500">Trip ID: {ride.id}</p>
          </div>
        </div>

        {/* Amount Card */}
        <div className="rounded-xl bg-emerald-50 border border-emerald-200/80 p-4 mb-4 text-center">
          <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
            Total Fare Payable (Inclusive of 5% GST)
          </span>
          <div className="text-3xl font-extrabold text-emerald-950 mt-1 flex items-center justify-center">
            <IndianRupee className="w-6 h-6 mr-1" />
            <span>{ride.fare.totalFare}</span>
          </div>
          <div className="flex items-center justify-center gap-3 text-xs text-emerald-800 mt-2">
            <span>Distance: {ride.fare.distanceKm} km</span>
            <span>•</span>
            <span>Duration: {ride.fare.timeMinutes} mins</span>
          </div>
        </div>

        {/* Razorpay Environment Configuration status */}
        {gatewayConfig && !gatewayConfig.configured && (
          <div className="mb-4 flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-2.5 text-[11px] text-amber-800">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Razorpay Test Mode Active:</span> Live credentials <code className="font-mono bg-amber-100 px-1 rounded">RAZORPAY_KEY_ID</code> not provided in environment. Simulating instant Indian UPI, Netbanking & Card transactions.
            </div>
          </div>
        )}

        {/* Payment Methods */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-gray-700 mb-2">
            Select Indian Payment Method
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setMethod('UPI')}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${
                method === 'UPI'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-500'
                  : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Smartphone className="w-4 h-4 mb-1 text-emerald-600" />
              <span>UPI / QR</span>
            </button>

            <button
              type="button"
              onClick={() => setMethod('CARD')}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${
                method === 'CARD'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-500'
                  : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <CreditCard className="w-4 h-4 mb-1 text-blue-600" />
              <span>Cards</span>
            </button>

            <button
              type="button"
              onClick={() => setMethod('NETBANKING')}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${
                method === 'NETBANKING'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-500'
                  : 'border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Building2 className="w-4 h-4 mb-1 text-purple-600" />
              <span>Net Banking</span>
            </button>
          </div>
        </div>

        {/* Method Detail Inputs */}
        <div className="space-y-3 mb-5">
          {method === 'UPI' && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Virtual Payment Address (VPA / UPI ID)
              </label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="mobile@upi or user@okhdfcbank"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:outline-emerald-600"
              />
              <div className="flex items-center gap-3 mt-2 text-[11px] text-gray-500">
                <span>Google Pay</span>
                <span>•</span>
                <span>PhonePe</span>
                <span>•</span>
                <span>Paytm</span>
                <span>•</span>
                <span>BHIM</span>
              </div>
            </div>
          )}

          {method === 'CARD' && (
            <div className="space-y-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Card Number
                </label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:outline-emerald-600"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Valid Thru
                  </label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:outline-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    CVV
                  </label>
                  <input
                    type="password"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    maxLength={3}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:outline-emerald-600"
                  />
                </div>
              </div>
            </div>
          )}

          {method === 'NETBANKING' && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Select Indian Bank
              </label>
              <select
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:outline-emerald-600 bg-white"
              >
                <option value="HDFC Bank">HDFC Bank</option>
                <option value="State Bank of India (SBI)">State Bank of India (SBI)</option>
                <option value="ICICI Bank">ICICI Bank</option>
                <option value="Axis Bank">Axis Bank</option>
                <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                <option value="Punjab National Bank">Punjab National Bank</option>
              </select>
            </div>
          )}
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-1 text-[11px] text-gray-500 mb-4">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>256-bit SSL encrypted & RBI compliant payments</span>
        </div>

        <button
          type="button"
          onClick={handlePay}
          disabled={isProcessing}
          className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <span>Processing ₹{ride.fare.totalFare}...</span>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>PAY ₹{ride.fare.totalFare} NOW</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
