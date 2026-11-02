'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, MessageCircleQuestion, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SlideStage } from './slide-view';

/**
 * Blok 4 — **dziecko przesiada się na widownię.**
 *
 * „Dopasuj treść do odbiorcy” to zdanie, którego nie da się wykonać, dopóki
 * odbiorca jest pojęciem. Więc tutaj odbiorca jest **osobą z kartą**, a na
 * karcie stoi wprost, co ta osoba wie i czego nie wie. Dzięki temu nie zgadujemy
 * (zasada z `z2.ts`: strona nie twierdzi niczego, czego nie sprawdziła) —
 * wszystko, na czym opiera się werdykt, dziecko ma przed oczami.
 *
 * Gest jest nowy w kursie: **stukanie w słowa i w wiersze wprost na slajdzie**,
 * a odpowiedź przychodzi **z ust postaci**, nie od strony. Zła próba nie jest
 * błędem, tylko zdaniem widza („to akurat wiem”) — konsekwencja zamiast oceny.
 *
 * Sedno wypada dopiero na końcu, kiedy trzy zaznaczenia leżą obok siebie: **ten
 * sam slajd jest zły dla Zosi, nudny dla Antka i nie do sprawdzenia dla pani od
 * przyrody.** Nie ma dobrego slajdu — jest slajd dobry dla kogoś.
 */

const TITLE = 'Jeż europejski';
const LINES = [
  'To gatunek owadożerny, aktywny nocą.',
  'Ma około 7000 kolców.',
  'Zimą zapada w hibernację.',
  'Nie wolno mu dawać mleka.',
  'W naszym ogrodzie widziałem go trzy razy.',
];

interface Seat {
  id: string;
  name: string;
  meta: string;
  card: string[];
  task: string;
  mode: 'word' | 'line';
  /** Klucz to `wiersz` albo `wiersz:wyraz`; wartość to zdanie, które mówi widz. */
  targets: Record<string, string>;
  miss: string;
  payoff: string;
}

const SEATS: Seat[] = [
  {
    id: 'zosia',
    name: 'Zosia, 7 lat',
    meta: 'klasa 1 — siedzi w pierwszym rzędzie',
    card: [
      'Zna: pies, kot, ogród, zima, kolce, mleko.',
      'Nie zna słów, których nie słyszy w domu ani w bajkach.',
      'Czyta powoli, po literach.',
    ],
    task: 'Stuknij w wyrazy, których Zosia nie zrozumie.',
    mode: 'word',
    targets: {
      '0:1': 'A co to jest „gatunek”?',
      '0:2': '„Owadożerny”? To on je owady czy owady jego?',
      '2:3': '„Hibernacja” — to jakaś choroba?',
    },
    miss: 'To akurat wiem!',
    payoff:
      'Dla Zosi ten slajd jest prawie pusty — trzy wyrazy zabierają jej trzy czwarte zdania. Wystarczy powiedzieć „zjada owady” zamiast „owadożerny” i „zimą śpi” zamiast „hibernacja”.',
  },
  {
    id: 'antek',
    name: 'Antek, kolega z klasy',
    meta: 'hoduje jeża od roku',
    card: [
      'Wie, co jeż je i że poluje nocą.',
      'Wie, ile mniej więcej ma kolców.',
      'Wie, że zimą zapada w sen zimowy.',
      'NIE wie, że jeżowi szkodzi mleko.',
    ],
    task: 'Stuknij w wiersze, które Antek już zna.',
    mode: 'line',
    targets: {
      '0': 'To wiem — mój je ślimaki co wieczór.',
      '1': 'Liczyłem kiedyś, wiem.',
      '2': 'Mój zasypia w listopadzie.',
    },
    miss: 'O tym akurat nie wiedziałem.',
    payoff:
      'Dla Antka trzy piąte slajdu to rzeczy, które już wie — czyli czas, który mu zabierasz. Jedyne, co jest dla niego nowe, stoi na tym slajdzie najmniejszymi literami.',
  },
  {
    id: 'pani',
    name: 'Pani od przyrody',
    meta: 'słucha z ostatniej ławki',
    card: [
      'Zna wszystkie te słowa.',
      'Przy każdej liczbie zadaje jedno pytanie: skąd ją masz?',
      'To, co widziałeś na własne oczy, jest dla niej źródłem.',
    ],
    task: 'Stuknij w wiersz, o który pani zapyta „skąd to wiesz?”.',
    mode: 'line',
    targets: { '1': 'Skąd ta liczba? Z książki, ze strony, od kogoś?' },
    miss: 'To akurat widziałeś sam — wystarczy mi.',
    payoff:
      'Liczba bez źródła jest w prezentacji tym samym, czym w notatce z przyrody: trzeba wiedzieć, skąd się wzięła. Ostatni wiersz jest bezpieczny, bo jego źródłem jesteś ty — widziałeś jeża na własne oczy.',
  },
];

