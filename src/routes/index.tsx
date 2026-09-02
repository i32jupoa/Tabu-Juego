import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { CARDS, type CategoryId, type TabuCard } from "@/data/cards";
import { getCards } from "@/lib/cards.functions";
import { CUSTOM_CARDS_KEY, GAME_KEY, loadJSON, removeKey, saveJSON } from "@/lib/storage";
import { playSound, primeAudio, vibrate } from "@/lib/feedback";
import {
  GameOverScreen,
  PlayScreen,
  SetupScreen,
  Shell,
  TurnIntroScreen,
  TurnSummaryScreen,
  teamNameErrors,
  type Team,
} from "@/components/tabu/screens";
import { defaultSettings, type Settings, UNLIMITED_SKIPS } from "@/game/types";
import { makeT, type TFunc } from "@/lib/i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tabú — Juego de palabras prohibidas online" },
      {
        name: "description",
        content:
          "Juega al clásico Tabú con 2 a 5 equipos: cartas por temáticas, mazos personalizados, cronómetro y marcador automático. Instalable en el móvil.",
      },
      { property: "og:title", content: "Tabú — Juego de palabras prohibidas online" },
      {
        property: "og:description",
        content:
          "Cartas por categorías, mazos propios, cronómetro y puntuación por equipos. Empieza a jugar al Tabú en segundos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TabuGame,
});

type Phase = "setup" | "intro" | "play" | "summary" | "over";
type Stats = { correct: number; taboo: number; skip: number };

type SavedGame = {
  phase: Phase;
  teams: Team[];
  currentIndex: number;
  duration: number;
  timeLeft: number;
  stats: Stats;
  deck: TabuCard[];
  deckPos: number;
  categories: CategoryId[];
  maxSkips: number;
  skipsLeft: number;
  soundOn: boolean;
  round: number;
  totalRounds?: number;
  usedCardKeys: string[];
};

const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
};

const emptyStats: Stats = { correct: 0, taboo: 0, skip: 0 };
const ALL_CATEGORIES: CategoryId[] = [
  "general",
  "deportes",
  "cine",
  "tecnologia",
  "comida",
  "personajes",
  "naturaleza",
  "custom",
];

