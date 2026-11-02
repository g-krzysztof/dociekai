'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { Layers, MessageSquareHeart, Replace } from 'lucide-react';
import {
  LessonBlock,
  POL_BLOCK_KINDS,
  PolLessonShell,
  Przypominajka,
  useBlockDone,
  type PolBlockMeta,
} from '../../lesson-shell';
import { LessonImageCard } from '@/components/ui/lesson-image-card';
import { imgMap } from '@/lib/media';
import { POL_LESSONS, type PolLesson } from '../../../data/lessons';
import type { PolModule } from '../../../data/curriculum';
import { PilkaWOgrodku, type Udane } from './pilka-w-ogrodku';
import { tekstWiadomosci } from './wiadomosc';
import { CzymSieRoznia } from './czym-sie-roznia';
import { PrzekazZuzi } from './przekaz-zuzi';

/**
 * L3 — do kogo mówię? `[1.3]` `[1.5]` `[1.9]`, filary 2 i 1.
 *
 * **Zdanie lekcji: ta sama sprawa brzmi inaczej do kolegi, do sąsiadki i do
 * dyrektorki — i to nie jest udawanie, tylko szacunek.**
 *
 *  - `PilkaWOgrodku` — **suwak odbiorcy pod wiadomością, twarz adresata
 *    reaguje** na każdy kafelek (`wiadomosc.ts`; każda reakcja mówi dlaczego);
 *  - `CzymSieRoznia` — **dwie własne wiadomości nałożone na siebie**, różne
 *    słowa wystają i dają się odjąć (`roznice.ts`) → grzeczność językowa;
 *  - `PrzekazZuzi` — **prostsze słowo upuszczone na trudne** w ogłoszeniu;
 *    werdykt: Zuzia rozumie i wie to samo (`ogloszenie.ts`).
 *
 * Twarze rysuje kod (`twarz.tsx`). Wiadomości z bloku 1 (potrzebne w bloku 2)
 * trzyma `sessionStorage`.
 */

const IMAGES = imgMap({
  intro: '/images/jezyk-polski/lekcje/do-kogo-mowie/pilka-w-grzadce.jpg',
  halina: '/images/jezyk-polski/lekcje/do-kogo-mowie/halina-ogrodek.jpg',
  korytarz: '/images/jezyk-polski/lekcje/do-kogo-mowie/korytarz-szkolny.jpg',
  droga: '/images/jezyk-polski/lekcje/do-kogo-mowie/tymek-zuzia-droga.jpg',
});

const BLOCKS: PolBlockMeta[] = [
  { id: 'pilka', kind: 'rozmowa', title: 'Piłka w ogródku', time: '8 min', icon: MessageSquareHeart },
  { id: 'roznice', kind: 'odkrycie', title: 'Czym się różnią?', time: '5 min', icon: Layers },
  { id: 'zuzia', kind: 'cwiczenie', title: 'Przekaż Zuzi', time: '7 min', icon: Replace },
];

const STATE_KEY = 'dociekai:pol-l3';
const L1 = POL_LESSONS.find((l) => l.moduleSlug === 'start' && l.slug === 'jezyk-dziala')!;

interface LessonProps {
  lesson: PolLesson;
  polModule: PolModule;
  nextLesson?: PolLesson;
  nextModule?: PolModule;
}

