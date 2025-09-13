"use client";

import React from "react";
import { cn } from "@/lib/utils";

type Props = {
  value: number; // 0-100
  className?: string;
  height?: "sm" | "md" | "lg";
  from?: string; // ex: "from-fuchsia-500"
  to?: string;   // ex: "to-emerald-400"
  showPercent?: boolean;
};

const HEIGHTS: Record<NonNullable<Props["height"]>, string> = {
  sm: "h-2",
  md: "h-3",
  lg: "h-4",
};

const GradientProgress: React.FC<Props> = ({
  value,
  className,
  height = "lg",
  from = "from-fuchsia-500",
  to = "to-amber-400",
  showPercent = true,
}) => {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className={cn("w-full", className)}>
      <div className={cn("relative w-full overflow-hidden rounded-full bg-gray-200/70 dark:bg-neutral-800", HEIGHTS[height])}>
        <div
          className={cn("absolute inset-y-0 left-0 rounded-full bg-gradient-to-r", from, to)}
          style={{ width: `${v}%`, transition: "width 300ms ease" }}
        />
        <div className="absolute inset-0 rounded-full ring-1 ring-black/5 dark:ring-white/5 pointer-events-none" />
      </div>
      {showPercent && (
        <div className="mt-1 text-xs text-gray-600 dark:text-gray-300 font-medium">{v}%</div>
      )}
    </div>
  );
};

export default GradientProgress;