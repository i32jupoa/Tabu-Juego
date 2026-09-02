import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  AlertTriangle,
  Ban,
  Check,
  Contrast,
  Download,
  Languages,
  Link2,
  Maximize2,
  Minus,
  Play,
  Plus,
  Repeat,
  Shuffle,
  SkipForward,
  Timer,
  Trash2,
  Trophy,
  Upload,
  Users,
  Vibrate,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { CATEGORIES, type CategoryId, type TabuCard } from "@/data/cards";
import type { Settings, Stats, Team, TurnRecord } from "@/game/types";
import { UNLIMITED_SKIPS } from "@/game/types";
import type { TFunc } from "@/lib/i18n";
import { deckShareUrl, exportDeck, importDeckFile } from "@/lib/deck-io";

export type { Team } from "@/game/types";

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

export function teamNameErrors(teams: Team[], t?: TFunc): Record<string, string> {
  const errors: Record<string, string> = {};
  const seen = new Map<string, string>();
  teams.forEach((team) => {
    const name = team.name.trim();
    if (!name) {
      errors[team.id] = t ? t("nameRequired") : "Escribe un nombre";
      return;
    }
    const key = name.toLocaleLowerCase("es");
    if (seen.has(key)) errors[team.id] = t ? t("nameDuplicated") : "Nombre repetido";
    else seen.set(key, team.id);
  });
  return errors;
}

/* ---------------- Piezas reutilizables ---------------- */

