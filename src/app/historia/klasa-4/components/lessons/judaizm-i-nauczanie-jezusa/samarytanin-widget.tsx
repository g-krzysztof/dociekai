'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { plural } from '@/lib/plural';
import { DragGhost, useDragToken } from '../../family-tree/use-drag-token';
import { betVerdict, CIRCLE_PEOPLE, judgeNeighbour, leftOut, WALKERS, type WalkerId } from './samarytanin';

type Phase = 'zaklad' | 'scena' | 'pytanie' | 'krag' | 'gotowe';

const ROBE: Record<WalkerId, string> = { kaplan: '#e7e5e4', lewita: '#a8a29e', samarytanin: '#b45309' };
/** Ranny leży przy drodze w tym miejscu sceny. */
const HURT_X = 300;
const ROAD_Y = 150;

/** Kolejne pozycje przechodnia (x, y): z lewej do rannego, potem dalej albo drugą stroną drogi. */
function path(w: WalkerId): [number, number][] {
  if (w === 'samarytanin') return [[30, ROAD_Y], [270, ROAD_Y], [280, ROAD_Y + 8]];
  return [[30, ROAD_Y], [220, ROAD_Y], [300, ROAD_Y - 44], [380, ROAD_Y - 44], [640, ROAD_Y]];
}

function Figure({ x, y, robe, label, onClick, active }: { x: number; y: number; robe: string; label?: string; onClick?: () => void; active?: boolean }) {
  return (
    <g
      style={{ transform: `translate(${x}px, ${y}px)`, transition: 'transform 1.1s linear' }}
      onClick={onClick}
      className={cn(onClick && 'cursor-pointer')}
    >
      {onClick && <rect x={-22} y={-62} width={44} height={74} fill="transparent" />}
      <path d="M-11,0 L-7,-34 L7,-34 L11,0 Z" fill={robe} stroke={active ? '#111' : '#57534e'} strokeWidth={active ? 2.5 : 1.2} />
      <circle cx={0} cy={-42} r={8} fill="#c8a07a" stroke="#57534e" strokeWidth={1.2} />
      <path d="M-9,-44 Q0,-56 9,-44" fill={robe} stroke="#57534e" strokeWidth={1} />
      {label && (
        <text y={22} textAnchor="middle" fontSize={13} fontWeight={600} fill="#111" stroke="#fff" strokeWidth={3} paintOrder="stroke">
          {label}
        </text>
      )}
    </g>
  );
}

/**
 * Blok 4 — **Kto jest bliźnim?** Gesty: moneta stawiana na przechodnia, który
 * — zdaniem dziecka — pomoże rannemu (przeciąganie albo stuk-stuk); scena
 * rozgrywa się sama, przechodzień po przechodniu; pytanie Jezusa z końca
 * przypowieści — odpowiedź stuknięciem w postać; na końcu dziecko układa
 * własny krąg bliźnich (bez oceny) i porównuje go z kręgiem z przypowieści.
 * `onDone` po porównaniu.
 */
