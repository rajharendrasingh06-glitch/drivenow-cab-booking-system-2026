import mongoose, { Schema, Document, Model } from 'mongoose';
import { UserRole } from '../../types';

export interface IUserDocument extends Document {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
  savedPlaces?: Array<{
    id?: string;
    label?: string;
    address?: string;
    lat?: number;
    lng?: number;
    home?: string;
    work?: string;
  }>;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true },
    phone: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ['CUSTOMER', 'DRIVER', 'ADMIN'],
      default: 'CUSTOMER',
      required: true,
      index: true,
    },
    avatar: { type: String, default: '' },
    emergencyContact: {
      name: { type: String, default: '' },
      phone: { type: String, default: '' },
      relation: { type: String, default: '' },
    },
    savedPlaces: { type: Schema.Types.Mixed, default: [] },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: any) => {
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        delete ret.resetPasswordToken;
        delete ret.resetPasswordExpires;
        return ret;
      },
    },
  }
);

export const UserModel: Model<IUserDocument> =
  (mongoose.models.User as Model<IUserDocument>) ||
  mongoose.model<IUserDocument>('User', UserSchema);
