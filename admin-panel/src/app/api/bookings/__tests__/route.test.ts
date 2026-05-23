/**
 * @jest-environment node
 */

import { GET } from '../route';
import { connectDB } from '@/backend/lib/mongodb';
import Booking from '@/backend/models/Booking';

// Mock the database connection
jest.mock('@/backend/lib/mongodb', () => ({
  connectDB: jest.fn().mockResolvedValue(null),
}));

// Setup query mock for chained .find().sort()
const mockSort = jest.fn();
jest.mock('@/backend/models/Booking', () => ({
  __esModule: true,
  default: {
    find: jest.fn().mockImplementation(() => ({
      sort: mockSort,
    })),
  },
}));

describe('GET /api/bookings API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully fetch, sort, and normalize bookings', async () => {
    const mockDbBookings = [
      {
        toObject: () => ({
          _id: { toString: () => 'mock-id-1' },
          customerName: 'Arjun Krishnan',
          phone: '+91 98450 12345',
          serviceType: 'battery',
          status: 'pending',
          createdAt: new Date('2026-05-23T10:00:00Z'),
        }),
      },
      {
        toObject: () => ({
          _id: { toString: () => 'mock-id-2' },
          customerName: 'Sneha Reddy',
          phone: '+91 98450 54321',
          serviceType: 'towing',
          status: 'assigned',
          createdAt: new Date('2026-05-23T09:30:00Z'),
        }),
      },
    ];

    mockSort.mockResolvedValue(mockDbBookings);

    const response = await GET();
    const json = await response.json();

    expect(connectDB).toHaveBeenCalledTimes(1);
    expect(Booking.find).toHaveBeenCalledTimes(1);
    expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });

    expect(response.status).toBe(200);
    expect(json).toHaveLength(2);
    expect(json[0].id).toBe('mock-id-1');
    expect(json[1].id).toBe('mock-id-2');
    expect(json[0].customerName).toBe('Arjun Krishnan');
  });

  it('should handle errors and return a 500 status', async () => {
    const mockError = new Error('Database query timed out');
    mockSort.mockRejectedValue(mockError);

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.success).toBe(false);
    expect(json.error).toBe('Database query timed out');
  });
});
