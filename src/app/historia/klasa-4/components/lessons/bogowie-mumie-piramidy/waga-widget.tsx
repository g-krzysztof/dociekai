'use client';

import { useState } from 'react';
import { DragGhost, useDragToken } from '../../family-tree/use-drag-token';
import { DEEDS, RULES, heartTilt, judgeDeed, type Pan } from './waga';

/**
 * Blok 2 L20, część B — **waga serca**. Dziecko kładzie czyny z życia
 * Neferu (wymyślony piekarz z Teb) na szalę z sercem — jeśli łamią którąś
 * z zasad wypisanych nad wagą — albo odkłada obok. Waga przechyla się na
 * żywo. Gdy serce okazuje się cięższe od pióra, Neferu „jeszcze żyje”:
 * dziecko stuka złe czyny, a Neferu je naprawia — waga wraca do równowagi.
 */

export function WagaWidget({ color, onDone }: { color: string; onDone: () => void }) {
  const [placed, setPlaced] = useState<Record<string, Pan>>({});
  const [mended, setMended] = useState<string[]>([]);
  const [picked, setPicked] = useState<string | null>(null);
  const [why, setWhy] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);

  const put = (id: string, pan: Pan) => {
    const deed = DEEDS.find((d) => d.id === id);
    if (!deed) return;
    const v = judgeDeed(deed, pan);
    if (!v.ok) {
      setWhy(v.reason);
      return;
    }
    setWhy(null);
    setPicked(null);
    setPlaced((p) => ({ ...p, [id]: pan }));
  };

  const allPlaced = DEEDS.every((d) => placed[d.id]);
  const { drag, hover, bind } = useDragToken({
    onDrop: (id, target) => {
      if (target === 'w-serce') put(id, 'serce');
      else if (target === 'w-obok') put(id, 'obok');
    },
    onTap: (id) => setPicked(id),
    disabled: allPlaced,
  });

  const onHeart = DEEDS.filter((d) => placed[d.id] === 'serce').map((d) => d.id);
  const tilt = heartTilt(onHeart, mended);
  const angle = Math.min(14, tilt * 7);
  const free = DEEDS.filter((d) => !placed[d.id]);
  const dragged = DEEDS.find((d) => d.id === drag?.id);

  const mend = (id: string) => {
    if (mended.includes(id)) return;
    const next = [...mended, id];
    setMended(next);
    if (heartTilt(onHeart, next) === 0 && !finished) {
      setFinished(true);
      onDone();
    }
  };

  const zone = (pan: Pan) => ({
    'data-drop': `w-${pan}`,
    onClick: () => picked && put(picked, pan),
    style: { background: hover === `w-${pan}` ? `${color}22` : undefined, borderColor: hover === `w-${pan}` ? color : undefined },
  });

  // Ramię wagi: obrót wokół środka (200, 40); szale wiszą pionowo na końcach.
  const rad = (angle * Math.PI) / 180;
  const lx = Math.round((200 - 120 * Math.cos(rad)) * 100) / 100;
  const ly = Math.round((40 + 120 * Math.sin(rad)) * 100) / 100;
  const rx = Math.round((200 + 120 * Math.cos(rad)) * 100) / 100;
  const ry = Math.round((40 - 120 * Math.sin(rad)) * 100) / 100;

  return (
    <div className="space-y-4">
      <div className="border bg-amber-50/70 p-3 dark:bg-zinc-900">
        <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
          Co zmarły mówił przed sądem — kilka zdań z Księgi Umarłych (omówienie)
        </p>
        <ul className="grid gap-x-4 gap-y-1 font-serif text-sm sm:grid-cols-2">
          {RULES.map((r) => (
            <li key={r.id}>„{r.text}”</li>
          ))}
        </ul>
      </div>

      <svg viewBox="0 0 400 168" className="w-full max-w-[460px]" role="img" aria-label={tilt === 0 ? 'Waga w równowadze' : 'Szala z sercem opada w dół'}>
        <rect x={194} y={40} width={12} height={100} fill="#8a6a3a" />
        <rect x={160} y={138} width={80} height={8} fill="#6a4f2a" />
        <g style={{ transition: 'all 0.5s' }}>
          <line x1={lx} y1={ly} x2={rx} y2={ry} stroke="#6a4f2a" strokeWidth={5} strokeLinecap="round" />
          <circle cx={200} cy={40} r={5} fill="#6a4f2a" />
          {/* szala serca */}
          <line x1={lx} y1={ly} x2={lx - 26} y2={ly + 50} stroke="#8a7a62" />
          <line x1={lx} y1={ly} x2={lx + 26} y2={ly + 50} stroke="#8a7a62" />
          <path d={`M ${lx - 32} ${ly + 50} Q ${lx} ${ly + 64} ${lx + 32} ${ly + 50} Z`} fill="#c9a24a" />
          <path
            d={`M ${lx} ${ly + 46} C ${lx - 14} ${ly + 36} ${lx - 10} ${ly + 24} ${lx} ${ly + 32} C ${lx + 10} ${ly + 24} ${lx + 14} ${ly + 36} ${lx} ${ly + 46} Z`}
            fill="#b5473a"
            transform={`translate(${lx} ${ly + 40}) scale(${1 + tilt * 0.15}) translate(${-lx} ${-(ly + 40)})`}
          />
          {/* szala pióra */}
          <line x1={rx} y1={ry} x2={rx - 26} y2={ry + 50} stroke="#8a7a62" />
          <line x1={rx} y1={ry} x2={rx + 26} y2={ry + 50} stroke="#8a7a62" />
          <path d={`M ${rx - 32} ${ry + 50} Q ${rx} ${ry + 64} ${rx + 32} ${ry + 50} Z`} fill="#c9a24a" />
          <path d={`M ${rx} ${ry + 50} Q ${rx - 8} ${ry + 30} ${rx + 2} ${ry + 14} Q ${rx + 8} ${ry + 32} ${rx} ${ry + 50} Z`} fill="#f4f1ea" stroke="#9a9488" />
        </g>
        <text x={60} y={164} fontSize={13} textAnchor="middle" fill="currentColor">
          serce Neferu
        </text>
        <text x={340} y={164} fontSize={13} textAnchor="middle" fill="currentColor">
          pióro Maat
        </text>
      </svg>

      <div className="grid gap-2 sm:grid-cols-2">
        <button type="button" {...zone('serce')} className="min-h-[72px] border-2 border-dashed p-2 text-left text-sm">
          <span className="font-semibold">Na szalę z sercem</span>
          <span className="block text-xs text-muted-foreground">czyn łamie którąś z zasad</span>
          {DEEDS.filter((d) => placed[d.id] === 'serce').map((d) => (
            <span key={d.id} className="mt-1 block text-xs" style={{ textDecoration: mended.includes(d.id) ? 'line-through' : undefined }}>
              {d.text}
            </span>
          ))}
        </button>
        <button type="button" {...zone('obok')} className="min-h-[72px] border-2 border-dashed p-2 text-left text-sm">
          <span className="font-semibold">Obok wagi</span>
          <span className="block text-xs text-muted-foreground">nie łamie żadnej zasady</span>
          {DEEDS.filter((d) => placed[d.id] === 'obok').map((d) => (
            <span key={d.id} className="mt-1 block text-xs">
              {d.text}
            </span>
          ))}
        </button>
      </div>

      {!allPlaced && (
        <div className="space-y-2">
          <p className="text-sm leading-relaxed">
            Życie Neferu, piekarza z Teb (postać wymyślona). <strong>Przeciągnij każdy czyn</strong> na szalę z sercem albo obok wagi —
            zdecydują zasady w ramce.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {free.map((d) => (
              <button
                key={d.id}
                type="button"
                {...bind(d.id)}
                className="touch-none border-2 bg-white p-2 text-left text-sm dark:bg-zinc-900"
                style={{ borderColor: picked === d.id ? color : undefined }}
              >
                {d.text}
              </button>
            ))}
          </div>
        </div>
      )}
      <DragGhost drag={drag}>
        <span className="block max-w-[240px] border-2 bg-white p-2 text-xs dark:bg-zinc-900">{dragged?.text}</span>
      </DragGhost>
      {why && (
        <p className="text-sm text-destructive" role="status">
          {why}
        </p>
      )}

      {allPlaced && !finished && (
        <div className="space-y-2 border-l-2 pl-3 text-sm leading-relaxed" style={{ borderColor: color }}>
          <p>
            <strong>Serce cięższe niż pióro.</strong> Egipcjanie wierzyli, że wtedy Ammit zjada serce, a zmarły znika na zawsze. Ale
            Neferu jeszcze żyje! <strong>Stuknij każdy zły czyn</strong> — i zobacz, co może naprawić.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {DEEDS.filter((d) => d.breaks).map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => mend(d.id)}
                disabled={mended.includes(d.id)}
                className="border-2 p-2 text-left text-sm disabled:opacity-80"
                style={{ borderColor: mended.includes(d.id) ? color : undefined }}
              >
                {mended.includes(d.id) ? d.mended : d.text}
              </button>
            ))}
          </div>
        </div>
      )}

      {finished && (
        <div className="space-y-2 border-l-2 pl-3 text-sm leading-relaxed" style={{ borderColor: color }}>
          <p>
            <strong>Serce i pióro ważą tyle samo.</strong> Ozyrys wpuściłby Neferu do krainy wiecznego życia — podobnej do Egiptu, tylko
            bez głodu i trudu.
          </p>
          <p>
            Widzisz, po co Egipcjanom była ta wiara? Sąd po śmierci zachęcał, żeby <strong>za życia</strong> nie kraść, nie kłamać i nie
            oszukiwać na wadze. Wiara w życie po śmierci zmieniała to, jak ludzie żyli.
          </p>
        </div>
      )}
    </div>
  );
}
