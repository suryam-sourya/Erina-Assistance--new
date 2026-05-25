"use client";

import { motion } from 'framer-motion';
import { Phone, MessageCircle, Mail, MapPin, Send } from 'lucide-react';

export default function ContactPage() {
  return (
    <div className="min-h-screen pt-28 pb-24 bg-light dark:bg-[#0B0F19]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">Get in <span className="text-primary">Touch</span></h1>
            <p className="text-lg text-foreground/60">
              Have a question about our services or need immediate assistance? We&apos;re here 24/7 to help you.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Contact Info Cards */}
          <div className="lg:col-span-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6 h-fit">
            <motion.div 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-800 flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Phone size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground mb-1">Call Us (24/7)</h3>
                <p className="text-foreground/60 text-sm mb-2">Immediate emergency support</p>
                <a href="tel:+917340066655" className="text-primary font-bold hover:underline">+91 73400 66655</a>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-800 flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-[#25D366]/10 text-[#25D366] flex items-center justify-center shrink-0">
                <MessageCircle size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground mb-1">WhatsApp</h3>
                <p className="text-foreground/60 text-sm mb-2">Share location easily</p>
                <a href="https://wa.me/917340066655" target="_blank" className="text-[#25D366] font-bold hover:underline">Chat with us</a>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-800 flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                <Mail size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground mb-1">Email</h3>
                <p className="text-foreground/60 text-sm mb-2">For queries & partnerships</p>
                <a href="mailto:support@erinaassistance.in" className="text-blue-500 font-bold hover:underline text-sm truncate block">support@erinaassistance.in</a>
              </div>
            </motion.div>

             <motion.div 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
              className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-800 flex items-start gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
                <MapPin size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground mb-1">Headquarters</h3>
                <p className="text-foreground/60 text-sm leading-relaxed">
                  123 Tech Park, HSR Layout, <br />
                  Bangalore, Karnataka 560102
                </p>
              </div>
            </motion.div>
          </div>

          {/* Contact Form */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100 dark:border-gray-800"
          >
            <h2 className="text-2xl font-bold text-foreground mb-8">Send us a message</h2>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Full Name</label>
                  <input type="text" className="w-full px-5 py-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Mobile Number</label>
                  <input type="tel" className="w-full px-5 py-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Subject</label>
                <input type="text" className="w-full px-5 py-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Message</label>
                <textarea rows={5} className="w-full px-5 py-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"></textarea>
              </div>

              <button type="button" className="bg-primary text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 w-full md:w-auto">
                <Send size={20} />
                Send Message
              </button>
            </form>
          </motion.div>

        </div>
        
        {/* Map Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mt-12 bg-gray-200 dark:bg-gray-800 w-full h-[400px] rounded-3xl overflow-hidden relative border border-gray-200 dark:border-gray-700"
        >
           <div className="absolute inset-0 opacity-50 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
           <div className="absolute inset-0 flex items-center justify-center flex-col gap-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white shadow-xl shadow-primary/30 animate-bounce">
                <MapPin size={32} />
              </div>
              <div className="bg-white dark:bg-gray-900 px-6 py-3 rounded-xl shadow-lg font-bold">
                Erina Assistance HQ
              </div>
           </div>
        </motion.div>

      </div>
    </div>
  );
}
