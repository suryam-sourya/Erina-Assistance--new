'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  {
    question: "What areas in Bengaluru do you serve?",
    answer: "We provide rapid roadside assistance across all major areas in Bengaluru, including Whitefield, Indiranagar, Koramangala, HSR Layout, Electronic City, and more. Our dispatch network ensures a technician reaches you anywhere in the city."
  },
  {
    question: "How quickly can a technician reach my location?",
    answer: "Our average response time is between 20 to 30 minutes, depending on traffic conditions and your exact location within Bengaluru. We prioritize emergencies to get you back on the road safely and quickly."
  },
  {
    question: "Are there any hidden charges for jumpstarts or towing?",
    answer: "Absolutely not. We believe in 100% transparent pricing. You will be informed of the exact cost before the technician is dispatched. Jumpstarts typically start at just ₹299."
  },
  {
    question: "Do you sell new car batteries with warranties?",
    answer: "Yes! We stock premium brands like Amaron and Exide. All our new batteries come with official manufacturer warranties (up to 60 months) and include free doorstep installation."
  },
  {
    question: "Is your roadside assistance service available 24/7?",
    answer: "Yes, car troubles don't run on a schedule, and neither do we. Erina Assistance operates 24 hours a day, 7 days a week, including holidays and weekends."
  }
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 bg-dark relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <span className="text-secondary font-bold tracking-wider uppercase text-sm mb-3 block">Got Questions?</span>
          <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight">
            Frequently Asked <span className="text-primary">Questions</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Everything you need to know about our roadside assistance, pricing, and service areas.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index} 
                className={`glass-panel rounded-2xl overflow-hidden transition-colors duration-300 ${isOpen ? 'border-secondary/50' : 'hover:border-white/20'}`}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full text-left px-6 py-5 flex items-center justify-between focus:outline-none"
                >
                  <span className={`font-bold text-lg md:text-xl transition-colors ${isOpen ? 'text-secondary' : 'text-white'}`}>
                    {faq.question}
                  </span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${isOpen ? 'bg-secondary/20 rotate-180' : 'bg-white/5'}`}>
                    <ChevronDown size={18} className={isOpen ? 'text-secondary' : 'text-gray-400'} />
                  </div>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-6 pt-0 text-gray-400 leading-relaxed text-base md:text-lg">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
