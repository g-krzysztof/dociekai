'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { IsoCube } from '../../iso-cube';
import { baseArea, boxVolume, buildLayerFill } from '../../../lib/box-volume';
import { plural } from '../../../lib/plural';
import type { BoxSpec } from '../../../lib/solids';

const MAX_DIM = 5;

interface Round {
  id: string;
  spec: BoxSpec;
  story: string;
}

const ROUNDS: Round[] = [
  {
    id: 'pudelko-4-3-3',
    spec: { width: 4, depth: 3, height: 3 },
    story:
      'Pudełko ma dno 4 na 3 kostki. Układaj kostki warstwami i patrz, jak rośnie ich liczba.',
  },
  {
    id: 'pudelko-5-2-4',
    spec: { width: 5, depth: 2, height: 4 },
    story:
      'Teraz dno jest węższe, ale pudełko wyższe. Sprawdź, czy liczenie warstwami działa tak samo.',
  },
];

/**
 * Nowe pojęcie: **wzór nie spada z nieba, tylko wychodzi z liczenia warstwami.**
 * Dziecko dokłada kostki warstwa po warstwie, a tabela obok pokazuje sumę
 * narastającą: za każdym razem dochodzi **ta sama** liczba kostek — pole
 * podstawy. Kiedy pudełko jest pełne, `V = a · b · c` jest już tylko zapisem
 * tego, co przed chwilą było widać, a nie osobną regułą do wykucia.
 *
 * Warstwy da się też zdejmować (`Zdejmij warstwę`) — przeładowanie jest
 * cofalne, ta sama zasada co w każdym innym widżecie kursu. Liczby w tabeli
 * i liczba kostek na rysunku pochodzą z `buildLayerFill`, więc nie mogą się
 * rozjechać.
 */
