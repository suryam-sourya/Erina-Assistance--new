import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";

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
    } = body;

    // Helper functions to strictly sanitize inputs and block query injections
    const sanitizeString = (val: any, fallback = ""): string => {
      if (val === undefined || val === null) return fallback;
      return String(val).trim() || fallback;
    };

    const sanitizeNumber = (val: any): number | undefined => {
      if (val === undefined || val === null) return undefined;
      const num = Number(val);
      return isNaN(num) ? undefined : num;
    };

    const rawPhone = sanitizeString(phone || customerPhone);
    const rawCustomerName = sanitizeString(customerName || "Customer");
    const rawVehicleNumber = sanitizeString(vehicleNumber || vehiclePlate || "KA01AB1234");
    const rawVehicleType = sanitizeString(vehicleType || vehicleName || "Car (Hatchback/Sedan)");
    const rawServiceType = sanitizeString(serviceType || "other");
    const rawStatus = sanitizeString(status || "pending");
    const rawAddress = sanitizeString(address || "Bengaluru, Karnataka");
    const rawPaymentAmount = sanitizeNumber(paymentAmount) || 0;
    const rawPaymentStatus = sanitizeString(paymentStatus || "pending");
    const rawImageUrl = sanitizeString(imageUrl);

    // ── Strict Input Sanitization & Validation ───────────────────────────
    
    // 1. Phone number validation: digits only, must contain 10 digits
    const cleanedPhone = rawPhone ? rawPhone.replace(/\D/g, "") : "";
    if (!cleanedPhone || cleanedPhone.length < 10) {
      return NextResponse.json({
        success: false,
        error: "Invalid phone number. Must be a valid 10-digit mobile number.",
      }, { status: 400 });
    }
    const finalPhone = cleanedPhone.substring(cleanedPhone.length - 10); // Standardize to last 10 digits

    // 2. Vehicle license plate validation: uppercase, clean spaces/hyphens
    const cleanedPlate = rawVehicleNumber ? rawVehicleNumber.replace(/[^a-zA-Z0-9]/g, "").toUpperCase() : "";
    if (!cleanedPlate || cleanedPlate.length < 5) {
      return NextResponse.json({
        success: false,
        error: "Invalid vehicle plate number. Must be a valid license plate.",
      }, { status: 400 });
    }

    // ── Mapping schemas for Nested DB Format ─────────────────────────────
    
    // Map vehicleType string values to official uppercase categories
    const VEHICLE_MAP: Record<string, string> = {
      "car (hatchback/sedan)": "CAR",
      "suv / muv": "SUV",
      "luxury vehicle": "LUXURY",
      "two-wheeler": "TWO_WHEELER",
      "commercial vehicle": "COMMERCIAL",
      "electric vehicle (ev)": "EV",
    };
    const officialVehicleType = VEHICLE_MAP[rawVehicleType.toLowerCase()] || "CAR";

    // Map serviceType string to official uppercase categories
    const SERVICE_MAP: Record<string, string> = {
      towing: "TOWING",
      "flat tyre": "FLAT_TYRE",
      flattyre: "FLAT_TYRE",
      battery: "BATTERY",
      fuel: "FUEL",
      lockout: "LOCKOUT",
      engine: "ENGINE",
      accident: "ACCIDENT",
      other: "OTHER",
    };
    const officialServiceType = SERVICE_MAP[rawServiceType.toLowerCase()] || "OTHER";

    // Map location coordinates {lat, lng} to GeoJSON Point coordinates: [longitude, latitude]
    let longitude = 77.5946; // Default Bangalore Lng
    let latitude = 12.9716;  // Default Bangalore Lat
    
    if (location && typeof location === "object") {
      const latVal = Number(location.lat);
      const lngVal = Number(location.lng);
      if (!isNaN(latVal) && !isNaN(lngVal)) {
        latitude = latVal;
        longitude = lngVal;
      }
    }

    // Generate unique Ticket ID: RSA-XXXX
    const generatedTicketId = `RSA-${Math.floor(1000 + Math.random() * 9000)}`;

    // Build the final fully nested, aligned document structure
    const dbPayload = {
      // 1. Nested Blocks (Official Formats)
      customer: {
        name: rawCustomerName,
        phone: finalPhone,
      },
      vehicle: {
        type: officialVehicleType,
        plateNumber: cleanedPlate,
      },
      location: {
        type: "Point",
        coordinates: [longitude, latitude], // GeoJSON order is [longitude, latitude]
        address: rawAddress,
      },
      ticketId: generatedTicketId,
      serviceType: officialServiceType,
      description: `${rawServiceType} emergency breakdown assistance near ${rawAddress.split(",")[0]}.`,
      isPriority: rawStatus.toLowerCase() === "emergency",
      images: rawImageUrl ? [rawImageUrl] : [],
      status: rawStatus.toLowerCase() === "emergency" ? "EMERGENCY" : "PENDING",
      technicianId: null,
      technicianName: null,
      estimatedArrivalTime: null,
      paymentStatus: rawPaymentStatus.toUpperCase(),
      paymentAmount: rawPaymentAmount,
      createdBy: null,

      // 2. Flat Compatibilities for frontend/Zustand store (prevent layout crash)
      userId: sanitizeString(userId),
      customerName: rawCustomerName,
      phone: finalPhone,
      serviceLabel: serviceLabel || `${rawServiceType} Assistance`,
      vehicleType: rawVehicleType,
      vehicleName: rawVehicleType,
      vehicleNumber: cleanedPlate,
      vehiclePlate: cleanedPlate,
      imageUrl: rawImageUrl,
      addressString: rawAddress,
    };

    const booking = await Booking.create(dbPayload);

    return NextResponse.json({
      success: true,
      booking,
    });
  } catch (error: any) {
    console.error("Error creating booking:", error);
    return NextResponse.json({
      success: false,
      error: error.message || error,
    }, { status: 500 });
  }
}
