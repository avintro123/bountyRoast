"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [twitterHandle, setTwitterHandle] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync Supabase Auth session on mount and subscribe to changes
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        // 1. Check active Supabase Auth session
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && mounted) {
          setUser(session.user);
          const handle =
            session.user.user_metadata?.user_name ||
            session.user.user_metadata?.preferred_username ||
            session.user.user_metadata?.name ||
            session.user.email?.split("@")[0] ||
            "founder";
          setTwitterHandle(handle.replace(/^@/, ""));
        } else {
          // 2. Check local dev/sandbox override if testing offline
          const devUser = typeof window !== "undefined" ? localStorage.getItem("bountyroast_dev_user") : null;
          if (devUser && mounted) {
            const parsed = JSON.parse(devUser);
            setUser({ id: "dev-user", email: `${parsed.handle}@twitter.com`, isDev: true });
            setTwitterHandle(parsed.handle);
          }
        }
      } catch (err) {
        console.warn("Auth initialization error:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    // Listen for live Supabase Auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setUser(session.user);
          const handle =
            session.user.user_metadata?.user_name ||
            session.user.user_metadata?.preferred_username ||
            session.user.user_metadata?.name ||
            session.user.email?.split("@")[0] ||
            "founder";
          setTwitterHandle(handle.replace(/^@/, ""));
        } else if (!localStorage.getItem("bountyroast_dev_user")) {
          setUser(null);
          setTwitterHandle(null);
        }
      }
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  // 1. Sign in with Twitter/X via Supabase OAuth
  const signInWithTwitter = useCallback(async (redirectTo) => {
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
      const redirectUrl = redirectTo || (typeof window !== "undefined" ? window.location.href : origin);
      
      // Modern Supabase X / Twitter (OAuth 2.0) uses provider: "x"
      let { data, error } = await supabase.auth.signInWithOAuth({
        provider: "x",
        options: {
          redirectTo: redirectUrl,
        },
      });

      // Fallback to legacy "twitter" if needed
      if (error && error.message?.toLowerCase().includes("unsupported provider")) {
        const fallback = await supabase.auth.signInWithOAuth({
          provider: "twitter",
          options: {
            redirectTo: redirectUrl,
          },
        });
        data = fallback.data;
        error = fallback.error;
      }

      if (error) throw error;
      return data;
    } catch (err) {
      console.warn("Twitter OAuth initialization warning:", err.message);
      throw err;
    }
  }, []);

  // 2. Developer/Sandbox Quick Login (allows instant testing of any founder handle)
  const devLoginAs = useCallback((handle) => {
    const clean = handle.replace(/^@/, "").trim();
    const mockUser = {
      id: `dev-${clean}`,
      email: `${clean}@twitter.com`,
      isDev: true,
      user_metadata: {
        user_name: clean,
        name: clean,
        avatar_url: `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${clean}`,
      },
    };
    if (typeof window !== "undefined") {
      localStorage.setItem("bountyroast_dev_user", JSON.stringify({ handle: clean }));
    }
    setUser(mockUser);
    setTwitterHandle(clean);
  }, []);

  // 3. Sign Out
  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("SignOut warning:", e);
    }
    if (typeof window !== "undefined") {
      localStorage.removeItem("bountyroast_dev_user");
    }
    setUser(null);
    setTwitterHandle(null);
  }, []);

  // 4. Helper: Check if current logged-in user matches the roast's target founder handle
  const isVerifiedFounder = useCallback(
    (targetHandle) => {
      if (!twitterHandle || !targetHandle) return false;
      return twitterHandle.toLowerCase().replace(/^@/, "") === targetHandle.toLowerCase().replace(/^@/, "");
    },
    [twitterHandle]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        twitterHandle,
        loading,
        signInWithTwitter,
        devLoginAs,
        signOut,
        isVerifiedFounder,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