export function LayerStack({ color, onComplete }: { color: string; onComplete?: () => void }) {
  const [index, setIndex] = useState(0);
  const [layers, setLayers] = useState(0);
  const [finished, setFinished] = useState(false);

  const round = ROUNDS[Math.min(index, ROUNDS.length - 1)];
  const spec = round.spec;
  const fill = buildLayerFill(spec);
  const perLayer = baseArea(spec);
  const full = layers === spec.height;
  const containerRef = useSectionScrollAnchor(`${index}-${full}-${finished}`);
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  const goNext = () => {
    setLayers(0);
    if (index + 1 < ROUNDS.length) {
      setIndex(index + 1);
      return;
    }
    setFinished(true);
    onComplete?.();
  };

  if (finished) {
    return (
      <div
        ref={containerRef}
        className="border-t-2 p-5 sm:p-6"
        style={{ borderColor: color, backgroundColor: `${color}0f` }}
      >
        <p className="mb-2 flex items-center gap-2 text-lg font-bold" style={{ color: textColor }}>
          <Check className="h-5 w-5 shrink-0" aria-hidden />
          Masz wzór na objętość
        </p>
        <p className="mb-4 text-base leading-relaxed">
          Za każdym razem dochodziła <strong>ta sama</strong> liczba kostek — tyle, ile mieści dno.
          Dodawanie tej samej liczby wiele razy to mnożenie, więc:
        </p>
        <p
          className="border-l-2 px-4 py-3 text-center font-mono text-xl font-black tabular-nums sm:text-2xl"
          style={{ borderColor: color, color, backgroundColor: `${color}0d` }}
        >
          V = a · b · c
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          <strong>a · b</strong> to pole podstawy, czyli jedna warstwa. <strong>c</strong> to
          wysokość, czyli liczba warstw.
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">{round.story}</p>
        <p className="text-sm text-muted-foreground">
          Pudełko{' '}
          <span className="font-mono font-bold tabular-nums" style={{ color }}>
            {index + 1}
          </span>{' '}
          z {ROUNDS.length}
        </p>
      </div>

      <div className="grid items-center gap-6 md:grid-cols-[minmax(0,260px)_1fr]">
        <IsoCube
          dims={{ x: spec.width, y: spec.height, z: spec.depth }}
          filledLayers={layers}
          maxDim={MAX_DIM}
          color={color}
          className="mx-auto h-auto w-full max-w-[260px]"
          ariaLabel={
            layers === 0
              ? `Puste pudełko o dnie ${spec.width} na ${spec.depth} kostek i wysokości ${spec.height}`
              : `Pudełko z ${layers} ${plural(layers, { one: 'warstwą', few: 'warstwami', many: 'warstwami' })} kostek, razem ${perLayer * layers}`
          }
        />

        <div>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b" style={{ backgroundColor: `${color}0d` }}>
                <th className="px-3 py-2 font-semibold">Warstwa</th>
                <th className="px-3 py-2 font-semibold">Dochodzi</th>
                <th className="px-3 py-2 font-semibold">Razem kostek</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <AnimatePresence initial={false}>
                {fill.slice(0, layers).map((layer) => (
                  <motion.tr
                    key={layer.index}
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    <td className="px-3 py-2 font-mono tabular-nums">{layer.index}</td>
                    <td className="px-3 py-2 font-mono tabular-nums text-muted-foreground">
                      + {layer.perLayer}
                    </td>
                    <td
                      className="px-3 py-2 font-mono text-base font-bold tabular-nums"
                      style={{ color }}
                    >
                      {layer.runningTotal}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
              {layers === 0 && (
                <tr>
                  <td className="px-3 py-3 text-muted-foreground" colSpan={3}>
                    Pudełko jest puste. Dołóż pierwszą warstwę.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <p className="mt-3 text-sm leading-relaxed">
            Na dnie mieści się{' '}
            <strong className="font-mono tabular-nums" style={{ color: textColor }}>
              {spec.width} · {spec.depth} = {perLayer}
            </strong>{' '}
            {plural(perLayer, { one: 'kostka', few: 'kostki', many: 'kostek' })} — i tyle samo
            wchodzi w każdą kolejną warstwę.
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => setLayers((v) => Math.max(0, v - 1))}
          disabled={layers === 0}
          aria-label="Zdejmij warstwę"
          className="flex h-9 w-9 cursor-pointer items-center justify-center border transition-colors hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-white/10"
        >
          <Minus className="h-4 w-4" aria-hidden />
        </button>
        <Button
          onClick={() => setLayers((v) => Math.min(spec.height, v + 1))}
          disabled={full}
          style={full ? undefined : { backgroundColor: color }}
        >
          <Plus className="mr-1 h-4 w-4" />
          Dołóż warstwę
        </Button>
        <span className="text-sm text-muted-foreground">
          {layers} z {spec.height}
        </span>
      </div>

      {full && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
          <p
            className="border-t-2 px-4 py-3 text-center font-mono text-lg font-bold tabular-nums"
            style={{ borderColor: color, color, backgroundColor: `${color}0f` }}
          >
            {perLayer} · {spec.height} = {boxVolume(spec)} kostek
          </p>
          <p className="mt-3 text-center text-sm leading-relaxed" style={{ color: textColor }}>
            Warstwa razy liczba warstw. Nie trzeba było liczyć kostek po jednej.
          </p>
          <div className="mt-3 flex justify-center">
            <Button onClick={goNext} variant="outline">
              {index + 1 < ROUNDS.length ? 'Drugie pudełko' : 'Zapisz to wzorem'}
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}

      <ul className="sr-only">
        {ROUNDS.map((item) => (
          <li key={item.id}>
            Pudełko {item.spec.width} × {item.spec.depth} × {item.spec.height}: na dnie{' '}
            {baseArea(item.spec)} kostek, warstw {item.spec.height}, razem {boxVolume(item.spec)}{' '}
            kostek.
          </li>
        ))}
      </ul>
    </div>
  );
}
