import mongoose, {
  Schema,
  Document,
  Model,
} from "mongoose";

export interface ITechnician
  extends Document {
  technicianId: string;
  name: string;
  phone: string;

  email?: string;

  vehicleType: string;

  serviceTypes: string[];

  availability:
    | "AVAILABLE"
    | "BUSY"
    | "OFFLINE";

  currentJob?: string | null;

  rating?: number;

  location: {
    type: string;
    coordinates: [number, number];
    address: string;
  };

  createdAt: Date;
  updatedAt: Date;
}

const technicianSchema =
  new Schema<ITechnician>(
    {
      technicianId: {
        type: String,
        required: true,
        unique: true,
        index: true,
      },

      name: {
        type: String,
        required: true,
        trim: true,
      },

      phone: {
        type: String,
        required: true,
      },

      email: {
        type: String,
      },

      vehicleType: {
        type: String,
        required: true,
      },

      serviceTypes: [
        {
          type: String,
        },
      ],

      availability: {
        type: String,
        enum: [
          "AVAILABLE",
          "BUSY",
          "OFFLINE",
        ],
        default: "AVAILABLE",
        index: true,
      },

      currentJob: {
        type: String,
        default: null,
      },

      rating: {
        type: Number,
        default: 5,
      },

      location: {
  type: {
    type: String,
    enum: ["Point"],
    required: true,
    default: "Point",
  },

  coordinates: {
    type: [Number],
    required: true,
  },

  address: {
    type: String,
    required: true,
  },
},
    },
    {
      timestamps: true,
    }
  );

// Geo index
technicianSchema.index({
  location: "2dsphere",
});

const TechnicianModel: Model<ITechnician> =
  mongoose.models.Technician ||
  mongoose.model<ITechnician>(
    "Technician",
    technicianSchema
  );

export default TechnicianModel;