"use client";

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

interface BookingData {
  id: string;
  ticketId?: string;
  customerName: string;
  phone: string;
  vehicleType: string;
  vehiclePlate: string;
  vehicleName?: string;
  serviceType: string;
  serviceLabel: string;
  status: string;
  paymentStatus: string;
  paymentAmount: number;
  technicianName: string | null;
  technicianPhone?: string;
  address: string;
  location: string;
  createdAt: string;
  updatedAt?: string;
  isPriority?: boolean;
}

const SERVICE_DESCRIPTIONS: Record<string, string> = {
  TOWING: "Flatbed Towing — Vehicle recovery and tow-to-hub transportation service.",
  BATTERY: "Battery Jumpstart — On-site emergency battery jump-start and diagnostic service.",
  EV: "Mobile EV Charging — Emergency mobile electric vehicle charging service.",
  LOCKOUT: "Lockout Assistance — Professional car lockout opening without vehicle damage.",
  FUEL: "Emergency Fuel Delivery — Fuel delivery to the breakdown location.",
  FLAT_TYRE: "Flat Tyre Replacement — On-site spare tyre fitting and wheel balancing.",
  ENGINE: "Engine Diagnostics — On-site engine fault diagnosis and recovery consultation.",
  ACCIDENT: "Accident Recovery — Post-accident vehicle recovery, towing and site clearance.",
  OTHER: "Roadside Assistance — General roadside emergency assistance service.",
};

function generateInvoiceNumber(bookingId: string, createdAt: string): string {
  const date = new Date(createdAt);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const idSuffix = bookingId.slice(-5).toUpperCase();
  return `INV/${year}-${month}/ERA-${idSuffix}`;
}

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

