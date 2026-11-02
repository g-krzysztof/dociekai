'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { CloudLightning, Snowflake, Waves } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DragGhost, useDragToken } from '../../family-tree/use-drag-token';
import { AtrybutGlyph } from './atrybut';
import { ECHO_WHAT, ECHO_WHO, judgeExplanation, PHENOMENA, TOOLS, type Phenomenon } from './natura';
import type { AttributeId } from './olimp';

const ICON = { burza: CloudLightning, sztorm: Waves, zima: Snowflake } as const;

/**
 * Blok 4 — **Po co ludziom mity?** Dwie części:
 *  1. dziecko tłumaczy trzy zjawiska „jak Grek” — przeciąga atrybut boga
 *     (z bloku 1) na zjawisko; po trafieniu obok mitu staje wyjaśnienie
 *     dzisiejsze;
 *  2. układa własny mit o echu z dwóch części i porównuje go z mitem Greków
 *     i z tym, co wiemy dziś. Każde połączenie jest przyjęte — to praca
 *     dziecka, nie test.
 */
export function NaturaWidget({ color, onDone }: { color: string; onDone: () => void }) {
  const [explained, setExplained] = useState<Phenomenon['id'][]>([]);
  const [selected, setSelected] = useState<AttributeId | null>(null);
  const [error, setError] = useState<{ id: string; message: string } | null>(null);
  const [who, setWho] = useState<number | null>(null);
  const [what, setWhat] = useState<number | null>(null);
  const [told, setTold] = useState(false);
  const reported = useRef(false);

  const allExplained = explained.length === PHENOMENA.length;
  const finished = allExplained && told;

  useEffect(() => {
    if (finished && !reported.current) {
      reported.current = true;
      onDone();
    }
  }, [finished, onDone]);

  const place = (toolId: string, target: string | null) => {
    if (!target?.startsWith('zjawisko-')) return;
    const pid = target.slice(9) as Phenomenon['id'];
    if (explained.includes(pid)) return;
    setSelected(null);
    const verdict = judgeExplanation(toolId as AttributeId, pid);
    if (verdict.ok) {
      setExplained((e) => [...e, pid]);
      setError(null);
    } else {
      setError({ id: pid, message: verdict.message });
    }
  };

  const { drag, hover, bind } = useDragToken({
    onDrop: place,
    onTap: (id) => setSelected((prev) => (prev === id ? null : (id as AttributeId))),
  });

  const usedTools = new Set(PHENOMENA.filter((p) => explained.includes(p.id)).map((p) => p.answer));

  const tool = (id: AttributeId) => {
    const t = TOOLS.find((x) => x.id === id)!;
    return (
      <button
        key={id}
        type="button"
        {...bind(id)}
        aria-pressed={selected === id}
        className={cn(
          'flex touch-none select-none items-center gap-1.5 border-2 bg-white px-2.5 py-1.5 text-sm font-semibold dark:bg-zinc-900',
          drag?.id === id && 'opacity-40'
        )}
        style={{ borderColor: selected === id ? color : 'var(--border)', boxShadow: selected === id ? `0 0 0 2px ${color}` : undefined }}
      >
        <AtrybutGlyph id={id} className="h-4 w-4" />
        {t.label}
      </button>
    );
  };

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <p className="text-sm leading-relaxed">
          Jesteś Grekiem sprzed 2500 lat. Nie masz termometru, lunety ani prognozy pogody — masz oczy, uszy i opowieści.
          <strong> Wytłumacz każde zjawisko jak Grek:</strong> przeciągnij na nie atrybut boga, który według mitów za nim
          stoi (albo stuknij atrybut, a potem zjawisko).
        </p>
        <div className="flex flex-wrap gap-2">
          {TOOLS.filter((t) => !usedTools.has(t.id)).map((t) => tool(t.id))}
          {usedTools.size === TOOLS.length && <p className="text-sm text-muted-foreground">Wszystkie atrybuty użyte.</p>}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {PHENOMENA.map((p) => {
          const Icon = ICON[p.id];
          const done = explained.includes(p.id);
          const isHover = hover === `zjawisko-${p.id}`;
          return (
            <div
              key={p.id}
              data-drop={done ? undefined : `zjawisko-${p.id}`}
              role={done ? undefined : 'button'}
              tabIndex={done ? undefined : 0}
              onClick={() => selected && !done && place(selected, `zjawisko-${p.id}`)}
              onKeyDown={(e) => {
                if ((e.key === 'Enter' || e.key === ' ') && selected && !done) place(selected, `zjawisko-${p.id}`);
              }}
              className={cn('border-2 bg-white p-3 transition-colors dark:bg-zinc-900/70', !done && 'border-dashed', (isHover || (selected && !done)) && 'bg-muted')}
              style={{ borderColor: done || isHover ? color : undefined }}
            >
              <p className="flex items-center gap-2 font-semibold">
                <Icon className="h-5 w-5" style={{ color }} aria-hidden />
                {p.label}
                {done && <AtrybutGlyph id={p.answer} className="ml-auto h-4 w-4" />}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{p.scene}</p>
              {error?.id === p.id && !done && (
                <p className="mt-2 border border-destructive/50 bg-destructive/5 px-2 py-1.5 text-xs text-destructive" aria-live="polite">
                  {error.message}
                </p>
              )}
              {done && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 space-y-2 text-sm leading-relaxed">
                  <p>
                    <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color }}>
                      Grek mówił
                    </span>
                    <br />
                    {p.myth}
                  </p>
                  <p className="border-t pt-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Dziś wiemy</span>
                    <br />
                    {p.today}
                  </p>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>

      {allExplained && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 border-t pt-4">
          <p className="text-sm leading-relaxed">
            Mit to nie bajka „dla głupich”. To najlepsze wyjaśnienie, jakie ludzie wtedy mieli: łączy zjawisko z kimś, kogo
            można sobie wyobrazić, i daje się łatwo zapamiętać. <strong>Teraz ty wymyśl mit.</strong> W górach krzyczysz
            „Hej!”, a góry odpowiadają „…ej!”. Kto to robi?
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <fieldset className="space-y-1.5">
              <legend className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Kto?</legend>
              {ECHO_WHO.map((w, i) => (
                <Choice key={w} color={color} active={who === i} disabled={told} onClick={() => setWho(i)}>
                  {w}
                </Choice>
              ))}
            </fieldset>
            <fieldset className="space-y-1.5">
              <legend className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Co się stało?</legend>
              {ECHO_WHAT.map((w, i) => (
                <Choice key={w} color={color} active={what === i} disabled={told} onClick={() => setWhat(i)}>
                  {w}
                </Choice>
              ))}
            </fieldset>
          </div>
          {who !== null && what !== null && (
            <blockquote className="border-l-4 bg-white p-3 text-base italic leading-relaxed dark:bg-zinc-900" style={{ borderColor: color }}>
              W górach mieszka {ECHO_WHO[who]}. {ECHO_WHAT[what][0].toUpperCase() + ECHO_WHAT[what].slice(1)} — i dlatego,
              kiedy zawołasz, góry odpowiadają twoimi słowami.
            </blockquote>
          )}
          {who !== null && what !== null && !told && (
            <button type="button" onClick={() => setTold(true)} className="border-2 px-3 py-1.5 text-sm font-semibold" style={{ borderColor: color, color }}>
              Opowiedz swój mit
            </button>
          )}
          {told && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid gap-3 text-sm leading-relaxed sm:grid-cols-2">
              <p className="border p-3">
                <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color }}>
                  Grecy opowiadali
                </span>
                <br />O nimfie Echo, która tak dużo gadała, że bogini Hera za karę odebrała jej głos. Echo mogła już tylko
                powtarzać cudze ostatnie słowa — i do dziś odpowiada nam w górach.
              </p>
              <p className="border p-3">
                <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Dziś wiemy</span>
                <br />
                Dźwięk odbija się od skał i wraca do nas z opóźnieniem — jak piłka odbita od ściany. Słowo „echo” wzięliśmy
                od tej nimfy.
              </p>
              <p className="sm:col-span-2">
                Twój mit wyjaśnia echo tak samo dobrze jak mit Greków — i tak samo nie da się go sprawdzić. Tym różni się
                mit od nauki: nauka wyjaśnia rzeczy, które da się zmierzyć i sprawdzić. A mit mówi, jak ludzie widzieli
                świat.
              </p>
            </motion.div>
          )}
        </motion.div>
      )}

      <DragGhost drag={drag}>{drag ? tool(drag.id as AttributeId) : null}</DragGhost>
    </div>
  );
}

function Choice({
  color,
  active,
  disabled,
  onClick,
  children,
}: {
  color: string;
  active: boolean;
  disabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={active}
      className={cn('block w-full border-2 bg-white px-3 py-2 text-left text-sm dark:bg-zinc-900', active && 'font-semibold')}
      style={{ borderColor: active ? color : 'var(--border)' }}
    >
      {children}
    </button>
  );
}
