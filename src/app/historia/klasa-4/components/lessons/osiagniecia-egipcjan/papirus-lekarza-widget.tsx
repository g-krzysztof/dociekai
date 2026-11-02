'use client';

import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  PRESS_MS,
  RECIPES,
  STRIPS,
  judgeMarks,
  judgeSheet,
  stripKey,
  type Dir,
  type Mark,
  type Strip,
} from './papirus';

/**
 * Blok 4 L21 — **papirus lekarza**. Najpierw dziecko robi kartkę:
 * **pociągnięciem palca kładzie paski** (pionowe pociągnięcie = pionowy
 * pasek w tej kolumnie, poziome = poziomy w tym wierszu), potem **trzyma
 * kamień**, aż warstwy się skleją. Sędzia wymaga dwóch pełnych warstw na
 * krzyż. Na gotowej kartce pojawiają się przepisy lekarzy, które dziecko
 * zakreśla dwoma kolorami według reguły: działa przez ciało czy przez słowa.
 */

const SIZE = 280;
const CELL = SIZE / STRIPS;
const MIN_SWIPE = 24;

const MARKS: Record<Mark, { label: string; hint: string; bg: string }> = {
  cialo: {
    label: 'Ciało',
    hint: 'lekarz coś robi z ciałem albo coś na nie kładzie',
    bg: 'bg-emerald-200/80 dark:bg-emerald-700/60',
  },
  slowa: {
    label: 'Słowa i wiara',
    hint: 'działać mają zaklęcie, amulet albo bóstwo',
    bg: 'bg-violet-200/80 dark:bg-violet-700/60',
  },
};

