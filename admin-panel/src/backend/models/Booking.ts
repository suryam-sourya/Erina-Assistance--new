import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema(
  {
    userId: String,
    customerName: String,
    phone: String,
    serviceType: String,
    serviceLabel: String,
    vehicleType: String,
    vehicleName: String,
    vehicleNumber: String,
    vehiclePlate: String,
    status: {
      type: String,
      default: "pending",
    },
    technicianId: {
      type: String,
      default: null,
    },
    technicianName: {
      type: String,
      default: null,
    },
    location: {
      lat: Number,
      lng: Number,
    },
    address: String,
    paymentStatus: {
      type: String,
      default: "pending",
    },
    paymentAmount: {
      type: Number,
      default: 0,
    },
    imageUrl: String,
  },
  { timestamps: true }
);

// High Scalability Queries Indexing
BookingSchema.index({ createdAt: -1 });
BookingSchema.index({ status: 1 });
BookingSchema.index({ phone: 1 });

export default mongoose.models.Booking || mongoose.model("Booking", BookingSchema);
