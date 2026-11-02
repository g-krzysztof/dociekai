'use client';

import Image from 'next/image';
import { Merge, Scale, Split, Wand2 } from 'lucide-react';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';
import { DiagnosticQuiz } from '../../diagnostic-quiz';
import { LessonImageCard } from '../../lesson-image-card';
import { EquivalenceSpotWarmup } from './equivalence-spot-warmup';
import { SplitFoldBoard, type SplitFoldRound } from './split-fold-board';
import { ScaleWorkedExamples } from './scale-worked-examples';
import { MeasureJugLab, type JugRound } from './measure-jug-lab';
import { buildDrillTasks } from './rozszerzanie-skracanie-drill';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

const STEPS: LessonStepMeta[] = [
  {
    id: 'rozgrzewka',
    kind: 'Rozgrzewka',
    title: 'Ten sam kawałek, inna nazwa',
    time: '6 min',
    icon: 'Sparkles',
  },
  {
    id: 'przeksztalcenia',
    kind: 'Nowe pojęcie',
    title: 'Dziel kawałki albo je łącz',
    time: '10 min',
    icon: 'Lightbulb',
  },
  {
    id: 'przyklady',
    kind: 'Przykłady',
    title: 'W obie strony, krok po kroku',
    time: '6 min',
    icon: 'Shapes',
  },
  {
    id: 'cwiczenia',
    kind: 'Ćwiczenia',
    title: 'Rozszerzaj i skracaj samodzielnie',
    time: '8 min',
    icon: 'Target',
  },
  {
    id: 'miarka',
    kind: 'Zadanie problemowe',
    title: 'Miarka, która ma inne kreski',
    time: '7 min',
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

const BOARD_ROUNDS: SplitFoldRound[] = [
  {
    id: 'rozszerz-do-12',
    label: 'Rozszerz ułamek 2/3 tak, żeby jego mianownik wyniósł 12 — dziel kawałki na mniejsze.',
    start: { licznik: 2, mianownik: 3 },
    target: { licznik: 8, mianownik: 12 },
    note: '2/3 = 8/12. Każdy kawałek rozpadł się na cztery mniejsze, więc obie liczby ułamka urosły cztery razy — a zamalowana część paska nie drgnęła ani odrobinę.',
  },
  {
    id: 'skroc-do-4',
    label: 'Teraz w drugą stronę: skróć ułamek 6/8 tak, żeby jego mianownik wyniósł 4 — łącz kawałki.',
    start: { licznik: 6, mianownik: 8 },
    target: { licznik: 3, mianownik: 4 },
    note: '6/8 = 3/4. Kawałki połączyły się w pary, więc obie liczby zmalały dwa razy. Skracanie to po prostu rozszerzanie puszczone od tyłu.',
  },
  {
    id: 'nieskracalna',
    label: 'Doprowadź ułamek 8/12 do postaci nieskracalnej — skracaj tak długo, jak się da.',
    start: { licznik: 8, mianownik: 12 },
    target: { licznik: 2, mianownik: 3 },
    note: '8/12 = 2/3 — czyli wróciłeś dokładnie tam, skąd zaczynaliśmy pierwsze zadanie. 2 i 3 nie mają już wspólnego dzielnika większego od 1, więc dalej połączyć kawałków się nie da: to postać nieskracalna.',
  },
];

const JUG_ROUNDS: JugRound[] = [
  {
    id: 'mleko',
    label:
      'Przepis na naleśniki wymaga 3/4 szklanki mleka. Twoja miarka ma kreski tylko co jedną ósmą szklanki. Przeciągnij poziom mleka dokładnie tam, gdzie trzeba.',
    target: { licznik: 3, mianownik: 4 },
    scale: 8,
    note: 'trzeba było rozszerzyć 3/4 przez 2, żeby tę samą ilość wyrazić ósmymi częściami.',
  },
  {
    id: 'cukier',
    label: 'Ciasto potrzebuje 2/3 szklanki cukru, a druga miarka ma kreski co jedną dwunastą szklanki. Odmierz tyle samo.',
    target: { licznik: 2, mianownik: 3 },
    scale: 12,
    note: '2/3 rozszerzone przez 4 to 8/12 — ta sama ilość, tylko policzona drobniejszymi kawałkami.',
  },
  {
    id: 'olej',
    label: 'Na koniec 1/2 szklanki oleju, a jedyna wolna miarka ma kreski co jedną dziesiątą szklanki.',
    target: { licznik: 1, mianownik: 2 },
    scale: 10,
    note: 'połowa to zawsze dokładnie połowa wszystkich kresek — tutaj 5 z 10.',
  },
];

const QUIZ: QuizQuestion[] = [
  {
    id: 'czym-jest-rozszerzanie',
    question: 'Na czym polega rozszerzanie ułamka?',
    options: [
      { id: 'a', text: 'Mnożymy tylko licznik przez wybraną liczbę' },
      { id: 'b', text: 'Mnożymy tylko mianownik przez wybraną liczbę' },
      { id: 'c', text: 'Mnożymy licznik i mianownik przez tę samą liczbę' },
      { id: 'd', text: 'Dodajemy tę samą liczbę do licznika i do mianownika' },
    ],
    correctId: 'c',
    explanation: 'Tylko pomnożenie obu liczb przez tę samą wartość zostawia ułamek o tej samej wartości — zmienia się jedynie jego nazwa.',
  },
  {
    id: 'rozszerz-do-20',
    question: 'Ile wynosi 3/5 po rozszerzeniu do mianownika 20?',
    options: [
      { id: 'a', text: '12/20' },
      { id: 'b', text: '3/20' },
      { id: 'c', text: '15/20' },
      { id: 'd', text: '8/20' },
    ],
    correctId: 'a',
    explanation: '5 · 4 = 20, więc licznik też mnożymy przez 4: 3 · 4 = 12. Zatem 3/5 = 12/20.',
  },
  {
    id: 'ktory-nieskracalny',
    question: 'Który z tych ułamków jest już w postaci nieskracalnej?',
    options: [
      { id: 'a', text: '4/8' },
      { id: 'b', text: '6/9' },
      { id: 'c', text: '10/12' },
      { id: 'd', text: '5/8' },
    ],
    correctId: 'd',
    explanation: '5 i 8 nie mają wspólnego dzielnika większego od 1. Pozostałe da się skrócić: 4/8 przez 4, 6/9 przez 3, 10/12 przez 2.',
  },
  {
    id: 'co-robi-skracanie',
    question: 'Co dzieje się z wartością ułamka, kiedy go skracasz?',
    options: [
      { id: 'a', text: 'Zmniejsza się, bo obie liczby maleją' },
      { id: 'b', text: 'Nie zmienia się — zmienia się tylko nazwa ułamka' },
      { id: 'c', text: 'Zawsze wychodzi liczba całkowita' },
      { id: 'd', text: 'Zwiększa się, bo kawałki są większe' },
    ],
    correctId: 'b',
    explanation: 'Łączenie kawałków w większe nie zabiera ani nie dokłada niczego — zamalowana część całości zostaje ta sama.',
  },
  {
    id: 'kwadrans',
    question: 'Dlaczego 1/4 godziny to dokładnie 15 minut?',
    options: [
      { id: 'a', text: 'Bo 1/4 = 15/60, a godzina ma 60 minut' },
      { id: 'b', text: 'Bo 15 minut to jedna szesnasta godziny' },
      { id: 'c', text: 'Bo godzina ma 100 minut' },
      { id: 'd', text: 'Bo 4 + 11 daje 15' },
    ],
    correctId: 'a',
    explanation: 'Rozszerzamy 1/4 przez 15: licznik 1 · 15 = 15, mianownik 4 · 15 = 60. Kwadrans to 15 z 60 minut godziny.',
  },
  {
    id: 'skroc-przez-cztery',
    question: 'Ułamek 8/12 skrócono przez 4. Jaki ułamek powstał?',
    options: [
      { id: 'a', text: '4/8' },
      { id: 'b', text: '2/4' },
      { id: 'c', text: '8/3' },
      { id: 'd', text: '2/3' },
    ],
    correctId: 'd',
    explanation: '8 : 4 = 2 i 12 : 4 = 3, więc powstaje 2/3 — i jest to już postać nieskracalna.',
  },
];

const CHEAT_SHEET = [
  'Rozszerzanie: mnożymy licznik i mianownik przez tę samą liczbę — kawałki robią się drobniejsze, ale jest ich odpowiednio więcej.',
  'Skracanie: dzielimy licznik i mianownik przez tę samą liczbę — kawałki łączą się w większe.',
  'Obie operacje zmieniają tylko nazwę ułamka, nigdy jego wartość.',
  'Skrócić można wyłącznie wtedy, gdy OBIE liczby dzielą się przez tę samą liczbę bez reszty.',
  'Postać nieskracalna to taka, w której licznik i mianownik nie mają już wspólnego dzielnika większego od 1.',
  'Rozszerzanie przydaje się, gdy trzeba zapisać ułamek w mianowniku narzuconym z zewnątrz — np. przez podziałkę miarki.',
];

const IMAGES = imgMap({
  intro: '/images/matematyka/lekcje/rozszerzanie-i-skracanie-ulamkow/zlozona-kartka-papieru.jpg',
  rozgrzewka: '/images/matematyka/lekcje/rozszerzanie-i-skracanie-ulamkow/dziewczynka-sklada-kartke.jpg',
  przeksztalcenia: '/images/matematyka/lekcje/rozszerzanie-i-skracanie-ulamkow/mozaika-z-plytek.jpg',
  przyklady: '/images/matematyka/lekcje/rozszerzanie-i-skracanie-ulamkow/chlopiec-z-linijka-i-paskiem-papieru.jpg',
  cwiczenia: '/images/matematyka/lekcje/rozszerzanie-i-skracanie-ulamkow/miarki-kuchenne-na-blacie.jpg',
  miarka: '/images/matematyka/lekcje/rozszerzanie-i-skracanie-ulamkow/dziewczynka-nalewa-mleko.jpg',
});

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function RozszerzanieSkracanieUlamkowLesson({ lesson, mathModule, nextLesson }: LessonProps) {
  return (
    <LessonShell lesson={lesson} mathModule={mathModule} steps={STEPS} nextLesson={nextLesson}>
      <LessonBody color={mathModule.color} />
    </LessonShell>
  );
}

/** Treść lekcji wydzielona z komponentu strony, bo `useStepDone` wymaga kontekstu z `LessonShell`. */
function LessonBody({ color }: { color: string }) {
  const warmUp = useStepDone('rozgrzewka');
  const board = useStepDone('przeksztalcenia');
  const examples = useStepDone('przyklady');
  const drill = useStepDone('cwiczenia');
  const miarka = useStepDone('miarka');
  const quiz = useStepDone('quiz');

  return (
    <>
      {/* Wstęp */}
      <div className="grid items-center gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_240px]">
        <div>
          <p className="mb-4 text-base leading-relaxed sm:text-lg">
            Jedna kartka złożona na pół to dwie połówki. Złóż ją jeszcze raz — masz cztery ćwiartki,
            ale kartki ani przybyło, ani ubyło. Dokładnie to samo robi się z ułamkami:{' '}
            <strong>ten sam kawałek całości można nazwać na wiele sposobów</strong>. W tej lekcji
            nauczysz się przechodzić między tymi nazwami w obie strony — dzieląc kawałki na mniejsze
            albo łącząc je z powrotem w większe.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {[
              { icon: Split, text: 'Rozszerzanie: dziel każdy kawałek' },
              { icon: Merge, text: 'Skracanie: łącz kawałki z powrotem' },
              { icon: Scale, text: 'Wartość ułamka zostaje ta sama' },
              { icon: Wand2, text: 'Postać nieskracalna — koniec skracania' },
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
            alt="Biała kartka papieru złożona kilka razy, z wyraźnymi zagnieceniami dzielącymi ją na coraz mniejsze równe pola"
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
          alt="Dziewczynka o ciemnobrązowych włosach spiętych w kok, w lawendowym swetrze, składająca na pół arkusz papieru przy stole"
          lead="Zanim poznasz nazwy, naucz się to widzieć."
        >
          Pasek wzorcowy i cztery kandydatury pocięte inaczej — tylko jedna zamalowuje dokładnie tyle
          samo. Zaufaj oczom, licz kawałki dopiero potem.
        </LessonImageCard>
        <EquivalenceSpotWarmup color={color} onComplete={warmUp.markStepDone} />
      </LessonSection>

      {/* 2. Nowe pojęcie */}
      <LessonSection id="przeksztalcenia">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.przeksztalcenia}
          alt="Dwa kwadraty tej samej wielkości ułożone z ceramicznych płytek na drewnianym blacie: lewy z czterech dużych płytek, prawy z szesnastu małych"
        >
          <p>
            Ten sam kawałek podłogi można wyłożyć czterema dużymi płytkami albo szesnastoma małymi —
            powierzchnia się nie zmieni. Teraz Ty przekształcasz pasek: przyciski{' '}
            <strong>×</strong> dzielą każdy kawałek na mniejsze, przyciski <strong>÷</strong> łączą
            kawałki z powrotem. Patrz na drugi pasek pod spodem — to on pilnuje, żeby wartość
            została ta sama.
          </p>
        </LessonImageCard>
        <SplitFoldBoard color={color} rounds={BOARD_ROUNDS} onComplete={board.markStepDone} />
      </LessonSection>

      {/* 3. Przykłady */}
      <LessonSection id="przyklady">
        <LessonImageCard
          variant="ghost"
          color={color}
          numeral="2×"
          kicker="Raz w górę, raz w dół"
          image={IMAGES.przyklady}
          alt="Chłopiec o prostych jasnobrązowych włosach w rdzawej bluzie z kapturem, odmierzający linijką równe odcinki na wąskim pasku papieru"
        >
          Dwa gotowe rozwiązania rozpisane krok po kroku: rozszerzanie do narzuconego mianownika i
          skracanie aż do postaci nieskracalnej.
        </LessonImageCard>
        <ScaleWorkedExamples color={color} onComplete={examples.markStepDone} />
      </LessonSection>

      {/* 4. Ćwiczenia */}
      <LessonSection id="cwiczenia">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.cwiczenia}
          alt="Metalowe miarki kuchenne i łyżki miarowe różnej wielkości, ułożone w rzędzie od największej do najmniejszej na jasnym kamiennym blacie"
          reverse
        >
          <p>
            Siedem zadań: znajdź mnożnik, uzupełnij brakującą liczbę, wskaż ułamek równy, skróć,
            rozpoznaj postać nieskracalną i odmierz właściwą ilość.
          </p>
        </LessonImageCard>
        <DiagnosticQuiz tasks={buildDrillTasks(color)} color={color} onFinish={drill.markStepDone} />
      </LessonSection>

      {/* 5. Zadanie problemowe */}
      <LessonSection id="miarka">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.miarka}
          alt="Dziewczynka z blond kucykiem w niebieskim fartuchu przelewająca mleko z małego dzbanuszka do szklanego dzbanka stojącego na kuchennym blacie"
          reverse
          lead="Przepis mówi jedno, a miarka ma zupełnie inne kreski."
        >
          Poziom w miarce zatrzaskuje się tylko na jej własnych kreskach — żeby trafić w ilość z
          przepisu, musisz sam przeliczyć ją na te kreski.
        </LessonImageCard>
        <MeasureJugLab color={color} rounds={JUG_ROUNDS} onComplete={miarka.markStepDone} />
      </LessonSection>

      {/* 6. Quiz */}
      <LessonSection id="quiz">
        <LessonQuiz questions={QUIZ} color={color} onFinish={quiz.markStepDone} />
      </LessonSection>

      {/* Ściąga */}
      <section className="border-2 border-dashed p-5 sm:p-6" style={{ borderColor: `${color}59` }}>
        <h2 className="mb-1 text-xl font-bold">Ściąga: rozszerzanie i skracanie w sześciu zdaniach</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Wracaj do niej, gdy w kolejnej lekcji zaczniesz zamieniać ułamki niewłaściwe na liczby mieszane.
        </p>
        <ol className="divide-y border">
          {CHEAT_SHEET.map((rule, index) => (
            <li key={rule} className="flex items-start gap-4 px-4 py-3">
              <span className="w-6 shrink-0 font-mono text-lg font-bold leading-none tabular-nums" style={{ color }}>
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
