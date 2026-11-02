'use client';

import { useRef, useState } from 'react';
import { ArrowRight, Lightbulb, Hammer, Users2, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Cztery kroki prawdziwego cyklu (Pomysł → Budowa → Testy u kogoś innego →
 * Poprawki) plus „iskry pomysłów" — osiem tematów, z których każdy rozwija
 * się w gotową parę: jak mógłby wyglądać quiz na ten temat, a jak gra.
 * Wybrany temat leci prosto do karty projektu w następnym bloku, więc
 * dziecko nie zaczyna planu od pustej kartki.
 */

const CYCLE = [
  { label: 'Pomysł', icon: Lightbulb },
  { label: 'Budowa', icon: Hammer },
  { label: 'Testy u kogoś innego', icon: Users2 },
  { label: 'Poprawki', icon: Wrench },
];

interface Spark {
  id: string;
  label: string;
  quiz: string;
  game: string;
}

const SPARKS: Spark[] = [
  { id: 'zwierzeta', label: 'Zwierzęta', quiz: 'Quiz: rozpoznaj zwierzę po opisie jego zwyczajów.', game: 'Gra: nakarm właściwe zwierzę właściwym jedzeniem, zanim skończy się czas.' },
  { id: 'kosmos', label: 'Kosmos', quiz: 'Quiz: które planety mają pierścienie, a które księżyce?', game: 'Gra: statek uciekający przed asteroidami, im dalej, tym szybciej.' },
  { id: 'sport', label: 'Sport', quiz: 'Quiz: ile punktów jest wartych poszczególne rzuty w wybranej dyscyplinie?', game: 'Gra: strzał na czas — trafiaj w bramkę, zanim minie sekundnik.' },
  { id: 'ksiazka', label: 'Twoja ulubiona książka', quiz: 'Quiz: kto powiedział to zdanie — który bohater?', game: 'Gra: bohater zbiera przedmioty z fabuły, omijając przeszkody.' },
  { id: 'muzyka', label: 'Muzyka', quiz: 'Quiz: jaki instrument gra ten dźwięk?', game: 'Gra: klikaj w nutki spadające w rytmie, zanim znikną z ekranu.' },
  { id: 'planszowki', label: 'Gry planszowe', quiz: 'Quiz: w której grze planszowej używa się tej zasady?', game: 'Gra: pionek rzucany kostką idzie do mety, omijając pułapki.' },
  { id: 'szkola', label: 'Twoja szkoła', quiz: 'Quiz: który przedmiot pasuje do tej sali albo tego nauczyciela?', game: 'Gra: przebiegnij korytarzem na dzwonek, zanim spóźnisz się na lekcję.' },
  { id: 'podroze', label: 'Podróże', quiz: 'Quiz: rozpoznaj kraj po jego fladze albo zabytku.', game: 'Gra: samolot zbiera bagaże i omija chmury burzowe.' },
];

interface IdeaSparksProps {
  color: string;
  onPickTopic?: (label: string, idea: string) => void;
  onComplete?: () => void;
}

export function IdeaSparks({ color, onPickTopic, onComplete }: IdeaSparksProps) {
  const [kind, setKind] = useState<'quiz' | 'gra'>('quiz');
  const [pickedId, setPickedId] = useState<string | null>(null);
  const reported = useRef(false);

  const picked = SPARKS.find((spark) => spark.id === pickedId) ?? null;

  const pick = (spark: Spark, currentKind: 'quiz' | 'gra') => {
    setPickedId(spark.id);
    onPickTopic?.(spark.label, currentKind === 'quiz' ? spark.quiz : spark.game);
    if (!reported.current) {
      reported.current = true;
      onComplete?.();
    }
  };

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Cztery kroki prawdziwego projektu
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-x-1 gap-y-3">
        {CYCLE.map((step, index) => (
          <div key={step.label} className="flex items-center gap-1">
            <div className="flex flex-col items-center gap-1.5 px-2 text-center">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center"
                style={{ backgroundColor: `${color}14`, color }}
              >
                <step.icon className="h-4.5 w-4.5" aria-hidden />
              </span>
              <span className="max-w-[92px] text-xs font-medium leading-tight">{step.label}</span>
            </div>
            {index < CYCLE.length - 1 && (
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            )}
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        Najważniejszy jest trzeci krok. Sam/sama sprawdziłeś/aś to w poprzednim bloku: autor swojego
        programu nie przetestuje, bo za dobrze go zna. Testy u kogoś innego to nie formalność — to
        jedyny moment, w którym ktoś naprawdę zderza się z Twoim projektem na ślepo.
      </p>

      <div className="mt-6 border-t pt-5">
        <p className="text-sm font-semibold">Iskry pomysłów</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Wybierz, co ma robić Twój projekt, a potem dotknij tematu, który Cię ciekawi.
        </p>

        <div className="mt-3 inline-flex border" style={{ borderColor: `${color}55` }}>
          {(['quiz', 'gra'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setKind(option)}
              className="px-4 py-1.5 text-sm font-medium transition-colors"
              style={kind === option ? { backgroundColor: color, color: 'white' } : undefined}
            >
              {option === 'quiz' ? 'Quiz' : 'Gra'}
            </button>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {SPARKS.map((spark) => (
            <button
              key={spark.id}
              type="button"
              onClick={() => pick(spark, kind)}
              className={cn(
                'border px-3 py-1.5 text-sm font-medium transition-colors',
                pickedId === spark.id ? 'text-white' : 'hover:bg-muted/50'
              )}
              style={pickedId === spark.id ? { backgroundColor: color, borderColor: color } : undefined}
            >
              {spark.label}
            </button>
          ))}
        </div>

        {picked && (
          <div className="mt-4 p-3" style={{ backgroundColor: `${color}0f` }}>
            <p className="text-sm leading-relaxed">{kind === 'quiz' ? picked.quiz : picked.game}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              To tylko iskra — w następnym bloku zbudujesz z niej własny plan, po swojemu.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
