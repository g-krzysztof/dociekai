'use client';

import Image from 'next/image';
import { AppWindow, Globe, Send, Signpost } from 'lucide-react';
import {
  BLOCK_KINDS,
  InfoLessonShell,
  LessonBlock,
  useBlockDone,
  type LessonBlockMeta,
} from '../../lesson-shell';
import { LessonImageCard } from '@/components/ui/lesson-image-card';
import { PageOrigin } from './page-origin';
import { PacketTrip } from './packet-trip';
import { BrowserVsEngine } from './browser-vs-engine';
import { AddressOrSearch } from './address-or-search';
import { NetForYou } from './net-for-you';
import type { InfoModule } from '../../../data/curriculum';
import type { InfoLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

/**
 * Lekcja o tym, jak działa sieć — pierwsza zbudowana w module 2 i ósmy różny
 * kształt lekcji w kursie. Temat jest o ukrytym mechanizmie: jak prośba
 * przechodzi przez sieć do serwera i wraca. Dlatego blokiem centralnym jest
 * animowana podróż paczki danych (`PacketTrip`), a nie schemat SVG ani karty do
 * odsłaniania. Realizuje `[4.2]`.
 *
 * Kształt: haczyk (skąd bierze się strona) → symulator (prześlij coś przez sieć
 * i patrz którędy idzie) → wyjaśnienie (przeglądarka a wyszukiwarka na makiecie
 * okna) → ćwiczenie (wpisać adres czy szukać) → refleksja (do czego TY używasz
 * internetu). Bez zadania praktycznego offline — cel lekcji jest czysto o
 * zrozumieniu, tak jak w przykładowych kształtach modułu 2.
 */

const IMAGES = imgMap({
  intro: '/images/informatyka/lekcje/jak-dziala-siec/siec-swiat-nitki.jpg',
  kopia: '/images/informatyka/lekcje/jak-dziala-siec/list-w-skrzynce.jpg',
  droga: '/images/informatyka/lekcje/jak-dziala-siec/nitka-przez-rownine.jpg',
  okno: '/images/informatyka/lekcje/jak-dziala-siec/okno-z-widokiem.jpg',
  drogowskaz: '/images/informatyka/lekcje/jak-dziala-siec/drogowskaz-i-mapa.jpg',
});

const BLOCKS: LessonBlockMeta[] = [
  {
    id: 'skad-strona',
    kind: 'haczyk',
    title: 'Gdzie jest strona, którą właśnie czytasz?',
    time: '4 min',
    icon: Globe,
  },
  {
    id: 'podroz',
    kind: 'symulator',
    title: 'Prześlij coś przez sieć i patrz, którędy idzie',
    time: '7 min',
    icon: Send,
  },
  {
    id: 'przegladarka',
    kind: 'wyjasnienie',
    title: 'Przeglądarka a wyszukiwarka — co jest czym',
    time: '6 min',
    icon: AppWindow,
  },
  {
    id: 'adres-czy-szukanie',
    kind: 'cwiczenie',
    title: 'Wpisać adres czy szukać?',
    time: '5 min',
    icon: Signpost,
  },
  {
    id: 'po-co',
    kind: 'refleksja',
    title: 'Po co ty łączysz się z siecią',
    time: '3 min',
  },
];

interface LessonProps {
  lesson: InfoLesson;
  infoModule: InfoModule;
  nextLesson?: InfoLesson;
}

export function JakDzialaSiecLesson({ lesson, infoModule, nextLesson }: LessonProps) {
  return (
    <InfoLessonShell
      lesson={lesson}
      infoModule={infoModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Wiesz już, że każda strona to kopia przysłana przez inny komputer, że internet to sieć sieci, a przeglądarka to program, w którym otwierasz wyszukiwarkę. W następnej lekcji nauczysz się tę informację sprawdzać, zanim jej uwierzysz."
    >
      <LessonBody color={infoModule.color} />
    </InfoLessonShell>
  );
}

/** Treść wydzielona z komponentu strony, bo `useBlockDone` działa dopiero w kontekście powłoki. */
function LessonBody({ color }: { color: string }) {
  const origin = useBlockDone('skad-strona');
  const trip = useBlockDone('podroz');
  const browser = useBlockDone('przegladarka');
  const pick = useBlockDone('adres-czy-szukanie');
  const purpose = useBlockDone('po-co');

  return (
    <>
      <LessonIntro color={color} />

      <LessonBlock id="skad-strona">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.kopia}
          alt="Otwarta metalowa skrzynka na listy przy drewnianym płocie, w środku kilka jednakowych kremowych kopert bez żadnego napisu"
          lead="Strona z internetu przychodzi do ciebie jak list — jako kopia, której oryginał został gdzie indziej."
        >
          Zanim zobaczysz, jak ta kopia do ciebie jedzie, zgadnij, skąd wyrusza. Zła odpowiedź nic
          nie psuje.
        </LessonImageCard>
        <PageOrigin color={color} onComplete={origin.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="podroz">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.droga}
          alt="Rozległa równina o poranku, przez którą ciągnie się rząd drewnianych słupów z jednym przewodem, prowadzący do dwóch małych domów na horyzoncie"
        >
          <p>
            Kliknięcie w link wygląda jak nic, ale za każdym razem coś rusza w długą drogę i wraca.{' '}
            <strong>Wyślij prośbę przez sieć</strong> i przejdź z paczką przez wszystkie przystanki —
            raz po stronę, raz z wiadomością do koleżanki.
          </p>
        </LessonImageCard>
        <PacketTrip color={color} onComplete={trip.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="przegladarka">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.okno}
          alt="Otwarte drewniane okno z okiennicami, przez które widać słoneczny ogród z dużym drzewem; na parapecie mała doniczka"
          lead="Przeglądarka jest jak okno: to rama, przez którą patrzysz. Strona to widok po drugiej stronie szyby."
          reverse
        >
          Ramę masz zawsze tę samą — a widok zmienia się z każdą stroną. Stuknij części okna
          przeglądarki i sprawdź, co jest ramą, a co widokiem.
        </LessonImageCard>
        <BrowserVsEngine color={color} onComplete={browser.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="adres-czy-szukanie">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.drogowskaz}
          alt="Wiejskie rozstaje dróg z drewnianym drogowskazem o pustych, nieopisanych tablicach; obok na kamiennym murku leży złożona papierowa mapa"
          reverse
        >
          <p>
            Znasz dokładny adres? Jedziesz prosto. Wiesz tylko, <strong>czego</strong> szukasz?
            Sięgasz po mapę. Rozstrzygnij pięć sytuacji — zła odpowiedź nie zamyka pytania.
          </p>
        </LessonImageCard>
        <AddressOrSearch color={color} onComplete={pick.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="po-co">
        <NetForYou color={color} onComplete={purpose.markBlockDone} />
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
          „Internet” brzmi jak jedno wielkie miejsce, do którego się wchodzi. Naprawdę to{' '}
          <strong>komputery połączone ze sobą</strong> tak, żeby mogły podawać sobie wiadomości i
          sięgać po to, czego same nie mają.
        </p>
        <p className="mt-3">
          W tej lekcji prześledzisz, jak twoja prośba „pokaż stronę” jedzie przez sieć do innego
          komputera i wraca z kopią. Po drodze rozdzielisz dwie rzeczy, które łatwo pomylić:{' '}
          <strong>przeglądarkę</strong> (program) i <strong>wyszukiwarkę</strong> (stronę).
        </p>
      </div>

      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Dziecko widziane od tyłu siedzi przy dużej papierowej mapie świata przypiętej do ściany, po której rozpięto kolorowe nitki łączące odległe miejsca; obok mały globus"
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
