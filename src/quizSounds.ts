/** Krátké tóny přes Web Audio API (bez externích souborů). */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!ctx) ctx = new AudioContext();
    return ctx;
  } catch {
    return null;
  }
}

function beep(
  frequency: number,
  duration: number,
  type: OscillatorType,
  volume: number,
  when: number
) {
  const c = getCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, when);
  g.gain.setValueAtTime(0, when);
  g.gain.linearRampToValueAtTime(volume, when + 0.02);
  g.gain.exponentialRampToValueAtTime(0.001, when + duration);
  osc.connect(g);
  g.connect(c.destination);
  osc.start(when);
  osc.stop(when + duration + 0.05);
}

export function playQuizSound(kind: "correct" | "wrong", enabled: boolean): void {
  if (!enabled) return;
  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") void c.resume();

  const t = c.currentTime;
  if (kind === "correct") {
    beep(523.25, 0.08, "sine", 0.12, t);
    beep(659.25, 0.1, "sine", 0.1, t + 0.07);
    beep(783.99, 0.14, "sine", 0.08, t + 0.15);
  } else {
    beep(180, 0.12, "triangle", 0.15, t);
    beep(140, 0.18, "triangle", 0.12, t + 0.1);
  }
}
