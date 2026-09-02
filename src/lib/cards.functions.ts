import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { CARDS, type TabuCard } from "@/data/cards";

const cardSchema = z.object({
  word: z.string().min(1).max(60),
  forbidden: z.array(z.string().min(1).max(40)).min(1).max(5),
  category: z.enum([
    "general",
    "deportes",
    "cine",
    "tecnologia",
    "comida",
    "personajes",
    "naturaleza",
    "custom",
  ]),
});

const deckSchema = z.array(z.unknown()).max(20000);

/**
 * Mazo servido desde el servidor: permite actualizar las cartas sin
 * volver a desplegar la app definiendo TABU_CARDS_URL (JSON con TabuCard[]).
 * Si falla, tarda demasiado o no está configurado, usa el mazo local.
 */
export const getCards = createServerFn({ method: "GET" }).handler(async () => {
  const url = process.env["TABU_CARDS_URL"];
  if (!url) return { cards: CARDS, source: "local" as const };
  try {
    const res = await fetch(url, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json: unknown = await res.json();
    const list = deckSchema.parse(json);
    const remote = list.flatMap((item): TabuCard[] => {
      const parsed = cardSchema.safeParse(item);
      return parsed.success ? [parsed.data] : [];
    });
    if (remote.length === 0) throw new Error("mazo remoto vacío");
    return { cards: remote, source: "remote" as const };
  } catch (err) {
    console.error("[tabu] no se pudo cargar el mazo remoto:", err);
    return { cards: CARDS, source: "local" as const };
  }
});