interface Bubble {
  key: string;
  text: string;
  ok: boolean;
}

export function AudienceSeat({ color, onComplete }: { color: string; onComplete?: () => void }) {
  const [seat, setSeat] = useState(0);
  const [found, setFound] = useState<Record<string, string[]>>({});
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const current = SEATS[seat];
  const mine = found[current.id] ?? [];
  const complete = Object.keys(current.targets).every((key) => mine.includes(key));
  const all = SEATS.every((item) => Object.keys(item.targets).every((key) => (found[item.id] ?? []).includes(key)));

  useEffect(() => {
    if (all) onComplete?.();
  }, [all, onComplete]);

  const tap = (key: string) => {
    if (mine.includes(key)) return;
    const hit = current.targets[key];
    setBubbles((list) => [...list.slice(-2), { key: `${key}-${Date.now()}`, text: hit ?? current.miss, ok: Boolean(hit) }]);
    if (hit) setFound((state) => ({ ...state, [current.id]: [...mine, key] }));
  };

  const goTo = (index: number) => {
    setSeat(index);
    setBubbles([]);
  };

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <p className="text-sm leading-relaxed sm:text-base">
        Ten slajd jest gotowy i nikt go już nie poprawia. Zmienia się tylko jedno: <strong>kto na niego patrzy</strong>.
        Usiądź po kolei na trzech miejscach na widowni i zaznacz na slajdzie to, co widzi <em>ta</em> osoba.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {SEATS.map((item, index) => {
          const done = Object.keys(item.targets).every((key) => (found[item.id] ?? []).includes(key));
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => goTo(index)}
              className={cn(
                'flex cursor-pointer items-center gap-2 border px-3 py-1.5 text-sm transition-colors',
                index === seat ? 'font-semibold' : 'text-muted-foreground hover:text-foreground'
              )}
              style={index === seat ? { borderColor: color, color } : undefined}
            >
              {done && <Check className="h-3.5 w-3.5 shrink-0" aria-hidden />}
              {item.name}
            </button>
          );
        })}
      </div>

      <div className="mt-4 space-y-4 lg:grid lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start lg:gap-5 lg:space-y-0">
        <div className="contents lg:block">
          <div className="sticky top-9 z-10 -mx-5 bg-white px-5 pb-3 pt-1 dark:bg-zinc-900 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
            <SlideStage maxWidth={560}>
              <MarkableSlide seat={current} marked={mine} onTap={tap} color={color} />
            </SlideStage>
          </div>

          <div className="lg:mt-3">
            <p className="text-sm font-medium">{current.task}</p>
            <p className="mt-0.5 text-xs tabular-nums text-muted-foreground">
              znalezione: {mine.length} z {Object.keys(current.targets).length}
            </p>

            <div className="mt-2 min-h-[4.5rem] space-y-1.5">
              {bubbles.map((bubble) => (
                <p
                  key={bubble.key}
                  className={cn(
                    'border-l-2 p-2 text-sm leading-snug',
                    bubble.ok ? 'bg-muted/50' : 'bg-muted/20 text-muted-foreground'
                  )}
                  style={{ borderColor: bubble.ok ? color : undefined }}
                >
                  <span className="font-medium">{current.name.split(',')[0]}:</span> „{bubble.text}”
                </p>
              ))}
              {bubbles.length === 0 && (
                <p className="p-2 text-sm text-muted-foreground">
                  {current.name.split(',')[0]} siedzi i patrzy na slajd. Stuknij w to, co ta osoba właśnie zobaczyła.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="border p-3 lg:sticky lg:top-9">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide" style={{ color }}>
            <Users className="h-3.5 w-3.5" aria-hidden />
            Kto siedzi na tym miejscu
          </p>
          <p className="mt-2 text-sm font-semibold">{current.name}</p>
          <p className="text-xs text-muted-foreground">{current.meta}</p>
          <ul className="mt-2 space-y-1 text-sm leading-snug">
            {current.card.map((line) => (
              <li key={line} className="flex gap-2">
                <span aria-hidden style={{ color }}>
                  ·
                </span>
                <span className="min-w-0">{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {complete && (
        <div className="mt-4 p-4 text-sm leading-relaxed" style={{ backgroundColor: `${color}12` }}>
          <p>{current.payoff}</p>
          {!all && seat < SEATS.length - 1 && (
            <button
              type="button"
              onClick={() => goTo(seat + 1)}
              className="mt-3 cursor-pointer border px-3 py-1.5 text-sm font-semibold transition-colors hover:bg-muted"
              style={{ borderColor: color, color }}
            >
              Przesiądź się: {SEATS[seat + 1].name}
            </button>
          )}
        </div>
      )}

      {all && <Summary color={color} found={found} />}
    </div>
  );
}

/** Slajd, w którego treść da się stuknąć — wyraz po wyrazie albo wiersz po wierszu. */
function MarkableSlide({
  seat,
  marked,
  onTap,
  color,
}: {
  seat: Seat;
  marked: string[];
  onTap: (key: string) => void;
  color: string;
}) {
  const split = useMemo(() => LINES.map((line) => line.split(' ')), []);

  return (
    <div className="absolute inset-0 px-[50px] py-[44px]">
      <h3 className="font-semibold leading-tight" style={{ fontSize: 40, color, marginBottom: 26 }}>
        {TITLE}
      </h3>
      <ul className="space-y-[10px]">
        {split.map((line, index) => {
          const lineKey = String(index);
          const lineMarked = marked.includes(lineKey);
          return (
            <li key={lineKey} className="flex gap-[14px]" style={{ fontSize: 26, lineHeight: 1.35 }}>
              <span style={{ color }} aria-hidden>
                •
              </span>
              {seat.mode === 'line' ? (
                <button
                  type="button"
                  onClick={() => onTap(lineKey)}
                  className="min-w-0 cursor-pointer text-left"
                  style={{
                    backgroundColor: lineMarked ? `${color}33` : undefined,
                    boxShadow: lineMarked ? `inset 0 -3px 0 ${color}` : undefined,
                  }}
                >
                  {line.join(' ')}
                </button>
              ) : (
                <span className="min-w-0">
                  {line.map((word, position) => {
                    const key = `${index}:${position}`;
                    const hit = marked.includes(key);
                    return (
                      <span key={key}>
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={() => onTap(key)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault();
                              onTap(key);
                            }
                          }}
                          className="cursor-pointer"
                          style={{
                            backgroundColor: hit ? `${color}33` : undefined,
                            boxShadow: hit ? `inset 0 -3px 0 ${color}` : undefined,
                          }}
                        >
                          {word}
                        </span>
                        {/* Odstęp stoi POZA elementem klikalnym, żeby wiersz łamał się jak tekst. */}
                        {position < line.length - 1 && ' '}
                      </span>
                    );
                  })}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Summary({ color, found }: { color: string; found: Record<string, string[]> }) {
  return (
    <div className="mt-5 border-t pt-4">
      <p className="flex items-center gap-2 text-sm font-semibold" style={{ color }}>
        <MessageCircleQuestion className="h-4 w-4 shrink-0" aria-hidden />
        Jeden slajd, trzy różne zaznaczenia.
      </p>

      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {SEATS.map((seat) => (
          <div key={seat.id} className="border p-3">
            <p className="text-xs font-semibold" style={{ color }}>
              {seat.name}
            </p>
            <ul className="mt-2 space-y-1 text-xs leading-snug">
              {LINES.map((line, index) => {
                const marks = (found[seat.id] ?? []).filter((key) => key.split(':')[0] === String(index));
                return (
                  <li key={index} className={cn(marks.length === 0 && 'text-muted-foreground/60')}>
                    {marks.length > 0 ? (
                      <span style={{ backgroundColor: `${color}33` }}>{line}</span>
                    ) : (
                      line
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <p className="mt-3 text-sm leading-relaxed">
        Slajd się nie zmienił ani o literę. Zmieniło się to, <strong>kto na niego patrzy</strong> — i nagle jest za
        trudny, za nudny albo nie do sprawdzenia. Dlatego pierwsze pytanie przy prezentacji nie brzmi „o czym”, tylko{' '}
        <strong>„dla kogo”</strong>. Odpowiedź na nie zmienia każdy następny slajd.
      </p>
    </div>
  );
}
