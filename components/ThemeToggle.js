"use client";

import { useTheme } from "@/context/ThemeContext";

export default function ThemeToggle({ className = "", id = "theme-toggle" }) {
  const { theme, toggleTheme, mounted } = useTheme();

  // Until mounted on client, render a placeholder button to avoid hydration mismatch
  if (!mounted) {
    return (
      <button
        className={`icon-btn ${className}`}
        aria-label="Toggle theme"
        disabled
        id={id}
        style={{ opacity: 0.7 }}
      >
        <span>🌙</span>
      </button>
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      className={`icon-btn ${className}`}
      onClick={toggleTheme}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      id={id}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "14px",
      }}
    >
      <span
        style={{
          display: "inline-block",
          transform: isDark ? "rotate(360deg)" : "rotate(0deg)",
          transition: "transform 0.3s ease",
        }}
      >
        {isDark ? "☀️" : "🌙"}
      </span>
    </button>
  );
}
