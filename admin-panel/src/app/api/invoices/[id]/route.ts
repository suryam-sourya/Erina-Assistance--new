/**
 * GET /api/invoices/[id]
 *
 * Backend invoice API — computes and returns a fully structured invoice object
 * for a given booking ID or ticketId (e.g. RSA-1234).
 *
 * Responsibilities:
 *  - Fetch the booking from MongoDB
 *  - Build service line item with 18% GST (SAC 9987)
 *  - Build product line items with per-product GST rates (HSN-specific)
 *  - Compute combined GST breakdown and grand total
 *  - Return a clean, typed InvoiceData object for the frontend to render
 *
 * This keeps all billing math on the server side — never trust the client for tax calculations.
 */

import { NextResponse } from "next/server";
import { connectDB } from "@/backend/lib/mongodb";
import Booking from "@/backend/models/Booking";

// ── Company Constants ──────────────────────────────────────────────────────

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

// ── Service Reference Data ─────────────────────────────────────────────────

const SERVICE_GST_RATE = 0.18;  // 18% on roadside services
const SERVICE_SAC_CODE = "9987"; // Services Accounting Code for vehicle repair/maintenance

const SERVICE_LABELS: Record<string, string> = {
  TOWING:    "Flatbed Towing",
  BATTERY:   "Battery Jumpstart",
  EV:        "Mobile EV Charging",
  LOCKOUT:   "Lockout Assistance",
  FUEL:      "Emergency Fuel Delivery",
  FLAT_TYRE: "Flat Tyre Replacement",
  ENGINE:    "Engine Diagnostics",
  ACCIDENT:  "Accident Recovery",
  OTHER:     "Roadside Assistance",
};

const SERVICE_DESCRIPTIONS: Record<string, string> = {
  TOWING:    "Flatbed Towing — Vehicle recovery and tow-to-hub transportation service.",
  BATTERY:   "Battery Jumpstart — On-site emergency battery jump-start and diagnostic service.",
  EV:        "Mobile EV Charging — Emergency mobile electric vehicle charging service.",
  LOCKOUT:   "Lockout Assistance — Professional car lockout opening without vehicle damage.",
  FUEL:      "Emergency Fuel Delivery — Fuel delivery to the breakdown location.",
  FLAT_TYRE: "Flat Tyre Replacement — On-site spare tyre fitting and wheel balancing.",
  ENGINE:    "Engine Diagnostics — On-site engine fault diagnosis and recovery consultation.",
  ACCIDENT:  "Accident Recovery — Post-accident vehicle recovery, towing and site clearance.",
  OTHER:     "General Roadside Assistance — Emergency roadside help as per the service request.",
};

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

/**
 * Extract pre-tax base price from a GST-inclusive price.
 * Formula: basePrice = gstInclusivePrice / (1 + gstRate)
 */
function extractBase(gstInclusivePrice: number, gstRate: number): number {
  return round2(gstInclusivePrice / (1 + gstRate));
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
    const soldProducts = obj.soldProducts || [];

    // ── Step 1: Compute Service Line ────────────────────────────────────

    // The total paymentAmount stored is GST-inclusive for everything.
    // Strip out product amounts first, then treat the remainder as service charge.
    const totalProductsGstInclusive = soldProducts.reduce(
      (sum: number, p: { unitPrice: number; quantity: number }) => sum + p.unitPrice * p.quantity,
      0
    );

    const serviceGstInclusive = round2((obj.paymentAmount ?? 0) - totalProductsGstInclusive);
    const serviceBase          = extractBase(serviceGstInclusive, SERVICE_GST_RATE);
    const serviceCgst          = round2(serviceBase * (SERVICE_GST_RATE / 2));
    const serviceSgst          = round2(serviceBase * (SERVICE_GST_RATE / 2));

    const serviceKey = (obj.serviceType || "OTHER").toUpperCase().replace(/-/g, "_");

    // ── Step 2: Build Product Line Items ───────────────────────────────

    interface SoldProductItem {
      productId: string;
      name: string;
      brand?: string;
      sku?: string;
      hsnCode?: string;
      gstRate?: number;
      quantity: number;
      unitPrice: number;
    }

    interface ProductLineItem {
      type: "product";
      description: string;
      detail: string;
      hsnCode: string;
      quantity: number;
      unitPrice: number;
      base: number;
      cgst: number;
      sgst: number;
      gstRate: number;
      amount: number;
    }

    const productLineItems: ProductLineItem[] = soldProducts.map((p: SoldProductItem) => {
      const gstRate   = p.gstRate ?? 0.28;
      const lineTotal = round2(p.unitPrice * p.quantity); // GST-inclusive
      const base      = extractBase(lineTotal, gstRate);
      const cgst      = round2(base * (gstRate / 2));
      const sgst      = round2(base * (gstRate / 2));

      return {
        type:        "product",
        description: p.brand ? `${p.brand} — ${p.name}` : p.name,
        detail:      `SKU: ${p.sku || "N/A"} | HSN: ${p.hsnCode || "8507"}`,
        hsnCode:     p.hsnCode || "8507",
        quantity:    p.quantity,
        unitPrice:   p.unitPrice,
        base,
        cgst,
        sgst,
        gstRate,
        amount:      lineTotal,
      };
    });

    // ── Step 3: Combined Tax Summary ────────────────────────────────────

    const totalBase  = round2(serviceBase + productLineItems.reduce((s, l) => s + l.base, 0));
    const totalCgst  = round2(serviceCgst  + productLineItems.reduce((s, l) => s + l.cgst, 0));
    const totalSgst  = round2(serviceSgst  + productLineItems.reduce((s, l) => s + l.sgst, 0));
    const grandTotal = round2(totalBase + totalCgst + totalSgst);

    // ── Step 4: Assemble Final Invoice Object ───────────────────────────

    const invoice = {
      // Meta
      invoiceNumber: generateInvoiceNumber(obj._id.toString(), obj.createdAt),
      invoiceDate:   obj.createdAt,
      dueDate:       null,

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
        type:  (obj.vehicle?.type  || obj.vehicleType  || "").toUpperCase(),
        plate: obj.vehicle?.plateNumber || obj.vehiclePlate || "",
        name:  obj.vehicleName || "",
      },

      // Line items: service first, then products
      lineItems: [
        {
          type:        "service",
          description: SERVICE_LABELS[serviceKey] || "Roadside Assistance",
          detail:      SERVICE_DESCRIPTIONS[serviceKey] || SERVICE_DESCRIPTIONS.OTHER,
          hsnCode:     SERVICE_SAC_CODE,
          quantity:    1,
          unitPrice:   serviceGstInclusive,
          base:        serviceBase,
          cgst:        serviceCgst,
          sgst:        serviceSgst,
          gstRate:     SERVICE_GST_RATE,
          amount:      serviceGstInclusive,
        },
        ...productLineItems,
      ],

      // Combined GST breakdown
      tax: {
        serviceSubtotal:  serviceBase,
        productsSubtotal: round2(productLineItems.reduce((s, l) => s + l.base, 0)),
        subtotal:         totalBase,
        cgst:             totalCgst,
        sgst:             totalSgst,
        totalGst:         round2(totalCgst + totalSgst),
        grandTotal,
        hasProducts:      soldProducts.length > 0,
      },

      // Payment
      payment: {
        status:     (obj.paymentStatus || "pending").toLowerCase(),
        paidAmount: obj.paymentAmount ?? 0,
        method:     "Cash / UPI",
        currency:   "INR",
      },

      // Terms
      terms: [
        "Service charges attract 18% GST (SAC 9987). Product charges attract GST as per applicable HSN code.",
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
