'use client';

import Image from 'next/image';
import { Map as MapIcon, MapPinned, PencilRuler, ZoomIn } from 'lucide-react';
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
import { ZaslonietaLegenda } from './zaslonieta-legenda';
import { CzytanieMapy } from './czytanie-mapy';
import { SkalaIPlan } from './skala-i-plan';
import { WioskaZLegenda } from './wioska-z-legenda';
import { MapaTO } from './mapa-t-o';
import { LataKrola } from './lata-krola';
import { getLesson } from '../../../data/lessons';
import type { HistModule } from '../../../data/curriculum';
import type { HistLesson } from '../../../data/lessons';

/**
 * L9 — mapa i plan historyczny. `[4.4]`, filar 1. Silnik `hist-map` — pierwszy
 * konsument (zostaje w folderze lekcji do drugiego użycia, L12).
 *
 * **Zdanie lekcji: mapa bez legendy to obrazek — legenda zamienia ją w opowieść.**
 *
 * Cztery bloki, gesty nowe w kursie:
 *  - `ZaslonietaLegenda` — zgaduje znaczenie korony i dwóch czerwieni, potem
 *    **podnosi palcem kartkę** zakrywającą legendę;
 *  - `CzytanieMapy` — odpowiada **stuknięciem w mapę** i w słowa tytułu;
 *  - `SkalaIPlan` — **przykłada linijkę podziałki** (dwa końce na miastach),
 *    **przybliża suwakiem z mapy do planu** i suwakiem czasu prowadzi bitwę
 *    pod Grunwaldem; pinezka „Grunwald”;
 *  - `WioskaZLegenda` — **stawia własne znaki na planie wioski i układa
 *    legendę**; Czytelnik opowiada wioskę z planu.
 *
 * Przypominajka: lata panowania Kazimierza (z L8, dystans 1). R — mapa „T w O”
 * (obracanie) poza postępem.
 */

const IMAGES = imgMap({
  intro: '/images/historia/lekcje/mapa-i-plan/stol-kartografa.jpg',
  wieza: '/images/historia/lekcje/mapa-i-plan/wieza-zamku.jpg',
  kompas: '/images/historia/lekcje/mapa-i-plan/kompas.jpg',
});

const LESSON_KEY = 'czas-i-miejsce/mapa-i-plan';

const BLOCKS: HistBlockMeta[] = [
  { id: 'legenda', kind: 'haczyk', title: 'Mapa bez legendy', time: '4 min', icon: MapIcon },
  { id: 'czytanie', kind: 'mapa', title: 'Czytanie mapy', time: '5 min', icon: MapPinned },
  { id: 'skala', kind: 'symulator', title: 'Skala i plan', time: '7 min', icon: ZoomIn },
  {
    id: 'wioska',
    kind: 'zadanie',
    title: 'Plan wioski z legendą',
    time: '8 min',
    icon: PencilRuler,
  },
];

const L8_LESSON = getLesson('czas-i-miejsce', 'obliczanie-czasu');

interface LessonProps {
  lesson: HistLesson;
  histModule: HistModule;
  nextLesson?: HistLesson;
}

