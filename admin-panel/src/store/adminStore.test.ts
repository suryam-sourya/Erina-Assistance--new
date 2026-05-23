import { useAdminStore } from '@/store/adminStore';

describe('Admin Store', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    const { setState } = useAdminStore.getState();
    // Reinitialize using the original initial data by re-creating store (simple approach: reload module)
    jest.resetModules();
    const { useAdminStore: freshStore } = require('@/store/adminStore');
    // Replace the exported store with fresh one
    Object.assign(useAdminStore, freshStore);
  });

  test('initial stats are calculated correctly', () => {
    const stats = useAdminStore.getState().getStats();
    expect(stats.totalRequests).toBeGreaterThan(0);
    expect(stats.pendingRequests).toBeGreaterThanOrEqual(0);
    expect(stats.availableTechnicians).toBeGreaterThanOrEqual(0);
    expect(stats.revenueToday).toBeGreaterThanOrEqual(0);
  });

  test('addBooking adds a new booking', () => {
    const initialCount = useAdminStore.getState().bookings.length;
    useAdminStore.getState().addBooking({
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

  test('assignTechnician updates booking and technician', () => {
    // pick an existing pending booking without technician
    const pending = useAdminStore
      .getState()
      .bookings.find((b) => b.technicianId === null && b.status === 'pending');
    const tech = useAdminStore.getState().technicians.find((t) => t.availability === 'available');
    if (!pending || !tech) {
      return; // nothing to test if data not available
    }
    useAdminStore.getState().assignTechnician(pending.id, tech.id);
    const updatedBooking = useAdminStore.getState().bookings.find((b) => b.id === pending.id)!;
    const updatedTech = useAdminStore.getState().technicians.find((t) => t.id === tech.id)!;
    expect(updatedBooking.technicianId).toBe(tech.id);
    expect(updatedBooking.status).toBe('assigned');
    expect(updatedTech.availability).toBe('busy');
    expect(updatedTech.currentJob).toBe(pending.id);
  });

  test('updateBookingStatus to completed triggers payment and activity', () => {
    const booking = useAdminStore.getState().bookings.find((b) => b.status !== 'completed');
    if (!booking) return;
    useAdminStore.getState().updateBookingStatus(booking.id, 'completed');
    const updated = useAdminStore.getState().bookings.find((b) => b.id === booking.id)!;
    expect(updated.status).toBe('completed');
    expect(updated.paymentStatus).toBe('completed');
    // Payment should be added
    const payment = useAdminStore
      .getState()
      .payments.find((p) => p.bookingId === booking.id);
    expect(payment).toBeDefined();
  });

  test('toggleTechnicianAvailability flips state', () => {
    const tech = useAdminStore.getState().technicians[0];
    const original = tech.availability;
    useAdminStore.getState().toggleTechnicianAvailability(tech.id);
    const updated = useAdminStore.getState().technicians.find((t) => t.id === tech.id)!;
    const expected = original === 'available' ? 'offline' : 'available';
    expect(updated.availability).toBe(expected);
  });
});
