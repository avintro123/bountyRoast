"use client";

import { AuthProvider } from "@/context/AuthContext";
import { RoastProvider } from "@/context/RoastContext";
import { ThemeProvider } from "@/context/ThemeContext";

export default function Providers({ children }) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RoastProvider>
          {children}
        </RoastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
