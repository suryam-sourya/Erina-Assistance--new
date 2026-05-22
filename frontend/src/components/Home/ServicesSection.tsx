"use client";

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Zap, Droplet, Key, PlugZap } from 'lucide-react';

const services = [
  {
    id: 'towing',
    title: 'Car Towing',
    description: 'Safe and secure flatbed towing for cars, SUVs, and luxury vehicles anywhere in Bangalore.',
    icon: { type: 'image', src: '/service-car.png' },
    delay: 0.1
  },
  {
    id: 'bike-towing',
    title: 'Bike Assistance',
    description: 'Two-wheeler breakdown support including towing, flat tyre repair and on-spot servicing.',
    icon: { type: 'image', src: '/service-bike.png' },
    delay: 0.2
  },
  {
    id: 'battery',
    title: 'Battery Jumpstart',
    description: 'Instant jumpstart for dead batteries to get you moving again fast.',
    icon: { type: 'lucide', component: <Zap size={32} />, color: 'from-yellow-500 to-yellow-600' },
    delay: 0.3
  },
  {
    id: 'fuel',
    title: 'Fuel Delivery',
    description: 'Out of fuel? We deliver petrol or diesel directly to your location.',
    icon: { type: 'lucide', component: <Droplet size={32} />, color: 'from-emerald-500 to-emerald-600' },
    delay: 0.4
  },
  {
    id: 'lockout',
    title: 'Lockout Assistance',
    description: 'Locked your keys inside? Our experts will safely unlock your car.',
    icon: { type: 'lucide', component: <Key size={32} />, color: 'from-purple-500 to-purple-600' },
    delay: 0.5
  },
  {
    id: 'ev',
    title: 'EV Assistance',
    description: 'Mobile charging stations for electric vehicles stranded without charge.',
    icon: { type: 'lucide', component: <PlugZap size={32} />, color: 'from-cyan-500 to-cyan-600' },
    delay: 0.6
  }
];

export default function ServicesSection() {
  return (
    <section id="services" className="py-24 bg-light dark:bg-dark/50 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-secondary/5 blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-sm font-bold text-primary uppercase tracking-wider mb-2">Our Services</h2>
            <h3 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">Comprehensive Roadside Support</h3>
            <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
              We offer a wide range of emergency services to ensure you&apos;re never left stranded.
            </p>
          </motion.div>
        </div>

        {/* Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: service.delay }}
              className="group glass-panel rounded-2xl p-8 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-2 border border-transparent dark:border-white/5"
            >
              {/* Icon */}
              <div className="mb-6">
                {service.icon.type === 'image' ? (
                  <div className="relative w-16 h-16 transform group-hover:scale-110 transition-transform duration-300 drop-shadow-lg">
                    <Image
                      src={service.icon.src!}
                      alt={service.title}
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${service.icon.color} flex items-center justify-center text-white shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                    {service.icon.component}
                  </div>
                )}
              </div>

              <h4 className="text-xl font-bold text-foreground mb-3">{service.title}</h4>
              <p className="text-foreground/70 mb-8 leading-relaxed">{service.description}</p>

              <Link
                href={`/booking?service=${service.id}`}
                className="inline-flex items-center text-sm font-semibold text-primary group-hover:text-primary-hover transition-colors"
              >
                Book Now
                <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Trusted Partners strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-20 text-center"
        >
          <p className="text-sm font-semibold text-foreground/40 uppercase tracking-widest mb-6">Trusted Parts & Service Partners</p>
          <div className="flex flex-wrap items-center justify-center gap-10">
            <div className="relative h-10 w-28 opacity-50 hover:opacity-100 transition-opacity grayscale hover:grayscale-0">
              <Image src="/partner-bosch.png" alt="Bosch" fill className="object-contain" />
            </div>
            <div className="relative h-10 w-28 opacity-50 hover:opacity-100 transition-opacity grayscale hover:grayscale-0">
              <Image src="/partner-luminous.png" alt="Luminous" fill className="object-contain" />
            </div>
            {/* Placeholder for more partners */}
            {['CASTROL', 'MRF', 'AMARON', 'EXIDE'].map((brand) => (
              <span key={brand} className="text-lg font-black text-foreground/20 hover:text-foreground/50 transition-colors tracking-widest">
                {brand}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
