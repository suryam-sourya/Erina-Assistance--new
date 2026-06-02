import mongoose from "mongoose";

const TechnicianSchema = new mongoose.Schema(
  {
    technicianId: {
      type: String,
      unique: true,
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    availability: {
      type: String,
      enum: [
        "available",
        "busy",
        "offline",
      ],
      default: "available",
    },

    currentJob: {
      type: String,
      default: null,
    },

    rating: {
      type: Number,
      default: 5,
    },

    serviceArea: {
      type: String,
      required: true,
    },

    vehicleType: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default
mongoose.models.Technician ||
mongoose.model(
  "Technician",
  TechnicianSchema
);