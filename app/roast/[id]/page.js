"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRoasts } from "@/context/RoastContext";
import HealthBar from "@/components/HealthBar";
import CountdownTimer from "@/components/CountdownTimer";
import { triggerConfetti } from "@/components/Confetti";
import { playFuel } from "@/lib/sounds";
import ShareCardModal from "@/components/ShareCardModal";
import RoastComments from "@/components/RoastComments";
import SpectatorBadge from "@/components/SpectatorBadge";
import ComebackBattle from "@/components/ComebackBattle";

function getTimeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor(diff / 60000);
  if (hours > 24) return `${Math.floor(hours / 24)}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return `${Math.max(1, mins)}m ago`;
}

const mockTimeline = [
  { time: "2 hours ago", text: "🎯 Roast placed by @toxicdev99 for $250" },
  { time: "1 hour ago", text: "💰 @spectator1 fueled the fire: +$25" },
  {
    time: "48 min ago",
    text: "💰 @spectator2 added $15 — 'This is too accurate'",
  },
  { time: "30 min ago", text: "🔥 Roast climbed to top ranks on The Grill" },
  {
    time: "22 min ago",
    text: "💰 @spectator3 added $47 — 'Keep this pinned forever'",
  },
  { time: "10 min ago", text: "📢 @bountyroast_bot notified target on 𝕏" },
  { time: "5 min ago", text: "👀 Target viewed the roast page" },
];

export default function RoastDetailPage({ params }) {
  const { id } = use(params);
  const { roasts, fuelRoast, loading } = useRoasts();
  const roast = roasts.find((r) => r.id === id);

  const [reactions, setReactions] = useState([
    { emoji: "🔥", count: 347, label: "Fire" },
    { emoji: "💀", count: 189, label: "Dead" },
    { emoji: "😭", count: 124, label: "Crying" },
    { emoji: "🎯", count: 98, label: "Accurate" },
    { emoji: "🧢", count: 23, label: "Cap" },
  ]);
  const [fuelNotice, setFuelNotice] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isFuelingLoading, setIsFuelingLoading] = useState(false);

  // Check for successful payment return from Stripe
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("payment") === "success") {
        const amt = urlParams.get("amount") || "5";
        triggerConfetti("fire");
        playFuel();
        setFuelNotice(`Payment verified! +$${amt} fueled to the fire 🔥`);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  if (loading) {
    return (
      <div
        className="container"
        style={{ textAlign: "center", padding: "120px 0" }}
      >
        <div style={{ fontSize: "40px", marginBottom: "16px" }}>🔥</div>
        <h2
          style={{
            fontSize: "20px",
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: "8px",
          }}
        >
          Firing up the grill...
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
          Loading roast telemetry & live spectators...
        </p>
      </div>
    );
  }

  if (!roast) {
    return (
      <div
        className="container"
        style={{ textAlign: "center", padding: "100px 0" }}
      >
        <div style={{ fontSize: "40px", marginBottom: "12px" }}>🔍</div>
        <h2
          style={{
            fontSize: "20px",
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: "8px",
          }}
        >
          Roast Not Found
        </h2>
        <p
          style={{
            color: "var(--text-secondary)",
            fontSize: "14px",
            marginBottom: "20px",
          }}
        >
          This roast has been extinguished or never existed.
        </p>
        <Link href="/" className="btn btn-outline">
          ← Back to The Grill
        </Link>
      </div>
    );
  }

  const rank =
    [...roasts]
      .sort((a, b) => b.bountyAmount - a.bountyAmount)
      .findIndex((r) => r.id === id) + 1;

  const handleReaction = (index) => {
    setReactions((prev) =>
      prev.map((r, i) => (i === index ? { ...r, count: r.count + 1 } : r)),
    );
  };

  const handleFuel = async (amount) => {
    try {
      setIsFuelingLoading(true);
      playFuel();
      setFuelNotice(`Launching Stripe Checkout...`);

      // 1. Ask our backend for a real Stripe Checkout Session
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roastId: roast.id,
          targetHandle: roast.target.handle,
          amount,
          action: "fuel",
        }),
      });

      const data = await res.json();
      if (data.url) {
        // 2. Redirect user's browser to the official Stripe hosted checkout page!
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Failed to create checkout session");
      }
    } catch (err) {
      console.warn("Stripe redirect failed, applying local fallback:", err);
      // Fallback: apply optimistic fuel locally if network error
      fuelRoast(roast.id, amount);
      if (amount >= 25) triggerConfetti("fire");
      setFuelNotice(`+$${amount} added! 🔥`);
      setTimeout(() => setFuelNotice(null), 1800);
      setIsFuelingLoading(false);
    }
  };

  const handleShareClick = () => {
    setShowShareModal(true);
  };

  return (
    <div
      className="container"
      style={{ maxWidth: "760px", padding: "40px 20px 80px" }}
    >
      {/* Breadcrumb */}
      <div style={{ marginBottom: "24px" }}>
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

      {/* Main Roast Card */}
      <div className="card" style={{ marginBottom: "24px", padding: "28px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "16px",
            marginBottom: "20px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <img
              src={roast.target.avatar}
              alt={roast.target.displayName}
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-subtle)",
                objectFit: "cover",
              }}
            />
            <div>
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <h1
                  style={{
                    fontSize: "18px",
                    fontWeight: 800,
                    color: "var(--text-primary)",
                    letterSpacing: "-0.01em",
                  }}
                >
                  @{roast.target.handle}
                </h1>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    color: "var(--accent-coral)",
                    background: "var(--accent-coral-subtle)",
                    padding: "2px 8px",
                    borderRadius: "var(--radius-full)",
                  }}
                >
                  #{rank} on Grill
                </span>
                <SpectatorBadge roastId={roast.id} />
              </div>
              <p
                style={{
                  color: "var(--text-muted)",
                  fontSize: "13px",
                  marginTop: "2px",
                }}
              >
                {roast.target.bio || "Founder / Builder"}
              </p>
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontSize: "28px",
                fontWeight: 800,
                color: "var(--accent-coral)",
                letterSpacing: "-0.02em",
              }}
            >
              ${roast.bountyAmount}
            </div>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "var(--text-muted)",
                textTransform: "uppercase",
              }}
            >
              Total Bounty
            </span>
          </div>
        </div>

        <blockquote
          style={{
            fontSize: "18px",
            lineHeight: 1.6,
            color: "var(--text-primary)",
            marginBottom: "20px",
            paddingLeft: "16px",
            borderLeft: "3px solid var(--accent-coral)",
            fontStyle: "italic",
          }}
        >
          &ldquo;{roast.roastText}&rdquo;
        </blockquote>

        {/* Countdown Timer */}
        {roast.defenseStatus === "none" && roast.expiresAt && (
          <div style={{ marginBottom: "20px" }}>
            <CountdownTimer expiresAt={roast.expiresAt} />
          </div>
        )}

        {/* Roast Metadata Row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
            gap: "12px",
            paddingTop: "16px",
            borderTop: "1px solid var(--border-subtle)",
          }}
        >
          <div>
            <span
              style={{
                fontSize: "11px",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              Dropped by
            </span>
            <div
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--text-primary)",
                marginTop: "2px",
              }}
            >
              @{roast.roaster?.handle || "anonymous"}
            </div>
          </div>
          <div>
            <span
              style={{
                fontSize: "11px",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              Placed
            </span>
            <div
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--text-primary)",
                marginTop: "2px",
              }}
            >
              {getTimeAgo(roast.createdAt)}
            </div>
          </div>
          <div>
            <span
              style={{
                fontSize: "11px",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              Upvotes
            </span>
            <div
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "var(--text-primary)",
                marginTop: "2px",
              }}
            >
              🔥 {roast.upvotes}
            </div>
          </div>
          <div>
            <span
              style={{
                fontSize: "11px",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                fontWeight: 600,
              }}
            >
              Status
            </span>
            <div style={{ marginTop: "2px" }}>
              {roast.defenseStatus === "none" ? (
                <span
                  className="badge badge-defended"
                  style={{
                    background: "var(--accent-coral-subtle)",
                    color: "var(--accent-coral)",
                  }}
                >
                  ACTIVE
                </span>
              ) : roast.defenseStatus === "cleared" ? (
                <span className="badge badge-cleared">CLEARED</span>
              ) : roast.defenseStatus === "defended" ? (
                <span className="badge badge-defended">COMEBACK</span>
              ) : roast.defenseStatus === "expired" ? (
                <span className="badge badge-expired">EXPIRED</span>
              ) : (
                <span className="badge badge-redirected">REDIRECTED</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Reactions */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
          marginBottom: "24px",
        }}
      >
        {reactions.map((r, i) => (
          <button
            key={i}
            className="filter-pill"
            onClick={() => handleReaction(i)}
            title={`React with ${r.label}`}
          >
            <span>{r.emoji}</span>
            <span>{r.count}</span>
          </button>
        ))}
      </div>

      {/* Defense / Comeback Content & Spectator Battle Arena */}
      {roast.defenseStatus !== "none" && roast.defenseText && (
        <ComebackBattle roast={roast} isCompact={false} />
      )}

      {/* Fuel the Fire (if active) */}
      {roast.defenseStatus === "none" && (
        <div
          className="card"
          style={{ marginBottom: "24px", position: "relative" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "12px",
            }}
          >
            <h3
              style={{
                fontSize: "15px",
                fontWeight: 700,
                color: "var(--text-primary)",
              }}
            >
              Fuel the Fire
            </h3>
            {fuelNotice && (
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "var(--status-emerald)",
                }}
              >
                {fuelNotice}
              </span>
            )}
          </div>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "13px",
              marginBottom: "14px",
              lineHeight: 1.5,
            }}
          >
            Contribute to the bounty to keep this roast pinned higher on the
            leaderboard.
          </p>
          <HealthBar
            value={roast.spectatorContributions}
            max={100}
            label={`$${roast.spectatorContributions || 0} spectator fuel`}
          />
          <div
            style={{
              display: "flex",
              gap: "8px",
              marginTop: "14px",
              flexWrap: "wrap",
            }}
          >
            <button
              className="btn btn-outline btn-sm"
              disabled={isFuelingLoading}
              onClick={() => handleFuel(1)}
            >
              +$1 Fuel
            </button>
            <button
              className="btn btn-outline btn-sm"
              disabled={isFuelingLoading}
              onClick={() => handleFuel(5)}
            >
              +$5 Fuel
            </button>
            <button
              className="btn btn-coral btn-sm"
              disabled={isFuelingLoading}
              onClick={() => handleFuel(25)}
            >
              +$25 Flame Boost
            </button>
          </div>
        </div>
      )}

      {/* Main Actions */}
      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          marginBottom: "36px",
        }}
      >
        {roast.defenseStatus === "cleared" ? (
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <span
              className="badge badge-cleared"
              style={{ padding: "8px 16px", fontSize: "12px" }}
            >
              🛡️ Cleared & Extinguished
            </span>
            <button className="btn btn-outline" onClick={handleShareClick}>
              Share Receipt on 𝕏
            </button>
          </div>
        ) : roast.defenseStatus === "defended" ? (
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <span
              className="badge badge-defended"
              style={{ padding: "8px 16px", fontSize: "12px" }}
            >
              🎤 Comeback Active
            </span>
            <button className="btn btn-outline" onClick={handleShareClick}>
              Share on 𝕏
            </button>
          </div>
        ) : roast.defenseStatus === "expired" ? (
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <span
              className="badge badge-expired"
              style={{ padding: "8px 16px", fontSize: "12px" }}
            >
              ☠️ Expired (Hall of Flame)
            </span>
            <button className="btn btn-outline" onClick={handleShareClick}>
              Share on 𝕏
            </button>
          </div>
        ) : (
          <>
            <Link href={`/defend/${roast.id}`} className="btn btn-coral">
              🛡️ Defend (${roast.bountyAmount + 1})
            </Link>
            <Link
              href={`/defend/${roast.id}?option=redirect`}
              className="btn btn-outline"
            >
              🔄 Redirect Flame
            </Link>
            <button className="btn btn-outline" onClick={handleShareClick}>
              Share on 𝕏
            </button>
          </>
        )}
      </div>

      {/* Twitter-style Comments Thread */}
      <div style={{ marginBottom: "36px" }}>
        <RoastComments roast={roast} isInline={false} />
      </div>

      {/* Bounty Timeline */}
      <div style={{ marginBottom: "36px" }}>
        <h3
          style={{
            fontSize: "16px",
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: "16px",
          }}
        >
          Bounty Activity
        </h3>
        <div className="card" style={{ padding: "16px 20px" }}>
          {mockTimeline.map((event, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "14px",
                padding: "10px 0",
                borderBottom:
                  i < mockTimeline.length - 1
                    ? "1px solid var(--border-subtle)"
                    : "none",
                fontSize: "13px",
              }}
            >
              <span
                style={{
                  color: "var(--text-muted)",
                  minWidth: "90px",
                  fontSize: "12px",
                }}
              >
                {event.time}
              </span>
              <span style={{ color: "var(--text-secondary)" }}>
                {event.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      <ShareCardModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        roast={{
          id: roast.id,
          targetHandle: roast.target.handle,
          targetName: roast.target.displayName,
          bountyAmount: roast.bountyAmount,
          roastText: roast.roastText,
          rank: 1,
        }}
      />
    </div>
  );
}
