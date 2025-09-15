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

  const encodedVariants = baseVariants.flatMap((v) => {
    const ls = v.lastIndexOf("/");
    const d = ls >= 0 ? v.slice(0, ls + 1) : "/";
    const f = ls >= 0 ? v.slice(ls + 1) : v.replace(/^\//, "");
    return [
      encodeURI(v),
      d + encodeURIComponent(f),
    ];
  });

  return Array.from(new Set([...baseVariants, ...encodedVariants]));
}

/**
 * Résout les URLs des vidéos V2:
 * - priorité: fichiers locaux (public/prizes/v2/...)
 * - fallback: Supabase Storage (bucket 'videos', chemin v2/...)
 */
export function useV2Videos() {
  const videos = useMemo<ResolvedVideo[]>(
    () =>
      V2_VIDEOS.map((v) => {
        const localVariants = buildLocalPaths(v.src);
        const supa = v2VideoUrl(v.src, "videos");
        const all = Array.from(new Set([...localVariants, supa]));
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