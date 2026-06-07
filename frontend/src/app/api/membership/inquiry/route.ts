import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Inquiry from "@/models/Inquiry";

export async function POST(request: Request) {
  try {
    await connectDB();

    const body = await request.json();
    
    // Whitelist and sanitize inputs
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const plan = typeof body.plan === "string" ? body.plan.trim() : "";
    const vehicleDetails = typeof body.vehicleDetails === "string" ? body.vehicleDetails.trim() : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";

    // Validation
    if (!name || !phone || !email || !plan) {
      return NextResponse.json(
        { success: false, error: "Please fill in all required fields (Name, Phone, Email, Plan)." },
        { status: 400 }
      );
    }

    // Email basic validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    // Create the inquiry
    const inquiry = await Inquiry.create({
      name,
      phone,
      email,
      plan,
      vehicleDetails,
      message,
    });

    return NextResponse.json({
      success: true,
      message: "Subscription inquiry submitted successfully!",
      inquiry: {
        id: inquiry._id.toString(),
        name: inquiry.name,
        plan: inquiry.plan,
      },
    });
  } catch (error: any) {
    console.error("Error creating subscription inquiry:", error);
    return NextResponse.json(
      { success: false, error: error.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
