"use client";

import React, { useMemo } from "react";

type EffectType = "confetti" | "smoke" | "burst" | "sparkles";

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

const randomBetween = (min: number, max: number) =>
  Math.random() * (max - min) + min;

const Confetti: React.FC = () => {
  const pieces = useMemo(() => range(80).map((i) => ({
    left: Math.random() * 100,
    delay: Math.random() * 0.6,
    duration: 1.8 + Math.random() * 1.2,
    rotate: Math.random() * 360,
    size: 6 + Math.random() * 10,
    color: `hsl(${Math.round(Math.random() * 360)}, 90%, 55%)`,
  })), []);
  return (
    <>
      {pieces.map((p, i) => (
        <div
          key={i}
          className="absolute top-[-10%] rounded-sm"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 0.6,
            background: p.color,
            transform: `rotate(${p.rotate}deg)`,
            animation: `confetti-fall ${p.duration}s ease-in ${p.delay}s forwards`,
          }}
        />
      ))}
    </>
  );
};

const Smoke: React.FC = () => {
  const puffs = useMemo(() => range(20).map((i) => ({
    left: Math.random() * 100,
    size: 40 + Math.random() * 80,
    duration: 1.8 + Math.random() * 1.5,
    delay: Math.random() * 0.4,
    opacity: 0.15 + Math.random() * 0.2,
  })), []);
  return (
    <>
      {puffs.map((p, i) => (
        <div
          key={i}
          className="absolute bottom-[-5%] rounded-full"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            background: "radial-gradient(circle, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.05) 60%, rgba(255,255,255,0) 70%)",
            filter: "blur(6px)",
            opacity: p.opacity,
            animation: `smoke-rise ${p.duration}s ease-out ${p.delay}s forwards`,
          }}
        />
      ))}
    </>
  );
};

const Burst: React.FC = () => {
  const parts = useMemo(() => range(36).map((i) => ({
    angle: (i / 36) * 360 + Math.random() * 6,
    distance: 40 + Math.random() * 80,
    size: 4 + Math.random() * 6,
    color: `hsl(${Math.round(Math.random() * 360)}, 90%, 60%)`,
    duration: 0.9 + Math.random() * 0.4,
  })), []);
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {parts.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            background: p.color,
            animation: `burst-out ${p.duration}s ease-out forwards`,
            transform: `rotate(${p.angle}deg) translateX(${p.distance}px)`,
          }}
        />
      ))}
    </div>
  );
};

const Sparkles: React.FC = () => {
  const stars = useMemo(() => range(30).map((i) => ({
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: 2 + Math.random() * 3,
    duration: 0.8 + Math.random() * 0.8,
    delay: Math.random() * 0.4,
  })), []);
  return (
    <>
      {stars.map((s, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            boxShadow: "0 0 8px rgba(255,255,255,0.9)",
            animation: `sparkle-pop ${s.duration}s ease-in-out ${s.delay}s forwards`,
          }}
        />
      ))}
    </>
  );
};

const EffectsOverlay: React.FC<{ type: EffectType }> = ({ type }) => {
  return (
    <div className="pointer-events-none fixed inset-0 z-[60]">
      {type === "confetti" && <Confetti />}
      {type === "smoke" && <Smoke />}
      {type === "burst" && <Burst />}
      {type === "sparkles" && <Sparkles />}
    </div>
  );
};

export default EffectsOverlay;