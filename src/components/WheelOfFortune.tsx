"use client";

import React, { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { showSuccess } from "@/utils/toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { usePreloadImages } from "@/hooks/use-preload-images";

const WheelOfFortune: React.FC = () => {
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [winnerIndex, setWinnerIndex] = useState<number | null>(null);
  const [openResult, setOpenResult] = useState(false);
  const wheelRef = useRef<HTMLDivElement>(null);
  const currentRotationRef = useRef(0);

  // Liste complète des images de prix (détermine le nombre de segments)
  const segmentImages = useMemo(
    () => [
      "/prizes/prix1.png",
      "/prizes/prix2.png",
      "/prizes/prix3.png",
      "/prizes/prix4.png",
      "/prizes/prix5.png",
      "/prizes/prix6.png",
      "/prizes/prix7.png",
      "/prizes/prix8.png",
      "/prizes/prix9.png",
      "/prizes/prix10.png",
      "/prizes/prix11.png",
      "/prizes/prix12.png",
      "/prizes/prix13.png",
    ],
    []
  );

  // Précharge les images pour un affichage instantané dans la modale
  const imagesReady = usePreloadImages(segmentImages);

  // Labels alignés sur le nombre de prix
  const segments = useMemo(
    () => segmentImages.map((_, i) => `Prix ${i + 1}`),
    [segmentImages]
  );

  const segmentCount = segments.length;
  const segmentAngle = 360 / segmentCount;

  // Couleurs générées dynamiquement pour chaque segment (répartition uniforme du spectre)
  const colors = useMemo(
    () =>
      Array.from({ length: segmentCount }, (_, i) => {
        const hue = Math.round((360 / segmentCount) * i);
        return `hsl(${hue}, 85%, 55%)`;
      }),
    [segmentCount]
  );

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
    setWinnerIndex(null);
    setOpenResult(false);

    // Choisit aléatoirement un segment à viser
    const targetIndex = Math.floor(Math.random() * segmentCount);

    // Variation autour du centre du segment pour un rendu naturel
    const jitter = (Math.random() - 0.5) * (segmentAngle * 0.4);
    const baseRotations = 6 + Math.random() * 2; // 6 à 8 tours
    const targetAngle = targetIndex * segmentAngle + segmentAngle / 2 + jitter;

    // Destination depuis l’angle courant
    const destination =
      currentRotationRef.current + baseRotations * 360 + targetAngle;

    const duration = 4500; // ms
    const easing = "cubic-bezier(0.17, 0.67, 0.21, 0.99)";

    if (wheelRef.current) {
      wheelRef.current.style.transition = `transform ${duration}ms ${easing}`;
      wheelRef.current.style.transform = `rotate(${destination}deg)`;
    }

    // À la fin, on fixe le gagnant et normalise l’angle courant
    window.setTimeout(() => {
      currentRotationRef.current = destination % 360;
      setSpinning(false);
      const selected = segments[targetIndex];
      setWinner(selected);
      setWinnerIndex(targetIndex);
      setOpenResult(true);
      showSuccess(`Résultat: ${selected}`);
    }, duration + 50);
  };

  const winnerImg =
    winnerIndex !== null
      ? segmentImages[winnerIndex % segmentImages.length]
      : null;

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
            filter: imagesReady ? "none" : "grayscale(0.1) brightness(0.98)",
          }}
        >
          {/* Lignes de séparation */}
          {Array.from({ length: segmentCount }).map((_, i) => (
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
                <div className="text-[10px] md:text-xs font-semibold text-white drop-shadow text-center w-24 md:w-28">
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

      {!imagesReady && (
        <div className="text-xs text-gray-500">Préchargement des images…</div>
      )}

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

      {/* Modale résultat avec l’image */}
      <Dialog open={openResult} onOpenChange={setOpenResult}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Résultat</DialogTitle>
            <DialogDescription>Voici votre lot/visuel associé au segment.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {winnerImg && (
              <img
                src={winnerImg}
                alt={winner ?? "Image de résultat"}
                className="w-full rounded-md shadow"
              />
            )}
            {winner && (
              <div className="text-center font-semibold">{winner}</div>
            )}
            <div className="flex justify-center">
              <Button onClick={() => setOpenResult(false)}>OK</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WheelOfFortune;