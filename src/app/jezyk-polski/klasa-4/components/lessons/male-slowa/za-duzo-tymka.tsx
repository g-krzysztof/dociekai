'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { plural } from '@/lib/plural';
import { DragGhost, useDragToken } from '../../lesson-shell';
import { Twarz } from '../../twarz/twarz';
import {
  jasnosc,
  NAJWIECEJ_IMION,
  ocen,
  odklej,
  OPOWIADANIE,
  przyklej,
  pytanie,
  WYSTAPIENIA,
  type Jasnosc,
  type StanZaimkow,
} from './zaimki';

/**
 * L17 blok 2 — „Za dużo Tymka”. Dziecko zasłania imię naklejką „on”, a
 * naklejka sama przybiera formę z danych (go, mu, niego, nim). Licznik imion
 * spada; tam, gdzie tuż przed chwilą byli obaj chłopcy (albo Tymka jeszcze
 * nie było), ilustracja miga oboma i pyta „który?” / „kto?”. Stuknięcie
 * naklejki ją odkleja. Gest kończący pracę sam zatwierdza: ≤ 3 imiona i żadne
 * zdanie niejasne.
 */

interface Props {
  color: string;
  initial?: StanZaimkow | null;
  onState?: (s: StanZaimkow) => void;
  onComplete: () => void;
}

const BLOK = 'naklejka';

