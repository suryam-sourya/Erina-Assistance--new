import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    // Map serviceType to human-readable label if missing
    if (!body.serviceLabel && body.serviceType) {
      const serviceLabels: Record<string, string> = {
        towing: "Flatbed Towing",
        battery: "Battery Jumpstart",
        ev: "Mobile EV Charging",
        lockout: "Lockout Assistance",
        fuel: "Emergency Fuel Delivery",
        flat_tyre: "Flat Tyre Replacement",
        engine: "Engine Diagnostics",
        accident: "Accident Recovery",
      };
      
      const type = body.serviceType.toLowerCase();
      body.serviceLabel = serviceLabels[type] || `${body.serviceType} Assistance`;
    }

    // Map vehicle fields for compatibility
    if (body.vehicleType && !body.vehicleName) {
      body.vehicleName = body.vehicleType;
    }
    if (body.vehicleNumber && !body.vehiclePlate) {
      body.vehiclePlate = body.vehicleNumber;
    }
    if (body.vehiclePlate && !body.vehicleNumber) {
      body.vehicleNumber = body.vehiclePlate;
    }

    // Ensure status is lowercase 'pending' for consistency with UI store
    if (body.status) {
      body.status = body.status.toLowerCase();
    } else {
      body.status = "pending";
    }

    const booking = await Booking.create(body);

    return NextResponse.json({
      success: true,
      booking,
    });
  } catch (error: any) {
    console.error("Error creating booking:", error);
    return NextResponse.json({
      success: false,
      error: error.message || error,
    }, { status: 500 });
  }
}
