'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';

/**
 * Symulator — **piszesz warunek, maszyna sprawdza wszystkich naraz**.
 *
 * Poprzednie dwa bloki uczyły szukania **po kolejności**. Ten jest o drugim
 * sposobie znajdowania rzeczy, wprost wymienionym w podstawie: **po własnościach**.
 * Dziecko nie klika w tego, kogo szuka — składa opis („czwarta klasa ORAZ gra na
 * flecie”), a program natychmiast zawęża listę wszystkich dwunastu osób.
 *
 * Trzy zamówienia są ułożone tak, żeby wyszły z nich trzy różne rzeczy:
 *  1. jeden warunek nie wystarcza — trzeba je **łączyć**;
 *  2. kolejność warunków nie ma znaczenia, liczy się ich zestaw;
 *  3. **czasem nie da się** — dwie osoby mają wszystkie cechy identyczne, więc
 *     żaden opis ich nie rozróżni. Trzeba to rozpoznać i nacisnąć „nie da się”.
 *
 * Ten trzeci przypadek jest w kursie nowy: **zadanie, którego poprawnym
 * rozwiązaniem jest stwierdzenie, że rozwiązania nie ma.** Komputer nie wymyśli
 * informacji, której nie dostał — jeśli dwa wiersze są nie do odróżnienia, to
 * brakuje danych, a nie sprytu.
 */

type Klasa = '4a' | '4b' | '5a';
type Instrument = 'skrzypce' | 'gitara' | 'flet';

interface Person {
  id: string;
  imie: string;
  klasa: Klasa;
  okulary: boolean;
  instrument: Instrument;
  dojezdza: boolean;
}

/** Ostatnie dwie osoby mają identyczne wszystkie cechy — to jest pułapka rundy 3. */
const PEOPLE: Person[] = [
  { id: 'p1', imie: 'Ala', klasa: '4a', okulary: true, instrument: 'skrzypce', dojezdza: false },
  { id: 'p2', imie: 'Bartek', klasa: '4a', okulary: false, instrument: 'gitara', dojezdza: true },
  { id: 'p3', imie: 'Celina', klasa: '4b', okulary: true, instrument: 'flet', dojezdza: true },
  { id: 'p4', imie: 'Damian', klasa: '5a', okulary: false, instrument: 'skrzypce', dojezdza: false },
  { id: 'p5', imie: 'Ewa', klasa: '4b', okulary: false, instrument: 'gitara', dojezdza: false },
  { id: 'p6', imie: 'Filip', klasa: '5a', okulary: true, instrument: 'gitara', dojezdza: true },
  { id: 'p7', imie: 'Gosia', klasa: '4a', okulary: true, instrument: 'flet', dojezdza: true },
  { id: 'p8', imie: 'Hubert', klasa: '4b', okulary: false, instrument: 'skrzypce', dojezdza: true },
  { id: 'p9', imie: 'Iga', klasa: '5a', okulary: false, instrument: 'flet', dojezdza: false },
  { id: 'p10', imie: 'Jarek', klasa: '4a', okulary: false, instrument: 'skrzypce', dojezdza: true },
  { id: 'p11', imie: 'Kasia', klasa: '4b', okulary: true, instrument: 'gitara', dojezdza: false },
  { id: 'p12', imie: 'Leon', klasa: '4b', okulary: true, instrument: 'gitara', dojezdza: false },
];

type CondId =
  | 'klasa-4a' | 'klasa-4b' | 'klasa-5a'
  | 'okulary-tak' | 'okulary-nie'
  | 'skrzypce' | 'gitara' | 'flet'
  | 'dojezdza-tak' | 'dojezdza-nie';

const CONDITIONS: { id: CondId; label: string; group: string; test: (p: Person) => boolean }[] = [
  { id: 'klasa-4a', label: 'klasa 4a', group: 'Klasa', test: (p) => p.klasa === '4a' },
  { id: 'klasa-4b', label: 'klasa 4b', group: 'Klasa', test: (p) => p.klasa === '4b' },
  { id: 'klasa-5a', label: 'klasa 5a', group: 'Klasa', test: (p) => p.klasa === '5a' },
  { id: 'okulary-tak', label: 'nosi okulary', group: 'Okulary', test: (p) => p.okulary },
  { id: 'okulary-nie', label: 'nie nosi okularów', group: 'Okulary', test: (p) => !p.okulary },
  { id: 'skrzypce', label: 'gra na skrzypcach', group: 'Instrument', test: (p) => p.instrument === 'skrzypce' },
  { id: 'gitara', label: 'gra na gitarze', group: 'Instrument', test: (p) => p.instrument === 'gitara' },
  { id: 'flet', label: 'gra na flecie', group: 'Instrument', test: (p) => p.instrument === 'flet' },
  { id: 'dojezdza-tak', label: 'dojeżdża do szkoły', group: 'Dojazd', test: (p) => p.dojezdza },
  { id: 'dojezdza-nie', label: 'mieszka blisko', group: 'Dojazd', test: (p) => !p.dojezdza },
];

