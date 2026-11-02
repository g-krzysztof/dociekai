'use client';

import Image from 'next/image';
import { Bot, Bug, Split } from 'lucide-react';
import {
  BLOCK_KINDS,
  InfoLessonShell,
  LessonBlock,
  useBlockDone,
  type LessonBlockMeta,
} from '../../lesson-shell';
import { PracticeTask } from '../../practice-task';
import { LessonImageCard } from '@/components/ui/lesson-image-card';
import { BreakItDown } from './break-it-down';
import { RobotPlan } from './robot-plan';
import { BugHunt } from './bug-hunt';
import type { InfoModule } from '../../../data/curriculum';
import type { InfoLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

/**
 * Druga lekcja modułu 5 i dwudziesty trzeci kształt lekcji w kursie. **Domyka
 * moduł o myśleniu komputacyjnym** i realizuje temat „podejście komputacyjne do
 * problemu z otoczenia `[1.2]` i planowanie zachowania robota zmierzającego do
 * celu `[1.4]`”. Bez zadania obowiązkowego.
 *
 * Trzy bloki to trzy różne czynności wokół jednego pojęcia — planu:
 *  - `BreakItDown` — **rozłożenie problemu na kroki** z jawnym kryterium
 *    zatrzymania („czy robot wie, jak to zrobić bez zastanawiania się?”); jedna
 *    gałąź rozbija się dwa razy, więc widać, że to nie lista, tylko schodzenie w
 *    dół;
 *  - `RobotPlan` — **sterowanie kontra programowanie** na tej samej planszy:
 *    najpierw pilot, potem cały plan z góry i dopiero wtedy start;
 *  - `BugHunt` — **pierwszy debugger w kursie**: cudzy program wykonywany po
 *    jednej instrukcji, z pointą, że robot rozbija się gdzie indziej, niż jest
 *    błąd.
 *
 * Wspólny silnik `robot.ts` liczy wszystko wykonaniem — żaden werdykt nie jest
 * porównaniem z zapisaną odpowiedzią. Robot jest **relatywny** (zna „naprzód” i
 * „obróć się”, nie zna „w prawo”) i to o tę różnicę rozbija się większość
 * pierwszych planów.
 */

const IMAGES = imgMap({
  intro: '/images/informatyka/lekcje/plan-dla-robota/klocki-i-instrukcja.jpg',
  kanapka: '/images/informatyka/lekcje/plan-dla-robota/skladniki-kanapki.jpg',
  labirynt: '/images/informatyka/lekcje/plan-dla-robota/sznurek-w-labiryncie.jpg',
  zegarek: '/images/informatyka/lekcje/plan-dla-robota/rozlozony-mechanizm.jpg',
  mapa: '/images/informatyka/lekcje/plan-dla-robota/sciezka-z-kamykow.jpg',
});

const BLOCKS: LessonBlockMeta[] = [
  {
    id: 'rozbij-na-kroki',
    kind: 'haczyk',
    title: 'Kanapka w dwunastu krokach',
    time: '6 min',
    icon: Split,
  },
  {
    id: 'pilot-czy-program',
    kind: 'symulator',
    title: 'Pilot czy program?',
    time: '8 min',
    icon: Bot,
  },
  {
    id: 'znajdz-blad',
    kind: 'debugowanie',
    title: 'Robot Kuby nie dojeżdża',
    time: '7 min',
    icon: Bug,
  },
  {
    id: 'plan-na-poranek',
    kind: 'zadanie',
    title: 'Napisz plan, który ktoś wykona dosłownie',
    time: '10 min',
  },
];

interface LessonProps {
  lesson: InfoLesson;
  infoModule: InfoModule;
  nextLesson?: InfoLesson;
}

export function PlanDlaRobotaLesson({ lesson, infoModule, nextLesson }: LessonProps) {
  return (
    <InfoLessonShell
      lesson={lesson}
      infoModule={infoModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Rozbiłeś/rozbiłaś kanapkę na kroki wykonalne bez zastanawiania, przeprowadziłeś/przeprowadziłaś robota raz pilotem i raz programem, i znalazłeś/znalazłaś w cudzym programie jedną instrukcję, przez którą wszystko się sypało. To już jest programowanie — brakuje tylko języka, w którym się je zapisuje. Ten zaczyna się w następnym module."
    >
      <LessonBody color={infoModule.color} />
    </InfoLessonShell>
  );
}

/** Treść wydzielona z komponentu strony, bo `useBlockDone` działa dopiero w kontekście powłoki. */
function LessonBody({ color }: { color: string }) {
  const split = useBlockDone('rozbij-na-kroki');
  const plan = useBlockDone('pilot-czy-program');
  const bug = useBlockDone('znajdz-blad');
  const task = useBlockDone('plan-na-poranek');

  return (
    <>
      <LessonIntro color={color} />

      <LessonBlock id="rozbij-na-kroki">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.kanapka}
          alt="Na jasnym blacie leżą obok siebie, każdy osobno, składniki kanapki — kromka chleba, kostka masła na białym spodeczku i drewniana deska z nożem"
          lead="„Zrób kanapkę” to nie jest polecenie. To nazwa całej roboty."
        >
          Robot nie domyśli się niczego. Zanim cokolwiek zrobi, ktoś musi{' '}
          <strong>rozłożyć zadanie na kroki tak drobne</strong>, że każdy da się wykonać bez
          zastanawiania. Spróbuj — zobaczysz, że niektóre kroki trzeba rozbić dwa razy.
        </LessonImageCard>
        <BreakItDown color={color} onComplete={split.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="pilot-czy-program">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.labirynt}
          alt="Labirynt z przyciętego żywopłotu widziany z góry, a przez jego korytarze poprowadzona jest cienka czerwona nitka biegnąca od wejścia aż do samego środka"
          reverse
        >
          <p>
            Prowadzić kogoś przez labirynt można na dwa sposoby: iść obok i mówić „teraz w lewo”
            albo <strong>dać mu sznurek przygotowany wcześniej</strong> i zostać przed wejściem.
            Pierwsze to sterowanie, drugie — program. Zaraz zrobisz jedno i drugie na tej samej
            planszy.
          </p>
        </LessonImageCard>
        <RobotPlan color={color} onComplete={plan.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="znajdz-blad">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.zegarek}
          alt="Rozłożony mechanizm starego zegarka kieszonkowego na jasnym blacie — dwa mosiężne kółka zębate, zwinięta sprężyna i kilka maleńkich śrubek leżą obok pustej koperty zegarka"
          lead="Zegarek staje nie tam, gdzie pękła sprężynka."
          reverse
        >
          Z programem jest identycznie: <strong>robot rozbija się kilka kroków po błędzie</strong>,
          a nie na nim. Dlatego programów nie ogląda się w całości — wykonuje się je po jednej
          instrukcji i sprawdza, w którym momencie przestało być dobrze.
        </LessonImageCard>
        <BugHunt color={color} onComplete={bug.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="plan-na-poranek">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.mapa}
          alt="Cienki sznurek rozłożony na jasnym blacie w długą, wijącą się trasę — od drewnianego kołka na jednym końcu, przez pięć gładkich kamyków ułożonych jeden za drugim, do drewnianego kołka na drugim końcu"
        >
          <p>
            Na koniec sprawdzian, którego nie da się oszukać:{' '}
            <strong>niech twój plan wykona prawdziwy człowiek</strong> — dosłownie, bez domyślania
            się. To najszybszy sposób, żeby zobaczyć, ile rzeczy w twojej głowie było oczywistych, a
            w planie ich nie było.
          </p>
        </LessonImageCard>
        <PracticeTask
          color={color}
          onComplete={task.markBlockDone}
          brief={
            <>
              <strong>Napisz plan jednej zwykłej czynności</strong> — zrobienia herbaty, spakowania
              plecaka na jutro, posłania łóżka — rozłożony na kroki tak drobne, że da się je
              wykonać bez zastanawiania. Potem poproś kogoś z domu, żeby wykonał go{' '}
              <strong>dokładnie tak, jak napisałeś/napisałaś</strong>, i nie domyślał się niczego.
            </>
          }
          sections={[
            {
              label: 'Plan',
              items: [
                'Wybrałem/wybrałam jedną czynność i zapisałem/zapisałam ją jako ponumerowaną listę kroków.',
                'Przy każdym kroku sprawdziłem/sprawdziłam: czy da się go wykonać bez zastanawiania? Jeśli nie — rozbiłem/rozbiłam go na mniejsze.',
                'Kroki są w takiej kolejności, w jakiej da się je wykonać (nic nie wymaga czegoś, czego jeszcze nie ma).',
              ],
            },
            {
              label: 'Próba na żywo',
              items: [
                'Poprosiłem/poprosiłam kogoś z domu o wykonanie planu dosłownie, krok po kroku.',
                'Nie podpowiadałem/podpowiadałam w trakcie — nawet gdy bardzo chciałem/chciałam.',
                'Zapisałem/zapisałam, w którym kroku wykonawca się zatrzymał albo zrobił coś innego, niż miałem/miałam na myśli.',
              ],
            },
            {
              label: 'Poprawka',
              items: [
                'Poprawiłem/poprawiłam plan w tych miejscach, w których się zaciął.',
                'Umiem powiedzieć, czego w planie brakowało — i dlaczego mnie samemu/samej wydawało się to oczywiste.',
              ],
            },
          ]}
          hint={
            <>
              Najczęstsze miejsca, w których takie plany się sypią: brak kroku „weź”, brak
              powiedzenia <strong>gdzie</strong> coś jest, i kolejność („zalej wrzątkiem” przed
              „wrzuć torebkę”). Jeśli masz młodsze rodzeństwo, jest idealnym wykonawcą — dzieci
              wykonują polecenia dosłownie o wiele chętniej niż dorośli.
            </>
          }
        />
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
          Instrukcja składania mebla nie mówi „zmontuj szafkę”. Mówi: weź śrubę A, włóż w otwór 3,
          dokręć. <strong>Ktoś rozłożył całą robotę na kroki</strong>, żebyś nie musiał/musiała
          niczego się domyślać — i dokładnie to samo robi się dla komputera.
        </p>
        <p className="mt-3">
          W tej lekcji rozłożysz na kroki zwykłą kanapkę, przeprowadzisz robota przez planszę
          najpierw pilotem, a potem programem napisanym z góry, i znajdziesz w cudzym programie
          jedną instrukcję, przez którą wszystko się sypie. Nadal bez pisania kodu — ale to już jest
          programowanie.
        </p>
      </div>

      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Widziane z góry części do składania mebla, rozłożone w osobne grupki na jasnym tle — kupka drewnianych kołków, kupka wkrętów, dwa metalowe łączniki i dwie gładkie deski"
            width={260}
            height={195}
            className="absolute inset-0 h-full w-full object-contain"
            priority
          />
        </div>

        {/* Plan tej lekcji — dla ekranów bez bocznej szyny; powyżej `lg` szyna go dubluje. */}
        <div className="lg:hidden">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Plan tej lekcji
          </p>
          <ol className="space-y-2">
            {BLOCKS.map((block, index) => (
              <li key={block.id} className="flex items-start gap-3">
                <span
                  className="w-5 shrink-0 font-mono text-sm font-bold tabular-nums"
                  style={{ color }}
                >
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
