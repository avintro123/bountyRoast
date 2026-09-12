"use client";

import { useRoastPresence } from "@/lib/useRoastPresence";

export default function SpectatorBadge({ roastId, compact = false }) {
  const { spectatorCnt } = useRoastPresence(roastId);

  return (
    <div
      className={`spectator-badge ${compact ? "spectator-badge-compact" : ""}`}
      title="Spectators actively viewing this roast in real-time"
    >
      <span className="live-pulse-dot" />
      <span className="spectator-label">
        {spectatorCnt} watching
      </span>
    </div>
  );
}
