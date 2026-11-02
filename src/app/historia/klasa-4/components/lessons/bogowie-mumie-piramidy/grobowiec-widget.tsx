'use client';

import Image from 'next/image';
import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { Minus, Plus } from 'lucide-react';
import { plural } from '@/lib/plural';
import { LAYER_COUNT, TOMB_FOUND, TOMB_LAYERS, judgePrediction, yearsSinceFound, type TombLayer } from './grobowiec';
import { img } from '@/lib/media';

/**
 * Blok 3 L20 — **grobowiec jak matrioszka**. Dziecko najpierw przewiduje,
 * ile osłon kryje ciało faraona, a potem **zsuwa palcem w górę** kolejne
 * kaplice, sarkofag i trumny (widok z góry). Każda zdjęta warstwa zostawia
 * kartę: materiał, data otwarcia z dziennika Cartera, jedna rzecz, którą
 * widać tylko w tej warstwie. Na dnie — fotografia złotej maski.
 */

const VW = 300;
const VH = 230;
const CX = 150;
const CY = 120;
const THRESHOLD = 70;
const MASK = img('/images/historia/lekcje/bogowie-mumie-piramidy/maska-tutanchamona.jpg');

const FILL: Record<TombLayer['kind'], { fill: string; stroke: string }> = {
  kaplica: { fill: '#e3c26a', stroke: '#8f6d1f' },
  sarkofag: { fill: '#d9c3a0', stroke: '#8b7355' },
  trumna: { fill: '#e8c552', stroke: '#9a7a16' },
};

function layerSize(i: number) {
  return { w: 270 - i * 24, h: 200 - i * 20 };
}

function LayerShape({ i, dy = 0, top = false }: { i: number; dy?: number; top?: boolean }) {
  const layer = TOMB_LAYERS[i];
  const { w, h } = layerSize(i);
  const { fill, stroke } = FILL[layer.kind];
  const x = CX - w / 2;
  const y = CY - h / 2 + dy;
  if (layer.kind === 'trumna') {
    // Trumna w kształcie postaci, leży wzdłuż sarkofagu: głowa po lewej, stopy po prawej.
    const d = `M ${x} ${CY + dy} C ${x} ${y} ${x + w * 0.3} ${y} ${x + w * 0.42} ${y + h * 0.1} L ${x + w} ${y + h * 0.25} L ${x + w} ${y + h * 0.75} L ${x + w * 0.42} ${y + h * 0.9} C ${x + w * 0.3} ${y + h} ${x} ${y + h} ${x} ${CY + dy} Z`;
    return (
      <g>
        <path d={d} fill={fill} stroke={stroke} strokeWidth={top ? 2 : 1} />
        {top && (
          <>
            <path d={`M ${x + w * 0.5} ${y + h * 0.2} L ${x + w * 0.5} ${y + h * 0.8}`} stroke="#3e5a8a" strokeWidth={3} />
            <path d={`M ${x + w * 0.62} ${y + h * 0.24} L ${x + w * 0.62} ${y + h * 0.76}`} stroke="#3e5a8a" strokeWidth={2} />
            <circle cx={x + w * 0.16} cy={CY + dy - h * 0.1} r={2} fill="#2a2a2a" />
            <circle cx={x + w * 0.16} cy={CY + dy + h * 0.1} r={2} fill="#2a2a2a" />
          </>
        )}
      </g>
    );
  }
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={fill} stroke={stroke} strokeWidth={top ? 2 : 1} />
      {top && layer.kind === 'kaplica' && (
        <>
          <rect x={x + 8} y={y + 8} width={w - 16} height={h - 16} fill="none" stroke="#3e5a8a" strokeWidth={2} strokeDasharray="6 4" />
          <line x1={x} y1={y + h / 2} x2={x + w} y2={y + h / 2} stroke={stroke} strokeWidth={0.6} />
        </>
      )}
      {top && layer.kind === 'sarkofag' && (
        <rect x={x + 6} y={y + 6} width={w - 12} height={h - 12} fill="#c7b08a" stroke={stroke} />
      )}
    </g>
  );
}

