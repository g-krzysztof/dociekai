'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';

/**
 * Symulator — **próba generalna zadania Z-9 na ekranie**.
 *
 * Z-9 każe zrobić dokument z próbkami krojów, zapisać nazwę każdego kroju *tym
 * właśnie krojem* i sprawdzić, czy ma polskie znaki. Dziecko, które nigdy tego
 * nie robiło, nie wie, na co patrzeć — więc najpierw składa taki próbnik tutaj,
 * na prawdziwych krojach z przeglądarki, i dopiero potem robi to samo w edytorze.
 *
 * Sedno bloku to **pułapka z ostatniej grupy**: krój pobrany z internetu, który
 * nie ma polskich liter. Program nie pokazuje wtedy pustych prostokątów — po
 * cichu **podstawia brakujące litery z innego kroju**, więc „ą” i „ł” nagle
 * wyglądają inaczej niż reszta wyrazu. To jest dokładnie to, czego Z-9 każe
 * szukać, i jedyny sposób, żeby dziecko nauczyło się to zauważać: zobaczyć raz.
 *
 * Uczciwość: nazwana grupa to „krój pobrany z internetu”, a nie konkretny
 * istniejący krój — bo które realne kroje mają polskie znaki, zależy od systemu
 * i wersji, a kurs nie może twierdzić czegoś, czego nie sprawdzi na komputerze
 * dziecka. Zjawisko jest prawdziwe i pokazane wiernie; nie przypisujemy go tylko
 * z nazwiska.
 */

type Group = 'szeryfowy' | 'bezszeryfowy' | 'ozdobny' | 'z-internetu';

const GROUP_LABEL: Record<Group, string> = {
  szeryfowy: 'Szeryfowe',
  bezszeryfowy: 'Bezszeryfowe',
  ozdobny: 'Ozdobne i maszynowe',
  'z-internetu': 'Pobrane z internetu',
};

const GROUP_ABOUT: Record<Group, string> = {
  szeryfowy: 'Litery mają na końcach małe kreseczki — szeryfy. Dobre do długiego czytania.',
  bezszeryfowy: 'Gołe kreski, bez ozdóbek. Czytelne z daleka i na ekranie.',
  ozdobny: 'Do tytułów i zaproszeń. Do długiego tekstu męczą oczy.',
  'z-internetu': 'Ściągnięte z darmowej strony z czcionkami. Tu trzeba uważać.',
};

interface FontChoice {
  id: string;
  name: string;
  family: string;
  group: Group;
  hasPolish: boolean;
  /** Krój, którym program podstawi brakujące litery — widoczny dowód braku. */
  substitute?: string;
}

const FONTS: FontChoice[] = [
  { id: 'georgia', name: 'Georgia', family: 'Georgia, serif', group: 'szeryfowy', hasPolish: true },
  {
    id: 'times',
    name: 'Times New Roman',
    family: '"Times New Roman", Times, serif',
    group: 'szeryfowy',
    hasPolish: true,
  },
  {
    id: 'arial',
    name: 'Arial',
    family: 'Arial, Helvetica, sans-serif',
    group: 'bezszeryfowy',
    hasPolish: true,
  },
  {
    id: 'verdana',
    name: 'Verdana',
    family: 'Verdana, Geneva, sans-serif',
    group: 'bezszeryfowy',
    hasPolish: true,
  },
  {
    id: 'courier',
    name: 'Courier New',
    family: '"Courier New", Courier, monospace',
    group: 'ozdobny',
    hasPolish: true,
  },
  {
    id: 'comic',
    name: 'Comic Sans MS',
    family: '"Comic Sans MS", "Chalkboard SE", cursive',
    group: 'ozdobny',
    hasPolish: true,
  },
  {
    id: 'brush',
    name: 'Brush Script MT',
    family: '"Brush Script MT", "Segoe Script", cursive',
    group: 'ozdobny',
    hasPolish: true,
  },
  {
    id: 'sciagniety',
    name: 'Kaligrafia Wiosenna',
    family: '"Brush Script MT", "Segoe Script", cursive',
    group: 'z-internetu',
    hasPolish: false,
    substitute: 'Arial, Helvetica, sans-serif',
  },
];

