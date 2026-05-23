import mongoose, {
  Schema,
  Document,
  Model,
} from "mongoose";

export interface IBooking
  extends Document {
  ticketId: string;

  customer: {
    name: string;
    phone: string;
  };

  vehicle: {
    type:
      | "CAR"
      | "SUV"
      | "LUXURY"
      | "BIKE"
      | "COMMERCIAL"
      | "EV";

    plateNumber: string;
  };

  serviceType:
    | "TOWING"
    | "FLAT_TYRE"
    | "BATTERY"
    | "FUEL_DELIVERY"
    | "LOCKOUT"
    | "ENGINE_FAILURE"
    | "ACCIDENT"
    | "OTHER";

  description?: string;

  isPriority: boolean;

  images: string[];

  location: {
    type: "Point";
    coordinates: [number, number];
    address?: string;
  };

  status:
    | "PENDING"
    | "ASSIGNED"
    | "ACCEPTED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED";

  technicianId?: mongoose.Types.ObjectId | null;

  technicianName?: string | null;

  estimatedArrivalTime?: number| null;

  createdBy?: string | null;
  paymentStatus?:
  | "PENDING"
  | "COMPLETED"
  | "FAILED";

paymentAmount?: number | null;

  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema =
  new Schema<IBooking>(
    {
      ticketId: {
        type: String,
        required: true,
        unique: true,
        index: true,
      },

      customer: {
        name: {
          type: String,
          required: true,
          trim: true,
        },

        phone: {
          type: String,
          required: true,
          trim: true,
        },
      },

      vehicle: {
        type: {
          type: String,
          enum: [
            "CAR",
            "SUV",
            "LUXURY",
            "BIKE",
            "COMMERCIAL",
            "EV",
          ],
          required: true,
        },

        plateNumber: {
          type: String,
          required: true,
          uppercase: true,
          trim: true,
        },
      },

      serviceType: {
        type: String,
        enum: [
          "TOWING",
          "FLAT_TYRE",
          "BATTERY",
          "FUEL_DELIVERY",
          "LOCKOUT",
          "ENGINE_FAILURE",
          "ACCIDENT",
          "OTHER",
        ],
        required: true,
      },

      description: {
        type: String,
        default: "",
        trim: true,
      },

      isPriority: {
        type: Boolean,
        default: false,
      },

      images: [
        {
          type: String,
        },
      ],

      location: {
        type: {
          type: String,
          enum: ["Point"],
          default: "Point",
        },

        coordinates: {
          type: [Number],
          required: true,
        },

        address: {
          type: String,
          trim: true,
          default: "",
        },
      },

      status: {
        type: String,
        enum: [
          "PENDING",
          "ASSIGNED",
          "ACCEPTED",
          "IN_PROGRESS",
          "COMPLETED",
          "CANCELLED",
        ],
        default: "PENDING",
      },

      technicianId: {
      type: String,
      default: null,
    },

      technicianName: {
        type: String,
        default: null,
      },

      estimatedArrivalTime: {
        type: Number,
        default: null,
      },
      paymentStatus: {
        type: String,
        enum: [
                "PENDING",
                "COMPLETED",
                "FAILED",
                ],
        default: "PENDING",
     },
      paymentAmount: {
        type: Number,
        default: null,
   },
      createdBy: {
        type: String,
        default: null,
      },
    },

    {
      timestamps: true,
    }
  );

bookingSchema.index({
  location: "2dsphere",
});

const Booking: Model<IBooking> =
  mongoose.models.Booking ||
  mongoose.model<IBooking>(
    "Booking",
    bookingSchema
  );

export default Booking;