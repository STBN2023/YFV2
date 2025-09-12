"use client";

import { supabase } from "@/integrations/supabase/client";

/**
 * Retourne l'URL publique (ou signée) d'un objet Storage.
 * Note: pour un accès direct sans signature, le bucket doit être public.
 */
export function publicUrl(bucket: string, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Convertit un chemin local (ex: /prizes/v2/Nom.mp4) en chemin d'objet Storage (ex: v2/Nom.mp4)
 * et renvoie l'URL publique depuis le bucket fourni (par défaut 'videos').
 */
export function v2VideoUrl(originalSrc: string, bucket = "videos"): string {
  const prefix = "/prizes/v2/";
  const key = originalSrc.startsWith(prefix)
    ? `v2/${originalSrc.slice(prefix.length)}`
    : originalSrc.replace(/^\//, "");
  return publicUrl(bucket, key);
}