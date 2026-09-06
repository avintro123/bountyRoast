"use client";

import { useState, useEffect, useRef } from "react";

export default function CountdownTimer({ expiresAt, onExpire, compact = false }) {
  const [timeLeft, setTimeLeft] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    function calc() {
      const now = Date.now();
      const end = new Date(expiresAt).getTime();
      const diff = end - now;
      if (diff <= 0) {
        setTimeLeft({ expired: true, total: 0 });
        if (onExpire) onExpire();
        clearInterval(intervalRef.current);
        return;
      }

      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, total: diff, expired: false });
    }

    calc();
    intervalRef.current = setInterval(calc, 1000);
    return () => clearInterval(intervalRef.current);
  }, [expiresAt, onExpire]);

  if (!timeLeft) return null;

  if (timeLeft.expired) {
    return (
      <span className="countdown-pill countdown-expired">
        ☠️ Expired
      </span>
    );
  }

  // Urgency levels
  const isUrgent = timeLeft.total < 3600000; // under 1 hour
  const isWarning = timeLeft.total < 21600000; // under 6 hours
  const urgencyClass = isUrgent
    ? "countdown-urgent"
    : isWarning
      ? "countdown-warning"
      : "countdown-safe";

  if (compact) {
    const display = timeLeft.days > 0
      ? `${timeLeft.days}d ${timeLeft.hours}h left`
      : timeLeft.hours > 0
        ? `${timeLeft.hours}h ${timeLeft.minutes}m left`
        : `${timeLeft.minutes}m ${timeLeft.seconds}s left`;

    return (
      <span className={`countdown-pill ${urgencyClass}`}>
        ⏱️ {display}
      </span>
    );
  }

  // Full display
  return (
    <div className={`countdown-pill ${urgencyClass}`} style={{ padding: "8px 16px", fontSize: "13px", gap: "8px" }}>
      <span>⏰ Deadline:</span>
      <strong>
        {timeLeft.days > 0 ? `${timeLeft.days}d ` : ""}
        {String(timeLeft.hours).padStart(2, "0")}h : {String(timeLeft.minutes).padStart(2, "0")}m : {String(timeLeft.seconds).padStart(2, "0")}s
      </strong>
    </div>
  );
}
