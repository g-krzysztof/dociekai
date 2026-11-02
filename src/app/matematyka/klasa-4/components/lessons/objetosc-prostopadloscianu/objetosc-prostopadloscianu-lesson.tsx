'use client';

import Image from 'next/image';
import { Box, Droplets, Layers, Ruler } from 'lucide-react';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';
import { DiagnosticQuiz } from '../../diagnostic-quiz';
import { LessonImageCard } from '../../lesson-image-card';
import { WhichHoldsMore } from './which-holds-more';
import { LayerStack } from './layer-stack';
import { VolumeSteps } from './volume-steps';
import { AquariumFill } from './aquarium-fill';
import { buildVolumeDrill } from './volume-drill';
import {
  BOX_VOLUME_RULES,
  baseArea,
  boxVolume,
  formatNumber,
  missingDimension,
  toLitres,
  waterVolume,
} from '../../../lib/box-volume';
import type { BoxSpec } from '../../../lib/solids';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

const STEPS: LessonStepMeta[] = [
  {
    id: 'rozgrzewka',
    kind: 'Rozgrzewka',
    title: 'Które pudełko mieści więcej?',
    time: '6 min',
    icon: 'Sparkles',
  },
  {
    id: 'warstwy',
    kind: 'Nowe pojęcie',
    title: 'Wypełnij bryłę warstwa po warstwie',
    time: '9 min',
    icon: 'Lightbulb',
  },
  {
    id: 'przyklady',
    kind: 'Przykłady',
    title: 'Objętość, brakujący wymiar i litry',
    time: '8 min',
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
    title: 'Ile wody jest w akwarium?',
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

/* Bryły z quizu — liczby liczy ta sama biblioteka co lekcja, więc nie mogą się rozjechać. */
const QUIZ_BOX: BoxSpec = { width: 2, depth: 3, height: 5 };
const QUIZ_TANK: BoxSpec = { width: 50, depth: 20, height: 30 };
const QUIZ_LEVEL = 10;
const QUIZ_DRAWER: BoxSpec = { width: 3, depth: 3, height: 4 };

const QUIZ: QuizQuestion[] = [
  {
    id: 'dlaczego-trzy-liczby',
    question: 'Dlaczego we wzorze na objętość mnożymy przez siebie aż trzy liczby?',
    options: [
      { id: 'a', text: 'Bo prostopadłościan ma trzy pary ścian' },
      {
        id: 'b',
        text: 'Bo wnętrze ma trzy kierunki: kostki układają się wzdłuż, w poprzek i na wysokość',
      },
      { id: 'c', text: 'Bo tak jest wygodniej liczyć niż dodawać' },
      { id: 'd', text: 'Bo objętość zawsze podaje się w trzech jednostkach' },
    ],
    correctId: 'b',
    explanation:
      'Dwie liczby dają jedną warstwę (pole podstawy), trzecia mówi, ile takich warstw stoi jedna na drugiej.',
  },
  {
    id: 'objetosc-pudelka',
    question: `Ile wynosi objętość pudełka ${QUIZ_BOX.width} cm × ${QUIZ_BOX.depth} cm × ${QUIZ_BOX.height} cm?`,
    options: [
      { id: 'a', text: '10 cm³' },
      { id: 'b', text: '20 cm³' },
      { id: 'c', text: '62 cm³' },
      { id: 'd', text: `${boxVolume(QUIZ_BOX)} cm³` },
    ],
    correctId: 'd',
    explanation: `Dno mieści ${QUIZ_BOX.width} · ${QUIZ_BOX.depth} = ${baseArea(QUIZ_BOX)} kostek, a warstw jest ${QUIZ_BOX.height}: ${baseArea(QUIZ_BOX)} · ${QUIZ_BOX.height} = ${boxVolume(QUIZ_BOX)} cm³. Liczba 62 to pole powierzchni, czyli zupełnie inna wielkość.`,
  },
  {
    id: 'podwojona-wysokosc',
    question:
      'Pudełko zostaje tak samo długie i szerokie, ale robimy je dwa razy wyższe. Co dzieje się z objętością?',
    options: [
      { id: 'a', text: 'Też się podwaja' },
      { id: 'b', text: 'Rośnie cztery razy' },
      { id: 'c', text: 'Rośnie osiem razy' },
      { id: 'd', text: 'Zostaje taka sama, bo dno się nie zmieniło' },
    ],
    correctId: 'a',
    explanation:
      'Dno jest to samo, więc warstwa mieści tyle samo kostek — tylko warstw jest dwa razy więcej. Osiem razy urosłaby objętość, gdyby podwoić wszystkie trzy wymiary naraz.',
  },
  {
    id: 'dm3-na-litry',
    question: 'Pojemnik ma objętość 1 dm³. Ile to litrów?',
    options: [
      { id: 'a', text: '10 litrów' },
      { id: 'b', text: '0,1 litra' },
      { id: 'c', text: '1 litr' },
      { id: 'd', text: '1000 litrów' },
    ],
    correctId: 'c',
    explanation:
      'Litr to drugie imię decymetra sześciennego. 1 l = 1 dm³ = 1000 cm³ — dlatego karton mleka jest mniej więcej sześcianem o krawędzi 10 cm.',
  },
  {
    id: 'woda-w-akwarium',
    question: `Akwarium ma dno ${QUIZ_TANK.width} cm na ${QUIZ_TANK.depth} cm i ${QUIZ_TANK.height} cm wysokości. Woda sięga ${QUIZ_LEVEL} cm. Ile jest w nim wody?`,
    options: [
      { id: 'a', text: '30 litrów' },
      { id: 'b', text: `${formatNumber(toLitres(waterVolume(QUIZ_TANK, QUIZ_LEVEL)))} litrów` },
      { id: 'c', text: '100 litrów' },
      { id: 'd', text: '1 litr' },
    ],
    correctId: 'b',
    explanation: `Woda ma dno akwarium i wysokość ${QUIZ_LEVEL} cm: ${baseArea(QUIZ_TANK)} · ${QUIZ_LEVEL} = ${formatNumber(waterVolume(QUIZ_TANK, QUIZ_LEVEL))} cm³, czyli ${formatNumber(toLitres(waterVolume(QUIZ_TANK, QUIZ_LEVEL)))} l. Wysokość ścianek (${QUIZ_TANK.height} cm) mówi tylko, ile by się zmieściło po brzegi.`,
  },
  {
    id: 'brakujaca-wysokosc',
    question: `Szuflada ma objętość ${boxVolume(QUIZ_DRAWER)} cm³, a jej dno to ${QUIZ_DRAWER.width} cm na ${QUIZ_DRAWER.depth} cm. Ile ma wysokości?`,
    options: [
      { id: 'a', text: '9 cm' },
      { id: 'b', text: '12 cm' },
      { id: 'c', text: '6 cm' },
      { id: 'd', text: `${missingDimension(boxVolume(QUIZ_DRAWER), QUIZ_DRAWER.width, QUIZ_DRAWER.depth)} cm` },
    ],
    correctId: 'd',
    explanation: `Jedna warstwa to ${baseArea(QUIZ_DRAWER)} cm³. Dzielimy: ${boxVolume(QUIZ_DRAWER)} : ${baseArea(QUIZ_DRAWER)} = ${missingDimension(boxVolume(QUIZ_DRAWER), QUIZ_DRAWER.width, QUIZ_DRAWER.depth)}. Gdy szukany jest wymiar, mnożenie zamienia się w dzielenie.`,
  },
];

const IMAGES = imgMap({
  intro: '/images/matematyka/lekcje/objetosc-prostopadloscianu/pudelko-pelne-kostek.jpg',
  rozgrzewka: '/images/matematyka/lekcje/objetosc-prostopadloscianu/dwa-rozne-pudelka.jpg',
  warstwy: '/images/matematyka/lekcje/objetosc-prostopadloscianu/dziewczynka-uklada-kostki-w-pudelku.jpg',
  przyklady: '/images/matematyka/lekcje/objetosc-prostopadloscianu/karton-olowek-i-kartka.jpg',
  cwiczenia: '/images/matematyka/lekcje/objetosc-prostopadloscianu/chlopiec-liczy-kostki.jpg',
  zadanie: '/images/matematyka/lekcje/objetosc-prostopadloscianu/akwarium-z-woda.jpg',
});

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function ObjetoscProstopadloscianuLesson({ lesson, mathModule, nextLesson }: LessonProps) {
  return (
    <LessonShell lesson={lesson} mathModule={mathModule} steps={STEPS} nextLesson={nextLesson}>
      <LessonBody color={mathModule.color} />
    </LessonShell>
  );
}

/** Treść lekcji wydzielona z komponentu strony, bo `useStepDone` wymaga kontekstu z `LessonShell`. */
function LessonBody({ color }: { color: string }) {
  const rozgrzewka = useStepDone('rozgrzewka');
  const warstwy = useStepDone('warstwy');
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
            Pole mówiło, ile kratek zajmuje figura na płasko. <strong>Objętość</strong> mówi, ile
            kostek zmieści się w środku bryły. W tej lekcji wypełnisz pudełka kostkami warstwa po
            warstwie, wyprowadzisz z tego wzór <strong>V = a · b · c</strong>, a na koniec
            sprawdzisz, ile litrów wody mieści akwarium.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {[
              { icon: Box, text: 'Objętość = ile się mieści w środku' },
              { icon: Layers, text: 'Warstwa to pole podstawy, warstw jest tyle, co wysokości' },
              { icon: Ruler, text: 'Z objętości i dwóch wymiarów trzeci wyjdzie dzieleniem' },
              { icon: Droplets, text: '1000 cm³ to 1 litr — stąd woda w akwarium' },
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
            alt="Otwarte drewniane pudełko wypełnione równo ułożonymi sześciennymi klockami, kilka klocków leży obok"
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
          kicker="Zanim pojawi się wzór"
          image={IMAGES.rozgrzewka}
          alt="Dwa kartonowe pudełka o różnych proporcjach stojące obok siebie na drewnianym blacie: jedno niskie i szerokie, drugie wąskie i wysokie"
        >
          Trzy razy to samo pytanie: które pudełko mieści więcej? Wymiary masz na rysunku, wzoru
          jeszcze nie — więc licz kostkami. Ostatnie porównanie kończy się zaskoczeniem.
        </LessonImageCard>
        <WhichHoldsMore color={color} onComplete={rozgrzewka.markStepDone} />
      </LessonSection>

      {/* 2. Nowe pojęcie */}
      <LessonSection id="warstwy">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.warstwy}
          alt="Dziewczynka około dziesięciu lat, jasna karnacja, ciemnobrązowe włosy do ramion, żółta bluzka, układa drewniane kostki równą warstwą na dnie płaskiego pudełka"
        >
          <p>
            Układaj kostki warstwami i patrz na tabelę obok. Za każdym razem dochodzi{' '}
            <strong>ta sama</strong> liczba kostek — dokładnie tyle, ile mieści dno. Powtarzane
            dodawanie tej samej liczby to mnożenie, więc wzór napisze się sam.
          </p>
        </LessonImageCard>
        <LayerStack color={color} onComplete={warstwy.markStepDone} />
      </LessonSection>

      {/* 3. Przykłady */}
      <LessonSection id="przyklady">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.przyklady}
          alt="Małe kartonowe pudełko, ołówek, czysta kartka i zwinięty sznurek leżące na drewnianym biurku"
          lead="Trzy razy ta sama droga, raz pod górę."
          reverse
        >
          Najpierw objętość wprost z wymiarów, potem szukanie wymiaru, gdy objętość jest znana, a na
          koniec woda w akwarium przeliczona na litry.
        </LessonImageCard>
        <VolumeSteps color={color} onComplete={przyklady.markStepDone} />
      </LessonSection>

      {/* 4. Ćwiczenia */}
      <LessonSection id="cwiczenia">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.cwiczenia}
          alt="Chłopiec około dziesięciu lat, jasna karnacja, krótkie jasnoblond włosy, granatowy sweter, liczy drewniane kostki ułożone w rządku na stole"
          reverse
        >
          <p>
            Osiem zadań o rosnącej trudności: od tego, czym w ogóle jest objętość, przez liczenie z
            wymiarów i szukanie brakującego wymiaru, po pułapkę z różnymi jednostkami i zamianę na
            litry.
          </p>
        </LessonImageCard>
        <DiagnosticQuiz
          tasks={buildVolumeDrill(color)}
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
          lead="Woda nie sięga brzegu — i to zmienia wszystko."
          alt="Szklane akwarium napełnione wodą do mniej więcej połowy, stojące na drewnianym stole przy oknie"
        >
          Przeciągnij lustro wody i patrz, jak zmienia się objętość. Dno się nie zmienia, więc
          wystarczy pilnować jednej liczby — wysokości, na której stoi woda.
        </LessonImageCard>
        <AquariumFill color={color} onComplete={zadanie.markStepDone} />
      </LessonSection>

      {/* 6. Quiz */}
      <LessonSection id="quiz">
        <LessonQuiz questions={QUIZ} color={color} onFinish={quiz.markStepDone} />
      </LessonSection>

      {/* Ściąga */}
      <section className="border-2 border-dashed p-5 sm:p-6" style={{ borderColor: `${color}59` }}>
        <h2 className="mb-1 text-xl font-bold">Ściąga: objętość prostopadłościanu</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Osiem zdań, które wystarczą na cały ten temat.
        </p>
        <ol className="divide-y border">
          {BOX_VOLUME_RULES.map((rule, index) => (
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
