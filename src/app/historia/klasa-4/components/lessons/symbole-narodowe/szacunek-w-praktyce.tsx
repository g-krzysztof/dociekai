'use client';

import { useRef, useState, type PointerEvent } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { img } from '@/lib/media';
import { DragGhost, useDragToken } from '../../family-tree/use-drag-token';
import { FLAG_RED, FLAG_WHITE } from './flaga';
import { FLAG_LIFTED_MESSAGE, SHOP_ITEMS, judgeHymn, judgeShop, type ShopBin } from './szacunek';

const GODLO = img('/images/historia/lekcje/symbole-narodowe/orzel-dzis.png');

/**
 * L10 blok 4 (refleksja) — trzy sytuacje, każda z innym gestem:
 * **podnosi Kubę z krzesełka i zdejmuje mu czapkę** (hymn na stadionie),
 * **podnosi flagę z trawy** (po pochodzie), **rozkłada towary do dwóch
 * koszy** według przepisu (sklep z pamiątkami). Werdykty z ustawy, nie oceny.
 */
export function SzacunekWPraktyce({ color, onComplete }: { color: string; onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const next = (n: number) => {
    setStep(n);
    if (n === 3) onComplete();
  };

  return (
    <div className="space-y-5">
      <Stadion color={color} done={step > 0} onDone={() => next(1)} />
      {step >= 1 && <PoPochodzie color={color} done={step > 1} onDone={() => next(2)} />}
      {step >= 2 && <Sklep color={color} onDone={() => next(3)} />}
      {step >= 3 && (
        <p className="border bg-muted/40 p-4 text-sm leading-relaxed">
          Wstać przy hymnie, podnieść flagę, nie sprzedawać godła jak zwykłego obrazka — to nie są
          szkolne regułki. Symbole mówią „to jesteśmy my”, <strong>i dlatego mają swoje zasady</strong>.
        </p>
      )}
    </div>
  );
}

function Frame({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="border p-4 sm:p-5">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color }}>
        {title}
      </p>
      {children}
    </motion.section>
  );
}

/* --------------------------------------------------------------- stadion */

