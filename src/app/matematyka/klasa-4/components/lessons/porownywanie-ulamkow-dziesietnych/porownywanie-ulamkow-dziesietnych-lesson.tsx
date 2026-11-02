'use client';

import Image from 'next/image';
import { Layers, MoveHorizontal, Plus, ScanLine } from 'lucide-react';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';
import { DiagnosticQuiz } from '../../diagnostic-quiz';
import { LessonImageCard } from '../../lesson-image-card';
import { DecimalStack } from './decimal-stack';
import { AlignAndScan } from './align-and-scan';
import { CompareDecimalSteps } from './compare-decimal-steps';
import { buildCompareDrill } from './compare-drill';
import { LongJumpFinal } from './long-jump-final';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

const STEPS: LessonStepMeta[] = [
  {
    id: 'rozgrzewka',
    kind: 'Rozgrzewka',
    title: 'Ułóż wieżę liczb w kolejności',
    time: '8 min',
    icon: 'Sparkles',
  },
  {
    id: 'reguly',
    kind: 'Nowe pojęcie',
    title: 'Wyrównaj, dopisz zera, porównaj rzędy',
    time: '10 min',
    icon: 'Lightbulb',
  },
  {
    id: 'przyklady',
    kind: 'Przykłady',
    title: 'Trzy rozstrzygnięte porównania',
    time: '6 min',
    icon: 'ListChecks',
  },
  {
    id: 'cwiczenia',
    kind: 'Ćwiczenia',
    title: 'Porównaj i uporządkuj samodzielnie',
    time: '8 min',
    icon: 'Target',
  },
  {
    id: 'zadanie',
    kind: 'Zadanie problemowe',
    title: 'Finał skoku w dal',
    time: '6 min',
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
    id: 'ktora-wieksza',
    question: 'Która liczba jest większa: 0,45 czy 0,5?',
    options: [
      { id: 'a', text: '0,45, bo ma więcej cyfr po przecinku' },
      { id: 'b', text: 'Są równe' },
      { id: 'c', text: 'Nie da się porównać' },
      { id: 'd', text: '0,5' },
    ],
    correctId: 'd',
    explanation:
      'Wyrównaj miejsca: 0,45 i 0,50. W rzędzie dziesiątych 4 < 5, więc 0,5 jest większe — liczba cyfr po przecinku niczego nie mówi.',
  },
  {
    id: 'dlaczego-rowne',
    question: 'Dlaczego 0,7 = 0,70?',
    options: [
      { id: 'a', text: 'Bo 70 to więcej niż 7' },
      { id: 'b', text: 'Bo dopisane zero na końcu części dziesiętnej nie zmienia wartości' },
      { id: 'c', text: 'Bo 7 i 70 zbudowane są z tych samych cyfr' },
      { id: 'd', text: 'Bo 0,70 ma więcej miejsc po przecinku' },
    ],
    correctId: 'b',
    explanation:
      '0,7 to 7 dziesiątych, a 0,70 to 70 setnych — a 70 setnych to dokładnie 7 dziesiątych. Zero na końcu tylko wyrównuje zapis.',
  },
  {
    id: 'najmniejsza-z-czterech',
    question: 'Która z liczb jest najmniejsza: 0,8 · 0,08 · 0,801 · 0,18?',
    options: [
      { id: 'a', text: '0,08' },
      { id: 'b', text: '0,18' },
      { id: 'c', text: '0,8' },
      { id: 'd', text: '0,801' },
    ],
    correctId: 'a',
    explanation:
      'Wyrównaj do trzech miejsc: 0,800 · 0,080 · 0,801 · 0,180. Najmniejsza jest 0,08 — w rzędzie dziesiątych ma 0, reszta ma tam 8 lub 1.',
  },
  {
    id: 'co-najpierw',
    question: 'Co robimy najpierw, porównując 5,7 i 5,68?',
    options: [
      { id: 'a', text: 'Porównujemy części całkowite, a potem rzędy po przecinku od lewej' },
      { id: 'b', text: 'Liczymy, ile jest cyfr po przecinku w każdej liczbie' },
      { id: 'c', text: 'Wybieramy tę liczbę, która ma krótszy zapis' },
      { id: 'd', text: 'Wybieramy tę liczbę, która ma dłuższy zapis' },
    ],
    correctId: 'a',
    explanation:
      'Zawsze zaczynamy od części całkowitej. Tu obie to 5, więc idziemy dalej: rząd dziesiątych 7 kontra 6 — i to już rozstrzyga, 5,7 > 5,68.',
  },
  {
    id: 'znak-1230',
    question: 'Który znak jest prawdziwy: 12,3 ___ 12,30?',
    options: [
      { id: 'a', text: '>' },
      { id: 'b', text: '<' },
      { id: 'c', text: '=' },
      { id: 'd', text: 'Żaden — tych liczb nie da się porównać' },
    ],
    correctId: 'c',
    explanation: '12,30 to 12,3 z dopisanym zerem na końcu — ta sama liczba. Między nimi stoi znak =.',
  },
  {
    id: 'bieg-najszybszy',
    question:
      'Bieg na 60 m: Ola 9,8 s, Ala 9,79 s, Ela 9,84 s. Kto był najszybszy, czyli miał najmniejszy czas?',
    options: [
      { id: 'a', text: 'Ola' },
      { id: 'b', text: 'Ala' },
      { id: 'c', text: 'Ela' },
      { id: 'd', text: 'Wszystkie miały ten sam czas' },
    ],
    correctId: 'b',
    explanation:
      'Wyrównaj: 9,80 · 9,79 · 9,84. Najmniejsza liczba to 9,79 — w biegu wygrywa najkrótszy czas, więc najszybsza była Ala.',
  },
];

