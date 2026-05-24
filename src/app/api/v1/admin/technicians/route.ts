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
    await connectDB();

    const searchParams =
      request.nextUrl
        .searchParams;

    return adminController.getAllTechnicians(
      searchParams
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

export async function POST(
  request: NextRequest
) {
  try {
    await connectDB();

    const body =
      await request.json();

    return adminController.createTechnician(
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