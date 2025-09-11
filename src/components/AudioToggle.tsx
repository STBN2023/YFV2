"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Volume2, VolumeX } from "lucide-react";

const KEY = "sfx-muted";

const AudioToggle: React.FC = () => {
  const [muted, setMuted] = useState<boolean>(false);

  useEffect(() => {
    const val = localStorage.getItem(KEY);
    setMuted(val === "1");
  }, []);

  const toggle = () => {
    const next = !muted;
    setMuted(next);
    if (next) localStorage.setItem(KEY, "1");
    else localStorage.removeItem(KEY);
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          aria-label={muted ? "Activer le son" : "Couper le son"}
          onClick={toggle}
          className="rounded-full"
        >
          {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" align="center">
        {muted ? "Son désactivé" : "Son activé"}
      </TooltipContent>
    </Tooltip>
  );
};

export default AudioToggle;