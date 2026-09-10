import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDriverDocument extends Document {
  id: string;
  userId?: string;
  name: string;
  phone: string;
  email: string;
  photo: string;
  licenseNumber: string;
  rating: number;
  totalRatingsCount: number;
  completedRides: number;
  isVerified: boolean;
  status: 'ONLINE' | 'OFFLINE' | 'RIDE_REQUEST' | 'ACCEPTED' | 'ARRIVING' | 'ARRIVED' | 'TRIP_STARTED' | 'TRIP_COMPLETED' | 'ON_TRIP';
  currentCoordinates: {
    lat: number;
    lng: number;
    heading?: number;
    address?: string;
  };
  assignedVehicleId?: string;
  vehicleModel?: string;
  vehicleRegNo?: string;
  vehicleCategory?: string;
  earningsToday: number;
  earningsTotal: number;
  city: string;
  joinedDate: string;
  createdAt: Date;
  updatedAt: Date;
}

const DriverSchema = new Schema<IDriverDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, index: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, index: true },
    photo: { type: String, default: '' },
    licenseNumber: { type: String, required: true, trim: true },
    rating: { type: Number, default: 4.8, min: 1, max: 5 },
    totalRatingsCount: { type: Number, default: 0 },
    completedRides: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: true },
    status: {
      type: String,
      enum: [
        'ONLINE',
        'OFFLINE',
        'RIDE_REQUEST',
        'ACCEPTED',
        'ARRIVING',
        'ARRIVED',
        'TRIP_STARTED',
        'TRIP_COMPLETED',
        'ON_TRIP',
      ],
      default: 'ONLINE',
      index: true,
    },
    currentCoordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      heading: { type: Number, default: 0 },
      address: { type: String, default: '' },
    },
    assignedVehicleId: { type: String },
    vehicleModel: { type: String },
    vehicleRegNo: { type: String },
    vehicleCategory: { type: String },
    earningsToday: { type: Number, default: 0 },
    earningsTotal: { type: Number, default: 0 },
    city: { type: String, required: true, index: true },
    joinedDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
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

export const DriverModel: Model<IDriverDocument> =
  (mongoose.models.Driver as Model<IDriverDocument>) ||
  mongoose.model<IDriverDocument>('Driver', DriverSchema);
