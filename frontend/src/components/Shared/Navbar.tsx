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
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, setUser, activeBookingId } = useUserStore();
  const pathname = usePathname();
  const isHome = pathname === '/';

  // Listen to scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    // Initialize scroll state on mount
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    { name: 'Trip Calculator', href: '/road-trip-calculator' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 w-full z-50 bg-white dark:bg-[#0B0F19] border-b border-gray-200 dark:border-white/10 transition-all duration-300 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-6">

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative h-10 w-36 transition-transform group-hover:scale-105 duration-300">
                <Image
                  src="/logo-full.png"
                  alt="Erina Assistance"
                  fill
                  className="object-contain transition-all"
                  priority
                />
              </div>
              <span className="text-[9px] bg-primary/20 text-primary border border-primary/30 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">BETA</span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden xl:flex items-center space-x-4 xl:space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="transition-colors font-semibold text-sm text-foreground/80 hover:text-primary relative group whitespace-nowrap"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
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

            <div className="pl-4 xl:pl-6 flex items-center space-x-3 xl:space-x-4 border-l border-gray-200 dark:border-white/10 transition-colors">
              <ThemeToggle />
              
              {/* Conditional Auth State Display */}
              {user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full transition-all font-semibold text-sm cursor-pointer select-none border ${
                      isHome && !isScrolled
                        ? 'bg-white/10 hover:bg-white/20 border-white/20'
                        : 'bg-gray-50 dark:bg-gray-800 border border-gray-150 dark:border-gray-700/60 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs shadow-sm">
                      {getInitials()}
                    </div>
                    <span className="truncate max-w-[90px] transition-colors text-foreground/90">
                      {user.displayName || user.email?.split('@')[0]}
                    </span>
                    <ChevronDown size={14} className={`transition-all text-foreground/50 ${isDropdownOpen ? 'rotate-180' : ''}`} />
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

                        <Link
                          href="/my-bookings"
                          onClick={() => setIsDropdownOpen(false)}
                          className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-bold text-foreground/85 hover:bg-primary/10 hover:text-primary transition-colors text-left"
                        >
                          <User size={14} />
                          <span>My Bookings</span>
                        </Link>

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
                  className="px-4 py-2 text-sm rounded-full font-bold transition-all duration-300 text-foreground/80 hover:text-foreground hover:bg-gray-100 dark:hover:bg-gray-800 whitespace-nowrap"
                >
                  Sign In
                </Link>
              )}

              <Link
                href="/booking"
                className="px-4 py-2 rounded-full bg-primary hover:bg-primary/90 text-white font-bold text-sm transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-lg shadow-primary/20 hover:-translate-y-0.5 whitespace-nowrap"
              >
                Emergency Help
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button & Theme Toggle */}
          <div className="xl:hidden flex items-center space-x-3.5">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl focus:outline-none transition-colors text-foreground hover:bg-gray-100 dark:hover:bg-gray-800"
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
            className="xl:hidden glass-panel border-t border-white/10"
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
                    
                    <Link
                      href="/my-bookings"
                      onClick={() => setIsOpen(false)}
                      className="mt-3 w-full py-3 rounded-xl bg-primary/10 text-primary font-bold text-sm hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
                    >
                      <User size={14} />
                      <span>My Bookings</span>
                    </Link>

                    <button
                      onClick={handleSignOut}
                      className="mt-2 w-full py-3 rounded-xl bg-red-500/10 text-red-500 font-bold text-sm hover:bg-red-500 hover:text-white transition-all cursor-pointer text-center"
                    >
                      Logout Account
                    </button>
                  </div>
                ) : (
                  <div className="px-3 space-y-3">
                    <Link
                      href="/my-bookings"
                      onClick={() => setIsOpen(false)}
                      className="block w-full py-3 text-center rounded-xl border border-gray-200 dark:border-gray-800 text-foreground font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all text-sm uppercase tracking-wider"
                    >
                      My Bookings
                    </Link>
                    <Link
                      href="/login"
                      onClick={() => setIsOpen(false)}
                      className="block w-full py-3 text-center rounded-xl bg-primary/10 text-primary font-bold hover:bg-primary hover:text-white transition-all text-sm uppercase tracking-wider"
                    >
                      Sign In
                    </Link>
                  </div>
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
