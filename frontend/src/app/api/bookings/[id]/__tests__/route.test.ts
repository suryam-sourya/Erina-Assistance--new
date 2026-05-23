/**
 * @jest-environment node
 */

import { GET } from '../route';
import { connectDB } from '@/lib/mongodb';
import Booking from '@/models/Booking';

// Mock the database helper
jest.mock('@/lib/mongodb', () => ({
  connectDB: jest.fn().mockResolvedValue(null),
}));

// Mock the Booking model directly to prevent loading real mongoose/bson
jest.mock('@/models/Booking', () => ({
  __esModule: true,
  default: {
    findById: jest.fn(),
  },
}));

describe('GET /api/bookings/[id] API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully fetch and return a single booking', async () => {
    const mockId = 'mock-booking-id';
    const mockBooking = {
      toObject: () => ({
        _id: { toString: () => mockId },
        customerName: 'John Doe',
        phone: '+91 98765 43210',
        serviceType: 'towing',
        status: 'pending',
      }),
    };

    (Booking.findById as jest.Mock).mockResolvedValue(mockBooking);

    const req = new Request(`http://localhost/api/bookings/${mockId}`, {
      method: 'GET',
    });

    const params = Promise.resolve({ id: mockId });
    const response = await GET(req, { params });
    const json = await response.json();

    expect(connectDB).toHaveBeenCalledTimes(1);
    expect(Booking.findById).toHaveBeenCalledWith(mockId);

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.booking.id).toBe(mockId);
    expect(json.booking.customerName).toBe('John Doe');
  });

  it('should return 404 if booking is not found', async () => {
    const mockId = 'nonexistent-id';
    (Booking.findById as jest.Mock).mockResolvedValue(null);

    const req = new Request(`http://localhost/api/bookings/${mockId}`, {
      method: 'GET',
    });

    const params = Promise.resolve({ id: mockId });
    const response = await GET(req, { params });
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.success).toBe(false);
    expect(json.error).toBe('Booking not found');
  });

  it('should handle database errors and return 500 status', async () => {
    const mockId = 'mock-id';
    const mockError = new Error('Connection refused');
    (Booking.findById as jest.Mock).mockRejectedValue(mockError);

    const req = new Request(`http://localhost/api/bookings/${mockId}`, {
      method: 'GET',
    });

    const params = Promise.resolve({ id: mockId });
    const response = await GET(req, { params });
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.success).toBe(false);
    expect(json.error).toBe('Connection refused');
  });
});
