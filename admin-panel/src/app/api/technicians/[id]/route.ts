import { NextResponse } from "next/server";
import { connectDB } from "@/backend/lib/mongodb";
import Technician from "@/backend/models/Technician";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    const technician = await Technician.findOne({
      technicianId: id,
    });

    if (!technician) {
      return NextResponse.json(
        {
          success: false,
          error: "Technician not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(technician);
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    const body = await request.json();

    const technician =
      await Technician.findOneAndUpdate(
        {
          technicianId: id,
        },
        {
          $set: body,
        },
        {
          new: true,
        }
      );

    if (!technician) {
      return NextResponse.json(
        {
          success: false,
          error: "Technician not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      technician,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}