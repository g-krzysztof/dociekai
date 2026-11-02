'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, Check, Lightbulb, Quote, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { analyse, RUN_MIN, tokenize, words } from './copy-check';

/**
 * Ćwiczenie lekcji: **przepisz to własnymi słowami** — i pierwszy w kursie
 * widżet, który czyta tekst dziecka i pokazuje mu na żywo, **które fragmenty
 * przepisał dosłownie**. Nie „wybierz zdanie, które jest plagiatem”, tylko
 * własny tekst z podkreślonymi zapożyczeniami, aktualizowany przy każdej
 * literze.
 *
 * Reguła jest jawna i wypisana obok (ta sama dyscyplina co `verdict()` w
 * `PasswordLab` i `buildChecks` w `ComposeMail`): ciąg co najmniej pięciu słów
 * pod rząd taki sam jak w źródle to przepisanie. Cztery słowa przechodzą —
 * dlatego, że po polsku nie da się inaczej powiedzieć „pszczoła zbiera nektar
 * z kwiatów”, i dziecko nie ma się bać własnego języka, tylko kopiowania akapitu.
 *
 * Ostatni krok jest najważniejszy dla `[5.6]`: nawet po przepisaniu własnymi
 * słowami **fakt dalej jest cudzy**, więc pod notatką dopisuje się źródło. Bez
 * tego bloku lekcja uczyłaby, że wystarczy „przekręcić słowa”.
 */

const SOURCE = {
  title: 'Pszczoła miodna',
  where: 'Przyrodnicza encyklopedia dla dzieci, pszczoly-encyklopedia.pl',
  text: 'Pszczoła miodna zbiera z kwiatów nektar i przenosi go do ula. Przy okazji na jej ciele zostaje pyłek, który spada na kolejne kwiaty — i dzięki temu z kwiatów powstają owoce oraz nasiona. Jedna pszczoła podczas jednego lotu odwiedza nawet sto kwiatów, a po jedzenie potrafi oddalić się od ula na trzy kilometry.',
};

const MIN_WORDS = 25;

/** Grupy faktów, które mają zostać po przepisaniu — sprawdzane po rdzeniu słowa. */
const FACTS: { label: string; test: (word: string) => boolean }[] = [
  { label: 'nektar', test: (word) => word.startsWith('nektar') },
  { label: 'ul', test: (word) => /^ul(a|u|em|i|e|ach|ami|om)?$/.test(word) },
  {
    label: 'pyłek albo zapylanie',
    test: (word) => word.startsWith('pył') || word.startsWith('pyl') || word.startsWith('zapyl'),
  },
  {
    label: 'liczba z tekstu',
    test: (word) => word.startsWith('kilometr') || word === 'sto' || /^\d+$/.test(word),
  },
];

const TIPS = [
  'Przeczytaj źródło, potem zasłoń je ręką i napisz z głowy. Jak nie pamiętasz — to znaczy, że jeszcze nie rozumiesz, a nie że trzeba zerknąć.',
  'Zmieniaj kolejność, nie same słowa. „Zamiana wyrazów na synonimy” to dalej cudze zdanie, tylko gorzej brzmiące.',
  'Liczby, nazwy i daty zostaw takie, jakie są — ich nie da się powiedzieć inaczej i nikt tego nie wymaga.',
];

interface OwnWordsProps {
  color: string;
  onComplete?: () => void;
}

