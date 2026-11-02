'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { Beat, GuideAct } from '../guide-act';
import { PartChip } from '../part-chip';
import { SolidSpinner, type SolidPart } from '../../solid-spinner';
import { BOX_PARTS } from '../../../lib/solids';
import { plural, type PluralForms } from '../../../lib/plural';

interface PartInfo {
  id: SolidPart;
  chip: string;
  count: number;
  forms: PluralForms;
  text: string;
}

const PARTS: PartInfo[] = [
  {
    id: 'sciany',
    chip: 'Ściana',
    count: BOX_PARTS.sciany,
    forms: { one: 'ściana', few: 'ściany', many: 'ścian' },
    text: 'Ściana to płaski kawałek powierzchni bryły — ten, po którym możesz przejechać całą dłonią. W prostopadłościanie każda ściana jest prostokątem.',
  },
  {
    id: 'krawedzie',
    chip: 'Krawędź',
    count: BOX_PARTS.krawedzie,
    forms: { one: 'krawędź', few: 'krawędzie', many: 'krawędzi' },
    text: 'Krawędź to odcinek, wzdłuż którego stykają się dwie ściany. Po krawędzi jedzie palec, kiedy prowadzisz go po brzegu pudełka.',
  },
  {
    id: 'wierzcholki',
    chip: 'Wierzchołek',
    count: BOX_PARTS.wierzcholki,
    forms: { one: 'wierzchołek', few: 'wierzchołki', many: 'wierzchołków' },
    text: 'Wierzchołek to punkt, w którym schodzą się krawędzie. W pudełku to właśnie te rogi, którymi najłatwiej się uderzyć.',
  },
];

export function ActTrzySlowa({ color }: { color: string }) {
  const [revealed, setRevealed] = useState<SolidPart[]>([]);
  const [highlight, setHighlight] = useState<SolidPart | null>(null);
  const [xray, setXray] = useState(true);
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  const reveal = (id: SolidPart) => {
    setHighlight(id);
    setRevealed((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  return (
    <GuideAct id="trzy-slowa" mode="flow">
      <h2 className="mb-2 text-2xl font-bold leading-snug sm:text-3xl">
        Ściana, krawędź, wierzchołek
      </h2>
      <p className="mb-6 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        Trzy słowa opisują całe pudełko. Kliknij każde z nich — zobaczysz na bryle, o co dokładnie
        chodzi. Bryłę możesz przy okazji obrócić.
      </p>

      <div className="grid items-center gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[280px_1fr]">
        <SolidSpinner
          spec={{ width: 4.4, height: 3, depth: 3 }}
          color={color}
          highlight={highlight}
          showHidden={xray}
          ariaLabel="Prostopadłościan do obracania, z zaznaczonymi ścianami, krawędziami i wierzchołkami"
        />

        <div>
          <div className="mb-4 flex flex-wrap gap-2">
            {PARTS.map((part) => (
              <PartChip
                key={part.id}
                label={part.chip}
                color={color}
                active={highlight === part.id}
                onClick={() => reveal(part.id)}
              />
            ))}
          </div>

          {revealed.length === 0 ? (
            <p className="text-sm text-muted-foreground">Zacznij od dowolnego słowa.</p>
          ) : (
            <div className="space-y-3">
              {PARTS.filter((part) => revealed.includes(part.id)).map((part) => (
                <motion.div
                  key={part.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border-l-4 pl-4"
                  style={{ borderColor: highlight === part.id ? color : `${color}40` }}
                >
                  <p className="font-mono text-lg font-black tabular-nums" style={{ color }}>
                    {part.count} {plural(part.count, part.forms)}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed sm:text-base">{part.text}</p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Treść odsłaniana klikiem zdublowana dla czytników ekranu i robotów —
          definicje nie mogą istnieć wyłącznie w stanie po kliknięciu. */}
      <ul className="sr-only">
        {PARTS.map((part) => (
          <li key={part.id}>
            {part.chip}: {part.text} Prostopadłościan ma {part.count}{' '}
            {plural(part.count, part.forms)}.
          </li>
        ))}
      </ul>

      <Beat at={0.35} className="mt-8">
        <div
          className="grid items-center gap-5 border-l-4 p-5 sm:p-6 md:grid-cols-[1fr_auto]"
          style={{ borderColor: color, backgroundColor: `${color}0c` }}
        >
          <div>
            <p
              className="mb-2 text-xs font-bold uppercase tracking-[0.15em]"
              style={{ color: textColor }}
            >
              Umowa rysunkowa
            </p>
            <p className="text-sm leading-relaxed sm:text-base">
              Bryła jest przestrzenna, a kartka płaska — więc rysując pudełko, zawsze masz część
              krawędzi zasłoniętą. Umówiono się tak: krawędzie, które <strong>widać</strong>, rysuje
              się <strong>linią ciągłą</strong>, a te <strong>zasłonięte</strong> —{' '}
              <strong>linią przerywaną</strong>. Dzięki temu z płaskiego rysunku wiadomo, że bryła
              ma sześć ścian, choć naraz widać najwyżej trzy.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Wyłącz prześwietlenie, a zostanie dokładnie to, co widać z zewnątrz. Włącz z powrotem
              — i znów masz całą bryłę, razem z tym, co schowane z drugiej strony.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setXray((prev) => !prev)}
            aria-pressed={xray}
            className="flex cursor-pointer items-center justify-center gap-2 border px-4 py-3 text-sm font-semibold transition-colors hover:opacity-70"
            style={{
              borderColor: color,
              color: textColor,
              backgroundColor: xray ? `${color}14` : undefined,
            }}
          >
            {xray ? (
              <EyeOff className="h-4 w-4 shrink-0" aria-hidden />
            ) : (
              <Eye className="h-4 w-4 shrink-0" aria-hidden />
            )}
            {xray ? 'Pokaż tylko to, co widać' : 'Prześwietl bryłę'}
          </button>
        </div>
      </Beat>
    </GuideAct>
  );
}
