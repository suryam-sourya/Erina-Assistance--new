"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, X } from 'lucide-react';

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
            className="mb-4 flex flex-col gap-3"
          >
            <Link 
              href="tel:+1234567890"
              className="flex items-center gap-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-5 py-3 rounded-full shadow-lg border border-gray-100 dark:border-gray-700 hover:scale-105 transition-transform"
            >
              <div className="bg-primary/20 p-2 rounded-full text-primary">
                <Phone size={20} />
              </div>
              <span className="font-semibold">Call Now</span>
            </Link>
            
            <Link 
              href="https://wa.me/1234567890" target="_blank"
              className="flex items-center gap-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-5 py-3 rounded-full shadow-lg border border-gray-100 dark:border-gray-700 hover:scale-105 transition-transform"
            >
              <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
                <Image src="/whatsapp.png" alt="WhatsApp" width={28} height={28} />
              </div>
              <span className="font-semibold">WhatsApp</span>
            </Link>
            
            <Link 
              href="/booking"
              className="flex items-center gap-3 bg-primary text-white px-5 py-3 rounded-full shadow-lg shadow-primary/30 hover:scale-105 transition-transform"
            >
              <div className="bg-white/20 p-2 rounded-full text-white relative w-9 h-9 flex items-center justify-center shrink-0">
                <Image src="/warning.png" alt="Emergency" width={20} height={20} className="object-contain" />
              </div>
              <span className="font-semibold">Emergency Booking</span>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/40 hover:scale-105 transition-all duration-300 relative z-50 p-3"
      >
        <span className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-75"></span>
        {isOpen ? <X size={28} /> : <div className="relative w-8 h-8 animate-pulse"><Image src="/warning.png" alt="Emergency" fill className="object-contain" /></div>}
      </button>
    </div>
  );
}
