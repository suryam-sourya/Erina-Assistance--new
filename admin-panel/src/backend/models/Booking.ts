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
    serviceType: { type: String, uppercase: true },
    serviceTypes: {
  type: [String],
  default: [],
}, // e.g. "FLAT_TYRE", "TOWING"
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
    zohoInvoiceId: {
  type: String,
  default: null,
},

zohoInvoiceNumber: {
  type: String,
  default: null,
},

zohoInvoiceUrl: {
  type: String,
  default: null,
},
    paymentAmount: { type: Number, default: 0 },
    invoiceStatus: { type: String, enum: ["DRAFT", "FINAL"], default: "DRAFT" },
    serviceSacCode: { type: String, default: "9987" },
    createdBy: { type: String, default: null },

    feedback: {
      rating: { type: Number, min: 1, max: 5 },
      tags: { type: [String], default: [] },
      comment: { type: String, default: "" },
      submittedAt: { type: Date, default: Date.now },
    },

    timeline: {
      confirmedAt: { type: Date, default: Date.now },
      assignedAt: { type: Date },
      enRouteAt: { type: Date },
      arrivedAt: { type: Date },
      completedAt: { type: Date },
      cancelledAt: { type: Date },
    },

    progress: { type: Number, default: 0 },
    technicianLocation: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },

    // ── Products Sold On-Site ─────────────────────────────────────────────
    // Populated when a technician sells a physical product (e.g. battery, tyre)
    // during the service call. Each entry is a snapshot at time of sale.
    soldProducts: [
      {
        productId:  { type: String, required: true },  // Ref to Product._id
        name:       { type: String, required: true },  // Snapshot for invoice history
        brand:      { type: String, default: "" },
        sku:        { type: String, default: "" },
        hsnCode:    { type: String, default: "8507" }, // GST HSN code
        gstRate:    { type: Number, default: 0.28 },   // Per-product GST rate at time of sale
        quantity:   { type: Number, required: true, min: 1 },
        unitPrice:  { type: Number, required: true, min: 0 }, // Selling price (GST inclusive)
      },
    ],

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
