"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import NotificationBell from "./NotificationBell";
import ThemeToggle from "./ThemeToggle";
import PopupModal from "./PopupModal";
import { toggleMute, isMuted } from "@/lib/sounds";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const pathname = usePathname();
  const { user, twitterHandle, signInWithTwitter, signOut, devLoginAs } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [devInput, setDevInput] = useState("");
  const [authError, setAuthError] = useState(null);
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

  const handleTwitterLogin = async () => {
    try {
      setAuthError(null);
      await signInWithTwitter();
    } catch (err) {
      setAuthError(err.message || "Could not launch Twitter OAuth.");
    }
  };

  const handleDevLogin = (e) => {
    e.preventDefault();
    if (!devInput.trim()) return;
    devLoginAs(devInput.trim());
    setDevInput("");
    setShowAuthModal(false);
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
              className={`btn btn-sm ${twitterHandle ? "btn-coral" : "btn-outline"}`}
              onClick={() => setShowAuthModal(true)}
              style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}
            >
              {twitterHandle ? (
                <>
                  <span style={{ fontSize: "14px" }}>🛡️</span>
                  <span>@{twitterHandle}</span>
                </>
              ) : (
                "Connect 𝕏"
              )}
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
                className={`btn btn-block ${twitterHandle ? "btn-coral" : "btn-fire"}`}
                onClick={() => {
                  setMobileOpen(false);
                  setShowAuthModal(true);
                }}
              >
                {twitterHandle ? `✓ 𝕏 Connected (@${twitterHandle})` : "Connect 𝕏 Account"}
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

      {/* 𝕏 Authentication / Founder Claim Modal */}
      <PopupModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title={twitterHandle ? "Your 𝕏 Founder Identity" : "Connect 𝕏 Account"}
      >
        {twitterHandle ? (
          <div style={{ textAlign: "center", padding: "12px 0" }}>
            <img
              src={`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${twitterHandle}`}
              alt="avatar"
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "var(--radius-md)",
                margin: "0 auto 12px",
                border: "2px solid var(--accent-coral)",
              }}
            />
            <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-primary)" }}>
              @{twitterHandle}
            </div>
            <div style={{ fontSize: "12px", color: "var(--status-emerald)", fontWeight: 600, marginTop: "4px" }}>
              🛡️ Verified 𝕏 Identity Active
            </div>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "16px 0 20px" }}>
              You have access to claim founder defense chambers targeting <strong>@{twitterHandle}</strong>.
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                className="btn btn-outline btn-block"
                onClick={() => {
                  signOut();
                  setShowAuthModal(false);
                }}
              >
                Disconnect / Sign Out
              </button>
              <button
                className="btn btn-coral btn-block"
                onClick={() => setShowAuthModal(false)}
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "16px" }}>
              Connect your 𝕏 (Twitter) account to prove founder ownership and unlock the <strong>Founder Defense Chamber</strong>.
            </p>

            <button
              className="btn btn-coral btn-lg btn-block"
              onClick={handleTwitterLogin}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "18px" }}
            >
              <span>𝕏</span>
              <span>Sign in with Twitter</span>
            </button>

            {authError && (
              <p style={{ color: "var(--accent-coral)", fontSize: "12px", marginBottom: "14px" }}>
                {authError}
              </p>
            )}

            <div style={{ borderTop: "1px dashed var(--border-subtle)", paddingTop: "14px", marginTop: "14px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                ⚡ Developer & Testing Sandbox
              </div>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "10px" }}>
                Simulate any founder identity locally to test Defense Chamber immunity:
              </p>
              <form onSubmit={handleDevLogin} style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  placeholder="e.g. shipcaptainAI"
                  value={devInput}
                  onChange={(e) => setDevInput(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    background: "var(--bg-subtle)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-md)",
                    color: "var(--text-primary)",
                    fontSize: "13px",
                  }}
                />
                <button type="submit" className="btn btn-outline btn-sm">
                  Simulate
                </button>
              </form>
            </div>
          </div>
        )}
      </PopupModal>
    </>
  );
}
