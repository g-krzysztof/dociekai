'use client';

import { useEffect, useRef, useState } from 'react';
import { plural } from '@/lib/plural';
import { phoenicianFont } from './fonts';
import { SKELETONS, VOWEL_TILES, WORDS_NEEDED, toConsonants, toGreek, toPhoenician } from './pismo';

/**
 * Blok 3 (ćwiczenie): **samymi spółgłoskami.** Dziecko wpisuje swoje imię
 * i widzi je tak, jak zapisałby je Fenicjanin: bez samogłosek, fenickimi
 * literami (font Noto Sans Phoenician), od prawej do lewej. Potem wkłada
 * samogłoski w szkielety „K_T” i „L_S” — każdy daje kilka prawdziwych słów,
 * więc widać, dlaczego zapis bez samogłosek bywa niejasny. Na końcu „jak
 * Grecy” — to samo imię z samogłoskami, greckimi literami. Wolny tekst jest
 * bezpieczny: nic tu nie jest oceniane, tylko przekształcane; ocenia się
 * tylko, czy z samogłoski wyszło prawdziwe słowo (lista słów przy szkielecie).
 */

const EXAMPLE = 'Zuzanna';

export function SpolgloskiWidget({ color, onComplete }: { color: string; onComplete: () => void }) {
  const [name, setName] = useState('');
  const [sk, setSk] = useState(0);
  const [found, setFound] = useState<string[][]>(SKELETONS.map(() => []));
  const [tried, setTried] = useState<string | null>(null);
  const [greek, setGreek] = useState(false);
  const reported = useRef(false);

  const shown = name.trim() || EXAMPLE;
  const skeleton = SKELETONS[Math.min(sk, SKELETONS.length - 1)];
  const skDone = sk >= SKELETONS.length;
  const enough = found[sk]?.length >= WORDS_NEEDED;

  useEffect(() => {
    if (greek && !reported.current) {
      reported.current = true;
      onComplete();
    }
  }, [greek, onComplete]);

  const tryVowel = (v: string) => {
    const word = `${skeleton.before}${v}${skeleton.after}`.toLowerCase();
    setTried(word);
    if (skeleton.words[word] && !found[sk].includes(word)) {
      setFound((f) => f.map((list, i) => (i === sk ? [...list, word] : list)));
    }
  };

  return (
    <div className="space-y-5">
      {/* A — imię po fenicku */}
      <div className="space-y-3">
        <label className="block text-sm leading-relaxed" htmlFor="imie-fenickie">
          Fenicjanie, kupcy znad Morza Śródziemnego, mieli tylko <strong>22 litery — same spółgłoski</strong>.
          Wpisz swoje imię (albo jakiekolwiek słowo) i zobacz, jak by je zapisali.
        </label>
        <input
          id="imie-fenickie"
          value={name}
          onChange={(e) => setName(e.target.value.slice(0, 16))}
          placeholder={`np. ${EXAMPLE}`}
          className="w-full max-w-xs border bg-background px-3 py-2 text-base"
          autoComplete="off"
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="border p-3">
            <p className="text-xs text-muted-foreground">bez samogłosek</p>
            <p className="font-mono text-2xl font-bold tracking-widest" aria-live="polite">
              {toConsonants(shown) || '—'}
            </p>
          </div>
          <div className="border p-3">
            <p className="text-xs text-muted-foreground">literami fenickimi · czytaj od prawej ←</p>
            <p dir="rtl" className={`${phoenicianFont.className} text-3xl leading-snug`} style={{ color }} lang="phn">
              {toPhoenician(shown) || '—'}
            </p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Zamiana jest przybliżona: fenicki nie miał wszystkich naszych głosek, więc np. „sz”, „cz” i „rz” mają tu
          najbliższe fenickie odpowiedniki.
        </p>
      </div>

      {/* B — szkielety */}
      {!skDone && (
        <div className="space-y-3 border-t pt-4">
          <p className="text-sm leading-relaxed">
            Fenicki kupiec dostaje list, a w nim słowo zapisane tak:{' '}
            <span dir="rtl" className={`${phoenicianFont.className} text-xl`} style={{ color }}>
              {toPhoenician(skeleton.before + skeleton.after)}
            </span>{' '}
            — czyli <strong>{skeleton.before}{skeleton.after}</strong>. Jakie to może być słowo?{' '}
            <strong>Wstaw samogłoskę w lukę</strong> — znajdź co najmniej {WORDS_NEEDED} prawdziwe słowa.
          </p>
          <div className="flex items-center gap-1 font-mono text-4xl font-bold">
            <span>{skeleton.before}</span>
            <span className="inline-flex h-12 w-10 items-center justify-center border-2 border-dashed" style={{ borderColor: color, color }}>
              {tried ? tried[1].toUpperCase() : ''}
            </span>
            <span>{skeleton.after}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {VOWEL_TILES.map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => tryVowel(v)}
                className="h-11 w-11 border-2 font-mono text-xl font-bold uppercase"
                aria-label={`Wstaw ${v}`}
              >
                {v}
              </button>
            ))}
          </div>
          {tried && (
            <p className="text-sm" role="status">
              {skeleton.words[tried] ? (
                <>
                  <strong>{tried}</strong> — {skeleton.words[tried]}. Jest takie słowo!
                </>
              ) : (
                <>„{tried}” — nie ma takiego słowa. Spróbuj innej samogłoski.</>
              )}
            </p>
          )}
          {found[sk].length > 0 && (
            <p className="text-sm text-muted-foreground">
              Znalezione: {found[sk].map((w) => <strong key={w} className="mr-2 text-foreground">{w}</strong>)}
            </p>
          )}
          {enough && (
            <div className="space-y-2 border-l-2 pl-3 text-sm leading-relaxed" style={{ borderColor: color }}>
              <p>
                {found[sk].length} {plural(found[sk].length, { one: 'słowo', few: 'słowa', many: 'słów' })} z jednego
                zapisu! Fenicjanin musiał zgadywać z reszty zdania. Dla kogoś, kto mówi tym samym językiem, to
                zwykle wystarczało — dla obcego już nie.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSk((s) => s + 1);
                  setTried(null);
                }}
                className="border px-3 py-1.5 text-sm font-semibold"
                style={{ borderColor: color, color }}
              >
                {sk + 1 < SKELETONS.length ? 'Następne słowo z listu' : 'Dalej'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* C — jak Grecy */}
      {skDone && (
        <div className="space-y-3 border-t pt-4">
          <p className="text-sm leading-relaxed">
            Grecy handlowali z Fenicjanami i przejęli od nich litery. Ale greckie słowa bez samogłosek były
            jeszcze trudniejsze do odgadnięcia — więc Grecy zrobili z kilku fenickich liter, których nie
            potrzebowali, <strong>samogłoski</strong>.
          </p>
          {!greek ? (
            <button
              type="button"
              onClick={() => setGreek(true)}
              className="border px-4 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: color, borderColor: color }}
            >
              Zapisz „{shown}” jak Grecy
            </button>
          ) : (
            <div className="space-y-2">
              <div className="border p-3">
                <p className="text-xs text-muted-foreground">literami greckimi · od lewej →, z samogłoskami</p>
                <p className="text-3xl tracking-wide" style={{ color }} lang="el">
                  {toGreek(shown)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  To małe litery greckie, takie jak dziś w Grecji. Wielkie wyglądają znajomo: Α, Β, Τ, Μ — bo
                  nasze litery od nich pochodzą.
                </p>
              </div>
              <p className="border-l-2 pl-3 text-sm leading-relaxed" style={{ borderColor: color }}>
                Teraz każde słowo da się przeczytać tylko na jeden sposób: KOT to kot, a nie kat. I wystarczą
                24 litery — nie tysiące obrazków. Takiego pisma może się nauczyć każde dziecko, a nie tylko
                pisarz, który uczył się latami. Nawet słowo <strong>alfabet</strong> jest greckie: od dwóch
                pierwszych liter, <strong>alfa</strong> i <strong>beta</strong>.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
