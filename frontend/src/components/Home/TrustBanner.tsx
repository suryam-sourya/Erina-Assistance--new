"use client";

import { ShieldCheck, Clock, MapPin, Zap, HeadphonesIcon, Wifi } from 'lucide-react';

const trustItems = [
  { icon: Clock, text: '24/7 Available' },
  { icon: ShieldCheck, text: 'Verified Technicians' },
  { icon: Zap, text: '30-Min Avg Response' },
  { icon: MapPin, text: 'Live GPS Tracking' },
  { icon: HeadphonesIcon, text: 'Dedicated Support' },
  { icon: Wifi, text: 'Real-Time Updates' },
];

export default function TrustBanner() {
  // Duplicate for seamless infinite scroll
  const items = [...trustItems, ...trustItems];

  return (
    <section className="relative overflow-hidden bg-primary/5 dark:bg-white/[0.02] border-y border-primary/10 dark:border-white/5 py-4">
      <div
        className="flex items-center gap-12 whitespace-nowrap"
        style={{ animation: 'scroll-x 30s linear infinite', width: 'max-content' }}
      >
        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="flex items-center gap-2.5 px-2 shrink-0">
              <Icon size={16} className="text-primary" />
              <span className="text-sm font-bold text-foreground/70 uppercase tracking-wider">
                {item.text}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