export function PapirusLekarzaWidget({ color, onDone }: { color: string; onDone: () => void }) {
  const [strips, setStrips] = useState<Strip[]>([]);
  const [sheetMsg, setSheetMsg] = useState<string | null>(null);
  const [pressed, setPressed] = useState(0);
  const [sheet, setSheet] = useState(false);
  const [marker, setMarker] = useState<Mark>('cialo');
  const [marks, setMarks] = useState<Record<string, Mark | undefined>>({});
  const [markMsg, setMarkMsg] = useState<ReturnType<typeof judgeMarks> | null>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const pressTimer = useRef<number | null>(null);
  const pressStart = useRef(0);

  useEffect(() => () => {
    if (pressTimer.current) cancelAnimationFrame(pressTimer.current);
  }, []);

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    if (sheet) return;
    const r = e.currentTarget.getBoundingClientRect();
    start.current = { x: e.clientX - r.left, y: e.clientY - r.top };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onUp = (e: PointerEvent<HTMLDivElement>) => {
    const s = start.current;
    start.current = null;
    if (!s || sheet) return;
    const r = e.currentTarget.getBoundingClientRect();
    const scale = SIZE / r.width;
    const dx = (e.clientX - r.left - s.x) * scale;
    const dy = (e.clientY - r.top - s.y) * scale;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < MIN_SWIPE) return;
    const dir: Dir = Math.abs(dy) > Math.abs(dx) ? 'v' : 'h';
    const mid = dir === 'v' ? (s.x * scale + dx / 2) : (s.y * scale + dy / 2);
    const idx = Math.max(0, Math.min(STRIPS - 1, Math.floor(mid / CELL)));
    const strip = { dir, idx };
    setSheetMsg(null);
    setStrips((prev) => (prev.some((p) => stripKey(p) === stripKey(strip)) ? prev : [...prev, strip]));
  };

  const pressDown = () => {
    if (sheet) return;
    const v = judgeSheet(strips);
    if (!v.ok) {
      setSheetMsg(v.text);
      return;
    }
    pressStart.current = performance.now();
    const step = () => {
      const t = (performance.now() - pressStart.current) / PRESS_MS;
      setPressed(Math.min(1, t));
      if (t >= 1) {
        setSheet(true);
        setSheetMsg(null);
        pressTimer.current = null;
        return;
      }
      pressTimer.current = requestAnimationFrame(step);
    };
    pressTimer.current = requestAnimationFrame(step);
  };

  const pressUp = () => {
    if (pressTimer.current) cancelAnimationFrame(pressTimer.current);
    pressTimer.current = null;
    if (!sheet) setPressed(0);
  };

  const tapSegment = (id: string) => {
    if (markMsg?.ok) return;
    setMarkMsg(null);
    setMarks((m) => ({ ...m, [id]: m[id] === marker ? undefined : marker }));
  };

  const check = () => {
    const v = judgeMarks(marks);
    setMarkMsg(v);
    if (v.ok) onDone();
  };

  const vertical = strips.filter((s) => s.dir === 'v');
  const horizontal = strips.filter((s) => s.dir === 'h');
  const firstDir = strips[0]?.dir;
  const order = firstDir === 'h' ? [...horizontal, ...vertical] : [...vertical, ...horizontal];

  return (
    <div className="space-y-4">
      {!sheet && (
        <div className="grid gap-4 md:grid-cols-[300px_minmax(0,1fr)]">
          <div className="mx-auto w-full max-w-[300px]">
            <div
              className="relative aspect-square w-full cursor-crosshair touch-none select-none border bg-[#7d8a6a]"
              onPointerDown={onDown}
              onPointerUp={onUp}
              onPointerCancel={() => (start.current = null)}
              role="application"
              aria-label="Kamień do robienia kartki: pociągnij palcem w pionie albo w poziomie, żeby położyć pasek"
            >
              {order.map((s) => (
                <div
                  key={stripKey(s)}
                  className="absolute border border-[#b59a5e]/70"
                  style={{
                    background: s.dir === 'v' ? 'linear-gradient(90deg,#e9d9a6,#f3e7bf,#e2cf96)' : 'linear-gradient(180deg,#eadcae,#f6ecc8,#e4d29c)',
                    left: s.dir === 'v' ? `${(s.idx / STRIPS) * 100}%` : 0,
                    top: s.dir === 'h' ? `${(s.idx / STRIPS) * 100}%` : 0,
                    width: s.dir === 'v' ? `${100 / STRIPS}%` : '100%',
                    height: s.dir === 'h' ? `${100 / STRIPS}%` : '100%',
                    opacity: 0.92,
                  }}
                />
              ))}
              {pressed > 0 && (
                <div className="absolute inset-0 bg-[#5c574d]" style={{ opacity: pressed * 0.55 }} aria-hidden />
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              pionowe: {vertical.length} z {STRIPS} · poziome: {horizontal.length} z {STRIPS}
            </p>
          </div>
          <div className="space-y-3 text-sm leading-relaxed">
            <p>
              Zanim przeczytasz, co pisali egipscy lekarze — zrób kartkę, na której pisali. Łodygę papirusu kroi się na długie, cienkie paski.{' '}
              <strong>Pociągnij palcem po kamieniu</strong> z góry na dół albo z boku na bok, a w tym miejscu położysz pasek.
            </p>
            <p>Kiedy paski będą gotowe, przyciśnij je ciężkim kamieniem — sok z łodyg sam je sklei.</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onPointerDown={pressDown}
                onPointerUp={pressUp}
                onPointerLeave={pressUp}
                onPointerCancel={pressUp}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (judgeSheet(strips).ok) setSheet(true);
                    else pressDown();
                  }
                }}
                className="touch-none select-none border-2 px-3 py-2 text-sm font-semibold"
                style={{ borderColor: color }}
              >
                Trzymaj kamień
              </button>
              <button
                type="button"
                onClick={() => {
                  setStrips([]);
                  setSheetMsg(null);
                }}
                disabled={strips.length === 0}
                className="flex items-center gap-1 border px-3 py-2 text-sm disabled:opacity-40"
              >
                <RotateCcw className="h-4 w-4" /> Zdejmij paski
              </button>
            </div>
            {sheetMsg && (
              <p aria-live="polite" className="border-l-2 border-destructive pl-3 text-destructive">
                {sheetMsg}
              </p>
            )}
          </div>
        </div>
      )}

      {sheet && (
        <div className="space-y-3">
          <p className="text-sm leading-relaxed">
            Kartka papirusu gotowa — mocna, bo włókna leżą na krzyż. Grecy nazywali tę roślinę <em>papyros</em>; od niej pochodzi nasze słowo{' '}
            <strong>papier</strong>. A na takich kartkach egipscy lekarze spisali swoją wiedzę. Oto kilka przepisów z dwóch prawdziwych papirusów
            (omówienie, uproszczone).
          </p>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span>Zakreślacz:</span>
            {(Object.keys(MARKS) as Mark[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMarker(m)}
                className={cn('border px-3 py-1.5', MARKS[m].bg, marker === m && 'border-2')}
                style={marker === m ? { borderColor: color } : undefined}
                aria-pressed={marker === m}
              >
                {MARKS[m].label}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            <strong>Ciało</strong> — {MARKS.cialo.hint}. <strong>Słowa i wiara</strong> — {MARKS.slowa.hint}. Stuknij fragment, żeby go zakreślić.
          </p>
          <div
            className="space-y-3 border p-4"
            style={{ background: 'repeating-linear-gradient(90deg,#f1e3b8 0 6px,#ead9a8 6px 7px), #f1e3b8' }}
          >
            {RECIPES.map((r) => (
              <div key={r.id} className="text-[15px] leading-relaxed text-[#3b2a14]">
                <span className="mr-1 text-[10px] uppercase tracking-wide text-[#7a5a2a]">{r.source}:</span>
                {r.segments.map((s) => {
                  const m = marks[s.id];
                  const bad = markMsg && !markMsg.ok && (markMsg.wrong.includes(s.id) || markMsg.unmarked.includes(s.id));
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => tapSegment(s.id)}
                      className={cn(
                        'mr-1 inline rounded-sm px-0.5 text-left',
                        m && MARKS[m].bg,
                        bad && 'outline outline-2 outline-destructive',
                      )}
                    >
                      {s.text}
                    </button>
                  );
                })}
                {markMsg?.ok && (
                  <span className="mt-1 block text-xs text-[#5a4320]">→ {r.segments.map((s) => s.today).join(' ')}</span>
                )}
              </div>
            ))}
          </div>
          {!markMsg?.ok && (
            <button type="button" onClick={check} className="border-2 px-3 py-2 text-sm font-semibold" style={{ borderColor: color }}>
              Sprawdź zakreślenia
            </button>
          )}
          {markMsg && !markMsg.ok && (
            <p aria-live="polite" className="border-l-2 border-destructive pl-3 text-sm leading-relaxed text-destructive">
              {markMsg.text}
            </p>
          )}
          {markMsg?.ok && (
            <p className="border-l-2 pl-3 text-sm leading-relaxed" style={{ borderColor: color }}>
              Medycyna Egipcjan to mieszanka: obok nastawiania złamań i miodu na rany — zaklęcia i amulety. Nastawiali kości, opatrywali rany,
              znali setki leków z roślin. Tego, że chorobę wywołują zarazki, nie wiedział jeszcze nikt na świecie — więc tam, gdzie wiedza się
              kończyła, pomagała wiara. To też mówi nam coś o ludziach tamtych czasów.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
