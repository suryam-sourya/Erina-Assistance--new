"use client";

import { motion } from "framer-motion";
import { Star, ShieldCheck } from "lucide-react";
import Image from "next/image";

interface GoogleReview {
  id: string;
  author: string;
  time: string;
  rating: number;
  text: string;
  profileColor: string;
  initials: string;
}

const reviews: GoogleReview[] = [
  {
    id: "gr-1",
    author: "Vijay Kanth Vijay",
    time: "a week ago",
    rating: 5,
    text: "I am a cab driver, founder Siraj has given best price on my Dzire car battery service is also nice",
    profileColor: "bg-green-600",
    initials: "VK",
  },
  {
    id: "gr-2",
    author: "Samagra Innovations",
    time: "a day ago",
    rating: 5,
    text: "GREAT Service Happy About Product Knowledge thank you",
    profileColor: "bg-red-600",
    initials: "SI",
  },
  {
    id: "gr-3",
    author: "Samagra Innovations1",
    time: "a day ago",
    rating: 5,
    text: "Good response",
    profileColor: "bg-green-500",
    initials: "SI",
  },
  {
    id: "gr-4",
    author: "Smart Porwal",
    time: "a week ago",
    rating: 5,
    text: "Very quick and professional service. Highly recommended for battery replacement.",
    profileColor: "bg-indigo-500",
    initials: "SP",
  },
  {
    id: "gr-5",
    author: "Sneha Patel",
    time: "1 month ago",
    rating: 5,
    text: "Saved my day. My battery died in the office basement. Reached out to Erina and they arrived with a jump starter very quickly. Very polite technician and transparent pricing. 5 stars!",
    profileColor: "bg-pink-600",
    initials: "SP",
  },
  {
    id: "gr-6",
    author: "Karthik N.",
    time: "2 months ago",
    rating: 5,
    text: "Fast, reliable, and reasonably priced. Their mobile charging unit gave me enough juice to reach my house safely. Fantastic tech!",
    profileColor: "bg-orange-500",
    initials: "KN",
  },
];

export default function GoogleReviewsSection() {
  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-900/50 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <div className="text-center md:text-left">
            <div className="flex flex-col items-center md:items-start mb-4">
              <span className="text-5xl md:text-6xl font-black text-yellow-400 dark:text-yellow-500 tracking-tight leading-none mb-1">
                ನಮ್ಮ
              </span>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl md:text-5xl font-black tracking-tighter">
                  <span className="text-[#FF0000]">B</span>
                  <span className="text-black dark:text-white">engalur</span>
                  <span className="text-[#FF0000]">u</span>
                </span>
                <span className="text-lg md:text-xl font-bold text-foreground/60 tracking-wide">
                  — Serving Now
                </span>
              </div>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-3">
              <span className="text-4xl font-black text-foreground">4.9</span>
              <div className="flex flex-col">
                <div className="flex gap-1 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={18} className="fill-[#FABB05] text-[#FABB05]" />
                  ))}
                </div>
                <span className="text-xs font-bold text-foreground/60 uppercase tracking-wider">
                  Based on 850+ Google Reviews
                </span>
              </div>
            </div>
          </div>
          
          <a
            href="https://g.page/r/CV0RzkDca74PEBI/review"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-6 py-3 rounded-full shadow-sm hover:shadow-md transition-all font-bold text-sm text-foreground hover:-translate-y-0.5"
          >
            {/* Google G Logo SVG */}
            <svg viewBox="0 0 24 24" className="w-5 h-5">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Write a Review
          </a>
        </div>

        {/* Marquee Container */}
        <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          
          <motion.div
            className="flex gap-6 w-max"
            animate={{
              x: ["0%", "-50%"],
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 40,
                ease: "linear",
              },
            }}
          >
            {/* Double the array for seamless looping */}
            {[...reviews, ...reviews].map((review, i) => (
              <div
                key={`${review.id}-${i}`}
                className="w-[350px] md:w-[400px] shrink-0 bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col"
              >
                {/* Author Info */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${review.profileColor} flex items-center justify-center text-white font-bold`}>
                      {review.initials}
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground text-sm">{review.author}</h4>
                      <div className="flex items-center gap-1 mt-0.5 text-[10px] text-foreground/50">
                        <span>{review.time}</span>
                        <span>•</span>
                        <div className="flex items-center text-gray-500 dark:text-gray-400">
                           <ShieldCheck size={10} className="mr-0.5" />
                           Verified
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Google Logo small */}
                  <svg viewBox="0 0 24 24" className="w-5 h-5 opacity-80">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                </div>

                {/* Stars */}
                <div className="flex gap-0.5 mb-3">
                  {[...Array(review.rating)].map((_, index) => (
                    <Star key={index} size={14} className="fill-[#FABB05] text-[#FABB05]" />
                  ))}
                </div>

                {/* Text */}
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {review.text}
                </p>
              </div>
            ))}
          </motion.div>
        </div>

      </div>
    </section>
  );
}
