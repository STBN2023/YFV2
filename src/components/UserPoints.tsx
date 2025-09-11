"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/components/auth/SessionProvider";
import { Badge } from "@/components/ui/badge";

const UserPoints = () => {
  const { session } = useSession();
  const userId = session?.user?.id;
  const [points, setPoints] = useState<number | null>(null);

  const fetchPoints = () => {
    if (!userId) return;
    supabase
      .from("profiles")
      .select("points")
      .eq("id", userId)
      .single()
      .then(({ data, error }) => {
        if (error) throw error;
        setPoints(data?.points ?? 0);
      });
  };

  useEffect(() => {
    fetchPoints();
  }, [userId]);

  useEffect(() => {
    const handler = () => fetchPoints();
    window.addEventListener("points-updated", handler as EventListener);
    return () => window.removeEventListener("points-updated", handler as EventListener);
  }, []);

  if (!userId) return null;

  return (
    <div className="flex items-center justify-center">
      <Badge className="text-base py-2 px-3 bg-gradient-to-r from-fuchsia-600 to-amber-500 text-white shadow hover:brightness-105">
        Vos points: {points ?? "…"}
      </Badge>
    </div>
  );
};

export default UserPoints;