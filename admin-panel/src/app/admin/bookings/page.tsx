"use client";

import { useState, useEffect, Fragment } from 'react';
import { useAdminStore, Booking, Technician, Product } from '@/frontend/store/adminStore';
import { useSettingsStore } from '@/frontend/store/settingsStore';
import { calculatePrice } from '@/frontend/lib/pricingEngine';
import { 
  Search, 
  Filter, 
  UserCheck, 
  Flame, 
  MapPin, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  DollarSign, 
  CreditCard,
  User,
  ShieldAlert,
  ChevronRight,
  Truck,
  Wrench,
  Activity,
  Package,
  FileText,
  Plus,
  Minus,
  Trash2,
  XCircle,
  AlertOctagon,
  Share2,
  MessageSquare,
  Phone
} from 'lucide-react';
import { motion } from 'framer-motion';
import LiveTrackingMap from './LiveTrackingMap';

export default function BookingsManagement() {
  const {
  bookings,
  technicians,
  assignTechnician,
  updateBookingStatus,
  addBooking,
  fetchTechnicians,
  fetchBookings,
  updateBookingService,
} = useAdminStore();

  const { pricing } = useSettingsStore();
  

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [currentPage,setCurrentPage] =useState(1);

  const itemsPerPage = 20;

  // Assign Tech Modal State
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isEditingService, setIsEditingService] = useState(false);
  const [editingServiceType, setEditingServiceType] = useState<Booking['serviceType']>('other');

  useEffect(() => {
    if (selectedBooking) {
      setEditingServiceType(selectedBooking.serviceType);
    } else {
      setIsEditingService(false);
    }
  }, [selectedBooking]);

  // Incident Image Preview State
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Expanded visual dispatch progress row
  const [expandedBookingId, setExpandedBookingId] = useState<string | null>(null);
  const [copiedBookingId, setCopiedBookingId] = useState<string | null>(null);
  const [customServicePrice, setCustomServicePrice] = useState<number>(0);

  // Razorpay payment link state
  const [generatingLinkId, setGeneratingLinkId] = useState<string | null>(null);
  const [copiedPaymentLinkId, setCopiedPaymentLinkId] = useState<string | null>(null);

  const handleGeneratePaymentLink = async (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    const targetId = booking?.mongoId || bookingId;

    setGeneratingLinkId(bookingId);
    try {
      const response = await fetch('/api/payments/create-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookingId: targetId }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to generate payment link.");
      }
      alert("Razorpay payment link generated successfully!");
      await fetchBookings();
    } catch (err: any) {
      console.error(err);
      alert(`Error: ${err.message || "Failed to generate payment link."}`);
    } finally {
      setGeneratingLinkId(null);
    }
  };

  const handleMarkPaidCash = async (bookingId: string) => {
    if (!confirm("Are you sure you want to mark this invoice as paid via Cash?")) return;
    
    const booking = bookings.find(b => b.id === bookingId);
    const targetId = booking?.mongoId || bookingId;

    try {
      const response = await fetch(`/api/bookings/${targetId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentStatus: "completed",
          paymentMethod: "cash",
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to mark as paid");
      }
      alert("Invoice marked as Paid via Cash successfully!");
      await fetchBookings();
    } catch (error: any) {
      console.error(error);
      alert(`Error: ${error.message || "Failed to mark as paid"}`);
    }
  };
  // ── Add Products Sold ────────────────────────────────────────────────
  const [sellProductsBooking, setSellProductsBooking] = useState<Booking | null>(null);
  const [scrapBattery, setScrapBattery] = useState({ isExchanged: false, brand: '', condition: '', discountValue: 0 });
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);
  const [selectedItems, setSelectedItems] = useState<{ product: Product; qty: number }[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [sellSaving, setSellSaving] = useState(false);
  const [sellError, setSellError] = useState<string | null>(null);
  const [sellSuccess, setSellSuccess] = useState(false);
  const [waiveServiceFee, setWaiveServiceFee] = useState(false);

  const getProductsTotal = (booking: Booking) => {
    return (booking.soldProducts || []).reduce(
      (sum: number, p: any) => sum + p.unitPrice * p.quantity,
      0
    );
  };

  const getServicePrice = (booking: Booking) => {
    return Math.max(0, booking.paymentAmount - getProductsTotal(booking));
  };

  const openSellModal = async (booking: Booking) => {
    setSellProductsBooking(booking);
    setSelectedItems([]);
    setSellError(null);
    setSellSuccess(false);
    setWaiveServiceFee(false);
    setScrapBattery({
      isExchanged: booking.scrapBatteryExchange?.isExchanged || false,
      brand: booking.scrapBatteryExchange?.brand || '',
      condition: booking.scrapBatteryExchange?.condition || '',
      discountValue: booking.scrapBatteryExchange?.discountValue || 0,
    });
    setCatalogLoading(true);
    try {
      const res = await fetch('/api/products?includeInactive=false');
      const data = await res.json();
      if (data.success) setCatalogProducts(data.products);
    } catch { /* noop */ }
    finally { setCatalogLoading(false); }
  };

  const adjustQty = (product: Product, delta: number) => {
    setSelectedItems(prev => {
      const existing = prev.find(i => i.product._id === product._id);
      if (!existing) {
        if (delta <= 0) return prev;
        return [...prev, { product, qty: 1 }];
      }
      const newQty = existing.qty + delta;
      if (newQty <= 0) return prev.filter(i => i.product._id !== product._id);
      if (newQty > product.stockQty) return prev;
      return prev.map(i => i.product._id === product._id ? { ...i, qty: newQty } : i);
    });
  };

  const handleSellProducts = async () => {
    if (!sellProductsBooking || selectedItems.length === 0) return;
    setSellSaving(true);
    setSellError(null);
    try {
      // Always prefer mongoId (real MongoDB _id) — booking.id may be a ticketId like RSA-4851
      const apiId = sellProductsBooking.mongoId || sellProductsBooking.id;
      const res = await fetch(`/api/bookings/${apiId}/add-products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: selectedItems.map(i => ({ productId: i.product._id, quantity: i.qty })),
          waiveServiceFee,
          scrapBattery
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      await fetchBookings();
      setSellSuccess(true);
      setTimeout(() => setSellProductsBooking(null), 2000);
    } catch (err) {
      setSellError(err instanceof Error ? err.message : 'Failed to save sold products.');
    } finally {
      setSellSaving(false);
    }
  };

  const sellTotal = selectedItems.reduce((s, i) => s + i.product.sellingPrice * i.qty, 0);

  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [ticketForm, setTicketForm] = useState({
  customerName: "",
  phone: "",

  vehicleType:
    "Car (Hatchback/Sedan)",

  vehicleNumber: "",

  serviceType:
    "towing",
  serviceTypes: [] as string[],
  address: "",
  landmark: "",

  latitude: "",
  longitude: "",

  paymentMethod:
    "cash",

  paymentAmount: "",

  description: "",

  isPriority: false,
});

const toggleService = (
  service: string
) => {
  setTicketForm((prev) => {
    const alreadySelected =
      prev.serviceTypes.includes(service);

    const updatedServices =
      alreadySelected
        ? prev.serviceTypes.filter(
            (s) => s !== service
          )
        : [...prev.serviceTypes, service];

    return {
      ...prev,
      serviceTypes: updatedServices,
      serviceType:
        updatedServices[0] || "other",
    };
  });
};
useEffect(() => {
  fetchBookings();
  fetchTechnicians();

  const interval = setInterval(() => {
    fetchBookings();
  }, 10000); // every 10 sec

  return () => clearInterval(interval);
}, []);
useEffect(() => {
  setCurrentPage(1);
}, [
  searchTerm,
  statusFilter,
  serviceFilter
]);
  // Filter Bookings
  
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' ? true : booking.status === statusFilter;
    const matchesService = serviceFilter === 'all' ? true : booking.serviceType === serviceFilter;

    return matchesSearch && matchesStatus && matchesService;
  });
  const totalPages =
Math.ceil(
  filteredBookings.length /
  itemsPerPage
);

const startIndex =
(currentPage - 1)
*
itemsPerPage;

const paginatedBookings =
filteredBookings.slice(
  startIndex,
  startIndex + itemsPerPage
);

  const getAvailableTechsForService = (serviceType: Booking['serviceType']) => {
    // Return technicians that are available (or evenbusy if we want to show busy ones, but let's prioritize available)
    return technicians.filter(t => t.availability === 'available');
  };

  const handleAssignTech = (technicianId: string) => {
    if (!selectedBooking) return;
    assignTechnician(selectedBooking.id, technicianId);
    
    // Automatically progress from 'emergency' or 'pending' to 'assigned'
    if (selectedBooking.status === 'pending' || selectedBooking.status === 'emergency') {
      updateBookingStatus(selectedBooking.id, 'assigned');
    }
    
    setSelectedBooking(null);
  };

