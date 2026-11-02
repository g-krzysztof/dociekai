'use client';

import Image from 'next/image';
import { Divide, Grid3x3, Square, X } from 'lucide-react';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';
import { DiagnosticQuiz } from '../../diagnostic-quiz';
import { LessonImageCard } from '../../lesson-image-card';
import { RectangleBuilder } from '../prostokaty-i-kwadraty/rectangle-builder';
import { RowStampBoard } from './row-stamp-board';
import { AreaFormulaSteps } from './area-formula-steps';
import { AreaFactorGarden } from './area-factor-garden';
import { buildRectangleAreaDrill } from './rectangle-area-drill';
import { RECTANGLE_AREA_RULES } from '../../../lib/rectangle-area';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

const STEPS: LessonStepMeta[] = [
  {
    id: 'rozgrzewka',
    kind: 'Rozgrzewka',
    title: 'Ułóż jeden rząd, resztę powiel',
    time: '5 min',
    icon: 'Sparkles',
  },
  {
    id: 'wzor',
    kind: 'Nowe pojęcie',
    title: 'Pole prostokąta to a · b',
    time: '10 min',
    icon: 'Lightbulb',
  },
  {
    id: 'przyklady',
    kind: 'Przykłady',
    title: 'Trzy rozwiązania krok po kroku',
    time: '7 min',
    icon: 'ListChecks',
  },
  {
    id: 'cwiczenia',
    kind: 'Ćwiczenia',
    title: 'Policz samodzielnie',
    time: '8 min',
    icon: 'Target',
  },
  {
    id: 'zadanie',
    kind: 'Zadanie problemowe',
    title: 'To samo pole, najkrótszy płot',
    time: '8 min',
    icon: 'Puzzle',
  },
  {
    id: 'quiz',
    kind: 'Quiz',
    title: 'Sprawdź, co zapamiętałeś',
    time: '5 min',
    icon: 'CheckCircle2',
  },
];

const QUIZ: QuizQuestion[] = [
  {
    id: 'wzor-prostokata',
    question: 'Jak liczy się pole prostokąta o bokach a i b?',
    options: [
      { id: 'a', text: 'a + b' },
      { id: 'b', text: 'a · b' },
      { id: 'c', text: '2 · a + 2 · b' },
      { id: 'd', text: '(a + b) : 2' },
    ],
    correctId: 'b',
    explanation:
      'W każdym rzędzie mieści się a kratek, a rzędów jest b — więc kratek jest a · b. Zapis 2 · a + 2 · b to obwód, nie pole.',
  },
  {
    id: 'kwadrat-9',
    question: 'Kwadrat ma bok 9 cm. Jakie ma pole?',
    options: [
      { id: 'a', text: '18 cm²' },
      { id: 'b', text: '36 cm²' },
      { id: 'c', text: '9 cm²' },
      { id: 'd', text: '81 cm²' },
    ],
    correctId: 'd',
    explanation:
      'Kwadrat ma oba boki równe, więc P = 9 · 9 = 81 cm². Liczba 36 to obwód tego kwadratu, a 18 to podwojony bok.',
  },
  {
    id: 'prostokat-7-4',
    question: 'Prostokątny stół ma boki 7 m i 4 m. Jakie ma pole?',
    options: [
      { id: 'a', text: '28 m²' },
      { id: 'b', text: '22 m²' },
      { id: 'c', text: '11 m²' },
      { id: 'd', text: '28 m' },
    ],
    correctId: 'a',
    explanation:
      'P = 7 · 4 = 28. Boki są w metrach, więc pole podajemy w metrach kwadratowych: 28 m². Zapis „28 m” oznaczałby długość.',
  },
  {
    id: 'szukany-bok',
    question: 'Prostokąt ma pole 45 cm², a jeden bok mierzy 9 cm. Ile ma drugi bok?',
    options: [
      { id: 'a', text: '36 cm' },
      { id: 'b', text: '9 cm' },
      { id: 'c', text: '5 cm' },
      { id: 'd', text: '405 cm' },
    ],
    correctId: 'c',
    explanation:
      'Wzór działa w obie strony: b = P : a = 45 : 9 = 5 cm. Sprawdzenie: 9 · 5 = 45.',
  },
  {
    id: 'to-samo-pole',
    question: 'Dwa prostokąty mają takie samo pole 36 m². Czy muszą mieć taki sam obwód?',
    options: [
      { id: 'a', text: 'Tak, równe pola to zawsze równe obwody' },
      { id: 'b', text: 'Nie — kwadrat 6 · 6 ma obwód 24 m, a prostokąt 4 · 9 aż 26 m' },
      { id: 'c', text: 'Tak, bo obwód liczy się z pola' },
      { id: 'd', text: 'Nie da się tego rozstrzygnąć bez rysunku' },
    ],
    correctId: 'b',
    explanation:
      'Pole i obwód to dwie niezależne miary. Przy tym samym polu najkrótszy obwód ma kształt najbliższy kwadratowi.',
  },
  {
    id: 'dlaczego-kwadratowe',
    question: 'Dlaczego pole zapisujemy w jednostkach „kwadratowych”, np. w m²?',
    options: [
      { id: 'a', text: 'Bo figury o polu zawsze są kwadratami' },
      { id: 'b', text: 'Bo tak jest krócej niż pisać „metry”' },
      { id: 'c', text: 'Bo pole zawsze dzieli się przez cztery' },
      { id: 'd', text: 'Bo mnożymy długość przez długość, a jednostką takiego wyniku jest kwadrat o boku 1 m' },
    ],
    correctId: 'd',
    explanation:
      'Metr razy metr daje metr kwadratowy — czyli pole kwadratu o boku 1 m. To ta sama jednostka, którą poznałeś w przewodniku o jednostkach pola.',
  },
];

