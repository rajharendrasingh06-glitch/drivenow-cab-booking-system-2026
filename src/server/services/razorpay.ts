import Razorpay from 'razorpay';
import crypto from 'crypto';

export const isRazorpayConfigured = Boolean(
  process.env.RAZORPAY_KEY_ID &&
  process.env.RAZORPAY_KEY_SECRET
);

export const razorpayInstance = isRazorpayConfigured
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    })
  : null;

export async function createRazorpayOrder(amountInRupees: number, receipt: string, notes: Record<string, string> = {}) {
  if (!isRazorpayConfigured || !razorpayInstance) {
    return {
      configured: false,
      message: 'Razorpay keys not configured in environment variables (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET).',
      orderId: null,
    };
  }

  const options = {
    amount: Math.round(amountInRupees * 100), // amount in paisa
    currency: 'INR',
    receipt,
    notes,
  };

  try {
    const order = await razorpayInstance.orders.create(options);
    return {
      configured: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    };
  } catch (err) {
    console.error('Razorpay order creation error:', err);
    throw err;
  }
}

export function verifyRazorpayPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  if (!isRazorpayConfigured) return false;
  const secret = process.env.RAZORPAY_KEY_SECRET!;
  const generatedSignature = crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  return generatedSignature === signature;
}
