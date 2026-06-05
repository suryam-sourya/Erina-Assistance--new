"use client";

/**
 * Invoice Page — /admin/invoice/[id]
 *
 * Pure UI renderer. All invoice data, tax math, and company metadata
 * is fetched from the backend API at GET /api/invoices/[id].
 *
 * This component has zero business logic — it just renders what the backend returns.
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
  description: string;
  detail: string;
  sacCode?: string;
  hsnCode?: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
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

// ── Component ─────────────────────────────────────────────────────────────

export default function InvoicePage() {
  const params = useParams();
  const id = params?.id as string;

  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchInvoice = async () => {
      try {
        // 👇 Calls the dedicated backend invoice API — no math done here
        const res = await fetch(`/api/invoices/${id}`);
        if (!res.ok) throw new Error("Invoice not found");
        const data = await res.json();
        if (!data.success) throw new Error(data.error || "Failed to load invoice");
        setInvoice(data.invoice);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load invoice");
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id]);

  const handlePrint = () => window.print();

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
  const { tax, payment, company, customer, booking, vehicle, lineItems, terms } = invoice;

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <>
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
        <div className="flex items-center gap-3">
          {isCompleted && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-success/10 text-success border border-success/25 rounded-lg text-[10px] font-black uppercase tracking-wider">
              <CheckCircle2 size={12} /> Service Resolved
            </span>
          )}
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-background font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-md shadow-primary/25 cursor-pointer"
          >
            <Printer size={14} />
            Print Invoice
          </button>
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
                Tax Invoice
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
                <span className="font-bold text-white print:text-black">{booking.serviceLabel}</span>
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

        {/* ── Service Line Item Table ───────────────────────────────────── */}
        <div className="px-8 py-6 print:py-4">
          <table className="w-full text-xs print:text-sm">
            <thead>
              <tr className="border-b border-white/8 print:border-b print:border-gray-300">
                <th className="py-3 text-left text-[9px] font-black text-foreground/35 uppercase tracking-widest print:text-gray-500 print:text-[11px]"># Description</th>
                <th className="py-3 text-center text-[9px] font-black text-foreground/35 uppercase tracking-widest print:text-gray-500 print:text-[11px]">HSN/SAC</th>
                <th className="py-3 text-center text-[9px] font-black text-foreground/35 uppercase tracking-widest print:text-gray-500 print:text-[11px]">Qty</th>
                <th className="py-3 text-right text-[9px] font-black text-foreground/35 uppercase tracking-widest print:text-gray-500 print:text-[11px]">Rate (₹)</th>
                <th className="py-3 text-right text-[9px] font-black text-foreground/35 uppercase tracking-widest print:text-gray-500 print:text-[11px]">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
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
            </tbody>
          </table>
        </div>

        {/* ── Tax & Total Summary ──────────────────────────────────────── */}
        <div className="px-8 pb-6 print:pb-4">
          <div className="flex justify-end">
            <div className="w-full max-w-xs space-y-0">
              <div className="flex justify-between items-center py-2 border-b border-white/5 print:border-b print:border-gray-100">
                <span className="text-[10px] text-foreground/45 font-bold uppercase tracking-wider print:text-gray-500 print:text-xs">Subtotal (excl. GST)</span>
                <span className="text-xs text-foreground/60 font-bold print:text-gray-600">₹{fmt(tax.subtotal)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/5 print:border-b print:border-gray-100">
                <span className="text-[10px] text-foreground/45 font-bold uppercase tracking-wider print:text-gray-500 print:text-xs">
                  CGST {tax.cgstRate !== undefined && tax.cgstRate !== null ? `@ ${(tax.cgstRate * 100).toFixed(0)}%` : ""}
                </span>
                <span className="text-xs text-foreground/60 font-bold print:text-gray-600">₹{fmt(tax.cgst)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/8 print:border-b print:border-gray-200">
                <span className="text-[10px] text-foreground/45 font-bold uppercase tracking-wider print:text-gray-500 print:text-xs">
                  SGST {tax.sgstRate !== undefined && tax.sgstRate !== null ? `@ ${(tax.sgstRate * 100).toFixed(0)}%` : ""}
                </span>
                <span className="text-xs text-foreground/60 font-bold print:text-gray-600">₹{fmt(tax.sgst)}</span>
              </div>
              <div className="flex justify-between items-center py-4 mt-1">
                <span className="text-sm font-black text-white uppercase tracking-wider print:text-black print:text-base">Grand Total</span>
                <span className="text-xl font-black text-primary print:text-black print:text-2xl">₹{fmt(tax.grandTotal)}</span>
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
