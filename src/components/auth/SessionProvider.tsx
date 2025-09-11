"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useLocation, useNavigate } from "react-router-dom";

type SessionContextType = {
  session: Session | null;
  loading: boolean;
};

const SessionContext = createContext<SessionContextType>({
  session: null,
  loading: true,
});

export const useSession = () => useContext(SessionContext);

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (loading) return;

    // Si pas de session, on connecte automatiquement en anonyme (aucune action requise).
    if (!session) {
      // On déclenche la connexion anonyme; l'effet se réactualise quand la session arrive.
      supabase.auth.signInAnonymously();
      return;
    }

    // Si une session existe et qu'on est sur /login, on revient à l'accueil.
    if (session && location.pathname === "/login") {
      navigate("/", { replace: true });
    }
  }, [session, loading, location.pathname, navigate]);

  const value = useMemo(() => ({ session, loading }), [session, loading]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};