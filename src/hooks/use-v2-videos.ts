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

function withAltExtensions(name: string) {
  const m = name.match(/^(.*?)(\.[A-Za-z0-9]+)?$/);
  const base = (m?.[1] ?? name).replace(/\s+$/, "");
  const ext = m?.[2] ?? "";
  const exts = new Set<string>([
    ext || ".mp4",
    ".mp4",
    ".MP4",
    ".webm",
    ".WEBM",
    ".mov",
    ".MOV",
  ]);
  return Array.from(exts).map((e) => `${base}${e}`);
}

function filenameVariants(filename: string) {
  // Garder l’original tel quel (y compris espaces/maj.)
  const original = filename;

  // Variantes normalisées (trim avant extension + espaces réduits)
  const trimmed = filename.trim();
  const noTrailingBeforeExt = trimmed.replace(/\s+(\.[A-Za-z0-9]+)$/i, "$1");
  const collapsedSpaces = noTrailingBeforeExt.replace(/\s+/g, " ");

  // Décliner chaque variante avec extensions alternatives
  const pool = [original, trimmed, noTrailingBeforeExt, collapsedSpaces]
    .flatMap((v) => withAltExtensions(v));

  // Ajouter versions encodées (sur le nom de fichier uniquement)
  const encoded = pool.map((f) => encodeURIComponent(f));

  return Array.from(new Set([...pool, ...encoded]));
}

function supabaseVariants(originalSrc: string) {
  // 1) Chemin “préféré” (v2/<fichier>) à partir de l’API utilitaire
  const supaPreferred = v2VideoUrl(originalSrc, "videos");

  // 2) Variantes racine et sous-dossier v2 avec noms/extension alternatifs
  const { filename } = splitDirAndFilename(originalSrc);
  const fns = filenameVariants(filename);

  const rootUrls = fns.map((f) => publicUrl("videos", f));
  const v2Urls = fns.map((f) => publicUrl("videos", `v2/${f}`));

  // Ordre: préféré -> racine -> v2 (les doublons sont enlevés)
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
 * - priorité: Supabase Storage (bucket 'videos') en testant plusieurs chemins/variantes
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