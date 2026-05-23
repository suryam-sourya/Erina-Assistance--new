import mongoose, { Schema, Document } from "mongoose";

export interface ITestimonial extends Document {
  name: string;
  role: string;
  location: string;
  serviceType: string;
  serviceLabel: string;
  eta: string;
  technician: string;
  rating: number;
  storyTitle: string;
  quote: string;
  avatarColor: string;
  initials: string;
  createdAt: Date;
}

const TestimonialSchema: Schema = new Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  location: { type: String, required: true },
  serviceType: { type: String, required: true },
  serviceLabel: { type: String, required: true },
  eta: { type: String, required: true },
  technician: { type: String, required: true },
  rating: { type: Number, required: true, default: 5 },
  storyTitle: { type: String, required: true },
  quote: { type: String, required: true },
  avatarColor: { type: String, required: true },
  initials: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Testimonial || mongoose.model<ITestimonial>("Testimonial", TestimonialSchema);
