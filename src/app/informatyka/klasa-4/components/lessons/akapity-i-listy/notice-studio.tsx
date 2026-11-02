'use client';

import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Timer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { count } from '../../../lib/plural';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { TaskShell } from '../../task-shell';
import { MiniWriter } from '../../mini-writer/mini-writer';
import { blocksFromText, toDoc, type WriterBlock } from '../../mini-writer/model';
import {
  FACT_QUESTION,
  NOTICE_CRITERIA,
  analyseNotice,
  judgeNoticeContent,
  splitSentences,
  type NoticeAnalysis,
} from './notice';

/**
 * Zadanie praktyczne lekcji o akapitach i listach — w całości w lekcji: dziecko
 * pisze ogłoszenie w `MiniWriter` (akapity, wyrównanie, lista z przycisku,
 * konkrety), a werdykt czyta ten sam `DocContent`, który czytał z plików.
 *
 * Dokument zaczyna się pusty — ogłoszenie ma być o czymś, co naprawdę dzieje
 * się u dziecka, więc żaden gotowiec by tu nie pasował. Nagrodą jest **stoper
 * z pierwszego bloku lekcji, puszczony na jego własnym ogłoszeniu**: raz zlanym
 * w jedną bryłę, raz w układzie, który samo mu nadało.
 */

const CRITERIA = NOTICE_CRITERIA.filter((item) => item.id !== 'dokument');

interface NoticeStudioProps {
  color: string;
  onComplete?: () => void;
}

