"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

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

  const [loaded, setLoaded] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [errorCount, setErrorCount] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    setLoaded(false);
    setShowOverlay(false);
    setErrorCount(0);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    // Si rien n'est chargé au bout de 1.2s, on montre l'overlay de debug
    timerRef.current = window.setTimeout(() => {
      if (!loaded) setShowOverlay(true);
    }, 1200);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sources.join("|")]);

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.debug("[VideoTile] Sources résolues:", { title, sources });
  }, [sources, title]);

  return (
    <div className={`relative ${className ?? ""}`}>
      <video
        className="w-full h-full object-cover"
        poster={poster}
        muted
        playsInline
        autoPlay
        loop
        preload="metadata"
        aria-label={title}
        onLoadedData={() => {
          setLoaded(true);
          setShowOverlay(false);
        }}
        onError={() => {
          setErrorCount((c) => c + 1);
          // eslint-disable-next-line no-console
          console.error("[VideoTile] Erreur de lecture", { title, sources });
          // On n'affiche pas immédiatement le fallback; on laisse le browser tester les sources suivantes
          // L'overlay apparaîtra si rien ne se charge après le délai.
        }}
      >
        {sources.map((s, i) => (
          <source key={i} src={s} type={guessMime(s)} />
        ))}
      </video>

      {showOverlay && !loaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-200/90 to-gray-300/90 dark:from-neutral-800/90 dark:to-neutral-700/90 flex items-center justify-center px-3">
          <div className="text-center text-gray-800 dark:text-gray-100">
            <div className="text-sm font-medium">Prévisualisation indisponible</div>
            <div className="text-xs opacity-80 mb-2">{title ?? "Vidéo manquante"}</div>
            {sources.length > 0 && (
              <div className="text-[10px] opacity-90 space-y-1">
                <div>Essaye d’ouvrir ces liens (la première qui s’ouvre doit être lue ici) :</div>
                <ul className="space-y-0.5">
                  {sources.slice(0, 3).map((u, i) => (
                    <li key={i}>
                      <a
                        className="underline underline-offset-2 text-blue-600 dark:text-blue-400 break-all"
                        href={u}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Source {i + 1}
                      </a>
                    </li>
                  ))}
                </ul>
                {errorCount > 0 && <div className="mt-2">Erreurs réseaux: {errorCount}</div>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoTile;