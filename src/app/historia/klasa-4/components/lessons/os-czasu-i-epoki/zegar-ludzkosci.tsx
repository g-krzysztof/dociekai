'use client';

import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { Flame, RotateCcw, ZoomIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import { plural } from '@/lib/plural';
import { timelineNow, useTimelinePins } from '../../../lib/timeline/use-timeline-pins';
import {
  advanceAngle,
  DAY_SECONDS,
  DIALS,
  formatClock,
  placeEvents,
  pointerAngle,
  polar,
  secondsForYears,
  secondToAngle,
  type PlacedDayEvent,
} from './doba';

const SIZE = 240;
const C = SIZE / 2;
const R = 100;

/** Do którego kąta wolno dokręcić każdą tarczę, zanim trzeba ją przybliżyć (23:00, 23:59, 24:00). */
const MAX_ANGLE = [secondToAngle(23 * 3600, DIALS[0]), secondToAngle(DAY_SECONDS - 60, DIALS[1]), 360];

/**
 * Blok 1 — **„Dzieje ludzkości w jedną dobę”** (haczyk).
 *
 * Gest nowy w kursie: **kręci wskazówką zegara** (palcem dookoła tarczy, tylko
 * do przodu; klawiatura: strzałki). 300 000 lat = 24 godziny. Przez 23 godziny
 * na horyzoncie są tylko ogniska; wszystko z podręcznika ściska się w ostatniej
 * godzinie, więc tarczę trzeba **przybliżyć** — najpierw do ostatniej godziny,
 * potem do ostatniej minuty. Godziny wydarzeń liczy `doba.ts` z dat.
 */
export function ZegarLudzkosci({ color, onComplete }: { color: string; onComplete: () => void }) {
  const { personal } = useTimelinePins();
  const now = timelineNow();
  const events = useMemo(() => placeEvents(now, personal.ja), [now, personal.ja]);

  const [dialIndex, setDialIndex] = useState(0);
  const [angle, setAngle] = useState(0);
  const [cranking, setCranking] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const reported = useRef(false);

  const dial = DIALS[dialIndex];
  const maxAngle = MAX_ANGLE[dialIndex];
  const second = dial.from + (angle / 360) * (dial.to - dial.from);
  const atLimit = angle >= maxAngle - 0.01;
  const finished = dialIndex === DIALS.length - 1 && atLimit;
  const withSeconds = dial.id === 'minuta';

  const passed = events.filter((e) => e.second <= second + 0.001);
  const onFace = events.filter((e) => e.dial === dial.id);

  useEffect(() => {
    if (finished && !reported.current) {
      reported.current = true;
      onComplete();
    }
  }, [finished, onComplete]);

  const angleFromPointer = (event: PointerEvent<SVGSVGElement>) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return pointerAngle(event.clientX - rect.left - rect.width / 2, event.clientY - rect.top - rect.height / 2);
  };

  const crankTo = (next: number) => setAngle(Math.min(maxAngle, next));

  const onPointerDown = (event: PointerEvent<SVGSVGElement>) => {
    if (atLimit) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setCranking(true);
  };
  const onPointerMove = (event: PointerEvent<SVGSVGElement>) => {
    if (!cranking) return;
    const a = angleFromPointer(event);
    if (a === null) return;
    // Przy samym końcu tarczy palec po 360° wraca na 0° — wtedy dociągamy do granicy.
    const next = advanceAngle(angle, a === 0 ? 359.99 : a);
    crankTo(next);
  };
  const stop = () => setCranking(false);

  const onKeyDown = (event: KeyboardEvent<SVGSVGElement>) => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      crankTo(angle + (event.shiftKey ? 20 : 5));
    }
  };

  const zoom = () => {
    setDialIndex((i) => i + 1);
    setAngle(0);
  };

  const reset = () => {
    setDialIndex(0);
    setAngle(0);
  };

  const hand = polar(C, C, R - 18, angle);
  const latest = passed[passed.length - 1];
  const writing = events.find((e) => e.id === 'pismo');
  const kolumb = events.find((e) => e.id === 'kolumb');
  const you = events.find((e) => e.id === 'ty');

  return (
    <div className="space-y-4">
      <div className="grid gap-5 md:grid-cols-[260px_1fr] md:items-start">
        <div className="mx-auto w-full max-w-[260px]">
          <p className="mb-1 text-center text-xs font-semibold uppercase tracking-wide" style={{ color }}>
            {dial.title}
          </p>
          <svg
            ref={svgRef}
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            className={cn('w-full touch-none select-none outline-none focus-visible:ring-2', atLimit ? 'cursor-default' : cranking ? 'cursor-grabbing' : 'cursor-grab')}
            role="slider"
            tabIndex={0}
            aria-label={`Zegar dziejów, ${dial.title}. Kręć wskazówką w prawo, palcem albo strzałką.`}
            aria-valuemin={0}
            aria-valuemax={360}
            aria-valuenow={Math.round(angle)}
            aria-valuetext={formatClock(second, withSeconds)}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={stop}
            onPointerCancel={stop}
            onKeyDown={onKeyDown}
          >
            <circle cx={C} cy={C} r={R} fill="var(--background)" stroke="currentColor" strokeOpacity={0.25} strokeWidth={2} />
            {/* Przebyta część tarczy */}
            {angle > 0 && <Sector angle={Math.min(angle, 359.99)} color={color} />}
            {/* Na całej dobie: ostatnia godzina zaznaczona — tu dzieje się prawie wszystko z podręcznika */}
            {dial.id === 'doba' && <Sector from={345} angle={359.99} color="var(--destructive)" opacity={atLimit ? 0.35 : 0.12} />}
            {Array.from({ length: 12 }, (_, i) => {
              const a = i * 30;
              const p1 = polar(C, C, R, a);
              const p2 = polar(C, C, R - (i % 3 === 0 ? 10 : 5), a);
              return <line key={a} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="currentColor" strokeOpacity={0.4} />;
            })}
            {dial.marks.map(([s, text]) => {
              const p = polar(C, C, R + 12, secondToAngle(s, dial));
              return (
                <text key={text} x={p.x} y={p.y + 3} textAnchor="middle" fontSize={9} fill="currentColor" opacity={0.6}>
                  {text}
                </text>
              );
            })}
            {onFace.map((e) => {
              const p = polar(C, C, R - 4, secondToAngle(e.second, dial));
              const on = e.second <= second + 0.001;
              return (
                <circle
                  key={e.id}
                  cx={p.x}
                  cy={p.y}
                  r={on ? 5 : 3.5}
                  fill={on ? color : 'var(--background)'}
                  stroke={color}
                  strokeWidth={1.5}
                />
              );
            })}
            <line x1={C} y1={C} x2={hand.x} y2={hand.y} stroke="currentColor" strokeWidth={3} strokeLinecap="round" />
            <circle cx={hand.x} cy={hand.y} r={9} fill={color} opacity={atLimit ? 0.4 : 0.9} />
            <circle cx={C} cy={C} r={5} fill="currentColor" />
            <text x={C} y={C + 32} textAnchor="middle" fontSize={20} fontWeight={700} fill="currentColor" className="tabular-nums">
              {formatClock(second, withSeconds)}
            </text>
          </svg>
        </div>

        <div className="space-y-3">
          <Horizon events={passed} second={second} />
          <ol className="space-y-1.5 text-sm" aria-live="polite">
            {passed.map((e) => (
              <li key={e.id} className={cn('flex gap-3', e === latest && 'font-semibold')}>
                <span className="w-[4.6rem] shrink-0 font-mono tabular-nums" style={{ color }}>
                  {formatClock(e.second, e.dial === 'minuta')}
                </span>
                <span>
                  {e.label} <span className="font-normal text-muted-foreground">· {e.when}</span>
                </span>
              </li>
            ))}
          </ol>
          <p className="text-sm text-muted-foreground">
            {angle === 0 && dialIndex === 0
              ? 'Chwyć wskazówkę i kręć nią w prawo, dookoła tarczy. Cała doba to 300 000 lat — tyle, ile żyją na Ziemi ludzie.'
              : dial.id === 'doba' && !atLimit
                ? 'Na horyzoncie wciąż tylko ogniska, obozy i polowania. Kręć dalej.'
                : dial.id === 'doba'
                  ? 'Jest 23:00, a z podręcznika nie wydarzyło się jeszcze nic. Wszystko, co znasz, ściska się w czerwonym kawałku tarczy — za ciasno, żeby cokolwiek odróżnić.'
                  : dial.id === 'godzina' && atLimit
                    ? 'Zostaje ostatnia minuta — i znowu robi się ciasno.'
                    : null}
          </p>
          {atLimit && !finished && (
            <button
              type="button"
              onClick={zoom}
              className="inline-flex items-center gap-2 border-2 px-4 py-2 text-sm font-semibold"
              style={{ borderColor: color, color }}
            >
              <ZoomIn className="h-4 w-4" aria-hidden />
              {dial.id === 'doba' ? 'Przybliż ostatnią godzinę' : 'Przybliż ostatnią minutę'}
            </button>
          )}
        </div>
      </div>

      {finished && writing && kolumb && you && (
        <div className="space-y-2 border bg-muted/30 p-4 text-sm leading-relaxed">
          <p>
            <strong>Północ — to jest dziś.</strong> Pismo pojawiło się o {formatClock(writing.second)}, więc cała historia
            spisana przez ludzi to ostatnie {minutesLabel(DAY_SECONDS - writing.second)} doby. Wszystko wcześniej to
            prehistoria. Kolumb dopłynął do Ameryki {minutesLabel(DAY_SECONDS - kolumb.second)} przed północą, a{' '}
            {you.label === 'twoje urodziny' ? 'twoje życie' : 'życie dziesięciolatka'} to ostatnie{' '}
            {secondsLabel(secondsForYears(now - Number(you.when)))}.
          </p>
          <p>
            Zauważ, co zrobiliśmy: żeby cokolwiek zobaczyć, trzeba było <strong>przybliżać</strong> końcówkę — im bliżej
            dziś, tym gęściej od wydarzeń. Tak samo działa oś „cała ludzkość” na końcu tej lekcji.
          </p>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground underline-offset-2 hover:underline"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden /> Nakręć od nowa
          </button>
        </div>
      )}
    </div>
  );
}