function ToggleRow({
  icon,
  label,
  hint,
  value,
  onChange,
  onLabel,
  offLabel,
}: {
  icon: React.ReactNode;
  label: string;
  hint?: string;
  value: boolean;
  onChange: (v: boolean) => void;
  onLabel: string;
  offLabel: string;
}) {
  return (
    <div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        aria-pressed={value}
        className="flex min-h-11 w-full items-center justify-between rounded-2xl bg-muted px-4 py-3 font-semibold"
      >
        <span className="flex items-center gap-2">
          {icon}
          {label}
        </span>
        <span className="text-sm text-muted-foreground">{value ? onLabel : offLabel}</span>
      </button>
      {hint && <p className="mt-1 px-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function OptionGrid<T extends string | number>({
  options,
  value,
  onChange,
  format,
  columns,
}: {
  options: T[];
  value: T;
  onChange: (v: T) => void;
  format?: (v: T) => string;
  columns: string;
}) {
  return (
    <div className={`grid gap-2 ${columns}`}>
      {options.map((option) => (
        <button
          key={String(option)}
          type="button"
          aria-pressed={value === option}
          onClick={() => onChange(option)}
          className={`min-h-11 rounded-2xl py-3 font-display text-lg font-bold transition ${
            value === option
              ? "bg-brand-gradient text-primary-foreground shadow-card"
              : "bg-muted text-muted-foreground hover:bg-secondary"
          }`}
        >
          {format ? format(option) : String(option)}
        </button>
      ))}
    </div>
  );
}

/* ---------------- A. Configuración ---------------- */

export function SetupScreen({
  teams,
  setTeams,
  settings,
  patchSettings,
  customCards,
  addCustomCard,
  addCustomCards,
  removeCustomCard,
  availableCount,
  onStart,
  hasSavedGame,
  onResume,
  t,
}: {
  teams: Team[];
  setTeams: (t: Team[]) => void;
  settings: Settings;
  patchSettings: (patch: Partial<Settings>) => void;
  customCards: TabuCard[];
  addCustomCard: (c: TabuCard) => void;
  addCustomCards: (c: TabuCard[]) => void;
  removeCustomCard: (word: string) => void;
  availableCount: number;
  onStart: () => void;
  hasSavedGame: boolean;
  onResume: () => void;
  t: TFunc;
}) {
  const errors = teamNameErrors(teams, t);
  const invalid =
    Object.keys(errors).length > 0 || settings.categories.length === 0 || availableCount === 0;

  const rename = (id: string, name: string) =>
    setTeams(teams.map((team) => (team.id === id ? { ...team, name } : team)));

  const toggleCategory = (id: CategoryId) =>
    patchSettings({
      categories: settings.categories.includes(id)
        ? settings.categories.filter((c) => c !== id)
        : [...settings.categories, id],
    });

  const allCategories: { id: CategoryId; label: string; emoji: string }[] = [
    ...CATEGORIES,
    ...(customCards.length > 0
      ? [{ id: "custom" as CategoryId, label: t("myCards"), emoji: "✍️" }]
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
          {t("appTitle")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("tagline")}</p>
      </header>

      {hasSavedGame && (
        <button
          type="button"
          onClick={onResume}
          className="flex min-h-11 items-center justify-center gap-2 rounded-3xl bg-card py-4 font-display text-lg font-bold shadow-card transition active:scale-[0.98]"
        >
          <Play className="size-5" /> {t("resume")}
        </button>
      )}

      <section className="rounded-3xl bg-card p-5 shadow-card">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-xl font-bold">
            <Users className="size-5 text-primary" /> {t("teams")}
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label={t("removeTeam")}
              disabled={teams.length <= 2}
              onClick={() => setTeams(teams.slice(0, -1))}
              className="grid size-11 place-items-center rounded-full bg-muted text-foreground transition hover:bg-secondary disabled:opacity-40"
            >
              <Minus className="size-4" />
            </button>
            <span className="w-5 text-center font-display text-lg font-bold">{teams.length}</span>
            <button
              type="button"
              aria-label={t("addTeam")}
              disabled={teams.length >= 5}
              onClick={() =>
                setTeams([
                  ...teams,
                  {
                    id: crypto.randomUUID(),
                    name: `${t("teamNamePlaceholder")} ${teams.length + 1}`,
                    score: 0,
                  },
                ])
              }
              className="grid size-11 place-items-center rounded-full bg-primary text-primary-foreground transition hover:opacity-90 disabled:opacity-40"
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
                    id={`team-name-${team.id}`}
                    value={team.name}
                    onChange={(e) => rename(team.id, e.target.value)}
                    maxLength={22}
                    aria-label={`${t("teamNamePlaceholder")} ${i + 1}`}
                    aria-invalid={Boolean(errors[team.id])}
                    aria-describedby={errors[team.id] ? `team-error-${team.id}` : undefined}
                    className="w-full bg-transparent py-1 text-base font-semibold outline-none placeholder:text-muted-foreground"
                    placeholder={`${t("teamNamePlaceholder")} ${i + 1}`}
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
        <h2 className="mb-3 font-display text-xl font-bold">{t("theme")}</h2>
        <div className="flex flex-wrap gap-2">
          {allCategories.map((c) => {
            const active = settings.categories.includes(c.id);
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={active}
                onClick={() => toggleCategory(c.id)}
                className={`min-h-11 rounded-full px-4 py-2 text-sm font-bold transition ${
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
            onClick={() => patchSettings({ categories: allCategories.map((c) => c.id) })}
            className="underline underline-offset-2"
          >
            {t("selectAll")}
          </button>
          <span aria-live="polite">
            {availableCount} {t("cardsInPlay")}
          </span>
        </div>
        {settings.categories.length === 0 && (
          <p className="mt-2 text-xs font-semibold text-destructive">{t("pickCategory")}</p>
        )}
      </section>

      <section className="rounded-3xl bg-card p-5 shadow-card">
        <h2 className="mb-3 flex items-center gap-2 font-display text-xl font-bold">
          <Timer className="size-5 text-primary" /> {t("timePerTurn")}
        </h2>
        <OptionGrid
          options={[30, 45, 60, 90]}
          value={settings.duration}
          onChange={(duration) => patchSettings({ duration })}
          format={(d) => `${d}s`}
          columns="grid-cols-4"
        />

        <h2 className="mb-3 mt-5 flex items-center gap-2 font-display text-xl font-bold">
          <Repeat className="size-5 text-primary" /> {t("rounds")}
        </h2>
        <OptionGrid
          options={[1, 2, 3, 4, 5]}
          value={settings.totalRounds}
          onChange={(totalRounds) => patchSettings({ totalRounds })}
          columns="grid-cols-5"
        />
        <p className="mt-2 text-xs text-muted-foreground">{t("roundsHint")}</p>

        <h2 className="mb-3 mt-5 flex items-center gap-2 font-display text-xl font-bold">
          <SkipForward className="size-5 text-primary" /> {t("skipsPerTurn")}
        </h2>
        <OptionGrid
          options={[1, 2, 3, UNLIMITED_SKIPS]}
          value={settings.maxSkips}
          onChange={(maxSkips) => patchSettings({ maxSkips })}
          format={(n) => (n === UNLIMITED_SKIPS ? "∞" : String(n))}
          columns="grid-cols-4"
        />

        <div className="mt-5 flex flex-col gap-2">
          <ToggleRow
            icon={settings.soundOn ? <Volume2 className="size-5" /> : <VolumeX className="size-5" />}
            label={t("sound")}
            value={settings.soundOn}
            onChange={(soundOn) => patchSettings({ soundOn })}
            onLabel={t("on")}
            offLabel={t("off")}
          />
          <ToggleRow
            icon={<Vibrate className="size-5" />}
            label={t("vibration")}
            value={settings.vibrationOn}
            onChange={(vibrationOn) => patchSettings({ vibrationOn })}
            onLabel={t("on")}
            offLabel={t("off")}
          />
          <ToggleRow
            icon={<Maximize2 className="size-5" />}
            label={t("bigCards")}
            value={settings.bigCards}
            onChange={(bigCards) => patchSettings({ bigCards })}
            onLabel={t("on")}
            offLabel={t("off")}
          />
          <ToggleRow
            icon={<Contrast className="size-5" />}
            label={t("highContrast")}
            value={settings.highContrast}
            onChange={(highContrast) => patchSettings({ highContrast })}
            onLabel={t("on")}
            offLabel={t("off")}
          />
          <ToggleRow
            icon={<Shuffle className="size-5" />}
            label={t("steal")}
            hint={t("stealHint")}
            value={settings.stealOnTaboo}
            onChange={(stealOnTaboo) => patchSettings({ stealOnTaboo })}
            onLabel={t("on")}
            offLabel={t("off")}
          />
          <ToggleRow
            icon={<Languages className="size-5" />}
            label={t("language")}
            hint={t("cardsSpanishOnly")}
            value={settings.lang === "en"}
            onChange={(isEn) => patchSettings({ lang: isEn ? "en" : "es" })}
            onLabel="English"
            offLabel="Español"
          />
        </div>
      </section>

      <CustomCardsSection
        cards={customCards}
        onAdd={addCustomCard}
        onAddMany={addCustomCards}
        onRemove={removeCustomCard}
        t={t}
      />

      <button
        type="button"
        onClick={onStart}
        disabled={invalid}
        className="bg-brand-gradient shadow-card active:scale-[0.98] flex items-center justify-center gap-2 rounded-3xl py-5 font-display text-2xl font-extrabold text-primary-foreground transition disabled:opacity-40"
      >
        <Play className="size-6 fill-current" /> {t("start")}
      </button>
    </motion.div>
  );
}

/* ---------------- A.2 Cartas personalizadas ---------------- */

function CustomCardsSection({
  cards,
  onAdd,
  onAddMany,
  onRemove,
  t,
}: {
  cards: TabuCard[];
  onAdd: (c: TabuCard) => void;
  onAddMany: (c: TabuCard[]) => void;
  onRemove: (word: string) => void;
  t: TFunc;
}) {
  const [word, setWord] = useState("");
  const [forbidden, setForbidden] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const submit = () => {
    const w = word.trim();
    const list = forbidden
      .split(/[\n,]/)
      .map((f) => f.trim())
      .filter(Boolean)
      .slice(0, 5);
    if (!w || list.length === 0) {
      setError(t("importError"));
      return;
    }
    setError(null);
    onAdd({ word: w, forbidden: list, category: "custom" });
    setWord("");
    setForbidden("");
  };

  return (
    <section className="rounded-3xl bg-card p-5 shadow-card">
      <h2 className="mb-3 font-display text-xl font-bold">✍️ {t("customCards")}</h2>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-muted-foreground" htmlFor="custom-word">
          {t("word")}
        </label>
        <input
          id="custom-word"
          value={word}
          onChange={(e) => setWord(e.target.value)}
          maxLength={40}
          className="min-h-11 rounded-2xl bg-muted px-4 py-2 font-semibold outline-none placeholder:text-muted-foreground"
        />
        <label className="text-xs font-semibold text-muted-foreground" htmlFor="custom-forbidden">
          {t("forbiddenWords")}
        </label>
        <textarea
          id="custom-forbidden"
          value={forbidden}
          onChange={(e) => setForbidden(e.target.value)}
          rows={3}
          className="rounded-2xl bg-muted px-4 py-2 font-semibold outline-none placeholder:text-muted-foreground"
        />
        {error && <p className="text-xs font-semibold text-destructive">{error}</p>}
        <button
          type="button"
          onClick={submit}
          className="min-h-11 rounded-2xl bg-primary px-4 py-3 font-display font-bold text-primary-foreground"
        >
          <Plus className="mr-1 inline size-4" /> {t("addCard")}
        </button>
      </div>

      {cards.length > 0 && (
        <ul className="mt-4 flex flex-col gap-2">
          {cards.map((c) => (
            <li key={c.word} className="flex items-center gap-3 rounded-2xl bg-muted px-3 py-2">
              <span className="flex-1 truncate font-semibold">{c.word}</span>
              <span className="truncate text-xs text-muted-foreground">
                {c.forbidden.join(", ")}
              </span>
              <button
                type="button"
                aria-label={`${t("customCards")}: ${c.word}`}
                onClick={() => onRemove(c.word)}
                className="grid size-11 place-items-center rounded-full text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => exportDeck(cards)}
          disabled={cards.length === 0}
          className="flex min-h-11 items-center justify-center gap-1 rounded-2xl bg-muted px-3 py-2 text-sm font-bold disabled:opacity-40"
        >
          <Download className="size-4" /> {t("exportDeck")}
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="flex min-h-11 items-center justify-center gap-1 rounded-2xl bg-muted px-3 py-2 text-sm font-bold"
        >
          <Upload className="size-4" /> {t("importDeck")}
        </button>
        <button
          type="button"
          disabled={cards.length === 0}
          onClick={() => {
            void navigator.clipboard
              .writeText(deckShareUrl(cards))
              .then(() => setNotice(t("shareCopied")))
              .catch(() => setNotice(null));
          }}
          className="flex min-h-11 items-center justify-center gap-1 rounded-2xl bg-muted px-3 py-2 text-sm font-bold disabled:opacity-40"
        >
          <Link2 className="size-4" /> {t("shareDeck")}
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="application/json"
        aria-label={t("importDeck")}
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          void importDeckFile(file)
            .then((imported) => {
              if (imported.length === 0) setError(t("importError"));
              else {
                onAddMany(imported);
                setError(null);
              }
            })
            .catch(() => setError(t("importError")));
          e.target.value = "";
        }}
      />
      <p aria-live="polite" className="mt-2 text-xs font-semibold text-muted-foreground">
        {notice}
      </p>
    </section>
  );
}

/* ---------------- B. Aviso de turno ---------------- */

export function TurnIntroScreen({
  teams,
  currentIndex,
  duration,
  round,
  totalRounds,
  onStart,
  onFinish,
  t,
}: {
  teams: Team[];
  currentIndex: number;
  duration: number;
  round: number;
  totalRounds: number;
  onStart: () => void;
  onFinish: () => void;
  t: TFunc;
}) {
  const team = teams[currentIndex]!;
  const startRef = useRef<HTMLButtonElement>(null);
  useEffect(() => startRef.current?.focus(), []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-5"
    >
      <div className="rounded-3xl bg-card p-8 text-center shadow-card">
        <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          {t("round")} {round} {t("of")} {totalRounds}
        </p>
        <p className="mt-4 text-sm font-semibold text-muted-foreground">{t("turnOf")}</p>
        <h1 className="mt-1 font-display text-4xl font-extrabold">{team.name}</h1>
        <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-muted px-4 py-1.5 text-sm font-semibold">
          <Timer className="size-4" /> {duration}s
        </p>
        <p className="mt-4 font-display text-2xl font-bold">{t("ready")}</p>
      </div>

      <Scoreboard teams={teams} highlight={currentIndex} t={t} />

      <button
        ref={startRef}
        type="button"
        onClick={onStart}
        className="bg-brand-gradient shadow-card active:scale-[0.98] flex items-center justify-center gap-2 rounded-3xl py-5 font-display text-2xl font-extrabold text-primary-foreground transition"
      >
        <Play className="size-6 fill-current" /> {t("startTurn")}
      </button>
      <button
        type="button"
        onClick={onFinish}
        className="min-h-11 rounded-3xl bg-card py-4 font-display text-lg font-bold shadow-card transition active:scale-[0.98]"
      >
        {t("finishGame")}
      </button>
      <p className="text-center text-xs text-muted-foreground">{t("shortcuts")}</p>
    </motion.div>
  );
}

export function Scoreboard({
  teams,
  highlight,
  t,
}: {
  teams: Team[];
  highlight?: number;
  t: TFunc;
}) {
  return (
    <section className="rounded-3xl bg-card p-4 shadow-card">
      <h2 className="mb-2 px-1 font-display text-lg font-bold">{t("scores")}</h2>
      <ul className="flex flex-col gap-1">
        {teams.map((team, i) => (
          <li
            key={team.id}
            className={`flex items-center gap-3 rounded-2xl px-3 py-2 ${
              i === highlight ? "bg-secondary" : ""
            }`}
          >
            <span className={`size-3 shrink-0 rounded-full bg-gradient-to-br ${teamAccent(i)}`} />
            <span className="flex-1 truncate font-semibold">{team.name}</span>
            <span className="font-display text-xl font-bold">{team.score}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function TurnHistory({ history, t }: { history: TurnRecord[]; t: TFunc }) {
  if (history.length === 0) return null;
  return (
    <section className="rounded-3xl bg-card p-4 shadow-card">
      <h2 className="mb-2 px-1 font-display text-lg font-bold">{t("history")}</h2>
      <ul className="flex flex-col gap-1 text-sm">
        {[...history].reverse().map((record, i) => (
          <li
            key={`${record.round}-${record.teamId}-${i}`}
            className="flex items-center gap-3 rounded-2xl px-3 py-2 odd:bg-muted"
          >
            <span className="text-xs font-semibold text-muted-foreground">
              R{record.round}
            </span>
            <span className="flex-1 truncate font-semibold">{record.teamName}</span>
            <span className="text-xs text-muted-foreground">
              {record.correct}✓ · {record.taboo}✕ · {record.skip}↷
            </span>
            <span className="font-display font-bold tabular-nums">
              {record.points > 0 ? `+${record.points}` : record.points}
            </span>
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
  bigCards,
  reducedMotion,
  onResult,
  t,
}: {
  teamName: string;
  teamIndex: number;
  timeLeft: number;
  duration: number;
  card: TabuCard;
  cardKey: number;
  skipsLeft: number;
  bigCards: boolean;
  reducedMotion: boolean;
  onResult: (r: keyof Stats) => void;
  t: TFunc;
}) {
  const urgent = timeLeft <= 10;
  const skipsDisabled = skipsLeft === 0;

  /* Atajos de teclado: Espacio = acierto, T = tabú, S = pasar */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA)$/.test(target.tagName)) return;
      const key = e.key.toLowerCase();
      if (e.code === "Space" || key === "enter") {
        e.preventDefault();
        onResult("correct");
      } else if (key === "t") {
        onResult("taboo");
      } else if (key === "s" && !skipsDisabled) {
        onResult("skip");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onResult, skipsDisabled]);

  const anim = reducedMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: 40, rotate: -2, scale: 0.96 },
        animate: { opacity: 1, y: 0, rotate: 0, scale: 1 },
        exit: { opacity: 0, y: -40, scale: 0.96 },
      };

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
          role="timer"
          aria-live="off"
          className={`flex items-center gap-2 font-display text-4xl font-extrabold tabular-nums transition-colors ${
            urgent ? (reducedMotion ? "" : "animate-pulse") + " text-destructive" : "text-foreground"
          }`}
        >
          {urgent && <AlertTriangle className="size-6" aria-hidden />}
          {String(Math.floor(timeLeft / 60))}:{String(timeLeft % 60).padStart(2, "0")}
        </span>
      </header>

      {/* Señal accesible del tiempo: no depende solo del color */}
      <p aria-live="assertive" className="sr-only">
        {timeLeft === 10 ? t("tenSeconds") : timeLeft === 0 ? t("timeUp") : ""}
      </p>
      {urgent && (
        <p className="rounded-2xl bg-destructive/10 px-4 py-2 text-center text-sm font-bold text-destructive">
          ⚠ {t("lastSeconds")}
        </p>
      )}

      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all duration-300 ease-linear ${
            urgent ? "bg-destructive" : "bg-brand-gradient"
          }`}
          style={{ width: `${(timeLeft / duration) * 100}%` }}
        />
      </div>

      <div className="relative flex-1">
        <AnimatePresence mode="wait">
          <motion.article
            key={cardKey}
            {...anim}
            transition={
              reducedMotion
                ? { duration: 0.12 }
                : { type: "spring", stiffness: 320, damping: 28 }
            }
            className="flex h-full w-full flex-col rounded-3xl bg-card p-6 shadow-card"
          >
            <h1
              className={`text-center font-display font-extrabold uppercase tracking-tight ${
                bigCards ? "text-5xl sm:text-7xl" : "text-4xl sm:text-5xl"
              }`}
            >
              {card.word}
            </h1>
            <div className="my-5 h-px w-full bg-border" />
            <ul className="flex flex-1 flex-col justify-center gap-2">
              {card.forbidden.map((w) => (
                <li
                  key={w}
                  className={`flex items-center gap-3 rounded-2xl bg-destructive/10 px-4 py-3 font-semibold text-destructive ${
                    bigCards ? "text-2xl" : "text-lg"
                  }`}
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
          label={t("taboo")}
          className="bg-destructive text-destructive-foreground"
          icon={<X className="size-7" />}
          onClick={() => onResult("taboo")}
        />
        <ActionButton
          label={skipsLeft === UNLIMITED_SKIPS ? t("skip") : `${t("skip")} (${skipsLeft})`}
          className="bg-warn text-warn-foreground"
          icon={<SkipForward className="size-7" />}
          disabled={skipsDisabled}
          onClick={() => onResult("skip")}
        />
        <ActionButton
          label={t("correct")}
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
  stolen,
  round,
  totalRounds,
  isRoundEnd,
  isGameEnd,
  history,
  onNext,
  t,
}: {
  teams: Team[];
  teamIndex: number;
  stats: Stats;
  stolen: number;
  round: number;
  totalRounds: number;
  isRoundEnd: boolean;
  isGameEnd: boolean;
  history: TurnRecord[];
  onNext: () => void;
  t: TFunc;
}) {
  const points = stats.correct - stats.taboo;
  const team = teams[teamIndex]!;
  const nextRef = useRef<HTMLButtonElement>(null);
  useEffect(() => nextRef.current?.focus(), []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-5"
    >
      <div className="rounded-3xl bg-card p-6 text-center shadow-card">
        <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          {t("turnEnd")}
        </p>
        <h1 className="mt-1 font-display text-3xl font-extrabold">{team.name}</h1>
        <p className="mt-4 font-display text-6xl font-extrabold">
          {points > 0 ? `+${points}` : points}
        </p>
        <p className="text-sm text-muted-foreground">{t("pointsThisTurn")}</p>
        <p className="mt-2 text-sm font-semibold">
          {t("totalScore")}: {team.score}
        </p>
        {stolen > 0 && (
          <p className="mt-1 text-sm font-semibold text-destructive">
            {t("stolenPoints")}: {stolen}
          </p>
        )}

        <div className="mt-6 grid grid-cols-3 gap-3">
          <StatBox value={stats.correct} label={t("hits")} className="bg-success/15 text-success" />
          <StatBox value={stats.skip} label={t("skips")} className="bg-warn/20 text-warn-foreground" />
          <StatBox
            value={stats.taboo}
            label={t("taboos")}
            className="bg-destructive/10 text-destructive"
          />
        </div>
      </div>

      <p className="flex items-center justify-center gap-2 font-display text-sm font-bold text-muted-foreground">
        <Repeat className="size-4" />
        {t("round")} {round} {t("of")} {totalRounds}
        {!isRoundEnd && ` · ${teamIndex + 1}/${teams.length}`}
      </p>

      <Scoreboard teams={teams} t={t} />
      <TurnHistory history={history} t={t} />

      <button
        ref={nextRef}
        type="button"
        onClick={onNext}
        className="bg-brand-gradient shadow-card active:scale-[0.98] rounded-3xl py-5 font-display text-2xl font-extrabold text-primary-foreground transition"
      >
        {isGameEnd
          ? t("seeResults")
          : isRoundEnd
            ? `${t("startRound")} ${round + 1}`
            : t("nextTurn")}
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
  totalRounds,
  history,
  onRestart,
  t,
}: {
  teams: Team[];
  totalRounds: number;
  history: TurnRecord[];
  onRestart: () => void;
  t: TFunc;
}) {
  const ranked = [...teams].sort((a, b) => b.score - a.score);
  const top = ranked[0];
  const tied = top ? ranked.filter((team) => team.score === top.score) : [];
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col gap-5"
    >
      <div className="rounded-3xl bg-card p-6 text-center shadow-card">
        <Trophy className="mx-auto size-12 text-warn" />
        <h1 className="mt-2 font-display text-4xl font-extrabold">{t("gameOver")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {tied.length > 1 ? (
            <>
              {t("tieBetween")}{" "}
              <span className="font-bold text-foreground">
                {tied.map((team) => team.name).join(" · ")}
              </span>{" "}
              — {top?.score} {t("withPoints")}
            </>
          ) : (
            <>
              {t("wins")} <span className="font-bold text-foreground">{top?.name ?? "—"}</span> —{" "}
              {top?.score} {t("withPoints")}
            </>
          )}
        </p>
        <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-muted px-4 py-1.5 text-sm font-semibold">
          <Repeat className="size-4" /> {totalRounds} {t("rounds").toLowerCase()}
        </p>
      </div>

      <Scoreboard teams={ranked} highlight={0} t={t} />
      <TurnHistory history={history} t={t} />

      <button
        type="button"
        onClick={onRestart}
        className="bg-brand-gradient shadow-card active:scale-[0.98] rounded-3xl py-5 font-display text-2xl font-extrabold text-primary-foreground transition"
      >
        {t("playAgain")}
      </button>
    </motion.div>
  );
}
