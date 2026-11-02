'use client';

import Image from 'next/image';
import { Landmark, Map, Footprints, Signpost } from 'lucide-react';
import {
  HIST_BLOCK_KINDS,
  HistLessonShell,
  LessonBlock,
  useBlockDone,
  type HistBlockMeta,
} from '../../lesson-shell';
import { Przypominajka } from '../../przypominajka';
import { LessonImageCard } from '@/components/ui/lesson-image-card';
import { imgMap } from '@/lib/media';
import { TropyMiasteczka } from './tropy-miasteczka';
import { PanoramaUlicy } from './panorama-ulicy';
import { RadaMiasteczka } from './rada-miasteczka';
import { MetodaWeWsi } from './metoda-we-wsi';
import { FlagaNaRatuszu } from './flaga-na-ratuszu';
import { getLesson } from '../../../data/lessons';
import type { HistModule } from '../../../data/curriculum';
import type { HistLesson } from '../../../data/lessons';

/**
 * L13 — ślady historii w okolicy. `[2.3]` `[2.4]`, doświadczenie 1c (część).
 * Czwarta lekcja modułu 3.
 *
 * **Zdanie lekcji: historia każdej okolicy jest zapisana w nazwach ulic,
 * kształcie rynku i starych murach — trzeba tylko wiedzieć, na co patrzeć.**
 *
 * Cztery bloki, wszystko na **wymyślonych** miejscach (Zawidełki, Olszynka):
 *  - `TropyMiasteczka` — **stuka tropy na planie** i przenosi je na oś
 *    miasteczka (kolumna wieku, gdy trop mówi KIEDY) albo na półkę „Co tu
 *    było” (gdy mówi tylko CO); z każdego tropu zostaje reguła;
 *  - `PanoramaUlicy` — **przesuwa panoramę ulicy** i szuka czterech form
 *    pamięci o nauczycielce (tablica, ulica, pomnik, mural) między wabikami;
 *  - `RadaMiasteczka` — głosy mieszkańców, **pieczęć rady** na projekcie,
 *    **suwak 20 lat** z obiema przyszłościami; ochrona prawna zabytków;
 *  - `MetodaWeWsi` — **przykłada reguły z miasteczka do śladów we wsi**;
 *    werdykt: budynek, nazwa, pamiątka i każda reguła trafna; nagroda: karta
 *    badacza „Moja okolica”.
 *
 * Przypominajka: flaga w oknie ratusza (L10, dystans 3).
 */

const IMAGES = imgMap({
  intro: '/images/historia/lekcje/slady-historii-w-okolicy/rynek.jpg',
  pomnik: '/images/historia/lekcje/slady-historii-w-okolicy/pomnik.jpg',
  spichlerz: '/images/historia/lekcje/slady-historii-w-okolicy/spichlerz.jpg',
  kapliczka: '/images/historia/lekcje/slady-historii-w-okolicy/kapliczka.jpg',
});

const BLOCKS: HistBlockMeta[] = [
  { id: 'tropy', kind: 'sledztwo', title: 'Miasteczko, które mówi', time: '8 min', icon: Map },
  { id: 'pamiec', kind: 'cwiczenie', title: 'Cztery sposoby pamiętania', time: '4 min', icon: Footprints },
  { id: 'spichlerz', kind: 'dylemat', title: 'Spichlerz czy parking?', time: '5 min', icon: Landmark },
  { id: 'wies', kind: 'zadanie', title: 'Czy metoda działa gdzie indziej?', time: '7 min', icon: Signpost },
];

const L10_LESSON = getLesson('mala-i-duza-ojczyzna', 'symbole-narodowe');

interface LessonProps {
  lesson: HistLesson;
  histModule: HistModule;
  nextLesson?: HistLesson;
}

