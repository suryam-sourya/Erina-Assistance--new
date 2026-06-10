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
      serviceTypes = [],
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
      hasScrapBattery,
    } = body;

    const sanitizeString = (val: any, fallback = ""): string => {
      if (val === undefined || val === null) return fallback;
      return String(val).trim() || fallback;
    };

    const sanitizeNumber = (val: any): number | undefined => {
      if (val === undefined || val === null) return undefined;
      const num = Number(val);
      return isNaN(num) ? undefined : num;
    };

    const rawPhone =
  sanitizeString(
    body?.customer?.phone ||
    customerPhone ||
    phone
  );
    const rawCustomerName =
  sanitizeString(
    body?.customer?.name ||
    customerName ||
    "Customer"
  );
    const rawVehicleNumber =
sanitizeString(
  body?.vehicle?.plateNumber ||
  vehicleNumber ||
  vehiclePlate ||
  "KA01AB1234"
);
    const rawVehicleType =
sanitizeString(
  body?.vehicle?.type ||
  vehicleType ||
  vehicleName ||
  "Car (Hatchback/Sedan)"
);
const rawServiceType = sanitizeString(serviceType || "other");
    const rawStatus = sanitizeString(status || "pending");
    const rawAddress = sanitizeString(location?.address||address|| "Bengaluru, Karnataka");
    const rawPaymentAmount = sanitizeNumber(paymentAmount) || 0;
    const rawPaymentStatus = sanitizeString(paymentStatus || "pending");
    const rawImageUrl = sanitizeString(imageUrl);
    const sanitizedTechnicianId = sanitizeString(technicianId) || null;
    const sanitizedTechnicianName = sanitizeString(technicianName) || null;

    // ── Strict Input Sanitization & Validation ───────────────────────────
    
    // 1. Phone number validation: digits only, must contain 10 digits
    const cleanedPhone =
  rawPhone
    ? rawPhone.replace(
        /\D/g,
        ""
      )
    : "";

if (
  !cleanedPhone ||
  cleanedPhone.length !== 10
) {
  return NextResponse.json(
    {
      success: false,
      error:
        "Phone number must contain exactly 10 digits.",
    },
    { status: 400 }
  );
}

const finalPhone =
  cleanedPhone;

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
    const VEHICLE_MAP:
Record<string, string> = {
  "car (hatchback/sedan)":
    "CAR",

  "suv / muv":
    "SUV",

  luxury:
    "LUXURY",

  bike:
    "TWO_WHEELER",

  ev:
    "EV",
};
    const officialVehicleType = VEHICLE_MAP[rawVehicleType.toLowerCase()] || "CAR";

    // Map serviceType string to official uppercase categories
    const SERVICE_MAP:
Record<string, string> = {
  towing:
    "TOWING",

  battery:
    "BATTERY",
  urgent_battery: "URGENT_BATTERY",
    "urgent battery": "URGENT_BATTERY",  

  ev:
    "EV",

  lockout:
    "LOCKOUT",

  fuel:
    "FUEL",

  flat_tyre:
    "FLAT_TYRE",

  "flat tyre":
    "FLAT_TYRE",

  engine:
    "ENGINE",

  accident:
    "ACCIDENT",

  other:
    "OTHER",
};
    const officialServiceType = SERVICE_MAP[rawServiceType.toLowerCase()] || "OTHER";

    // Map location coordinates {lat, lng} or text address to GeoJSON Point coordinates: [longitude, latitude]
    let longitude = 77.7529829; // Default Erina Hub Lng
    let latitude = 12.9928671;  // Default Erina Hub Lat
    
    if (location && typeof location === "object") {
      const latVal = Number((location as any).lat);
      const lngVal = Number((location as any).lng);
      if (!isNaN(latVal) && !isNaN(lngVal)) {
        latitude = latVal;
        longitude = lngVal;
      }
    } else if (typeof location === "string" && location.includes(",")) {
      // If we get an address or raw lat,lng string
      const parts = location.split(",");
      const latVal = Number(parts[0]);
      const lngVal = Number(parts[1]);
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
      serviceType:
  officialServiceType,

serviceTypes:
  serviceTypes.map(
    (s: string) =>
      SERVICE_MAP[
        s.toLowerCase()
      ] || "OTHER"
  ),
      description: `${rawServiceType} emergency breakdown assistance near ${rawAddress.split(",")[0]}.`,
      isPriority: rawStatus.toLowerCase() === "emergency",
      images: rawImageUrl ? [rawImageUrl] : [],
      status: rawStatus.toLowerCase() === "emergency" ? "EMERGENCY" : "PENDING",
      technicianId: sanitizedTechnicianId,
      technicianName: sanitizedTechnicianName,
      estimatedArrivalTime: null,
      paymentStatus: rawPaymentStatus.toUpperCase(),
      paymentAmount: rawPaymentAmount,
      createdBy: null,
      scrapBatteryExchange: {
        isExchanged: !!hasScrapBattery,
      },

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

    // Normalize output for the admin store response
    const serviceLabelsMap: Record<string, string> = {
      TOWING: "Flatbed Towing",
      BATTERY: "Battery Jumpstart",
      URGENT_BATTERY: "Urgent Battery",
      EV: "Mobile EV Charging",
      LOCKOUT: "Lockout Assistance",
      FUEL: "Emergency Fuel Delivery",
      FLAT_TYRE: "Flat Tyre Replacement",
      ENGINE: "Engine Diagnostics",
      ACCIDENT: "Accident Recovery",
      OTHER: "Other Assistance",
    };

    const normalizedBooking = {
      ...booking.toObject(),
      id: booking._id.toString(),
      customerName: rawCustomerName,
      phone: finalPhone,
      vehicleType: rawVehicleType,
      vehicleNumber: cleanedPlate,
      vehiclePlate: cleanedPlate,
      imageUrl: rawImageUrl,
      status: rawStatus.toLowerCase(),
      address: rawAddress,
      serviceLabel: serviceLabelsMap[officialServiceType] || serviceLabel || "Roadside Help",
      location: rawAddress,
      coordinates: { lat: latitude, lng: longitude },
    };

    return NextResponse.json({
      success: true,
      booking: normalizedBooking,
    });
  } catch (error: any) {
    console.error("Error creating booking in admin-panel:", error);
    return NextResponse.json({
      success: false,
      error: error.message || error,
    }, { status: 500 });
  }
}
