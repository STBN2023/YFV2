"use client";

import React, { useMemo, useState } from "react";

type Props = {
  src: string;
  fallbackSrcs?: string[];
  poster?: string;
  title?: string;
  className?: string;
};

const VideoTile: React.FC<Props> = ({ src, fallbackSrcs = [], poster, title, className }) => {
  const sources = useMemo(() => [src, ...fallbackSrcs].filter(Boolean), [src, fallbackSrcs]);
  const [idx, setIdx] = useState(0);
  const [failed, setFailed] = useState(false);

  const onError = () => {
    const next = idx + 1;
    if (next < sources.length) {
      setIdx(next);
    } else {
      setFailed(true);
    }
  };

  if (failed) {
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
      src={sources[idx]}
      poster={poster}
      muted
      loop
      playsInline
      autoPlay
      preload="metadata"
      aria-label={title}
      onError={onError}
    />
  );
};

export default VideoTile;