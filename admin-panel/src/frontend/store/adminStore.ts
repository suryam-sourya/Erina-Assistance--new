import { create } from 'zustand';
import { getAuthToken } from '@/frontend/lib/firebase';

export interface Booking {
  id: string;
  customerName: string;
  customerPhone: string;
  serviceType:
| 'towing'
| 'battery'
| 'ev'
| 'lockout'
| 'fuel'
| 'flat_tyre'
| 'engine'
| 'accident'
| 'other';
  serviceLabel: string;
  vehicleName: string;
  vehiclePlate: string;
  technicianId: string | null;
  technicianName: string | null;
  status: 'pending' | 'assigned' | 'in-progress' | 'completed' | 'emergency';
  subStatus?: 'collecting_tools' | 'leaving_hub' | 'arrived' | null;
  paymentStatus: 'completed' | 'pending' | 'failed';
  paymentAmount: number;
  createdTime: string;
  location: string;
  imageUrl?: string | null;
  coordinates?: { lat: number; lng: number };
}

export interface Technician {
  id: string;
  name: string;
  phone: string;
  availability: 'available' | 'busy' | 'offline';
  currentJob: string | null; // Booking ID
  rating: number;
  serviceArea: string;
  vehicleType: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  membershipPlan: 'basic' | 'silver' | 'gold' | 'platinum';
  rescuesCount: number;
  vehicle: string;
}

export interface PaymentRecord {
  id: string;
  bookingId: string;
  customerName: string;
  serviceLabel: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  date: string;
}

export interface SupportTicket {
  id: string;
  customerName: string;
  subject: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'pending' | 'resolved';
  createdTime: string;
}

export interface RecentActivity {
  id: string;
  message: string;
  time: string;
  type: 'dispatch' | 'assignment' | 'completion' | 'payment' | 'alert';
}

interface AdminState {
  // Database Tables
  bookings: Booking[];
  technicians: Technician[];
  customers: Customer[];
  payments: PaymentRecord[];
  supportTickets: SupportTicket[];
  recentActivities: RecentActivity[];
  
  // Realtime Active Dashboard Alert State
  activeAlertMessage: string | null;
  
  // Stats Calculations
  getStats: () => {
    totalRequests: number;
    activeEmergencies: number;
    availableTechnicians: number;
    revenueToday: number;
    pendingRequests: number;
  };
  
  // Interactive Simulator Operations
  fetchBookings: () => Promise<void>;
  addBooking: (booking: Omit<Booking, 'id' | 'createdTime'>) => Promise<void>;
  assignTechnician: (bookingId: string, technicianId: string) => Promise<void>;
  updateBookingStatus: (bookingId: string, status: Booking['status'], subStatus?: Booking['subStatus']) => Promise<void>;
  toggleTechnicianAvailability: (technicianId: string) => void;
  addActivity: (message: string, type: RecentActivity['type']) => void;
  triggerEmergencyDispatch: (serviceType: Booking['serviceType'], location: string, customerName: string) => Promise<void>;
  clearAlert: () => void;
  resolveTicket: (ticketId: string) => void;
  addSupportTicket: (ticket: Omit<SupportTicket, 'id' | 'createdTime' | 'status'>) => void;
}

