"use client";

import React, { useEffect, useMemo, useState } from "react";

type Props = {
  src: string;
  fallbackSrcs?: string[];
  poster?: string;
  title?: string;
  className?: string;
};

function guessMime(url: string): string | undefined {
  try {
    const clean = url.split("?")[0].split("#")[0];
    const ext = (clean.split(".").pop() || "").toLowerCase();
    if (ext === "mp4") return "video/mp4";
    if (ext === "webm") return "video/webm";
    if (ext === "mov") return "video/quicktime";
  } catch {
    // ignore
  }
  return undefined;
}

const VideoTile: React.FC<Props> = ({ src, fallbackSrcs = [], poster, title, className }) => {
  const sources = useMemo(() => {
    const all = [src, ...fallbackSrcs].filter(Boolean);
    return Array.from(new Set(all));
  }, [src, fallbackSrcs]);

  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setFailed(false);
    setLoaded(false);
  }, [sources.join("|")]);

  useEffect(() => {
    // Logs utiles pour diagnostiquer
    // eslint-disable-next-line no-console
    console.debug("[VideoTile] Sources résolues:", { title, sources });
  }, [sources, title]);

  if ((failed && !loaded) || sources.length === 0) {
    const debugLinks = sources.slice(0, 3);
    return (
      <div className={`w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-neutral-800 dark:to-neutral-700 flex items-center justify-center ${className ?? ""}`}>
        <div className="text-center text-gray-700 dark:text-gray-200 px-3">
          <div className="text-sm font-medium">Prévisualisation indisponible</div>
          <div className="text-xs opacity-80 mb-2">{title ?? "Vidéo manquante"}</div>
          {debugLinks.length > 0 && (
            <div className="text-[10px] opacity-90 space-y-1">
              <div>Essaye d’ouvrir:</div>
              <ul className="space-y-0.5">
                {debugLinks.map((u, i) => (
                  <li key={i}>
                    <a className="underline underline-offset-2 text-blue-600 dark:text-blue-400 break-all" href={u} target="_blank" rel="noreferrer">
                      Source {i + 1}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <video
      className={`w-full h-full object-cover ${className ?? ""}`}
      poster={poster}
      muted
      playsInline
      autoPlay
      loop
      preload="metadata"
      aria-label={title}
      onLoadedData={() => setLoaded(true)}
      onError={() => {
        // eslint-disable-next-line no-console
        console.error("[VideoTile] Erreur de lecture", { title, sources });
        setFailed(true);
      }}
    >
      {sources.map((s, i) => (
        <source key={i} src={s} type={guessMime(s)} />
      ))}
    </video>
  );
};

export default VideoTile;