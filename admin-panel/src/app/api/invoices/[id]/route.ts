/**
 * GET /api/invoices/[id]
 *
 * Backend invoice API — computes and returns a fully structured invoice object
 * for a given booking ID or ticketId (e.g. RSA-1234).
 *
 * Responsibilities:
 *  - Fetch the booking from MongoDB
 *  - Compute GST-exclusive subtotal, CGST (9%), SGST (9%), and grand total
 *  - Generate a deterministic invoice number
 *  - Return a clean, typed InvoiceData object for the frontend to render
 *
 * This keeps all billing math on the server side — never trust the client for tax calculations.
 */

import { NextResponse } from "next/server";
import { connectDB } from "@/backend/lib/mongodb";
import Booking from "@/backend/models/Booking";

// ── Constants ──────────────────────────────────────────────────────────────

const COMPANY = {
  name: "Erina Roadside Assistance Services Pvt. Ltd.",
  shortName: "Erina Assistance",
  address: "Shop No. 02, Dinnur Main Road, Kadugodi Colony, Bengaluru — 560067, Karnataka, India",
  gstin: "29AAFCE8436B1Z3",
  support: "support@erinaassistance.in",
  phone: "+91-90358 18604",
  state: "Karnataka",
  stateCode: "29",
};

const GST_RATE = 0.18; // 18% total GST
const CGST_RATE = 0.09; // 9% CGST (Centre)
const SGST_RATE = 0.09; // 9% SGST (State)

const SERVICE_LABELS: Record<string, string> = {
  TOWING: "Flatbed Towing",
  BATTERY: "Battery Jumpstart",
  EV: "Mobile EV Charging",
  LOCKOUT: "Lockout Assistance",
  FUEL: "Emergency Fuel Delivery",
  FLAT_TYRE: "Flat Tyre Replacement",
  ENGINE: "Engine Diagnostics",
  ACCIDENT: "Accident Recovery",
  OTHER: "Roadside Assistance",
};

const SERVICE_DESCRIPTIONS: Record<string, string> = {
  TOWING: "Flatbed Towing — Vehicle recovery and tow-to-hub transportation service.",
  BATTERY: "Battery Jumpstart — On-site emergency battery jump-start and diagnostic service.",
  EV: "Mobile EV Charging — Emergency mobile electric vehicle charging service.",
  LOCKOUT: "Lockout Assistance — Professional car lockout opening without vehicle damage.",
  FUEL: "Emergency Fuel Delivery — Fuel delivery to the breakdown location.",
  FLAT_TYRE: "Flat Tyre Replacement — On-site spare tyre fitting and wheel balancing.",
  ENGINE: "Engine Diagnostics — On-site engine fault diagnosis and recovery consultation.",
  ACCIDENT: "Accident Recovery — Post-accident vehicle recovery, towing and site clearance.",
  OTHER: "General Roadside Assistance — Emergency roadside help as per the service request.",
};

// SAC (Services Accounting Code) for motor vehicle maintenance & repair services
const SERVICE_SAC_CODE = "9987";

// ── Helpers ────────────────────────────────────────────────────────────────

function generateInvoiceNumber(bookingId: string, createdAt: string): string {
  const date = new Date(createdAt);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const idSuffix = bookingId.slice(-5).toUpperCase();
  return `INV/${year}-${month}/ERA-${idSuffix}`;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

// ── GET Handler ────────────────────────────────────────────────────────────

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    // Support both MongoDB ObjectId and custom ticketId (RSA-XXXX)
    const isValidMongoId = /^[0-9a-fA-F]{24}$/.test(id);
    const booking = isValidMongoId
      ? await Booking.findById(id)
      : await Booking.findOne({ ticketId: id });

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    const obj = booking.toObject();

    // ── Tax Calculation (GST-inclusive backward split) ──────────────────
    // The paymentAmount stored in DB is GST-inclusive (18%)
    // Backward formula: subtotal = total / 1.18
    const gstInclusiveTotal = obj.paymentAmount ?? 0;
    const subtotal          = round2(gstInclusiveTotal / (1 + GST_RATE));
    const cgst              = round2(subtotal * CGST_RATE);
    const sgst              = round2(subtotal * SGST_RATE);
    const grandTotal        = round2(subtotal + cgst + sgst);

    const serviceKey = (obj.serviceType || "OTHER").toUpperCase().replace(/-/g, "_");

    // ── Assemble Invoice Object ─────────────────────────────────────────
    const invoice = {
      // Meta
      invoiceNumber: generateInvoiceNumber(obj._id.toString(), obj.createdAt),
      invoiceDate:   obj.createdAt,
      dueDate:       null, // Paid on-site; null means no outstanding due

      // Company (biller)
      company: COMPANY,

      // Customer (bill-to)
      customer: {
        name:    obj.customer?.name    || obj.customerName || "Customer",
        phone:   obj.customer?.phone   || obj.phone        || "",
        address: obj.location?.address || obj.addressString || "",
      },

      // Booking reference
      booking: {
        id:           obj._id.toString(),
        ticketId:     obj.ticketId || null,
        status:       (obj.status  || "pending").toLowerCase(),
        serviceType:  serviceKey,
        serviceLabel: SERVICE_LABELS[serviceKey]       || "Roadside Assistance",
        description:  SERVICE_DESCRIPTIONS[serviceKey] || SERVICE_DESCRIPTIONS.OTHER,
        sacCode:      SERVICE_SAC_CODE,
        isPriority:   obj.isPriority ?? false,
        technicianName:  obj.technicianName  || null,
        technicianPhone: obj.technicianPhone || null,
      },

      // Vehicle
      vehicle: {
        type:   (obj.vehicle?.type  || obj.vehicleType  || "").toUpperCase(),
        plate:  obj.vehicle?.plateNumber || obj.vehiclePlate || "",
        name:   obj.vehicleName || "",
      },

      // Line items (single service line)
      lineItems: [
        {
          description: SERVICE_LABELS[serviceKey] || "Roadside Assistance",
          detail:      SERVICE_DESCRIPTIONS[serviceKey] || SERVICE_DESCRIPTIONS.OTHER,
          sacCode:     SERVICE_SAC_CODE,
          quantity:    1,
          unitPrice:   subtotal,
          amount:      subtotal,
        },
      ],

      // GST breakdown
      tax: {
        subtotal,
        cgstRate:  CGST_RATE,
        cgst,
        sgstRate:  SGST_RATE,
        sgst,
        totalGst:  round2(cgst + sgst),
        gstRate:   GST_RATE,
        grandTotal,
      },

      // Payment
      payment: {
        status:        (obj.paymentStatus || "pending").toLowerCase(),
        paidAmount:    gstInclusiveTotal,
        method:        "Cash / UPI",   // Extend later when payment gateway is integrated
        currency:      "INR",
      },

      // Terms & notes
      terms: [
        "All prices are inclusive of 18% GST (CGST 9% + SGST 9%) under the GST Act, 2017.",
        "This is a computer-generated invoice and is legally valid without a physical signature.",
        `For disputes or support, contact: ${COMPANY.support} or ${COMPANY.phone}.`,
        "Payment is due within 7 days of invoice date. Late payments may incur a 2% monthly surcharge.",
        "Erina Assistance is not liable for pre-existing vehicle damage not caused during service delivery.",
      ],
    };

    return NextResponse.json({ success: true, invoice });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("[GET /api/invoices/:id] Error:", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
