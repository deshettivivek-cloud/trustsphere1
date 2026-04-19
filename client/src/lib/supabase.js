import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// No-op lock: bypasses NavigatorLock to prevent timeout errors
// when multiple tabs or Vite HMR reloads create competing instances
const noopLock = async (_name, _acquireTimeout, fn) => {
  return await fn();
};

// Singleton pattern for HMR — reuse the same client across hot reloads
// This prevents "Multiple GoTrueClient instances" warnings
const getSupabaseClient = () => {
  if (typeof window !== "undefined" && window.__supabaseClient) {
    return window.__supabaseClient;
  }

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      storageKey: "sb-trustsphere-auth-token",
      storage: window.localStorage,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      lock: noopLock,
    },
  });

  if (typeof window !== "undefined") {
    window.__supabaseClient = client;
  }

  return client;
};

export const supabase = getSupabaseClient();