function Stadion({ color, done, onDone }: { color: string; done: boolean; onDone: () => void }) {
  const [standing, setStanding] = useState(false);
  const [capOff, setCapOff] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const start = useRef<number | null>(null);

  const down = (e: PointerEvent<SVGGElement>) => {
    if (done) return;
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    start.current = e.clientY;
  };
  const move = (e: PointerEvent<SVGGElement>) => {
    if (start.current === null) return;
    if (start.current - e.clientY > 30) {
      setStanding(true);
      setMessage(null);
      start.current = null;
    }
  };

  const check = () => {
    const v = judgeHymn({ standing, capOff });
    setMessage({ ok: v.ok, text: v.message });
    if (v.ok) onDone();
  };

  return (
    <Frame title="Mecz reprezentacji, przed pierwszym gwizdkiem" color={color}>
      <p className="mb-3 text-sm leading-relaxed">
        Z głośników płynie hymn. Kuba siedzi na trybunie w czapce z daszkiem i je chipsy.{' '}
        <strong>Pociągnij Kubę w górę</strong> i <strong>stuknij jego czapkę</strong>, jeśli coś
        trzeba z nią zrobić.
      </p>
      <div className="flex flex-wrap items-end gap-5">
        <svg viewBox="0 0 160 190" className="h-[190px] w-auto touch-none select-none" role="img" aria-label={`Kuba ${standing ? 'stoi' : 'siedzi'}${capOff ? ', czapka w ręce' : ', w czapce'}`}>
          {/* trybuna */}
          <rect x={10} y={150} width={140} height={10} fill="#a1a1aa" />
          <rect x={20} y={160} width={8} height={30} fill="#a1a1aa" />
          <rect x={132} y={160} width={8} height={30} fill="#a1a1aa" />
          <g
            role="button"
            tabIndex={done ? -1 : 0}
            aria-label="Pociągnij Kubę w górę"
            onKeyDown={(e) => {
              if (!done && (e.key === 'Enter' || e.key === 'ArrowUp')) setStanding(true);
            }}
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={() => (start.current = null)}
            className={done ? '' : 'cursor-grab'}
          >
            <motion.g animate={{ y: standing ? -34 : 0 }} transition={{ type: 'spring', stiffness: 160, damping: 16 }}>
              {/* tułów i głowa */}
              <rect x={64} y={88} width={32} height={46} fill="#dc2626" />
              <circle cx={80} cy={72} r={15} fill="#fcd9b6" stroke="#a16207" strokeWidth={0.6} />
              <circle cx={75} cy={71} r={1.6} fill="#292524" />
              <circle cx={85} cy={71} r={1.6} fill="#292524" />
              <rect x={64} y={88} width={32} height={46} fill="transparent" />
            </motion.g>
            {/* nogi: siedzi — zgięte, stoi — proste */}
            {standing ? (
              <>
                <rect x={68} y={100} width={10} height={50} fill="#1e3a8a" />
                <rect x={82} y={100} width={10} height={50} fill="#1e3a8a" />
              </>
            ) : (
              <>
                <rect x={64} y={134} width={42} height={12} fill="#1e3a8a" />
                <rect x={96} y={134} width={10} height={16} fill="#1e3a8a" />
              </>
            )}
          </g>
          {/* czapka */}
          <motion.g
            role="button"
            tabIndex={done ? -1 : 0}
            aria-label={capOff ? 'Czapka w ręce' : 'Czapka na głowie — stuknij'}
            onClick={() => {
              if (done) return;
              setCapOff((c) => !c);
              setMessage(null);
            }}
            onKeyDown={(e) => {
              if (!done && (e.key === 'Enter' || e.key === ' ')) setCapOff((c) => !c);
            }}
            className={done ? '' : 'cursor-pointer'}
            animate={capOff ? { x: 34, y: (standing ? -34 : 0) + 44, rotate: 20 } : { x: 0, y: standing ? -34 : 0, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 150, damping: 16 }}
          >
            <path d="M65 64 Q80 48 95 64 Z" fill="#2563eb" />
            <rect x={90} y={61} width={14} height={4} fill="#1d4ed8" />
            <rect x={60} y={44} width={48} height={26} fill="transparent" />
          </motion.g>
        </svg>
        <div className="min-w-0 flex-1 space-y-3 text-sm">
          {!done && (
            <button
              type="button"
              onClick={check}
              className="cursor-pointer border px-3 py-1.5 font-semibold hover:bg-muted"
              style={{ borderColor: color, color }}
            >
              Hymn gra — tak jest dobrze
            </button>
          )}
          {message && (
            <p className={message.ok ? '' : 'text-destructive'} aria-live="polite">
              {message.ok && <Check className="mr-1 inline h-4 w-4" style={{ color }} aria-hidden />}
              {message.text}
            </p>
          )}
        </div>
      </div>
    </Frame>
  );
}

/* --------------------------------------------------------- po pochodzie */

