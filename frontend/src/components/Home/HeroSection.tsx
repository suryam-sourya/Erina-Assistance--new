"use client";

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Phone, ShieldCheck, Clock } from 'lucide-react';

export default function HeroSection() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-dark/95 via-dark/75 to-dark/30 z-10" />
        <Image
          src="/hero-bg.jpg"
          alt="Roadside Assistance - Erina"
          fill
          className="object-cover object-center"
          priority
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-primary/20 text-primary font-semibold text-sm mb-6 border border-primary/30 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
              Live Tracking Enabled in Bangalore
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6 tracking-tight">
              24/7 Roadside <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Assistance</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-10 leading-relaxed max-w-2xl">
              Stranded on the road? Don&apos;t panic. Our AI-powered system dispatches the nearest technician to get you back on track in minutes.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link 
              href="/booking"
              className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/30 transition-all hover:-translate-y-1"
            >
              <div className="relative w-5 h-5">
                <Image src="/warning.png" alt="Emergency" fill className="object-contain animate-pulse" />
              </div>
              Get Emergency Help
            </Link>
            
            <Link 
              href="tel:+917340066655"
              className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md px-8 py-4 rounded-xl font-bold text-lg border border-white/20 transition-all hover:-translate-y-1 animate-pulse"
            >
              <Phone size={20} className="text-primary animate-bounce" />
              Call +91 73400 66655
            </Link>
            
            <Link 
              href="https://wa.me/917340066655"
              target="_blank"
              className="flex items-center justify-center gap-2 bg-[#25D366]/20 hover:bg-[#25D366]/40 text-white backdrop-blur-md px-8 py-4 rounded-xl font-bold text-lg border border-[#25D366]/30 transition-all hover:-translate-y-1"
            >
              <div className="relative w-5 h-5">
                <Image src="/whatsapp.png" alt="WhatsApp" fill className="object-contain" />
              </div>
              WhatsApp Chat
            </Link>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="mt-12 flex flex-wrap items-center gap-8 text-gray-400"
          >
            <div className="flex items-center gap-2">
              <Clock className="text-secondary" size={24} />
              <span className="text-sm font-medium text-white">30 Min ETA</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-primary" size={24} />
              <span className="text-sm font-medium text-white">Verified Mechanics</span>
            </div>
            {/* Partner logo badge */}
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20">
              <span className="text-xs text-gray-400 font-medium">Trusted Parts:</span>
              <div className="relative w-16 h-6">
                <Image src="/partner-bosch.png" alt="Bosch" fill className="object-contain brightness-0 invert" />
              </div>
              <div className="relative w-20 h-6">
                <Image src="/partner-luminous.png" alt="Luminous" fill className="object-contain brightness-0 invert" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
