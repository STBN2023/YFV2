"use client";

const KEY = "sfx-muted";

export function isSfxMuted(): boolean {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (isSfxMuted()) return null;
  try {
    if (!ctx) {
      const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") {
      void ctx.resume();
    }
    return ctx;
  } catch {
    return null;
  }
}

function simpleTone(frequency: number, duration: number, type: OscillatorType = "sine", startGain = 0.2) {
  if (isSfxMuted()) return;
  const audio = getCtx();
  if (!audio) return;

  const osc = audio.createOscillator();
  const gain = audio.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, audio.currentTime);

  gain.gain.setValueAtTime(0.0001, audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(startGain, audio.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + duration);

  osc.connect(gain).connect(audio.destination);
  osc.start();
  osc.stop(audio.currentTime + duration + 0.02);
}

function vibrate(pattern: number | number[]) {
  try {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(pattern as any);
    }
  } catch {
    // ignore
  }
}

export function playReadyChime() {
  if (isSfxMuted()) return;
  simpleTone(880, 0.12, "triangle", 0.12);
  setTimeout(() => simpleTone(1320, 0.14, "triangle", 0.12), 120);
}

export function playWinSound() {
  if (isSfxMuted()) return;
  simpleTone(523.25, 0.16, "square", 0.16);
  setTimeout(() => simpleTone(659.25, 0.18, "square", 0.16), 160);
  setTimeout(() => simpleTone(783.99, 0.22, "square", 0.16), 340);
  // Haptique victoire
  vibrate([12, 60, 24]);
}

/**
 * Son de spin style roue à cliquetis (ticks) qui ralentit progressivement.
 * @param durationMs durée totale du spin
 * @param totalTicks nombre approximatif de ticks à jouer (ex: tours * segments)
 */
export function playSpinTicks(durationMs = 4500, totalTicks = 48) {
  if (isSfxMuted()) return;
  const audio = getCtx();
  if (!audio) return;

  const easeOut = (t: number) => 1 - Math.pow(1 - t, 2.2);

  for (let i = 0; i < totalTicks; i++) {
    const t = i / totalTicks;
    const when = easeOut(t) * durationMs;

    setTimeout(() => {
      simpleTone(2200, 0.03, "square", 0.08);
      setTimeout(() => simpleTone(1800, 0.02, "square", 0.06), 12);
      // Haptique légère à chaque tick (mobile)
      vibrate(6);
    }, when);
  }
}