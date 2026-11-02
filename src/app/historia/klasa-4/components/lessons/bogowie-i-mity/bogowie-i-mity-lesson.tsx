'use client';

import Image from 'next/image';
import { CloudLightning, Network, Route, Speech } from 'lucide-react';
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
import { OlimpWidget } from './olimp-widget';
import { LabiryntWidget } from './labirynt-widget';
import { MowaWidget } from './mowa-widget';
import { NaturaWidget } from './natura-widget';
import { PapierPrzypominajka } from './papier-przypominajka';
import { getLesson } from '../../../data/lessons';
import type { HistModule } from '../../../data/curriculum';
import type { HistLesson } from '../../../data/lessons';

/**
 * L24 — Olimp i mity. Niesie `[6.3]` (mitologia).
 *
 * **Zdanie lekcji: mity wyjaśniały Grekom świat — a my wciąż mówimy ich słowami.**
 *
 * Cztery bloki:
 *  - `olimp` — drzewo bogów z ich własnych wypowiedzi (silnik `family-tree`,
 *    drugi konsument po L5, bez lat); atrybut dokleja się, gdy miejsce boga
 *    potwierdzi rodzina;
 *  - `labirynt` — Tezeusz prowadzony palcem przez ciemny labirynt, za nim nić;
 *    powrót po własnej nici, werdykt liczy kroki tam i z powrotem;
 *  - `mowa` — sześć wyrażeń z mitów w lukach zdań z dzisiejszego życia,
 *    po trafieniu odsłania się mit;
 *  - `po-co` — zjawiska wytłumaczone „jak Grek” atrybutami z bloku 1, obok
 *    wyjaśnienie dzisiejsze; własny mit o echu.
 *
 * Przypominajka: „papier” od papirusu (L21, dystans 3). Bez pinezki (karta: „Zostaje: drzewo Olimpu”).
 * Blok R (herosi) i D (koń trojański w informatyce) odłożone — koń trojański jest w bloku 3.
 */

const IMAGES = imgMap({
  intro: '/images/historia/lekcje/bogowie-i-mity/olimp.jpg',
  atena: '/images/historia/lekcje/bogowie-i-mity/atena.jpg',
  labirynt: '/images/historia/lekcje/bogowie-i-mity/labirynt.jpg',
  sztorm: '/images/historia/lekcje/bogowie-i-mity/sztorm.jpg',
});

const BLOCKS: HistBlockMeta[] = [
  { id: 'olimp', kind: 'symulator', title: 'Rodzina z Olimpu', time: '6 min', icon: Network },
  { id: 'labirynt', kind: 'cwiczenie', title: 'Labirynt i nić Ariadny', time: '5 min', icon: Route },
  { id: 'mowa', kind: 'cwiczenie', title: 'Mitologia w naszej mowie', time: '5 min', icon: Speech },
  { id: 'po-co', kind: 'refleksja', title: 'Po co ludziom mity?', time: '5 min', icon: CloudLightning },
];

const L21_LESSON = getLesson('starozytny-egipt', 'osiagniecia-egipcjan');

interface LessonProps {
  lesson: HistLesson;
  histModule: HistModule;
  nextLesson?: HistLesson;
}

