'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { DragGhost, useDragToken } from '../../family-tree/use-drag-token';
import { EMBER_AT, SMOKE_AT, stageOf, stepHeat, tempoAt, tempoHint } from './swider';

/**
 * Blok 1 (haczyk): **świder ogniowy**. Dziecko kręci patykiem, wodząc palcem
 * w lewo i w prawo (albo strzałkami ← →); liczy się tempo. Za wolno — drewno
 * tylko się grzeje. Szybko — dym, żar. Żar przenosi do hubki (przeciągnięcie
 * albo stuk-stuk) i dopiero wtedy obóz o zmroku się zmienia: robi się jasno
 * i ciepło, wilki odchodzą, mięso się piecze. Dziecko stuka cztery rzeczy,
 * które zmienił ogień — pożytki wynikają ze sceny, nie z listy.
 */

/** Zawrócenie liczy się, gdy palec przejechał co najmniej tyle pikseli. */
const MIN_SWING = 14;

interface Change {
  id: string;
  x: number;
  y: number;
  label: string;
  text: string;
}

/** Miejsca na ilustracji obozu (procenty kadru). Ognisko w kręgu kamieni: ok. 49% × 73%. */
const FIRE = { x: 49, y: 73 };
const CHANGES: Change[] = [
  { id: 'wilki', x: 66, y: 46, label: 'wilki', text: 'Wilki boją się ognia — odchodzą od obozu.' },
  { id: 'mieso', x: 63, y: 84, label: 'mięso', text: 'Mięso się piecze — łatwiej je pogryźć i strawić.' },
  { id: 'ludzie', x: 38, y: 66, label: 'ludzie', text: 'Jest ciepło — można przetrwać zimną noc.' },
  { id: 'narzedzia', x: 13, y: 79, label: 'narzędzia', text: 'Jest jasno — po zmroku widać narzędzia i da się pracować.' },
];

