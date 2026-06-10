"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const banners = [
  {
    id: 1,
    src: '/towing-banner.png',
    alt: 'Professional Towing Service',
    link: '/booking',
  },
  {
    id: 2,
    src: '/hero-bg.png', // Temporary secondary banner to show carousel effect
    alt: '24/7 Roadside Assistance',
    link: '/booking',
  }
];

export default function PromoBannerCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [isHovered]);

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev + 1));
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div 
        className="relative w-full aspect-[16/9] sm:aspect-[21/9] md:aspect-[3/1] lg:aspect-[4/1] rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] group cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Image 
              src={banners[currentIndex].src} 
              alt={banners[currentIndex].alt} 
              fill 
              className="object-cover"
              priority={currentIndex === 0}
            />
          </motion.div>
        </AnimatePresence>

        {/* Amazon-style Left Arrow */}
        <button 
          onClick={(e) => { e.preventDefault(); prevSlide(); }}
          className="absolute left-0 top-0 bottom-0 w-12 md:w-16 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
        >
          <div className="bg-white/80 backdrop-blur-md p-2 rounded-r-xl border border-white shadow-lg text-gray-800 hover:bg-white hover:text-primary transition-colors">
            <ChevronLeft size={32} />
          </div>
        </button>

        {/* Amazon-style Right Arrow */}
        <button 
          onClick={(e) => { e.preventDefault(); nextSlide(); }}
          className="absolute right-0 top-0 bottom-0 w-12 md:w-16 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
        >
          <div className="bg-white/80 backdrop-blur-md p-2 rounded-l-xl border border-white shadow-lg text-gray-800 hover:bg-white hover:text-primary transition-colors">
            <ChevronRight size={32} />
          </div>
        </button>

        {/* Pagination Dots */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 shadow-md ${
                idx === currentIndex ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