const IMAGES = imgMap({
  intro:
    '/images/matematyka/lekcje/pole-prostokata-i-kwadratu/kwadratowe-plytki-linijka-i-olowek-na-podlodze.jpg',
  rozgrzewka:
    '/images/matematyka/lekcje/pole-prostokata-i-kwadratu/kwadratowe-plytki-korkowe-ulozone-rzedami.jpg',
  wzor:
    '/images/matematyka/lekcje/pole-prostokata-i-kwadratu/dziewczynka-kleczy-przy-prostokatnym-dywanie.jpg',
  przyklady:
    '/images/matematyka/lekcje/pole-prostokata-i-kwadratu/taras-wylozony-kwadratowymi-plytami.jpg',
  cwiczenia:
    '/images/matematyka/lekcje/pole-prostokata-i-kwadratu/chlopiec-rysuje-prostokaty-na-papierze-w-kratke.jpg',
  zadanie:
    '/images/matematyka/lekcje/pole-prostokata-i-kwadratu/grzadka-otoczona-niska-siatka-i-drewniane-paliki.jpg',
});

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function PoleProstokataIKwadratuLesson({ lesson, mathModule, nextLesson }: LessonProps) {
  return (
    <LessonShell lesson={lesson} mathModule={mathModule} steps={STEPS} nextLesson={nextLesson}>
      <LessonBody color={mathModule.color} />
    </LessonShell>
  );
}

