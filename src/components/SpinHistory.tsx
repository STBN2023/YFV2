"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useSession } from "@/components/auth/SessionProvider";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";

type Row = {
  id: string;
  prize_label: string | null;
  points: number | null;
  created_at: string;
};

const SpinHistory: React.FC = () => {
  const { session } = useSession();
  const userId = session?.user?.id;
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLast = useCallback(() => {
    if (!userId) {
      setRows([]);
      return;
    }
    setLoading(true);
    supabase
      .from("spins")
      .select("id, prize_label, points, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(3)
      .then(({ data, error }) => {
        if (error) throw error;
        setRows((data as Row[]) ?? []);
        setLoading(false);
      });
  }, [userId]);

  useEffect(() => {
    fetchLast();
  }, [fetchLast]);

  // Réagit aux événements internes "points-updated"
  useEffect(() => {
    const handler = () => fetchLast();
    window.addEventListener("points-updated", handler as EventListener);
    return () => window.removeEventListener("points-updated", handler as EventListener);
  }, [fetchLast]);

  // Réagit aux inserts via Supabase Realtime
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel("spins-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "spins",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchLast();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchLast]);

  if (!userId) return null;

  return (
    <Card className="w-full max-w-md">
      <CardContent className="p-4 space-y-2">
        <div className="text-sm font-medium">Derniers tirages</div>
        {loading ? (
          <div className="text-xs text-gray-500">Chargement…</div>
        ) : rows.length === 0 ? (
          <div className="text-xs text-gray-500">Aucun tirage encore. Lancez la roue !</div>
        ) : (
          <ul className="text-sm space-y-1">
            {rows.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-2">
                <span className="truncate max-w-[50%]">{r.prize_label ?? "—"}</span>
                <span className="text-xs text-gray-500">
                  {new Date(r.created_at).toLocaleString()}
                </span>
                <span className="font-semibold">+{r.points ?? 0}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default SpinHistory;