const GROUPS = ['Klasa', 'Okulary', 'Instrument', 'Dojazd'];

interface Task {
  /** Kogo trzeba wskazać; `null` — zadanie, którego nie da się wykonać. */
  targetId: string | null;
  brief: string;
  learned: string;
}

const TASKS: Task[] = [
  {
    targetId: 'p7',
    brief:
      'Opisz Gosię tak, żeby program wskazał tylko ją. Jednym warunkiem się nie uda — spróbuj, a potem dołóż następny.',
    learned:
      'Jeden warunek zostawia zwykle kilka osób. Dopiero połączenie kilku („klasa 4a ORAZ gra na flecie”) zawęża listę do jednej. Tak właśnie szuka się w każdej bazie danych — składając warunki.',
  },
  {
    targetId: 'p9',
    brief: 'Teraz Iga. Spróbuj użyć jak najmniejszej liczby warunków.',
    learned:
      'Nie liczy się kolejność klikania warunków, tylko ich zestaw — program sprawdza wszystkie naraz dla każdej osoby. Warto szukać warunków, które od razu odrzucają najwięcej.',
  },
  {
    targetId: null,
    brief:
      'Ostatnie zadanie: opisz Kasię tak, żeby program wskazał tylko ją. Jeśli po drodze uznasz, że to niewykonalne — powiedz to.',
    learned:
      'Dobrze. Kasia i Leon mają WSZYSTKIE cztery cechy identyczne — klasa 4b, okulary, gitara, mieszkają blisko. Żaden opis ich nie rozróżni, bo w tej tabeli po prostu nie ma informacji, którą się różnią. To nie jest brak sprytu, tylko brak danych: komputer nie wymyśli tego, czego mu nie dano.',
  },
];

interface RuleSieveProps {
  color: string;
  onComplete?: () => void;
}

