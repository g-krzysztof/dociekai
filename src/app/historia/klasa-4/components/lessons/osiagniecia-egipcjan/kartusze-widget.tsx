'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from 'react';
import { cn } from '@/lib/utils';
import { hieroglyphFont } from '../od-pisma-do-alfabetu/fonts';
import {
  ALEKSANDER,
  CANDIDATES,
  CARTOUCHES,
  NAME_LETTERS,
  SHARED_LETTERS,
  T_POS,
  allThreads,
  judgeCandidate,
  judgeLetter,
  judgeThread,
  readThird,
  sameRef,
  type CartoucheId,
  type SignRef,
  type Thread,
} from './kartusze';

/**
 * Blok 1 L21 — **metoda Champolliona**. Dziecko **przeciąga nić** od znaku
 * w kartuszu Ptolemeusza do tego samego znaku w kartuszu Kleopatry (albo
 * stuka oba), potem nadaje nici literę — sędzia sprawdza, czy litera stoi
 * na tych samych miejscach w obu imionach greckich. Potem T (dwa różne
 * znaki), a na końcu czyta trzeci kartusz zebranym alfabetem.
 */

const TOTAL_THREADS = allThreads().length;

type Phase = 'nici' | 'litery' | 'te' | 'trzeci' | 'gotowe';

interface Line {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

const NAMES: Record<CartoucheId, { label: string; greek: string }> = {
  pt: { label: 'Ptolemeusz', greek: 'PTOLEMAIOS' },
  kl: { label: 'Kleopatra', greek: 'KLEOPATRA' },
};

export function KartuszeWidget({ color, onDone }: { color: string; onDone: () => void }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [letters, setLetters] = useState<Record<string, string>>({});
  const [phase, setPhase] = useState<Phase>('nici');
  const [picked, setPicked] = useState<SignRef | null>(null);
  const [drag, setDrag] = useState<{ from: SignRef; x: number; y: number } | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [activeThread, setActiveThread] = useState<number | null>(null);
  const [tFound, setTFound] = useState<Record<CartoucheId, boolean>>({ pt: false, kl: false });
  const [readIdx, setReadIdx] = useState<Set<number>>(new Set());
  const [candidate, setCandidate] = useState<string | null>(null);
  const [lines, setLines] = useState<Line[]>([]);

  const center = useCallback((ref: SignRef) => {
    const box = boxRef.current;
    const el = box?.querySelector<HTMLElement>(`[data-sign="${ref.c}-${ref.i}"]`);
    if (!box || !el) return null;
    const b = box.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2 - b.left, y: ref.c === 'pt' ? r.bottom - b.top : r.top - b.top };
  }, []);

