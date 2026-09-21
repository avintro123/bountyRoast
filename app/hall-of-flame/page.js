"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRoasts } from "@/context/RoastContext";
import { hallOfFlame as staticHallOfFlame } from "@/data/mockRoasts";
import ComebackBattle from "@/components/ComebackBattle";

const TIER_CONFIG = {
  legendary: { emoji: "🏆", label: "Legendary" },
  epic: { emoji: "⚔️", label: "Epic" },
  rare: { emoji: "🔥", label: "Rare" },
};

const STATUS_CONFIG = {
  expired: { emoji: "☠️", label: "Expired", badgeClass: "badge-expired" },
  defended: { emoji: "🛡️", label: "Defended", badgeClass: "badge-defended" },
  cleared: { emoji: "💰", label: "Cleared", badgeClass: "badge-cleared" },
};

function getTier(bountyAmount) {
  if (bountyAmount >= 500) return "legendary";
  if (bountyAmount >= 200) return "epic";
  return "rare";
}

function getTimeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days > 30) return `${Math.floor(days / 30)}mo ago`;
  if (days > 0) return `${days}d ago`;
  const hours = Math.floor(diff / 3600000);
  return hours > 0 ? `${hours}h ago` : "recently";
}

export default function HallOfFlamePage() {
  const { roasts, expiredRoasts } = useRoasts();
  const [activeFilter, setActiveFilter] = useState("all");

  // Merge all archived roasts: static HoF + dynamically expired + defended/cleared from live
  const allArchived = useMemo(() => {
    // Static Hall of Flame entries (already have rich data)
    const staticEntries = staticHallOfFlame.map((item) => ({
      ...item,
      source: "static",
      tier: item.tier || getTier(item.bountyAmount),
    }));

    // Dynamically expired roasts from context
    const dynamicExpired = (expiredRoasts || []).map((item) => ({
      id: `dyn-${item.target}`,
      target: item.target,
      targetAvatar: `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${(item.target || "").replace("@", "")}`,
      roasterHandle: "spectator",
      roastText: item.roastText,
      defenseText: null,
      bountyAmount: item.bountyAmount,
      finalStatus: item.finalStatus || "expired",
      tier: getTier(item.bountyAmount),
      upvotes: 0,
      spectatorContributions: 0,
      tags: [],
      createdAt: null,
      legend: item.legend || false,
      source: "dynamic",
    }));

    // Defended/cleared roasts from live feed
    const liveArchived = roasts
      .filter((r) => r.defenseStatus === "defended" || r.defenseStatus === "cleared")
      .map((r) => ({
        id: r.id,
        target: `@${r.target.handle}`,
        targetAvatar: r.target.avatar,
        roasterHandle: r.roaster?.handle || "anonymous",
        roastText: r.roastText,
        defenseText: r.defenseText,
        bountyAmount: r.bountyAmount,
        finalStatus: r.defenseStatus,
        tier: getTier(r.bountyAmount),
        upvotes: r.upvotes || 0,
        spectatorContributions: r.spectatorContributions || 0,
        battleVotes: r.battleVotes,
        tags: r.tags || [],
        createdAt: r.createdAt,
        legend: r.bountyAmount >= 500,
        source: "live",
        // Pass full roast for ComebackBattle component
        _fullRoast: r,
      }));

    // Combine all, deduplicate by id, sort by bounty (highest first)
    const combined = [...staticEntries, ...dynamicExpired, ...liveArchived];
    const seen = new Set();
    const deduped = combined.filter((item) => {
      const key = item.id || item.target;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return deduped.sort((a, b) => b.bountyAmount - a.bountyAmount);
  }, [roasts, expiredRoasts]);

  // Filter
  const filtered = useMemo(() => {
    if (activeFilter === "all") return allArchived;
    if (activeFilter === "legendary") return allArchived.filter((r) => r.tier === "legendary");
    return allArchived.filter((r) => r.finalStatus === activeFilter);
  }, [allArchived, activeFilter]);

  // Top 3 for podium
  const podium = allArchived.slice(0, 3);

  // All-time stats
  const totalBounties = allArchived.reduce((sum, r) => sum + r.bountyAmount, 0);
  const highestBounty = allArchived.length > 0 ? allArchived[0].bountyAmount : 0;

  const filters = [
    { key: "all", label: "All" },
    { key: "expired", label: "☠️ Expired" },
    { key: "defended", label: "🛡️ Defended" },
    { key: "cleared", label: "💰 Cleared" },
    { key: "legendary", label: "🏆 Legendary" },
  ];

  const podiumStyles = ["podium-gold", "podium-silver", "podium-bronze"];
  const podiumMedals = ["🥇", "🥈", "🥉"];
  const podiumLabels = ["#1 All-Time", "#2 All-Time", "#3 All-Time"];

  return (
    <div className="container" style={{ maxWidth: "900px", padding: "0 20px 80px" }}>
      {/* Breadcrumb */}
      <div style={{ paddingTop: "24px", marginBottom: "8px" }}>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "13px",
            fontWeight: 500,
            color: "var(--text-muted)",
          }}
        >
          ← Back to The Grill
        </Link>
      </div>

      {/* Hero */}
      <section className="hof-hero">
        <div className="hof-hero-pill">
          <span>🏛️ Archive · Est. 2026</span>
        </div>
        <h1 className="hof-hero-title">Hall of Flame</h1>
        <p className="hof-hero-subtitle">
          The legendary archive of BountyRoast history. Expired, defended, and cleared — these roasts burned so hot they earned a permanent spot in the museum.
        </p>

        {/* Stats */}
        <div className="hof-stats-grid">
          <div className="hof-stat-card">
            <div className="hof-stat-value">{allArchived.length}</div>
            <div className="hof-stat-label">Roasts Archived</div>
          </div>
          <div className="hof-stat-card">
            <div className="hof-stat-value">${totalBounties.toLocaleString()}</div>
            <div className="hof-stat-label">Total Burned</div>
          </div>
          <div className="hof-stat-card">
            <div className="hof-stat-value">${highestBounty.toLocaleString()}</div>
            <div className="hof-stat-label">Highest Ever</div>
          </div>
        </div>
      </section>

      {/* Podium */}
      {podium.length >= 3 && (
        <section className="hof-podium-section">
          <h2 className="hof-podium-title">🏆 All-Time Legends</h2>
          <div className="hof-podium-grid">
            {podium.map((item, i) => (
              <div key={item.id || i} className={`hof-podium-card ${podiumStyles[i]}`}>
                <span className="hof-podium-medal">{podiumMedals[i]}</span>
                <div className="hof-podium-rank">{podiumLabels[i]}</div>
                <div className="hof-podium-target">{item.target}</div>
                <div className="hof-podium-bounty">${item.bountyAmount.toLocaleString()}</div>
                <p className="hof-podium-quote">
                  &ldquo;{item.roastText}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Filters */}
      <div className="hof-filter-bar">
        {filters.map((f) => (
          <button
            key={f.key}
            className={`hof-filter-pill ${activeFilter === f.key ? "active" : ""}`}
            onClick={() => setActiveFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Trophy Cards */}
      {filtered.length > 0 ? (
        <div className="hof-cards-grid">
          {filtered.map((item) => {
            const tierInfo = TIER_CONFIG[item.tier] || TIER_CONFIG.rare;
            const statusInfo = STATUS_CONFIG[item.finalStatus] || STATUS_CONFIG.expired;

            return (
              <div key={item.id || item.target} className={`hof-card tier-${item.tier}`}>
                {/* Header */}
                <div className="hof-card-header">
                  <div className="hof-card-identity">
                    <img
                      src={item.targetAvatar || `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${(item.target || "").replace("@", "")}`}
                      alt={item.target}
                      className="hof-card-avatar"
                    />
                    <div>
                      <div className="hof-card-handle">{item.target}</div>
                      <div className="hof-card-roaster">
                        roasted by @{item.roasterHandle || "anonymous"}
                        {item.createdAt && ` · ${getTimeAgo(item.createdAt)}`}
                      </div>
                    </div>
                  </div>
                  <span className={`hof-tier-badge tier-${item.tier}`}>
                    {tierInfo.emoji} {tierInfo.label}
                  </span>
                </div>

                {/* Roast Quote */}
                <div className="hof-card-quote">
                  &ldquo;{item.roastText}&rdquo;
                </div>

                {/* Comeback Quote */}
                {item.defenseText && (
                  <div className="hof-card-comeback">
                    <span className="hof-card-comeback-label">🎤 Comeback</span>
                    &ldquo;{item.defenseText}&rdquo;
                  </div>
                )}

                {/* ComebackBattle for defended roasts with battle votes */}
                {item.finalStatus === "defended" && item.battleVotes && item._fullRoast && (
                  <div style={{ marginBottom: "12px" }}>
                    <ComebackBattle roast={item._fullRoast} isCompact={true} />
                  </div>
                )}

                {/* Static battle bar for HoF entries without full roast object */}
                {item.finalStatus === "defended" && item.battleVotes && !item._fullRoast && (
                  <div style={{ marginBottom: "12px" }}>
                    <div className="comeback-battle-compact" onClick={(e) => e.stopPropagation()}>
                      <div className="battle-header-compact">
                        <span className="battle-title-compact">
                          ⚔️ <strong>Who Won?</strong>
                        </span>
                        <span className="battle-count-compact">
                          {(item.battleVotes.roaster || 0) + (item.battleVotes.founder || 0)} votes
                        </span>
                      </div>
                      <div
                        className="battle-bar-track"
                        title={`${Math.round((item.battleVotes.roaster / Math.max(1, item.battleVotes.roaster + item.battleVotes.founder)) * 100)}% Roaster vs ${Math.round((item.battleVotes.founder / Math.max(1, item.battleVotes.roaster + item.battleVotes.founder)) * 100)}% Founder`}
                      >
                        <div
                          className="battle-bar-roaster"
                          style={{ width: `${Math.round((item.battleVotes.roaster / Math.max(1, item.battleVotes.roaster + item.battleVotes.founder)) * 100)}%` }}
                        />
                        <div
                          className="battle-bar-founder"
                          style={{ width: `${Math.round((item.battleVotes.founder / Math.max(1, item.battleVotes.roaster + item.battleVotes.founder)) * 100)}%` }}
                        />
                      </div>
                      <div className="battle-voted-notice-compact">
                        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                          🔥 {Math.round((item.battleVotes.roaster / Math.max(1, item.battleVotes.roaster + item.battleVotes.founder)) * 100)}% vs 🛡️ {Math.round((item.battleVotes.founder / Math.max(1, item.battleVotes.roaster + item.battleVotes.founder)) * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="hof-card-footer">
                  <span className="hof-bounty-amount">${item.bountyAmount.toLocaleString()}</span>
                  <div className="hof-card-stats">
                    <span className={`badge ${statusInfo.badgeClass}`}>
                      {statusInfo.emoji} {statusInfo.label}
                    </span>
                    {item.upvotes > 0 && <span>🔥 {item.upvotes}</span>}
                    {item.spectatorContributions > 0 && <span>💰 +${item.spectatorContributions}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="hof-empty">
          <div className="hof-empty-icon">🏛️</div>
          <p className="hof-empty-text">No archived roasts match this filter.</p>
          <button
            className="btn btn-outline btn-sm"
            style={{ marginTop: "12px" }}
            onClick={() => setActiveFilter("all")}
          >
            View All
          </button>
        </div>
      )}

      {/* Back Link */}
      <div style={{ textAlign: "center", paddingTop: "24px" }}>
        <Link href="/" className="btn btn-outline">
          ← Back to The Grill
        </Link>
      </div>
    </div>
  );
}
