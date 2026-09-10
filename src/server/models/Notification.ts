import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INotificationDocument extends Document {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'RIDE' | 'PAYMENT' | 'SAFETY' | 'SYSTEM';
  rideId?: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotificationDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['RIDE', 'PAYMENT', 'SAFETY', 'SYSTEM'],
      default: 'RIDE',
    },
    rideId: { type: String },
    read: { type: Boolean, default: false, index: true },
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

export const NotificationModel: Model<INotificationDocument> =
  (mongoose.models.Notification as Model<INotificationDocument>) ||
  mongoose.model<INotificationDocument>('Notification', NotificationSchema);

