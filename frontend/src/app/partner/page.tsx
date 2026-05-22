"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wrench, Users, Briefcase } from 'lucide-react';

export default function PartnerPage() {
  const [activeTab, setActiveTab] = useState('garage');

  const tabs = [
    { id: 'garage', label: 'Garage Partner', icon: <Wrench size={18} /> },
    { id: 'technician', label: 'Technician', icon: <Users size={18} /> },
    { id: 'fleet', label: 'Fleet Partner', icon: <Briefcase size={18} /> }
  ];

  return (
    <div className="min-h-screen pt-28 pb-24 bg-light dark:bg-[#0B0F19]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl font-extrabold text-foreground mb-4">Partner With <span className="text-primary">Erina</span></h1>
            <p className="text-foreground/60 max-w-2xl mx-auto">
              Join Bangalore&apos;s fastest-growing AI-powered roadside assistance network. Grow your business and earn more with reliable leads.
            </p>
          </motion.div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800">
          
          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-800 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-5 font-semibold text-sm transition-colors min-w-[150px] relative ${activeTab === tab.id ? 'text-primary' : 'text-foreground/60 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
              >
                {tab.icon}
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />
                )}
              </button>
            ))}
          </div>

          {/* Form Content */}
          <div className="p-8 md:p-10">
            <motion.form 
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    {activeTab === 'garage' ? 'Garage Name' : activeTab === 'technician' ? 'Full Name' : 'Company Name'}
                  </label>
                  <input type="text" className="w-full px-5 py-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Mobile Number</label>
                  <input type="tel" className="w-full px-5 py-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Email Address</label>
                <input type="email" className="w-full px-5 py-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
              </div>

              {activeTab === 'garage' && (
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Services Offered</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {['Towing', 'Mechanic', 'Electrical', 'Tyre Repair', 'AC Repair', 'Denting/Painting'].map((service) => (
                      <label key={service} className="flex items-center gap-2 cursor-pointer p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <input type="checkbox" className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary" />
                        <span className="text-sm font-medium">{service}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'technician' && (
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Years of Experience</label>
                  <select className="w-full px-5 py-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground">
                    <option>0-2 Years</option>
                    <option>3-5 Years</option>
                    <option>5-10 Years</option>
                    <option>10+ Years</option>
                  </select>
                </div>
              )}

              {activeTab === 'fleet' && (
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Fleet Size</label>
                  <select className="w-full px-5 py-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground">
                    <option>5-10 Vehicles</option>
                    <option>11-50 Vehicles</option>
                    <option>50-100 Vehicles</option>
                    <option>100+ Vehicles</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Location / Area in Bangalore</label>
                <input type="text" placeholder="e.g. Indiranagar, HSR Layout" className="w-full px-5 py-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
              </div>

              <button type="button" className="w-full bg-gradient-to-r from-primary to-primary-hover text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5 transition-all mt-4">
                Submit Application
              </button>
            </motion.form>
          </div>
        </div>
      </div>
    </div>
  );
}
