import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Profile } from "@/lib/marketplace";
import { queryClient } from "@/lib/query-client";

export function useSessionProfile() {
  const [session, setSession] = useState<ReturnType<() => Awaited<ReturnType<typeof supabase.auth.getSession>>>["data"]["session"] | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      setSession(data.session);
      if (data.session) {
        const { data: p } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.session.user.id)
          .maybeSingle();
        if (!cancelled) setProfile(p ?? null);
      } else {
        setProfile(null);
      }
      if (!cancelled) setLoading(false);
    };
    load();

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        load();
      }
    });
    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { session, profile, loading };
}

export async function signOutCleanly() {
  await queryClient.cancelQueries();
  queryClient.clear();
  await supabase.auth.signOut();
  window.location.replace("/auth");
}
