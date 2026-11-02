'use client';

import Image from 'next/image';
import { FolderOpen, Gavel, Highlighter, Presentation } from 'lucide-react';
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
import { TeczkaProvider } from './teczka-state';
import { WyborWidget } from './wybor-widget';
import { BiurkoWidget } from './biurko-widget';
import { OcenaWidget } from './ocena-widget';
import { WystawaWidget } from './wystawa-widget';
import { PliniuszPrzypominajka } from './pliniusz-przypominajka';
import { getLesson } from '../../../data/lessons';
import type { HistModule } from '../../../data/curriculum';
import type { HistLesson } from '../../../data/lessons';

/**
 * L31 — Teczka postaci (doświadczenie edukacyjne 1b, w całości).
 *
 * **Zdanie lekcji: Żeby ocenić człowieka sprzed wieków, trzeba znać fakty,
 * znać jego czasy i wysłuchać więcej niż jednego świadka.**
 *
 * Cztery bloki na jednej pracy dziecka (`TeczkaProvider`):
 *  - `wybor` — teczka jednej z czterech postaci, pierwsza karta i pierwsze wrażenie;
 *  - `biurko` — zakreślacz fakt / czyjeś zdanie na wszystkich kartach, oś życia;
 *  - `ocena` — dwa suwaki, dowody, kontrargument, miara czasów; werdykt strukturalny;
 *  - `wystawa` — plansza z pracy dziecka, urządzenie podane gościowi, jedno pytanie.
 *
 * Postaci: Kleopatra VII, Hatszepsut, Perykles, Konstantyn Wielki (Cezara
 * oceniało się już w L27). Karty to omówienia, nie cytaty z przekładów.
 * Przypominajka: list Pliniusza (L30, dystans 1).
 */

const IMAGES = imgMap({
  teczka: '/images/historia/lekcje/teczka-postaci/teczka.jpg',
  sala: '/images/historia/lekcje/teczka-postaci/sala.jpg',
  kanapa: '/images/historia/lekcje/teczka-postaci/kanapa.jpg',
});

const BLOCKS: HistBlockMeta[] = [
  { id: 'wybor', kind: 'haczyk', title: 'Wybór postaci', time: '4 min', icon: FolderOpen },
  { id: 'biurko', kind: 'zrodlo', title: 'Biurko historyka', time: '10 min', icon: Highlighter },
  { id: 'ocena', kind: 'zadanie', title: 'Moja ocena', time: '8 min', icon: Gavel },
  { id: 'wystawa', kind: 'refleksja', title: 'Wystawa', time: '5 min', icon: Presentation },
];

const L30_LESSON = getLesson('narodziny-chrzescijanstwa', 'od-katakumb-do-religii-panujacej');

interface LessonProps {
  lesson: HistLesson;
  histModule: HistModule;
  nextLesson?: HistLesson;
  nextModule?: HistModule;
}

export function TeczkaPostaciLesson({ lesson, histModule, nextLesson, nextModule }: LessonProps) {
  return (
    <HistLessonShell
      lesson={lesson}
      histModule={histModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      nextModule={nextModule}
      finishNote="Wybrałeś/łaś postać sprzed tysięcy lat, oddzieliłeś/łaś w jej teczce fakty od ocen, ułożyłeś/łaś jej życie na osi, wydałeś/łaś własną ocenę z dowodami i kontrargumentem, a potem obroniłeś/łaś ją przed gościem wystawy. Od dziś wiesz: żeby ocenić człowieka sprzed wieków, trzeba znać fakty, znać jego czasy i wysłuchać więcej niż jednego świadka."
      entry={
        L30_LESSON ? (
          <Przypominajka from={L30_LESSON} distance={1} color={histModule.color}>
            <PliniuszPrzypominajka color={histModule.color} />
          </Przypominajka>
        ) : undefined
      }
    >
      <TeczkaProvider>
        <LessonBody color={histModule.color} />
      </TeczkaProvider>
    </HistLessonShell>
  );
}

function LessonBody({ color }: { color: string }) {
  const wybor = useBlockDone('wybor');
  const biurko = useBlockDone('biurko');
  const ocena = useBlockDone('ocena');
  const wystawa = useBlockDone('wystawa');

  return (
    <>
      <LessonIntro color={color} />

      <LessonBlock id="wybor">
        <WyborWidget color={color} onDone={wybor.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="biurko">
        <BiurkoWidget color={color} onDone={biurko.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="ocena">
        <OcenaWidget color={color} onDone={ocena.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="wystawa">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.sala}
          alt="Akwarela: pusta sala muzealna rano przed otwarciem wystawy — rząd drewnianych sztalug z pustymi tablicami, drewniana podłoga, wysokie okna z jasnym światłem, przy ścianie drabinka i zwinięty dywan"
          lead="Historycy pokazują swoją pracę innym — i odpowiadają na pytania."
        >
          W muzeum każda wystawa zaczyna się od pustych tablic. Twoja zapełni się tym, co zrobiłeś/łaś w tej lekcji. Potem przyjdzie
          gość — ktoś z domu — i zada Ci jedno pytanie.
        </LessonImageCard>
        <figure className="my-4">
          <Image
            src={IMAGES.kanapa}
            alt="Akwarela: dziewczynka z jasnobrązowym kucykiem, w zielonym swetrze, siedzi na kanapie z tabletem w rękach i coś pokazuje dziadkowi w okularach, który słucha z zaciekawieniem"
            width={640}
            height={480}
            className="h-auto w-full max-w-[420px]"
          />
        </figure>
        <WystawaWidget color={color} onDone={wystawa.markBlockDone} />
      </LessonBlock>
    </>
  );
}

function LessonIntro({ color }: { color: string }) {
  return (
    <div className="grid gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_260px]">
      <div className="text-base leading-relaxed sm:text-lg">
        <p>
          Była mądrą królową czy podstępną uwodzicielką? Wielkim przywódcą czy kimś, kto rządził za cudze pieniądze? O ludziach
          sprzed tysięcy lat świadkowie mówią różnie — a każdy miał swój powód.
        </p>
        <p className="mt-3">
          Dziś weźmiesz teczkę jednej postaci, oddzielisz fakty od ocen, ułożysz jej życie na osi, sam(a) wydasz ocenę i pokażesz
          ją komuś na wystawie. Wszystko stoi na jednym zdaniu:{' '}
          <strong>
            Żeby ocenić człowieka sprzed wieków, trzeba znać fakty, znać jego czasy i wysłuchać więcej niż jednego świadka.
          </strong>
        </p>
      </div>

      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.teczka}
            alt="Akwarela: na starym drewnianym biurku otwarte tekturowe pudło archiwalne z kartami katalogowymi, przed nim plik czystych kart z mosiężną lupą, obok gliniana lampka oliwna, kłębek sznurka, ołówek i wazonik z gałązkami"
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
