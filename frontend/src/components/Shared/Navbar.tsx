"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { ThemeToggle } from "@/components/ThemeToggle";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

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
            <Link href="/" className="flex items-center gap-2">
              {/* Full logo for desktop */}
              <div className="relative hidden md:block h-12 w-52">
                <Image
                  src="/logo-full.png"
                  alt="Erina Assistance"
                  fill
                  className="object-contain object-left"
                  priority
                />
              </div>
              
              {/* Icon only for mobile */}
              <div className="relative md:hidden h-10 w-10">
                <Image
                  src="/warning.png"
                  alt="Erina Assistance"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-foreground/80 hover:text-primary transition-colors font-medium text-sm"
              >
                {link.name}
              </Link>
            ))}

            <div className="pl-4 flex items-center space-x-4 border-l border-foreground/10">
              <ThemeToggle />
              <Link
                href="/booking"
                className="px-6 py-2.5 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white font-semibold transition-all duration-300 flex items-center gap-2"
              >
                <div className="relative w-[18px] h-[18px] animate-pulse">
                  <Image src="/warning.png" alt="Emergency" fill className="object-contain" />
                </div>
                Emergency
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button & Theme Toggle */}
          <div className="md:hidden flex items-center space-x-4">
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
                  className="block px-3 py-3 rounded-md text-base font-medium text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              <Link
                href="/booking"
                onClick={() => setIsOpen(false)}
                className="mt-4 block px-3 py-3 text-center rounded-lg bg-primary text-white font-bold shadow-lg shadow-primary/30"
              >
                Emergency Assistance
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
