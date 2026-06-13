import { NextResponse } from "next/server";
import { connectDB } from "@/backend/lib/mongodb";
import Technician from "@/backend/models/Technician";
import Booking from "@/backend/models/Booking";
import mongoose from "mongoose";

export async function GET() {
  try {
    await connectDB();

    const technicians = await Technician.find().sort({
      createdAt: -1,
    });

    // Self-healing database check: release technicians if their assigned job is completed, cancelled, or missing
    for (const tech of technicians) {
      if (tech.currentJob) {
        const job = mongoose.Types.ObjectId.isValid(tech.currentJob)
          ? await Booking.findById(tech.currentJob)
          : await Booking.findOne({ ticketId: tech.currentJob });

        let shouldRelease = false;
        if (!job) {
          shouldRelease = true;
        } else {
          const status = (job.status || "").toUpperCase();
          if (status === "COMPLETED" || status === "CANCELLED") {
            shouldRelease = true;
          }
        }

        if (shouldRelease) {
          tech.availability = "available";
          tech.currentJob = null;
          await tech.save();
        }
      }
    }

    return NextResponse.json(technicians);
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