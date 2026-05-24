import { NextResponse } from "next/server";

import adminService from "./admin.service";

class AdminController {
  async getAllBookings(
    searchParams: URLSearchParams
  ) {
    try {
      const page = Number(
        searchParams.get("page")
      ) || 1;

      const limit = Number(
        searchParams.get("limit")
      ) || 10;

      const search =
        searchParams.get(
          "search"
        ) || "";

      const status =
        searchParams.get(
          "status"
        ) || "";

      const serviceType =
        searchParams.get(
          "serviceType"
        ) || "";

      const result =
        await adminService.getAllBookings(
          {
            page,
            limit,
            search,
            status,
            serviceType,
          }
        );

      return NextResponse.json(
        {
          success: true,
          message:
            "Bookings fetched successfully",
          data: result,
        },
        {
          status: 200,
        }
      );
    } catch (error: any) {
      return NextResponse.json(
        {
          success: false,
          message:
            error.message,
        },
        {
          status: 500,
        }
      );
    }
  }

  async getBookingByTicket(
    ticketId: string
  ) {
    try {
      const booking =
        await adminService.getBookingByTicket(
          ticketId
        );

      return NextResponse.json(
        {
          success: true,
          message:
            "Booking fetched successfully",
          data: booking,
        },
        {
          status: 200,
        }
      );
    } catch (error: any) {
      return NextResponse.json(
        {
          success: false,
          message:
            error.message,
        },
        {
          status: 404,
        }
      );
    }
  }

  async assignTechnician(
  body: {
    ticketId: string;
    technicianId: string;
    estimatedArrivalTime?: number;
  }
) {
  try {
    const result =
      await adminService.assignTechnician(
  body.ticketId,
  body.technicianId,
  body.estimatedArrivalTime
);
    return NextResponse.json(
      result,
      {
        status: 200,
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message:
          error.message,
      },
      {
        status: 400,
      }
    );
  }
}

  async updateBookingStatus(
    body: {
      ticketId: string;
      status:
      | "PENDING"
      | "ASSIGNED"
      | "ACCEPTED"
      | "IN_PROGRESS"
      | "COMPLETED"
      | "CANCELLED";
    }
  ) {
    try {
      const result =
        await adminService.updateBookingStatus(
          body.ticketId,
          body.status
        );

      return NextResponse.json(
        result,
        {
          status: 200,
        }
      );
    } catch (error: any) {
      return NextResponse.json(
        {
          success: false,
          message:
            error.message,
        },
        {
          status: 400,
        }
      );
    }
  }

  async getDashboardStats() {
    try {
      const stats =
        await adminService.getDashboardStats();

      return NextResponse.json(
        {
          success: true,
          message:
            "Dashboard stats fetched successfully",
          data: stats,
        },
        {
          status: 200,
        }
      );
    } catch (error: any) {
      return NextResponse.json(
        {
          success: false,
          message:
            error.message,
        },
        {
          status: 500,
        }
      );
    }
  }
}

export default new AdminController();