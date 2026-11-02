'use client';

import Image from 'next/image';
import { Cake, Equal, Ruler, Scissors } from 'lucide-react';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';
import { DiagnosticQuiz } from '../../diagnostic-quiz';
import { LessonImageCard } from '../../lesson-image-card';
import { SliceTrailLab } from './slice-trail-lab';
import { FractionDuel, type DuelRound } from './fraction-duel';
import { CompareWorkedExamples } from './compare-worked-examples';
import { buildDrillTasks } from './porownywanie-ulamkow-drill';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

const STEPS: LessonStepMeta[] = [
  {
    id: 'rozgrzewka',
    kind: 'Rozgrzewka',
    title: 'Ilu gości, taki kawałek',
    time: '8 min',
    icon: 'Sparkles',
  },
  {
    id: 'reguly',
    kind: 'Nowe pojęcie',
    title: 'Dwie reguły porównywania',
    time: '10 min',
    icon: 'Lightbulb',
  },
  {
    id: 'przyklady',
    kind: 'Przykłady',
    title: 'Czekolada i pizza',
    time: '6 min',
    icon: 'Shapes',
  },
  {
    id: 'cwiczenia',
    kind: 'Ćwiczenia',
    title: 'Porównaj samodzielnie',
    time: '8 min',
    icon: 'Target',
  },
  {
    id: 'podwieczorek',
    kind: 'Zadanie problemowe',
    title: 'Podwieczorek u babci',
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

const RULE_ROUNDS: DuelRound[] = [
  {
    id: 'ten-sam-mianownik',
    label: 'Oba paski to ta sama całość pocięta na 6 równych części. Wstaw znak między ułamkami.',
    left: { licznik: 2, mianownik: 6, name: 'Pasek Oli' },
    right: { licznik: 5, mianownik: 6, name: 'Pasek Bartka' },
    note: 'Ten sam mianownik — kawałki są jednakowej wielkości, więc decyduje licznik. 5 takich samych kawałków to więcej niż 2.',
  },
  {
    id: 'ten-sam-licznik',
    label: 'Teraz odwrotnie: liczniki są takie same, a całość pocięto inaczej. Wstaw znak.',
    left: { licznik: 3, mianownik: 4, name: 'Pasek Kasi' },
    right: { licznik: 3, mianownik: 8, name: 'Pasek Michała' },
    note: 'Ten sam licznik — po 3 kawałki z każdej całości. Ale czwarte części są większe od ósmych, więc to 3/4 jest większe, mimo że 8 to większa liczba niż 4.',
  },
  {
    id: 'bez-rysunku-mianownik',
    label: 'Bez rysunku: ten sam mianownik. Która reguła tu działa?',
    left: { licznik: 4, mianownik: 9, name: 'Pasek Oli' },
    right: { licznik: 7, mianownik: 9, name: 'Pasek Bartka' },
    note: 'Dziewiąte części są tej samej wielkości w obu ułamkach, więc wystarczy porównać liczniki: 4 < 7.',
    withoutBars: true,
  },
  {
    id: 'bez-rysunku-licznik',
    label: 'Bez rysunku: ten sam licznik. Uważaj na pułapkę większej liczby w mianowniku.',
    left: { licznik: 2, mianownik: 3, name: 'Pasek Kasi' },
    right: { licznik: 2, mianownik: 10, name: 'Pasek Michała' },
    note: 'Trzecie części są dużo większe od dziesiątych, więc 2/3 > 2/10 — większy mianownik oznacza drobniejsze kawałki, czyli mniejszy ułamek.',
    withoutBars: true,
  },
];

const PODWIECZOREK_ROUNDS: DuelRound[] = [
  {
    id: 'sernik',
    label: 'Babcia pokroiła sernik na 8 równych kawałków. Ala zjadła 5 kawałków, Kuba 2. Kto zjadł większą część sernika?',
    left: { licznik: 5, mianownik: 8, name: 'Ala' },
    right: { licznik: 2, mianownik: 8, name: 'Kuba' },
    note: 'Jeden sernik, jednakowe kawałki — więc wystarczy porównać liczniki. Ala zjadła 5/8, Kuba 2/8.',
  },
  {
    id: 'szarlotki',
    label:
      'Na stole stoją dwie takie same szarlotki. Pierwszą pokrojono na 10 kawałków, drugą na 6. Ala wzięła 3 kawałki z pierwszej, Kuba 3 kawałki z drugiej. Kto wziął większą część ciasta?',
    left: { licznik: 3, mianownik: 10, name: 'Ala' },
    right: { licznik: 3, mianownik: 6, name: 'Kuba' },
    note: 'Oboje wzięli po 3 kawałki, ale z inaczej pokrojonych ciast. Szóste części są większe od dziesiątych, więc 3/10 < 3/6.',
  },
  {
    id: 'torty',
    label:
      'Na koniec dwa takie same torty, oba pokrojone dokładnie na 12 kawałków. Ala wzięła 5 kawałków ze swojego, Kuba 5 ze swojego. Kto wziął więcej?',
    left: { licznik: 5, mianownik: 12, name: 'Ala' },
    right: { licznik: 5, mianownik: 12, name: 'Kuba' },
    note: 'Ten sam licznik i ten sam mianownik — to dokładnie ten sam ułamek. Nikt nie wziął więcej, dlatego między nimi stoi znak równości.',
    withoutBars: true,
  },
];

const QUIZ: QuizQuestion[] = [
  {
    id: 'ten-sam-mianownik',
    question: 'Ułamki 4/9 i 7/9 mają ten sam mianownik. Który z nich jest większy?',
    options: [
      { id: 'a', text: '4/9' },
      { id: 'b', text: '7/9' },
      { id: 'c', text: 'Są równe' },
      { id: 'd', text: 'Nie da się porównać' },
    ],
    correctId: 'b',
    explanation: 'Dziewiąte części są w obu ułamkach jednakowe, więc decyduje licznik — 7 kawałków to więcej niż 4.',
  },
  {
    id: 'dlaczego-jedna-trzecia',
    question: 'Dlaczego 1/3 jest większe od 1/8?',
    options: [
      { id: 'a', text: 'Bo 3 to mniejsza liczba, a mniejsza liczba zawsze wygrywa' },
      { id: 'b', text: 'Bo oba ułamki mają licznik 1' },
      { id: 'c', text: 'Bo 8 to więcej części, więc dostajemy więcej ciasta' },
      { id: 'd', text: 'Bo podział całości na 3 części daje większe kawałki niż podział na 8' },
    ],
    correctId: 'd',
    explanation: 'Ta sama całość podzielona na mniej części daje większe kawałki — jedna trzecia to większy kawałek niż jedna ósma.',
  },
  {
    id: 'najmniejszy-z-trzech',
    question: 'Który z tych ułamków jest najmniejszy: 7/10, 7/8, 7/20?',
    options: [
      { id: 'a', text: '7/20' },
      { id: 'b', text: '7/8' },
      { id: 'c', text: '7/10' },
      { id: 'd', text: 'Wszystkie są równe' },
    ],
    correctId: 'a',
    explanation: 'Wszystkie mają licznik 7, więc najmniejszy jest ten z największym mianownikiem — 7/20 składa się z najdrobniejszych kawałków.',
  },
  {
    id: 'znak-wiekszosci',
    question: 'Znak > wstawiony między dwa ułamki oznacza, że...',
    options: [
      { id: 'a', text: 'prawy ułamek jest większy' },
      { id: 'b', text: 'oba ułamki są równe' },
      { id: 'c', text: 'lewy ułamek jest większy' },
      { id: 'd', text: 'ułamków nie da się porównać' },
    ],
    correctId: 'c',
    explanation: 'Ostry koniec znaku zawsze wskazuje mniejszą liczbę, a szeroki otwarty — większą. Przy znaku > większy jest lewy ułamek.',
  },
  {
    id: 'dwie-pizze',
    question: 'Dwie takie same pizze pocięto inaczej: pierwszą na 4 kawałki, drugą na 8. Który jeden kawałek jest większy?',
    options: [
      { id: 'a', text: 'Z drugiej pizzy, bo 8 to więcej niż 4' },
      { id: 'b', text: 'Oba kawałki są takie same' },
      { id: 'c', text: 'Nie da się tego stwierdzić' },
      { id: 'd', text: 'Z pierwszej pizzy, bo mniej części to większe części' },
    ],
    correctId: 'd',
    explanation: '1/4 pizzy to większy kawałek niż 1/8 tej samej pizzy — im więcej części, tym każda z nich drobniejsza.',
  },
  {
    id: 'blizej-calosci',
    question: 'Który z ułamków 5/6 i 2/6 leży bliżej całości, czyli liczby 1?',
    options: [
      { id: 'a', text: '5/6' },
      { id: 'b', text: '2/6' },
      { id: 'c', text: 'Leżą tak samo blisko' },
      { id: 'd', text: 'Nie da się stwierdzić' },
    ],
    correctId: 'a',
    explanation: 'Cała całość to 6/6. Od 5/6 brakuje do niej jednej szóstej, a od 2/6 aż czterech — więc to 5/6 leży bliżej 1.',
  },
];

const CHEAT_SHEET = [
  'Porównywać można tylko ułamki tej samej całości — dwa jednakowe torty, dwa jednakowe paski.',
  'Ten sam mianownik: wygrywa większy licznik, bo kawałki są jednakowej wielkości.',
  'Ten sam licznik: wygrywa mniejszy mianownik, bo dzieli całość na większe kawałki.',
  'Im więcej osób dzieli tę samą całość, tym mniejszy kawałek dostaje każda z nich.',
  'Ostry koniec znaku < lub > zawsze wskazuje mniejszy ułamek.',
  'Dwa ułamki o tym samym liczniku i tym samym mianowniku są sobie równe.',
];

const IMAGES = imgMap({
  intro: '/images/matematyka/lekcje/porownywanie-ulamkow/tort-na-stole-z-talerzykami.jpg',
  rozgrzewka: '/images/matematyka/lekcje/porownywanie-ulamkow/chlopiec-nakrywa-okragly-stol.jpg',
  reguly: '/images/matematyka/lekcje/porownywanie-ulamkow/dwie-wstazki-pociete-nozyczkami.jpg',
  przyklady: '/images/matematyka/lekcje/porownywanie-ulamkow/dziewczynka-kroi-pizze.jpg',
  cwiczenia: '/images/matematyka/lekcje/porownywanie-ulamkow/sloiki-z-sokiem-na-parapecie.jpg',
  podwieczorek: '/images/matematyka/lekcje/porownywanie-ulamkow/podwieczorek-u-babci-sernik.jpg',
});

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function PorownywanieUlamkowLesson({ lesson, mathModule, nextLesson }: LessonProps) {
  return (
    <LessonShell lesson={lesson} mathModule={mathModule} steps={STEPS} nextLesson={nextLesson}>
      <LessonBody color={mathModule.color} />
    </LessonShell>
  );
}

/** Treść lekcji wydzielona z komponentu strony, bo `useStepDone` wymaga kontekstu z `LessonShell`. */
function LessonBody({ color }: { color: string }) {
  const warmUp = useStepDone('rozgrzewka');
  const reguly = useStepDone('reguly');
  const examples = useStepDone('przyklady');
  const drill = useStepDone('cwiczenia');
  const podwieczorek = useStepDone('podwieczorek');
  const quiz = useStepDone('quiz');

  return (
    <>
      {/* Wstęp */}
      <div className="grid items-center gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_240px]">
        <div>
          <p className="mb-4 text-base leading-relaxed sm:text-lg">
            Wiesz już, jak zbudować ułamek i gdzie stoi on na osi. Teraz pytanie trudniejsze:
            <strong> który z dwóch ułamków jest większy?</strong> Czasem odpowiedź jest oczywista, a
            czasem liczby próbują Cię oszukać — bo w ułamkach większa liczba w mianowniku wcale nie
            znaczy „więcej”. Zaczniesz od tortu i gości przy stole, a skończysz z dwiema regułami,
            które rozstrzygną każdy taki pojedynek.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {[
              { icon: Cake, text: 'Więcej gości — mniejszy kawałek' },
              { icon: Ruler, text: 'Ten sam mianownik: liczy się licznik' },
              { icon: Scissors, text: 'Ten sam licznik: liczy się mianownik' },
              { icon: Equal, text: 'Znaki <, > i = między ułamkami' },
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
            alt="Okrągły tort na drewnianym stole, wokół niego rozstawione puste talerzyki i łopatka do ciasta"
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
          variant="ghost"
          color={color}
          numeral="?"
          kicker="Odkryj regułę, zanim ją nazwiemy"
          image={IMAGES.rozgrzewka}
          alt="Chłopiec z jasnymi kręconymi włosami w musztardowej koszulce rozstawiający talerzyki wokół małego okrągłego stolika w ogrodzie"
        >
          Ten sam tort, coraz więcej gości przy stole. Klikaj w krzesła i patrz, co dzieje się z
          kawałkiem, który przypada każdemu — a taśma pod stołem zapamięta każdą Twoją próbę.
        </LessonImageCard>
        <SliceTrailLab color={color} onComplete={warmUp.markStepDone} />
      </LessonSection>

      {/* 2. Nowe pojęcie */}
      <LessonSection id="reguly">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.reguly}
          alt="Dwie jednakowej długości papierowe wstążki na drewnianym blacie — jedna pocięta na kilka szerokich kawałków, druga na wiele wąskich pasków, obok leżą nożyczki"
        >
          <p>
            Dwie wstążki tej samej długości można pociąć zupełnie inaczej. Teraz Twoim zadaniem jest
            wstawić między ułamki znak <strong>&lt;</strong>, <strong>&gt;</strong> albo{' '}
            <strong>=</strong>. Paski są modelem, po którym da się to odczytać — a po trafieniu
            zobaczysz dokładnie, o ile jeden z nich jest dłuższy. W ostatnich dwóch pojedynkach
            rysunek zniknie: rozstrzygniesz je z samej reguły.
          </p>
        </LessonImageCard>
        <FractionDuel color={color} rounds={RULE_ROUNDS} kicker="Pojedynek ułamków" onComplete={reguly.markStepDone} />
      </LessonSection>

      {/* 3. Przykłady */}
      <LessonSection id="przyklady">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.przyklady}
          alt="Dziewczynka z długimi rudymi włosami w morskiej sukience krojąca okrągłą pizzę radełkiem przy kuchennym stole"
          lead="Dwa gotowe rozwiązania — po jednym na każdą regułę."
        >
          Najpierw czekolada podzielona tak samo, potem dwie pizze pocięte inaczej. Zwróć uwagę na
          pytanie, od którego zaczyna się każde rozwiązanie: co tu jest takie samo?
        </LessonImageCard>
        <CompareWorkedExamples color={color} onComplete={examples.markStepDone} />
      </LessonSection>

      {/* 4. Ćwiczenia */}
      <LessonSection id="cwiczenia">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.cwiczenia}
          alt="Rząd szklanych słoików z sokiem napełnionych do różnej wysokości, ustawionych na parapecie w słońcu"
          reverse
        >
          <p>
            Czas na samodzielne porównywanie: raz z paskami, raz bez rysunku, na koniec trzy ułamki
            naraz i zadanie tekstowe.
          </p>
        </LessonImageCard>
        <DiagnosticQuiz tasks={buildDrillTasks(color)} color={color} onFinish={drill.markStepDone} />
      </LessonSection>

      {/* 5. Zadanie problemowe */}
      <LessonSection id="podwieczorek">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.podwieczorek}
          alt="Przytulny stół z sernikiem, filiżankami i dzbankiem, przy nim chłopiec o prostych ciemnoblond włosach w zielonej koszulce w paski sięgający po kawałek ciasta"
          reverse
          lead="Ten sam mechanizm, tym razem przy stole u babci."
        >
          Ala i Kuba dzielą się sernikiem, szarlotką i tortem. Rozstrzygnij każdy z trzech sporów —
          ostatni ma niespodziankę.
        </LessonImageCard>
        <FractionDuel
          color={color}
          rounds={PODWIECZOREK_ROUNDS}
          kicker="Podwieczorek u babci"
          onComplete={podwieczorek.markStepDone}
        />
      </LessonSection>

      {/* 6. Quiz */}
      <LessonSection id="quiz">
        <LessonQuiz questions={QUIZ} color={color} onFinish={quiz.markStepDone} />
      </LessonSection>

      {/* Ściąga */}
      <section className="border-2 border-dashed p-5 sm:p-6" style={{ borderColor: `${color}59` }}>
        <h2 className="mb-1 text-xl font-bold">Ściąga: porównywanie ułamków w sześciu zdaniach</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Wracaj do niej, gdy w kolejnej lekcji zaczniesz rozszerzać i skracać ułamki.
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
