import {
  bookingRepository,
} from "./booking.repository";

import {
  CreateBookingDTO,
} from "./booking.types";

import {
  createBookingSchema,
} from "./booking.validator";

export class BookingService {
  async createBooking(
    payload: CreateBookingDTO
  ) {
    try {
      // Validate request
      const validatedPayload =
        createBookingSchema.parse(
          payload
        );

      // Generate ticket ID
      const ticketId =
        this.generateTicketId();

      // Save booking
      const booking =
        await bookingRepository.createBooking(
          validatedPayload,
          ticketId
        );

      // Future:
      // WhatsApp Notification
      // Admin Notification
      // Activity Logs

      return {
        success: true,
        message:
          "Booking created successfully",

        data: booking,
      };
    } catch (error: any) {
  console.error(
    "Create Booking Error:",
    error
  );

  // Zod validation error
  if (error.errors?.length) {
    throw new Error(
      error.errors[0].message
    );
  }

  throw new Error(
    error.message ||
      "Failed to create booking"
  );
}
  }

  async getBookingByTicketId(
    ticketId: string
  ) {
    const booking =
      await bookingRepository.getBookingByTicketId(
        ticketId
      );

    if (!booking) {
      throw new Error(
        "Booking not found"
      );
    }

    return {
      success: true,
      message:
        "Booking fetched successfully",

      data: booking,
    };
  }

  async cancelBooking(
    ticketId: string
  ) {
    const booking =
      await bookingRepository.cancelBooking(
        ticketId
      );

    if (!booking) {
      throw new Error(
        "Booking not found"
      );
    }

    return {
      success: true,
      message:
        "Booking cancelled successfully",

      data: booking,
    };
  }

  async getBookingsByPhone(
    phone: string
  ) {
    const bookings =
      await bookingRepository.getBookingsByPhone(
        phone
      );

    return {
      success: true,
      message:
        "Bookings fetched successfully",

      data: bookings,
    };
  }

  private generateTicketId() {
    const randomNumber =
      Math.floor(
        1000 +
          Math.random() *
            9000
      );

    return `RSA-${randomNumber}`;
  }
}

export const bookingService =
  new BookingService();