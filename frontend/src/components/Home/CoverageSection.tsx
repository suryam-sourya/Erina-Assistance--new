"use client";

import { motion } from 'framer-motion';
import { MapPin, Navigation, Building2, Phone } from 'lucide-react';
import Link from 'next/link';

const zones = [
  { name: 'Whitefield & Kadugodi', status: 'Hub Zone', active: true },
  { name: 'KR Puram & Mahadevapura', status: 'Active', active: true },
  { name: 'Marathahalli & Bellandur', status: 'Active', active: true },
  { name: 'Hebbal & Yelahanka', status: 'Coming Soon', active: false },
  { name: 'Electronic City', status: 'Coming Soon', active: false },
  { name: 'Koramangala & HSR Layout', status: 'Coming Soon', active: false },
  { name: 'Bannerghatta Road', status: 'Coming Soon', active: false },
  { name: 'NICE Road & ORR', status: 'Coming Soon', active: false },
  { name: 'Nandi Hills Highway', status: 'Coming Soon', active: false },
  { name: 'Tumkur Road & Peenya', status: 'Coming Soon', active: false },
  { name: 'Mysore Road Corridor', status: 'Coming Soon', active: false },
  { name: 'Kanakapura Road', status: 'Coming Soon', active: false },
];

export default function CoverageSection() {
  return (
    <section className="py-24 bg-light dark:bg-dark/50 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute -top-[15%] -left-[10%] w-[40%] h-[40%] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-[15%] -right-[10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-sm font-bold text-primary uppercase tracking-wider mb-2">Service Coverage</h2>
          <h3 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">
            Active Across <span className="text-gradient">Bangalore</span>
          </h3>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            Our AI-dispatch network covers all major zones of Bangalore and surrounding highways with rapid response.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Hub Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2 glass-panel rounded-2xl p-8 border border-primary/10 dark:border-white/5 space-y-6"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shadow-lg">
                <Building2 size={24} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-foreground">Erina HQ — Kadugodi</h4>
                <span className="text-xs font-bold text-primary uppercase tracking-wider">Primary Operations Hub</span>
              </div>
            </div>

            <div className="flex items-start gap-3 text-sm text-foreground/70">
              <MapPin size={16} className="text-primary shrink-0 mt-0.5" />
              <p>Shop No. 02, Dinnur Main Road, Kadugodi Colony, Opp: Srihalli Cafe, Bengaluru, Karnataka — 560067</p>
            </div>

            <div className="flex items-center gap-3 text-sm text-foreground/70">
              <Phone size={16} className="text-primary shrink-0" />
              <a href="tel:+917340066655" className="hover:text-primary transition-colors font-semibold">+91 73400 66655</a>
            </div>

            <Link
              href="https://maps.app.goo.gl/FJjrhSuHKL5TWugr9"
              target="_blank"
              className="flex items-center justify-center gap-2 bg-primary/10 hover:bg-primary hover:text-white text-primary font-bold text-sm py-3 rounded-xl transition-all w-full border border-primary/20"
            >
              <Navigation size={14} />
              Open in Google Maps
            </Link>
          </motion.div>

          {/* Zones Grid */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-3"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {zones.map((zone) => (
                <div
                  key={zone.name}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                    zone.active
                      ? 'border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-500/[0.03]'
                      : 'border-foreground/5 bg-foreground/[0.02] opacity-60'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${
                    zone.active ? 'bg-emerald-500 animate-pulse' : 'bg-foreground/20'
                  }`} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{zone.name}</p>
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${
                      zone.active ? 'text-emerald-500' : 'text-foreground/40'
                    }`}>
                      {zone.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