export function ZaDuzoTymka({ color, initial, onState, onComplete }: Props) {
  const [naklejki, setNaklejki] = useState<string[]>(() => initial?.naklejki ?? []);
  const [wNaklejce, setWNaklejce] = useState(false);
  const [ostatni, setOstatni] = useState<{ id: string; jak: Jasnosc } | null>(null);
  const ocena = ocen(naklejki);
  const [przyjete, setPrzyjete] = useState(() => ocena.przyjete);

  const zmien = (n: string[], id: string | null) => {
    setNaklejki(n);
    onState?.({ naklejki: n });
    setOstatni(id && n.includes(id) ? { id, jak: jasnosc(id) } : null);
    if (!przyjete && ocen(n).przyjete) {
      setPrzyjete(true);
      onComplete();
    }
  };

  const naImie = (id: string) => {
    if (przyjete) return;
    if (naklejki.includes(id)) {
      zmien(odklej(naklejki, id), null);
      return;
    }
    if (!wNaklejce) return;
    setWNaklejce(false);
    zmien(przyklej(naklejki, id), id);
  };

  const drag = useDragToken({
    disabled: przyjete,
    onDrop: (_id, target) => {
      if (target && WYSTAPIENIA.some((w) => w.id === target) && !naklejki.includes(target)) {
        setWNaklejce(false);
        zmien(przyklej(naklejki, target), target);
      }
    },
    onTap: () => setWNaklejce((v) => !v),
  });

  const niejasneId = new Set(ocena.niejasne.map((n) => n.id));
  const pytanieTeraz = ostatni && ostatni.jak !== 'jasne' ? ostatni : ocena.niejasne[0] ? { id: ocena.niejasne[0].id, jak: ocena.niejasne[0].jak } : null;
  const czerwony = ocena.imion > NAJWIECEJ_IMION;

  const panel = (mobile: boolean) => (
    <div className={`flex items-center justify-between gap-3 ${mobile ? 'mt-1' : 'border p-2'}`}>
      <div aria-live={mobile ? undefined : 'polite'} data-testid={mobile ? 'licznik-m' : 'licznik'}>
        <p className="text-xs text-muted-foreground">Imię „Tymek” w tekście</p>
        <p className={`font-mono font-bold tabular-nums ${mobile ? 'text-xl' : 'text-2xl'}`} style={{ color: czerwony ? '#dc2626' : color }}>
          {ocena.imion}× <span className="text-xs font-normal text-muted-foreground">(najwyżej {NAJWIECEJ_IMION})</span>
        </p>
      </div>
      <button
        type="button"
        {...drag.bind(BLOK)}
        disabled={przyjete}
        className="relative touch-none"
        aria-label="Naklejka z zaimkiem „on”"
        aria-pressed={wNaklejce}
        data-testid={mobile ? 'naklejka-stos-m' : 'naklejka-stos'}
      >
        <span aria-hidden className="absolute inset-0 translate-x-1 translate-y-1 border bg-amber-100" />
        <span
          className="relative block -rotate-3 border bg-amber-200 px-4 py-2 font-serif text-xl shadow-sm"
          style={wNaklejce ? { outline: `3px solid ${color}`, outlineOffset: 2 } : undefined}
        >
          on
        </span>
      </button>
    </div>
  );

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-5">
      <p className="text-sm leading-relaxed sm:text-base">
        W opowiadaniu jest za dużo Tymka. Przeciągnij naklejkę „on” na imię (albo stuknij naklejkę, a potem imię). Stuknięta naklejka na
        tekście się odkleja.
      </p>

      <div className="mt-3 grid gap-3 md:grid-cols-[220px_1fr] md:items-start">
        <div className="hidden flex-col gap-3 md:flex">
          <Ilustracja color={color} ostatni={ostatni} pytanie={pytanieTeraz} />
          {panel(false)}
        </div>

        <div className="border bg-[#fffdf6] p-3 font-serif text-lg leading-[2.4rem] dark:bg-zinc-800 sm:p-4" data-testid="opowiadanie">
          <p className="mb-1 font-sans text-xs uppercase tracking-wide text-muted-foreground">Tymek na wyspie</p>
          {OPOWIADANIE.map((z) => (
            <span key={z.id}>
              {z.kawalki.map((k, i) =>
                'imie' in k ? (
                  <Imie
                    key={k.id}
                    id={k.id}
                    imie={k.imie}
                    zaimek={k.zaimek}
                    zaklejone={naklejki.includes(k.id)}
                    niejasne={niejasneId.has(k.id)}
                    hover={drag.hover === k.id}
                    czeka={wNaklejce}
                    color={color}
                    onClick={() => naImie(k.id)}
                  />
                ) : (
                  <span key={i}>{k.t}</span>
                ),
              )}{' '}
            </span>
          ))}
          <p className="mt-2 font-sans text-xs text-muted-foreground">Opowiadanie napisane dla kursu.</p>
        </div>
      </div>

      {/* Na telefonie tekst jest długi: twarze, licznik i naklejka jadą przy dolnej krawędzi ekranu, żeby imię na dole dało się zakleić. */}
      <div className="sticky bottom-0 z-10 -mx-4 mt-3 border-t bg-white/95 px-4 py-2 sm:-mx-5 sm:px-5 backdrop-blur dark:bg-zinc-900/95 md:hidden">
        <Ilustracja color={color} ostatni={ostatni} pytanie={pytanieTeraz} compact />
        {panel(true)}
      </div>

      {!przyjete && !czerwony && ocena.niejasne.length > 0 && (
        <p className="mt-3 text-sm leading-relaxed sm:text-base" aria-live="polite">
          Imion jest już mało, ale {ocena.niejasne.length === 1 ? 'jedno zdanie jest niejasne' : `${ocena.niejasne.length} zdania są niejasne`} — czytelnik nie wie, o
          kogo chodzi. Odklej tam naklejkę.
        </p>
      )}

      {przyjete && (
        <p className="mt-3 flex items-start gap-2 border-t pt-3 text-sm leading-relaxed sm:text-base" data-testid="tymek-koniec">
          <Check className="mt-0.5 h-5 w-5 shrink-0" style={{ color }} aria-hidden />
          <span>
            Tymek został {ocena.imion} {plural(ocena.imion, { one: 'raz', few: 'razy', many: 'razy' })}, a każde zdanie wiadomo, o kim mówi.
            Naklejka mówiła raz „on”, raz „go”, „mu”, „niego”, „nim” — bo słowo, które <strong>zastępuje</strong> imię, też się odmienia. To
            jest <strong>zaimek</strong>. Działa tylko wtedy, gdy wiadomo, kogo zastępuje: kiedy obok są dwaj chłopcy, imię musi wrócić.
          </span>
        </p>
      )}

      <DragGhost drag={drag.drag}>
        {drag.drag && <span className="block -rotate-3 border bg-amber-200 px-4 py-2 font-serif text-xl shadow-md">on</span>}
      </DragGhost>
    </div>
  );
}

