import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";

export async function GET(req: Request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const phoneRaw = searchParams.get("phone");

    if (!phoneRaw || typeof phoneRaw !== "string") {
      return NextResponse.json(
        { success: false, error: "Phone number query parameter is required" },
        { status: 400 }
      );
    }

    // Strict NoSQL injection and format sanitizer: retain only digits and optional '+' prefix
    const phone = phoneRaw.replace(/[^\d+]/g, "").trim();
    
    if (phone.length < 5 || phone.length > 15) {
      return NextResponse.json(
        { success: false, error: "Invalid phone number format" },
        { status: 400 }
      );
    }

    // Query across both modern nested 'customer.phone' and legacy flat 'phone' key
    const bookings = await Booking.find({
      $or: [
        { "customer.phone": phone },
        { phone: phone }
      ]
    }).sort({ createdAt: -1 });

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

    const normalizedBookings = bookings.map((b) => {
      const obj = b.toObject();
      return {
        ...obj,
        id: obj._id.toString(),
        customerName: obj.customer?.name || obj.customerName || "Customer",
        phone: obj.customer?.phone || obj.phone || "",
        technicianPhone: obj.technicianPhone || "",
        vehicleType: obj.vehicle?.type || obj.vehicleType || "Car (Hatchback/Sedan)",
        vehicleNumber: obj.vehicle?.plateNumber || obj.vehicleNumber || "",
        vehiclePlate: obj.vehicle?.plateNumber || obj.vehiclePlate || "",
        imageUrl: (obj.images && obj.images.length > 0) ? obj.images[0] : obj.imageUrl,
        status: (obj.status || "pending").toLowerCase(),
        subStatus: obj.subStatus ? obj.subStatus.toLowerCase() : null,
        address: obj.location?.address || obj.address || "",
        serviceLabel: serviceLabels[obj.serviceType || ""] || obj.serviceLabel || "Roadside Help",
        location: obj.location?.coordinates && Array.isArray(obj.location.coordinates) && obj.location.coordinates.length >= 2
          ? { lat: obj.location.coordinates[1], lng: obj.location.coordinates[0] }
          : (obj.location || { lat: 12.9716, lng: 77.5946 }),
      };
    });

    return NextResponse.json({
      success: true,
      bookings: normalizedBookings,
    });
  } catch (error: any) {
    console.error("Error retrieving bookings by phone number:", error);
    return NextResponse.json(
      { success: false, error: error.message || error },
      { status: 500 }
    );
  }
}