function TabuGame() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [teams, setTeams] = useState<Team[]>([
    { id: "t1", name: "Equipo 1", score: 0 },
    { id: "t2", name: "Equipo 2", score: 0 },
  ]);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [round, setRound] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [stats, setStats] = useState<Stats>(emptyStats);
  const [deck, setDeck] = useState<TabuCard[]>([]);
  const [deckPos, setDeckPos] = useState(0);
  const [usedCardKeys, setUsedCardKeys] = useState<Set<string>>(() => new Set());
  const [cardKey, setCardKey] = useState(0);
  const [skipsLeft, setSkipsLeft] = useState<number>(3);
  const [customCards, setCustomCards] = useState<TabuCard[]>([]);
  const [savedGame, setSavedGame] = useState<SavedGame | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const patchSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  const t = makeT(settings.lang) as TFunc;

  /* Mazo del servidor (permite actualizarlo sin re-desplegar) */
  const { data } = useQuery({
    queryKey: ["cards"],
    queryFn: () => getCards(),
    staleTime: 5 * 60 * 1000,
  });
  const serverCards = data?.cards ?? CARDS;

  const deckRef = useRef<TabuCard[]>(deck);
  deckRef.current = deck;

  /* ---- Carga desde localStorage ---- */
  useEffect(() => {
    setCustomCards(loadJSON<TabuCard[]>(CUSTOM_CARDS_KEY) ?? []);
    const saved = loadJSON<SavedGame>(GAME_KEY);
    if (saved && saved.teams?.length) {
      setSavedGame(saved);
      setSettings((prev) => ({
        ...prev,
        categories: saved.categories ?? ALL_CATEGORIES,
        maxSkips: saved.maxSkips ?? 3,
        soundOn: saved.soundOn ?? true,
        duration: saved.duration ?? 60,
      }));
    }
    setHydrated(true);
  }, []);

  const pool = useMemo(() => {
    const all = [...serverCards, ...customCards];
    const seen = new Set<string>();
    return all.filter((c) => {
      if (!settings.categories.includes(c.category)) return false;
      const key = `${c.category}:${c.word.trim().toLocaleLowerCase("es")}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [serverCards, customCards, settings.categories]);

  const card = deck[deckPos] ?? pool[0] ?? CARDS[0]!;
  const cardId = (c: TabuCard) => `${c.category}:${c.word.trim().toLocaleLowerCase("es")}`;

  /* ---- Cronómetro anclado a Date.now() ---- */
  const deadlineRef = useRef<number>(0);
  useEffect(() => {
    if (phase !== "play") return;
    deadlineRef.current = Date.now() + timeLeft * 1000;
    const sync = () => {
      const left = Math.max(0, Math.round((deadlineRef.current - Date.now()) / 1000));
      setTimeLeft((prev) => (prev === left ? prev : left));
    };
    const id = setInterval(sync, 250);
    const onVisible = () => {
      if (document.visibilityState === "visible") sync();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
    // El deadline se fija al entrar en la fase de juego; los ticks no lo recalculan.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  /* Aviso sonoro en la cuenta atrás */
  const lastTickRef = useRef(-1);
  useEffect(() => {
    if (phase !== "play") return;
    if (timeLeft === lastTickRef.current) return;
    lastTickRef.current = timeLeft;
    if (timeLeft > 0 && timeLeft <= 5) playSound("tick", settings.soundOn);
    if (timeLeft === 10) vibrate(60, settings.soundOn);
  }, [timeLeft, phase, settings.soundOn]);

  /* Fin del turno */
  useEffect(() => {
    if (phase === "play" && timeLeft === 0) {
      playSound("buzzer", settings.soundOn);
      vibrate([180, 80, 240], settings.soundOn);
      setTeams((prev) =>
        prev.map((t, i) =>
          i === currentIndex ? { ...t, score: t.score + stats.correct - stats.taboo } : t,
        ),
      );
      setPhase("summary");
    }
  }, [phase, timeLeft, currentIndex, stats, settings.soundOn]);

  const newDeck = useCallback(() => shuffle(pool), [pool]);

  const markCurrentCardUsed = useCallback((c: TabuCard) => {
    const key = cardId(c);
    setUsedCardKeys((prev) => {
      if (prev.has(key)) return prev;
      const next = new Set(prev);
      next.add(key);
      return next;
    });
  }, []);

  const nextCard = useCallback(() => {
    markCurrentCardUsed(deckRef.current[deckPos] ?? pool[0] ?? CARDS[0]!);
    setDeckPos((p) => {
      if (p + 1 < deckRef.current.length) return p + 1;

      const alreadyUsed = new Set(usedCardKeys);
      const current = deckRef.current[p];
      if (current) alreadyUsed.add(cardId(current));
      const remaining = pool.filter((c) => !alreadyUsed.has(cardId(c)));
      setDeck(remaining.length > 0 ? shuffle(remaining) : shuffle(pool));
      if (remaining.length === 0) setUsedCardKeys(new Set());
      return 0;
    });
    setCardKey((k) => k + 1);
  }, [pool, usedCardKeys, deckPos, markCurrentCardUsed]);

  const handleResult = (r: "correct" | "taboo" | "skip") => {
    if (r === "skip" && skipsLeft <= 0) return;
    if (r === "skip") setSkipsLeft((s) => (s === Infinity ? s : s - 1));
    playSound(r, settings.soundOn);
    vibrate(r === "correct" ? 40 : r === "taboo" ? [60, 50, 60] : 25, settings.soundOn);
    setStats((s) => ({ ...s, [r]: s[r] + 1 }));
    nextCard();
  };

  const startTurn = () => {
    primeAudio();
    setStats(emptyStats);
    setSkipsLeft(settings.maxSkips);
    setTimeLeft(settings.duration);
    setCardKey((k) => k + 1);
    markCurrentCardUsed(card);
    setPhase("play");
  };

  const finishGame = () => setPhase("over");

  useEffect(() => {
    if (phase !== "over") return;
    const end = Date.now() + 1500;
    const frame = () => {
      confetti({ particleCount: 4, spread: 70, origin: { y: 0.3 }, startVelocity: 35 });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, [phase]);

  /* ---- Persistencia ---- */
  useEffect(() => {
    if (!hydrated) return;
    if (phase === "setup") return;
    saveJSON(GAME_KEY, {
      phase: phase === "play" ? "intro" : phase, // al retomar, se reanuda desde el aviso de turno
      teams,
      currentIndex,
      duration: settings.duration,
      timeLeft: settings.duration,
      stats,
      deck,
      deckPos,
      categories: settings.categories,
      maxSkips: settings.maxSkips,
      skipsLeft,
      soundOn: settings.soundOn,
      round,
      totalRounds: settings.totalRounds,
      usedCardKeys: [...usedCardKeys],
    } satisfies SavedGame);
  }, [
    hydrated,
    phase,
    teams,
    currentIndex,
    settings,
    stats,
    deck,
    deckPos,
    skipsLeft,
    round,
    usedCardKeys,
  ]);

  useEffect(() => {
    if (!hydrated) return;
    saveJSON(CUSTOM_CARDS_KEY, customCards);
  }, [customCards, hydrated]);

  const resumeGame = () => {
    if (!savedGame) return;
    setTeams(savedGame.teams);
    setCurrentIndex(savedGame.currentIndex);
    setSettings((prev) => ({
      ...prev,
      duration: savedGame.duration,
      totalRounds: savedGame.totalRounds ?? 3,
      categories: savedGame.categories ?? ALL_CATEGORIES,
      maxSkips: savedGame.maxSkips ?? 3,
      soundOn: savedGame.soundOn ?? true,
    }));
    setRound(savedGame.round ?? 1);
    setTimeLeft(savedGame.duration);
    setStats(savedGame.stats ?? emptyStats);
    setDeck(savedGame.deck?.length ? savedGame.deck : shuffle(pool));
    setDeckPos(savedGame.deckPos ?? 0);
    setUsedCardKeys(new Set(savedGame.usedCardKeys ?? []));
    setSkipsLeft(savedGame.skipsLeft ?? savedGame.maxSkips ?? 3);
    setPhase(savedGame.phase === "play" ? "intro" : savedGame.phase);
  };

  const restart = () => {
    removeKey(GAME_KEY);
    setSavedGame(null);
    setTeams((prev) => prev.map((t) => ({ ...t, score: 0 })));
    setCurrentIndex(0);
    setRound(1);
    setSettings((prev) => ({ ...prev, totalRounds: 3 }));
    setDeck([]);
    setDeckPos(0);
    setUsedCardKeys(new Set());
    setStats(emptyStats);
    setPhase("setup");
  };

  const currentTeam = teams[currentIndex] ?? teams[0]!;

  return (
    <Shell>
      <AnimatePresence mode="wait">
        {phase === "setup" && (
          <SetupScreen
            key="setup"
            teams={teams}
            setTeams={setTeams}
            settings={settings}
            patchSettings={patchSettings}
            customCards={customCards}
            addCustomCard={(c) => setCustomCards((prev) => [...prev, c])}
            addCustomCards={(cards) => setCustomCards((prev) => [...prev, ...cards])}
            removeCustomCard={(word) =>
              setCustomCards((prev) => prev.filter((c) => c.word !== word))
            }
            availableCount={pool.length}
            hasSavedGame={Boolean(savedGame)}
            onResume={resumeGame}
            onStart={() => {
              if (Object.keys(teamNameErrors(teams)).length > 0 || pool.length === 0) return;
              primeAudio();
              setSavedGame(null);
              setTeams((prev) => prev.map((t) => ({ ...t, name: t.name.trim(), score: 0 })));
              setCurrentIndex(0);
              setRound(1);
              setSettings((prev) => ({ ...prev, totalRounds: Math.max(1, Math.min(5, settings.totalRounds)) }));
              setDeck(newDeck());
              setDeckPos(0);
              setUsedCardKeys(new Set());
              setSkipsLeft(settings.maxSkips);
              setPhase("intro");
            }}
            t={t}
          />
        )}
        {phase === "intro" && (
          <TurnIntroScreen
            key="intro"
            teams={teams}
            currentIndex={currentIndex}
            duration={settings.duration}
            round={round}
            totalRounds={settings.totalRounds}
            onStart={startTurn}
            onFinish={finishGame}
            t={t}
          />
        )}
        {phase === "play" && (
          <PlayScreen
            key="play"
            teamName={currentTeam.name}
            teamIndex={currentIndex}
            timeLeft={timeLeft}
            duration={settings.duration}
            card={card}
            cardKey={cardKey}
            skipsLeft={skipsLeft}
            bigCards={settings.bigCards}
            reducedMotion={settings.highContrast}
            onResult={handleResult}
            teams={teams}
            t={t}
          />
        )}
        {phase === "summary" && (
          <TurnSummaryScreen
            key="summary"
            teams={teams}
            teamIndex={currentIndex}
            stats={stats}
            stolen={0}
            round={round}
            totalRounds={settings.totalRounds}
            isRoundEnd={currentIndex === teams.length - 1}
            isGameEnd={currentIndex === teams.length - 1 && round === settings.totalRounds}
            history={[]}
            onNext={() => {
              const lastTeam = currentIndex === teams.length - 1;
              const lastRound = round === settings.totalRounds;
              if (lastTeam && lastRound) {
                setPhase("over");
                return;
              }
              if (lastTeam) {
                setRound((r) => r + 1);
                setCurrentIndex(0);
              } else {
                setCurrentIndex((i) => i + 1);
              }
              setPhase("intro");
            }}
            t={t}
          />
        )}
        {phase === "over" && (
          <GameOverScreen
            key="over"
            teams={teams}
            totalRounds={settings.totalRounds}
            history={[]}
            onRestart={restart}
            t={t}
          />
        )}
      </AnimatePresence>
    </Shell>
  );
}
