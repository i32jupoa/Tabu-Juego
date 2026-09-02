import { dedupeCards, type TabuCard } from "@/data/card-types";

/** Valida y normaliza una lista arbitraria a cartas personalizadas. */
export function parseDeck(input: unknown): TabuCard[] {
  const raw = Array.isArray(input) ? input : [];
  const cards = raw.flatMap((item): TabuCard[] => {
    if (!item || typeof item !== "object") return [];
    const rec = item as Record<string, unknown>;
    const word = typeof rec["word"] === "string" ? rec["word"].trim() : "";
    const forbidden = Array.isArray(rec["forbidden"])
      ? rec["forbidden"].filter((f): f is string => typeof f === "string").map((f) => f.trim())
      : [];
    if (!word || forbidden.length === 0) return [];
    return [{ word, forbidden: forbidden.slice(0, 5), category: "custom" }];
  });
  return dedupeCards(cards);
}

export function exportDeck(cards: TabuCard[]): void {
  const blob = new Blob([JSON.stringify(cards, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "mazo-tabu.json";
  a.click();
  URL.revokeObjectURL(url);
}

export async function importDeckFile(file: File): Promise<TabuCard[]> {
  const text = await file.text();
  return parseDeck(JSON.parse(text) as unknown);
}

const encode = (cards: TabuCard[]): string =>
  btoa(
    String.fromCharCode(
      ...new TextEncoder().encode(
        JSON.stringify(cards.map((c) => ({ word: c.word, forbidden: c.forbidden }))),
      ),
    ),
  )
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

const decode = (value: string): unknown => {
  const b64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes)) as unknown;
};

/** Enlace compartible con el mazo propio embebido en el hash. */
export function deckShareUrl(cards: TabuCard[]): string {
  return `${window.location.origin}${window.location.pathname}#deck=${encode(cards)}`;
}

export function readDeckFromHash(): TabuCard[] {
  if (typeof window === "undefined") return [];
  const match = /#deck=([A-Za-z0-9-_]+)/.exec(window.location.hash);
  if (!match?.[1]) return [];
  try {
    return parseDeck(decode(match[1]));
  } catch {
    return [];
  }
}
