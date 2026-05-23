/**
 * @jest-environment node
 */

import { GET } from "../route";
import Testimonial from "@/models/Testimonial";

jest.mock("@/lib/mongodb", () => ({
  connectDB: jest.fn().mockResolvedValue(true),
}));

jest.mock("@/models/Testimonial", () => {
  const mockStories = [
    {
      toObject: () => ({
        _id: "test-id-1",
        name: "John Doe",
        role: "Developer",
        location: "MG Road, Bangalore",
        serviceType: "battery",
        serviceLabel: "Battery Jumpstart",
        eta: "20 Mins ETA",
        technician: "Ramesh Kumar",
        rating: 5,
        storyTitle: "Awesome Service",
        quote: "Highly recommended!",
        avatarColor: "from-orange-500 to-red-500",
        initials: "JD",
      }),
    },
  ];

  return {
    __esModule: true,
    default: {
      find: jest.fn(() => ({
        sort: jest.fn().mockResolvedValue(mockStories),
      })),
      insertMany: jest.fn().mockResolvedValue(true),
    },
  };
});

describe("GET /api/testimonials API Route", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should successfully return seeded or database testimonials", async () => {
    const res = await GET();
    const data = await res.json();
    
    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.testimonials).toHaveLength(1);
    expect(data.testimonials[0].name).toBe("John Doe");
    expect(data.testimonials[0].id).toBe("test-id-1");
  });
});