const CHEAT_SHEET = [
  'Najpierw porównaj części całkowite — większa część całkowita to większa liczba, dalej nie trzeba patrzeć.',
  'Części całkowite równe? Porównuj rzędy po przecinku od lewej: dziesiąte, potem setne, potem tysięczne.',
  'Pierwszy rząd, w którym cyfry się różnią, rozstrzyga — reszty już nie sprawdzasz.',
  'Zanim porównasz, wyrównaj liczbę miejsc po przecinku, dopisując zera na końcu: 0,5 zapisz jako 0,50.',
  'Dopisane zero na końcu części dziesiętnej nie zmienia wartości: 0,5 = 0,50 = 0,500.',
  'Liczba cyfr po przecinku nic nie mówi o wielkości — 0,7 jest większe od 0,45.',
];

const IMAGES = imgMap({
  intro: '/images/matematyka/lekcje/porownywanie-ulamkow-dziesietnych/stoper-i-wstazka-na-biezni.jpg',
  rozgrzewka:
    '/images/matematyka/lekcje/porownywanie-ulamkow-dziesietnych/dziewczynka-uklada-kredki.jpg',
  reguly:
    '/images/matematyka/lekcje/porownywanie-ulamkow-dziesietnych/chlopiec-porownuje-wysokosc-roslin.jpg',
  przyklady:
    '/images/matematyka/lekcje/porownywanie-ulamkow-dziesietnych/dwa-autka-na-linii-mety.jpg',
  cwiczenia:
    '/images/matematyka/lekcje/porownywanie-ulamkow-dziesietnych/dziewczynka-pisze-w-zeszycie.jpg',
  zadanie:
    '/images/matematyka/lekcje/porownywanie-ulamkow-dziesietnych/skocznia-z-choragiewkami.jpg',
});

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function PorownywanieUlamkowDziesietnychLesson({ lesson, mathModule, nextLesson }: LessonProps) {
  return (
    <LessonShell lesson={lesson} mathModule={mathModule} steps={STEPS} nextLesson={nextLesson}>
      <LessonBody color={mathModule.color} />
    </LessonShell>
  );
}

