'use client';

import { useState } from 'react';
import Image from 'next/image';
import { BookOpen, Hand, Theater } from 'lucide-react';
import { LessonBlock, POL_BLOCK_KINDS, PolLessonShell, Przypominajka, useBlockDone, type PolBlockMeta } from '../../lesson-shell';
import { LessonImageCard } from '@/components/ui/lesson-image-card';
import { imgMap } from '@/lib/media';
import { POL_LESSONS, type PolLesson } from '../../../data/lessons';
import type { PolModule } from '../../../data/curriculum';
import { bookById } from '../../../data/czytelnia';
import { useZapisBloku } from '../use-zapis-bloku';
import { zdanieKota } from '../male-slowa/domek';
import { KACZATKO, frazyOtwarcia, scena } from './makieta';
import { MakietaBlok, type StanMakiety } from './makieta-blok';
import { DwochNarratorow, type StanNarratorow } from './dwoch-narratorow';
import { MakietaZPolki, type StanPolki } from './makieta-z-polki';

/**
 * L18 — świat przedstawiony. `[2.4]` `[2.8]` `[7.1]`, filary 2, 3, 5.
 * Archetyp **Teatr**, świat modułu 5: teatr papierowy; bez dźwięku.
 *
 * **Zdanie lekcji: każda opowieść to mały świat: ktoś, gdzieś, kiedyś, coś —
 * i ktoś, kto o tym opowiada.**
 *
 *  - `MakietaBlok` (blok 1) — frazy „Brzydkiego kaczątka” wyciągane na scenę; teatr stawia je wg adnotacji, słowa narratora do ręki zza kulis (jedyny dowód w tekście);
 *  - `DwochNarratorow` — ręka narratora na Tymku, reflektor zawęża świat do tego, co widzi bohater;
 *  - `MakietaZPolki` — ta sama scenka na otwarciu wybranej książki Czytelni.
 */

const IMAGES = imgMap({
  intro: '/images/jezyk-polski/lekcje/swiat-przedstawiony/teatrzyk.jpg',
  wies: '/images/jezyk-polski/lekcje/swiat-przedstawiony/wies-lato.jpg',
  reka: '/images/jezyk-polski/lekcje/swiat-przedstawiony/reka-kulisy.jpg',
  dziewczynka: '/images/jezyk-polski/lekcje/swiat-przedstawiony/dziewczynka-teatrzyk.jpg',
});

const BLOCKS: PolBlockMeta[] = [
  { id: 'makieta', kind: 'tekst', title: 'Makieta', time: '10 min', icon: Theater },
  { id: 'reka', kind: 'odkrycie', title: 'Ręka wchodzi na scenę', time: '8 min', icon: Hand },
  { id: 'polka', kind: 'cwiczenie', title: 'Makieta z twojej półki', time: '10 min', icon: BookOpen },
];

const SCOPE = 'pol-l18';
const L17 = POL_LESSONS.find((l) => l.slug === 'male-slowa')!;
const KACZATKO_BODY = bookById('brzydkie-kaczatko')!.episodes[0].source.body;
const FRAZY_KACZATKA = frazyOtwarcia(KACZATKO);

interface LessonProps {
  lesson: PolLesson;
  polModule: PolModule;
  nextLesson?: PolLesson;
}

