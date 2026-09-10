import mongoose, { Schema, Document, Model } from 'mongoose';
import { PaymentMethod, PaymentStatus } from '../../types';

export interface IPaymentDocument extends Document {
  id: string;
  rideId: string;
  customerId: string;
  customerName: string;
  driverId?: string;
  driverName?: string;
  amount: number;
  currency: 'INR';
  status: PaymentStatus;
  method: PaymentMethod;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  razorpaySignature?: string;
  invoiceNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPaymentDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    rideId: { type: String, required: true, index: true },
    customerId: { type: String, required: true, index: true },
    customerName: { type: String, required: true },
    driverId: { type: String },
    driverName: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'PAID', 'FAILED', 'REFUNDED'],
      default: 'PENDING',
      index: true,
    },
    method: {
      type: String,
      enum: ['UPI', 'CARD', 'NETBANKING', 'CASH', 'WALLET'],
      default: 'UPI',
    },
    razorpayPaymentId: { type: String },
    razorpayOrderId: { type: String },
    razorpaySignature: { type: String },
    invoiceNumber: { type: String, required: true, unique: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: any) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const PaymentModel: Model<IPaymentDocument> =
  (mongoose.models.Payment as Model<IPaymentDocument>) ||
  mongoose.model<IPaymentDocument>('Payment', PaymentSchema);
