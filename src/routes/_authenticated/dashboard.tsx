import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/dashboard")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) throw redirect({ to: "/auth" });
    const { data: profile } = await supabase
      .from("profiles")
      .select("user_type")
      .eq("id", data.session.user.id)
      .maybeSingle();
    const type = profile?.user_type ?? "buyer";
    throw redirect({ to: type === "admin" ? "/admin" : type === "farmer" ? "/farmer" : "/buyer" });
  },
  component: () => null,
});
