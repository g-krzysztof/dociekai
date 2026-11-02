'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { DragGhost, useDragToken } from '../../family-tree/use-drag-token';
import { EMPEROR_REPLY, GODS, JUDA_BY_HAND, judgeMarek, MATTERS, type EmperorTarget, type GodId } from './bogowie';

type Phase = 'marek' | 'juda' | 'cesarz' | 'gotowe';

/** Proste znaki atrybutów rysowane kodem (24×24). */
function AttrIcon({ god, className }: { god: GodId; className?: string }) {
  const p = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <svg viewBox="0 0 24 24" className={cn('h-7 w-7', className)} aria-hidden>
      {god === 'jowisz' && <path d="M13 2 L6 13 H11 L9 22 L18 9 H13 Z" {...p} />}
      {god === 'neptun' && (
        <path d="M12 22 V6 M6 3 V9 Q6 12 12 12 Q18 12 18 9 V3 M12 2 V6 M4.5 5 L6 3 L7.5 5 M10.5 4 L12 2 L13.5 4 M16.5 5 L18 3 L19.5 5" {...p} />
      )}
      {god === 'ceres' && (
        <path d="M12 22 V8 M12 8 Q9 6 9 3 Q12 4 12 8 Q15 4 15 3 Q15 6 12 8 M12 13 Q8 12 7 8 Q11 9 12 13 Q13 9 17 8 Q16 12 12 13 M12 18 Q8 17 7 13 Q11 14 12 18 Q13 14 17 13 Q16 17 12 18" {...p} />
      )}
      {god === 'eskulap' && <path d="M12 2 V22 M9 5 Q15 7 12 9 Q9 11 15 13 Q9 15 12 17 Q14 18 13 20" {...p} />}
      {god === 'merkury' && <path d="M4 19 H14 Q17 19 17 16 L14 15 L9 15 L7 17 L4 17 Z M14 15 Q17 11 21 10 Q19 13 20 14 Q17 13 15 15" {...p} />}
    </svg>
  );
}

function ScrollIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 32" className={cn('h-10 w-14', className)} aria-hidden>
      <rect x={10} y={6} width={28} height={20} fill="#f5ecd4" stroke="currentColor" strokeWidth={1.5} />
      <rect x={4} y={3} width={7} height={26} rx={3} fill="#c9a36b" stroke="currentColor" strokeWidth={1.5} />
      <rect x={37} y={3} width={7} height={26} rx={3} fill="#c9a36b" stroke="currentColor" strokeWidth={1.5} />
    </svg>
  );
}

/**
 * Blok 2 — **Wielu bogów czy jeden?** Gesty: przeciąganie spraw z życia (albo
 * stuk-stuk) na posągi na półce Rzymianina Marka — sędzią jest to, czym bóg
 * się opiekował (atrybut); te same sprawy do domu Żyda Judy, gdzie jest jeden
 * Bóg i zwój Tory (po dwóch reszta leci sama); na koniec posąg cesarza —
 * mieści się u Marka, od Judy odbija się. `onDone`, gdy posąg cesarza był
 * u obu.
 */
