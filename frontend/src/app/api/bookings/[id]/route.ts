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

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const { id } = resolvedParams;
    
    // Attempt to locate booking in MongoDB (support both ObjectId and ticketId)
    const cleanId = id.trim().replace(/\s+/g, '');
    const isValidMongoId = /^[0-9a-fA-F]{24}$/.test(cleanId);
    const booking = isValidMongoId
      ? await Booking.findById(cleanId)
      : await Booking.findOne({ ticketId: cleanId.toUpperCase() });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    // Auto-cancel if active and > 1 hour old
    await checkAndAutoCancelBooking(booking);

    const obj = booking.toObject();

    // Map serviceType uppercase tags to readable display labels
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

    // ── Normalization Mapping for 100% Backward Compatibility ────────────
    const normalizedBooking = {
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
      address: obj.location?.address || obj.address || "",
      serviceLabel: serviceLabels[obj.serviceType || ""] || obj.serviceLabel || "Roadside Help",
      location: obj.location?.coordinates && Array.isArray(obj.location.coordinates) && obj.location.coordinates.length >= 2
        ? { lat: obj.location.coordinates[1], lng: obj.location.coordinates[0] } // [longitude, latitude] to {lat, lng}
        : (obj.location || { lat: 12.9928671, lng: 77.7529829 }),
      timeline: obj.timeline || {
        confirmedAt: obj.createdAt || new Date(),
        assignedAt: obj.technicianId ? (obj.createdAt || new Date()) : null,
        enRouteAt: (obj.status === "IN_PROGRESS" || obj.status === "COMPLETED") ? (obj.updatedAt || new Date()) : null,
        arrivedAt: (obj.status === "IN_PROGRESS" && obj.subStatus === "ARRIVED" || obj.status === "COMPLETED") ? (obj.updatedAt || new Date()) : null,
        completedAt: obj.status === "COMPLETED" ? (obj.updatedAt || new Date()) : null,
        cancelledAt: obj.status === "CANCELLED" ? (obj.updatedAt || new Date()) : null,
      },
      progress: obj.progress !== undefined ? obj.progress : 0,
      technicianLocation: obj.technicianLocation || null,
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

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const cleanId = id.trim().replace(/\s+/g, '');
    const isValidMongoId = /^[0-9a-fA-F]{24}$/.test(cleanId);
    const booking = isValidMongoId
      ? await Booking.findById(cleanId)
      : await Booking.findOne({ ticketId: cleanId.toUpperCase() });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found." },
        { status: 404 }
      );
    }

    // 1. Check if already cancelled
    if (booking.status === "CANCELLED") {
      return NextResponse.json(
        { success: false, error: "This booking request is already cancelled." },
        { status: 400 }
      );
    }

    // 2. Prevent cancellation if a technician has been assigned or progress has started
    const nonCancellableStatuses = ["ASSIGNED", "IN_PROGRESS", "COMPLETED"];
    if (nonCancellableStatuses.includes(booking.status)) {
      return NextResponse.json(
        { success: false, error: "Unable to cancel. A technician has already been dispatched. Please contact support." },
        { status: 422 }
      );
    }

    // 3. Enforce 5-minute cancellation threshold
    const createdAtTime = new Date(booking.createdAt).getTime();
    const currentTime = Date.now();
    const elapsedSeconds = (currentTime - createdAtTime) / 1000;

    if (elapsedSeconds > 305) {
      return NextResponse.json(
        { success: false, error: "Cancellation window (5 minutes) has expired. Please contact support to cancel." },
        { status: 400 }
      );
    }

    // 4. Perform cancellation in MongoDB
    booking.status = "CANCELLED";
    booking.paymentStatus = "CANCELLED";
    
    // Initialize or load timeline object
    const timeline = booking.timeline ? booking.timeline : {
      confirmedAt: booking.createdAt || new Date(),
      assignedAt: null,
      enRouteAt: null,
      arrivedAt: null,
      completedAt: null,
      cancelledAt: null,
    };
    timeline.cancelledAt = new Date();
    booking.timeline = timeline;
    
    await booking.save();

    // 5. Sync cancellation to Cloud Firestore
    try {
      if (db && typeof db.app !== 'undefined') {
        const firestorePromise = updateDoc(doc(db, "active_bookings", booking._id.toString()), {
          status: "cancelled",
          timeline: {
            confirmedAt: timeline.confirmedAt ? timeline.confirmedAt.toISOString() : new Date(booking.createdAt).toISOString(),
            assignedAt: timeline.assignedAt ? timeline.assignedAt.toISOString() : null,
            enRouteAt: timeline.enRouteAt ? timeline.enRouteAt.toISOString() : null,
            arrivedAt: timeline.arrivedAt ? timeline.arrivedAt.toISOString() : null,
            completedAt: timeline.completedAt ? timeline.completedAt.toISOString() : null,
            cancelledAt: timeline.cancelledAt.toISOString(),
          }
        });

        // 1.2-second write limit
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Firestore sync timed out")), 1200)
        );

        await Promise.race([firestorePromise, timeoutPromise]);
      }
    } catch (fsErr) {
      console.warn("Firestore cancellation sync timed out or failed:", fsErr);
    }

    return NextResponse.json({
      success: true,
      message: "Service request cancelled successfully.",
      status: "CANCELLED",
    });
  } catch (error: any) {
    console.error("Error cancelling booking:", error);
    return NextResponse.json(
      { success: false, error: error.message || error },
      { status: 500 }
    );
  }
}
