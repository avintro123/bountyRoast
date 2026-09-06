"use client";

import { useState, useEffect } from "react";
import { useRoasts } from "@/context/RoastContext";

function AnimatedNumber({ value, prefix = "" }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const duration = 1200;
    const startTime = Date.now();
    const startVal = 0;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(startVal + (value - startVal) * eased));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return (
    <span className="stat-value">
      {prefix}
      {display.toLocaleString()}
    </span>
  );
}

export default function StatsBar() {
  const { stats } = useRoasts();
  const [spectators, setSpectators] = useState(stats.spectatorsOnline || 412);

  useEffect(() => {
    const interval = setInterval(() => {
      setSpectators((prev) =>
        Math.max(100, prev + Math.floor(Math.random() * 7) - 3),
      );
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="stats-bar">
      <div className="stat-item">
        <AnimatedNumber value={stats.totalBounties} prefix="$" />
        <span className="stat-label">Total Bounties Placed</span>
      </div>
      <div className="stat-item">
        <AnimatedNumber value={stats.activeRoasts} />
        <span className="stat-label">Live on The Grill</span>
      </div>
      <div className="stat-item">
        <AnimatedNumber value={spectators} />
        <span className="stat-label">Spectators Online</span>
      </div>
      <div className="stat-item">
        <AnimatedNumber value={stats.defensesThisHour || 14} />
        <span className="stat-label">Defended Today</span>
      </div>
    </div>
  );
}
