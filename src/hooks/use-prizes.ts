"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Prize as LocalPrize } from "@/data/prizes";
import { PRIZES as LOCAL_FALLBACK } from "@/data/prizes";

type DbPrize = {
  id: string;
  label: string;
  image_url: string;
  points: number | null;
  active: boolean | null;
  order_index: number | null;
  created_at: string | null;
};

export function usePrizes() {
  const [prizes, setPrizes] = useState<LocalPrize[]>(LOCAL_FALLBACK);

  useEffect(() => {
    supabase
      .from("prizes")
      .select("id,label,image_url,points,active,order_index,created_at")
      .eq("active", true)
      .order("order_index", { ascending: true })
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) throw error;

        if (!data || data.length === 0) {
          // Rien en base -> garder le catalogue local complet
          setPrizes(LOCAL_FALLBACK);
          return;
        }

        // Map DB -> LocalPrize
        const dbMapped = (data as DbPrize[]).map((p) => ({
          id: p.id,
          label: p.label,
          image: p.image_url,
          points: p.points ?? 0,
        })) as LocalPrize[];

        // Fusion: base = catalogue local (toutes les cartes), on écrase/complète par les données DB via le label,
        // puis on ajoute les éventuels nouveaux lots DB non présents dans le catalogue local.
        const byLabel = new Map<string, LocalPrize>();
        // 1) Commencer par le fallback (assure que toutes les cartes apparaissent)
        for (const f of LOCAL_FALLBACK) {
          byLabel.set(f.label, { ...f });
        }
        // 2) Écraser/compléter par les données DB (image/points potentiellement différentes)
        for (const d of dbMapped) {
          const existing = byLabel.get(d.label);
          byLabel.set(d.label, existing ? { ...existing, ...d } : d);
        }
        // 3) Conserver l'ordre du fallback, puis ajouter les nouvelles cartes DB (non présentes en fallback)
        const fallbackLabels = LOCAL_FALLBACK.map((p) => p.label);
        const merged: LocalPrize[] = [];
        for (const label of fallbackLabels) {
          const item = byLabel.get(label);
          if (item) merged.push(item);
        }
        for (const d of dbMapped) {
          if (!fallbackLabels.includes(d.label)) {
            merged.push(d);
          }
        }

        setPrizes(merged);
      });
  }, []);

  return { prizes };
}