export function SladyHistoriiWOkolicyLesson({ lesson, histModule, nextLesson }: LessonProps) {
  return (
    <HistLessonShell
      lesson={lesson}
      histModule={histModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Przeczytałeś/łaś historię miasteczka, której nikt nie spisał: z prostokątnego rynku, nazw ulic, kolumny, dworca i muralu. Znalazłeś/łaś cztery sposoby, w jakie miejsce pamięta swoją bohaterkę, poprowadziłeś/łaś radę miasteczka i zobaczyłeś/łaś, dlaczego zabytków pilnuje prawo. A potem te same reguły zadziałały w zupełnie innym miejscu — we wsi. Zadziałają i u ciebie: historia każdej okolicy jest zapisana w nazwach ulic, kształcie rynku i starych murach — trzeba tylko wiedzieć, na co patrzeć."
      entry={
        L10_LESSON ? (
          <Przypominajka from={L10_LESSON} distance={3} color={histModule.color}>
            <FlagaNaRatuszu color={histModule.color} />
          </Przypominajka>
        ) : undefined
      }
    >
      <LessonBody color={histModule.color} />
    </HistLessonShell>
  );
}

/** Treść wydzielona z komponentu strony, bo `useBlockDone` działa dopiero w kontekście powłoki. */
function LessonBody({ color }: { color: string }) {
  const tropy = useBlockDone('tropy');
  const pamiec = useBlockDone('pamiec');
  const spichlerz = useBlockDone('spichlerz');
  const wies = useBlockDone('wies');

  return (
    <>
      <LessonIntro color={color} />

      <LessonBlock id="tropy">
        <TropyMiasteczka color={color} onComplete={tropy.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="pamiec">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.pomnik}
          alt="Akwarela: jesienny park w miasteczku — chłopiec z plecakiem i jego mama w płaszczu stoją przed brązowym pomnikiem kobiety w długiej sukni z otwartą książką w rękach, na gładkim kamiennym cokole; żółte liście, ławki, latarnia i dachy kamienic w tle"
          lead="Kto stoi na cokole?"
        >
          Nie zawsze król albo wódz. Czasem ktoś, kto zrobił dużo dobrego dla jednego miejsca —
          i to miejsce nie chce o nim zapomnieć.
        </LessonImageCard>
        <div className="mt-4">
          <PanoramaUlicy color={color} onComplete={pamiec.markBlockDone} />
        </div>
      </LessonBlock>

      <LessonBlock id="spichlerz">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.spichlerz}
          alt="Akwarela: stary drewniany spichlerz o konstrukcji szkieletowej, z wysokim stromym dachem z gontu i drewnianymi okiennicami, stoi na kamiennych słupkach nad spokojną rzeką; obok płacząca wierzba i jesienne drzewo, w oddali kamienny most i domy miasteczka z wieżą kościoła"
          lead="Pusty od lat."
          reverse
        >
          Kiedyś trzymano tu zboże z całej okolicy. Dziś nikt go nie używa, a dach przecieka.
          Co z nim zrobić?
        </LessonImageCard>
        <div className="mt-4">
          <RadaMiasteczka color={color} onComplete={spichlerz.markBlockDone} />
        </div>
      </LessonBlock>

      <LessonBlock id="wies">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.kapliczka}
          alt="Akwarela: biała kapliczka z daszkiem z dachówki i figurką w niszy stoi pod starą kwitnącą lipą przy polnej drodze; za polami zboża widać wieś z drewnianym kościołem z gontową wieżą i wiatrak na wzgórzu"
          lead="Wieś też ma swoją historię."
        >
          Nie ma tu rynku ani dworca. Ale są kapliczki, stary kościół, młyn i nazwy dróg.
          Czy reguły z miasteczka zadziałają także tutaj?
        </LessonImageCard>
        <div className="mt-4">
          <MetodaWeWsi color={color} onComplete={wies.markBlockDone} />
        </div>
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
          Codziennie mijasz ulice, place i stare domy. Wyglądają zwyczajnie. A jednak ktoś je
          kiedyś nazwał, wytyczył i zbudował — i każda z tych decyzji zostawiła ślad, który da się
          przeczytać jak kronikę.
        </p>
        <p className="mt-3">
          Dziś przeczytasz historię miasteczka z jego planu, znajdziesz cztery sposoby pamiętania,
          zdecydujesz o losie starego spichlerza i sprawdzisz swoją metodę we wsi. Wszystko stoi na
          jednym zdaniu:{' '}
          <strong>
            historia każdej okolicy jest zapisana w nazwach ulic, kształcie rynku i starych murach —
            trzeba tylko wiedzieć, na co patrzeć.
          </strong>
        </p>
      </div>

      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Akwarela: małe miasteczko z lotu ptaka — prostokątny brukowany rynek z ratuszem z wieżyczką zegarową pośrodku i kamienną kolumną z figurą, dookoła kolorowe kamienice z dachówki; prosta ulica schodzi do strumienia z drewnianym młynem, inna wspina się na wzgórze z ruinami zamku, w rogu mała stacja kolejowa przy torach"
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
                  <span className="block font-medium">{HIST_BLOCK_KINDS[block.kind].label}</span>
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