const POLISH = 'ą ć ę ł ń ó ś ź ż';
/** Próbnik ma pokazać po jednym kroju z każdej grupy — w tym tego z internetu. */
const REQUIRED: Group[] = ['szeryfowy', 'bezszeryfowy', 'ozdobny', 'z-internetu'];

interface Row {
  font: FontChoice;
  /** `null` — jeszcze niesprawdzone; inaczej odpowiedź dziecka. */
  answer: boolean | null;
}

interface SamplerBenchProps {
  color: string;
  onComplete?: () => void;
}

export function SamplerBench({ color, onComplete }: SamplerBenchProps) {
  const [rows, setRows] = useState<Row[]>([]);
  const [note, setNote] = useState<string | null>(null);

  const reported = useRef(false);
  const groupsCovered = REQUIRED.every((g) => rows.some((r) => r.font.group === g));
  const allChecked = rows.length > 0 && rows.every((r) => r.answer !== null);
  const allCorrect = rows.every((r) => r.answer === r.font.hasPolish);
  const done = groupsCovered && allChecked && allCorrect;
  const anchorRef = useSectionScrollAnchor(done ? 'gotowe' : `rzedy-${rows.length}`);

  useEffect(() => {
    if (!done || reported.current) return;
    reported.current = true;
    onComplete?.();
  }, [done, onComplete]);

  const add = (font: FontChoice) => {
    if (rows.some((r) => r.font.id === font.id)) return;
    setRows([...rows, { font, answer: null }]);
    setNote(null);
  };

  const remove = (id: string) => setRows(rows.filter((r) => r.font.id !== id));

  const answer = (id: string, value: boolean) => {
    const row = rows.find((r) => r.font.id === id);
    if (!row) return;
    /* Zła odpowiedź NIE zostaje zapisana — inaczej wiersz zablokowałby blok na
       zawsze, bo nie ma jak odpowiedzieć drugi raz. Zamiast oceny dziecko
       dostaje wskazówkę, gdzie dokładnie popatrzeć, i próbuje jeszcze raz. */
    if (value !== row.font.hasPolish) {
      setNote(
        row.font.hasPolish
          ? `W kroju ${row.font.name} polskie litery wyglądają tak samo jak reszta nazwy — te same kreski, ta sama grubość. Ten krój je ma.`
          : `Przyjrzyj się jeszcze raz krojowi ${row.font.name}: „ą”, „ł” i „ż” są zupełnie inne niż reszta wyrazu. To nie ten sam krój — program podstawił je z innego, bo w tym ich nie ma.`
      );
      return;
    }
    setRows(rows.map((r) => (r.font.id === id ? { ...r, answer: value } : r)));
    setNote(null);
  };

  return (
    <div ref={anchorRef} className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <p className="mb-1 text-sm font-semibold sm:text-base">
        Złóż próbnik krojów: po jednym z każdej grupy.
      </p>
      <p className="mb-4 text-xs text-muted-foreground">
        Nazwa kroju zapisuje się <strong>tym właśnie krojem</strong> — inaczej próbnik niczego nie
        pokazuje. Przy każdym sprawdź polskie litery.
      </p>

      <div className="space-y-3">
        {(Object.keys(GROUP_LABEL) as Group[]).map((group) => {
          const has = rows.some((r) => r.font.group === group);
          return (
            <div key={group}>
              <p className="mb-1.5 flex flex-wrap items-baseline gap-x-2 text-xs font-semibold uppercase tracking-wide">
                <span style={{ color: has ? color : undefined }} className={cn(!has && 'text-muted-foreground')}>
                  {has ? '✓ ' : ''}
                  {GROUP_LABEL[group]}
                </span>
                <span className="font-normal normal-case tracking-normal text-muted-foreground">
                  {GROUP_ABOUT[group]}
                </span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {FONTS.filter((f) => f.group === group).map((font) => {
                  const added = rows.some((r) => r.font.id === font.id);
                  return (
                    <button
                      key={font.id}
                      type="button"
                      onClick={() => add(font)}
                      disabled={added}
                      className="inline-flex items-center gap-1.5 border-2 px-2.5 py-1.5 text-sm transition disabled:opacity-40 hover:bg-black/5 dark:hover:bg-white/5"
                      style={{ borderColor: `${color}33`, fontFamily: font.family }}
                    >
                      {!added && <Plus className="h-3 w-3 shrink-0" aria-hidden />}
                      {font.name}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Sam próbnik — makieta dokumentu, jak kartka w poprzednich blokach. */}
      <div className="mt-5 border bg-white p-4 text-zinc-900 shadow-sm sm:p-5">
        <p className="mb-3 border-b pb-2 font-serif text-lg font-bold">Próbki krojów czcionki</p>
        {rows.length === 0 ? (
          <p className="py-6 text-center text-sm italic text-zinc-500">
            Pusto. Dodaj pierwszy krój przyciskiem powyżej.
          </p>
        ) : (
          <ul className="space-y-3">
            {rows.map((row) => (
              <li key={row.font.id} className="border-b pb-3 last:border-b-0 last:pb-0">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-xl" style={{ fontFamily: row.font.family }}>
                    {row.font.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => remove(row.font.id)}
                    aria-label={`Usuń krój ${row.font.name} z próbnika`}
                    className="text-zinc-400 transition-colors hover:text-zinc-700"
                  >
                    <X className="h-4 w-4" aria-hidden />
                  </button>
                </div>

                {row.answer === null ? (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span
                      className="text-xl"
                      style={{ fontFamily: row.font.hasPolish ? row.font.family : row.font.substitute }}
                    >
                      {POLISH}
                    </span>
                    <span className="text-xs text-zinc-500">← czy to ten sam krój co nazwa?</span>
                  </div>
                ) : (
                  <p className="mt-1.5 text-sm text-zinc-600">
                    {row.font.hasPolish ? (
                      <>
                        polskie znaki:{' '}
                        <span className="text-lg" style={{ fontFamily: row.font.family }}>
                          {POLISH}
                        </span>
                      </>
                    ) : (
                      'polskie znaki: brak — trzeba wybrać inny krój'
                    )}
                  </p>
                )}

                {row.answer === null && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => answer(row.font.id, true)}
                      className="border px-2.5 py-1 text-xs"
                      style={{ borderColor: `${color}55` }}
                    >
                      Ten sam krój — są polskie znaki
                    </button>
                    <button
                      type="button"
                      onClick={() => answer(row.font.id, false)}
                      className="border px-2.5 py-1 text-xs"
                      style={{ borderColor: `${color}55` }}
                    >
                      Inny krój — brakuje polskich znaków
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <AnimatePresence mode="wait">
        {done ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3"
            style={{ backgroundColor: `${color}14` }}
          >
            <p className="flex items-start gap-2 text-sm leading-relaxed">
              <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
              <span>
                Próbnik gotowy — i złapałeś/złapałaś krój, w którym polskich liter nie ma.
              </span>
            </p>
            <p className="mt-2 text-sm leading-relaxed">
              Brakujących liter program <strong>nie zostawia pustych</strong>. Po cichu podstawia je
              z innego kroju, więc „ą” i „ł” nagle mają inną grubość i inny kształt niż reszta
              wyrazu. Właśnie dlatego przy każdym nowym kroju — zwłaszcza ściągniętym z internetu —
              trzeba napisać <strong>ą ć ę ł ń ó ś ź ż</strong> i popatrzeć.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Drugi wniosek, który przyda się przy każdym dokumencie: krój wybiera się do zadania,
              nie dla ozdoby. Szeryfowy do długiego czytania, bezszeryfowy na ekran i na plakat,
              ozdobny wyłącznie do tytułu — i nigdy do całej strony.
            </p>
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
        ) : rows.length > 0 && !groupsCovered ? (
          <motion.p
            key="brakuje"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 text-sm text-muted-foreground"
          >
            Brakuje jeszcze kroju z grupy:{' '}
            {REQUIRED.filter((g) => !rows.some((r) => r.font.group === g))
              .map((g) => GROUP_LABEL[g].toLowerCase())
              .join(', ')}
            .
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
