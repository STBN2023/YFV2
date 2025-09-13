"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSession } from "@/components/auth/SessionProvider";
import { supabase } from "@/integrations/supabase/client";
import { useV2Videos } from "@/hooks/use-v2-videos";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";

const V2Progress: React.FC = () => {
  const { session } = useSession();
  const userId = session?.user?.id;
  const { videos } = useV2Videos();
  const [discovered, setDiscovered] = useState<number>(0);

  const total = videos.length;
  const titlesSet = useMemo(() => new Set(videos.map((v) => v.title)), [videos]);

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
        const seen = new Set<string>();
        (data ?? []).forEach((row) => {
          const lbl = (row as any).prize_label as string;
          if (titlesSet.has(lbl)) seen.add(lbl);
        });
        setDiscovered(seen.size);
      });
  };

  useEffect(() => {
    fetchDiscovered();
  }, [userId, total, titlesSet]);

  useEffect(() => {
    const handler = () => fetchDiscovered();
    window.addEventListener("points-updated", handler as EventListener);
    return () => window.removeEventListener("points-updated", handler as EventListener);
  }, [titlesSet, userId, total]);

  const pct = useMemo(
    () => (total > 0 ? Math.round((discovered / total) * 100) : 0),
    [discovered, total]
  );

  if (!userId || total === 0) return null;

  return (
    <Card className="w-full max-w-md">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium">Progression V2</div>
          <div className="text-xs text-gray-600">{discovered}/{total} vidéos</div>
        </div>
        <Progress value={pct} />
      </CardContent>
    </Card>
  );
};

export default V2Progress;