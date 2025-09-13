"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSession } from "@/components/auth/SessionProvider";
import { supabase } from "@/integrations/supabase/client";
import { usePrizes } from "@/hooks/use-prizes";
import { Card, CardContent } from "@/components/ui/card";
import GradientProgress from "@/components/GradientProgress";

const CollectionProgress: React.FC = () => {
  const { session } = useSession();
  const userId = session?.user?.id;
  const { prizes } = usePrizes();
  const [discovered, setDiscovered] = useState<number>(0);

  const total = prizes.length;

  const fetchDiscovered = () => {
    if (!userId || total === 0) {
      setDiscovered(0);
      return;
    }
    supabase
      .from("spins")
      .select("prize_label")
      .eq("user_id", userId)
      .then(({ data, error }) => {
        if (error) throw error;
        const set = new Set<string>();
        (data ?? []).forEach((row) => set.add((row as any).prize_label as string));
        const count = prizes.reduce((acc, p) => acc + (set.has(p.label) ? 1 : 0), 0);
        setDiscovered(count);
      });
  };

  useEffect(() => {
    fetchDiscovered();
  }, [userId, total]);

  useEffect(() => {
    const handler = () => fetchDiscovered();
    window.addEventListener("points-updated", handler as EventListener);
    return () => window.removeEventListener("points-updated", handler as EventListener);
  }, [total, userId]);

  const pct = useMemo(() => (total > 0 ? Math.round((discovered / total) * 100) : 0), [discovered, total]);

  if (!userId || total === 0) return null;

  return (
    <Card className="w-full border-white/60 dark:border-white/10 bg-white/90 dark:bg-neutral-900/80 backdrop-blur">
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-1">
          <div className="text-sm font-semibold">Progression V1</div>
          <div className="text-[11px] text-gray-600 dark:text-gray-300">{discovered}/{total} cartes</div>
        </div>
        <GradientProgress
          value={pct}
          height="md"
          from="from-fuchsia-500"
          to="to-emerald-400"
          showPercent
        />
      </CardContent>
    </Card>
  );
};

export default CollectionProgress;