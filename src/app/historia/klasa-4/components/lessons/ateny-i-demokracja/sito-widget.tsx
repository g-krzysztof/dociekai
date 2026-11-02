'use client';

import { useRef, useState, type PointerEvent } from 'react';
import { cn } from '@/lib/utils';
import { plural } from '@/lib/plural';
import { Postac, GroupLegend } from './postac';
import { CLAUSES, COLS, PEOPLE, passes, remaining, tally, type ClauseId } from './tlum';

/**
 * Blok 1 — **Kto może głosować?** Sto mieszkańców Aten. Dziecko przewiduje,
 * ilu z nich zagłosuje, a potem przeciąga sito z kolejnym warunkiem prawa przez
 * tłum — kto warunku nie spełnia, blednie. Zostaje kilkunastu; dopiero oni
 * głosują nad flotą, a wynik porównuje się z głosem wszystkich stu.
 */
const CW = 40;
const CH = 44;
const W = COLS * CW;
const ROWS = Math.ceil(PEOPLE.length / COLS);
const H = ROWS * CH + 8;
const at = (i: number) => ({ x: (i % COLS) * CW + CW / 2, y: Math.floor(i / COLS) * CH + CH - 4 });

export function SitoWidget({ color, onDone }: { color: string; onDone: () => void }) {
  const [guess, setGuess] = useState(50);
  const [guessed, setGuessed] = useState(false);
  const [applied, setApplied] = useState<ClauseId[]>([]);
  const [loaded, setLoaded] = useState<ClauseId | null>(null);
  const [sieveY, setSieveY] = useState(0);
  const [out, setOut] = useState<Set<number>>(() => new Set());
  const [voted, setVoted] = useState(false);
  const [allVote, setAllVote] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);
  const reported = useRef(false);

  const left = remaining(applied);
  const done = applied.length === CLAUSES.length;

  const move = (e: PointerEvent<SVGSVGElement>) => {
    if (!dragging.current || !loaded) return;
    const box = svgRef.current!.getBoundingClientRect();
    const y = Math.max(0, Math.min(H, ((e.clientY - box.top) * (W + 40)) / box.width - 6));
    if (y <= sieveY) return; // sito idzie tylko w dół
    const passed = PEOPLE.filter((p) => {
      const py = at(p.id).y - 12;
      return py > sieveY && py <= y && !out.has(p.id) && !passes(p, loaded);
    });
    if (passed.length) setOut((prev) => new Set([...prev, ...passed.map((p) => p.id)]));
    setSieveY(y);
    if (y >= H - 2) {
      dragging.current = false;
      setApplied((prev) => [...prev, loaded]);
      setLoaded(null);
      setSieveY(0);
    }
  };

  const showAll = () => {
    setAllVote(true);
    if (!reported.current) {
      reported.current = true;
      onDone();
    }
  };

  const t = tally(left);
  const tAll = tally(PEOPLE);

  return (
    <div className="space-y-4">
      {!guessed ? (
        <div className="space-y-2 text-sm">
          <p className="leading-relaxed">
            Oto stu mieszkańców Aten około 430 roku p.n.e. — całe rodziny, z dziećmi i niewolnikami.{' '}
            <strong>Jak myślisz, ilu z nich mogło głosować na zgromadzeniu?</strong>
          </p>
          <div className="flex items-center gap-3">
            <input type="range" min={0} max={100} value={guess} onChange={(e) => setGuess(Number(e.target.value))} className="w-full max-w-xs" style={{ accentColor: color }} aria-label="Przewidywanie" />
            <strong className="w-10 tabular-nums">{guess}</strong>
            <button type="button" onClick={() => setGuessed(true)} className="border-2 px-3 py-1.5 font-semibold" style={{ borderColor: color, color }}>
              Zapisz
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm leading-relaxed">
          {done ? (
            <>
              Twoje przewidywanie: {guess}. Głosować może <strong>{left.length}</strong> ze stu — mniej więcej co
              siódmy mieszkaniec.
            </>
          ) : (
            <>
              Prawo Aten mówi, kto jest obywatelem. <strong>Wybierz warunek i przeciągnij sito w dół przez tłum</strong>{' '}
              — kto go nie spełnia, odpada. Stoi jeszcze: <strong>{left.length}</strong>.
            </>
          )}
        </p>
      )}

      {guessed && !done && (
        <div className="flex flex-wrap gap-2">
          {CLAUSES.map((c) => {
            const used = applied.includes(c.id);
            return (
              <button
                key={c.id}
                type="button"
                disabled={used || (loaded !== null && sieveY > 0)}
                onClick={() => {
                  setLoaded(c.id);
                  setSieveY(0);
                }}
                className={cn('border-2 px-3 py-1.5 text-sm', used ? 'line-through opacity-40' : 'bg-white dark:bg-zinc-900', loaded === c.id && 'font-semibold')}
                style={loaded === c.id ? { borderColor: color, color } : undefined}
              >
                {c.text}
              </button>
            );
          })}
        </div>
      )}

      <div className="mx-auto max-w-[460px]">
        <svg
          ref={svgRef}
          viewBox={`-6 -6 ${W + 40} ${H + 12}`}
          className={cn('w-full border bg-[#f7f1e3] dark:bg-zinc-900', loaded && 'touch-none')}
          role="img"
          aria-label={`Tłum stu mieszkańców Aten; głosować może jeszcze ${left.length}`}
          onPointerDown={(e) => {
            if (!loaded) return;
            dragging.current = true;
            e.currentTarget.setPointerCapture(e.pointerId);
            move(e);
          }}
          onPointerMove={move}
          onPointerUp={() => (dragging.current = false)}
          onPointerCancel={() => (dragging.current = false)}
        >
          {PEOPLE.map((p) => {
            const { x, y } = at(p.id);
            const isIn = !out.has(p.id);
            const hand = (voted && isIn && done) || allVote ? (p.za ? 'za' : 'przeciw') : undefined;
            return <Postac key={p.id} p={p} x={x} y={y} dim={!isIn && !allVote} hand={hand} />;
          })}
          {loaded && (
            <g className="cursor-ns-resize">
              <rect x={-6} y={sieveY - 4} width={W + 40} height={8} fill={color} opacity="0.85" />
              <path d={`M0,${sieveY} H${W}`} stroke="white" strokeWidth="1" strokeDasharray="3 3" />
              <rect x={W + 6} y={sieveY - 16} width={26} height={32} fill="white" stroke={color} strokeWidth="2" />
              <path d={`M${W + 13},${sieveY - 4} l6,8 l6,-8`} fill="none" stroke={color} strokeWidth="2" />
            </g>
          )}
        </svg>
      </div>
      <GroupLegend />

      {loaded && (
        <p className="text-sm text-muted-foreground" role="status">
          Sito: „{CLAUSES.find((c) => c.id === loaded)!.text}” — ciągnij w dół (uchwyt po prawej albo w dowolnym miejscu tłumu).
        </p>
      )}
      {applied.length > 0 && !done && (
        <p className="text-sm">
          Odpadli: {applied.map((a) => CLAUSES.find((c) => c.id === a)!.out).join(', ')}.
        </p>
      )}

      {done && !voted && (
        <div className="space-y-2 border-t pt-3 text-sm">
          <p>
            Zgromadzenie na wzgórzu Pnyks. Sprawa: <strong>czy Ateny mają zbudować sto nowych okrętów?</strong>
          </p>
          <button type="button" onClick={() => setVoted(true)} className="border-2 px-3 py-1.5 font-semibold text-white" style={{ background: color, borderColor: color }}>
            Głosujcie!
          </button>
        </div>
      )}
      {voted && (
        <div className="space-y-2 border-l-4 p-3 text-sm leading-relaxed" style={{ borderColor: color }}>
          <p>
            Za: <strong>{t.za}</strong>, przeciw: <strong>{t.przeciw}</strong> — Ateny budują flotę. O wojnie, podatkach i
            pieniądzach miasta {plural(left.length, { one: 'decydował', few: 'decydowało', many: 'decydowało' })} {left.length}{' '}
            ze stu.
          </p>
          {!allVote ? (
            <button type="button" onClick={showAll} className="border-2 px-3 py-1.5 font-semibold" style={{ borderColor: color, color }}>
              A gdyby głosowali wszyscy?
            </button>
          ) : (
            <p>
              Gdyby głosowała cała setka: za {tAll.za}, przeciw {tAll.przeciw} — floty by nie było. (Zdania naszych stu
              osób są wymyślone; prawdziwe jest to, kto mógł głosować.) Ubodzy obywatele chcieli floty, bo wiosłowali
              na okrętach i dostawali za to zapłatę.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
