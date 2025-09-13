"use client";

import { useMemo } from "react";
import { V2_VIDEOS, type V2Video } from "@/data/v2-videos";

export type ResolvedVideo = V2Video & {
  publicSrc: string;
  fallbackSrcs: string[];
};

function buildLocalPaths(originalSrc: string) {
  // On génère des variantes robustes pour gérer espaces superflus, etc.
  const src = originalSrc.startsWith("/") ? originalSrc : `/${originalSrc}`;
  const lastSlash = src.lastIndexOf("/");
  const dir = lastSlash >= 0 ? src.slice(0, lastSlash + 1) : "/";
  const filename = lastSlash >= 0 ? src.slice(lastSlash + 1) : src.replace(/^\//, "");

  const trimmed = filename.trim();
  const noTrailingBeforeExt = trimmed.replace(/\s+(\.[A-Za-z0-9]+)$/i, "$1");
  const collapsedSpaces = noTrailingBeforeExt.replace(/\s+/g, " ");

  const variants = Array.from(
    new Set([src, `${dir}${trimmed}`, `${dir}${noTrailingBeforeExt}`, `${dir}${collapsedSpaces}`])
  );
  return variants;
}

/**
 * Résout les URLs locales des vidéos V2 (servies depuis /public).
 */
export function useV2Videos() {
  const videos = useMemo<ResolvedVideo[]>(
    () =>
      V2_VIDEOS.map((v) => {
        const paths = buildLocalPaths(v.src);
        const [first, ...rest] = paths;
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