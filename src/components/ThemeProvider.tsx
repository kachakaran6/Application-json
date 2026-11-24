"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Sun, Moon, Laptop } from "lucide-react";
import { Button } from "@/components/ui/button";

type Theme = "dark" | "light" | "system";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: "dark" | "light";
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Read saved preference or default to system/dark
    const saved = localStorage.getItem("theme") as Theme | null;
    const initialTheme = saved || "dark";
    setThemeState(initialTheme);
    applyTheme(initialTheme);
    setMounted(true);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        applyTheme("system");
      }
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  function applyTheme(t: Theme) {
    const root = document.documentElement;
    let actual: "dark" | "light" = "dark";

    if (t === "system") {
      actual = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    } else {
      actual = t;
    }

    setResolvedTheme(actual);
    root.classList.remove("light", "dark");
    root.classList.add(actual);
  }

  function setTheme(newTheme: Theme) {
    setThemeState(newTheme);
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
  }

  function toggleTheme() {
    const next = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(next);
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="secondary"
        size="iconSm"
        className="h-8 w-8 text-muted-foreground opacity-50"
        aria-label="Toggle theme"
      >
        <Moon className="w-3.5 h-3.5" />
      </Button>
    );
  }

  return (
    <Button
      variant="secondary"
      size="iconSm"
      onClick={toggleTheme}
      title={resolvedTheme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className="h-8 w-8 text-muted-foreground hover:text-foreground transition-colors"
      aria-label="Toggle theme"
    >
      {resolvedTheme === "dark" ? (
        <Sun className="w-3.5 h-3.5 text-amber-400 hover:text-amber-300 transition-transform hover:rotate-45" />
      ) : (
        <Moon className="w-3.5 h-3.5 text-slate-700 hover:text-slate-900 transition-transform hover:-rotate-12" />
      )}
    </Button>
  );
}