function Imie({
  id,
  imie,
  zaimek,
  zaklejone,
  niejasne,
  hover,
  czeka,
  color,
  onClick,
}: {
  id: string;
  imie: string;
  zaimek: string;
  zaklejone: boolean;
  niejasne: boolean;
  hover: boolean;
  czeka: boolean;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      data-drop={zaklejone ? undefined : id}
      onClick={onClick}
      className="relative mx-0.5 inline-grid place-items-center align-baseline"
      aria-label={zaklejone ? `Naklejka „${zaimek}” na imieniu ${imie} — stuknij, żeby odkleić` : `Imię ${imie}`}
      data-testid={`imie-${id}`}
    >
      {/* Oba napisy w tej samej komórce: szerokość nie skacze po przyklejeniu (bez CLS). */}
      <span
        className="col-start-1 row-start-1 border-b-2 px-0.5"
        style={{ visibility: zaklejone ? 'hidden' : 'visible', borderColor: hover || czeka ? color : `${color}66`, background: hover ? `${color}22` : undefined }}
      >
        {imie}
      </span>
      <span
        aria-hidden={!zaklejone}
        className="col-start-1 row-start-1 -rotate-2 border bg-amber-200 px-1.5 leading-7 shadow-sm transition-transform duration-300"
        style={{
          visibility: zaklejone ? 'visible' : 'hidden',
          transform: zaklejone ? undefined : 'scale(0.6)',
          outline: niejasne ? '2px dashed #dc2626' : undefined,
          outlineOffset: 1,
        }}
      >
        {zaimek}
        {niejasne && <sup className="ml-0.5 font-sans text-xs font-bold text-red-600">?</sup>}
      </span>
    </button>
  );
}

/** Dwaj chłopcy nad tekstem: jasny zaimek zapala Tymka, niejasny — miga oboma i pyta. */
function Ilustracja({
  color,
  ostatni,
  pytanie: p,
  compact = false,
}: {
  color: string;
  ostatni: { id: string; jak: Jasnosc } | null;
  pytanie: { id: string; jak: Jasnosc } | null;
  compact?: boolean;
}) {
  const w = (id: string) => WYSTAPIENIA.find((x) => x.id === id)!;
  const jasny = ostatni?.jak === 'jasne';
  const miga = !!p && p.jak !== 'jasne';
  return (
    <div className={compact ? 'flex items-center gap-2' : 'border bg-[#eef6fb] p-2 dark:bg-zinc-800'} data-testid={compact ? 'ilustracja-m' : 'ilustracja'}>
      <div className={`flex shrink-0 justify-center ${compact ? 'gap-1' : 'gap-3'}`}>
        {(['tymek', 'kuba'] as const).map((kto) => {
          const swieci = (jasny && kto === 'tymek') || miga;
          return (
            <div
              key={kto}
              className={`flex flex-col items-center border-2 ${compact ? 'p-0.5' : 'p-1'} ${miga ? 'animate-pulse' : ''}`}
              style={{ borderColor: swieci ? (miga ? '#dc2626' : color) : 'transparent', opacity: jasny && kto === 'kuba' ? 0.45 : 1 }}
            >
              <Twarz kto={kto} mina={miga ? 'zdziwienie' : 'usmiech'} size={compact ? 36 : 72} label={kto === 'tymek' ? 'Tymek' : 'Kuba'} />
              {!compact && <span className="text-xs">{kto === 'tymek' ? 'Tymek' : 'Kuba'}</span>}
            </div>
          );
        })}
      </div>
      <p
        className={compact ? 'min-h-[2.5rem] text-xs leading-snug' : 'mt-1 min-h-[2.5rem] text-center text-xs leading-snug sm:text-sm'}
        aria-live="polite"
        data-testid={compact ? 'ilustracja-pytanie-m' : 'ilustracja-pytanie'}
      >
        {miga && p ? pytanie(p.jak as Exclude<Jasnosc, 'jasne'>, w(p.id).zaimek.toLowerCase()) : jasny && ostatni ? `„${w(ostatni.id).zaimek.toLowerCase()}” — to Tymek. Wiadomo.` : ''}
      </p>
    </div>
  );
}
