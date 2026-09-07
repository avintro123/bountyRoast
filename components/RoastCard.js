"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRoasts } from "@/context/RoastContext";
import { playFuel } from "@/lib/sounds";
import CountdownTimer from "./CountdownTimer";
import ShareCardModal from "./ShareCardModal";
import RoastComments from "./RoastComments";

function getTimeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor(diff / 60000);
  if (hours > 24) return `${Math.floor(hours / 24)}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return `${Math.max(1, mins)}m ago`;
}

function DefenseBadge({ status }) {
  if (!status || status === "none") return null;
  const normalizedStatus = status === "immune" ? "defended" : status;
  const labels = {
    defended: "🎤 Comeback",
    cleared: "🛡️ Cleared",
    redirected: "🔄 Redirected",
    expired: "☠️ Expired",
  };
  const classes = {
    defended: "badge-defended",
    cleared: "badge-cleared",
    redirected: "badge-redirected",
    expired: "badge-expired",
  };
  return (
    <span className={`badge ${classes[normalizedStatus] || ""}`}>
      {labels[normalizedStatus] || normalizedStatus}
    </span>
  );
}

export default function RoastCard({ roast, rank }) {
  const router = useRouter();
  const { fuelRoast } = useRoasts();
  const [fueledAnim, setFueledAnim] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const commentsCount = roast.comments?.length || 0;

  const isCleared = roast.defenseStatus === "cleared";
  const isDefended = roast.defenseStatus === "defended";
  const isExpired = roast.defenseStatus === "expired";
  const isActive = roast.defenseStatus === "none";

  const handleFuel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isCleared || isDefended || isExpired) return;
    fuelRoast(roast.id, 1);
    playFuel();
    setFueledAnim(true);
    setTimeout(() => setFueledAnim(false), 800);
  };

  const handleDefend = (e) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`/defend/${roast.id}`);
  };

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowShareModal(true);
  };

  const handleToggleComments = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowComments((prev) => !prev);
  };

  return (
    <>
      <div className="roast-card-wrapper">
        <Link
          href={`/roast/${roast.id}`}
          className={`roast-card ${showComments ? "has-comments-open" : ""}`}
        >
          {/* Floating Fuel Notice */}
          {fueledAnim && (
            <div className="floating-fuel-notice">
              +$1 Fueled! 🔥
            </div>
          )}

          {/* 1. Rank Number */}
          <div className="rank-badge">
            #{rank}
          </div>

          {/* 2. Avatar */}
          <div className="roast-avatar">
            <img
              src={roast.target.avatar}
              alt={roast.target.displayName || roast.target.handle}
            />
          </div>

          {/* 3. Center Content */}
          <div className="roast-content">
            <div className="roast-target-row">
              <span className="roast-target-handle">@{roast.target.handle}</span>
              <DefenseBadge status={roast.defenseStatus} />
            </div>

            <div className="roast-text">
              &ldquo;{roast.roastText}&rdquo;
            </div>

            {/* Comeback if posted */}
            {roast.defenseText && (
              <div className="roast-comeback-box">
                <span className="roast-comeback-label">
                  🎤 @{roast.target.handle}&apos;s Comeback
                </span>
                &ldquo;{roast.defenseText}&rdquo;
              </div>
            )}

            {/* Metadata row */}
            <div className="roast-meta">
              <span>by @{roast.roaster.handle}</span>
              <span>·</span>
              <span>{getTimeAgo(roast.createdAt)}</span>
              <span>·</span>
              <span>🔥 {roast.upvotes || 0} upvotes</span>
              <span>·</span>
              <button
                type="button"
                className="roast-meta-comment-btn"
                onClick={handleToggleComments}
                title="Toggle comment section"
              >
                💬 {commentsCount} {commentsCount === 1 ? "comment" : "comments"}
              </button>
              {isActive && roast.expiresAt && (
                <>
                  <span>·</span>
                  <CountdownTimer expiresAt={roast.expiresAt} compact />
                </>
              )}
            </div>
          </div>

          {/* 4. Right Column: Bounty & Actions */}
          <div className="roast-right-col">
            <div>
              <span className="bounty-amount">${roast.bountyAmount}</span>
            </div>

            <div className="roast-actions">
              {isCleared ? (
                <>
                  <span className="badge badge-cleared">Extinguished</span>
                  <button
                    type="button"
                    className={`btn btn-sm btn-comment-toggle ${showComments ? "btn-comment-active" : "btn-outline"}`}
                    onClick={handleToggleComments}
                    title="View comments & reply"
                  >
                    💬 {commentsCount}
                  </button>
                </>
              ) : isDefended ? (
                <>
                  <button
                    type="button"
                    className={`btn btn-sm btn-comment-toggle ${showComments ? "btn-comment-active" : "btn-outline"}`}
                    onClick={handleToggleComments}
                    title="View comments & reply"
                  >
                    💬 {commentsCount}
                  </button>
                  <button className="btn btn-outline btn-sm" onClick={handleShare}>
                    Share 𝕏
                  </button>
                </>
              ) : isExpired ? (
                <>
                  <span className="badge badge-expired">Expired</span>
                  <button
                    type="button"
                    className={`btn btn-sm btn-comment-toggle ${showComments ? "btn-comment-active" : "btn-outline"}`}
                    onClick={handleToggleComments}
                    title="View comments & reply"
                  >
                    💬 {commentsCount}
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="btn btn-cayenne btn-sm"
                    onClick={handleDefend}
                    title={`Pay $${roast.bountyAmount + 1} to clear`}
                  >
                    Defend
                  </button>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={handleFuel}
                    title="Add $1 fuel to this roast"
                  >
                    +1 Fuel
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm btn-comment-toggle ${showComments ? "btn-comment-active" : "btn-outline"}`}
                    onClick={handleToggleComments}
                    title="View comments & reply"
                  >
                    💬 {commentsCount}
                  </button>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={handleShare}
                    title="Share roast card on 𝕏"
                  >
                    Share 𝕏
                  </button>
                </>
              )}
            </div>
          </div>
        </Link>

        {/* Expandable Inline Twitter-style Comments Drawer */}
        {showComments && (
          <div
            className="roast-inline-comments-drawer"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <RoastComments roast={roast} isInline={true} />
          </div>
        )}
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
          rank: rank,
        }}
      />
    </>
  );
}
