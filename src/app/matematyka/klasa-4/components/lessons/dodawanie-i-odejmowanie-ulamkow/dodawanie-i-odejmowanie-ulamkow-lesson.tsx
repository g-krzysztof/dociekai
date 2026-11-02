'use client';

import Image from 'next/image';
import { Layers, Lock, Minus, Plus } from 'lucide-react';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';
import { DiagnosticQuiz } from '../../diagnostic-quiz';
import { LessonImageCard } from '../../lesson-image-card';
import { SamePieceWarmup } from './same-piece-warmup';
import { FractionStepTrack, type TrackRound } from './fraction-step-track';
import { SumWorkedExamples } from './sum-worked-examples';
import { SumMistakeAudit, type AuditRound } from './sum-mistake-audit';
import { buildSumDrillTasks } from './dodawanie-ulamkow-drill';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

const STEPS: LessonStepMeta[] = [
  {
    id: 'rozgrzewka',
    kind: 'Rozgrzewka',
    title: 'Kawałki tej samej wielkości po prostu się liczy',
    time: '6 min',
    icon: 'Sparkles',
  },
  {
    id: 'przesuwanie',
    kind: 'Nowe pojęcie',
    title: 'Przesuwasz krawędź — działanie zapisuje się samo',
    time: '10 min',
    icon: 'Lightbulb',
  },
  {
    id: 'przyklady',
    kind: 'Przykłady',
    title: 'Trzy działania krok po kroku',
    time: '7 min',
    icon: 'Shapes',
  },
  {
    id: 'cwiczenia',
    kind: 'Ćwiczenia',
    title: 'Dodawanie i odejmowanie na jednym mianowniku',
    time: '8 min',
    icon: 'Target',
  },
  {
    id: 'audyt',
    kind: 'Zadanie problemowe',
    title: 'Trzy cudze zeszyty, trzy błędy do znalezienia',
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

const TRACK_ROUNDS: TrackRound[] = [
  {
    id: 'dojedz-do-pieciu-szostych',
    mianownik: 6,
    start: 2,
    target: 5,
    label:
      'Pasek jest podzielony na 6 równych części, a zamalowane są 2 z nich. Przeciągnij krawędź tak, żeby zamalowanych było 5 kawałków.',
    note: 'Krawędź pojechała o 3 kreski w prawo, a widżet zapisał to jako 2/6 + 3/6 = 5/6. Liczba kresek na pasku ani drgnęła — mianownik został ten sam.',
  },
  {
    id: 'zabierz-trzy-osme',
    mianownik: 8,
    start: 7,
    target: 4,
    label:
      'Teraz w drugą stronę. Pasek to tort pokrojony na 8 kawałków, z których zostało 7. Zabierz z niego 3 kawałki.',
    note: 'Ruch w lewo to odejmowanie: 7/8 − 3/8 = 4/8. Reguła jest dokładnie ta sama — zmienia się wyłącznie licznik, bo kawałki mają stale tę samą wielkość.',
  },
  {
    id: 'do-samego-konca',
    mianownik: 10,
    start: 1,
    target: 10,
    label: 'Ostatnia runda: zacznij od 1/10 i dojedź krawędzią do samego końca paska.',
    note: '1/10 + 9/10 = 10/10, a 10 kawałków po jednej dziesiątej to cały pasek, czyli 1. Kiedy licznik dorówna mianownikowi, kawałki składają się z powrotem w całość.',
  },
];

const AUDIT_ROUNDS: AuditRound[] = [
  {
    id: 'dodany-mianownik',
    who: 'Zeszyt Zosi',
    story: 'Zosia liczyła, jaką część tortu zjedli razem z bratem: ona 2/9, on 5/9. Wynik wyszedł jej mniejszy niż to, co zjadła sama — coś tu nie gra.',
    lines: ['2/9 + 5/9', 'liczniki: 2 + 5 = 7', 'mianowniki: 9 + 9 = 18', 'wynik: 7/18'],
    wrongIndex: 2,
    hint: 'Ta linijka jest w porządku — liczniki naprawdę się dodaje. Poszukaj wiersza, w którym Zosia zrobiła coś z mianownikami.',
    fixPrompt: 'Jaki mianownik powinien mieć wynik? Wpisz samą liczbę.',
    answer: '9',
    note:
      'Mianownik mówi, jak duże są kawałki. Zosia nie pokroiła tortu drugi raz, więc kawałki dalej są dziewiątymi częściami: 2/9 + 5/9 = 7/9. Dodanie mianowników zmniejszyło kawałki, dlatego wynik wyszedł absurdalnie mały.',
  },
  {
    id: 'niewlasciwy-w-mieszanej',
    who: 'Zeszyt Bartka',
    story: 'Bartek dodawał wodę z dwóch bidonów: 2 3/8 litra i 1 6/8 litra. Rachunki ma dobre, ale ostatnia linijka wygląda dziwnie.',
    lines: ['2 3/8 + 1 6/8', 'całości: 2 + 1 = 3', 'kawałki: 3/8 + 6/8 = 9/8', 'wynik: 3 9/8'],
    wrongIndex: 3,
    hint: 'Ta linijka jest policzona poprawnie. Zastanów się raczej, czy tak zapisany wynik w ogóle wolno zostawić.',
    fixPrompt: 'Ile pełnych całości ma poprawnie zapisany wynik? Wpisz samą liczbę.',
    answer: '4',
    note:
      'W liczbie mieszanej reszta musi być mniejsza od mianownika, a 9/8 to więcej niż całość. 9/8 = 1 1/8, więc tę jedną całość dokładamy do trójki: poprawny wynik to 4 1/8 litra.',
  },
  {
    id: 'rozne-mianowniki',
    who: 'Zeszyt Oli',
    story: 'Ola liczyła, ile mleka wlała razem do miski: najpierw 1/2 szklanki, potem 1/4 szklanki. Wyszło jej mniej niż pół szklanki.',
    lines: [
      'Ola dolewa 1/2 szklanki i 1/4 szklanki.',
      'Kawałki 1/2 i 1/4 są tej samej wielkości, więc można je zliczyć razem.',
      '1 + 1 = 2 kawałki, 2 + 4 = 6 części',
      'wynik: 2/6 szklanki',
    ],
    wrongIndex: 1,
    hint: 'Ta linijka jest tylko konsekwencją wcześniejszej pomyłki. Poszukaj zdania, które w ogóle nie jest prawdą.',
    fixPrompt: 'Żeby dało się to policzyć, trzeba najpierw rozszerzyć 1/2 do czwartych części. Ile to czwartych części? Wpisz sam licznik.',
    answer: '2',
    note:
      'Połowa i ćwiartka to kawałki różnej wielkości, więc reguła z tej lekcji tu nie działa. Ale 1/2 = 2/4 — po rozszerzeniu mianowniki są już jednakowe i wychodzi 2/4 + 1/4 = 3/4 szklanki. Czasem wystarczy najpierw doprowadzić kawałki do jednego rozmiaru.',
  },
];

const QUIZ: QuizQuestion[] = [
  {
    id: 'co-z-mianownikiem',
    question: 'Co dzieje się z mianownikiem, gdy dodajesz ułamki o jednakowych mianownikach?',
    options: [
      { id: 'a', text: 'Podwaja się' },
      { id: 'b', text: 'Też się dodaje' },
      { id: 'c', text: 'Zostaje bez zmian' },
      { id: 'd', text: 'Zmniejsza się o jeden' },
    ],
    correctId: 'c',
    explanation: 'Mianownik opisuje wielkość kawałka, a liczenie kawałków nie zmienia ich rozmiaru — więc przepisujemy go bez zmian.',
  },
  {
    id: 'oblicz-2-11',
    question: 'Ile wynosi 2/11 + 6/11?',
    options: [
      { id: 'a', text: '8/11' },
      { id: 'b', text: '8/22' },
      { id: 'c', text: '12/11' },
      { id: 'd', text: '4/11' },
    ],
    correctId: 'a',
    explanation: '2 + 6 = 8, mianownik zostaje 11. Odpowiedź 8/22 to typowa pomyłka — dodany również mianownik.',
  },
  {
    id: 'kiedy-nie-wolno',
    question: 'Kiedy NIE wolno po prostu dodać liczników?',
    options: [
      { id: 'a', text: 'Gdy liczniki są większe od 5' },
      { id: 'b', text: 'Gdy wynik przekroczy całość' },
      { id: 'c', text: 'Gdy jeden z ułamków jest niewłaściwy' },
      { id: 'd', text: 'Gdy mianowniki są różne — kawałki mają wtedy różną wielkość' },
    ],
    correctId: 'd',
    explanation: 'Reguła „dodaj liczniki” działa tylko dla kawałków tej samej wielkości. Przy różnych mianownikach trzeba je najpierw do siebie doprowadzić.',
  },
  {
    id: 'przekroczyc-calosc',
    question: 'Ile wynosi 4/6 + 5/6?',
    options: [
      { id: 'a', text: '9/12' },
      { id: 'b', text: '9/6' },
      { id: 'c', text: '1/6' },
      { id: 'd', text: '20/6' },
    ],
    correctId: 'b',
    explanation: '4 + 5 = 9, więc wynik to 9/6. Jest to ułamek niewłaściwy — czytamy go jako 1 3/6, czyli półtorej całości.',
  },
  {
    id: 'liczby-mieszane-quiz',
    question: 'Ile wynosi 1 2/7 + 3 4/7?',
    options: [
      { id: 'a', text: '4 6/7' },
      { id: 'b', text: '4 6/14' },
      { id: 'c', text: '3 6/7' },
      { id: 'd', text: '5 6/7' },
    ],
    correctId: 'a',
    explanation: 'Całości do całości: 1 + 3 = 4. Kawałki do kawałków: 2/7 + 4/7 = 6/7. Razem 4 6/7.',
  },
  {
    id: 'ile-dosypac',
    question: 'W przepisie jest 5/8 szklanki cukru, a Ty wsypałeś już 2/8 szklanki. Ile jeszcze trzeba dosypać?',
    options: [
      { id: 'a', text: '7/8 szklanki' },
      { id: 'b', text: '3/16 szklanki' },
      { id: 'c', text: '2/8 szklanki' },
      { id: 'd', text: '3/8 szklanki' },
    ],
    correctId: 'd',
    explanation: 'To odejmowanie na jednakowym mianowniku: 5/8 − 2/8 = 3/8 szklanki.',
  },
];

const CHEAT_SHEET = [
  'Dodawać i odejmować wprost wolno tylko ułamki o jednakowych mianownikach — kawałki muszą być tej samej wielkości.',
  'Dodajesz albo odejmujesz same liczniki, a mianownik przepisujesz bez zmian.',
  'Mianownik mówi, jak duże są kawałki — samo ich liczenie nigdy ich nie powiększa ani nie pomniejsza.',
  'Gdy licznik dorówna mianownikowi, zebrała się cała całość (4/4 = 1); gdy go przekroczy, wynik jest ułamkiem niewłaściwym.',
  'Liczby mieszane dodajesz osobno: całości do całości, kawałki do kawałków — a złożoną z kawałków całość dokładasz do części całkowitej.',
  'Wynik wolno na końcu skrócić: 3/6 to ten sam ułamek co 1/2.',
];

const IMAGES = imgMap({
  intro: '/images/matematyka/lekcje/dodawanie-i-odejmowanie-ulamkow/dwa-kawalki-ciasta-na-talerzu.jpg',
  rozgrzewka: '/images/matematyka/lekcje/dodawanie-i-odejmowanie-ulamkow/tabliczka-czekolady-i-nadlamane-kostki.jpg',
  przesuwanie: '/images/matematyka/lekcje/dodawanie-i-odejmowanie-ulamkow/chlopiec-uklada-paski-papieru.jpg',
  przyklady: '/images/matematyka/lekcje/dodawanie-i-odejmowanie-ulamkow/blacha-ciasta-i-butelka-soku.jpg',
  cwiczenia: '/images/matematyka/lekcje/dodawanie-i-odejmowanie-ulamkow/dziewczynka-liczy-kawalki-pizzy.jpg',
  audyt: '/images/matematyka/lekcje/dodawanie-i-odejmowanie-ulamkow/zeszyt-w-kratke-z-olowkiem-i-gumka.jpg',
});

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function DodawanieIOdejmowanieUlamkowLesson({ lesson, mathModule, nextLesson }: LessonProps) {
  return (
    <LessonShell lesson={lesson} mathModule={mathModule} steps={STEPS} nextLesson={nextLesson}>
      <LessonBody color={mathModule.color} />
    </LessonShell>
  );
}

/** Treść lekcji wydzielona z komponentu strony, bo `useStepDone` wymaga kontekstu z `LessonShell`. */
function LessonBody({ color }: { color: string }) {
  const warmUp = useStepDone('rozgrzewka');
  const track = useStepDone('przesuwanie');
  const examples = useStepDone('przyklady');
  const drill = useStepDone('cwiczenia');
  const audit = useStepDone('audyt');
  const quiz = useStepDone('quiz');

  return (
    <>
      {/* Wstęp */}
      <div className="grid items-center gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_240px]">
        <div>
          <p className="mb-4 text-base leading-relaxed sm:text-lg">
            Dwa kawałki ciasta i trzy kawałki ciasta to pięć kawałków ciasta — pod warunkiem, że
            wszystkie są <strong>tej samej wielkości</strong>. Cała ta lekcja mieści się w tym jednym
            zdaniu: gdy mianowniki są jednakowe, dodajesz i odejmujesz same liczniki, a mianownik
            przepisujesz bez zmian. Bo kawałków się nie przekrawa — tylko je liczy.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {[
              { icon: Plus, text: 'Dodajesz liczniki, mianownik zostaje' },
              { icon: Minus, text: 'Odejmowanie działa tak samo' },
              { icon: Lock, text: 'Mianownik ustala wielkość kawałka' },
              { icon: Layers, text: 'Liczby mieszane: całości osobno, kawałki osobno' },
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
            alt="Biały talerz z dwoma kawałkami biszkoptowego ciasta posypanego cukrem pudrem, ustawiony na jasnym drewnianym blacie"
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
          alt="Tabliczka czekolady z odłamanymi kostkami leżąca na papierze śniadaniowym"
        >
          <p>
            Cztery sceny, w których nie liczy się ułamków, tylko zwyczajne kawałki. Trzy pierwsze
            wychodzą same z siebie — czwarta celowo się nie udaje i to ona ustawia warunek całej
            lekcji.
          </p>
        </LessonImageCard>
        <SamePieceWarmup color={color} onComplete={warmUp.markStepDone} />
      </LessonSection>

      {/* 2. Nowe pojęcie */}
      <LessonSection id="przesuwanie">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.przesuwanie}
          alt="Chłopiec o krótkich, jasnoblond włosach w zielonej bluzie z kapturem, układający na stole rzędy jednakowych prostokątnych kartoników z papieru"
          lead="Ty przesuwasz, widżet pisze działanie."
        >
          Krawędź zamalowania zatrzymuje się wyłącznie na kreskach podziału, więc mianownika po
          prostu nie da się ruszyć. Każdy Twój ruch dopisuje się pod paskiem jako gotowe działanie.
        </LessonImageCard>
        <FractionStepTrack color={color} rounds={TRACK_ROUNDS} onComplete={track.markStepDone} />
      </LessonSection>

      {/* 3. Przykłady */}
      <LessonSection id="przyklady">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.przyklady}
          alt="Blacha ciasta pokrojonego w prostokątne kawałki i szklana butelka soku stojąca obok"
          reverse
        >
          <p>
            Trzy rozwiązania rozpisane krok po kroku: zwykłe dodawanie, odejmowanie z wynikiem, który
            da się jeszcze skrócić, oraz dodawanie liczb mieszanych. Rysunek składników stoi nad
            przyciskiem — spróbuj najpierw samodzielnie.
          </p>
        </LessonImageCard>
        <SumWorkedExamples color={color} onComplete={examples.markStepDone} />
      </LessonSection>

      {/* 4. Ćwiczenia */}
      <LessonSection id="cwiczenia">
        <LessonImageCard
          variant="ghost"
          color={color}
          numeral="+"
          kicker="Siedem zadań"
          image={IMAGES.cwiczenia}
          alt="Dziewczynka o rudych włosach związanych w dwa kucyki, w żółtej koszulce, wskazująca palcem kawałki pizzy na blasze"
        >
          Policz sumy i różnice na jednym mianowniku, odczytaj wynik z rysunku, sprawdź przypadek
          przekraczający całość i przejdź przez zadanie z dwoma ruchami po kolei.
        </LessonImageCard>
        <DiagnosticQuiz tasks={buildSumDrillTasks(color)} color={color} onFinish={drill.markStepDone} />
      </LessonSection>

      {/* 5. Zadanie problemowe */}
      <LessonSection id="audyt">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.audyt}
          alt="Otwarty zeszyt w kratkę z ołówkiem i gumką leżącymi na pustej stronie"
          reverse
          lead="Rachunek jest już zrobiony — Twoim zadaniem jest znaleźć, gdzie się wykoleił."
        >
          Trzy cudze zeszyty, trzy różne pomyłki. Najpierw wskaż linijkę, w której coś poszło nie
          tak, potem dopisz poprawkę. Kliknięcie w dobrą linijkę niczego nie psuje.
        </LessonImageCard>
        <SumMistakeAudit color={color} rounds={AUDIT_ROUNDS} onComplete={audit.markStepDone} />
      </LessonSection>

      {/* 6. Quiz */}
      <LessonSection id="quiz">
        <LessonQuiz questions={QUIZ} color={color} onFinish={quiz.markStepDone} />
      </LessonSection>

      {/* Ściąga */}
      <section className="border-2 border-dashed p-5 sm:p-6" style={{ borderColor: `${color}59` }}>
        <h2 className="mb-1 text-xl font-bold">Ściąga: dodawanie i odejmowanie ułamków w sześciu zdaniach</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Wracaj do niej, gdy w kolejnej lekcji zaczniesz mnożyć ułamek przez liczbę naturalną.
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
