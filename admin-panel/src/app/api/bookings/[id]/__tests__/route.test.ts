/**
 * @jest-environment node
 */

import { PUT } from '../route';
import { connectDB } from '@/lib/mongodb';
import Booking from '@/models/Booking';

// Mock the database connection
jest.mock('@/lib/mongodb', () => ({
  connectDB: jest.fn().mockResolvedValue(null),
}));

// Mock the Booking model directly to prevent loading real mongoose/bson
jest.mock('@/models/Booking', () => ({
  __esModule: true,
  default: {
    findByIdAndUpdate: jest.fn(),
  },
}));

describe('PUT /api/bookings/[id] API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully update a booking', async () => {
    const mockId = 'mock-booking-id';
    const updateBody = {
      status: 'assigned',
      technicianId: 'TECH-01',
      technicianName: 'Amit Singh',
    };

    const mockUpdatedBooking = {
      toObject: () => ({
        _id: { toString: () => mockId },
        customerName: 'Sneha Reddy',
        phone: '+91 98450 54321',
        serviceType: 'towing',
        status: 'assigned',
        technicianId: 'TECH-01',
        technicianName: 'Amit Singh',
        createdAt: new Date(),
      }),
    };

    (Booking.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUpdatedBooking);

    const req = new Request(`http://localhost/api/bookings/${mockId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateBody),
    });

    const params = Promise.resolve({ id: mockId });
    const response = await PUT(req, { params });
    const json = await response.json();

    expect(connectDB).toHaveBeenCalledTimes(1);
    expect(Booking.findByIdAndUpdate).toHaveBeenCalledWith(
      mockId,
      updateBody,
      { new: true }
    );

    expect(response.status).toBe(200);
    expect(json.id).toBe(mockId);
    expect(json.status).toBe('assigned');
    expect(json.technicianId).toBe('TECH-01');
  });

  it('should return a 404 if booking is not found', async () => {
    const mockId = 'nonexistent-id';
    (Booking.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);

    const req = new Request(`http://localhost/api/bookings/${mockId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'completed' }),
    });

    const params = Promise.resolve({ id: mockId });
    const response = await PUT(req, { params });
    const json = await response.json();

    expect(response.status).toBe(404);
    expect(json.success).toBe(false);
    expect(json.error).toBe('Booking not found');
  });

  it('should handle database errors and return a 500 status', async () => {
    const mockId = 'mock-id';
    const mockError = new Error('Database connection reset');
    (Booking.findByIdAndUpdate as jest.Mock).mockRejectedValue(mockError);

    const req = new Request(`http://localhost/api/bookings/${mockId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: 'completed' }),
    });

    const params = Promise.resolve({ id: mockId });
    const response = await PUT(req, { params });
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.success).toBe(false);
    expect(json.error).toBe('Database connection reset');
  });
});
