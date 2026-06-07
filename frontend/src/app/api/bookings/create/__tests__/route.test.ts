/**
 * @jest-environment node
 */

import { POST } from '../route';
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
    create: jest.fn(),
  },
}));

describe('POST /api/bookings/create API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully create a booking with mapped fields', async () => {
    const mockRequestData = {
      customerName: 'John Doe',
      phone: '+91 98765 43210',
      serviceType: 'towing',
      vehicleType: 'SUV / MUV',
      vehicleNumber: 'KA-01-AB-1234',
    };

    const mockCreatedBooking = {
      _id: 'mock-id-123',
      ...mockRequestData,
      serviceLabel: 'Flatbed Towing',
      vehicleName: 'SUV / MUV',
      vehiclePlate: 'KA-01-AB-1234',
      status: 'pending',
    };

    // Setup mock return value
    (Booking.create as jest.Mock).mockResolvedValue(mockCreatedBooking);

    // Create a mock Request object
    const req = new Request('http://localhost/api/bookings/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mockRequestData),
    });

    const response = await POST(req);
    const json = await response.json();

    // Verify DB connection was established
    expect(connectDB).toHaveBeenCalledTimes(1);

    // Verify Booking.create was called with mapped fields
    expect(Booking.create).toHaveBeenCalledWith(expect.objectContaining({
      customerName: 'John Doe',
      phone: '+91 98765 43210',
      serviceType: 'TOWING',
      vehicleType: 'SUV / MUV',
      vehicleName: 'SUV / MUV',
      vehicleNumber: 'KA01AB1234',
      vehiclePlate: 'KA01AB1234',
      status: 'PENDING',
      customer: {
        name: 'John Doe',
        phone: '+91 98765 43210',
      },
      vehicle: {
        type: 'SUV',
        plateNumber: 'KA01AB1234',
      }
    }));

    // Verify response
    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.booking).toEqual(mockCreatedBooking);
  });

  it('should handle emergency status mapping and fallback labels', async () => {
    const mockRequestData = {
      customerName: 'Jane Smith',
      phone: '+91 99999 88888',
      serviceType: 'battery',
      vehicleType: 'Two-Wheeler',
      vehiclePlate: 'KA-02-CD-5678',
      status: 'EMERGENCY',
    };

    const mockCreatedBooking = {
      _id: 'mock-id-456',
      ...mockRequestData,
      status: 'emergency',
    };

    (Booking.create as jest.Mock).mockResolvedValue(mockCreatedBooking);

    const req = new Request('http://localhost/api/bookings/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mockRequestData),
    });

    const response = await POST(req);
    const json = await response.json();

    expect(Booking.create).toHaveBeenCalledWith(expect.objectContaining({
      customerName: 'Jane Smith',
      phone: '+91 99999 88888',
      serviceType: 'BATTERY',
      vehicleType: 'Two-Wheeler',
      vehicleName: 'Two-Wheeler',
      vehicleNumber: 'KA02CD5678',
      vehiclePlate: 'KA02CD5678',
      status: 'EMERGENCY',
      customer: {
        name: 'Jane Smith',
        phone: '+91 99999 88888',
      },
      vehicle: {
        type: 'TWO_WHEELER',
        plateNumber: 'KA02CD5678',
      }
    }));

    expect(json.success).toBe(true);
  });

  it('should handle database errors gracefully', async () => {
    const mockError = new Error('Database connection failed');
    (Booking.create as jest.Mock).mockRejectedValue(mockError);

    const req = new Request('http://localhost/api/bookings/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customerName: 'Jane Smith',
        phone: '+91 99999 88888',
        serviceType: 'battery',
        vehicleType: 'Two-Wheeler',
        vehicleNumber: 'KA-02-CD-5678',
      }),
    });

    const response = await POST(req);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.success).toBe(false);
    expect(json.error).toBe('Database connection failed');
  });
});
