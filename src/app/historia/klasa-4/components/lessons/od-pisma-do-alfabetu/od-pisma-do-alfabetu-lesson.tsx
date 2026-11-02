'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Hash, MessageSquareText, RotateCcw, Warehouse } from 'lucide-react';
import {
  HIST_BLOCK_KINDS,
  HistLessonShell,
  LessonBlock,
  useBlockDone,
  type HistBlockMeta,
} from '../../lesson-shell';
import { Przypominajka } from '../../przypominajka';
import { PrzypnijPinezke } from '../../timeline/przypnij-pinezke';
import { LessonImageCard } from '@/components/ui/lesson-image-card';
import { imgMap } from '@/lib/media';
import { MagazynWidget } from './magazyn-widget';
import { TabliczkaWidget } from './tabliczka-widget';
import { SpolgloskiWidget } from './spolgloski-widget';
import { AlefWidget } from './alef-widget';
import { KontynentyKolejno } from './kontynenty-kolejno';
import { Emotikony } from './emotikony';
import { getCorePin } from '../../../lib/timeline/pins';
import { getLesson } from '../../../data/lessons';
import type { HistModule } from '../../../data/curriculum';
import type { HistLesson } from '../../../data/lessons';

/**
 * L18 — Po co ludziom pismo. Niesie `[5.4 — kultura]`.
 *
 * **Zdanie lekcji: pismo pozwoliło zapamiętać więcej, niż mieści się w jednej
 * głowie — a alfabet sprawił, że może się go nauczyć każdy.**
 *
 * Cztery bloki + D poza postępem:
 *  - `MagazynWidget` — dostawa do magazynu z pamięci, potem z **odciskaniem
 *    znaków na tabliczce** przy każdej dostawie (pinezka „pismo” wisi z tego bloku);
 *  - `TabliczkaWidget` — **odciska kliny rylcem** (w dół = 1, w bok = 10);
 *  - `SpolgloskiWidget` — imię po fenicku (font Noto), samogłoski w szkielety, „jak Grecy”;
 *  - `AlefWidget` — **obraca znak** głowa wołu → alef → alfa → A po osi lat;
 *    pinezka „alfabet fenicki”;
 *  - D: wiadomość z emotikonów czytana na trzy sposoby.
 *
 * Przypominajka: kontynenty w kolejności wędrówek (L15, dystans 3).
 * Pismo zawsze z fontów/SVG — nigdy z generatora obrazów.
 */

const IMAGES = imgMap({
  intro: '/images/historia/lekcje/od-pisma-do-alfabetu/pisarz.jpg',
  magazyn: '/images/historia/lekcje/od-pisma-do-alfabetu/magazyn.jpg',
  rylec: '/images/historia/lekcje/od-pisma-do-alfabetu/rylec.jpg',
  port: '/images/historia/lekcje/od-pisma-do-alfabetu/port.jpg',
});

const BLOCKS: HistBlockMeta[] = [
  { id: 'magazyn', kind: 'haczyk', title: 'Magazyn bez pisma', time: '5 min', icon: Warehouse },
  { id: 'tabliczka', kind: 'symulator', title: 'Gliniana tabliczka', time: '5 min', icon: Hash },
  { id: 'spolgloski', kind: 'cwiczenie', title: 'Samymi spółgłoskami', time: '5 min', icon: MessageSquareText },
  { id: 'alef', kind: 'os-czasu', title: 'Z głowy wołu litera A', time: '5 min', icon: RotateCcw },
];

const L15_LESSON = getLesson('poczatki-cywilizacji', 'pierwsi-ludzie');
const LESSON = 'poczatki-cywilizacji/od-pisma-do-alfabetu';

interface LessonProps {
  lesson: HistLesson;
  histModule: HistModule;
  nextLesson?: HistLesson;
}