function PoPochodzie({ color, done, onDone }: { color: string; done: boolean; onDone: () => void }) {
  const [lift, setLift] = useState(0);
  const start = useRef<number | null>(null);
  const lifted = done || lift >= 1;

  const down = (e: PointerEvent<SVGGElement>) => {
    if (lifted) return;
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    start.current = e.clientY;
  };
  const move = (e: PointerEvent<SVGGElement>) => {
    if (start.current === null || lifted) return;
    const v = Math.max(0, Math.min(1, (start.current - e.clientY) / 80));
    setLift(v);
    if (v >= 1) {
      start.current = null;
      onDone();
    }
  };
  const up = () => {
    start.current = null;
    if (!lifted) setLift(0);
  };

  return (
    <Frame title="Ulica po pochodzie 11 listopada" color={color}>
      <p className="mb-3 text-sm leading-relaxed">
        Pochód się skończył, ludzie rozeszli się do domów. Na trawniku leży mała flaga na patyku.{' '}
        {!lifted && <strong>Podnieś ją — pociągnij flagę w górę.</strong>}
      </p>
      <div className="flex flex-wrap items-end gap-5">
        <svg viewBox="0 0 200 150" className="h-[150px] w-auto touch-none select-none" role="img" aria-label={lifted ? 'Flaga podniesiona' : 'Flaga leży na trawie'}>
          <rect x={0} y={120} width={200} height={30} fill="#86efac" />
          <g
            role="button"
            tabIndex={lifted ? -1 : 0}
            aria-label="Podnieś flagę"
            onKeyDown={(e) => {
              if (!lifted && (e.key === 'Enter' || e.key === 'ArrowUp')) {
                setLift(1);
                onDone();
              }
            }}
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={up}
            className={lifted ? '' : 'cursor-grab'}
          >
            <motion.g
              style={{ originX: '60px', originY: '122px' }}
              animate={{ rotate: lifted ? 0 : 90 - 90 * lift }}
              initial={false}
              transition={{ type: 'spring', stiffness: 140, damping: 18 }}
            >
              <rect x={58} y={30} width={4} height={92} fill="#a16207" />
              <rect x={62} y={32} width={56} height={17} fill={FLAG_WHITE} stroke="#a1a1aa" strokeWidth={0.6} />
              <rect x={62} y={49} width={56} height={18} fill={FLAG_RED} />
              <rect x={40} y={20} width={90} height={110} fill="transparent" />
            </motion.g>
          </g>
        </svg>
        {lifted && (
          <p className="min-w-0 flex-1 text-sm leading-relaxed" aria-live="polite">
            <Check className="mr-1 inline h-4 w-4" style={{ color }} aria-hidden />
            {FLAG_LIFTED_MESSAGE}
          </p>
        )}
      </div>
    </Frame>
  );
}

/* ------------------------------------------------------------------ sklep */

