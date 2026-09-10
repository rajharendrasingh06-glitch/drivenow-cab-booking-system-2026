import mongoose, { Schema, Document, Model } from 'mongoose';
import { CabCategory, VehicleStatus } from '../../types';

export interface IVehicleDocument {
  id: string;
  brand: string;
  model: string;
  variant: string;
  category: CabCategory;
  registrationNumber: string;
  year: number;
  color: string;
  fuelType: 'CNG' | 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid';
  transmission: 'Manual' | 'Automatic';
  seats: number;
  city: string;
  currentCoordinates: {
    lat: number;
    lng: number;
    address?: string;
  };
  dailyBaseFare: number;
  perKmFare: number;
  rating: number;
  totalRides: number;
  availabilityStatus: VehicleStatus;
  assignedDriverId?: string;
  assignedDriverName?: string;
  assignedDriverPhone?: string;
  image: string;
  features: string[];
  createdAt: Date;
  updatedAt: Date;
}

const VehicleSchema = new Schema<IVehicleDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    brand: { type: String, required: true },
    model: { type: String, required: true, index: true },
    variant: { type: String, required: true },
    category: {
      type: String,
      enum: ['Mini', 'Sedan', 'Prime', 'SUV'],
      required: true,
      index: true,
    },
    registrationNumber: { type: String, required: true, unique: true, index: true },
    year: { type: Number, required: true },
    color: { type: String, required: true },
    fuelType: {
      type: String,
      enum: ['CNG', 'Petrol', 'Diesel', 'Electric', 'Hybrid'],
      default: 'CNG',
    },
    transmission: {
      type: String,
      enum: ['Manual', 'Automatic'],
      default: 'Manual',
    },
    seats: { type: Number, default: 4 },
    city: { type: String, required: true, index: true },
    currentCoordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      address: { type: String, default: '' },
    },
    dailyBaseFare: { type: Number, default: 60 },
    perKmFare: { type: Number, default: 14 },
    rating: { type: Number, default: 4.8 },
    totalRides: { type: Number, default: 0 },
    availabilityStatus: {
      type: String,
      enum: ['AVAILABLE', 'ON_TRIP', 'OFFLINE', 'MAINTENANCE'],
      default: 'AVAILABLE',
      index: true,
    },
    assignedDriverId: { type: String, index: true },
    assignedDriverName: { type: String },
    assignedDriverPhone: { type: String },
    image: { type: String, required: true },
    features: { type: [String], default: [] },
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

export const VehicleModel: Model<IVehicleDocument> =
  (mongoose.models.Vehicle as Model<IVehicleDocument>) ||
  mongoose.model<IVehicleDocument>('Vehicle', VehicleSchema);
