'use client';

import Image from 'next/image';
import { Layers2, Paintbrush, Scissors, SquareStack } from 'lucide-react';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';
import { DiagnosticQuiz } from '../../diagnostic-quiz';
import { LessonImageCard } from '../../lesson-image-card';
import { VolumeOrSurface } from './volume-or-surface';
import { PaintTheBox } from './paint-the-box';
import { SurfaceLedger } from './surface-ledger';
import { PaintCans } from './paint-cans';
import { buildSurfaceDrill } from './surface-drill';
import {
  SURFACE_RULES,
  netFaceGroups,
  netTotalArea,
  surfaceWithout,
} from '../../../lib/box-net';
import { boxVolume } from '../../../lib/box-volume';
import type { BoxSpec } from '../../../lib/solids';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

const STEPS: LessonStepMeta[] = [
  {
    id: 'rozgrzewka',
    kind: 'Rozgrzewka',
    title: 'Wnętrze czy zewnętrze?',
    time: '6 min',
    icon: 'Sparkles',
  },
  {
    id: 'malowanie',
    kind: 'Nowe pojęcie',
    title: 'Pomaluj wszystkie sześć ścian',
    time: '9 min',
    icon: 'Lightbulb',
  },
  {
    id: 'przyklady',
    kind: 'Przykłady',
    title: 'Rachunek na trzy wiersze',
    time: '9 min',
    icon: 'ListChecks',
  },
  {
    id: 'cwiczenia',
    kind: 'Ćwiczenia',
    title: 'Policz samodzielnie',
    time: '10 min',
    icon: 'Target',
  },
  {
    id: 'zadanie',
    kind: 'Zadanie problemowe',
    title: 'Ile farby, papieru i płytek?',
    time: '9 min',
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

/* Bryły z quizu — liczby liczy ta sama biblioteka co lekcja. */
const QUIZ_CUBE: BoxSpec = { width: 5, depth: 5, height: 5 };
const QUIZ_BOX: BoxSpec = { width: 4, depth: 3, height: 2 };
const QUIZ_CRATE: BoxSpec = { width: 6, depth: 4, height: 2 };

const QUIZ: QuizQuestion[] = [
  {
    id: 'ktore-pytanie',
    question: 'Które z tych pytań jest pytaniem o pole powierzchni?',
    options: [
      { id: 'a', text: 'Ile litrów wody zmieści się w akwarium?' },
      { id: 'b', text: 'Ile klocków o boku 1 cm zapełni pudełko?' },
      { id: 'c', text: 'Ile papieru pójdzie na owinięcie pudełka?' },
      { id: 'd', text: 'Ile drutu trzeba na szkielet pudełka?' },
    ],
    correctId: 'c',
    explanation:
      'Papier kładzie się NA ścianach — to pole powierzchni. Litry i klocki to objętość, a drut to długość krawędzi.',
  },
  {
    id: 'szescian-5',
    question: `Ile wynosi pole powierzchni sześcianu o krawędzi ${QUIZ_CUBE.width} cm?`,
    options: [
      { id: 'a', text: `${netTotalArea(QUIZ_CUBE)} cm²` },
      { id: 'b', text: `${boxVolume(QUIZ_CUBE)} cm²` },
      { id: 'c', text: '25 cm²' },
      { id: 'd', text: '30 cm²' },
    ],
    correctId: 'a',
    explanation: `Sześcian ma 6 identycznych ścian po ${QUIZ_CUBE.width} · ${QUIZ_CUBE.width} = ${QUIZ_CUBE.width * QUIZ_CUBE.width} cm², czyli 6 · ${QUIZ_CUBE.width * QUIZ_CUBE.width} = ${netTotalArea(QUIZ_CUBE)} cm². Liczba ${boxVolume(QUIZ_CUBE)} to objętość, a 30 to sześć razy krawędź zamiast sześć razy pole ściany.`,
  },
  {
    id: 'ile-prostokatow',
    question: 'Ile RÓŻNYCH prostokątów wystarczy policzyć, żeby znać pole powierzchni pudełka?',
    options: [
      { id: 'a', text: 'Sześć — tyle jest ścian' },
      { id: 'b', text: 'Jeden, a potem pomnożyć przez sześć' },
      { id: 'c', text: 'Dwa — dno i jedną ściankę boczną' },
      { id: 'd', text: 'Trzy, bo każdy z nich występuje dwa razy' },
    ],
    correctId: 'd',
    explanation:
      'Ściany przeciwległe są identyczne, więc różnych prostokątów jest trzy. Każdy bierzemy dwa razy — stąd 2 · (a · b + a · c + b · c). Mnożenie jednego przez sześć działa tylko dla sześcianu.',
  },
  {
    id: 'pudelko-4-3-2',
    question: `Ile wynosi pole powierzchni pudełka ${QUIZ_BOX.width} cm × ${QUIZ_BOX.depth} cm × ${QUIZ_BOX.height} cm?`,
    options: [
      { id: 'a', text: `${boxVolume(QUIZ_BOX)} cm²` },
      { id: 'b', text: `${netTotalArea(QUIZ_BOX)} cm²` },
      { id: 'c', text: '26 cm²' },
      { id: 'd', text: '104 cm²' },
    ],
    correctId: 'b',
    explanation: `Trzy pary: ${netFaceGroups(QUIZ_BOX)
      .map((g) => `${g.sides[0]} · ${g.sides[1]} = ${g.area}`)
      .join(', ')}. Razem 2 · (${netFaceGroups(QUIZ_BOX)
      .map((g) => g.area)
      .join(' + ')}) = ${netTotalArea(QUIZ_BOX)} cm². Liczba ${boxVolume(QUIZ_BOX)} to objętość, a 26 to suma trzech pól bez podwojenia.`,
  },
  {
    id: 'ta-sama-objetosc',
    question: 'Dwa różne pudełka mieszczą dokładnie tyle samo. Co można powiedzieć o ich polach powierzchni?',
    options: [
      { id: 'a', text: 'Muszą być równe — objętość wyznacza pole powierzchni' },
      { id: 'b', text: 'Pole powierzchni jest zawsze dwa razy większe od objętości' },
      { id: 'c', text: 'Mogą się różnić — im bardziej płaska bryła, tym więcej materiału na obłożenie' },
      { id: 'd', text: 'Nie da się ich w ogóle porównać' },
    ],
    correctId: 'c',
    explanation:
      'Objętość i pole powierzchni to niezależne wielkości. Sześcian 6 × 6 × 6 i pudełko 12 × 6 × 3 mieszczą po 216 cm³, ale zużyją odpowiednio 216 cm² i 252 cm² opakowania.',
  },
  {
    id: 'bez-wieka',
    question: `Skrzynia ${QUIZ_CRATE.width} cm × ${QUIZ_CRATE.depth} cm × ${QUIZ_CRATE.height} cm nie ma wieka. Ile kartonu poszło na jej dno i ścianki?`,
    options: [
      { id: 'a', text: `${surfaceWithout(QUIZ_CRATE, ['gora'])} cm²` },
      { id: 'b', text: `${netTotalArea(QUIZ_CRATE)} cm²` },
      { id: 'c', text: `${QUIZ_CRATE.width * QUIZ_CRATE.depth} cm²` },
      { id: 'd', text: `${boxVolume(QUIZ_CRATE)} cm²` },
    ],
    correctId: 'a',
    explanation: `Pełne pole powierzchni to ${netTotalArea(QUIZ_CRATE)} cm². Wieko ma ${QUIZ_CRATE.width} · ${QUIZ_CRATE.depth} = ${QUIZ_CRATE.width * QUIZ_CRATE.depth} cm², więc zostaje ${netTotalArea(QUIZ_CRATE)} − ${QUIZ_CRATE.width * QUIZ_CRATE.depth} = ${surfaceWithout(QUIZ_CRATE, ['gora'])} cm².`,
  },
];

const IMAGES = imgMap({
  intro: '/images/matematyka/lekcje/pole-powierzchni-prostopadloscianu/pudelko-owiniete-papierem.jpg',
  rozgrzewka: '/images/matematyka/lekcje/pole-powierzchni-prostopadloscianu/puszka-farby-i-pedzel.jpg',
  malowanie: '/images/matematyka/lekcje/pole-powierzchni-prostopadloscianu/chlopiec-maluje-skrzynke.jpg',
  przyklady: '/images/matematyka/lekcje/pole-powierzchni-prostopadloscianu/rozlozony-karton-i-olowek.jpg',
  cwiczenia: '/images/matematyka/lekcje/pole-powierzchni-prostopadloscianu/stos-plaskich-kartonow.jpg',
  zadanie: '/images/matematyka/lekcje/pole-powierzchni-prostopadloscianu/dziewczynka-owija-prezent.jpg',
});

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function PolePowierzchniProstopadloscianuLesson({
  lesson,
  mathModule,
  nextLesson,
}: LessonProps) {
  return (
    <LessonShell lesson={lesson} mathModule={mathModule} steps={STEPS} nextLesson={nextLesson}>
      <LessonBody color={mathModule.color} />
    </LessonShell>
  );
}

/** Treść lekcji wydzielona z komponentu strony, bo `useStepDone` wymaga kontekstu z `LessonShell`. */
function LessonBody({ color }: { color: string }) {
  const rozgrzewka = useStepDone('rozgrzewka');
  const malowanie = useStepDone('malowanie');
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
            Objętość mówiła, ile się w bryle <strong>mieści</strong>. Pole powierzchni mówi, ile
            trzeba, żeby ją <strong>obłożyć z zewnątrz</strong> — farbą, papierem, płytkami. To jest
            po prostu pole siatki, którą rozkładałeś dwie lekcje temu: sześć prostokątów w trzech
            parach identycznych.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {[
              { icon: Paintbrush, text: 'Pole powierzchni = ile trzeba na obłożenie z zewnątrz' },
              { icon: Scissors, text: 'To dokładnie pole siatki bryły' },
              { icon: Layers2, text: 'Trzy różne prostokąty, każdy dwa razy' },
              { icon: SquareStack, text: 'P = 2 · (a · b + a · c + b · c), w cm²' },
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
            alt="Prostokątne pudełko owinięte gładkim papierem i przewiązane sznurkiem, leżące na drewnianym stole"
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
          variant="basic"
          color={color}
          image={IMAGES.rozgrzewka}
          alt="Otwarta puszka farby z zanurzonym pędzlem stojąca obok drewnianej skrzynki na gazecie"
        >
          <p>
            Ta sama skrzynia, dwa zupełnie różne pytania. Zanim policzysz cokolwiek, naucz się je
            rozróżniać: czy coś wchodzi do <strong>środka</strong>, czy kładzie się{' '}
            <strong>na ścianach</strong>? Sześć pytań ze świata do rozstrzygnięcia.
          </p>
        </LessonImageCard>
        <VolumeOrSurface color={color} onComplete={rozgrzewka.markStepDone} />
      </LessonSection>

      {/* 2. Nowe pojęcie */}
      <LessonSection id="malowanie">
        <LessonImageCard
          variant="ghost"
          color={color}
          numeral="6"
          kicker="Sześć ścian, trzy pary"
          image={IMAGES.malowanie}
          alt="Chłopiec około dziesięciu lat, jasna karnacja, proste ciemne włosy, rdzawa koszulka, maluje pędzlem bok drewnianej skrzynki"
        >
          Obróć pudełko i pomaluj wszystkie ściany — klikać da się tylko te, które w danej chwili
          widzisz, więc trzy z nich znajdziesz dopiero po drugiej stronie. Każda pomalowana ściana
          dokłada swoje pole do sumy.
        </LessonImageCard>
        <PaintTheBox color={color} onComplete={malowanie.markStepDone} />
      </LessonSection>

      {/* 3. Przykłady */}
      <LessonSection id="przyklady">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.przyklady}
          alt="Rozłożony płasko karton leżący na blacie obok ołówka i gumki"
          lead="Rachunek, który wypełniasz sam."
          reverse
        >
          Trzy wiersze, po jednym na parę ścian. Do każdego dobierz właściwe dwa wymiary bryły —
          suma dopisze się na dole sama. Ostatnia bryła ma pułapkę: dwa kafelki z tymi samymi
          liczbami.
        </LessonImageCard>
        <SurfaceLedger color={color} onComplete={przyklady.markStepDone} />
      </LessonSection>

      {/* 4. Ćwiczenia */}
      <LessonSection id="cwiczenia">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.cwiczenia}
          alt="Stos płasko złożonych kartonowych pudeł opartych o ścianę w jasnym pomieszczeniu"
          reverse
        >
          <p>
            Osiem zadań o rosnącej trudności: od definicji, przez sześcian i zwykłe pudełko, po dwie
            bryły o tej samej objętości i różnym polu powierzchni oraz skrzynię, której nie trzeba
            malować od spodu.
          </p>
        </LessonImageCard>
        <DiagnosticQuiz
          tasks={buildSurfaceDrill(color)}
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
          lead="Nie każdą ścianę trzeba pokryć."
          alt="Dziewczynka około dziesięciu lat, jasna karnacja, jasnobrązowe falowane włosy, zielony sweterek, owija pudełko arkuszem papieru na stole"
        >
          Trzy prawdziwe roboty: malowanie skrzyni, owijanie prezentu i wykładanie basenu płytkami.
          Za każdym razem policz pole do pokrycia, a potem ile opakowań materiału trzeba kupić.
        </LessonImageCard>
        <PaintCans color={color} onComplete={zadanie.markStepDone} />
      </LessonSection>

      {/* 6. Quiz */}
      <LessonSection id="quiz">
        <LessonQuiz questions={QUIZ} color={color} onFinish={quiz.markStepDone} />
      </LessonSection>

      {/* Ściąga */}
      <section className="border-2 border-dashed p-5 sm:p-6" style={{ borderColor: `${color}59` }}>
        <h2 className="mb-1 text-xl font-bold">Ściąga: pole powierzchni prostopadłościanu</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Osiem zdań, które wystarczą na cały ten temat.
        </p>
        <ol className="divide-y border">
          {SURFACE_RULES.map((rule, index) => (
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
