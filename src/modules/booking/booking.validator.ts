import { z } from "zod";

export const createBookingSchema =
  z.object({
    customer: z.object({
      name: z
        .string()
        .min(
          2,
          "Customer name is required"
        )
        .max(
          50,
          "Name too long"
        ),

      phone: z
        .string()
        .regex(
          /^[6-9]\d{9}$/,
          "Invalid phone number"
        ),
    }),

    vehicle: z.object({
      type: z.enum([
        "CAR",
        "SUV",
        "LUXURY",
        "BIKE",
        "COMMERCIAL",
        "EV",
      ]),

      plateNumber: z
        .string()
        .min(
          4,
          "Vehicle number required"
        )
        .max(
          20,
          "Vehicle number too long"
        ),
    }),

    serviceType: z.enum([
      "TOWING",
      "FLAT_TYRE",
      "BATTERY",
      "FUEL_DELIVERY",
      "LOCKOUT",
      "ENGINE_FAILURE",
      "ACCIDENT",
      "OTHER",
    ]),

    description: z
      .string()
      .max(
        500,
        "Description too long"
      )
      .optional(),

    isPriority:
      z.boolean().optional(),

    images: z
      .array(z.string().url())
      .optional(),

    location: z.object({
      lat: z
        .number()
        .min(-90)
        .max(90),

      lng: z
        .number()
        .min(-180)
        .max(180),

      address:
        z.string().optional(),
    }),
    paymentStatus: z
        .enum([
            "PENDING",
            "COMPLETED",
            "FAILED",
        ])
        .optional(),

    paymentAmount: z
        .number()
        .min(0)
        .optional(),
    createdBy: z
      .string()
      .nullable()
      .optional(),
  });

export type CreateBookingInput =
  z.infer<
    typeof createBookingSchema
  >;