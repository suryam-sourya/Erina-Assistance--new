import BookingModel from "@/database/models/booking.model";
import TechnicianModel from "@/database/models/technician.model";

interface GetBookingsQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  serviceType?: string;
}

class AdminRepository {
  async getAllBookings(query: GetBookingsQuery) {
    const {
      page = 1,
      limit = 10,
      search = "",
      status,
      serviceType,
    } = query;

    const skip = (page - 1) * limit;

    const filters: any = {};

    // Search filter
    if (search) {
      filters.$or = [
        { ticketId: { $regex: search, $options: "i" } },
        { "customer.name": { $regex: search, $options: "i" } },
        { "customer.phone": { $regex: search, $options: "i" } },
        { "vehicle.plateNumber": { $regex: search, $options: "i" } },
        { "location.address": { $regex: search, $options: "i" } },
      ];
    }

    // Status filter
    if (status) {
      filters.status = status;
    }

    // Service filter
    if (serviceType) {
      filters.serviceType = serviceType;
    }

    const [bookings, total] = await Promise.all([
      BookingModel.find(filters)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      BookingModel.countDocuments(filters),
    ]);

    return {
      bookings,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getBookingByTicket(ticketId: string) {
    return BookingModel.findOne({ ticketId });
  }

async assignTechnician(
  ticketId: string,
  technicianId: string,
  estimatedArrivalTime?: number
) {
  const technician =
    await TechnicianModel.findOne({
      technicianId,
    });

  if (!technician) {
    throw new Error(
      "Technician not found"
    );
  }

  if (
    technician.availability !==
    "AVAILABLE"
  ) {
    throw new Error(
      "Technician unavailable"
    );
  }

  const updatedBooking =
    await BookingModel.findOneAndUpdate(
      {
        ticketId,
        status: "PENDING",
      },
      {
        technicianId,
        technicianName:
          technician.name,
        status: "ASSIGNED",
        estimatedArrivalTime:
          estimatedArrivalTime ||
          20,
      },
      {
        new: true,
      }
    );

  if (!updatedBooking) {
    throw new Error(
      "Booking already assigned"
    );
  }

  technician.availability =
    "BUSY";

  await technician.save();

  return updatedBooking;
}
  async updateBookingStatus(
  ticketId: string,
  status:
    | "PENDING"
    | "ASSIGNED"
    | "ACCEPTED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED"
) {
  const booking =
    await BookingModel.findOne({
      ticketId,
    });

  if (!booking) {
    throw new Error(
      "Booking not found"
    );
  }

  const currentStatus =
    booking.status;

  const validTransitions = {
    PENDING: [
      "ASSIGNED",
      "CANCELLED",
    ],

    ASSIGNED: [
      "IN_PROGRESS",
      "CANCELLED",
    ],

    ACCEPTED: [
      "IN_PROGRESS",
    ],

    IN_PROGRESS: [
      "COMPLETED",
    ],

    COMPLETED: [],

    CANCELLED: [],
  };

  const allowedStatuses:
  string[] =
    validTransitions[
      currentStatus as keyof typeof validTransitions
    ] || [];

  if (
    !allowedStatuses.includes(
      status
    )
  ) {
    throw new Error(
      `Invalid status transition from ${currentStatus} to ${status}`
    );
  }

  booking.status =
    status;

  // Release technician
  if (
    [
      "COMPLETED",
      "CANCELLED",
    ].includes(status) &&
    booking.technicianId
  ) {
    await TechnicianModel.findOneAndUpdate(
      {
        technicianId:
          String(
            booking.technicianId
          ),
      },
      {
        availability:
          "AVAILABLE",
      }
    );
  }

  await booking.save();

  return booking;
}

  async getDashboardStats() {
    const [
      totalBookings,
      pendingBookings,
      activeEmergencies,
      completedBookings,
      availableTechnicians,
    ] = await Promise.all([
      BookingModel.countDocuments(),

      BookingModel.countDocuments({
        status: "PENDING",
      }),

      BookingModel.countDocuments({
        isPriority: true,
        status: {
          $in: [
            "PENDING",
            "ASSIGNED",
            "IN_PROGRESS",
          ],
        },
      }),

      BookingModel.countDocuments({
        status: "COMPLETED",
      }),

      TechnicianModel.countDocuments({
        availability:
          "AVAILABLE",
      }),
    ]);

    return {
      totalBookings,
      pendingBookings,
      activeEmergencies,
      completedBookings,
      availableTechnicians,
    };
  }
}

export default new AdminRepository();