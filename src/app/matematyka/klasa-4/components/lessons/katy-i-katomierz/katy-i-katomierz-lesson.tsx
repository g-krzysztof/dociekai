'use client';

import Image from 'next/image';
import { Ruler, Scan, Circle, MoveDiagonal } from 'lucide-react';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';
import { LessonImageCard } from '../../lesson-image-card';
import { AnglesAroundUs } from './angles-around-us';
import { AngleBuilder } from './angle-builder';
import { ProtractorWalkthrough } from './protractor-walkthrough';
import { ProtractorScaleAudit } from './protractor-scale-audit';
import { DoorAngleCase } from './door-angle-case';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

const STEPS: LessonStepMeta[] = [
  {
    id: 'rozgrzewka',
    kind: 'Rozgrzewka',
    title: 'Kąty dookoła nas',
    time: '4 min',
    icon: 'Sparkles',
  },
  {
    id: 'wierzcholek-ramiona',
    kind: 'Nowe pojęcie',
    title: 'Ramiona, wierzchołek i pierwsze stopnie',
    time: '8 min',
    icon: 'Lightbulb',
  },
  {
    id: 'przyklady',
    kind: 'Przykłady',
    title: 'Trzy gotowe odczyty',
    time: '6 min',
    icon: 'ListChecks',
  },
  {
    id: 'trening',
    kind: 'Ćwiczenia',
    title: 'Która podziałka mówi prawdę?',
    time: '8 min',
    icon: 'Target',
  },
  {
    id: 'drzwi',
    kind: 'Zadanie problemowe',
    title: 'Pod jakim kątem są uchylone drzwi?',
    time: '7 min',
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
    id: 'wierzcholek-def',
    question: 'Co to jest wierzchołek kąta?',
    options: [
      { id: 'a', text: 'Punkt, w którym spotykają się oba ramiona kąta' },
      { id: 'b', text: 'Jedno z dwóch ramion kąta' },
      { id: 'c', text: 'Łuk narysowany między ramionami' },
      { id: 'd', text: 'Środek kątomierza' },
    ],
    correctId: 'a',
    explanation: 'Wierzchołek to wspólny punkt startowy obu ramion — od niego kąt „się otwiera”.',
  },
  {
    id: 'ramiona-def',
    question: 'Ramiona kąta to...',
    options: [
      { id: 'a', text: 'Dwa punkty na łuku' },
      { id: 'b', text: 'Dwie półproste wychodzące z wierzchołka' },
      { id: 'c', text: 'Dwie liczby na kątomierzu' },
      { id: 'd', text: 'Dwa boki kątomierza' },
    ],
    correctId: 'b',
    explanation: 'Ramiona to dwie półproste o wspólnym początku w wierzchołku — dokładnie jak w przewodniku o języku geometrii.',
  },
  {
    id: 'jednostka',
    question: 'W jakich jednostkach mierzymy kąty?',
    options: [
      { id: 'a', text: 'W centymetrach' },
      { id: 'b', text: 'W kilogramach' },
      { id: 'c', text: 'W stopniach' },
      { id: 'd', text: 'W sekundach' },
    ],
    correctId: 'c',
    explanation: 'Jednostką miary kąta jest stopień, zapisywany symbolem „°”, np. 50°.',
  },
  {
    id: 'przykladanie',
    question: 'Jak poprawnie przyłożyć kątomierz do kąta?',
    options: [
      { id: 'a', text: 'Dowolnie, byle leżał na kartce' },
      { id: 'b', text: 'Środkiem na wierzchołku, kreską 0° na jednym z ramion' },
      { id: 'c', text: 'Brzegiem kątomierza do dowolnego ramienia' },
      { id: 'd', text: 'Środkiem na środku kartki' },
    ],
    correctId: 'b',
    explanation: 'Środek kątomierza musi trafić dokładnie w wierzchołek, a kreska 0° — w jedno z ramion.',
  },
  {
    id: 'dwie-podzialki',
    question: 'Kątomierz ma dwie podziałki liczone w przeciwne strony. Jak sprawdzić, którą czytać?',
    options: [
      { id: 'a', text: 'Zawsze czytać większą z dwóch liczb' },
      { id: 'b', text: 'To bez znaczenia, obie są prawdziwe' },
      { id: 'c', text: 'Sprawdzić, która podziałka zaczyna się od 0° na ramieniu, do którego przyłożyłeś kątomierz' },
      { id: 'd', text: 'Zawsze czytać podziałkę bliżej środka kątomierza' },
    ],
    correctId: 'c',
    explanation: 'Prawdziwy odczyt to zawsze ten, który liczy od 0° zaczynającego się na Twoim ramieniu podstawy.',
  },
  {
    id: 'max-katomierz',
    question: 'Największy kąt, jaki zmierzysz zwykłym półkolistym kątomierzem, to...',
    options: [
      { id: 'a', text: '90°' },
      { id: 'b', text: '180°' },
      { id: 'c', text: '360°' },
      { id: 'd', text: '100°' },
    ],
    correctId: 'b',
    explanation: 'Półkolista podziałka kończy się na 180° — to kąt „prostej linii”, dwa ramiona leżące na wprost siebie.',
  },
];

