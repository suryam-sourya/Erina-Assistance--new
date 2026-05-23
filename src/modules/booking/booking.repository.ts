import Booking, {
  IBooking,
} from "@/database/models/booking.model";

import {
  CreateBookingDTO,
} from "./booking.types";

export class BookingRepository {
  async createBooking(
    payload: CreateBookingDTO,
    ticketId: string
  ): Promise<IBooking> {
    const booking =
      await Booking.create({
        ticketId,

        customer:
          payload.customer,

        vehicle:
          payload.vehicle,

        serviceType:
          payload.serviceType,

        description:
          payload.description ||
          "",

        isPriority:
          payload.isPriority ||
          false,

        images:
          payload.images || [],

        location: {
          type: "Point",

          coordinates: [
            payload.location.lng,
            payload.location.lat,
          ],

          address:
            payload.location
              .address || "",
        },

        status: "PENDING",

        technicianId: null,

        technicianName:
          null,

        estimatedArrivalTime:
          null,
        paymentStatus:
            payload.paymentStatus ||
            "PENDING",

        paymentAmount:
            payload.paymentAmount ||
             null,
        createdBy:
          payload.createdBy ||
          null,
      });

    return booking;
  }

  async getBookingByTicketId(
    ticketId: string
  ): Promise<IBooking | null> {
    return Booking.findOne({
      ticketId,
    });
  }

  async getBookingById(
    bookingId: string
  ): Promise<IBooking | null> {
    return Booking.findById(
      bookingId
    );
  }

  async cancelBooking(
    ticketId: string
  ): Promise<IBooking | null> {
    return Booking.findOneAndUpdate(
      { ticketId },

      {
        status: "CANCELLED",
      },

      {
        new: true,
      }
    );
  }

  async getBookingsByPhone(
    phone: string
  ): Promise<IBooking[]> {
    return Booking.find({
      "customer.phone":
        phone,
    }).sort({
      createdAt: -1,
    });
  }

  async getAllBookings() {
    return Booking.find().sort({
      createdAt: -1,
    });
  }
}

export const bookingRepository =
  new BookingRepository();