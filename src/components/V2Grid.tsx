"use client";

import React from "react";
import type { Prize } from "@/data/prizes";
import { Card, CardContent } from "@/components/ui/card";

type Props = {
  prizes: Prize[];
};

const V2Grid: React.FC<Props> = ({ prizes }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {prizes.map((p) => {
        const src = `/prizes/v2/${p.id}-v2-mini.mp4`;
        const poster = `/prizes/v2/${p.id}-v2-poster.jpg`;
        return (
          <Card key={p.id} className="overflow-hidden relative">
            <CardContent className="p-2">
              <div className="relative aspect-square rounded-md overflow-hidden">
                <video
                  className="w-full h-full object-cover"
                  src={src}
                  poster={poster}
                  muted
                  loop
                  playsInline
                  autoPlay
                  preload="metadata"
                  aria-label={`V2 - ${p.label}`}
                />
              </div>
              <div className="mt-2 text-sm font-medium text-center">
                V2 — {p.label}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default V2Grid;