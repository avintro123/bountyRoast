"use client";

import { useState, useEffect, useRef } from "react";
import { useRoasts } from "@/context/RoastContext";

export default function NotificationBell() {
  const { tickerEvents } = useRoasts();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [lastSeenCount, setLastSeenCount] = useState(0);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem("bellLastSeen");
      if (stored) setLastSeenCount(parseInt(stored, 10));
    } catch (e) {}
  }, []);

  const unreadCount = mounted ? Math.max(0, tickerEvents.length - lastSeenCount) : 0;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Mark all as read
      setLastSeenCount(tickerEvents.length);
      if (typeof window !== "undefined") {
        localStorage.setItem("bellLastSeen", String(tickerEvents.length));
      }
    }
  };

  return (
    <div style={{ position: "relative" }} ref={dropdownRef}>
      <button
        className="icon-btn"
        onClick={handleToggle}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} new)` : ""}`}
        id="notification-bell"
      >
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <span>LIVE ACTIVITY</span>
            <button
              style={{ background: "none", border: "none", color: "var(--accent-coral)", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}
              onClick={() => {
                setLastSeenCount(tickerEvents.length);
                localStorage.setItem("bellLastSeen", String(tickerEvents.length));
              }}
            >
              Mark all read
            </button>
          </div>
          <div className="notification-list">
            {tickerEvents.slice(0, 15).map((event, i) => (
              <div
                key={i}
                className={`notification-item ${i < unreadCount ? "notification-unread" : ""}`}
              >
                {event}
              </div>
            ))}
            {tickerEvents.length === 0 && (
              <div className="notification-item" style={{ color: "var(--text-dim)" }}>
                No events yet. Start roasting! 🔥
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
