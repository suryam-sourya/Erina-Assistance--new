"use client";

import { motion } from 'framer-motion';
import { Smartphone, UserCheck, MapPin, CheckCircle2 } from 'lucide-react';

const steps = [
  {
    icon: Smartphone,
    step: '01',
    title: 'Request Help',
    description: 'Tap "Emergency Help", select your issue, and share your GPS location instantly.',
    color: 'from-primary to-pink-500',
  },
  {
    icon: UserCheck,
    step: '02',
    title: 'Technician Assigned',
    description: 'Our AI dispatches the nearest verified technician to your location within seconds.',
    color: 'from-orange-500 to-secondary',
  },
  {
    icon: MapPin,
    step: '03',
    title: 'Track Live',
    description: 'Watch your technician approach in real-time with live GPS tracking and ETA updates.',
    color: 'from-emerald-500 to-green-500',
  },
  {
    icon: CheckCircle2,
    step: '04',
    title: 'Back on the Road',
    description: 'Your vehicle is fixed or towed safely. Pay securely and rate your experience.',
    color: 'from-blue-500 to-indigo-500',
  },
];

export default function HowItWorksSection() {
  return (
    <section className="py-24 bg-light dark:bg-dark relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-sm font-bold text-primary uppercase tracking-wider mb-2">How It Works</h2>
          <h3 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">
            Help in <span className="text-gradient">4 Simple Steps</span>
          </h3>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            From emergency request to getting back on the road — our AI-powered platform handles everything.
          </p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connector line (desktop only) */}
          <div className="hidden lg:block absolute top-16 left-[12%] right-[12%] h-[2px] bg-gradient-to-r from-primary/30 via-secondary/30 to-emerald-500/30" />

          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="relative flex flex-col items-center text-center group"
              >
                {/* Step circle */}
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300 mb-6 relative z-10`}>
                  <Icon size={32} strokeWidth={1.5} />
                </div>

                {/* Step number */}
                <span className="text-[10px] font-black text-primary/60 uppercase tracking-widest mb-2">
                  Step {step.step}
                </span>

                <h4 className="text-lg font-bold text-foreground mb-2">{step.title}</h4>
                <p className="text-sm text-foreground/60 leading-relaxed max-w-[240px]">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
