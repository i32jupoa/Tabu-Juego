import { newSeed } from "@/lib/random";
import {
  defaultSettings,
  emptyStats,
  UNLIMITED_SKIPS,
  type GameState,
  type Settings,
  type Stats,
  type Team,
} from "./types";

export type Action =
  | { type: "HYDRATE"; state: GameState }
  | { type: "SET_SETTINGS"; patch: Partial<Settings> }
  | { type: "SET_TEAMS"; teams: Team[] }
  | { type: "START_GAME"; now: number }
  | { type: "START_TURN"; now: number }
  | { type: "RESULT"; result: keyof Stats }
  | { type: "TICK"; now: number }
  | { type: "RESHUFFLE" }
  | { type: "NEXT" }
  | { type: "FINISH" }
  | { type: "RESTART" };

export const initialState = (): GameState => ({
  version: 2,
  phase: "setup",
  teams: [
    { id: "t1", name: "Equipo 1", score: 0 },
    { id: "t2", name: "Equipo 2", score: 0 },
  ],
  currentIndex: 0,
  round: 1,
  settings: defaultSettings,
  seed: 1,
  deckPos: 0,
  skipsLeft: defaultSettings.maxSkips,
  stats: emptyStats,
  stolen: 0,
  deadline: null,
  timeLeft: defaultSettings.duration,
  history: [],
  cardNonce: 0,
});

export const turnPoints = (stats: Stats): number => stats.correct - stats.taboo;

/** Cierra el turno: aplica puntos, robo al rival y guarda el historial. */
function closeTurn(state: GameState): GameState {
  const team = state.teams[state.currentIndex];
  if (!team) return { ...state, phase: "summary", deadline: null, timeLeft: 0 };
  const points = turnPoints(state.stats);
  const rivalIndex = state.teams.length > 1 ? (state.currentIndex + 1) % state.teams.length : -1;
  const teams = state.teams.map((t, i) => {
    if (i === state.currentIndex) return { ...t, score: t.score + points };
    if (i === rivalIndex && state.stolen > 0) return { ...t, score: t.score + state.stolen };
    return t;
  });
  return {
    ...state,
    phase: "summary",
    deadline: null,
    timeLeft: 0,
    teams,
    history: [
      ...state.history,
      {
        round: state.round,
        teamId: team.id,
        teamName: team.name,
        points,
        stolen: state.stolen,
        ...state.stats,
      },
    ],
  };
}

export function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "HYDRATE":
      return action.state;

    case "SET_SETTINGS": {
      const settings = { ...state.settings, ...action.patch };
      return {
        ...state,
        settings,
        skipsLeft: state.phase === "setup" ? settings.maxSkips : state.skipsLeft,
        timeLeft: state.phase === "setup" ? settings.duration : state.timeLeft,
      };
    }

    case "SET_TEAMS":
      return { ...state, teams: action.teams };

    case "START_GAME":
      return {
        ...state,
        phase: "intro",
        teams: state.teams.map((t) => ({ ...t, name: t.name.trim(), score: 0 })),
        currentIndex: 0,
        round: 1,
        seed: newSeed(),
        deckPos: 0,
        stats: emptyStats,
        stolen: 0,
        skipsLeft: state.settings.maxSkips,
        timeLeft: state.settings.duration,
        deadline: null,
        history: [],
      };

    case "START_TURN":
      return {
        ...state,
        phase: "play",
        stats: emptyStats,
        stolen: 0,
        skipsLeft: state.settings.maxSkips,
        timeLeft: state.settings.duration,
        deadline: action.now + state.settings.duration * 1000,
        cardNonce: state.cardNonce + 1,
      };

    case "RESULT": {
      if (state.phase !== "play") return state;
      if (action.result === "skip" && state.skipsLeft === 0) return state;
      const skipsLeft =
        action.result === "skip" && state.skipsLeft !== UNLIMITED_SKIPS
          ? state.skipsLeft - 1
          : state.skipsLeft;
      return {
        ...state,
        skipsLeft,
        stats: { ...state.stats, [action.result]: state.stats[action.result] + 1 },
        stolen:
          action.result === "taboo" && state.settings.stealOnTaboo
            ? state.stolen + 1
            : state.stolen,
        deckPos: state.deckPos + 1,
        cardNonce: state.cardNonce + 1,
      };
    }

    case "RESHUFFLE":
      return { ...state, seed: newSeed(), deckPos: 0 };

    case "TICK": {
      if (state.phase !== "play" || state.deadline === null) return state;
      const left = Math.max(0, Math.round((state.deadline - action.now) / 1000));
      if (left === 0) return closeTurn({ ...state, timeLeft: 0 });
      return left === state.timeLeft ? state : { ...state, timeLeft: left };
    }

    case "NEXT": {
      const lastTeam = state.currentIndex === state.teams.length - 1;
      const lastRound = state.round === state.settings.totalRounds;
      if (lastTeam && lastRound) return { ...state, phase: "over" };
      return {
        ...state,
        phase: "intro",
        currentIndex: lastTeam ? 0 : state.currentIndex + 1,
        round: lastTeam ? state.round + 1 : state.round,
        timeLeft: state.settings.duration,
      };
    }

    case "FINISH":
      return { ...state, phase: "over", deadline: null };

    case "RESTART":
      return {
        ...initialState(),
        settings: state.settings,
        teams: state.teams.map((t) => ({ ...t, score: 0 })),
        timeLeft: state.settings.duration,
        skipsLeft: state.settings.maxSkips,
      };

    default:
      return state;
  }
}
