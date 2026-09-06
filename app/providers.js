"use client";

import { RoastProvider } from "@/context/RoastContext";
import { ThemeProvider } from "@/context/ThemeContext";

export default function Providers({ children }) {
  return (
    <ThemeProvider>
      <RoastProvider>
        {children}
      </RoastProvider>
    </ThemeProvider>
  );
}
