"use client";

import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { mockRoasts as initialRoasts, mockTickerEvents as initialTicker, mockStats as initialStats } from "@/data/mockRoasts";

const RoastContext = createContext(null);

export function RoastProvider({ children }) {
  const [roasts, setRoasts] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('roasts');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          return parsed.map((r) => {
            const normalized = r.defenseStatus === "immune" ? { ...r, defenseStatus: "defended" } : r;
            const seed = initialRoasts.find((ir) => ir.id === r.id);
            return {
              ...normalized,
              comments:
                Array.isArray(normalized.comments) && normalized.comments.length > 0
                  ? normalized.comments
                  : (seed?.comments || []),
            };
          });
        } catch {
          return initialRoasts;
        }
      }
      return initialRoasts;
    }
    return initialRoasts;
  });
  const [tickerEvents, setTickerEvents] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('tickerEvents');
      return stored ? JSON.parse(stored) : initialTicker;
    }
    return initialTicker;
  });
  const [stats, setStats] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('stats');
      return stored ? JSON.parse(stored) : initialStats;
    }
    return initialStats;
  });
  const [expiredRoasts, setExpiredRoasts] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('expiredRoasts');
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });

  const expiryCheckRef = useRef(null);

  // Check for expired roasts (every 30 seconds)
  useEffect(() => {
    function checkExpired() {
      const now = Date.now();
      setRoasts((prev) => {
        const newExpired = [];
        const updated = prev.map((r) => {
          // Only auto-expire active (undefended) roasts
          if (
            r.defenseStatus === "none" &&
            r.expiresAt &&
            new Date(r.expiresAt).getTime() <= now
          ) {
            newExpired.push(r);
            return { ...r, defenseStatus: "expired" };
          }
          return r;
        });

        if (newExpired.length > 0) {
          // Add to expired roasts (Hall of Flame candidates)
          setExpiredRoasts((prev) => [
            ...newExpired.map((r) => ({
              target: `@${r.target.handle}`,
              roastText: r.roastText,
              bountyAmount: r.bountyAmount,
              finalStatus: "expired",
              legend: r.bountyAmount >= 100,
            })),
            ...prev,
          ]);

          // Add ticker events for expired roasts
          setTickerEvents((prev) => [
            ...newExpired.map(
              (r) => `☠️ @${r.target.handle}'s roast EXPIRED — $${r.bountyAmount} bounty forfeited!`
            ),
            ...prev,
          ]);

          setStats((prev) => ({
            ...prev,
            activeRoasts: Math.max(0, prev.activeRoasts - newExpired.length),
          }));
        }

        return updated;
      });
    }

    checkExpired(); // Run immediately
    expiryCheckRef.current = setInterval(checkExpired, 30000); // Then every 30s
    return () => clearInterval(expiryCheckRef.current);
  }, []);

  const addRoast = useCallback((newRoast) => {
    const cleanHandle = (newRoast.handle || "").replace(/^@/, "").trim();

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 72 * 60 * 60 * 1000).toISOString();

    const roast = {
      id: `roast-${Date.now()}`,
      target: {
        handle: cleanHandle,
        displayName: cleanHandle,
        avatar: `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${cleanHandle}`,
        bio: "",
      },
      roastText: newRoast.roastText,
      bountyAmount: newRoast.bountyAmount,
      roaster: {
        handle: "you",
        displayName: "You",
        avatar: "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=you",
      },
      createdAt: now.toISOString(),
      expiresAt,
      upvotes: 0,
      spectatorContributions: 0,
      defenseStatus: "none",
      defenseText: null,
      isHot: newRoast.bountyAmount >= 100,
      tags: [],
      comments: [],
    };

    setRoasts((prev) => [roast, ...prev]);

    // Add ticker event
    setTickerEvents((prev) => [
      `🔥 @${cleanHandle} just got roasted for $${newRoast.bountyAmount}`,
      ...prev,
    ]);

    // Update stats
    setStats((prev) => ({
      ...prev,
      activeRoasts: prev.activeRoasts + 1,
      totalBounties: prev.totalBounties + newRoast.bountyAmount,
      roastsToday: prev.roastsToday + 1,
    }));

    return roast;
  }, []);

  const fuelRoast = useCallback((roastId, amount) => {
    setRoasts((prev) => {
      const target = prev.find((r) => r.id === roastId);
      // Cannot fuel if target is cleared, defended, or expired
      if (!target || target.defenseStatus === "cleared" || target.defenseStatus === "defended" || target.defenseStatus === "expired") {
        return prev;
      }

      return prev.map((r) =>
        r.id === roastId
          ? {
              ...r,
              bountyAmount: r.bountyAmount + amount,
              spectatorContributions: r.spectatorContributions + amount,
            }
          : r
      );
    });

    setTickerEvents((prev) => [
      `💰 Spectator fueled +$${amount} on a bounty!`,
      ...prev,
    ]);

    setStats((prev) => ({
      ...prev,
      totalBounties: prev.totalBounties + amount,
    }));
  }, []);

  const defendRoast = useCallback((roastId, defenseType, defenseText) => {
    const isPayToClear = defenseType === "defended" && !defenseText;
    const finalStatus = isPayToClear ? "cleared" : defenseType;

    setRoasts((prev) =>
      prev.map((r) =>
        r.id === roastId
          ? {
              ...r,
              defenseStatus: finalStatus,
              defenseText: defenseText || null,
              isCleared: isPayToClear,
            }
          : r
      )
    );

    setRoasts((current) => {
      const roast = current.find((r) => r.id === roastId);
      const handle = roast?.target?.handle || "unknown";

      if (isPayToClear) {
        setTickerEvents((prev) => [
          `🛡️ @${handle} PAID TO CLEAR — Roast extinguished and erased from The Grill!`,
          ...prev,
        ]);
      } else if (defenseType === "defended") {
        setTickerEvents((prev) => [
          `🎤 @${handle} posted a comeback! Let the internet judge who won.`,
          ...prev,
        ]);
      } else if (defenseType === "redirected") {
        setTickerEvents((prev) => [
          `🔄 @${handle} redirected the flame!`,
          ...prev,
        ]);
      }
      return current;
    });

    setStats((prev) => ({
      ...prev,
      defensesThisHour: prev.defensesThisHour + 1,
      activeRoasts: isPayToClear ? Math.max(0, prev.activeRoasts - 1) : prev.activeRoasts,
    }));
  }, []);

  const addComment = useCallback((roastId, { handle = "you", displayName = "You", text, isTarget = false }) => {
    if (!text || !text.trim()) return null;

    const cleanHandle = (handle || "you").replace(/^@/, "").trim() || "spectator";
    const commentId = `c-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newComment = {
      id: commentId,
      author: {
        handle: cleanHandle,
        displayName: displayName || cleanHandle,
        avatar: `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${cleanHandle}`,
      },
      text: text.trim(),
      createdAt: new Date().toISOString(),
      likes: 0,
      isTarget: Boolean(isTarget),
    };

    setRoasts((prev) => {
      const targetRoast = prev.find((r) => r.id === roastId);
      const targetHandle = targetRoast?.target?.handle || "roast";

      // Add ticker event
      const previewText = text.trim().slice(0, 35) + (text.length > 35 ? "..." : "");
      setTickerEvents((tPrev) => [
        `💬 @${cleanHandle} commented on @${targetHandle}'s roast: "${previewText}"`,
        ...tPrev,
      ]);

      return prev.map((r) => {
        if (r.id === roastId) {
          const existingComments = Array.isArray(r.comments) ? r.comments : [];
          return {
            ...r,
            comments: [newComment, ...existingComments],
          };
        }
        return r;
      });
    });

    return newComment;
  }, []);

  const likeComment = useCallback((roastId, commentId) => {
    setRoasts((prev) =>
      prev.map((r) => {
        if (r.id !== roastId) return r;
        const comments = Array.isArray(r.comments) ? r.comments : [];
        return {
          ...r,
          comments: comments.map((c) =>
            c.id === commentId ? { ...c, likes: (c.likes || 0) + 1 } : c
          ),
        };
      })
    );
  }, []);

  // Sync state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('roasts', JSON.stringify(roasts));
      localStorage.setItem('tickerEvents', JSON.stringify(tickerEvents));
      localStorage.setItem('stats', JSON.stringify(stats));
      localStorage.setItem('expiredRoasts', JSON.stringify(expiredRoasts));
    }
  }, [roasts, tickerEvents, stats, expiredRoasts]);

  return (
    <RoastContext.Provider
      value={{
        roasts,
        tickerEvents,
        stats,
        expiredRoasts,
        addRoast,
        fuelRoast,
        defendRoast,
        addComment,
        likeComment,
      }}
    >
      {children}
    </RoastContext.Provider>
  );
}

export function useRoasts() {
  const context = useContext(RoastContext);
  if (!context) {
    throw new Error("useRoasts must be used within a RoastProvider");
  }
  return context;
}
