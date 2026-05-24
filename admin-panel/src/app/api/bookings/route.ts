import { NextResponse } from "next/server";
import { connectDB } from "@/backend/lib/mongodb";
import Booking from "@/backend/models/Booking";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();
    
    const bookings = await Booking.find().sort({
      createdAt: -1,
    });

    const serviceLabels: Record<string, string> = {
      TOWING: "Flatbed Towing",
      BATTERY: "Battery Jumpstart",
      EV: "Mobile EV Charging",
      LOCKOUT: "Lockout Assistance",
      FUEL: "Emergency Fuel Delivery",
      FLAT_TYRE: "Flat Tyre Replacement",
      ENGINE: "Engine Diagnostics",
      ACCIDENT: "Accident Recovery",
      OTHER: "Other Assistance",
    };
    
    // Normalize MongoDB documents for compatibility with the admin/Zustand store
    const normalizedBookings = bookings.map(b => {
      const obj = b.toObject();
      
      return {
        ...obj,
        id: obj._id.toString(),
        customerName: obj.customer?.name || obj.customerName || "Customer",
        phone: obj.customer?.phone || obj.phone || "",
        vehicleType: obj.vehicle?.type || obj.vehicleType || "Car (Hatchback/Sedan)",
        vehicleNumber: obj.vehicle?.plateNumber || obj.vehicleNumber || "",
        vehiclePlate: obj.vehicle?.plateNumber || obj.vehiclePlate || "",
        imageUrl: (obj.images && obj.images.length > 0) ? obj.images[0] : obj.imageUrl,
        status: (obj.status || "pending").toLowerCase(),
        address: obj.location?.address || obj.address || "",
        serviceLabel: serviceLabels[obj.serviceType || ""] || obj.serviceLabel || "Roadside Help",
        location: obj.location?.address || obj.address || "Bengaluru", // Fallback text location
        coordinates: obj.location?.coordinates && Array.isArray(obj.location.coordinates) && obj.location.coordinates.length >= 2
          ? { lat: obj.location.coordinates[1], lng: obj.location.coordinates[0] }
          : { lat: 12.9716, lng: 77.5946 },
      };
    });

    return NextResponse.json(normalizedBookings, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store, max-age=0, must-revalidate",
      },
    });
  } catch (error: any) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json({
      success: false,
      error: error.message || error,
    }, { status: 500 });
  }
}
