"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { V2_VIDEOS } from "@/data/v2-videos";

const V2Grid: React.FC = () => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {V2_VIDEOS.map((v) => (
        <Card key={v.id} className="overflow-hidden relative">
          <CardContent className="p-2">
            <div className="relative aspect-square rounded-md overflow-hidden">
              <video
                className="w-full h-full object-cover"
                src={encodeURI(v.src)}
                poster={v.poster}
                muted
                loop
                playsInline
                autoPlay
                preload="metadata"
                aria-label={v.title}
              />
            </div>
            <div className="mt-2 text-sm font-medium text-center">
              V2 — {v.title}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default V2Grid;