export default function InvoicePage() {
  const params = useParams();
  const id = params?.id as string;

  const [booking, setBooking] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchBooking = async () => {
      try {
        const res = await fetch(`/api/bookings/${id}`);
        if (!res.ok) throw new Error("Booking not found");
        const data = await res.json();
        setBooking(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load booking");
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [id]);

  const handlePrint = () => window.print();

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

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
        <div className="text-center space-y-4">
          <FileText size={40} className="text-foreground/20 mx-auto" />
          <h2 className="text-white font-black text-xl uppercase tracking-wider">Invoice Not Found</h2>
          <p className="text-foreground/40 text-sm">{error || "This invoice does not exist."}</p>
          <Link href="/admin/bookings" className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-primary/20 transition-all">
            <ArrowLeft size={14} /> Return to Bookings
          </Link>
        </div>
      </div>
    );
  }

  // ── Tax Calculations (Backward from GST-inclusive total) ─────────────────
  const gstInclusiveTotal = booking.paymentAmount || 0;
  const subtotal = Math.round((gstInclusiveTotal / 1.18) * 100) / 100;
  const cgst = Math.round((subtotal * 0.09) * 100) / 100;
  const sgst = Math.round((subtotal * 0.09) * 100) / 100;
  const grandTotal = Math.round((subtotal + cgst + sgst) * 100) / 100;

  const invoiceNumber = generateInvoiceNumber(booking.id, booking.createdAt);
  const serviceKey = (booking.serviceType || "OTHER").toUpperCase().replace("-", "_");
  const serviceDescription = SERVICE_DESCRIPTIONS[serviceKey] || SERVICE_DESCRIPTIONS.OTHER;
  const isCompleted = booking.status === "completed";

  return (
    <>
      {/* ── Screen-only Controls (hidden on print) ─── */}
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
          <span className="text-primary text-xs font-bold font-mono">{invoiceNumber}</span>
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

      {/* ── Main Invoice Paper ──────────────────────────────── */}
      <div
        id="invoice-paper"
        className="
          max-w-3xl mx-auto
          bg-card border border-white/8
          rounded-2xl overflow-hidden
          print:bg-white print:border-0 print:rounded-none print:shadow-none print:max-w-none print:mx-0
        "
      >

        {/* ── Header Band ──────────────────────────────────── */}
        <div className="
          bg-gradient-to-r from-primary/15 via-primary/8 to-transparent
          border-b border-white/8 px-8 py-7
          print:bg-black print:border-b-2 print:border-black print:py-6
        ">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">

            {/* Company Branding */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 print:gap-1">
                <Shield size={20} className="text-primary print:hidden" />
                <h1 className="text-xl font-black text-white uppercase tracking-widest print:text-black print:text-2xl">
                  Erina Assistance
                </h1>
              </div>
              <p className="text-[10px] text-foreground/45 font-bold uppercase tracking-wider print:text-gray-600 print:text-xs">
                Roadside Assistance Services Pvt. Ltd.
              </p>
              <div className="mt-3 space-y-0.5">
                <p className="text-[10px] text-foreground/50 print:text-gray-600 print:text-xs">
                  Shop No. 02, Dinnur Main Road, Kadugodi Colony
                </p>
                <p className="text-[10px] text-foreground/50 print:text-gray-600 print:text-xs">
                  Bengaluru — 560067, Karnataka, India
                </p>
                <p className="text-[10px] text-primary/80 font-bold print:text-gray-700 print:text-xs">
                  GSTIN: 29AAFCE8436B1Z3
                </p>
              </div>
            </div>

            {/* Invoice Meta */}
            <div className="text-left sm:text-right space-y-1.5 print:text-right">
              <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest print:text-gray-500 print:text-xs">
                Tax Invoice
              </p>
              <p className="text-lg font-black text-white font-mono print:text-black print:text-xl">
                {invoiceNumber}
              </p>
              <div className="mt-2 space-y-0.5">
                <p className="text-[10px] text-foreground/45 print:text-gray-600 print:text-xs">
                  <span className="font-bold text-foreground/60">Date:</span> {formatDate(booking.createdAt)}
                </p>
                <p className="text-[10px] text-foreground/45 print:text-gray-600 print:text-xs">
                  <span className="font-bold text-foreground/60">Time:</span> {formatTime(booking.createdAt)}
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

        {/* ── Billing Details Grid ─────────────────────────── */}
        <div className="px-8 py-6 grid grid-cols-1 sm:grid-cols-2 gap-6 border-b border-white/5 print:border-b print:border-gray-200">

          {/* Bill To */}
          <div className="space-y-3">
            <p className="text-[9px] text-foreground/35 font-black uppercase tracking-widest print:text-gray-500 print:text-[10px]">
              Bill To
            </p>
            <div className="space-y-1.5">
              <p className="text-sm font-black text-white uppercase tracking-wide print:text-black print:text-base">
                {booking.customerName}
              </p>
              <div className="flex items-center gap-2 text-foreground/50 text-xs print:text-gray-600">
                <Phone size={11} className="shrink-0" />
                <span className="font-semibold">{booking.phone || "—"}</span>
              </div>
              <div className="flex items-start gap-2 text-foreground/50 text-xs print:text-gray-600">
                <MapPin size={11} className="shrink-0 mt-0.5" />
                <span className="font-semibold">{booking.address || booking.location || "Bengaluru"}</span>
              </div>
            </div>
          </div>

          {/* Vehicle & Service Details */}
          <div className="space-y-3">
            <p className="text-[9px] text-foreground/35 font-black uppercase tracking-widest print:text-gray-500 print:text-[10px]">
              Vehicle & Service
            </p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-foreground/55 text-xs print:text-gray-600">
                <Car size={11} className="shrink-0" />
                <span className="font-semibold">{booking.vehicleName || booking.vehicleType || "Vehicle"}</span>
                {booking.vehiclePlate && (
                  <span className="px-1.5 py-0.5 bg-white/5 border border-white/8 rounded font-mono text-[9px] text-foreground/40 uppercase print:border print:border-gray-300 print:text-gray-500">
                    {booking.vehiclePlate}
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
                <span className="font-semibold">Dispatched: {formatDate(booking.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2 text-foreground/50 text-xs print:text-gray-600">
                <Hash size={11} className="shrink-0" />
                <span className="font-mono font-bold">{booking.id.slice(-8).toUpperCase()}</span>
                <span className="text-foreground/30 text-[9px]">Ref ID</span>
              </div>
            </div>
          </div>

        </div>

        {/* ── Service Line Item Table ────────────────────────── */}
        <div className="px-8 py-6 print:py-4">

          <table className="w-full text-xs print:text-sm">
            <thead>
              <tr className="border-b border-white/8 print:border-b print:border-gray-300">
                <th className="py-3 text-left text-[9px] font-black text-foreground/35 uppercase tracking-widest print:text-gray-500 print:text-[11px]">
                  # Description
                </th>
                <th className="py-3 text-center text-[9px] font-black text-foreground/35 uppercase tracking-widest print:text-gray-500 print:text-[11px]">
                  HSN/SAC
                </th>
                <th className="py-3 text-center text-[9px] font-black text-foreground/35 uppercase tracking-widest print:text-gray-500 print:text-[11px]">
                  Qty
                </th>
                <th className="py-3 text-right text-[9px] font-black text-foreground/35 uppercase tracking-widest print:text-gray-500 print:text-[11px]">
                  Rate (₹)
                </th>
                <th className="py-3 text-right text-[9px] font-black text-foreground/35 uppercase tracking-widest print:text-gray-500 print:text-[11px]">
                  Amount (₹)
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-white/5 print:border-b print:border-gray-100">
                <td className="py-5 pr-4">
                  <p className="font-bold text-white text-xs print:text-black print:text-sm">{booking.serviceLabel}</p>
                  <p className="text-foreground/40 text-[10px] mt-1 leading-relaxed print:text-gray-500 print:text-xs">
                    {serviceDescription}
                  </p>
                  {booking.isPriority && (
                    <span className="inline-flex mt-1.5 items-center gap-1 px-2 py-0.5 bg-emergency/10 text-emergency border border-emergency/20 rounded-full text-[9px] font-black uppercase tracking-wider print:border print:border-red-300 print:text-red-600">
                      🚨 Priority / Emergency Call
                    </span>
                  )}
                </td>
                <td className="py-5 text-center text-foreground/40 font-mono text-[10px] print:text-gray-500">
                  9987
                </td>
                <td className="py-5 text-center text-foreground/50 font-bold print:text-gray-600">
                  1
                </td>
                <td className="py-5 text-right text-foreground/60 font-semibold print:text-gray-600">
                  ₹{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="py-5 text-right text-white font-black print:text-black">
                  ₹{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
            </tbody>
          </table>

        </div>

        {/* ── Tax & Total Summary ───────────────────────────── */}
        <div className="px-8 pb-6 print:pb-4">
          <div className="flex justify-end">
            <div className="w-full max-w-xs space-y-0">

              <div className="flex justify-between items-center py-2 border-b border-white/5 print:border-b print:border-gray-100">
                <span className="text-[10px] text-foreground/45 font-bold uppercase tracking-wider print:text-gray-500 print:text-xs">
                  Subtotal (excl. GST)
                </span>
                <span className="text-xs text-foreground/60 font-bold print:text-gray-600">
                  ₹{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-white/5 print:border-b print:border-gray-100">
                <span className="text-[10px] text-foreground/45 font-bold uppercase tracking-wider print:text-gray-500 print:text-xs">
                  CGST @ 9%
                </span>
                <span className="text-xs text-foreground/60 font-bold print:text-gray-600">
                  ₹{cgst.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-white/8 print:border-b print:border-gray-200">
                <span className="text-[10px] text-foreground/45 font-bold uppercase tracking-wider print:text-gray-500 print:text-xs">
                  SGST @ 9%
                </span>
                <span className="text-xs text-foreground/60 font-bold print:text-gray-600">
                  ₹{sgst.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex justify-between items-center py-4 mt-1">
                <span className="text-sm font-black text-white uppercase tracking-wider print:text-black print:text-base">
                  Grand Total
                </span>
                <span className="text-xl font-black text-primary print:text-black print:text-2xl">
                  ₹{grandTotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Payment Status Badge */}
              <div className={`flex items-center justify-between p-3 rounded-xl border print:border print:rounded-none ${
                booking.paymentStatus === "completed"
                  ? "bg-success/8 border-success/20 print:border-green-300"
                  : "bg-warning/8 border-warning/20 print:border-yellow-300"
              }`}>
                <span className="text-[9px] font-black uppercase tracking-widest text-foreground/45 print:text-gray-500">
                  Payment Status
                </span>
                <span className={`text-[10px] font-black uppercase tracking-wider ${
                  booking.paymentStatus === "completed" ? "text-success print:text-green-600" : "text-warning print:text-yellow-600"
                }`}>
                  {booking.paymentStatus === "completed" ? "✓ Paid" : "⏳ Pending"}
                </span>
              </div>

            </div>
          </div>
        </div>

        {/* ── Notes & Terms ─────────────────────────────────── */}
        <div className="mx-8 mb-6 p-5 bg-white/2 border border-white/5 rounded-xl print:border print:border-gray-200 print:bg-gray-50 print:rounded-none">
          <p className="text-[9px] text-foreground/35 font-black uppercase tracking-widest mb-2 print:text-gray-500">
            Notes & Terms
          </p>
          <ul className="space-y-1">
            {[
              "All prices are inclusive of 18% GST (CGST 9% + SGST 9%) as applicable under the Goods & Services Tax Act, 2017.",
              "This is a computer-generated invoice and is legally valid without a physical signature.",
              "For disputes or support, contact: support@erinaassistance.in or call +91-90358 18604.",
              "Payment is due within 7 days of invoice date. Late payments may incur a 2% monthly surcharge.",
              "Erina Assistance is not liable for pre-existing vehicle damage not caused during service delivery.",
            ].map((note, i) => (
              <li key={i} className="text-[9px] text-foreground/40 print:text-gray-500 print:text-[10px] leading-relaxed">
                {i + 1}. {note}
              </li>
            ))}
          </ul>
        </div>

        {/* ── Footer ───────────────────────────────────────── */}
        <div className="
          px-8 py-5 border-t border-white/5
          bg-gradient-to-r from-white/2 to-transparent
          flex flex-col sm:flex-row items-center justify-between gap-3
          print:border-t print:border-gray-300 print:bg-gray-50
        ">
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-primary/50 print:hidden" />
            <p className="text-[9px] text-foreground/30 font-bold uppercase tracking-wider print:text-gray-400 print:text-[10px]">
              Erina Roadside Assistance Services Pvt. Ltd. — Bengaluru
            </p>
          </div>
          <p className="text-[9px] text-foreground/25 font-mono print:text-gray-400 print:text-[10px]">
            {invoiceNumber} • {formatDate(booking.createdAt)}
          </p>
        </div>

      </div>

      {/* ── Print-only global styles ───────────────────────── */}
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
