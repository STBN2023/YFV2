"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Lock } from "lucide-react";
import CollectionGrid from "@/components/CollectionGrid";
import { useSession } from "@/components/auth/SessionProvider";
import { supabase } from "@/integrations/supabase/client";
import { usePrizes } from "@/hooks/use-prizes";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { showError, showSuccess } from "@/utils/toast";
import EffectsOverlay from "@/components/EffectsOverlay";
import V2Grid from "@/components/V2Grid";

type Counts = Record<string, number>;
const TAB_STORAGE_KEY = "collection-tab";

const CollectionTabs = () => {
  const { session } = useSession();
  const userId = session?.user?.id;
  const { prizes } = usePrizes();
  const [counts, setCounts] = useState<Counts>({});
  const [tab, setTab] = useState<"v1" | "v2">(() => {
    try {
      const saved = localStorage.getItem(TAB_STORAGE_KEY);
      return saved === "v2" ? "v2" : "v1";
    } catch {
      return "v1";
    }
  });
  const [effect, setEffect] = useState<"confetti" | "unlockV1" | "unlockV2" | null>(null);
  const prevCompleteRef = useRef<boolean>(false);
  const prevDiscoveredRef = useRef<number>(0);

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

  // Init prev discovered to current to éviter un faux déclenchement au montage
  useEffect(() => {
    prevDiscoveredRef.current = discoveredV1;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // init once

  // Animation: première découverte V1 -> unlockV1 (si on partait de 0)
  useEffect(() => {
    const prev = prevDiscoveredRef.current;
    if (prev === 0 && discoveredV1 > 0) {
      setEffect("unlockV1");
      showSuccess("Niveau 1 débloqué !");
      const t = window.setTimeout(() => setEffect(null), 2200);
      return () => window.clearTimeout(t);
    }
    prevDiscoveredRef.current = discoveredV1;
  }, [discoveredV1]);

  // Célébration à la complétion réelle: unlockV2 + bascule auto sur l'onglet V2
  useEffect(() => {
    if (!prevCompleteRef.current && v1Complete) {
      setEffect("unlockV2");
      showSuccess("Collection V1 complétée ! V2 débloquée 🎉");
      setTab("v2");
      const t = window.setTimeout(() => setEffect(null), 3000);
      return () => window.clearTimeout(t);
    }
    prevCompleteRef.current = v1Complete;
  }, [v1Complete]);

  // V2 uniquement si V1 complétée (plus d'override)
  const v2Unlocked = v1Complete;

  // Si V2 est verrouillée mais sélectionnée (stocké), on revient à V1.
  useEffect(() => {
    if (!v2Unlocked && tab === "v2") {
      setTab("v1");
    }
  }, [v2Unlocked, tab]);

  // Persiste l'onglet choisi
  useEffect(() => {
    try {
      localStorage.setItem(TAB_STORAGE_KEY, tab);
    } catch {
      // ignore
    }
  }, [tab]);

  const onChangeTab = (value: string) => {
    const next = value as "v1" | "v2";
    if (next === "v2" && !v2Unlocked) {
      showError("Terminez la collection V1 pour débloquer la V2.");
      return;
    }
    setTab(next);
  };

  return (
    <div className="relative">
      {effect && <EffectsOverlay type={effect} />}

      <Tabs value={tab} onValueChange={onChangeTab} className="w-full">
        <div className="flex items-center justify-between mb-4">
          <TabsList className="grid grid-cols-2 w-full sm:w-auto">
            <TabsTrigger value="v1" className="px-6">V1</TabsTrigger>

            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger
                  value="v2"
                  className="px-6 relative data-[state=inactive]:opacity-100"
                >
                  <span className="flex items-center gap-2">
                    V2
                    {!v2Unlocked && (
                      <Lock className="w-4 h-4 text-gray-500" aria-hidden />
                    )}
                  </span>
                </TabsTrigger>
              </TooltipTrigger>
              {!v2Unlocked && (
                <TooltipContent side="top" align="center">
                  Terminez la collection V1 pour accéder à la V2.
                </TooltipContent>
              )}
            </Tooltip>
          </TabsList>

          <div className="text-xs text-gray-600">
            {discoveredV1}/{totalV1} cartes V1 découvertes
          </div>
        </div>

        <TabsContent value="v1" className="mt-0">
          <CollectionGrid />
        </TabsContent>

        <TabsContent value="v2" className="mt-0">
          {!v2Unlocked ? (
            <>
              <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/30 dark:bg-amber-900/20 dark:text-amber-100 p-3 text-sm flex items-center gap-2">
                <Lock className="w-4 h-4" />
                <span>Terminez la collection V1 pour débloquer la V2.</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {Array.from({ length: totalV1 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden relative">
                    <CardContent className="p-2">
                      <div className="relative aspect-square rounded-md overflow-hidden">
                        <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-neutral-800 dark:to-neutral-700 flex items-center justify-center">
                          <div className="flex flex-col items-center text-gray-600 dark:text-gray-300">
                            <Lock className="w-6 h-6 mb-1" />
                            <span className="text-sm">Verrouillé</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 text-sm font-medium text-center">???</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <V2Grid />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CollectionTabs;