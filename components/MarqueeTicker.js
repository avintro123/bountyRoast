"use client";

import { useRoasts } from "@/context/RoastContext";

export default function MarqueeTicker() {
  const { tickerEvents } = useRoasts();
  const doubled = [...tickerEvents, ...tickerEvents];

  return (
    <div className="marquee-ticker">
      <div className="marquee-content">
        {doubled.map((event, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
            <span>{event}</span>
            <span style={{ color: "var(--border-strong)", margin: "0 8px" }}>·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
