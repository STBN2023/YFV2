"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "@/components/auth/SessionProvider";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock } from "lucide-react";
import { usePrizes } from "@/hooks/use-prizes";

type Counts = Record<string, number>;

const CollectionGrid = () => {
  const { session } = useSession();
  const userId = session?.user?.id;
  const [counts, setCounts] = useState<Counts>({});
  const { prizes } = usePrizes();

  useEffect(() => {
    if (!userId) return;
    supabase
      .from("spins")
      .select("prize_label")
      .eq("user_id", userId)
      .then(({ data, error }) => {
        if (error) throw error;
        const c: Counts = {};
        (data ?? []).forEach((row) => {
          const lbl = (row as any).prize_label as string;
          c[lbl] = (c[lbl] ?? 0) + 1;
        });
        setCounts(c);
      });
  }, [userId]);

  const items = useMemo(() => prizes, [prizes]);

  if (!userId) return null;

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">Votre collection</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {items.map((p) => {
          const got = (counts[p.label] ?? 0) > 0;
          const n = counts[p.label] ?? 0;
          return (
            <Card key={p.id} className="overflow-hidden relative">
              <CardContent className="p-2">
                <div className="relative aspect-square rounded-md overflow-hidden">
                  {got ? (
                    <>
                      <img
                        src={p.image}
                        alt={p.label}
                        className="w-full h-full object-cover"
                      />
                      {n > 0 && (
                        <Badge className="absolute top-2 right-2">
                          ×{n}
                        </Badge>
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
                <div className="mt-2 text-sm font-medium text-center">{p.label}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default CollectionGrid;