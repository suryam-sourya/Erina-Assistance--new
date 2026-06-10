"use client";

/**
 * Invoice Page — /admin/invoice/[id]
 *
 * Provides a dynamic, editable invoice experience when in DRAFT state.
 * Allows editing service labels, prices, customer details, and products (add/delete/edit).
 * Supports adding multiple services and products.
 * Real-time client-side tax/total recalculation.
 * Finalizing permanently locks editing and enables the clean read-only print layout.
 */

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  FileText,
  Printer,
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Phone,
  Car,
  Wrench,
  Calendar,
  Hash,
  Building2,
  Shield,
  Trash2,
  Plus,
  Save,
  FileEdit,
  AlertTriangle,
  Mail,
  User,
  UserCog,
  Receipt,
  Clock3,
  
} from "lucide-react";
import Link from "next/link";

// ── Types (mirrors the API response shape) ────────────────────────────────

interface InvoiceTax {
  subtotal: number;
  cgstRate?: number | null;
  cgst: number;
  sgstRate?: number | null;
  sgst: number;
  totalGst: number;
  gstRate?: number | null;
  grandTotal: number;
}

interface InvoiceLineItem {
  type?: "service" | "product";
  description: string;
  detail: string;
  sacCode?: string;
  hsnCode?: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  gstRate?: number;
  base?: number;
  cgst?: number;
  sgst?: number;
  productId?: string;
  brand?: string;
  sku?: string;
  serviceType?: string;
}

interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  invoiceStatus: "DRAFT" | "FINAL";
  company: {
    name: string;
    shortName: string;
    address: string;
    gstin: string;
    support: string;
    phone: string;
  };
  customer: {
    name: string;
    phone: string;
    address: string;
  };
  booking: {
    id: string;
    ticketId: string | null;
    status: string;
    serviceType: string;
    serviceLabel: string;
    description: string;
    sacCode: string;
    isPriority: boolean;
    technicianName: string | null;
    technicianPhone: string | null;
    scrapBatteryExchange?: {
      isExchanged: boolean;
      brand: string;
      condition: string;
      discountValue: number;
    } | null;
  };
  vehicle: {
    type: string;
    plate: string;
    name: string;
  };
  lineItems: InvoiceLineItem[];
  tax: InvoiceTax;
  payment: {
    status: string;
    paidAmount: number;
    method: string;
    currency: string;
  };
  terms: string[];
}

// ── Predefined Services Reference Data ──────────────────────────────────────

const PREDEFINED_SERVICES = [
  { value: "TOWING", label: "Flatbed Towing", desc: "Flatbed Towing — Vehicle recovery and tow-to-hub transportation service." },
  { value: "BATTERY", label: "Battery Jumpstart", desc: "Battery Jumpstart — On-site emergency battery jump-start and diagnostic service." },
  { value: "EV", label: "Mobile EV Charging", desc: "Mobile EV Charging — Emergency mobile electric vehicle charging service." },
  { value: "LOCKOUT", label: "Lockout Assistance", desc: "Lockout Assistance — Professional car lockout opening without vehicle damage." },
  { value: "FUEL", label: "Emergency Fuel Delivery", desc: "Emergency Fuel Delivery — Fuel delivery to the breakdown location." },
  { value: "FLAT_TYRE", label: "Flat Tyre Replacement", desc: "Flat Tyre Replacement — On-site spare tyre fitting and wheel balancing." },
  { value: "ENGINE", label: "Engine Diagnostics", desc: "Engine Diagnostics — On-site engine fault diagnosis and recovery consultation." },
  { value: "ACCIDENT", label: "Accident Recovery", desc: "Accident Recovery — Post-accident vehicle recovery, towing and site clearance." },
  { value: "OTHER", label: "General Roadside Assistance", desc: "General Roadside Assistance — Emergency roadside help as per the service request." },
];

// ── Helpers ───────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function fmt(amount: number): string {
  return amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Recalculate pre-tax bases, CGST, SGST, and grand total based on current input values.
 */
