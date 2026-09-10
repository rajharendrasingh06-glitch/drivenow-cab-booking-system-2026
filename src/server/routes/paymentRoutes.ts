import { Router, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { PaymentModel, RideModel, NotificationModel } from '../models';
import { authenticate, AuthRequest } from '../auth';
import {
  isRazorpayConfigured,
  createRazorpayOrder,
  verifyRazorpayPaymentSignature,
} from '../services/razorpay';
import { sendPaymentReceiptEmail } from '../services/mailer';
import { PaymentMethod, PaymentRecord } from '../../types';

export const paymentRouter = Router();

// Check Gateway Status
paymentRouter.get('/config', (_req, res) => {
  res.json({
    configured: isRazorpayConfigured,
    keyId: process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_drivenow_sandbox',
    currency: 'INR',
    supportedMethods: ['UPI', 'CARD', 'NETBANKING', 'CASH'],
    notice: isRazorpayConfigured
      ? 'Razorpay Test Mode connected.'
      : 'Razorpay keys not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env for production gateway transactions.',
  });
});

// Create Payment Order for a Ride
paymentRouter.post('/create-order', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { rideId, method = 'UPI' } = req.body;
    const ride = await RideModel.findOne({ id: rideId });

    if (!ride) {
      res.status(404).json({ error: 'Ride not found.' });
      return;
    }

    if (ride.paymentStatus === 'PAID') {
      res.status(400).json({ error: 'This ride has already been paid for.' });
      return;
    }

    const amountInRupees = ride.fare.totalFare;
    const receipt = `rcpt_${ride.id.replace(/-/g, '_')}`;

    if (isRazorpayConfigured) {
      try {
        const order = await createRazorpayOrder(amountInRupees, receipt, {
          rideId: ride.id,
          customerId: ride.customerId,
        });

        res.json({
          orderId: order.orderId,
          amount: amountInRupees,
          amountInPaisa: order.amount,
          currency: 'INR',
          rideId: ride.id,
          customerName: ride.customerName,
          customerPhone: ride.customerPhone,
          method,
          isRazorpayOrder: true,
        });
        return;
      } catch (razorpayErr) {
        console.warn('Razorpay order creation failed, falling back:', razorpayErr);
      }
    }

    // Fallback standard order structure
    const amountInPaisa = Math.round(amountInRupees * 100);
    const orderId = `order_${uuidv4().replace(/-/g, '').slice(0, 14)}`;

    res.json({
      orderId,
      amount: amountInRupees,
      amountInPaisa,
      currency: 'INR',
      rideId: ride.id,
      customerName: ride.customerName,
      customerPhone: ride.customerPhone,
      method,
      isRazorpayOrder: false,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create payment order', details: String(err) });
  }
});

// Verify & Process Payment
paymentRouter.post('/verify', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const {
      rideId,
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
      method = 'UPI',
      simulateFailure = false,
    } = req.body;

    const ride = await RideModel.findOne({ id: rideId });
    if (!ride) {
      res.status(404).json({ error: 'Ride not found.' });
      return;
    }

    if (simulateFailure) {
      res.status(400).json({
        error: 'Payment transaction was declined by bank or cancelled by user.',
        status: 'FAILED',
      });
      return;
    }

    // If Razorpay signature provided, verify signature
    if (razorpayOrderId && razorpayPaymentId && razorpaySignature && isRazorpayConfigured) {
      const isValid = verifyRazorpayPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
      if (!isValid) {
        res.status(400).json({ error: 'Invalid Razorpay payment signature.' });
        return;
      }
    }

    const payId = razorpayPaymentId || `pay_in_${uuidv4().replace(/-/g, '').slice(0, 12)}`;
    const invoiceNumber = `INV-DN-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    // Create payment in MongoDB
    const paymentDoc = await PaymentModel.create({
      id: `PAY-${uuidv4().slice(0, 8)}`,
      rideId: ride.id,
      customerId: ride.customerId,
      customerName: ride.customerName,
      driverId: ride.driverId,
      driverName: ride.driverName,
      amount: ride.fare.totalFare,
      currency: 'INR',
      status: 'PAID',
      method: (method as PaymentMethod) || 'UPI',
      razorpayPaymentId: payId,
      razorpayOrderId: razorpayOrderId || `order_${uuidv4().slice(0, 8)}`,
      razorpaySignature,
      invoiceNumber,
    });

    // Update ride payment status in MongoDB
    ride.paymentStatus = 'PAID';
    ride.paymentMethod = (method as PaymentMethod) || 'UPI';
    ride.paymentId = payId;
    await ride.save();

    // Create notification in MongoDB
    await NotificationModel.create({
      id: `notif-${uuidv4().slice(0, 8)}`,
      userId: ride.customerId,
      title: 'Payment Confirmed',
      message: `Payment of ₹${ride.fare.totalFare} for Ride #${ride.id} was successful via ${method}. Invoice #${invoiceNumber}.`,
      type: 'PAYMENT',
      rideId: ride.id,
    });

    // Send receipt email (Nodemailer)
    sendPaymentReceiptEmail(req.user?.email || 'customer@example.com', paymentDoc).catch(() => {});

    res.json({
      message: 'Payment verified and marked as PAID successfully.',
      payment: paymentDoc.toJSON(),
      ride: ride.toJSON(),
    });
  } catch (err) {
    console.error('Payment verification error:', err);
    res.status(500).json({ error: 'Payment verification failed', details: String(err) });
  }
});

// Get Invoice Details
paymentRouter.get('/invoice/:rideId', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const payment = await PaymentModel.findOne({ rideId: req.params.rideId }).lean();
    const ride = await RideModel.findOne({ id: req.params.rideId }).lean();

    if (!payment || !ride) {
      res.status(404).json({ error: 'Invoice or ride record not found.' });
      return;
    }

    res.json({
      invoice: {
        invoiceNumber: payment.invoiceNumber,
        date: payment.createdAt,
        paymentStatus: payment.status,
        method: payment.method,
        amount: payment.amount,
        currency: payment.currency,
        customerName: payment.customerName,
        driverName: payment.driverName,
        rideId: ride.id,
        pickup: ride.pickup?.address,
        drop: ride.drop?.address,
        fareBreakdown: ride.fare,
        vehicleModel: ride.vehicleModel,
        vehicleRegNo: ride.vehicleRegNo,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve invoice', details: String(err) });
  }
});
