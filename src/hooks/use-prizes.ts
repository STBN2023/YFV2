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
        if (data && data.length > 0) {
          const mapped = (data as DbPrize[]).map((p) => ({
            id: p.id,
            label: p.label,
            image: p.image_url,
            points: p.points ?? 0,
          }));
          setPrizes(mapped);
        }
      });
  }, []);

  return { prizes };
}