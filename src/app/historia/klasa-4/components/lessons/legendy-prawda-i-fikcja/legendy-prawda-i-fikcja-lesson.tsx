'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Bone, Highlighter, Radio, ScrollText } from 'lucide-react';
import {
  HIST_BLOCK_KINDS,
  HistLessonShell,
  LessonBlock,
  useBlockDone,
  type HistBlockMeta,
} from '../../lesson-shell';
import { Przypominajka } from '../../przypominajka';
import { OsDziejow } from '../../timeline/os-dziejow';
import { LessonImageCard } from '@/components/ui/lesson-image-card';
import { imgMap } from '@/lib/media';
import { LegendaZDowodami } from './legenda-z-dowodami';
import { KosciSmoka } from './kosci-smoka';
import { GluchyTelefonWiekow } from './gluchy-telefon-wiekow';
import { LegendaWedlugPrzepisu } from './legenda-wedlug-przepisu';
import { SmokWEpokach } from './smok-w-epokach';
import { LECH, SMOK } from './legendy';
import { getLesson } from '../../../data/lessons';
import type { HistModule } from '../../../data/curriculum';
import type { HistLesson } from '../../../data/lessons';

/**
 * L14 — legendy: prawda i fikcja. `[2.5]` `[1.3 — kultura]`. Domyka moduł 3.
 *
 * **Zdanie lekcji: w legendzie prawda miesza się ze zmyśleniem — a rzeczy,
 * które da się sprawdzić, są jak kamienie wystające z rzeki.**
 *
 * Cztery bloki:
 *  - `LegendaZDowodami` ×2 — **zakreślacz w dwóch kolorach**, potem
 *    **szafa z dowodami** (szuflady wysuwane palcem stemplują fragmenty);
 *    smok wawelski z podpowiedziami, Lech bez nich; pinezka „Lech” we mgle;
 *  - `KosciSmoka` — **przykłada kości z katedry do zwierząt** (sędzia ze
 *    szkieletu: jest taka kość? kształt? długość?) → mamut, wieloryb,
 *    nosorożec włochaty składają się w „smoka”;
 *  - `GluchyTelefonWiekow` — opowieść o młynarzu z Zawidełek przechodzi przez
 *    sześć ust, dziecko **stuka to, co dodano** (sędzia porównuje teksty);
 *    na końcu kamienie, które przetrwały;
 *  - `LegendaWedlugPrzepisu` — **składa legendę z kafelków** według przepisu
 *    (kamień → bohater → cud → nazwa z opowieści); karta badacza „Legenda”.
 *
 * Przypominajka: epoki z L6 (dystans 8) na trzech chwilach legendy o smoku.
 * Fotografie Wawelu, Smoczej Jamy i kości — Wikimedia Commons (licencje przy
 * zdjęciach); ilustracje sunburst tylko dla scen wymyślonych.
 */

const IMAGES = imgMap({
  intro: '/images/historia/lekcje/legendy-prawda-i-fikcja/babcia.jpg',
  wawel: '/images/historia/lekcje/legendy-prawda-i-fikcja/wawel.jpg',
  jama: '/images/historia/lekcje/legendy-prawda-i-fikcja/smocza-jama.jpg',
  kosc: '/images/historia/lekcje/legendy-prawda-i-fikcja/kosc-smoka.jpg',
  mlyn: '/images/historia/lekcje/legendy-prawda-i-fikcja/mlyn.jpg',
  studnia: '/images/historia/lekcje/legendy-prawda-i-fikcja/studnia.jpg',
});

const BLOCKS: HistBlockMeta[] = [
  { id: 'legendy', kind: 'zrodlo', title: 'Legenda z dwoma zakreślaczami', time: '7 min', icon: Highlighter },
  { id: 'kosci', kind: 'sledztwo', title: 'Kości smoka', time: '4 min', icon: Bone },
  { id: 'telefon', kind: 'symulator', title: 'Głuchy telefon wieków', time: '5 min', icon: Radio },
  { id: 'przepis', kind: 'zadanie', title: 'Legenda według przepisu', time: '6 min', icon: ScrollText },
];

const L6_LESSON = getLesson('czas-i-miejsce', 'os-czasu-i-epoki');
const THIS_LESSON = 'mala-i-duza-ojczyzna/legendy-prawda-i-fikcja';

interface LessonProps {
  lesson: HistLesson;
  histModule: HistModule;
  nextLesson?: HistLesson;
}

