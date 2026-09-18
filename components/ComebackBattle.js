"use client";

import { useState, useEffect } from "react";
import { useRoasts } from "@/context/RoastContext";
import { playFuel, playDefend } from "@/lib/sounds";
import { triggerConfetti } from "@/components/Confetti";

export default function ComebackBattle({ roast, isCompact = false }) {
  const { voteBattle } = useRoasts();
  const [userVote, setUserVote] = useState(null);
  const [justVoted, setJustVoted] = useState(false);

  // Sync user's previous vote from localStorage
  useEffect(() => {
    if (typeof window !== "undefined" && roast?.id) {
      try {
        const raw = localStorage.getItem("bountyroast_battle_votes");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed[roast.id]) {
            setUserVote(parsed[roast.id]);
          }
        }
      } catch (e) {
        console.warn("Could not load battle vote:", e);
      }
    }
  }, [roast?.id]);

  if (!roast || !roast.defenseText) return null;

  const votes = roast.battleVotes || { roaster: 25, founder: 35 };
  const roasterVotes = votes.roaster || 0;
  const founderVotes = votes.founder || 0;
  const totalVotes = Math.max(1, roasterVotes + founderVotes);
  const roasterPct = Math.round((roasterVotes / totalVotes) * 100);
  const founderPct = 100 - roasterPct;

  const handleVote = (choice, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (userVote) return; // already voted for this roast

    setUserVote(choice);
    setJustVoted(true);
    voteBattle(roast.id, choice);

    if (choice === "roaster") {
      playFuel();
      triggerConfetti("fire");
    } else {
      playDefend();
      triggerConfetti("defense");
    }

    setTimeout(() => setJustVoted(false), 1200);
  };

  // Compact Layout for The Grill cards
  if (isCompact) {
    return (
      <div
        className="comeback-battle-compact"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <div className="battle-header-compact">
          <span className="battle-title-compact">
            ⚔️ <strong>Who Won the Beef?</strong>
          </span>
          <span className="battle-count-compact">{totalVotes} votes</span>
        </div>

        {/* Dual Progress Bar */}
        <div className="battle-bar-track" title={`${roasterPct}% Roaster vs ${founderPct}% Founder`}>
          <div
            className="battle-bar-roaster"
            style={{ width: `${roasterPct}%` }}
          />
          <div
            className="battle-bar-founder"
            style={{ width: `${founderPct}%` }}
          />
        </div>

        {/* Action Buttons or Voted State */}
        {!userVote ? (
          <div className="battle-actions-compact">
            <button
              type="button"
              className="btn-battle-vote roaster-btn"
              onClick={(e) => handleVote("roaster", e)}
              title="Vote: The original roast burned them"
            >
              🔥 Burned &apos;Em ({roasterPct}%)
            </button>
            <button
              type="button"
              className="btn-battle-vote founder-btn"
              onClick={(e) => handleVote("founder", e)}
              title="Vote: The founder comeback clapped back"
            >
              🛡️ Clapped Back ({founderPct}%)
            </button>
          </div>
        ) : (
          <div className="battle-voted-notice-compact">
            <span>
              ✓ You voted:{" "}
              <strong style={{ color: userVote === "roaster" ? "var(--accent-coral)" : "var(--status-emerald)" }}>
                {userVote === "roaster" ? "Roaster Burned 'Em 🔥" : "Founder Clapped Back 🛡️"}
              </strong>
            </span>
            <span className="battle-stat-split">
              {roasterPct}% vs {founderPct}%
            </span>
          </div>
        )}
      </div>
    );
  }

  // Expanded Arena Layout for the Dedicated Roast Page
  return (
    <div className={`comeback-battle-arena ${justVoted ? "battle-pulse-anim" : ""}`}>
      <div className="battle-arena-header">
        <div className="battle-pill-tag">
          <span>⚔️ SPECTATOR BATTLE ARENA</span>
        </div>
        <h3 className="battle-arena-title">Who Won This Beef?</h3>
        <p className="battle-arena-subtitle">
          Cast your vote as a spectator. The internet decides whether the roast hit harder or the founder clapped back.
        </p>
      </div>

      {/* Combatants Grid */}
      <div className="battle-combatants-grid">
        {/* Roaster Side */}
        <div className={`combatant-card ${userVote === "roaster" ? "combatant-voted" : ""}`}>
          <div className="combatant-avatar-wrap">
            <img
              src={roast.roaster?.avatar || `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=you`}
              alt={roast.roaster?.handle}
              className="combatant-avatar"
            />
            <span className="combatant-icon fire-icon">🔥</span>
          </div>
          <div className="combatant-info">
            <span className="combatant-role">The Challenger</span>
            <span className="combatant-handle">@{roast.roaster?.handle || "roaster"}</span>
          </div>
          <div className="combatant-quote">
            &ldquo;{roast.roastText}&rdquo;
          </div>
          <button
            type="button"
            className={`btn btn-block ${userVote === "roaster" ? "btn-cayenne" : "btn-outline"} btn-battle-choice`}
            onClick={(e) => handleVote("roaster", e)}
            disabled={Boolean(userVote)}
          >
            {userVote === "roaster" ? "✓ Burned 'Em" : "Vote: Burned 'Em 🔥"}
          </button>
        </div>

        {/* VS Divider */}
        <div className="battle-vs-badge">
          <span>VS</span>
        </div>

        {/* Founder Side */}
        <div className={`combatant-card ${userVote === "founder" ? "combatant-voted" : ""}`}>
          <div className="combatant-avatar-wrap">
            <img
              src={roast.target?.avatar}
              alt={roast.target?.handle}
              className="combatant-avatar"
            />
            <span className="combatant-icon shield-icon">🛡️</span>
          </div>
          <div className="combatant-info">
            <span className="combatant-role">Target Founder</span>
            <span className="combatant-handle">@{roast.target?.handle}</span>
          </div>
          <div className="combatant-quote founder-quote">
            &ldquo;{roast.defenseText}&rdquo;
          </div>
          <button
            type="button"
            className={`btn btn-block ${userVote === "founder" ? "btn-emerald" : "btn-outline"} btn-battle-choice`}
            onClick={(e) => handleVote("founder", e)}
            disabled={Boolean(userVote)}
          >
            {userVote === "founder" ? "✓ Clapped Back" : "Vote: Clapped Back 🛡️"}
          </button>
        </div>
      </div>

      {/* Live Ratio Bar */}
      <div className="battle-ratio-section">
        <div className="battle-ratio-labels">
          <span className="ratio-label roaster-label">
            🔥 {roasterVotes} votes ({roasterPct}%)
          </span>
          <span className="ratio-center-pill">
            ⚡ {totalVotes} Total Spectator Votes
          </span>
          <span className="ratio-label founder-label">
            🛡️ {founderVotes} votes ({founderPct}%)
          </span>
        </div>

        <div className="battle-bar-track-large">
          <div
            className="battle-bar-roaster"
            style={{ width: `${roasterPct}%` }}
          />
          <div
            className="battle-bar-founder"
            style={{ width: `${founderPct}%` }}
          />
        </div>
      </div>

      {userVote && (
        <div className="battle-verdict-footer">
          <span>
            🗳️ You cast your spectator ballot for{" "}
            <strong>{userVote === "roaster" ? `@${roast.roaster?.handle} (Burned 'Em 🔥)` : `@${roast.target?.handle} (Clapped Back 🛡️)`}</strong>.
          </span>
        </div>
      )}
    </div>
  );
}
