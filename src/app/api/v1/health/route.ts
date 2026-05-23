import { NextResponse }
from "next/server";

import {
  connectDB,
} from "@/database/mongodb";

export async function GET() {
  try {
    await connectDB();

    return NextResponse.json({
      success: true,
      message:
        "RSA Backend Running",
      database:
        "connected",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        database:
          "disconnected",
      },
      {
        status: 500,
      }
    );
  }
}