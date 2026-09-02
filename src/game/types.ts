import type { CategoryId } from "@/data/card-types";

export type Phase = "setup" | "intro" | "play" | "summary" | "over";

export type Team = { id: string; name: string; score: number };

export type Stats = { correct: number; taboo: number; skip: number };

/** -1 = pases ilimitados (Infinity no sobrevive a JSON.stringify). */
export const UNLIMITED_SKIPS = -1;

export type Settings = {
  duration: number;
  totalRounds: number;
  maxSkips: number;
  categories: CategoryId[];
  soundOn: boolean;
  vibrationOn: boolean;
  bigCards: boolean;
  highContrast: boolean;
  stealOnTaboo: boolean;
  lang: "es" | "en";
};

export type TurnRecord = {
  round: number;
  teamId: string;
  teamName: string;
  points: number;
  stolen: number;
} & Stats;

export type GameState = {
  version: 2;
  phase: Phase;
  teams: Team[];
  currentIndex: number;
  round: number;
  settings: Settings;
  /** Semilla del barajado actual: el mazo se deriva de (pool, seed). */
  seed: number;
  deckPos: number;
  skipsLeft: number;
  stats: Stats;
  /** Puntos robados este turno, pendientes de asignar al rival. */
  stolen: number;
  deadline: number | null;
  timeLeft: number;
  history: TurnRecord[];
  cardNonce: number;
};

export const emptyStats: Stats = { correct: 0, taboo: 0, skip: 0 };

export const defaultSettings: Settings = {
  duration: 60,
  totalRounds: 3,
  maxSkips: 3,
  categories: [
    "general",
    "deportes",
    "cine",
    "tecnologia",
    "comida",
    "personajes",
    "naturaleza",
    "custom",
  ],
  soundOn: true,
  vibrationOn: true,
  bigCards: false,
  highContrast: false,
  stealOnTaboo: false,
  lang: "es",
};
