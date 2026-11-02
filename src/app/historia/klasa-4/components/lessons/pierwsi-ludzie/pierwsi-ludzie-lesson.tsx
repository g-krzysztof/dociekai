'use client';

import Image from 'next/image';
import { Flame, Footprints, Paintbrush, Tent } from 'lucide-react';
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
import { SwiderOgniowy } from './swider-ogniowy';
import { RokObozu } from './rok-obozu';
import { WedrowkiLudzi } from './wedrowki-ludzi';
import { Pochodnia } from './pochodnia';
import { MamutZLegendy } from './mamut-z-legendy';
import { getLesson } from '../../../data/lessons';
import type { HistModule } from '../../../data/curriculum';
import type { HistLesson } from '../../../data/lessons';

/**
 * L15 — koczownicy. `[5.1]`. Otwiera moduł 4 „Początki cywilizacji”.
 *
 * **Zdanie lekcji: przez prawie całe swoje dzieje ludzie wędrowali za
 * jedzeniem — a ogień pozwolił im zajść coraz dalej.**
 *
 * Cztery bloki:
 *  - `SwiderOgniowy` — **kręci świdrem** (palec w lewo-prawo, liczy się
 *    tempo), przenosi żar do hubki; obóz o zmroku się zmienia, dziecko stuka
 *    cztery rzeczy, które zmienił ogień;
 *  - `RokObozu` — dwanaście miesięcy, trzy miejsca, stado wędrujące z porą
 *    roku; dziecko **zwija obóz, przeciągając szałas**; werdykt nazywa
 *    miesiąc i miejsce głodu;
 *  - `WedrowkiLudzi` — **prowadzi grupę z Afryki po mapie świata**, suwakiem
 *    opuszcza morze (Beringia, Sunda), z dat ustala ostatni kontynent;
 *    pinezka „pierwsi ludzie”;
 *  - `Pochodnia` — **oświetla pochodnią ścianę Lascaux** (prawdziwa
 *    fotografia), potem przykłada wnioski do postaci albo do „ściana milczy”.
 *
 * Przypominajka: zakreślacz w skrócie na legendzie o smoku (L14, dystans 1)
 * — mamut z katedry jako mostek do epoki lodowej.
 */

const IMAGES = imgMap({
  intro: '/images/historia/lekcje/pierwsi-ludzie/wedrowka.jpg',
  oboz: '/images/historia/lekcje/pierwsi-ludzie/oboz.jpg',
  renifery: '/images/historia/lekcje/pierwsi-ludzie/renifery.jpg',
  jaskinia: '/images/historia/lekcje/pierwsi-ludzie/jaskinia.jpg',
  lascaux: '/images/historia/lekcje/pierwsi-ludzie/lascaux-tury.jpg',
});

const BLOCKS: HistBlockMeta[] = [
  { id: 'ogien', kind: 'haczyk', title: 'Świder ogniowy', time: '4 min', icon: Flame },
  { id: 'oboz', kind: 'symulator', title: 'Rok koczowniczego obozu', time: '6 min', icon: Tent },
  { id: 'wedrowki', kind: 'mapa', title: 'Wędrówki ludzi', time: '6 min', icon: Footprints },
  { id: 'jaskinia', kind: 'zrodlo', title: 'Malowidła w jaskini', time: '5 min', icon: Paintbrush },
];

const L14_LESSON = getLesson('mala-i-duza-ojczyzna', 'legendy-prawda-i-fikcja');

interface LessonProps {
  lesson: HistLesson;
  histModule: HistModule;
  nextLesson?: HistLesson;
}

