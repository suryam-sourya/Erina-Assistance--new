import { NextResponse } from "next/server";
import { connectDB } from "@/backend/lib/mongodb";
import Technician from "@/backend/models/Technician";

export async function GET() {
  try {
    await connectDB();

    const technicians =
      await Technician.find()
        .sort({
          createdAt: -1,
        });

    return NextResponse.json(
      technicians
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          "Failed to fetch technicians",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(
  request: Request
) {
  try {
    await connectDB();

    const body =
      await request.json();
    const phone =
  String(body.phone || "")
    .replace(/\D/g, "");

if (phone.length !== 10) {
  return NextResponse.json(
    {
      success: false,
      error:
        "Phone number must contain exactly 10 digits",
    },
    {
      status: 400,
    }
  );
}  

    const technician =
  await Technician.create({
    ...body,
    phone,
  });

    return NextResponse.json(
      technician
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error:
          error.message,
      },
      {
        status: 500,
      }
    );
  }
}