'use client';

import Image from 'next/image';
import { CalendarDays, CalendarRange, ListTree, Tent } from 'lucide-react';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';
import { LessonImageCard } from '../../lesson-image-card';
import { DniTygodnieWarmup } from './dni-tygodnie-warmup';
import { CalendarTrailIntro } from './calendar-trail-intro';
import { KalendarzoweExamples } from './kalendarzowe-examples';
import { KalendarzoweDrill } from './kalendarzowe-drill';
import { ObozChallenge } from './oboz-challenge';
import { CALENDAR_RULES } from '../../../lib/calendar';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

const STEPS: LessonStepMeta[] = [
  {
    id: 'rozgrzewka',
    kind: 'Rozgrzewka',
    title: 'Dni, tygodnie czy miesiące?',
    time: '4 min',
    icon: 'Sparkles',
  },
  {
    id: 'nowe-pojecie',
    kind: 'Nowe pojęcie',
    title: 'Doliczaj odcinki po prawdziwym kalendarzu',
    time: '10 min',
    icon: 'Lightbulb',
  },
  {
    id: 'przyklady',
    kind: 'Przykłady',
    title: '4 przykłady: zamiana i upływ dni',
    time: '8 min',
    icon: 'ListChecks',
  },
  {
    id: 'trening',
    kind: 'Ćwiczenia',
    title: 'Poćwicz zamianę i upływ dni',
    time: '10 min',
    icon: 'Target',
  },
  {
    id: 'oboz',
    kind: 'Zadanie problemowe',
    title: 'Policz, ile trwa obóz Zosi',
    time: '6 min',
    icon: 'Puzzle',
  },
  {
    id: 'quiz',
    kind: 'Quiz',
    title: 'Sprawdź, co zapamiętałeś',
    time: '4 min',
    icon: 'CheckCircle2',
  },
];

const QUIZ: QuizQuestion[] = [
  {
    id: 'tydzien',
    question: 'Ile dni ma tydzień?',
    options: [
      { id: 'a', text: '6' },
      { id: 'b', text: '8' },
      { id: 'c', text: '14' },
      { id: 'd', text: '7' },
    ],
    correctId: 'd',
    explanation: 'Tydzień zawsze ma 7 dni.',
  },
  {
    id: 'rok-tygodnie',
    question: 'Rok zwykły ma 365 dni. Ile to pełnych tygodni i ile dni zostaje?',
    options: [
      { id: 'a', text: '51 tygodni i 1 dzień' },
      { id: 'b', text: '52 tygodnie i 1 dzień' },
      { id: 'c', text: '52 tygodnie i 2 dni' },
      { id: 'd', text: '53 tygodnie i 0 dni' },
    ],
    correctId: 'b',
    explanation: '52 × 7 = 364, a 365 − 364 = 1 — czyli 52 pełne tygodnie i jeszcze 1 dzień.',
  },
  {
    id: 'stulecia',
    question: 'Rok 1900 nie był rokiem przestępnym, mimo że dzieli się przez 4. Dlaczego?',
    options: [
      { id: 'a', text: 'Bo w 1900 roku luty miał 30 dni' },
      { id: 'b', text: 'Bo 1900 to liczba nieparzysta' },
      { id: 'c', text: 'Bo 1900 dzieli się przez 100, ale nie przez 400' },
      { id: 'd', text: 'Lata przestępne zdarzają się tylko raz na 40 lat' },
    ],
    correctId: 'c',
    explanation:
      'Pełne stulecia są przestępne tylko wtedy, gdy dzielą się przez 400. 1900 : 400 nie wychodzi równo, więc to wyjątkowo rok zwykły.',
  },
  {
    id: 'listopad-grudzien',
    question: 'Od 25 listopada do 3 grudnia — ile dni?',
    options: [
      { id: 'a', text: '6 dni' },
      { id: 'b', text: '7 dni' },
      { id: 'c', text: '9 dni' },
      { id: 'd', text: '8 dni' },
    ],
    correctId: 'd',
    explanation: 'Od 25 do 30 listopada to 5 dni, plus jeszcze 3 dni grudnia — razem 8 dni.',
  },
  {
    id: 'osiemnascie-dni',
    question: '18 dni to ile tygodni i ile dni?',
    options: [
      { id: 'a', text: '2 tygodnie i 4 dni' },
      { id: 'b', text: '1 tydzień i 4 dni' },
      { id: 'c', text: '2 tygodnie i 3 dni' },
      { id: 'd', text: '3 tygodnie i 0 dni' },
    ],
    correctId: 'a',
    explanation: '18 : 7 = 2 reszta 4, czyli 2 tygodnie i 4 dni.',
  },
  {
    id: 'miesiace-prawda',
    question: 'Które zdanie o miesiącach jest prawdziwe?',
    options: [
      { id: 'a', text: 'Każdy miesiąc ma 30 dni' },
      { id: 'b', text: 'Luty zawsze ma 28 dni' },
      { id: 'c', text: 'Siedem miesięcy ma 31 dni, cztery mają 30, a luty 28 lub 29' },
      { id: 'd', text: 'Rok ma 10 miesięcy' },
    ],
    correctId: 'c',
    explanation: 'Miesiące mają dwie różne długości, a luty jako jedyny — dwie własne, zależnie od tego, czy rok jest przestępny.',
  },
];

