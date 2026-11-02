'use client';

import Image from 'next/image';
import { Boxes, Cone, Layers, Sigma } from 'lucide-react';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';
import { DiagnosticQuiz } from '../../diagnostic-quiz';
import { LessonImageCard } from '../../lesson-image-card';
import { ShapeSortBoard } from './shape-sort-board';
import { SolidBuilder } from './solid-builder';
import { SolidCountSteps } from './solid-count-steps';
import { SolidDetective } from './solid-detective';
import { buildSolidDrill } from './solid-drill';
import { SOLID_FAMILY_RULES } from '../../../lib/solids';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

const STEPS: LessonStepMeta[] = [
  {
    id: 'rozgrzewka',
    kind: 'Rozgrzewka',
    title: 'Toczy się czy stoi?',
    time: '6 min',
    icon: 'Sparkles',
  },
  {
    id: 'nazwy',
    kind: 'Nowe pojęcie',
    title: 'Bryła bierze nazwę od podstawy',
    time: '10 min',
    icon: 'Lightbulb',
  },
  {
    id: 'przyklady',
    kind: 'Przykłady',
    title: 'Trzy bryły krok po kroku',
    time: '7 min',
    icon: 'ListChecks',
  },
  {
    id: 'cwiczenia',
    kind: 'Ćwiczenia',
    title: 'Rozpoznaj samodzielnie',
    time: '8 min',
    icon: 'Target',
  },
  {
    id: 'zadanie',
    kind: 'Zadanie problemowe',
    title: 'Bryła pod chustą',
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
    id: 'roznica-rodzin',
    question: 'Czym graniastosłup różni się od ostrosłupa?',
    options: [
      { id: 'a', text: 'Graniastosłup ma zaokrągloną powierzchnię, a ostrosłup nie' },
      { id: 'b', text: 'Graniastosłup ma dwie identyczne podstawy, a ostrosłup jedną i szczyt' },
      { id: 'c', text: 'Graniastosłup ma zawsze więcej ścian niż ostrosłup o tej samej podstawie… i tyle samo krawędzi' },
      { id: 'd', text: 'Graniastosłup ma zawsze podstawę kwadratową' },
    ],
    correctId: 'b',
    explanation:
      'Graniastosłup stoi na dwóch identycznych podstawach naprzeciw siebie. Ostrosłup ma jedną podstawę, a jego ściany boczne schodzą się w jednym wierzchołku na górze.',
  },
  {
    id: 'wierzcholki-ostroslupa-5',
    question: 'Ile wierzchołków ma ostrosłup pięciokątny?',
    options: [
      { id: 'a', text: '5' },
      { id: 'b', text: '10' },
      { id: 'c', text: '7' },
      { id: 'd', text: '6' },
    ],
    correctId: 'd',
    explanation:
      'Ostrosłup ma n + 1 wierzchołków: pięć na podstawie i jeden na szczycie, czyli 6. Liczba 10 to wierzchołki graniastosłupa pięciokątnego.',
  },
  {
    id: 'jedna-plaska',
    question: 'Która bryła ma dokładnie jedną płaską ścianę?',
    options: [
      { id: 'a', text: 'Stożek' },
      { id: 'b', text: 'Walec' },
      { id: 'c', text: 'Kula' },
      { id: 'd', text: 'Ostrosłup trójkątny' },
    ],
    correctId: 'a',
    explanation:
      'Stożek ma jedną okrągłą podstawę i zaokrągloną powierzchnię boczną. Walec ma dwie płaskie podstawy, kula ani jednej, a ostrosłup trójkątny same płaskie ściany — cztery.',
  },
  {
    id: 'prostopadloscian-to',
    question: 'Prostopadłościan to szczególny przypadek jakiej bryły?',
    options: [
      { id: 'a', text: 'Ostrosłupa czworokątnego' },
      { id: 'b', text: 'Walca' },
      { id: 'c', text: 'Graniastosłupa czworokątnego' },
      { id: 'd', text: 'Żadnej — to osobna rodzina' },
    ],
    correctId: 'c',
    explanation:
      'Prostopadłościan ma dwie identyczne podstawy w kształcie prostokąta, czyli jest graniastosłupem czworokątnym. Sześcian jest jeszcze bardziej szczególny — ma wszystkie krawędzie równe.',
  },
  {
    id: 'z-21-krawedzi',
    question: 'Graniastosłup ma 21 krawędzi. Jaki wielokąt jest jego podstawą?',
    options: [
      { id: 'a', text: 'Trójkąt' },
      { id: 'b', text: 'Siedmiokąt' },
      { id: 'c', text: 'Dwudziestojedenokąt' },
      { id: 'd', text: 'Sześciokąt' },
    ],
    correctId: 'b',
    explanation:
      'Graniastosłup ma 3n krawędzi. Z 3n = 21 wychodzi n = 7, więc podstawą jest siedmiokąt. Liczba krawędzi jest trzy razy większa od liczby boków podstawy, a nie równa jej.',
  },
  {
    id: 'dlaczego-sie-toczy',
    question: 'Dlaczego walec i kula się toczą, a graniastosłup nie?',
    options: [
      { id: 'a', text: 'Bo są lżejsze' },
      { id: 'b', text: 'Bo mają mniej ścian' },
      { id: 'c', text: 'Bo nie mają podstawy' },
      { id: 'd', text: 'Bo mają zaokrągloną powierzchnię, po której nie ma krawędzi zatrzymującej ruch' },
    ],
    correctId: 'd',
    explanation:
      'Toczy się to, co ma powierzchnię zaokrągloną. Graniastosłup na każdej ścianie ma płaskie oparcie, a każda krawędź zatrzymuje obrót. Walec ma zresztą dwie podstawy, więc odpowiedź o braku podstawy też jest nieprawdziwa.',
  },
];

