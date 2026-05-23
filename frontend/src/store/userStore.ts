import { create } from 'zustand';
import { User } from 'firebase/auth';

interface UserState {
  user: User | null;
  loading: boolean;
  activeBookingId: string | null;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setActiveBookingId: (bookingId: string | null) => void;
  clearActiveBookingId: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  loading: true,
  activeBookingId: typeof window !== 'undefined' ? localStorage.getItem('erina_active_booking_id') : null,
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
}));