export function BogowieWidget({
  color,
  images,
  onDone,
}: {
  color: string;
  images: { lararium: string; zwoj: string };
  onDone: () => void;
}) {
  const [phase, setPhase] = useState<Phase>('marek');
  const [marek, setMarek] = useState<Record<string, GodId>>({});
  const [juda, setJuda] = useState<string[]>([]);
  const [emperor, setEmperor] = useState<Partial<Record<EmperorTarget, boolean>>>({});
  const [bounce, setBounce] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const reported = useRef(false);

  const pending =
    phase === 'marek' ? MATTERS.filter((m) => !marek[m.id]) : phase === 'juda' ? MATTERS.filter((m) => !juda.includes(m.id)) : [];

  // Po JUDA_BY_HAND sprawach reguła jest widoczna — reszta leci do Judy sama, jedna po drugiej.
  useEffect(() => {
    if (phase !== 'juda' || juda.length < JUDA_BY_HAND || juda.length >= MATTERS.length) return;
    const id = window.setTimeout(() => {
      const next = MATTERS.find((m) => !juda.includes(m.id));
      if (next) setJuda((prev) => [...prev, next.id]);
    }, 700);
    return () => window.clearTimeout(id);
  }, [phase, juda]);

  useEffect(() => {
    if (phase === 'juda' && juda.length >= MATTERS.length) {
      const id = window.setTimeout(() => setPhase('cesarz'), 900);
      return () => window.clearTimeout(id);
    }
  }, [phase, juda]);

  useEffect(() => {
    if (phase === 'cesarz' && emperor.marek && emperor.juda && !reported.current) {
      reported.current = true;
      setPhase('gotowe');
      onDone();
    }
  }, [phase, emperor, onDone]);

  const drop = (token: string, target: string | null) => {
    setPicked(null);
    if (!target) return;
    if (token === 'cesarz') {
      if (target !== 'marek' && target !== 'juda' && !target.startsWith('god:')) return;
      const who: EmperorTarget = target === 'juda' ? 'juda' : 'marek';
      setEmperor((prev) => ({ ...prev, [who]: true }));
      setMsg(null);
      if (who === 'juda') {
        setBounce(true);
        window.setTimeout(() => setBounce(false), 600);
      }
      return;
    }
    if (phase === 'marek') {
      if (!target.startsWith('god:')) return;
      const v = judgeMarek(token, target.slice(4) as GodId);
      if (!v.ok) {
        setMsg(v.message);
        return;
      }
      setMsg(null);
      const next = { ...marek, [token]: v.god.id };
      setMarek(next);
      if (Object.keys(next).length >= MATTERS.length) setPhase('juda');
      return;
    }
    if (phase === 'juda') {
      if (target !== 'juda') {
        setMsg('Te sprawy zanosisz teraz do domu Judy.');
        return;
      }
      setMsg(null);
      setJuda((prev) => (prev.includes(token) ? prev : [...prev, token]));
    }
  };

  const { drag, hover, bind } = useDragToken({
    onDrop: drop,
    onTap: (id) => setPicked((p) => (p === id ? null : id)),
    disabled: phase === 'gotowe',
  });

  const tapTarget = (target: string) => {
    if (picked) drop(picked, target);
  };

  const dragged = drag ? (drag.id === 'cesarz' ? 'Posąg cesarza' : MATTERS.find((m) => m.id === drag.id)?.text) : null;
  const gods = (godId: GodId) => MATTERS.filter((m) => marek[m.id] === godId);

  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed">
        {phase === 'marek' && (
          <>
            <strong>Dom Marka w Rzymie.</strong> Rzymianie czcili tych samych bogów co Grecy — tylko pod innymi imionami.
            Każdy bóg opiekował się czymś innym. <strong>Zanieś każdą sprawę do boga, do którego Marek by się pomodlił</strong>{' '}
            (przeciągnij albo stuknij sprawę, potem posąg). Podpowiedź: patrz, co bóg trzyma.
          </>
        )}
        {phase === 'juda' && (
          <>
            <strong>Dom Judy w Jerozolimie.</strong> Juda jest Żydem. Zanieś mu te same sprawy. Do kogo on się pomodli?
          </>
        )}
        {phase === 'cesarz' && (
          <>
            Do miasta przychodzi rzymski urzędnik z posągiem cesarza: „Każdy ma złożyć ofiarę przed posągiem!”.{' '}
            <strong>Zanieś posąg do Marka, a potem do Judy.</strong>
          </>
        )}
      </p>

      {/* Taca spraw. */}
      {pending.length > 0 && (phase === 'marek' || juda.length < JUDA_BY_HAND) && (
        <div className="grid grid-cols-2 gap-1.5 border border-dashed p-1.5 sm:flex sm:flex-wrap sm:gap-2 sm:p-2">
          {pending.map((m) => (
            <button
              key={m.id}
              type="button"
              {...bind(m.id)}
              className={cn(
                'touch-none border-2 bg-white px-2 py-1 text-left text-xs leading-snug dark:bg-zinc-900 sm:max-w-[15rem] sm:px-2.5 sm:py-1.5 sm:text-sm',
                drag?.id === m.id && 'opacity-30'
              )}
              style={{ borderColor: picked === m.id ? color : undefined }}
            >
              {m.text}
            </button>
          ))}
        </div>
      )}
      {phase === 'cesarz' && (
        <div className="flex border border-dashed p-2">
          <button
            type="button"
            {...bind('cesarz')}
            className={cn('touch-none border-2 bg-white px-3 py-1.5 text-sm font-semibold dark:bg-zinc-900', drag?.id === 'cesarz' && 'opacity-30')}
            style={{ borderColor: picked === 'cesarz' ? color : undefined }}
          >
            Posąg cesarza Tyberiusza
          </button>
        </div>
      )}

      <div className={cn('grid gap-3', phase !== 'marek' && 'grid-cols-2')}>
        {/* Dom Marka. */}
        <section
          data-drop="marek"
          onClick={() => phase === 'cesarz' && tapTarget('marek')}
          className={cn('border bg-white p-2 dark:bg-zinc-900', hover === 'marek' && 'ring-2')}
          style={hover === 'marek' ? { boxShadow: `0 0 0 2px ${color}` } : undefined}
        >
          <div className="mb-2 flex items-center gap-2">
            <Image src={images.lararium} alt="" width={64} height={48} className="h-12 w-16 object-cover" />
            <div className="text-sm leading-tight">
              <strong>Marek</strong>
              <span className="block text-xs text-muted-foreground">Rzym · półka z posągami bogów</span>
            </div>
          </div>
          <div className={cn('grid gap-1.5', phase === 'marek' ? 'grid-cols-3 sm:grid-cols-5' : 'grid-cols-3')}>
            {GODS.map((g) => {
              const id = `god:${g.id}`;
              const done = gods(g.id);
              return (
                <div
                  key={g.id}
                  data-drop={id}
                  onClick={(e) => {
                    e.stopPropagation();
                    tapTarget(phase === 'cesarz' ? 'marek' : id);
                  }}
                  className={cn('flex flex-col items-center border p-1 text-center', picked && 'cursor-pointer')}
                  style={{ borderColor: hover === id ? color : undefined, background: hover === id ? `${color}14` : undefined }}
                >
                  <AttrIcon god={g.id} />
                  <span className="text-xs font-semibold leading-tight">{g.name}</span>
                  {phase === 'marek' && <span className="text-[10px] leading-tight text-muted-foreground">({g.greek})</span>}
                  {done.length > 0 && <span className="mt-0.5 text-[10px] leading-tight">{g.care}</span>}
                </div>
              );
            })}
            {emperor.marek && (
              <div className="flex flex-col items-center border-2 p-1 text-center" style={{ borderColor: color }}>
                <span className="text-lg leading-none" aria-hidden>
                  ♛
                </span>
                <span className="text-xs font-semibold leading-tight">Cesarz</span>
              </div>
            )}
          </div>
          {phase !== 'marek' && (
            <p className="mt-2 text-xs">
              Modli się do: <strong>{new Set(Object.values(marek)).size + (emperor.marek ? 1 : 0)}</strong> różnych bogów
            </p>
          )}
        </section>

        {/* Dom Judy. */}
        {phase !== 'marek' && (
          <section
            data-drop="juda"
            onClick={() => tapTarget('juda')}
            className={cn('border bg-white p-2 transition-transform dark:bg-zinc-900', bounce && 'translate-x-1')}
            style={hover === 'juda' ? { boxShadow: `0 0 0 2px ${color}` } : undefined}
          >
            <div className="mb-2 flex items-center gap-2">
              <Image src={images.zwoj} alt="" width={64} height={48} className="h-12 w-16 object-cover" />
              <div className="text-sm leading-tight">
                <strong>Juda</strong>
                <span className="block text-xs text-muted-foreground">Jerozolima · zwój Tory, bez posągów</span>
              </div>
            </div>
            <div className="flex flex-col items-center gap-1 border p-2 text-center">
              <ScrollIcon />
              <span className="text-xs font-semibold">jeden Bóg</span>
              <span className="text-[11px] leading-tight text-muted-foreground">Żydzi nie robili posągów ani obrazów Boga</span>
              {juda.length > 0 && (
                <ul className="mt-1 space-y-0.5 text-left text-[11px] leading-tight">
                  {juda.map((id) => (
                    <li key={id}>• {MATTERS.find((m) => m.id === id)?.text}</li>
                  ))}
                </ul>
              )}
            </div>
            <p className="mt-2 text-xs">
              Modli się do: <strong>1</strong> Boga
            </p>
          </section>
        )}
      </div>

      {msg && (
        <p aria-live="polite" className="text-sm text-destructive">
          {msg}
        </p>
      )}
      {phase === 'juda' && juda.length >= JUDA_BY_HAND && (
        <p className="text-sm leading-relaxed">
          Już widać regułę: z każdą sprawą Juda idzie do tego samego, jedynego Boga. Reszta spraw trafia do niego sama.
        </p>
      )}
      <div aria-live="polite" className="space-y-2 text-sm leading-relaxed">
        {emperor.marek && <p>{EMPEROR_REPLY.marek}</p>}
        {emperor.juda && <p className="text-destructive">{EMPEROR_REPLY.juda}</p>}
      </div>

      {phase === 'gotowe' && (
        <div className="space-y-2 border-2 p-3 text-sm leading-relaxed" style={{ borderColor: color }}>
          <p>
            Wiara w wielu bogów to <strong>politeizm</strong> (z greckiego: <em>poly</em> — wielu, <em>theos</em> — bóg). Wiara w
            jednego Boga to <strong>monoteizm</strong> (<em>monos</em> — jeden). Żydzi byli w starożytności jednym z niewielu
            ludów, które wierzyły w jednego Boga. Ich wiara to <strong>judaizm</strong>, a ich święta księga — <strong>Tora</strong>.
          </p>
          <p>
            Rzymianie uważali Żydów za dziwaków, a czasem za nieposłusznych. Ale judaizm był starą, znaną religią, więc zwykle
            robili dla niego wyjątek: w świątyni w Jerozolimie składano ofiary <em>za</em> cesarza, a nie <em>cesarzowi</em>.
            Chrześcijanie — o których jest ta lekcja — takiego wyjątku nie dostali. Co z tego wynikło, zobaczysz w następnej
            lekcji.
          </p>
        </div>
      )}

      <DragGhost drag={drag}>
        <div className="max-w-[14rem] border-2 bg-white px-2.5 py-1.5 text-sm dark:bg-zinc-900" style={{ borderColor: color }}>
          {dragged}
        </div>
      </DragGhost>
    </div>
  );
}