export function LegendyPrawdaIFikcjaLesson({ lesson, histModule, nextLesson }: LessonProps) {
  return (
    <HistLessonShell
      lesson={lesson}
      histModule={histModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Oddzieliłeś/łaś w dwóch legendach to, co da się sprawdzić, od tego, co zmyślone — i sprawdziłeś/łaś to w szufladach z dowodami. Zobaczyłeś/łaś, że „smocze” kości to mamut, wieloryb i nosorożec, a opowieść o młynarzu w sześciu pokoleniach zamieniła się w walkę ze smokiem. Na końcu sam/a ułożyłeś/łaś legendę według przepisu. Od dziś wiesz, czego szukać w każdej legendzie: w legendzie prawda miesza się ze zmyśleniem — a rzeczy, które da się sprawdzić, są jak kamienie wystające z rzeki."
      entry={
        L6_LESSON ? (
          <Przypominajka from={L6_LESSON} distance={8} color={histModule.color}>
            <SmokWEpokach color={histModule.color} />
          </Przypominajka>
        ) : undefined
      }
    >
      <LessonBody color={histModule.color} />
    </HistLessonShell>
  );
}

function Fotografia({ src, alt, credit, w, h }: { src: string; alt: string; credit: string; w: number; h: number }) {
  return (
    <figure className="space-y-1">
      <Image src={src} alt={alt} width={w} height={h} className="h-auto w-full border" />
      <figcaption className="text-[11px] leading-snug text-muted-foreground">{credit}</figcaption>
    </figure>
  );
}

/** Treść wydzielona z komponentu strony, bo `useBlockDone` działa dopiero w kontekście powłoki. */
function LessonBody({ color }: { color: string }) {
  const legendy = useBlockDone('legendy');
  const kosci = useBlockDone('kosci');
  const telefon = useBlockDone('telefon');
  const przepis = useBlockDone('przepis');

  return (
    <>
      <LessonIntro color={color} />

      <LessonBlock id="legendy">
        <div className="mb-4 grid gap-3 sm:grid-cols-[3fr_2fr]">
          <Fotografia
            src={IMAGES.wawel}
            alt="Fotografia: wzgórze Wawel w Krakowie widziane znad Wisły — ceglane mury i baszty zamku, wieże katedry, zielone zbocze schodzące do rzeki, na wodzie statek wycieczkowy"
            credit="Wzgórze Wawel nad Wisłą. Fot. Zygmunt Put, Wikimedia Commons, licencja CC BY-SA 4.0."
            w={640}
            h={302}
          />
          <Fotografia
            src={IMAGES.jama}
            alt="Fotografia: wnętrze Smoczej Jamy — niska skalna komora oświetlona lampami przy ziemi, kilku zwiedzających stoi pod chropowatym sklepieniem"
            credit="Wnętrze Smoczej Jamy pod Wawelem. Fot. Craig Nagy, Wikimedia Commons, licencja CC BY-SA 2.0."
            w={400}
            h={300}
          />
        </div>
        <LegendyDwie color={color} onComplete={legendy.markBlockDone} done={legendy.done} />
      </LessonBlock>

      <LessonBlock id="kosci">
        <div className="mb-4 grid gap-4 sm:grid-cols-[2fr_3fr] sm:items-center">
          <Fotografia
            src={IMAGES.kosc}
            alt="Fotografia: przy ciemnym marmurowym portalu katedry na Wawelu wiszą na łańcuchu ogromne kości — długa wygięta kość jak łuk, czaszka i gruba kość nogi"
            credit="„Smocze kości” przy wejściu do katedry na Wawelu. Fot. Yohan euan o4, Wikimedia Commons, licencja CC BY-SA 3.0."
            w={400}
            h={300}
          />
          <div className="text-base leading-relaxed">
            <p className="font-semibold">Przy drzwiach katedry wiszą kości.</p>
            <p className="mt-1">
              Wiszą na łańcuchu od średniowiecza. Przez wieki mówiono, że to kości smoka. Każdy, kto wchodzi do katedry,
              może je zobaczyć — to rzecz, nie opowieść.
            </p>
          </div>
        </div>
        <KosciSmoka color={color} onComplete={kosci.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="telefon">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.mlyn}
          alt="Akwarela: drewniany młyn wodny z wielkim kołem nad wezbranym, brązowym strumieniem w czasie ulewy; woda przelewa się przez koło i brzeg, wierzby gną się na wietrze, w oddali na wzgórzu dachy miasteczka z wieżą kościoła i kamienny most"
          lead="Jak rośnie legenda?"
        >
          Każdy, kto opowiada, dokłada trochę od siebie — nie po to, żeby kłamać, tylko żeby słuchało się ciekawiej.
          Po kilku pokoleniach trudno poznać, co zdarzyło się naprawdę.
        </LessonImageCard>
        <div className="mt-4">
          <GluchyTelefonWiekow color={color} onComplete={telefon.markBlockDone} />
        </div>
      </LessonBlock>

      <LessonBlock id="przepis">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.studnia}
          alt="Akwarela: stara kamienna studnia z drewnianym daszkiem i wiadrem pod ogromnym dębem na skraju wsi o zachodzie słońca; polna droga prowadzi do chat krytych strzechą i drewnianego kościoła, nad łąką unosi się mgła"
          lead="Każda legenda ma swój kamień."
          reverse
        >
          Studnię, dąb, górę albo rzekę, którą można zobaczyć do dziś. Wokół nich ludzie układali opowieści.
          Teraz twoja kolej.
        </LessonImageCard>
        <div className="mt-4">
          <LegendaWedlugPrzepisu color={color} onComplete={przepis.markBlockDone} />
        </div>
      </LessonBlock>
    </>
  );
}

