"use client";

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Zap, Droplet, Key, PlugZap, Clock, ArrowRight } from 'lucide-react';

const services = [
  {
    id: 'towing',
    title: 'Car Towing',
    description: 'Safe flatbed towing for cars, SUVs, and luxury vehicles anywhere in Bangalore.',
    icon: { type: 'image', src: '/service-car.png' },
    eta: '~25 min',
    price: '₹1,800',
    delay: 0.1,
  },
  {
    id: 'bike-towing',
    title: 'Bike Assistance',
    description: 'Two-wheeler breakdown support including towing, flat tyre repair and on-spot servicing.',
    icon: { type: 'image', src: '/service-bike.png' },
    eta: '~20 min',
    price: '₹700',
    delay: 0.15,
  },
  {
    id: 'battery',
    title: 'Battery Jumpstart',
    description: 'Instant jumpstart for dead batteries to get you moving again fast.',
    icon: { type: 'lucide', component: <Zap size={28} />, color: 'from-yellow-500 to-yellow-600' },
    eta: '~15 min',
    price: '₹900',
    delay: 0.2,
  },
  {
    id: 'fuel',
    title: 'Fuel Delivery',
    description: 'Out of fuel? We deliver petrol or diesel directly to your location.',
    icon: { type: 'lucide', component: <Droplet size={28} />, color: 'from-emerald-500 to-emerald-600' },
    eta: '~20 min',
    price: '₹200',
    delay: 0.25,
  },
  {
    id: 'lockout',
    title: 'Lockout Assistance',
    description: 'Locked your keys inside? Our experts will safely unlock your vehicle.',
    icon: { type: 'lucide', component: <Key size={28} />, color: 'from-purple-500 to-purple-600' },
    eta: '~18 min',
    price: '₹500',
    delay: 0.3,
  },
  {
    id: 'ev',
    title: 'EV Assistance',
    description: 'Mobile charging stations for electric vehicles stranded without charge.',
    icon: { type: 'lucide', component: <PlugZap size={28} />, color: 'from-cyan-500 to-cyan-600' },
    eta: '~30 min',
    price: '₹600',
    delay: 0.35,
  },
  {
    id: 'urgent-battery',
    title: 'Urgent Battery',
    description: 'Emergency battery replacement & jumpstart at your location',
    icon: { type: 'lucide', component: <Zap size={28} />, color: 'from-orange-500 to-red-500' },
    eta: '~25 min',
    price: '₹3,000',
    delay: 0.3,
  }
];

export default function ServicesSection() {
  return (
    <section id="services" className="py-24 bg-light dark:bg-dark/50 relative overflow-hidden">
      {/* Decorative blobs */}
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
            <h3 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">
              Comprehensive Roadside <span className="text-gradient">Support</span>
            </h3>
            <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
              We offer a wide range of emergency services to ensure you&apos;re never left stranded.
            </p>
          </motion.div>
        </div>

        {/* Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: service.delay }}
              className="group glass-panel rounded-2xl p-7 hover:bg-white dark:hover:bg-gray-800/80 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1.5 border border-transparent dark:border-white/5 flex flex-col"
            >
              {/* Header: Icon + ETA badge */}
              <div className="flex items-start justify-between mb-5">
                {service.icon.type === 'image' ? (
                  <div className="relative w-14 h-14 transform group-hover:scale-110 transition-transform duration-300 drop-shadow-lg">
                    <Image
                      src={service.icon.src!}
                      alt={service.title}
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${service.icon.color} flex items-center justify-center text-white shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                    {service.icon.component}
                  </div>
                )}
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  <Clock size={10} />
                  {service.eta}
                </span>
              </div>

              <h4 className="text-lg font-bold text-foreground mb-2">{service.title}</h4>
              <p className="text-sm text-foreground/60 mb-6 leading-relaxed flex-grow">{service.description}</p>

              {/* Footer: Price + CTA */}
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-foreground/5">
                <div>
                  <span className="text-[10px] text-foreground/40 font-bold uppercase tracking-wider block">Starting at</span>
                  <span className="text-lg font-black text-foreground">{service.price}</span>
                </div>
                <Link
                  href={`/booking?service=${service.id}`}
                  className="flex items-center gap-1.5 text-sm font-bold text-primary group-hover:bg-primary group-hover:text-white px-4 py-2 rounded-lg transition-all border border-primary/20 group-hover:border-primary"
                >
                  Book Now
                  <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
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
            {/* <div className="relative h-10 w-28 opacity-50 hover:opacity-100 transition-opacity grayscale hover:grayscale-0">
              <Image src="/partner-bosch.png" alt="Bosch" fill className="object-contain" />
            </div>
            <div className="relative h-10 w-28 opacity-50 hover:opacity-100 transition-opacity grayscale hover:grayscale-0">
              <Image src="/partner-luminous.png" alt="Luminous" fill className="object-contain" />
            </div> */}
            {['LUMINOUS', 'AMARON', 'EXIDE'].map((brand) => (
              <span key={brand} className="text-lg font-black text-foreground/15 hover:text-foreground/40 transition-colors tracking-widest">
                {brand}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
