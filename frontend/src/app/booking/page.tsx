"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { MapPin, Camera, ShieldCheck, Navigation } from 'lucide-react';

export default function BookingPage() {
  const [locationDetecting, setLocationDetecting] = useState(false);
  const [isPriority, setIsPriority] = useState(false);

  const handleDetectLocation = () => {
    setLocationDetecting(true);
    setTimeout(() => {
      setLocationDetecting(false);
      // In a real app, this would use the Geolocation API
    }, 1500);
  };

  return (
    <div className="min-h-screen pt-28 pb-16 bg-light dark:bg-[#0B0F19]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-sm mb-4">
              <div className="relative w-[18px] h-[18px] animate-pulse">
                <Image src="/warning.png" alt="Emergency" fill className="object-contain" />
              </div>
              Emergency Assistance Request
            </div>
            <h1 className="text-4xl font-extrabold text-foreground mb-4">Get Help Now</h1>
            <p className="text-foreground/60 max-w-2xl mx-auto">
              Fill out the details below. Our nearest available technician will be dispatched to your location immediately.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800"
        >
          <div className="p-8 md:p-10">
            <form className="space-y-8">
              
              {/* Priority Toggle */}
              <div className={`p-5 rounded-2xl border-2 transition-colors flex items-center justify-between cursor-pointer ${isPriority ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'}`} onClick={() => setIsPriority(!isPriority)}>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center relative p-2.5 ${isPriority ? 'bg-primary/20 shadow-lg shadow-primary/10' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                    <div className="relative w-full h-full">
                      <Image src="/warning.png" alt="Priority" fill className="object-contain" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-foreground">High Priority Emergency</h3>
                    <p className="text-sm text-foreground/60">Move to the top of the queue for faster response</p>
                  </div>
                </div>
                <div className={`w-14 h-8 rounded-full p-1 transition-colors ${isPriority ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-700'}`}>
                  <div className={`w-6 h-6 rounded-full bg-white transition-transform ${isPriority ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Personal Info */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Full Name</label>
                    <input type="text" placeholder="John Doe" className="w-full px-5 py-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Mobile Number</label>
                    <input type="tel" placeholder="+91 98765 43210" className="w-full px-5 py-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                  </div>
                </div>

                {/* Vehicle Info */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Vehicle Type</label>
                    <select className="w-full px-5 py-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground">
                      <option>Car (Hatchback/Sedan)</option>
                      <option>SUV / MUV</option>
                      <option>Luxury Vehicle</option>
                      <option>Two-Wheeler</option>
                      <option>Commercial Vehicle</option>
                      <option>Electric Vehicle (EV)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Vehicle Number</label>
                    <input type="text" placeholder="KA 01 AB 1234" className="w-full px-5 py-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all uppercase" />
                  </div>
                </div>
              </div>

              {/* Issue Type */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Select Issue</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['Towing', 'Flat Tyre', 'Battery', 'Fuel', 'Lockout', 'Engine', 'Accident', 'Other'].map((issue) => (
                    <label key={issue} className="cursor-pointer">
                      <input type="radio" name="issue" className="peer sr-only" />
                      <div className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-center peer-checked:bg-primary peer-checked:text-white peer-checked:border-primary transition-all hover:bg-gray-50 dark:hover:bg-gray-800 peer-checked:hover:bg-primary font-medium">
                        {issue}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Pickup Location</label>
                <div className="flex gap-4">
                  <div className="relative flex-grow">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input type="text" placeholder="Search location or drop pin..." className="w-full pl-12 pr-5 py-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                  </div>
                  <button 
                    type="button"
                    onClick={handleDetectLocation}
                    className="flex items-center justify-center gap-2 px-6 py-4 bg-gray-900 dark:bg-gray-700 text-white rounded-xl font-semibold hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors whitespace-nowrap"
                  >
                    {locationDetecting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Navigation size={18} />
                        <span className="hidden sm:inline">Detect</span>
                      </>
                    )}
                  </button>
                </div>
                {/* Mock Map Area */}
                <div className="mt-4 w-full h-48 bg-gray-200 dark:bg-gray-800 rounded-xl relative overflow-hidden flex items-center justify-center group cursor-pointer border border-gray-200 dark:border-gray-700">
                   <div className="absolute inset-0 opacity-50 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
                   <div className="relative z-10 flex flex-col items-center">
                     <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg mb-2 group-hover:scale-110 transition-transform text-primary">
                       <MapPin size={24} />
                     </div>
                     <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Tap to select on map</span>
                   </div>
                </div>
              </div>

              {/* Upload Image */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Upload Image (Optional)</label>
                <div className="w-full border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer group">
                  <div className="w-16 h-16 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Camera size={32} />
                  </div>
                  <p className="font-semibold text-foreground mb-1">Click to upload or drag and drop</p>
                  <p className="text-sm text-foreground/50">SVG, PNG, JPG or GIF (max. 5MB)</p>
                </div>
              </div>

              {/* Submit Button */}
              <button className="w-full bg-gradient-to-r from-primary to-primary-hover text-white py-5 rounded-2xl font-bold text-xl shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:scale-[1.01] transition-all flex items-center justify-center gap-3">
                <ShieldCheck size={24} />
                Request Assistance Now
              </button>
              
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
