'use client';

import Image from 'next/image';
import { Copy, Lock, Repeat, X } from 'lucide-react';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';
import { DiagnosticQuiz } from '../../diagnostic-quiz';
import { LessonImageCard } from '../../lesson-image-card';
import { RepeatCountWarmup } from './repeat-count-warmup';
import { RepeatStrip, type RepeatRound } from './repeat-strip';
import { MultiplyWorkedExamples } from './multiply-worked-examples';
import { RecipeScaler, type Ingredient, type ScalerRound } from './recipe-scaler';
import { buildMultiplyDrillTasks } from './mnozenie-ulamka-drill';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

const STEPS: LessonStepMeta[] = [
  {
    id: 'rozgrzewka',
    kind: 'Rozgrzewka',
    title: 'Ta sama porcja kilka razy',
    time: '6 min',
    icon: 'Sparkles',
  },
  {
    id: 'powielanie',
    kind: 'Nowe pojęcie',
    title: 'Dokładasz porcje — licznik skacze, mianownik stoi',
    time: '9 min',
    icon: 'Lightbulb',
  },
  {
    id: 'przyklady',
    kind: 'Przykłady',
    title: 'Trzy mnożenia, trzy kształty wyniku',
    time: '7 min',
    icon: 'Shapes',
  },
  {
    id: 'cwiczenia',
    kind: 'Ćwiczenia',
    title: 'Mnożenie licznika w praktyce',
    time: '8 min',
    icon: 'Target',
  },
  {
    id: 'przepis',
    kind: 'Zadanie problemowe',
    title: 'Jeden przepis, kilka liczb porcji',
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

const REPEAT_ROUNDS: RepeatRound[] = [
  {
    id: 'czekolada',
    mianownik: 4,
    licznik: 1,
    copies: 3,
    unit: 'tabliczki',
    label:
      'Jedna porcja deseru to 1/4 tabliczki czekolady. Dołóż tyle porcji, ile trzeba dla trojga dzieci — i patrz, co robi zapis pod spodem.',
    note: '3 · 1/4 = 3/4 tabliczki. Przy każdej porcji licznik rósł o 1, bo jedna porcja to dokładnie jeden kawałek. Mianownik ani drgnął.',
  },
  {
    id: 'kokardki',
    mianownik: 5,
    licznik: 2,
    copies: 4,
    unit: 'wstążki',
    label: 'Na jedną kokardkę idą 2/5 wstążki. Odmierz wstążkę na 4 kokardki.',
    note: '4 · 2/5 = 8/5 wstążki. Tym razem licznik skakał o 2, bo jedna porcja to dwa kawałki. 8/5 to więcej niż całość — czytamy je jako 1 3/5 wstążki.',
  },
  {
    id: 'blacha',
    mianownik: 6,
    licznik: 3,
    copies: 2,
    unit: 'blachy ciasta',
    label: 'Jedna klasa zjada 3/6 blachy ciasta. Odmierz porcję dla dwóch klas.',
    note: '2 · 3/6 = 6/6, a sześć szóstych części to cała blacha. Wynik mnożenia ułamka bywa okrągłą liczbą naturalną — tutaj po prostu 1.',
  },
];

const INGREDIENTS: Ingredient[] = [
  { id: 'maka', name: 'Mąka', licznik: 3, mianownik: 4, unit: 'szklanki', pieceName: 'ćwiartek', genitive: 'mąki' },
  { id: 'mleko', name: 'Mleko', licznik: 2, mianownik: 3, unit: 'szklanki', pieceName: 'trzecich części', genitive: 'mleka' },
  { id: 'cukier', name: 'Cukier', licznik: 1, mianownik: 8, unit: 'szklanki', pieceName: 'ósmych części', genitive: 'cukru' },
];

const SCALER_ROUNDS: ScalerRound[] = [
  {
    id: 'dwie-porcje',
    servings: 2,
    askId: 'maka',
    story:
      'To przepis na naleśniki, rozpisany na jedną porcję. Zosia robi śniadanie dla siebie i brata, czyli na dwie porcje. Ustaw pokrętło i odczytaj, ile mąki potrzeba.',
    note:
      '2 · 3/4 = 6/4 szklanki mąki, czyli 1 2/4 — półtorej szklanki. Zauważ, że mleko i cukier przeliczyły się w tej samej chwili, każde na swoim mianowniku. Jedno pokrętło, trzy niezależne ułamki.',
  },
  {
    id: 'cztery-porcje',
    servings: 4,
    askId: 'mleko',
    story: 'Teraz przychodzą jeszcze dziadkowie — naleśniki muszą starczyć na cztery porcje. Tym razem interesuje nas mleko.',
    note:
      '4 · 2/3 = 8/3 szklanki mleka, czyli 2 2/3 szklanki. Mianownik mleka to 3, a nie 4 — każdy składnik ma swój własny podział i liczba porcji tego nie zmienia.',
  },
  {
    id: 'piec-porcji',
    servings: 5,
    askId: 'cukier',
    story: 'Ostatnie zamówienie: pięć porcji. Cukru w przepisie jest najmniej, więc sprawdź, czy nadal starcza mniej niż szklanka.',
    note:
      '5 · 1/8 = 5/8 szklanki cukru — nadal mniej niż cała szklanka, bo pięć ósmych części to mniej niż osiem. Mąki w tym samym momencie trzeba już 15/4, czyli 3 3/4 szklanki.',
  },
];

const QUIZ: QuizQuestion[] = [
  {
    id: 'co-mnozymy',
    question: 'Mnożąc ułamek przez liczbę naturalną, co mnożymy przez tę liczbę?',
    options: [
      { id: 'a', text: 'Licznik — mianownik przepisujemy bez zmian' },
      { id: 'b', text: 'Mianownik — licznik przepisujemy bez zmian' },
      { id: 'c', text: 'Licznik i mianownik naraz' },
      { id: 'd', text: 'Ani jedno, ani drugie — dopisujemy liczbę przed ułamkiem' },
    ],
    correctId: 'a',
    explanation: 'Mnożenie to powtarzanie tej samej porcji, a powtarzanie zmienia liczbę kawałków, nie ich wielkość — czyli licznik, nie mianownik.',
  },
  {
    id: 'oblicz-6-razy',
    question: 'Ile wynosi 6 · 1/9?',
    options: [
      { id: 'a', text: '6/54' },
      { id: 'b', text: '1/54' },
      { id: 'c', text: '6/9' },
      { id: 'd', text: '7/9' },
    ],
    correctId: 'c',
    explanation: 'Sześć razy po jednym kawałku to 6 kawałków po 1/9, czyli 6/9.',
  },
  {
    id: 'jako-dodawanie',
    question: 'Które dodawanie zapisuje dokładnie to samo, co 4 · 3/10?',
    options: [
      { id: 'a', text: '4 + 3/10' },
      { id: 'b', text: '3/10 + 3/10 + 3/10 + 3/10' },
      { id: 'c', text: '4/10 + 4/10 + 4/10' },
      { id: 'd', text: '3/10 + 4/10' },
    ],
    correctId: 'b',
    explanation: 'Mnożenie przez liczbę naturalną to skrót wielokrotnego dodawania tej samej porcji — cztery razy po 3/10.',
  },
  {
    id: 'wynik-niewlasciwy',
    question: 'Ile wynosi 4 · 2/3 i jak to przeczytać?',
    options: [
      { id: 'a', text: '8/12, czyli mniej niż połowa' },
      { id: 'b', text: '6/3, czyli 2' },
      { id: 'c', text: '8/3, czyli 3 2/8' },
      { id: 'd', text: '8/3, czyli 2 2/3' },
    ],
    correctId: 'd',
    explanation: '4 · 2 = 8, mianownik zostaje 3. Osiem trzecich części to dwie całości (6/3) i jeszcze 2/3.',
  },
  {
    id: 'wynik-calkowity',
    question: 'Kiedy wynik mnożenia ułamka przez liczbę naturalną jest okrągłą liczbą naturalną?',
    options: [
      { id: 'a', text: 'Gdy licznik wyniku podzieli się przez mianownik bez reszty' },
      { id: 'b', text: 'Nigdy — zawsze zostaje ułamek' },
      { id: 'c', text: 'Zawsze, gdy mnożymy przez liczbę większą od 3' },
      { id: 'd', text: 'Gdy licznik i mianownik są równe już na początku' },
    ],
    correctId: 'a',
    explanation: 'Na przykład 5 · 2/10 = 10/10 = 1, a 3 · 2/6 = 6/6 = 1. Decyduje to, czy nowy licznik dzieli się przez mianownik.',
  },
  {
    id: 'zadanie-praktyczne',
    question: 'Na jedną doniczkę potrzeba 3/8 worka ziemi. Ile worków zejdzie na 4 doniczki?',
    options: [
      { id: 'a', text: '3/32 worka' },
      { id: 'b', text: '7/8 worka' },
      { id: 'c', text: '12/8 worka, czyli 1 4/8' },
      { id: 'd', text: '12/32 worka' },
    ],
    correctId: 'c',
    explanation: '4 · 3/8 = 12/8 worka. Osiem ósmych to jeden worek, więc zostaje jeszcze 4/8 — razem półtora worka.',
  },
];

const CHEAT_SHEET = [
  'Mnożenie ułamka przez liczbę naturalną to skrót wielokrotnego dodawania tej samej porcji.',
  'Mnożysz sam licznik przez tę liczbę, a mianownik przepisujesz bez zmian: 4 · 2/9 = 8/9.',
  'Mianownik opisuje wielkość jednego kawałka — powtarzanie porcji dokłada kawałki, ale ich nie przekrawa.',
  'Wynik może być ułamkiem niewłaściwym (3 · 3/4 = 9/4) — wtedy warto przeczytać go jako liczbę mieszaną: 2 1/4.',
  'Gdy nowy licznik dzieli się przez mianownik bez reszty, wynik jest okrągłą liczbą: 5 · 2/10 = 10/10 = 1.',
  'Liczbę mieszaną najpierw zamień na ułamek niewłaściwy, dopiero potem mnóż: 3 · 1 1/4 = 3 · 5/4 = 15/4 = 3 3/4.',
];

const IMAGES = imgMap({
  intro: '/images/matematyka/lekcje/mnozenie-ulamka-przez-liczbe-naturalna/trzy-jednakowe-porcje-deseru.jpg',
  rozgrzewka: '/images/matematyka/lekcje/mnozenie-ulamka-przez-liczbe-naturalna/rzad-jednakowych-kostek-czekolady.jpg',
  powielanie: '/images/matematyka/lekcje/mnozenie-ulamka-przez-liczbe-naturalna/dziewczynka-tnie-wstazke-na-kawalki.jpg',
  przyklady: '/images/matematyka/lekcje/mnozenie-ulamka-przez-liczbe-naturalna/cytryny-i-dzbanek-lemoniady.jpg',
  cwiczenia: '/images/matematyka/lekcje/mnozenie-ulamka-przez-liczbe-naturalna/miska-maki-i-drewniana-lyzka.jpg',
  przepis: '/images/matematyka/lekcje/mnozenie-ulamka-przez-liczbe-naturalna/chlopiec-czyta-przepis-w-kuchni.jpg',
});

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function MnozenieUlamkaPrzezLiczbeNaturalnaLesson({ lesson, mathModule, nextLesson }: LessonProps) {
  return (
    <LessonShell lesson={lesson} mathModule={mathModule} steps={STEPS} nextLesson={nextLesson}>
      <LessonBody color={mathModule.color} />
    </LessonShell>
  );
}

/** Treść lekcji wydzielona z komponentu strony, bo `useStepDone` wymaga kontekstu z `LessonShell`. */
function LessonBody({ color }: { color: string }) {
  const warmUp = useStepDone('rozgrzewka');
  const repeat = useStepDone('powielanie');
  const examples = useStepDone('przyklady');
  const drill = useStepDone('cwiczenia');
  const recipe = useStepDone('przepis');
  const quiz = useStepDone('quiz');

  return (
    <>
      {/* Wstęp */}
      <div className="grid items-center gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_240px]">
        <div>
          <p className="mb-4 text-base leading-relaxed sm:text-lg">
            Jeśli jedna porcja deseru to 1/4 tabliczki czekolady, to trzy porcje to 1/4 + 1/4 + 1/4.
            Zapisujemy to krócej: <strong>3 · 1/4</strong>. Powtarzanie porcji dokłada kawałki, ale
            żadnego z nich nie przekraja — dlatego mnoży się sam licznik, a mianownik przepisuje bez
            zmian. Cała reszta lekcji to sprawdzanie, jak wygląda wynik, gdy kawałków zbierze się
            więcej niż na jedną całość.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {[
              { icon: Repeat, text: 'Mnożenie to skrót wielokrotnego dodawania' },
              { icon: X, text: 'Mnożysz licznik przez liczbę naturalną' },
              { icon: Lock, text: 'Mianownik przepisujesz bez zmian' },
              { icon: Copy, text: 'Wynik bywa niewłaściwy albo okrągły' },
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
            alt="Trzy identyczne szklane pucharki z kremowym deserem ustawione w rzędzie na drewnianym blacie"
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
          alt="Rząd jednakowych kostek czekolady ułożonych w równych odstępach na jasnym papierze"
        >
          <p>
            Zanim padnie słowo „mnożenie”, cztery rysunki z identycznymi porcjami. Najpierw zapiszesz
            je dodawaniem, potem zobaczysz ten sam rysunek zapisany krócej — i sprawdzisz, co się
            dzieje, gdy porcji zrobi się więcej niż jedna całość.
          </p>
        </LessonImageCard>
        <RepeatCountWarmup color={color} onComplete={warmUp.markStepDone} />
      </LessonSection>

      {/* 2. Nowe pojęcie */}
      <LessonSection id="powielanie">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.powielanie}
          alt="Dziewczynka o falowanych kasztanowych włosach do ramion, w bordowym swetrze, tnąca nożyczkami satynową wstążkę na jednakowe kawałki"
          lead="Każde kliknięcie dokłada dokładnie taką samą porcję."
        >
          Pod stosem porcji zapis rośnie razem z rysunkiem. Zwróć uwagę na jedną rzecz: licznik skacze
          o tyle, ile wynosi licznik jednej porcji, a liczba kresek na pasku nigdy się nie zmienia.
        </LessonImageCard>
        <RepeatStrip color={color} rounds={REPEAT_ROUNDS} onComplete={repeat.markStepDone} />
      </LessonSection>

      {/* 3. Przykłady */}
      <LessonSection id="przyklady">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.przyklady}
          alt="Przekrojone cytryny i szklany dzbanek lemoniady stojące na kuchennym blacie"
          reverse
        >
          <p>
            Trzy rozwiązania dobrane tak, żeby pokazać trzy różne zakończenia: wynik mniejszy od
            całości, wynik niewłaściwy czytany jako liczba mieszana i wynik równy okrągłej liczbie.
          </p>
        </LessonImageCard>
        <MultiplyWorkedExamples color={color} onComplete={examples.markStepDone} />
      </LessonSection>

      {/* 4. Ćwiczenia */}
      <LessonSection id="cwiczenia">
        <LessonImageCard
          variant="ghost"
          color={color}
          numeral="×"
          kicker="Siedem zadań"
          image={IMAGES.cwiczenia}
          alt="Drewniana miska pełna mąki, drewniana łyżka i mała kupka rozsypanej mąki na kuchennym stole"
        >
          Policz wyniki mnożeń, dopasuj zapis do rysunku, sprawdź przypadek wychodzący równo i zmierz
          się z mnożeniem liczby mieszanej.
        </LessonImageCard>
        <DiagnosticQuiz tasks={buildMultiplyDrillTasks(color)} color={color} onFinish={drill.markStepDone} />
      </LessonSection>

      {/* 5. Zadanie problemowe */}
      <LessonSection id="przepis">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.przepis}
          alt="Chłopiec o kręconych blond włosach w szarym fartuchu kuchennym czytający kartkę z przepisem opartą o miskę"
          reverse
          lead="Jedno pokrętło przelicza cały przepis naraz."
        >
          Każdy składnik ma swój własny mianownik, więc zmiana liczby porcji rusza trzy różne ułamki
          w tej samej chwili. Twoim zadaniem jest odczytać jeden z nich — ten, o który pyta zamówienie.
        </LessonImageCard>
        <RecipeScaler
          color={color}
          ingredients={INGREDIENTS}
          rounds={SCALER_ROUNDS}
          servingOptions={[1, 2, 3, 4, 5, 6]}
          onComplete={recipe.markStepDone}
        />
      </LessonSection>

      {/* 6. Quiz */}
      <LessonSection id="quiz">
        <LessonQuiz questions={QUIZ} color={color} onFinish={quiz.markStepDone} />
      </LessonSection>

      {/* Ściąga */}
      <section className="border-2 border-dashed p-5 sm:p-6" style={{ borderColor: `${color}59` }}>
        <h2 className="mb-1 text-xl font-bold">Ściąga: mnożenie ułamka przez liczbę naturalną w sześciu zdaniach</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Wracaj do niej, gdy w kolejnej lekcji ułamki wejdą do zadań tekstowych.
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