function ItemPicture({ id }: { id: string }) {
  if (id === 'urzedowy')
    return <Image src={GODLO} alt="" width={40} height={47} draggable={false} className="pointer-events-none h-11 w-auto" />;
  if (id === 'kreska')
    return (
      <svg viewBox="0 0 40 44" className="h-11 w-auto" aria-hidden>
        <path d="M20 8 L20 34 M20 14 L4 8 L8 22 L20 20 M20 14 L36 8 L32 22 L20 20 M20 34 L14 40 M20 34 L26 40 M18 6 L22 4 L24 8" fill="none" stroke="#dc2626" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  return (
    <svg viewBox="0 0 40 44" className="h-11 w-auto" aria-hidden>
      {[
        [16, 4, '#facc15'], [20, 4, '#facc15'], [16, 8, '#fff'], [20, 8, '#fff'], [4, 12, '#fff'], [8, 12, '#fff'], [12, 12, '#fff'], [16, 12, '#fff'], [20, 12, '#fff'], [24, 12, '#fff'], [28, 12, '#fff'], [32, 12, '#fff'],
        [8, 16, '#fff'], [12, 16, '#fff'], [16, 16, '#fff'], [20, 16, '#fff'], [24, 16, '#fff'], [28, 16, '#fff'], [16, 20, '#fff'], [20, 20, '#fff'], [16, 24, '#fff'], [20, 24, '#fff'], [12, 28, '#facc15'], [24, 28, '#facc15'],
      ].map(([x, y, c], i) => (
        <rect key={i} x={x as number} y={y as number} width={4} height={4} fill={c as string} stroke="#a1a1aa" strokeWidth={0.4} />
      ))}
      <rect x={0} y={0} width={40} height={36} fill="#dc2626" opacity={0.15} />
    </svg>
  );
}

function Sklep({ color, onDone }: { color: string; onDone: () => void }) {
  const [placed, setPlaced] = useState<Partial<Record<string, ShopBin>>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<ReturnType<typeof judgeShop> | null>(null);
  const finished = verdict?.ok ?? false;

  const put = (id: string, bin: ShopBin) => {
    setPlaced((p) => ({ ...p, [id]: bin }));
    setSelected(null);
    setVerdict(null);
  };

  const { drag, hover, bind } = useDragToken({
    disabled: finished,
    onDrop: (id, target) => {
      if (target === 'sklep-tak' || target === 'sklep-nie') put(id, target === 'sklep-tak' ? 'tak' : 'nie');
    },
    onTap: (id) => setSelected((s) => (s === id ? null : id)),
  });

  const tapBin = (bin: ShopBin) => {
    if (selected && !finished) put(selected, bin);
  };

  const check = () => {
    const v = judgeShop(placed);
    setVerdict(v);
    if (v.ok) onDone();
  };

  const token = (id: string) => {
    const it = SHOP_ITEMS.find((i) => i.id === id)!;
    const wrong = verdict?.wrong.find((w) => w.id === id);
    return (
      <div
        key={id}
        {...bind(id)}
        onClick={(e) => e.stopPropagation()}
        role="button"
        tabIndex={finished ? -1 : 0}
        className={`flex touch-none select-none items-center gap-2 border bg-white p-2 text-xs leading-snug dark:bg-zinc-900 ${finished ? '' : 'cursor-grab'} ${selected === id ? 'ring-2' : ''}`}
        style={{
          ...(selected === id ? { ['--tw-ring-color' as string]: color } : {}),
          ...(wrong ? { borderColor: 'hsl(var(--destructive))' } : {}),
          opacity: drag?.id === id ? 0.4 : 1,
        }}
      >
        <ItemPicture id={id} />
        <span className="min-w-0">{it.label}</span>
      </div>
    );
  };

  const bin = (b: ShopBin, title: string) => (
    <div
      data-drop={`sklep-${b}`}
      onClick={() => tapBin(b)}
      className="min-h-28 space-y-2 border-2 border-dashed p-2"
      style={hover === `sklep-${b}` || selected ? { borderColor: color } : undefined}
    >
      <p className="text-xs font-semibold">{title}</p>
      {SHOP_ITEMS.filter((it) => placed[it.id] === b).map((it) => token(it.id))}
    </div>
  );

  const free = SHOP_ITEMS.filter((it) => !placed[it.id]);

  return (
    <Frame title="Sklep z pamiątkami" color={color}>
      <p className="mb-2 text-sm leading-relaxed">
        Właścicielka sklepu chce sprzedawać pamiątki z orłem. Sprawdziła w ustawie:
      </p>
      <blockquote className="mb-3 border bg-muted/40 p-3 text-sm italic">
        Symboli państwa nie wolno umieszczać na towarach na sprzedaż. Dozwolone jest godło lub barwy{' '}
        <strong>w formie stylizowanej lub artystycznie przetworzonej</strong>.
        <span className="mt-1 block text-xs not-italic text-muted-foreground">
          ustawa o godle, barwach i hymnie RP, art. 16 (skrót)
        </span>
      </blockquote>
      <p className="mb-3 text-sm">
        <strong>Przeciągnij każdą rzecz</strong> (albo stuknij ją, a potem półkę) na właściwą
        półkę.
      </p>
      {free.length > 0 && <div className="mb-3 grid gap-2 sm:grid-cols-3">{free.map((it) => token(it.id))}</div>}
      <div className="grid grid-cols-2 gap-3">
        {bin('tak', 'Może być w sklepie')}
        {bin('nie', 'Nie może być w sklepie')}
      </div>
      <DragGhost drag={drag}>
        {drag && (
          <div className="flex items-center gap-2 border bg-white p-2 text-xs dark:bg-zinc-900">
            <ItemPicture id={drag.id} />
          </div>
        )}
      </DragGhost>
      <div className="mt-3 space-y-2 text-sm">
        {!finished && free.length === 0 && (
          <button
            type="button"
            onClick={check}
            className="cursor-pointer border px-3 py-1.5 font-semibold hover:bg-muted"
            style={{ borderColor: color, color }}
          >
            Sprawdź z przepisem
          </button>
        )}
        {verdict?.wrong.map((w) => (
          <p key={w.id} className="text-destructive" aria-live="polite">
            {SHOP_ITEMS.find((i) => i.id === w.id)?.label}: {w.message}
          </p>
        ))}
        {finished && (
          <p aria-live="polite">
            <Check className="mr-1 inline h-4 w-4" style={{ color }} aria-hidden />
            Wierne godło zostaje w urzędach, szkołach i na paszportach. Orzeł narysowany po swojemu
            albo ułożony z klocków może trafić na koszulkę — to już czyjaś praca, nie urzędowy znak.
          </p>
        )}
      </div>
    </Frame>
  );
}
