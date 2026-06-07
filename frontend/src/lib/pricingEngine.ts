/**
 * pricingEngine.ts — Pure function pricing calculator for Erina RSA.
 *
 * Used in both admin-panel and frontend apps (copied to each).
 * No imports, no side effects — safe to call anywhere including SSR.
 *
 * Formula:
 *   total = (baseFee + distanceKm × ratePerKm) × vehicleMultiplier × timeSurcharge × emergencySurcharge
 */

// ── Types (mirrors settingsStore PricingConfig) ────────────────────────────

export interface PricingConfig {
  serviceBaseFees: {
    towing: number;
    battery: number;
    urgentBattery: number;
    flatTyre: number;
    fuel: number;
    lockout: number;
    ev: number;
    engine: number;
    accident: number;
    other: number;
  };
  ratePerKm: number;
  vehicleMultipliers: {
    hatchback: number;
    suv: number;
    luxury: number;
    twoWheeler: number;
    commercial: number;
    ev: number;
    other: number;
  };
  nightSurcharge: number;
  peakHourSurcharge: number;
  emergencySurcharge: number;
}

export interface PriceBreakdown {
  baseFee: number;         // flat service fee
  distanceFee: number;     // ratePerKm × km
  vehicleMultiplier: number; // e.g. 1.3 for SUV
  timeSurcharge: number;   // e.g. 1.5 for night, 1.25 for peak, 1.0 otherwise
  emergencySurcharge: number; // e.g. 1.75 if priority, else 1.0
  subtotal: number;        // before surcharges
  total: number;           // final rounded total (₹)
  surchargeLabel: string;  // human-readable surcharge reason
}

// Map service type string values from booking form to config keys
const SERVICE_KEY_MAP: Record<string, keyof PricingConfig['serviceBaseFees']> = {
  towing: 'towing',

  'flat tyre':
    'flatTyre',

  flattyre:
    'flatTyre',

  battery:
    'battery',

  'urgent battery':
    'urgentBattery',

  'urgent-battery':
    'urgentBattery',

  urgentbattery:
    'urgentBattery',

  urgent_battery:
    'urgentBattery',

  fuel:
    'fuel',

  lockout:
    'lockout',

  ev:
    'ev',

  'ev assistance':
    'ev',

  'ev-assistance':
    'ev',

  evassistance:
    'ev',

  engine:
    'engine',

  accident:
    'accident',

  other:
    'other',
};

// Map vehicle type string values from booking form to config keys
const VEHICLE_KEY_MAP: Record<string, keyof PricingConfig['vehicleMultipliers']> = {
  'car (hatchback/sedan)': 'hatchback',
  'suv / muv':             'suv',
  'luxury vehicle':        'luxury',
  'two-wheeler':           'twoWheeler',
  'commercial vehicle':    'commercial',
  'electric vehicle (ev)': 'ev',
  'other':                   'other',
};

// ── Main calculator ────────────────────────────────────────────────────────

export function calculatePrice(params: {
  serviceType: string;    // e.g. 'towing', 'Flat Tyre', 'battery'
  vehicleType: string;    // e.g. 'Car (Hatchback/Sedan)', 'SUV / MUV'
  distanceKm: number;     // slider value 1–100
  isEmergency: boolean;   // priority booking toggle
  hourOfDay?: number;     // 0–23, defaults to current local hour
  config: PricingConfig;
}): PriceBreakdown {
  const { serviceType, vehicleType, distanceKm, isEmergency, config } = params;
  const hour = params.hourOfDay ?? new Date().getHours();

  // 1. Resolve service base fee
  
  const serviceKey = SERVICE_KEY_MAP[serviceType.toLowerCase().replace(/\s+/g, ' ')] ?? 'other';
  const baseFee = config.serviceBaseFees[serviceKey] ?? config.serviceBaseFees.other;

  // 2. Distance fee
  const distanceFee = Math.round(distanceKm * config.ratePerKm);

  // 3. Vehicle multiplier
  const vehicleKey = VEHICLE_KEY_MAP[vehicleType.toLowerCase()] ?? 'hatchback';
  const vehicleMultiplier = config.vehicleMultipliers[vehicleKey] ?? 1.0;

  // 4. Time-based surcharge
  const isNight = hour >= 22 || hour < 6;
  const isPeak  = (hour >= 8 && hour < 10) || (hour >= 17 && hour < 20);
  const timeSurcharge   = isNight ? config.nightSurcharge : isPeak ? config.peakHourSurcharge : 1.0;
  const surchargeLabel  = isNight ? 'Night Surcharge' : isPeak ? 'Peak Hour Surcharge' : 'Standard Hours';

  // 5. Emergency surcharge
  const emergencySurcharge = isEmergency ? config.emergencySurcharge : 1.0;

  // 6. Calculate total
  const subtotal = (baseFee + distanceFee) * vehicleMultiplier;
  const total    = Math.round(subtotal * timeSurcharge * emergencySurcharge);

  return {
    baseFee,
    distanceFee,
    vehicleMultiplier,
    timeSurcharge,
    emergencySurcharge,
    subtotal: Math.round(subtotal),
    total,
    surchargeLabel,
  };
}

// ── Default config (used as fallback when API is unavailable) ─────────────

export const DEFAULT_PRICING: PricingConfig = {
  serviceBaseFees: {
    towing:   1800,
    battery:   900,
    urgentBattery: 3000,
    flatTyre:  700,
    fuel:      200,
    lockout:   500,
    ev:        600,
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
    other:      1.0,
  },
  nightSurcharge:     1.5,
  peakHourSurcharge:  1.25,
  emergencySurcharge: 1.75,
};