export function SwiatPrzedstawionyLesson({ lesson, polModule, nextLesson }: LessonProps) {
  return (
    <PolLessonShell
      lesson={lesson}
      polModule={polModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Umiesz już rozłożyć opowieść na scenę: tło, lampa, figurki, taśma zdarzeń — i ręka zza kulis. Następna lekcja zagląda do baśni: po co jej cuda?"
      entry={<PrzypominajkaKota color={polModule.color} />}
    >
      <LessonBody color={polModule.color} />
    </PolLessonShell>
  );
}

function LessonBody({ color }: { color: string }) {
  const makieta = useBlockDone('makieta');
  const reka = useBlockDone('reka');
  const polka = useBlockDone('polka');
  const zapisMakiety = useZapisBloku<StanMakiety>('makieta', makieta.done, SCOPE);
  const zapisReki = useZapisBloku<StanNarratorow>('reka', reka.done, SCOPE);
  const zapisPolki = useZapisBloku<StanPolki>('polka', polka.done, SCOPE);
  const [mojaScena, setMojaScena] = useState<string[]>([]);
  const postawione = zapisMakiety.restored?.postawione ?? mojaScena;

  return (
    <>
      <LessonIntro color={color} />
      <LessonBlock id="makieta">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.wies}
          alt="Akwarela: letnia wieś — złote pole zboża, stogi siana, bocian w trawie, przy rzece wielkie liście łopianu, a w oddali na wzgórzu stary zamek z wieżyczkami"
          lead="Pusta scena czeka"
        >
          Teatrzyk jest pusty: szyna u góry, lampa na sznurku, deski i taśma pod sceną. Przeczytaj początek „Brzydkiego kaczątka” i przenoś
          na scenę kawałki tekstu. Teatr sam wie, gdzie co postawić — patrz, co się dzieje.
        </LessonImageCard>
        <MakietaBlok
          key={zapisMakiety.restored ? 'zapis' : 'nowe'}
          otwarcie={KACZATKO}
          body={KACZATKO_BODY}
          color={color}
          initial={zapisMakiety.restored}
          onState={(s) => {
            setMojaScena(s.postawione);
            zapisMakiety.save(s);
          }}
          onComplete={makieta.markBlockDone}
        />
        {makieta.done && <Terminy color={color} postawione={postawione} />}
      </LessonBlock>
      <LessonBlock id="reka">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.reka}
          alt="Akwarela: dłoń dorosłego trzyma papierową kaczkę na patyczku za bocznym skrzydłem drewnianego teatrzyku z zasuniętą czerwoną kurtyną"
          reverse
          lead="Kto trzyma rękę za kulisami?"
        >
          Ręka zza kulis opowiada scenę z lodowiska. Widzi wszystko: Tymka, Olę, budkę z herbatą. A co by było, gdyby opowiadał sam Tymek?
        </LessonImageCard>
        <DwochNarratorow
          key={zapisReki.restored ? 'zapis' : 'nowe'}
          color={color}
          initial={zapisReki.restored}
          onState={zapisReki.save}
          onComplete={reka.markBlockDone}
        />
      </LessonBlock>
      <LessonBlock id="polka">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.dziewczynka}
          alt="Akwarela: dziewczynka w wieku około dziewięciu lat, w musztardowym swetrze, siedzi na dywanie przy teatrzyku i zagląda na scenę z boku; na scenie papierowy zając i lis, obok leżą wycinanki na patyczkach"
          lead="Twoja książka na scenie"
        >
          Każda opowieść ma swój mały świat. Wybierz książkę z Czytelni i postaw makietę jej początku — tym razem bez podpowiedzi.
        </LessonImageCard>
        <MakietaZPolki
          key={zapisPolki.restored ? 'zapis' : 'nowe'}
          color={color}
          initial={zapisPolki.restored}
          onState={zapisPolki.save}
          onComplete={polka.markBlockDone}
        />
      </LessonBlock>
    </>
  );
}

