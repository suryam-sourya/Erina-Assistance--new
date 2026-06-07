/**
 * @jest-environment node
 */

import { POST } from '../route';
import { connectDB } from '@/lib/mongodb';
import Inquiry from '@/models/Inquiry';

// Mock the database helper
jest.mock('@/lib/mongodb', () => ({
  connectDB: jest.fn().mockResolvedValue(null),
}));

// Mock the Inquiry model
jest.mock('@/models/Inquiry', () => ({
  __esModule: true,
  default: {
    create: jest.fn(),
  },
}));

describe('POST /api/membership/inquiry API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully create an inquiry with valid body parameters', async () => {
    const mockRequestData = {
      name: 'John Doe',
      phone: '9988776655',
      email: 'john@doe.com',
      plan: 'Premium',
      vehicleDetails: 'Hyundai i20',
      message: 'Need standard response time',
    };

    const mockCreatedInquiry = {
      _id: { toString: () => 'mock-inquiry-id' },
      ...mockRequestData,
    };

    (Inquiry.create as jest.Mock).mockResolvedValue(mockCreatedInquiry);

    const req = new Request('http://localhost/api/membership/inquiry', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mockRequestData),
    });

    const response = await POST(req);
    const json = await response.json();

    expect(connectDB).toHaveBeenCalled();
    expect(Inquiry.create).toHaveBeenCalledWith({
      name: 'John Doe',
      phone: '9988776655',
      email: 'john@doe.com',
      plan: 'Premium',
      vehicleDetails: 'Hyundai i20',
      message: 'Need standard response time',
    });
    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.inquiry.id).toBe('mock-inquiry-id');
  });

  it('should return 400 if required fields are missing', async () => {
    const mockRequestData = {
      name: 'John Doe',
      phone: '9988776655',
      // email is missing
      plan: 'Premium',
    };

    const req = new Request('http://localhost/api/membership/inquiry', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mockRequestData),
    });

    const response = await POST(req);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error).toContain('Please fill in all required fields');
  });

  it('should return 400 if email is invalid', async () => {
    const mockRequestData = {
      name: 'John Doe',
      phone: '9988776655',
      email: 'not-an-email',
      plan: 'Premium',
    };

    const req = new Request('http://localhost/api/membership/inquiry', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mockRequestData),
    });

    const response = await POST(req);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error).toContain('valid email address');
  });
});
