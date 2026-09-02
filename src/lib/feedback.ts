/** Sonido (WebAudio) y feedback háptico. Solo se usan tras interacción del usuario. */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  ctx ??= new Ctor();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(freq: number, duration: number, type: OscillatorType = "sine", gain = 0.12) {
  const ac = getCtx();
  if (!ac) return;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(gain, ac.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + duration);
  osc.connect(g).connect(ac.destination);
  osc.start();
  osc.stop(ac.currentTime + duration);
}

export type SoundName = "correct" | "taboo" | "skip" | "tick" | "buzzer";

export function playSound(name: SoundName, enabled = true) {
  if (!enabled) return;
  switch (name) {
    case "correct":
      tone(880, 0.12, "triangle");
      setTimeout(() => tone(1320, 0.16, "triangle"), 90);
      break;
    case "taboo":
      tone(180, 0.28, "sawtooth", 0.1);
      break;
    case "skip":
      tone(520, 0.1, "square", 0.07);
      break;
    case "tick":
      tone(1000, 0.05, "square", 0.06);
      break;
    case "buzzer":
      tone(140, 0.6, "sawtooth", 0.14);
      setTimeout(() => tone(110, 0.7, "sawtooth", 0.14), 180);
      break;
  }
}

export function vibrate(pattern: number | number[], enabled = true) {
  if (!enabled || typeof navigator === "undefined" || !("vibrate" in navigator)) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    /* ignorado */
  }
}

/** Desbloquea el audio en móviles (llamar desde un click). */
export function primeAudio() {
  getCtx();
}
