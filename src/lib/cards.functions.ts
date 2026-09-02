import { createServerFn } from "@tanstack/react-start";
import { CARDS, type TabuCard } from "@/data/cards";

const isCard = (v: unknown): v is TabuCard => {
  if (!v || typeof v !== "object") return false;
  const c = v as Record<string, unknown>;
  return (
    typeof c["word"] === "string" &&
    Array.isArray(c["forbidden"]) &&
    c["forbidden"].every((f) => typeof f === "string") &&
    typeof c["category"] === "string"
  );
};

/**
 * Mazo servido desde el servidor: permite actualizar las cartas sin
 * volver a desplegar la app definiendo TABU_CARDS_URL (JSON con TabuCard[]).
 * Si falla o no está configurado, usa el mazo local incluido en el bundle.
 */
export const getCards = createServerFn({ method: "GET" }).handler(async () => {
  const url = process.env["TABU_CARDS_URL"];
  if (!url) return { cards: CARDS, source: "local" as const };
  try {
    const res = await fetch(url, { headers: { accept: "application/json" } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json: unknown = await res.json();
    const remote = Array.isArray(json) ? json.filter(isCard) : [];
    if (remote.length === 0) throw new Error("mazo remoto vacío");
    return { cards: remote, source: "remote" as const };
  } catch (err) {
    console.error("[tabu] no se pudo cargar el mazo remoto:", err);
    return { cards: CARDS, source: "local" as const };
  }
});
