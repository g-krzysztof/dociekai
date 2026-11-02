'use client';

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Beat, GuideAct } from '../guide-act';
import { SolidGlyph } from '../../solid-glyph';
import { SOLID_FAMILY, type SolidFamilyEntry } from './guide-content';
import { img } from '@/lib/media';

function FamilyCard({
  entry,
  color,
  revealed,
  onReveal,
}: {
  entry: SolidFamilyEntry;
  color: string;
  revealed: boolean;
  onReveal: () => void;
}) {
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  return (
    <button
      type="button"
      onClick={onReveal}
      disabled={revealed}
      className={cn(
        'flex cursor-pointer flex-col items-center gap-2 border p-4 text-center transition-all disabled:cursor-default',
        !revealed && 'hover:-translate-y-0.5 hover:shadow-md'
      )}
      style={{
        borderColor: revealed ? color : `${color}40`,
        backgroundColor: revealed ? `${color}0c` : undefined,
      }}
    >
      <SolidGlyph kind={entry.id} color={color} />
      <span className="text-base font-bold" style={{ color: revealed ? textColor : undefined }}>
        {entry.name}
      </span>
      {revealed ? (
        <motion.span
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="block space-y-2"
        >
          <span className="block text-sm leading-relaxed">{entry.definition}</span>
          <span className="block text-xs leading-relaxed text-muted-foreground">
            {entry.example}
          </span>
        </motion.span>
      ) : (
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Kliknij, żeby poznać
        </span>
      )}
    </button>
  );
}

export function ActRodzinaBryl({ color }: { color: string }) {
  const [revealed, setRevealed] = useState<string[]>([]);
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;
  const allRevealed = revealed.length === SOLID_FAMILY.length;

  return (
    <GuideAct id="rodzina-bryl" mode="flow">
      <h2 className="mb-2 text-2xl font-bold leading-snug sm:text-3xl">Rodzina brył</h2>
      <p className="mb-6 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        Prostopadłościan to tylko jeden z krewnych. Kliknij każdą bryłę — dostaniesz jej nazwę,
        jednozdaniowy opis i przykład, który znasz z domu. Zwróć uwagę na kreski przerywane: to ta
        sama umowa co przed chwilą.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SOLID_FAMILY.map((entry) => (
          <FamilyCard
            key={entry.id}
            entry={entry}
            color={color}
            revealed={revealed.includes(entry.id)}
            onReveal={() => setRevealed((prev) => (prev.includes(entry.id) ? prev : [...prev, entry.id]))}
          />
        ))}
      </div>

      {/* Ten sam opis zawsze w DOM — karty odsłaniają go klikiem, ale treść nie
          może zależeć od kliknięcia. */}
      <ul className="sr-only">
        {SOLID_FAMILY.map((entry) => (
          <li key={entry.id}>
            {entry.name}: {entry.definition} {entry.example}
          </li>
        ))}
      </ul>

      <Beat at={0.4} className="mt-8">
        <div className="grid items-center gap-6 border p-5 sm:p-6 md:grid-cols-[1fr_200px]">
          <div>
            <p
              className="mb-3 text-xs font-bold uppercase tracking-[0.15em]"
              style={{ color: textColor }}
            >
              Jedna granica dzieli tę szóstkę na pół
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="border-l-4 pl-4" style={{ borderColor: color }}>
                <p className="font-bold">Same płaskie ściany</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Graniastosłupy (w tym prostopadłościan) i ostrosłupy. Mają ściany, krawędzie
                  i wierzchołki — dokładnie te, które nazwaliśmy wcześniej.
                </p>
              </div>
              <div className="border-l-4 pl-4" style={{ borderColor: `${color}59` }}>
                <p className="font-bold">Powierzchnia zaokrąglona</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Walec, stożek i kula. Da się po nich przejechać palcem bez natrafienia na
                  krawędź — dlatego właśnie się toczą.
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed sm:text-base">
              Najdalej po tej stronie stoi <strong style={{ color: textColor }}>kula</strong>: ani
              jednej ściany, ani jednej krawędzi, ani jednego wierzchołka. Cała reszta ma
              przynajmniej jedno z tych trzech.
            </p>
          </div>

          <div className="relative mx-auto aspect-[4/3] w-full max-w-[200px]">
            <Image
              src={img('/images/matematyka/przewodniki/jezyk-bryl/puszka-pilka-czapka.jpg')}
              alt="Puszka, piłka, papierowa czapeczka w kształcie rożka i kartonowe pudełko ustawione obok siebie na stole"
              width={200}
              height={150}
              className="absolute inset-0 h-full w-full object-contain"
            />
          </div>
        </div>
      </Beat>

      {allRevealed && (
        <p className="mt-4 text-sm font-semibold" style={{ color: textColor }}>
          Sześć nazw z głowy — to cały słownik, którego potrzebujesz na starcie tego działu.
        </p>
      )}
    </GuideAct>
  );
}