// Seed Initial Mock Data
const initialBookings: Booking[] = [
  {
    id: 'ER-4892',
    customerName: 'Arjun Krishnan',
    customerPhone: '+91 98450 12345',
    serviceType: 'battery',
    serviceLabel: 'Battery Jumpstart',
    vehicleName: 'Tata Nexon EV',
    vehiclePlate: 'KA-03-MY-7890',
    technicianId: 'TECH-02',
    technicianName: 'Ramesh Kumar',
    status: 'in-progress',
    paymentStatus: 'pending',
    paymentAmount: 1800,
    createdTime: '22 Mins Ago',
    location: 'Nandi Hills Road, Bangalore',
    coordinates: { lat: 13.3702, lng: 77.6835 },
  },
  {
    id: 'ER-4891',
    customerName: 'Sneha Reddy',
    customerPhone: '+91 98450 54321',
    serviceType: 'towing',
    serviceLabel: 'Flatbed Towing',
    vehicleName: 'Hyundai Creta',
    vehiclePlate: 'KA-51-ND-2024',
    technicianId: 'TECH-01',
    technicianName: 'Amit Singh',
    status: 'assigned',
    paymentStatus: 'pending',
    paymentAmount: 4500,
    createdTime: '28 Mins Ago',
    location: 'NICE Road Expressway, Bangalore',
    coordinates: { lat: 12.8761, lng: 77.5011 },
  },
  {
    id: 'ER-4890',
    customerName: 'Dr. Vijay Shekhar',
    customerPhone: '+91 97760 98765',
    serviceType: 'ev',
    serviceLabel: 'Mobile EV Charging',
    vehicleName: 'MG ZS EV',
    vehiclePlate: 'KA-01-EV-4455',
    technicianId: 'TECH-03',
    technicianName: 'Vikram Rao',
    status: 'completed',
    paymentStatus: 'completed',
    paymentAmount: 2500,
    createdTime: '1 Hour Ago',
    location: 'Outer Ring Road, Marathahalli',
    coordinates: { lat: 12.9562, lng: 77.7011 },
  },
  {
    id: 'ER-4889',
    customerName: 'Priya Mudaliar',
    customerPhone: '+91 91234 56789',
    serviceType: 'lockout',
    serviceLabel: 'Lockout Assistance',
    vehicleName: 'Maruti Baleno',
    vehiclePlate: 'KA-04-PH-9911',
    technicianId: 'TECH-04',
    technicianName: 'Nitesh Gowda',
    status: 'completed',
    paymentStatus: 'completed',
    paymentAmount: 1500,
    createdTime: '2 Hours Ago',
    location: 'Phoenix Marketcity, Whitefield',
    coordinates: { lat: 12.9961, lng: 77.7291 },
  },
  {
    id: 'ER-4893',
    customerName: 'Rohit Sharma',
    customerPhone: '+91 99887 76655',
    serviceType: 'towing',
    serviceLabel: 'Accident Flatbed Towing',
    vehicleName: 'Mahindra XUV700',
    vehiclePlate: 'KA-53-MS-0007',
    technicianId: null,
    technicianName: null,
    status: 'emergency',
    paymentStatus: 'pending',
    paymentAmount: 5200,
    createdTime: '2 Mins Ago',
    location: 'Hebbal Flyover, Bangalore',
    coordinates: { lat: 13.0358, lng: 77.5978 },
  },
];

const initialTechnicians: Technician[] = [
  {
    id: 'TECH-01',
    name: 'Amit Singh',
    phone: '+91 98888 11111',
    availability: 'busy',
    currentJob: 'ER-4891',
    rating: 4.8,
    serviceArea: 'Electronic City / NICE Road',
    vehicleType: 'Flatbed Tow Truck',
  },
  {
    id: 'TECH-02',
    name: 'Ramesh Kumar',
    phone: '+91 98888 22222',
    availability: 'busy',
    currentJob: 'ER-4892',
    rating: 4.9,
    serviceArea: 'Yelahanka / Nandi Hills',
    vehicleType: 'Heavy Duty Tow & Battery Rig',
  },
  {
    id: 'TECH-03',
    name: 'Vikram Rao',
    phone: '+91 98888 33333',
    availability: 'available',
    currentJob: null,
    rating: 4.7,
    serviceArea: 'Marathahalli / ORR',
    vehicleType: 'EV Mobile Charger Van',
  },
  {
    id: 'TECH-04',
    name: 'Nitesh Gowda',
    phone: '+91 98888 44444',
    availability: 'available',
    currentJob: null,
    rating: 4.6,
    serviceArea: 'Whitefield / Indiranagar',
    vehicleType: 'RSA Response Bike & Lockout Toolset',
  },
  {
    id: 'TECH-05',
    name: 'Suresh Patil',
    phone: '+91 98888 55555',
    availability: 'available',
    currentJob: null,
    rating: 4.5,
    serviceArea: 'Koramangala / HSR Layout',
    vehicleType: 'Battery Jumpstart & Fuel Van',
  },
  {
    id: 'TECH-06',
    name: 'Karthik Raja',
    phone: '+91 98888 66666',
    availability: 'offline',
    currentJob: null,
    rating: 4.9,
    serviceArea: 'Jayanagar / JP Nagar',
    vehicleType: 'Standard Tow Truck',
  },
];

