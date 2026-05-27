"use client";

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Printer, Download, CheckCircle2, Package, Wrench, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface SoldProduct {
  productId: string;
  name: string;
  sku: string | null;
  qty: number;
  unitPrice: number;
  totalPrice: number;
}

interface BookingInvoice {
  id: string;
  invoiceNumber: string | null;
  invoiceGeneratedAt: string | null;
  customerName: string;
  phone: string;
  vehicleType: string;
  vehiclePlate: string;
  serviceLabel: string;
  paymentAmount: number;
  paymentStatus: string;
  technicianName: string | null;
  address: string;
  status: string;
  soldProducts: SoldProduct[];
  createdAt: string;
}

const GST_RATE = 0.18;

export default function InvoicePage() {
  const params = useParams();
  const bookingId = params?.bookingId as string;
  const [booking, setBooking] = useState<BookingInvoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!bookingId) return;
    const fetchBooking = async () => {
      try {
        const res = await fetch(`/api/bookings/${bookingId}`);
        const data = await res.json();
        if (data.success || data.id) {
          setBooking(data.booking || data);
        } else {
          setError(data.error || 'Booking not found');
        }
      } catch {
        setError('Failed to load invoice data.');
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [bookingId]);

  const handlePrint = () => window.print();

  if (loading) return (
    <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-foreground/50 text-sm">Loading invoice...</p>
      </div>
    </div>
  );

  if (error || !booking) return (
    <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center">
      <div className="text-center space-y-4">
        <p className="text-red-400 font-semibold">{error || 'Invoice not found'}</p>
        <Link href="/admin/bookings" className="text-primary text-sm hover:underline flex items-center gap-1 justify-center">
          <ArrowLeft size={14} /> Back to Bookings
        </Link>
      </div>
    </div>
  );

  // Calculate totals
  const serviceTotal = booking.paymentAmount || 0;
  const productsSubtotal = (booking.soldProducts || []).reduce((s, p) => s + p.totalPrice, 0);
  const subtotal = serviceTotal + productsSubtotal;
  const gstAmount = Math.round(subtotal * GST_RATE);
  const grandTotal = subtotal + gstAmount;
  const invoiceDate = booking.invoiceGeneratedAt
    ? new Date(booking.invoiceGeneratedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
    : new Date(booking.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
  const invoiceNo = booking.invoiceNumber || `INV-DRAFT-${booking.id.slice(-6).toUpperCase()}`;

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #invoice-print, #invoice-print * { visibility: visible; }
          #invoice-print { position: fixed; inset: 0; background: white !important; }
          .no-print { display: none !important; }
          @page { margin: 15mm; size: A4; }
        }
      `}</style>

      <div className="min-h-screen bg-[#0B0F19] p-6">
        {/* Top Action Bar */}
        <div className="no-print max-w-3xl mx-auto mb-6 flex items-center justify-between">
          <Link
            href="/admin/bookings"
            className="flex items-center gap-2 text-foreground/50 hover:text-white text-sm font-medium transition-colors"
          >
            <ArrowLeft size={16} /> Back to Bookings
          </Link>
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/8 hover:bg-white/15 text-white text-sm font-semibold border border-white/10 transition-all"
            >
              <Printer size={16} /> Print / Save PDF
            </button>
          </div>
        </div>

        {/* Invoice Card */}
        <div id="invoice-print" ref={printRef} className="max-w-3xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden text-gray-900">

          {/* Header */}
          <div className="bg-gradient-to-r from-[#FF3366] to-[#FF6B35] p-8 text-white">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-black tracking-tight">ERINA</h1>
                <p className="text-white/80 text-sm font-semibold tracking-widest uppercase">Roadside Assistance</p>
                <p className="text-white/60 text-xs mt-2">Bengaluru, Karnataka — 24/7 Emergency Services</p>
                <p className="text-white/60 text-xs">📞 +91 73400 66655</p>
              </div>
              <div className="text-right">
                <p className="text-white/60 text-xs uppercase tracking-wider font-semibold">Invoice</p>
                <p className="text-2xl font-black mt-1">{invoiceNo}</p>
                <p className="text-white/70 text-sm mt-1">{invoiceDate}</p>
                <div className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  booking.paymentStatus === 'completed' ? 'bg-white/20 text-white' : 'bg-yellow-300/30 text-yellow-100'
                }`}>
                  {booking.paymentStatus === 'completed' ? '✓ PAID' : 'PAYMENT PENDING'}
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {/* Bill To + Booking Info */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Bill To</p>
                <p className="font-black text-lg text-gray-900">{booking.customerName}</p>
                <p className="text-gray-600 text-sm">📞 {booking.phone}</p>
                <p className="text-gray-500 text-sm mt-1 leading-relaxed">{booking.address}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Booking Details</p>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Booking ID</span>
                    <span className="font-mono font-semibold text-gray-700 text-xs">{booking.id.slice(-10).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Vehicle</span>
                    <span className="font-semibold text-gray-700">{booking.vehicleType}</span>
                  </div>
                  {booking.vehiclePlate && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Plate No.</span>
                      <span className="font-mono font-bold text-gray-800">{booking.vehiclePlate}</span>
                    </div>
                  )}
                  {booking.technicianName && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Technician</span>
                      <span className="font-semibold text-gray-700">{booking.technicianName}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Services */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Wrench size={16} className="text-[#FF3366]" />
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Services Rendered</p>
              </div>
              <div className="border border-gray-100 rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">Description</th>
                      <th className="text-right px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-gray-50">
                      <td className="px-4 py-3 font-semibold text-gray-800">{booking.serviceLabel}</td>
                      <td className="px-4 py-3 text-right font-bold text-gray-800">
                        ₹{serviceTotal.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Products Sold */}
            {booking.soldProducts && booking.soldProducts.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Package size={16} className="text-[#FF3366]" />
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Products Supplied</p>
                </div>
                <div className="border border-gray-100 rounded-2xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">Product</th>
                        <th className="text-center px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">Qty</th>
                        <th className="text-right px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">Unit Price</th>
                        <th className="text-right px-4 py-3 text-xs font-bold uppercase tracking-wider text-gray-400">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {booking.soldProducts.map((item, i) => (
                        <tr key={i} className="border-t border-gray-50">
                          <td className="px-4 py-3">
                            <p className="font-semibold text-gray-800">{item.name}</p>
                            {item.sku && <p className="text-xs text-gray-400 font-mono">{item.sku}</p>}
                          </td>
                          <td className="px-4 py-3 text-center text-gray-600">{item.qty}</td>
                          <td className="px-4 py-3 text-right text-gray-600">₹{item.unitPrice.toLocaleString('en-IN')}</td>
                          <td className="px-4 py-3 text-right font-bold text-gray-800">₹{item.totalPrice.toLocaleString('en-IN')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-72 space-y-2">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Services Subtotal</span>
                  <span className="font-semibold text-gray-700">₹{serviceTotal.toLocaleString('en-IN')}</span>
                </div>
                {productsSubtotal > 0 && (
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Products Subtotal</span>
                    <span className="font-semibold text-gray-700">₹{productsSubtotal.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-gray-500">
                  <span>GST (18%)</span>
                  <span className="font-semibold text-gray-700">₹{gstAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between">
                  <span className="font-black text-lg text-gray-900">Total Amount</span>
                  <span className="font-black text-xl text-[#FF3366]">₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
                {booking.paymentStatus === 'completed' && (
                  <div className="flex items-center gap-2 text-emerald-600 text-sm font-bold">
                    <CheckCircle2 size={16} />
                    Payment Received
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 pt-6 text-center space-y-1">
              <p className="text-gray-400 text-xs">Thank you for choosing Erina Assistance — India's trusted 24/7 roadside rescue service.</p>
              <p className="text-gray-300 text-xs">www.erinaassistance.in | +91 73400 66655 | Bengaluru, Karnataka</p>
              <p className="text-gray-200 text-xs italic">This is a computer-generated invoice. No signature required.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
