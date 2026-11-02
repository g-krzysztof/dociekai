'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Eye, Play, Volume2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { SlideContentView, SlideStage, words } from './slide-view';

/**
 * Blok 1 — **eksperyment na dziecku, nie opowieść o widzach.**
 *
 * Cała lekcja stoi na jednym zdaniu: *widz ma jedną parę oczu i jedną parę
 * uszu, więc kiedy czyta twój slajd, nie słucha ciebie*. Tego nie da się
 * przekazać akapitem — dziecko musi to na sobie zmierzyć, a pomiar musi być
 * uczciwy.
 *
 * Stąd dwie rundy zbudowane tak samo i różniące się **jedną rzeczą**: gęstością
 * slajdu. W obu slajd jest widoczny dokładnie 6 sekund, w obu prelegent mówi w
 * tym czasie jedno zdanie (słowo po słowie, w tempie mowy), w obu padają potem
 * dwa pytania: jedno o liczbę ze slajdu, jedno o rzecz, która **padła tylko z
 * ust prelegenta**. Przy ścianie tekstu dziecko poluje na liczbę i mowa
 * przelatuje mu koło uszu; przy trzech punktach zdąża jedno i drugie.
 *
 * Dwie decyzje, bez których pomiar byłby oszustwem:
 *
 * - **Rundy mówią o różnych zwierzętach.** Te same fakty w drugiej rundzie
 *   dziecko pamiętałoby z pierwszej i zmierzylibyśmy pamięć, nie uwagę.
 * - **Nie oceniamy odpowiedzi, tylko je liczymy.** Blok zalicza się po
 *   przeprowadzeniu obu rund, a nie po trafieniu — inaczej dziecko uczyłoby się
 *   zgadywać zamiast patrzeć. Drugie spojrzenie jest dozwolone i jawnie
 *   zapisane w tabeli wyniku („replay zamiast blokady”).
 */

const SHOW_MS = 6000;

interface Round {
  id: string;
  label: string;
  slide: { title: string; lines: string[]; paragraph?: boolean; picture?: 'jez' | 'wiewiorka' };
  /** Zdanie prelegenta — mówione w trakcie pokazu, nigdzie nie zapisane. */
  speech: string;
  seen: { question: string; hint: string; check: (value: string) => boolean; answer: string };
  heard: { question: string; hint: string; check: (value: string) => boolean; answer: string };
}

/** Bez ogonków i małymi literami — dziecko pisze „slimaki” równie często jak „ślimaki”. */
function plain(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ł/g, 'l');
}

function hasRoot(value: string, ...roots: string[]): boolean {
  const text = plain(value);
  return roots.some((root) => text.includes(root));
}

/** Liczba wyjęta z odpowiedzi: „ok. 7 000”, „7000 kolców” i „7000” to jedno i to samo. */
function numberIn(value: string): number | null {
  const digits = value.replace(/[\s.]/g, '').match(/\d+/);
  return digits ? Number(digits[0]) : null;
}

const ROUNDS: Round[] = [
  {
    id: 'gesty',
    label: 'Runda 1',
    slide: {
      title: 'Jeż w naszym ogrodzie',
      paragraph: true,
      lines: [
        'Jeż europejski jest zwierzęciem nocnym i przez całe lato chodzi po ogrodach w poszukiwaniu jedzenia.',
        'Na grzbiecie ma około 7000 kolców, które wymienia przez całe życie.',
        'Najchętniej zjada ślimaki, dżdżownice i owady, dlatego ogrodnicy bardzo się z niego cieszą.',
        'Jesienią musi przytyć, bo od listopada do marca zapada w sen zimowy i wtedy nic nie je.',
      ],
    },
    speech: 'Taki dorosły jeż waży mniej więcej tyle co dwie tabliczki czekolady.',
    seen: {
      question: 'Ile kolców ma jeż?',
      hint: 'liczba ze slajdu',
      answer: '7000',
      check: (value) => numberIn(value) === 7000,
    },
    heard: {
      question: 'Do czego prelegent porównał wagę jeża?',
      hint: 'jedno słowo — to padło tylko na głos',
      answer: 'do dwóch tabliczek czekolady',
      check: (value) => hasRoot(value, 'czekolad', 'tabliczk'),
    },
  },
  {
    id: 'rzadki',
    label: 'Runda 2',
    slide: {
      title: 'Wiewiórka na zimę',
      picture: 'wiewiorka',
      lines: ['1000 skrytek z jedzeniem', 'Chowa orzechy i nasiona', 'Zimą nie śpi — odkopuje zapasy'],
    },
    speech: 'Wiewiórka nie pamięta wszystkich skrytek, więc z tych zapomnianych wyrastają nowe drzewa.',
    seen: {
      question: 'Ile skrytek z jedzeniem robi wiewiórka?',
      hint: 'liczba ze slajdu',
      answer: '1000',
      check: (value) => numberIn(value) === 1000,
    },
    heard: {
      question: 'Co wyrasta z zapomnianych skrytek?',
      hint: 'jedno słowo — to padło tylko na głos',
      answer: 'nowe drzewa',
      check: (value) => hasRoot(value, 'drzew', 'las'),
    },
  },
];

