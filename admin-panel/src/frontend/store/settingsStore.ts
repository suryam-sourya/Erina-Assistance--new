import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ────────────────────────────────────────────────────
// Pricing configuration types
// ────────────────────────────────────────────────────

export interface ServicePricing {
  towing: number;       // Flatbed Towing
  battery: number;      // Battery Jump / Replacement
  flatTyre: number;     // Flat Tyre Change
  fuel: number;         // Fuel Delivery
  lockout: number;      // Lockout Assistance
  engine: number;       // Engine Failure
  accident: number;     // Accident Recovery
  other: number;        // Other / General
}

export interface VehicleMultipliers {
  hatchback: number;    // Car (Hatchback/Sedan)
  suv: number;          // SUV / MUV
  luxury: number;       // Luxury Vehicle
  twoWheeler: number;   // Two-Wheeler
  commercial: number;   // Commercial Vehicle
  ev: number;           // Electric Vehicle (EV)
}

export interface PricingConfig {
  serviceBaseFees: ServicePricing;       // ₹ flat base fee per service type
  ratePerKm: number;                     // ₹ per km after base fee
  vehicleMultipliers: VehicleMultipliers; // multiplier applied to total
  nightSurcharge: number;                // multiplier: 10 PM – 6 AM (e.g. 1.5)
  peakHourSurcharge: number;             // multiplier: 8–10 AM, 5–8 PM (e.g. 1.25)
  emergencySurcharge: number;            // multiplier for priority bookings (e.g. 1.75)
}

// ────────────────────────────────────────────────────
// Default pricing values
// ────────────────────────────────────────────────────

export const DEFAULT_PRICING: PricingConfig = {
  serviceBaseFees: {
    towing:   1800,
    battery:   900,
    flatTyre:  700,
    fuel:      600,
    lockout:   800,
    engine:   2000,
    accident: 2500,
    other:     750,
  },
  ratePerKm: 120,
  vehicleMultipliers: {
    hatchback:  1.0,
    suv:        1.3,
    luxury:     2.0,
    twoWheeler: 0.7,
    commercial: 2.5,
    ev:         1.4,
  },
  nightSurcharge:     1.5,
  peakHourSurcharge:  1.25,
  emergencySurcharge: 1.75,
};

// ────────────────────────────────────────────────────
// Store interface
// ────────────────────────────────────────────────────

interface SettingsState {
  // Operational settings
  soundAlerts: boolean;
  slaWarning: string;
  shift: 'day' | 'night';

  // Dynamic pricing config
  pricing: PricingConfig;

  // Setters
  setSoundAlerts: (val: boolean) => void;
  setSlaWarning:  (val: string) => void;
  setShift:       (val: 'day' | 'night') => void;
  setPricing:     (val: PricingConfig) => void;
  updateServiceFee: (service: keyof ServicePricing, fee: number) => void;
  updateVehicleMultiplier: (vehicle: keyof VehicleMultipliers, multiplier: number) => void;
  updatePricingField: (field: keyof Omit<PricingConfig, 'serviceBaseFees' | 'vehicleMultipliers'>, value: number) => void;
}

// ────────────────────────────────────────────────────
// Store (persisted to localStorage)
// ────────────────────────────────────────────────────

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      soundAlerts: true,
      slaWarning:  '30',
      shift:       'day',
      pricing:     DEFAULT_PRICING,

      setSoundAlerts: (val) => set({ soundAlerts: val }),
      setSlaWarning:  (val) => set({ slaWarning: val }),
      setShift:       (val) => set({ shift: val }),
      setPricing:     (val) => set({ pricing: val }),

      updateServiceFee: (service, fee) =>
        set((s) => ({
          pricing: {
            ...s.pricing,
            serviceBaseFees: { ...s.pricing.serviceBaseFees, [service]: fee },
          },
        })),

      updateVehicleMultiplier: (vehicle, multiplier) =>
        set((s) => ({
          pricing: {
            ...s.pricing,
            vehicleMultipliers: { ...s.pricing.vehicleMultipliers, [vehicle]: multiplier },
          },
        })),

      updatePricingField: (field, value) =>
        set((s) => ({
          pricing: { ...s.pricing, [field]: value },
        })),
    }),
    {
      name: 'erina-ops-settings', // persisted to localStorage
    }
  )
);

