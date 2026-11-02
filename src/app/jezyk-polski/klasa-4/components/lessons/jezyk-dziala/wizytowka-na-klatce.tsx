'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Pin } from 'lucide-react';
import { TaskShell, type ProofCriterion } from '@/components/block-lesson/task-shell';
import { DragGhost, useDragToken } from '../../lesson-shell';
import { useTeczka } from '../../../lib/teczka/use-teczka';
import {
  EMPTY_WIZYTOWKA,
  IMIE_MAX,
  KOLEJNOSC,
  MIESZKANIEC_NAME,
  POWITANIA,
  PYTANIA,
  PYTANIE_MAX,
  UMIEJETNOSCI,
  WLASNE_MAX,
  ZAINTERESOWANIA,
  clean,
  interestLabel,
  interestsOf,
  isTouched,
  judgeWizytowka,
  karteczki,
  questionOf,
  umiemOf,
  withDot,
  wizytowkaText,
  type KryteriumId,
  type Wizytowka,
} from './wizytowka';

/**
 * L1, blok 3 „Wizytówka na klatce” `[1.8]` — zadanie z werdyktem (`TaskShell`).
 * Sędzia czyta tylko strukturę wizytówki (`wizytowka.ts`). Nagroda to **gest
 * nowy dla kursu: dziecko przypina wizytówkę na tablicy i patrzy, jak
 * mieszkańcy przechodzą obok i zostawiają karteczki** — odpisuje ten, kto lubi
 * to samo, na pytanie odpowiada ten, kogo dotyczy. Przypięta wizytówka staje
 * się pierwszą kartką Teczki autora.
 */

const LESSON = 'start/jezyk-dziala';
const TECZKA_ID = `${LESSON}#wizytowka`;

const CRITERIA: (ProofCriterion & { id: KryteriumId })[] = [
  { id: 'powitanie', label: 'Wizytówka zaczyna się od powitania.' },
  { id: 'imie', label: 'Sąsiedzi wiedzą, jak mają się do ciebie zwracać.' },
  { id: 'lubie', label: 'Są dwa różne zainteresowania.' },
  { id: 'pytanie', label: 'Jest pytanie do sąsiadów — z wielką literą i pytajnikiem.' },
];

interface Props {
  color: string;
  onComplete: () => void;
  /** Zapis ukończonego bloku — po odświeżeniu wizytówka wisi na tablicy. */
  restored?: { w: Wizytowka } | null;
  onSave?: (value: { w: Wizytowka }) => void;
}

