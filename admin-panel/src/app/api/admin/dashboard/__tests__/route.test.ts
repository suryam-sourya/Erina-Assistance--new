/**
 * @jest-environment node
 */

import { GET } from '../route';
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
    countDocuments: jest.fn(),
    aggregate: jest.fn(),
  },
}));

describe('GET /api/admin/dashboard API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully compute and return dashboard stats', async () => {
    // Setup countDocuments mocks for different calls
    (Booking.countDocuments as jest.Mock).mockImplementation((query) => {
      if (!query) {
        return Promise.resolve(100); // totalRequests
      }
      if (query.status && query.status.$in) {
        if (query.status.$in.includes('pending')) {
          return Promise.resolve(45); // pending + emergency
        }
        if (query.status.$in.includes('emergency')) {
          return Promise.resolve(15); // activeEmergencies
        }
      }
      return Promise.resolve(0);
    });

    // Setup aggregate mock for revenue
    (Booking.aggregate as jest.Mock).mockResolvedValue([{ total: 55000 }]);

    const response = await GET();
    const json = await response.json();

    expect(connectDB).toHaveBeenCalledTimes(1);
    expect(Booking.countDocuments).toHaveBeenCalledTimes(3);
    expect(Booking.aggregate).toHaveBeenCalledTimes(1);

    expect(response.status).toBe(200);
    expect(json.totalBookings).toBe(100);
    expect(json.totalRequests).toBe(100);
    expect(json.activeEmergencies).toBe(15);
    expect(json.pendingRequests).toBe(45);
    expect(json.activeBookings).toBe(45);
    expect(json.revenueToday).toBe(55000);
    expect(json.availableTechnicians).toBe(3);
  });

  it('should handle database aggregate or query errors gracefully', async () => {
    const mockError = new Error('Aggregation pipeline failure');
    (Booking.countDocuments as jest.Mock).mockResolvedValue(10);
    (Booking.aggregate as jest.Mock).mockRejectedValue(mockError);

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.success).toBe(false);
    expect(json.error).toBe('Aggregation pipeline failure');
  });
});
