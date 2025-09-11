"use client";

import { useSession } from "@/components/auth/SessionProvider";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { showSuccess } from "@/utils/toast";

const AuthStatus = () => {
  const { session } = useSession();
  const email = session?.user?.email;

  const signOut = async () => {
    await supabase.auth.signOut();
    showSuccess("Déconnecté");
  };

  if (!email) return null;

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600 dark:text-gray-300">Connecté: {email}</span>
      <Button variant="secondary" size="sm" onClick={signOut}>Se déconnecter</Button>
    </div>
  );
};

export default AuthStatus;