function recalculateInvoice(localLineItems: InvoiceLineItem[], scrapDiscount = 0) {
  let subtotal = 0;
  let cgst = 0;
  let sgst = 0;
  
  const activeRates: number[] = [];

  const updatedItems = localLineItems.map(item => {
    const qty = Number(item.quantity) || 1;
    const unitPrice = Number(item.unitPrice) || 0;
    const gstRate = item.gstRate !== undefined ? Number(item.gstRate) : (item.type === "service" ? 0.18 : 0.28);
    const amount = round2(unitPrice * qty);
    
    // Extract base price: base = amount / (1 + gstRate)
    const base = round2(amount / (1 + gstRate));
    const itemCgst = round2(base * (gstRate / 2));
    const itemSgst = round2(base * (gstRate / 2));

    subtotal += base;
    cgst += itemCgst;
    sgst += itemSgst;

    if (amount > 0 && !activeRates.includes(gstRate)) {
      activeRates.push(gstRate);
    }

    return {
      ...item,
      quantity: qty,
      unitPrice: unitPrice,
      amount: amount,
      base: base,
      cgst: itemCgst,
      sgst: itemSgst,
      gstRate,
    };
  });

  const isUniformRate = activeRates.length === 1;
  const uniformRate = isUniformRate ? activeRates[0] : null;

  return {
    lineItems: updatedItems,
    tax: {
      subtotal: round2(subtotal),
      cgst: round2(cgst),
      sgst: round2(sgst),
      totalGst: round2(cgst + sgst),
      grandTotal: Math.max(0, round2(subtotal + cgst + sgst - scrapDiscount)),
      cgstRate: uniformRate !== null ? uniformRate / 2 : null,
      sgstRate: uniformRate !== null ? uniformRate / 2 : null,
    }
  };
}

// ── Component ─────────────────────────────────────────────────────────────

