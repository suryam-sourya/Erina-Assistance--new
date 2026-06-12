"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUserStore } from "@/store/userStore";
import { CheckCircle2, X } from "lucide-react";

export default function WelcomeToast() {
  const { user } = useUserStore();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (user) {
      // Check if we already showed the welcome toast in this session
      const hasWelcomed = sessionStorage.getItem(`welcomed_${user.uid}`);
      if (!hasWelcomed) {
        setShow(true);
        sessionStorage.setItem(`welcomed_${user.uid}`, "true");
        
        // Play Audio Greeting
        if (typeof window !== "undefined" && "speechSynthesis" in window) {
          const name = user.displayName ? user.displayName.split(" ")[0] : "";
          const text = `Welcome to Erina Assistance, Namma Bengaluru. ${name ? `Glad to see you, ${name}.` : "We are ready to help."}`;
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 0.9; // Slightly slower, more professional
          utterance.pitch = 1.1; // Friendly pitch
          window.speechSynthesis.speak(utterance);
        }

        // Auto dismiss after 5 seconds
        const timer = setTimeout(() => {
          setShow(false);
        }, 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [user]);

  return (
    <AnimatePresence>
      {show && user && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl rounded-2xl px-5 py-3"
        >
          <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center shrink-0 border border-success/30">
            <CheckCircle2 className="w-5 h-5 text-success" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-white tracking-wide">
              Welcome back{user.displayName ? `, ${user.displayName.split(" ")[0]}` : ""}!
            </span>
            <span className="text-xs text-white/70">
              Ready for a safe journey?
            </span>
          </div>
          <button
            onClick={() => setShow(false)}
            className="ml-4 p-1 hover:bg-white/10 rounded-full transition-colors text-white/50 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
