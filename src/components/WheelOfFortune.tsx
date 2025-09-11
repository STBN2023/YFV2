"use client";

import React, { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { showSuccess } from "@/utils/toast";

const WheelOfFortune: React.FC = () => {
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const wheelRef = useRef<HTMLDivElement>(null);
  const currentRotationRef = useRef(0);

  // Segments (personnalisables)
  const segments = useMemo(
    () => [
      "Gagnant !",
      "Essaie encore",
      "10 points",
      "20 points",
      "50 points",
      "100 points",
      "Perdu !",
      "Bonus",
    ],
    []
  );

  const colors = useMemo(
    () => ["#60A5FA", "#A78BFA", "#34D399", "#F59E0B", "#22D3EE", "#FB7185", "#F472B6", "#FDE047"],
    []
  );

  const segmentAngle = 360 / segments.length;

  // Construit le dégradé conique pour un rendu net et coloré
  const conicBackground = useMemo(() => {
    const stops = segments
      .map((_, i) => {
        const start = i * segmentAngle;
        const end = (i + 1) * segmentAngle;
        const color = colors[i % colors.length];
        return `${color} ${start}deg ${end}deg`;
      })
      .join(", ");
    return `conic-gradient(${stops})`;
  }, [segments, colors, segmentAngle]);

  const spinWheel = () => {
    if (spinning) return;

    setSpinning(true);
    setWinner(null);

    // On choisit aléatoirement un segment à viser
    const targetIndex = Math.floor(Math.random() * segments.length);

    // Ajoute une petite variation autour du centre du segment pour un rendu naturel
    const jitter = (Math.random() - 0.5) * (segmentAngle * 0.4); // +/- 20% du segment
    const baseRotations = 6 + Math.random() * 2; // entre 6 et 8 tours pour un effet "grand jeu"
    const targetAngle =
      targetIndex * segmentAngle + segmentAngle / 2 + jitter;

    // La roue tourne depuis l’angle courant
    const destination =
      currentRotationRef.current + baseRotations * 360 + targetAngle;

    const duration = 4500; // ms
    const easing = "cubic-bezier(0.17, 0.67, 0.21, 0.99)";

    if (wheelRef.current) {
      wheelRef.current.style.transition = `transform ${duration}ms ${easing}`;
      wheelRef.current.style.transform = `rotate(${destination}deg)`;
    }

    // À la fin de l’anim, on fixe le gagnant et normalise l’angle courant
    window.setTimeout(() => {
      currentRotationRef.current = destination % 360; // garde un angle réduit
      setSpinning(false);
      const selected = segments[targetIndex];
      setWinner(selected);
      showSuccess(`Résultat: ${selected}`);
    }, duration + 50);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative w-72 h-72 md:w-96 md:h-96 select-none">
        {/* Pointeur */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
          <div className="w-0 h-0 border-l-[14px] border-r-[14px] border-b-[24px] border-l-transparent border-r-transparent border-b-red-500 drop-shadow-lg"></div>
          <div className="w-3 h-3 bg-red-500 rounded-full mx-auto -mt-1 shadow" />
        </div>

        {/* Ombre externe */}
        <div className="absolute inset-0 rounded-full shadow-2xl" />

        {/* Roue */}
        <div
          ref={wheelRef}
          className="relative w-full h-full rounded-full border-8 border-white bg-white overflow-hidden"
          style={{
            background: conicBackground,
            boxShadow:
              "inset 0 0 20px rgba(0,0,0,0.15), 0 20px 40px rgba(0,0,0,0.15)",
          }}
        >
          {/* Lignes de séparation */}
          {Array.from({ length: segments.length }).map((_, i) => (
            <div
              key={`sep-${i}`}
              className="absolute inset-0"
              style={{ transform: `rotate(${i * segmentAngle}deg)` }}
            >
              <div className="absolute top-1/2 left-1/2 origin-top -translate-x-1/2 -translate-y-1/2 h-[calc(50%-10px)] w-px bg-white/70" />
            </div>
          ))}

          {/* Étiquettes */}
          {segments.map((label, i) => {
            const center = i * segmentAngle + segmentAngle / 2;
            return (
              <div
                key={label + i}
                className="absolute top-1/2 left-1/2"
                style={{
                  transform: `translate(-50%, -50%) rotate(${center}deg) translateY(calc(-50% + 52px)) rotate(${-center}deg)`,
                }}
              >
                <div className="text-xs md:text-sm font-semibold text-white drop-shadow text-center w-28 md:w-32">
                  {label}
                </div>
              </div>
            );
          })}

          {/* Anneau intérieur */}
          <div className="absolute inset-4 rounded-full ring-1 ring-white/30 pointer-events-none" />

          {/* Moyeu central */}
          <div className="absolute inset-1/4 md:inset-[28%] rounded-full bg-white flex items-center justify-center shadow-inner">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white to-gray-200" />
            <div className="relative z-10 text-center">
              <div className="text-xs uppercase tracking-wide text-gray-500">
                Roue
              </div>
              <div className="text-base md:text-lg font-bold text-gray-800">
                Fortune
              </div>
            </div>
            <div className="absolute inset-0 rounded-full ring-2 ring-gray-200" />
          </div>
        </div>
      </div>

      <Button
        onClick={spinWheel}
        disabled={spinning}
        className="px-6 py-2 font-semibold shadow-md"
      >
        {spinning ? "En cours..." : "Tourner la roue"}
      </Button>

      {winner && (
        <div className="text-center">
          <Badge className="text-base py-2 px-3">🎉 Résultat: {winner}</Badge>
        </div>
      )}
    </div>
  );
};

export default WheelOfFortune;