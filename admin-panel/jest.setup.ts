// @ts-nocheck
import '@testing-library/jest-dom';

// Mock global fetch globally for Jest test suite
global.fetch = jest.fn().mockImplementation(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true, products: [], bookings: [], technicians: [] }),
  })
);
