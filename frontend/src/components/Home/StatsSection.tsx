"use client";

import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Users, Wrench, Clock, Star } from 'lucide-react';

interface StatItem {
  icon: React.ElementType;
  value: number;
  suffix: string;
  label: string;
  color: string;
}

const stats: StatItem[] = [
  { icon: Wrench, value: 2000, suffix: '+', label: 'Roadside Rescues', color: 'text-primary' },
  { icon: Users, value: 50, suffix: '+', label: 'Verified Technicians', color: 'text-secondary' },
  { icon: Clock, value: 15, suffix: ' min', label: 'Avg Response Time', color: 'text-emerald-500' },
  { icon: Star, value: 4.9, suffix: '★', label: 'Customer Rating', color: 'text-yellow-500' },
];

function AnimatedCounter({ target, suffix, inView }: { target: number; suffix: string; inView: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;

    const isDecimal = target % 1 !== 0;
    const duration = 1500; // ms
    const startTime = Date.now();

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out curve
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = isDecimal
        ? Math.round(target * eased * 10) / 10
        : Math.round(target * eased);
      setCount(current);
      if (progress >= 1) clearInterval(timer);
    }, 20);

    return () => clearInterval(timer);
  }, [target, inView]);

  return (
    <span className="tabular-nums">
      {target % 1 !== 0 ? count.toFixed(1) : count.toLocaleString()}
      {suffix}
    </span>
  );
}

export default function StatsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-20 bg-dark relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center space-y-3"
              >
                <Icon size={28} className={`${stat.color} mx-auto`} />
                <div className={`text-4xl md:text-5xl font-black text-white`}>
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} inView={inView} />
                </div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                  {stat.label}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