const handleCreateTicket =
  async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    // Required fields validation
   if (
  !ticketForm.customerName ||
  !ticketForm.phone ||
  !ticketForm.address ||
  (
    (
  ticketForm.vehicleType !== "Other" &&
  !ticketForm.vehicleNumber
)
  )
) {
      alert(
        "Please fill all required fields"
      );
      return;
    }

    // Phone validation
    const phone =
      ticketForm.phone.replace(
        /\D/g,
        ""
      );

    if (
      phone.length !== 10
    ) {
      alert(
        "Enter valid 10 digit number"
      );
      return;
    }
    // Vehicle Number Validation
if (
   ticketForm.vehicleType !== "Other"
) {
  const cleanedPlate =
    ticketForm.vehicleNumber
      .replace(
        /[^a-zA-Z0-9]/g,
        ""
      )
      .toUpperCase();

  // Must be exactly 10 characters
  if (
  cleanedPlate.length < 8 ||
  cleanedPlate.length > 11
) {
  alert(
    "Please enter a valid Indian vehicle number."
  );
  return;
}

  const standardRegex =
    /^[A-Z]{2}[0-9]{1,2}[A-Z]{0,3}[0-9]{1,4}$/;

  const bhRegex =
    /^[0-9]{2}BH[0-9]{4}[A-Z]{2}$/;

  if (
    !standardRegex.test(
      cleanedPlate
    ) &&
    !bhRegex.test(
      cleanedPlate
    )
  ) {
    alert(
      "Please enter a valid Indian vehicle number (e.g. KA03MY1234 or 22BH1234AA)"
    );
    return;
  }
}

    try {

  const response =
    await fetch(
      "/api/bookings/create",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          customer: {
            name:
              ticketForm.customerName,
            phone,
          },

          vehicle: {
            type:
              ticketForm.vehicleType,
            plateNumber:
              ticketForm.vehicleNumber,
          },

         serviceType:
  (
    ticketForm.serviceTypes[0] ||
    ticketForm.serviceType
  ).toUpperCase(),

serviceTypes:
  ticketForm.serviceTypes.map(
    (service) =>
      service.toUpperCase()
  ),
          description:
            ticketForm.description,

          isPriority:
            ticketForm.isPriority,

          location: {
            lat:
              Number(
                ticketForm.latitude
              ) || 12.9928671,

            lng:
              Number(
                ticketForm.longitude
              ) || 77.7529829,

            address:
              ticketForm.address,
          },

          paymentMethod:
            ticketForm.paymentMethod
              .toUpperCase(),

          paymentStatus:
            "PENDING",

          paymentAmount:
            Number(
              ticketForm.paymentAmount
            ) || 0,
        }),
      }
    );

  const data =
    await response.json();

  if (!response.ok) {
  throw new Error(
    data.error ||
    "Booking creation failed"
  );
}

await fetchBookings();

setShowNewTicketModal(false);

