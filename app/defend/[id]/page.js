"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRoasts } from "@/context/RoastContext";
import { shareDefense } from "@/lib/share";
import PopupModal from "@/components/PopupModal";
import { triggerConfetti } from "@/components/Confetti";
import { playDefend, playRedirect } from "@/lib/sounds";

export default function DefendPage({ params }) {
  const { id } = use(params);
  const { roasts, defendRoast, addRoast, loading } = useRoasts();
  const roast = roasts.find((r) => r.id === id);
  const [selectedOption, setSelectedOption] = useState(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("option");
      if (q && ["clear", "comeback", "redirect"].includes(q)) return q;
    }
    return "clear";
  });
  const [comebackText, setComebackText] = useState("");
  const [retargetHandle, setRetargetHandle] = useState("");
  const [showModal, setShowModal] = useState(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search).get("option");
      return Boolean(q && ["clear", "comeback", "redirect"].includes(q));
    }
    return false;
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [redirectedRoastId, setRedirectedRoastId] = useState(null);

  const [isClearing, setIsClearing] = useState(false);
  const [clearError, setClearError] = useState(null);

  // Detect return from Stripe Checkout after successful "Pay to Clear"
  useEffect(() => {
    if (typeof window !== "undefined") {
      const q = new URLSearchParams(window.location.search);

      if (q.get("payment_success") === "clear") {
        setSelectedOption("clear");
        setShowSuccess(true);
        playDefend();
        triggerConfetti("defense");

        // clean URL query parameters
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        );
      }
    }
  }, []);

  if (loading) {
    return (
      <div
        className="container"
        style={{ textAlign: "center", padding: "120px 0" }}
      >
        <div style={{ fontSize: "40px", marginBottom: "16px" }}>🛡️</div>
        <h2
          style={{
            fontSize: "20px",
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: "8px",
          }}
        >
          Loading defense chamber...
        </h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
          Retrieving bounty status and founder immunity...
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
          This roast may have already been cleared or expired.
        </p>
        <Link href="/" className="btn btn-outline">
          ← Back to The Grill
        </Link>
      </div>
    );
  }

  const clearCost = roast.bountyAmount + 1;

  const handleDefend = async () => {
    // Pay to Clear via Stripe Checkout
    if (selectedOption === "clear") {
      try {
        setIsClearing(true);
        setClearError(null);

        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            roastId: roast.id,
            targetHandle: roast.target.handle,
            amount: clearCost,
            action: "clear",
          }),
        });

        const data = await res.json();
        if (data.url) {
          // / Redirect founder to Stripe's hosted payment page
          window.location.href = data.url;
        } else {
          throw new Error(data.error || "failed to create checkout session");
        }
      } catch (err) {
        setClearError(err.message);
        setIsClearing(false);
      }
      return;
    }

    // Option 2 & Option 3 (Comeback and Redirect remain free & local)
    setShowModal(false);
    if (selectedOption === "comeback") {
      defendRoast(roast.id, "defended", comebackText);
      playDefend();
      triggerConfetti("defense");
    } else if (selectedOption === "redirect") {
      const cleanHandle =
        retargetHandle.replace(/^@/, "").trim() || "rival_founder";
      const newRoast = addRoast({
        handle: cleanHandle,
        roastText: `Flame passed from @${roast.target.handle}: "${roast.roastText}"`,
        bountyAmount: roast.bountyAmount,
      });
      if (newRoast && newRoast.id) {
        setRedirectedRoastId(newRoast.id);
      }
      defendRoast(roast.id, "redirected", `Redirected to @${cleanHandle}`);
      playRedirect();
      triggerConfetti("fire");
    }
    setShowSuccess(true);
  };

  if (showSuccess) {
    const cleanTarget = retargetHandle.replace(/^@/, "").trim();
    const messages = {
      clear: {
        icon: "🛡️",
        title: "Roast Cleared",
        subtitle: `You paid $${clearCost} to clear your name. The roast has been extinguished and removed from the active Grill.`,
        accent: "var(--status-emerald)",
      },
      comeback: {
        icon: "🎤",
        title: "Comeback Pinned",
        subtitle: `Your comeback is now attached to the roast card. Let the internet judge who won the exchange.`,
        accent: "var(--accent-coral)",
      },
      redirect: {
        icon: "🔄",
        title: "Flame Redirected",
        subtitle: `The roast has been redirected to @${cleanTarget}. A new $${roast.bountyAmount} bounty has been created on their head!`,
        accent: "var(--status-amber)",
      },
    };

    const msg = messages[selectedOption];

    return (
      <div
        className="container"
        style={{ maxWidth: "600px", padding: "60px 20px" }}
      >
        <div
          className="card"
          style={{
            textAlign: "center",
            padding: "48px 32px",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <div style={{ fontSize: "44px", marginBottom: "16px" }}>
            {msg.icon}
          </div>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: 800,
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
              marginBottom: "8px",
            }}
          >
            {msg.title}
          </h1>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "14px",
              lineHeight: 1.6,
              maxWidth: "440px",
              margin: "0 auto 28px",
            }}
          >
            {msg.subtitle}
          </p>

          {selectedOption === "redirect" && (
            <div
              style={{
                textAlign: "left",
                background: "var(--bg-subtle)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                padding: "16px",
                marginBottom: "28px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  marginBottom: "8px",
                }}
              >
                <span>𝕏 BountyRoast Bot</span>
                <span
                  style={{
                    color: "var(--text-muted)",
                    fontWeight: 400,
                    fontSize: "12px",
                  }}
                >
                  @bountyroast_bot · just now
                </span>
              </div>
              <p
                style={{
                  fontSize: "13px",
                  color: "var(--text-secondary)",
                  lineHeight: 1.5,
                }}
              >
                🔄 <strong>@{cleanTarget}</strong>, the flame has been
                redirected to you by <strong>@{roast.target.handle}</strong>! A
                ${roast.bountyAmount} bounty just landed on your head.
              </p>
            </div>
          )}

          <div
            style={{
              display: "flex",
              gap: "10px",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link href="/" className="btn btn-coral">
              Back to The Grill
            </Link>
            {selectedOption === "redirect" && redirectedRoastId && (
              <Link
                href={`/roast/${redirectedRoastId}`}
                className="btn btn-outline"
              >
                View Redirected Roast
              </Link>
            )}
            <button
              className="btn btn-outline"
              onClick={() =>
                shareDefense({
                  type: selectedOption,
                  targetHandle: roast.target.handle,
                  cost: clearCost,
                  retargetHandle: cleanTarget,
                  id: roast.id,
                })
              }
            >
              Share on 𝕏
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="container"
      style={{ maxWidth: "760px", padding: "40px 20px 80px" }}
    >
      {/* Back Link */}
      <div style={{ marginBottom: "20px" }}>
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

      {/* Alert Pill */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "6px 14px",
          background: "var(--accent-coral-subtle)",
          border: "1px solid var(--accent-coral-border)",
          borderRadius: "var(--radius-full)",
          color: "var(--accent-coral)",
          fontSize: "12px",
          fontWeight: 600,
          marginBottom: "16px",
        }}
      >
        <span>🚨</span>
        <span>Someone paid ${roast.bountyAmount} to put you on The Grill</span>
      </div>

      {/* Target Roast Summary Card */}
      <div className="card" style={{ marginBottom: "36px", padding: "24px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            marginBottom: "16px",
          }}
        >
          <img
            src={roast.target.avatar}
            alt={roast.target.displayName}
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border-subtle)",
              objectFit: "cover",
            }}
          />
          <div>
            <div
              style={{
                fontSize: "16px",
                fontWeight: 700,
                color: "var(--text-primary)",
              }}
            >
              @{roast.target.handle}
            </div>
            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              Placed on The Grill by @{roast.roaster?.handle || "anonymous"}
            </div>
          </div>
        </div>

        <blockquote
          style={{
            fontSize: "16px",
            lineHeight: 1.6,
            color: "var(--text-primary)",
            marginBottom: "16px",
            paddingLeft: "14px",
            borderLeft: "3px solid var(--accent-coral)",
            fontStyle: "italic",
          }}
        >
          &ldquo;{roast.roastText}&rdquo;
        </blockquote>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: "14px",
            borderTop: "1px solid var(--border-subtle)",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "16px",
              fontSize: "12px",
              color: "var(--text-muted)",
            }}
          >
            <span>🔥 {roast.upvotes || 0} upvotes</span>
            <span>💰 ${roast.spectatorContributions || 0} fuel added</span>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "var(--text-muted)",
                textTransform: "uppercase",
              }}
            >
              Active Bounty
            </span>
            <span
              style={{
                fontSize: "20px",
                fontWeight: 800,
                color: "var(--accent-coral)",
              }}
            >
              ${roast.bountyAmount}
            </span>
          </div>
        </div>
      </div>

      {/* Defense Header */}
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <h2
          style={{
            fontSize: "22px",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            color: "var(--text-primary)",
            marginBottom: "6px",
          }}
        >
          Choose Your Defense
        </h2>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
          Every minute this roast stays on The Grill, more founders see it.
        </p>
      </div>

      {/* Defense Options Grid */}
      <div className="defend-options-grid">
        {/* Option 1: Pay to Clear */}
        <div
          className={`defend-option-card ${selectedOption === "clear" ? "selected" : ""}`}
          onClick={() => {
            setSelectedOption("clear");
            setShowModal(true);
          }}
        >
          <div className="defend-option-icon">🛡️</div>
          <h3 className="defend-option-title">Pay to Clear</h3>
          <p className="defend-option-desc">
            Extinguish the flame. The roast is completely erased from the active
            Grill leaderboard.
          </p>
          <div className="defend-option-cost">${clearCost}</div>
        </div>

        {/* Option 2: Post a Comeback */}
        <div
          className={`defend-option-card ${selectedOption === "comeback" ? "selected" : ""}`}
          onClick={() => {
            setSelectedOption("comeback");
            setShowModal(true);
          }}
        >
          <div className="defend-option-icon">🎤</div>
          <h3 className="defend-option-title">Post a Comeback</h3>
          <p className="defend-option-desc">
            Attach a rebuttal to the roast card. The card stays live, but your
            comeback is pinned right beneath it.
          </p>
          <div
            className="defend-option-cost"
            style={{ color: "var(--status-emerald)" }}
          >
            FREE
          </div>
        </div>

        {/* Option 3: Redirect */}
        <div
          className={`defend-option-card ${selectedOption === "redirect" ? "selected" : ""}`}
          onClick={() => {
            setSelectedOption("redirect");
            setShowModal(true);
          }}
        >
          <div className="defend-option-icon">🔄</div>
          <h3 className="defend-option-title">Redirect Flame</h3>
          <p className="defend-option-desc">
            Pass the bounty to a competitor handle. A new live roast appears
            targeting them on The Grill.
          </p>
          <div
            className="defend-option-cost"
            style={{ color: "var(--status-amber)" }}
          >
            FREE
          </div>
        </div>
      </div>

      {/* Modals */}
      {/* 1. Clear Modal */}
      <PopupModal
        isOpen={showModal && selectedOption === "clear"}
        onClose={() => setShowModal(false)}
        title="Pay to Clear Roast"
      >
        <div style={{ textAlign: "center", padding: "8px 0" }}>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "14px",
              marginBottom: "16px",
            }}
          >
            Paying ${clearCost} will immediately extinguish this roast and
            remove it from The Grill leaderboard.
          </p>
          <div
            style={{
              fontSize: "36px",
              fontWeight: 800,
              color: "var(--accent-coral)",
              marginBottom: "20px",
              letterSpacing: "-0.02em",
            }}
          >
            ${clearCost}
          </div>
          <button
            className="btn btn-coral btn-lg btn-block"
            onClick={handleDefend}
            disabled={isClearing}
          >
            {isClearing
              ? "Redirecting to Stripe..."
              : `Confirm & Pay $${clearCost} to Clear`}
          </button>
          {clearError && (
            <p
              style={{
                color: "var(--accent-coral)",
                fontSize: "12px",
                marginTop: "10px",
              }}
            >
              {clearError}
            </p>
          )}
        </div>
      </PopupModal>

      {/* 2. Comeback Modal */}
      <PopupModal
        isOpen={showModal && selectedOption === "comeback"}
        onClose={() => setShowModal(false)}
        title="Write Your Comeback"
      >
        <div>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "13px",
              marginBottom: "14px",
            }}
          >
            Write a sharp rebuttal. It will be permanently displayed on this
            roast card on The Grill.
          </p>
          <div className="form-group">
            <textarea
              className="form-textarea"
              placeholder="At least I have paying users. Your GitHub repo has 2 stars and one is your mom's."
              value={comebackText}
              onChange={(e) => setComebackText(e.target.value)}
              rows={4}
              style={{ resize: "vertical" }}
            />
          </div>
          <button
            className="btn btn-coral btn-lg btn-block"
            onClick={handleDefend}
            disabled={!comebackText.trim()}
          >
            Deploy Comeback
          </button>
        </div>
      </PopupModal>

      {/* 3. Redirect Modal */}
      <PopupModal
        isOpen={showModal && selectedOption === "redirect"}
        onClose={() => setShowModal(false)}
        title="Redirect the Flame"
      >
        <div>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "13px",
              marginBottom: "14px",
            }}
          >
            Choose a target handle. A new ${roast.bountyAmount} roast will be
            generated targeting them on The Grill.
          </p>
          <div className="form-group">
            <label className="form-label">Competitor Handle</label>
            <div style={{ position: "relative" }}>
              <span
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                  fontWeight: 600,
                  fontSize: "14px",
                }}
              >
                @
              </span>
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: "32px" }}
                placeholder="competitor_handle"
                value={retargetHandle}
                onChange={(e) =>
                  setRetargetHandle(
                    e.target.value.replace(/[^a-zA-Z0-9_]/g, ""),
                  )
                }
              />
            </div>
          </div>

          {retargetHandle && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "16px",
                padding: "12px",
                background: "var(--bg-subtle)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-subtle)",
              }}
            >
              <img
                src={`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${retargetHandle}`}
                alt="avatar"
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid var(--border-subtle)",
                }}
              />
              <div>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                  }}
                >
                  @{retargetHandle}
                </div>
                <div style={{ fontSize: "12px", color: "var(--accent-coral)" }}>
                  Receiving ${roast.bountyAmount} flame
                </div>
              </div>
            </div>
          )}

          <button
            className="btn btn-coral btn-lg btn-block"
            onClick={handleDefend}
            disabled={!retargetHandle.trim()}
          >
            Redirect to @{retargetHandle || "..."}
          </button>
        </div>
      </PopupModal>
    </div>
  );
}