export function PierwsiLudzieLesson({ lesson, histModule, nextLesson }: LessonProps) {
  return (
    <HistLessonShell
      lesson={lesson}
      histModule={histModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Rozpaliłeś/łaś ogień świdrem i zobaczyłeś/łaś, co zmienił w obozie: ciepło, światło, ochronę przed wilkami i pieczone mięso. Przeżyłeś/łaś rok z grupą koczowników, zwijając obóz, gdy kończyło się jedzenie. Poprowadziłeś/łaś ludzi z Afryki aż do Ameryki — przez Beringię, odsłoniętą w epoce lodowej. Na końcu oświetliłeś/łaś pochodnią prawdziwe malowidła z Lascaux i sprawdziłeś/łaś, co z nich wiemy. Od dziś pamiętasz: przez prawie całe swoje dzieje ludzie wędrowali za jedzeniem — a ogień pozwolił im zajść coraz dalej."
      entry={
        L14_LESSON ? (
          <Przypominajka from={L14_LESSON} distance={1} color={histModule.color}>
            <MamutZLegendy color={histModule.color} />
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
  const ogien = useBlockDone('ogien');
  const oboz = useBlockDone('oboz');
  const wedrowki = useBlockDone('wedrowki');
  const jaskinia = useBlockDone('jaskinia');

  return (
    <>
      <LessonIntro color={color} />

      <LessonBlock id="ogien">
        <SwiderOgniowy color={color} image={IMAGES.oboz} onComplete={ogien.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="oboz">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.renifery}
          alt="Akwarela: stado reniferów z wielkimi porożami idzie gęsiego przez tundrę późnym latem — niskie krzewinki, porosty i kałuże, w dali jezioro i niskie góry z płatami śniegu"
          lead="Stado nie czeka."
        >
          Renifery latem pasą się na tundrze, a przed zimą odchodzą tam, gdzie łatwiej o pokarm. Jagody dojrzewają tylko
          przez kilka tygodni. Kto chciał jeść, musiał wiedzieć, gdzie i kiedy szukać.
        </LessonImageCard>
        <div className="mt-4">
          <RokObozu color={color} onComplete={oboz.markBlockDone} />
        </div>
      </LessonBlock>

      <LessonBlock id="wedrowki">
        <WedrowkiLudzi color={color} onComplete={wedrowki.markBlockDone} done={wedrowki.done} />
      </LessonBlock>

      <LessonBlock id="jaskinia">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.jaskinia}
          alt="Akwarela: wnętrze głębokiej jaskini — dłoń wchodząca z lewej trzyma płonącą pochodnię, ciepłe światło pada na gładką, jasną, pustą ścianę skalną; u góry zwisają stalaktyty, w głębi ciemny korytarz"
          lead="Pismo jeszcze nie istnieje."
          reverse
        >
          Ten długi czas, zanim ludzie wymyślili pismo, nazywamy <strong>prehistorią</strong>. Nikt nie zapisał, jak wtedy
          żyli. Ale zostawili coś innego — na ścianach jaskiń.
        </LessonImageCard>
        <div className="mt-4">
          <Pochodnia color={color} wall={IMAGES.lascaux} onComplete={jaskinia.markBlockDone} />
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
          Człowiek rozumny żyje na Ziemi od ok. 300 tysięcy lat. Przez prawie cały ten czas nie miał domu, pola ani
          sklepu. Miał ogień, kamienne narzędzia, skóry — i nogi.
        </p>
        <p className="mt-3">
          Dziś rozpalisz ogień bez zapałek, przeżyjesz rok z grupą koczowników, poprowadzisz ludzi przez kontynenty
          i oświetlisz pochodnią prawdziwe malowidła sprzed 17 tysięcy lat. Wszystko stoi na jednym zdaniu:{' '}
          <strong>przez prawie całe swoje dzieje ludzie wędrowali za jedzeniem — a ogień pozwolił im zajść coraz dalej.</strong>
        </p>
      </div>

      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Akwarela: rodzina z epoki kamienia idzie gęsiego przez zaśnieżoną równinę — dorośli i dzieci w futrach, z tobołami i drewnianymi oszczepami, matka niesie małe dziecko na plecach; w dali lodowiec, góry, nisko słońce i stado mamutów"
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
