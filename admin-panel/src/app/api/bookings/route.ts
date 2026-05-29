import { NextResponse } from "next/server";
import { connectDB } from "@/backend/lib/mongodb";
import Booking from "@/backend/models/Booking";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();

    // Retrieve 100% of active/pending dispatches to guarantee operators never miss an active case
    const activeBookings = await Booking.find({
      status: { $nin: ["COMPLETED", "CANCELLED"] }
    }).sort({ createdAt: -1 });

    // Limit historical completed/cancelled cases to the most recent 50 to maintain high speed
    const recentArchived = await Booking.find({
      status: { $in: ["COMPLETED", "CANCELLED"] }
    }).sort({ createdAt: -1 }).limit(50);

    // Merge and sort by createdAt descending
    const bookings = [...activeBookings, ...recentArchived].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    const serviceLabels: Record<string, string> = {
      TOWING: "Flatbed Towing",
      BATTERY: "Battery Jumpstart",
      URGENT_BATTERY:"Urgent Battery",
      EV: "Mobile EV Charging",
      LOCKOUT: "Lockout Assistance",
      FUEL: "Emergency Fuel Delivery",
      FLAT_TYRE: "Flat Tyre Replacement",
      ENGINE: "Engine Diagnostics",
      ACCIDENT: "Accident Recovery",
      OTHER: "Other Assistance",
    };
    
    // Normalize MongoDB documents for compatibility with the admin/Zustand store
    const normalizedBookings =
  bookings.map((b) => {

    const obj =
      b.toObject();

    return {
      ...obj,

      id:
        obj.ticketId ||
        obj._id.toString(),

      customerName:
        obj.customer?.name ||
        obj.customerName ||
        "Customer",

      customerPhone:
        obj.customer?.phone ||
        obj.phone ||
        "",

      phone:
        obj.customer?.phone ||
        obj.phone ||
        "",

      vehicleType:
        obj.vehicle?.type ||
        obj.vehicleType ||
        "Car",

      vehicleName:
        obj.vehicleType ||
        obj.vehicleName ||
        "Vehicle",

      vehicleNumber:
        obj.vehicle?.plateNumber ||
        obj.vehicleNumber ||
        "",

      vehiclePlate:
        obj.vehicle?.plateNumber ||
        obj.vehiclePlate ||
        "",

      imageUrl:
        obj.images?.[0] ||
        obj.imageUrl ||
        null,

      status:
        (
          obj.status ||
          "PENDING"
        ).toLowerCase(),

      subStatus:
        obj.subStatus
          ? obj.subStatus.toLowerCase()
          : null,

      location:
        obj.location
          ?.address ||
        obj.addressString ||
        "Unknown Location",

      address:
        obj.location
          ?.address ||
        obj.addressString ||
        "",

      serviceType:
        (
          obj.serviceType ||
          "OTHER"
        ).toLowerCase(),

      serviceLabel:
        ({
          towing:
            "Flatbed Towing",

          battery:
            "Battery Jumpstart",

          ev:
            "Mobile EV Charging",

          lockout:
            "Lockout Assistance",

          fuel:
            "Emergency Fuel Delivery",

          flat_tyre:
            "Flat Tyre Replacement",

          engine:
            "Engine Diagnostics",

          accident:
            "Accident Recovery",

          other:
            "Other Assistance",
        } as any)[
          (
            obj.serviceType ||
            "OTHER"
          ).toLowerCase()
        ] ||
        "Roadside Help",

      paymentAmount:
        obj.paymentAmount ||
        0,

      paymentStatus:
        (
          obj.paymentStatus ||
          "PENDING"
        ).toLowerCase(),

      technicianId:
        obj.technicianId,

      technicianName:
        obj.technicianName,

      coordinates:
        obj.location
          ?.coordinates
          ?.length === 2
          ? {
              lat:
                obj.location
                  .coordinates[1],

              lng:
                obj.location
                  .coordinates[0],
            }
          : {
              lat:
                12.9716,

              lng:
                77.5946,
            },

      createdTime:
        "Just Now",
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
