"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by waiting for component to mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-10 h-10 rounded-full bg-foreground/5 animate-pulse" />;
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative flex items-center justify-center w-10 h-10 rounded-full bg-foreground/5 hover:bg-foreground/10 text-foreground transition-colors group overflow-hidden"
      aria-label="Toggle theme"
    >
      <div className="absolute inset-0 flex items-center justify-center transition-transform duration-500 ease-in-out dark:-translate-y-10 translate-y-0">
        <Moon size={20} className="text-foreground/80 group-hover:text-primary transition-colors" />
      </div>
      <div className="absolute inset-0 flex items-center justify-center transition-transform duration-500 ease-in-out dark:translate-y-0 translate-y-10">
        <Sun size={20} className="text-foreground/80 group-hover:text-primary transition-colors" />
      </div>
    </button>
  );
}
