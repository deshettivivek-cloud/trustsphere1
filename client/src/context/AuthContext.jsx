// src/context/AuthContext.jsx

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext();

// Helper: race any promise against a timeout
const withTimeout = (promise, ms = 4000) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Auth timeout")), ms)
    ),
  ]);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);

  const fetchProfile = async (userId) => {
    if (!userId) {
      setProfile(null);
      setProfileError(null);
      return;
    }
    try {
      setProfileError(null);
      const { data, error } = await withTimeout(
        supabase.from("profiles").select("*").eq("id", userId).single()
      );

      if (error) {
        if (error.code === "PGRST116") {
          // Row not found
          setProfile(null);
          setProfileError("no_profile");
        } else {
          throw error;
        }
      } else {
        setProfile(data);
      }
    } catch (err) {
      console.error("[AuthContext] Profile fetch error:", err.message);
      setProfile(null);
      setProfileError(err.message);
    }
  };

  useEffect(() => {
    let mounted = true;

    // HARD safety timeout — no matter what, stop loading after 3s
    const safetyTimer = setTimeout(() => {
      if (mounted && loading) {
        console.warn("[AuthContext] Safety timeout — forcing loading=false");
        setLoading(false);
      }
    }, 3000);

    // Initial session check
    const init = async () => {
      try {
        const { data } = await withTimeout(supabase.auth.getSession(), 3000);
        if (!mounted) return;

        const currentUser = data?.session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          await fetchProfile(currentUser.id);
        }
      } catch (err) {
        console.error("[AuthContext] getSession error:", err.message);
        if (mounted) {
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();

    // Listen for auth changes (sign in / sign out)
    let subscription;
    try {
      const { data } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (!mounted) return;
          console.log("[AuthContext] Auth event:", event);

          if (event === "SIGNED_OUT" || !session) {
            setUser(null);
            setProfile(null);
            setProfileError(null);
            setLoading(false);
          } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
            const currentUser = session.user;
            setUser(currentUser);
            await fetchProfile(currentUser.id);
            if (mounted) setLoading(false);
          }
        }
      );
      subscription = data?.subscription;
    } catch (err) {
      console.error("[AuthContext] onAuthStateChange error:", err);
    }

    return () => {
      mounted = false;
      clearTimeout(safetyTimer);
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        profileError,
        refetchProfile: () => user && fetchProfile(user.id),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);