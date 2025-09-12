"use client";

import { useMemo } from "react";
import { V2_VIDEOS, type V2Video } from "@/data/v2-videos";
import { v2VideoUrl } from "@/integrations/supabase/storage";

export type ResolvedVideo = V2Video & {
  publicSrc: string;
};

/**
 * Résout les URLs publiques des vidéos V2 via Supabase Storage.
 * - bucket: nom du bucket (par défaut 'videos')
 * - On s'attend à trouver les fichiers sous 'v2/<nom du fichier>.mp4'
 */
export function useV2Videos(bucket = "videos") {
  const videos = useMemo<ResolvedVideo[]>(
    () =>
      V2_VIDEOS.map((v) => ({
        ...v,
        publicSrc: v2VideoUrl(v.src, bucket),
      })),
    [bucket],
  );

  return { videos };
}