export function MapaIPlanLesson({ lesson, histModule, nextLesson }: LessonProps) {
  return (
    <HistLessonShell
      lesson={lesson}
      histModule={histModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Zgadywałeś/łaś, co znaczą korona i dwie czerwienie, a potem podniosłeś/łaś kartkę i legenda zamieniła zgadywanie w pewność. Czytałeś/łaś mapę Kazimierza Wielkiego stuknięciami, zmierzyłeś/łaś linijką podziałki drogę z Krakowa do Gniezna, przybliżyłeś/łaś mapę aż do planu bitwy pod Grunwaldem i narysowałeś/łaś wioskę z własną legendą, którą Czytelnik umiał opowiedzieć. Mapa bez legendy to obrazek — legenda zamienia ją w opowieść."
      entry={
        L8_LESSON ? (
          <Przypominajka from={L8_LESSON} distance={1} color={histModule.color}>
            <LataKrola color={histModule.color} />
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
  const legenda = useBlockDone('legenda');
  const czytanie = useBlockDone('czytanie');
  const skala = useBlockDone('skala');
  const wioska = useBlockDone('wioska');

  return (
    <>
      <LessonIntro color={color} />

      <LessonBlock id="legenda">
        <p className="mb-4 text-base leading-relaxed">
          Oto mapa państwa króla Kazimierza Wielkiego. Widać na niej kolory i znaki — ale legenda,
          która je objaśnia, leży pod kartką. Zanim ją odkryjesz, <strong>zgadnij</strong>, co
          znaczą.
        </p>
        <ZaslonietaLegenda color={color} onComplete={legenda.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="czytanie">
        <p className="mb-4 text-base leading-relaxed">
          Teraz legenda leży obok mapy. Na każde pytanie odpowiedz <strong>stuknięciem</strong> — w
          słowo tytułu albo w miejsce na mapie. Każda odpowiedź jest na mapie, trzeba ją tylko umieć
          przeczytać.
        </p>
        <CzytanieMapy color={color} onComplete={czytanie.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="skala">
        <p className="mb-4 text-base leading-relaxed">
          Polska na ekranie jest mała, a w terenie — ogromna. Ile razy ją pomniejszono, mówi{' '}
          <strong>podziałka</strong>. Najpierw zmierzysz nią drogę, potem przybliżysz mapę tak
          bardzo, że zamieni się w <strong>plan</strong>.
        </p>
        <SkalaIPlan
          color={color}
          lesson={LESSON_KEY}
          done={skala.done}
          onComplete={skala.markBlockDone}
        />
      </LessonBlock>

      <LessonBlock id="wioska">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.wieza}
          alt="Akwarela: widok z kamiennej wieży zamku na okolicę — w dole wieś z drewnianym kościołem i chatami, kręta rzeka z drewnianym mostem, młyn z kołem wodnym, polna droga, pola i skraj lasu"
          lead="Z wieży wszystko wygląda jak plan."
        >
          Z wysoka widać, gdzie stoi kościół, gdzie młyn, którędy biegnie droga. Plan to właśnie
          taki widok z góry — tylko zamiast domów są <strong>znaki</strong>. Teraz ty narysujesz
          plan wioski i sam/a zdecydujesz, co znaczą twoje znaki.
        </LessonImageCard>
        <div className="mt-4">
          <WioskaZLegenda color={color} onComplete={wioska.markBlockDone} />
        </div>
      </LessonBlock>

      {/* R — dopisek poza postępem (jak w L1): bloków opcjonalnych powłoka jeszcze nie ma. */}
      <section className="border border-dashed p-5 sm:p-6">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Dla ciekawych · nieobowiązkowe
        </p>
        <h3 className="mb-3 text-lg font-semibold">Dlaczego północ jest na górze?</h3>
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.kompas}
          alt="Akwarela: otwarty mosiężny kompas na drewnianym stole, igła wskazuje w górę; obok czysta kartka z ołówkiem, kubek z gałązką jarzębiny i jesienne liście"
          reverse
          lead="Igła kompasu wskazuje północ."
        >
          Dziś każda mapa ma <strong>północ u góry</strong>. Ale przez setki lat kartografowie
          rysowali świat inaczej.
        </LessonImageCard>
        <div className="mt-4">
          <MapaTO color={color} />
        </div>
      </section>
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
          Historycy pytają nie tylko „kiedy?”, ale też „<strong>gdzie?</strong>”. Na to drugie
          pytanie odpowiada mapa. Tylko że mapa to kolory, linie i znaczki — same z siebie nic nie
          mówią.
        </p>
        <p className="mt-3">
          Dziś przeczytasz mapę państwa Kazimierza Wielkiego, zmierzysz na niej drogę, przybliżysz
          ją aż do planu bitwy i narysujesz własny plan. Wszystko stoi na jednym zdaniu:{' '}
          <strong>mapa bez legendy to obrazek — legenda zamienia ją w opowieść.</strong>
        </p>
      </div>

      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Akwarela: drewniany stół kartografa — zwinięte pergaminy przewiązane sznurkiem, rozłożony pusty arkusz przyciśnięty kamieniem, mosiężny cyrkiel, gęsie pióro w kałamarzu i gliniana lampka oliwna; za oknem rzeka i zamek"
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
