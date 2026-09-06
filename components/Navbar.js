"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import NotificationBell from "./NotificationBell";
import ThemeToggle from "./ThemeToggle";
import { toggleMute, isMuted } from "@/lib/sounds";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [connected, setConnected] = useState(false);
  const [showConnectNotice, setShowConnectNotice] = useState(false);
  const [soundMuted, setSoundMuted] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("soundMuted") === "true";
      if (stored && !isMuted()) toggleMute();
      return stored;
    }
    return false;
  });

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileOpen(false);
  }

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const links = [
    { href: "/", label: "The Grill" },
    { href: "/drop", label: "Drop a Roast" },
    { href: "/#hall-of-flame", label: "Hall of Flame" },
    { href: "/#how-it-works", label: "How It Works" },
  ];

  const handleConnect = () => {
    setConnected((prev) => !prev);
    setShowConnectNotice(true);
    setTimeout(() => {
      setShowConnectNotice(false);
    }, 2800);
  };

  const handleSoundToggle = () => {
    const newMuted = toggleMute();
    setSoundMuted(newMuted);
    if (typeof window !== "undefined") {
      localStorage.setItem("soundMuted", String(newMuted));
    }
  };

  return (
    <>
      <header className="navbar">
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Link href="/" className="navbar-logo">
            🔥 bountyroast.lol
          </Link>
          <div className="navbar-stats-pill desktop-only">
            <span className="dot" />
            <span>42 live roasts · $14,250 active</span>
          </div>
        </div>

        {/* Desktop Links */}
        <ul className="navbar-links desktop-only">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={pathname === link.href ? "active" : ""}
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <NotificationBell />
          </li>
          <li>
            <ThemeToggle id="theme-toggle-desktop" />
          </li>
          <li>
            <button
              className="icon-btn"
              onClick={handleSoundToggle}
              title={soundMuted ? "Unmute sounds" : "Mute sounds"}
              aria-label={soundMuted ? "Unmute sounds" : "Mute sounds"}
              id="sound-toggle"
            >
              {soundMuted ? "🔇" : "🔊"}
            </button>
          </li>
          <li>
            <button
              className={`btn btn-sm ${connected ? "btn-coral" : "btn-outline"}`}
              onClick={handleConnect}
              style={{ cursor: "pointer" }}
            >
              {connected ? "✓ @you" : "Connect 𝕏"}
            </button>
          </li>
        </ul>

        {/* Mobile Hamburger Toggle */}
        <div className="navbar-mobile-actions">
          <ThemeToggle id="theme-toggle-mobile" />
          <NotificationBell />
          <button
            className="icon-btn"
            onClick={handleSoundToggle}
            title={soundMuted ? "Unmute sounds" : "Mute sounds"}
          >
            {soundMuted ? "🔇" : "🔊"}
          </button>
          <button
            className="navbar-hamburger"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close Menu" : "Open Menu"}
            aria-expanded={mobileOpen}
          >
            <span className={`hamburger-bar ${mobileOpen ? "open" : ""}`} />
            <span className={`hamburger-bar ${mobileOpen ? "open" : ""}`} />
            <span className={`hamburger-bar ${mobileOpen ? "open" : ""}`} />
          </button>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileOpen && (
        <div
          className="mobile-nav-overlay"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="mobile-nav-drawer"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mobile-nav-header">
              <span className="navbar-logo" style={{ fontSize: "12px" }}>
                🔥 MENU
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ThemeToggle id="theme-toggle-drawer" />
                <button
                  className="mobile-nav-close"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close Menu"
                >
                  ✕
                </button>
              </div>
            </div>

            <ul className="mobile-nav-links">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`mobile-nav-item ${pathname === link.href ? "active" : ""}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mobile-nav-footer">
              <button
                className={`btn btn-block ${connected ? "btn-lime" : "btn-fire"}`}
                onClick={() => {
                  handleConnect();
                  setMobileOpen(false);
                }}
              >
                {connected ? "✓ 𝕏 Connected (@you)" : "Connect 𝕏 Account"}
              </button>
              <div style={{ marginTop: "12px", textAlign: "center" }}>
                <span
                  style={{
                    fontSize: "10px",
                    color: "var(--text-dim)",
                    fontFamily: "var(--font-pixel)",
                  }}
                >
                  OUT-ROAST OR BE ROASTED
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Connect Toast */}
      {showConnectNotice && (
        <div className="connect-toast">
          {connected
            ? "⚡ Connected as @you (Prototype Mode)"
            : "Disconnected from 𝕏"}
        </div>
      )}
    </>
  );
}
