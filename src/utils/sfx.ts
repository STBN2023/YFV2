"use client";

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
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

export function playSpinSound(durationMs = 4500) {
  const audio = getCtx();
  if (!audio) return;

  const duration = durationMs / 1000;
  const osc = audio.createOscillator();
  const gain = audio.createGain();

  osc.type = "sawtooth";
  const startT = audio.currentTime;
  osc.frequency.setValueAtTime(300, startT);
  osc.frequency.exponentialRampToValueAtTime(1400, startT + duration * 0.9);

  gain.gain.setValueAtTime(0.0001, startT);
  gain.gain.exponentialRampToValueAtTime(0.18, startT + 0.15);
  gain.gain.exponentialRampToValueAtTime(0.0001, startT + duration);

  osc.connect(gain).connect(audio.destination);
  osc.start();
  osc.stop(startT + duration + 0.05);
}

export function playReadyChime() {
  // petit carillon: deux notes rapides
  simpleTone(880, 0.12, "triangle", 0.12);
  setTimeout(() => simpleTone(1320, 0.14, "triangle", 0.12), 120);
}

export function playWinSound() {
  // mini fanfare en 3 notes
  simpleTone(523.25, 0.16, "square", 0.16); // C5
  setTimeout(() => simpleTone(659.25, 0.18, "square", 0.16), 160); // E5
  setTimeout(() => simpleTone(783.99, 0.22, "square", 0.16), 340); // G5
}