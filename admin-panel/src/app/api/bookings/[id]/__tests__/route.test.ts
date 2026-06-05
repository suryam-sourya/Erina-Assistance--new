/**
 * @jest-environment node
 */

import { PUT } from '../route';
import { connectDB } from '@/backend/lib/mongodb';
import Booking from '@/backend/models/Booking';

// Mock the database connection
jest.mock('@/backend/lib/mongodb', () => ({
  connectDB: jest.fn().mockResolvedValue(null),
}));

// Mock the Booking model directly to prevent loading real mongoose/bson
jest.mock('@/backend/models/Booking', () => ({
  __esModule: true,
  default: {
    findById: jest.fn(),
    findOne: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findOneAndUpdate: jest.fn(),
  },
}));

describe('PUT /api/bookings/[id] API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully update a booking', async () => {
    const mockId = '507f1f77bcf86cd799439011';
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

    (Booking.findById as jest.Mock).mockResolvedValue(mockUpdatedBooking);
    (Booking.findOne as jest.Mock).mockResolvedValue(mockUpdatedBooking);
    (Booking.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUpdatedBooking);
    (Booking.findOneAndUpdate as jest.Mock).mockResolvedValue(mockUpdatedBooking);

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
      expect.objectContaining({
        status: 'ASSIGNED',
        technicianId: 'TECH-01',
        technicianName: 'Amit Singh',
      }),
      { new: true }
    );

    expect(response.status).toBe(200);
    expect(json.id).toBe(mockId);
    expect(json.status).toBe('assigned');
    expect(json.technicianId).toBe('TECH-01');
  });

  it('should return a 404 if booking is not found', async () => {
    const mockId = '507f1f77bcf86cd799439011';
    (Booking.findById as jest.Mock).mockResolvedValue(null);
    (Booking.findOne as jest.Mock).mockResolvedValue(null);
    (Booking.findByIdAndUpdate as jest.Mock).mockResolvedValue(null);
    (Booking.findOneAndUpdate as jest.Mock).mockResolvedValue(null);

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
    const mockId = '507f1f77bcf86cd799439011';
    const mockError = new Error('Database connection reset');
    (Booking.findById as jest.Mock).mockRejectedValue(mockError);
    (Booking.findOne as jest.Mock).mockRejectedValue(mockError);
    (Booking.findByIdAndUpdate as jest.Mock).mockRejectedValue(mockError);
    (Booking.findOneAndUpdate as jest.Mock).mockRejectedValue(mockError);

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
