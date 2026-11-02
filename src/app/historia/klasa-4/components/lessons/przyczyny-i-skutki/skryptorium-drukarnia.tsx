'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getCorePin } from '../../../lib/timeline/pins';
import { PrzypnijPinezke } from '../../timeline/przypnij-pinezke';
import {
  BOOK,
  bookMath,
  formatWork,
  judgeSchemaCard,
  schemaCards,
  type Column,
  type Tempo,
} from './drukarnia';
import { fmtSec, KasztaZecera, NextPhaseButton, PioroKopisty, PrasaDrukarska } from './warsztat-ksiazki';

type Phase = 'pioro' | 'kaszta' | 'prasa' | 'wyniki';

/**
 * Blok 2 — **„Skryptorium kontra drukarnia”** (symulator).
 *
 * Trzy gesty nowe w kursie, każdy na czas: przepisanie linijki piórem
 * (`PioroKopisty`), złożenie jej z czcionek (`KasztaZecera`) i dziesięć
 * odbitek na prasie (`PrasaDrukarska`). Z trzech pomiarów dziecka liczy się
 * dzień pracy kopisty i drukarni (`bookMath`), a z liczb — schemat przyczyn
 * i skutków, który dziecko samo układa (karty niosą jego liczby; sędzia
 * pyta „przed drukiem czy po nim?”). Na koniec pinezka „druk” na Osi dziejów.
 */
export function SkryptoriumDrukarnia({
  color,
  lesson,
  done,
  onComplete,
}: {
  color: string;
  lesson: string;
  done: boolean;
  onComplete: () => void;
}) {
  const [phase, setPhase] = useState<Phase>('pioro');
  const [tempo, setTempo] = useState<Partial<Tempo>>({});

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <p className="text-base leading-relaxed">
          Jeszcze niecałe 600 lat temu w Europie <strong>każdą książkę przepisywano ręcznie</strong> — literę po literze,
          gęsim piórem. Sprawdź na sobie, ile to trwa. Stoper ruszy przy pierwszej literze.
        </p>
        <PioroKopisty color={color} onDone={(s) => setTempo((t) => ({ ...t, handLineSec: s }))} />
        {phase === 'pioro' && tempo.handLineSec !== undefined && (
          <NextPhaseButton color={color} onClick={() => setPhase('kaszta')}>
            A teraz — drukarnia
          </NextPhaseButton>
        )}
      </section>

      {phase !== 'pioro' && (
        <section className="space-y-3 border-t pt-5">
          <p className="text-base leading-relaxed">
            W połowie XV wieku w niemieckiej Moguncji <strong>Jan Gutenberg</strong> odlał z metalu osobne litery —{' '}
            <strong>czcionki</strong>. Układa się z nich linijkę, smaruje farbą i odbija na papierze. Złóż tę samą
            linijkę.
          </p>
          <KasztaZecera color={color} onDone={(s) => setTempo((t) => ({ ...t, setLineSec: s }))} />
          {phase === 'kaszta' && tempo.setLineSec !== undefined && (
            <NextPhaseButton color={color} onClick={() => setPhase('prasa')}>
              Do prasy
            </NextPhaseButton>
          )}
        </section>
      )}

      {(phase === 'prasa' || phase === 'wyniki') && (
        <section className="space-y-3 border-t pt-5">
          <p className="text-base leading-relaxed">
            Skład gotowy. Teraz to, czego żaden kopista nie umiał: <strong>ta sama linijka jeszcze raz, i jeszcze raz</strong>.
          </p>
          <PrasaDrukarska color={color} onDone={(s) => setTempo((t) => ({ ...t, pullSec: s }))} />
          {phase === 'prasa' && tempo.pullSec !== undefined && (
            <NextPhaseButton color={color} onClick={() => setPhase('wyniki')}>
              Policz, co to znaczy dla książki
            </NextPhaseButton>
          )}
        </section>
      )}

      {phase === 'wyniki' && tempo.handLineSec && tempo.setLineSec && tempo.pullSec && (
        <Wyniki
          color={color}
          lesson={lesson}
          done={done}
          tempo={tempo as Tempo}
          onComplete={onComplete}
        />
      )}
    </div>
  );
}

