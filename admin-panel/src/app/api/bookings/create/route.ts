import { NextResponse } from "next/server";
import { connectDB } from "@/backend/lib/mongodb";
import Booking from "@/backend/models/Booking";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json({
        success: false,
        error: "Invalid request body format",
      }, { status: 400 });
    }

    // Whitelist and destructure allowed input properties
    const {
      userId,
      customerName,
      phone,
      customerPhone,
      serviceType,
      serviceLabel,
      vehicleType,
      vehicleName,
      vehicleNumber,
      vehiclePlate,
      status,
      location,
      address,
      paymentStatus,
      paymentAmount,
      imageUrl,
      technicianId,
      technicianName,
    } = body;

    // Helper functions to strictly sanitize inputs and block query injections
    const sanitizeString = (val: any): string | undefined => {
      if (val === undefined || val === null) return undefined;
      return String(val);
    };

    const sanitizeNumber = (val: any): number | undefined => {
      if (val === undefined || val === null) return undefined;
      const num = Number(val);
      return isNaN(num) ? undefined : num;
    };

    const sanitizedPhone = sanitizeString(phone || customerPhone);
    const sanitizedCustomerName = sanitizeString(customerName);
    const sanitizedUserId = sanitizeString(userId);
    const sanitizedServiceType = sanitizeString(serviceType);
    const sanitizedServiceLabel = sanitizeString(serviceLabel);
    const sanitizedVehicleType = sanitizeString(vehicleType);
    const sanitizedVehicleName = sanitizeString(vehicleName);
    const sanitizedVehicleNumber = sanitizeString(vehicleNumber);
    const sanitizedVehiclePlate = sanitizeString(vehiclePlate);
    const sanitizedStatus = sanitizeString(status);
    const sanitizedAddress = sanitizeString(address);
    const sanitizedPaymentStatus = sanitizeString(paymentStatus);
    const sanitizedImageUrl = sanitizeString(imageUrl);
    const sanitizedTechnicianId = sanitizeString(technicianId);
    const sanitizedTechnicianName = sanitizeString(technicianName);
    const sanitizedPaymentAmount = sanitizeNumber(paymentAmount);

    let sanitizedLocation: { lat: number; lng: number } | undefined = undefined;
    if (location !== undefined && location !== null) {
      if (typeof location === "object") {
        const lat = Number(location.lat);
        const lng = Number(location.lng);
        if (!isNaN(lat) && !isNaN(lng)) {
          sanitizedLocation = { lat, lng };
        }
      }
    }

    // Build whitelisted, type-safe payload
    const sanitizedBody: any = {};
    if (sanitizedUserId !== undefined) sanitizedBody.userId = sanitizedUserId;
    if (sanitizedCustomerName !== undefined) sanitizedBody.customerName = sanitizedCustomerName;
    if (sanitizedPhone !== undefined) sanitizedBody.phone = sanitizedPhone;
    if (sanitizedServiceType !== undefined) sanitizedBody.serviceType = sanitizedServiceType;
    if (sanitizedServiceLabel !== undefined) sanitizedBody.serviceLabel = sanitizedServiceLabel;
    if (sanitizedVehicleType !== undefined) sanitizedBody.vehicleType = sanitizedVehicleType;
    if (sanitizedVehicleName !== undefined) sanitizedBody.vehicleName = sanitizedVehicleName;
    if (sanitizedVehicleNumber !== undefined) sanitizedBody.vehicleNumber = sanitizedVehicleNumber;
    if (sanitizedVehiclePlate !== undefined) sanitizedBody.vehiclePlate = sanitizedVehiclePlate;
    if (sanitizedStatus !== undefined) sanitizedBody.status = sanitizedStatus;
    if (sanitizedLocation !== undefined) sanitizedBody.location = sanitizedLocation;
    if (sanitizedAddress !== undefined) sanitizedBody.address = sanitizedAddress;
    if (sanitizedPaymentStatus !== undefined) sanitizedBody.paymentStatus = sanitizedPaymentStatus;
    if (sanitizedPaymentAmount !== undefined) sanitizedBody.paymentAmount = sanitizedPaymentAmount;
    if (sanitizedImageUrl !== undefined) sanitizedBody.imageUrl = sanitizedImageUrl;
    if (sanitizedTechnicianId !== undefined) sanitizedBody.technicianId = sanitizedTechnicianId;
    if (sanitizedTechnicianName !== undefined) sanitizedBody.technicianName = sanitizedTechnicianName;

    // Map serviceType to human-readable label if missing
    if (!sanitizedBody.serviceLabel && sanitizedBody.serviceType) {
      const serviceLabels: Record<string, string> = {
        towing: "Flatbed Towing",
        battery: "Battery Jumpstart",
        ev: "Mobile EV Charging",
        lockout: "Lockout Assistance",
        fuel: "Emergency Fuel Delivery",
        flat_tyre: "Flat Tyre Replacement",
        engine: "Engine Diagnostics",
        accident: "Accident Recovery",
      };
      
      const type = sanitizedBody.serviceType.toLowerCase();
      sanitizedBody.serviceLabel = serviceLabels[type] || `${sanitizedBody.serviceType} Assistance`;
    }

    // Map vehicle fields for compatibility
    if (sanitizedBody.vehicleType && !sanitizedBody.vehicleName) {
      sanitizedBody.vehicleName = sanitizedBody.vehicleType;
    }
    if (sanitizedBody.vehicleNumber && !sanitizedBody.vehiclePlate) {
      sanitizedBody.vehiclePlate = sanitizedBody.vehicleNumber;
    }
    if (sanitizedBody.vehiclePlate && !sanitizedBody.vehicleNumber) {
      sanitizedBody.vehicleNumber = sanitizedBody.vehiclePlate;
    }

    // Ensure status is lowercase 'pending' for consistency with UI store
    if (sanitizedBody.status) {
      sanitizedBody.status = sanitizedBody.status.toLowerCase();
    } else {
      sanitizedBody.status = "pending";
    }

    const booking = await Booking.create(sanitizedBody);

    return NextResponse.json({
      success: true,
      booking,
    });
  } catch (error: any) {
    console.error("Error creating booking in admin-panel:", error);
    return NextResponse.json({
      success: false,
      error: error.message || error,
    }, { status: 500 });
  }
}
