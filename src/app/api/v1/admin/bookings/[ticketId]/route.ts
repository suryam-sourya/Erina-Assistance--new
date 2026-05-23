import { NextRequest }
from "next/server";

import { connectDB }
from "@/database/mongodb";

import adminController
from "@/modules/admin/admin.controller";

interface RouteParams {
  params: Promise<{
    ticketId: string;
  }>;
}

export async function GET(
  _req: NextRequest,
  { params }: RouteParams
) {
  try {
    await connectDB();

    const {
      ticketId,
    } = await params;

    return adminController.getBookingByTicket(
      ticketId
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