export function GrobowiecWidget({ color, onDone }: { color: string; onDone: () => void }) {
  const [guess, setGuess] = useState(3);
  const [locked, setLocked] = useState(false);
  const [removed, setRemoved] = useState(0);
  const [dy, setDy] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const start = useRef<{ y: number; scale: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const open = removed >= LAYER_COUNT;
  const last = removed > 0 ? TOMB_LAYERS[removed - 1] : null;

  const removeTop = () => {
    const next = removed + 1;
    setRemoved(next);
    setDy(0);
    if (next >= LAYER_COUNT) onDone();
  };

  const onDown = (e: PointerEvent<SVGSVGElement>) => {
    if (!locked || open) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // jw.
    }
    const r = e.currentTarget.getBoundingClientRect();
    start.current = { y: e.clientY, scale: VH / r.height };
    setIsDragging(true);
  };
  const onMove = (e: PointerEvent<SVGSVGElement>) => {
    const s = start.current;
    if (!s) return;
    setDy(Math.min(0, (e.clientY - s.y) * s.scale));
  };
  const onUp = () => {
    const s = start.current;
    start.current = null;
    setIsDragging(false);
    if (!s) return;
    if (-dy > THRESHOLD) removeTop();
    else setDy(0);
  };
  const onKey = (e: KeyboardEvent<SVGSVGElement>) => {
    if (!locked || open) return;
    if (e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      removeTop();
    }
  };

  const pv = judgePrediction(guess);

  return (
    <div className="space-y-4">
      <div className="space-y-2 border p-3">
        <p className="text-sm leading-relaxed">
          Najpierw przewidywanie. Ciało faraona leżało w środku. <strong>Ile osłon — skrzyń, kaplic i trumien — było wokół niego?</strong>
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" aria-label="mniej" disabled={locked} onClick={() => setGuess((g) => Math.max(1, g - 1))} className="border p-2 disabled:opacity-40">
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-8 text-center font-mono text-lg tabular-nums">{guess}</span>
          <button type="button" aria-label="więcej" disabled={locked} onClick={() => setGuess((g) => Math.min(15, g + 1))} className="border p-2 disabled:opacity-40">
            <Plus className="h-4 w-4" />
          </button>
          {!locked && (
            <button type="button" onClick={() => setLocked(true)} className="ml-2 border-2 px-3 py-2 text-sm font-semibold" style={{ borderColor: color }}>
              Zapisuję i otwieram
            </button>
          )}
        </div>
      </div>

      {locked && (
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div>
            {!open ? (
              <>
                <svg
                  ref={svgRef}
                  viewBox={`0 0 ${VW} ${VH}`}
                  className="w-full cursor-grab touch-none select-none border bg-[#2b241c] outline-none"
                  role="button"
                  tabIndex={0}
                  aria-label={`Zsuń w górę: ${TOMB_LAYERS[removed].name}`}
                  onPointerDown={onDown}
                  onPointerMove={onMove}
                  onPointerUp={onUp}
                  onPointerCancel={onUp}
                  onKeyDown={onKey}
                >
                  {/* warstwy pod spodem — widać tylko brzegi */}
                  {TOMB_LAYERS.map((_, i) => (i > removed ? <LayerShape key={i} i={i} /> : null)).reverse()}
                  <g style={{ transition: isDragging ? 'none' : 'transform 0.25s' }} opacity={1 + dy / 300}>
                    <LayerShape i={removed} dy={dy} top />
                  </g>
                  <text x={CX} y={VH - 8} fontSize={10} textAnchor="middle" fill="#f3e6c8">
                    ↑ zsuń palcem w górę
                  </text>
                </svg>
                <p className="mt-1 text-xs text-muted-foreground">
                  Na wierzchu: <strong>{TOMB_LAYERS[removed].name.toLowerCase()}</strong> · zdjęte: {removed} z ?
                </p>
              </>
            ) : (
              <figure className="mx-auto max-w-[340px] space-y-1">
                <Image
                  src={MASK}
                  alt="Fotografia złotej maski Tutanchamona w muzeum: twarz młodego władcy ze złota, oczy obwiedzione ciemnym kamieniem, na głowie chusta w złote i granatowe pasy, nad czołem głowa kobry i sępa, pod brodą wąska broda, na piersi szeroki kołnierz z kolorowych kamieni"
                  width={720}
                  height={900}
                  className="h-auto w-full border"
                />
                <figcaption className="text-[11px] leading-snug text-muted-foreground">
                  Złota maska Tutanchamona, Muzeum Egipskie w Kairze. Fot. Roland Unger, Wikimedia Commons, domena publiczna.
                </figcaption>
              </figure>
            )}
          </div>

          <div className="space-y-3">
            {last && !open && (
              <div className="border-l-2 pl-3 text-sm leading-relaxed" style={{ borderColor: color }} aria-live="polite">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  zdjęte: {last.name.toLowerCase()} · {last.material}
                </p>
                <p className="mt-1 font-mono text-xs">
                  otwarto: {last.opened} — {yearsSinceFound(removed - 1) === 0 ? 'jeszcze w roku odkrycia grobu' : `${yearsSinceFound(removed - 1)} ${plural(yearsSinceFound(removed - 1), { one: 'rok', few: 'lata', many: 'lat' })} po odkryciu grobu`}
                </p>
                <p className="mt-2">{last.fact}</p>
              </div>
            )}
            {!last && (
              <p className="text-sm leading-relaxed text-muted-foreground">
                Jesteś w komorze grobowej, w lutym 1923 roku. Przed Tobą wielka złocona skrzynia. Zsuń ją palcem w górę.
              </p>
            )}
            {open && (
              <div className="space-y-2 border-l-2 pl-3 text-sm leading-relaxed" style={{ borderColor: color }}>
                <p>
                  <strong>
                    {LAYER_COUNT} osłon: cztery kaplice, sarkofag i trzy trumny.
                  </strong>{' '}
                  {pv.exact
                    ? 'Przewidziałeś/łaś dokładnie!'
                    : `Przewidywałeś/łaś ${guess} — ${pv.diff > 0 ? `o ${pv.diff} za mało` : `o ${-pv.diff} za dużo`}.`}{' '}
                  Na samym dnie: mumia faraona w złotej masce (ponad 10 kg czystego złota). Od odkrycia grobu w {TOMB_FOUND} do maski minęły
                  trzy lata pracy.
                </p>
                <p>
                  Po co tyle warstw? Egipcjanie wierzyli, że dusza po śmierci wraca do ciała — więc ciało musiało przetrwać. Dlatego je{' '}
                  <strong>mumifikowano</strong>: przez wiele dni suszono je w soli zwanej natronem, nacierano olejkami i owijano setkami metrów
                  lnianych bandaży. A potem chowano w osłonach, jedna w drugiej, jak matrioszka.
                </p>
                <p>
                  Tak chowano faraonów i bogaczy. Biednych zakopywano w piasku pustyni — gorący, suchy piasek sam wysuszał ciało.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