const initialCustomers: Customer[] = [
  {
    id: 'CUST-01',
    name: 'Arjun Krishnan',
    phone: '+91 98450 12345',
    membershipPlan: 'gold',
    rescuesCount: 3,
    vehicle: 'Tata Nexon EV (KA-03-MY-7890)',
  },
  {
    id: 'CUST-02',
    name: 'Sneha Reddy',
    phone: '+91 98450 54321',
    membershipPlan: 'platinum',
    rescuesCount: 1,
    vehicle: 'Hyundai Creta (KA-51-ND-2024)',
  },
  {
    id: 'CUST-03',
    name: 'Dr. Vijay Shekhar',
    phone: '+91 97760 98765',
    membershipPlan: 'silver',
    rescuesCount: 5,
    vehicle: 'MG ZS EV (KA-01-EV-4455)',
  },
  {
    id: 'CUST-04',
    name: 'Priya Mudaliar',
    phone: '+91 91234 56789',
    membershipPlan: 'basic',
    rescuesCount: 2,
    vehicle: 'Maruti Baleno (KA-04-PH-9911)',
  },
  {
    id: 'CUST-05',
    name: 'Rohit Sharma',
    phone: '+91 99887 76655',
    membershipPlan: 'gold',
    rescuesCount: 1,
    vehicle: 'Mahindra XUV700 (KA-53-MS-0007)',
  },
];

const initialPayments: PaymentRecord[] = [
  {
    id: 'PAY-1001',
    bookingId: 'ER-4890',
    customerName: 'Dr. Vijay Shekhar',
    serviceLabel: 'Mobile EV Charging',
    amount: 2500,
    status: 'completed',
    date: 'Today, 10:45 AM',
  },
  {
    id: 'PAY-1002',
    bookingId: 'ER-4889',
    customerName: 'Priya Mudaliar',
    serviceLabel: 'Lockout Assistance',
    amount: 1500,
    status: 'completed',
    date: 'Today, 09:12 AM',
  },
  {
    id: 'PAY-1003',
    bookingId: 'ER-4888',
    customerName: 'Anil Deshmukh',
    serviceLabel: 'Flatbed Towing',
    amount: 4500,
    status: 'completed',
    date: 'Yesterday, 04:30 PM',
  },
  {
    id: 'PAY-1004',
    bookingId: 'ER-4887',
    customerName: 'Sanjay Dutt',
    serviceLabel: 'Battery Jumpstart',
    amount: 1800,
    status: 'completed',
    date: 'Yesterday, 02:15 PM',
  },
];

const initialSupportTickets: SupportTicket[] = [
  {
    id: 'TKT-890',
    customerName: 'Rahul Dravid',
    subject: 'Delayed response for jumpstart assistance near Indiranagar',
    priority: 'high',
    status: 'open',
    createdTime: '30 Mins Ago',
  },
  {
    id: 'TKT-889',
    customerName: 'Pooja Hegde',
    subject: 'Double payment charged during lockout service checkout',
    priority: 'medium',
    status: 'pending',
    createdTime: '2 Hours Ago',
  },
  {
    id: 'TKT-888',
    customerName: 'Kiran Mazumdar',
    subject: 'Request emergency towing ambulance escalation',
    priority: 'critical',
    status: 'open',
    createdTime: '5 Mins Ago',
  },
];

const initialActivities: RecentActivity[] = [
  {
    id: 'ACT-01',
    message: 'Emergency towing dispatch request created for Rohit Sharma at Hebbal Flyover.',
    time: '2 Mins Ago',
    type: 'alert',
  },
  {
    id: 'ACT-02',
    message: 'Technician Amit Singh assigned to Flatbed Towing for Sneha Reddy.',
    time: '28 Mins Ago',
    type: 'assignment',
  },
  {
    id: 'ACT-03',
    message: 'Mobile EV Charging service completed for Dr. Vijay Shekhar. Payment of ₹2,500 settled.',
    time: '1 Hour Ago',
    type: 'completion',
  },
  {
    id: 'ACT-04',
    message: 'Technician Nitesh Gowda returned to Available status after completing Lockout Assistance.',
    time: '2 Hours Ago',
    type: 'dispatch',
  },
];

