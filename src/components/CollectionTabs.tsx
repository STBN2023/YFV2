"use client";

import { useEffect, useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Lock, Sparkles } from "lucide-react";
import CollectionGrid from "@/components/CollectionGrid";
import { useSession } from "@/components/auth/SessionProvider";
import { supabase } from "@/integrations/supabase/client";
import { usePrizes } from "@/hooks/use-prizes";

type Counts = Record<string, number>;

const CollectionTabs = () => {
  const { session } = useSession();
  const userId = session?.user?.id;
  const { prizes } = usePrizes();
  const [counts, setCounts] = useState<Counts>({});

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
          c[lbl] = (c[lbl] ?? 0) + 1;
        });
        setCounts(c);
      });
  };

  useEffect(() => {
    fetchCounts();
  }, [userId]);

  useEffect(() => {
    const handler = () => fetchCounts();
    window.addEventListener("points-updated", handler as EventListener);
    return () => window.removeEventListener("points-updated", handler as EventListener);
  }, []);

  const totalV1 = prizes.length;
  const discoveredV1 = useMemo(
    () => prizes.reduce((acc, p) => acc + ((counts[p.label] ?? 0) > 0 ? 1 : 0), 0),
    [prizes, counts]
  );
  const v1Complete = totalV1 > 0 && discoveredV1 >= totalV1;

  // Liste placeholders V2: même nombre de cartes que V1
  const v2Placeholders = useMemo(() => Array.from({ length: totalV1 }), [totalV1]);

  return (
    <Tabs defaultValue="v1" className="w-full">
      <div className="flex items-center justify-between mb-4">
        <TabsList className="grid grid-cols-2 w-full sm:w-auto">
          <TabsTrigger value="v1" className="px-6">V1</TabsTrigger>
          <TabsTrigger value="v2" className="px-6 relative">
            <span className="flex items-center gap-2">
              V2
              {!v1Complete && (
                <Lock className="w-4 h-4 text-gray-500" aria-hidden />
              )}
            </span>
          </TabsTrigger>
        </TabsList>

        <div className="text-xs text-gray-600 hidden sm:block">
          {discoveredV1}/{totalV1} cartes V1 découvertes
        </div>
      </div>

      <TabsContent value="v1" className="mt-0">
        <CollectionGrid />
      </TabsContent>

      <TabsContent value="v2" className="mt-0">
        {!v1Complete && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/30 dark:bg-amber-900/20 dark:text-amber-100 p-3 text-sm flex items-center gap-2">
            <Lock className="w-4 h-4" />
            <span>Terminez la collection V1 pour débloquer la V2.</span>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {v2Placeholders.map((_, i) => (
            <Card key={i} className="overflow-hidden relative">
              <CardContent className="p-2">
                <div className="relative aspect-square rounded-md overflow-hidden">
                  <div className={`w-full h-full flex items-center justify-center ${v1Complete ? "bg-gradient-to-br from-gray-200 to-gray-300 dark:from-neutral-800 dark:to-neutral-700" : "bg-gradient-to-br from-gray-200 to-gray-300 dark:from-neutral-800 dark:to-neutral-700"}`}>
                    <div className="flex flex-col items-center text-gray-600 dark:text-gray-300">
                      {v1Complete ? (
                        <Sparkles className="w-6 h-6 mb-1" />
                      ) : (
                        <Lock className="w-6 h-6 mb-1" />
                      )}
                      <span className="text-sm">{v1Complete ? "Bientôt" : "Verrouillé"}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-sm font-medium text-center">
                  {v1Complete ? "V2 — bientôt disponible" : "???"}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default CollectionTabs;