function minutesLabel(seconds: number): string {
  const m = Math.round(seconds / 60);
  return `${m} ${plural(m, { one: 'minuta', few: 'minuty', many: 'minut' })}`;
}

function secondsLabel(seconds: number): string {
  const s = Math.max(1, Math.round(seconds));
  return `${s} ${plural(s, { one: 'sekunda', few: 'sekundy', many: 'sekund' })}`;
}

/** Wycinek tarczy od `from` do `angle` stopni — przebyta droga wskazówki. */
function Sector({ from = 0, angle, color, opacity = 0.18 }: { from?: number; angle: number; color: string; opacity?: number }) {
  const start = polar(C, C, R, from);
  const end = polar(C, C, R, angle);
  const large = angle - from > 180 ? 1 : 0;
  return (
    <path
      d={`M ${C} ${C} L ${start.x} ${start.y} A ${R} ${R} 0 ${large} 1 ${end.x} ${end.y} Z`}
      fill={color}
      opacity={opacity}
    />
  );
}

/**
 * Horyzont nad listą: przez większość doby same ogniska (ich liczba rośnie
 * z godzinami), a potem — już tylko na przybliżonych tarczach — wszystko naraz.
 */
function Horizon({ events, second }: { events: PlacedDayEvent[]; second: number }) {
  const hours = Math.min(6, Math.floor(second / (4 * 3600)) + 1);
  const later = events.filter((e) => e.icon !== 'ognisko');
  return (
    <div className="flex min-h-10 flex-wrap items-end gap-2 border-b pb-2" aria-hidden>
      {Array.from({ length: hours }, (_, i) => (
        <Flame key={i} className="h-5 w-5 text-orange-500/80" />
      ))}
      {later.length > 0 && (
        <span className="text-xs text-muted-foreground">
          + {later.length} {plural(later.length, { one: 'wydarzenie', few: 'wydarzenia', many: 'wydarzeń' })} z podręcznika
        </span>
      )}
    </div>
  );
}