const IMAGES = imgMap({
  intro: '/images/matematyka/lekcje/rozpoznawanie-bryl/kosz-z-przedmiotami.jpg',
  rozgrzewka: '/images/matematyka/lekcje/rozpoznawanie-bryl/pilka-i-kostka-na-desce.jpg',
  nazwy: '/images/matematyka/lekcje/rozpoznawanie-bryl/namiot-dwuspadowy.jpg',
  przyklady: '/images/matematyka/lekcje/rozpoznawanie-bryl/chlopiec-sortuje-bryly.jpg',
  cwiczenia: '/images/matematyka/lekcje/rozpoznawanie-bryl/cegly-i-rury.jpg',
  zadanie: '/images/matematyka/lekcje/rozpoznawanie-bryl/przedmiot-pod-chusta.jpg',
});

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function RozpoznawanieBrylLesson({ lesson, mathModule, nextLesson }: LessonProps) {
  return (
    <LessonShell lesson={lesson} mathModule={mathModule} steps={STEPS} nextLesson={nextLesson}>
      <LessonBody color={mathModule.color} />
    </LessonShell>
  );
}

/** Treść lekcji wydzielona z komponentu strony, bo `useStepDone` wymaga kontekstu z `LessonShell`. */
function LessonBody({ color }: { color: string }) {
  const rozgrzewka = useStepDone('rozgrzewka');
  const nazwy = useStepDone('nazwy');
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
            Sześć nazw brył poznałeś w przewodniku, a prostopadłościan rozebrałeś na części
            w poprzedniej lekcji. Teraz nauczysz się <strong>rozpoznawać</strong> bryły: po tym, czy
            mają płaskie ściany, ile mają podstaw i jaki wielokąt na nich leży. Okaże się przy tym,
            że liczb ścian i krawędzi wcale nie trzeba pamiętać — wystarczy{' '}
            <strong>policzyć boki podstawy</strong>.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {[
              { icon: Cone, text: 'Płaskie ściany kontra powierzchnia zaokrąglona' },
              { icon: Layers, text: 'Graniastosłup: dwie podstawy. Ostrosłup: jedna i szczyt' },
              { icon: Boxes, text: 'Nazwa bryły pochodzi od jej podstawy' },
              { icon: Sigma, text: 'Ściany, krawędzie i wierzchołki wprost z liczby n' },
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
            alt="Wiklinowy koszyk z pomarańczą, a obok na stole puszka, drewniana kostka, papierowy rożek i zwinięty ręcznik"
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
          numeral="2"
          kicker="Dwie rodziny, jedna granica"
          image={IMAGES.rozgrzewka}
          alt="Drewniana deska oparta ukośnie jak zjeżdżalnia, po której toczy się kulka, podczas gdy drewniana kostka stoi nieruchomo wyżej"
        >
          Sześć przedmiotów, dwie skrzynki: jedna na te złożone z samych płaskich ścian, druga na te
          z powierzchnią zaokrągloną. Jeśli się zawahasz, wyobraź sobie tę deskę — co się po niej
          poturla, a co zostanie w miejscu?
        </LessonImageCard>
        <ShapeSortBoard color={color} onComplete={rozgrzewka.markStepDone} />
      </LessonSection>

      {/* 2. Nowe pojęcie */}
      <LessonSection id="nazwy">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.nazwy}
          alt="Namiot dwuspadowy rozbity na trawie, widoczna trójkątna ścianka od frontu i długi prosty bok"
        >
          <p>
            Ten namiot to <strong>graniastosłup trójkątny</strong> — nie dlatego, że ma pięć ścian,
            tylko dlatego, że jego podstawą jest trójkąt. Zmieniaj podstawę suwakiem i przełączaj
            rodzinę: zobaczysz, że wraz z podstawą zmienia się nazwa <em>i</em> wszystkie trzy
            liczby. Po kilku próbach pokażą się wzory.
          </p>
        </LessonImageCard>
        <SolidBuilder color={color} onComplete={nazwy.markStepDone} />
      </LessonSection>

      {/* 3. Przykłady */}
      <LessonSection id="przyklady">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.przyklady}
          alt="Chłopiec około dziesięciu lat, jasna karnacja, proste jasnobrązowe włosy, koszulka w czerwono-białe paski, rozdziela drewniane bryły na dwie grupy: sześcian i ostrosłup obok siebie, kula i walec osobno"
          lead="Najpierw podstawa, potem nazwa, na końcu liczby."
          reverse
        >
          Trzy rozwiązania krok po kroku. Ostatnie idzie od końca: znane są wierzchołki, a szukamy
          podstawy — bo dopiero wtedy widać, że wzór to reguła, a nie tabelka do wykucia.
        </LessonImageCard>
        <SolidCountSteps color={color} onComplete={przyklady.markStepDone} />
      </LessonSection>

      {/* 4. Ćwiczenia */}
      <LessonSection id="cwiczenia">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.cwiczenia}
          alt="Równy stos cegieł stojący obok dwóch betonowych rur leżących na boku na placu budowy"
          reverse
        >
          <p>
            Siedem zadań o rosnącej trudności: rodziny brył, nazwy od podstawy, liczenie ścian
            i krawędzi, a na koniec porównanie graniastosłupa z ostrosłupem o tej samej podstawie.
          </p>
        </LessonImageCard>
        <DiagnosticQuiz
          tasks={buildSolidDrill(color)}
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
          lead="Nie widzisz bryły. Możesz tylko pytać."
          alt="Nieznany przedmiot ukryty pod miękką tkaniną na drewnianym stole, przez materiał widać jego zaokrąglony zarys"
        >
          Zadawaj pytania o zaokrąglenie, podstawy i wierzchołki. Po każdej odpowiedzi część brył
          odpada — i to jest cała sztuka rozpoznawania: nie „pamiętam, jak wygląda”, tylko „które
          cechy ją wyróżniają”.
        </LessonImageCard>
        <SolidDetective color={color} onComplete={zadanie.markStepDone} />
      </LessonSection>

      {/* 6. Quiz */}
      <LessonSection id="quiz">
        <LessonQuiz questions={QUIZ} color={color} onFinish={quiz.markStepDone} />
      </LessonSection>

      {/* Ściąga */}
      <section className="border-2 border-dashed p-5 sm:p-6" style={{ borderColor: `${color}59` }}>
        <h2 className="mb-1 text-xl font-bold">Ściąga: rodziny brył</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Osiem zdań, które wystarczą na cały ten temat.
        </p>
        <ol className="divide-y border">
          {SOLID_FAMILY_RULES.map((rule, index) => (
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