/** Blok 1: smok z podpowiedziami, potem Lech bez nich; po obu — pinezka we mgle. */
function LegendyDwie({ color, onComplete, done }: { color: string; onComplete: () => void; done: boolean }) {
  const [stage, setStage] = useState<'smok' | 'lech' | 'koniec'>('smok');
  const finished = stage === 'koniec' || done;
  return (
    <div className="space-y-6">
      <p className="text-base leading-relaxed">
        Legenda to opowieść o dawnych czasach, w której <strong>prawda miesza się ze zmyśleniem</strong>. Weź dwa pisaki
        i zakreśl każdy fragment: zielony — da się sprawdzić, różowy — zmyślone. Potem otwórz szafę z dowodami i zobacz,
        czy miałeś/aś rację.
      </p>

      <LegendaZDowodami legend={SMOK} color={color} onDone={() => setStage((s) => (s === 'smok' ? 'lech' : s))} />

      {stage !== 'smok' && (
        <div className="border-t pt-6">
          <LegendaZDowodami
            legend={LECH}
            color={color}
            hints={false}
            onDone={() => {
              setStage('koniec');
              onComplete();
            }}
          />
        </div>
      )}

      {finished && (
        <div className="space-y-2 border-t pt-4">
          <p className="text-sm leading-relaxed">
            Na twojej Osi dziejów pojawił się Lech — ale bez daty. Wisi we <strong>mgle przed rokiem 966</strong>, zanim
            zaczyna się spisana historia Polski. Tak oś pokazuje legendę: wiemy, że opowiada o czasach bardzo dawnych, ale nie
            umiemy wskazać roku.
          </p>
          <OsDziejow color={color} lesson={THIS_LESSON} defaultMode="piramidy" highlightIds={['lech']} />
        </div>
      )}
    </div>
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
          Zanim ludzie spisywali historię w kronikach, opowiadali ją sobie przy piecu — z pamięci, z dziadka na wnuka.
          Tak powstawały legendy: o smoku spod Wawelu, o Lechu i białym orle, o rycerzach śpiących w górach.
        </p>
        <p className="mt-3">
          Dziś sprawdzisz dwie legendy dowodami, rozwiążesz zagadkę smoczych kości, zobaczysz, jak opowieść zmienia się
          w ustach kolejnych pokoleń — i sam/a ułożysz legendę. Wszystko stoi na jednym zdaniu:{' '}
          <strong>
            w legendzie prawda miesza się ze zmyśleniem — a rzeczy, które da się sprawdzić, są jak kamienie wystające z
            rzeki.
          </strong>
        </p>
      </div>

      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Akwarela: wnętrze drewnianej chaty sprzed ponad stu lat — babcia w chustce siedzi na ławie przy bielonym piecu z ogniem i opowiada, unosząc dłoń; troje dzieci w lnianych ubraniach słucha: dziewczynka z jasnymi warkoczami na stołku i dwóch chłopców na podłodze; lampa naftowa, pęki ziół pod belką, za oknem zmierzch"
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
