import mongoose from "mongoose";

const PricingSchema = new mongoose.Schema(
  {
    // We only need one active pricing configuration document, so we can use a single active config flag
    isActive: {
      type: Boolean,
      default: true,
      unique: true,
    },
    serviceBaseFees: {
      towing: { type: Number, default: 1800 },
      battery: { type: Number, default: 900 },
      urgentBattery: { type: Number, default: 3000 },
      flatTyre: { type: Number, default: 700 },
      fuel: { type: Number, default: 200 },
      lockout: { type: Number, default: 500 },
      ev: { type: Number, default: 600 },
      engine: { type: Number, default: 2000 },
      accident: { type: Number, default: 2500 },
      other: { type: Number, default: 750 },
    },
    ratePerKm: { type: Number, default: 120 },
    vehicleMultipliers: {
      hatchback: { type: Number, default: 1.0 },
      suv: { type: Number, default: 1.3 },
      luxury: { type: Number, default: 2.0 },
      twoWheeler: { type: Number, default: 0.7 },
      commercial: { type: Number, default: 2.5 },
      ev: { type: Number, default: 1.4 },
    },
    nightSurcharge: { type: Number, default: 1.5 },
    peakHourSurcharge: { type: Number, default: 1.25 },
    emergencySurcharge: { type: Number, default: 1.75 },
  },
  { timestamps: true }
);

export default mongoose.models.Pricing || mongoose.model("Pricing", PricingSchema);
