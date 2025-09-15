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
  const original = filename;
  const trimmed = filename.trim();
  const noTrailingBeforeExt = trimmed.replace(/\s+(\.[A-Za-z0-9]+)$/i, "$1");
  const collapsedSpaces = noTrailingBeforeExt.replace(/\s+/g, " ");

  const pool = [original, trimmed, noTrailingBeforeExt, collapsedSpaces].flatMap((v) =>
    withAltExtensions(v),
  );

  const encoded = pool.map((f) => encodeURIComponent(f));
  return Array.from(new Set([...pool, ...encoded]));
}

function supabaseVariants(originalSrc: string) {
  // Variantes racine et sous-dossier v2 avec noms/extension alternatifs
  const { filename } = splitDirAndFilename(originalSrc);
  const fns = filenameVariants(filename);

  const rootUrls = fns.map((f) => publicUrl("videos", f));
  const v2Urls = fns.map((f) => publicUrl("videos", `v2/${f}`));

  // Ancienne "préférée": v2/<fichier> (on la garde en toute fin, au cas où)
  const supaPreferred = v2VideoUrl(originalSrc, "videos");

  // Priorité: racine -> v2/ -> préférée
  return Array.from(new Set([...rootUrls, ...v2Urls, supaPreferred]));
}

function buildLocalPaths(originalSrc: string) {
  const src = originalSrc.startsWith("/") ? originalSrc : `/${originalSrc}`;
  const { dir, filename } = splitDirAndFilename(src);

  const variants = filenameVariants(filename);
  const baseVariants = variants.map((f) => `${dir}${f}`);

  const encodedWhole = baseVariants.map((v) => encodeURI(v));
  return Array.from(new Set([src, ...baseVariants, ...encodedWhole]));
}

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
    [],
  );

  return { videos };
}