export function OwnWords({ color, onComplete }: OwnWordsProps) {
  const [text, setText] = useState('');
  const [tips, setTips] = useState(false);
  const [cited, setCited] = useState(false);

  const analysis = useMemo(() => analyse(text, SOURCE.text), [text]);
  const childWords = useMemo(() => words(text), [text]);
  const factsKept = FACTS.filter((fact) => childWords.some(fact.test));

  const checks = [
    {
      id: 'dlugosc',
      label: `Napisz co najmniej ${MIN_WORDS} słów`,
      value: `${analysis.total} ${analysis.total === 1 ? 'słowo' : 'słów'}`,
      ok: analysis.total >= MIN_WORDS,
    },
    {
      id: 'kopia',
      label: `Bez przepisanych ciągów (${RUN_MIN} słów pod rząd i więcej)`,
      value: `najdłuższy taki sam fragment: ${analysis.longest}`,
      ok: analysis.total > 0 && analysis.longest < RUN_MIN,
    },
    {
      id: 'fakty',
      label: 'Zostaw co najmniej dwa fakty ze źródła',
      value: factsKept.length > 0 ? factsKept.map((fact) => fact.label).join(', ') : 'na razie żadnego',
      ok: factsKept.length >= 2,
    },
  ];

  const ready = checks.every((check) => check.ok);
  const tokens = tokenize(text);

  const addSource = () => {
    setCited(true);
    onComplete?.();
  };

  let wordIndex = -1;

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <p className="mb-4 text-sm leading-relaxed sm:text-base">
        Ten akapit znalazłeś/znalazłaś w internecie i chcesz go użyć w swojej notatce. Nie wolno go
        wkleić — trzeba <strong>napisać to samo swoimi słowami</strong>. Pisz w polu niżej, a pod
        spodem na bieżąco zobaczysz, co przepisałeś/przepisałaś dosłownie.
      </p>

      {/* Źródło */}
      <div className="mb-4 border-l-4 p-3 sm:p-4" style={{ borderColor: color, backgroundColor: `${color}0a` }}>
        <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide" style={{ color: `color-mix(in oklch, ${color} 88%, black)` }}>
          <BookOpen className="h-3.5 w-3.5" aria-hidden />
          Źródło: {SOURCE.title}
        </p>
        <p className="text-sm leading-relaxed">{SOURCE.text}</p>
        <p className="mt-2 text-xs text-muted-foreground">{SOURCE.where}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_280px]">
        <div>
          <label htmlFor="wlasne" className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Twoja wersja — z głowy, nie z kopiowania
          </label>
          <textarea
            id="wlasne"
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={6}
            placeholder="Pszczoły latają po to, żeby…"
            className="w-full resize-y border p-3 text-sm leading-relaxed outline-none focus:border-primary"
          />

          {/* Twój tekst z zaznaczonymi zapożyczeniami */}
          <div className="mt-3 border p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Twój tekst pod lupą
            </p>
            {analysis.total === 0 ? (
              <p className="text-sm italic text-muted-foreground">
                Jeszcze nic nie napisałeś/napisałaś.
              </p>
            ) : (
              <>
                <p className="text-sm leading-relaxed">
                  {tokens.map((token, i) => {
                    if (!token.isWord) return <span key={i}>{token.value}</span>;
                    wordIndex += 1;
                    const copied = analysis.flags[wordIndex];
                    return (
                      <span
                        key={i}
                        className={cn(
                          copied &&
                            'bg-red-100 text-red-800 underline decoration-red-500 decoration-wavy underline-offset-2 dark:bg-red-950/50 dark:text-red-300'
                        )}
                      >
                        {token.value}
                      </span>
                    );
                  })}
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden bg-muted">
                    <motion.div
                      className="h-full bg-red-500"
                      animate={{
                        width: `${analysis.total ? Math.round((analysis.copied / analysis.total) * 100) : 0}%`,
                      }}
                      initial={false}
                    />
                  </div>
                  <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                    przepisane: {analysis.total ? Math.round((analysis.copied / analysis.total) * 100) : 0}%
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Jawne warunki — jak w pracowni hasła */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Co sprawdzam
          </p>
          <ul className="space-y-2">
            {checks.map((check) => (
              <li key={check.id} className="flex items-start gap-2 border p-2.5 text-sm">
                {check.ok ? (
                  <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
                ) : (
                  <X className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                )}
                <span className="min-w-0">
                  <span className={cn('block leading-snug', check.ok && 'font-medium')}>
                    {check.label}
                  </span>
                  <span className="block text-xs text-muted-foreground">{check.value}</span>
                </span>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => setTips((prev) => !prev)}
            className="mt-3 inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            <Lightbulb className="h-3.5 w-3.5" aria-hidden />
            {tips ? 'Schowaj podpowiedzi' : 'Nie wiem, jak zacząć'}
          </button>
          <AnimatePresence>
            {tips && (
              <motion.ul
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 space-y-2 overflow-hidden text-xs leading-relaxed text-muted-foreground"
              >
                {TIPS.map((tip) => (
                  <li key={tip} className="border-l-2 pl-2.5" style={{ borderColor: `${color}66` }}>
                    {tip}
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Ostatni krok: źródło i tak trzeba podać */}
      <div className="mt-5 border-t pt-5">
        {!ready && !cited && (
          <p className="text-sm text-muted-foreground">
            Kiedy trzy warunki będą spełnione, zostanie jeszcze jedna rzecz — i to ta, o której
            wszyscy zapominają.
          </p>
        )}

        {ready && !cited && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-sm leading-relaxed">
              Tekst jest twój. <strong>Ale fakty dalej są cudze</strong> — ktoś je zebrał, sprawdził
              i opisał. Dlatego pod notatką dopisuje się, skąd je masz. To jedno zdanie robi z
              „ściągnąłem” — „korzystałem”.
            </p>
            <button
              type="button"
              onClick={addSource}
              className="mt-3 inline-flex cursor-pointer items-center gap-2 border-2 px-4 py-2.5 text-sm font-semibold text-white transition-colors"
              style={{ backgroundColor: color, borderColor: color }}
            >
              <Quote className="h-4 w-4" aria-hidden />
              Dopisz źródło pod notatką
            </button>
          </motion.div>
        )}

        {cited && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: `color-mix(in oklch, ${color} 88%, black)` }}>
              Twoja gotowa notatka
            </p>
            <div className="border p-3 text-sm leading-relaxed sm:p-4">
              <p className="whitespace-pre-wrap">{text}</p>
              <p className="mt-3 border-t pt-2 text-xs text-muted-foreground">
                Źródło: {SOURCE.title}, {SOURCE.where}
              </p>
            </div>
            <p className="mt-3 text-sm leading-relaxed">
              Tak wygląda uczciwa notatka: <strong>twoje zdania, cudze fakty, podpisane źródło</strong>.
              Dokładnie to samo robi się z cytatem — tylko wtedy cudze zdanie bierze się w
              cudzysłów i też podaje, skąd jest.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