export function BogowieIMityLesson({ lesson, histModule, nextLesson }: LessonProps) {
  return (
    <HistLessonShell
      lesson={lesson}
      histModule={histModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Posadziłeś/łaś bogów na drzewie Olimpu, wyprowadziłeś/łaś Tezeusza z labiryntu po nici, odnalazłeś/łaś sześć mitów we własnej mowie i wymyśliłeś/łaś swój mit o echu. Od dziś wiesz: mity wyjaśniały Grekom świat — a my wciąż mówimy ich słowami."
      entry={
        L21_LESSON ? (
          <Przypominajka from={L21_LESSON} distance={3} color={histModule.color}>
            <PapierPrzypominajka color={histModule.color} />
          </Przypominajka>
        ) : undefined
      }
    >
      <LessonBody color={histModule.color} />
    </HistLessonShell>
  );
}

function LessonBody({ color }: { color: string }) {
  const olimp = useBlockDone('olimp');
  const labirynt = useBlockDone('labirynt');
  const mowa = useBlockDone('mowa');
  const poCo = useBlockDone('po-co');

  return (
    <>
      <LessonIntro color={color} />

      <LessonBlock id="olimp">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.atena}
          alt="Akwarela: marmurowy posąg bogini w hełmie i długiej szacie, z włócznią, na jej ramieniu siedzi żywa sowa; posąg stoi w ogrodzie świątyni wśród drzew oliwnych, w tle kolumny"
          lead="Bogowie jak wielka rodzina."
        >
          Grecy wierzyli w wielu bogów. Mieszkali na górze Olimp, jedli ambrozję, kłócili się i godzili jak ludzie — tylko
          nigdy nie umierali. Każdy miał swoją dziedzinę i znak, po którym rozpoznawano go na posągach i wazach.
          Opowieści o nich to <strong>mity</strong>.
        </LessonImageCard>
        <div className="mt-4">
          <OlimpWidget color={color} onDone={olimp.markBlockDone} />
        </div>
      </LessonBlock>

      <LessonBlock id="labirynt">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.labirynt}
          alt="Akwarela: ciemne wejście do kamiennego labiryntu w skale, przy progu leży na ziemi czerwony kłębek nici, a jego koniec znika w mroku korytarza"
          lead="Mit o Tezeuszu i Minotaurze."
        >
          Na Krecie, w labiryncie króla Minosa, mieszkał Minotaur — potwór z głową byka. Kto wszedł do labiryntu, już z
          niego nie wychodził. Bohater Tezeusz postanowił go pokonać, a królewna Ariadna dała mu na drogę kłębek nici.
        </LessonImageCard>
        <div className="mt-4">
          <LabiryntWidget color={color} onDone={labirynt.markBlockDone} />
        </div>
      </LessonBlock>

      <LessonBlock id="mowa">
        <p className="mb-4 text-sm leading-relaxed sm:text-base">
          Mity skończyły się dawno, ale ich bohaterowie zostali w języku. Wstaw każde wyrażenie do zdania, które opisuje
          zwykły dzień — przeciągnij je w lukę albo stuknij wyrażenie, a potem lukę.
        </p>
        <MowaWidget color={color} onDone={mowa.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="po-co">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.sztorm}
          alt="Akwarela: wzburzone morze pod ciemnym niebem, wysokie fale z białą pianą, mały drewniany statek z jednym żaglem przechyla się na fali, w oddali błyskawica nad skalistym brzegiem"
          lead="Kto rozpętał burzę?"
        >
          Grecki żeglarz nie wiedział, skąd biorą się wiatr i fale. Widział tylko, że morze bywa spokojne, a potem nagle
          wściekłe. Ktoś musiał za tym stać.
        </LessonImageCard>
        <div className="mt-4">
          <NaturaWidget color={color} onDone={poCo.markBlockDone} />
        </div>
      </LessonBlock>
    </>
  );
}

function LessonIntro({ color }: { color: string }) {
  return (
    <div className="grid gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_260px]">
      <div className="text-base leading-relaxed sm:text-lg">
        <p>
          Grecy patrzyli na burzę, morze i zimę i pytali: kto to robi? Odpowiedzią były opowieści o bogach i bohaterach —
          mity. Opowiadano je przy ogniu, śpiewano na ucztach, malowano na wazach.
        </p>
        <p className="mt-3">
          Dziś posadzisz bogów na drzewie rodziny, wyprowadzisz bohatera z labiryntu, znajdziesz mity we własnej mowie i
          wymyślisz swój mit. Wszystko stoi na jednym zdaniu:{' '}
          <strong>mity wyjaśniały Grekom świat — a my wciąż mówimy ich słowami.</strong>
        </p>
      </div>

      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Akwarela: ośnieżony szczyt wysokiej góry wyłania się z białych chmur, na zboczach ciemne lasy, u podnóża wioska z białymi domami i gaj oliwny"
            width={260}
            height={195}
            className="absolute inset-0 h-full w-full object-contain"
            priority
          />
        </div>

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
