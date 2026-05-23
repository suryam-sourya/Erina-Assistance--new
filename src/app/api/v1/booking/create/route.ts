import { NextRequest }
from "next/server";

import {
  connectDB,
} from "@/database/mongodb";

import {
  bookingController,
} from "@/modules/booking/booking.controller";

export async function POST(
  req: NextRequest
) {
  try {
    await connectDB();

    return bookingController.createBooking(
      req
    );
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
        message:
          "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}