const IMAGES = imgMap({
  intro: '/images/matematyka/lekcje/obliczenia-kalendarzowe/notatnik-i-doniczka-przy-oknie.jpg',
  rozgrzewka: '/images/matematyka/lekcje/obliczenia-kalendarzowe/plecak-i-zwinieta-mapa-na-stole.jpg',
  nowePojecie: '/images/matematyka/lekcje/obliczenia-kalendarzowe/stos-kolorowych-kartek-kalendarza-na-biurku.jpg',
  przyklady: '/images/matematyka/lekcje/obliczenia-kalendarzowe/klepsydra-zblizenie.jpg',
  oboz: '/images/matematyka/lekcje/obliczenia-kalendarzowe/namiot-nad-jeziorem-w-sloneczny-dzien.jpg',
});

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function ObliczeniaKalendarzoweLesson({ lesson, mathModule, nextLesson }: LessonProps) {
  return (
    <LessonShell lesson={lesson} mathModule={mathModule} steps={STEPS} nextLesson={nextLesson}>
      <LessonBody color={mathModule.color} />
    </LessonShell>
  );
}

/** Treść lekcji wydzielona z komponentu strony, bo `useStepDone` wymaga kontekstu z `LessonShell`. */
function LessonBody({ color }: { color: string }) {
  const warmUp = useStepDone('rozgrzewka');
  const concept = useStepDone('nowe-pojecie');
  const examples = useStepDone('przyklady');
  const drill = useStepDone('trening');
  const problem = useStepDone('oboz');
  const quiz = useStepDone('quiz');

  return (
    <>
      {/* Wstęp */}
      <div className="grid items-center gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_240px]">
        <div>
          <p className="mb-4 text-base leading-relaxed sm:text-lg">
            Znasz już kalendarz z przewodnika — teraz nauczysz się na nim{' '}
            <strong>liczyć</strong>: zamieniać dni na tygodnie i odwrotnie oraz sprawnie liczyć,
            ile dni upłynie między dwiema datami, nawet gdy po drodze jest cały miesiąc.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {[
              { icon: CalendarDays, text: 'Tydzień zawsze ma 7 dni — zamiana w obie strony' },
              { icon: ListTree, text: 'Dni na tygodnie: dzielenie z resztą, które znasz z Modułu 1' },
              {
                icon: CalendarRange,
                text: 'Upływ dni przez kilka miesięcy — miesiąc nie ma jednej stałej długości',
              },
              { icon: Tent, text: 'Prawdziwe plany: ferie, wypożyczenia, obozy' },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-2 text-sm">
                <Icon className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
                <span className="leading-relaxed">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-[240px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Otwarty notatnik i doniczka z sukulentem obok stosu kolorowych karteczek na biurku"
            width={240}
            height={240}
            className="absolute inset-0 h-full w-full object-contain"
            priority
          />
        </div>
      </div>

      {/* 1. Rozgrzewka */}
      <LessonSection id="rozgrzewka">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.rozgrzewka}
          alt="Plecak turystyczny i zwinięta mapa przewiązana sznurkiem na drewnianym stole"
        >
          <p>Zanim zaczniesz liczyć, sprawdź wyczucie — czy dana rzecz trwa dni, tygodnie czy miesiące?</p>
        </LessonImageCard>
        <DniTygodnieWarmup color={color} onComplete={warmUp.markStepDone} />
      </LessonSection>

      {/* 2. Nowe pojęcie */}
      <LessonSection id="nowe-pojecie">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.nowePojecie}
          alt="Stos kolorowych kartek kalendarza leżący bokiem na drewnianym biurku"
          lead="Skoki po osi liczbowej i po tarczy zegara wracają — tylko że teraz droga wiedzie przez prawdziwe kartki kalendarza."
        >
          Obejrzyj, jak odcinek między dwiema datami dzieli się na dni do końca miesiąca, potem
          całe miesiące, a na końcu resztę dni — a potem sam/a ułóż taką samą sekwencję.
        </LessonImageCard>
        <CalendarTrailIntro color={color} onComplete={concept.markStepDone} />
      </LessonSection>

      {/* 3. Przykłady */}
      <LessonSection id="przyklady">
        <LessonImageCard
          variant="ghost"
          color={color}
          numeral="4"
          image={IMAGES.przyklady}
          kicker="4 przykłady: zamiana i upływ dni"
          alt="Klepsydra ze złotym piaskiem przesypującym się między komorami, zbliżenie"
        >
          Dwie zamiany jednostek i dwa obliczenia upływu dni — w tym jedna klasyczna pułapka z
          szacowaniem miesiąca „na oko”.
        </LessonImageCard>
        <KalendarzoweExamples color={color} onComplete={examples.markStepDone} />
      </LessonSection>

      {/* 4. Ćwiczenia */}
      <LessonSection id="trening">
        <KalendarzoweDrill color={color} onComplete={drill.markStepDone} />
      </LessonSection>

      {/* 5. Zadanie problemowe */}
      <LessonSection id="oboz">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.oboz}
          alt="Namiot rozbity nad jeziorem w słoneczny dzień"
          reverse
          lead="Jeden wyjazd, dwie daty — resztę policzysz sam/a."
        >
          Policz, ile dni trwa obóz sportowy Zosi, a potem zamień wynik na tygodnie i dni.
        </LessonImageCard>
        <ObozChallenge color={color} onComplete={problem.markStepDone} />
      </LessonSection>

      {/* 6. Quiz */}
      <LessonSection id="quiz">
        <LessonQuiz questions={QUIZ} color={color} onFinish={quiz.markStepDone} />
      </LessonSection>

      {/* Ściąga */}
      <section className="border-2 border-dashed p-5 sm:p-6" style={{ borderColor: `${color}59` }}>
        <h2 className="mb-1 text-xl font-bold">Ściąga: obliczenia kalendarzowe w sześciu zdaniach</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Ta sama zasada „doliczania” i ta sama reguła roku przestępnego działają w każdym zadaniu
          o kalendarzu.
        </p>
        <ol className="divide-y border">
          {CALENDAR_RULES.map((rule, index) => (
            <li key={rule} className="flex items-start gap-4 px-4 py-3">
              <span
                className="w-6 shrink-0 font-mono text-lg font-bold leading-none tabular-nums"
                style={{ color }}
              >
                {index + 1}
              </span>
              <span className="text-sm leading-relaxed">{rule}</span>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
