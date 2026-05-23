"use client";

import { useState } from 'react';
import { Volume2, BadgeCent, Clock, Moon, Sun, Save, CheckCircle2, Play } from 'lucide-react';
import { useSettingsStore } from '@/frontend/store/settingsStore';
import { useDispatchAlarm } from '@/frontend/lib/useDispatchAlarm';

export default function OperationalSettings() {
  const {
    soundAlerts, setSoundAlerts,
    slaWarning, setSlaWarning,
    shift, setShift,
    ratePerKm, setRatePerKm,
  } = useSettingsStore();

  const { playAlarm } = useDispatchAlarm();
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // Changes are auto-persisted by Zustand; just show confirmation toast
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white uppercase tracking-wider">Operational System Controls</h1>
        <p className="text-xs text-foreground/45 uppercase tracking-wider font-semibold mt-1">
          Adjust SLA thresholds, configure dispatcher shift schedules, and manage live notifications sound settings
        </p>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSave} className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6">
          
          {/* Sounds toggles */}
          <div className="flex items-start justify-between pb-5 border-b border-white/5">
            <div className="flex gap-3">
              <Volume2 className="text-primary shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-wider">Acoustic Dispatch Alarm</h3>
                <span className="text-[10px] text-foreground/40 block mt-0.5 font-semibold">Play siren sound on incoming emergency requests</span>
                {/* Live test button */}
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
              <input 
                type="checkbox" 
                checked={soundAlerts} 
                onChange={(e) => setSoundAlerts(e.target.checked)}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-background rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-muted after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary peer-checked:after:bg-background"></div>
            </label>
          </div>

          {/* Shift selector */}
          <div className="flex items-center justify-between pb-5 border-b border-white/5">
            <div className="flex gap-3">
              <Sun className="text-primary shrink-0" size={20} />
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-wider">Shift Sector Schedule</h3>
                <span className="text-[10px] text-foreground/40 block mt-0.5 font-semibold">Current operational shift crew sector</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 bg-background/60 p-1 rounded-xl border border-white/5">
              <button
                type="button"
                onClick={() => setShift('day')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  shift === 'day'
                    ? 'bg-card text-primary border border-white/5'
                    : 'text-foreground/40 hover:text-foreground/80'
                }`}
              >
                <Sun size={10} />
                <span>Day shift</span>
              </button>
              <button
                type="button"
                onClick={() => setShift('night')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  shift === 'night'
                    ? 'bg-card text-primary border border-white/5'
                    : 'text-foreground/40 hover:text-foreground/80'
                }`}
              >
                <Moon size={10} />
                <span>Night shift</span>
              </button>
            </div>
          </div>

          {/* SLA thresholds */}
          <div className="flex flex-col gap-2 pb-5 border-b border-white/5">
            <div className="flex gap-3 mb-2">
              <Clock className="text-primary shrink-0" size={20} />
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-wider">SLA Warning Limit (Minutes)</h3>
                <span className="text-[10px] text-foreground/40 block mt-0.5 font-semibold">Flag dispatches exceeding this limit as SLA overdue warning</span>
              </div>
            </div>

            <div className="relative max-w-[200px]">
              <input
                type="number"
                value={slaWarning}
                onChange={(e) => setSlaWarning(e.target.value)}
                className="w-full bg-background border border-white/10 focus:border-primary/50 text-xs px-4 py-2.5 rounded-lg outline-none text-white font-bold"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-foreground/35 font-bold uppercase tracking-wider">Mins</span>
            </div>
          </div>

          {/* Towing rates */}
          <div className="flex flex-col gap-2 pb-5 border-b border-white/5">
            <div className="flex gap-3 mb-2">
              <BadgeCent className="text-primary shrink-0" size={20} />
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-wider">Standard Towing Fee Per KM</h3>
                <span className="text-[10px] text-foreground/40 block mt-0.5 font-semibold">Dispatcher standard calculations per kilometer flat rate</span>
              </div>
            </div>

            <div className="relative max-w-[200px]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-white">₹</span>
              <input
                type="number"
                value={ratePerKm}
                onChange={(e) => setRatePerKm(e.target.value)}
                className="w-full bg-background border border-white/10 focus:border-primary/50 text-xs pl-8 pr-4 py-2.5 rounded-lg outline-none text-white font-bold"
              />
            </div>
          </div>

          {/* Submit button */}
          <div className="flex items-center justify-between">
            {isSaved ? (
              <span className="text-[10px] text-success font-black uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 size={12} />
                <span>System Updated!</span>
              </span>
            ) : (
              <span className="text-[9px] text-foreground/30 font-bold uppercase tracking-widest">
                Last modified: today
              </span>
            )}

            <button
              type="submit"
              className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-background font-black px-6 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-primary/20"
            >
              <Save size={14} />
              <span>Apply Changes</span>
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