/** Treść lekcji wydzielona z komponentu strony, bo `useStepDone` wymaga kontekstu z `LessonShell`. */
function LessonBody({ color }: { color: string }) {
  const rozgrzewka = useStepDone('rozgrzewka');
  const wzor = useStepDone('wzor');
  const przyklady = useStepDone('przyklady');
  const cwiczenia = useStepDone('cwiczenia');
  const zadanie = useStepDone('zadanie');
  const quiz = useStepDone('quiz');

  return (
    <>
      {/* Wstęp */}
      <div className="grid items-center gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_240px]">
        <div>
          <p className="mb-4 text-base leading-relaxed sm:text-lg">
            Pole umiesz już mierzyć kratkami — tylko że liczenie ich po jednej trwa wieczność, a przy
            dużej figurze łatwo się pomylić. W prostokącie da się to zrobić o wiele szybciej, bo{' '}
            <strong>każdy rząd jest taki sam</strong>. Wystarczy policzyć jeden rząd i rzędy, a to
            już jest zwykłe mnożenie. W tej lekcji zobaczysz, skąd bierze się wzór{' '}
            <strong>P = a · b</strong>, dlaczego kwadrat nie potrzebuje własnego wzoru i jak z tego
            samego wzoru wyliczyć brakujący bok.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {[
              { icon: Grid3x3, text: 'Kratki w rzędzie razy liczba rzędów' },
              { icon: X, text: 'Wzór na pole prostokąta: P = a · b' },
              { icon: Square, text: 'Kwadrat: ten sam bok dwa razy' },
              { icon: Divide, text: 'Z pola i jednego boku wyliczysz drugi' },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-2 text-sm">
                <Icon className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
                <span className="leading-relaxed">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mx-auto aspect-[4/3] w-full max-w-[240px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Fragment podłogi wyłożonej kwadratowymi płytkami, obok leży rozłożona drewniana linijka i zaostrzony ołówek"
            width={240}
            height={180}
            className="absolute inset-0 h-full w-full object-contain"
            priority
          />
        </div>
      </div>

      {/* 1. Rozgrzewka */}
      <LessonSection id="rozgrzewka">
        <LessonImageCard
          variant="ghost"
          color={color}
          numeral="1"
          kicker="Jeden rząd wystarczy"
          image={IMAGES.rozgrzewka}
          alt="Kwadratowe korkowe płytki ułożone równymi rzędami na drewnianym blacie stołu, kilka takich samych płytek leży obok w małym stosiku"
        >
          Ułóż kafelki w górnym rzędzie prostokąta — po jednym, klikając kratki. Reszty nie układaj
          ręcznie: skoro każdy rząd jest taki sam, wystarczy ten jeden powielić w dół.
        </LessonImageCard>
        <RowStampBoard color={color} onComplete={rozgrzewka.markStepDone} />
      </LessonSection>

      {/* 2. Nowe pojęcie */}
      <LessonSection id="wzor">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.wzor}
          alt="Dziewczynka około dziesięciu lat, jasna karnacja, ciemny blond włosy splecione w warkocz, żółty sweter, klęczy przy prostokątnym dywanie i przesuwa dłonią wzdłuż jego krawędzi"
        >
          <p>
            Przeciągnij róg prostokąta i patrz na działanie pod planszą. Liczba kratek w rzędzie to
            jeden bok, liczba rzędów to drugi bok — a ich iloczyn to pole. Gdy oba boki zrównają
            się, prostokąt staje się kwadratem i wzór zamienia się w{' '}
            <strong>P = a · a</strong>, ten sam bok pomnożony przez siebie.
          </p>
        </LessonImageCard>
        <RectangleBuilder
          color={color}
          areaReadout
          targets={[
            { width: 6, height: 3, prompt: 'Zbuduj prostokąt o bokach 6 i 3 kratki — ile ma pole?' },
            { width: 5, height: 5, prompt: 'Teraz kwadrat: oba boki po 5 kratek.' },
            { width: 8, height: 2, prompt: 'I jeszcze wąski prostokąt: 8 kratek na 2.' },
          ]}
          onComplete={wzor.markStepDone}
        />
      </LessonSection>

      {/* 3. Przykłady */}
      <LessonSection id="przyklady">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.przyklady}
          alt="Prostokątny taras wyłożony dużymi kwadratowymi płytami, w rogu gliniana doniczka z zielonym krzewem"
          lead="Trzy zadania, jeden wzór — także wtedy, gdy szukanym jest bok, a nie pole."
          reverse
        >
          Klikaj kolejne kroki i sprawdzaj, czy myślisz tak samo. Ostatni przykład idzie w drugą
          stronę: pole jest znane, a szukamy boku — wtedy mnożenie zamienia się w dzielenie.
        </LessonImageCard>
        <AreaFormulaSteps color={color} onComplete={przyklady.markStepDone} />
      </LessonSection>

      {/* 4. Ćwiczenia */}
      <LessonSection id="cwiczenia">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.cwiczenia}
          alt="Chłopiec około dziesięciu lat, jasna karnacja, krótkie ciemnorude włosy, zielona bluza, rysuje ołówkiem prostokąty na pustej kartce w kratkę"
          reverse
        >
          <p>
            Siedem zadań o rosnącej trudności: pole prostokąta i kwadratu, brakujący bok, pułapka
            „pole czy obwód”, a na koniec podłoga, z której trzeba odjąć dywan.
          </p>
        </LessonImageCard>
        <DiagnosticQuiz
          tasks={buildRectangleAreaDrill(color)}
          color={color}
          onFinish={cwiczenia.markStepDone}
        />
      </LessonSection>

      {/* 5. Zadanie problemowe */}
      <LessonSection id="zadanie">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.zadanie}
          lead="Ta sama liczba metrów kwadratowych, a płotu może pójść dużo albo mało."
          alt="Prostokątna warzywna grządka otoczona niską metalową siatką, obok leży zwinięty rulon siatki i kilka drewnianych palików"
        >
          Przeciągnij róg grządki. Pole zostaje takie samo — bo drugi bok dopasowuje się sam — ale
          obwód, czyli długość potrzebnej siatki, zmienia się przy każdym kształcie. Znajdź ten,
          przy którym siatki pójdzie najmniej.
        </LessonImageCard>
        <AreaFactorGarden color={color} onComplete={zadanie.markStepDone} />
      </LessonSection>

      {/* 6. Quiz */}
      <LessonSection id="quiz">
        <LessonQuiz questions={QUIZ} color={color} onFinish={quiz.markStepDone} />
      </LessonSection>

      {/* Ściąga */}
      <section className="border-2 border-dashed p-5 sm:p-6" style={{ borderColor: `${color}59` }}>
        <h2 className="mb-1 text-xl font-bold">Ściąga: pole prostokąta i kwadratu</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Siedem zdań, które wystarczą na cały ten temat.
        </p>
        <ol className="divide-y border">
          {RECTANGLE_AREA_RULES.map((rule, index) => (
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
