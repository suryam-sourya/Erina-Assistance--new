import { NextResponse } from "next/server";
import { connectDB } from "@/backend/lib/mongodb";
import Booking from "@/backend/models/Booking";

export const dynamic = "force-dynamic";

async function checkAndAutoCancelBooking(booking: any) {
  if (!booking) return;
  const statusUpper = (booking.status || "").toUpperCase();
  if (statusUpper !== "COMPLETED" && statusUpper !== "CANCELLED") {
    const createdAtTime = new Date(booking.createdAt).getTime();
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    if (createdAtTime < oneHourAgo) {
      booking.status = "CANCELLED";
      booking.paymentStatus = "CANCELLED";
      if (!booking.timeline) {
        booking.timeline = {};
      }
      booking.timeline.cancelledAt = new Date();
      await booking.save();

      // Sync cancellation to Cloud Firestore
      try {
        const { db } = await import("@/frontend/lib/firebase");
        const { doc, updateDoc } = await import("firebase/firestore");
        if (db && typeof db.app !== 'undefined') {
          await updateDoc(doc(db, "active_bookings", booking._id.toString()), {
            status: "cancelled",
            timeline: {
              confirmedAt: booking.timeline?.confirmedAt ? new Date(booking.timeline.confirmedAt).toISOString() : new Date(booking.createdAt || Date.now()).toISOString(),
              assignedAt: booking.timeline?.assignedAt ? new Date(booking.timeline.assignedAt).toISOString() : null,
              enRouteAt: booking.timeline?.enRouteAt ? new Date(booking.timeline.enRouteAt).toISOString() : null,
              arrivedAt: booking.timeline?.arrivedAt ? new Date(booking.timeline.arrivedAt).toISOString() : null,
              completedAt: booking.timeline?.completedAt ? new Date(booking.timeline.completedAt).toISOString() : null,
              cancelledAt: booking.timeline?.cancelledAt ? new Date(booking.timeline.cancelledAt).toISOString() : new Date().toISOString(),
            }
          });
        }
      } catch (fsErr) {
        console.warn("Firestore auto-cancellation sync failed in admin API:", fsErr);
      }
    }
  }
}

export async function GET() {
  try {
    await connectDB();

    // Retrieve 100% of active/pending dispatches to guarantee operators never miss an active case
    const activeBookings = await Booking.find({
      status: { $nin: ["COMPLETED", "CANCELLED"] }
    }).sort({ createdAt: -1 });

    for (const b of activeBookings) {
      await checkAndAutoCancelBooking(b);
    }

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
      urgent_battery: "Urgent Battery",
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
          
            urgent_battery:
            "Urgent Battery",  

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
                12.9928671,

              lng:
                77.7529829,
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
