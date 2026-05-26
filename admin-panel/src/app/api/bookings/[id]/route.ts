import { NextResponse } from "next/server";
import { connectDB } from "@/backend/lib/mongodb";
import Booking from "@/backend/models/Booking";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const body = await req.json();

    // Clone request body to safely manipulate properties
    const updateData = { ...body };

    // Standardize status updates to uppercase in DB to match new nested schema
    if (updateData.status) {
      updateData.status = updateData.status.toUpperCase();
    }

    // Find and update the booking. We accept both MongoDB ObjectId and string representation.
    const booking = await Booking.findByIdAndUpdate(
      resolvedParams.id,
      updateData,
      { new: true }
    );

    if (!booking) {
      return NextResponse.json({
        success: false,
        error: "Booking not found",
      }, { status: 404 });
    }

    const obj = booking.toObject();

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

    // Normalize output format to retain full backward compatibility with flat key frameworks
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
      subStatus: obj.subStatus ? obj.subStatus.toLowerCase() : null,
      address: obj.location?.address || obj.address || "",
      serviceLabel: serviceLabels[obj.serviceType || ""] || obj.serviceLabel || "Roadside Help",
      location: obj.location?.address || obj.address || "Bengaluru",
      coordinates: obj.location?.coordinates && Array.isArray(obj.location.coordinates) && obj.location.coordinates.length >= 2
        ? { lat: obj.location.coordinates[1], lng: obj.location.coordinates[0] }
        : { lat: 12.9716, lng: 77.5946 },
    };

    return NextResponse.json(normalizedBooking);
  } catch (error: any) {
    console.error("Error updating booking:", error);
    return NextResponse.json({
      success: false,
      error: error.message || error,
    }, { status: 500 });
  }
}