export function RuleSieve({ color, onComplete }: RuleSieveProps) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<CondId[]>([]);
  const [solved, setSolved] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const reported = useRef(false);
  const anchorRef = useSectionScrollAnchor(`${index}-${done}`);
  const task = TASKS[index];

  const active = CONDITIONS.filter((c) => picked.includes(c.id));
  const matching = PEOPLE.filter((person) => active.every((c) => c.test(person)));

  useEffect(() => {
    if (!done || reported.current) return;
    reported.current = true;
    onComplete?.();
  }, [done, onComplete]);

  const toggle = (id: CondId) => {
    if (solved) return;
    setNote(null);
    setPicked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const deliver = () => {
    if (solved) return;
    if (task.targetId === null) {
      setNote('To zadanie da się rozwiązać tylko jednym sposobem — i nie jest nim dokładanie warunków.');
      return;
    }
    if (matching.length === 1 && matching[0].id === task.targetId) {
      setSolved(true);
      setNote(null);
      return;
    }
    if (matching.length === 0) {
      setNote('Twój opis nie pasuje do nikogo — warunki wykluczają się nawzajem. Zdejmij jeden.');
      return;
    }
    if (matching.length === 1) {
      setNote(`Program wskazał jedną osobę, ale to ${matching[0].imie}, a nie ta, o którą chodziło.`);
      return;
    }
    setNote(
      `Twój opis pasuje do ${matching.length} osób: ${matching.map((p) => p.imie).join(', ')}. Żeby wskazać jedną, trzeba dołożyć warunek.`
    );
  };

  const giveUp = () => {
    if (solved) return;
    if (task.targetId === null) {
      setSolved(true);
      setNote(null);
      return;
    }
    setNote('Spokojnie — tę osobę da się opisać. Poszukaj jeszcze.');
  };

  const nextTask = () => {
    if (index === TASKS.length - 1) {
      setDone(true);
      return;
    }
    setIndex(index + 1);
    setPicked([]);
    setSolved(false);
    setNote(null);
  };

  if (done) {
    return (
      <div ref={anchorRef} className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
        <p className="text-sm font-semibold sm:text-base" style={{ color }}>
          Trzy zamówienia — i trzy różne rzeczy do zapamiętania.
        </p>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed sm:text-base">
          <li>
            <strong>Warunki się łączy.</strong> Jeden zwykle nie wystarcza; dopiero „to ORAZ tamto”
            zawęża zbiór do jednego.
          </li>
          <li>
            <strong>Kolejność warunków nie ma znaczenia</strong> — liczy się ich zestaw. Program i
            tak sprawdza wszystkie naraz dla każdej osoby.
          </li>
          <li>
            <strong>Czasem odpowiedzią jest „nie da się”.</strong> Jeśli dwa wiersze mają wszystkie
            cechy identyczne, żaden opis ich nie rozróżni — brakuje danych, a nie pomysłu.
          </li>
        </ul>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          To jest drugi sposób znajdowania rzeczy, obok tego z szuflad. Tam pomagała{' '}
          <strong>kolejność</strong>, tutaj pomagają <strong>cechy</strong> — i dokładnie tak działa
          każda wyszukiwarka w sklepie, bibliotece i dzienniku.
        </p>
      </div>
    );
  }

  return (
    <div ref={anchorRef} className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-semibold sm:text-base">
          Zamówienie {index + 1} z {TASKS.length}
        </p>
        <p className="text-xs tabular-nums text-muted-foreground">
          pasuje osób: <strong className="text-foreground">{matching.length}</strong> z {PEOPLE.length}
        </p>
      </div>
      <p className="mb-3 text-sm leading-relaxed">{task.brief}</p>

      <div className="grid gap-4 md:grid-cols-[210px_minmax(0,1fr)]">
        <div className="space-y-2.5">
          {GROUPS.map((group) => (
            <div key={group}>
              <p className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                <Filter className="h-3 w-3" aria-hidden />
                {group}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {CONDITIONS.filter((c) => c.group === group).map((cond) => (
                  <button
                    key={cond.id}
                    type="button"
                    onClick={() => toggle(cond.id)}
                    disabled={solved}
                    aria-pressed={picked.includes(cond.id)}
                    className={cn(
                      'border px-2 py-1 text-xs transition disabled:opacity-60',
                      !picked.includes(cond.id) && !solved && 'hover:bg-black/5 dark:hover:bg-white/5'
                    )}
                    style={{
                      borderColor: picked.includes(cond.id) ? color : undefined,
                      backgroundColor: picked.includes(cond.id) ? `${color}14` : undefined,
                    }}
                  >
                    {cond.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Lista wszystkich osób — pasujące zostają, reszta gaśnie. */}
        <div className="min-w-0">
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
            {PEOPLE.map((person) => {
              const on = matching.includes(person);
              return (
                <div
                  key={person.id}
                  className={cn(
                    'border p-2 text-xs transition-opacity',
                    !on && 'opacity-25'
                  )}
                  style={{ borderColor: on ? `${color}66` : undefined }}
                >
                  <p className="font-semibold">{person.imie}</p>
                  <p className="text-muted-foreground">
                    {person.klasa} · {person.instrument}
                  </p>
                  <p className="text-muted-foreground">
                    {person.okulary ? 'okulary' : 'bez okularów'} ·{' '}
                    {person.dojezdza ? 'dojeżdża' : 'blisko'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {!solved && (
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={deliver}
            className="px-4 py-2 text-sm font-semibold text-white"
            style={{ backgroundColor: color }}
          >
            Sprawdź opis
          </button>
          <button
            type="button"
            onClick={giveUp}
            className="border-2 px-3 py-2 text-sm font-medium"
            style={{ borderColor: `${color}55` }}
          >
            Tej osoby nie da się opisać
          </button>
        </div>
      )}

      <AnimatePresence mode="wait">
        {solved ? (
          <motion.div
            key="solved"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 p-3"
            style={{ backgroundColor: `${color}14` }}
          >
            <p className="flex items-start gap-2 text-sm leading-relaxed">
              <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
              <span>{task.learned}</span>
            </p>
            <button
              type="button"
              onClick={nextTask}
              className="mt-3 px-4 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: color }}
            >
              {index === TASKS.length - 1 ? 'Podsumowanie' : 'Następne zamówienie'}
            </button>
          </motion.div>
        ) : note ? (
          <motion.p
            key={note}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-4 border-l-2 border-amber-500 bg-amber-50 p-3 text-sm leading-relaxed dark:bg-amber-950/30"
          >
            {note}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
