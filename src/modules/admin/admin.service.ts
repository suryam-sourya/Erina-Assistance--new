import adminRepository from "./admin.repository";

class AdminService {
  async getAllBookings(query: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    serviceType?: string;
  }) {
    return await adminRepository.getAllBookings(
      query
    );
  }

  async getBookingByTicket(
    ticketId: string
  ) {
    const booking =
      await adminRepository.getBookingByTicket(
        ticketId
      );

    if (!booking) {
      throw new Error(
        "Booking not found"
      );
    }

    return {
      ticketId:
        booking.ticketId,

      customer:
        booking.customer,

      vehicle:
        booking.vehicle,

      serviceType:
        booking.serviceType,

      description:
        booking.description,

      location:
        booking.location,

      status:
        booking.status,

      technicianId:
        booking.technicianId,

      technicianName:
        booking.technicianName,

      estimatedArrivalTime:
        booking.estimatedArrivalTime,

      paymentStatus:
        booking.paymentStatus,

      paymentAmount:
        booking.paymentAmount,

      createdAt:
        booking.createdAt,
    };
  }

  async assignTechnician(
  ticketId: string,
  technicianId: string,
  estimatedArrivalTime?: number
) {
  const booking =
    await adminRepository.getBookingByTicket(
      ticketId
    );

  if (!booking) {
    throw new Error(
      "Booking not found"
    );
  }

  if (
    booking.status !==
    "PENDING"
  ) {
    throw new Error(
      `Booking already ${booking.status}`
    );
  }

  const updatedBooking =
    await adminRepository.assignTechnician(
      ticketId,
      technicianId,
      estimatedArrivalTime
    );

  if (!updatedBooking) {
    throw new Error(
      "Failed to assign technician"
    );
  }

  return {
    success: true,
    message:
      "Technician assigned successfully",
    data: updatedBooking,
  };
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
    const allowedStatuses: string[] =
  [
    "PENDING",
    "ASSIGNED",
    "ACCEPTED",
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELLED",
  ];
    
    if (
      !allowedStatuses.includes(
        status
      )
    ) {
      throw new Error(
        "Invalid booking status"
      );
    }

    const updatedBooking =
      await adminRepository.updateBookingStatus(
        ticketId,
        status
      );

    if (!updatedBooking) {
      throw new Error(
        "Booking not found"
      );
    }

    return {
      success: true,
      message:
        "Booking status updated successfully",
      data: updatedBooking,
    };
  }

  async getDashboardStats() {
    return await adminRepository.getDashboardStats();
  }
}

export default new AdminService();