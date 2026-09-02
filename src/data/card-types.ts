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