export function NoticeStudio({ color, onComplete }: NoticeStudioProps) {
  const [blocks, setBlocks] = useState<WriterBlock[]>(() => blocksFromText(''));
  /* Migawka ogłoszenia z chwili sprawdzenia: stoper pyta o to, co przeszło werdykt. */
  const [checked, setChecked] = useState<{ analysis: NoticeAnalysis; attempt: number } | null>(
    null
  );

  const judge = () => {
    const analysis = analyseNotice(toDoc(blocks));
    setChecked((previous) => ({ analysis, attempt: (previous?.attempt ?? 0) + 1 }));
    return { verdicts: judgeNoticeContent(analysis), data: analysis };
  };

  const reset = () => {
    setBlocks(blocksFromText(''));
    setChecked(null);
  };

  return (
    <TaskShell<NoticeAnalysis>
      color={color}
      brief={
        <>
          <p>
            <strong>Napisz niżej ogłoszenie</strong> o czymś, co naprawdę się u was dzieje —
            wycieczce, zbiórce, turnieju, urodzinach. Rozłóż je tak, żeby dało się je objąć
            wzrokiem: <strong>akapity</strong>, <strong>wyrównanie</strong> i{' '}
            <strong>jedna lista</strong> zrobiona przyciskiem listy.
          </p>
          <p className="mt-3">
            Napisz w nim konkrety — godzinę, datę, kwotę, termin. Kiedy sprawdzisz pracę,{' '}
            <strong>puszczę na twoim ogłoszeniu ten sam stoper</strong>, którym mierzyłeś/mierzyłaś
            szukanie na początku lekcji: raz w ścianie tekstu, raz w twoim układzie.
          </p>
        </>
      }
      goal={<GoalPreview color={color} />}
      criteria={CRITERIA}
      workshop={
        <div>
          <p className="mb-2 text-sm leading-relaxed">
            Pierwszy wiersz to tytuł — kliknij go i <strong>wyśrodkuj</strong>. Uwaga: nowy
            akapit pamięta wyrównanie poprzedniego, więc po tytule wróć do wyrównania{' '}
            <strong>do lewej</strong> — tak samo robi Word. Listę zrób{' '}
            <strong>przyciskami z kropkami albo z numerami</strong>, nie myślnikami z klawiatury:
            prawdziwa lista sama się wyrówna i nie rozjedzie się przy zmianie kroju. Akapity
            rozdzielaj <strong>jednym Enterem</strong> — podwójne policzę i wypiszę.
          </p>
          <MiniWriter
            color={color}
            blocks={blocks}
            onChange={setBlocks}
            tools={['undo', 'align', 'list']}
            label="Twoje ogłoszenie"
          />
        </div>
      }
      judge={judge}
      renderReport={(analysis) => (
        <NoticeReportView
          key={checked?.attempt ?? 0}
          report={analysis}
          color={color}
        />
      )}
      acceptedText={
        <>
          Twoje ogłoszenie ma kształt, w którym da się coś <strong>znaleźć</strong>, a nie tylko
          przeczytać. Stoper pod spodem mierzy to na twoim własnym tekście — i to jest jedyny dowód
          w tej sprawie, jaki cokolwiek znaczy.
        </>
      }
      onReset={reset}
      onComplete={onComplete}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Podgląd celu                                                        */
/* ------------------------------------------------------------------ */

function GoalPreview({ color }: { color: string }) {
  return (
    <div className="grid gap-3 border bg-muted/20 p-3 sm:grid-cols-[minmax(0,240px)_minmax(0,1fr)] sm:items-center">
      <div className="space-y-2 border bg-white p-3 dark:bg-zinc-900/60" aria-hidden>
        <div className="mx-auto h-2 w-3/5 rounded-full" style={{ backgroundColor: color }} />
        <div className="space-y-1 pt-1">
          <div className="h-1.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-1.5 w-11/12 rounded-full bg-zinc-200 dark:bg-zinc-700" />
        </div>
        <div className="space-y-1 pt-1">
          <div className="h-1.5 w-full rounded-full bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-1.5 w-4/5 rounded-full bg-zinc-200 dark:bg-zinc-700" />
        </div>
        <ul className="space-y-1 pt-1 pl-3">
          {[3, 4, 3].map((width, index) => (
            <li key={index} className="flex items-center gap-1.5">
              <span
                className="h-1 w-1 shrink-0 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span
                className="h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700"
                style={{ width: `${width * 18}%` }}
              />
            </li>
          ))}
        </ul>
        <div className="flex justify-end pt-1">
          <div className="h-1.5 w-1/3 rounded-full bg-zinc-200 dark:bg-zinc-700" />
        </div>
      </div>
      <div className="text-sm leading-relaxed">
        <p className="font-semibold" style={{ color }}>
          Tak ma wyglądać twoje ogłoszenie.
        </p>
        <p className="mt-2 text-muted-foreground">
          Tytuł na środku, treść w akapitach do lewej, lista tam, gdzie wyliczasz rzeczy, data albo
          podpis przy prawej krawędzi.{' '}
          <strong className="text-foreground">Kształt, nie treść</strong> — twoje ogłoszenie będzie
          o czymś innym.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Raport: stoper na własnym ogłoszeniu                                */
/* ------------------------------------------------------------------ */

interface Atom {
  text: string;
  /** Numer wiersza z dokumentu — po nim składamy widok „twój układ”. */
  line: number;
}

/**
 * Zdania z ogłoszenia dziecka. W obu rundach klika się w zdanie, nie w akapit —
 * i dzielimy je **tą samą funkcją, co werdykt**, żeby cel pytania na pewno
 * pokrywał się z klikalnym kawałkiem tekstu.
 */
function toAtoms(lines: NoticeAnalysis['lines']): Atom[] {
  const atoms: Atom[] = [];
  lines.forEach((line, index) => {
    for (const text of splitSentences(line.text)) atoms.push({ text, line: index });
  });
  return atoms;
}

type Phase = 'sciana' | 'uklad' | 'koniec';

function NoticeReportView({ report, color }: { report: NoticeAnalysis; color: string }) {
  const atoms = useMemo(() => toAtoms(report.lines), [report]);
  const [phase, setPhase] = useState<Phase>('sciana');
  const [wallTime, setWallTime] = useState(0);
  const [layoutTime, setLayoutTime] = useState(0);
  const [miss, setMiss] = useState(false);
  const startedAt = useRef(Date.now());
  const anchorRef = useSectionScrollAnchor(phase);

  const rounds = report.facts.slice(0, 2);
  const fact = phase === 'sciana' ? rounds[0] : rounds[1];
  /* Cel to zdanie, w którym stoi szukana informacja — nie cały akapit. */
  const target = fact
    ? atoms.findIndex((atom) => atom.line === fact.at && atom.text.includes(fact.value))
    : -1;

  useEffect(() => {
    startedAt.current = Date.now();
    setMiss(false);
  }, [phase]);

  if (rounds.length < 2)
    return (
      <div className="border bg-muted/20 p-4">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide" style={{ color }}>
          <Timer className="h-3.5 w-3.5 shrink-0" aria-hidden />
          Stoper czeka
        </p>
        <p className="mt-2 text-sm leading-relaxed">
          Zmierzę ci szukanie na twoim własnym ogłoszeniu — ale najpierw musi być o co zapytać.
          Dopisz godzinę, datę albo kwotę i sprawdź jeszcze raz.
        </p>
      </div>
    );

  const pick = (index: number) => {
    if (phase === 'koniec') return;
    if (index !== target) {
      setMiss(true);
      return;
    }
    const elapsed = (Date.now() - startedAt.current) / 1000;
    setMiss(false);
    if (phase === 'sciana') {
      setWallTime(elapsed);
      setPhase('uklad');
    } else {
      setLayoutTime(elapsed);
      setPhase('koniec');
    }
  };

  return (
    <div ref={anchorRef} className="border bg-muted/20 p-4">
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide" style={{ color }}>
        <Timer className="h-3.5 w-3.5 shrink-0" aria-hidden />
        Stoper na twoim ogłoszeniu
      </p>
      <p className="mt-1 text-sm">
        <strong>„{report.lines[0]?.text.slice(0, 60) ?? 'twoje ogłoszenie'}”</strong> ·{' '}
        {count(report.bodyParagraphs, 'akapit', 'akapity', 'akapitów')} ·{' '}
        {count(report.realList, 'pozycja listy', 'pozycje listy', 'pozycji listy')}
      </p>

      {phase !== 'koniec' && (
        <div
          className="mt-3 border-l-2 bg-white p-3 dark:bg-zinc-900/60"
          style={{ borderColor: color }}
        >
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {phase === 'sciana'
              ? 'Runda 1 — twoje ogłoszenie zlane w jedną bryłę'
              : 'Runda 2 — twoje ogłoszenie w twoim układzie'}
          </p>
          <p className="mt-1 text-sm font-semibold">
            {FACT_QUESTION[fact.kind]}{' '}
            <span className="font-normal text-muted-foreground">
              Kliknij zdanie, w którym to stoi.
            </span>
          </p>
          {miss && (
            <p className="mt-1 text-xs font-medium text-amber-700 dark:text-amber-400">
              Nie w tym zdaniu — stoper dalej chodzi, szukaj dalej.
            </p>
          )}
        </div>
      )}

      <div className="mt-3">
        {phase === 'sciana' ? (
          <WallView atoms={atoms} onPick={pick} />
        ) : (
          <LayoutView report={report} atoms={atoms} color={color} onPick={phase === 'uklad' ? pick : undefined} />
        )}
      </div>

      <AnimatePresence>
        {phase === 'koniec' && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 grid gap-3 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center"
          >
            <div className="flex gap-3">
              <Score label="w bryle" value={wallTime} />
              <Score label="w twoim układzie" value={layoutTime} color={color} />
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              {layoutTime < wallTime
                ? `Twój układ oszczędził ci ${(wallTime - layoutTime).toFixed(1)} s na jednej informacji. `
                : 'Tym razem druga runda nie wyszła szybciej — i to się zdarza, bo pytania nie są jednakowo trudne. '}
              <strong className="text-foreground">
                Uczciwie: druga runda była łatwiejsza także dlatego, że tekst był już trochę
                znajomy.
              </strong>{' '}
              Dlatego liczy się nie sam wynik, tylko to, że w ogóle da się to zmierzyć — a „pisz
              przejrzyście” zmierzyć się nie da.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Score({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div className="border bg-white px-3 py-2 text-center dark:bg-zinc-900/60">
      <span
        className="block font-mono text-xl font-black tabular-nums"
        style={{ color: color ?? 'var(--muted-foreground)' }}
      >
        {value.toFixed(1)} s
      </span>
      <span className="text-[11px] text-muted-foreground">{label}</span>
    </div>
  );
}

/**
 * Zdanie do kliknięcia. **Nie `<button>`** — przeglądarka nigdy nie łamie
 * wiersza w środku przycisku, więc każde zdanie zajmowałoby własną linijkę i
 * „ściana tekstu” wyglądałaby jak lista, czyli dokładnie odwrotnie, niż o to w
 * tej rundzie chodzi. Zwykły `span` łamie się jak tekst, a rolę i obsługę
 * klawiatury dokładamy ręcznie.
 *
 * Odstęp po zdaniu stoi **poza** tym elementem — spacja na końcu elementu
 * klikalnego potrafi zniknąć przy zawijaniu.
 */
function Sentence({ onPick, children }: { onPick: () => void; children: string }) {
  return (
    <span
      role="button"
      tabIndex={0}
      onClick={onPick}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onPick();
        }
      }}
      className="cursor-pointer transition-colors hover:bg-muted/60 focus-visible:bg-muted/60"
    >
      {children}
    </span>
  );
}

/** Runda 1: to samo ogłoszenie bez akapitów, bez listy i bez wyrównania. */
function WallView({ atoms, onPick }: { atoms: Atom[]; onPick: (index: number) => void }) {
  return (
    <p className="border bg-white p-3 text-sm leading-relaxed dark:bg-zinc-900/60">
      {atoms.map((atom, index) => (
        <Fragment key={index}>
          <Sentence onPick={() => onPick(index)}>{atom.text}</Sentence>{' '}
        </Fragment>
      ))}
    </p>
  );
}

/** Runda 2: ogłoszenie tak, jak je złożyło dziecko — z jego wyrównaniem i jego listą. */
function LayoutView({
  report,
  atoms,
  color,
  onPick,
}: {
  report: NoticeAnalysis;
  atoms: Atom[];
  color: string;
  onPick?: (index: number) => void;
}) {
  /* Numeracja listy liczy się przez cały dokument i zeruje na pierwszym akapicie po liście. */
  let ordinal = 0;
  return (
    <div className="space-y-2 border bg-white p-3 text-sm leading-relaxed dark:bg-zinc-900/60">
      {report.lines.map((line, lineIndex) => {
        const own = atoms
          .map((atom, index) => ({ atom, index }))
          .filter((item) => item.atom.line === lineIndex);
        const content = own.map(({ atom, index }) =>
          onPick ? (
            <Fragment key={index}>
              <Sentence onPick={() => onPick(index)}>{atom.text}</Sentence>{' '}
            </Fragment>
          ) : (
            <span key={index}>{atom.text} </span>
          )
        );
        /* Numer, nie kropka, gdy dziecko wybrało listę numerowaną — akurat tej lekcji
           nie wolno pokazywać cudzej listy w niewłaściwym rodzaju. */
        if (line.ordered) ordinal += 1;
        else if (!line.list) ordinal = 0;

        return (
          <p
            key={lineIndex}
            className={cn(
              lineIndex === 0 && 'font-bold',
              line.list && 'flex gap-2 pl-3',
              line.align === 'center' && 'text-center',
              line.align === 'right' && 'text-right',
              line.align === 'justify' && 'text-justify'
            )}
          >
            {line.list &&
              (line.ordered ? (
                <span
                  className="shrink-0 font-mono text-xs font-bold tabular-nums"
                  style={{ color }}
                  aria-hidden
                >
                  {ordinal}.
                </span>
              ) : (
                <span
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: color }}
                  aria-hidden
                />
              ))}
            <span className="min-w-0">{content}</span>
          </p>
        );
      })}
    </div>
  );
}
