/** Única fuente de verdad de los tipos y categorías del mazo. */

export type CategoryId =
  | "general"
  | "deportes"
  | "cine"
  | "tecnologia"
  | "comida"
  | "personajes"
  | "naturaleza"
  | "custom";

export type TabuCard = {
  word: string;
  forbidden: string[];
  category: CategoryId;
};

export const CATEGORIES: { id: CategoryId; label: string; emoji: string }[] = [
  { id: "general", label: "General", emoji: "🎲" },
  { id: "deportes", label: "Deportes", emoji: "⚽" },
  { id: "cine", label: "Cine y TV", emoji: "🎬" },
  { id: "tecnologia", label: "Tecnología", emoji: "💻" },
  { id: "comida", label: "Comida", emoji: "🍕" },
  { id: "personajes", label: "Personajes", emoji: "🦸" },
  { id: "naturaleza", label: "Naturaleza", emoji: "🌿" },
];

export const ALL_CATEGORY_IDS: CategoryId[] = [...CATEGORIES.map((c) => c.id), "custom"];

/** Clave estable de una carta (categoría + palabra normalizada). */
export const cardId = (c: TabuCard): string =>
  `${c.category}:${c.word.trim().toLocaleLowerCase("es")}`;

export const dedupeCards = (cards: TabuCard[]): TabuCard[] => {
  const seen = new Set<string>();
  return cards.filter((card) => {
    const key = cardId(card);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};
