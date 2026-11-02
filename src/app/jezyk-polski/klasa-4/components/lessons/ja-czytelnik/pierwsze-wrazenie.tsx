'use client';

import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { CzytelniaReader } from '../../czytelnia/czytelnia-reader';
import type { CzytelniaBook } from '../../../lib/czytelnia/types';
import { addBook, setImpression } from '../../../lib/polka/model';
import { IMPRESSION_FEELINGS } from '../../../lib/polka/summary';
import { useShelf } from '../../../lib/polka/use-shelf';
import { useTeczka } from '../../../lib/teczka/use-teczka';
import { LOW_GAUGE, gaugeAngle, gaugeFromPoint, gaugeLabel } from './degustacja';

/**
 * L2, blok 4 „Pierwsze wrażenie” `[7.3]` `[5.4]` — dziecko czyta pierwszą
 * część pierwszego odcinka w czytniku Czytelni (narzędzia czytania, zakładka;
 * od zwrotu 2026-10-19 wystarczy pierwsza część — resztę doczyta, kiedy zechce),
 * a potem **gest
 * nowy dla kursu: ustawia wskazówkę „wciągacza”** na półokrągłej tarczy,
 * dokłada jedno uczucie z palety i może dopisać jedno zdanie (bez oceny
 * treści). Wskazówka i uczucie idą na Półkę (wartości zamknięte, D3), zdanie —
 * do Teczki (tylko na urządzeniu). Wskazówka nisko: wolno zmienić książkę —
 * drugi talerz z degustacji staje obok na Półce.
 */

const LESSON = 'start/ja-czytelnik';
const R = 110;
const CX = 130;
const CY = 125;

interface Props {
  color: string;
  book: CzytelniaBook;
  second: CzytelniaBook;
  onComplete: () => void;
}

