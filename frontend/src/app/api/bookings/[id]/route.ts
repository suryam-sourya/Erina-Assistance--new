import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const resolvedParams = await params;
    
    // Attempt to locate booking in MongoDB.
    const booking = await Booking.findById(resolvedParams.id);

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    const obj = booking.toObject();

    // Map serviceType uppercase tags to readable display labels
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

    // ── Normalization Mapping for 100% Backward Compatibility ────────────
    const normalizedBooking = {
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
      location: obj.location?.coordinates && Array.isArray(obj.location.coordinates) && obj.location.coordinates.length >= 2
        ? { lat: obj.location.coordinates[1], lng: obj.location.coordinates[0] } // [longitude, latitude] to {lat, lng}
        : (obj.location || { lat: 12.9716, lng: 77.5946 }),
    };

    return NextResponse.json({
      success: true,
      booking: normalizedBooking,
    });
  } catch (error: any) {
    console.error("Error fetching single booking:", error);
    return NextResponse.json(
      { success: false, error: error.message || error },
      { status: 500 }
    );
  }
}
