"use client";

import { useState, useEffect } from 'react';
import {
  Volume2, Clock, Moon, Sun, Save, CheckCircle2, Play,
  TrendingUp, Car, Zap, AlertTriangle, RotateCcw
} from 'lucide-react';
import { useSettingsStore, ServicePricing, VehicleMultipliers } from '@/frontend/store/settingsStore';
import { useDispatchAlarm } from '@/frontend/lib/useDispatchAlarm';
import { calculatePrice } from '@/frontend/lib/pricingEngine';

// ── Helper: small labelled number input ────────────────────────────────────

function PriceInput({
  label,
  value,
  prefix = '₹',
  suffix,
  step = 50,
  min = 0,
  onChange,
}: {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  step?: number;
  min?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[9px] text-foreground/50 font-bold uppercase tracking-wider">{label}</span>
      <div className="relative">
        {prefix && (
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-foreground/60">
            {prefix}
          </span>
        )}
        <input
          type="number"
          step={step}
          min={min}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={`w-full bg-background border border-white/10 focus:border-primary/50 text-xs py-2 rounded-lg outline-none text-white font-bold ${prefix ? 'pl-7 pr-2' : 'px-3'}`}
        />
        {suffix && (
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-bold text-foreground/40 uppercase tracking-wide">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Settings page ──────────────────────────────────────────────────────────

export default function OperationalSettings() {
  const {
    soundAlerts, setSoundAlerts,
    slaWarning, setSlaWarning,
    shift, setShift,
    pricing, updateServiceFee, updateVehicleMultiplier, updatePricingField, setPricing,
  } = useSettingsStore();

  const { playAlarm } = useDispatchAlarm();
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Hydrate settings store from MongoDB on mount
  useEffect(() => {
    fetch('/api/pricing')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.pricing) {
          setPricing(data.pricing);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch operational pricing from DB:", err);
        setErrorMessage("Could not load pricing settings from database. Using offline cache.");
      })
      .finally(() => setIsLoading(false));
  }, [setPricing]);

  // Live preview state
  const [previewService, setPreviewService] = useState<keyof ServicePricing>('towing');
  const [previewVehicle, setPreviewVehicle] = useState('Car (Hatchback/Sedan)');
  const [previewKm, setPreviewKm] = useState(10);
  const [previewEmergency, setPreviewEmergency] = useState(false);

  const previewPrice = calculatePrice({
    serviceType: previewService,
    vehicleType: previewVehicle,
    distanceKm: previewKm,
    isEmergency: previewEmergency,
    config: pricing,
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage('');
    try {
      const response = await fetch('/api/pricing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pricing }),
      });
      const data = await response.json();
      if (data.success) {
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 3000);
      } else {
        setErrorMessage(data.error || 'Failed to save pricing configuration.');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage('Network error occurred. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('Reset all pricing to factory defaults?')) {
      import('@/frontend/store/settingsStore').then(({ DEFAULT_PRICING }) => setPricing(DEFAULT_PRICING));
    }
  };

  const SERVICE_LABELS: { key: keyof ServicePricing; label: string }[] = [
    { key: 'towing',   label: 'Flatbed Towing'  },
    { key: 'battery',  label: 'Battery Jump'     },
    { key: 'flatTyre', label: 'Flat Tyre'        },
    { key: 'fuel',     label: 'Fuel Delivery'    },
    { key: 'lockout',  label: 'Lockout'          },
    { key: 'engine',   label: 'Engine Failure'   },
    { key: 'accident', label: 'Accident Recovery'},
    { key: 'other',    label: 'Other'            },
  ];

  const VEHICLE_LABELS: { key: keyof VehicleMultipliers; label: string }[] = [
    { key: 'hatchback',  label: 'Hatchback/Sedan' },
    { key: 'suv',        label: 'SUV / MUV'       },
    { key: 'luxury',     label: 'Luxury'           },
    { key: 'twoWheeler', label: 'Two-Wheeler'      },
    { key: 'commercial', label: 'Commercial'       },
    { key: 'ev',         label: 'Electric (EV)'    },
  ];

  return (
    <div className="space-y-8 max-w-3xl">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white uppercase tracking-wider">Operational System Controls</h1>
        <p className="text-xs text-foreground/45 uppercase tracking-wider font-semibold mt-1">
          Configure pricing, SLA thresholds, shift schedules, and alert sounds
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">

        {/* ── 1. Acoustic Alarm ── */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-0">
          <div className="flex items-start justify-between">
            <div className="flex gap-3">
              <Volume2 className="text-primary shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-wider">Acoustic Dispatch Alarm</h3>
                <span className="text-[10px] text-foreground/40 block mt-0.5 font-semibold">Play siren sound on incoming emergency requests</span>
                <button
                  type="button"
                  onClick={playAlarm}
                  disabled={!soundAlerts}
                  className="mt-2 flex items-center gap-1.5 bg-primary/10 hover:bg-primary/20 disabled:opacity-30 disabled:cursor-not-allowed border border-primary/25 text-primary text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                >
                  <Play size={10} />
                  <span>Test Alarm</span>
                </button>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer mt-0.5">
              <input type="checkbox" checked={soundAlerts} onChange={(e) => setSoundAlerts(e.target.checked)} className="sr-only peer" />
              <div className="w-11 h-6 bg-background rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-muted after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary peer-checked:after:bg-background"></div>
            </label>
          </div>
        </div>

        {/* ── 2. Shift & SLA ── */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-5">
          {/* Shift */}
          <div className="flex items-center justify-between pb-5 border-b border-white/5">
            <div className="flex gap-3">
              <Sun className="text-primary shrink-0" size={20} />
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-wider">Shift Sector Schedule</h3>
                <span className="text-[10px] text-foreground/40 block mt-0.5 font-semibold">Current operational shift crew sector</span>
              </div>
            </div>
            <div className="grid grid-cols-2 bg-background/60 p-1 rounded-xl border border-white/5">
              {(['day', 'night'] as const).map((s) => (
                <button key={s} type="button" onClick={() => setShift(s)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${shift === s ? 'bg-card text-primary border border-white/5' : 'text-foreground/40 hover:text-foreground/80'}`}>
                  {s === 'day' ? <Sun size={10} /> : <Moon size={10} />}
                  <span>{s} shift</span>
                </button>
              ))}
            </div>
          </div>
          {/* SLA */}
          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              <Clock className="text-primary shrink-0" size={20} />
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-wider">SLA Warning Limit</h3>
                <span className="text-[10px] text-foreground/40 block mt-0.5 font-semibold">Flag dispatches exceeding this time</span>
              </div>
            </div>
            <div className="relative w-28">
              <input type="number" value={slaWarning} onChange={(e) => setSlaWarning(e.target.value)}
                className="w-full bg-background border border-white/10 focus:border-primary/50 text-xs px-4 py-2.5 rounded-lg outline-none text-white font-bold" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-foreground/35 font-bold uppercase tracking-wider">Mins</span>
            </div>
          </div>
        </div>

        {/* ── 3. Dynamic Pricing Panel ── */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6">
          
          {/* Section heading */}
          <div className="flex items-center justify-between">
            <div className="flex gap-3 items-start">
              <TrendingUp className="text-primary shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-wider">Dynamic Pricing Engine</h3>
                <span className="text-[10px] text-foreground/40 block mt-0.5 font-semibold">
                  Set base fees, vehicle multipliers and time surcharges — applied live to customer quotes
                </span>
              </div>
            </div>
            <button type="button" onClick={handleReset}
              className="flex items-center gap-1 text-[9px] text-foreground/35 hover:text-warning font-bold uppercase tracking-wider transition-all cursor-pointer">
              <RotateCcw size={10} />
              <span>Reset</span>
            </button>
          </div>

          {/* 3a. Service base fees */}
          <div className="space-y-3">
            <h4 className="text-[10px] text-foreground/50 font-black uppercase tracking-widest border-b border-white/5 pb-2">
              Base Service Fees (₹ flat rate)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {SERVICE_LABELS.map(({ key, label }) => (
                <PriceInput
                  key={key}
                  label={label}
                  value={pricing.serviceBaseFees[key]}
                  step={100}
                  onChange={(v) => updateServiceFee(key, v)}
                />
              ))}
            </div>
          </div>

          {/* 3b. Per-km rate */}
          <div className="space-y-3">
            <h4 className="text-[10px] text-foreground/50 font-black uppercase tracking-widest border-b border-white/5 pb-2">
              Distance Rate
            </h4>
            <div className="max-w-[160px]">
              <PriceInput
                label="Rate per KM"
                value={pricing.ratePerKm}
                suffix="/ km"
                step={10}
                onChange={(v) => updatePricingField('ratePerKm', v)}
              />
            </div>
          </div>

          {/* 3c. Vehicle multipliers */}
          <div className="space-y-3">
            <h4 className="text-[10px] text-foreground/50 font-black uppercase tracking-widest border-b border-white/5 pb-2">
              <span className="flex items-center gap-1.5"><Car size={10} /> Vehicle Type Multipliers (×)</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {VEHICLE_LABELS.map(({ key, label }) => (
                <PriceInput
                  key={key}
                  label={label}
                  value={pricing.vehicleMultipliers[key]}
                  prefix="×"
                  step={0.1}
                  min={0.1}
                  onChange={(v) => updateVehicleMultiplier(key, v)}
                />
              ))}
            </div>
          </div>

          {/* 3d. Surcharge multipliers */}
          <div className="space-y-3">
            <h4 className="text-[10px] text-foreground/50 font-black uppercase tracking-widest border-b border-white/5 pb-2">
              <span className="flex items-center gap-1.5"><Zap size={10} /> Surcharge Multipliers (×)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <PriceInput label="Night (10 PM–6 AM)" value={pricing.nightSurcharge} prefix="×" step={0.05} min={1} onChange={(v) => updatePricingField('nightSurcharge', v)} />
              <PriceInput label="Peak Hours (rush hr)" value={pricing.peakHourSurcharge} prefix="×" step={0.05} min={1} onChange={(v) => updatePricingField('peakHourSurcharge', v)} />
              <PriceInput label="Emergency Priority" value={pricing.emergencySurcharge} prefix="×" step={0.05} min={1} onChange={(v) => updatePricingField('emergencySurcharge', v)} />
            </div>
          </div>

          {/* 3e. Live Price Preview */}
          <div className="space-y-3">
            <h4 className="text-[10px] text-foreground/50 font-black uppercase tracking-widest border-b border-white/5 pb-2">
              <span className="flex items-center gap-1.5"><AlertTriangle size={10} /> Live Price Preview</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="flex flex-col gap-1">
                <span className="text-[9px] text-foreground/50 font-bold uppercase tracking-wider">Service</span>
                <select value={previewService} onChange={(e) => setPreviewService(e.target.value as keyof ServicePricing)}
                  className="bg-background border border-white/10 text-[10px] text-white font-bold px-2 py-2 rounded-lg outline-none focus:border-primary/50">
                  {SERVICE_LABELS.map(({ key, label }) => <option key={key} value={key}>{label}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[9px] text-foreground/50 font-bold uppercase tracking-wider">Vehicle</span>
                <select value={previewVehicle} onChange={(e) => setPreviewVehicle(e.target.value)}
                  className="bg-background border border-white/10 text-[10px] text-white font-bold px-2 py-2 rounded-lg outline-none focus:border-primary/50">
                  {['Car (Hatchback/Sedan)', 'SUV / MUV', 'Luxury Vehicle', 'Two-Wheeler', 'Commercial Vehicle', 'Electric Vehicle (EV)'].map(v => <option key={v}>{v}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[9px] text-foreground/50 font-bold uppercase tracking-wider">Distance ({previewKm} km)</span>
                <input type="range" min={1} max={100} value={previewKm} onChange={(e) => setPreviewKm(Number(e.target.value))}
                  className="mt-1 accent-primary" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[9px] text-foreground/50 font-bold uppercase tracking-wider">Priority</span>
                <label className="flex items-center gap-2 cursor-pointer mt-1">
                  <div className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${previewEmergency ? 'bg-emergency' : 'bg-white/10'}`} onClick={() => setPreviewEmergency(!previewEmergency)}>
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${previewEmergency ? 'translate-x-4' : 'translate-x-0'}`} />
                  </div>
                  <span className="text-[9px] font-bold text-foreground/50 uppercase">{previewEmergency ? 'On' : 'Off'}</span>
                </label>
              </div>
            </div>

            {/* Breakdown card */}
            <div className="bg-background/60 border border-white/5 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-[10px] text-foreground/50">
                <span>Base fee ({previewService})</span>
                <span className="font-bold text-white">₹{previewPrice.baseFee.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-foreground/50">
                <span>Distance ({previewKm} km × ₹{pricing.ratePerKm})</span>
                <span className="font-bold text-white">₹{previewPrice.distanceFee.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-foreground/50">
                <span>Vehicle multiplier</span>
                <span className="font-bold text-white">{previewPrice.vehicleMultiplier}×</span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-foreground/50">
                <span>{previewPrice.surchargeLabel}</span>
                <span className={`font-bold ${previewPrice.timeSurcharge > 1 ? 'text-warning' : 'text-foreground/40'}`}>
                  {previewPrice.timeSurcharge}×
                </span>
              </div>
              {previewEmergency && (
                <div className="flex items-center justify-between text-[10px] text-foreground/50">
                  <span>Emergency surcharge</span>
                  <span className="font-bold text-emergency">{previewPrice.emergencySurcharge}×</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <span className="text-xs font-black text-white uppercase tracking-wider">Total Estimate</span>
                <span className="text-lg font-black text-primary">₹{previewPrice.total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Save button ── */}
        <div className="flex flex-col gap-2 pt-2">
          {errorMessage && (
            <div className="text-[10px] font-black text-emergency uppercase tracking-wider bg-emergency/10 border border-emergency/20 px-4 py-2 rounded-xl">
              {errorMessage}
            </div>
          )}
          {isLoading && (
            <div className="text-[10px] font-black text-primary uppercase tracking-wider animate-pulse">
              Syncing settings with MongoDB database...
            </div>
          )}
          
          <div className="flex items-center justify-between">
            {isSaved ? (
              <span className="text-[10px] text-success font-black uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 size={12} />
                <span>Saved & Synced Live to Database!</span>
              </span>
            ) : (
              <span className="text-[9px] text-foreground/30 font-bold uppercase tracking-widest">
                {isSaving ? "Saving to database..." : "Changes persist automatically"}
              </span>
            )}
            <button 
              type="submit"
              disabled={isLoading || isSaving}
              className="flex items-center gap-2 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-background font-black px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-primary/20"
            >
              {isSaving ? (
                <div className="w-3.5 h-3.5 border-2 border-background border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save size={14} />
              )}
              <span>{isSaving ? "Saving..." : "Apply Changes"}</span>
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}
