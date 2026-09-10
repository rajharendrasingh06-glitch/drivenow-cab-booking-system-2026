import mongoose, { Schema, Document, Model } from 'mongoose';
import { CabCategory, PaymentMethod, PaymentStatus, RideStatus } from '../../types';

export interface IRideDocument extends Document {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  driverPhoto?: string;
  driverRating?: number;
  vehicleId?: string;
  vehicleModel?: string;
  vehicleRegNo?: string;
  vehicleColor?: string;
  vehicleCategory: CabCategory;
  vehicleImage?: string;
  otp: string;
  pickup: {
    lat: number;
    lng: number;
    address: string;
    city?: string;
  };
  drop: {
    lat: number;
    lng: number;
    address: string;
    city?: string;
  };
  routeDistanceKm: number;
  estimatedDurationMins: number;
  fare: {
    baseFare: number;
    distanceKm: number;
    distanceFare: number;
    timeMinutes: number;
    timeFare: number;
    subtotal: number;
    taxes: number;
    platformFee: number;
    totalFare: number;
    currency: 'INR';
  };
  status: RideStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paymentId?: string;
  requestedAt: string;
  assignedAt?: string;
  arrivedAt?: string;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
  cancelledBy?: 'CUSTOMER' | 'DRIVER' | 'SYSTEM';
  driverLiveLocation?: {
    lat: number;
    lng: number;
    updatedAt: string;
  };
  rating?: {
    stars: number;
    feedback: string;
    submittedAt: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const RideSchema = new Schema<IRideDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    customerId: { type: String, required: true, index: true },
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    driverId: { type: String, index: true },
    driverName: { type: String },
    driverPhone: { type: String },
    driverPhoto: { type: String },
    driverRating: { type: Number },
    vehicleId: { type: String, index: true },
    vehicleModel: { type: String },
    vehicleRegNo: { type: String },
    vehicleColor: { type: String },
    vehicleCategory: {
      type: String,
      enum: ['Mini', 'Sedan', 'Prime', 'SUV'],
      required: true,
    },
    vehicleImage: { type: String },
    otp: { type: String, required: true },
    pickup: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      address: { type: String, required: true },
      city: { type: String },
    },
    drop: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      address: { type: String, required: true },
      city: { type: String },
    },
    routeDistanceKm: { type: Number, required: true },
    estimatedDurationMins: { type: Number, required: true },
    fare: {
      baseFare: { type: Number, required: true },
      distanceKm: { type: Number, required: true },
      distanceFare: { type: Number, required: true },
      timeMinutes: { type: Number, required: true },
      timeFare: { type: Number, required: true },
      subtotal: { type: Number, required: true },
      taxes: { type: Number, required: true },
      platformFee: { type: Number, required: true },
      totalFare: { type: Number, required: true },
      currency: { type: String, default: 'INR' },
    },
    status: {
      type: String,
      enum: [
        'REQUESTED',
        'DRIVER_ASSIGNED',
        'DRIVER_ARRIVING',
        'DRIVER_ARRIVED',
        'TRIP_STARTED',
        'TRIP_COMPLETED',
        'CANCELLED',
      ],
      default: 'REQUESTED',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'PAID', 'FAILED', 'REFUNDED'],
      default: 'PENDING',
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ['UPI', 'CARD', 'NETBANKING', 'CASH', 'WALLET'],
      default: 'UPI',
    },
    paymentId: { type: String },
    requestedAt: { type: String, default: () => new Date().toISOString() },
    assignedAt: { type: String },
    arrivedAt: { type: String },
    startedAt: { type: String },
    completedAt: { type: String },
    cancelledAt: { type: String },
    cancelReason: { type: String },
    cancelledBy: { type: String, enum: ['CUSTOMER', 'DRIVER', 'SYSTEM'] },
    driverLiveLocation: {
      lat: { type: Number },
      lng: { type: Number },
      updatedAt: { type: String },
    },
    rating: {
      stars: { type: Number },
      feedback: { type: String },
      submittedAt: { type: String },
    },
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

export const RideModel: Model<IRideDocument> =
  (mongoose.models.Ride as Model<IRideDocument>) ||
  mongoose.model<IRideDocument>('Ride', RideSchema);
