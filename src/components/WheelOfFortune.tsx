"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { showSuccess, showError } from "@/utils/toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { usePreloadImages } from "@/hooks/use-preload-images";
import { supabase } from "@/integrations/supabase/client";
import EffectsOverlay from "@/components/EffectsOverlay";
import { playReadyChime, playWinSound, playSpinTicks } from "@/utils/sfx";
import { usePrizes } from "@/hooks/use-prizes";
import { useSession } from "@/components/auth/SessionProvider";
import { Link } from "react-router-dom";
import { Star, Share2 } from "lucide-react";
import { useV2Videos } from "@/hooks/use-v2-videos";
import VideoTile from "@/components/VideoTile";

type EffectType = "confetti" | "smoke" | "burst" | "sparkles";

const normalizeAngle = (deg: number) => ((deg % 360) + 360) % 360;

type Segment = {
  label: string;
  image: string;
  points: number;
};

const WheelOfFortune: React.FC = () => {
  const { session } = useSession();
  const userId = session?.user?.id ?? null;

  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [winnerIndex, setWinnerIndex] = useState<number | null>(null);
  const [openResult, setOpenResult] = useState(false);
  const [effect, setEffect] = useState<EffectType | null>(null);
  const [winMessage, setWinMessage] = useState<string>("");
  const [v1Complete, setV1Complete] = useState(false);
  const [overrideUnlock, setOverrideUnlock] = useState(false);

  const wheelRef = useRef<HTMLDivElement>(null);
  const currentRotationRef = useRef(0);
  const effectTimeoutRef = useRef<number | null>(null);

  const { prizes } = usePrizes();
  const { videos } = useV2Videos();

  const v1Segments = useMemo<Segment[]>(
    () =>
      prizes.map((p) => ({
        label: p.label,
        image: p.image,
        points: p.points,
      })),
    [prizes]
  );

  const v2Segments = useMemo<Segment[]>(
    () =>
      videos.map((v) => ({
        label: v.title,
        image: v.poster ?? "/placeholder.svg",
        points: 0,
      })),
    [videos]
  );

  useEffect(() => {
    try {
      setOverrideUnlock(localStorage.getItem("unlock-v2") === "1");
    } catch {
      setOverrideUnlock(false);
    }
  }, []);

  useEffect(() => {
    if (!userId || v1Segments.length === 0) {
      setV1Complete(false);
      return;
    }
    supabase
      .from("spins")
      .select("prize_label")
      .eq("user_id", userId)
      .then(({ data, error }) => {
        if (error) throw error;
        const got = new Set<string>();
        (data ?? []).forEach((row) => got.add((row as any).prize_label as string));
        const labelsV1 = new Set(v1Segments.map((s) => s.label));
        let count = 0;
        labelsV1.forEach((lbl) => {
          if (got.has(lbl)) count += 1;
        });
        setV1Complete(count >= v1Segments.length);
      });
  }, [userId, v1Segments]);

  const v2Unlocked = v1Complete || overrideUnlock;

  const pool = useMemo<Segment[]>(
    () => (v2Unlocked ? [...v1Segments, ...v2Segments] : v1Segments),
    [v2Unlocked, v1Segments, v2Segments]
  );

  const segmentLabels = useMemo(() => pool.map((s) => s.label), [pool]);
  const segmentImages = useMemo(() => pool.map((s) => s.image), [pool]);
  const pointsPerSegment = useMemo(() => pool.map((s) => s.points), [pool]);

  const segmentCount = pool.length || 1;
  const segmentAngle = 360 / segmentCount;

  const imagesReady = usePreloadImages(segmentImages);

  const colors = useMemo(
    () =>
      Array.from({ length: segmentCount }, (_, i) => {
        const hue = Math.round((360 / segmentCount) * i);
        return `hsl(${hue}, 85%, 55%)`;
      }),
    [segmentCount]
  );

  const conicBackground = useMemo(() => {
    const stops = pool
      .map((_, i) => {
        const start = i * segmentAngle;
        const end = (i + 1) * segmentAngle;
        const color = colors[i % colors.length];
        return `${color} ${start}deg ${end}deg`;
      })
      .join(", ");
    return `conic-gradient(${stops})`;
  }, [pool, colors, segmentAngle]);

  useEffect(() => {
    if (imagesReady) {
      playReadyChime();
      setEffect("sparkles");
      if (effectTimeoutRef.current) window.clearTimeout(effectTimeoutRef.current);
      effectTimeoutRef.current = window.setTimeout(() => setEffect(null), 1500);
    }
  }, [imagesReady]);

  const ensureAuth = async () => {
    if (session) return true;
    const fn: any = (supabase as any).auth?.signInAnonymously;
    if (typeof fn !== "function") {
      showError("Authentification anonyme indisponible. Activez ‘Anonymous’ dans Supabase ou utilisez la page Login.");
      return false;
    }
    try {
      const { error } = await supabase.auth.signInAnonymously();
      if (error) {
        showError(`Impossible d'initialiser une session: ${error.message}. Essayez /login.`);
        return false;
      }
      return true;
    } catch (e: any) {
      showError(`Erreur de session: ${e?.message ?? "inconnue"}. Essayez /login.`);
      return false;
    }
  };

  const spinWheel = async () => {
    if (spinning || pool.length === 0) return;

    const ok = await ensureAuth();
    if (!ok) return;

    const wheel = wheelRef.current;
    if (!wheel) return;

    setSpinning(true);
    setWinner(null);
    setWinnerIndex(null);
    setOpenResult(false);
    setWinMessage("");

    const targetIndex = Math.floor(Math.random() * segmentCount);
    const finalAngle = targetIndex * segmentAngle + segmentAngle / 2;
    const baseRotations = 6 + Math.random() * 2;

    const delta = normalizeAngle(finalAngle - currentRotationRef.current);
    const destination = currentRotationRef.current + baseRotations * 360 + delta;

    const duration = 4500;
    const easing = "cubic-bezier(0.17, 0.67, 0.21, 0.99)";

    wheel.style.transition = "none";
    wheel.style.transform = `rotate(${currentRotationRef.current}deg)`;
    void wheel.offsetHeight;

    requestAnimationFrame(() => {
      wheel.style.transition = `transform ${duration}ms ${easing}`;
      wheel.style.transform = `rotate(${destination}deg)`;
      const approxTicks = Math.round(baseRotations * segmentCount);
      playSpinTicks(duration, approxTicks);
    });

    const onEnd = async () => {
      wheel.removeEventListener("transitionend", onEnd);
      currentRotationRef.current = normalizeAngle(destination);
      setSpinning(false);

      const selected = segmentLabels[targetIndex];
      setWinner(selected);
      setWinnerIndex(targetIndex);

      const gained = pointsPerSegment[targetIndex] ?? 0;

      await supabase.rpc("add_points_and_log", {
        p_label: selected,
        p_points: gained,
      });

      const options = [
        `Bravo ! Tu as gagné "${selected}" ✨`,
        `Bim ! "${selected}" rejoint ta collection, +${gained} points 🎉`,
        `Coup de bol cosmique: "${selected}" est à toi 🚀`,
        `Le destin a tourné en ta faveur: "${selected}" ! 🪄`,
        `Boum ! Carte "${selected}" capturée, +${gained} pts 💥`,
        `Oui chef ! "${selected}" au menu du jour 🍀`,
      ];
      const pick = options[Math.floor(Math.random() * options.length)];
      setWinMessage(pick);

      setOpenResult(true);

      playWinSound();
      const poolEffects: EffectType[] = ["confetti", "smoke", "burst"];
      const randomEffect = poolEffects[Math.floor(Math.random() * poolEffects.length)];
      setEffect(randomEffect);
      if (effectTimeoutRef.current) window.clearTimeout(effectTimeoutRef.current);
      effectTimeoutRef.current = window.setTimeout(() => setEffect(null), 2800);

      window.dispatchEvent(new CustomEvent("points-updated"));
      showSuccess(`Résultat: ${selected} (+${gained} points)`);
    };

    wheel.addEventListener("transitionend", onEnd, { once: true });
  };

  const winnerImg =
    winnerIndex !== null
      ? segmentImages[winnerIndex % segmentImages.length]
      : null;

  const winnerVideo = useMemo(
    () => (winner ? videos.find((v) => v.title === winner) : undefined),
    [videos, winner]
  );

  const shareResult = () => {
    if (!winner) return;
    const msg = `I just won "${winner}" on Youri Fortune! Come try your luck: ${window.location.origin}`;
    navigator.clipboard.writeText(msg).then(
      () => showSuccess("Copied to clipboard!"),
      () => showError("Copy failed. Try again.")
    );
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative w-72 h-72 md:w-96 md:h-96 select-none">
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
          <div className="w-0 h-0 border-l-[14px] border-r-[14px] border-b-[24px] border-l-transparent border-r-transparent border-b-red-500 drop-shadow-lg"></div>
          <div className="w-3 h-3 bg-red-500 rounded-full mx-auto -mt-1 shadow" />
        </div>

        <div className="absolute inset-0 rounded-full shadow-2xl" />

        <div
          ref={wheelRef}
          className="relative w-full h-full rounded-full border-8 border-white bg-white overflow-hidden"
          style={{
            backgroundImage: conicBackground,
            boxShadow:
              "inset 0 0 20px rgba(0,0,0,0.15), 0 20px 40px rgba(0,0,0,0.15)",
            filter: imagesReady ? "none" : "grayscale(0.1) brightness(0.98)",
            willChange: "transform",
          }}
        >
          {Array.from({ length: segmentCount }).map((_, i) => (
            <div
              key={`sep-${i}`}
              className="absolute inset-0"
              style={{ transform: `rotate(${i * segmentAngle}deg)` }}
            >
              <div className="absolute top-1/2 left-1/2 origin-top -translate-x-1/2 -translate-y-1/2 h-[calc(50%-10px)] w-px bg-white/70" />
            </div>
          ))}

          <div className="absolute inset-4 rounded-full ring-1 ring-white/30 pointer-events-none" />

          <div className="absolute inset-1/4 md:inset-[28%] rounded-full bg-white flex items-center justify-center shadow-inner">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white to-gray-200" />
            <div className="relative z-10 flex items-center justify-center">
              <Star className="w-9 h-9 md:w-11 md:h-11 text-amber-500 drop-shadow" />
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
        disabled={spinning || pool.length === 0 || !imagesReady}
        className="px-6 py-2 font-semibold shadow-md rounded-full bg-gradient-to-r from-fuchsia-600 to-amber-500 text-white hover:brightness-105 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {spinning ? "En cours..." : "Tourner la roue"}
      </Button>

      {!session && (
        <div className="text-xs text-gray-600">
          Si la session échoue, essayez la <Link to="/login" className="underline text-blue-600">connexion</Link>.
        </div>
      )}

      {winner && (
        <div className="text-center">
          <Badge className="text-base py-2 px-3">🎉 Résultat: {winner}</Badge>
        </div>
      )}

      {effect && <EffectsOverlay type={effect} />}

      <Dialog open={openResult} onOpenChange={setOpenResult}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Résultat</DialogTitle>
            <DialogDescription>
              {winMessage || "Bravo ! Tu as gagné cette magnifique carte ✨"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {winner && winnerVideo ? (
              <div className="w-full overflow-hidden rounded-md">
                <VideoTile
                  src={winnerVideo.publicSrc}
                  fallbackSrcs={winnerVideo.fallbackSrcs}
                  poster={winnerVideo.poster}
                  title={winnerVideo.title}
                  className="w-full h-auto"
                />
              </div>
            ) : winnerImg ? (
              <img
                src={winnerImg}
                alt={winner ?? "Image de résultat"}
                className="w-full rounded-md shadow"
              />
            ) : null}
            {winner && (
              <div className="text-center font-semibold">{winner}</div>
            )}
            <div className="flex justify-center gap-2">
              <Button variant="outline" onClick={shareResult} className="inline-flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Share
              </Button>
              <Button onClick={() => setOpenResult(false)}>OK</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WheelOfFortune;