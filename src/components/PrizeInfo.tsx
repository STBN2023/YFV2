"use client";

import { useMemo, useState } from "react";
import { usePrizes } from "@/hooks/use-prizes";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";

const PrizeInfo = () => {
  const { prizes } = usePrizes();
  const [open, setOpen] = useState(false);
  const list = useMemo(() => prizes, [prizes]);

  return (
    <div className="w-full max-w-3xl flex justify-center">
      <Button
        variant="secondary"
        onClick={() => setOpen(true)}
        className="rounded-full inline-flex items-center gap-2"
      >
        <Sparkles className="w-4 h-4" />
        Prizes & points
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Prizes & points</DialogTitle>
            <DialogDescription>All current prizes on the wheel</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {list.map((p) => (
              <div key={p.id} className="rounded-md border bg-white overflow-hidden">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={p.image}
                    alt={p.label}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-2 flex items-center justify-between gap-2">
                  <div className="text-xs font-medium truncate">{p.label}</div>
                  <Badge className="text-[10px]">+{p.points}</Badge>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PrizeInfo;