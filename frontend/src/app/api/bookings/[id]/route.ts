import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

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

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const booking = await Booking.findById(id);

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

    // 3. Enforce 30-second cancellation threshold (with a 5s latency grace buffer)
    const createdAtTime = new Date(booking.createdAt).getTime();
    const currentTime = Date.now();
    const elapsedSeconds = (currentTime - createdAtTime) / 1000;

    if (elapsedSeconds > 35) {
      return NextResponse.json(
        { success: false, error: "Cancellation window (30 seconds) has expired. Please contact support to cancel." },
        { status: 400 }
      );
    }

    // 4. Perform cancellation in MongoDB
    booking.status = "CANCELLED";
    booking.paymentStatus = "CANCELLED";
    await booking.save();

    // 5. Sync cancellation to Cloud Firestore
    try {
      if (db && typeof db.app !== 'undefined') {
        const firestorePromise = updateDoc(doc(db, "active_bookings", id), {
          status: "cancelled",
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
