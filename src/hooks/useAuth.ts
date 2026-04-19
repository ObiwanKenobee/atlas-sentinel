import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isNgoMember: boolean;
}

export function useAuth(): AuthState {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNgoMember, setIsNgoMember] = useState(false);

  useEffect(() => {
    // Set up listener BEFORE getSession (Supabase best practice)
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s?.user) {
        // Defer the role lookup to avoid blocking the auth callback
        setTimeout(() => fetchRole(s.user.id), 0);
      } else {
        setIsNgoMember(false);
      }
    });

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user) fetchRole(data.session.user.id);
      setLoading(false);
    });

    async function fetchRole(userId: string) {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "ngo_member")
        .maybeSingle();
      setIsNgoMember(!!data);
    }

    return () => sub.subscription.unsubscribe();
  }, []);

  return {
    session,
    user: session?.user ?? null,
    loading,
    isNgoMember,
  };
}

export async function signOut() {
  await supabase.auth.signOut();
}
