'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Bug, ClipboardList, Gamepad2, HeartHandshake, Lightbulb, Rocket } from 'lucide-react';
import {
  BLOCK_KINDS,
  InfoLessonShell,
  LessonBlock,
  useBlockDone,
  type LessonBlockMeta,
} from '../../lesson-shell';
import { LessonImageCard } from '@/components/ui/lesson-image-card';
import { BuggyQuizDemo } from './buggy-quiz-demo';
import { IdeaSparks } from './idea-sparks';
import { ProjectPlanner } from './project-planner';
import { TesterRound } from './tester-round';
import { ProjectTask } from './project-task';
import { ProjectReflection } from './project-reflection';
import { EMPTY_PLAN, type ProjectPlan } from './plan';
import type { InfoModule } from '../../../data/curriculum';
import type { InfoLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

/**
 * Trzecia i ostatnia lekcja modułu 8 — **doświadczenie edukacyjne**, obowiązkowe
 * raz w roku: dziecko wymyśla własny quiz albo grę, buduje go, oddaje do testów
 * co najmniej dwóm innym osobom, poprawia i pokazuje efekt. Wariant 1 z aneksu
 * programu (decyzja 2026-09-06), a „praca zespołowa" u dziecka
 * uczącego się samodzielnie jest zrealizowana jako testy u realnych ludzi
 * z otoczenia, nie jako fikcyjna grupa.
 *
 * **Cała lekcja stoi na jednym zdaniu: autor swojego programu nie przetestuje
 * — prawdziwy test przychodzi dopiero od kogoś, kto nie widział, jak to
 * budowałeś.** Haczyk to udowadnia na cudzym, celowo zepsutym quizie (każda
 * odpowiedź dostaje „Super, dobrze!"), a testerzy w bloku 4 pokazują to samo
 * na cudzej, gotowej grze — zanim dziecko usłyszy to samo od swoich własnych
 * testerów w zadaniu.
 *
 * Zadanie tej lekcji dzieje się **w całości na stronie** — zero pliku, zero
 * zewnętrznego programu (patrz `project-task.tsx`). Dziecko buduje własny
 * quiz albo grę wprost tutaj (`QuizBuilder`/`GameBuilder`), gra w to, co
 * zbudowało (`QuizPlayer`/`GamePlayer` — nagrodą jest rozgrywka, nie ptaszek),
 * a potem podaje URZĄDZENIE co najmniej dwóm innym osobom, żeby zagrały w to
 * samo na tym samym ekranie — bez eksportu, importu ani „Zapisz jako”. Karta
 * projektu jest jedynym stanem dzielonym między blokami — dziecko wypełnia ją
 * w bloku 3, zadanie ją przypomina, a refleksja pokazuje ją z powrotem jako
 * gotową rzecz.
 */

const IMAGES = imgMap({
  intro: '/images/informatyka/lekcje/projekt-roczny/labirynt-biurko.jpg',
  iskry: '/images/informatyka/lekcje/projekt-roczny/karty-wachlarz.jpg',
  karta: '/images/informatyka/lekcje/projekt-roczny/karty-w-stojaku.jpg',
  testerzy: '/images/informatyka/lekcje/projekt-roczny/dwa-olowki-labirynt.jpg',
  gotowe: '/images/informatyka/lekcje/projekt-roczny/labirynt-gotowy.jpg',
});

const BLOCKS: LessonBlockMeta[] = [
  {
    id: 'quiz-ali',
    kind: 'haczyk',
    title: 'Quiz, który zawsze chwali',
    time: '4 min',
    icon: Gamepad2,
  },
  {
    id: 'cztery-kroki',
    kind: 'wyjasnienie',
    title: 'Cztery kroki i iskry pomysłów',
    time: '6 min',
    icon: Lightbulb,
  },
  {
    id: 'karta-projektu',
    kind: 'cwiczenie',
    title: 'Karta projektu',
    time: '7 min',
    icon: ClipboardList,
  },
  {
    id: 'test-u-kuby',
    kind: 'debugowanie',
    title: 'Test u Zosi i taty',
    time: '5 min',
    icon: Bug,
  },
  {
    id: 'budowa',
    kind: 'zadanie',
    title: 'Zadanie: zbuduj, zagraj, pokaż komuś',
    time: '15–20 min',
    icon: Rocket,
  },
  {
    id: 'gotowy-projekt',
    kind: 'refleksja',
    title: 'Twój gotowy projekt',
    time: '4 min',
    icon: HeartHandshake,
  },
];

interface LessonProps {
  lesson: InfoLesson;
  infoModule: InfoModule;
  nextLesson?: InfoLesson;
}

export function ProjektRocznyLesson({ lesson, infoModule, nextLesson }: LessonProps) {
  return (
    <InfoLessonShell
      lesson={lesson}
      infoModule={infoModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Przeszedłeś/przeszłaś cały cykl: pomysł, budowa, testy u kogoś innego, poprawki. To jest twoje własne doświadczenie edukacyjne na ten rok — i domyka moduł 8."
    >
      <LessonBody color={infoModule.color} />
    </InfoLessonShell>
  );
}

/** Treść wydzielona z komponentu strony, bo `useBlockDone` działa dopiero w kontekście powłoki. */
function LessonBody({ color }: { color: string }) {
  const [plan, setPlan] = useState<ProjectPlan>(EMPTY_PLAN);

  const quiz = useBlockDone('quiz-ali');
  const cycle = useBlockDone('cztery-kroki');
  const card = useBlockDone('karta-projektu');
  const tester = useBlockDone('test-u-kuby');
  const task = useBlockDone('budowa');
  const reflection = useBlockDone('gotowy-projekt');

  const pickTopic = (label: string, idea: string) => {
    setPlan((prev) => ({ ...prev, temat: label || prev.temat, zasada: prev.zasada || idea }));
  };

  return (
    <>
      <LessonIntro color={color} />

      <LessonBlock id="quiz-ali">
        <BuggyQuizDemo color={color} onComplete={quiz.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="cztery-kroki">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.iskry}
          alt="Kilka pustych papierowych karteczek rozłożonych wachlarzem na drewnianym biurku, obok leży ołówek"
          lead="Osiem iskier, jeden wybrany temat."
        >
          Zanim zaczniesz budować, wybierz, o czym ma być Twój projekt. Nie musi to być ten sam
          temat, który wybierzesz w karcie projektu — to tylko rozgrzewka.
        </LessonImageCard>
        <IdeaSparks color={color} onPickTopic={pickTopic} onComplete={cycle.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="karta-projektu">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.karta}
          alt="Kilka pustych papierowych karteczek ustawionych pionowo w drewnianym stojaku na biurku, jedna po drugiej w rządku"
          reverse
        >
          <p>
            Teraz Twoja kolej: wypełnij kartę projektu. To plan, nie zobowiązanie — wolno Ci go
            zmienić, kiedy zaczniesz budować naprawdę.
          </p>
        </LessonImageCard>
        <ProjectPlanner color={color} plan={plan} onChange={setPlan} onComplete={card.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="test-u-kuby">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.testerzy}
          alt="Dwa kolorowe ołówki, niebieski i pomarańczowy, leżące skierowane grotami w stronę siebie na pustej kartce papieru"
          lead="Dwie osoby, dwa różne zderzenia z tym samym projektem."
        >
          Zanim poprosisz własnych testerów o opinię, poćwicz na cudzym przykładzie — grze Kuby,
          która wygląda na gotową.
        </LessonImageCard>
        <TesterRound color={color} onComplete={tester.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="budowa">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.gotowe}
          alt="Drewniana układanka labiryntowa leżąca na biurku obok stosu papierowych karteczek związanych sznurkiem"
          reverse
        >
          <p>
            Dokończ swój projekt według karty z bloku 3 — tu, na tej stronie. Zagraj w niego sam/sama,
            a potem podaj urządzenie co najmniej dwóm innym osobom, żeby zagrały w to samo.
          </p>
        </LessonImageCard>
        <ProjectTask color={color} plan={plan} onComplete={task.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="gotowy-projekt">
        <ProjectReflection color={color} plan={plan} onComplete={reflection.markBlockDone} />
      </LessonBlock>
    </>
  );
}

/**
 * Wejście w lekcję: pytanie, na które odpowiada, i plan bloków dla ekranów bez
 * bocznej szyny. Bez numeru — nie jest blokiem, więc nie liczy się do postępu.
 */
function LessonIntro({ color }: { color: string }) {
  return (
    <div className="grid gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_260px]">
      <div className="text-base leading-relaxed sm:text-lg">
        <p>
          Cały rok uczyłeś/uczyłaś się budować rzeczy w komputerze — teraz zbudujesz coś{' '}
          <strong>własnego, od pomysłu do końca</strong>: quiz albo grę, które ktoś naprawdę zagra —
          tu, na tej stronie.
        </p>
        <p className="mt-3">
          To jest tak zwane <strong>doświadczenie edukacyjne</strong> — obowiązkowe raz w roku, ale
          nie chodzi o formalność. Chodzi o jedno zdanie, którego dowiesz się w pierwszym bloku:{' '}
          <strong>autor swojego programu nie przetestuje</strong>. Dlatego zanim uznasz projekt za
          gotowy, odda go do testów co najmniej dwóm innym osobom.
        </p>
      </div>

      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Drewniana układanka labiryntowa z metalową kulką leżąca na biurku obok kilku pustych papierowych karteczek i ołówka"
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
