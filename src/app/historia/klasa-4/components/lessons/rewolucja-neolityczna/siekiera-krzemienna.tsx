'use client';

import Image from 'next/image';
import { plural } from '@/lib/plural';
import { useRef, useState, type PointerEvent } from 'react';
import { AXE_HITS, HITS_PER_TREE, TREES, chop, felledCount, initialChop, isFelled } from './siekiera';

/**
 * Blok 4 (źródło): **siekiera krzemienna i Krzemionki**. Dziecko wycina las
 * pod pole — **ciacha palcem w poprzek pnia** (pociągnięcie w bok po drzewie
 * = uderzenie). Ostrze się tępi i pęka, licznik zużytych siekier rośnie. Potem
 * prawdziwe fotografie z Krzemionek Opatowskich i pytanie źródłowe: po co
 * osiadłym ludziom było tyle krzemienia — odpowiedź dziecko ma już w liczniku.
 *
 * Krzemionki: kopalnie krzemienia pasiastego ok. 3900–1600 p.n.e., ponad
 * 4000 szybów, siekiery z tego krzemienia znajdowano nawet ok. 660 km od
 * kopalni, wpis na listę UNESCO 2019 (Wikipedia „Krzemionki”, whc.unesco.org/en/list/1599).
 */

const SWING = 28;

