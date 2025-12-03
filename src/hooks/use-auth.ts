import { useState, useEffect, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "employee";

interface AuthState {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  profile: { full_name: string; email: string } | null;
  loading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    role: null,
    profile: null,
    loading: true,
  });

  const fetchUserData = useCallback(async (userId: string) => {
    try {
      const [roleResult, profileResult] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", userId).maybeSingle(),
        supabase.from("profiles").select("full_name, email").eq("user_id", userId).maybeSingle(),
      ]);

      return {
        role: (roleResult.data?.role as AppRole) || null,
        profile: profileResult.data || null,
      };
    } catch (error) {
      console.error("Error fetching user data:", error);
      return { role: null, profile: null };
    }
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setAuthState((prev) => ({
          ...prev,
          session,
          user: session?.user ?? null,
        }));

        if (session?.user) {
          setTimeout(async () => {
            const userData = await fetchUserData(session.user.id);
            setAuthState((prev) => ({
              ...prev,
              ...userData,
              loading: false,
            }));
          }, 0);
        } else {
          setAuthState((prev) => ({
            ...prev,
            role: null,
            profile: null,
            loading: false,
          }));
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState((prev) => ({
        ...prev,
        session,
        user: session?.user ?? null,
      }));

      if (session?.user) {
        fetchUserData(session.user.id).then((userData) => {
          setAuthState((prev) => ({
            ...prev,
            ...userData,
            loading: false,
          }));
        });
      } else {
        setAuthState((prev) => ({ ...prev, loading: false }));
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchUserData]);

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { full_name: fullName },
      },
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const isAdmin = authState.role === "admin";

  return {
    ...authState,
    signUp,
    signIn,
    signOut,
    isAdmin,
  };
}
