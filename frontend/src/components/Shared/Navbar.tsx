"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, LogOut, ShieldCheck, MapPin, User, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useUserStore } from '@/store/userStore';
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, setUser, activeBookingId } = useUserStore();

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, [setUser]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setIsDropdownOpen(false);
      setIsOpen(false);
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  const getInitials = () => {
    if (user?.displayName) {
      return user.displayName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Services', href: '/#services' },
    { name: 'Membership', href: '/membership' },
    { name: 'Partner With Us', href: '/partner' },
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <nav className="fixed w-full z-50 glass-panel border-b border-white/10 dark:border-white/5 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-2.5 group">
              {/* Brand Logo Container */}
              <div className="flex items-center gap-2.5">
                {/* Logo Icon (always crisp SVG) */}
                <div className="relative h-10 w-10 shrink-0 transition-transform group-hover:scale-105 duration-300">
                  <Image
                    src="/logo-icon.svg"
                    alt="Erina Assistance"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
                
                {/* Brand Text (styled elegantly, highly responsive) */}
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <span className="text-base md:text-lg font-black tracking-wider text-foreground uppercase">Erina</span>
                    <span className="text-[8px] bg-primary/15 text-primary border border-primary/20 px-1.5 py-0.1 rounded-full font-black uppercase tracking-widest scale-90 origin-left">
                      RSA
                    </span>
                  </div>
                  <span className="text-[9px] text-foreground/45 uppercase tracking-wider font-extrabold block -mt-1">
                    Assistance
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-foreground/80 hover:text-primary transition-colors font-semibold text-sm"
              >
                {link.name}
              </Link>
            ))}

            {/* Quick Live Tracking Shortcut */}
            {activeBookingId && (
              <motion.div
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Link
                  href={`/tracking?id=${activeBookingId}`}
                  className="text-emerald-500 hover:text-emerald-600 transition-colors font-bold text-sm flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Track Live Rescue
                </Link>
              </motion.div>
            )}

            <div className="pl-4 flex items-center space-x-4 border-l border-foreground/10">
              <ThemeToggle />
              
              {/* Conditional Auth State Display */}
              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gray-50 dark:bg-gray-800 border border-gray-150 dark:border-gray-700/60 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all font-semibold text-sm cursor-pointer select-none"
                  >
                    <div className="w-6.5 h-6.5 rounded-full bg-gradient-to-br from-primary to-orange-500 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                      {getInitials()}
                    </div>
                    <span className="text-foreground/85 truncate max-w-[90px]">
                      {user.displayName || user.email?.split('@')[0]}
                    </span>
                    <ChevronDown size={14} className={`text-foreground/50 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Card */}
                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2.5 w-52 glass-panel border border-black/5 dark:border-white/5 rounded-2xl shadow-xl p-2.5 z-50 text-left"
                      >
                        <div className="px-3.5 py-2.5 border-b border-gray-100 dark:border-gray-800/80 mb-1.5">
                          <h6 className="font-bold text-foreground truncate text-sm">
                            {user.displayName || 'Customer'}
                          </h6>
                          <p className="text-[10px] text-foreground/45 truncate mt-0.5 font-medium">
                            {user.email}
                          </p>
                        </div>

                        {activeBookingId && (
                          <Link
                            href={`/tracking?id=${activeBookingId}`}
                            onClick={() => setIsDropdownOpen(false)}
                            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-500 hover:bg-emerald-500/10 transition-colors"
                          >
                            <MapPin size={14} />
                            <span>Live Roadside Track</span>
                          </Link>
                        )}

                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-500/10 transition-colors text-left cursor-pointer"
                        >
                          <LogOut size={14} />
                          <span>Logout Account</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="px-5 py-2 text-sm rounded-full border border-gray-200 dark:border-gray-800 text-foreground/80 hover:text-foreground hover:bg-gray-50 dark:hover:bg-gray-800 font-bold transition-all duration-300"
                >
                  Sign In
                </Link>
              )}

              <Link
                href="/booking"
                className="px-6 py-2.5 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white font-bold text-sm transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-sm shadow-primary/5 hover:shadow-primary/25"
              >
                <div className="relative w-4.5 h-4.5 animate-pulse">
                  <Image src="/warning.png" alt="Emergency" fill className="object-contain" />
                </div>
                Emergency Help
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button & Theme Toggle */}
          <div className="md:hidden flex items-center space-x-3.5">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-foreground p-2 rounded-md focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-panel border-t border-white/10"
          >
            <div className="px-4 pt-2 pb-6 space-y-1 shadow-xl">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-3 rounded-xl text-base font-bold text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  {link.name}
                </Link>
              ))}

              {activeBookingId && (
                <Link
                  href={`/tracking?id=${activeBookingId}`}
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-3 rounded-xl text-base font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 transition-all flex items-center gap-2"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Track Live Rescue
                </Link>
              )}

              {/* Call Hotline Quick Link */}
              <a
                href="tel:+917340066655"
                className="block px-3 py-3 rounded-xl text-base font-bold text-foreground/80 hover:bg-primary/10 hover:text-primary transition-all flex items-center gap-2"
              >
                📞 Call +91 73400 66655
              </a>

              <div className="pt-4 border-t border-gray-100 dark:border-gray-800/80 space-y-3">
                {user ? (
                  <div className="px-3">
                    <p className="text-xs font-semibold text-foreground/45">Logged in as:</p>
                    <p className="text-sm font-bold text-foreground truncate mt-0.5">{user.displayName || user.email}</p>
                    <button
                      onClick={handleSignOut}
                      className="mt-3 w-full py-3 rounded-xl bg-red-500/10 text-red-500 font-bold text-sm hover:bg-red-500 hover:text-white transition-all cursor-pointer text-center"
                    >
                      Logout Account
                    </button>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="block w-full py-3 text-center rounded-xl border border-gray-200 dark:border-gray-800 text-foreground font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                  >
                    Sign In
                  </Link>
                )}

                <Link
                  href="/booking"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-3 text-center rounded-xl bg-primary hover:bg-primary-hover text-white font-bold shadow-lg shadow-primary/30"
                >
                  Emergency Assistance
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