export function SwiderOgniowy({ color, image, onComplete }: { color: string; image: string; onComplete: () => void }) {
  const [heat, setHeat] = useState(0);
  const [tempo, setTempo] = useState(0);
  const [spin, setSpin] = useState(0);
  const [lit, setLit] = useState(false);
  const [found, setFound] = useState<string[]>([]);
  const [last, setLast] = useState<string | null>(null);
  const [emberPicked, setEmberPicked] = useState(false);
  const reversals = useRef<number[]>([]);
  const swing = useRef<{ x: number; dir: 0 | 1 | -1; anchor: number } | null>(null);
  const lastKey = useRef<string | null>(null);
  const completed = useRef(false);

  const ember = heat >= EMBER_AT;
  const stage = stageOf(heat);

  useEffect(() => {
    if (ember) return;
    const id = window.setInterval(() => {
      const now = performance.now();
      reversals.current = reversals.current.filter((t) => t > now - 1500);
      const t = tempoAt(reversals.current, now);
      setTempo(t);
      setHeat((h) => stepHeat(h, t, 0.1));
    }, 100);
    return () => window.clearInterval(id);
  }, [ember]);

  const turn = () => {
    reversals.current.push(performance.now());
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (ember) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    swing.current = { x: e.clientX, dir: 0, anchor: e.clientX };
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const s = swing.current;
    if (!s || ember) return;
    const dx = e.clientX - s.x;
    if (dx === 0) return;
    const dir: 1 | -1 = dx > 0 ? 1 : -1;
    setSpin((v) => v + dx * 2.2);
    if (s.dir !== 0 && dir !== s.dir && Math.abs(s.x - s.anchor) >= MIN_SWING) {
      turn();
      s.anchor = s.x;
    }
    if (s.dir === 0) s.anchor = s.x;
    s.dir = dir;
    s.x = e.clientX;
  };
  const onPointerUp = () => {
    swing.current = null;
  };
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (ember || (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight')) return;
    e.preventDefault();
    if (lastKey.current && lastKey.current !== e.key) turn();
    lastKey.current = e.key;
    setSpin((v) => v + (e.key === 'ArrowRight' ? 30 : -30));
  };

  const light = () => {
    if (!ember || lit) return;
    setLit(true);
    setEmberPicked(false);
  };
  const { drag, hover, bind } = useDragToken({
    disabled: !ember || lit,
    onDrop: (_id, target) => {
      if (target === 'hubka') light();
    },
    onTap: () => setEmberPicked((p) => !p),
  });

  const tapChange = (c: Change) => {
    if (!lit) return;
    setLast(c.text);
    if (found.includes(c.id)) return;
    const next = [...found, c.id];
    setFound(next);
    if (next.length === CHANGES.length && !completed.current) {
      completed.current = true;
      onComplete();
    }
  };

  const smoke = Math.max(0, Math.min(1, (heat - SMOKE_AT) / (EMBER_AT - SMOKE_AT)));

  return (
    <div className="space-y-5">
      {!lit && (
        <div className="grid gap-4 md:grid-cols-[1fr_240px]">
          <div className="space-y-2">
            <p className="text-sm leading-relaxed">
              Nie ma zapałek ani zapalniczki. Jest suchy patyk wbity w deskę. Kręć nim, wodząc palcem po patyku{' '}
              <strong>w lewo i w prawo</strong> — jak między dłońmi.
            </p>
            <div
              role="slider"
              aria-label="Świder ogniowy — wodź palcem w lewo i w prawo albo naciskaj na zmianę strzałki"
              aria-valuemin={0}
              aria-valuemax={EMBER_AT}
              aria-valuenow={Math.round(heat)}
              tabIndex={0}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onKeyDown={onKeyDown}
              className="relative h-56 cursor-ew-resize touch-none select-none overflow-hidden border bg-amber-50 dark:bg-zinc-900"
            >
              <svg viewBox="0 0 300 220" className="h-full w-full" aria-hidden>
                {/* deska */}
                <rect x="40" y="170" width="220" height="26" fill="#a16207" />
                <rect x="40" y="170" width="220" height="5" fill="#ca8a04" opacity="0.6" />
                {/* wgłębienie, które się rozgrzewa */}
                <ellipse cx="150" cy="172" rx="16" ry="5" fill={heat > 8 ? `rgb(${120 + heat * 1.3}, ${50 + heat * 0.2}, 20)` : '#713f12'} />
                {/* patyk z paskami, które przesuwają się przy kręceniu */}
                <defs>
                  <clipPath id="patyk">
                    <rect x="140" y="20" width="20" height="152" />
                  </clipPath>
                </defs>
                <rect x="140" y="20" width="20" height="152" fill="#d6b27a" />
                <g clipPath="url(#patyk)">
                  {Array.from({ length: 6 }, (_, k) => {
                    const off = (((spin / 6 + k * 10) % 60) + 60) % 60;
                    return <rect key={k} x={140 + off / 3 - 4} y="20" width="3" height="152" fill="#a8844e" opacity="0.7" />;
                  })}
                </g>
                {/* dłonie */}
                <ellipse cx={128 + Math.sin(spin / 40) * 4} cy="70" rx="16" ry="26" fill="#e7b48f" />
                <ellipse cx={172 - Math.sin(spin / 40) * 4} cy="70" rx="16" ry="26" fill="#e7b48f" />
                {/* dym */}
                {smoke > 0 &&
                  [0, 1, 2].map((k) => (
                    <circle
                      key={k}
                      cx={150 + (k - 1) * 14 + Math.sin(spin / 30 + k) * 5}
                      cy={150 - k * 22 - smoke * 20}
                      r={8 + k * 5}
                      fill="#a1a1aa"
                      opacity={smoke * (0.55 - k * 0.12)}
                    />
                  ))}
                {ember && <circle cx="150" cy="172" r="7" fill="#f97316" className="animate-pulse" />}
              </svg>
            </div>
            <div className="h-3 w-full border bg-white dark:bg-zinc-950" aria-hidden>
              <div
                className="h-full transition-[width] duration-100"
                style={{
                  width: `${(heat / EMBER_AT) * 100}%`,
                  background: heat >= SMOKE_AT ? '#ea580c' : '#f59e0b',
                }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-muted-foreground" aria-hidden>
              <span>zimne</span>
              <span>ciepłe</span>
              <span>dym</span>
              <span>żar</span>
            </div>
            <p className="min-h-[1.5rem] text-sm font-medium" aria-live="polite" style={{ color }}>
              {tempoHint(tempo, heat)}
            </p>
          </div>

          <div className="flex flex-col items-center justify-center gap-3 border bg-white p-3 dark:bg-zinc-900">
            <p className="text-center text-xs text-muted-foreground">
              {ember ? 'Przeciągnij żar do hubki — albo stuknij żar, potem hubkę.' : 'Tu trafi żar — do hubki z suchej trawy.'}
            </p>
            {ember && (
              <button
                type="button"
                {...bind('zar')}
                aria-label="Żar"
                className="h-12 w-12 touch-none rounded-full border-2 border-orange-300 bg-orange-500 shadow-[0_0_18px_rgba(249,115,22,0.8)]"
                style={{ outline: emberPicked ? `3px solid ${color}` : undefined }}
              />
            )}
            <button
              type="button"
              data-drop="hubka"
              onClick={() => emberPicked && light()}
              aria-label="Hubka z suchej trawy"
              className="relative h-24 w-full max-w-[180px] border"
              style={{ background: hover === 'hubka' ? '#fef3c7' : undefined }}
            >
              <svg viewBox="0 0 120 60" className="h-full w-full" aria-hidden>
                {Array.from({ length: 22 }, (_, k) => (
                  <line
                    key={k}
                    x1={20 + ((k * 37) % 80)}
                    y1={50}
                    x2={14 + ((k * 53) % 92)}
                    y2={22 + ((k * 13) % 20)}
                    stroke="#a3a35c"
                    strokeWidth="2"
                  />
                ))}
              </svg>
            </button>
            <p className="text-center text-[11px] text-muted-foreground">
              Etap: <strong>{{ zimne: 'zimne drewno', cieple: 'ciepłe drewno', dym: 'dym', zar: 'żar' }[stage]}</strong>
            </p>
          </div>
          <DragGhost drag={drag}>
            <span className="block h-12 w-12 rounded-full bg-orange-500 shadow-[0_0_18px_rgba(249,115,22,0.8)]" />
          </DragGhost>
        </div>
      )}

      <div className="space-y-2">
        {lit ? (
          <p className="text-sm leading-relaxed">
            Hubka zajęła się płomieniem, ogień płonie w kręgu kamieni. <strong>Co ogień zmienił w obozie?</strong> Stuknij
            cztery rzeczy na obrazku.
          </p>
        ) : (
          <p className="text-sm leading-relaxed text-muted-foreground">Tak wygląda obóz o zmroku bez ognia.</p>
        )}
        <div className="relative overflow-hidden border">
          <Image
            src={image}
            alt="Akwarela: obóz ludzi z epoki kamienia w szerokiej dolinie o zmierzchu — dwa stożkowe szałasy z żerdzi obciągniętych skórami, rama z suszącymi się skórami, rodzina w futrach siedzi przy kręgu kamieni z ułożonymi gałęziami; na kamieniu kamienne narzędzia, w trawie drewniany oszczep, w dali rzeka, las i sierp księżyca"
            width={1168}
            height={876}
            className="h-auto w-full transition-[filter] duration-[1500ms]"
            style={{ filter: lit ? 'brightness(1) saturate(1)' : 'brightness(0.32) saturate(0.45) hue-rotate(200deg)' }}
          />
          {lit && (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background: `radial-gradient(circle at ${FIRE.x}% ${FIRE.y}%, rgba(255,170,60,0.45) 0%, rgba(255,140,40,0.18) 22%, rgba(20,20,60,0.25) 60%)`,
              }}
            />
          )}
          {lit && (
            <svg
              aria-hidden
              viewBox="0 0 40 50"
              className="pointer-events-none absolute w-[9%] animate-pulse"
              style={{ left: `${FIRE.x - 4.5}%`, top: `${FIRE.y - 13}%` }}
            >
              <path d="M20 2 C 30 16, 36 26, 30 40 C 26 48, 14 48, 10 40 C 4 28, 12 20, 20 2 Z" fill="#fb923c" opacity="0.9" />
              <path d="M20 16 C 26 26, 28 32, 24 40 C 22 44, 18 44, 16 40 C 13 33, 16 26, 20 16 Z" fill="#fde68a" />
            </svg>
          )}
          {/* oczy wilków w ciemności — po rozpaleniu odchodzą */}
          <svg
            aria-hidden
            viewBox="0 0 30 10"
            className="pointer-events-none absolute w-[5%] transition-opacity duration-1000"
            style={{ left: `${CHANGES[0].x - 2.5}%`, top: `${CHANGES[0].y - 1}%`, opacity: found.includes('wilki') ? 0 : 1 }}
          >
            <circle cx="6" cy="5" r="2.2" fill="#facc15" />
            <circle cx="14" cy="5" r="2.2" fill="#facc15" />
            <circle cx="20" cy="7" r="1.8" fill="#facc15" />
            <circle cx="26" cy="7" r="1.8" fill="#facc15" />
          </svg>
          {/* mięso na patyku: surowe, po stuknięciu nad ogniem i upieczone */}
          <svg
            aria-hidden
            viewBox="0 0 60 20"
            className="pointer-events-none absolute w-[10%] transition-all duration-700"
            style={
              found.includes('mieso')
                ? { left: `${FIRE.x - 5}%`, top: `${FIRE.y - 16}%` }
                : { left: `${CHANGES[1].x - 5}%`, top: `${CHANGES[1].y - 3}%` }
            }
          >
            <line x1="0" y1="10" x2="60" y2="10" stroke="#78350f" strokeWidth="2" />
            <ellipse cx="30" cy="10" rx="13" ry="7" fill={found.includes('mieso') ? '#92400e' : '#dc2626'} />
          </svg>
          {lit &&
            CHANGES.map((c) => {
              const done = found.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => tapChange(c)}
                  aria-label={done ? `${c.label} — ${c.text}` : `Coś się zmieniło tutaj (${c.label})`}
                  className="absolute h-[18%] w-[16%] -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{ left: `${c.x}%`, top: `${c.y}%`, outline: done ? `2px dashed ${color}` : undefined }}
                >
                  {done && (
                    <span
                      className="absolute left-1/2 top-full -translate-x-1/2 whitespace-nowrap bg-white px-1.5 py-0.5 text-[11px] font-semibold dark:bg-zinc-900"
                      style={{ color }}
                    >
                      {c.label}
                    </span>
                  )}
                </button>
              );
            })}
        </div>
        {lit && (
          <div className="min-h-[3rem] border-l-2 pl-3 text-sm" style={{ borderColor: color }} aria-live="polite">
            {last ?? 'Patrz na obrazek: co wygląda teraz inaczej niż w ciemności?'}
            <span className="ml-2 font-mono text-xs tabular-nums text-muted-foreground">
              {found.length}/{CHANGES.length}
            </span>
          </div>
        )}
        {found.length === CHANGES.length && (
          <p className="text-sm leading-relaxed">
            Ciepło, światło, ochrona przed zwierzętami i pieczone jedzenie. A z tego wynika jeszcze jedno:{' '}
            <strong>z ogniem da się żyć tam, gdzie jest zimno</strong>. Ludzie z ogniem mogli zajść dużo dalej — zobaczysz
            to w bloku o wędrówkach.
          </p>
        )}
      </div>
    </div>
  );
}
