import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertTriangle,
  Ban,
  Check,
  Minus,
  Play,
  Plus,
  Repeat,
  RotateCcw,

  SkipForward,
  Timer,
  Trash2,
  Trophy,
  Users,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { CATEGORIES, type CategoryId, type TabuCard } from "@/data/cards";

export type Team = { id: string; name: string; score: number };

const TEAM_ACCENTS = [
  "from-[oklch(0.62_0.22_25)] to-[oklch(0.72_0.18_45)]",
  "from-[oklch(0.55_0.2_255)] to-[oklch(0.65_0.16_215)]",
  "from-[oklch(0.6_0.18_150)] to-[oklch(0.72_0.16_130)]",
  "from-[oklch(0.6_0.22_300)] to-[oklch(0.68_0.18_330)]",
  "from-[oklch(0.72_0.16_75)] to-[oklch(0.78_0.15_95)]",
];

export const teamAccent = (index: number) => TEAM_ACCENTS[index % TEAM_ACCENTS.length];

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-background px-4 py-6 sm:py-10">
      <div className="mx-auto flex w-full max-w-xl flex-col">{children}</div>
    </main>
  );
}

/* ---------------- Validación de equipos ---------------- */

export function teamNameErrors(teams: Team[]): Record<string, string> {
  const errors: Record<string, string> = {};
  const seen = new Map<string, string>();
  teams.forEach((t) => {
    const name = t.name.trim();
    if (!name) {
      errors[t.id] = "Escribe un nombre";
      return;
    }
    const key = name.toLocaleLowerCase("es");
    if (seen.has(key)) errors[t.id] = "Nombre repetido";
    else seen.set(key, t.id);
  });
  return errors;
}

/* ---------------- A. Configuración ---------------- */

