"use client";

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Phone, ShieldCheck, Clock, MapPin, Zap, Users } from 'lucide-react';

export default function HeroSection() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-r from-dark/90 via-dark/60 to-transparent z-10" />
        <div className="absolute inset-0 bg-black/20 z-10" />
        <Image
          src="/hero-bg.png"
          alt="Roadside Assistance - Erina"
          fill
          className="object-cover object-[center_20%] md:object-[center_35%]"
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
            {/* Live status badge */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-emerald-500/15 text-emerald-400 font-bold text-xs uppercase tracking-wider border border-emerald-500/25 backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Live Tracking Enabled
              </span>
              <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-white/10 text-white/80 font-bold text-xs uppercase tracking-wider border border-white/10 backdrop-blur-sm">
                <Users size={12} className="text-secondary" />
                12 Technicians Near You
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-white leading-[1.1] mb-6 tracking-tight">
              24/7 Tech-enabled<br />
              Roadside{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                Assistance
              </span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-8 leading-relaxed max-w-2xl">
              Stranded on the road? Don&apos;t panic. Our tech-enabled platform dispatches the nearest verified technician to get you back on track — anywhere in Bangalore, any time.
            </p>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4"
          >
            <Link
              href="/booking"
              className="flex items-center justify-center gap-2.5 bg-primary hover:bg-primary-hover text-white px-7 py-4 rounded-xl font-bold text-base sm:text-lg shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5 glow-primary"
            >
              <div className="relative w-5 h-5">
                <Image src="/warning.png" alt="Emergency" fill className="object-contain animate-pulse" />
              </div>
              Emergency Help
            </Link>

            <Link
              href="tel:+917340066655"
              className="flex items-center justify-center gap-2.5 bg-white/10 hover:bg-white/20 text-white backdrop-blur-md px-7 py-4 rounded-xl font-bold text-base sm:text-lg border border-white/15 transition-all hover:-translate-y-0.5"
            >
              <Phone size={18} className="text-primary" />
              Call Now
            </Link>

            <Link
              href="https://wa.me/917340066655"
              target="_blank"
              className="flex items-center justify-center gap-2.5 bg-[#25D366]/15 hover:bg-[#25D366]/30 text-white backdrop-blur-md px-7 py-4 rounded-xl font-bold text-base sm:text-lg border border-[#25D366]/25 transition-all hover:-translate-y-0.5"
            >
              <div className="relative w-5 h-5">
                <Image src="/whatsapp.png" alt="WhatsApp" fill className="object-contain" />
              </div>
              WhatsApp
            </Link>
          </motion.div>

          {/* Trust indicators row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="mt-10 flex flex-wrap items-center gap-6 md:gap-8"
          >
            {[
              { icon: Clock, text: '30 Min Avg ETA', color: 'text-secondary' },
              { icon: ShieldCheck, text: 'Verified Mechanics', color: 'text-primary' },
              { icon: MapPin, text: 'Live GPS Tracking', color: 'text-emerald-400' },
              { icon: Zap, text: '2000+ Rescues', color: 'text-yellow-400' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2">
                <item.icon className={item.color} size={18} />
                <span className="text-xs sm:text-sm font-semibold text-white/80">{item.text}</span>
              </div>
            ))}
          </motion.div>

          {/* Partner logos */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.9 }}
            className="mt-8 flex items-center gap-4 flex-wrap"
          >
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Trusted Parts:</span>
            
            
            {['LUMINOUS', 'EXIDE', 'AMARON'].map((b) => (
              <span key={b} className="text-xs font-black text-white/15 hover:text-white/40 transition-colors tracking-widest">{b}</span>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
