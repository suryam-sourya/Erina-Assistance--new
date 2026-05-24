"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, X, AlertTriangle } from 'lucide-react';

export default function EmergencyButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="mb-4 flex flex-col gap-3"
          >
            {/* Call */}
            <Link
              href="tel:+917340066655"
              className="flex items-center gap-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-5 py-3.5 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700/60 hover:scale-105 transition-transform"
            >
              <div className="w-10 h-10 bg-primary/15 rounded-full flex items-center justify-center text-primary shrink-0">
                <Phone size={18} />
              </div>
              <div>
                <span className="font-bold text-sm block">Call Helpline</span>
                <span className="text-[10px] text-foreground/50 font-semibold">+91 73400 66655</span>
              </div>
            </Link>

            {/* WhatsApp */}
            <Link
              href="https://wa.me/917340066655"
              target="_blank"
              className="flex items-center gap-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-5 py-3.5 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700/60 hover:scale-105 transition-transform"
            >
              <div className="w-10 h-10 bg-[#25D366]/15 rounded-full flex items-center justify-center shrink-0">
                <Image src="/whatsapp.png" alt="WhatsApp" width={20} height={20} />
              </div>
              <div>
                <span className="font-bold text-sm block">WhatsApp Chat</span>
                <span className="text-[10px] text-foreground/50 font-semibold">Instant response</span>
              </div>
            </Link>

            {/* Emergency Booking */}
            <Link
              href="/booking"
              className="flex items-center gap-3 bg-primary text-white px-5 py-3.5 rounded-2xl shadow-xl shadow-primary/30 hover:scale-105 transition-transform"
            >
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                <Image src="/warning.png" alt="Emergency" width={18} height={18} className="object-contain" />
              </div>
              <div>
                <span className="font-bold text-sm block">Emergency Booking</span>
                <span className="text-[10px] text-white/60 font-semibold">Quick dispatch</span>
              </div>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 rounded-full bg-emergency text-white flex items-center justify-center shadow-lg transition-all duration-300 relative z-50 cursor-pointer glow-emergency group"
        aria-label="Emergency assistance"
      >
        {isOpen ? (
          <X size={26} />
        ) : (
          <div className="flex flex-col items-center gap-0.5">
            <AlertTriangle size={20} className="animate-pulse" />
            <span className="text-[7px] font-black uppercase tracking-wider">SOS</span>
          </div>
        )}
      </button>
    </div>
  );
}
