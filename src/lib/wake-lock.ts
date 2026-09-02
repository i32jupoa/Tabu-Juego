/** Mantiene la pantalla encendida mientras dura el turno (si el navegador lo soporta). */

type WakeLockSentinel = { released: boolean; release: () => Promise<void> };
type WakeLockNavigator = {
  wakeLock?: { request: (type: "screen") => Promise<WakeLockSentinel> };
};

let sentinel: WakeLockSentinel | null = null;

export async function requestWakeLock(): Promise<void> {
  if (typeof navigator === "undefined") return;
  const wl = (navigator as unknown as WakeLockNavigator).wakeLock;
  if (!wl) return;
  try {
    sentinel = await wl.request("screen");
  } catch {
    /* denegado o no disponible */
  }
}

export function releaseWakeLock(): void {
  if (!sentinel || sentinel.released) {
    sentinel = null;
    return;
  }
  void sentinel.release().catch(() => undefined);
  sentinel = null;
}
