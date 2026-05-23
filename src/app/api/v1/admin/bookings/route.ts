import {
  NextRequest,
  NextResponse,
} from "next/server";

import { connectDB }
from "@/database/mongodb";

import adminController
from "@/modules/admin/admin.controller";

export async function GET(
  request: NextRequest
) {
  try {
    console.log(
      "Admin bookings route hit"
    );

    await connectDB();

    console.log(
      "DB connected"
    );

    const searchParams =
      request.nextUrl.searchParams;

    return adminController.getAllBookings(
      searchParams
    );
  } catch (error) {
    console.error(
      "Admin Route Error:",
      error
    );

    return NextResponse.json(
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