export const useAdminStore = create<AdminState>((set, get) => ({
  bookings: initialBookings,
  technicians: initialTechnicians,
  customers: initialCustomers,
  payments: initialPayments,
  supportTickets: initialSupportTickets,
  recentActivities: initialActivities,
  activeAlertMessage: null,

  getStats: () => {
    const bookings = get().bookings;
    const technicians = get().technicians;
    const payments = get().payments;

    const totalRequests = bookings.length;
    const activeEmergencies = bookings.filter(b => b.status === 'emergency').length;
    const availableTechnicians = technicians.filter(t => t.availability === 'available').length;
    const pendingRequests = bookings.filter(b => b.status === 'pending' || b.status === 'emergency').length;
    
    const revenueToday = payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      totalRequests,
      activeEmergencies,
      availableTechnicians,
      revenueToday,
      pendingRequests,
    };
  },

  fetchBookings: async () => {
    try {
     const response =
await fetch(
"/api/bookings",
{
 cache:
 "no-store",
}
);
      if (!response.ok) throw new Error("Failed to fetch bookings");
      const data: any[] = await response.json();
      
      const mappedBookings: Booking[] = data.map((b: any) => ({
        id: b.id || b._id,
        customerName: b.customerName || "Customer",
        customerPhone: b.phone || "",
        serviceType:(b.serviceType ||"other").toLowerCase() as Booking['serviceType'],
        serviceLabel: b.serviceLabel || "Roadside Service",
        vehicleName: b.vehicleName || b.vehicleType || "Vehicle",
        vehiclePlate: b.vehiclePlate || b.vehicleNumber || "",
        technicianId: b.technicianId || null,
        technicianName: b.technicianName || null,
        status: (b.status || "pending").toLowerCase() as Booking['status'],
        subStatus: b.subStatus || null,
        paymentStatus: (b.paymentStatus || "pending").toLowerCase() as Booking['paymentStatus'],
        paymentAmount: b.paymentAmount || 0,
        createdTime: b.createdAt ? new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just Now",
        location: b.address || (b.location?.lat ? `${b.location.lat}, ${b.location.lng}` : "Unknown Location"),
        imageUrl: b.imageUrl || null,
        coordinates: b.coordinates || { lat: 12.9716, lng: 77.5946 },
      }));

      // Calculate payments based on completed bookings
      const computedPayments: PaymentRecord[] = mappedBookings
        .filter(b => b.status === 'completed' || b.paymentStatus === 'completed')
        .map((b, index) => ({
          id: `PAY-${1000 + index}`,
          bookingId: b.id,
          customerName: b.customerName,
          serviceLabel: b.serviceLabel,
          amount: b.paymentAmount,
          status: b.paymentStatus as any,
          date: b.createdTime,
        }));

      // Calculate customer rescue counts
      const computedCustomersMap: Record<string, Customer> = {};
      initialCustomers.forEach(c => {
        computedCustomersMap[c.name] = { ...c, rescuesCount: 0 };
      });
      mappedBookings.forEach(b => {
        if (b.status === 'completed') {
          if (computedCustomersMap[b.customerName]) {
            computedCustomersMap[b.customerName].rescuesCount += 1;
          } else {
            computedCustomersMap[b.customerName] = {
              id: `CUST-${Object.keys(computedCustomersMap).length + 1}`,
              name: b.customerName,
              phone: b.customerPhone,
              membershipPlan: 'basic',
              rescuesCount: 1,
              vehicle: `${b.vehicleName} (${b.vehiclePlate})`,
            };
          }
        }
      });

      set({ 
        bookings: mappedBookings,
        payments: computedPayments.length > 0 ? computedPayments : initialPayments,
        customers: Object.values(computedCustomersMap),
      });
    } catch (error) {
      console.warn("Could not fetch bookings from DB (offline or mock):", error);
    }
  },

  addBooking: async (bookingData) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const response = await fetch(`${apiUrl}/api/bookings/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });
      if (response.ok) {
        await get().fetchBookings();
        return;
      }
    } catch (e) {
      console.warn("MongoDB API add failed, using local fallback:", e);
    }

    // Local fallback
    const newId = `ER-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBooking: Booking = {
      ...bookingData,
      id: newId,
      createdTime: 'Just Now',
    };
    
    set((state) => ({
      bookings: [newBooking, ...state.bookings],
    }));

    get().addActivity(`New booking request ${newId} created for ${bookingData.customerName} (${bookingData.serviceLabel}).`, 'dispatch');
  },

  assignTechnician: async (bookingId, technicianId) => {
    const techs = get().technicians;
    const assignedTech = techs.find(t => t.id === technicianId);
    
    if (!assignedTech) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const response = await fetch(`${apiUrl}/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          technicianId,
          technicianName: assignedTech.name,
          technicianPhone: assignedTech.phone,
          status: 'assigned',
          subStatus: 'collecting_tools',
        }),
      });
      if (response.ok) {
        await get().fetchBookings();
        // Also update technician state
        set((state) => ({
          technicians: state.technicians.map(t => 
            t.id === technicianId 
              ? { ...t, availability: 'busy', currentJob: bookingId } 
              : t
          ),
        }));
        get().addActivity(`Technician ${assignedTech.name} assigned to Booking ${bookingId}.`, 'assignment');
        return;
      }
    } catch (e) {
      console.warn("MongoDB API assign failed, using local fallback:", e);
    }

    // Local fallback
    set((state) => ({
      bookings: state.bookings.map(b => 
        b.id === bookingId 
          ? { 
              ...b, 
              technicianId, 
              technicianName: assignedTech.name, 
              status: b.status === 'emergency' ? 'emergency' : 'assigned' 
            } 
          : b
      ),
      technicians: state.technicians.map(t => 
        t.id === technicianId 
          ? { ...t, availability: 'busy', currentJob: bookingId } 
          : t
      ),
    }));

    get().addActivity(`Technician ${assignedTech.name} assigned to Booking ${bookingId}.`, 'assignment');
  },

  updateBookingStatus: async (bookingId, status, subStatus) => {
    const targetBooking = get().bookings.find(b => b.id === bookingId);
    if (!targetBooking) return;

    try {
      const updateData: any = { status };
      if (subStatus !== undefined) {
        updateData.subStatus = subStatus;
      }
      if (status === 'completed') {
        updateData.paymentStatus = 'completed';
        updateData.subStatus = null;
      }
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const response = await fetch(`${apiUrl}/api/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      
      if (response.ok) {
        await get().fetchBookings();
        // Update technician local state if completed
        if (status === 'completed' && targetBooking.technicianId) {
          set((state) => ({
            technicians: state.technicians.map(t => 
              t.id === targetBooking.technicianId 
                ? { ...t, availability: 'available', currentJob: null } 
                : t
            ),
          }));
        }
        get().addActivity(`Booking ${bookingId} status updated to ${status}.`, 'dispatch');
        return;
      }
    } catch (e) {
      console.warn("MongoDB API status update failed, using local fallback:", e);
    }

    // Local fallback
    set((state) => ({
      bookings: state.bookings.map(b => 
        b.id === bookingId 
          ? { 
              ...b, 
              status, 
              paymentStatus: status === 'completed' ? 'completed' : b.paymentStatus 
            } 
          : b
      ),
    }));

    if (status === 'completed') {
      const techId = targetBooking.technicianId;
      if (techId) {
        set((state) => ({
          technicians: state.technicians.map(t => 
            t.id === techId 
              ? { ...t, availability: 'available', currentJob: null } 
              : t
          ),
        }));
      }

      // Add to payments
      const newPayId = `PAY-${Math.floor(1000 + Math.random() * 9000)}`;
      const newPayment: PaymentRecord = {
        id: newPayId,
        bookingId,
        customerName: targetBooking.customerName,
        serviceLabel: targetBooking.serviceLabel,
        amount: targetBooking.paymentAmount,
        status: 'completed',
        date: 'Just Now',
      };

      set((state) => ({
        payments: [newPayment, ...state.payments],
      }));

      // Update customer rescuesCount
      set((state) => ({
        customers: state.customers.map(c => 
          c.name === targetBooking.customerName 
            ? { ...c, rescuesCount: c.rescuesCount + 1 } 
            : c
        ),
      }));

      get().addActivity(`Booking ${bookingId} for ${targetBooking.customerName} successfully completed. Payment of ₹${targetBooking.paymentAmount} processed.`, 'completion');
    } else {
      get().addActivity(`Booking ${bookingId} status updated to ${status}.`, 'dispatch');
    }
  },

  toggleTechnicianAvailability: (technicianId) => {
    set((state) => ({
      technicians: state.technicians.map(t => 
        t.id === technicianId 
          ? { 
              ...t, 
              availability: t.availability === 'available' ? 'offline' : 'available' 
            } 
          : t
      ),
    }));

    const tech = get().technicians.find(t => t.id === technicianId);
    if (tech) {
      get().addActivity(`Technician ${tech.name} status updated to ${tech.availability.toUpperCase()}.`, 'dispatch');
    }
  },

  addActivity: (message, type) => {
    const newActivity: RecentActivity = {
      id: `ACT-${Math.floor(100 + Math.random() * 900)}`,
      message,
      time: 'Just Now',
      type,
    };
    set((state) => ({
      recentActivities: [newActivity, ...state.recentActivities.slice(0, 19)], // Limit to last 20
    }));
  },

  triggerEmergencyDispatch: async (serviceType, location, customerName) => {
    const serviceLabels = {
      towing: 'Accident Flatbed Towing',
      battery: 'Emergency Battery Assistance',
      ev: 'Rapid Mobile EV Charging',
      lockout: 'Emergency Lockout Assistance',
    };

    const newBookingData = {
      customerName,
      phone: '+91 9' + Math.floor(100000000 + Math.random() * 900000000),
      serviceType,
      serviceLabel: serviceLabels[serviceType],
      vehicleName: 'BMW X5 (Emergency)',
      vehiclePlate: 'KA-03-EM-9111',
      technicianId: null,
      technicianName: null,
      status: 'emergency',
      paymentStatus: 'pending',
      paymentAmount: serviceType === 'towing' ? 6000 : 2500,
      location: { lat: 12.9716, lng: 77.5946 },
      address: location,
    };

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const response = await fetch(`${apiUrl}/api/bookings/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBookingData),
      });
      if (response.ok) {
        await get().fetchBookings();
        set({ activeAlertMessage: `⚠️ DISPATCH ALERT: Emergency ${serviceLabels[serviceType]} requested at ${location}!` });
        get().addActivity(`🚨 EMERGENCY DISPATCH ACTIVATED: ${customerName} stranded at ${location}!`, 'alert');
        return;
      }
    } catch (e) {
      console.warn("MongoDB API emergency dispatch failed, using local fallback:", e);
    }

    // Local fallback
    const newId = `ER-${Math.floor(1000 + Math.random() * 9000)}`;
    const newBooking: Booking = {
      id: newId,
      customerName,
      customerPhone: newBookingData.phone,
      serviceType,
      serviceLabel: newBookingData.serviceLabel,
      vehicleName: newBookingData.vehicleName,
      vehiclePlate: newBookingData.vehiclePlate,
      technicianId: null,
      technicianName: null,
      status: 'emergency',
      paymentStatus: 'pending',
      paymentAmount: newBookingData.paymentAmount,
      createdTime: 'Just Now',
      location,
    };

    set((state) => ({
      bookings: [newBooking, ...state.bookings],
      activeAlertMessage: `⚠️ DISPATCH ALERT: Emergency ${serviceLabels[serviceType]} requested at ${location}!`,
    }));

    get().addActivity(`🚨 EMERGENCY DISPATCH ACTIVATED: ${customerName} stranded at ${location}!`, 'alert');
  },

  clearAlert: () => {
    set({ activeAlertMessage: null });
  },

  resolveTicket: (ticketId) => {
    set((state) => ({
      supportTickets: state.supportTickets.map(t => 
        t.id === ticketId ? { ...t, status: 'resolved' } : t
      ),
    }));
    const ticket = get().supportTickets.find(t => t.id === ticketId);
    if (ticket) {
      get().addActivity(`Support Ticket ${ticketId} for ${ticket.customerName} marked as RESOLVED.`, 'completion');
    }
  },

  addSupportTicket: (ticketData) => {
    const newId = `TKT-${Math.floor(100 + Math.random() * 900)}`;
    const newTicket: SupportTicket = {
      ...ticketData,
      id: newId,
      status: 'open',
      createdTime: 'Just Now',
    };
    set((state) => ({
      supportTickets: [newTicket, ...state.supportTickets],
    }));
    get().addActivity(`New Support Ticket ${newId} created for ${ticketData.customerName}.`, 'dispatch');
  }
}));
