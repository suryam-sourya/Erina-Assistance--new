"use client";

import { motion } from 'framer-motion';
import { Target, Eye, Cpu, Map, Rocket } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-28 pb-24 bg-light dark:bg-[#0B0F19]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-6">Redefining <span className="text-primary">Mobility</span> Support</h1>
            <p className="text-lg text-foreground/60 leading-relaxed">
              Erina Assistance is not just another towing company. We are a technology-first platform revolutionizing roadside emergencies through AI and hyper-local networks.
            </p>
          </motion.div>
        </div>

        {/* Vision & Mission */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <motion.div 
            initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="bg-gradient-to-br from-primary to-primary-hover rounded-3xl p-10 text-white shadow-xl shadow-primary/20 relative overflow-hidden group"
          >
            <div className="absolute -right-10 -top-10 text-white/10 group-hover:scale-110 transition-transform duration-700">
              <Eye size={200} />
            </div>
            <div className="relative z-10">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm mb-6 border border-white/20">
                <Eye size={28} />
              </div>
              <h2 className="text-3xl font-bold mb-4">Our Vision</h2>
              <p className="text-white/80 text-lg leading-relaxed">
                To create a world where a vehicle breakdown is just a minor hiccup, not a stressful ordeal. We envision a seamless, immediate, and transparent support system for every driver.
              </p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            className="bg-white dark:bg-gray-900 rounded-3xl p-10 shadow-xl border border-gray-100 dark:border-gray-800 relative overflow-hidden group"
          >
             <div className="absolute -right-10 -top-10 text-gray-50 dark:text-gray-800 group-hover:scale-110 transition-transform duration-700">
              <Target size={200} />
            </div>
            <div className="relative z-10">
              <div className="w-14 h-14 bg-secondary/20 rounded-2xl flex items-center justify-center text-secondary mb-6 border border-secondary/20">
                <Target size={28} />
              </div>
              <h2 className="text-3xl font-bold mb-4 text-foreground">Our Mission</h2>
              <p className="text-foreground/70 text-lg leading-relaxed">
                To build India&apos;s fastest and most reliable roadside assistance network, empowering local mechanics and providing unparalleled service to stranded motorists.
              </p>
            </div>
          </motion.div>
        </div>

        {/* AI Concept & Operations */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="lg:col-span-2 glass-panel rounded-3xl p-10 border border-gray-200 dark:border-gray-800"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
                <Cpu size={28} />
              </div>
              <h2 className="text-2xl font-bold text-foreground">AI-Powered Routing</h2>
            </div>
            <p className="text-foreground/70 text-lg leading-relaxed mb-6">
              Our proprietary algorithm doesn&apos;t just find the nearest mechanic. It considers traffic patterns, mechanic expertise, vehicle type, and current job load to dispatch the absolute best resource for your specific problem, ensuring an average ETA of under 30 minutes.
            </p>
            <div className="flex gap-4">
              <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-xl flex-1 text-center">
                <span className="block text-2xl font-bold text-primary mb-1">98%</span>
                <span className="text-xs text-foreground/60 font-semibold uppercase tracking-wider">Accuracy</span>
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-xl flex-1 text-center">
                <span className="block text-2xl font-bold text-primary mb-1">&lt;30m</span>
                <span className="text-xs text-foreground/60 font-semibold uppercase tracking-wider">Avg ETA</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
            className="glass-panel rounded-3xl p-10 border border-gray-200 dark:border-gray-800"
          >
             <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-green-500/10 text-green-500 rounded-xl">
                <Map size={28} />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Bangalore Roots</h2>
            </div>
            <p className="text-foreground/70 leading-relaxed mb-6">
              Born in India&apos;s Silicon Valley, we understand the unique challenges of urban mobility. We cover 100% of Bangalore, from Electronic City to Yelahanka.
            </p>
            <div className="w-full h-32 bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden relative">
               <div className="absolute inset-0 opacity-50 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
               <div className="absolute inset-0 flex items-center justify-center">
                 <span className="font-bold text-gray-400">Map View</span>
               </div>
            </div>
          </motion.div>
        </div>

        {/* Roadmap */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="bg-white dark:bg-gray-900 rounded-3xl p-10 shadow-xl border border-gray-100 dark:border-gray-800"
        >
          <div className="flex items-center gap-4 mb-10 border-b border-gray-100 dark:border-gray-800 pb-6">
            <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl">
              <Rocket size={28} />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Future Roadmap</h2>
          </div>
          
          <div className="relative">
            {/* Connecting Line */}
            <div className="absolute left-[15px] top-4 bottom-4 w-1 bg-gray-100 dark:bg-gray-800 rounded-full" />
            
            <div className="space-y-8 relative z-10">
              <div className="flex gap-6">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 border-4 border-white dark:border-gray-900 shadow-md">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground">Q3 2026: EV Specialized Units</h3>
                  <p className="text-foreground/60 text-sm mt-1">Launching a fleet of mobile charging units specifically for stranded electric vehicles in major tech parks.</p>
                </div>
              </div>
              
              <div className="flex gap-6">
                <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center shrink-0 border-4 border-white dark:border-gray-900">
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground">Q1 2027: Pan-Karnataka Expansion</h3>
                  <p className="text-foreground/60 text-sm mt-1">Expanding operations to Mysore, Hubli, and Mangalore highways.</p>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center shrink-0 border-4 border-white dark:border-gray-900">
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground">Q4 2027: Predictive Maintenance App</h3>
                  <p className="text-foreground/60 text-sm mt-1">Releasing an OBD2 integrated app to predict breakdowns before they happen.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
