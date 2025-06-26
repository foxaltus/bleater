import { useEffect, useState, useMemo } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import { AuthContext } from "./authContext";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    // Set auto-login parameter to off to prevent automatic login
    const url = new URL(window.location.href);
    url.searchParams.set("auto_login", "off");
    window.history.pushState({}, "", url);
  };

  // Add GitHub sign in function
  const signInWithGitHub = async () => {
    // Clean up the URL by removing the auto_login parameter when signing in
    // This resets to default behavior (auto-login enabled) for next session
    const url = new URL(window.location.href);
    if (url.searchParams.has("auto_login")) {
      url.searchParams.delete("auto_login");
      window.history.pushState({}, "", url);
    }

    // Proceed with GitHub authentication
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: window.location.origin,
      },
    });
  };

  // Function to check if auto-login is enabled
  const autoLogin = () => {
    const urlParams = new URLSearchParams(window.location.search);
    // Auto-login is on by default or when explicitly set to 'on',
    // it's off only when set to 'off'
    return urlParams.get("auto_login") !== "off";
  };

  // Auto-login is enabled by default and disabled on sign-out
  // We don't need an explicit function to re-enable it as that happens automatically on sign-in

  const value = useMemo(
    () => ({
      session,
      user,
      loading,
      signOut,
      signInWithGitHub,
      autoLogin,
    }),
    [session, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