export function SamarytaninWidget({ color, onDone }: { color: string; onDone: () => void }) {
  const [phase, setPhase] = useState<Phase>('zaklad');
  const [bet, setBet] = useState<WalkerId | null>(null);
  const [walker, setWalker] = useState(0);
  const [stepI, setStepI] = useState(0);
  const [seen, setSeen] = useState<WalkerId[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [inside, setInside] = useState<Set<string>>(new Set());
  const [picked, setPicked] = useState<string | null>(null);
  const [compared, setCompared] = useState(false);
  const reported = useRef(false);

  const current = WALKERS[walker];
  const walking = phase === 'scena' && current && !seen.includes(current.id);

  // Przechodzień idzie sam — co 1,1 s następny punkt trasy.
  useEffect(() => {
    if (!walking) return;
    const pts = path(current.id);
    if (stepI >= pts.length - 1) {
      const id = window.setTimeout(() => setSeen((s) => [...s, current.id]), 500);
      return () => window.clearTimeout(id);
    }
    const id = window.setTimeout(() => setStepI((i) => i + 1), stepI === 0 ? 150 : 1100);
    return () => window.clearTimeout(id);
  }, [walking, stepI, current]);

  const nextWalker = () => {
    if (walker + 1 >= WALKERS.length) {
      setPhase('pytanie');
      return;
    }
    setWalker(walker + 1);
    setStepI(0);
  };

  const drop = (token: string, target: string | null) => {
    setPicked(null);
    if (token === 'moneta') {
      if (!target?.startsWith('w:')) return;
      setBet(target.slice(2) as WalkerId);
      return;
    }
    if (phase === 'krag' && (target === 'in' || target === 'out')) {
      setInside((prev) => {
        const next = new Set(prev);
        if (target === 'in') next.add(token);
        else next.delete(token);
        return next;
      });
    }
  };

  const { drag, hover, bind } = useDragToken({
    onDrop: drop,
    onTap: (id) => setPicked((p) => (p === id ? null : id)),
    disabled: phase === 'scena' || phase === 'pytanie' || phase === 'gotowe' || compared,
  });

  const tapTarget = (target: string) => {
    if (picked) drop(picked, target);
  };

  const answer = (id: WalkerId) => {
    if (phase !== 'pytanie' || answered) return;
    const v = judgeNeighbour(id);
    if (!v.ok) {
      setMsg(v.message);
      return;
    }
    setMsg(null);
    setAnswered(true);
  };

  const compare = () => {
    setCompared(true);
    if (!reported.current) {
      reported.current = true;
      setPhase('gotowe');
      onDone();
    }
  };

  const out = leftOut(inside);
  const pos = current ? path(current.id)[Math.min(stepI, path(current.id).length - 1)] : [0, 0];
  const helped = seen.includes('samarytanin');

  return (
    <div className="space-y-3">
      {phase === 'zaklad' && (
        <>
          <p className="text-sm leading-relaxed">
            Ktoś zapytał Jezusa: „Przykazanie mówi: kochaj bliźniego. A kto jest moim bliźnim?”. Jezus odpowiedział opowieścią.
            Na pustynnej drodze z Jerozolimy do Jerycha zbójcy napadli podróżnego, zabrali mu wszystko i zostawili rannego. Drogą
            nadejdzie trzech ludzi. <strong>Postaw monetę na tego, który — Twoim zdaniem — pomoże.</strong>
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              {...bind('moneta')}
              aria-label="Moneta zakładu"
              className={cn('h-12 w-12 shrink-0 touch-none rounded-full border-2 border-amber-700 bg-amber-300 text-xs font-bold text-amber-900', drag?.id === 'moneta' && 'opacity-30')}
              style={picked === 'moneta' ? { boxShadow: `0 0 0 3px ${color}` } : undefined}
            >
              denar
            </button>
            <span className="text-xs text-muted-foreground">Przeciągnij monetę na przechodnia albo stuknij ją, a potem przechodnia.</span>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            {WALKERS.map((w) => {
              const id = `w:${w.id}`;
              return (
                <div
                  key={w.id}
                  data-drop={id}
                  onClick={() => tapTarget(id)}
                  className={cn('border-2 bg-white p-3 text-sm leading-snug dark:bg-zinc-900', picked && 'cursor-pointer')}
                  style={{ borderColor: hover === id || bet === w.id ? color : undefined }}
                >
                  <div className="mb-1 flex items-center justify-between">
                    <strong>{w.name}</strong>
                    {bet === w.id && <span className="h-6 w-6 rounded-full border-2 border-amber-700 bg-amber-300" aria-label="tu stoi moneta" />}
                  </div>
                  {w.who}
                </div>
              );
            })}
          </div>
          {bet && (
            <button
              type="button"
              onClick={() => setPhase('scena')}
              className="border-2 px-3 py-1.5 text-sm font-semibold"
              style={{ borderColor: color, color }}
            >
              Zobacz, co się stało
            </button>
          )}
        </>
      )}

      {phase !== 'zaklad' && phase !== 'krag' && phase !== 'gotowe' && (
        <div className="mx-auto max-w-[620px] overflow-hidden border bg-[#f4ead6]">
          <svg viewBox="0 0 600 220" className="block h-auto w-full select-none" role="img" aria-label="Pustynna droga z Jerozolimy do Jerycha, przy drodze leży ranny podróżny">
            <path d="M0,70 Q80,30 160,60 T320,50 T480,60 T600,40 L600,0 L0,0 Z" fill="#e9dcc0" />
            <path d="M0,90 Q120,60 240,85 T480,80 T600,90 L600,70 Q480,50 320,60 T0,70 Z" fill="#ddc9a3" opacity={0.7} />
            <rect x={0} y={ROAD_Y - 60} width={600} height={80} fill="#d6c3a0" />
            <line x1={0} x2={600} y1={ROAD_Y - 20} y2={ROAD_Y - 20} stroke="#c2ad85" strokeDasharray="10 12" />
            <text x={8} y={ROAD_Y + 50} fontSize={12} fill="#57534e">
              ← z Jerozolimy
            </text>
            <text x={592} y={ROAD_Y + 50} fontSize={12} fill="#57534e" textAnchor="end">
              do Jerycha →
            </text>
            {/* Ranny. */}
            <g transform={`translate(${HURT_X + 18} ${ROAD_Y + 6})`}>
              <path d="M-26,0 L18,0 L18,-10 L-26,-10 Z" fill="#f5f5f4" stroke="#57534e" strokeWidth={1.2} />
              <circle cx={26} cy={-6} r={7} fill="#c8a07a" stroke="#57534e" strokeWidth={1.2} />
              {helped && <path d="M21,-11 L31,-11" stroke="#fff" strokeWidth={3} />}
            </g>
            {phase === 'scena' && current && <Figure key={current.id} x={pos[0]} y={pos[1]} robe={ROBE[current.id]} label={current.name} />}
            {phase === 'pytanie' &&
              WALKERS.map((w, i) => (
                <Figure key={w.id} x={140 + i * 160} y={ROAD_Y + 4} robe={ROBE[w.id]} label={w.name} onClick={() => answer(w.id)} active={answered && w.id === 'samarytanin'} />
              ))}
          </svg>
        </div>
      )}

      {phase === 'scena' && (
        <div aria-live="polite" className="space-y-2 text-sm leading-relaxed">
          {WALKERS.filter((w) => seen.includes(w.id)).map((w) => (
            <p key={w.id}>
              <strong>{w.name}.</strong> {w.act}
            </p>
          ))}
          {current && seen.includes(current.id) && (
            <button type="button" onClick={nextWalker} className="border-2 px-3 py-1.5 text-sm font-semibold" style={{ borderColor: color, color }}>
              {walker + 1 < WALKERS.length ? 'Nadchodzi następny' : 'Dalej'}
            </button>
          )}
        </div>
      )}

      {phase === 'pytanie' && (
        <div className="space-y-2 text-sm leading-relaxed">
          {bet && <p className="border-l-2 pl-3" style={{ borderColor: color }}>{betVerdict(bet)}</p>}
          <p>
            Na koniec Jezus odwrócił pytanie: <strong>„Który z tych trzech okazał się bliźnim dla rannego?”</strong> Stuknij go na
            drodze.
          </p>
          {msg && <p className="text-destructive">{msg}</p>}
          {answered && (
            <>
              <p>
                Tak. Jezus zakończył: „Idź i ty czyń podobnie”. Bliźni to nie tylko „swój” — to każdy, kto potrzebuje pomocy. Ta
                przypowieść pochodzi z Ewangelii Łukasza; chrześcijanie opowiadają ją do dziś, a słowo „samarytanin” znaczy
                w wielu językach: ktoś, kto bezinteresownie pomaga obcemu.
              </p>
              <button type="button" onClick={() => setPhase('krag')} className="border-2 px-3 py-1.5 text-sm font-semibold" style={{ borderColor: color, color }}>
                A Twój krąg?
              </button>
            </>
          )}
        </div>
      )}

      {(phase === 'krag' || phase === 'gotowe') && (
        <div className="space-y-3">
          <p className="text-sm leading-relaxed">
            Kogo Ty uważasz za swojego bliźniego — kogo byś zatrzymał(a) się ratować? <strong>Wstaw do kręgu, kogo chcesz.</strong> Tu
            nie ma złych odpowiedzi — to Twoje zdanie.
          </p>
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <div
              data-drop="in"
              onClick={() => tapTarget('in')}
              className={cn('relative flex min-h-[13rem] flex-wrap content-center items-center justify-center gap-2 rounded-full border-2 p-8 transition-all duration-700', compared ? 'border-transparent' : 'border-dashed')}
              style={{ borderColor: compared ? 'transparent' : hover === 'in' ? color : undefined, background: `${color}10` }}
            >
              <span className="absolute left-1/2 top-3 -translate-x-1/2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                moi bliźni
              </span>
              {CIRCLE_PEOPLE.filter((p) => compared || inside.has(p.id)).map((p) => (
                <span
                  key={p.id}
                  {...(compared ? {} : bind(p.id))}
                  onClick={(e) => e.stopPropagation()}
                  className={cn('touch-none border-2 bg-white px-2 py-1 text-xs dark:bg-zinc-900', !inside.has(p.id) && compared && 'border-dashed')}
                  style={{ borderColor: picked === p.id ? color : undefined }}
                >
                  {p.label}
                </span>
              ))}
            </div>
            {!compared && (
              <div data-drop="out" onClick={() => tapTarget('out')} className="flex min-h-[4rem] flex-wrap content-start gap-2 border border-dashed p-2 sm:w-48">
                <span className="w-full text-xs text-muted-foreground">poza kręgiem</span>
                {out.map((p) => (
                  <span
                    key={p.id}
                    {...bind(p.id)}
                    onClick={(e) => e.stopPropagation()}
                    className={cn('touch-none border-2 bg-white px-2 py-1 text-xs dark:bg-zinc-900', drag?.id === p.id && 'opacity-30')}
                    style={{ borderColor: picked === p.id ? color : undefined }}
                  >
                    {p.label}
                  </span>
                ))}
              </div>
            )}
          </div>
          {!compared && (
            <button type="button" onClick={compare} className="border-2 px-3 py-1.5 text-sm font-semibold" style={{ borderColor: color, color }}>
              Porównaj z przypowieścią
            </button>
          )}
          {compared && (
            <div className="space-y-2 border-2 p-3 text-sm leading-relaxed" style={{ borderColor: color }}>
              <p>
                {out.length === 0
                  ? 'Twój krąg obejmował wszystkich — tak jak krąg z przypowieści.'
                  : `Poza Twoim kręgiem ${plural(out.length, { one: 'została jedna osoba', few: `zostały ${out.length} osoby`, many: `zostało ${out.length} osób` })}. W przypowieści krąg nie ma granicy: Samarytanin pomógł komuś obcemu, kto mógł go nawet nie lubić.`}{' '}
                Tak właśnie nauczał Jezus: kochaj Boga i kochaj bliźniego — każdego człowieka, także obcego i nielubianego.
                Wielu ludzi, wierzących i niewierzących, uważa tę zasadę za ważną do dziś.
              </p>
              <p>
                Jezusa słuchali uczniowie. Dwunastu najbliższych nazywano <strong>apostołami</strong> — po grecku „wysłannikami”.
                Po jego śmierci to oni ponieśli jego nauczanie dalej, do innych miast. Chrześcijanie wierzą, że Jezus jest
                Mesjaszem — po grecku <em>Chrystusem</em> — i Synem Bożym, że umarł na krzyżu i zmartwychwstał. Większość Żydów
                nie uznała go za Mesjasza i dalej na niego czeka. Tak z judaizmu wyrosła nowa religia — <strong>chrześcijaństwo</strong>:
                z tym samym jednym Bogiem i tym samym Dekalogiem.
              </p>
            </div>
          )}
        </div>
      )}

      <DragGhost drag={drag}>
        {drag?.id === 'moneta' ? (
          <div className="h-12 w-12 rounded-full border-2 border-amber-700 bg-amber-300" />
        ) : (
          <div className="border-2 bg-white px-2 py-1 text-xs dark:bg-zinc-900" style={{ borderColor: color }}>
            {CIRCLE_PEOPLE.find((p) => p.id === drag?.id)?.label}
          </div>
        )}
      </DragGhost>
    </div>
  );
}