/** Treść lekcji wydzielona z komponentu strony, bo `useStepDone` wymaga kontekstu z `LessonShell`. */
function LessonBody({ color }: { color: string }) {
  const rozgrzewka = useStepDone('rozgrzewka');
  const reguly = useStepDone('reguly');
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
            Co jest większe — <strong>0,45</strong> czy <strong>0,5</strong>? Liczby z przecinkiem
            potrafią oszukać: ta z dłuższym „ogonkiem” cyfr wcale nie musi być większa. Dziś poznasz
            metodę, która działa zawsze: <strong>najpierw część całkowita</strong>, potem rzędy po
            przecinku po kolei od lewej — a zanim zaczniesz, wyrównaj oba zapisy zerami.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {[
              { icon: Layers, text: 'Najpierw część całkowita' },
              { icon: MoveHorizontal, text: 'Wyrównaj przecinki jeden pod drugim' },
              { icon: Plus, text: 'Dopisz zera do równej liczby miejsc' },
              { icon: ScanLine, text: 'Porównuj rzędy od lewej do pierwszej różnicy' },
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
            alt="Srebrny stoper i niebieska rozeta leżące na torze bieżni lekkoatletycznej"
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
          numeral="?"
          kicker="Odkryj kolejność, zanim nazwiemy regułę"
          image={IMAGES.rozgrzewka}
          alt="Dziewczynka z jasnym kucykiem w żółtej bluzce układa kredki na biurku od najkrótszej do najdłuższej"
        >
          Dostajesz liczby z przecinkiem po jednej. Wstawiaj każdą w odpowiednią lukę rosnącej wieży —
          od największej na górze do najmniejszej na dole. Pasek przy każdej liczbie podpowie, czy
          Twoje wyczucie się zgadza.
        </LessonImageCard>
        <DecimalStack color={color} onComplete={rozgrzewka.markStepDone} />
      </LessonSection>

      {/* 2. Nowe pojęcie */}
      <LessonSection id="reguly">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.reguly}
          alt="Chłopiec z ciemnymi kręconymi włosami w czerwonej koszulce przykłada prosty patyk do wierzchołków dwóch doniczkowych roślin, porównując ich wysokość"
        >
          <p>
            Żeby porównać dwie rośliny, ustawiasz je obok siebie i patrzysz od dołu. Z liczbami
            dziesiętnymi jest tak samo: wyrównaj przecinki, dopisz brakujące zera, a potem porównuj
            rzędy od lewej. Zrób te trzy ruchy samodzielnie dla trzech par liczb.
          </p>
        </LessonImageCard>
        <AlignAndScan color={color} onComplete={reguly.markStepDone} />
      </LessonSection>

      {/* 3. Przykłady */}
      <LessonSection id="przyklady">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.przyklady}
          alt="Dwa metalowe autka-zabawki stojące tuż obok siebie przy linii mety narysowanej kredą na drewnianej podłodze"
          lead="Trzy gotowe porównania — po jednym na każdy typowy przypadek."
          reverse
        >
          Raz rozstrzyga część całkowita, raz dopisane zero, a raz dopiero rząd setnych. Zwróć uwagę,
          od czego zaczyna się każde rozwiązanie.
        </LessonImageCard>
        <CompareDecimalSteps color={color} onComplete={przyklady.markStepDone} />
      </LessonSection>

      {/* 4. Ćwiczenia */}
      <LessonSection id="cwiczenia">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.cwiczenia}
          alt="Dziewczynka z brązowymi warkoczami siedzi na podłodze i pisze w otwartym zeszycie, obok leży piórnik"
          reverse
        >
          <p>
            Siedem zadań o rosnącej trudności — porównanie dwóch liczb, wpisanie znaku, wybór
            największej z trzech, porządkowanie i klasyczna pułapka „więcej cyfr = więcej”.
          </p>
        </LessonImageCard>
        <DiagnosticQuiz tasks={buildCompareDrill(color)} color={color} onFinish={cwiczenia.markStepDone} />
      </LessonSection>

      {/* 5. Zadanie problemowe */}
      <LessonSection id="zadanie">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.zadanie}
          alt="Piaszczysta skocznia do skoku w dal na szkolnym boisku, w piasku wetknięte kolorowe chorągiewki w różnych odległościach, obok leżą grabie"
          lead="Pięć skoków, wyniki w metrach do tysięcznych."
        >
          Tabela wyników jest ułożona alfabetycznie, nie według długości skoku — żeby odpowiedzieć na
          pytania, musisz naprawdę porównać liczby.
        </LessonImageCard>
        <LongJumpFinal color={color} onComplete={zadanie.markStepDone} />
      </LessonSection>

      {/* 6. Quiz */}
      <LessonSection id="quiz">
        <LessonQuiz questions={QUIZ} color={color} onFinish={quiz.markStepDone} />
      </LessonSection>

      {/* Ściąga */}
      <section className="border-2 border-dashed p-5 sm:p-6" style={{ borderColor: `${color}59` }}>
        <h2 className="mb-1 text-xl font-bold">Ściąga: porównywanie ułamków dziesiętnych</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Wracaj do niej, gdy w kolejnych lekcjach zaczniesz dodawać i odejmować liczby z przecinkiem.
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
