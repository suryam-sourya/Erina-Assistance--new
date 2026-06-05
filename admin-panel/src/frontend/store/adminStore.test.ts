import { useAdminStore } from '@/frontend/store/adminStore';

describe('Admin Store', () => {
  beforeEach(() => {
    // Mock fetch to reject so that tests always run the offline local fallback flow
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error (test fallback simulator)'));

    // Seed some test data directly into the store state to make tests self-contained
    useAdminStore.setState({
      bookings: [
        {
          id: 'ER-4892',
          customerName: 'Arjun Krishnan',
          customerPhone: '+91 98450 12345',
          serviceType: 'battery',
          serviceLabel: 'Battery Jumpstart',
          vehicleName: 'Tata Nexon EV',
          vehiclePlate: 'KA-03-MY-7890',
          technicianId: null,
          technicianName: null,
          status: 'pending',
          paymentStatus: 'pending',
          paymentAmount: 1800,
          location: 'Nandi Hills Road, Bangalore',
        },
      ],
      technicians: [
        {
          id: 'TECH-01',
          name: 'Amit Singh',
          phone: '+91 98888 11111',
          availability: 'available',
          currentJob: null,
          rating: 4.8,
          serviceArea: 'Electronic City / NICE Road',
          vehicleType: 'Flatbed Tow Truck',
        }
      ],
      payments: [],
      supportTickets: [],
      recentActivities: [],
    });
  });

  test('initial stats are calculated correctly', () => {
    const stats = useAdminStore.getState().getStats();
    expect(stats.totalRequests).toBeGreaterThan(0);
    expect(stats.pendingRequests).toBeGreaterThanOrEqual(0);
    expect(stats.availableTechnicians).toBeGreaterThanOrEqual(0);
    expect(stats.revenueToday).toBeGreaterThanOrEqual(0);
  });

  test('addBooking adds a new booking', async () => {
    const initialCount = useAdminStore.getState().bookings.length;
    await useAdminStore.getState().addBooking({
      customerName: 'Test User',
      customerPhone: '+91 1111111111',
      serviceType: 'towing',
      serviceLabel: 'Test Towing',
      vehicleName: 'Test Car',
      vehiclePlate: 'KA-00-TEST',
      technicianId: null,
      technicianName: null,
      status: 'pending',
      paymentStatus: 'pending',
      paymentAmount: 1000,
      location: 'Test Location',
    });
    const newCount = useAdminStore.getState().bookings.length;
    expect(newCount).toBe(initialCount + 1);
    const newBooking = useAdminStore.getState().bookings[0];
    expect(newBooking.customerName).toBe('Test User');
  });

  test('assignTechnician updates booking and technician', async () => {
    // pick an existing pending booking without technician
    const pending = useAdminStore
      .getState()
      .bookings.find((b) => b.technicianId === null && b.status === 'pending');
    const tech = useAdminStore.getState().technicians.find((t) => t.availability === 'available');
    expect(pending).toBeDefined();
    expect(tech).toBeDefined();
    if (!pending || !tech) return;

    await useAdminStore.getState().assignTechnician(pending.id, tech.id);
    const updatedBooking = useAdminStore.getState().bookings.find((b) => b.id === pending.id)!;
    const updatedTech = useAdminStore.getState().technicians.find((t) => t.id === tech.id)!;
    expect(updatedBooking.technicianId).toBe(tech.id);
    expect(updatedBooking.status).toBe('assigned');
    expect(updatedTech.availability).toBe('busy');
    expect(updatedTech.currentJob).toBe(pending.id);
  });

  test('updateBookingStatus to completed triggers payment and activity', async () => {
    const booking = useAdminStore.getState().bookings.find((b) => b.status !== 'completed');
    expect(booking).toBeDefined();
    if (!booking) return;

    await useAdminStore.getState().updateBookingStatus(booking.id, 'completed');
    const updated = useAdminStore.getState().bookings.find((b) => b.id === booking.id)!;
    expect(updated.status).toBe('completed');
    expect(updated.paymentStatus).toBe('completed');
    // Payment should be added
    const payment = useAdminStore
      .getState()
      .payments.find((p) => p.bookingId === booking.id);
    expect(payment).toBeDefined();
  });

  test('toggleTechnicianAvailability flips state', async () => {
    const tech = useAdminStore.getState().technicians[0];
    expect(tech).toBeDefined();
    if (!tech) return;

    const original = tech.availability;
    await useAdminStore.getState().toggleTechnicianAvailability(tech.id);
    const updated = useAdminStore.getState().technicians.find((t) => t.id === tech.id)!;
    const expected = original === 'available' ? 'offline' : 'available';
    expect(updated.availability).toBe(expected);
  });
});