function Wyniki({
  color,
  lesson,
  done,
  tempo,
  onComplete,
}: {
  color: string;
  lesson: string;
  done: boolean;
  tempo: Tempo;
  onComplete: () => void;
}) {
  const m = useMemo(() => bookMath(tempo), [tempo]);
  const handPages = Math.max(1, Math.round(m.handPagesPerDay));
  const printPages = Math.round(m.printPagesPerDay);
  const maxPages = Math.max(handPages, printPages);
  const fmtInt = (n: number) => n.toLocaleString('pl-PL');

  return (
    <section className="space-y-5 border-t pt-5">
      <div className="space-y-1 text-sm">
        <p className="font-semibold">Twoje tempo:</p>
        <ul className="grid gap-1 sm:grid-cols-3">
          <li className="border p-2">pióro: <strong>{fmtSec(tempo.handLineSec)}</strong> na linijkę</li>
          <li className="border p-2">czcionki: <strong>{fmtSec(tempo.setLineSec)}</strong> na linijkę</li>
          <li className="border p-2">prasa: <strong>{fmtSec(tempo.pullSec)}</strong> na odbitkę</li>
        </ul>
      </div>

      <div className="space-y-2">
        <p className="text-base leading-relaxed">
          Weźmy książkę, którą drukował sam Gutenberg — <strong>Biblię</strong>. Każda jej strona ma dwie kolumny po 42
          linijki, mniej więcej tak długie jak twoja. Dzień pracy przy świetle to ok. {BOOK.workHours} godzin.{' '}
          <strong>Ile takich stron w ciągu dnia</strong>, w twoim tempie?
        </p>
        {[
          { label: 'kopista z piórem', value: handPages },
          { label: 'drukarz przy prasie', value: printPages },
        ].map((row) => (
          <div key={row.label} className="grid grid-cols-[8.5rem_1fr] items-center gap-2 text-sm sm:grid-cols-[11rem_1fr]">
            <span>{row.label}</span>
            <span className="flex items-center gap-2">
              <motion.span
                initial={{ width: 0 }}
                animate={{ width: `${Math.max(1, (row.value / maxPages) * 100)}%` }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                className="block h-5 min-w-[3px] max-w-[calc(100%-5rem)]"
                style={{ backgroundColor: color }}
              />
              <strong className="whitespace-nowrap tabular-nums">{fmtInt(row.value)}</strong>
            </span>
          </div>
        ))}
      </div>

      <p className="bg-muted/60 p-4 text-base leading-relaxed">
        {tempo.setLineSec > tempo.handLineSec ? (
          <>
            Składanie trwało u ciebie dłużej niż pisanie ({fmtSec(tempo.setLineSec)} kontra {fmtSec(tempo.handLineSec)}).
            Ale <strong>skład robi się raz</strong> — a odbić z niego można sto i tysiąc.{' '}
          </>
        ) : (
          <>
            Skład robi się raz — a odbić z niego można sto i tysiąc.{' '}
          </>
        )}
        Biblia ma {BOOK.pages.toLocaleString('pl-PL')} strony. Kopista w twoim tempie przepisze jeden egzemplarz w{' '}
        <strong>{formatWork(m.handDaysPerBook)}</strong>. Drukarnia złoży wszystkie strony i odbije ok. {BOOK.copies}{' '}
        egzemplarzy — tyle, ile wydrukował Gutenberg — w <strong>{formatWork(m.printDaysAll)}</strong> — wychodzi <strong>{formatWork(m.printDaysPerBook)}</strong>{' '}
        pracy na jedną książkę. A cena książki to przede wszystkim praca, która w nią weszła.
      </p>

      <p className="text-sm leading-relaxed text-muted-foreground">
        Uczciwie: prawdziwy kopista pisał staranniej i wolniej niż ty, a prawdziwe odbicie arkusza trwało dłużej niż
        twoje szarpnięcie dźwignią. Historycy szacują, że jedna prasa w XVI wieku dawała do 3600 stron dziennie, a kopista
        przepisywał ręcznie zaledwie kilka. Druk wygrywał więc nie o trochę, tylko dziesiątki i setki razy — u ciebie wyszło podobnie.
      </p>

      <Schemat color={color} m={m} lesson={lesson} done={done} onComplete={onComplete} />
    </section>
  );
}

function Schemat({
  color,
  m,
  lesson,
  done,
  onComplete,
}: {
  color: string;
  m: ReturnType<typeof bookMath>;
  lesson: string;
  done: boolean;
  onComplete: () => void;
}) {
  const cards = useMemo(() => schemaCards(m), [m]);
  const [placed, setPlaced] = useState<Record<string, Column>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [wrong, setWrong] = useState<{ id: string; why: string } | null>(null);
  const tray = cards.filter((c) => !placed[c.id]);
  const complete = tray.length === 0;

  const drop = (column: Column) => {
    const card = cards.find((c) => c.id === selected);
    if (!card) return;
    const v = judgeSchemaCard(card, column);
    if (v.ok) {
      setPlaced((p) => ({ ...p, [card.id]: column }));
      setSelected(null);
      setWrong(null);
    } else {
      setWrong({ id: card.id, why: v.why });
    }
  };

  const column = (col: Column, title: string, question: string) => (
    <button
      type="button"
      onClick={() => drop(col)}
      disabled={!selected}
      className={cn(
        'flex min-h-[7rem] w-full flex-col gap-2 border-2 p-3 text-left disabled:cursor-default',
        selected ? 'border-dashed' : 'border-solid'
      )}
      style={{ borderColor: selected ? color : undefined }}
      aria-label={selected ? `Połóż wybraną kartę w kolumnie: ${title}` : title}
    >
      <span className="text-xs font-semibold uppercase tracking-wide" style={{ color }}>
        {title} <span className="font-normal normal-case text-muted-foreground">— {question}</span>
      </span>
      {cards
        .filter((c) => placed[c.id] === col)
        .map((c) => (
          <motion.span key={c.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="block bg-muted/70 p-2 text-sm leading-snug">
            {c.text}
          </motion.span>
        ))}
    </button>
  );

  return (
    <div className="space-y-4">
      <p className="text-base leading-relaxed">
        Teraz zbuduj z tych liczb <strong>schemat</strong>. Stuknij kartę, a potem kolumnę. Pytaj każdą kartę: czy tak
        było <em>przed</em> drukiem (to odpowiada na „dlaczego?”), czy dopiero <em>po</em> nim („co z tego wynikło?”)?
      </p>

      {!complete && (
        <div className="grid gap-2 sm:grid-cols-2">
          {tray.map((c) => (
            <motion.button
              key={c.id}
              type="button"
              onClick={() => {
                setSelected((s) => (s === c.id ? null : c.id));
                setWrong(null);
              }}
              animate={wrong?.id === c.id ? { x: [0, -6, 6, -3, 0] } : { x: 0 }}
              transition={{ duration: 0.35 }}
              aria-pressed={selected === c.id}
              className={cn(
                'border-2 bg-white p-3 text-left text-sm leading-snug dark:bg-zinc-900',
                selected === c.id ? 'font-semibold' : 'border-transparent shadow-sm'
              )}
              style={selected === c.id ? { borderColor: color } : undefined}
            >
              {c.text}
            </motion.button>
          ))}
        </div>
      )}

      {wrong && (
        <p className="border-l-2 border-destructive pl-3 text-sm leading-relaxed" aria-live="polite">
          {wrong.why}
        </p>
      )}

      <div className="grid items-stretch gap-2 md:grid-cols-[1fr_auto_minmax(10rem,0.7fr)_auto_1fr]">
        {column('przyczyny', 'Przyczyny', 'dlaczego do tego doszło?')}
        <span className="flex items-center justify-center" aria-hidden>
          <ArrowDown className="h-5 w-5 md:hidden" style={{ color }} />
          <ArrowRight className="hidden h-5 w-5 md:block" style={{ color }} />
        </span>
        <div className="flex flex-col justify-center border-2 p-3 text-center" style={{ borderColor: color, backgroundColor: `${color}14` }}>
          <span className="text-xs font-semibold uppercase tracking-wide" style={{ color }}>
            Wydarzenie
          </span>
          <span className="mt-1 font-semibold leading-snug">Jan Gutenberg drukuje czcionkami</span>
          <span className="text-sm text-muted-foreground">połowa XV wieku</span>
        </div>
        <span className="flex items-center justify-center" aria-hidden>
          <ArrowDown className="h-5 w-5 md:hidden" style={{ color }} />
          <ArrowRight className="hidden h-5 w-5 md:block" style={{ color }} />
        </span>
        {column('skutki', 'Skutki', 'co z tego wynikło?')}
      </div>

      {complete && (
        <div className="space-y-4" aria-live="polite">
          <p className="border-2 p-4 text-base leading-relaxed" style={{ borderColor: color }}>
            <strong>To twój schemat — z twoich liczb.</strong> Przyjrzyj się skutkom: „tańsze książki” to skutek druku, ale
            zarazem <strong>przyczyna</strong> tego, że książki trafiły do szkół. Skutek jednego zdarzenia bywa przyczyną
            następnego.
          </p>
          <p className="text-base leading-relaxed">
            Na koniec przypnij druk na swojej Osi dziejów. Gutenberg drukował w <strong>połowie XV wieku</strong> — jego
            słynną Biblię skończono ok. 1455 roku.
          </p>
          <PrzypnijPinezke pin={getCorePin('druk')} color={color} lesson={lesson} done={done} onPinned={onComplete} />
        </div>
      )}
    </div>
  );
}