export function WizytowkaNaKlatce({ color, onComplete, restored, onSave }: Props) {
  const [w, setW] = useState<Wizytowka>(EMPTY_WIZYTOWKA);
  const [checked, setChecked] = useState<Wizytowka | null>(null);
  /** Numer sprawdzenia — każde przyjęte sprawdzenie daje świeżą, nieprzypiętą wizytówkę do przypięcia. */
  const [checkNo, setCheckNo] = useState(0);
  /** Wizytówka przywrócona z zapisu wisi na tablicy, dopóki dziecko nie zechce jej poprawić. */
  const [wisi, setWisi] = useState<Wizytowka | null>(null);

  useEffect(() => {
    if (restored?.w) setWisi(restored.w);
  }, [restored]);

  if (wisi) {
    return (
      <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-5">
        <p className="text-sm">Twoja wizytówka wisi na klatce.</p>
        <Tablica w={wisi} color={color} onPinned={() => {}} startPinned />
        <button
          type="button"
          onClick={() => {
            setW(wisi);
            setWisi(null);
          }}
          className="mt-3 cursor-pointer border px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted"
          style={{ borderColor: color, color }}
        >
          Popraw wizytówkę
        </button>
      </div>
    );
  }
  const set = (patch: Partial<Wizytowka>) => setW((prev) => ({ ...prev, ...patch }));

  const toggleLubie = (id: string) =>
    setW((prev) => {
      if (prev.lubie.includes(id)) return { ...prev, lubie: prev.lubie.filter((x) => x !== id) };
      if (prev.lubie.length >= 2) return { ...prev, lubie: [prev.lubie[1], id] };
      return { ...prev, lubie: [...prev.lubie, id] };
    });

  const judge = () => {
    const snap = { ...w, lubie: [...w.lubie] };
    setChecked(snap);
    setCheckNo((n) => n + 1);
    const verdicts = judgeWizytowka(snap);
    return { verdicts, data: snap };
  };

  return (
    <TaskShell<Wizytowka>
      color={color}
      brief={
        <p>
          Przypnij na klatce swoją wizytówkę, żeby sąsiedzi wiedzieli, kim jesteś i jak do ciebie mówić. Złóż ją z
          części — wszystko, co wpiszesz, zostaje tylko na tym urządzeniu.
        </p>
      }
      criteria={CRITERIA}
      criteriaHeading="Czego sąsiedzi szukają na wizytówce"
      workshop={<Warsztat w={w} set={set} toggleLubie={toggleLubie} color={color} />}
      judge={judge}
      checkLabel="Pokaż wizytówkę sąsiadom"
      canCheck={isTouched(w)}
      renderReport={(data) => <WizytowkaCard w={data} color={color} />}
      acceptedText="Wizytówka jest gotowa. Przypnij ją na tablicy i zobacz, kto przejdzie obok."
      reward={
        checked ? (
          <Tablica
            key={checkNo}
            w={checked}
            color={color}
            onPinned={() => {
              onSave?.({ w: checked });
              onComplete();
            }}
          />
        ) : null
      }
      onReset={() => {
        setW(EMPTY_WIZYTOWKA);
        setChecked(null);
      }}
    />
  );
}

const capitalize = (s: string) => s[0].toLocaleUpperCase('pl') + s.slice(1);

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-semibold">
        {title}
        {hint && <span className="ml-2 font-normal text-muted-foreground">{hint}</span>}
      </legend>
      {children}
    </fieldset>
  );
}

