"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useV2Videos } from "@/hooks/use-v2-videos";
import VideoTile from "@/components/VideoTile";

const V2Grid: React.FC = () => {
  const { videos } = useV2Videos(); // bucket 'videos' par défaut

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {videos.map((v) => (
        <Card key={v.id} className="overflow-hidden relative">
          <CardContent className="p-2">
            <div className="relative aspect-square rounded-md overflow-hidden">
              <VideoTile
                src={v.publicSrc}
                fallbackSrcs={v.fallbackSrcs}
                poster={v.poster}
                title={v.title}
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