'use client';

import { useEffect, useState } from 'react';
import { Stamp } from 'lucide-react';
import { DragGhost, useDragToken } from '../../family-tree/use-drag-token';
import { AFTER_STAMP, CAPTIONS, VOICES, YEARS, stageOf, type Choice } from './spichlerz';

/**
 * Blok 3 L13 — dylemat rady miasteczka. Głosy mieszkańców przychodzą po
 * kolei (konserwator na końcu), potem dziecko **przybija pieczęć rady** na
 * jednym z dwóch projektów (przeciągnięcie albo stuk-stuk), a na koniec
 * **przewija suwakiem 20 lat** i ogląda obie przyszłości obok siebie.
 */
export function RadaMiasteczka({ color, onComplete }: { color: string; onComplete: () => void }) {
  const [started, setStarted] = useState(false);
  const [heard, setHeard] = useState(0);
  const [choice, setChoice] = useState<Choice | null>(null);
  const [armed, setArmed] = useState(false);
  const [year, setYear] = useState<number>(YEARS[0]);
  const [reachedEnd, setReachedEnd] = useState(false);

  useEffect(() => {
    if (!started || heard >= VOICES.length) return;
    const id = window.setTimeout(() => setHeard((h) => h + 1), VOICES[heard].delay);
    return () => window.clearTimeout(id);
  }, [started, heard]);

  useEffect(() => {
    if (reachedEnd) onComplete();
  }, [reachedEnd, onComplete]);

  const allHeard = heard >= VOICES.length;

  const stamp = (c: Choice) => {
    if (!allHeard || choice) return;
    setChoice(c);
    setArmed(false);
  };

  const { drag, hover, bind } = useDragToken({
    disabled: !allHeard || !!choice,
    onTap: () => setArmed((a) => !a),
    onDrop: (_id, target) => {
      if (target === 'rada:parking') stamp('parking');
      if (target === 'rada:spichlerz') stamp('spichlerz');
    },
  });

  const stage = stageOf(year);

  return (
    <div className="space-y-4 text-sm leading-relaxed sm:text-base">
      <p>
        Nad strumieniem w Zawidełkach stoi stary drewniany spichlerz. Od lat jest pusty. Rada
        miasteczka ma dwa projekty: <strong>rozebrać go i zrobić parking</strong> albo{' '}
        <strong>wyremontować i otworzyć w nim coś dla mieszkańców</strong>. Ty dziś przewodniczysz
        radzie. Najpierw wysłuchaj mieszkańców.
      </p>

      {!started ? (
        <button
          type="button"
          onClick={() => setStarted(true)}
          className="border-2 px-4 py-2 font-semibold text-white"
          style={{ background: color, borderColor: color }}
        >
          Otwórz posiedzenie rady
        </button>
      ) : (
        <ol className="space-y-2" aria-live="polite">
          {VOICES.slice(0, heard).map((v) => (
            <li key={v.who} className="border-l-4 bg-white p-3 dark:bg-zinc-900" style={{ borderColor: color }}>
              <p className="text-xs font-semibold text-muted-foreground">{v.who}</p>
              <p className="mt-1">„{v.text}”</p>
            </li>
          ))}
          {!allHeard && <li className="animate-pulse text-xs text-muted-foreground">ktoś jeszcze podnosi rękę…</li>}
        </ol>
      )}

      {allHeard && (
        <div className="space-y-3">
          <p>
            {choice ? 'Pieczęć przybita.' : 'Weź pieczęć rady i przybij ją na projekcie, który wybierasz (przeciągnij albo stuknij pieczęć, potem projekt).'}
          </p>
          <div className="flex items-start gap-3">
            {!choice && (
              <button
                type="button"
                {...bind('pieczec')}
                className="flex h-14 w-14 shrink-0 touch-none items-center justify-center rounded-full border-2 text-white"
                style={{
                  background: armed ? '#7a1f1f' : '#a33',
                  borderColor: '#7a1f1f',
                  opacity: drag ? 0.35 : 1,
                }}
                aria-label="Pieczęć rady"
              >
                <Stamp className="h-6 w-6" />
              </button>
            )}
            <div className="grid flex-1 gap-2 sm:grid-cols-2">
              {(['parking', 'spichlerz'] as Choice[]).map((c) => {
                const drop = `rada:${c}`;
                const picked = choice === c;
                return (
                  <div
                    key={c}
                    data-drop={drop}
                    onClick={() => armed && stamp(c)}
                    className="relative min-h-[88px] border-2 bg-[#fffdf6] p-3 transition-colors dark:bg-zinc-900"
                    style={{
                      borderColor: hover === drop || picked ? color : 'var(--border)',
                      background: hover === drop || (armed && !choice) ? `${color}14` : undefined,
                      cursor: armed ? 'pointer' : undefined,
                      opacity: choice && !picked ? 0.5 : 1,
                    }}
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Projekt uchwały</p>
                    <p className="mt-1 font-semibold">
                      {c === 'parking' ? 'Rozebrać spichlerz, zbudować parking' : 'Wyremontować spichlerz, otworzyć bibliotekę i pracownię'}
                    </p>
                    {picked && (
                      <span
                        className="absolute right-2 top-2 flex h-12 w-12 rotate-[-14deg] items-center justify-center rounded-full border-2 text-[9px] font-bold uppercase text-[#a33]"
                        style={{ borderColor: '#a33' }}
                      >
                        rada
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {choice && (
        <>
          <p className="border-l-4 pl-3" style={{ borderColor: color }}>
            {AFTER_STAMP[choice]}
          </p>

          <div className="border p-3">
            <div className="flex items-baseline justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Przewiń 20 lat</p>
              <p className="font-mono text-lg font-bold tabular-nums" style={{ color }}>
                {year}
              </p>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(['parking', 'spichlerz'] as Choice[]).map((c) => (
                <div key={c} className="border">
                  <p className="border-b px-2 py-1 text-[11px] font-semibold leading-tight sm:text-xs">
                    {c === 'parking' ? 'Gdyby prawo go nie chroniło' : 'Spichlerz zostaje'}
                  </p>
                  <Scene variant={c} stage={stage} />
                </div>
              ))}
            </div>
            <input
              type="range"
              min={YEARS[0]}
              max={YEARS[YEARS.length - 1]}
              step={1}
              value={year}
              onChange={(e) => {
                const y = Number(e.target.value);
                setYear(y);
                if (y >= YEARS[YEARS.length - 1]) setReachedEnd(true);
              }}
              className="mt-3 w-full"
              style={{ accentColor: color }}
              aria-label="Rok"
            />
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(['parking', 'spichlerz'] as Choice[]).map((c) => (
                <p key={c} className="min-h-[72px] border-l-2 px-2 py-0.5 text-xs leading-snug sm:text-sm">
                  {CAPTIONS[c][stage]}
                </p>
              ))}
            </div>
          </div>

          {reachedEnd && (
            <div className="border-2 p-4" style={{ borderColor: color }}>
              <p className="font-semibold">Dlaczego chroni się zabytki?</p>
              <p className="mt-1">
                Bo zabytek to <strong>źródło historyczne, którego nie da się zrobić drugi raz</strong>.
                Parking można zbudować w innym miejscu, a spichlerza z 1792 roku — nigdzie. Nowa kopia
                byłaby tylko podobna; nie miałaby belek, które pamiętają ręce cieśli sprzed ponad dwustu lat.
                Dlatego zabytków pilnuje prawo, a dbać o nie muszą ich właściciele — i wszyscy, którzy
                obok nich żyją.
              </p>
            </div>
          )}
        </>
      )}

      <DragGhost drag={drag}>
        {drag && (
          <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 bg-[#a33] text-white" style={{ borderColor: '#7a1f1f' }}>
            <Stamp className="h-6 w-6" />
          </span>
        )}
      </DragGhost>
    </div>
  );
}

/** Mała scena wariantu, rysowana kodem: etap 0–4. */
function Scene({ variant, stage }: { variant: Choice; stage: number }) {
  const granary = (
    <g>
      <rect x="70" y="58" width="60" height="38" fill="#c9a77c" stroke="#8a6a44" />
      <path d="M62 58 L100 22 L138 58 Z" fill="#9c7b56" stroke="#6e5232" />
      {[80, 96, 112].map((x) => (
        <rect key={x} x={x} y="68" width="8" height="12" fill="#6e5232" />
      ))}
      {[74, 98, 122].map((x) => (
        <rect key={x} x={x - 3} y="96" width="8" height="10" fill="#b8b0a2" />
      ))}
    </g>
  );
  const cars = (n: number) =>
    [30, 62, 94, 126, 158].slice(0, n).map((x, i) => (
      <g key={x}>
        <rect x={x} y="86" width="24" height="12" fill={['#d9826b', '#5f7fa8', '#7fb07a', '#f6c64a', '#9d8bb8'][i]} />
        <rect x={x + 4} y="80" width="16" height="7" fill="#cfe0ea" stroke="#8a8579" strokeWidth="0.5" />
      </g>
    ));
  return (
    <svg viewBox="0 0 200 120" className="block h-auto w-full" aria-hidden>
      <rect width="200" height="120" fill="#eef3f6" />
      <path d="M0 108 Q100 100 200 108 L200 120 L0 120 Z" fill="#c9dff0" />
      {variant === 'parking' ? (
        <>
          {stage === 0 && granary}
          {stage === 1 && (
            <g>
              <path d="M60 106 L80 90 L100 98 L120 86 L140 106 Z" fill="#b39a7a" />
              <rect x="146" y="80" width="30" height="18" fill="#f6c64a" stroke="#8a6a20" />
              <path d="M150 80 L132 56 L120 62" stroke="#8a6a20" strokeWidth="4" fill="none" />
            </g>
          )}
          {stage >= 2 && (
            <g>
              <rect x="20" y="98" width="170" height="8" fill="#8c8a84" />
              {[28, 60, 92, 124, 156, 188].map((x) => (
                <line key={x} x1={x} y1="98" x2={x} y2="106" stroke="#f4f0e6" strokeWidth="1.5" />
              ))}
              {cars(stage === 2 ? 5 : stage === 3 ? 2 : 1)}
              {stage === 4 && <path d="M40 100 l10 3 l8 -2 l12 4 M120 101 l9 3 l7 -3" stroke="#5c5a54" strokeWidth="1" fill="none" />}
              <rect x="176" y="50" width="16" height="16" fill="#2f5d8a" />
              <text x="184" y="62" textAnchor="middle" fontSize="12" fontWeight="700" fill="#fff">P</text>
              <line x1="184" y1="66" x2="184" y2="98" stroke="#6f6a60" strokeWidth="2" />
            </g>
          )}
        </>
      ) : (
        <>
          {granary}
          {stage === 1 && (
            <g stroke="#7a6a50" strokeWidth="1.5">
              {[64, 100, 136].map((x) => (
                <line key={x} x1={x} y1="106" x2={x} y2="20" />
              ))}
              {[40, 64, 88].map((y) => (
                <line key={y} x1="60" y1={y} x2="140" y2={y} />
              ))}
            </g>
          )}
          {stage >= 2 && (
            <g>
              <rect x="94" y="80" width="12" height="16" fill="#f6e3a3" stroke="#8a6a44" />
              {[150, 166].map((x) => (
                <g key={x}>
                  <circle cx={x} cy="84" r="4" fill="#e8b48f" />
                  <rect x={x - 3} y="88" width="6" height="12" fill={x === 150 ? '#5f7fa8' : '#d9826b'} />
                </g>
              ))}
            </g>
          )}
          {stage >= 3 &&
            [22, 34, 46].map((x) => (
              <g key={x}>
                <circle cx={x} cy="86" r="4" fill="#e8b48f" />
                <rect x={x - 3} y="90" width="6" height="12" fill="#7fb07a" />
              </g>
            ))}
          {stage === 4 &&
            [176, 186].map((x) => (
              <g key={x}>
                <circle cx={x} cy="90" r="3" fill="#e8b48f" />
                <rect x={x - 2} y="93" width="5" height="9" fill="#f6c64a" />
              </g>
            ))}
        </>
      )}
    </svg>
  );
}
