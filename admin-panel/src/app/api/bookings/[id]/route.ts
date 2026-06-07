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

    const id = resolvedParams.id;
    const isValidMongoId = /^[0-9a-fA-F]{24}$/.test(id);

    // Fetch the existing booking to analyze status/subStatus transitions
    const existingBooking = isValidMongoId
      ? await Booking.findById(id)
      : await Booking.findOne({ ticketId: id });

    if (!existingBooking) {
      return NextResponse.json({
        success: false,
        error: "Booking not found",
      }, { status: 404 });
    }

    // Clone request body to safely manipulate properties
    const updateData = { ...body };

    // Standardize status updates to uppercase in DB to match new nested schema
    if (updateData.status) {
      updateData.status = updateData.status.toUpperCase();
    }

    // When en-route starts, ensure simulator metrics are reset to Ops Central Hub
    if (updateData.status?.toUpperCase() === "IN_PROGRESS" && updateData.subStatus?.toUpperCase() === "LEAVING_HUB") {
      updateData.progress = 0;
      updateData.technicianLocation = { lat: 12.9902, lng: 77.7602 };
    }

    // Initialize timeline object from existing booking or default fallback
    const timeline = existingBooking.timeline ? { ...existingBooking.timeline.toObject() } : {
      confirmedAt: existingBooking.createdAt || new Date(),
      assignedAt: null,
      enRouteAt: null,
      arrivedAt: null,
      completedAt: null,
      cancelledAt: null,
    };

    let timelineUpdated = false;

    // Check status transitions
    if (updateData.status) {
      const newStatus = updateData.status.toUpperCase();
      const oldStatus = existingBooking.status?.toUpperCase();

      if (newStatus === "ASSIGNED" && oldStatus !== "ASSIGNED") {
        timeline.assignedAt = new Date();
        timelineUpdated = true;
      }
      if (newStatus === "COMPLETED" && oldStatus !== "COMPLETED") {
        timeline.completedAt = new Date();
        timelineUpdated = true;
      }
      if (newStatus === "CANCELLED" && oldStatus !== "CANCELLED") {
        timeline.cancelledAt = new Date();
        timelineUpdated = true;
      }
    }

    // Check subStatus transitions
    if (updateData.subStatus !== undefined) {
      const newSubStatus = updateData.subStatus ? updateData.subStatus.toUpperCase() : null;
      const oldSubStatus = existingBooking.subStatus?.toUpperCase();

      if (newSubStatus === "LEAVING_HUB" && oldSubStatus !== "LEAVING_HUB") {
        timeline.enRouteAt = new Date();
        timelineUpdated = true;
      }
      if (newSubStatus === "ARRIVED" && oldSubStatus !== "ARRIVED") {
        timeline.arrivedAt = new Date();
        timelineUpdated = true;
      }
    }

    // If technician is newly assigned, make sure assignedAt is captured
    if (updateData.technicianId && !existingBooking.technicianId) {
      timeline.assignedAt = new Date();
      timelineUpdated = true;
    }

    if (timelineUpdated) {
      updateData.timeline = timeline;
    }

    // Find and update the booking
    const booking = isValidMongoId
      ? await Booking.findByIdAndUpdate(id, updateData, { new: true })
      : await Booking.findOneAndUpdate({ ticketId: id }, updateData, { new: true });

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
          if (body.serviceType) fsUpdate.serviceType = body.serviceType.toLowerCase();
          if (body.serviceLabel) fsUpdate.serviceLabel = body.serviceLabel;
          if (body.paymentAmount !== undefined) fsUpdate.paymentAmount = body.paymentAmount;
          
          if (booking.timeline) {
            fsUpdate.timeline = {
              confirmedAt: booking.timeline.confirmedAt ? booking.timeline.confirmedAt.toISOString() : null,
              assignedAt: booking.timeline.assignedAt ? booking.timeline.assignedAt.toISOString() : null,
              enRouteAt: booking.timeline.enRouteAt ? booking.timeline.enRouteAt.toISOString() : null,
              arrivedAt: booking.timeline.arrivedAt ? booking.timeline.arrivedAt.toISOString() : null,
              completedAt: booking.timeline.completedAt ? booking.timeline.completedAt.toISOString() : null,
              cancelledAt: booking.timeline.cancelledAt ? booking.timeline.cancelledAt.toISOString() : null,
            };
          }
          
          if (booking.progress !== undefined) fsUpdate.progress = booking.progress;
          if (booking.technicianLocation) {
            fsUpdate.technicianLocation = {
              lat: booking.technicianLocation.lat,
              lng: booking.technicianLocation.lng,
            };
          }
          
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
      URGENT_BATTERY: "Urgent Battery Replacement",
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
        : { lat: 12.9928671, lng: 77.7529829 },
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

    return NextResponse.json(normalizedBooking);
  } catch (error: any) {
    console.error("Error updating booking:", error);
    return NextResponse.json({
      success: false,
      error: error.message || error,
    }, { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const isValidMongoId = /^[0-9a-fA-F]{24}$/.test(id);
    const booking = isValidMongoId
      ? await Booking.findById(id)
      : await Booking.findOne({ ticketId: id });

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
      URGENT_BATTERY: "Urgent Battery Replacement",
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
        : { lat: 12.9928671, lng: 77.7529829 },
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

    return NextResponse.json(normalizedBooking);
  } catch (error: any) {
    console.error("Error fetching booking by ID:", error);
    return NextResponse.json({
      success: false,
      error: error.message || error,
    }, { status: 500 });
  }
}