  // Nici przeliczane po każdej zmianie i przy zmianie rozmiaru (telefon obrócony).
  useLayoutEffect(() => {
    const next: Line[] = [];
    for (const [p, k] of threads) {
      const a = center({ c: 'pt', i: p });
      const b = center({ c: 'kl', i: k });
      if (a && b) next.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y });
    }
    setLines(next);
  }, [threads, center, letters, phase]);
  useEffect(() => {
    const onResize = () => setThreads((t) => [...t]);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const tryThread = (a: SignRef, b: SignRef) => {
    const v = judgeThread(a, b, threads);
    if (v.ok) {
      const next = [...threads, v.thread];
      setThreads(next);
      setMsg({ ok: true, text: next.length < TOTAL_THREADS ? 'Ten sam znak w obu imionach — jest nić.' : 'Wszystkie wspólne znaki połączone.' });
      if (next.length === TOTAL_THREADS) setPhase('litery');
    } else {
      setMsg({ ok: false, text: v.text });
    }
  };

  const refAt = (x: number, y: number): SignRef | null => {
    const el = document.elementFromPoint(x, y)?.closest<HTMLElement>('[data-sign]');
    const id = el?.dataset.sign;
    if (!id) return null;
    const [c, i] = id.split('-');
    return { c: c as CartoucheId, i: Number(i) };
  };

  const onSignDown = (ref: SignRef) => (e: PointerEvent<HTMLButtonElement>) => {
    if (phase === 'nici') {
      const box = boxRef.current?.getBoundingClientRect();
      if (!box) return;
      setDrag({ from: ref, x: e.clientX - box.left, y: e.clientY - box.top });
      (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
    }
  };

  useEffect(() => {
    if (!drag) return;
    const move = (e: globalThis.PointerEvent) => {
      const box = boxRef.current?.getBoundingClientRect();
      if (!box) return;
      setDrag((d) => (d ? { ...d, x: e.clientX - box.left, y: e.clientY - box.top } : d));
    };
    const up = (e: globalThis.PointerEvent) => {
      const target = refAt(e.clientX, e.clientY);
      const from = drag.from;
      setDrag(null);
      if (!target || sameRef(target, from)) {
        // stuknięcie: wybór znaku albo para stuk-stuk
        if (target && sameRef(target, from)) {
          if (picked && !sameRef(picked, from)) {
            setPicked(null);
            tryThread(picked, from);
          } else {
            setPicked(picked && sameRef(picked, from) ? null : from);
          }
        }
        return;
      }
      setPicked(null);
      tryThread(from, target);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drag?.from.c, drag?.from.i]);

  const fromCenter = drag ? center(drag.from) : null;

  const chooseLetter = (ti: number, letter: string) => {
    const v = judgeLetter(threads[ti], letter);
    if (!v.ok) {
      setMsg({ ok: false, text: v.text });
      return;
    }
    const next = { ...letters, [`${threads[ti][0]}-${threads[ti][1]}`]: letter };
    setLetters(next);
    setActiveThread(null);
    if (Object.keys(next).length === threads.length) {
      setMsg({ ok: true, text: 'P, O i L — trzy litery odczytane z porównania dwóch imion.' });
      setPhase('te');
    } else {
      setMsg({ ok: true, text: `Tak: ${letter} stoi na tych samych miejscach w obu imionach.` });
    }
  };

  const tapT = (ref: SignRef) => {
    const want = T_POS[ref.c];
    if (tFound[ref.c]) return;
    if (ref.i !== want) {
      const name = ref.c === 'pt' ? 'PTOLMIS' : 'KLEOPATRA';
      setMsg({
        ok: false,
        text: `To ${ref.i + 1}. znak — a w imieniu ${name} na ${ref.i + 1}. miejscu jest ${NAME_LETTERS[ref.c][ref.i]}. Policz, którą literą jest T.`,
      });
      return;
    }
    const next = { ...tFound, [ref.c]: true };
    setTFound(next);
    if (next.pt && next.kl) {
      setMsg({ ok: true, text: 'Chleb u Ptolemeusza, dłoń u Kleopatry — dwa różne znaki, a głoska ta sama.' });
      setPhase('trzeci');
    } else {
      setMsg({ ok: true, text: 'Jest! Teraz znajdź T w drugim kartuszu.' });
    }
  };

  const knownSound = (c: CartoucheId, i: number): string | null => {
    if (phase === 'nici') return null;
    const t = threads.find(([p, k]) => (c === 'pt' ? p === i : k === i));
    if (t) return letters[`${t[0]}-${t[1]}`] ?? null;
    if (phase === 'trzeci' || phase === 'gotowe') return NAME_LETTERS[c][i];
    if (tFound[c] && T_POS[c] === i) return 'T';
    return null;
  };

  const third = readThird();
  const allRead = readIdx.size === ALEKSANDER.length;

  const pickName = (id: string) => {
    setCandidate(id);
    const v = judgeCandidate(id);
    if (v.ok) {
      setMsg({ ok: true, text: 'Aleksander! Dwa nowe znaki — kosz i woda — to K i N. Alfabet rośnie z każdym odczytanym imieniem.' });
      setPhase('gotowe');
      onDone();
    } else {
      setMsg({ ok: false, text: v.text });
    }
  };

  const signButton = (c: CartoucheId, i: number) => {
    const s = CARTOUCHES[c][i];
    const ref = { c, i };
    const sound = knownSound(c, i);
    const isPicked = picked && sameRef(picked, ref);
    const inThread = threads.some(([p, k]) => (c === 'pt' ? p === i : k === i));
    const tTarget = phase === 'te' && !tFound[c];
    return (
      <div key={`${c}-${i}`} className={cn('flex flex-col items-center', c === 'pt' && 'flex-col-reverse')}>
        <button
          type="button"
          data-sign={`${c}-${i}`}
          aria-label={`${NAMES[c].label}, znak ${i + 1}`}
          onPointerDown={onSignDown(ref)}
          onClick={(e) => {
            if (phase === 'te') tapT(ref);
            // klawiatura: Enter/spacja działa jak stuk-stuk
            else if (phase === 'nici' && e.detail === 0) {
              if (picked && !sameRef(picked, ref)) {
                setPicked(null);
                tryThread(picked, ref);
              } else setPicked(isPicked ? null : ref);
            }
          }}
          className={cn(
            hieroglyphFont.className,
            'flex h-10 w-8 touch-none items-center justify-center text-[26px] leading-none text-[#3b2a14] transition-colors sm:h-12 sm:w-10 sm:text-[32px] dark:text-[#f3e6c8]',
            phase === 'nici' && 'cursor-crosshair',
            tTarget && 'cursor-pointer hover:bg-amber-200/60',
            isPicked && 'bg-amber-300/80',
            inThread && phase !== 'nici' && 'bg-amber-100/70 dark:bg-amber-900/40',
          )}
        >
          {s.glyph}
        </button>
        <span className="h-5 font-mono text-xs font-bold" style={{ color }}>
          {sound ?? ''}
        </span>
      </div>
    );
  };

  const cartouche = (c: CartoucheId) => (
    <div className="flex flex-col items-center gap-1">
      <div
        className="flex items-center gap-0 rounded-full border-[3px] border-[#7a5a2a] bg-[#f6ead0] px-3 py-1 dark:bg-[#3a2f20]"
        aria-label={`Kartusz: ${NAMES[c].label}`}
      >
        {CARTOUCHES[c].map((_, i) => signButton(c, i))}
        <span className="ml-1 h-10 w-[3px] bg-[#7a5a2a] sm:h-12" aria-hidden />
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-2 text-sm sm:grid-cols-2">
        <div className="border p-2">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Górny kartusz — z Kamienia z Rosetty</p>
          <p>
            Grecki tekst obok mówi: <strong>Ptolemeusz</strong> — po grecku PTOLEMAIOS. Pisarz zapisał je skrótem:{' '}
            <span className="whitespace-nowrap font-mono font-bold tracking-widest">P T O L M I S</span>
          </p>
        </div>
        <div className="border p-2">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Dolny kartusz — z obelisku z File</p>
          <p>
            Grecki napis na podstawie obelisku mówi: <strong>Kleopatra</strong> —{' '}
            <span className="whitespace-nowrap font-mono font-bold tracking-widest">K L E O P A T R A</span>
          </p>
        </div>
      </div>

      <div ref={boxRef} className="relative select-none overflow-hidden border bg-[#efe1c1]/40 px-1 py-3 dark:bg-zinc-900/60">
        <div className="flex flex-col items-center gap-14 sm:gap-16">
          {cartouche('pt')}
          {cartouche('kl')}
        </div>
        <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
          {lines.map((l, i) => (
            <line key={i} x1={l.x1} y1={l.y1 + 6} x2={l.x2} y2={l.y2 - 6} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
          ))}
          {drag && fromCenter && (
            <line
              x1={fromCenter.x}
              y1={fromCenter.y + (drag.from.c === 'pt' ? 6 : -6)}
              x2={drag.x}
              y2={drag.y}
              stroke={color}
              strokeWidth={2}
              strokeDasharray="5 4"
            />
          )}
        </svg>
        <p className="mt-3 text-center text-[11px] text-muted-foreground">
          Na końcu kartusza Kleopatry stoją jeszcze dwa znaki, które mówią „to imię kobiety” — pominęliśmy je.
        </p>
      </div>

      {phase === 'nici' && (
        <p className="text-sm leading-relaxed">
          Oba imiona mają wspólne głoski. Jeśli Egipcjanie zapisywali głoski, te same głoski powinny mieć te same znaki.{' '}
          <strong>Przeciągnij nić</strong> od znaku w górnym kartuszu do <strong>dokładnie takiego samego</strong> znaku w dolnym (albo
          stuknij jeden i drugi). Połączone: {threads.length} z {TOTAL_THREADS}.
        </p>
      )}

      {phase === 'litery' && (
        <div className="space-y-3">
          <p className="text-sm leading-relaxed">
            Trzy znaki są w obu imionach. Którą literą jest każdy z nich? Licz miejsca: znak, który w górnym kartuszu stoi na 1. miejscu,
            to 1. litera imienia PTOLMIS. <strong>Stuknij nić, potem literę.</strong>
          </p>
          <div className="flex flex-wrap gap-2">
            {threads.map(([p, k], ti) => {
              const done = letters[`${p}-${k}`];
              return (
                <button
                  key={ti}
                  type="button"
                  disabled={!!done}
                  onClick={() => setActiveThread(ti)}
                  className={cn('flex items-center gap-2 border px-3 py-1.5 text-sm', activeThread === ti && 'border-2')}
                  style={activeThread === ti ? { borderColor: color } : undefined}
                >
                  <span className={cn(hieroglyphFont.className, 'text-xl')}>{CARTOUCHES.pt[p].glyph}</span>
                  <span className="text-xs text-muted-foreground">
                    {p + 1}. u Ptolemeusza · {k + 1}. u Kleopatry
                  </span>
                  <span className="font-mono font-bold" style={{ color }}>
                    {done ?? '?'}
                  </span>
                </button>
              );
            })}
          </div>
          {activeThread !== null && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm">Litera:</span>
              {SHARED_LETTERS.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => chooseLetter(activeThread, l)}
                  className="h-9 w-9 border font-mono text-base font-bold hover:bg-muted"
                >
                  {l}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {phase === 'te' && (
        <p className="text-sm leading-relaxed">
          Kłopot: litera <strong>T</strong> jest w obu imionach, a żadna nić do niej nie prowadzi. <strong>Stuknij znak T</strong> w górnym
          kartuszu, a potem w dolnym — licz miejsca liter jak przed chwilą.
        </p>
      )}

      {(phase === 'trzeci' || phase === 'gotowe') && (
        <div className="space-y-3 border-t pt-3">
          <p className="text-sm leading-relaxed">
            Tak w 1822 roku rozumował Francuz <strong>Jean-François Champollion</strong>. Zrozumiał, że egipskie znaki to nie tylko obrazki,
            ale też <strong>głoski</strong> — i że jedną głoskę można zapisać różnymi znakami. Masz teraz alfabet z dwóch imion. Sprawdź go na
            trzecim kartuszu: <strong>stuknij każdy znak</strong>, żeby go odczytać.
          </p>
          <div className="flex justify-center">
            <div className="flex items-center rounded-full border-[3px] border-[#7a5a2a] bg-[#f6ead0] px-3 py-1 dark:bg-[#3a2f20]">
              {ALEKSANDER.map((s, i) => (
                <div key={i} className="flex flex-col items-center">
                  <button
                    type="button"
                    aria-label={`trzeci kartusz, znak ${i + 1}`}
                    onClick={() => setReadIdx((prev) => new Set(prev).add(i))}
                    className={cn(
                      hieroglyphFont.className,
                      'flex h-10 w-8 items-center justify-center text-[26px] leading-none text-[#3b2a14] sm:h-12 sm:w-10 sm:text-[32px] dark:text-[#f3e6c8]',
                      !readIdx.has(i) && 'hover:bg-amber-200/60',
                    )}
                  >
                    {s.glyph}
                  </button>
                  <span className="h-5 font-mono text-xs font-bold" style={{ color }}>
                    {readIdx.has(i) ? (third[i] ?? '?') : ''}
                  </span>
                </div>
              ))}
              <span className="ml-1 h-10 w-[3px] bg-[#7a5a2a] sm:h-12" aria-hidden />
            </div>
          </div>
          {allRead && (
            <div className="space-y-2">
              <p className="text-sm leading-relaxed">
                Dwóch znaków jeszcze nie znasz (?). Ale reszta wystarczy. <strong>Czyje to imię?</strong> (Dłoń to u Kleopatry T — Egipcjanin
                słyszał T i D podobnie.)
              </p>
              <div className="flex flex-wrap gap-2">
                {CANDIDATES.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    disabled={phase === 'gotowe'}
                    onClick={() => pickName(c.id)}
                    className={cn('border px-3 py-2 text-sm', candidate === c.id && 'border-2')}
                    style={candidate === c.id ? { borderColor: color } : undefined}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {msg && (
        <p
          aria-live="polite"
          className={cn('border-l-2 pl-3 text-sm leading-relaxed', msg.ok ? '' : 'border-destructive text-destructive')}
          style={msg.ok ? { borderColor: color } : undefined}
        >
          {msg.text}
        </p>
      )}
    </div>
  );
}
