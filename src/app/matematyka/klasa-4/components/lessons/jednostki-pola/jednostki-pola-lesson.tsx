'use client';

import Image from 'next/image';
import { ArrowUpDown, Ruler, Sprout, Square } from 'lucide-react';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { LessonQuiz, type QuizQuestion } from '../../lesson-quiz';
import { DiagnosticQuiz } from '../../diagnostic-quiz';
import { LessonImageCard } from '../../lesson-image-card';
import { UnitOrderRail } from './unit-order-rail';
import { ZoomOutWorld } from './zoom-out-world';
import { UnitHopSteps } from './unit-hop-steps';
import { buildAreaUnitDrill } from './area-unit-drill';
import { ListingAudit } from './listing-audit';
import {
  AREA_UNITS,
  AREA_UNIT_PRACTICE_RULES,
  convertArea,
  formatArea,
} from '../../../lib/area-units';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

const STEPS: LessonStepMeta[] = [
  {
    id: 'rozgrzewka',
    kind: 'Rozgrzewka',
    title: 'Ustaw od najmniejszego',
    time: '5 min',
    icon: 'Sparkles',
  },
  {
    id: 'jednostki',
    kind: 'Nowe pojęcie',
    title: 'Odsuń kamerę o siedem szczebli',
    time: '12 min',
    icon: 'Lightbulb',
  },
  {
    id: 'przyklady',
    kind: 'Przykłady',
    title: 'Zamiana skok po skoku',
    time: '6 min',
    icon: 'ListChecks',
  },
  {
    id: 'cwiczenia',
    kind: 'Ćwiczenia',
    title: 'Przelicz samodzielnie',
    time: '8 min',
    icon: 'Target',
  },
  {
    id: 'zadanie',
    kind: 'Zadanie problemowe',
    title: 'Błąd w ogłoszeniu',
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

const QUIZ: QuizQuestion[] = [
  {
    id: 'dlaczego-sto',
    question: 'Dlaczego sąsiednie jednostki pola dzieli 100, a nie 10?',
    options: [
      { id: 'a', text: 'Bo tak się kiedyś umówiono i trzeba to zapamiętać' },
      {
        id: 'b',
        text: 'Bo gdy bok kwadratu rośnie 10 razy, to kwadrat powiększa się i wzdłuż, i w poprzek — czyli 10 · 10 = 100 razy',
      },
      { id: 'c', text: 'Bo pole zawsze liczy się przez mnożenie przez 100' },
      { id: 'd', text: 'Bo jednostek pola jest dokładnie sto' },
    ],
    correctId: 'b',
    explanation:
      'Jednostka pola to kwadrat. Dziesięciokrotnie dłuższy bok daje kwadrat, w którym mieści się 10 rzędów po 10 małych kwadracików — stąd 100.',
  },
  {
    id: 'hektar-w-metrach',
    question: 'Ile metrów kwadratowych ma jeden hektar?',
    options: [
      { id: 'a', text: '100' },
      { id: 'b', text: '1000' },
      { id: 'c', text: '10 000' },
      { id: 'd', text: '100 000' },
    ],
    correctId: 'c',
    explanation:
      'Hektar to kwadrat o boku 100 m. Wzdłuż jego boku mieści się 100 metrowych kwadratów, więc w całym hektarze jest ich 100 · 100 = 10 000.',
  },
  {
    id: 'czym-jest-ar',
    question: 'Czym jest ar?',
    options: [
      { id: 'a', text: 'Kwadratem o boku 10 m, czyli polem 100 m²' },
      { id: 'b', text: 'Kwadratem o boku 100 m, czyli polem 10 000 m²' },
      { id: 'c', text: 'Inną nazwą metra kwadratowego' },
      { id: 'd', text: 'Jednostką długości używaną przy działkach' },
    ],
    correctId: 'a',
    explanation:
      'Ar to kwadrat o boku 10 metrów. Sto arów daje hektar, a jeden ar to sto metrów kwadratowych.',
  },
  {
    id: 'dm-na-cm',
    question: 'Ile centymetrów kwadratowych ma 6 dm²?',
    options: [
      { id: 'a', text: '6' },
      { id: 'b', text: '60' },
      { id: 'c', text: '6000' },
      { id: 'd', text: '600' },
    ],
    correctId: 'd',
    explanation:
      'Z dm² na cm² jest jeden szczebel w dół, czyli ×100. Do szóstki dopisują się dwa zera: 600 cm².',
  },
  {
    id: 'jednostka-do-lasu',
    question: 'Którą jednostką najwygodniej podać powierzchnię lasu?',
    options: [
      { id: 'a', text: 'w centymetrach kwadratowych' },
      { id: 'b', text: 'w hektarach' },
      { id: 'c', text: 'w decymetrach kwadratowych' },
      { id: 'd', text: 'w milimetrach kwadratowych' },
    ],
    correctId: 'b',
    explanation:
      'Jednostkę dobiera się tak, żeby liczba była wygodna. Las w cm² dałby liczbę z kilkunastoma cyframi — w hektarach wychodzi zwykłe kilkaset.',
  },
  {
    id: 'blad-kasi',
    question:
      'Kasia zamieniała 700 cm² na dm² i wyszło jej 70 dm². Co zrobiła źle?',
    options: [
      { id: 'a', text: 'Nic — wynik jest poprawny' },
      { id: 'b', text: 'Powinna była pomnożyć, a nie podzielić' },
      { id: 'c', text: 'Podzieliła przez 10 zamiast przez 100 — poprawnie jest 7 dm²' },
      { id: 'd', text: 'Pomyliła jednostki: powinna była podać wynik w m²' },
    ],
    correctId: 'c',
    explanation:
      'W górę drabinki idzie się krokiem :100, a nie :10. Z 700 zdejmujemy dwa zera i zostaje 7 dm².',
  },
];

const IMAGES = imgMap({
  intro: '/images/matematyka/lekcje/jednostki-pola/tasma-miernicza-kafelek-i-kartka-na-stole.jpg',
  rozgrzewka:
    '/images/matematyka/lekcje/jednostki-pola/znaczek-ksiazka-i-zlozony-koc-na-podlodze.jpg',
  jednostki:
    '/images/matematyka/lekcje/jednostki-pola/dziewczynka-patrzy-z-balkonu-na-dachy-i-boisko.jpg',
  przyklady: '/images/matematyka/lekcje/jednostki-pola/drewniana-drabina-w-pustym-pokoju.jpg',
  cwiczenia: '/images/matematyka/lekcje/jednostki-pola/chlopiec-mierzy-dywanik-metrem-skladanym.jpg',
  zadanie: '/images/matematyka/lekcje/jednostki-pola/pusta-dzialka-z-niwelatorem-geodety.jpg',
});

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
}

export function JednostkiPolaLesson({ lesson, mathModule, nextLesson }: LessonProps) {
  return (
    <LessonShell lesson={lesson} mathModule={mathModule} steps={STEPS} nextLesson={nextLesson}>
      <LessonBody color={mathModule.color} />
    </LessonShell>
  );
}

/** Treść lekcji wydzielona z komponentu strony, bo `useStepDone` wymaga kontekstu z `LessonShell`. */
function LessonBody({ color }: { color: string }) {
  const rozgrzewka = useStepDone('rozgrzewka');
  const jednostki = useStepDone('jednostki');
  const przyklady = useStepDone('przyklady');
  const cwiczenia = useStepDone('cwiczenia');
  const zadanie = useStepDone('zadanie');
  const quiz = useStepDone('quiz');
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  return (
    <>
      {/* Wstęp */}
      <div className="grid items-center gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_240px]">
        <div>
          <p className="mb-4 text-base leading-relaxed sm:text-lg">
            Pole umiesz już mierzyć kratkami. Teraz chodzi o to, <strong>jaką kratką</strong>: paznokieć
            wygodnie mierzy się centymetrami kwadratowymi, pokój — metrami, a las hektarami. Wszystkie
            te jednostki są kwadratami i stoją w jednej drabince, w której każdy szczebel to równo{' '}
            <strong>sto razy</strong> więcej niż poprzedni. W tej lekcji przejdziesz tę drabinkę od
            dołu do góry i nauczysz się chodzić po niej w obie strony.
          </p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {[
              { icon: Square, text: 'Każda jednostka pola to kwadrat' },
              { icon: ArrowUpDown, text: 'Szczebel w dół ×100, w górę :100' },
              { icon: Sprout, text: 'Ar i hektar — jednostki działek i pól' },
              { icon: Ruler, text: 'Jednostka dobrana tak, by liczba miała sens' },
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
            alt="Widok z góry na drewniany stół: rozwinięta miarka krawiecka, kwadratowy kafelek ceramiczny, złożona kartka papieru i zaostrzony ołówek"
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
          kicker="Liczba to jeszcze nie wszystko"
          image={IMAGES.rozgrzewka}
          alt="Trzy przedmioty leżące obok siebie na drewnianej podłodze: mały znaczek pocztowy, zamknięta książka i złożony koc w kratę"
        >
          Dostaniesz trzy powierzchnie podane w różnych jednostkach i ustawisz je od najmniejszej do
          największej. Uwaga: największa liczba wcale nie musi oznaczać największego pola.
        </LessonImageCard>
        <UnitOrderRail color={color} onComplete={rozgrzewka.markStepDone} />
      </LessonSection>

      {/* 2. Nowe pojęcie */}
      <LessonSection id="jednostki">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.jednostki}
          alt="Dziewczynka około dziesięciu lat, jasna karnacja, rude falowane włosy do ramion, zielony sweter, patrzy z wysokiego balkonu na dachy domów, ogródki i boisko w oddali"
        >
          <p>
            Wszystkie jednostki pola to kwadraty i wszystkie siedzą jedna w drugiej. Przeciągnij
            suwak, żeby odsunąć kamerę — od łebka szpilki, przez dłoń i blat biurka, aż po kwadrat o
            boku kilometra. Kwadraty zostają w tym samym rogu, więc widać, że każdy jest dokładnie
            setną częścią następnego.
          </p>
        </LessonImageCard>
        <ZoomOutWorld color={color} onComplete={jednostki.markStepDone} />
      </LessonSection>

      {/* 3. Przykłady */}
      <LessonSection id="przyklady">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.przyklady}
          alt="Drewniana drabina malarska stojąca w pustym, jasnym pokoju, na najniższym stopniu zwinięta miarka"
          lead="Zamiana jednostek to wchodzenie po drabinie, a nie jeden wielki skok."
          reverse
        >
          Trzy przykłady, w każdym klikasz kolejny szczebel i patrzysz, co robi się z liczbą. W dół
          dopisują się dwa zera, w górę dwa zera znikają — i tyle. Nawet zamiana hektarów na metry to
          po prostu ten sam krok wykonany dwa razy.
        </LessonImageCard>
        <UnitHopSteps color={color} onComplete={przyklady.markStepDone} />
      </LessonSection>

      {/* 4. Ćwiczenia */}
      <LessonSection id="cwiczenia">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.cwiczenia}
          alt="Chłopiec około dziesięciu lat, jasna karnacja, krótkie jasnobrązowe włosy, musztardowy sweter, klęczy na podłodze i rozkłada drewniany metr składany na małym dywaniku"
          reverse
        >
          <p>
            Siedem zadań o rosnącej trudności: przeliczniki w obie strony, ary i hektary, cudzy błąd
            do zdiagnozowania i pytanie o kafelki na podłodze.
          </p>
        </LessonImageCard>
        <DiagnosticQuiz
          tasks={buildAreaUnitDrill(color)}
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
          lead="Pomylone jednostki pola trafiają się w prawdziwych ogłoszeniach."
          alt="Pusta trawiasta działka na skraju wsi, niski drewniany płot, kilka brzóz i geodezyjny niwelator na statywie stojący w trawie"
        >
          Dostajesz trzy ogłoszenia, w każdym pole podane dwa razy — w dwóch różnych jednostkach.
          Jedno z tych przeliczeń jest fałszywe. Znajdź je i popraw.
        </LessonImageCard>
        <ListingAudit color={color} onComplete={zadanie.markStepDone} />
      </LessonSection>

      {/* 6. Quiz */}
      <LessonSection id="quiz">
        <LessonQuiz questions={QUIZ} color={color} onFinish={quiz.markStepDone} />
      </LessonSection>

      {/* Ściąga */}
      <section className="border-2 border-dashed p-5 sm:p-6" style={{ borderColor: `${color}59` }}>
        <h2 className="mb-1 text-xl font-bold">Ściąga: jednostki pola</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Sześć zdań i jedna tabela, które wystarczą na cały ten temat.
        </p>
        <ol className="mb-6 divide-y border">
          {AREA_UNIT_PRACTICE_RULES.map((rule, index) => (
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

        <div className="overflow-x-auto border">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b" style={{ backgroundColor: `${color}0f` }}>
                <th className="px-4 py-2 font-semibold">Jednostka</th>
                <th className="px-4 py-2 font-semibold">Kwadrat o boku</th>
                <th className="px-4 py-2 font-semibold">Zależność z metrem kwadratowym</th>
                <th className="px-4 py-2 font-semibold">Mniej więcej tyle ma</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {AREA_UNITS.map((unit) => {
                const inMeters = convertArea(1, unit.code, 'm²');
                return (
                  <tr key={unit.code}>
                    <td className="px-4 py-2 font-mono font-bold tabular-nums" style={{ color: textColor }}>
                      1 {unit.code}
                    </td>
                    <td className="px-4 py-2">{unit.side}</td>
                    <td className="px-4 py-2 font-mono tabular-nums">
                      {inMeters === 1
                        ? 'jednostka odniesienia'
                        : inMeters > 1
                          ? `1 ${unit.code} = ${formatArea(inMeters)} m²`
                          : `1 m² = ${formatArea(convertArea(1, 'm²', unit.code))} ${unit.code}`}
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">{unit.example}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
