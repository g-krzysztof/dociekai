'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FileText, Image as ImageIcon, Table2, type LucideIcon } from 'lucide-react';
import { useSectionScrollAnchor } from '../../lesson-shell';

/**
 * Haczyk lekcji: dziecko zgaduje, iloma różnymi programami da się zrobić jeden
 * zwykły plik — dokument, rysunek, tabelę — a potem widzi rozłożony wachlarz
 * prawdziwych nazw. Pointa: do każdego zadania jest kilka programów, nie jeden,
 * a ten wbudowany w komputer to tylko jeden z nich.
 *
 * Trzy rundy, w każdej suwak-zgadywanka i przycisk „Sprawdź". Samo zgadnięcie
 * niczego nie mierzy i nic nie blokuje — chodzi o zaskoczenie liczbą. Blok
 * kończy się po sprawdzeniu trzeciej rundy.
 */

interface Round {
  id: string;
  thing: string;
  icon: LucideIcon;
  /** Prawdziwe programy do tego zadania — pierwszy jest ten „z brzegu". */
  programs: { name: string; tag: string }[];
  note: string;
}

const ROUNDS: Round[] = [
  {
    id: 'tekst',
    thing: 'zwykły dokument tekstowy',
    icon: FileText,
    programs: [
      { name: 'Notatnik', tag: 'wbudowany w Windows' },
      { name: 'Microsoft Word', tag: 'płatny' },
      { name: 'LibreOffice Writer', tag: 'darmowy' },
      { name: 'Dokumenty Google', tag: 'darmowy, w przeglądarce' },
      { name: 'okno nowej wiadomości e-mail', tag: 'też się nada' },
    ],
    note: 'Pięć różnych miejsc, w których napiszesz ten sam tekst. Notatnik masz od razu, ale to najprostszy z nich — bez list, nagłówków i sprawdzania pisowni.',
  },
  {
    id: 'rysunek',
    thing: 'rysunek albo poprawione zdjęcie',
    icon: ImageIcon,
    programs: [
      { name: 'Paint', tag: 'wbudowany w Windows' },
      { name: 'GIMP', tag: 'darmowy, open source' },
      { name: 'Krita', tag: 'darmowy, open source' },
      { name: 'Photopea', tag: 'darmowy, w przeglądarce' },
      { name: 'Adobe Photoshop', tag: 'płatny' },
    ],
    note: 'Paint wystarczy do prostego rysunku. Do poprawiania zdjęć i warstw sięga się po GIMP-a, Kritę albo Photopeę — wszystkie za darmo.',
  },
  {
    id: 'tabela',
    thing: 'tabela z liczbami, która sama się przelicza',
    icon: Table2,
    programs: [
      { name: 'Microsoft Excel', tag: 'płatny' },
      { name: 'LibreOffice Calc', tag: 'darmowy' },
      { name: 'Arkusze Google', tag: 'darmowy, w przeglądarce' },
      { name: 'Numbers', tag: 'na komputerach Apple' },
    ],
    note: 'Taki program nazywa się arkuszem kalkulacyjnym. Excel jest najbardziej znany, ale robi dokładnie to samo, co darmowy Calc czy Arkusze Google.',
  },
];

interface ProgramFanProps {
  color: string;
  onComplete?: () => void;
}

export function ProgramFan({ color, onComplete }: ProgramFanProps) {
  const [index, setIndex] = useState(0);
  const [guess, setGuess] = useState(1);
  const [checked, setChecked] = useState(false);
  const containerRef = useSectionScrollAnchor(`${index}-${checked}`);

  const round = ROUNDS[index];
  const isLast = index === ROUNDS.length - 1;
  const actual = round.programs.length;

  const check = () => {
    if (checked) return;
    setChecked(true);
    if (isLast) onComplete?.();
  };

  const next = () => {
    setIndex((i) => Math.min(i + 1, ROUNDS.length - 1));
    setGuess(1);
    setChecked(false);
  };

  const Icon = round.icon;

  return (
    <div ref={containerRef} className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <p className="font-mono text-xs font-bold tracking-wide" style={{ color }}>
          RUNDA {index + 1} Z {ROUNDS.length}
        </p>
      </div>

      <p className="mb-5 flex items-start gap-2 text-sm leading-relaxed sm:text-base">
        <Icon className="mt-0.5 h-5 w-5 shrink-0" style={{ color }} aria-hidden />
        <span>
          Chcesz zrobić <strong>{round.thing}</strong>. Ile <strong>różnych programów</strong> się
          do tego nada? Ustaw suwak i sprawdź.
        </span>
      </p>

      <div className="mb-2 flex items-baseline justify-between">
        <label htmlFor={`fan-${round.id}`} className="text-sm font-semibold">
          Twoja odpowiedź
        </label>
        <span className="font-mono text-2xl font-bold tabular-nums" style={{ color }}>
          {guess}
        </span>
      </div>
      <input
        id={`fan-${round.id}`}
        type="range"
        min={1}
        max={8}
        step={1}
        value={guess}
        onChange={(event) => setGuess(Number(event.target.value))}
        disabled={checked}
        className="h-6 w-full cursor-pointer"
        style={{ accentColor: color }}
      />
      <div className="mt-1 flex justify-between text-xs text-muted-foreground">
        <span>1</span>
        <span>8 i więcej</span>
      </div>

      {!checked && (
        <button
          type="button"
          onClick={check}
          className="mt-4 inline-flex cursor-pointer items-center gap-2 border-2 px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted/50"
          style={{ borderColor: color, color }}
        >
          Sprawdź
        </button>
      )}

      <AnimatePresence>
        {checked && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 border-t-2 pt-4"
            style={{ borderColor: color }}
          >
            <p className="mb-3 text-sm leading-relaxed">
              Co najmniej <strong style={{ color }}>{actual}</strong>
              {guess === actual
                ? ' — trafione co do jednego.'
                : guess < actual
                  ? ` — więcej, niż zgadłeś/zgadłaś (${guess}).`
                  : ` — mniej, niż zgadłeś/zgadłaś (${guess}), ale i tak nie jeden.`}
            </p>

            <ul className="flex flex-wrap gap-2">
              {round.programs.map((program) => (
                <li
                  key={program.name}
                  className="inline-flex flex-col border px-3 py-1.5"
                  style={{ borderColor: `${color}55` }}
                >
                  <span className="text-sm font-semibold leading-snug">{program.name}</span>
                  <span className="text-xs text-muted-foreground">{program.tag}</span>
                </li>
              ))}
            </ul>

            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{round.note}</p>

            {!isLast ? (
              <button
                type="button"
                onClick={next}
                className="mt-4 cursor-pointer border-t-2 px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted/40"
                style={{ borderColor: color, color }}
              >
                Następna runda
              </button>
            ) : (
              <p className="mt-4 border-t-2 pt-4 text-sm leading-relaxed" style={{ borderColor: color }}>
                <strong>Do każdego zadania jest kilka programów, nie jeden.</strong> Ten, który już
                masz na komputerze, to zwykle najprostszy z brzegu — dobry na początek, ale nie
                jedyny i nie zawsze najlepszy. W następnym bloku poukładasz programy według tego, do
                czego naprawdę służą.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
