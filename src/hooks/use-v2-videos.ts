"use client";

import { useMemo } from "react";
import { V2_VIDEOS, type V2Video } from "@/data/v2-videos";
import { publicUrl } from "@/integrations/supabase/storage";

export type ResolvedVideo = V2Video & {
  publicSrc: string;
  fallbackSrcs: string[];
};

function buildKeys(originalSrc: string) {
  const prefix = "/prizes/v2/";
  // Clé brute d'origine
  const baseKey = originalSrc.startsWith(prefix)
    ? `v2/${originalSrc.slice(prefix.length)}`
    : originalSrc.replace(/^\//, "");

  // Découper en dossier + nom de fichier
  const lastSlash = baseKey.lastIndexOf("/");
  const dir = lastSlash >= 0 ? baseKey.slice(0, lastSlash + 1) : "";
  const filename = lastSlash >= 0 ? baseKey.slice(lastSlash + 1) : baseKey;

  // Variantes de nom
  const trimmed = filename.trim();
  const noTrailingBeforeExt = trimmed.replace(/\s+(\.[A-Za-z0-9]+)$/i, "$1"); // supprime espaces juste avant .mp4 etc.
  const collapsedSpaces = noTrailingBeforeExt.replace(/\s+/g, " ");

  // Dédoublonner en gardant l'ordre: [original, trimmed, noTrailingBeforeExt, collapsedSpaces]
  const keys = Array.from(
    new Set(
      [baseKey, dir + trimmed, dir + noTrailingBeforeExt, dir + collapsedSpaces]
        .filter(Boolean),
    ),
  );

  return keys;
}

/**
 * Résout les URLs publiques des vidéos V2 via Supabase Storage.
 * Génère aussi des URLs alternatives si le nom exact diffère (espaces superflus, etc.).
 */
export function useV2Videos(bucket = "videos") {
  const videos = useMemo<ResolvedVideo[]>(
    () =>
      V2_VIDEOS.map((v) => {
        const keys = buildKeys(v.src);
        const urls = keys.map((k) => publicUrl(bucket, k));
        const [first, ...rest] = urls;
        return {
          ...v,
          publicSrc: first,
          fallbackSrcs: rest,
        };
      }),
    [bucket],
  );

  return { videos };
}