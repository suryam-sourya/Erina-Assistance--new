import { create } from 'zustand';

export interface Booking {
  id: string;
  customerName: string;
  customerPhone: string;
  serviceType: 'towing' | 'battery' | 'ev' | 'lockout';
  serviceLabel: string;
  vehicleName: string;
  vehiclePlate: string;
  technicianId: string | null;
  technicianName: string | null;
  status: 'pending' | 'assigned' | 'in-progress' | 'completed' | 'emergency';
  paymentStatus: 'completed' | 'pending' | 'failed';
  paymentAmount: number;
  createdTime: string;
  location: string;
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
  addBooking: (booking: Omit<Booking, 'id' | 'createdTime'>) => void;
  assignTechnician: (bookingId: string, technicianId: string) => void;
  updateBookingStatus: (bookingId: string, status: Booking['status']) => void;
  toggleTechnicianAvailability: (technicianId: string) => void;
  addActivity: (message: string, type: RecentActivity['type']) => void;
  triggerEmergencyDispatch: (serviceType: Booking['serviceType'], location: string, customerName: string) => void;
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

  addBooking: (bookingData) => {
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

  assignTechnician: (bookingId, technicianId) => {
    const techs = get().technicians;
    const assignedTech = techs.find(t => t.id === technicianId);
    
    if (!assignedTech) return;

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

  updateBookingStatus: (bookingId, status) => {
    const targetBooking = get().bookings.find(b => b.id === bookingId);
    if (!targetBooking) return;

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

  triggerEmergencyDispatch: (serviceType, location, customerName) => {
    const newId = `ER-${Math.floor(1000 + Math.random() * 9000)}`;
    const serviceLabels = {
      towing: 'Accident Flatbed Towing',
      battery: 'Emergency Battery Assistance',
      ev: 'Rapid Mobile EV Charging',
      lockout: 'Emergency Lockout Assistance',
    };
    
    const newBooking: Booking = {
      id: newId,
      customerName,
      customerPhone: '+91 9' + Math.floor(100000000 + Math.random() * 900000000),
      serviceType,
      serviceLabel: serviceLabels[serviceType],
      vehicleName: 'BMW X5 (Emergency)',
      vehiclePlate: 'KA-03-EM-9111',
      technicianId: null,
      technicianName: null,
      status: 'emergency',
      paymentStatus: 'pending',
      paymentAmount: serviceType === 'towing' ? 6000 : 2500,
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
