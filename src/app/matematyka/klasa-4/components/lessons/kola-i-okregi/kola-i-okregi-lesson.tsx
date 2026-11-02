'use client';

import Image from 'next/image';
import { Circle, CircleDot, Compass, Ruler } from 'lucide-react';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';
import { DiagnosticQuiz } from '../../diagnostic-quiz';
import { LessonImageCard } from '../../lesson-image-card';
import { CirclePartsHunt } from './circle-parts-hunt';
import { CompassDraw, type CompassTarget } from './compass-draw';
import { CircleFormulaShowcase } from './circle-formula-showcase';
import { buildDrillTasks, buildProblemTasks } from './kola-i-okregi-drill';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

const STEPS: LessonStepMeta[] = [
  {
    id: 'rozgrzewka',
    kind: 'Rozgrzewka',
    title: 'Pamiętasz nazwy z przewodnika?',
    time: '5 min',
    icon: 'Sparkles',
  },
  {
    id: 'definicje',
    kind: 'Nowe pojęcie',
    title: 'Cyrkiel — narzędzie do rysowania koła',
    time: '7 min',
    icon: 'Lightbulb',
  },
  {
    id: 'przyklady',
    kind: 'Przykłady',
    title: 'Średnica to zawsze 2 × promień',
    time: '6 min',
    icon: 'Shapes',
  },
  {
    id: 'trening',
    kind: 'Ćwiczenia',
    title: 'Policz i rozpoznaj',
    time: '8 min',
    icon: 'Target',
  },
  {
    id: 'stol',
    kind: 'Zadanie problemowe',
    title: 'Czy stół zmieści się w drzwiach?',
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

const COMPASS_TARGETS: CompassTarget[] = [
  { radiusCm: 3, prompt: 'Narysuj cyrklem okrąg o promieniu 3 cm.' },
  { radiusCm: 5, prompt: 'Teraz narysuj okrąg o promieniu 5 cm — im dłuższy promień, tym większe koło.' },
];

const QUIZ: QuizQuestion[] = [
  {
    id: 'kolo-czy-okrag-quiz',
    question: 'Czym różni się koło od okręgu?',
    options: [
      { id: 'a', text: 'Niczym, to dwie nazwy tej samej figury' },
      { id: 'b', text: 'Okrąg to sama linia dookoła, koło to cała powierzchnia razem z wnętrzem' },
      { id: 'c', text: 'Koło to sama linia, okrąg to cała powierzchnia' },
      { id: 'd', text: 'Okrąg ma środek, a koło go nie ma' },
    ],
    correctId: 'b',
    explanation: 'Okrąg to krzywa — sam brzeg. Koło to okrąg razem z tym, co jest w środku, czyli cała powierzchnia.',
  },
  {
    id: 'promien-definicja-quiz',
    question: 'Promień koła to odcinek, który...',
    options: [
      { id: 'a', text: 'łączy dwa dowolne punkty okręgu' },
      { id: 'b', text: 'łączy środek z dowolnym punktem okręgu' },
      { id: 'c', text: 'przechodzi przez środek i łączy dwa punkty okręgu' },
      { id: 'd', text: 'otacza całe koło dookoła' },
    ],
    correctId: 'b',
    explanation: 'Promień zawsze zaczyna się w środku i kończy na okręgu — w każdym kierunku ma dokładnie taką samą długość.',
  },
  {
    id: 'srednica-11-quiz',
    question: 'Okrąg ma promień 11 cm. Ile wynosi jego średnica?',
    options: [
      { id: 'a', text: '22 cm' },
      { id: 'b', text: '11 cm' },
      { id: 'c', text: '5,5 cm' },
      { id: 'd', text: '33 cm' },
    ],
    correctId: 'a',
    explanation: 'Średnica to 2 × promień: 2 × 11 = 22 cm.',
  },
  {
    id: 'cyrkiel-quiz',
    question: 'Do czego służy cyrkiel?',
    options: [
      { id: 'a', text: 'Do mierzenia kątów' },
      { id: 'b', text: 'Do rysowania prostych linii' },
      { id: 'c', text: 'Do rysowania okręgów o zadanym promieniu' },
      { id: 'd', text: 'Do mierzenia masy' },
    ],
    correctId: 'c',
    explanation: 'Cyrkiel ma szpic (wbijany w środek) i ramię z ołówkiem w stałej odległości od niego — dzięki temu rysuje okrąg o dokładnie zadanym promieniu.',
  },
  {
    id: 'cieciwa-quiz',
    question: 'Które zdanie o cięciwie jest prawdziwe?',
    options: [
      { id: 'a', text: 'Cięciwa zawsze przechodzi przez środek' },
      { id: 'b', text: 'Każda cięciwa jest krótsza niż promień' },
      { id: 'c', text: 'Cięciwa łączy dwa punkty okręgu i nie musi przechodzić przez środek' },
      { id: 'd', text: 'Cięciwa to inna nazwa okręgu' },
    ],
    correctId: 'c',
    explanation: 'Cięciwa łączy dowolne dwa punkty okręgu. Gdy akurat przejdzie przez środek, staje się średnicą — jej najdłuższym szczególnym przypadkiem.',
  },
  {
    id: 'stol-przez-drzwi-quiz',
    question: 'Okrągły blat ma promień 48 cm. Drzwi mają szerokość 90 cm. Czy blat przejdzie bez przechylania?',
    options: [
      { id: 'a', text: 'Tak — średnica to 96 cm, ale to i tak za dużo, więc nie' },
      { id: 'b', text: 'Nie — średnica blatu to 96 cm, a drzwi mają tylko 90 cm' },
      { id: 'c', text: 'Tak, bo promień (48 cm) jest mniejszy niż szerokość drzwi' },
      { id: 'd', text: 'Za mało danych, żeby to sprawdzić' },
    ],
    correctId: 'b',
    explanation: '2 × 48 cm = 96 cm średnicy — to więcej niż 90 cm szerokości drzwi, więc blat się nie zmieści bez przechylenia.',
  },
];

const CHEAT_SHEET = [
  'Okrąg to linia dookoła, koło to cała powierzchnia razem z wnętrzem.',
  'Środek to punkt jednakowo oddalony od każdego punktu okręgu.',
  'Promień łączy środek z okręgiem — w każdym kierunku ma tę samą długość.',
  'Średnica przechodzi przez środek i zawsze jest 2 × promień.',
  'Cięciwa łączy dwa punkty okręgu, ale nie musi przechodzić przez środek.',
  'Cyrkiel rysuje okrąg o zadanym promieniu — szpic w środku, ołówek w stałej odległości od niego.',
];

const IMAGES = imgMap({
  intro: '/images/matematyka/lekcje/kola-i-okregi/cyrkiel-na-planie-geometrycznym.jpg',
  rozgrzewka: '/images/matematyka/lekcje/kola-i-okregi/okragle-przedmioty-na-stole.jpg',
  definicje: '/images/matematyka/lekcje/kola-i-okregi/dziecko-rysujace-cyrklem.jpg',
  przyklady: '/images/matematyka/lekcje/kola-i-okregi/kolo-rowerowe-ze-szprychami.jpg',
  trening: '/images/matematyka/lekcje/kola-i-okregi/przybory-geometryczne-na-kartce-w-kratke.jpg',
  stol: '/images/matematyka/lekcje/kola-i-okregi/okragly-stol-przenoszony-przez-drzwi.jpg',
});

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function KolaIOkregiLesson({ lesson, mathModule, nextLesson }: LessonProps) {
  return (
    <LessonShell lesson={lesson} mathModule={mathModule} steps={STEPS} nextLesson={nextLesson}>
      <LessonBody color={mathModule.color} />
    </LessonShell>
  );
}

/** Treść lekcji wydzielona z komponentu strony, bo `useStepDone` wymaga kontekstu z `LessonShell`. */
function LessonBody({ color }: { color: string }) {
  const warmUp = useStepDone('rozgrzewka');
  const concept = useStepDone('definicje');
  const examples = useStepDone('przyklady');
  const drill = useStepDone('trening');
  const doorCase = useStepDone('stol');
  const quiz = useStepDone('quiz');

  return (
    <>
      {/* Wstęp */}
      <div className="grid items-center gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_240px]">
        <div>
          <p className="mb-4 text-base leading-relaxed sm:text-lg">
            Z przewodnika znasz już nazwy: koło, okrąg, środek, promień, średnica, cięciwa. Teraz
            weźmiesz je do ręki — dosłownie: narysujesz okrąg <strong>cyrklem</strong> i policzysz
            pierwsze prawdziwe zależności między promieniem a średnicą.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {[
              { icon: CircleDot, text: 'Środek — punkt w sercu koła' },
              { icon: Ruler, text: 'Promień i średnica — 2 × promień = średnica' },
              { icon: Compass, text: 'Cyrkiel rysuje okrąg o zadanym promieniu' },
              { icon: Circle, text: 'Cięciwa — nie każda przechodzi przez środek' },
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
            alt="Cyrkiel leżący na planie geometrycznym z narysowanymi okręgami"
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
          alt="Okrągłe przedmioty na stole: talerz, moneta, zegar i pokrywka"
          lead="Zanim policzysz cokolwiek, przypomnij sobie nazwy."
        >
          Kliknij w rysunku dokładnie ten element, o który pytamy — środek, promień, średnicę i
          cięciwę.
        </LessonImageCard>
        <CirclePartsHunt color={color} onComplete={warmUp.markStepDone} />
      </LessonSection>

      {/* 2. Nowe pojęcie */}
      <LessonSection id="definicje">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.definicje}
          alt="Dziecko rysujące okrąg cyrklem na kartce papieru"
        >
          <p>
            Cyrkiel ma dwie nóżki: jedna ze szpicem wbija się w papier i zostaje w środku, druga —
            z ołówkiem — obchodzi dookoła w stałej odległości od szpica. Ta stała odległość to
            właśnie promień.
          </p>
        </LessonImageCard>
        <CompassDraw color={color} targets={COMPASS_TARGETS} onComplete={concept.markStepDone} />
      </LessonSection>

      {/* 3. Przykłady */}
      <LessonSection id="przyklady">
        <LessonImageCard
          variant="ghost"
          color={color}
          numeral="2×"
          kicker="Promień razy dwa"
          image={IMAGES.przyklady}
          alt="Koło rowerowe ze szprychami rozchodzącymi się od piasty do obręczy"
        >
          W kole rowerowym szprychy to promienie — wszystkie tej samej długości. Średnica to dwie
          szprychy leżące dokładnie naprzeciwko siebie, w jednej linii przez piastę.
        </LessonImageCard>

        <CircleFormulaShowcase color={color} onComplete={examples.markStepDone} />
      </LessonSection>

      {/* 4. Ćwiczenia */}
      <LessonSection id="trening">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.trening}
          alt="Cyrkiel, linijka i kątomierz ułożone na kartce w kratkę"
          reverse
        >
          <p>Czas policzyć samodzielnie — od prostego promienia po rozpoznawanie na rysunku.</p>
        </LessonImageCard>
        <DiagnosticQuiz tasks={buildDrillTasks(color)} color={color} onFinish={drill.markStepDone} />
      </LessonSection>

      {/* 5. Zadanie problemowe */}
      <LessonSection id="stol">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.stol}
          alt="Dwie osoby przenoszące okrągły stół przez drzwi mieszkania"
          reverse
          lead="Rodzina przeprowadza się i musi przenieść okrągły stół przez drzwi."
        >
          Zanim zaczną przechylać mebel, warto policzyć — może w ogóle się nie zmieści, a może
          przejdzie bez trudu.
        </LessonImageCard>
        <DiagnosticQuiz
          tasks={buildProblemTasks(color)}
          color={color}
          onFinish={doorCase.markStepDone}
          resultCopy={{
            perfect: { title: 'Stół bezpiecznie przeniesiony!', message: 'Policzyłeś/aś obie średnice bezbłędnie.' },
            good: { title: 'Prawie się udało', message: 'Większość obliczeń trafiona — sprawdź wyjaśnienia przy pomyłkach.' },
            poor: { title: 'Spróbuj jeszcze raz', message: 'Zasada jest zawsze ta sama: średnica = 2 × promień.' },
          }}
        />
      </LessonSection>

      {/* 6. Quiz */}
      <LessonSection id="quiz">
        <LessonQuiz questions={QUIZ} color={color} onFinish={quiz.markStepDone} />
      </LessonSection>

      {/* Ściąga */}
      <section className="border-2 border-dashed p-5 sm:p-6" style={{ borderColor: `${color}59` }}>
        <h2 className="mb-1 text-xl font-bold">Ściąga: koło i okrąg w sześciu zdaniach</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Wracaj do niej, gdy w kolejnych lekcjach spotkasz symetrię i skalę.
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