alert("Ticket Created Successfully");

} catch (error: any) {

  console.error(error);

  alert(
    error.message ||
    "Failed to create booking"
  );
}
};
  const getStatusBadgeStyles = (status: Booking['status']) => {
    const s = status ? status.toLowerCase() : '';
    switch (s) {
      case 'emergency': return 'bg-emergency/15 text-emergency border-emergency/35 animate-pulse';
      case 'pending': return 'bg-warning/15 text-warning border-warning/35';
      case 'assigned': return 'bg-blue-500/15 text-blue-400 border-blue-500/35';
      case 'in-progress': return 'bg-orange-500/15 text-orange-400 border-orange-500/35';
      case 'completed': return 'bg-success/15 text-success border-success/35';
      case 'cancelled': return 'bg-emergency/15 text-emergency border-emergency/35';
      default: return 'bg-muted/15 text-muted border-muted/35';
    }
  };

  const getServiceBadgeStyles = (type: Booking['serviceType']) => {
    switch (type) {
      case 'towing': return 'bg-[#3B82F6]/15 text-[#60A5FA] border-[#3B82F6]/30';
      case 'battery': return 'bg-[#F59E0B]/15 text-[#FBBF24] border-[#F59E0B]/30';
      case 'ev': return 'bg-[#10B981]/15 text-[#34D399] border-[#10B981]/30';
      case 'lockout': return 'bg-[#8B5CF6]/15 text-[#A78BFA] border-[#8B5CF6]/30';
      case 'fuel': return 'bg-[#F97316]/15 text-[#FDBA74] border-[#F97316]/30';
      case 'flat_tyre': return 'bg-[#EF4444]/15 text-[#F87171] border-[#EF4444]/30';
      case 'engine': return 'bg-[#6B7280]/15 text-[#9CA3AF] border-[#6B7280]/30';
      case 'accident': return 'bg-[#DC2626]/15 text-[#F87171] border-[#DC2626]/30';
      case 'urgent_battery': return 'bg-orange-500/15 text-orange-400 border-orange-500/30';
      case 'other': return 'bg-[#6B7280]/15 text-[#9CA3AF] border-[#6B7280]/30';
      default:
 return
 'bg-white/10 text-white border-white/20';
    }
    
  };

  return (
    <div className="space-y-6">
      
      {/* Header section */}
      <div className="flex items-center justify-between">
  <div>
    <h1 className="text-2xl font-black text-white uppercase tracking-wider">
      Bookings Queue
    </h1>

    <p className="text-xs text-foreground/45 uppercase tracking-wider font-semibold mt-1">
      Monitor dispatch metrics,
      track rescue cycles,
      and manage live
      technician deployments
    </p>
  </div>

  <button
    onClick={() =>
      setShowNewTicketModal(
        true
      )
    }
    className="
      bg-cyan-400
      hover:bg-cyan-300
      text-black
      font-black
      px-5
      py-3
      rounded-2xl
      uppercase
      tracking-wider
      shadow-lg
      transition
      hover:scale-105
    "
  >
    + New Ticket
  </button>
</div>

      {/* Control Filters Area */}
      <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/35" size={16} />
            <input
              type="text"
              placeholder="Search by ID, name, location, license plate..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-background border border-white/5 focus:border-primary/50 text-xs px-11 py-3 rounded-xl outline-none text-white font-semibold transition-all"
            />
          </div>

          {/* Quick Filter Selection */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Status Select */}
            <div className="flex items-center gap-1.5 bg-background border border-white/5 px-3 py-1.5 rounded-xl">
              <Filter size={12} className="text-foreground/40" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-transparent border-none text-[10px] font-black uppercase tracking-wider text-foreground/80 outline-none cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="emergency">🚨 Emergency</option>
                <option value="pending">⏳ Pending</option>
                <option value="assigned">👤 Assigned</option>
                <option value="in-progress">⚙️ In Progress</option>
                <option value="completed">✅ Completed</option>
                
              </select>
            </div>

            {/* Service Select */}
            <div className="flex items-center gap-1.5 bg-background border border-white/5 px-3 py-1.5 rounded-xl">
              <Filter size={12} className="text-foreground/40" />
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="bg-transparent border-none text-[10px] font-black uppercase tracking-wider text-foreground/80 outline-none cursor-pointer"
              >
                <option value="all">
  All Services
</option>

<option value="towing">
  Flatbed Towing
</option>

<option value="battery">
  Battery Jumpstart
</option>

<option value="urgent_battery">
  Buy Battery
</option>

<option value="ev">
  Mobile EV Charging
</option>

<option value="lockout">
  Lockout Assistance
</option>

<option value="fuel">
  Emergency Fuel Delivery
</option>

<option value="flat_tyre">
  Flat Tyre Replacement
</option>

<option value="engine">
  Engine Diagnostics
</option>

<option value="accident">
  Accident Recovery
</option>

<option value="other">
  Other Assistance
</option>
              </select>
            </div>

          </div>
        </div>
      </div>

      {/* Bookings Queue Grid */}
      <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-black/20 text-foreground/45 font-black uppercase tracking-widest">
                <th className="py-4 px-5">Case ID</th>
                <th className="py-4 px-5">Customer Profile</th>
                <th className="py-4 px-5">Service Category</th>
                <th className="py-4 px-5">Vehicle & Plates</th>
                <th className="py-4 px-5">Dispatched Tech</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5">Fare</th>
                <th className="py-4 px-5 text-right">Dispatch Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-semibold">
              {filteredBookings.length > 0 ? (
                paginatedBookings.map((booking) => {
                  const techInfo = technicians.find(t => t.id === booking.technicianId);
                  
                  return (
                    <Fragment key={booking.id}>
                      {/* Interactive Case Row */}
                      <tr 
                        key={booking.id}
                        onClick={() => setExpandedBookingId(expandedBookingId === booking.id ? null : booking.id)}
                        className={`hover:bg-white/3 transition-all cursor-pointer ${booking.status === 'emergency' ? 'bg-emergency/5' : ''} ${
                          expandedBookingId === booking.id ? 'bg-white/5 border-l-2 border-primary' : ''
                        }`}
                      >
                        {/* Booking ID */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-white text-xs">{booking.id}</span>
                            {booking.status === 'emergency' && (
                              <span className="w-2 h-2 rounded-full bg-emergency animate-ping" />
                            )}
                          </div>
                          <span className="text-[9px] text-foreground/30 font-bold block mt-1 tracking-wider uppercase">
                            {booking.createdTime}
                          </span>
                        </td>

                        {/* Customer */}
                        <td className="py-4 px-5">
                          <div className="font-black text-white">{booking.customerName}</div>
                          <div className="text-[10px] text-foreground/40 mt-0.5">{booking.customerPhone}</div>
                        </td>

                        {/* Service */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-2">
                            <div className="flex flex-wrap gap-1.5">
                              {booking.serviceTypes?.length ? (
                                booking.serviceTypes.map((service: string) => (
                                  <span
                                    key={service}
                                    className="px-2.5 py-1 rounded-md border text-[9px] font-black uppercase tracking-wider bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                                  >
                                    {service.replaceAll("_", " ")}
                                  </span>
                                ))
                              ) : (
                                <span
                                  className={`px-2.5 py-1 rounded-md border text-[9px] font-black uppercase tracking-wider ${getServiceBadgeStyles(booking.serviceType)}`}
                                >
                                  {booking.serviceLabel}
                                </span>
                              )}
                            </div>
                            {booking.scrapBatteryExchange?.isExchanged && (
                              <div className="mt-1">
                                <span className="px-2 py-0.5 rounded-sm bg-yellow-500/10 border border-yellow-500/30 text-[9px] text-yellow-500 uppercase font-bold tracking-wider whitespace-nowrap">
                                  ♻️ Scrap Exchange Requested
                                </span>
                              </div>
                            )}
                            {booking.status?.toLowerCase() !== 'cancelled' &&
                                booking.invoiceStatus !== 'FINAL' && (
                            <button
                                type="button"
                                onClick={(e) => {
                                e.stopPropagation();
                                setSelectedBooking(booking);
                                setCustomServicePrice(getServicePrice(booking));
                                setIsEditingService(true);
                                  }}
                          className="p-1.5 bg-white/5 hover:bg-white/10 text-foreground/45 hover:text-white rounded-lg transition-all border border-white/5 cursor-pointer flex items-center justify-center flex-shrink-0"
                           title="Modify Booking Service"
                            >
                            <Wrench size={10} />
                            </button>
              )}
                          </div>
                        </td>

                        {/* Vehicle */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-2">
                            {booking.imageUrl && (
                              <div 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPreviewImage(booking.imageUrl || null);
                                }}
                                className="relative w-8 h-8 rounded-lg overflow-hidden border border-white/10 hover:border-primary/50 cursor-pointer flex-shrink-0 group/thumb"
                                title="Click to view incident photo"
                              >
                                <img src={booking.imageUrl} alt="Incident" className="object-cover w-full h-full group-hover/thumb:scale-110 transition-all" />
                              </div>
                            )}
                            <div>
                              <div className="text-foreground/80">{booking.vehicleName}</div>
                              <div className="font-mono text-[9px] text-foreground/40 mt-1 uppercase tracking-wider">{booking.vehiclePlate}</div>
                            </div>
                          </div>
                        </td>

                        {/* Technician */}
                        <td className="py-4 px-5">
                          {booking.technicianName ? (
                            <div>
                              <div className="flex items-center gap-1 text-white font-bold">
                                <UserCheck size={12} className="text-primary" />
                                <span>{booking.technicianName}</span>
                              </div>
                              <span className="text-[9px] text-foreground/35 block mt-0.5 max-w-[140px] truncate">{booking.location}</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-foreground/30 italic">
                              <AlertCircle size={12} className="text-foreground/20" />
                              <span>No Tech Dispatched</span>
                            </div>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-4 px-5">
                          <span className={`px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${
                            booking.status?.toLowerCase() === 'assigned'
                              ? 'bg-blue-500/15 text-blue-400 border-blue-500/35'
                              : booking.status?.toLowerCase() === 'in-progress' && booking.subStatus === 'leaving_hub'
                                ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/35 animate-pulse'
                                : booking.status?.toLowerCase() === 'in-progress' && booking.subStatus === 'arrived'
                                  ? 'bg-orange-500/15 text-orange-400 border-orange-500/35'
                                  : getStatusBadgeStyles(booking.status)
                          }`}>
                            {booking.status?.toLowerCase() === 'assigned'
                              ? 'Assigned (Preparing)'
                              : booking.status?.toLowerCase() === 'in-progress' && booking.subStatus === 'leaving_hub'
                                ? 'En Route (Left Hub)'
                                : booking.status?.toLowerCase() === 'in-progress' && booking.subStatus === 'arrived'
                                  ? 'Unit On-Scene'
                                  : booking.status?.toLowerCase() === 'cancelled'
                                    ? 'Booking Cancelled'
                                    : booking.status}
                          </span>
                        </td>

                        {/* Payment */}
                        <td className="py-4 px-5" onClick={(e) => e.stopPropagation()}>
                          <div className="text-white font-bold">₹{booking.paymentAmount.toLocaleString('en-IN')}</div>
                          <span className={`text-[9px] font-black uppercase tracking-wider mt-0.5 block ${
                            booking.paymentStatus?.toLowerCase() === 'completed'
                              ? 'text-success'
                              : booking.paymentStatus?.toLowerCase() === 'cancelled'
                                ? 'text-emergency font-bold'
                                : 'text-warning'
                          }`}>
                            {booking.paymentStatus}
                          </span>

                          {/* Payment Link Generation & Sharing */}
                          {booking.status?.toLowerCase() !== 'cancelled' &&
                           (booking.paymentStatus?.toLowerCase() !== 'completed' || !booking.paymentLink) && (
                            <div className="mt-2 flex flex-col gap-1.5 max-w-[130px]">
                              {!booking.paymentLink ? (() => {
                                const isInvoiceFinalized = booking.invoiceStatus === 'FINAL';
                                return (
                                  <div className="flex flex-col gap-1.5 w-full">
                                    <button
                                      onClick={() => isInvoiceFinalized && handleGeneratePaymentLink(booking.id)}
                                      disabled={generatingLinkId === booking.id || !isInvoiceFinalized}
                                      className={`w-full flex items-center justify-center gap-1 px-2.5 py-1 font-bold rounded-lg text-[9px] uppercase tracking-wider transition-all ${
                                        isInvoiceFinalized 
                                          ? "bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 border border-violet-500/30 cursor-pointer shadow-sm shadow-violet-500/5"
                                          : "bg-gray-500/10 text-gray-500 border border-gray-500/20 cursor-not-allowed opacity-60"
                                      }`}
                                      title={isInvoiceFinalized ? "Generate payment link" : "Please finalize the invoice first"}
                                    >
                                      {generatingLinkId === booking.id ? "Generating..." : isInvoiceFinalized ? "Generate Link" : "Need Final Bill"}
                                    </button>
                                    
                                    {isInvoiceFinalized && (
                                      <button
                                        onClick={() => handleMarkPaidCash(booking.id)}
                                        className="w-full flex items-center justify-center gap-1 px-2.5 py-1 font-bold rounded-lg text-[9px] uppercase tracking-wider transition-all bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-pointer shadow-sm"
                                        title="Mark as paid via Cash"
                                      >
                                        Mark Paid (Cash)
                                      </button>
                                    )}
                                  </div>
                                );
                              })() : (() => {
                                const cleanPhone = booking.customerPhone?.replace(/\D/g, '') || '';
                                const whatsappPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
                                const messageText = `Hello ${booking.customerName || 'Customer'}, here is the secure payment link for your Erina Roadside Assistance request: ${booking.paymentLink}. Thank you!`;
                                return (
                                    <div className="flex flex-col gap-1 w-full">
                                      <div className="flex gap-1 w-full">
                                        <button
                                          onClick={() => {
                                            navigator.clipboard.writeText(booking.paymentLink || '');
                                            setCopiedPaymentLinkId(booking.id);
                                            setTimeout(() => setCopiedPaymentLinkId(null), 2000);
                                          }}
                                          className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-400 border border-cyan-500/30 font-bold rounded-lg text-[9px] uppercase tracking-wider transition-all cursor-pointer"
                                          title="Copy payment link"
                                        >
                                          {copiedPaymentLinkId === booking.id ? "Copied!" : "Copy"}
                                        </button>
                                        <a
                                          href={`https://wa.me/${whatsappPhone}?text=${encodeURIComponent(messageText)}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 font-bold rounded-lg text-[9px] uppercase tracking-wider transition-all cursor-pointer text-center"
                                          title="Send payment link on WhatsApp"
                                        >
                                          WhatsApp
                                        </a>
                                      </div>
                                      <button
                                        onClick={() => handleMarkPaidCash(booking.id)}
                                        className="w-full flex items-center justify-center gap-1 px-2.5 py-1 font-bold rounded-lg text-[9px] uppercase tracking-wider transition-all bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-pointer shadow-sm"
                                        title="Mark as paid via Cash"
                                      >
                                        Mark Paid (Cash)
                                      </button>
                                    </div>
                                );
                              })()}
                            </div>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex flex-col items-end gap-2">
                            {/* Permanently visible Sell Products button (for all active/completed bookings, except cancelled ones) */}
                            <div className="flex gap-2 flex-wrap justify-end">
                              {booking.status?.toLowerCase() !== "cancelled" && (
    <button
      onClick={() => openSellModal(booking)}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/15 hover:bg-primary/25 text-primary border border-primary/30 font-bold rounded-lg text-[10px] uppercase tracking-wider transition-all cursor-pointer"
    >
      <Package size={11} /> + Sell Products
    </button>
  )}

                              {booking.status?.toLowerCase() !== 'cancelled' && (() => {
                                const cleanPhone = booking.customerPhone?.replace(/\D/g, '') || '';
                                const whatsappPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
                                const messageText = `Hello ${booking.customerName}, you can track your Erina Roadside Assistance technician in real-time here: https://erinaassistance.in/tracking?id=${booking.id}`;
                                return (
                                  <>
                                    <button
                                      onClick={() => {
                                        const url = `https://erinaassistance.in/tracking?id=${booking.id}`;
                                        navigator.clipboard.writeText(url);
                                        setCopiedBookingId(booking.id);
                                        setTimeout(() => setCopiedBookingId(null), 2000);
                                      }}
                                      className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-400 border border-cyan-500/30 font-bold rounded-lg text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                                      title="Copy customer tracking link to clipboard"
                                    >
                                      <Share2 size={11} /> {copiedBookingId === booking.id ? "Copied!" : "Copy Tracker Link"}
                                    </button>

                                    <a
                                      href={`https://wa.me/${whatsappPhone}?text=${encodeURIComponent(messageText)}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 font-bold rounded-lg text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                                      title="Share tracking link with customer on WhatsApp"
                                    >
                                      <MessageSquare size={11} /> WhatsApp Link
                                    </a>
                                  </>
                                );
                              })()}
                            </div>

                            <div className="flex justify-end items-center gap-2 flex-wrap">
                              {booking.status?.toLowerCase() === 'completed' ? (
                                <div className="flex items-center gap-2 justify-end flex-wrap">
                                  <a
                                    href={`/admin/invoice/${booking.id}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 font-bold rounded-lg text-[10px] uppercase tracking-wider transition-all"
                                  >
                                    <FileText size={11} /> Invoice
                                  </a>
                                  <span className="text-[10px] text-success flex items-center gap-1 font-bold uppercase tracking-wider">
                                    <CheckCircle2 size={12} />
                                    <span>Resolved</span>
                                  </span>
                                </div>
                              ) : booking.status?.toLowerCase() === 'cancelled' ? (
                                <span className="text-[10px] text-emergency flex items-center gap-1 font-bold uppercase tracking-wider">
                                  <XCircle size={12} />
                                  <span>Booking Cancelled</span>
                                </span>
                              ) : (
                                <>
                                  {/* If unassigned, show Assign Technician */}
                                  {!booking.technicianId ? (
                                    <>
                                      <button
                                        onClick={() => setSelectedBooking(booking)}
                                        className="px-3 py-1.5 bg-primary hover:bg-primary-hover text-background font-black rounded-lg text-[10px] uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-primary/20"
                                      >
                                        Dispatch Technician
                                      </button>
                                      <button
                                        onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                                        className="px-3 py-1.5 bg-emergency/15 hover:bg-emergency/25 text-emergency border border-emergency/30 font-bold rounded-lg text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                                        title="Cancel and abort this roadside request"
                                      >
                                        Cancel Booking
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      {/* Assigned (collecting_tools) -> En Route (leaving_hub) */}
                                      {booking.status === 'assigned' && (
                                        <button
                                          onClick={() => updateBookingStatus(booking.id, 'in-progress', 'leaving_hub')}
                                          className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white font-black rounded-lg text-[10px] uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-indigo-500/10"
                                          title="Collect gear at Kadugodi Central Hub & start outbound travel"
                                        >
                                          Set En Route
                                        </button>
                                      )}

                                      {/* En Route (leaving_hub) -> Arrived (arrived) */}
                                      {booking.status === 'in-progress' && booking.subStatus === 'leaving_hub' && (
                                        <button
                                          onClick={() => updateBookingStatus(booking.id, 'in-progress', 'arrived')}
                                          className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white font-black rounded-lg text-[10px] uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-orange-500/10"
                                          title="Confirm responder has arrived at motorists stranded site"
                                        >
                                          Mark Arrived
                                        </button>
                                      )}

                                      {/* Arrived (arrived) -> Resolved (completed) */}
                                      {booking.status === 'in-progress' && booking.subStatus === 'arrived' && (
                                          <button
                                            onClick={() => updateBookingStatus(booking.id, 'completed')}
                                            className="px-2.5 py-1.5 bg-success hover:bg-success/80 text-background font-black rounded-lg text-[10px] uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-success/15"
                                            title="Resolve incident and close command ticket"
                                          >
                                            Mark Complete
                                          </button>
                                        )}

                                        {/* Fallback for other en-route / in-progress states */}
                                        {booking.status === 'in-progress' && !booking.subStatus && (
                                          <button
                                            onClick={() => updateBookingStatus(booking.id, 'completed')}
                                            className="px-2.5 py-1.5 bg-success hover:bg-success/80 text-background font-black rounded-lg text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                                          >
                                            Mark Complete
                                          </button>
                                        )}

                                      {/* Emergency with Tech -> Progress */}
                                      {booking.status === 'emergency' && (
                                        <button
                                          onClick={() => updateBookingStatus(booking.id, 'in-progress')}
                                          className="px-3 py-1.5 bg-emergency hover:bg-emergency/80 text-white font-black rounded-lg text-[10px] uppercase tracking-wider transition-all cursor-pointer animate-pulse"
                                        >
                                          Activate Case
                                        </button>
                                      )}

                                      {/* Cancel Active Dispatch */}
                                      <button
                                        onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                                        className="px-3 py-1.5 bg-emergency/15 hover:bg-emergency/25 text-emergency border border-emergency/30 font-bold rounded-lg text-[10px] uppercase tracking-wider transition-all cursor-pointer"
                                        title="Abort dispatch and recall technician to hub"
                                      >
                                        Cancel
                                      </button>
                                    </>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        </td>

                      </tr>

                      {/* Expandable Visual Journey Timeline */}
                      {expandedBookingId === booking.id && (
                        <tr className="bg-black/30 border-b border-border">
                          <td colSpan={8} className="p-6">
                            {booking.status?.toLowerCase() === 'cancelled' && (
                              <div className="mb-4 p-5 bg-emergency/15 border border-emergency/35 text-emergency rounded-2xl flex items-center gap-3.5 shadow-lg shadow-emergency/5">
                                <AlertOctagon size={24} className="shrink-0 animate-pulse" />
                                <div>
                                  <h4 className="font-extrabold text-sm uppercase tracking-wider">Service Request Cancelled by Customer</h4>
                                  <p className="text-[11px] text-foreground/60 mt-0.5 font-semibold">This dispatch request has been aborted. All assigned operations and technician dispatches are cancelled.</p>
                                </div>
                              </div>
                            )}
                            <motion.div 
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex flex-col lg:flex-row items-stretch justify-between gap-6"
                            >
                              
                              {/* Left Panel: Central Ops Hub & Stage Radar Stack */}
                              <div className="lg:w-2/5 flex flex-col gap-4">
                                {/* Central Ops Hub Badge card */}
                                <div className="space-y-3.5 bg-card/60 p-5 rounded-2xl border border-white/5 text-left relative overflow-hidden">
                                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/2 rounded-full blur-xl pointer-events-none" />
                                  <div className="flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                    <h4 className="text-[10px] font-black text-white uppercase tracking-wider">Erina Ops Central Hub</h4>
                                  </div>
                                  
                                  <p className="text-[11px] text-foreground/75 leading-relaxed font-medium">
                                    <strong>Central Hub Address:</strong><br />
                                    Shop No. 02, Dinnur Main Road, Kadugodi Colony, Opp: Srihalli Cafe, Bengaluru, Karnataka — 560067
                                  </p>
                                  
                                  <div className="flex items-center justify-between text-[9px] text-foreground/45 border-t border-white/5 pt-2.5 font-bold uppercase tracking-wider">
                                    <span>Station Coordinates</span>
                                    <span className="text-primary font-mono">12.9902° N, 77.7602° E</span>
                                  </div>
                                  
                                  {techInfo && (
                                    <div className="text-[9px] text-foreground/50 border-t border-white/5 pt-2.5 font-semibold">
                                      <strong>Dispatched Unit:</strong> {techInfo.name} <br />
                                      <span className="text-foreground/40">{techInfo.vehicleType}</span>
                                    </div>
                                  )}
                                </div>

                                {/* Interactive Stages Map Progress Timeline */}
                                <div className="flex-1 flex flex-col justify-center bg-card/25 p-5 rounded-2xl border border-white/5 min-h-[180px]">
                                  <h4 className="text-[10px] font-black text-white uppercase tracking-wider mb-6 text-left flex items-center gap-1.5">
                                    <Activity size={12} className="text-primary animate-pulse" />
                                    <span>Live Dispatch Stage Radar</span>
                                  </h4>

                                  <div className="relative flex items-center justify-between w-full px-2">
                                    {/* Horizontal connector line */}
                                                              {/* Milestone Nodes */}
                                    {/* Node 1: Setup */}
                                    <div className="flex flex-col items-center text-center max-w-[70px]">
                                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${
                                        booking.status !== 'pending' && booking.status !== 'emergency'
                                          ? 'bg-success/20 text-success border-success/35 shadow-lg shadow-success/5'
                                          : 'bg-card text-foreground/30 border-white/5'
                                      }`}>
                                        <Clock size={16} />
                                      </div>
                                      <span className="text-[9px] font-black uppercase tracking-wider mt-2.5 text-white">Hub Setup</span>
                                      <span className="text-[8px] text-foreground/40 mt-1 font-semibold leading-normal">
                                        {booking.status === 'pending' || booking.status === 'emergency' ? 'Pending Queue' : 'Incident Logged'}
                                      </span>
                                      {booking.timeline?.confirmedAt && (
                                        <span className="text-[7.5px] text-success/75 mt-0.5 font-bold font-mono uppercase bg-success/5 border border-success/15 px-1.5 py-0.5 rounded">
                                          {new Date(booking.timeline.confirmedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                      )}
                                    </div>

                                    {/* Node 2: Collecting Tools */}
                                    <div className="flex flex-col items-center text-center max-w-[90px]">
                                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${
                                        booking.status === 'completed' || (booking.status === 'in-progress') || (booking.status === 'assigned' && booking.subStatus !== 'collecting_tools')
                                          ? 'bg-success/20 text-success border-success/35 shadow-lg shadow-success/5'
                                          : (booking.status === 'assigned' && booking.subStatus === 'collecting_tools')
                                            ? 'bg-blue-500/20 text-blue-400 border-blue-500/50 animate-pulse shadow-md shadow-blue-500/10'
                                            : 'bg-card text-foreground/30 border-white/5'
                                      }`}>
                                        <Wrench size={16} />
                                      </div>
                                      <span className="text-[9px] font-black uppercase tracking-wider mt-2.5 text-white">Collecting Tools</span>
                                      <span className="text-[8px] text-foreground/40 mt-1 font-semibold leading-normal">
                                        {booking.status === 'assigned' && booking.subStatus === 'collecting_tools' ? 'Gathering Gear' : (booking.status === 'pending' || booking.status === 'emergency' ? 'Awaiting Dispatch' : 'Unit Loaded')}
                                      </span>
                                      {booking.timeline?.assignedAt && (
                                        <span className="text-[7.5px] text-success/75 mt-0.5 font-bold font-mono uppercase bg-success/5 border border-success/15 px-1.5 py-0.5 rounded">
                                          {new Date(booking.timeline.assignedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                      )}
                                    </div>

                                    {/* Node 3: Outbound */}
                                    <div className="flex flex-col items-center text-center max-w-[90px]">
                                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${
                                        booking.status === 'completed' || (booking.status === 'in-progress' && booking.subStatus === 'arrived')
                                          ? 'bg-success/20 text-success border-success/35 shadow-lg shadow-success/5'
                                          : (booking.status === 'in-progress' && booking.subStatus === 'leaving_hub')
                                            ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/50 animate-pulse shadow-md shadow-indigo-500/10'
                                            : 'bg-card text-foreground/30 border-white/5'
                                      }`}>
                                        <Truck size={16} />
                                      </div>
                                      <span className="text-[9px] font-black uppercase tracking-wider mt-2.5 text-white">Leaving Hub</span>
                                      <span className="text-[8px] text-foreground/40 mt-1 font-semibold leading-normal">
                                        {booking.status === 'in-progress' && booking.subStatus === 'leaving_hub' ? 'Leaving station' : (booking.status === 'completed' || (booking.status === 'in-progress' && booking.subStatus === 'arrived') ? 'Left Hub' : 'En-route')}
                                      </span>
                                      {booking.timeline?.enRouteAt && (
                                        <span className="text-[7.5px] text-success/75 mt-0.5 font-bold font-mono uppercase bg-success/5 border border-success/15 px-1.5 py-0.5 rounded">
                                          {new Date(booking.timeline.enRouteAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                      )}
                                    </div>

                                    {/* Node 4: On-Scene */}
                                    <div className="flex flex-col items-center text-center max-w-[90px]">
                                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${
                                        booking.status === 'completed'
                                          ? 'bg-success/20 text-success border-success/35 shadow-lg shadow-success/5'
                                          : (booking.status === 'in-progress' && booking.subStatus === 'arrived')
                                            ? 'bg-orange-500/20 text-orange-400 border-orange-500/50 animate-pulse shadow-md shadow-orange-500/10'
                                            : 'bg-card text-foreground/30 border-white/5'
                                      }`}>
                                        <MapPin size={16} />
                                      </div>
                                      <span className="text-[9px] font-black uppercase tracking-wider mt-2.5 text-white">Arrived Scene</span>
                                      <span className="text-[8px] text-foreground/40 mt-1 font-semibold leading-normal">
                                        {booking.status === 'in-progress' && booking.subStatus === 'arrived' ? 'Active Rescue' : (booking.status === 'completed' ? 'Arrived' : 'On-Scene')}
                                      </span>
                                      {booking.timeline?.arrivedAt && (
                                        <span className="text-[7.5px] text-success/75 mt-0.5 font-bold font-mono uppercase bg-success/5 border border-success/15 px-1.5 py-0.5 rounded">
                                          {new Date(booking.timeline.arrivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                      )}
                                    </div>

                                    {/* Node 5: Success */}
                                    <div className="flex flex-col items-center text-center max-w-[70px]">
                                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${
                                        booking.status === 'completed'
                                          ? 'bg-success/20 text-success border-success/35 shadow-lg shadow-success/5'
                                          : 'bg-card text-foreground/30 border-white/5'
                                      }`}>
                                        <CheckCircle2 size={16} />
                                      </div>
                                      <span className="text-[9px] font-black uppercase tracking-wider mt-2.5 text-white">Resolved</span>
                                      <span className="text-[8px] text-foreground/40 mt-1 font-semibold leading-normal">
                                        {booking.status === 'completed' ? 'Case Resolved' : 'Ticket Open'}
                                      </span>
                                      {booking.timeline?.completedAt && (
                                        <span className="text-[7.5px] text-success/75 mt-0.5 font-bold font-mono uppercase bg-success/5 border border-success/15 px-1.5 py-0.5 rounded">
                                          {new Date(booking.timeline.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                      )}
                                    </div>

                                  </div>
                                </div>
                              </div>

                              {/* Right Panel: Interactive Dispatch Live Map */}
                              <div className="flex-1 flex flex-col bg-card/60 p-5 rounded-2xl border border-white/5 min-h-[350px]">
                                <h4 className="text-[10px] font-black text-white uppercase tracking-wider mb-4 text-left flex items-center gap-1.5">
                                  <MapPin size={12} className="text-primary animate-pulse" />
                                  <span>Live Operations Radar Map</span>
                                </h4>
                                <div className="flex-1 min-h-[280px]">
                                  <LiveTrackingMap 
                                    bookingId={booking.id}
                                    customerLat={booking.coordinates?.lat || 12.9928671}
                                    customerLng={booking.coordinates?.lng || 77.7529829}
                                    status={booking.status}
                                    subStatus={booking.subStatus || null}
                                    technicianName={booking.technicianName}
                                  />
                                </div>
                              </div>

                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-foreground/30 font-bold uppercase tracking-widest">
                    No active rescue operations match this sector query
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
  <div className="flex items-center justify-between p-4 border-t border-white/5">

    <button
      disabled={currentPage === 1}
      onClick={() =>
        setCurrentPage(currentPage - 1)
      }
      className="px-4 py-2 bg-white/5 rounded-xl disabled:opacity-40 text-white"
    >
      Previous
    </button>

    <span className="text-sm text-white font-bold">
      Page {currentPage} of {totalPages}
    </span>

    <button
      disabled={currentPage === totalPages}
      onClick={() =>
        setCurrentPage(currentPage + 1)
      }
      className="px-4 py-2 bg-white/5 rounded-xl disabled:opacity-40 text-white"
    >
      Next
    </button>

  </div>
)}

      </div>

      {/* TECHNICIAN DISPATCH/ASSIGNMENT MODAL */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg glass-panel p-6 rounded-2xl border border-white/10"
          >
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest">
                  {selectedBooking.status === 'completed' || selectedBooking.status === 'cancelled'
                    ? "Modify Incident Record"
                    : "Select Rescue Operator"}
                </h3>
                <p className="text-[9px] text-foreground/45 uppercase tracking-wider font-semibold mt-1">
                  {selectedBooking.status === 'completed' || selectedBooking.status === 'cancelled'
                    ? `Update Service Details for Incident ${selectedBooking.id}`
                    : `Assign unit to Booking ${selectedBooking.id} (${selectedBooking.serviceLabel})`}
                </p>
              </div>
              <button 
                onClick={() => setSelectedBooking(null)}
                className="text-foreground/45 hover:text-white p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Active Case Summary */}
            <div className="bg-background/50 border border-white/5 rounded-xl p-4 mb-5 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-foreground/45 font-bold uppercase tracking-wider">Sector Location</span>
                <div className="text-white font-bold flex items-start gap-2 max-w-[500px]">
  <MapPin
    size={12}
    className="text-red-500 mt-1 shrink-0"
  />

  {selectedBooking.location?.startsWith("http") ? (
    <a
      href={selectedBooking.location}
      target="_blank"
      rel="noopener noreferrer"
      className="text-cyan-400 hover:text-cyan-300 underline break-all"
    >
      View Shared Location
    </a>
  ) : (
    <span className="break-words">
      {selectedBooking.location}
    </span>
  )}
</div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-foreground/45 font-bold uppercase tracking-wider">Requester</span>
                <span className="text-white font-bold">{selectedBooking.customerName}</span>
              </div>
              <div className="flex flex-col gap-2 pt-2 border-t border-white/5 mt-1">
                {isEditingService ? (
                  <div className="flex flex-col gap-2 bg-black/35 p-3 rounded-lg border border-white/5">
                    <label className="text-[9px] text-foreground/45 uppercase tracking-wider font-black">
                      Correct Service Type
                    </label>
                    <select
                      value={editingServiceType}
                      onChange={(e) => {
                        const newType = e.target.value as any;
                        setEditingServiceType(newType);
                        const newPrice = calculatePrice({
                          serviceType: newType,
                          vehicleType: selectedBooking.vehicleType || "Car (Hatchback/Sedan)",
                          distanceKm: selectedBooking.distanceKm || 10,
                          isEmergency: selectedBooking.isPriority || false,
                          config: pricing,
                        });
                        setCustomServicePrice(newPrice.total);
                      }}
                      className="bg-background border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:border-primary/50 cursor-pointer"
                    >
                      <option value="towing">Flatbed Towing</option>
                      <option value="battery">Battery Jumpstart</option>
                      <option value="urgent_battery">Urgent Battery Replacement</option>
                      <option value="ev">Mobile EV Charging</option>
                      <option value="lockout">Lockout Assistance</option>
                      <option value="fuel">Emergency Fuel Delivery</option>
                      <option value="flat_tyre">Flat Tyre Replacement</option>
                      <option value="engine">Engine Diagnostics</option>
                      <option value="accident">Accident Recovery</option>
                      <option value="other">Other Assistance</option>
                    </select>

                    <div className="flex flex-col gap-1 mt-1">
                      <label className="text-[9px] text-foreground/45 uppercase tracking-wider font-black">
                        Custom Service Fee (₹)
                      </label>
                      <input
                        type="number"
                        value={customServicePrice}
                        onChange={(e) => setCustomServicePrice(Math.max(0, Number(e.target.value)))}
                        className="bg-background border border-white/10 rounded-lg px-2 py-1 text-xs text-white outline-none focus:border-primary/50"
                        placeholder="e.g. 0 to make service free"
                      />
                    </div>

                    {(() => {
                      const serviceLabels: Record<string, string> = {
                        towing: "Flatbed Towing",
                        battery: "Battery Jumpstart",
                        urgent_battery: "Urgent Battery Replacement",
                        ev: "Mobile EV Charging",
                        lockout: "Lockout Assistance",
                        fuel: "Emergency Fuel Delivery",
                        flat_tyre: "Flat Tyre Replacement",
                        engine: "Engine Diagnostics",
                        accident: "Accident Recovery",
                        other: "Other Assistance",
                      };

                      return (
                        <div className="flex items-center justify-between text-[10px] text-foreground/60 font-semibold mt-1 pt-1.5 border-t border-white/5">
                          <span>Recalculation Preview: <strong className="text-white">₹{customServicePrice}</strong></span>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={async () => {
                                const newLabel = serviceLabels[editingServiceType] || "Roadside Service";
                                const productsTotal = getProductsTotal(selectedBooking);
                                const newTotalAmount = Math.round((customServicePrice + productsTotal) * 100) / 100;

                                await updateBookingService(
                                  selectedBooking.id,
                                  editingServiceType,
                                  newLabel,
                                  newTotalAmount
                                );
                                // Update current selected booking state so modal updates live
                                setSelectedBooking({
                                  ...selectedBooking,
                                  serviceType: editingServiceType,
                                  serviceLabel: newLabel,
                                  paymentAmount: newTotalAmount,
                                });
                                setIsEditingService(false);
                              }}
                              className="px-2 py-0.5 bg-success hover:bg-success-hover text-background font-bold rounded text-[9px] uppercase cursor-pointer"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setIsEditingService(false);
                                setEditingServiceType(selectedBooking.serviceType);
                              }}
                              className="px-2 py-0.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded text-[9px] uppercase cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-foreground/45 font-bold uppercase tracking-wider">Booked Service</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold">
                        {selectedBooking.serviceLabel} (₹{selectedBooking.paymentAmount})
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingServiceType(selectedBooking.serviceType);
                          setCustomServicePrice(getServicePrice(selectedBooking));
                          setIsEditingService(true);
                        }}
                        className="text-primary hover:text-primary-hover p-1 transition-all rounded hover:bg-white/5 cursor-pointer flex items-center justify-center"
                        title="Edit Service Type"
                      >
                        <Wrench size={12} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* List Available Technicians (Only show if booking is active) */}
            {selectedBooking.status !== 'completed' && selectedBooking.status !== 'cancelled' && (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                <h4 className="text-[10px] text-foreground/45 font-black uppercase tracking-widest mb-2">Available Dispatch Units</h4>
                
                {getAvailableTechsForService(selectedBooking.serviceType).length > 0 ? (
                  getAvailableTechsForService(selectedBooking.serviceType).map((tech) => (
                    <div 
                      key={tech.id}
                      className="bg-background/40 hover:bg-white/3 border border-white/5 hover:border-primary/30 p-4 rounded-xl flex items-center justify-between gap-4 transition-all group"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-white">{tech.name}</span>
                          <span className="text-[9px] bg-success/20 text-success border border-success/35 px-2 py-0.2 rounded-full font-black uppercase tracking-wider">
                            {tech.rating} ★
                          </span>
                        </div>
                        <div className="text-[10px] text-foreground/45 mt-1 font-semibold">
                          {tech.vehicleType} | {tech.serviceArea}
                        </div>
                      </div>

                      <button
                        onClick={() => handleAssignTech(tech.id)}
                        className="px-3.5 py-2 bg-primary hover:bg-primary-hover text-background font-black rounded-lg text-[10px] uppercase tracking-wider transition-all cursor-pointer group-hover:shadow-md group-hover:shadow-primary/20 flex items-center gap-1"
                      >
                        <span>Deploy Unit</span>
                        <ChevronRight size={12} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="border border-white/5 rounded-xl p-6 text-center text-foreground/30 font-bold uppercase tracking-widest text-[11px] leading-relaxed">
                    ⚠️ No available technicians in this sector. <br />
                    <span className="text-[9px] font-semibold text-foreground/20">Go to Technicians panel and set off-duty units to Available.</span>
                  </div>
                )}
              </div>
            )}

          </motion.div>
        </div>
      )}
     {showNewTicketModal && (
  <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">

    <div className="bg-[#0B1220] border border-white/10 rounded-[32px] p-7 w-full max-w-6xl max-h-[92vh] overflow-y-auto">

      {/* Header */}
      <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-5">
        <div>
          <h2 className="text-2xl font-black text-white uppercase tracking-wider">
            Create New Ticket
          </h2>

          <p className="text-sm text-white/40 mt-1 uppercase tracking-wider font-semibold">
            Admin Assisted Roadside Booking
          </p>
        </div>

        <button
          onClick={() =>
            setShowNewTicketModal(false)
          }
          className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-white transition"
        >
          ✕
        </button>
      </div>

      <form
        onSubmit={handleCreateTicket}
        className="space-y-8"
      >

        {/* CUSTOMER + VEHICLE */}
        <div className="grid grid-cols-2 gap-6">

          <div>
            <label className="text-sm text-white font-bold mb-2 block">
              Full Name
            </label>

            <input
              placeholder="John Doe"
              value={ticketForm.customerName}
              onChange={(e)=>
                setTicketForm({
                  ...ticketForm,
                  customerName:
                    e.target.value
                })
              }
              className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-white"
            />
          </div>

          <div>
            <label className="text-sm text-white font-bold mb-2 block">
              Mobile Number
            </label>

            <input
  type="tel"
  placeholder="9876543210"
  value={ticketForm.phone}
  maxLength={10}
  onChange={(e) => {

    // only numbers allowed
    const value =
      e.target.value.replace(
        /\D/g,
        ""
      );

    // limit to 10 digits
    if (value.length <= 10) {
      setTicketForm({
        ...ticketForm,
        phone: value,
      });
    }
  }}
  className="
    w-full
    p-4
    rounded-2xl
    bg-white/5
    border border-white/10
    text-white
  "
/>
          </div>

          <div>
            <label className="text-sm text-white font-bold mb-2 block">
              Vehicle Type
            </label>

            <select
              value={
                ticketForm.vehicleType
              }
              onChange={(e)=>
                setTicketForm({
                  ...ticketForm,
                  vehicleType:
                    e.target.value
                })
              }
              className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-white"
            >
              <option>
                Car (Hatchback/Sedan)
              </option>

              <option>
                SUV / MUV
              </option>

              <option>
                Luxury
              </option>

              <option>
                EV
              </option>

              <option>
                Bike
              </option>
              <option>
                Other
              </option>
            </select>
          </div>

          <div>
            <label className="text-sm text-white font-bold mb-2 block">
              Vehicle Number
            </label>

           <input
 placeholder={
  ticketForm.vehicleType === "Other"
    ? "Not Required"
    : "UP78AB1234"
}
  value={
    ticketForm.vehicleNumber
  }
  disabled={
    ticketForm.vehicleType === "Other"
  }
  onChange={(e)=>
    setTicketForm({
      ...ticketForm,
      vehicleNumber:
        e.target.value.toUpperCase()
    })
  }
  className={`
    w-full
    p-4
    rounded-2xl
    border
    uppercase
    ${
      ticketForm.vehicleType === "Other"
        ? "bg-white/5 text-white/40 border-white/5 cursor-not-allowed"
        : "bg-white/5 border-white/10 text-white"
    }
  `}
/>
          </div>
        </div>

        {/* SERVICE TYPE */}
        <div>
          <div className="flex justify-between mb-4">
            <h3 className="text-white font-black text-lg">
              Select Breakdown Issue
            </h3>

            <span className="text-white/30 text-sm font-bold uppercase">
              Quick Select
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

            {[
              "towing",
              "battery",
              "urgent_battery",
                "ev",
              "lockout",
                "fuel",
              "flat_tyre",
              "engine",
              "accident",
               "other"
].map((service) => (

              <button
  key={service}
  type="button"
  onClick={() =>
    toggleService(service)
  }
  className={`
    rounded-3xl
    p-5
    border
    transition
    text-left
    ${
      ticketForm.serviceTypes.includes(
        service
      )
        ? "border-cyan-400 bg-cyan-500/10"
        : "border-white/10 bg-white/[0.02]"
    }
  `}
>
  <div className="text-white font-black capitalize">
    {service.replace(
      "_",
      " "
    )}
  </div>
</button>
            ))}

          </div>
        </div>

        {/* LOCATION */}
        <div className="space-y-5">

          <h3 className="text-white font-black text-lg">
            Pickup Location
          </h3>

          <textarea
            placeholder="Add address or nearby landmark..."
            value={
              ticketForm.address
            }
            onChange={(e)=>
              setTicketForm({
                ...ticketForm,
                address:
                  e.target.value
              })
            }
            className="w-full h-28 p-4 rounded-2xl bg-white/5 border border-white/10 text-white resize-none"
          />

          <div className="grid grid-cols-2 gap-4">

            <input
              placeholder="Latitude (optional)"
              value={
                ticketForm.latitude
              }
              onChange={(e)=>
                setTicketForm({
                  ...ticketForm,
                  latitude:
                    e.target.value
                })
              }
              className="p-4 rounded-2xl bg-white/5 border border-white/10 text-white"
            />

            <input
              placeholder="Longitude (optional)"
              value={
                ticketForm.longitude
              }
              onChange={(e)=>
                setTicketForm({
                  ...ticketForm,
                  longitude:
                    e.target.value
                })
              }
              className="p-4 rounded-2xl bg-white/5 border border-white/10 text-white"
            />
          </div>

        </div>

        {/* PAYMENT */}
        <div className="grid grid-cols-2 gap-6">

          <div>
            <label className="text-white font-bold block mb-3">
              Payment Method
            </label>

            <select
              value={
                ticketForm.paymentMethod
              }
              onChange={(e)=>
                setTicketForm({
                  ...ticketForm,
                  paymentMethod:
                    e.target.value
                })
              }
              className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-white"
            >
              <option value="cash">
                Cash
              </option>

              <option value="upi">
                UPI
              </option>

              <option value="online">
                Paid Online
              </option>
            </select>
          </div>

          <div>
            <label className="text-white font-bold block mb-3">
              Estimated Charge
            </label>

            <input
              type="number"
              placeholder="₹ 2500"
              value={
                ticketForm.paymentAmount
              }
              onChange={(e)=>
                setTicketForm({
                  ...ticketForm,
                  paymentAmount:
                    e.target.value
                })
              }
              className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-white"
            />
          </div>
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="text-white font-bold block mb-3">
            Description
          </label>

          <textarea
            placeholder="Customer issue details..."
            value={
              ticketForm.description
            }
            onChange={(e)=>
              setTicketForm({
                ...ticketForm,
                description:
                  e.target.value
              })
            }
            className="w-full h-28 p-4 rounded-2xl bg-white/5 border border-white/10 text-white resize-none"
          />
        </div>

        {/* EMERGENCY LAST */}
        <div className="border border-red-500/20 bg-red-500/10 rounded-3xl p-6 flex justify-between items-center">

          <div>
            <h3 className="text-white font-black text-lg">
              High Priority Emergency
            </h3>

            <p className="text-white/50 text-sm">
              Emergency dispatch increases charges
            </p>
          </div>

          <input
            type="checkbox"
            checked={
              ticketForm.isPriority
            }
            onChange={(e)=>
              setTicketForm({
                ...ticketForm,
                isPriority:
                  e.target.checked
              })
            }
            className="w-7 h-7"
          />
        </div>

        {/* BUTTON */}
        <button
          type="submit"
          className="
            w-full
            bg-cyan-400
            hover:bg-cyan-300
            text-black
            py-5
            rounded-3xl
            font-black
            uppercase
            tracking-wider
            transition
          "
        >
          {
        ticketForm.isPriority
          ? "Create Emergency Ticket"
        : "Create Ticket"
}
        </button>

      </form>
    </div>
  </div>
)}
      {/* INCIDENT IMAGE FULL PREVIEW MODAL */}
      {previewImage && (
        <div 
          className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setPreviewImage(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative max-w-3xl w-full rounded-2xl overflow-hidden glass-panel border border-white/10 p-2 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute right-4 top-4 z-10">
              <button 
                onClick={() => setPreviewImage(null)}
                className="w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 border border-white/10 text-white flex items-center justify-center transition-all cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>
            <div className="relative aspect-video w-full bg-black/40 rounded-xl overflow-hidden flex items-center justify-center">
              <img 
                src={previewImage} 
                alt="Incident Vehicle Zoom" 
                className="max-w-full max-h-[80vh] object-contain rounded-xl"
              />
            </div>
          </motion.div>
        </div>
      )}



      {/* ── Add Products Sold Modal ────────────────────────────────────────── */}
      {sellProductsBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-card border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">

            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/8">
              <div>
                <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Package size={16} className="text-primary" /> Add Products Sold
                </h2>
                <p className="text-[10px] text-foreground/40 mt-1">
                  Ticket: <span className="text-primary font-mono">{sellProductsBooking.id.slice(-8).toUpperCase()}</span>
                  {' — '}{sellProductsBooking.customerName}
                </p>
              </div>
              <button onClick={() => setSellProductsBooking(null)} className="text-foreground/40 hover:text-white transition-colors cursor-pointer">
                <Minus size={0} className="hidden" />
                <span className="text-lg leading-none">✕</span>
              </button>
            </div>

            <div className="p-6 space-y-4">

              {/* Success */}
              {sellSuccess && (
                <div className="flex items-center gap-2 p-3 bg-success/10 border border-success/20 rounded-xl text-success text-xs font-bold">
                  <CheckCircle2 size={14} /> Products saved! Invoice will reflect the updated totals.
                </div>
              )}

              {/* Error */}
              {sellError && (
                <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
                  <span className="mt-0.5">⚠</span> {sellError}
                </div>
              )}

              {/* Catalog */}
              {catalogLoading ? (
                <div className="flex items-center justify-center py-10">
                  <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
              ) : catalogProducts.length === 0 ? (
                <div className="text-center py-10">
                  <Package size={28} className="text-foreground/15 mx-auto mb-2" />
                  <p className="text-xs text-foreground/40">No active products in catalog.</p>
                  <a href="/admin/products" target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline mt-1 block">
                    Go to Products Catalog →
                  </a>
                </div>
              ) : (
                <div className="space-y-2">
                  {catalogProducts.map((product) => {
                    const selected = selectedItems.find(i => i.product._id === product._id);
                    const isOutOfStock = product.stockQty === 0;
                    return (
                      <div
                        key={product._id}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                          selected
                            ? 'bg-primary/8 border-primary/30'
                            : isOutOfStock
                            ? 'bg-white/2 border-white/4 opacity-40'
                            : 'bg-white/2 border-white/6 hover:border-white/12'
                        }`}
                      >
                        {/* Product info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white truncate">{product.name}</p>
                          <p className="text-[10px] text-foreground/40 mt-0.5">
                            {product.brand} · Stock: <span className={product.stockQty <= 2 ? 'text-warning' : 'text-foreground/60'}>{product.stockQty}</span>
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-black text-white">₹{product.sellingPrice.toLocaleString('en-IN')}</p>
                          <p className="text-[9px] text-foreground/35">{(product.gstRate * 100).toFixed(0)}% GST</p>
                        </div>
                        {/* Qty controls */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            disabled={isOutOfStock || !selected}
                            onClick={() => adjustQty(product, -1)}
                            className="w-7 h-7 flex items-center justify-center bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-foreground/60 rounded-lg transition-colors cursor-pointer"
                          >
                            <Minus size={11} />
                          </button>
                          <span className="w-6 text-center text-xs font-black text-white">
                            {selected ? selected.qty : 0}
                          </span>
                          <button
                            disabled={isOutOfStock}
                            onClick={() => adjustQty(product, 1)}
                            className="w-7 h-7 flex items-center justify-center bg-primary/15 hover:bg-primary/25 disabled:opacity-30 disabled:cursor-not-allowed text-primary rounded-lg transition-colors cursor-pointer"
                          >
                            <Plus size={11} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Order Summary */}
              {selectedItems.length > 0 && (
                <div className="mt-4 p-3 bg-white/3 border border-white/6 rounded-xl space-y-1.5">
                  <p className="text-[9px] font-black text-foreground/35 uppercase tracking-wider">Selected Products</p>
                  {selectedItems.map(item => (
                    <div key={item.product._id} className="flex justify-between text-xs">
                      <span className="text-foreground/60">{item.product.name} × {item.qty}</span>
                      <span className="font-bold text-white">₹{(item.product.sellingPrice * item.qty).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-xs border-t border-white/8 pt-1.5 mt-1.5">
                    <span className="font-black text-foreground/60 uppercase tracking-wider">Products Total</span>
                    <span className="font-black text-primary">₹{sellTotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-white/5 mt-2">
                    <input
                      type="checkbox"
                      id="waiveServiceFee"
                      checked={waiveServiceFee}
                      onChange={(e) => setWaiveServiceFee(e.target.checked)}
                      className="rounded border-white/10 bg-background text-primary focus:ring-0 focus:ring-offset-0 cursor-pointer"
                    />
                    <label htmlFor="waiveServiceFee" className="text-[10px] text-foreground/60 font-semibold cursor-pointer">
                      Waive roadside assistance service fee (Set service charge to ₹0)
                    </label>
                  </div>
                  
                  {/* Scrap Battery Exchange Toggle */}
                  <div className="border-t border-white/5 pt-3 mt-3">
                    <div className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        id="scrapBattery"
                        checked={scrapBattery.isExchanged}
                        onChange={(e) => setScrapBattery({ ...scrapBattery, isExchanged: e.target.checked })}
                        className="rounded border-white/10 bg-background text-yellow-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                      />
                      <label htmlFor="scrapBattery" className="text-xs text-yellow-500 font-black uppercase tracking-wider cursor-pointer">
                        ♻️ Scrap Battery Exchange
                      </label>
                    </div>
                    {scrapBattery.isExchanged && (
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        <div>
                          <label className="text-[9px] font-bold text-foreground/40 uppercase">Brand</label>
                          <input type="text" value={scrapBattery.brand} onChange={e => setScrapBattery({...scrapBattery, brand: e.target.value})} className="w-full text-xs px-2 py-1.5 rounded-md bg-black/20 border border-white/10 text-white mt-1" placeholder="e.g. Exide" />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-foreground/40 uppercase">Condition</label>
                          <input type="text" value={scrapBattery.condition} onChange={e => setScrapBattery({...scrapBattery, condition: e.target.value})} className="w-full text-xs px-2 py-1.5 rounded-md bg-black/20 border border-white/10 text-white mt-1" placeholder="e.g. Dead" />
                        </div>
                        <div>
                          <label className="text-[9px] font-bold text-foreground/40 uppercase">Discount (₹)</label>
                          <input type="number" value={scrapBattery.discountValue || ''} onChange={e => setScrapBattery({...scrapBattery, discountValue: Number(e.target.value)})} className="w-full text-xs px-2 py-1.5 rounded-md bg-black/20 border border-white/10 text-white mt-1" placeholder="0" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setSellProductsBooking(null)}
                  className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-foreground/60 font-bold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSellProducts}
                  disabled={sellSaving || selectedItems.length === 0 || sellSuccess}
                  className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed text-background font-black rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer"
                >
                  {sellSaving ? 'Saving...' : `Confirm Sale · ₹${sellTotal.toLocaleString('en-IN')}`}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}



    </div>
  );
}
