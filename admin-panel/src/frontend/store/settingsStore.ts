import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  soundAlerts: boolean;
  slaWarning: string;
  shift: 'day' | 'night';
  ratePerKm: string;
  setSoundAlerts: (val: boolean) => void;
  setSlaWarning: (val: string) => void;
  setShift: (val: 'day' | 'night') => void;
  setRatePerKm: (val: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      soundAlerts: true,
      slaWarning: '30',
      shift: 'day',
      ratePerKm: '120',
      setSoundAlerts: (val) => set({ soundAlerts: val }),
      setSlaWarning: (val) => set({ slaWarning: val }),
      setShift: (val) => set({ shift: val }),
      setRatePerKm: (val) => set({ ratePerKm: val }),
    }),
    {
      name: 'erina-ops-settings', // persists to localStorage automatically
    }
  )
);
