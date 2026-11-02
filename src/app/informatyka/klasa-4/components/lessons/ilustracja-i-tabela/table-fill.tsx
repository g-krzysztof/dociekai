'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDownNarrowWide, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';

/**
 * Ćwiczenie o tabeli — **kolumnę wybiera się z danych, nie z głowy**.
 *
 * Dziecko wie, jak wstawić tabelę (przycisk w menu), ale nie wie, **kiedy** i
 * **jaką**. Ten blok odwraca kolejność: nie „wstaw tabelę 4 na 5”, tylko „oto
 * cztery zdania o tym samym — powiedz, jakie mają wspólne kolumny”. Program
 * wypełnia tabelę sam, wyciągając wartości ze zdań, więc **pusta komórka jest
 * werdyktem**: jeśli po wybraniu kolumny zostaje dziura, znaczy, że takiej
 * informacji w danych po prostu nie ma.
 *
 * Stąd reguła, która wychodzi sama i której nie da się podważyć: **kolumna
 * istnieje wtedy, gdy KAŻDY wiersz ma w niej co wpisać**. Tego samego pytania
 * używa się potem przy każdej prawdziwej tabeli.
 *
 * Na końcu dochodzi sortowanie — jedno kliknięcie, które pokazuje, po co w ogóle
 * przenosić dane ze zdań do tabeli. W ciągu zdań nie da się „posortować po
 * wieku”; w tabeli to jedna czynność.
 */

type FieldId = 'imie' | 'wiek' | 'klasa' | 'instrument' | 'kolor' | 'wzrost';

interface Column {
  id: FieldId;
  label: string;
  /** `false` — takiej informacji nie ma w zdaniach; kolumna wyjdzie pusta. */
  inData: boolean;
}

const COLUMNS: Column[] = [
  { id: 'imie', label: 'Imię', inData: true },
  { id: 'wiek', label: 'Wiek', inData: true },
  { id: 'klasa', label: 'Klasa', inData: true },
  { id: 'instrument', label: 'Instrument', inData: true },
  { id: 'kolor', label: 'Ulubiony kolor', inData: false },
  { id: 'wzrost', label: 'Wzrost', inData: false },
];

interface Row {
  sentence: string;
  values: Partial<Record<FieldId, string>>;
}

const ROWS: Row[] = [
  {
    sentence: 'Ala ma 12 lat, chodzi do klasy 6a i gra na skrzypcach.',
    values: { imie: 'Ala', wiek: '12', klasa: '6a', instrument: 'skrzypce' },
  },
  {
    sentence: 'Bartek ma 11 lat, chodzi do klasy 5b i gra na gitarze.',
    values: { imie: 'Bartek', wiek: '11', klasa: '5b', instrument: 'gitara' },
  },
  {
    sentence: 'Celina ma 12 lat, chodzi do klasy 6b i gra na perkusji.',
    values: { imie: 'Celina', wiek: '12', klasa: '6b', instrument: 'perkusja' },
  },
  {
    sentence: 'Damian ma 10 lat, chodzi do klasy 4a i gra na flecie.',
    values: { imie: 'Damian', wiek: '10', klasa: '4a', instrument: 'flet' },
  },
];

interface TableFillProps {
  color: string;
  onComplete?: () => void;
}

