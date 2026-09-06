"use client";

import { useState, useEffect } from "react";
import { openTwitterShare } from "@/lib/share";

export default function ShareCardModal({ isOpen, onClose, roast }) {
  const [cardTheme, setCardTheme] = useState("light");
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen || !roast) return null;

  const targetHandle = roast.targetHandle || "founder";
  const bountyAmount = roast.bountyAmount || 500;
  const roastText = roast.roastText || "";
  const rank = roast.rank ? `#${roast.rank}` : "#1";

  const ogImageUrl = `/api/og?handle=${encodeURIComponent(targetHandle)}&bounty=${encodeURIComponent(bountyAmount)}&roast=${encodeURIComponent(roastText)}&rank=${encodeURIComponent(rank)}&theme=${cardTheme}`;

  const shareUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/roast/${roast.id}`
      : `https://bountyroast.lol/roast/${roast.id}`;

  const tweetText = `🚨 @${targetHandle} is currently on The Grill on BountyRoast.lol with a $${bountyAmount} bounty!\n\n"${roastText}"\n\nDefend yourself or watch it burn:`;

  const handlePostToTwitter = () => {
    openTwitterShare(tweetText, shareUrl);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback
      setCopied(false);
    }
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const res = await fetch(ogImageUrl);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bountyroast-${targetHandle}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      // Direct navigation fallback
      window.open(ogImageUrl, "_blank");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 10000 }}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "680px",
          width: "92%",
          padding: "24px",
          borderRadius: "var(--radius-lg)",
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "16px",
            paddingBottom: "12px",
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          <div>
            <h3 style={{ fontSize: "17px", fontWeight: 700, color: "var(--text-primary)" }}>
              Share Roast Card
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px" }}>
              High-resolution 1200×630 card for Twitter/𝕏, Discord & Telegram
            </p>
          </div>
          <button
            onClick={onClose}
            className="icon-btn"
            style={{ width: "32px", height: "32px", fontSize: "13px" }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {/* Theme Picker for the Card */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "12px",
          }}
        >
          <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Card Style
          </span>
          <div style={{ display: "flex", gap: "6px" }}>
            <button
              className={`btn btn-sm ${cardTheme === "light" ? "btn-coral" : "btn-outline"}`}
              onClick={() => setCardTheme("light")}
              style={{ padding: "4px 12px", fontSize: "12px", borderRadius: "var(--radius-full)" }}
            >
              ☀️ Warm Paper
            </button>
            <button
              className={`btn btn-sm ${cardTheme === "dark" ? "btn-coral" : "btn-outline"}`}
              onClick={() => setCardTheme("dark")}
              style={{ padding: "4px 12px", fontSize: "12px", borderRadius: "var(--radius-full)" }}
            >
              🌙 Warm Slate
            </button>
          </div>
        </div>

        {/* Live OG Card Preview */}
        <div
          style={{
            position: "relative",
            width: "100%",
            borderRadius: "var(--radius-md)",
            overflow: "hidden",
            border: "1px solid var(--border-subtle)",
            boxShadow: "var(--shadow-sm)",
            marginBottom: "20px",
            backgroundColor: cardTheme === "dark" ? "#141518" : "#F6F5F0",
          }}
        >
          {/* Aspect ratio 1200 / 630 = 1.904 */}
          <div style={{ position: "relative", width: "100%", paddingTop: "52.5%" }}>
            <img
              src={ogImageUrl}
              alt={`Roast card for @${targetHandle}`}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "contain",
                display: "block",
              }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "10px",
            marginBottom: "10px",
          }}
        >
          <button
            className="btn btn-coral btn-block"
            onClick={handlePostToTwitter}
            id="share-to-x-btn"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
          >
            <span>Post to 𝕏</span>
            <span style={{ fontSize: "12px", opacity: 0.9 }}>➔</span>
          </button>

          <button
            className="btn btn-outline btn-block"
            onClick={handleDownload}
            disabled={downloading}
            id="download-og-card-btn"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
          >
            <span>{downloading ? "Generating..." : "💾 Download PNG"}</span>
          </button>
        </div>

        {/* Copy Link Row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 12px",
            backgroundColor: "var(--bg-subtle)",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <input
            type="text"
            readOnly
            value={shareUrl}
            style={{
              flex: 1,
              background: "none",
              border: "none",
              fontSize: "12px",
              color: "var(--text-secondary)",
              outline: "none",
            }}
          />
          <button
            className="btn btn-sm btn-outline"
            onClick={handleCopyLink}
            id="copy-roast-link-btn"
            style={{
              fontSize: "11px",
              padding: "4px 10px",
              whiteSpace: "nowrap",
              backgroundColor: copied ? "var(--accent-cayenne)" : "var(--bg-surface)",
              color: copied ? "#FFFFFF" : "var(--text-primary)",
              borderColor: copied ? "var(--accent-cayenne)" : "var(--border-strong)",
            }}
          >
            {copied ? "✓ Copied!" : "Copy Link"}
          </button>
        </div>
      </div>
    </div>
  );
}
