'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Blocks, Dices, FileImage, ShieldCheck, Signpost, Table2, Telescope } from 'lucide-react';
import {
  BLOCK_KINDS,
  InfoLessonShell,
  LessonBlock,
  useBlockDone,
  type LessonBlockMeta,
} from '../../lesson-shell';
import { LessonImageCard } from '@/components/ui/lesson-image-card';
import { ConfidenceBet } from './confidence-bet';
import { PartFrame } from './test-frame';
import { PARTS } from './parts';
import { FinalResult } from './final-result';
import { NextYearPeek } from './next-year-peek';
import type { InfoModule } from '../../../data/curriculum';
import type { InfoLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

/**
 * Druga i ostatnia lekcja modułu 9 — **test końcowy i „Co dalej”**, czyli
 * zamknięcie całego kursu. Jest jedyną lekcją, w której pojawia się blok `quiz`
 * z palety — ostatni nietknięty dotąd rodzaj — ale **żadne z dwunastu zadań nie
 * jest pytaniem z trzema odpowiedziami**: dziecko przeciąga znacznik po siatce
 * (skrypt Scratcha), wpisuje formułę, którą werdykt sprawdza przez zmianę danych,
 * nadaje akapitom styl, składa hasło z klocków i ustawia okno udostępniania.
 * Test mierzy to, co da się zrobić, nie to, co da się zgadnąć.
 *
 * Stoi na jednym zdaniu: **wiedza to to, co potrafisz zrobić bez podpowiedzi** —
 * i na drugim, które daje tej lekcji jej kształt: **najpierw obstaw, potem
 * sprawdź**. Zakład z bloku 1 wraca w wyniku obok tego, co dziecko naprawdę
 * zrobiło, więc dziecko dostaje nie tylko wynik, ale i wiedzę o tym, czy zna
 * siebie.
 *
 * Cztery części odpowiadają temu, na czym stoi klasa 5 (dłuższe projekty, arkusz
 * „na poważnie”, więcej algorytmiki + bezpieczne korzystanie z sieci), a wynik
 * jest mostem do niej — nie procentem. Blok „Co dalej” niczego nie uczy:
 * zajrzenie do klasy 5 przez trzy zabawki.
 *
 * `kind: 'podsumowanie'` w rejestrze: to ostatnia lekcja modułu, więc powłoka
 * kończy ją kartą „Moduł 9 ukończony”, a że to koniec całego kursu, `finishNote`
 * mówi o kursie, a nie o module.
 */

const IMAGES = imgMap({
  intro: '/images/informatyka/lekcje/test-koncowy/olowek-i-kartka.jpg',
  algo: '/images/informatyka/lekcje/test-koncowy/spirala-z-kulka.jpg',
  arkusz: '/images/informatyka/lekcje/test-koncowy/tacka-z-koralikami.jpg',
  dokument: '/images/informatyka/lekcje/test-koncowy/teczki-i-ramka.jpg',
  siec: '/images/informatyka/lekcje/test-koncowy/skrzynka-z-klodka.jpg',
  dalej: '/images/informatyka/lekcje/test-koncowy/sciezka-na-wzgorze.jpg',
});

const BLOCKS: LessonBlockMeta[] = [
  { id: 'zaklad', kind: 'haczyk', title: 'Zakład z samym sobą', time: '2 min', icon: Dices },
  { id: 'czesc-a', kind: 'quiz', title: PARTS[0].title, time: '6 min', icon: Blocks },
  { id: 'czesc-b', kind: 'quiz', title: PARTS[1].title, time: '6 min', icon: Table2 },
  { id: 'czesc-c', kind: 'quiz', title: PARTS[2].title, time: '6 min', icon: FileImage },
  { id: 'czesc-d', kind: 'quiz', title: PARTS[3].title, time: '6 min', icon: ShieldCheck },
  { id: 'wynik', kind: 'refleksja', title: 'Wynik i most do klasy 5', time: '4 min', icon: Signpost },
  { id: 'co-dalej', kind: 'wyjasnienie', title: 'Co dalej: zajrzyj do klasy 5', time: '6 min', icon: Telescope },
];

interface LessonProps {
  lesson: InfoLesson;
  infoModule: InfoModule;
  nextLesson?: InfoLesson;
  nextModule?: InfoModule;
}

export function TestKoncowyLesson({ lesson, infoModule, nextLesson, nextModule }: LessonProps) {
  return (
    <InfoLessonShell
      lesson={lesson}
      infoModule={infoModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      nextModule={nextModule}
      finishNote="To był cały kurs informatyki klasy 4: od pierwszego biurka po własny projekt. Do zobaczenia w klasie 5 — i pamiętaj, o czym mówiła złota nić: pomyśl, zrób, sprawdź."
    >
      <LessonBody color={infoModule.color} />
    </InfoLessonShell>
  );
}

/** Treść wydzielona z komponentu strony, bo `useBlockDone` działa dopiero w kontekście powłoki. */
function LessonBody({ color }: { color: string }) {
  const [bet, setBet] = useState<number[] | null>(null);
  const [scores, setScores] = useState<(number | null)[]>(() => PARTS.map(() => null));

  const betDone = useBlockDone('zaklad');
  const partA = useBlockDone('czesc-a');
  const partB = useBlockDone('czesc-b');
  const partC = useBlockDone('czesc-c');
  const partD = useBlockDone('czesc-d');
  const result = useBlockDone('wynik');
  const next = useBlockDone('co-dalej');
  const partDone = [partA, partB, partC, partD];

  const setScore = (index: number) => (score: number | null) =>
    setScores((prev) => (prev[index] === score ? prev : prev.map((value, i) => (i === index ? score : value))));

  const partImage = [IMAGES.algo, IMAGES.arkusz, IMAGES.dokument, IMAGES.siec];
  const partAlt = [
    'Mała drewniana spirala z rynną, na samej górze której leży szklana kulka, ustawiona na jasnym blacie',
    'Drewniana tacka z czterema rzędami po pięć przegródek, w większości wypełnionych kolorowymi szklanymi koralikami, trzy przegródki są puste',
    'Trzy gładkie teczki rozłożone wachlarzem obok pustej drewnianej ramki na zdjęcie i spinacza',
    'Mała drewniana skrzynka zamknięta prostą mosiężną kłódką, obok papierowy żuraw z origami',
  ];
  const partLead = [
    'Kot idzie tam, gdzie każe skrypt — nie tam, gdzie ci się wydaje.',
    'Arkusz liczy sam, jeśli dasz mu adresy, a nie liczby.',
    'Plik, obraz i tekst mają porządek, którego nie widać, a który trzeba nadać.',
    'Hasło, wynik generatora i dokument, który ktoś jeszcze zobaczy.',
  ];

  return (
    <>
      <LessonIntro color={color} />

      <LessonBlock id="zaklad">
        <ConfidenceBet color={color} onBet={setBet} onComplete={betDone.markBlockDone} />
      </LessonBlock>

      {PARTS.map((part, index) => (
        <LessonBlock key={part.id} id={`czesc-${part.letter.toLowerCase()}`}>
          {index % 2 === 0 ? (
            <LessonImageCard variant="basic" color={color} image={partImage[index]} alt={partAlt[index]} reverse={index === 2}>
              <p>{partLead[index]} Trzy zadania, jedna próba — po każdym zobaczysz, co było do zrobienia.</p>
            </LessonImageCard>
          ) : (
            <LessonImageCard variant="secondary" color={color} image={partImage[index]} alt={partAlt[index]} lead={partLead[index]}>
              Trzy zadania, jedna próba — po każdym zobaczysz, co było do zrobienia.
            </LessonImageCard>
          )}
          <PartFrame color={color} items={part.items} onScore={setScore(index)} onComplete={partDone[index].markBlockDone} />
        </LessonBlock>
      ))}

      <LessonBlock id="wynik">
        <FinalResult color={color} scores={scores} bet={bet} onComplete={result.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="co-dalej">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.dalej}
          alt="Kręta ścieżka z płaskich kamieni wspinająca się na zielone wzgórze ku pustemu drewnianemu drogowskazowi na szczycie"
          lead="Droga nie kończy się na wzgórzu."
        >
          Klasa 5 zaczyna się tam, gdzie kończy się ta — z tymi samymi trzema słowami i większymi projektami.
        </LessonImageCard>
        <NextYearPeek color={color} onComplete={next.markBlockDone} />
      </LessonBlock>
    </>
  );
}

/**
 * Wejście w lekcję: co to za test i plan bloków dla ekranów bez bocznej szyny.
 * Bez numeru — nie jest blokiem, więc nie liczy się do postępu.
 */
function LessonIntro({ color }: { color: string }) {
  return (
    <div className="grid gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_260px]">
      <div className="text-base leading-relaxed sm:text-lg">
        <p>
          Ten test <strong>niczego nie ocenia stopniem</strong> i nie ma w nim ani jednego pytania z trzema
          odpowiedziami. Cztery części po trzy zadania, w których coś <strong>robisz</strong>: przesuwasz znacznik,
          wpisujesz formułę, nadajesz styl, składasz hasło, ustawiasz udostępnianie.
        </p>
        <p className="mt-3">
          Zanim zaczniesz, <strong>obstawisz wynik</strong>. Po teście zobaczysz, czy znasz siebie lepiej niż test — i na
          czym zbudujesz klasę 5. Nie ma się czego bać: chodzi o to, żeby wiedzieć, gdzie stoisz.
        </p>
      </div>

      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Pusta biała kartka papieru i ostro zatemperowany żółty ołówek na jasnym drewnianym biurku w porannym świetle, obok doniczka z bluszczem"
            width={260}
            height={195}
            className="absolute inset-0 h-full w-full object-contain"
            priority
          />
        </div>

        {/* Plan tej lekcji — dla ekranów bez bocznej szyny; powyżej `lg` szyna go dubluje. */}
        <div className="lg:hidden">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Plan tej lekcji</p>
          <ol className="space-y-2">
            {BLOCKS.map((block, index) => (
              <li key={block.id} className="flex items-start gap-3">
                <span className="w-5 shrink-0 font-mono text-sm font-bold tabular-nums" style={{ color }}>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="min-w-0 text-sm leading-snug">
                  <span className="block font-medium">{BLOCK_KINDS[block.kind].label}</span>
                  <span className="block text-xs text-muted-foreground">{block.time}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