export function SiekieraKrzemienna({
  color,
  flintImage,
  houseImage,
  onComplete,
}: {
  color: string;
  flintImage: string;
  houseImage: string;
  onComplete: () => void;
}) {
  const [s, setS] = useState(initialChop);
  const [broke, setBroke] = useState(false);
  const stroke = useRef<{ i: number; x: number; hit: boolean } | null>(null);
  const completed = useRef(false);

  const felled = felledCount(s);
  const cleared = felled === TREES;

  const hit = (i: number) => {
    const r = chop(s, i);
    setS(r.state);
    setBroke(r.broke);
    if (felledCount(r.state) === TREES && !completed.current) {
      completed.current = true;
      onComplete();
    }
  };

  const down = (i: number) => (e: PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    stroke.current = { i, x: e.clientX, hit: false };
  };
  const move = (e: PointerEvent<HTMLButtonElement>) => {
    const st = stroke.current;
    if (!st || st.hit) return;
    if (Math.abs(e.clientX - st.x) >= SWING) {
      st.hit = true;
      hit(st.i);
    }
  };
  const up = () => {
    stroke.current = null;
  };

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed">
        Wioska potrzebuje nowego pola, a dookoła rośnie las. Masz siekierę z krzemienia. <strong>Ciachnij palcem w poprzek
        pnia</strong> — każde pociągnięcie w bok to jedno uderzenie. Drzewo pada po {HITS_PER_TREE} uderzeniach.
      </p>

      <div className="flex flex-wrap items-center gap-4 text-sm">
        <span>
          Wycięte: <strong className="tabular-nums">{felled}</strong> / {TREES}
        </span>
        <span className="flex items-center gap-2">
          Ostrze:
          <span className="inline-block h-2.5 w-24 border bg-white dark:bg-zinc-950" aria-hidden>
            <span className="block h-full" style={{ width: `${(s.axeLeft / AXE_HITS) * 100}%`, background: s.axeLeft <= 2 ? '#dc2626' : '#78716c' }} />
          </span>
        </span>
        <span>
          Zużyte siekiery: <strong className="tabular-nums" style={{ color }}>{s.axesUsed}</strong>
        </span>
      </div>
      {broke && !cleared && <p className="text-sm text-destructive" aria-live="polite">Trzask! Ostrze pękło. Trzeba wziąć nową siekierę — i znowu krzemień.</p>}

      <div className="grid grid-cols-4 gap-1 border bg-[#e7efd8] p-2 sm:grid-cols-6 dark:bg-zinc-900">
        {s.trees.map((h, i) => {
          const down_ = isFelled(s, i);
          return (
            <button
              key={i}
              type="button"
              onPointerDown={down_ ? undefined : down(i)}
              onPointerMove={move}
              onPointerUp={up}
              onPointerCancel={up}
              onKeyDown={(e) => {
                if (!down_ && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  hit(i);
                }
              }}
              aria-label={down_ ? `Drzewo ${i + 1}: ścięte` : `Drzewo ${i + 1}: ${h} z ${HITS_PER_TREE} uderzeń`}
              className={`relative h-20 ${down_ ? 'cursor-default' : 'cursor-ew-resize touch-none'}`}
            >
              <svg viewBox="0 0 40 60" className="h-full w-full" aria-hidden>
                {down_ ? (
                  <>
                    <rect x="16" y="50" width="8" height="6" fill="#92400e" />
                    <rect x="4" y="54" width="32" height="4" fill="#a16207" transform="rotate(-8 20 56)" />
                  </>
                ) : (
                  <g transform={h ? `rotate(${h * 4} 20 56)` : undefined}>
                    <rect x="16" y="30" width="8" height="26" fill="#92400e" />
                    {Array.from({ length: h }, (_, k) => (
                      <path key={k} d={`M16 ${44 - k * 3} l5 2 l-5 2 Z`} fill="#fef3c7" />
                    ))}
                    <circle cx="20" cy="22" r="15" fill="#4d7c0f" />
                    <circle cx="12" cy="28" r="8" fill="#65a30d" />
                    <circle cx="28" cy="28" r="8" fill="#65a30d" />
                  </g>
                )}
              </svg>
            </button>
          );
        })}
      </div>

      {cleared && (
        <div className="space-y-4">
          <p className="border-l-2 pl-3 text-sm leading-relaxed" style={{ borderColor: color }}>
            Pole gotowe — zużyłeś/łaś <strong>
              {s.axesUsed} {plural(s.axesUsed, { one: 'siekierę', few: 'siekiery', many: 'siekier' })}
            </strong> na jedno pole. A wioska co kilka lat potrzebowała
            nowych pól, drewna na domy i opał, sierpów do żniw. Ludzie osiadli potrzebowali krzemienia więcej niż kiedykolwiek.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <figure className="space-y-1">
              <Image src={flintImage} alt="Fotografia: bryła krzemienia pasiastego z Krzemionek — gładki, ciemny kamień w jasne i ciemne pasy, wyrastający z białego wapienia" width={480} height={320} className="h-auto w-full border" />
              <figcaption className="text-[11px] leading-snug text-muted-foreground">
                Krzemień pasiasty w skale wapiennej, Krzemionki Opatowskie. Fot. Robert Niedźwiedzki, Wikimedia Commons, CC BY 4.0.
              </figcaption>
            </figure>
            <figure className="space-y-1">
              <Image src={houseImage} alt="Fotografia: zrekonstruowany neolityczny dom w rezerwacie Krzemionki — długi budynek z gliny i drewna z dachem ze słomy, przed nim ława z naczyniami i krosno" width={480} height={360} className="h-auto w-full border" />
              <figcaption className="text-[11px] leading-snug text-muted-foreground">
                Rekonstrukcja domu z epoki kamienia w rezerwacie Krzemionki (zbudowana dziś). Fot. MOs810, Wikimedia Commons, CC BY-SA 4.0.
              </figcaption>
            </figure>
          </div>

          <div className="space-y-2 text-sm leading-relaxed">
            <p>
              <strong>Krzemionki Opatowskie</strong> (dziś województwo świętokrzyskie) to jedne z największych kopalni z epoki kamienia
              w Europie. Ludzie kopali tu krzemień pasiasty przez ponad dwa tysiące lat — mniej więcej od 3900 do 1600 roku
              p.n.e. Wydrążyli ponad 4000 szybów i korytarzy, pracując przy świetle łuczywa. Od 2019 roku Krzemionki są na liście
              światowego dziedzictwa UNESCO.
            </p>
            <p>
              Siekiery z pasiastego krzemienia znajdowano nawet ok. 660 km od kopalni. Nikt nie niósłby kamienia tak daleko,
              gdyby nie był bardzo potrzebny — <strong>to ślad, że rolnicy potrzebowali siekier i chętnie się nimi wymieniali</strong>.
            </p>
            <p className="text-muted-foreground">
              Uwaga na daty: pierwsze wioski w Żyznym Półksiężycu powstały ok. 10 000 lat p.n.e. Na ziemie polskie rolnictwo
              dotarło dużo później — kopalnie w Krzemionkach są o ponad pięć tysięcy lat młodsze od pierwszych domów Jerycha.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