/** Wyrazy widoczne na slajdzie — razem z tytułem, bo widz czyta i jego. */
function slideWords(round: Round): number {
  return words(round.slide.title) + words(round.slide.lines.join(' '));
}

type Stage = 'before' | 'showing' | 'asking' | 'done';

interface RoundResult {
  seen: boolean;
  heard: boolean;
  replays: number;
}

export function FlashSlide({ color, onComplete }: { color: string; onComplete?: () => void }) {
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<RoundResult[]>([]);
  const anchor = useSectionScrollAnchor(index);

  const finish = (result: RoundResult) => {
    const next = [...results, result];
    setResults(next);
    if (next.length === ROUNDS.length) onComplete?.();
    else setIndex((value) => value + 1);
  };

  const finished = results.length === ROUNDS.length;

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <p className="text-sm leading-relaxed sm:text-base">
        Zaraz zobaczysz slajd — <strong>przez 6 sekund</strong>, tyle co w prawdziwej sali, zanim prelegent przejdzie
        dalej. W tym samym czasie prelegent <strong>mówi</strong>. Potem slajd znika i zadam dwa pytania: jedno o to, co
        było <em>napisane</em>, drugie o to, co zostało <em>powiedziane</em>.
      </p>

      <div ref={anchor} className="mt-5 space-y-5">
        {ROUNDS.slice(0, results.length + 1).map((round, position) => (
          <RoundView
            key={round.id}
            round={round}
            color={color}
            active={position === index}
            result={results[position]}
            onFinish={finish}
          />
        ))}
      </div>

      {finished && <Summary results={results} color={color} />}
    </div>
  );
}

