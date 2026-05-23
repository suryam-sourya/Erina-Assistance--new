import { NextRequest, NextResponse }
from "next/server";

import {
  bookingService,
} from "./booking.service";

export class BookingController {
  async createBooking(
    req: NextRequest
  ) {
    try {
      const body =
        await req.json();

      const response =
        await bookingService.createBooking(
          body
        );

      return NextResponse.json(
        response,
        {
          status: 201,
        }
      );
    } catch (error: any) {
      console.error(
        "Create Booking Controller Error:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          message:
            error.message ||
            "Failed to create booking",
        },
        {
          status: 400,
        }
      );
    }
  }

  async getBookingByTicketId(
    ticketId: string
  ) {
    try {
      const response =
        await bookingService.getBookingByTicketId(
          ticketId
        );

      return NextResponse.json(
        response
      );
    } catch (error: any) {
      return NextResponse.json(
        {
          success: false,
          message:
            error.message ||
            "Booking not found",
        },
        {
          status: 404,
        }
      );
    }
  }

  async cancelBooking(
    ticketId: string
  ) {
    try {
      const response =
        await bookingService.cancelBooking(
          ticketId
        );

      return NextResponse.json(
        response
      );
    } catch (error: any) {
      return NextResponse.json(
        {
          success: false,
          message:
            error.message ||
            "Failed to cancel booking",
        },
        {
          status: 400,
        }
      );
    }
  }

  async getBookingsByPhone(
    phone: string
  ) {
    try {
      const response =
        await bookingService.getBookingsByPhone(
          phone
        );

      return NextResponse.json(
        response
      );
    } catch (error: any) {
      return NextResponse.json(
        {
          success: false,
          message:
            error.message ||
            "Failed to fetch bookings",
        },
        {
          status: 400,
        }
      );
    }
  }
}

export const bookingController =
  new BookingController();