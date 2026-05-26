// admin-panel/src/contexts/AuthContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/frontend/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

const ALLOWED_ADMIN_EMAILS = [
  'abhishekbajpai680@gmail.com',
  'amanjoshi2518@gmail.com',
  'siraj@erinaassistance.com',
  'sheikhsiraj999@gmail.com'
];

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Listen for Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser && currentUser.email) {
        const emailLower = currentUser.email.toLowerCase();
        if (!ALLOWED_ADMIN_EMAILS.includes(emailLower)) {
          console.warn("Access denied for unauthorized admin email:", emailLower);
          await signOut(auth);
          setUser(null);
          setLoading(false);
          router.push('/admin/login?error=unauthorized');
          return;
        }
      }
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!loading) {
      if (!user && pathname !== '/admin/login' && pathname.startsWith('/admin')) {
        // Redirect unauthenticated users to login
        router.push('/admin/login');
      } else if (user && pathname === '/admin/login') {
        // Redirect authenticated users to dashboard if they try to access login
        router.push('/admin/dashboard');
      }
    }
  }, [user, loading, pathname, router]);

  const logout = async () => {
    try {
      await signOut(auth);
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
