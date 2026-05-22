"use client";

import { motion } from 'framer-motion';
import { MapPin, Phone, MessageSquare, Star, Clock, CheckCircle2, CircleDashed } from 'lucide-react';

export default function TrackingPage() {
  const steps = [
    { title: 'Booking Confirmed', time: '10:42 AM', completed: true },
    { title: 'Technician Assigned', time: '10:45 AM', completed: true },
    { title: 'Technician En Route', time: '10:48 AM', completed: false, current: true },
    { title: 'Arrived at Location', time: 'Estimated 11:15 AM', completed: false },
    { title: 'Job Completed', time: 'Pending', completed: false }
  ];

  return (
    <div className="min-h-screen pt-28 pb-16 bg-light dark:bg-[#0B0F19]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-sm mb-4">
              <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
              Live Tracking
            </div>
            <h1 className="text-3xl font-extrabold text-foreground">Booking #ER-8924</h1>
            <p className="text-foreground/60 mt-2">Flat Tyre Assistance • HSR Layout</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 px-6 py-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-full text-primary">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground/60">Estimated Arrival</p>
              <p className="text-2xl font-bold text-foreground">15 Mins</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Map Section */}
          <div className="lg:col-span-2 bg-gray-200 dark:bg-gray-800 rounded-3xl min-h-[500px] relative overflow-hidden border border-gray-200 dark:border-gray-700 flex items-center justify-center">
            {/* Mock Map Background */}
            <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
            <div className="absolute inset-0 bg-blue-50/20 dark:bg-blue-900/10" />
            
            {/* User Pin */}
            <motion.div 
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
            >
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center animate-pulse">
                <div className="w-8 h-8 bg-primary rounded-full border-4 border-white dark:border-gray-900 shadow-xl" />
              </div>
            </motion.div>

            {/* Technician Pin */}
            <motion.div 
              initial={{ x: -100, y: 100 }}
              animate={{ x: 0, y: 0 }}
              transition={{ duration: 10, repeat: Infinity, repeatType: 'reverse' }}
              className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 z-10"
            >
              <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 flex items-center gap-2 mb-2">
                <span className="font-bold text-sm">Ravi K.</span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">15m</span>
              </div>
              <div className="w-10 h-10 bg-secondary rounded-full border-4 border-white dark:border-gray-900 shadow-xl mx-auto flex items-center justify-center text-white">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M19 13.5A5.5 5.5 0 0 1 13.5 19H5.5A2.5 2.5 0 0 1 3 16.5V9.114a2.5 2.5 0 0 1 1.096-2.067l4.5-3.085A2.5 2.5 0 0 1 10.024 4h5.476A3.5 3.5 0 0 1 19 7.5v6Z"/></svg>
              </div>
            </motion.div>
          </div>

          <div className="space-y-8">
            {/* Technician Card */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-gray-800">
              <h3 className="font-bold text-lg mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">Assigned Technician</h3>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden relative border-2 border-primary">
                  <img src="https://images.unsplash.com/photo-1544717297-fa95b6ee9643?q=80&w=2069&auto=format&fit=crop" alt="Technician" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-xl text-foreground">Ravi Kumar</h4>
                  <div className="flex items-center gap-1 text-yellow-500 mt-1">
                    <Star size={16} fill="currentColor" />
                    <span className="font-semibold text-sm">4.9</span>
                    <span className="text-foreground/40 text-xs ml-1">(124 jobs)</span>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mb-6 text-sm font-medium">
                <div className="flex justify-between mb-2">
                  <span className="text-foreground/60">Vehicle</span>
                  <span className="text-foreground">Tata Ace (KA 01 EH 4567)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/60">Contact</span>
                  <span className="text-foreground">+91 98765 *****</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="flex-1 bg-primary text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-hover transition-colors">
                  <Phone size={18} /> Call
                </button>
                <button className="flex-1 bg-secondary text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-secondary/90 transition-colors">
                  <MessageSquare size={18} /> Chat
                </button>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-gray-800">
              <h3 className="font-bold text-lg mb-6">Tracking Status</h3>
              <div className="space-y-6">
                {steps.map((step, index) => (
                  <div key={index} className="flex gap-4 relative">
                    {index !== steps.length - 1 && (
                      <div className={`absolute left-3 top-8 bottom-[-24px] w-0.5 ${step.completed ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`} />
                    )}
                    <div className="relative z-10">
                      {step.completed ? (
                        <CheckCircle2 className="text-primary bg-white dark:bg-gray-900 rounded-full" size={24} />
                      ) : step.current ? (
                        <div className="w-6 h-6 rounded-full border-4 border-primary bg-white dark:bg-gray-900 shadow-[0_0_10px_rgba(255,51,102,0.5)] animate-pulse" />
                      ) : (
                        <CircleDashed className="text-gray-300 dark:text-gray-600 bg-white dark:bg-gray-900 rounded-full" size={24} />
                      )}
                    </div>
                    <div>
                      <h4 className={`font-bold ${step.completed || step.current ? 'text-foreground' : 'text-foreground/40'}`}>{step.title}</h4>
                      <p className="text-xs text-foreground/60 mt-1">{step.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
