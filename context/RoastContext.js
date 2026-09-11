"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import {
  mockRoasts as initialRoasts,
  mockTickerEvents as initialTicker,
  mockStats as initialStats,
} from "@/data/mockRoasts";
import { supabase } from "@/lib/supabase";
import {
  fromDbRoast,
  toDbRoast,
  toDbComment,
  fromDbComment,
} from "@/lib/roastMappers";

const RoastContext = createContext(null);

export function RoastProvider({ children }) {
  const [roasts, setRoasts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        const { data: dbRoasts, error: roastError } = await supabase
          .from("roasts")
          .select("*")
          .order("created_at", { ascending: false });

        if (roastError) throw roastError;

        // fetch comments from Supabase
        const { data: dbComments, error: commentsError } = await supabase
          .from("comments")
          .select("*")
          .order("created_at", { ascending: true });

        if (commentsError) throw commentsError;

        // 3. AUTO-SEED: If the database is empty, seed it with starter mock data!
        if (!dbRoasts || dbRoasts.length === 0) {
          console.log(
            "Supabase is empty! Auto-seeding starter roasts into PostgreSQL...",
          );

          for (const r of initialRoasts) {
            await supabase.from("roasts").insert(toDbRoast(r));
            if (r.comments && r.comments.length > 0) {
              const rows = r.comments.map((c) => toDbComment(c, r.id));
              await supabase.from("comments").insert(rows);
            }
          }

          setRoasts(initialRoasts);
          setLoading(false);
          return;
        }

        // Combine roasts with their respective comments
        const combined = dbRoasts.map((r) => {
          const matchingComments = (dbComments || []).filter(
            (c) => c.roast_id === r.id,
          );
          return fromDbRoast(r, matchingComments);
        });

        setRoasts(combined);
      } catch (err) {
        console.error("Failed to load data:", err);
        setRoasts(initialRoasts);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Live Realtime WebSocket listener
  useEffect(() => {
    // Unique channel per client tab prevents Phoenix topic collision/closing issues
    const topic = `feed-${Math.random().toString(36).slice(2, 9)}`;
    const channel = supabase
      .channel(topic)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "roasts" },
        (payload) => {
          console.log(
            "🔥 Realtime Roast event received: ",
            payload.eventType,
            payload,
          );
          if (payload.eventType === "INSERT") {
            // New roast created by someone else!
            const newRoast = fromDbRoast(payload.new, []);
            setRoasts((prev) => {
              if (prev.some((r) => r.id === newRoast.id)) return prev;
              return [newRoast, ...prev];
            });
            setTickerEvents((prev) => [
              `🔥 @${newRoast.target.handle} just got roasted for $${newRoast.bountyAmount}`,
              ...prev,
            ]);
            setStats((prev) => ({
              ...prev,
              activeRoasts: prev.activeRoasts + 1,
              totalBounties: prev.totalBounties + newRoast.bountyAmount,
              roastsToday: prev.roastsToday + 1,
            }));
          } else if (payload.eventType === "UPDATE") {
            // Roast was fueled, defended, or expired!
            setRoasts((prev) =>
              prev.map((r) => {
                if (r.id !== payload.new.id) return r;
                return {
                  ...r,
                  bountyAmount: Number(payload.new.bounty_amount),
                  spectatorContributions: Number(
                    payload.new.spectator_contributions || 0,
                  ),
                  defenseStatus: payload.new.defense_status,
                  defenseText: payload.new.defense_text || null,
                };
              }),
            );
          } else if (payload.eventType === "DELETE") {
            setRoasts((prev) => prev.filter((r) => r.id !== payload.old?.id));
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comments" },
        (payload) => {
          console.log(
            "💬 Realtime comment event received: ",
            payload.eventType,
            payload,
          );

          if (payload.eventType === "INSERT") {
            const newComment = fromDbComment(payload.new);
            const roastId = payload.new.roast_id;

            setRoasts((prev) =>
              prev.map((r) => {
                if (r.id !== roastId) return r;
                const existing = Array.isArray(r.comments) ? r.comments : [];
                // Idempotency: don't duplicate if already added locally
                if (existing.some((c) => c.id === newComment.id)) return r;
                return { ...r, comments: [newComment, ...existing] };
              }),
            );

            // Live ticker update for all windows
            const preview =
              (newComment.text || "").slice(0, 35) +
              (newComment.text?.length > 35 ? "..." : "");
            setTickerEvents((prev) => [
              `💬 @${newComment.author?.handle || "spectator"} commented: "${preview}"`,
              ...prev,
            ]);
          } else if (payload.eventType === "UPDATE") {
            const updatedComment = fromDbComment(payload.new);
            const roastId = payload.new.roast_id;

            setRoasts((prev) =>
              prev.map((r) => {
                const hasComment = (r.comments || []).some(
                  (c) => c.id === updatedComment.id,
                );
                if (r.id !== roastId && !hasComment) return r;
                return {
                  ...r,
                  comments: (r.comments || []).map((c) =>
                    c.id === updatedComment.id
                      ? { ...c, likes: updatedComment.likes }
                      : c,
                  ),
                };
              }),
            );
          } else if (payload.eventType === "DELETE") {
            setRoasts((prev) =>
              prev.map((r) => ({
                ...r,
                comments: (r.comments || []).filter(
                  (c) => c.id !== payload.old?.id,
                ),
              })),
            );
          }
        },
      )
      .subscribe((status, err) => {
        console.log(`📡 Supabase Realtime [${topic}] status:`, status);
        if (err) console.error("Supabase Realtime subscription error:", err);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Initialize with server-friendly defaults to prevent SSR hydration errors
  const [tickerEvents, setTickerEvents] = useState(initialTicker);
  const [stats, setStats] = useState(initialStats);
  const [expiredRoasts, setExpiredRoasts] = useState([]);

  // Load client localStorage only after component mounts on client
  useEffect(() => {
    try {
      const storedTicker = localStorage.getItem("tickerEvents");
      if (storedTicker) setTickerEvents(JSON.parse(storedTicker));
      const storedStats = localStorage.getItem("stats");
      if (storedStats) setStats(JSON.parse(storedStats));
      const storedExpired = localStorage.getItem("expiredRoasts");
      if (storedExpired) setExpiredRoasts(JSON.parse(storedExpired));
    } catch (e) {
      console.warn("Could not read localStorage:", e);
    }
  }, []);

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
              (r) =>
                `☠️ @${r.target.handle}'s roast EXPIRED — $${r.bountyAmount} bounty forfeited!`,
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
    const expiresAt = new Date(
      now.getTime() + 72 * 60 * 60 * 1000,
    ).toISOString();

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
    supabase
      .from("roasts")
      .insert(toDbRoast(roast))
      .then(({ error }) => {
        if (error) {
          console.error("Failed to save roast to Supabase:", error.message);
        } else {
          console.log("Roast added to database!");
        }
      });

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
    // Optimistic UI: Update current screen immediately so the UI doesn't lag
    setRoasts((prev) =>
      prev.map((r) =>
        r.id === roastId
          ? {
              ...r,
              bountyAmount: r.bountyAmount + amount,
              spectatorContributions: (r.spectatorContributions || 0) + amount,
            }
          : r,
      ),
    );

    // Atomic Database RPC: Tells Postgres to do the addition server-side
    supabase
      .rpc("increment_bounty", {
        p_roast_id: roastId,
        p_amount: amount,
      })
      .then(({ data, error }) => {
        if (error) {
          console.error("Failed atomic bounty increment:", error.message);
        } else {
          console.log("Atomic bounty updated in DB:", data);
        }
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

    supabase
      .from("roasts")
      .update({
        defense_status: finalStatus,
        defense_text: defenseText || null,
      })
      .eq("id", roastId)
      .then(({ error }) => {
        if (error) {
          console.error("Failed to update defense in Supabase:", error.message);
        } else {
          console.log(
            `Supabase: Roast ${roastId} status is now ${finalStatus}`,
          );
        }
      });

    setRoasts((prev) =>
      prev.map((r) =>
        r.id === roastId
          ? {
              ...r,
              defenseStatus: finalStatus,
              defenseText: defenseText || null,
              isCleared: isPayToClear,
            }
          : r,
      ),
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
      activeRoasts: isPayToClear
        ? Math.max(0, prev.activeRoasts - 1)
        : prev.activeRoasts,
    }));
  }, []);

  const addComment = useCallback(
    (
      roastId,
      { handle = "you", displayName = "You", text, isTarget = false },
    ) => {
      if (!text || !text.trim()) return null;

      const cleanHandle =
        (handle || "you").replace(/^@/, "").trim() || "spectator";
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
        const previewText =
          text.trim().slice(0, 435) + (text.length > 35 ? "..." : "");
        setTickerEvents((tPrev) => [
          `💬 @${cleanHandle} commented on @${targetHandle}'s roast: "${previewText}"`,
          ...tPrev,
        ]);

        return prev.map((r) => {
          if (r.id === roastId) {
            const existingComments = Array.isArray(r.comments)
              ? r.comments
              : [];
            return {
              ...r,
              comments: [newComment, ...existingComments],
            };
          }
          return r;
        });
      });

      supabase
        .from("comments")
        .insert(toDbComment(newComment, roastId))
        .then(({ error }) => {
          if (error) {
            console.error("Failed to save comment to Supabase:", error.message);
          } else {
            console.log("Comment added to database!");
          }
        });

      return newComment;
    },
    [],
  );

  const likeComment = useCallback((roastId, commentId) => {
    // 1. Optimistic UI: Heart turns red and count goes up instantly for this user
    setRoasts((prev) =>
      prev.map((r) => {
        if (r.id !== roastId) return r;
        return {
          ...r,
          comments: (r.comments || []).map((c) =>
            c.id === commentId ? { ...c, likes: (c.likes || 0) + 1 } : c,
          ),
        };
      }),
    );

    // 2. Atomic Database RPC: Postgres increments `likes = likes + 1` safely
    supabase
      .rpc("increment_comment_likes", {
        p_comment_id: commentId,
      })
      .then(({ data, error }) => {
        if (error) {
          console.error("Failed to update likes in Supabase:", error.message);
        } else {
          console.log("Atomic comment like updated in DB:", data);
        }
      });
  }, []);

  // Sync state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("roasts", JSON.stringify(roasts));
      localStorage.setItem("tickerEvents", JSON.stringify(tickerEvents));
      localStorage.setItem("stats", JSON.stringify(stats));
      localStorage.setItem("expiredRoasts", JSON.stringify(expiredRoasts));
    }
  }, [roasts, tickerEvents, stats, expiredRoasts]);

  return (
    <RoastContext.Provider
      value={{
        roasts,
        loading,
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
