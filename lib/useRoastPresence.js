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
  let manager = presenceManagers.get(roastId);

  // If a manager already exists and is active or pending teardown:
  if (manager) {
    if (manager.teardownTimer) {
      clearTimeout(manager.teardownTimer);
      manager.teardownTimer = null;
    }
    return manager;
  }

  const tabId = `spectator-${Math.random().toString(36).slice(2, 9)}`;
  const room = `presence-roast-${roastId}`;
  const listeners = new Set();
  let currentCnt = 1;

  // Channel Reset Guard: Remove any pre-existing channel with this topic in Supabase cache
  // to avoid "cannot add presence callbacks after subscribe()"
  const existingChannels = typeof supabase.getChannels === "function" ? supabase.getChannels() : [];
  for (const ch of existingChannels) {
    if (ch.topic === `realtime:${room}` || ch.topic === room) {
      try {
        supabase.removeChannel(ch);
      } catch (e) {
        // ignore
      }
    }
  }

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

  manager = {
    channel,
    refCount: 0,
    teardownTimer: null,
    getCount: () => currentCnt,
    subscribeListener: (fn) => {
      listeners.add(fn);
      fn(currentCnt);
    },
    unsubscribeListener: (fn) => {
      listeners.delete(fn);
    },
    retain: () => {
      if (manager.teardownTimer) {
        clearTimeout(manager.teardownTimer);
        manager.teardownTimer = null;
      }
      manager.refCount++;
    },
    release: () => {
      manager.refCount--;
      if (manager.refCount <= 0) {
        // Debounce teardown by 2500ms to gracefully handle React StrictMode double-mounting
        if (manager.teardownTimer) clearTimeout(manager.teardownTimer);
        manager.teardownTimer = setTimeout(async () => {
          presenceManagers.delete(roastId);
          try {
            await channel.untrack();
            await supabase.removeChannel(channel);
          } catch (err) {
            console.warn("Error cleaning up presence channel:", err);
          }
        }, 2500);
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
