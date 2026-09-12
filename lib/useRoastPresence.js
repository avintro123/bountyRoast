"use client";

import { useEffect, useState } from "react";
import { supabase } from "./supabase";

/**
 * Shared presence manager:
 * Ensures only ONE WebSocket channel and ONE presence tracker per roastId per browser tab.
 * Multiple components (e.g. Header badge + Comments badge) share the same channel and state
 * using reference counting.
 *
 * Zero database writes: presence is tracked in-memory across Supabase's Realtime cluster
 * using Phoenix CRDTs and automatically drops when a client closes their tab or navigates away.
 */
const presenceManagers = new Map();

function getOrCreatePresenceManager(roastId) {
  if (presenceManagers.has(roastId)) {
    return presenceManagers.get(roastId);
  }

  const tabId = `spectator-${Math.random().toString(36).slice(2, 9)}`;
  const room = `presence-roast-${roastId}`;
  const listeners = new Set();
  let currentCnt = 1;

  const channel = supabase.channel(room, {
    config: {
      presence: {
        key: tabId,
      },
    },
  });

  channel
    .on("presence", { event: "sync" }, () => {
      const state = channel.presenceState();
      const activeCnt = Math.max(1, Object.keys(state).length);
      currentCnt = activeCnt;
      listeners.forEach((fn) => fn(activeCnt));
    })
    .subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await channel.track({
          tabId,
          onlineAt: new Date().toISOString(),
        });
      }
    });

  const manager = {
    channel,
    refCount: 0,
    getCount: () => currentCnt,
    subscribeListener: (fn) => {
      listeners.add(fn);
      fn(currentCnt);
    },
    unsubscribeListener: (fn) => {
      listeners.delete(fn);
    },
    retain: () => {
      manager.refCount++;
    },
    release: async () => {
      manager.refCount--;
      if (manager.refCount <= 0) {
        presenceManagers.delete(roastId);
        try {
          await channel.untrack();
          await supabase.removeChannel(channel);
        } catch (err) {
          console.warn("Error cleaning up presence channel:", err);
        }
      }
    },
  };

  presenceManagers.set(roastId, manager);
  return manager;
}

export function useRoastPresence(roastId) {
  const [spectatorCnt, setSpectatorCnt] = useState(1);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!roastId) return;

    const manager = getOrCreatePresenceManager(roastId);
    manager.retain();
    setIsConnected(true);
    manager.subscribeListener(setSpectatorCnt);

    return () => {
      manager.unsubscribeListener(setSpectatorCnt);
      manager.release();
    };
  }, [roastId]);

  return { spectatorCnt, isConnected };
}
