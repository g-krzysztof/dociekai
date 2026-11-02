'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight, Footprints } from 'lucide-react';
import { cn } from '@/lib/utils';
import { plural } from '@/lib/plural';
import { ANACHRONISMS, BAD, GOOD, judgeReason, REASONS, SCENE_W, tapThing, THINGS, type Reason } from './gra';

const VIEW_W = 480;
const VIEW_H = 280;
const GROUND = 250;
const STEP = 10;

interface Round {
  found: string[];
  wrongTaps: number;
}

const emptyRound = (): Round => ({ found: [], wrongTaps: 0 });

/**
 * Blok 4 — **Gra: spacer po Rzymie w 44 r. p.n.e.** (doświadczenie 2a). Gest:
 * dziecko idzie ulicą (przyciski albo przeciąganie sceny), stuka rzeczy, które
 * nie pasują do 44 r. p.n.e., i dobiera powód z czterech. Potem ocenia grę
 * kafelkami (co oddaje dobrze, w czym się myli) i może podać urządzenie
 * domownikowi — porównanie wyników. `onDone` po zapisaniu oceny.
 */
export function GraWidget({ color, onDone }: { color: string; onDone: () => void }) {
  const [cam, setCam] = useState(0);
  const [reachedEnd, setReachedEnd] = useState(false);
  const [round, setRound] = useState<Round>(emptyRound);
  const [first, setFirst] = useState<Round | null>(null);
  const [player, setPlayer] = useState<1 | 2>(1);
  const [pending, setPending] = useState<string | null>(null);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const [phase, setPhase] = useState<'gra' | 'ocena' | 'raport' | 'porownanie'>('gra');
  const [good, setGood] = useState<string[]>([]);
  const [bad, setBad] = useState<string[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const pan = useRef<{ x: number; cam: number; moved: boolean } | null>(null);
  const hold = useRef<number | null>(null);
  const reported = useRef(false);

  const maxCam = SCENE_W - VIEW_W;
  const walkerX = cam + 140;

  useEffect(() => {
    if (cam >= maxCam - 1) setReachedEnd(true);
  }, [cam, maxCam]);

  useEffect(() => {
    if ((phase === 'raport' || phase === 'porownanie') && !reported.current) {
      reported.current = true;
      onDone();
    }
  }, [phase, onDone]);

  useEffect(() => () => {
    if (hold.current) window.clearInterval(hold.current);
  }, []);

  const move = (d: number) => setCam((c) => Math.max(0, Math.min(maxCam, c + d)));
  const startHold = (d: number) => {
    move(d);
    if (hold.current) window.clearInterval(hold.current);
    hold.current = window.setInterval(() => move(d), 60);
  };
  const stopHold = () => {
    if (hold.current) window.clearInterval(hold.current);
    hold.current = null;
  };

  const tap = (id: string) => {
    if (pan.current?.moved || phase !== 'gra') return;
    if (round.found.includes(id)) return;
    const r = tapThing(id);
    if (r.kind === 'pasuje') {
      setPending(null);
      setRound((rd) => ({ ...rd, wrongTaps: rd.wrongTaps + 1 }));
      setNote({ ok: false, text: r.fact });
    } else {
      setPending(id);
      setNote(null);
    }
  };

  const choose = (reason: Reason) => {
    if (!pending) return;
    const v = judgeReason(pending, reason);
    if (v.ok) {
      setRound((rd) => ({ ...rd, found: [...rd.found, pending] }));
      setNote({ ok: true, text: v.fact });
      setPending(null);
    } else setNote({ ok: false, text: v.message });
  };

  const finishWalk = () => {
    setPending(null);
    setNote(null);
    if (player === 1) {
      setFirst(round);
      setPhase('ocena');
    } else setPhase('porownanie');
  };

  const startSecond = () => {
    setPlayer(2);
    setRound(emptyRound());
    setCam(0);
    setReachedEnd(false);
    setPhase('gra');
    // Domownik zaczyna od góry gry, nie od raportu pod nią.
    window.requestAnimationFrame(() => boxRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' }));
  };

  const pendingThing = THINGS.find((t) => t.id === pending);
  const thing = (id: string, children: ReactNode) => {
    const found = round.found.includes(id);
    return (
      <g
        key={id}
        role="button"
        tabIndex={0}
        aria-label={THINGS.find((t) => t.id === id)!.name}
        onClick={() => tap(id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') tap(id);
        }}
        className="cursor-pointer"
        opacity={found ? 0.45 : 1}
      >
        {children}
        {found && (
          <text x={THINGS.find((t) => t.id === id)!.x} y={40} textAnchor="middle" fontSize={22} fill="#15803d" fontWeight={700}>
            ✓
          </text>
        )}
      </g>
    );
  };

  return (
    <div ref={boxRef} className="scroll-mt-28 space-y-3">
      {phase === 'gra' && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="font-semibold" style={{ color }}>
              {player === 1 ? 'Twój spacer' : 'Spacer domownika'} — znalezione: {round.found.length} z {ANACHRONISMS}
            </span>
            <span className="text-xs text-muted-foreground">Rzym, 44 r. p.n.e.</span>
          </div>
          <div className="overflow-hidden border bg-[#dcebf3] dark:bg-zinc-900">
            <svg
              ref={svgRef}
              viewBox={`${cam} 0 ${VIEW_W} ${VIEW_H}`}
              className="block h-auto w-full touch-pan-y select-none"
              role="group"
              aria-label="Ulica Rzymu w 44 roku p.n.e. — przesuwaj i stukaj rzeczy, które nie pasują"
              onPointerDown={(e) => {
                pan.current = { x: e.clientX, cam, moved: false };
              }}
              onPointerMove={(e) => {
                const p = pan.current;
                const svg = svgRef.current;
                if (!p || !svg) return;
                const dx = e.clientX - p.x;
                if (Math.abs(dx) > 6) p.moved = true;
                if (p.moved) setCam(Math.max(0, Math.min(maxCam, p.cam - (dx * VIEW_W) / svg.clientWidth)));
              }}
              onPointerUp={() => {
                window.setTimeout(() => (pan.current = null), 0);
              }}
              onPointerLeave={() => (pan.current = null)}
            >
              <Scene thing={thing} />
              {/* Spacerowicz. */}
              <g transform={`translate(${walkerX} ${GROUND})`} pointerEvents="none">
                <circle cy={-46} r={7} fill={color} />
                <rect x={-6} y={-39} width={12} height={22} fill={color} />
                <line x1={-3} y1={-17} x2={-5} y2={0} stroke={color} strokeWidth={3} />
                <line x1={3} y1={-17} x2={5} y2={0} stroke={color} strokeWidth={3} />
              </g>
            </svg>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Idź w lewo"
              onPointerDown={() => startHold(-STEP)}
              onPointerUp={stopHold}
              onPointerLeave={stopHold}
              onKeyDown={(e) => e.key === 'Enter' && move(-STEP * 4)}
              className="touch-none border-2 p-2"
              style={{ borderColor: color }}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="h-1.5 flex-1 bg-muted">
              <div className="h-1.5" style={{ width: `${(cam / maxCam) * 100}%`, background: color }} />
            </div>
            <button
              type="button"
              aria-label="Idź w prawo"
              onPointerDown={() => startHold(STEP)}
              onPointerUp={stopHold}
              onPointerLeave={stopHold}
              onKeyDown={(e) => e.key === 'Enter' && move(STEP * 4)}
              className="touch-none border-2 p-2"
              style={{ borderColor: color }}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {pendingThing && (
            <div className="space-y-1.5 border-2 p-3" style={{ borderColor: color }}>
              <p className="text-sm font-semibold">Dlaczego {pendingThing.name} nie pasuje do 44 r. p.n.e.?</p>
              {REASONS.map((r) => (
                <button key={r.id} type="button" onClick={() => choose(r.id)} className="block w-full border bg-white px-3 py-1.5 text-left text-sm dark:bg-zinc-900">
                  {r.label}
                </button>
              ))}
            </div>
          )}

          <div aria-live="polite" className="min-h-[2.5rem] text-sm leading-relaxed">
            {note && <p className={note.ok ? '' : 'text-muted-foreground'}>{note.ok ? `✓ ${note.text}` : note.text}</p>}
          </div>

          <button
            type="button"
            disabled={!reachedEnd}
            onClick={finishWalk}
            className="inline-flex items-center gap-1.5 border-2 px-3 py-1.5 text-sm font-semibold disabled:opacity-50"
            style={{ borderColor: color, color }}
          >
            <Footprints className="h-4 w-4" aria-hidden />
            {reachedEnd ? 'Koniec spaceru' : 'Dojdź do końca ulicy'}
          </button>
        </>
      )}

      {phase === 'ocena' && first && (
        <div className="space-y-3 text-sm leading-relaxed">
          <p>
            Znalazłeś/łaś <strong>{first.found.length} z {ANACHRONISMS}</strong>{' '}
            {plural(ANACHRONISMS, { one: 'anachronizmu', few: 'anachronizmów', many: 'anachronizmów' })}. Teraz oceń grę jak
            historyk — wybierz kafelki.
          </p>
          <TileGroup label="Gra dobrze oddaje…" options={GOOD} value={good} onChange={setGood} color={color} />
          <TileGroup label="Gra myli się, bo…" options={BAD} value={bad} onChange={setBad} color={color} />
          <button
            type="button"
            disabled={!good.length || !bad.length}
            onClick={() => setPhase('raport')}
            className="border-2 px-3 py-1.5 font-semibold disabled:opacity-50"
            style={{ borderColor: color, color }}
          >
            Zapisz ocenę gry
          </button>
        </div>
      )}

      {(phase === 'raport' || phase === 'porownanie' || (phase === 'gra' && player === 2)) && first && (
        <div className="space-y-2 border-2 bg-white p-4 text-sm leading-relaxed dark:bg-zinc-900/70" style={{ borderColor: color }}>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Raport z oceny gry „Spacer po Rzymie w 44 r. p.n.e.”</p>
          <p>
            Znalezione anachronizmy: <strong>{first.found.length} z {ANACHRONISMS}</strong>
            {first.wrongTaps > 0 && `, fałszywe alarmy: ${first.wrongTaps}`}.
          </p>
          <p>
            <strong>Gra dobrze oddaje:</strong> {good.join(', ')}.
          </p>
          <p>
            <strong>Gra myli się, bo:</strong> {bad.join(', ')}.
          </p>
          <p className="text-muted-foreground">
            Ocena: {first.found.length >= 6 ? 'gra przydaje się jako zabawa, ale nie jako źródło wiedzy — trzeba ją sprawdzać.' : 'w tej grze jest więcej pułapek, niż widać na pierwszy rzut oka.'}
          </p>
        </div>
      )}

      {phase === 'raport' && (
        <div className="space-y-2 text-sm leading-relaxed">
          <p>
            Gry, filmy i komiksy o przeszłości często mieszają epoki — bo twórcom zależy na efekcie, a nie na prawdzie.
            Teraz wiesz, jak je sprawdzać. <strong>Podaj urządzenie komuś z domu</strong> i zobacz, ile anachronizmów
            znajdzie.
          </p>
          <button type="button" onClick={startSecond} className="border-2 px-3 py-1.5 font-semibold" style={{ borderColor: color, color }}>
            Podaj urządzenie — spacer domownika
          </button>
        </div>
      )}

      {phase === 'porownanie' && first && (
        <p className="border-2 p-3 text-sm leading-relaxed" style={{ borderColor: color }}>
          <strong>Ty: {first.found.length}, domownik: {round.found.length}</strong> z {ANACHRONISMS}.{' '}
          {round.found.length < ANACHRONISMS
            ? 'Pokaż domownikowi, czego nie zauważył — i powiedz mu, skąd wiesz, że to nie pasuje.'
            : 'Domownik znalazł wszystkie — zapytaj, po czym je poznał.'}
        </p>
      )}
    </div>
  );
}

function TileGroup({ label, options, value, onChange, color }: { label: string; options: string[]; value: string[]; onChange: (v: string[]) => void; color: string }) {
  return (
    <fieldset>
      <legend className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</legend>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => {
          const on = value.includes(o);
          return (
            <button
              key={o}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(on ? value.filter((v) => v !== o) : [...value, o])}
              className={cn('border-2 bg-white px-2.5 py-1 text-sm dark:bg-zinc-900', on && 'font-semibold')}
              style={{ borderColor: on ? color : 'var(--border)' }}
            >
              {o}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

/** Ulica Rzymu — rysowana kodem, każda rzecz w swojej grupie. */
function Scene({ thing }: { thing: (id: string, children: ReactNode) => ReactNode }) {
  const G = GROUND;
  return (
    <g>
      <rect x={0} y={G} width={SCENE_W} height={VIEW_H - G} fill="#cbb994" />
      {Array.from({ length: 72 }, (_, i) => (
        <line key={i} x1={i * 20} x2={i * 20 + 10} y1={G + 12} y2={G + 12} stroke="#a8956e" strokeWidth={2} />
      ))}
      {/* Tło: wzgórza. */}
      <path d={`M0,${G - 60} Q300,${G - 120} 600,${G - 70} T1440,${G - 80} L1440,${G} L0,${G} Z`} fill="#c9d8b4" opacity={0.6} />

      {thing(
        'akwedukt',
        <g fill="#d8cdb6" stroke="#a89878" strokeWidth={1}>
          <rect x={10} y={120} width={170} height={10} />
          {Array.from({ length: 6 }, (_, i) => (
            <path key={i} d={`M${12 + i * 28},${G - 40} L${12 + i * 28},130 L${36 + i * 28},130 L${36 + i * 28},${G - 40} Q${24 + i * 28},${G - 70} ${12 + i * 28},${G - 40} Z`} />
          ))}
        </g>
      )}

      {thing(
        'szyby',
        <g>
          <rect x={175} y={70} width={115} height={G - 70} fill="#d9b48f" stroke="#8b6a4a" />
          <rect x={170} y={62} width={125} height={10} fill="#a0522d" />
          {Array.from({ length: 4 }, (_, r) =>
            Array.from({ length: 3 }, (_, c) => (
              <g key={`${r}-${c}`}>
                <rect x={188 + c * 34} y={84 + r * 40} width={20} height={24} fill="#bfdbfe" stroke="#475569" />
                <line x1={198 + c * 34} x2={198 + c * 34} y1={84 + r * 40} y2={108 + r * 40} stroke="#475569" />
                <line x1={188 + c * 34} x2={208 + c * 34} y1={96 + r * 40} y2={96 + r * 40} stroke="#475569" />
              </g>
            ))
          )}
        </g>
      )}

      {thing(
        'cyfry',
        <g>
          <rect x={318} y={150} width={84} height={G - 150} fill="#e7d3b0" stroke="#8b6a4a" />
          <rect x={335} y={195} width={50} height={G - 195} fill="#5b4a36" />
          <rect x={326} y={158} width={68} height={26} fill="#fef3c7" stroke="#78350f" />
          <text x={360} y={177} textAnchor="middle" fontSize={18} fontWeight={700} fill="#78350f">
            25
          </text>
        </g>
      )}

      {/* Stragan: blat (tło), chleb i pomidory jako osobne rzeczy. */}
      <rect x={428} y={208} width={112} height={8} fill="#8b6a4a" />
      <rect x={432} y={216} width={6} height={G - 216} fill="#8b6a4a" />
      <rect x={530} y={216} width={6} height={G - 216} fill="#8b6a4a" />
      {thing(
        'chleb',
        <g>
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <circle cx={443 + i * 13} cy={200} r={7} fill="#b7793a" />
              <line x1={436 + i * 13} x2={450 + i * 13} y1={200} y2={200} stroke="#7c4a1e" />
              <line x1={443 + i * 13} x2={443 + i * 13} y1={193} y2={207} stroke="#7c4a1e" />
            </g>
          ))}
        </g>
      )}
      {thing(
        'pomidory',
        <g>
          <path d="M488,206 L522,206 L518,190 L492,190 Z" fill="#b08850" />
          {[0, 1, 2, 3].map((i) => (
            <circle key={i} cx={495 + i * 7} cy={187 - (i % 2) * 3} r={5} fill="#dc2626" />
          ))}
        </g>
      )}

      {thing(
        'toga',
        <g>
          <circle cx={600} cy={180} r={8} fill="#c08a5a" />
          <path d={`M588,190 L612,190 L618,${G} L582,${G} Z`} fill="#f5f5f4" stroke="#a8a29e" />
          <path d={`M588,192 L612,${G - 20}`} stroke="#d6d3d1" strokeWidth={4} />
        </g>
      )}

      {thing(
        'strzemiona',
        <g>
          <path d={`M680,${G - 40} q30,-12 60,0 l0,22 l-6,18 l-4,0 l0,-16 l-40,0 l0,16 l-4,0 l-6,-18 Z`} fill="#7c5a3a" />
          <path d={`M736,${G - 42} l12,-16 l8,4 l-8,16`} fill="#7c5a3a" />
          <circle cx={710} cy={G - 74} r={7} fill="#c08a5a" />
          <rect x={704} y={G - 67} width={12} height={22} fill="#991b1b" />
          <line x1={708} x2={702} y1={G - 45} y2={G - 26} stroke="#991b1b" strokeWidth={4} />
          {/* Strzemię. */}
          <path d={`M700,${G - 36} l0,10 l6,0 l0,-10`} fill="none" stroke="#e5e7eb" strokeWidth={2.5} />
        </g>
      )}

      {thing(
        'swiatynia',
        <g fill="#f1ece0" stroke="#a8a29e">
          <path d={`M780,120 L840,92 L900,120 Z`} />
          <rect x={782} y={120} width={116} height={14} />
          <text x={840} y={131} textAnchor="middle" fontSize={10} fontWeight={700} fill="#57534e" stroke="none">
            S·P·Q·R
          </text>
          {Array.from({ length: 6 }, (_, i) => (
            <rect key={i} x={788 + i * 19} y={134} width={8} height={G - 150} />
          ))}
          <rect x={778} y={G - 16} width={124} height={16} />
        </g>
      )}

      {thing(
        'koloseum',
        <g opacity={0.75}>
          <path d={`M910,${G - 40} L910,110 Q960,96 1010,110 L1010,${G - 40} Z`} fill="#e2d6bf" stroke="#b5a585" />
          {[0, 1, 2].map((r) =>
            Array.from({ length: 6 }, (_, c) => <rect key={`${r}-${c}`} x={915 + c * 16} y={120 + r * 28} width={9} height={18} rx={4} fill="#b5a585" />)
          )}
        </g>
      )}

      {thing(
        'krzyz',
        <g>
          <rect x={1040} y={150} width={60} height={G - 150} fill="#e7e2d8" stroke="#a8a29e" />
          <path d="M1036,150 L1070,118 L1104,150 Z" fill="#a0522d" />
          <rect x={1067} y={92} width={6} height={28} fill="#57534e" />
          <rect x={1059} y={100} width={22} height={6} fill="#57534e" />
          <rect x={1060} y={200} width={20} height={G - 200} fill="#78350f" />
        </g>
      )}

      {thing(
        'zegar',
        <g>
          <rect x={1160} y={70} width={44} height={G - 70} fill="#d6cbb5" stroke="#a8956e" />
          <path d="M1156,70 L1182,40 L1208,70 Z" fill="#7c2d12" />
          <circle cx={1182} cy={100} r={15} fill="#fff" stroke="#44403c" strokeWidth={2} />
          <line x1={1182} x2={1182} y1={100} y2={89} stroke="#111" strokeWidth={2} />
          <line x1={1182} x2={1191} y1={100} y2={104} stroke="#111" strokeWidth={2} />
        </g>
      )}

      {thing(
        'amfory',
        <g fill="#c2703d" stroke="#7c3a17">
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M${1262 + i * 16},${G} q-8,-20 0,-40 l0,-8 l6,0 l0,8 q8,20 0,40 Z`} />
          ))}
        </g>
      )}

      {thing(
        'fontanna',
        <g>
          <rect x={1330} y={G - 30} width={60} height={30} fill="#d6d3d1" stroke="#a8a29e" />
          <rect x={1356} y={G - 60} width={8} height={30} fill="#d6d3d1" stroke="#a8a29e" />
          <path d={`M1364,${G - 56} q14,4 18,24`} stroke="#3b82f6" strokeWidth={3} fill="none" />
        </g>
      )}
    </g>
  );
}