function RoundView({
  round,
  color,
  active,
  result,
  onFinish,
}: {
  round: Round;
  color: string;
  active: boolean;
  result?: RoundResult;
  onFinish: (result: RoundResult) => void;
}) {
  const [stage, setStage] = useState<Stage>(result ? 'done' : 'before');
  const [spoken, setSpoken] = useState(0);
  const [replays, setReplays] = useState(0);
  const [seen, setSeen] = useState('');
  const [heard, setHeard] = useState('');
  const timers = useRef<number[]>([]);

  const speech = round.speech.split(' ');
  const total = slideWords(round);

  const stop = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }, []);

  useEffect(() => stop, [stop]);

  const play = () => {
    stop();
    setSpoken(0);
    setStage('showing');
    /* Mowa idzie w tempie ~2,5 słowa na sekundę i kończy się razem ze slajdem. */
    const step = SHOW_MS / (speech.length + 1);
    speech.forEach((_, position) => {
      timers.current.push(window.setTimeout(() => setSpoken(position + 1), step * (position + 1)));
    });
    timers.current.push(window.setTimeout(() => setStage('asking'), SHOW_MS));
  };

  const again = () => {
    setReplays((value) => value + 1);
    play();
  };

  const submit = () => {
    setStage('done');
    onFinish({ seen: round.seen.check(seen), heard: round.heard.check(heard), replays });
  };

  const showing = stage === 'showing';
  const answered = stage === 'done' && result;

  return (
    <div className={cn('border p-4 transition-opacity', !active && !answered && 'opacity-40')}>
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color }}>
          {round.label} · slajd {round.slide.paragraph ? 'gęsty' : 'rzadki'}
        </p>
        <p className="text-xs tabular-nums text-muted-foreground">{total} wyrazów na slajdzie</p>
      </div>

      <SlideStage dim={stage === 'before' || stage === 'asking'} maxWidth={560}>
        <SlideContentView {...round.slide} accent={color} />
      </SlideStage>

      {/* Pasek mowy stoi TUŻ POD slajdem, bo to są te dwie rzeczy naraz, o których jest cała lekcja. */}
      <div
        className="mx-auto mt-2 flex min-h-[3.25rem] w-full max-w-[560px] items-start gap-2 border-l-2 bg-muted/40 p-2.5"
        style={{ borderColor: color }}
      >
        <Volume2 className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
        <p className="text-sm leading-relaxed">
          {stage === 'before' ? (
            <span className="text-muted-foreground">Tutaj usłyszysz, co mówi prelegent.</span>
          ) : (
            speech.slice(0, stage === 'showing' ? spoken : speech.length).join(' ') || '…'
          )}
        </p>
      </div>

      {stage === 'before' && (
        <button
          type="button"
          onClick={play}
          className="mx-auto mt-3 flex cursor-pointer items-center gap-2 border px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted"
          style={{ borderColor: color, color }}
        >
          <Play className="h-4 w-4" aria-hidden />
          Pokaż slajd
        </button>
      )}

      {showing && (
        <div className="mx-auto mt-3 h-1 w-full max-w-[560px] bg-muted">
          <motion.div
            className="h-full"
            style={{ backgroundColor: color }}
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: SHOW_MS / 1000, ease: 'linear' }}
          />
        </div>
      )}

      {stage === 'asking' && (
        <div className="mt-4 space-y-3">
          <Field
            label={round.seen.question}
            hint={round.seen.hint}
            value={seen}
            onChange={setSeen}
            color={color}
          />
          <Field
            label={round.heard.question}
            hint={round.heard.hint}
            value={heard}
            onChange={setHeard}
            color={color}
          />
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={submit}
              disabled={!seen.trim() && !heard.trim()}
              className="cursor-pointer border px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
              style={{ borderColor: color, color }}
            >
              Sprawdź
            </button>
            <button
              type="button"
              onClick={again}
              className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground underline underline-offset-4 transition-colors hover:text-primary"
            >
              <Eye className="h-3 w-3" aria-hidden />
              Nie zdążyłem/zdążyłam — pokaż jeszcze raz
            </button>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Nie zgaduj. Pusta odpowiedź to też wynik — mierzymy, ile się dało wyłapać, a nie ile wiesz o jeżach.
          </p>
        </div>
      )}

      {answered && (
        <div className="mt-4 space-y-2">
          <Verdict ok={result!.seen} color={color} question={round.seen.question} answer={round.seen.answer} what="ze slajdu" />
          <Verdict ok={result!.heard} color={color} question={round.heard.question} answer={round.heard.answer} what="z mowy" />
          {result!.replays > 0 && (
            <p className="text-xs text-muted-foreground">
              Drugie spojrzenie: {result!.replays}× — zapisuję to uczciwie, bo w prawdziwej sali slajd nie wraca.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  hint,
  value,
  onChange,
  color,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
  color: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <span className="ml-2 text-xs text-muted-foreground">{hint}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full border bg-transparent px-3 py-2 text-sm outline-none focus:border-current"
        style={{ caretColor: color }}
        placeholder="wpisz, co pamiętasz"
      />
    </label>
  );
}

function Verdict({
  ok,
  color,
  question,
  answer,
  what,
}: {
  ok: boolean;
  color: string;
  question: string;
  answer: string;
  what: string;
}) {
  return (
    <p className="flex items-start gap-2 text-sm leading-snug">
      <span
        className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center text-white"
        style={{ backgroundColor: ok ? color : '#a1a1aa' }}
        aria-hidden
      >
        {ok ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
      </span>
      <span>
        {question} <span className="text-muted-foreground">({what})</span> — {ok ? 'złapane' : 'przeleciało'}:{' '}
        <strong>{answer}</strong>
      </span>
    </p>
  );
}

function Summary({ results, color }: { results: RoundResult[]; color: string }) {
  const dense = results[0];
  const sparse = results[1];
  const both = (result: RoundResult) => Number(result.seen) + Number(result.heard);

  return (
    <div className="mt-5 p-4" style={{ backgroundColor: `${color}12` }}>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide" style={{ color }}>
            <th className="pb-2 font-semibold">6 sekund na slajd</th>
            <th className="pb-2 font-semibold">ze slajdu</th>
            <th className="pb-2 font-semibold">z mowy</th>
          </tr>
        </thead>
        <tbody className="align-top">
          {ROUNDS.map((round, position) => ({
            label: `slajd ${round.slide.paragraph ? 'gęsty' : 'rzadki'} (${slideWords(round)} wyrazów)`,
            result: results[position],
          })).map((row) => (
            <tr key={row.label} className="border-t">
              <td className="py-2 pr-3">{row.label}</td>
              <td className="py-2 pr-3">{row.result.seen ? 'złapane' : 'przeleciało'}</td>
              <td className="py-2">{row.result.heard ? 'złapane' : 'przeleciało'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mt-3 text-sm leading-relaxed">
        {both(sparse) > both(dense) ? (
          <>
            Przy gęstym slajdzie wyłapałeś/wyłapałaś <strong>{both(dense)} z 2</strong>, przy rzadkim{' '}
            <strong>{both(sparse)} z 2</strong>. Nie stałeś/stałaś się przez te dwie minuty mądrzejszy/mądrzejsza —{' '}
            <strong>drugi slajd po prostu zostawił ci czas na słuchanie</strong>.
          </>
        ) : (
          <>
            U ciebie wyszło <strong>{both(dense)} : {both(sparse)}</strong> — jeden pomiar potrafi wyjść byle jak i tak
            też bywa. Popatrz jednak na same slajdy: z pierwszego{' '}
            <strong>nie dało się przeczytać {slideWords(ROUNDS[0])} wyrazów w 6 sekund</strong>, więc każdą sekundę, którą widz zużywa na
            czytanie, zabierasz swojemu własnemu głosowi.
          </>
        )}
      </p>
      <p className="mt-2 text-sm leading-relaxed">
        Widz ma jedną parę oczu i jedną parę uszu. <strong>Kiedy czyta twój slajd, nie słucha ciebie.</strong> Reszta tej
        lekcji jest o tym, co z tego wynika.
      </p>
    </div>
  );
}