/** Terminy po bloku 1 — na makiecie dziecka, z jego frazami. */
function Terminy({ color, postawione }: { color: string; postawione: string[] }) {
  const s = scena(FRAZY_KACZATKA, postawione);
  const przyklad = (lista: { tekst: string }[]) => (lista.length ? `„${lista[0].tekst}”` : '');
  const wiersze: [string, string, string][] = [
    ['wszystko, co stoi na scenie', 'świat przedstawiony', ''],
    ['figurki na deskach', 'bohaterowie', przyklad(s.deski)],
    ['karta tła i lampa', 'miejsce i czas akcji', [przyklad(s.tlo), przyklad(s.lampa)].filter(Boolean).join(', ')],
    ['taśma zdarzeń, po kolei', 'fabuła', przyklad(s.tasma)],
    ['ręka zza kulis', 'narrator', przyklad(s.narrator)],
  ];
  return (
    <div className="mt-4 border-l-4 bg-white p-4 dark:bg-zinc-900/80" style={{ borderColor: color }}>
      <p className="text-base leading-relaxed">Twoja makieta ma nazwy. Tak mówi się o każdej opowieści:</p>
      <dl className="mt-2 divide-y text-sm sm:text-base">
        {wiersze.map(([co, termin, przyk]) => (
          <div key={termin} className="grid gap-1 py-1.5 sm:grid-cols-[12rem_11rem_1fr]">
            <dt className="text-muted-foreground">{co}</dt>
            <dd className="font-semibold" style={{ color }}>
              {termin}
            </dd>
            <dd className="font-serif italic">{przyk}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Zauważ: „Nudziło jej się bardzo” też poszło do ręki. Kaczka tego nie mówi — mówi to narrator, który zagląda do jej głowy.
      </p>
    </div>
  );
}

/** Przypominajka z L17: kot ma siedzieć „pod stołem” — bez werdyktu. */
function PrzypominajkaKota({ color }: { color: string }) {
  const [gdzie, setGdzie] = useState<'na-stole' | 'pod-stolem' | 'przed-stolem'>('na-stole');
  const miejsca: { id: typeof gdzie; y: number }[] = [
    { id: 'na-stole', y: 22 },
    { id: 'pod-stolem', y: 52 },
    { id: 'przed-stolem', y: 74 },
  ];
  const kotY = miejsca.find((m) => m.id === gdzie)!.y;
  return (
    <Przypominajka from={L17} distance={1} color={color}>
      <p className="text-sm leading-relaxed sm:text-base">Przestaw kota tak, żeby zdanie mówiło „pod stołem”.</p>
      <div className="mt-2 flex items-center gap-3">
        <svg viewBox="0 0 120 90" className="h-24 w-32 shrink-0 border bg-[#fffaf0]" role="group" aria-label="Stół i kot">
          <rect x={20} y={30} width={80} height={6} fill="#c08a5a" stroke="#5b4636" />
          <rect x={26} y={36} width={5} height={30} fill="#c08a5a" stroke="#5b4636" />
          <rect x={89} y={36} width={5} height={30} fill="#c08a5a" stroke="#5b4636" />
          <line x1={0} y1={66} x2={120} y2={66} stroke="#5b4636" />
          {miejsca.map((m) => (
            <rect
              key={m.id}
              x={20}
              y={m.y - 14}
              width={80}
              height={18}
              fill="transparent"
              className="cursor-pointer"
              onClick={() => setGdzie(m.id)}
              aria-label={m.id.replace('-', ' ')}
            />
          ))}
          <g className="pointer-events-none transition-transform duration-300" style={{ transform: `translateY(${kotY}px)` }}>
            <path d="M52 0c0-6 4-9 8-9s8 3 8 9zM53-9l2-5 3 4M67-9l-2-5-3 4" fill="#f59e0b" stroke="#5b4636" strokeWidth={0.8} />
          </g>
        </svg>
        <p className="font-serif text-base" aria-live="polite">
          {zdanieKota(gdzie)}
          {gdzie === 'pod-stolem' && <span className="ml-1 font-sans text-sm" style={{ color }}>Jest.</span>}
        </p>
      </div>
    </Przypominajka>
  );
}

function LessonIntro({ color }: { color: string }) {
  return (
    <div className="grid gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_260px]">
      <div className="text-base leading-relaxed sm:text-lg">
        <p>
          Wyspa została za tobą. Teraz wchodzisz do teatru — małego, papierowego, takiego, który mieści się na stole. Na jego scenie stanie
          każda opowieść, jaką przeczytasz w tym module.
        </p>
        <p className="mt-3">
          Postawisz na scenie początek baśni, zajrzysz za kulisy i ułożysz makietę z wybranej książki. Wszystko stoi na jednym zdaniu:{' '}
          <strong>każda opowieść to mały świat: ktoś, gdzieś, kiedyś, coś — i ktoś, kto o tym opowiada.</strong>
        </p>
      </div>
      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Akwarela: drewniany teatrzyk papierowy na stole, czerwona kurtyna rozsunięta, pusta scena w ciepłym świetle lampki"
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
