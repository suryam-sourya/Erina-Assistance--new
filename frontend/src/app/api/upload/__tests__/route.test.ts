/**
 * @jest-environment node
 */

import { POST } from '../route';
import { v2 as cloudinary } from 'cloudinary';

// Mock Cloudinary v2 SDK
jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload_stream: jest.fn(),
    },
  },
}));

describe('POST /api/upload API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully upload a file using buffer streaming', async () => {
    const mockSecureUrl = 'https://res.cloudinary.com/dtnyczk0u/image/upload/v12345/erina-rsa/mock-vehicle.jpg';

    // Mock the upload_stream implementation to simulate success callback
    (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation((options, callback) => {
      // Trigger callback with (error, result) asynchronously when end() is called
      return {
        end: jest.fn().mockImplementation(() => {
          callback(null, { secure_url: mockSecureUrl });
        }),
      };
    });

    // Create a mock File object
    const file = new File(['dummy-content'], 'vehicle.jpg', { type: 'image/jpeg' });

    // Construct FormData request payload
    const formData = new FormData();
    formData.append('file', file);

    const req = new Request('http://localhost/api/upload', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(req);
    const json = await response.json();

    expect(cloudinary.uploader.upload_stream).toHaveBeenCalledWith(
      { folder: 'erina-rsa' },
      expect.any(Function)
    );

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.url).toBe(mockSecureUrl);
  });

  it('should return 400 if no file is provided', async () => {
    const formData = new FormData(); // Empty form data

    const req = new Request('http://localhost/api/upload', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(req);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error).toBe('No file provided');
  });

  it('should handle Cloudinary upload errors and return 500 status', async () => {
    // Mock upload_stream to return an error callback
    (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation((options, callback) => {
      return {
        end: jest.fn().mockImplementation(() => {
          callback(new Error('Cloudinary credentials rejected'), null);
        }),
      };
    });

    const file = new File(['dummy-content'], 'vehicle.jpg', { type: 'image/jpeg' });
    const formData = new FormData();
    formData.append('file', file);

    const req = new Request('http://localhost/api/upload', {
      method: 'POST',
      body: formData,
    });

    const response = await POST(req);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.success).toBe(false);
    expect(json.error).toBe('Cloudinary credentials rejected');
  });
});
