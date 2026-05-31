import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const body = await req.json();
    const { rating, tags, comment } = body;

    // Validation
    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: "Rating must be a number between 1 and 5." },
        { status: 400 }
      );
    }

    const booking = await Booking.findById(id);

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found." },
        { status: 404 }
      );
    }

    // Set the feedback payload
    booking.feedback = {
      rating,
      tags: Array.isArray(tags) ? tags : [],
      comment: typeof comment === "string" ? comment : "",
      submittedAt: new Date(),
    };

    await booking.save();

    return NextResponse.json({
      success: true,
      message: "Feedback submitted successfully.",
      feedback: booking.feedback,
    });
  } catch (error: any) {
    console.error("Error submitting feedback:", error);
    return NextResponse.json(
      { success: false, error: error.message || error },
      { status: 500 }
    );
  }
}
