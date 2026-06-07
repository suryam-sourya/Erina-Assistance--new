import mongoose, { Schema, Document } from "mongoose";

export interface IInquiry extends Document {
  name: string;
  phone: string;
  email: string;
  plan: string;
  vehicleDetails?: string;
  message?: string;
  createdAt: Date;
}

const InquirySchema: Schema = new Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  plan: { type: String, required: true },
  vehicleDetails: { type: String, default: "" },
  message: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Inquiry || mongoose.model<IInquiry>("Inquiry", InquirySchema);