export function DoKogoMowieLesson({ lesson, polModule, nextLesson }: LessonProps) {
  return (
    <PolLessonShell
      lesson={lesson}
      polModule={polModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Trzy osoby, trzy wiadomości, jedna sprawa — i Zuzia przyszła na czas, w stroju na WF."
      entry={<PrzypominajkaKartka color={polModule.color} />}
    >
      <LessonBody color={polModule.color} />
    </PolLessonShell>
  );
}

function LessonBody({ color }: { color: string }) {
  const pilka = useBlockDone('pilka');
  const roznice = useBlockDone('roznice');
  const zuzia = useBlockDone('zuzia');
  const [udane, setUdane] = useState<Udane | null>(null);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(STATE_KEY);
      if (raw) setUdane(JSON.parse(raw) as Udane);
    } catch {
      /* prywatne okno */
    }
  }, []);

  const { markBlockDone: pilkaDone } = pilka;
  const onPilka = useCallback(
    (u: Required<Udane>) => {
      setUdane(u);
      try {
        window.sessionStorage.setItem(STATE_KEY, JSON.stringify(u));
      } catch {
        /* prywatne okno */
      }
      pilkaDone();
    },
    [pilkaDone]
  );

  return (
    <>
      <LessonIntro color={color} />

      <LessonBlock id="pilka">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.halina}
          alt="Akwarela: pani Halina, starsza pani w okularach, liliowym swetrze i fartuszku w niebieskie kwiatki, stoi w ogródku pod oknem z konewką w ręce, zasłania usta ze zdziwienia i patrzy na kolorową piłkę między stokrotkami; obok idzie szary pręgowany kot"
          lead="Twoja piłka ciągle gdzieś ląduje."
        >
          Raz u Tymka na balkonie, raz w ogródku pani Haliny, raz za płotem szkoły. Za każdym razem zostawiasz kartkę. Sprawa
          ta sama — oddajcie piłkę. Ale czy słowa też mogą być te same?
        </LessonImageCard>
        <PilkaWOgrodku color={color} onComplete={onPilka} />
      </LessonBlock>

      <LessonBlock id="roznice">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.korytarz}
          alt="Akwarela: długi, cichy korytarz szkoły podstawowej, z jednej strony okna z kwiatami w doniczkach, wieszaki z kurtkami, na końcu zwykłe drewniane drzwi gabinetu bez tabliczki"
          lead="Kartka do pani dyrektor i kartka do Tymka."
        >
          Obie są o tej samej piłce. Połóż jedną na drugiej i zobacz, które słowa się nie pokrywają.
        </LessonImageCard>
        {udane?.tymek && udane.dyrektor ? (
          <CzymSieRoznia
            key={`${tekstWiadomosci(udane.tymek)}|${tekstWiadomosci(udane.dyrektor)}`}
            color={color} tymek={udane.tymek} dyrektor={udane.dyrektor} onComplete={roznice.markBlockDone} />
        ) : (
          <p className="border border-dashed bg-white p-4 text-sm text-muted-foreground dark:bg-zinc-900/80">
            Najpierw zdobądź uśmiech Tymka i pani dyrektor w bloku 1 — tu porównasz te dwie wiadomości.
          </p>
        )}
      </LessonBlock>

      <LessonBlock id="zuzia">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.droga}
          alt="Akwarela: rudy chłopiec w koszulce w pomarańczowo-szare paski, z plecakiem, i mała jasnowłosa dziewczynka z kucykami, w żółtym płaszczyku, różowej sukience i czerwonych kaloszach idą za rękę chodnikiem wśród jesiennych liści; w głębi szkoła"
          reverse
          lead="Zuzia ma pięć lat i chodzi do zerówki w szkole Tymka."
        >
          Pani dyrektor napisała ogłoszenie dla dorosłych. Zuzia musi je zrozumieć — i nie może niczego zgubić.
        </LessonImageCard>
        <PrzekazZuzi color={color} onComplete={zuzia.markBlockDone} />
      </LessonBlock>
    </>
  );
}

/** Przypominajka z L1 (2 lekcje wstecz): ta sama sprawa, inny adresat — wymień słowo. */
const KARTKA = ['Pomożesz', 'mi', 'z', 'rowerem?'];

function PrzypominajkaKartka({ color }: { color: string }) {
  const [ok, setOk] = useState(false);
  const [miss, setMiss] = useState<string | null>(null);
  return (
    <Przypominajka from={L1} distance={2} color={color}>
      <p className="text-sm leading-relaxed sm:text-base">
        Ta kartka trafiła do Tymka. Teraz ta sama sprawa idzie do pani Haliny. Stuknij słowo, które trzeba zmienić.
      </p>
      <p className="mt-3 flex flex-wrap gap-1.5 text-base">
        {(ok ? ['Czy', 'pomoże', 'mi', 'Pani', 'z', 'rowerem?'] : KARTKA).map((w, i) => (
          <button
            key={`${ok}-${i}`}
            type="button"
            disabled={ok}
            onClick={() => {
              if (w === 'Pomożesz') {
                setOk(true);
                setMiss(null);
              } else setMiss(w.replace('?', ''));
            }}
            className="border px-2 py-1"
            style={{ borderColor: ok && (w === 'Czy' || w === 'pomoże' || w === 'Pani') ? color : undefined }}
          >
            {w}
          </button>
        ))}
      </p>
      <p className="mt-2 min-h-[2.75rem] text-sm leading-snug" aria-live="polite">
        {ok
          ? '„Czy pomoże mi Pani z rowerem?” — do starszej sąsiadki mówi się „Pani”, nie „ty”. Dziś więcej takich zamian.'
          : miss
            ? `„${miss}” może zostać. Szukaj słowa, które mówi do kogoś na „ty”.`
            : ''}
      </p>
    </Przypominajka>
  );
}

function LessonIntro({ color }: { color: string }) {
  return (
    <div className="grid gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_260px]">
      <div className="text-base leading-relaxed sm:text-lg">
        <p>
          Do kolegi mówisz inaczej niż do babci, a do babci inaczej niż do dyrektorki szkoły. Czy to znaczy, że udajesz?
        </p>
        <p className="mt-3">
          Dziś ułożysz jedną sprawę na trzy sposoby, sprawdzisz, które słowa robią różnicę, i przetłumaczysz urzędowe
          ogłoszenie dla pięciolatki. Wszystko stoi na jednym zdaniu:{' '}
          <strong>ta sama sprawa brzmi inaczej do różnych osób — i to nie udawanie, tylko szacunek.</strong>
        </p>
      </div>
      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Akwarela: kolorowa piłka leży w grządce z kwiatami pod oknem parteru jasnej kamienicy ze skrzynkami pelargonii w oknach"
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
                  <span className="block font-medium">{POL_BLOCK_KINDS[block.kind].label}</span>
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