export function PierwszeWrazenie({ color, book, second, onComplete }: Props) {
  const [read, setRead] = useState(false);
  const [gauge, setGauge] = useState(50);
  const [touched, setTouched] = useState(false);
  const [feeling, setFeeling] = useState<string | null>(null);
  const [sentence, setSentence] = useState('');
  const [saved, setSaved] = useState(false);
  const [swapped, setSwapped] = useState(false);
  const { update } = useShelf();
  const { save: saveTeczka } = useTeczka();
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);

  const fromEvent = (e: PointerEvent<SVGSVGElement>) => {
    const r = svgRef.current!.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 260;
    const y = ((e.clientY - r.top) / r.height) * 150;
    setGauge(gaugeFromPoint(CX, CY, x, y));
    setTouched(true);
  };

  const onKey = (e: KeyboardEvent<SVGSVGElement>) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') setGauge((g) => Math.min(100, g + 5));
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') setGauge((g) => Math.max(0, g - 5));
    else return;
    e.preventDefault();
    setTouched(true);
  };

  const commit = () => {
    if (!touched || !feeling || saved) return;
    update((rec, now) => setImpression(addBook(rec, book.id, 'czytelnia', now), book.id, gauge, feeling, now));
    const text = sentence.trim();
    if (text) {
      saveTeczka({
        id: `${LESSON}#wrazenie`,
        lesson: LESSON,
        kind: 'wrazenie',
        title: `Pierwsze wrażenie: ${book.title}`,
        text,
        ref: book.id,
      });
    }
    setSaved(true);
    onComplete();
  };

  const swap = () => {
    update((rec, now) => addBook(rec, second.id, 'czytelnia', now));
    setSwapped(true);
  };

  const angle = gaugeAngle(gauge);

  return (
    <div className="space-y-5">
      <CzytelniaReader book={book} n={1} color={color} part onPart={() => setRead(true)} onFinished={() => setRead(true)} />

      <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-5" style={{ opacity: read ? 1 : 0.55 }}>
        <p className="text-sm leading-relaxed sm:text-base">
          {read
            ? 'Jak bardzo ta książka cię wciągnęła? Przesuń wskazówkę.'
            : 'Najpierw przeczytaj pierwszą część odcinka — do znaku „Zatrzymuję się tutaj” albo do końca. Potem ustawisz tu wskazówkę.'}
        </p>

        <div className="mt-3 grid items-start gap-5 md:grid-cols-[260px_1fr]">
          <div>
            <svg
              ref={svgRef}
              viewBox="0 0 260 150"
              className="block w-full max-w-[260px] touch-none select-none outline-none"
              role="slider"
              aria-label="Wciągacz: jak bardzo książka cię wciągnęła"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={gauge}
              aria-valuetext={gaugeLabel(gauge)}
              aria-disabled={!read || saved}
              tabIndex={read && !saved ? 0 : -1}
              onKeyDown={read && !saved ? onKey : undefined}
              style={{ cursor: read && !saved ? 'grab' : 'default' }}
              onPointerDown={(e) => {
                if (!read || saved || e.button > 0) return;
                try {
                  e.currentTarget.setPointerCapture(e.pointerId);
                } catch {
                  /* syntetyczne zdarzenia */
                }
                dragging.current = true;
                fromEvent(e);
              }}
              onPointerMove={(e) => dragging.current && fromEvent(e)}
              onPointerUp={() => (dragging.current = false)}
              onPointerCancel={() => (dragging.current = false)}
            >
              <path d={`M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`} fill="none" stroke="#e5e7eb" strokeWidth="18" />
              <path
                d={`M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`}
                fill="none"
                stroke={color}
                strokeWidth="18"
                strokeDasharray={`${Math.round((gauge / 100) * Math.PI * R)} 999`}
                opacity={touched ? 0.85 : 0.25}
              />
              <g transform={`rotate(${angle} ${CX} ${CY})`}>
                <line x1={CX} y1={CY} x2={CX} y2={CY - R + 14} stroke="#1f2937" strokeWidth="4" strokeLinecap="round" />
              </g>
              <circle cx={CX} cy={CY} r="8" fill="#1f2937" />
              <text x={4} y={CY + 20} fontSize="11" textAnchor="start" fill="currentColor">
                nudno
              </text>
              <text x={256} y={CY + 20} fontSize="11" textAnchor="end" fill="currentColor">
                nie mogę się oderwać
              </text>
            </svg>
            <p className="mt-1 h-6 text-center text-sm font-semibold" style={{ color }} aria-live="polite">
              {touched ? gaugeLabel(gauge) : ' '}
            </p>
          </div>

          <div>
            <p className="text-sm font-medium">Jakie uczucie zostało po pierwszym odcinku?</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {IMPRESSION_FEELINGS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  disabled={!read || saved}
                  aria-pressed={feeling === f.id}
                  onClick={() => setFeeling(f.id)}
                  className="border px-3 py-1.5 text-sm disabled:opacity-50"
                  style={{
                    borderColor: feeling === f.id ? color : undefined,
                    backgroundColor: feeling === f.id ? `color-mix(in srgb, ${color} 12%, transparent)` : undefined,
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <label className="mt-4 block text-sm font-medium" htmlFor="wrazenie-zdanie">
              Jedno zdanie od siebie <span className="font-normal text-muted-foreground">(nie musisz)</span>
            </label>
            <input
              id="wrazenie-zdanie"
              value={sentence}
              disabled={!read || saved}
              onChange={(e) => setSentence(e.target.value.slice(0, 200))}
              className="mt-1 w-full border px-3 py-2 text-sm"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
        </div>

        <div className="mt-4 flex min-h-[2.75rem] flex-wrap items-center gap-3">
          {!saved ? (
            <>
              <button
                type="button"
                onClick={commit}
                disabled={!read || !touched || !feeling}
                className="border-2 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
                style={{ backgroundColor: color, borderColor: color }}
              >
                Zapisz wrażenie na półce
              </button>
              <span className="text-sm text-muted-foreground">
                {read && !touched ? 'Przesuń wskazówkę.' : read && !feeling ? 'Wybierz uczucie.' : ''}
              </span>
            </>
          ) : (
            <p className="text-sm leading-relaxed sm:text-base">
              Zapisane na Półce{sentence.trim() ? ', a twoje zdanie w Teczce autora' : ''}.
            </p>
          )}
        </div>

        {saved && gauge < LOW_GAUGE && (
          <div className="mt-3 border-l-4 p-3 text-sm leading-relaxed sm:text-base" style={{ borderColor: color }}>
            <p>
              Wskazówka stoi nisko — i to też jest wiadomość. <strong>Wolno zmienić książkę.</strong> Odłożyć książkę, która nudzi, to
              nie porażka — to wybór.
            </p>
            {!swapped ? (
              <button type="button" onClick={swap} className="mt-2 border px-3 py-1.5 text-sm font-medium" style={{ borderColor: color }}>
                Postaw obok drugi talerz: „{second.title}”
              </button>
            ) : (
              <p className="mt-2">„{second.title}” stoi już na Półce obok. Zacznij ją, kiedy zechcesz.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