function Tile({ on, color, onClick, children }: { on: boolean; color: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className="border px-3 py-1.5 text-sm transition-colors"
      style={on ? { borderColor: color, backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)`, color } : undefined}
    >
      {children}
    </button>
  );
}

const inputCls = 'w-full max-w-sm border bg-white px-3 py-2 text-base dark:bg-zinc-900';

function Warsztat({
  w,
  set,
  toggleLubie,
  color,
}: {
  w: Wizytowka;
  set: (p: Partial<Wizytowka>) => void;
  toggleLubie: (id: string) => void;
  color: string;
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
      <div className="min-w-0 space-y-5">
        <Section title="1. Powitanie">
          <div className="flex flex-wrap gap-2">
            {POWITANIA.map((p) => (
              <Tile key={p} on={w.powitanie === p} color={color} onClick={() => set({ powitanie: w.powitanie === p ? null : p })}>
                {p}
              </Tile>
            ))}
          </div>
        </Section>

        <Section title="2. Mówcie do mnie…" hint="imię albo przezwisko">
          <input
            value={w.imie}
            maxLength={IMIE_MAX}
            onChange={(e) => set({ imie: e.target.value })}
            className={inputCls}
            aria-label="Jak mają się do ciebie zwracać"
            autoComplete="off"
          />
        </Section>

        <Section title="3. Lubię…" hint="wybierz dwa albo wpisz własne">
          <div className="flex flex-wrap gap-2">
            {ZAINTERESOWANIA.map((z) => (
              <Tile key={z.id} on={w.lubie.includes(z.id)} color={color} onClick={() => toggleLubie(z.id)}>
                {z.label}
              </Tile>
            ))}
          </div>
          <input
            value={w.lubieWlasne}
            maxLength={WLASNE_MAX}
            onChange={(e) => set({ lubieWlasne: e.target.value })}
            placeholder="coś innego, co lubisz"
            className={inputCls}
            aria-label="Własne zainteresowanie"
            autoComplete="off"
          />
        </Section>

        <Section title="4. Umiem…" hint="jedno, nieobowiązkowe">
          <div className="flex flex-wrap gap-2">
            {UMIEJETNOSCI.map((u) => (
              <Tile key={u} on={w.umiem === u} color={color} onClick={() => set({ umiem: w.umiem === u ? null : u })}>
                {u}
              </Tile>
            ))}
            <Tile on={w.umiem === 'wlasne'} color={color} onClick={() => set({ umiem: w.umiem === 'wlasne' ? null : 'wlasne' })}>
              coś innego…
            </Tile>
          </div>
          {w.umiem === 'wlasne' && (
            <input
              value={w.umiemWlasne}
              maxLength={WLASNE_MAX}
              onChange={(e) => set({ umiemWlasne: e.target.value })}
              placeholder="np. gwizdać na palcach"
              className={inputCls}
              aria-label="Co umiesz"
              autoComplete="off"
            />
          )}
        </Section>

        <Section title="5. Pytanie do sąsiadów">
          <div className="flex flex-wrap gap-2">
            {PYTANIA.map((p) => (
              <Tile key={p.id} on={w.pytanie === p.id} color={color} onClick={() => set({ pytanie: w.pytanie === p.id ? null : p.id })}>
                {p.text}
              </Tile>
            ))}
            <Tile on={w.pytanie === 'wlasne'} color={color} onClick={() => set({ pytanie: w.pytanie === 'wlasne' ? null : 'wlasne' })}>
              moje własne…
            </Tile>
          </div>
          {w.pytanie === 'wlasne' && (
            <input
              value={w.pytanieWlasne}
              maxLength={PYTANIE_MAX}
              onChange={(e) => set({ pytanieWlasne: e.target.value })}
              className={inputCls}
              aria-label="Twoje pytanie do sąsiadów"
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
            />
          )}
        </Section>
      </div>
      <div className="lg:sticky lg:top-20 lg:self-start">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Podgląd</p>
        <WizytowkaCard w={w} color={color} />
      </div>
    </div>
  );
}

function WizytowkaCard({ w, color }: { w: Wizytowka; color: string }) {
  const interests = interestsOf(w);
  const umiem = umiemOf(w);
  const q = questionOf(w);
  const blank = <span className="text-amber-800/60">…</span>;
  return (
    <div className="border bg-amber-50 p-4 font-serif text-base leading-relaxed text-zinc-900 shadow-sm" style={{ borderTop: `6px solid ${color}` }}>
      <p className="text-lg font-semibold">{w.powitanie ?? blank}</p>
      <p className="mt-2">{clean(w.imie) ? withDot(`Mówcie do mnie: ${clean(w.imie)}`) : <>Mówcie do mnie: {blank}</>}</p>
      <p>{interests.length ? withDot(`Lubię ${interests.map(interestLabel).join(' i ')}`) : <>Lubię {blank}</>}</p>
      {umiem && <p>{withDot(`Umiem ${umiem}`)}</p>}
      <p className="mt-2 italic">{q ?? blank}</p>
    </div>
  );
}

/** Nagroda: przypięcie na tablicy, mieszkańcy mijają tablicę po kolei. */
function Tablica({
  w,
  color,
  onPinned,
  startPinned = false,
}: {
  w: Wizytowka;
  color: string;
  onPinned: () => void;
  /** Przywrócona z zapisu: od razu przypięta, karteczki już wiszą. */
  startPinned?: boolean;
}) {
  const { save } = useTeczka();
  const notes = karteczki(w);
  const passing = KOLEJNOSC.map((who) => ({ who, note: notes.find((n) => n.from === who) }));
  const extra = notes.filter((n, i) => notes.findIndex((m) => m.from === n.from) !== i);
  const steps = [...passing.map((p) => ({ who: p.who, note: p.note })), ...extra.map((n) => ({ who: n.from, note: n }))];
  const [pinned, setPinned] = useState(startPinned);
  const [held, setHeld] = useState(false);
  const [shown, setShown] = useState(startPinned ? steps.length : 0);

  const pin = () => {
    if (pinned) return;
    setPinned(true);
    setHeld(false);
    save({
      id: TECZKA_ID,
      lesson: LESSON,
      kind: 'wizytowka',
      title: 'Moja wizytówka z klatki schodowej',
      text: wizytowkaText(w),
      parts: {
        powitanie: w.powitanie ?? '',
        imie: clean(w.imie),
        lubie: interestsOf(w).map(interestLabel).join(', '),
        umiem: umiemOf(w) ?? '',
        pytanie: questionOf(w) ?? '',
      },
    });
    onPinned();
  };

  const drag = useDragToken({
    disabled: pinned,
    onDrop: (id, target) => target === 'tablica' && pin(),
    onTap: () => setHeld((h) => !h),
  });

  useEffect(() => {
    if (!pinned || shown >= steps.length) return;
    const t = window.setTimeout(() => setShown((n) => n + 1), shown === 0 ? 500 : 1100);
    return () => window.clearTimeout(t);
  }, [pinned, shown, steps.length]);

  return (
    <div className="mt-4 space-y-3">
      {!pinned && (
        <div className="flex flex-wrap items-center gap-3">
          <div
            {...drag.bind('wizytowka')}
            role="button"
            tabIndex={0}
            className="flex touch-none select-none items-center gap-2 border bg-amber-50 px-3 py-2 font-serif text-zinc-900 shadow-sm"
            style={{ outline: held ? `3px solid ${color}` : undefined, outlineOffset: 2 }}
            aria-label="Twoja wizytówka — przeciągnij na tablicę"
          >
            <Pin className="h-4 w-4" style={{ color }} aria-hidden />
            {w.powitanie} {clean(w.imie)}
          </div>
          <p className="text-xs text-muted-foreground">Przeciągnij wizytówkę na tablicę (albo stuknij ją, potem tablicę).</p>
        </div>
      )}
      <div
        data-drop="tablica"
        role="button"
        tabIndex={-1}
        onClick={() => held && pin()}
        className="relative min-h-[220px] border-4 border-amber-900/50 bg-[#c8a165] p-3 sm:p-4"
        style={{ outline: drag.hover === 'tablica' || held ? `3px solid ${color}` : undefined, outlineOffset: 2 }}
        aria-label="Tablica ogłoszeń na klatce"
        data-testid="tablica"
      >
        {!pinned && <p className="text-sm font-medium text-amber-950">Tablica ogłoszeń na klatce</p>}
        {pinned && (
          <div className="grid gap-3 sm:grid-cols-[minmax(0,240px)_1fr]">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <WizytowkaCard w={w} color={color} />
            </motion.div>
            <ul className="grid content-start gap-2 sm:grid-cols-2" aria-live="polite" data-testid="karteczki">
              {steps.slice(0, shown).map((s, i) =>
                s.note ? (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, y: -8, rotate: 0 }}
                    animate={{ opacity: 1, y: 0, rotate: i % 2 ? 1.2 : -1.2 }}
                    className="bg-yellow-50 p-2.5 text-sm leading-snug text-zinc-900 shadow"
                  >
                    <span className="block text-[11px] font-semibold uppercase tracking-wide text-amber-800">
                      od: {MIESZKANIEC_NAME[s.who]} · {s.note.kind === 'lubi' ? `też lubi ${s.note.about}` : 'odpowiada na pytanie'}
                    </span>
                    {s.note.text}
                  </motion.li>
                ) : (
                  <motion.li key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="self-center text-xs italic text-amber-950/80">
                    {capitalize(MIESZKANIEC_NAME[s.who])} przechodzi obok, czyta i idzie dalej.
                  </motion.li>
                )
              )}
            </ul>
          </div>
        )}
      </div>
      {pinned && shown >= steps.length && (
        <p className="text-sm">
          Karteczki zostawił ten, kto lubi to samo co ty, a na pytanie odpowiedział ten, kogo dotyczyło. Wizytówka trafiła
          do twojej <strong>Teczki autora</strong> — to jej pierwsza kartka.
        </p>
      )}
      <DragGhost drag={drag.drag}>
        <span className="block border bg-amber-50 px-3 py-2 font-serif text-zinc-900">
          {w.powitanie} {clean(w.imie)}
        </span>
      </DragGhost>
    </div>
  );
}
