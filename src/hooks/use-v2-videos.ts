"use client";

import { useMemo } from "react";
import { V2_VIDEOS, type V2Video } from "@/data/v2-videos";
import { v2VideoUrl, publicUrl } from "@/integrations/supabase/storage";

export type ResolvedVideo = V2Video & {
  publicSrc: string;
  fallbackSrcs: string[];
};

function splitDirAndFilename(src: string) {
  const s = src.startsWith("/") ? src : `/${src}`;
  const lastSlash = s.lastIndexOf("/");
  const dir = lastSlash >= 0 ? s.slice(0, lastSlash + 1) : "/";
  const filename = lastSlash >= 0 ? s.slice(lastSlash + 1) : s.replace(/^\//, "");
  return { dir, filename };
}

function filenameVariants(filename: string) {
  const trimmed = filename.trim();
  const noTrailingBeforeExt = trimmed.replace(/\s+(\.[A-Za-z0-9]+)$/i, "$1");
  const collapsedSpaces = noTrailingBeforeExt.replace(/\s+/g, " ");
  // Garder l’original en premier
  const base = [filename, trimmed, noTrailingBeforeExt, collapsedSpaces];
  // Variantes encodées
  const encoded = base.map((f) => encodeURIComponent(f));
  return Array.from(new Set([...base, ...encoded]));
}

function supabaseVariants(originalSrc: string) {
  // 1) Chemin prévu: v2/<filename> (comme notre mapping standard)
  const supaPreferred = v2VideoUrl(originalSrc, "videos");

  // 2) Autres variantes: fichier à la racine du bucket (sans dossier v2/)
  const { filename } = splitDirAndFilename(originalSrc);
  const fns = filenameVariants(filename);
  const rootUrls = fns.map((f) => publicUrl("videos", f));

  // 3) Variantes sous v2/ (au cas où les noms diffèrent: espaces, trim, etc.)
  const v2Urls = fns.map((f) => publicUrl("videos", `v2/${f}`));

  // Ordre: URL “préférée” (v2/ exact) -> variantes racine -> variantes v2/
  return Array.from(new Set([supaPreferred, ...rootUrls, ...v2Urls]));
}

function buildLocalPaths(originalSrc: string) {
  const src = originalSrc.startsWith("/") ? originalSrc : `/${originalSrc}`;
  const { dir, filename } = splitDirAndFilename(src);

  const variants = filenameVariants(filename);
  const baseVariants = variants.map((f) => `${dir}${f}`);

  // Ajout des versions encodées complètes (encodeURI sur tout le chemin)
  const encodedWhole = baseVariants.map((v) => encodeURI(v));

  return Array.from(new Set([src, ...baseVariants, ...encodedWhole]));
}

/**
 * Résout les URLs des vidéos V2:
 * - priorité: Supabase Storage (bucket 'videos') en testant plusieurs chemins
 * - fallback: variantes locales (utile en dev)
 */
export function useV2Videos() {
  const videos = useMemo<ResolvedVideo[]>(
    () =>
      V2_VIDEOS.map((v) => {
        const supa = supabaseVariants(v.src);
        const localVariants = buildLocalPaths(v.src);
        const all = Array.from(new Set([...supa, ...localVariants]));
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