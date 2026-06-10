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
  name: "Erina Assistance Pvt. Ltd.",
  shortName: "Erina Assistance",
  address: "Shop No.02,Dinnur Main Road,Kadugodi,Bengaluru — 560067 ",
  gstin: "29AAJCE0215B1Z6",
  support: "support@erinaassistance.in",
  phone: "+91-73400 66655",
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

    // ── Step 1: Build Service Line Items ────────────────────────────────
    
    interface SoldServiceItem {
      serviceType: string;
      name: string;
      description?: string;
      sacCode?: string;
      gstRate?: number;
      quantity: number;
      unitPrice: number;
    }

    interface ServiceLineItem {
      type: "service";
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
      serviceType: string;
    }

    const serviceKey = (obj.serviceType || "OTHER").toUpperCase().replace(/-/g, "_");
    
    let serviceLineItems: ServiceLineItem[] = [];
    if (
  (!obj.soldServices || obj.soldServices.length === 0) &&
  obj.serviceTypes &&
  obj.serviceTypes.length > 0
) {

  const serviceCount =
  obj.serviceTypes.length || 1;

const perServiceAmount =
  round2(
    (obj.paymentAmount || 0) /
    serviceCount
  );
  
  serviceLineItems = obj.serviceTypes.map(
    (service: string) => {

      const key = service
        .toUpperCase()
        .replace(/-/g, "_");

      const base = extractBase(
        perServiceAmount,
        SERVICE_GST_RATE
      );

      const cgst = round2(
        base * (SERVICE_GST_RATE / 2)
      );

      const sgst = round2(
        base * (SERVICE_GST_RATE / 2)
      );

      return {
        type: "service",
        description:
          SERVICE_LABELS[key] ||
          key,

        detail:
          SERVICE_DESCRIPTIONS[key] ||
          "",

        hsnCode:
          SERVICE_SAC_CODE,

        quantity: 1,

        unitPrice:
          perServiceAmount,

        base,
        cgst,
        sgst,

        gstRate:
          SERVICE_GST_RATE,

        amount:
          perServiceAmount,

        serviceType:
          key,
      };
    }
  );
}
   else  if (obj.soldServices && obj.soldServices.length > 0) {
      serviceLineItems = obj.soldServices.map((s: SoldServiceItem) => {
        const gstRate   = s.gstRate ?? 0.18;
        const lineTotal = round2(s.unitPrice * s.quantity);
        const base      = extractBase(lineTotal, gstRate);
        const cgst      = round2(base * (gstRate / 2));
        const sgst      = round2(base * (gstRate / 2));

        return {
          type:        "service",
          description: s.name,
          detail:      s.description || "",
          hsnCode:     s.sacCode || "9987",
          quantity:    s.quantity,
          unitPrice:   s.unitPrice,
          base,
          cgst,
          sgst,
          gstRate,
          amount:      lineTotal,
          serviceType: s.serviceType,
        };
      });
    } else {
      // Legacy single service calculation
      const totalProductsGstInclusive = soldProducts.reduce(
        (sum: number, p: { unitPrice: number; quantity: number }) => sum + p.unitPrice * p.quantity,
        0
      );
      const serviceGstInclusive = round2((obj.paymentAmount ?? 0) - totalProductsGstInclusive);
      
      if (serviceGstInclusive > 0) {
        const serviceBase = extractBase(serviceGstInclusive, SERVICE_GST_RATE);
        const serviceCgst = round2(serviceBase * (SERVICE_GST_RATE / 2));
        const serviceSgst = round2(serviceBase * (SERVICE_GST_RATE / 2));

        serviceLineItems.push({
          type:        "service",
          description: obj.serviceLabel || SERVICE_LABELS[serviceKey] || "Roadside Assistance",
          detail:      obj.description  || SERVICE_DESCRIPTIONS[serviceKey] || SERVICE_DESCRIPTIONS.OTHER,
          hsnCode:     obj.serviceSacCode || SERVICE_SAC_CODE,
          quantity:    1,
          unitPrice:   serviceGstInclusive,
          base:        serviceBase,
          cgst:        serviceCgst,
          sgst:        serviceSgst,
          gstRate:     SERVICE_GST_RATE,
          amount:      serviceGstInclusive,
          serviceType: serviceKey,
        });
      }
    }

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

    const allLineItems = [...serviceLineItems, ...productLineItems];
    
    const totalBase  = round2(allLineItems.reduce((s, l) => s + l.base, 0));
    const totalCgst  = round2(allLineItems.reduce((s, l) => s + l.cgst, 0));
    const totalSgst  = round2(allLineItems.reduce((s, l) => s + l.sgst, 0));
    
    const scrapBatteryDiscount = obj.scrapBatteryExchange?.isExchanged ? (Number(obj.scrapBatteryExchange.discountValue) || 0) : 0;
    const grandTotal = Math.max(0, round2(totalBase + totalCgst + totalSgst - scrapBatteryDiscount));

    // Collect all active unique GST rates
    const activeRates: number[] = [];
    allLineItems.forEach(item => {
      if (item.amount > 0 && !activeRates.includes(item.gstRate)) {
        activeRates.push(item.gstRate);
      }
    });

    const isUniformRate = activeRates.length === 1;
    const uniformRate = isUniformRate ? activeRates[0] : null;

    // ── Step 4: Assemble Final Invoice Object ───────────────────────────

    const invoice = {
      // Meta
      invoiceNumber: generateInvoiceNumber(obj._id.toString(), obj.createdAt),
      invoiceDate:   obj.createdAt,
      dueDate:       null,
      invoiceStatus: obj.invoiceStatus || "DRAFT",

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
        serviceLabel: obj.serviceLabel || SERVICE_LABELS[serviceKey]       || "Roadside Assistance",
        description:  obj.description  || SERVICE_DESCRIPTIONS[serviceKey] || SERVICE_DESCRIPTIONS.OTHER,
        sacCode:      obj.serviceSacCode || SERVICE_SAC_CODE,
        isPriority:   obj.isPriority ?? false,
        technicianName:  obj.technicianName  || null,
        technicianPhone: obj.technicianPhone || null,
        scrapBatteryExchange: obj.scrapBatteryExchange || null,
      },

      // Vehicle
      vehicle: {
        type:  (obj.vehicle?.type  || obj.vehicleType  || "").toUpperCase(),
        plate: obj.vehicle?.plateNumber || obj.vehiclePlate || "",
        name:  obj.vehicleName || "",
      },

      // Line items: service items first, then products
      lineItems: allLineItems,

      // Combined GST breakdown
      tax: {
        serviceSubtotal:  round2(serviceLineItems.reduce((s, l) => s + l.base, 0)),
        productsSubtotal: round2(productLineItems.reduce((s, l) => s + l.base, 0)),
        subtotal:         totalBase,
        cgst:             totalCgst,
        sgst:             totalSgst,
        totalGst:         round2(totalCgst + totalSgst),
        grandTotal,
        hasProducts:      soldProducts.length > 0,
        cgstRate:         uniformRate !== null ? uniformRate / 2 : null,
        sgstRate:         uniformRate !== null ? uniformRate / 2 : null,
        gstRate:          uniformRate !== null ? uniformRate : null,
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

// ── PUT Handler ────────────────────────────────────────────────────────────

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

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

    // Lock updates if already finalized
    if (booking.invoiceStatus === "FINAL") {
      return NextResponse.json(
        { success: false, error: "Invoice is finalized and cannot be modified" },
        { status: 400 }
      );
    }

    // 1. Update Customer Details (if provided)
    if (body.customer) {
      if (body.customer.name) {
        if (!booking.customer) booking.customer = {};
        booking.customer.name = body.customer.name;
        booking.customerName = body.customer.name;
      }
      if (body.customer.phone) {
        if (!booking.customer) booking.customer = {};
        booking.customer.phone = body.customer.phone;
        booking.phone = body.customer.phone;
      }
      if (body.customer.address) {
        if (!booking.location) booking.location = { coordinates: [0, 0] };
        booking.location.address = body.customer.address;
        booking.addressString = body.customer.address;
      }
    }

    // 2. Update Service Details (if provided)
    if (body.booking) {
      if (body.booking.serviceLabel) {
        booking.serviceLabel = body.booking.serviceLabel;
      }
      if (body.booking.description) {
        booking.description = body.booking.description;
      }
      if (body.booking.sacCode) {
        booking.serviceSacCode = body.booking.sacCode;
      }
    }

    // 3. Update Sold Products & Services (if provided)
    if (Array.isArray(body.lineItems)) {
      const updatedProducts: any[] = [];
      const updatedServices: any[] = [];
      let totalGstInclusive = 0;

      for (const item of body.lineItems) {
        const qty = Number(item.quantity) || 1;
        const unitPrice = Number(item.unitPrice) || 0;
        totalGstInclusive += unitPrice * qty;

        if (item.type === "service") {
          updatedServices.push({
            serviceType: item.serviceType || "OTHER",
            name: item.description || "Service",
            description: item.detail || "",
            sacCode: item.hsnCode || "9987",
            gstRate: item.gstRate !== undefined ? Number(item.gstRate) : 0.18,
            quantity: qty,
            unitPrice: unitPrice,
          });
        } else {
          updatedProducts.push({
            productId: item.productId || "custom-product",
            name: item.description || "Product",
            brand: item.brand || "",
            sku: item.sku || "",
            hsnCode: item.hsnCode || "8507",
            gstRate: item.gstRate !== undefined ? Number(item.gstRate) : 0.28,
            quantity: qty,
            unitPrice: unitPrice,
          });
        }
      }

      booking.soldProducts = updatedProducts;
      booking.soldServices = updatedServices;
      booking.paymentAmount = round2(totalGstInclusive);
    } else if (body.servicePrice !== undefined) {
      // Direct legacy update of servicePrice
      const servicePrice = Number(body.servicePrice) || 0;
      const productsTotal = (booking.soldProducts || []).reduce(
        (sum: number, p: any) => sum + p.unitPrice * p.quantity,
        0
      );
      booking.paymentAmount = round2(servicePrice + productsTotal);
    }

    // 4. Update Invoice Status / Finalize
    if (body.invoiceStatus) {
      booking.invoiceStatus = body.invoiceStatus;
    }

    await booking.save();

    return NextResponse.json({
      success: true,
      message: `Invoice updated successfully. Status: ${booking.invoiceStatus}`,
      invoiceStatus: booking.invoiceStatus,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("[PUT /api/invoices/:id] Error:", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
