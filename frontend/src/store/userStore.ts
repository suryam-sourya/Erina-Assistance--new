import { create } from 'zustand';
import { User } from 'firebase/auth';

interface UserLocation {
  lat: number;
  lng: number;
  address: string;
}

interface UserState {
  user: User | null;
  loading: boolean;
  activeBookingId: string | null;
  // Location & Serviceability
  detectedLocation: UserLocation | null;
  isServiceable: boolean | null;
  
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setActiveBookingId: (bookingId: string | null) => void;
  clearActiveBookingId: () => void;
  setLocation: (loc: UserLocation | null, serviceable: boolean | null) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  loading: true,
  activeBookingId: typeof window !== 'undefined' ? localStorage.getItem('erina_active_booking_id') : null,
  
  detectedLocation: null,
  isServiceable: null,

  setUser: (user) => set({ user, loading: false }),
  setLoading: (loading) => set({ loading }),
  setActiveBookingId: (bookingId) => {
    if (typeof window !== 'undefined') {
      if (bookingId) {
        localStorage.setItem('erina_active_booking_id', bookingId);
      } else {
        localStorage.removeItem('erina_active_booking_id');
      }
    }
    set({ activeBookingId: bookingId });
  },
  clearActiveBookingId: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('erina_active_booking_id');
    }
    set({ activeBookingId: null });
  },
  setLocation: (loc, serviceable) => set({ detectedLocation: loc, isServiceable: serviceable }),
}));
