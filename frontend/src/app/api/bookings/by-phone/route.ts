import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

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
        if (db && typeof db.app !== 'undefined') {
          await updateDoc(doc(db, "active_bookings", booking._id.toString()), {
            status: "cancelled",
            timeline: {
              confirmedAt: booking.timeline.confirmedAt ? booking.timeline.confirmedAt.toISOString() : new Date(booking.createdAt).toISOString(),
              assignedAt: booking.timeline.assignedAt ? booking.timeline.assignedAt.toISOString() : null,
              enRouteAt: booking.timeline.enRouteAt ? booking.timeline.enRouteAt.toISOString() : null,
              arrivedAt: booking.timeline.arrivedAt ? booking.timeline.arrivedAt.toISOString() : null,
              completedAt: booking.timeline.completedAt ? booking.timeline.completedAt.toISOString() : null,
              cancelledAt: booking.timeline.cancelledAt.toISOString(),
            }
          });
        }
      } catch (fsErr) {
        console.warn("Firestore auto-cancellation sync failed:", fsErr);
      }
    }
  }
}

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

    for (const b of bookings) {
      await checkAndAutoCancelBooking(b);
    }

    const serviceLabels: Record<string, string> = {
      TOWING: "Flatbed Towing",
      BATTERY: "Battery Jumpstart",
      URGENT_BATTERY: "Urgent Battery Replacement",
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
          : (obj.location || { lat: 12.9928671, lng: 77.7529829 }),
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