export function SetupScreen({
  teams,
  setTeams,
  duration,
  setDuration,
  rounds,
  setRounds,
  categories,
  setCategories,
  maxSkips,
  setMaxSkips,
  soundOn,
  setSoundOn,
  customCards,
  addCustomCard,
  removeCustomCard,
  availableCount,
  onStart,
  hasSavedGame,
  onResume,
}: {
  teams: Team[];
  setTeams: (t: Team[]) => void;
  duration: number;
  setDuration: (d: number) => void;
  rounds: number;
  setRounds: (n: number) => void;
  categories: CategoryId[];
  setCategories: (c: CategoryId[]) => void;
  maxSkips: number;
  setMaxSkips: (n: number) => void;
  soundOn: boolean;
  setSoundOn: (v: boolean) => void;
  customCards: TabuCard[];
  addCustomCard: (c: TabuCard) => void;
  removeCustomCard: (word: string) => void;
  availableCount: number;
  onStart: () => void;
  hasSavedGame: boolean;
  onResume: () => void;
}) {
  const errors = teamNameErrors(teams);
  const invalid = Object.keys(errors).length > 0 || categories.length === 0 || availableCount === 0;


  const rename = (id: string, name: string) =>
    setTeams(teams.map((t) => (t.id === id ? { ...t, name } : t)));

  const toggleCategory = (id: CategoryId) =>
    setCategories(
      categories.includes(id) ? categories.filter((c) => c !== id) : [...categories, id],
    );

  const allCategories: { id: CategoryId; label: string; emoji: string }[] = [
    ...CATEGORIES,
    ...(customCards.length > 0
      ? [{ id: "custom" as CategoryId, label: "Mis cartas", emoji: "✍️" }]
      : []),
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-6"
    >
      <header className="text-center">
        <h1 className="bg-brand-gradient bg-clip-text font-display text-7xl font-extrabold tracking-tight text-transparent sm:text-8xl">
          Tabú
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Haz que adivinen la palabra… sin decir lo prohibido.
        </p>
      </header>

      {hasSavedGame && (
        <button
          type="button"
          onClick={onResume}
          className="flex items-center justify-center gap-2 rounded-3xl bg-card py-4 font-display text-lg font-bold shadow-card transition active:scale-[0.98]"
        >
          <Play className="size-5" /> Retomar partida guardada
        </button>
      )}

      <section className="rounded-3xl bg-card p-5 shadow-card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-xl font-bold">
            <Users className="size-5 text-primary" /> Equipos
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Quitar equipo"
              disabled={teams.length <= 2}
              onClick={() => setTeams(teams.slice(0, -1))}
              className="grid size-9 place-items-center rounded-full bg-muted text-foreground transition hover:bg-secondary disabled:opacity-40"
            >
              <Minus className="size-4" />
            </button>
            <span className="w-5 text-center font-display text-lg font-bold">{teams.length}</span>
            <button
              type="button"
              aria-label="Añadir equipo"
              disabled={teams.length >= 5}
              onClick={() =>
                setTeams([
                  ...teams,
                  { id: crypto.randomUUID(), name: `Equipo ${teams.length + 1}`, score: 0 },
                ])
              }
              className="grid size-9 place-items-center rounded-full bg-primary text-primary-foreground transition hover:opacity-90 disabled:opacity-40"
            >
              <Plus className="size-4" />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <AnimatePresence initial={false}>
            {teams.map((team, i) => (
              <motion.div
                key={team.id}
                layout
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                className="flex flex-col gap-1"
              >
                <div
                  className={`flex items-center gap-3 rounded-2xl bg-muted px-3 py-2 ${
                    errors[team.id] ? "ring-2 ring-destructive" : ""
                  }`}
                >
                  <span
                    className={`size-3 shrink-0 rounded-full bg-gradient-to-br ${teamAccent(i)}`}
                  />
                  <input
                    value={team.name}
                    onChange={(e) => rename(team.id, e.target.value)}
                    maxLength={22}
                    aria-label={`Nombre del equipo ${i + 1}`}
                    aria-invalid={Boolean(errors[team.id])}
                    aria-describedby={errors[team.id] ? `team-error-${team.id}` : undefined}
                    className="w-full bg-transparent py-1 text-base font-semibold outline-none placeholder:text-muted-foreground"
                    placeholder={`Equipo ${i + 1}`}
                  />
                </div>
                {errors[team.id] && (
                  <p
                    id={`team-error-${team.id}`}
                    className="flex items-center gap-1 px-3 text-xs font-semibold text-destructive"
                  >
                    <AlertTriangle className="size-3" /> {errors[team.id]}
                  </p>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </section>

      <section className="rounded-3xl bg-card p-5 shadow-card">
        <h2 className="mb-3 font-display text-xl font-bold">Temática</h2>
        <div className="flex flex-wrap gap-2">
          {allCategories.map((c) => {
            const active = categories.includes(c.id);
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={active}
                onClick={() => toggleCategory(c.id)}
                className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                  active
                    ? "bg-brand-gradient text-primary-foreground shadow-card"
                    : "bg-muted text-muted-foreground hover:bg-secondary"
                }`}
              >
                {c.emoji} {c.label}
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex items-center justify-between text-xs font-semibold text-muted-foreground">
          <button
            type="button"
            onClick={() => setCategories(allCategories.map((c) => c.id))}
            className="underline underline-offset-2"
          >
            Seleccionar todas
          </button>
          <span aria-live="polite">
            {availableCount} carta{availableCount === 1 ? "" : "s"} en juego
          </span>
        </div>
        {categories.length === 0 && (
          <p className="mt-2 text-xs font-semibold text-destructive">
            Elige al menos una temática.
          </p>
        )}
      </section>

      <section className="rounded-3xl bg-card p-5 shadow-card">
        <h2 className="mb-3 flex items-center gap-2 font-display text-xl font-bold">
          <Timer className="size-5 text-primary" /> Tiempo por turno
        </h2>
        <div className="grid grid-cols-4 gap-2">
          {[30, 45, 60, 90].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDuration(d)}
              className={`rounded-2xl py-3 font-display text-lg font-bold transition ${
                duration === d
                  ? "bg-brand-gradient text-primary-foreground shadow-card"
                  : "bg-muted text-muted-foreground hover:bg-secondary"
              }`}
            >
              {d}s
            </button>
          ))}
        </div>

        <h2 className="mb-3 mt-5 flex items-center gap-2 font-display text-xl font-bold">
          <Repeat className="size-5 text-primary" /> Rondas de la partida
        </h2>
        <div className="grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRounds(r)}
              className={`rounded-2xl py-3 font-display text-lg font-bold transition ${
                rounds === r
                  ? "bg-brand-gradient text-primary-foreground shadow-card"
                  : "bg-muted text-muted-foreground hover:bg-secondary"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Una ronda se completa cuando los {teams.length} equipos han jugado su turno.
        </p>

        <h2 className="mb-3 mt-5 flex items-center gap-2 font-display text-xl font-bold">
          <SkipForward className="size-5 text-primary" /> Pases por turno
        </h2>

        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, Infinity].map((n) => (
            <button
              key={String(n)}
              type="button"
              onClick={() => setMaxSkips(n)}
              className={`rounded-2xl py-3 font-display text-lg font-bold transition ${
                maxSkips === n
                  ? "bg-brand-gradient text-primary-foreground shadow-card"
                  : "bg-muted text-muted-foreground hover:bg-secondary"
              }`}
            >
              {n === Infinity ? "∞" : n}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setSoundOn(!soundOn)}
          aria-pressed={soundOn}
          className="mt-5 flex w-full items-center justify-between rounded-2xl bg-muted px-4 py-3 font-semibold"
        >
          <span className="flex items-center gap-2">
            {soundOn ? <Volume2 className="size-5" /> : <VolumeX className="size-5" />}
            Sonido y vibración
          </span>
          <span className="text-sm text-muted-foreground">{soundOn ? "Activado" : "Apagado"}</span>
        </button>
      </section>

      <CustomCardsSection
        cards={customCards}
        onAdd={addCustomCard}
        onRemove={removeCustomCard}
      />

      <button
        type="button"
        onClick={onStart}
        disabled={invalid}
        className="bg-brand-gradient shadow-card active:scale-[0.98] flex items-center justify-center gap-2 rounded-3xl py-5 font-display text-2xl font-extrabold text-primary-foreground transition disabled:opacity-40"
      >
        <Play className="size-6 fill-current" /> ¡Empezar Juego!
      </button>
    </motion.div>
  );
}

/* ---------------- A.2 Cartas personalizadas ---------------- */

function CustomCardsSection({
  cards,
  onAdd,
  onRemove,
}: {
  cards: TabuCard[];
  onAdd: (c: TabuCard) => void;
  onRemove: (word: string) => void;
}) {
  const [word, setWord] = useState("");
  const [forbidden, setForbidden] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    const w = word.trim();
    const list = forbidden
      .split(/[\n,]/)
      .map((f) => f.trim())
      .filter(Boolean)
      .slice(0, 5);
    if (!w) return setError("Escribe la palabra a adivinar.");
    if (list.length < 1) return setError("Añade al menos una palabra prohibida.");
    if (cards.some((c) => c.word.toLocaleLowerCase("es") === w.toLocaleLowerCase("es")))
      return setError("Ya tienes una carta con esa palabra.");
    onAdd({ word: w, forbidden: list, category: "custom" });
    setWord("");
    setForbidden("");
    setError(null);
  };

  return (
    <section className="rounded-3xl bg-card p-5 shadow-card">
      <h2 className="mb-1 font-display text-xl font-bold">Mis cartas</h2>
      <p className="mb-3 text-xs text-muted-foreground">
        Crea tu propio mazo. Se guarda en este dispositivo.
      </p>

      <div className="flex flex-col gap-2">
        <input
          value={word}
          onChange={(e) => setWord(e.target.value)}
          maxLength={30}
          placeholder="Palabra a adivinar"
          aria-label="Palabra a adivinar"
          className="rounded-2xl bg-muted px-4 py-3 font-semibold outline-none"
        />
        <textarea
          value={forbidden}
          onChange={(e) => setForbidden(e.target.value)}
          rows={2}
          placeholder="Palabras prohibidas (separadas por comas)"
          aria-label="Palabras prohibidas separadas por comas"
          className="rounded-2xl bg-muted px-4 py-3 text-sm font-semibold outline-none"
        />
        {error && <p className="text-xs font-semibold text-destructive">{error}</p>}
        <button
          type="button"
          onClick={submit}
          className="flex items-center justify-center gap-2 rounded-2xl bg-primary py-3 font-display font-bold text-primary-foreground transition active:scale-[0.98]"
        >
          <Plus className="size-4" /> Añadir carta
        </button>
      </div>

      {cards.length > 0 && (
        <ul className="mt-4 flex flex-col gap-2">
          {cards.map((c) => (
            <li
              key={c.word}
              className="flex items-center gap-3 rounded-2xl bg-muted px-3 py-2 text-sm"
            >
              <span className="flex-1 truncate">
                <span className="font-bold">{c.word}</span>
                <span className="text-muted-foreground"> · {c.forbidden.join(", ")}</span>
              </span>
              <button
                type="button"
                aria-label={`Eliminar carta ${c.word}`}
                onClick={() => onRemove(c.word)}
                className="grid size-8 place-items-center rounded-full text-destructive transition hover:bg-destructive/10"
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/* ---------------- B. Cambio de turno ---------------- */

export function TurnIntroScreen({
  teams,
  currentIndex,
  duration,
  round,
  totalRounds,
  onStart,
  onFinish,
}: {
  teams: Team[];
  currentIndex: number;
  duration: number;
  round: number;
  totalRounds: number;
  onStart: () => void;
  onFinish: () => void;
}) {
  const team = teams[currentIndex]!;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col gap-6"
    >
      <div className="rounded-3xl bg-card p-8 text-center shadow-card">
        <p className="inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 font-display text-sm font-bold">
          <Repeat className="size-4" /> Ronda {round} de {totalRounds}
        </p>
        <p className="mt-4 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Turno de
        </p>
        <h1
          className={`mt-2 bg-gradient-to-br font-display text-5xl font-extrabold ${teamAccent(currentIndex)} bg-clip-text text-transparent`}
        >
          {team.name}
        </h1>
        <p className="mx-auto mt-2 text-xs font-semibold text-muted-foreground">
          Turno {currentIndex + 1} de {teams.length} en esta ronda
        </p>
        <p className="mx-auto mt-4 max-w-xs text-sm text-muted-foreground">
          Preparaos. El jugador que da las pistas debe tener la pantalla, el resto del equipo a
          adivinar.
        </p>
        <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-muted px-4 py-1.5 text-sm font-semibold">
          <Timer className="size-4" /> {duration}s
        </p>
      </div>


      <Scoreboard teams={teams} highlight={currentIndex} />

      <button
        type="button"
        onClick={onStart}
        className="bg-brand-gradient shadow-card active:scale-[0.98] flex items-center justify-center gap-2 rounded-3xl py-5 font-display text-2xl font-extrabold text-primary-foreground transition"
      >
        <Play className="size-6 fill-current" /> Empezar turno
      </button>

      <button
        type="button"
        onClick={onFinish}
        className="rounded-3xl bg-card py-4 font-display text-lg font-bold shadow-card transition active:scale-[0.98]"
      >
        Terminar partida
      </button>
    </motion.div>
  );
}

export function Scoreboard({ teams, highlight }: { teams: Team[]; highlight?: number }) {
  return (
    <section className="rounded-3xl bg-card p-4 shadow-card">
      <h2 className="mb-2 px-1 font-display text-lg font-bold">Puntuaciones</h2>
      <ul className="flex flex-col gap-1">
        {teams.map((t, i) => (
          <li
            key={t.id}
            className={`flex items-center gap-3 rounded-2xl px-3 py-2 ${
              i === highlight ? "bg-secondary" : ""
            }`}
          >
            <span className={`size-3 shrink-0 rounded-full bg-gradient-to-br ${teamAccent(i)}`} />
            <span className="flex-1 truncate font-semibold">{t.name}</span>
            <span className="font-display text-xl font-bold">{t.score}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---------------- C. Juego ---------------- */

export function PlayScreen({
  teamName,
  teamIndex,
  timeLeft,
  duration,
  card,
  cardKey,
  skipsLeft,
  onResult,
}: {
  teamName: string;
  teamIndex: number;
  timeLeft: number;
  duration: number;
  card: TabuCard;
  cardKey: number;
  skipsLeft: number;
  onResult: (r: "correct" | "taboo" | "skip") => void;
}) {
  const urgent = timeLeft <= 10;
  const skipsDisabled = skipsLeft <= 0;
  return (
    <div className="flex min-h-[calc(100vh-3rem)] flex-col gap-4">
      <header className="flex items-center justify-between rounded-3xl bg-card px-5 py-3 shadow-card">
        <div className="flex items-center gap-2 truncate">
          <span
            className={`size-3 shrink-0 rounded-full bg-gradient-to-br ${teamAccent(teamIndex)}`}
          />
          <span className="truncate font-semibold">{teamName}</span>
        </div>
        <span
          className={`flex items-center gap-2 font-display text-4xl font-extrabold tabular-nums transition-colors ${
            urgent ? "animate-pulse text-destructive" : "text-foreground"
          }`}
        >
          {urgent && <AlertTriangle className="size-6" aria-hidden />}
          {String(Math.floor(timeLeft / 60)).padStart(1, "0")}:
          {String(timeLeft % 60).padStart(2, "0")}
        </span>
      </header>

      {/* Señal accesible del tiempo: no depende solo del color */}
      <p aria-live="assertive" className="sr-only">
        {timeLeft === 10 ? "Quedan 10 segundos" : timeLeft === 0 ? "Tiempo agotado" : ""}
      </p>
      {urgent && (
        <p className="rounded-2xl bg-destructive/10 px-4 py-2 text-center text-sm font-bold text-destructive">
          ⚠ ¡Últimos {timeLeft} segundos!
        </p>
      )}

      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all duration-300 ease-linear ${urgent ? "bg-destructive" : "bg-brand-gradient"}`}
          style={{ width: `${(timeLeft / duration) * 100}%` }}
        />
      </div>

      <div className="relative flex-1">
        <AnimatePresence mode="wait">
          <motion.article
            key={cardKey}
            initial={{ opacity: 0, y: 40, rotate: -2, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="flex h-full w-full flex-col rounded-3xl bg-card p-6 shadow-card"
          >
            <h1 className="text-center font-display text-4xl font-extrabold uppercase tracking-tight sm:text-5xl">
              {card.word}
            </h1>
            <div className="my-5 h-px w-full bg-border" />
            <ul className="flex flex-1 flex-col justify-center gap-2">
              {card.forbidden.map((w) => (
                <li
                  key={w}
                  className="flex items-center gap-3 rounded-2xl bg-destructive/8 px-4 py-3 text-lg font-semibold text-destructive"
                >
                  <Ban className="size-4 shrink-0" />
                  {w}
                </li>
              ))}
            </ul>
          </motion.article>
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-3 gap-3 pb-2">
        <ActionButton
          label="Tabú"
          className="bg-destructive text-destructive-foreground"
          icon={<X className="size-7" />}
          onClick={() => onResult("taboo")}
        />
        <ActionButton
          label={skipsLeft === Infinity ? "Pasar" : `Pasar (${skipsLeft})`}
          className="bg-warn text-warn-foreground"
          icon={<SkipForward className="size-7" />}
          disabled={skipsDisabled}
          onClick={() => onResult("skip")}
        />
        <ActionButton
          label="Acierto"
          className="bg-success text-success-foreground"
          icon={<Check className="size-7" />}
          onClick={() => onResult("correct")}
        />
      </div>
    </div>
  );
}

function ActionButton({
  label,
  icon,
  className,
  onClick,
  disabled,
}: {
  label: string;
  icon: React.ReactNode;
  className: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex h-24 flex-col items-center justify-center gap-1 rounded-3xl font-display text-base font-bold shadow-card transition active:scale-95 disabled:opacity-40 ${className}`}
    >
      {icon}
      {label}
    </button>
  );
}

/* ---------------- D. Resumen de turno ---------------- */

export function TurnSummaryScreen({
  teams,
  teamIndex,
  stats,
  round,
  totalRounds,
  isRoundEnd,
  isGameEnd,
  onNext,
}: {
  teams: Team[];
  teamIndex: number;
  stats: { correct: number; taboo: number; skip: number };
  round: number;
  totalRounds: number;
  isRoundEnd: boolean;
  isGameEnd: boolean;
  onNext: () => void;
}) {
  const points = stats.correct - stats.taboo;
  const team = teams[teamIndex]!;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-5"
    >
      <div className="rounded-3xl bg-card p-6 text-center shadow-card">
        <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Fin del turno
        </p>
        <h1 className="mt-1 font-display text-3xl font-extrabold">{team.name}</h1>
        <p className="mt-4 font-display text-6xl font-extrabold">
          {points > 0 ? `+${points}` : points}
        </p>
        <p className="text-sm text-muted-foreground">puntos este turno</p>
        <p className="mt-2 text-sm font-semibold">Total acumulado: {team.score}</p>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <StatBox value={stats.correct} label="Aciertos" className="bg-success/12 text-success" />
          <StatBox value={stats.skip} label="Pasadas" className="bg-warn/20 text-warn-foreground" />
          <StatBox
            value={stats.taboo}
            label="Tabús"
            className="bg-destructive/10 text-destructive"
          />
        </div>
      </div>

      <p className="flex items-center justify-center gap-2 font-display text-sm font-bold text-muted-foreground">
        <Repeat className="size-4" />
        {isGameEnd
          ? `Ronda ${round} de ${totalRounds} completada — última ronda`
          : isRoundEnd
            ? `Ronda ${round} de ${totalRounds} completada`
            : `Ronda ${round} de ${totalRounds} · turno ${teamIndex + 1} de ${teams.length}`}
      </p>

      <Scoreboard teams={teams} />

      <button
        type="button"
        onClick={onNext}
        className="bg-brand-gradient shadow-card active:scale-[0.98] rounded-3xl py-5 font-display text-2xl font-extrabold text-primary-foreground transition"
      >
        {isGameEnd ? "Ver resultados" : isRoundEnd ? `Empezar ronda ${round + 1}` : "Siguiente Turno"}
      </button>

    </motion.div>
  );
}

function StatBox({
  value,
  label,
  className,
}: {
  value: number;
  label: string;
  className: string;
}) {
  return (
    <div className={`rounded-2xl py-3 ${className}`}>
      <p className="font-display text-2xl font-extrabold">{value}</p>
      <p className="text-xs font-semibold">{label}</p>
    </div>
  );
}

/* ---------------- E. Fin de partida ---------------- */

export function GameOverScreen({
  teams,
  roundsPlayed,
  totalRounds,
  onRestart,
}: {
  teams: Team[];
  roundsPlayed: number;
  totalRounds: number;
  onRestart: () => void;
}) {
  const ranked = [...teams].sort((a, b) => b.score - a.score);
  const top = ranked[0];
  const tied = top ? ranked.filter((t) => t.score === top.score) : [];
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col gap-5"
    >
      <div className="rounded-3xl bg-card p-6 text-center shadow-card">
        <Trophy className="mx-auto size-12 text-warn" />
        <h1 className="mt-2 font-display text-4xl font-extrabold">¡Fin de la partida!</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {tied.length > 1 ? (
            <>
              Empate entre{" "}
              <span className="font-bold text-foreground">
                {tied.map((t) => t.name).join(" y ")}
              </span>{" "}
              con {top?.score} puntos
            </>
          ) : (
            <>
              Gana <span className="font-bold text-foreground">{top?.name ?? "—"}</span> con{" "}
              {top?.score} puntos
            </>
          )}
        </p>
        <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-muted px-4 py-1.5 text-sm font-semibold">
          <Repeat className="size-4" /> {roundsPlayed} de {totalRounds} ronda
          {totalRounds === 1 ? "" : "s"} jugada{roundsPlayed === 1 ? "" : "s"}
        </p>
      </div>


      <ol className="flex flex-col gap-2">
        {ranked.map((t, i) => (
          <motion.li
            key={t.id}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`flex items-center gap-4 rounded-3xl p-4 shadow-card ${
              i === 0 ? "bg-brand-gradient text-primary-foreground" : "bg-card"
            }`}
          >
            <span className="font-display text-2xl font-extrabold opacity-70">{i + 1}</span>
            <span className="flex-1 truncate font-display text-xl font-bold">{t.name}</span>
            <span className="font-display text-2xl font-extrabold">{t.score}</span>
          </motion.li>
        ))}
      </ol>

      <button
        type="button"
        onClick={onRestart}
        className="flex items-center justify-center gap-2 rounded-3xl bg-card py-5 font-display text-xl font-extrabold shadow-card transition active:scale-[0.98]"
      >
        <RotateCcw className="size-5" /> Volver a jugar
      </button>
    </motion.div>
  );
}
