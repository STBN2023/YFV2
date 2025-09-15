"use client";

import React, { useMemo, useState } from "react";

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

  if (failed || sources.length === 0) {
    return (
      <div className={`w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-neutral-800 dark:to-neutral-700 flex items-center justify-center ${className ?? ""}`}>
        <div className="text-center text-gray-700 dark:text-gray-200">
          <div className="text-sm font-medium">Prévisualisation indisponible</div>
          <div className="text-xs opacity-80">{title ?? "Vidéo manquante"}</div>
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
      onError={() => setFailed(true)}
    >
      {sources.map((s, i) => (
        <source key={i} src={s} type={guessMime(s)} />
      ))}
    </video>
  );
};

export default VideoTile;