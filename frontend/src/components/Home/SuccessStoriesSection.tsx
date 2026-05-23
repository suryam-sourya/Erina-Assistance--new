"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MapPin, Clock, ShieldCheck, Zap, Key, PlugZap, Truck } from 'lucide-react';

interface Story {
  id: string;
  name: string;
  role: string;
  location: string;
  serviceType: 'towing' | 'battery' | 'ev' | 'lockout' | string;
  serviceLabel: string;
  eta: string;
  technician: string;
  rating: number;
  storyTitle: string;
  quote: string;
  avatarColor: string;
  initials: string;
}

const defaultStories: Story[] = [
  {
    id: 'story-1',
    name: 'Arjun Krishnan',
    role: 'Software Architect',
    location: 'Nandi Hills Road, Bangalore',
    serviceType: 'battery',
    serviceLabel: 'Battery Jumpstart',
    eta: '22 Mins ETA',
    technician: 'Ramesh Kumar',
    rating: 5,
    storyTitle: 'Stranded at 2:30 AM on a Weekend',
    quote: 'My battery died while returning from Nandi Hills late at night. Stranded in the pitch dark, I requested a jumpstart. The technician Ramesh arrived in just 22 minutes with a battery pack and got my car running in no time. Absolutely life-saving service!',
    avatarColor: 'from-orange-500 to-red-500',
    initials: 'AK',
  },
  {
    id: 'story-2',
    name: 'Sneha Reddy',
    role: 'Product Designer',
    location: 'NICE Road Expressway',
    serviceType: 'towing',
    serviceLabel: 'Flatbed Towing',
    eta: '28 Mins ETA',
    technician: 'Amit Singh',
    rating: 5,
    storyTitle: 'Heavy Downpour & Transmission Failure',
    quote: 'During a massive storm on NICE Road, my sedan suffered a major gearbox failure. Erina dispatched a flatbed tow truck instantly. Amit, the technician, was extremely professional, taking utmost care of my vehicle. The live tracking gave me immense peace of mind.',
    avatarColor: 'from-blue-500 to-indigo-500',
    initials: 'SR',
  },
  {
    id: 'story-3',
    name: 'Dr. Vijay Shekhar',
    role: 'Cardiologist',
    location: 'Outer Ring Road (near Marathahalli)',
    serviceType: 'ev',
    serviceLabel: 'Mobile EV Charging',
    eta: '18 Mins ETA',
    technician: 'Vikram Rao',
    rating: 5,
    storyTitle: 'EV Battery Depleted in Traffic Gridlock',
    quote: 'Got stuck in an unexpected 2-hour traffic jam and my EV battery dropped to 1%. I was completely stranded. Erina sent a mobile charging van within 18 minutes. They plugged me in for a quick 15-minute top-up, which was enough to safely reach my home charger.',
    avatarColor: 'from-emerald-500 to-teal-500',
    initials: 'VS',
  },
  {
    id: 'story-4',
    name: 'Priya Mudaliar',
    role: 'Retail Manager',
    location: 'Phoenix Marketcity, Whitefield',
    serviceType: 'lockout',
    serviceLabel: 'Lockout Assistance',
    eta: '15 Mins ETA',
    technician: 'Nitesh Gowda',
    rating: 5,
    storyTitle: 'Keys Locked Inside the Boot',
    quote: 'After a long shopping day, I accidentally loaded my keys into the boot and closed it. I was locked out. The lockout expert Nitesh arrived in 15 minutes. Using specialized non-destructive tools, he unlocked my door within 3 minutes without a single scratch. Incredible!',
    avatarColor: 'from-purple-500 to-pink-500',
    initials: 'PM',
  }
];

export default function SuccessStoriesSection() {
  const [stories, setStories] = useState<Story[]>(defaultStories);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
        const response = await fetch(`${apiUrl}/api/testimonials`);
        const data = await response.json();
        if (data.success && data.testimonials && data.testimonials.length > 0) {
          setStories(data.testimonials);
        }
      } catch (err) {
        console.error("Failed to load testimonials:", err);
      }
    };
    fetchStories();
  }, []);

  const filteredStories = filter === 'all' 
    ? stories 
    : stories.filter(story => story.serviceType === filter);

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'towing':
        return <Truck size={16} className="text-blue-500" />;
      case 'battery':
        return <Zap size={16} className="text-yellow-500" />;
      case 'ev':
        return <PlugZap size={16} className="text-emerald-500" />;
      case 'lockout':
        return <Key size={16} className="text-purple-500" />;
      default:
        return <ShieldCheck size={16} className="text-primary" />;
    }
  };

  return (
    <section id="stories" className="py-24 bg-white dark:bg-[#0B0F19] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[160px] pointer-events-none z-0" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-sm font-bold text-primary uppercase tracking-wider mb-2">Rescues & Testimonials</h2>
            <h3 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">Customer Success Stories</h3>
            <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
              Real stories from drivers saved by Erina Roadside Assistance across Bangalore.
            </p>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {[
            { id: 'all', label: 'All Rescues' },
            { id: 'towing', label: 'Towing' },
            { id: 'battery', label: 'Battery Jumpstart' },
            { id: 'ev', label: 'EV Charge' },
            { id: 'lockout', label: 'Lockout' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id)}
              className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 cursor-pointer ${
                filter === item.id 
                  ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                  : 'bg-gray-100 dark:bg-gray-800 text-foreground/75 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Loader state */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[...Array(4)].map((_, i) => (
              <div 
                key={i} 
                className="glass-panel border border-black/5 dark:border-white/5 rounded-3xl p-8 flex flex-col justify-between shadow-lg h-80 animate-pulse"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="w-28 h-6 bg-gray-200 dark:bg-gray-850 rounded-full" />
                    <div className="w-20 h-6 bg-gray-200 dark:bg-gray-850 rounded-full" />
                  </div>
                  <div className="w-1/3 h-5 bg-gray-200 dark:bg-gray-850 rounded-full" />
                  <div className="w-full h-16 bg-gray-100 dark:bg-gray-850 rounded-2xl" />
                </div>
                <div className="flex items-center gap-3 pt-6 border-t border-gray-100 dark:border-gray-800/60 mt-auto">
                  <div className="w-11 h-11 bg-gray-200 dark:bg-gray-850 rounded-full" />
                  <div className="space-y-1.5 flex-1">
                    <div className="w-24 h-4 bg-gray-200 dark:bg-gray-850 rounded-full" />
                    <div className="w-16 h-3 bg-gray-200 dark:bg-gray-850 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Stories Grid */
          <motion.div 
            layout 
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            <AnimatePresence mode="popLayout">
              {filteredStories.map((story) => (
                <motion.div
                  layout
                  key={story.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="glass-panel hover:bg-light-hover dark:hover:bg-gray-800/80 border border-black/5 dark:border-white/5 rounded-3xl p-8 flex flex-col justify-between shadow-lg hover:shadow-2xl transition-all duration-300 relative group overflow-hidden"
                >
                  {/* Visual Accent Corner */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/10 to-transparent rounded-tr-3xl pointer-events-none group-hover:scale-110 transition-transform" />

                  <div>
                    {/* Service Badge & ETA */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                      <div className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-sm">
                        {getServiceIcon(story.serviceType)}
                        <span className="text-foreground/80">{story.serviceLabel}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-primary font-bold bg-primary/10 px-3 py-1.5 rounded-full">
                        <Clock size={12} className="animate-pulse" />
                        <span>{story.eta}</span>
                      </div>
                    </div>

                    {/* Rating Stars */}
                    <div className="flex gap-1 mb-4">
                      {[...Array(story.rating)].map((_, i) => (
                        <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>

                    {/* Story Title */}
                    <h4 className="text-xl font-extrabold text-foreground mb-3 leading-tight group-hover:text-primary transition-colors">
                      &ldquo;{story.storyTitle}&rdquo;
                    </h4>

                    {/* Quote */}
                    <p className="text-foreground/70 text-sm leading-relaxed mb-8 italic">
                      &ldquo;{story.quote}&rdquo;
                    </p>
                  </div>

                  {/* Footer User Info */}
                  <div className="flex items-center justify-between pt-6 border-t border-gray-100 dark:border-gray-800/60 mt-auto">
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${story.avatarColor} text-white flex items-center justify-center font-bold text-sm shadow-md`}>
                        {story.initials}
                      </div>
                      <div>
                        <h5 className="font-bold text-foreground leading-none mb-1">{story.name}</h5>
                        <span className="text-xs text-foreground/50">{story.role}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="block text-[10px] text-foreground/45 font-bold uppercase tracking-wider">Technician</span>
                      <span className="text-xs text-foreground/80 font-semibold">{story.technician}</span>
                      <div className="flex items-center gap-1 justify-end text-[10px] text-emerald-500 font-bold mt-0.5">
                        <ShieldCheck size={12} />
                        <span>Verified Rescue</span>
                      </div>
                    </div>
                  </div>

                  {/* Map Location Indicator */}
                  <div className="flex items-center gap-1.5 text-xs text-foreground/50 mt-4">
                    <MapPin size={12} className="text-red-500 shrink-0" />
                    <span>{story.location}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Call to Action banner inside the section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-16 bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 dark:from-primary/20 dark:to-secondary/20 rounded-3xl p-8 md:p-12 border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left"
        >
          <div className="max-w-2xl">
            <h4 className="text-2xl font-black text-foreground mb-2">Need immediate roadside assistance?</h4>
            <p className="text-sm text-foreground/75 leading-relaxed">
              Don&apos;t wait. Our dispatch center is operating 24 hours a day, 7 days a week. We serve all areas in Bangalore.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 justify-center md:justify-start">
            <a
              href="/booking"
              className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-xl font-bold text-base shadow-lg shadow-primary/30 transition-all whitespace-nowrap cursor-pointer hover:-translate-y-0.5"
            >
              <div className="relative w-4 h-4">
                <Image src="/warning.png" alt="Emergency" fill className="object-contain animate-pulse" />
              </div>
              Get Rescued Now
            </a>
            <a
              href="tel:+917340066655"
              className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-foreground border border-black/5 dark:border-white/10 px-8 py-4 rounded-xl font-bold text-base transition-all whitespace-nowrap cursor-pointer hover:-translate-y-0.5"
            >
              📞 Call +91 73400 66655
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
