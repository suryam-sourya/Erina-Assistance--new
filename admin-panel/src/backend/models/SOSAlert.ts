import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ISOSAlert extends Document {
  latitude: number;
  longitude: number;
  status: 'PENDING' | 'RESOLVED';
  createdAt: Date;
  updatedAt: Date;
}

const sosAlertSchema = new Schema<ISOSAlert>(
  {
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'RESOLVED'],
      default: 'PENDING',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent mongoose from compiling the model multiple times
const SOSAlert: Model<ISOSAlert> = mongoose.models.SOSAlert || mongoose.model<ISOSAlert>('SOSAlert', sosAlertSchema);

export default SOSAlert;
