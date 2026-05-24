import {
  NextRequest,
  NextResponse,
} from "next/server";

import { connectDB }
from "@/database/mongodb";

import adminController
from "@/modules/admin/admin.controller";

export async function PATCH(
  request: NextRequest
) {
  try {
    await connectDB();

    const body =
      await request.json();

    return adminController.updateTechnicianStatus(
      body
    );
  } catch (error) {
    console.error(error);

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