"use client";

import { motion } from "framer-motion";
import { BatteryCharging, RefreshCcw, IndianRupee } from "lucide-react";
import Link from "next/link";

export default function ScrapBatteryBanner() {
  return (
    <section className="py-8 bg-black">
      <div className="container mx-auto px-4 max-w-5xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-yellow-500/20 via-orange-500/10 to-yellow-500/5 border border-yellow-500/20"
        >
          {/* Decorative background blur */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-yellow-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl" />

          <div className="relative z-10 p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1 text-center md:text-left space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-xs font-black uppercase tracking-wider">
                <RefreshCcw size={14} /> New Feature
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                Got an Old Car Battery? <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                  Exchange it for Instant Cash Discount!
                </span>
              </h2>
              <p className="text-foreground/70 text-sm max-w-lg mx-auto md:mx-0 leading-relaxed">
                Don't let your dead battery go to waste. When you book a battery replacement with us, hand over your old scrap battery and get an instant, fair-value discount on your final bill. 
              </p>
            </div>

            <div className="flex-shrink-0 flex flex-col items-center gap-4">
              <div className="flex items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-black border border-white/10 flex items-center justify-center relative shadow-lg">
                  <BatteryCharging size={24} className="text-white/40" />
                  <div className="absolute -bottom-2 -right-2 text-xl">❌</div>
                </div>
                <div className="text-yellow-500">
                  <RefreshCcw size={20} className="animate-spin-slow" />
                </div>
                <div className="w-12 h-12 rounded-xl bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center relative shadow-lg shadow-yellow-500/10">
                  <IndianRupee size={24} className="text-yellow-500" />
                  <div className="absolute -top-2 -right-2 text-xl">✅</div>
                </div>
              </div>
              
              <Link 
                href="/booking?service=urgent_battery" 
                className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-black uppercase tracking-wider text-sm rounded-xl shadow-lg shadow-yellow-500/20 transition-all hover:scale-105"
              >
                Book Battery Service
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