export default function InvoicePage() {
  const params = useParams();
  const id = params?.id as string;

  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Editable local state (bound if in DRAFT mode)
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchInvoice = async () => {
      try {
        const res = await fetch(`/api/invoices/${id}`);
        if (!res.ok) throw new Error("Invoice not found");
        const data = await res.json();
        if (!data.success) throw new Error(data.error || "Failed to load invoice");
        
        setInvoice(data.invoice);
        setCustomerName(data.invoice.customer.name);
        setCustomerPhone(data.invoice.customer.phone);
        setCustomerAddress(data.invoice.customer.address);
        setLineItems(data.invoice.lineItems);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load invoice");
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id]);

 const handlePrint = () => {
  if (invoice) {
    document.title = invoice.invoiceNumber;
  }

  window.print();
};

  const handleAddProduct = () => {
    const newItem: InvoiceLineItem = {
      type: "product",
      description: "New Product",
      detail: "SKU: N/A | HSN: 8507",
      hsnCode: "8507",
      quantity: 1,
      unitPrice: 0,
      gstRate: 0.28,
      amount: 0,
      base: 0,
      cgst: 0,
      sgst: 0,
      productId: "custom-product-" + Date.now(),
      brand: "",
      sku: "",
    };
    setLineItems([...lineItems, newItem]);
  };

  const handleAddService = () => {
    const newItem: InvoiceLineItem = {
      type: "service",
      description: "General Roadside Assistance",
      detail: "General Roadside Assistance — Emergency roadside help as per the service request.",
      hsnCode: "9987",
      quantity: 1,
      unitPrice: 0,
      gstRate: 0.18,
      amount: 0,
      base: 0,
      cgst: 0,
      sgst: 0,
      serviceType: "OTHER",
    };
    setLineItems([...lineItems, newItem]);
  };

  const handleDeleteItem = (index: number) => {
    const updated = lineItems.filter((_, idx) => idx !== index);
    setLineItems(updated);
  };

  const handleItemChange = (index: number, field: keyof InvoiceLineItem, value: any) => {
    const updated = lineItems.map((item, idx) => {
      if (idx !== index) return item;
      
      const newItem = { ...item, [field]: value };
      
      // Auto-update details if fields change
      if (field === "hsnCode" || field === "sku") {
        newItem.detail = `SKU: ${newItem.sku || "N/A"} | HSN: ${newItem.hsnCode || "8507"}`;
      }
      return newItem;
    });
    setLineItems(updated);
  };

  const handleServiceSelect = (index: number, serviceTypeValue: string) => {
    const found = PREDEFINED_SERVICES.find(s => s.value === serviceTypeValue);
    if (!found) return;

    const updated = lineItems.map((item, idx) => {
      if (idx !== index) return item;
      return {
        ...item,
        serviceType: serviceTypeValue,
        description: found.label,
        detail: found.desc,
        hsnCode: "9987",
        gstRate: 0.18,
      };
    });
    setLineItems(updated);
  };

  const handleSave = async (status: "DRAFT" | "FINAL") => {
    if (status === "FINAL") {
      const confirmFinal = confirm(
        "Are you sure you want to finalize this invoice? Once finalized, it cannot be modified."
      );
      if (!confirmFinal) return;
    }

    setSaving(true);
    setSaveSuccess(false);
    setError(null);

    try {
      const payload = {
        customer: {
          name: customerName,
          phone: customerPhone,
          address: customerAddress,
        },
        booking: {
          serviceLabel: lineItems.find(i => i.type === "service")?.description || "",
          description: lineItems.find(i => i.type === "service")?.detail || "",
          sacCode: lineItems.find(i => i.type === "service")?.hsnCode || "9987",
        },
        lineItems: lineItems,
        invoiceStatus: status,
      };

      const res = await fetch(`/api/invoices/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to update invoice");
      }

      const resData = await res.json();
      if (!resData.success) throw new Error(resData.error || "Failed to update invoice");

      // Refresh invoice data to match backend state
      const getRes = await fetch(`/api/invoices/${id}`);
      if (getRes.ok) {
        const getData = await getRes.json();
        if (getData.success) {
          setInvoice(getData.invoice);
          setCustomerName(getData.invoice.customer.name);
          setCustomerPhone(getData.invoice.customer.phone);
          setCustomerAddress(getData.invoice.customer.address);
          setLineItems(getData.invoice.lineItems);
        }
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save invoice");
    } finally {
      setSaving(false);
    }
  };

  // ── Loading state ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className=" bg-[#0B0F19] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-gray-600 text-xs font-bold uppercase tracking-widest">Loading Invoice...</p>
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────
  if (error || !invoice) {
    return (
      <div className=" bg-[#0B0F19] flex items-center justify-center">
        <div className="text-center space-y-4">
          <FileText size={40} className="text-foreground/20 mx-auto" />
          <h2 className="text-white font-black text-xl uppercase tracking-wider">Invoice Not Found</h2>
          <p className="text-gray-600 text-sm">{error || "This invoice does not exist."}</p>
          <Link
            href="/admin/bookings"
            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-primary/20 transition-all"
          >
            <ArrowLeft size={14} /> Return to Bookings
          </Link>
        </div>
      </div>
    );
  }

  const isCompleted = invoice.booking.status === "completed";
  const { company, customer, booking, vehicle, terms, payment } = invoice;
  const isGoogleMapsLink =
  customer.address?.startsWith("http://") ||
  customer.address?.startsWith("https://");
  
  // Dynamic client-side math recalculation for live preview
  const scrapDiscountVal = booking.scrapBatteryExchange?.isExchanged ? (booking.scrapBatteryExchange.discountValue || 0) : 0;
  const computedInvoice = recalculateInvoice(lineItems, scrapDiscountVal);
  const taxData = invoice.invoiceStatus === "DRAFT" ? computedInvoice.tax : invoice.tax;

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Screen-only Notifications ─────────────────────────────────── */}
      {error && (
        <div className="print:hidden mb-4 p-3.5 bg-danger/10 border border-danger/25 text-danger rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertTriangle size={14} /> {error}
        </div>
      )}
      {saveSuccess && (
        <div className="print:hidden mb-4 p-3.5 bg-success/10 border border-success/25 text-success rounded-xl text-xs font-semibold flex items-center gap-2 animate-bounce">
          <CheckCircle2 size={14} /> Invoice changes saved successfully!
        </div>
      )}

      {/* ── Screen-only Controls (hidden on print) ─────────────────────── */}
      <div className="print:hidden mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/bookings"
            className="flex items-center gap-2 text-gray-700 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors"
          >
            <ArrowLeft size={14} />
            Bookings
          </Link>
          <span className="text-foreground/20">/</span>
          <span className="text-gray-700 text-xs font-bold uppercase tracking-wider">Invoice</span>
          <span className="text-foreground/20">/</span>
          <span className="text-primary text-xs font-bold font-mono">{invoice.invoiceNumber}</span>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {isCompleted && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-success/10 text-success border border-success/25 rounded-lg text-[10px] font-black uppercase tracking-wider">
              <CheckCircle2 size={12} /> Service Resolved
            </span>
          )}

          {invoice.invoiceStatus === "DRAFT" ? (
            <>
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-warning/10 text-warning border border-warning/25 rounded-lg text-[10px] font-black uppercase tracking-wider animate-pulse">
                <FileEdit size={12} /> Draft Invoice
              </span>
              <button
                onClick={() => handleSave("DRAFT")}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-gray-300 font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
              >
                <Save size={14} />
                {saving ? "Saving..." : "Save Draft"}
              </button>
              <button
                onClick={() => handleSave("FINAL")}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-background font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-primary/25 cursor-pointer disabled:opacity-50"
              >
                <CheckCircle2 size={14} />
                Finalize &amp; Create Invoice
              </button>
            </>
          ) : (
            <>
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-success/10 text-success border border-success/25 rounded-lg text-[10px] font-black uppercase tracking-wider">
                <Shield size={12} /> Finalized Invoice
              </span>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-background font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-primary/25 cursor-pointer"
              >
                <Printer size={14} />
                Print Invoice
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Main Invoice Paper ─────────────────────────────────────────── */}
      <div
 id="invoice-paper"
 className="
 relative
 mx-auto
 bg-white
 rounded-3xl
 print:rounded-none
 overflow-visible
 shadow-2xl
 print:shadow-none
 print:max-w-none
 print:w-auto
 print:overflow-visible
"
>
        
        {/* ── Header Band ──────────────────────────────────────────────── */}
        <div className="
          bg-white
          border-b border-white/8 px-8 py-7
         print:bg-white print:border-b-2 print:border-black print:py-6
        ">
         <div className="relative z-10 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            {/* Company Branding */}
<div className="space-y-3">
  <img
    src="/logo-full.png"
    alt="Erina Assistance"
    className="h-24 w-auto object-contain"
  />

  <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
    Erina Assistance Pvt. Ltd.
  </p>

  <div className="space-y-1 text-sm text-gray-600">
   <div className="flex items-start gap-2 text-gray-700">
  <MapPin
    size={16}
    className="text-orange-600 mt-1 shrink-0"
  />

  <span>{company.address}</span>
</div>
    <div className="flex items-center gap-2 text-gray-700">
  <Phone
    size={16}
    className="text-orange-600 shrink-0"
  />
  <span>{company.phone}</span>
</div>

<div className="flex items-center gap-2 text-gray-700">
  <Mail
    size={16}
    className="text-orange-600 shrink-0"
  />
  <span>{company.support}</span>
</div>
    <p className="font-bold text-red-600">
      GSTIN: {company.gstin}
    </p>
  </div>
</div>

            {/* Invoice Meta */}
            <div className="relative z-20 text-right space-y-5">

  <h2 className="text-4xl font-black text-gray-800 tracking-wide mr-4">
    TAX INVOICE
  </h2>

  <div className="flex justify-center">
    <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-6 py-3 rounded-xl font-black text-lg shadow-md min-w-[280px] text-center">
      {invoice.invoiceNumber}
    </div>
  </div>

  <div className="flex flex-col items-center gap-3 text-sm text-gray-700">

    <div className="flex items-center gap-2">
      <Calendar
        size={16}
        className="text-orange-600"
      />
      <span className="font-semibold">
        <strong>Date:</strong>{" "}
        {formatDate(invoice.invoiceDate)}
      </span>
    </div>

    <div className="flex items-center gap-2">
      <Clock3
        size={16}
        className="text-orange-600"
      />
      <span className="font-semibold">
        <strong>Time:</strong>{" "}
        {formatTime(  invoice.invoiceDate)}
      </span>
    </div>

    {booking.ticketId && (
      <div className="flex items-center gap-2">
        <Receipt
          size={16}
          className="text-orange-600"
        />
        <span className="font-semibold">
          <strong>Ticket:</strong>{" "}
          {booking.ticketId}
        </span>
      </div>
    )}

  </div>

</div>

          </div>
        </div>

        {/* ── Billing Details Grid ──────────────────────────────────────── */}
        <div className="px-8 py-6 grid grid-cols-1 sm:grid-cols-2 gap-2 border-b border-white/5 print:border-b print:border-gray-200">

          <div className="border rounded-2xl overflow-hidden bg-white shadow-sm">
  <p className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-3 font-black uppercase tracking-wider text-sm">
    BILL TO
  </p>

{invoice.invoiceStatus === "DRAFT" ? ( <div className="p-7 min-h-[180px] space-y-4">


  <div className="flex items-center gap-3">
    <div className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center bg-gray-50 shrink-0">
  <User
    size={16}
    className="text-gray-500"
  />
</div>

    <input
      type="text"
      value={customerName}
      onChange={(e) => setCustomerName(e.target.value)}
      className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-black font-bold focus:outline-none focus:border-orange-500"
      placeholder="Customer Name"
    />
  </div>

  <div className="flex items-center gap-3">
    <Phone size={16} className="text-orange-600 shrink-0" />

    <input
      type="text"
      value={customerPhone}
      onChange={(e) => setCustomerPhone(e.target.value)}
      className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:border-orange-500"
      placeholder="Phone Number"
    />
  </div>

  <div className="flex items-start gap-3">
    <MapPin size={16} className="text-orange-600 shrink-0 mt-1" />

    <textarea
      value={customerAddress}
      onChange={(e) => setCustomerAddress(e.target.value)}
      className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:border-orange-500 h-16 resize-none"
      placeholder="Billing Address"
    />
  </div>

</div>


) : ( <div className="p-7 min-h-[180px]">


 <div className="flex items-center gap-2 mb-4">
  <User
    size={15}
    className="text-orange-600 shrink-0"
  />

  <p className="text-2xl font-black text-black">
    {customer.name}
  </p>
</div>

  <div className="flex items-center gap-2 text-gray-700 mb-3">
    <Phone size={15} className="text-orange-600 shrink-0" />
    <span className="font-semibold">
      {customer.phone || "—"}
    </span>
  </div>

  <div className="flex items-start gap-2 text-gray-700">
    <MapPin size={15} className="text-orange-600 shrink-0 mt-1" />

    {isGoogleMapsLink ? (
      <a
        href={customer.address}
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold text-red-600 hover:text-red-700 underline break-all"
      >
        View Shared Location
      </a>
    ) : (
      <p
        className="font-semibold break-words leading-5"
        title={customer.address}
      >
        {customer.address || "Bengaluru"}
      </p>
    )}
  </div>

</div>


)}

</div>



          {/* Vehicle & Service */}
          <div className="border rounded-2xl overflow-hidden bg-white shadow-sm">
            <p className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-3 font-black uppercase tracking-wider text-sm">
  VEHICLE & SERVICE
</p>
            <div className="p-5">
              <div className="flex items-center gap-2 text-gray-700 text-xs print:text-gray-600">
                <Car size={18} className="text-orange-600 shrink-0" />
                <span className="font-semibold text-sm text-gray-800"> {vehicle.name || vehicle.type || "Vehicle"} </span> {vehicle.plate && ( <span className="font-semibold text-sm text-gray-700"> {vehicle.plate} </span> )}
              </div>
              <div className="flex items-center gap-2 text-gray-700 text-xs print:text-gray-600">
                <Wrench size={18} className="text-orange-600 shrink-0" />
                <span className="font-bold text-lg text-black"> {invoice.invoiceStatus === "DRAFT" ? ( lineItems.find(i => i.type === "service") ?.description || booking.serviceLabel ) : booking.serviceLabel} </span>
              </div>
              {booking.technicianName && (
                <div className="flex items-center gap-2 text-gray-700 text-xs print:text-gray-600">
                 <Building2 size={18} className="text-orange-600 shrink-0" />
                  <span className="font-semibold text-sm"> Technician: {booking.technicianName} </span>
                  {booking.technicianPhone && (
                    <span className="text-gray-600 font-medium"> ({booking.technicianPhone}) </span>
                  )}
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-700 text-xs print:text-gray-600">
                <Calendar size={18} className="text-orange-600 shrink-0" />
                <span className="font-semibold text-sm"> Dispatched: {formatDate(invoice.invoiceDate)} </span>
              </div>
              <div className="flex items-center gap-2 text-gray-700 text-xs print:text-gray-600">
                <Hash size={18} className="text-orange-600 shrink-0" />
                <span className="font-mono font-bold text-sm text-black"> {booking.id.slice(-8).toUpperCase()} </span>
                <span className="text-gray-500 text-sm"> Ref ID </span>
              </div>
            </div>
          </div>

        </div>

        {/* ── Line Item Table ───────────────────────────────────── */}
        <div className="px-8 py-6 print:py-4">
          <table className="w-full text-xs print:text-sm">
            <thead>
  <tr className="bg-gradient-to-r from-orange-500 to-red-600 text-white">

    <th className="py-4 pl-6 text-left text-sm font-black text-white uppercase tracking-wider rounded-tl-2xl">
      # Description
    </th>

    <th className="w-[14%] py-4 text-center text-sm font-black text-white uppercase tracking-wider">
      HSN/SAC
    </th>

    <th className="w-[10%] py-4 text-center text-sm font-black text-white uppercase tracking-wider">
      Qty
    </th>

    <th className=" w-[18%] py-4 text-right text-sm font-black text-white uppercase tracking-wider">
      Rate (₹)
    </th>

    <th className=" w-[18%] py-4 pr-6 text-right text-sm font-black text-white uppercase tracking-wider rounded-tr-2xl">
      {invoice.invoiceStatus === "DRAFT"
        ? "GST / Actions"
        : "Amount (₹)"}
    </th>

  </tr>
</thead>
            <tbody>
              {invoice.invoiceStatus === "DRAFT" ? (
                // DRAFT (Editable) mode
                <>
                  {lineItems.map((item, i) => {
                    const isService = item.type === "service";
                    return (
                      <tr key={i} className="border-b border-white/5">
                        <td className="py-4 pr-4">
                          {isService ? (
                            <div className="flex flex-col gap-2">
                              <div className="flex gap-2">
                                <select
                                  value={item.serviceType || "OTHER"}
                                  onChange={(e) => handleServiceSelect(i, e.target.value)}
                                  className="bg-white border-gray-300 text-black border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-black focus:outline-none focus:border-primary/50 font-bold shrink-0"
                                >
                                  {PREDEFINED_SERVICES.map(s => (
                                    <option key={s.value} value={s.value}>{s.label}</option>
                                  ))}
                                </select>
                                <input
                                  type="text"
                                  value={item.description}
                                  onChange={(e) => handleItemChange(i, "description", e.target.value)}
                                  className="w-full bg-white border-gray-300 text-black border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-black focus:outline-none focus:border-primary/50 font-bold"
                                  placeholder="Service Title"
                                />
                              </div>
                              <textarea
                                value={item.detail || ""}
                                onChange={(e) => handleItemChange(i, "detail", e.target.value)}
                                className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:border-orange-500 h-16 resize-none"
                                placeholder="Service details/description..."
                              />
                            </div>
                          ) : (
                            <div>
                              <input
                                type="text"
                                value={item.description}
                                onChange={(e) => handleItemChange(i, "description", e.target.value)}
                                className="w-full bg-white border-gray-300 text-black border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-black focus:outline-none focus:border-primary/50 font-bold"
                                placeholder="Product Name"
                              />
                              <div className="flex gap-2 mt-1.5">
                                <input
                                  type="text"
                                  value={item.brand || ""}
                                  onChange={(e) => handleItemChange(i, "brand", e.target.value)}
                                  className="w-1/2 bg-white border-gray-300 text-black border border-gray-300 rounded-lg px-2.5 py-1 text-[10px] text-foreground/70 focus:outline-none focus:border-primary/50"
                                  placeholder="Brand (e.g. Exide)"
                                />
                                <input
                                  type="text"
                                  value={item.sku || ""}
                                  onChange={(e) => handleItemChange(i, "sku", e.target.value)}
                                  className="w-1/2 bg-white border-gray-300 text-black border border-gray-300 rounded-lg px-2.5 py-1 text-[10px] text-foreground/70 focus:outline-none focus:border-primary/50"
                                  placeholder="SKU"
                                />
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="py-4 text-center">
                          <input
                            type="text"
                            value={item.hsnCode || ""}
                            onChange={(e) => handleItemChange(i, "hsnCode", e.target.value)}
                            className="w-16 bg-white border-gray-300 text-black border border-gray-300 rounded-lg px-2 py-1.5 text-center text-xs text-black font-mono focus:outline-none focus:border-primary/50"
                            placeholder="HSN/SAC"
                          />
                        </td>
                        <td className="py-4 text-center">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(i, "quantity", parseInt(e.target.value) || 1)}
                            className="w-12 bg-white border-gray-300 text-black border border-gray-300 rounded-lg px-2 py-1.5 text-center text-xs text-black font-bold focus:outline-none focus:border-primary/50"
                          />
                        </td>
                        <td className="py-4 text-right">
                          <div className="relative inline-block">
                            <span className="absolute left-2.5 top-1.5 text-gray-600 text-xs">₹</span>
                            <input
                              type="number"
                              min="0"
                              value={item.unitPrice}
                              onChange={(e) => handleItemChange(i, "unitPrice", parseFloat(e.target.value) || 0)}
                              className="w-24 bg-white border-gray-300 text-black border border-gray-300 rounded-lg pl-6 pr-2.5 py-1.5 text-right text-xs text-black font-semibold focus:outline-none focus:border-primary/50"
                            />
                          </div>
                        </td>
                        <td className="py-4 text-right pl-4">
                          <div className="flex items-center justify-end gap-2">
                            <select
                              value={item.gstRate}
                              onChange={(e) => handleItemChange(i, "gstRate", parseFloat(e.target.value))}
                              className="bg-white border-gray-300 text-black border border-gray-300 rounded-lg px-2 py-1.5 text-xs text-black focus:outline-none focus:border-primary/50"
                            >
                              <option value="0.28">28%</option>
                              <option value="0.18">18%</option>
                              <option value="0.12">12%</option>
                              <option value="0.05">5%</option>
                              <option value="0">0%</option>
                            </select>
                            <button
                              type="button"
                              onClick={() => handleDeleteItem(i)}
                              className="p-1.5 bg-danger/10 hover:bg-danger/20 text-danger rounded-lg transition-all border border-danger/10 cursor-pointer"
                              title="Delete Item"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="print:hidden">
                    <td colSpan={5} className="py-4 text-center">
                      <div className="flex items-center justify-center gap-4">
                        <button
                          type="button"
                          onClick={handleAddService}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-red-600 border border-cyan-500/20 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                        >
                          <Plus size={13} /> Add Service Line Item
                        </button>
                        <button
                          type="button"
                          onClick={handleAddProduct}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                        >
                          <Plus size={13} /> Add Product Line Item
                        </button>
                      </div>
                    </td>
                  </tr>
                </>
              ) : (
                // FINAL (Read-only) mode
                <>
                  {lineItems.map((item, i) => (
                    <tr key={i} className="border-b border-gray-200">

  <td className="py-6 pr-4">
    <p className="font-bold text-black text-lg">
      
      
      {item.description
        ?.replace(/_/g, " ")
        ?.replace(/\b\w/g, (c) => c.toUpperCase())}
    </p>

    <p className="text-gray-700 text-sm mt-3 leading-7 font-medium">
      {item.detail}
    </p>

    {booking.isPriority && (
      <span className="inline-flex mt-3 items-center gap-1 px-3 py-1 bg-red-50 text-red-600 border border-red-200 rounded-full text-xs font-bold">
        🚨 Priority / Emergency Call
      </span>
    )}
  </td>

  <td className="py-6 text-center text-gray-600 font-mono text-sm font-semibold">
    {item.hsnCode || item.sacCode || "—"}
  </td>

  <td className="py-6 text-center text-gray-700 text-lg font-bold">
    {item.quantity}
  </td>

  <td className="py-6 pr-8 text-right text-gray-800 text-lg font-semibold">
    ₹{fmt(item.unitPrice)}
  </td>

  <td className="py-6 pr-8 text-right text-black text-xl font-black">
    ₹{fmt(item.amount)}
  </td>

</tr>
                  ))}
                </>
              )}
            </tbody>
          </table>
        </div>

        {/* ── Tax & Total Summary ──────────────────────────────────────── */}
        <div className="px-8 pb-6 print:pb-4">
          <div className="flex justify-end">
            <div className="w-full max-w-xs space-y-0">
              <div className="flex justify-between items-center py-2 border-b border-white/5 print:border-b print:border-gray-100">
                <span className="text-[10px] text-foreground/45 font-bold uppercase tracking-wider print:text-gray-500 print:text-xs">Subtotal (excl. GST)</span>
                <span className="text-xs text-foreground/60 font-bold print:text-gray-600">₹{fmt(taxData.subtotal)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5 print:border-b print:border-gray-100">
                <span className="text-[10px] text-foreground/45 font-bold uppercase tracking-wider print:text-gray-500 print:text-xs">
                  CGST {taxData.cgstRate !== undefined && taxData.cgstRate !== null ? `@ ${(taxData.cgstRate * 100).toFixed(1)}%` : ""}
                </span>
                <span className="text-xs text-foreground/60 font-bold print:text-gray-600">₹{fmt(taxData.cgst)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/8 print:border-b print:border-gray-200">
                <span className="text-[10px] text-foreground/45 font-bold uppercase tracking-wider print:text-gray-500 print:text-xs">
                  SGST {taxData.sgstRate !== undefined && taxData.sgstRate !== null ? `@ ${(taxData.sgstRate * 100).toFixed(1)}%` : ""}
                </span>
                <span className="text-xs text-foreground/60 font-bold print:text-gray-600">₹{fmt(taxData.sgst)}</span>
              </div>
              
              {booking.scrapBatteryExchange?.isExchanged && booking.scrapBatteryExchange.discountValue > 0 && (
                <div className="flex justify-between items-center py-2 border-b border-white/8 print:border-b print:border-gray-200">
                  <span className="text-[10px] text-yellow-500 font-bold uppercase tracking-wider print:text-gray-600 print:text-xs">
                    Less: Scrap Battery Exchange ({booking.scrapBatteryExchange.brand})
                  </span>
                  <span className="text-xs text-yellow-500 font-bold print:text-gray-600">-₹{fmt(booking.scrapBatteryExchange.discountValue)}</span>
                </div>
              )}

              <div className="flex justify-between items-center py-4 mt-1">
                <span className="text-sm font-black text-white uppercase tracking-wider print:text-black print:text-base">Grand Total</span>
                <span className="text-xl font-black text-primary print:text-black print:text-2xl">₹{fmt(taxData.grandTotal)}</span>
              </div>
              <div className={`flex items-center justify-between p-3 rounded-xl border print:border print:rounded-none ${
                payment.status === "completed"
                  ? "bg-success/8 border-success/20 print:border-green-300"
                  : "bg-warning/8 border-warning/20 print:border-yellow-300"
              }`}>
                <span className="text-[9px] font-black uppercase tracking-widest text-foreground/45 print:text-gray-500">Payment Status</span>
                <span className={`text-[10px] font-black uppercase tracking-wider ${
                  payment.status === "completed" ? "text-success print:text-green-600" : "text-warning print:text-yellow-600"
                }`}>
                  {payment.status === "completed" ? "✓ Paid" : "⏳ Pending"}
                </span>
              </div>
            </div>
          </div>
        </div>

       

        {/* ── Footer ────────────────────────────────────────────────────── */}
        <div className="px-8 py-2 bg-white">

  <div className="flex items-center justify-center gap-2">

    <div className="w-24 border-t border-red-400" />

    <p className="text-[16px] font-medium tracking-wide text-black">
      THANK YOU FOR CHOOSING{" "}
      <span className="font-bold text-orange-600">
        ERINA ASSISTANCE!
      </span>
    </p>

    <div className="w-24 border-t border-red-400" />

  </div>

</div>

      </div>

      {/* ── Print-only global styles ─────────────────────────────────────── */}
     <style>{`
@page {
  size: A4 portrait;
  margin: 5mm;
}

@media print {

  html,
  body,
  #__next {
    margin: 0 !important;
    padding: 0 !important;
    width: 100% !important;
    height: auto !important;
    min-height: auto !important;
    overflow: visible !important;

    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* Hide admin UI */
  .print\\:hidden,
  aside,
  nav,
  header,
  footer,
  iframe,
  button,
  [data-sidebar],
  [data-radix-popper-content-wrapper],
  [data-sonner-toaster],
  [data-chatbot],
  .chat-widget,
  #chat-widget {
    display: none !important;
    visibility: hidden !important;
  }

  /* Show only invoice */
  body * {
    visibility: hidden;
  }

  #invoice-paper,
  #invoice-paper * {
    visibility: visible;
  }

  #invoice-paper {
    position: static !important;
    display: block !important;

    width: auto !important;
    max-width: none !important;

    margin: 0 !important;
    padding: 0 !important;

    height: auto !important;
    min-height: auto !important;

    overflow: visible !important;

    border: none !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    transform: none !important;

    page-break-after: auto !important;
    page-break-before: auto !important;
  }

  table {
    width: 100% !important;
    border-collapse: collapse !important;
    page-break-inside: auto !important;
  }

  thead {
    display: table-header-group !important;
  }

  tfoot {
    display: table-footer-group !important;
  }

  tbody {
    page-break-inside: auto !important;
  }

  tr,
  td,
  th {
    page-break-inside: avoid !important;
  }

  img {
    max-width: 100% !important;
  }

  .break-inside-avoid {
    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }
}
`}</style>
    </>
  );
}
