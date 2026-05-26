import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema(
  {
    // ── Aligning with Dev Team's Nested Structure ────────────────────────
    customer: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
    },
    vehicle: {
      type: { type: String, uppercase: true }, // e.g. "CAR", "SUV", "TWO_WHEELER"
      plateNumber: { type: String }, // e.g. "KA01AB1234"
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude] - standard GeoJSON
        required: true,
      },
      address: { type: String },
    },
    ticketId: { type: String }, // e.g. "RSA-9779"
    serviceType: { type: String, uppercase: true }, // e.g. "FLAT_TYRE", "TOWING"
    description: { type: String },
    isPriority: { type: Boolean, default: false },
    images: { type: [String], default: [] },
    status: {
      type: String,
      uppercase: true, // "PENDING", "EMERGENCY", "ASSIGNED", "IN_PROGRESS", "COMPLETED"
      default: "PENDING",
    },
    subStatus: {
      type: String,
      uppercase: true, // "COLLECTING_TOOLS", "LEAVING_HUB", "ARRIVED"
      default: null,
    },
    technicianId: { type: String, default: null },
    technicianName: { type: String, default: null },
    technicianPhone: { type: String, default: null },
    estimatedArrivalTime: { type: String, default: null },
    paymentStatus: { type: String, default: "PENDING" },
    paymentAmount: { type: Number, default: 0 },
    createdBy: { type: String, default: null },

    // ── Products Sold During Service ──────────────────────────────────────
    soldProducts: {
      type: [
        {
          productId: { type: String },
          name: { type: String, required: true },
          sku: { type: String, default: null },
          qty: { type: Number, required: true, min: 1 },
          unitPrice: { type: Number, required: true },
          totalPrice: { type: Number, required: true },
        },
      ],
      default: [],
    },
    invoiceNumber: { type: String, default: null }, // e.g. "INV-2025-0001"
    invoiceGeneratedAt: { type: Date, default: null },

    // ── Backward Compatibility Flat Fallbacks (Optional) ──────────────────
    userId: String,
    customerName: String,
    phone: String,
    serviceLabel: String,
    vehicleType: String,
    vehicleName: String,
    vehicleNumber: String,
    vehiclePlate: String,
    imageUrl: String,
    addressString: String,
  },
  { timestamps: true }
);

// High Scalability Indexing
BookingSchema.index({ createdAt: -1 });
BookingSchema.index({ ticketId: 1 }, { unique: true, sparse: true });
BookingSchema.index({ "customer.phone": 1 });
BookingSchema.index({ status: 1 });
BookingSchema.index({ location: "2dsphere" }); // Enables geospatial distance queries!

export default mongoose.models.Booking || mongoose.model("Booking", BookingSchema);
