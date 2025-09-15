"use client";

import { useMemo } from "react";
import { V2_VIDEOS, type V2Video } from "@/data/v2-videos";
import { v2VideoUrl } from "@/integrations/supabase/storage";

export type ResolvedVideo = V2Video & {
  publicSrc: string;
  fallbackSrcs: string[];
};

function buildLocalPaths(originalSrc: string) {
  const src = originalSrc.startsWith("/") ? originalSrc : `/${originalSrc}`;
  const lastSlash = src.lastIndexOf("/");
  const dir = lastSlash >= 0 ? src.slice(0, lastSlash + 1) : "/";
  const filename = lastSlash >= 0 ? src.slice(lastSlash + 1) : src.replace(/^\//, "");

  const trimmed = filename.trim();
  const noTrailingBeforeExt = trimmed.replace(/\s+(\.[A-Za-z0-9]+)$/i, "$1");
  const collapsedSpaces = noTrailingBeforeExt.replace(/\s+/g, " ");

  const baseVariants = [
    src,
    `${dir}${trimmed}`,
    `${dir}${noTrailingBeforeExt}`,
    `${dir}${collapsedSpaces}`,
  ];

  // Variantes encodées (pour gérer espaces/accents)
  const encodedVariants = baseVariants.flatMap((v) => {
    const ls = v.lastIndexOf("/");
    const d = ls >= 0 ? v.slice(0, ls + 1) : "/";
    const f = ls >= 0 ? v.slice(ls + 1) : v.replace(/^\//, "");
    return [
      encodeURI(v),
      d + encodeURIComponent(f),
    ];
  });

  const unique = Array.from(new Set([...baseVariants, ...encodedVariants]));
  return unique;
}

/**
 * Résout les URLs des vidéos V2:
 * - priorité: Supabase Storage (bucket 'videos', chemin v2/...)
 * - fallback: multiples variantes locales dans /public pour les devs locaux
 */
export function useV2Videos() {
  const videos = useMemo<ResolvedVideo[]>(
    () =>
      V2_VIDEOS.map((v) => {
        const supa = v2VideoUrl(v.src, "videos"); // ex: videos/v2/xxx.mp4
        const localVariants = buildLocalPaths(v.src);
        // On met Supabase en premier, puis les variantes locales
        const all = Array.from(new Set([supa, ...localVariants]));
        const [first, ...rest] = all;
        return {
          ...v,
          publicSrc: first,
          fallbackSrcs: rest,
        };
      }),
    []
  );

  return { videos };
}