// Mock mongoose before importing the Booking model
jest.mock('mongoose', () => {
  const paths = {
    userId: {},
    customerName: {},
    phone: {},
    serviceType: {},
    serviceLabel: {},
    vehicleType: {},
    vehicleName: {},
    vehicleNumber: {},
    vehiclePlate: {},
    status: { default: () => 'pending' },
    technicianId: { default: () => null },
    technicianName: { default: () => null },
    'location.lat': {},
    'location.lng': {},
    address: {},
    paymentStatus: { default: () => 'pending' },
    paymentAmount: { default: () => 0 },
    imageUrl: {},
  };

  const schemaMock = {
    paths,
    index: jest.fn(),
  };

  const SchemaConstructor = jest.fn().mockImplementation(() => schemaMock);

  return {
    __esModule: true,
    default: {
      Schema: SchemaConstructor,
      model: jest.fn().mockImplementation((name, schema) => schemaMock),
      models: {},
    },
  };
});

import Booking from '../Booking';

describe('Booking Model Schema', () => {
  it('should have all the required schema fields and paths', () => {
    const paths = Booking.paths;

    expect(paths.userId).toBeDefined();
    expect(paths.customerName).toBeDefined();
    expect(paths.phone).toBeDefined();
    expect(paths.serviceType).toBeDefined();
    expect(paths.serviceLabel).toBeDefined();
    expect(paths.vehicleType).toBeDefined();
    expect(paths.vehicleName).toBeDefined();
    expect(paths.vehicleNumber).toBeDefined();
    expect(paths.vehiclePlate).toBeDefined();
    expect(paths.status).toBeDefined();
    expect(paths.technicianId).toBeDefined();
    expect(paths.technicianName).toBeDefined();
    expect(paths['location.lat']).toBeDefined();
    expect(paths['location.lng']).toBeDefined();
    expect(paths.address).toBeDefined();
    expect(paths.paymentStatus).toBeDefined();
    expect(paths.paymentAmount).toBeDefined();
    expect(paths.imageUrl).toBeDefined();
  });

  it('should have correct default values', () => {
    const paths = Booking.paths;

    // Check defaults
    expect(paths.status.default()).toBe('pending');
    expect(paths.technicianId.default()).toBeNull();
    expect(paths.technicianName.default()).toBeNull();
    expect(paths.paymentStatus.default()).toBe('pending');
    expect(paths.paymentAmount.default()).toBe(0);
  });
});
