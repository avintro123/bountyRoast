"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRoasts } from "@/context/RoastContext";
import { hallOfFlame as staticHallOfFlame } from "@/data/mockRoasts";
import RoastCard from "@/components/RoastCard";
import StatsBar from "@/components/StatsBar";
import SearchFilter from "@/components/SearchFilter";

export default function HomePage() {
  const router = useRouter();
  const { roasts, expiredRoasts } = useRoasts();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [quickHandle, setQuickHandle] = useState("");

  const handleQuickRoast = (e) => {
    e.preventDefault();
    const clean = quickHandle.replace(/^@/, "").trim();
    if (clean) {
      router.push(`/drop?handle=${encodeURIComponent(clean)}`);
    } else {
      router.push("/drop");
    }
  };

  // Filter and sort roasts
  const filteredRoasts = useMemo(() => {
    let list = [...roasts];

    // Apply status filter
    if (activeFilter === "all") {
      list = list.filter((r) => r.defenseStatus !== "cleared");
    } else if (activeFilter === "none") {
      list = list.filter((r) => r.defenseStatus === "none");
    } else if (activeFilter === "defended") {
      list = list.filter((r) => r.defenseStatus === "defended" || r.defenseStatus === "cleared");
    } else {
      list = list.filter((r) => r.defenseStatus === activeFilter);
    }

    // Apply search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().replace(/^@/, "");
      list = list.filter(
        (r) =>
          r.target.handle.toLowerCase().includes(q) ||
          r.target.displayName?.toLowerCase().includes(q) ||
          r.roastText.toLowerCase().includes(q) ||
          r.roaster.handle.toLowerCase().includes(q)
      );
    }

    // Sort by bounty
    return list.sort((a, b) => b.bountyAmount - a.bountyAmount);
  }, [roasts, searchQuery, activeFilter]);

  // Combine static + dynamically expired roasts for Hall of Flame
  const allHallOfFlame = useMemo(() => {
    return [...expiredRoasts, ...staticHallOfFlame];
  }, [expiredRoasts]);

  return (
    <div className="container">
      {/* ── 1. Clean Human Hero Section ── */}
      <section className="hero">
        <div className="hero-pill-badge">
          <span>🔥 The Public Founder Roast Leaderboard</span>
        </div>

        <h1 className="hero-title">
          Put a Bounty on <span className="highlight-cayenne">Any Founder</span>
        </h1>

        <p className="hero-subtitle">
          Transparent, pay-to-rank roasts. Back your take with cash. Founders have 72 hours to defend, or stay flame-grilled.
        </p>

        {/* Clean Quick Drop Action Bar */}
        <form onSubmit={handleQuickRoast} className="hero-action-bar">
          <span style={{ fontSize: "15px", color: "var(--text-muted)" }}>🎯</span>
          <input
            type="text"
            className="hero-action-input"
            placeholder="Enter founder handle or URL (e.g. @shipcaptainAI)..."
            value={quickHandle}
            onChange={(e) => setQuickHandle(e.target.value)}
          />
          <button type="submit" className="btn btn-cayenne">
            Drop Roast · $5
          </button>
        </form>
      </section>

      {/* ── 2. Clean Stats Bar ── */}
      <StatsBar />

      {/* ── 3. The Grill Leaderboard ── */}
      <section className="section" id="the-grill" style={{ paddingTop: 0 }}>
        <div className="section-header">
          <h2 className="section-title">
            <span>🔥 The Grill</span>
            <span className="badge badge-defended" style={{ fontSize: "11px", padding: "3px 10px" }}>
              {filteredRoasts.length} Live
            </span>
          </h2>
        </div>

        {/* Category Pills & Search */}
        <SearchFilter
          onSearch={setSearchQuery}
          onFilter={setActiveFilter}
          activeFilter={activeFilter}
        />

        {/* Clean Row List */}
        <div className="grill-list">
          {filteredRoasts.length > 0 ? (
            filteredRoasts.map((roast, index) => (
              <RoastCard key={roast.id} roast={roast} rank={index + 1} />
            ))
          ) : (
            <div className="card" style={{ textAlign: "center", padding: "48px 24px" }}>
              <div style={{ fontSize: "28px", marginBottom: "8px" }}>🔍</div>
              <p style={{ color: "var(--text-secondary)", fontWeight: 600 }}>
                {searchQuery
                  ? `No roasts found matching "${searchQuery}"`
                  : "No roasts found in this category"}
              </p>
              <button
                className="btn btn-outline btn-sm"
                style={{ marginTop: "12px" }}
                onClick={() => {
                  setSearchQuery("");
                  setActiveFilter("all");
                }}
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── 4. How BountyRoast Works ── */}
      <section className="section" id="how-it-works">
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <h2 className="section-title" style={{ justifyContent: "center" }}>
            How BountyRoast Works
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "4px" }}>
            The transparent attention economy for tech call-outs
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
          <div className="card">
            <span style={{ fontSize: "24px", display: "block", marginBottom: "12px" }}>🎯</span>
            <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "6px" }}>1. Place a Bounty</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "13px", lineHeight: 1.55 }}>
              Enter any founder&apos;s X handle and your spicy take. Add a bounty from $5. The higher the bounty, the higher they sit on The Grill.
            </p>
          </div>

          <div className="card">
            <span style={{ fontSize: "24px", display: "block", marginBottom: "12px" }}>⏱️</span>
            <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "6px" }}>2. 72-Hour Clock</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "13px", lineHeight: 1.55 }}>
              The target gets notified. They have 72 hours to respond. Pay to clear the roast, or post a free comeback to clap back publicly.
            </p>
          </div>

          <div className="card">
            <span style={{ fontSize: "24px", display: "block", marginBottom: "12px" }}>🔄</span>
            <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "6px" }}>3. Spectator Fuel & Revenge</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "13px", lineHeight: 1.55 }}>
              Spectators can add $1 to fuel any bounty. When founders defend, they can redirect the flame to a rival competitor.
            </p>
          </div>
        </div>
      </section>

      {/* ── 5. Hall of Flame (Teaser) ── */}
      <section className="section" id="hall-of-flame">
        <div className="hof-teaser">
          <h2 className="section-title" style={{ justifyContent: "center", marginBottom: "4px" }}>
            🏛️ Hall of Flame
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "14px", marginBottom: "0" }}>
            The legendary archive — expired, defended, and cleared roasts from platform history
          </p>

          <div className="hof-teaser-grid">
            {allHallOfFlame.slice(0, 3).map((item, i) => (
              <div key={i} className="hof-teaser-item">
                <div className="hof-teaser-item-handle">
                  {item.target}
                  {item.legend && " 🏆"}
                </div>
                <p className="hof-teaser-item-quote">
                  &ldquo;{item.roastText}&rdquo;
                </p>
                <div className="hof-teaser-item-bounty">
                  ${item.bountyAmount} bounty
                </div>
              </div>
            ))}
          </div>

          <Link href="/hall-of-flame" className="btn btn-cayenne">
            View Full Archive →
          </Link>
        </div>
      </section>

      {/* ── 6. Clean Human Footer ── */}
      <footer className="footer">
        <div style={{ display: "flex", justifyContent: "center", gap: "24px", marginBottom: "12px" }}>
          <a href="#the-grill">The Grill</a>
          <a href="#how-it-works">How It Works</a>
          <a href="/drop">Drop Roast</a>
          <a href="/hall-of-flame">Archive</a>
        </div>
        <p style={{ color: "var(--text-muted)", fontSize: "12px" }}>
          © 2026 bountyroast.lol · The Public Attention Economy
        </p>
      </footer>
    </div>
  );
}
