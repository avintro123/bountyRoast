"use client";

import { createContext, useContext, useSyncExternalStore, useEffect } from "react";

const ThemeContext = createContext({
  theme: "light",
  toggleTheme: () => {},
  mounted: false,
});

const emptySubscribe = () => () => {};

function subscribeTheme(callback) {
  window.addEventListener("storage", callback);
  window.addEventListener("themechange", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("themechange", callback);
  };
}

function getThemeSnapshot() {
  return localStorage.getItem("bountyroast_theme") || "light";
}

function getServerSnapshot() {
  return "light";
}

export function ThemeProvider({ children }) {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);
  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getServerSnapshot);

  // Sync DOM attributes whenever theme changes
  useEffect(() => {
    if (theme === "dark" || theme === "light") {
      document.documentElement.setAttribute("data-theme", theme);
      document.documentElement.classList.toggle("dark", theme === "dark");
    }
  }, [theme]);

  const toggleTheme = () => {
    const current = localStorage.getItem("bountyroast_theme") || "light";
    const next = current === "dark" ? "light" : "dark";
    localStorage.setItem("bountyroast_theme", next);
    document.documentElement.setAttribute("data-theme", next);
    document.documentElement.classList.toggle("dark", next === "dark");
    window.dispatchEvent(new Event("themechange"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