export function TableFill({ color, onComplete }: TableFillProps) {
  const [picked, setPicked] = useState<FieldId[]>([]);
  const [sorted, setSorted] = useState(false);
  const [done, setDone] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  const reported = useRef(false);
  const anchorRef = useSectionScrollAnchor(done ? 'gotowe' : 'praca');

  /* Puste komórki liczymy z danych, nigdy z listy „złych” kolumn. */
  const holes = picked.reduce(
    (sum, id) => sum + ROWS.filter((row) => !row.values[id]).length,
    0
  );
  const good = picked.length >= 3 && picked.includes('imie') && holes === 0;

  useEffect(() => {
    if (!done || reported.current) return;
    reported.current = true;
    onComplete?.();
  }, [done, onComplete]);

  const toggle = (id: FieldId) => {
    if (done) return;
    setNote(null);
    setPicked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const confirm = () => {
    if (good) {
      setDone(true);
      setNote(null);
      return;
    }
    if (holes > 0) {
      const empty = picked.filter((id) => ROWS.some((row) => !row.values[id]));
      setNote(
        `W tabeli zostało ${holes} pustych komórek — wszystkie w kolumnie „${
          COLUMNS.find((c) => c.id === empty[0])?.label
        }”. Tej informacji nie ma w żadnym zdaniu, więc taka kolumna nie ma czym się wypełnić.`
      );
      return;
    }
    if (!picked.includes('imie')) {
      setNote('Bez kolumny „Imię” nie wiadomo, czyj jest który wiersz. Od niej zaczyna się tabela.');
      return;
    }
    setNote('Trzy kolumny to minimum, żeby było co porównywać — dodaj jeszcze jedną.');
  };

  const shown = picked.map((id) => COLUMNS.find((c) => c.id === id) as Column);
  const rows = sorted
    ? [...ROWS].sort((a, b) => Number(a.values.wiek) - Number(b.values.wiek))
    : ROWS;

  return (
    <div ref={anchorRef} className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <p className="mb-1 text-sm font-semibold sm:text-base">
        Cztery zdania o czterech osobach. Ułóż z nich tabelę, w której da się je porównać.
      </p>
      <p className="mb-3 text-xs text-muted-foreground">
        Wybierz kolumny — program wypełni je sam tym, co znajdzie w zdaniach.
      </p>

      <div className="border bg-white p-4 font-serif text-[15px] leading-relaxed text-zinc-900 shadow-sm">
        {ROWS.map((row) => (
          <p key={row.sentence}>{row.sentence}</p>
        ))}
      </div>

      <p className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Kolumny tabeli
      </p>
      <div className="flex flex-wrap gap-1.5">
        {COLUMNS.map((column) => {
          const on = picked.includes(column.id);
          return (
            <button
              key={column.id}
              type="button"
              onClick={() => toggle(column.id)}
              disabled={done}
              aria-pressed={on}
              className={cn(
                'border-2 px-2.5 py-1.5 text-sm transition disabled:opacity-60',
                !on && !done && 'hover:bg-black/5 dark:hover:bg-white/5'
              )}
              style={{
                borderColor: on ? color : `${color}33`,
                backgroundColor: on ? `${color}14` : undefined,
              }}
            >
              {column.label}
            </button>
          );
        })}
      </div>

      {picked.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[360px] border-collapse border bg-white text-sm text-zinc-900 shadow-sm">
            <thead>
              <tr>
                {shown.map((column) => (
                  <th
                    key={column.id}
                    scope="col"
                    className="border px-2.5 py-1.5 text-left font-semibold"
                    style={{ backgroundColor: `${color}18` }}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.sentence}>
                  {shown.map((column) => {
                    const value = row.values[column.id];
                    return (
                      <td
                        key={column.id}
                        className={cn('border px-2.5 py-1.5', !value && 'bg-amber-50')}
                      >
                        {value ?? <span className="text-amber-700">—</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-3">
        {!done ? (
          <button
            type="button"
            onClick={confirm}
            disabled={picked.length === 0}
            className="px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
            style={{ backgroundColor: color }}
          >
            Zatwierdź tabelę
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setSorted(!sorted)}
            className="inline-flex items-center gap-2 border-2 px-3 py-2 text-sm font-medium"
            style={{ borderColor: `${color}55` }}
          >
            <ArrowDownNarrowWide className="h-4 w-4" style={{ color }} aria-hidden />
            {sorted ? 'Przywróć kolejność ze zdań' : 'Posortuj od najmłodszego'}
          </button>
        )}
        {picked.length > 0 && (
          <span className="text-xs tabular-nums text-muted-foreground">
            kolumny: {picked.length} · puste komórki:{' '}
            <strong className={cn(holes > 0 && 'text-amber-700 dark:text-amber-500')}>{holes}</strong>
          </span>
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
                Te same informacje, które przed chwilą były w czterech zdaniach — a teraz da się je{' '}
                <strong>porównać wzrokiem w pionie</strong>. Spróbuj jeszcze posortować.
              </span>
            </p>
            <p className="mt-2 text-sm leading-relaxed">
              Tabela nie jest ozdobą i nie jest dla każdego tekstu. Nadaje się dokładnie wtedy, gdy
              masz <strong>kilka rzeczy i to samo do powiedzenia o każdej z nich</strong>. Wtedy
              nazwy tych „tych samych rzeczy” stają się kolumnami, a każda rzecz — wierszem.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Test na kolumnę jest jeden i przed chwilą go robiłeś/robiłaś:{' '}
              <strong>czy każdy wiersz ma w niej co wpisać?</strong> Jeśli choć jeden zostaje pusty,
              to nie jest kolumna — to informacja, której po prostu nie masz.
            </p>
          </motion.div>
        ) : note ? (
          <motion.p
            key={note}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-3 border-l-2 border-amber-500 bg-amber-50 p-3 text-sm leading-relaxed dark:bg-amber-950/30"
          >
            {note}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
