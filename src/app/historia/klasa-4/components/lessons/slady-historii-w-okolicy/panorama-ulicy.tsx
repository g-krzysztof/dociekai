'use client';

import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent } from 'react';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { FORMS, FORM_COUNT, PANORAMA_H, PANORAMA_W, THINGS, WHO, clampPan, type FormId } from './panorama';

const VIEW_H = 240;
const SCALE = VIEW_H / PANORAMA_H;

/**
 * Blok 2 L13 — dziecko **przesuwa panoramę ulicy palcem** (widać ok. jednej
 * trzeciej) i stuka rzeczy, które mogą być pamiątką. Cztery formy pamięci
 * trafiają do słownika; wabiki mówią, czemu nie są pamiątką.
 */
export function PanoramaUlicy({ color, onComplete }: { color: string; onComplete: () => void }) {
  const box = useRef<HTMLDivElement>(null);
  const [viewW, setViewW] = useState(600);
  const [pan, setPan] = useState(0);
  const [found, setFound] = useState<Set<string>>(new Set());
  const [note, setNote] = useState<{ title: string; text: string; ok: boolean } | null>(null);
  const drag = useRef<{ x: number; pan: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setViewW(el.clientWidth / SCALE));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const formsFound = THINGS.filter((t) => t.form && found.has(t.id)).length;
  const done = formsFound === FORM_COUNT;
  useEffect(() => {
    if (done) onComplete();
  }, [done, onComplete]);

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    drag.current = { x: e.clientX, pan, moved: false };
    suppressClick.current = false;
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) < 6) return;
    if (!d.moved) {
      d.moved = true;
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // bez przechwycenia ruch działa, dopóki palec jest nad panoramą
      }
    }
    suppressClick.current = true;
    setPan(clampPan(d.pan - dx / SCALE, viewW));
  };
  const onUp = () => {
    drag.current = null;
  };

  const tap = (id: string) => {
    if (suppressClick.current) return;
    const t = THINGS.find((x) => x.id === id)!;
    setNote({ title: t.name, text: t.note, ok: !!t.form });
    if (t.form) setFound((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
  };

  const step = (dir: number) => setPan((p) => clampPan(p + dir * viewW * 0.6, viewW));

  return (
    <div className="space-y-4 text-sm leading-relaxed sm:text-base">
      <p>
        Miasteczko Zawidełki ma swoją bohaterkę — nauczycielkę Helenę Wierzbicką. Mieszkańcy
        upamiętnili ją na <strong>cztery różne sposoby</strong>, wszystkie na jednej ulicy.{' '}
        <strong>Przesuń ulicę palcem</strong> (albo strzałkami) i stuknij każdą rzecz, która może
        o kimś przypominać. Uwaga: nie wszystko, co stoi na ulicy, jest pamiątką.
      </p>

      <div className="border">
        <div
          ref={box}
          className="relative cursor-grab overflow-hidden bg-[#eef3f6] dark:bg-zinc-800"
          style={{ height: VIEW_H, touchAction: 'pan-y' }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        >
          <svg
            width={PANORAMA_W * SCALE}
            height={VIEW_H}
            viewBox={`0 0 ${PANORAMA_W} ${PANORAMA_H}`}
            className="absolute left-0 top-0 max-w-none select-none"
            style={{ transform: `translateX(${-pan * SCALE}px)` }}
            role="img"
            aria-label="Panorama ulicy w Zawidełkach"
          >
            <Street />
            {THINGS.map((t) => {
              const isFound = found.has(t.id);
              return (
                <g key={t.id} onClick={() => tap(t.id)} style={{ cursor: 'pointer' }} role="button" aria-label={t.name}>
                  <circle cx={t.x} cy={t.y} r={t.r} fill="transparent" />
                  {isFound && (
                    <>
                      <circle cx={t.x} cy={t.y} r={t.r} fill="none" stroke={color} strokeWidth="4" />
                      <circle cx={t.x + t.r * 0.7} cy={t.y - t.r * 0.7} r="11" fill={color} />
                      <path
                        d={`M${t.x + t.r * 0.7 - 5} ${t.y - t.r * 0.7} l3 4 l7 -8`}
                        stroke="#fff"
                        strokeWidth="2.5"
                        fill="none"
                      />
                    </>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
        <div className="flex items-center gap-2 border-t p-2">
          <button type="button" onClick={() => step(-1)} className="border p-1.5" aria-label="Przesuń w lewo">
            <ChevronLeft className="h-4 w-4" />
          </button>
          {/* pasek: która część ulicy jest widoczna */}
          <div className="relative h-2 flex-1 bg-muted">
            <div
              className="absolute top-0 h-2"
              style={{
                background: color,
                left: `${(pan / PANORAMA_W) * 100}%`,
                width: `${Math.min(100, (viewW / PANORAMA_W) * 100)}%`,
              }}
            />
          </div>
          <button type="button" onClick={() => step(1)} className="border p-1.5" aria-label="Przesuń w prawo">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {note && (
        <p
          className={`border-l-4 pl-3 ${note.ok ? '' : 'border-amber-500'}`}
          style={note.ok ? { borderColor: color } : undefined}
          aria-live="polite"
        >
          <strong>{note.title}.</strong> {note.text}
        </p>
      )}

      <div className="border p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Słownik pamięci — {formsFound} z {FORM_COUNT}
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(Object.keys(FORMS) as FormId[]).map((f) => {
            const got = THINGS.some((t) => t.form === f && found.has(t.id));
            return (
              <div
                key={f}
                className="flex items-center gap-2 border px-2 py-1.5 text-sm"
                style={{ borderColor: got ? color : undefined, background: got ? `${color}14` : undefined }}
              >
                {got ? <Check className="h-4 w-4 shrink-0" style={{ color }} /> : <span className="w-4 text-center">?</span>}
                <span className={got ? 'font-semibold' : 'text-muted-foreground'}>{got ? FORMS[f] : '…'}</span>
              </div>
            );
          })}
        </div>
      </div>

      {done && (
        <div className="border-2 p-4" style={{ borderColor: color }}>
          <p className="font-semibold">Kim była?</p>
          <p className="mt-1">{WHO}</p>
          <p className="mt-3">
            Zauważ: to nie król ani wódz. <strong>Bohater lokalny</strong> to często nauczyciel, lekarz,
            społecznik albo artysta — ktoś, kto zrobił coś ważnego dla tego jednego miejsca. A miejsce
            pamięta o nim na wiele sposobów: tablicą, nazwą ulicy, pomnikiem, muralem.
          </p>
        </div>
      )}
    </div>
  );
}

/** Ulica rysowana kodem — budynki od lewej: piekarnia, szkoła, róg, skwer, park, mur, dom z muralem, przystanek. */
function Street() {
  return (
    <g>
      <rect width={PANORAMA_W} height={PANORAMA_H} fill="#eef3f6" />
      <rect y="250" width={PANORAMA_W} height="50" fill="#d9d4ca" />
      <line x1="0" y1="250" x2={PANORAMA_W} y2="250" stroke="#b9b2a5" strokeWidth="2" />
      {/* piekarnia */}
      <rect x="40" y="80" width="230" height="170" fill="#f2e3c9" stroke="#c7b28f" />
      <rect x="80" y="104" width="140" height="32" fill="#fff8ea" stroke="#a88e64" />
      <text x="150" y="126" textAnchor="middle" fontSize="18" fill="#7a5a2e" fontWeight="700">PIEKARNIA</text>
      <rect x="70" y="160" width="60" height="70" fill="#cfe0ea" stroke="#9fb4c1" />
      <rect x="180" y="170" width="40" height="80" fill="#a88e64" />
      {/* szkoła */}
      <rect x="310" y="50" width="290" height="200" fill="#efd9cf" stroke="#c19e8c" />
      <path d="M300 50 L455 14 L610 50 Z" fill="#c98d74" stroke="#a46e58" />
      {[340, 400, 500, 560].map((x) => (
        <g key={x}>
          <rect x={x - 18} y="74" width="36" height="46" fill="#cfe0ea" stroke="#9fb4c1" />
          <rect x={x - 18} y="146" width="36" height="46" fill="#cfe0ea" stroke="#9fb4c1" />
        </g>
      ))}
      <rect x="430" y="160" width="40" height="90" fill="#8f6a52" />
      <rect x="474" y="176" width="22" height="28" fill="#e4e1da" stroke="#8a8579" />
      {[183, 189, 195].map((y) => (
        <line key={y} x1="478" y1={y} x2="492" y2={y} stroke="#8a8579" strokeWidth="1.5" />
      ))}
      <text x="455" y="144" textAnchor="middle" fontSize="12" fill="#6e4f3e" fontWeight="700">SZKOŁA</text>
      {/* róg z tabliczką */}
      <line x1="640" y1="80" x2="640" y2="250" stroke="#6f6a60" strokeWidth="5" />
      <rect x="596" y="80" width="90" height="24" fill="#2f5d8a" stroke="#1f3f5f" />
      <text x="641" y="96" textAnchor="middle" fontSize="8.5" fill="#fff">ul. Heleny Wierzbickiej</text>
      {/* skwer z fontanną */}
      <ellipse cx="860" cy="240" rx="60" ry="12" fill="#b9d3e2" stroke="#8fb1c4" />
      <rect x="850" y="196" width="20" height="40" fill="#d6d0c4" stroke="#9e978a" />
      <path d="M860 196 C840 170 830 190 826 214 M860 196 C880 170 890 190 894 214" stroke="#8fb1c4" strokeWidth="3" fill="none" />
      {/* park z pomnikiem */}
      {[1000, 1170].map((x) => (
        <g key={x}>
          <rect x={x - 4} y="170" width="8" height="80" fill="#8b6a4c" />
          <circle cx={x} cy="150" r="42" fill="#cfdcae" stroke="#a9bb83" />
        </g>
      ))}
      <rect x="1050" y="196" width="60" height="54" fill="#d6d0c4" stroke="#9e978a" />
      <rect x="1060" y="208" width="40" height="10" fill="#c5beb0" />
      <path d="M1068 196 L1072 140 Q1080 112 1088 140 L1092 196 Z" fill="#8c8a7c" stroke="#6d6b5f" />
      <circle cx="1080" cy="116" r="9" fill="#8c8a7c" stroke="#6d6b5f" />
      <rect x="1084" y="140" width="16" height="10" fill="#a8a597" stroke="#6d6b5f" transform="rotate(-15 1092 145)" />
      {/* mur z plakatem */}
      <rect x="1220" y="120" width="170" height="130" fill="#e6ded2" stroke="#bdb2a2" />
      <rect x="1275" y="130" width="50" height="70" fill="#f6c64a" stroke="#c99a1e" />
      <text x="1300" y="152" textAnchor="middle" fontSize="11" fill="#7a4d00" fontWeight="700">FESTYN</text>
      <text x="1300" y="168" textAnchor="middle" fontSize="9" fill="#7a4d00">sobota</text>
      {/* dom z muralem */}
      <rect x="1420" y="60" width="230" height="190" fill="#e9e2d6" stroke="#bdb2a2" />
      <rect x="1460" y="76" width="140" height="150" fill="#bcd6e8" stroke="#8fb1c4" />
      <circle cx="1500" cy="120" r="12" fill="#e8b48f" />
      <rect x="1490" y="132" width="20" height="40" fill="#5f7fa8" />
      <rect x="1494" y="140" width="22" height="14" fill="#f4f0e6" stroke="#8a8579" />
      {[1540, 1570].map((x, i) => (
        <g key={x}>
          <circle cx={x} cy="148" r="9" fill="#e8b48f" />
          <rect x={x - 8} y="157" width="16" height="30" fill={i ? '#d9826b' : '#7fb07a'} />
          <rect x={x + 6} y="164" width="8" height="5" fill={i ? '#f6c64a' : '#d9826b'} />
        </g>
      ))}
      <path d="M1460 226 Q1530 200 1600 226" stroke="#f6c64a" strokeWidth="6" fill="none" />
      {/* przystanek */}
      <rect x="1680" y="150" width="90" height="8" fill="#6f6a60" />
      <rect x="1684" y="158" width="4" height="92" fill="#6f6a60" />
      <rect x="1762" y="158" width="4" height="92" fill="#6f6a60" />
      <rect x="1690" y="214" width="70" height="8" fill="#9b8f7d" />
      <circle cx="1700" cy="120" r="14" fill="#f6c64a" stroke="#6f6a60" />
      <text x="1700" y="125" textAnchor="middle" fontSize="13" fontWeight="700" fill="#333">A</text>
    </g>
  );
}