export function OdPismaDoAlfabetuLesson({ lesson, histModule, nextLesson }: LessonProps) {
  return (
    <HistLessonShell
      lesson={lesson}
      histModule={histModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Przyjąłeś/łaś dostawę z pamięci i z tabliczki — i przekonałeś/łaś się, że glina pamięta lepiej niż głowa. Odcisnąłeś/łaś liczby klinami jak sumeryjski pisarz, zapisałeś/łaś swoje imię literami Fenicjan i Greków, a głowę wołu obróciłeś/łaś w literę A. Od dziś wiesz: pismo pozwoliło zapamiętać więcej, niż mieści się w jednej głowie — a alfabet sprawił, że może się go nauczyć każdy."
      entry={
        L15_LESSON ? (
          <Przypominajka from={L15_LESSON} distance={3} color={histModule.color}>
            <KontynentyKolejno color={histModule.color} />
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
  const magazyn = useBlockDone('magazyn');
  const tabliczka = useBlockDone('tabliczka');
  const spolgloski = useBlockDone('spolgloski');
  const alef = useBlockDone('alef');
  const alfabet = getCorePin('alfabet-fenicki');
  const [turned, setTurned] = useState(false);

  return (
    <>
      <LessonIntro color={color} />

      <LessonBlock id="magazyn">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.magazyn}
          alt="Akwarela: przed magazynem świątyni w sumeryjskim mieście rolnicy przynoszą dostawy — mężczyzna prowadzi dwie owce, kobieta niesie worek na głowie, chłopiec dzban, rybak pęk ryb, za nimi osioł z workami; w drzwiach magazynu stoi zakłopotany urzędnik i drapie się w głowę; w tle zikkurat i palmy"
          lead="Ile było owiec? Nikt nie pamięta."
        >
          Do świątynnego magazynu codziennie przychodziły dostawy. Urzędnik musiał wiedzieć, ile czego
          przyjął — żeby wydawać ziarno robotnikom i rozstrzygać spory. Sprawdź, jak to jest.
        </LessonImageCard>
        <div className="mt-4">
          <MagazynWidget color={color} onDone={magazyn.markBlockDone} />
        </div>
      </LessonBlock>

      <LessonBlock id="tabliczka">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.rylec}
          alt="Akwarela, martwa natura: na drewnianym stole leży gładki, płaski prostokąt mokrej szarobrązowej gliny, obok trzcina zaostrzona na końcu w trójkątny rylec, miska z wodą, płótno i kilka suchych trzcin"
          lead="Trzcina, glina i trochę wody."
        >
          Sumeryjski pisarz nie miał papieru ani długopisu. Brał garść mokrej gliny znad rzeki i trzcinę
          ściętą ukośnie, tak że jej koniec był trójkątny. Wciśnięta w glinę zostawiała ślad podobny do
          klina. Spróbuj.
        </LessonImageCard>
        <div className="mt-4">
          <TabliczkaWidget color={color} onComplete={tabliczka.markBlockDone} />
        </div>
      </LessonBlock>

      <LessonBlock id="spolgloski">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.port}
          alt="Akwarela: fenicki port nad morzem — drewniany statek kupiecki z jednym gładkim żaglem i dziobem w kształcie końskiej głowy przy kamiennym nabrzeżu; brodaci kupcy w długich tunikach i stożkowych czapkach rozładowują dzbany i purpurowe tkaniny, obok leżą pnie cedru, w tle miasto na skalistym cyplu"
          lead="Kupcom szkoda było czasu na tysiące znaków."
        >
          Fenicjanie żeglowali po całym Morzu Śródziemnym i handlowali ze wszystkimi. Pisali umowy i
          rachunki — dużo i szybko. Dlatego około XI wieku p.n.e. zaczęli używać pisma, w którym jeden
          znak to jedna głoska. Takich znaków wystarczyło dwadzieścia dwa.
        </LessonImageCard>
        <div className="mt-4">
          <SpolgloskiWidget color={color} onComplete={spolgloski.markBlockDone} />
        </div>
      </LessonBlock>

      <LessonBlock id="alef">
        <AlefWidget color={color} onComplete={() => setTurned(true)} />
        {alfabet && (turned || alef.done) && (
          <div className="mt-6 border-t pt-4">
            <p className="mb-3 text-sm leading-relaxed">
              Przypnij na Osi dziejów chwilę, od której liczy się historia alfabetu — pismo Fenicjan.
            </p>
            <PrzypnijPinezke
              pin={alfabet}
              color={color}
              lesson={LESSON}
              mode="piramidy"
              done={alef.done}
              onPinned={alef.markBlockDone}
            />
          </div>
        )}

        <div className="mt-6 border-t pt-4">
          <Emotikony color={color} />
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
          Czy umiesz zapamiętać, ile czego przywieziono do sklepu przez cały rok? Urzędnicy w
          sumeryjskich miastach musieli. Dlatego wymyślili coś, co pamiętało za nich — i zmieniło świat
          bardziej niż koło.
        </p>
        <p className="mt-3">
          Dziś przyjmiesz dostawę do magazynu, odciśniesz liczby w glinie, napiszesz swoje imię jak
          Fenicjanin i obrócisz głowę wołu w literę A. Wszystko stoi na jednym zdaniu:{' '}
          <strong>
            pismo pozwoliło zapamiętać więcej, niż mieści się w jednej głowie — a alfabet sprawił, że
            może się go nauczyć każdy.
          </strong>
        </p>
      </div>

      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Akwarela: sumeryjski pisarz z ciemną brodą siedzi po turecku w magazynie świątyni i trzyma trzcinowy rylec nad kawałkiem gliny; obok na ławie leży kilka gładkich glinianych tabliczek, w tle worki z jęczmieniem, dzbany i owce za drzwiami"
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
