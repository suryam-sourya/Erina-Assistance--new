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
function recalculateInvoice(localLineItems: InvoiceLineItem[]) {
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
      grandTotal: round2(subtotal + cgst + sgst),
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

  const handlePrint = () => window.print();

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
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-foreground/40 text-xs font-bold uppercase tracking-widest">Loading Invoice...</p>
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────
  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
        <div className="text-center space-y-4">
          <FileText size={40} className="text-foreground/20 mx-auto" />
          <h2 className="text-white font-black text-xl uppercase tracking-wider">Invoice Not Found</h2>
          <p className="text-foreground/40 text-sm">{error || "This invoice does not exist."}</p>
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
  
  // Dynamic client-side math recalculation for live preview
  const computedInvoice = recalculateInvoice(lineItems);
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
            className="flex items-center gap-2 text-foreground/50 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors"
          >
            <ArrowLeft size={14} />
            Bookings
          </Link>
          <span className="text-foreground/20">/</span>
          <span className="text-foreground/50 text-xs font-bold uppercase tracking-wider">Invoice</span>
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
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50"
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
          max-w-3xl mx-auto
          bg-card border border-white/8
          rounded-2xl overflow-hidden
          print:bg-white print:border-0 print:rounded-none print:shadow-none print:max-w-none print:mx-0
        "
      >
        {/* ── Header Band ──────────────────────────────────────────────── */}
        <div className="
          bg-gradient-to-r from-primary/15 via-primary/8 to-transparent
          border-b border-white/8 px-8 py-7
          print:bg-black print:border-b-2 print:border-black print:py-6
        ">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">

            {/* Company Branding */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Shield size={20} className="text-primary print:hidden" />
                <h1 className="text-xl font-black text-white uppercase tracking-widest print:text-black print:text-2xl">
                  {company.shortName}
                </h1>
              </div>
              <p className="text-[10px] text-foreground/45 font-bold uppercase tracking-wider print:text-gray-600 print:text-xs">
                Roadside Assistance Services Pvt. Ltd.
              </p>
              <div className="mt-3 space-y-0.5">
                {company.address.split(",").slice(0, 2).map((line, i) => (
                  <p key={i} className="text-[10px] text-foreground/50 print:text-gray-600 print:text-xs">{line.trim()}</p>
                ))}
                <p className="text-[10px] text-primary/80 font-bold print:text-gray-700 print:text-xs">
                  GSTIN: {company.gstin}
                </p>
              </div>
            </div>

            {/* Invoice Meta */}
            <div className="text-left sm:text-right space-y-1.5 print:text-right">
              <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest print:text-gray-500 print:text-xs">
                {invoice.invoiceStatus === "DRAFT" ? "Draft Invoice" : "Tax Invoice"}
              </p>
              <p className="text-lg font-black text-white font-mono print:text-black print:text-xl">
                {invoice.invoiceNumber}
              </p>
              <div className="mt-2 space-y-0.5">
                <p className="text-[10px] text-foreground/45 print:text-gray-600 print:text-xs">
                  <span className="font-bold text-foreground/60">Date:</span> {formatDate(invoice.invoiceDate)}
                </p>
                <p className="text-[10px] text-foreground/45 print:text-gray-600 print:text-xs">
                  <span className="font-bold text-foreground/60">Time:</span> {formatTime(invoice.invoiceDate)}
                </p>
                {booking.ticketId && (
                  <p className="text-[10px] text-primary/80 font-bold font-mono print:text-gray-700 print:text-xs">
                    Ticket: {booking.ticketId}
                  </p>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* ── Billing Details Grid ──────────────────────────────────────── */}
        <div className="px-8 py-6 grid grid-cols-1 sm:grid-cols-2 gap-6 border-b border-white/5 print:border-b print:border-gray-200">

          {/* Bill To */}
          <div className="space-y-3">
            <p className="text-[9px] text-foreground/35 font-black uppercase tracking-widest print:text-gray-500 print:text-[10px]">
              Bill To
            </p>
            {invoice.invoiceStatus === "DRAFT" ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-[#161B26] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-primary/50"
                  placeholder="Customer Name"
                />
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full bg-[#161B26] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-primary/50"
                  placeholder="Phone Number"
                />
                <textarea
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="w-full bg-[#161B26] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-primary/50 h-16 resize-none"
                  placeholder="Billing Address"
                />
              </div>
            ) : (
              <div className="space-y-1.5">
                <p className="text-sm font-black text-white uppercase tracking-wide print:text-black print:text-base">
                  {customer.name}
                </p>
                <div className="flex items-center gap-2 text-foreground/50 text-xs print:text-gray-600">
                  <Phone size={11} className="shrink-0" />
                  <span className="font-semibold">{customer.phone || "—"}</span>
                </div>
                <div className="flex items-start gap-2 text-foreground/50 text-xs print:text-gray-600">
                  <MapPin size={11} className="shrink-0 mt-0.5" />
                  <span className="font-semibold">{customer.address || "Bengaluru"}</span>
                </div>
              </div>
            )}
          </div>

          {/* Vehicle & Service */}
          <div className="space-y-3">
            <p className="text-[9px] text-foreground/35 font-black uppercase tracking-widest print:text-gray-500 print:text-[10px]">
              Vehicle &amp; Service
            </p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-foreground/55 text-xs print:text-gray-600">
                <Car size={11} className="shrink-0" />
                <span className="font-semibold">{vehicle.name || vehicle.type || "Vehicle"}</span>
                {vehicle.plate && (
                  <span className="px-1.5 py-0.5 bg-white/5 border border-white/8 rounded font-mono text-[9px] text-foreground/40 uppercase print:border print:border-gray-300 print:text-gray-500">
                    {vehicle.plate}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-foreground/55 text-xs print:text-gray-600">
                <Wrench size={11} className="shrink-0" />
                <span className="font-bold text-white print:text-black">
                  {invoice.invoiceStatus === "DRAFT" 
                    ? (lineItems.find(i => i.type === "service")?.description || booking.serviceLabel) 
                    : booking.serviceLabel}
                </span>
              </div>
              {booking.technicianName && (
                <div className="flex items-center gap-2 text-foreground/50 text-xs print:text-gray-600">
                  <Building2 size={11} className="shrink-0" />
                  <span className="font-semibold">Technician: {booking.technicianName}</span>
                  {booking.technicianPhone && (
                    <span className="text-foreground/35 font-mono text-[9px]">({booking.technicianPhone})</span>
                  )}
                </div>
              )}
              <div className="flex items-center gap-2 text-foreground/50 text-xs print:text-gray-600">
                <Calendar size={11} className="shrink-0" />
                <span className="font-semibold">Dispatched: {formatDate(invoice.invoiceDate)}</span>
              </div>
              <div className="flex items-center gap-2 text-foreground/50 text-xs print:text-gray-600">
                <Hash size={11} className="shrink-0" />
                <span className="font-mono font-bold">{booking.id.slice(-8).toUpperCase()}</span>
                <span className="text-foreground/30 text-[9px]">Ref ID</span>
              </div>
            </div>
          </div>

        </div>

        {/* ── Line Item Table ───────────────────────────────────── */}
        <div className="px-8 py-6 print:py-4">
          <table className="w-full text-xs print:text-sm">
            <thead>
              <tr className="border-b border-white/8 print:border-b print:border-gray-300">
                <th className="py-3 text-left text-[9px] font-black text-foreground/35 uppercase tracking-widest print:text-gray-500 print:text-[11px]"># Description</th>
                <th className="py-3 text-center text-[9px] font-black text-foreground/35 uppercase tracking-widest print:text-gray-500 print:text-[11px]">HSN/SAC</th>
                <th className="py-3 text-center text-[9px] font-black text-foreground/35 uppercase tracking-widest print:text-gray-500 print:text-[11px]">Qty</th>
                <th className="py-3 text-right text-[9px] font-black text-foreground/35 uppercase tracking-widest print:text-gray-500 print:text-[11px]">Rate (₹)</th>
                <th className="py-3 text-right text-[9px] font-black text-foreground/35 uppercase tracking-widest print:text-gray-500 print:text-[11px]">{invoice.invoiceStatus === "DRAFT" ? "GST / Actions" : "Amount (₹)"}</th>
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
                                  className="bg-[#161B26] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-primary/50 font-bold shrink-0"
                                >
                                  {PREDEFINED_SERVICES.map(s => (
                                    <option key={s.value} value={s.value}>{s.label}</option>
                                  ))}
                                </select>
                                <input
                                  type="text"
                                  value={item.description}
                                  onChange={(e) => handleItemChange(i, "description", e.target.value)}
                                  className="w-full bg-[#161B26] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-primary/50 font-bold"
                                  placeholder="Service Title"
                                />
                              </div>
                              <textarea
                                value={item.detail || ""}
                                onChange={(e) => handleItemChange(i, "detail", e.target.value)}
                                className="w-full bg-[#161B26] border border-white/10 rounded-lg px-2.5 py-1.5 text-[10px] text-foreground/70 focus:outline-none focus:border-primary/50 h-12 resize-none"
                                placeholder="Service details/description..."
                              />
                            </div>
                          ) : (
                            <div>
                              <input
                                type="text"
                                value={item.description}
                                onChange={(e) => handleItemChange(i, "description", e.target.value)}
                                className="w-full bg-[#161B26] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-primary/50 font-bold"
                                placeholder="Product Name"
                              />
                              <div className="flex gap-2 mt-1.5">
                                <input
                                  type="text"
                                  value={item.brand || ""}
                                  onChange={(e) => handleItemChange(i, "brand", e.target.value)}
                                  className="w-1/2 bg-[#161B26] border border-white/10 rounded-lg px-2.5 py-1 text-[10px] text-foreground/70 focus:outline-none focus:border-primary/50"
                                  placeholder="Brand (e.g. Exide)"
                                />
                                <input
                                  type="text"
                                  value={item.sku || ""}
                                  onChange={(e) => handleItemChange(i, "sku", e.target.value)}
                                  className="w-1/2 bg-[#161B26] border border-white/10 rounded-lg px-2.5 py-1 text-[10px] text-foreground/70 focus:outline-none focus:border-primary/50"
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
                            className="w-16 bg-[#161B26] border border-white/10 rounded-lg px-2 py-1.5 text-center text-xs text-white font-mono focus:outline-none focus:border-primary/50"
                            placeholder="HSN/SAC"
                          />
                        </td>
                        <td className="py-4 text-center">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(i, "quantity", parseInt(e.target.value) || 1)}
                            className="w-12 bg-[#161B26] border border-white/10 rounded-lg px-2 py-1.5 text-center text-xs text-white font-bold focus:outline-none focus:border-primary/50"
                          />
                        </td>
                        <td className="py-4 text-right">
                          <div className="relative inline-block">
                            <span className="absolute left-2.5 top-1.5 text-foreground/40 text-xs">₹</span>
                            <input
                              type="number"
                              min="0"
                              value={item.unitPrice}
                              onChange={(e) => handleItemChange(i, "unitPrice", parseFloat(e.target.value) || 0)}
                              className="w-24 bg-[#161B26] border border-white/10 rounded-lg pl-6 pr-2.5 py-1.5 text-right text-xs text-white font-semibold focus:outline-none focus:border-primary/50"
                            />
                          </div>
                        </td>
                        <td className="py-4 text-right pl-4">
                          <div className="flex items-center justify-end gap-2">
                            <select
                              value={item.gstRate}
                              onChange={(e) => handleItemChange(i, "gstRate", parseFloat(e.target.value))}
                              className="bg-[#161B26] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-primary/50"
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
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
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
                    <tr key={i} className="border-b border-white/5 print:border-b print:border-gray-100">
                      <td className="py-5 pr-4">
                        <p className="font-bold text-white text-xs print:text-black print:text-sm">{item.description}</p>
                        <p className="text-foreground/40 text-[10px] mt-1 leading-relaxed print:text-gray-500 print:text-xs">
                          {item.detail}
                        </p>
                        {booking.isPriority && (
                          <span className="inline-flex mt-1.5 items-center gap-1 px-2 py-0.5 bg-emergency/10 text-emergency border border-emergency/20 rounded-full text-[9px] font-black uppercase tracking-wider print:border print:border-red-300 print:text-red-600">
                            🚨 Priority / Emergency Call
                          </span>
                        )}
                      </td>
                      <td className="py-5 text-center text-foreground/40 font-mono text-[10px] print:text-gray-500">
                        {item.hsnCode || item.sacCode || "—"}
                      </td>
                      <td className="py-5 text-center text-foreground/50 font-bold print:text-gray-600">{item.quantity}</td>
                      <td className="py-5 text-right text-foreground/60 font-semibold print:text-gray-600">₹{fmt(item.unitPrice)}</td>
                      <td className="py-5 text-right text-white font-black print:text-black">₹{fmt(item.amount)}</td>
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

        {/* ── Notes & Terms ─────────────────────────────────────────────── */}
        <div className="mx-8 mb-6 p-5 bg-white/2 border border-white/5 rounded-xl print:border print:border-gray-200 print:bg-gray-50 print:rounded-none">
          <p className="text-[9px] text-foreground/35 font-black uppercase tracking-widest mb-2 print:text-gray-500">
            Notes &amp; Terms
          </p>
          <ul className="space-y-1">
            {terms.map((note, i) => (
              <li key={i} className="text-[9px] text-foreground/40 print:text-gray-500 print:text-[10px] leading-relaxed">
                {i + 1}. {note}
              </li>
            ))}
          </ul>
        </div>

        {/* ── Footer ────────────────────────────────────────────────────── */}
        <div className="
          px-8 py-5 border-t border-white/5
          bg-gradient-to-r from-white/2 to-transparent
          flex flex-col sm:flex-row items-center justify-between gap-3
          print:border-t print:border-gray-300 print:bg-gray-50
        ">
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-primary/50 print:hidden" />
            <p className="text-[9px] text-foreground/30 font-bold uppercase tracking-wider print:text-gray-400 print:text-[10px]">
              {company.name} — Bengaluru
            </p>
          </div>
          <p className="text-[9px] text-foreground/25 font-mono print:text-gray-400 print:text-[10px]">
            {invoice.invoiceNumber} • {formatDate(invoice.invoiceDate)}
          </p>
        </div>

      </div>

      {/* ── Print-only global styles ─────────────────────────────────────── */}
      <style>{`
        @media print {
          body { background: white !important; color: black !important; }
          .print\\:hidden { display: none !important; }
          aside, header, nav { display: none !important; }
          main { padding: 0 !important; margin: 0 !important; overflow: visible !important; }
          #invoice-paper { box-shadow: none !important; }
        }
      `}</style>
    </>
  );
}
