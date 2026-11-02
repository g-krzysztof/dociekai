'use client';

import Image from 'next/image';
import { Hand, Palette, Undo2 } from 'lucide-react';
import {
  BLOCK_KINDS,
  InfoLessonShell,
  LessonBlock,
  useBlockDone,
  type LessonBlockMeta,
} from '../../lesson-shell';
import { PracticeTask } from '../../practice-task';
import { LessonImageCard } from '@/components/ui/lesson-image-card';
import { SteadyHand } from './steady-hand';
import { ToolBench } from './tool-bench';
import { LeakHunt } from './leak-hunt';
import { HistoryScrub } from './history-scrub';
import type { InfoModule } from '../../../data/curriculum';
import type { InfoLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

/**
 * Pierwsza lekcja modułu 3 i czternasty kształt lekcji w kursie. Realizuje
 * `[3.1]` w zakresie „narzędzia, kolory, cofanie zmian, figury i linie, praca
 * na powiększeniu”.
 *
 * Cały temat da się **przeżyć**, więc nie ma tu ani jednego bloku typu „wybierz
 * opcję, przeczytaj wyjaśnienie”. Cztery bloki to cztery różne rzeczy robione
 * palcami:
 *  - `SteadyHand` — dziecko rysuje odręcznie, a strona **mierzy jego rękę**
 *    (odchyłka od prostej, wahanie promienia), potem to samo robi narzędziem;
 *  - `ToolBench` — **działający edytor**: prawdziwe wypełnianie obszaru, linia
 *    Bresenhama, figury z „równo” (czyli Shift), cofanie ze stosu migawek;
 *    sześć zamówień sprawdzanych po wykonanej operacji, nie po wyborze z menu;
 *  - `LeakHunt` — pierwszy w kursie blok `debugowanie`: kubełek wycieka przez
 *    dziurę wielkości jednej kratki, a znaleźć ją da się dopiero na powiększeniu;
 *  - `HistoryScrub` — **przewijana oś historii**: cofanie zdejmuje z końca, nowy
 *    krok ucina gałąź „ponów”, a pamięć edytora ma dno.
 *
 * Piąty blok to zadanie w prawdziwym programie — **nie jest** zadaniem
 * obowiązkowym Z-1…Z-10 (Z-5 przypada na następną lekcję, o koniczynie).
 */

const IMAGES = imgMap({
  intro: '/images/informatyka/lekcje/edytor-grafiki/cyrkiel-i-ekierka.jpg',
  reka: '/images/informatyka/lekcje/edytor-grafiki/sznurek-napiety.jpg',
  powiekszenie: '/images/informatyka/lekcje/edytor-grafiki/lupa-na-plotnie.jpg',
  cofanie: '/images/informatyka/lekcje/edytor-grafiki/grabie-i-piasek.jpg',
  zadanie: '/images/informatyka/lekcje/edytor-grafiki/sztaluga-puste-plotno.jpg',
});

const BLOCKS: LessonBlockMeta[] = [
  {
    id: 'reka-i-narzedzie',
    kind: 'haczyk',
    title: 'Twoja ręka kontra narzędzie',
    time: '5 min',
    icon: Hand,
  },
  {
    id: 'przybornik',
    kind: 'symulator',
    title: 'Sześć zamówień, sześć narzędzi',
    time: '8 min',
    icon: Palette,
  },
  {
    id: 'wyciek',
    kind: 'debugowanie',
    title: 'Kolor uciekł z rysunku',
    time: '6 min',
  },
  {
    id: 'cofanie',
    kind: 'cwiczenie',
    title: 'Cofnij — ale mądrze',
    time: '5 min',
    icon: Undo2,
  },
  {
    id: 'wlasny-obrazek',
    kind: 'zadanie',
    title: 'Twój obrazek w prawdziwym edytorze',
    time: '6 min',
  },
];

interface LessonProps {
  lesson: InfoLesson;
  infoModule: InfoModule;
  nextLesson?: InfoLesson;
}

export function EdytorGrafikiLesson({ lesson, infoModule, nextLesson }: LessonProps) {
  return (
    <InfoLessonShell
      lesson={lesson}
      infoModule={infoModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Zmierzyłeś/zmierzyłaś własną rękę, zrobiłeś/zrobiłaś obrazek z sześciu zamówień, znalazłeś/znalazłaś dziurę wielkości jednej kratki i przewinąłeś/przewinęłaś historię rysunku tam i z powrotem. Zostaje jedno zdanie na resztę modułu: w edytorze grafiki prawie nigdy nie warto rysować ręką tego, co program narysuje za ciebie."
    >
      <LessonBody color={infoModule.color} />
    </InfoLessonShell>
  );
}

/** Treść wydzielona z komponentu strony, bo `useBlockDone` działa dopiero w kontekście powłoki. */
function LessonBody({ color }: { color: string }) {
  const hand = useBlockDone('reka-i-narzedzie');
  const bench = useBlockDone('przybornik');
  const leak = useBlockDone('wyciek');
  const history = useBlockDone('cofanie');
  const task = useBlockDone('wlasny-obrazek');

  return (
    <>
      <LessonIntro color={color} />

      <LessonBlock id="reka-i-narzedzie">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.reka}
          alt="Sznurek naprężony w idealnie prostą linię między dwoma drewnianymi kołkami wbitymi w ziemię, a obok ten sam sznurek rzucony luźno na ziemię w plątaninę pętli"
          lead="Ten sam sznurek. Raz naprężony, raz rzucony luzem."
        >
          Zanim poznasz narzędzia, zrób coś ręką. Narysujesz prostą kreskę i koło — najpierw palcem
          albo myszką, potem tym samym zadaniem w narzędziu. Strona zmierzy jedno i drugie i pokaże
          ci liczby.
        </LessonImageCard>
        <SteadyHand color={color} onComplete={hand.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="przybornik">
        <ToolBench color={color} onComplete={bench.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="wyciek">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.powiekszenie}
          alt="Szklana lupa w mosiężnej oprawie leży na kawałku zgrzebnego lnianego płótna, a przez jej szkło widać mocno powiększone pojedyncze nitki splotu i kwadratowe prześwity między nimi"
        >
          <p>
            Najczęstsza awaria w edytorze grafiki wygląda tak: klikasz kubełkiem w środku rysunku, a
            kolor zalewa <strong>całe płótno</strong>. Program nie jest zepsuty — po prostu robi
            dokładnie to, co mu kazano. Twoim zadaniem jest znaleźć przyczynę, a ona jest wielkości
            jednej kratki.
          </p>
        </LessonImageCard>
        <LeakHunt color={color} onComplete={leak.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="cofanie">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.cofanie}
          alt="Grabki z długim drewnianym trzonkiem leżą na wygładzonym piasku, na którym widać kilka równych śladów po zębach i jedno miejsce zagrabione z powrotem do gładka"
          lead="Ślady można wygładzić. Ale tylko te z wierzchu."
          reverse
        >
          Ctrl+Z zna każdy. Mało kto wie, że cofanie zdejmuje wyłącznie z końca, że po narysowaniu
          czegoś nowego „ponów” przestaje działać i że program pamięta tylko kilka ostatnich kroków.
          Przewiń historię tego rysunku i sprawdź to sam/sama.
        </LessonImageCard>
        <HistoryScrub color={color} onComplete={history.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="wlasny-obrazek">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.zadanie}
          alt="Drewniana sztaluga z czystym, pustym płótnem stoi przy oknie, obok niski stołek i słoik z wodą"
          reverse
        >
          <p>
            Teraz to samo w prawdziwym programie, poza tą stroną. Nie chodzi o ładny obrazek —
            chodzi o to, żeby{' '}
            <strong>każde narzędzie z tej lekcji przynajmniej raz przeszło ci przez ręce</strong>,
            razem z powiększeniem i cofaniem.
          </p>
        </LessonImageCard>
        <PracticeTask
          color={color}
          onComplete={task.markBlockDone}
          brief={
            <>
              <strong>Otwórz edytor grafiki i narysuj jeden obrazek</strong> — dom, rakietę,
              potwora, cokolwiek. Warunek jest jeden: ma w nim być użyte każde narzędzie, które
              poznałeś/poznałaś w tej lekcji.
            </>
          }
          sections={[
            {
              label: 'Narzędzia',
              items: [
                'Tło zamalowałem/zamalowałam kubełkiem — jednym kliknięciem, nie kreską po kresce.',
                'Narysowałem/narysowałam co najmniej jeden prostokąt i jedno koło narzędziem figur.',
                'Trzymając Shift zrobiłem/zrobiłam idealny kwadrat albo idealne koło.',
                'Co najmniej jedną kreskę zrobiłem/zrobiłam narzędziem Linia, a nie odręcznie.',
                'Użyłem/użyłam co najmniej trzech różnych kolorów.',
                'Coś poprawiłem/poprawiłam gumką.',
              ],
            },
            {
              label: 'Powiększenie i cofanie',
              items: [
                'Powiększyłem/powiększyłam obraz i zobaczyłem/zobaczyłam pojedyncze kwadraciki, z których się składa.',
                'Na powiększeniu poprawiłem/poprawiłam co najmniej jedno miejsce ołówkiem.',
                'Co najmniej raz cofnąłem/cofnęłam zmianę skrótem Ctrl+Z.',
                'Sprawdziłem/sprawdziłam, ile razy z rzędu mój program pozwala cofnąć.',
              ],
            },
            {
              label: 'Zapis',
              items: [
                'Zapisałem/zapisałam plik pod nazwą, po której za miesiąc poznam, co to jest.',
                'Zamknąłem/zamknęłam program i otworzyłem/otworzyłam plik jeszcze raz, żeby sprawdzić, czy zapis się udał.',
              ],
            },
          ]}
          hint={
            <>
              Program: <strong>Paint</strong> (Windows), <strong>Paintbrush</strong> albo{' '}
              <strong>Podgląd</strong> (macOS), <strong>GIMP</strong>, <strong>Krita</strong>,{' '}
              <strong>Tux Paint</strong> — albo <strong>jspaint.app</strong> prosto w przeglądarce,
              jeśli nie masz nic zainstalowanego. Powiększenie bywa podpisane „Lupa”, „Zoom” albo
              procentami (100%, 400%). Jeśli kolor ucieknie z konturu — już wiesz, czego szukać.
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
          W edytorze grafiki <strong>prawie nic nie rysuje się ręką</strong>. Prostą kreskę robi
          narzędzie Linia, okrąg — Elipsa, całe tło — jedno kliknięcie kubełkiem. Ręka zostaje do
          rzeczy, których program nie wymyśli.
        </p>
        <p className="mt-3">
          Zaczniemy od pomiaru: narysujesz to samo raz ręką, raz narzędziem, i zobaczysz różnicę w
          liczbach. Potem zrobisz obrazek na sześć zamówień, znajdziesz dziurę, przez którą ucieka
          kolor, i przewiniesz historię rysunku tam i z powrotem.
        </p>
      </div>

      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Mosiężny cyrkiel i drewniany trójkąt kreślarski o gładkich, pustych krawędziach leżą obok siebie na jasnej desce"
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
