"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useV2Videos } from "@/hooks/use-v2-videos";
import VideoTile from "@/components/VideoTile";
import { useSession } from "@/components/auth/SessionProvider";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Lock } from "lucide-react";

type Counts = Record<string, number>;

const V2Grid: React.FC = () => {
  const { videos } = useV2Videos();
  const { session } = useSession();
  const userId = session?.user?.id;
  const [counts, setCounts] = useState<Counts>({});

  const titles = useMemo(() => new Set(videos.map((v) => v.title)), [videos]);

  const fetchCounts = () => {
    if (!userId) {
      setCounts({});
      return;
    }
    supabase
      .from("spins")
      .select("prize_label")
      .eq("user_id", userId)
      .then(({ data, error }) => {
        if (error) throw error;
        const c: Counts = {};
        (data ?? []).forEach((row) => {
          const lbl = (row as any).prize_label as string;
          if (titles.has(lbl)) {
            c[lbl] = (c[lbl] ?? 0) + 1;
          }
        });
        setCounts(c);
      });
  };

  useEffect(() => {
    fetchCounts();
  }, [userId, titles]);

  useEffect(() => {
    const handler = () => fetchCounts();
    window.addEventListener("points-updated", handler as EventListener);
    return () => window.removeEventListener("points-updated", handler as EventListener);
  }, [titles, userId]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {videos.map((v) => {
        const got = (counts[v.title] ?? 0) > 0;
        const n = counts[v.title] ?? 0;
        return (
          <Card key={v.id} className="overflow-hidden relative">
            <CardContent className="p-2">
              <div className="relative aspect-square rounded-md overflow-hidden">
                {got ? (
                  <>
                    <VideoTile
                      src={v.publicSrc}
                      fallbackSrcs={v.fallbackSrcs}
                      poster={v.poster}
                      title={v.title}
                    />
                    {n > 1 && (
                      <Badge className="absolute top-2 right-2">×{n}</Badge>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-neutral-800 dark:to-neutral-700 flex items-center justify-center">
                    <div className="flex flex-col items-center text-gray-600 dark:text-gray-300">
                      <Lock className="w-6 h-6 mb-1" />
                      <span className="text-sm">Caché</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-2 text-sm font-medium text-center">
                {got ? `V2 — ${v.title}` : "???"}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default V2Grid;