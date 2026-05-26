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

    // Sync dispatcher updates directly to Cloud Firestore Active Sessions channel
    try {
      const { db } = await import("@/frontend/lib/firebase");
      const { doc, updateDoc, deleteDoc } = await import("firebase/firestore");
      
      if (db && typeof db.app !== 'undefined') {
        const firestoreId = resolvedParams.id;
        let fsPromise: Promise<any>;
        
        if (body.status?.toLowerCase() === "completed") {
          // Incident Closed: Purge from Firestore active list to preserve free tier capacity
          fsPromise = deleteDoc(doc(db, "active_bookings", firestoreId));
        } else {
          // Still Active: Sync dispatcher status metrics
          const fsUpdate: Record<string, any> = {};
          if (body.status) fsUpdate.status = body.status.toLowerCase();
          if (body.subStatus !== undefined) fsUpdate.subStatus = body.subStatus ? body.subStatus.toLowerCase() : null;
           if (body.technicianId) fsUpdate.technicianId = body.technicianId;
          if (body.technicianName) fsUpdate.technicianName = body.technicianName;
          if (body.technicianPhone) fsUpdate.technicianPhone = body.technicianPhone;
          if (body.paymentStatus) fsUpdate.paymentStatus = body.paymentStatus.toLowerCase();
          
          fsPromise = updateDoc(doc(db, "active_bookings", firestoreId), fsUpdate);
        }

        // Enforce 1.2-second write limit to guarantee fast response
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Firestore sync timed out")), 1200)
        );

        await Promise.race([fsPromise, timeoutPromise]);
      }
    } catch (fsErr) {
      console.warn("Firestore status synchronization timed out or failed:", fsErr);
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
      technicianPhone: obj.technicianPhone || "",
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