const CHEAT_SHEET = [
  'Kąt ma wierzchołek (wspólny punkt) i dwa ramiona (półproste wychodzące z wierzchołka).',
  'Kąty mierzymy w stopniach — zapis to liczba i mała litera „°”, np. 50°.',
  'Kątomierz przykładamy środkiem dokładnie na wierzchołku, a kreską 0° na jednym z ramion.',
  'Wynik odczytujesz tam, gdzie drugie ramię przecina podziałkę kątomierza.',
  'Kątomierz ma dwie podziałki liczone w przeciwne strony — czytaj tę, która zaczyna się od 0° na ramieniu, do którego przyłożyłeś kątomierz.',
  'Największy kąt zmierzony półkolistym kątomierzem to 180° — kąt „prostej linii”.',
];

const IMAGES = imgMap({
  intro: '/images/matematyka/lekcje/katy-i-katomierz/katomierz-notatnik.jpg',
  rozgrzewka: '/images/matematyka/lekcje/katy-i-katomierz/nozyczki-i-ksiazka.jpg',
  przyklady: '/images/matematyka/lekcje/katy-i-katomierz/dziecko-katomierz.jpg',
  trening: '/images/matematyka/lekcje/katy-i-katomierz/katomierz-linijka-biurko.jpg',
  drzwi: '/images/matematyka/lekcje/katy-i-katomierz/uchylone-drzwi.jpg',
});

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function KatyIKatomierzLesson({ lesson, mathModule, nextLesson }: LessonProps) {
  return (
    <LessonShell lesson={lesson} mathModule={mathModule} steps={STEPS} nextLesson={nextLesson}>
      <LessonBody color={mathModule.color} />
    </LessonShell>
  );
}

