'use client';

import Image from 'next/image';
import { Divide, HelpCircle, Slice, Users } from 'lucide-react';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';
import { DiagnosticQuiz } from '../../diagnostic-quiz';
import { LessonImageCard } from '../../lesson-image-card';
import { EvenShareWarmup } from './even-share-warmup';
import { ShareOutTable, type ShareRound } from './share-out-table';
import { DivisionWorkedExamples } from './division-worked-examples';
import { RemainderSwitch, type SwitchRound } from './remainder-switch';
import { buildDrillTasks } from './dzielenie-ulamek-drill';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

const STEPS: LessonStepMeta[] = [
  {
    id: 'rozgrzewka',
    kind: 'Rozgrzewka',
    title: 'Co zrobić z resztą?',
    time: '6 min',
    icon: 'Sparkles',
  },
  {
    id: 'podzial',
    kind: 'Nowe pojęcie',
    title: 'Kroisz sam — i sprawdzasz, czy się rozejdzie',
    time: '10 min',
    icon: 'Lightbulb',
  },
  {
    id: 'przyklady',
    kind: 'Przykłady',
    title: 'Dwa podziały krok po kroku',
    time: '6 min',
    icon: 'Shapes',
  },
  {
    id: 'cwiczenia',
    kind: 'Ćwiczenia',
    title: 'Dzielenie zapisane ułamkiem',
    time: '8 min',
    icon: 'Target',
  },
  {
    id: 'decyzja',
    kind: 'Zadanie problemowe',
    title: 'Ten sam rachunek, trzy różne odpowiedzi',
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

const SHARE_ROUNDS: ShareRound[] = [
  {
    id: 'czekolady-3-4',
    items: 3,
    people: 4,
    itemsLabel: '3 czekolady',
    cutQuestion: 'Na ile równych części pokroić każdą czekoladę?',
    label:
      'Trzy jednakowe czekolady trzeba rozdzielić sprawiedliwie między 4 osoby. Najpierw zdecyduj, na ile równych części pokroić każdą czekoladę — dopiero potem rozdawaj.',
    cutOptions: [3, 4, 6, 8],
    note: 'Każda osoba dostała tyle samo z każdej z trzech czekolad, czyli 3/4 czekolady. Właśnie dlatego 3 : 4 zapisujemy po prostu jako 3/4 — dzielna idzie do licznika, dzielnik do mianownika.',
  },
  {
    id: 'pizze-5-2',
    items: 5,
    people: 2,
    itemsLabel: '5 pizz',
    cutQuestion: 'Na ile równych części pokroić każdą pizzę?',
    label: 'Pięć pizz dla 2 osób. Ta sama decyzja: na ile części pokroić każdą pizzę, żeby dało się rozdać po równo?',
    cutOptions: [2, 3, 4, 5],
    note: '5 : 2 = 5/2. Ułamek wyszedł niewłaściwy, bo każda osoba dostała więcej niż jedną całą pizzę — czytamy go jako 2 1/2 pizzy.',
  },
  {
    id: 'wstazki-2-3',
    items: 2,
    people: 3,
    itemsLabel: '2 wstążki',
    cutQuestion: 'Na ile równych części pociąć każdą wstążkę?',
    label: 'Na koniec dwie jednakowe wstążki dla 3 osób. Sprawdź też, co się stanie, gdy pokroisz drobniej, niż trzeba.',
    cutOptions: [2, 3, 4, 6],
    note: '2 : 3 = 2/3 wstążki. Pokrojenie na 6 części daje ten sam wynik zapisany jako 4/6 — to znajomy ułamek równy z poprzedniej lekcji, tylko drobniej pocięty.',
  },
];

const SWITCH_ROUNDS: SwitchRound[] = [
  {
    id: 'wstazka',
    story: 'Siedem metrów wstążki trzeba rozciąć na 2 jednakowe kawałki na dwa prezenty. Wstążkę można ciąć w dowolnym miejscu.',
    question: 'Ile metrów wstążki pójdzie na jeden prezent?',
    dividend: 7,
    divisor: 2,
    correct: 'ulamek',
    units: { reszta: 'metry', ulamek: 'metra', wgore: 'metry' },
    explanation:
      'Wstążkę wolno rozciąć w dowolnym miejscu, więc reszta nie musi zostać resztą — dokrawamy ją i wychodzi 3 1/2 metra. To jest właśnie ten przypadek, w którym dzielenie kończy się ułamkiem.',
  },
  {
    id: 'pudelka',
    story: 'Siedem szklanych kul do zapakowania. Do jednego pudełka mieszczą się dokładnie 2 kule, a pudełko musi być pełne, żeby kule się nie tłukły.',
    question: 'Ile pełnych pudełek uda się zapakować?',
    dividend: 7,
    divisor: 2,
    correct: 'reszta',
    units: { reszta: 'pudełka', ulamek: 'pudełka', wgore: 'pudełka' },
    explanation:
      'Kuli nie da się przekroić na pół, a pudełko musi być pełne — więc powstaną 3 pełne pudełka, a jedna kula zostanie. Tutaj reszta naprawdę zostaje resztą.',
  },
  {
    id: 'autokary',
    story: 'Na wycieczkę jedzie 7 grup po jednym opiekunie. Do jednego busa wchodzą 2 grupy i żadna grupa nie może zostać w szkole.',
    question: 'Ile busów trzeba zamówić?',
    dividend: 7,
    divisor: 2,
    correct: 'wgore',
    units: { reszta: 'busy', ulamek: 'busa', wgore: 'busy' },
    explanation:
      'Trzy busy zabiorą 6 grup, a siódma musi czymś pojechać — więc bus trzeba zamówić jeszcze jeden, choć pojedzie w nim tylko jedna grupa. Zaokrąglamy w górę do 4.',
  },
];

const QUIZ: QuizQuestion[] = [
  {
    id: 'kreska-to-dzielenie',
    question: 'Co oznacza kreska ułamkowa w zapisie 5/6?',
    options: [
      { id: 'a', text: 'Odejmowanie: 6 − 5' },
      { id: 'b', text: 'Dodawanie: 5 + 6' },
      { id: 'c', text: 'Dzielenie: 5 : 6' },
      { id: 'd', text: 'Mnożenie: 5 · 6' },
    ],
    correctId: 'c',
    explanation: 'Kreska ułamkowa to inny sposób zapisania znaku dzielenia. Licznik jest dzielną, mianownik dzielnikiem.',
  },
  {
    id: 'zapisz-4-7',
    question: 'Cztery jednakowe ciasta rozdzielono równo między 7 osób. Ile ciasta dostała jedna osoba?',
    options: [
      { id: 'a', text: '4/7 ciasta' },
      { id: 'b', text: '7/4 ciasta' },
      { id: 'c', text: '11/7 ciasta' },
      { id: 'd', text: '3/7 ciasta' },
    ],
    correctId: 'a',
    explanation: '4 : 7 = 4/7. Każde ciasto kroimy na 7 części i każdy bierze po jednym kawałku z każdego ciasta.',
  },
  {
    id: 'ktore-dzielenie',
    question: 'Ułamek 11/3 jest wynikiem którego dzielenia?',
    options: [
      { id: 'a', text: '3 : 11' },
      { id: 'b', text: '11 : 3' },
      { id: 'c', text: '11 : 11' },
      { id: 'd', text: '33 : 3' },
    ],
    correctId: 'b',
    explanation: 'Licznik to dzielna, mianownik to dzielnik, więc 11/3 = 11 : 3. Po zamianie na liczbę mieszaną: 3 2/3.',
  },
  {
    id: 'na-ile-krojic',
    question: 'Dzielisz 3 jednakowe placki między 5 osób. Na ile równych części najprościej pokroić każdy placek?',
    options: [
      { id: 'a', text: 'Na 3 części' },
      { id: 'b', text: 'Na 8 części' },
      { id: 'c', text: 'Na 2 części' },
      { id: 'd', text: 'Na 5 części — tyle, ile jest osób' },
    ],
    correctId: 'd',
    explanation: 'Krojąc każdy placek na tyle części, ile jest osób, każdy bierze po jednym kawałku z każdego placka. Wychodzi 3/5 placka.',
  },
  {
    id: 'wychodzi-calkowita',
    question: 'Ile wynosi 8 : 4 zapisane jako ułamek?',
    options: [
      { id: 'a', text: '4/8, czyli 1/2' },
      { id: 'b', text: '8/4, czyli 2' },
      { id: 'c', text: '8/4, czyli 4' },
      { id: 'd', text: 'Takiego dzielenia nie zapisuje się ułamkiem' },
    ],
    correctId: 'b',
    explanation: 'Ułamkiem zapisujemy każde dzielenie, także takie, które wychodzi równo. 8/4 skraca się do 2.',
  },
  {
    id: 'reszta-czy-ulamek',
    question: 'Kiedy resztę z dzielenia zostawiamy resztą, zamiast zamieniać ją na ułamek?',
    options: [
      { id: 'a', text: 'Zawsze — reszty nigdy nie zamienia się na ułamek' },
      { id: 'b', text: 'Nigdy — reszty zawsze zamienia się na ułamek' },
      { id: 'c', text: 'Gdy dzielimy przez liczbę większą od 10' },
      { id: 'd', text: 'Gdy tego, co dzielimy, nie da się pokroić — na przykład ludzi albo szklanych kul' },
    ],
    correctId: 'd',
    explanation: 'O tym decyduje treść zadania, nie rachunek. Wstążkę można dokroić, kuli albo osoby — nie.',
  },
];

const CHEAT_SHEET = [
  'Kreska ułamkowa znaczy to samo, co znak dzielenia: a : b = a/b.',
  'Licznik to dzielna, mianownik to dzielnik — kolejność nigdy się nie odwraca.',
  'Żeby rozdać a przedmiotów między b osób, kroi się każdy przedmiot na b równych części.',
  'Każdy dostaje wtedy po jednym kawałku z każdego przedmiotu, czyli a części po 1/b.',
  'Gdy dzielna jest większa od dzielnika, wychodzi ułamek niewłaściwy — warto go przeczytać jako liczbę mieszaną.',
  'To, czy resztę dokrawamy, zostawiamy resztą, czy zaokrąglamy w górę, rozstrzyga treść zadania, a nie rachunek.',
];

const IMAGES = imgMap({
  intro: '/images/matematyka/lekcje/ulamek-jako-wynik-dzielenia/czekolady-i-cztery-talerze.jpg',
  rozgrzewka: '/images/matematyka/lekcje/ulamek-jako-wynik-dzielenia/kanapki-na-desce.jpg',
  podzial: '/images/matematyka/lekcje/ulamek-jako-wynik-dzielenia/chlopiec-kroi-ciasto-na-czesci.jpg',
  przyklady: '/images/matematyka/lekcje/ulamek-jako-wynik-dzielenia/bagietki-przekrojone-na-pol.jpg',
  cwiczenia: '/images/matematyka/lekcje/ulamek-jako-wynik-dzielenia/dziewczynka-rozdaje-talerze.jpg',
  decyzja: '/images/matematyka/lekcje/ulamek-jako-wynik-dzielenia/wstazka-nozyczki-i-pudelka.jpg',
});

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function UlamekJakoWynikDzieleniaLesson({ lesson, mathModule, nextLesson }: LessonProps) {
  return (
    <LessonShell lesson={lesson} mathModule={mathModule} steps={STEPS} nextLesson={nextLesson}>
      <LessonBody color={mathModule.color} />
    </LessonShell>
  );
}

/** Treść lekcji wydzielona z komponentu strony, bo `useStepDone` wymaga kontekstu z `LessonShell`. */
function LessonBody({ color }: { color: string }) {
  const warmUp = useStepDone('rozgrzewka');
  const share = useStepDone('podzial');
  const examples = useStepDone('przyklady');
  const drill = useStepDone('cwiczenia');
  const decision = useStepDone('decyzja');
  const quiz = useStepDone('quiz');

  return (
    <>
      {/* Wstęp */}
      <div className="grid items-center gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_240px]">
        <div>
          <p className="mb-4 text-base leading-relaxed sm:text-lg">
            Trzy czekolady, cztery osoby. Dzielenie 3 : 4 w liczbach naturalnych kończy się smutno:
            zero całych i reszta 3. Ale czekoladę przecież <strong>można przekroić</strong> — i wtedy
            każdy dostaje po 3/4 tabliczki. Okazuje się, że kreska ułamkowa to po prostu inny sposób
            zapisania znaku dzielenia, a każdy ułamek jest wynikiem jakiegoś podziału.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {[
              { icon: Divide, text: 'a : b = a/b — ten sam zapis' },
              { icon: Slice, text: 'Kroimy na tyle części, ile jest osób' },
              { icon: Users, text: 'Każdy bierze po kawałku z każdego' },
              { icon: HelpCircle, text: 'Co zrobić z resztą? Zależy od zadania' },
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
            alt="Trzy tabliczki czekolady leżące obok czterech pustych, białych talerzyków ustawionych w rzędzie"
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
          alt="Kanapki ułożone jedna za drugą na drewnianej desce do krojenia, obok leży nóż kuchenny"
        >
          <p>
            Wróćmy na chwilę do dzielenia z resztą, ale patrz tym razem <strong>na resztę</strong>, a
            nie na iloraz. Cztery sytuacje, w których reszta robi się coraz bardziej kłopotliwa — aż
            do takiej, gdzie nikt nie dostaje ani jednej całej sztuki.
          </p>
        </LessonImageCard>
        <EvenShareWarmup color={color} onComplete={warmUp.markStepDone} />
      </LessonSection>

      {/* 2. Nowe pojęcie */}
      <LessonSection id="podzial">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.podzial}
          alt="Chłopiec o falowanych ciemnych włosach w szarej koszulce, krojący nożem okrągłe ciasto na równe części przy kuchennym stole"
          lead="Najpierw decyzja, potem podział."
        >
          To Ty wybierasz, na ile części pokroić każdą sztukę. Jeśli wybierzesz źle, kawałki nie
          rozejdą się po równo — i widżet powie Ci dokładnie dlaczego.
        </LessonImageCard>
        <ShareOutTable color={color} rounds={SHARE_ROUNDS} onComplete={share.markStepDone} />
      </LessonSection>

      {/* 3. Przykłady */}
      <LessonSection id="przyklady">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.przyklady}
          alt="Cztery bagietki ułożone obok siebie na lnianej ściereczce, dwie z nich przekrojone wzdłuż na pół"
          reverse
        >
          <p>
            Dwa gotowe rozwiązania: jedno, w którym każdy dostaje mniej niż całość, i drugie, w
            którym starcza na kilka całości i jeszcze zostaje.
          </p>
        </LessonImageCard>
        <DivisionWorkedExamples color={color} onComplete={examples.markStepDone} />
      </LessonSection>

      {/* 4. Ćwiczenia */}
      <LessonSection id="cwiczenia">
        <LessonImageCard
          variant="ghost"
          color={color}
          numeral=":"
          kicker="Siedem zadań"
          image={IMAGES.cwiczenia}
          alt="Dziewczynka o brązowych włosach spiętych w kok, w turkusowym swetrze rozpinanym, rozstawiająca talerzyki wokół okrągłego stołu"
        >
          Zapisz dzielenie ułamkiem i ułamek dzieleniem, odczytaj porcję z rysunku, sprawdź przypadek
          wychodzący równo i porównaj dwa różne podziały.
        </LessonImageCard>
        <DiagnosticQuiz tasks={buildDrillTasks(color)} color={color} onFinish={drill.markStepDone} />
      </LessonSection>

      {/* 5. Zadanie problemowe */}
      <LessonSection id="decyzja">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.decyzja}
          alt="Zwinięta wstążka, nożyczki i dwa małe kartonowe pudełka leżące razem na jasnym drewnianym blacie"
          reverse
          lead="Rachunek ten sam, a odpowiedzi trzy — i wszystkie policzone poprawnie."
        >
          Za każdym razem dzielisz te same liczby. O tym, która odpowiedź jest właściwa, decyduje
          wyłącznie to, czy dzieloną rzecz da się przekroić — i po co w ogóle liczymy.
        </LessonImageCard>
        <RemainderSwitch color={color} rounds={SWITCH_ROUNDS} onComplete={decision.markStepDone} />
      </LessonSection>

      {/* 6. Quiz */}
      <LessonSection id="quiz">
        <LessonQuiz questions={QUIZ} color={color} onFinish={quiz.markStepDone} />
      </LessonSection>

      {/* Ściąga */}
      <section className="border-2 border-dashed p-5 sm:p-6" style={{ borderColor: `${color}59` }}>
        <h2 className="mb-1 text-xl font-bold">Ściąga: ułamek jako wynik dzielenia w sześciu zdaniach</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Wracaj do niej, gdy w kolejnej lekcji zaczniesz dodawać i odejmować ułamki o jednakowych mianownikach.
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