/** Treść lekcji wydzielona z komponentu strony, bo `useStepDone` wymaga kontekstu z `LessonShell`. */
function LessonBody({ color }: { color: string }) {
  const warmUp = useStepDone('rozgrzewka');
  const concept = useStepDone('wierzcholek-ramiona');
  const examples = useStepDone('przyklady');
  const drill = useStepDone('trening');
  const doorCase = useStepDone('drzwi');
  const quiz = useStepDone('quiz');

  return (
    <>
      {/* Wstęp */}
      <div className="grid items-center gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_240px]">
        <div>
          <p className="mb-4 text-base leading-relaxed sm:text-lg">
            W przewodniku poznałeś/aś już symbol <strong>°</strong> i sposób nazywania kąta trzema
            literami. Teraz czas nazwać jego <strong>części</strong> — ramiona i wierzchołek — i
            wziąć do ręki <strong>kątomierz</strong>, żeby naprawdę zmierzyć, ile stopni ma kąt.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {[
              { icon: MoveDiagonal, text: 'Ramiona — dwie półproste kąta' },
              { icon: Circle, text: 'Wierzchołek — wspólny punkt ramion' },
              { icon: Scan, text: 'Środek kątomierza na wierzchołku' },
              { icon: Ruler, text: 'Dwie podziałki — czytaj tę od Twojego 0°' },
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
            alt="Przezroczysty kątomierz i ołówek leżące na otwartym zeszycie"
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
          variant="secondary"
          color={color}
          image={IMAGES.rozgrzewka}
          alt="Lekko rozchylone nożyczki obok szeroko otwartej książki na drewnianym stole"
          lead="Kąty otacza Cię wszędzie — tylko nikt ich tak nie nazywał."
        >
          Zanim poznasz definicje, oceń cztery codzienne sceny: czy kąt otwarcia jest w nich mały,
          czy duży? Twoja intuicja już to widzi.
        </LessonImageCard>
        <AnglesAroundUs color={color} onComplete={warmUp.markStepDone} />
      </LessonSection>

      {/* 2. Nowe pojęcie */}
      <LessonSection id="wierzcholek-ramiona">
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
          Przeciągnij ruchome ramię i obserwuj, jak rośnie miara kąta. Trafiaj w kolejne wskazane
          wartości — po drodze poznasz nazwy obu jego części.
        </p>
        <AngleBuilder
          color={color}
          showLabels
          targets={[
            { degrees: 30, prompt: 'Ustaw kąt bliski 30°' },
            { degrees: 90, prompt: 'Teraz ustaw kąt bliski 90°' },
            { degrees: 150, prompt: 'I na koniec kąt bliski 150°' },
          ]}
          onComplete={concept.markStepDone}
        />
      </LessonSection>

      {/* 3. Przykłady */}
      <LessonSection id="przyklady">
        <LessonImageCard
          variant="ghost"
          color={color}
          numeral="3"
          kicker="3 gotowe odczyty"
          image={IMAGES.przyklady}
          alt="Dziecko przykładające przezroczysty kątomierz do kąta narysowanego na kartce"
        >
          Kątomierz jest już dobrze przyłożony — środkiem na wierzchołku, kreską 0° na ramieniu
          podstawy. Twoje zadanie to tylko policzyć, ile stopni ma drugie ramię.
        </LessonImageCard>
        <ProtractorWalkthrough color={color} onComplete={examples.markStepDone} />
      </LessonSection>

      {/* 4. Ćwiczenia */}
      <LessonSection id="trening">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.trening}
          alt="Kątomierz obok linijki i ołówka na szkolnym biurku"
        >
          <p>
            Czas na trening — i na najczęstszą pułapkę przy mierzeniu kątów. Przy każdej kresce
            kątomierza widnieją <strong>dwie liczby</strong>, bo podziałka liczy w obie strony.
            Wybierz tę prawdziwą.
          </p>
        </LessonImageCard>
        <ProtractorScaleAudit color={color} onComplete={drill.markStepDone} />
      </LessonSection>

      {/* 5. Zadanie problemowe */}
      <LessonSection id="drzwi">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.drzwi}
          alt="Drewniane drzwi uchylone pod pewnym kątem w oświetlonym wnętrzu"
          reverse
          lead="Pod jakim kątem są uchylone te drzwi?"
        >
          Najpierw zgadnij kąt otwarcia na oko, potem sprawdź to naprawdę, odtwarzając go na
          tarczy — i zobacz, jak blisko trafiłeś/aś.
        </LessonImageCard>
        <DoorAngleCase color={color} onComplete={doorCase.markStepDone} />
      </LessonSection>

      {/* 6. Quiz */}
      <LessonSection id="quiz">
        <LessonQuiz questions={QUIZ} color={color} onFinish={quiz.markStepDone} />
      </LessonSection>

      {/* Ściąga */}
      <section className="border-2 border-dashed p-5 sm:p-6" style={{ borderColor: `${color}59` }}>
        <h2 className="mb-1 text-xl font-bold">Ściąga: kąty i kątomierz w sześciu zdaniach</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Wracaj do niej w kolejnych lekcjach geometrii — przyda się przy rodzajach kątów i
          wielokątach.
        </p>
        <ol className="divide-y border">
          {CHEAT_SHEET.map((rule, index) => (
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
