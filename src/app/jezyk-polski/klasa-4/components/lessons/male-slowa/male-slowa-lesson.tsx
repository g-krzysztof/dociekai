'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { Cat, Map as MapIcon, StickyNote } from 'lucide-react';
import { LessonBlock, POL_BLOCK_KINDS, PolLessonShell, Przypominajka, useBlockDone, type PolBlockMeta } from '../../lesson-shell';
import { LessonImageCard } from '@/components/ui/lesson-image-card';
import { imgMap } from '@/lib/media';
import { POL_LESSONS, type PolLesson } from '../../../data/lessons';
import type { PolModule } from '../../../data/curriculum';
import { useWyspa } from '../../../lib/wyspa/use-wyspa';
import { ustawKota } from '../../../lib/wyspa/model';
import { useTeczka } from '../../../lib/teczka/use-teczka';
import { useZapisBloku } from '../use-zapis-bloku';
import { RzeczWyspy } from '../rzeczownik/rysunki-wyspy';
import { ocenTabliczke, slowo, stawia, type Tabliczka } from '../rzeczownik/rzeczy';
import { GdzieJestKot, type StanKota } from './gdzie-jest-kot';
import { ZaDuzoTymka } from './za-duzo-tymka';
import { WyspaSkonczona, type StanMapy } from './wyspa-skonczona';
import { kartkaMapy, zbudujMape } from './mapa';
import type { StanZaimkow } from './zaimki';

/**
 * L17 — małe słowa. `[3.1]` `[3.3]` `[3.10]` (przyimek, zaimek — rozpoznanie),
 * filary 1 i 2. Archetyp **Maszyna odwrócona** (dziecko rusza świat, a język
 * idzie za nim), świat modułu 4: domek przy latarni, Tymek przypływa łódką;
 * bez dźwięku. Zamyka moduł 4 przelotem nad mapą wyspy.
 *
 * **Zdanie lekcji: małe słowa ustawiają świat — „na”, „pod”, „za” mówią,
 * gdzie co jest, a „on” zastępuje imię, jeśli wiadomo, o kogo chodzi.**
 *
 *  - `GdzieJestKot` — kot po domku, zdanie zmienia przyimek i końcówkę; potem odwrotnie;
 *  - `ZaDuzoTymka` — naklejki-zaimki na imieniu, niejasne zdania odsłaniane;
 *  - `WyspaSkonczona` — R: przelot nad mapą wyspy z całego modułu, kartka w Teczce.
 */

const IMAGES = imgMap({
  intro: '/images/jezyk-polski/lekcje/male-slowa/domek.jpg',
  kot: '/images/jezyk-polski/lekcje/male-slowa/kot-kosz.jpg',
  chlopcy: '/images/jezyk-polski/lekcje/male-slowa/chlopcy-lodka.jpg',
  zachod: '/images/jezyk-polski/lekcje/male-slowa/wyspa-zachod.jpg',
});

const BLOCKS: PolBlockMeta[] = [
  { id: 'kot', kind: 'scena', title: 'Gdzie jest kot?', time: '8 min', icon: Cat },
  { id: 'tymek', kind: 'cwiczenie', title: 'Za dużo Tymka', time: '8 min', icon: StickyNote },
  { id: 'wyspa', kind: 'refleksja', title: 'Wyspa skończona', time: '4 min', icon: MapIcon },
];

const SCOPE = 'pol-l17';
const LESSON = 'czesci-mowy/male-slowa';
const TECZKA_ID = `${LESSON}#mapa`;
const PLAN_L15 = 'czesci-mowy/czasownik#plan';
const L14 = POL_LESSONS.find((l) => l.slug === 'rzeczownik')!;

interface LessonProps {
  lesson: PolLesson;
  polModule: PolModule;
  nextLesson?: PolLesson;
}

export function MaleSlowaLesson({ lesson, polModule, nextLesson }: LessonProps) {
  return (
    <PolLessonShell
      lesson={lesson}
      polModule={polModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Wyspa jest skończona, a jej mapa leży w Teczce. Następny moduł zabiera cię z wyspy w świat opowieści: baśni, mitów i legend."
      entry={<PrzypominajkaTabliczki color={polModule.color} />}
    >
      <LessonBody color={polModule.color} />
    </PolLessonShell>
  );
}

function LessonBody({ color }: { color: string }) {
  const kot = useBlockDone('kot');
  const tymek = useBlockDone('tymek');
  const wyspaBlok = useBlockDone('wyspa');
  const zapisKota = useZapisBloku<StanKota>('kot', kot.done, SCOPE);
  const zapisTymka = useZapisBloku<StanZaimkow>('tymek', tymek.done, SCOPE);
  const zapisMapy = useZapisBloku<StanMapy>('wyspa', wyspaBlok.done, SCOPE);
  const { wyspa, update } = useWyspa();
  const { teczka, save } = useTeczka();
  const plan = teczka.items[PLAN_L15]?.text ?? null;
  const mapa = useMemo(() => zbudujMape(wyspa, plan), [wyspa, plan]);
  const zapisana = !!teczka.items[TECZKA_ID];

  const zapiszMape = () =>
    save({
      id: TECZKA_ID,
      lesson: LESSON,
      kind: 'mapa',
      title: `Mapa wyspy${wyspa.nazwa ? ` ${wyspa.nazwa}` : ''}`,
      text: kartkaMapy(mapa, wyspa, plan),
      parts: { rzeczy: JSON.stringify(mapa.rzeczy), ...(wyspa.kot ? { kot: wyspa.kot } : {}) },
    });

  return (
    <>
      <LessonIntro color={color} wyspa={wyspa.nazwa} />
      <LessonBlock id="kot">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.kot}
          alt="Akwarela: rudy kot śpi zwinięty w wiklinowym koszu przy oknie, za szybą morze"
          lead="Kot, który nie usiedzi"
        >
          W domku przy latarni mieszka rudy kot. Raz śpi w koszu, raz siedzi na szafie, raz chowa się pod stołem. Przenoś go — i patrz, co
          robi zdanie.
        </LessonImageCard>
        <GdzieJestKot
          key={zapisKota.restored ? 'zapis' : 'nowe'}
          color={color}
          initial={zapisKota.restored}
          onState={zapisKota.save}
          onKot={(s) => update((rec, now) => ustawKota(rec, s, now))}
          onComplete={kot.markBlockDone}
        />
      </LessonBlock>
      <LessonBlock id="tymek">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.chlopcy}
          alt="Akwarela: dwóch chłopców z plecakami, widzianych od tyłu — rudy w pasiastej koszulce wysiada z drewnianej łódki, ciemnowłosy w granatowej bluzie idzie już po pomoście; na wzgórzu latarnia i biały domek"
          reverse
          lead="Goście z łódki"
        >
          Na wyspę przypłynął Tymek z kolegą Kubą. Ktoś opisał ich wizytę, ale chyba za bardzo lubi imię „Tymek”.
        </LessonImageCard>
        <ZaDuzoTymka
          key={zapisTymka.restored ? 'zapis' : 'nowe'}
          color={color}
          initial={zapisTymka.restored}
          onState={zapisTymka.save}
          onComplete={tymek.markBlockDone}
        />
      </LessonBlock>
      <LessonBlock id="wyspa">
        <WyspaSkonczona
          key={zapisMapy.restored ? 'zapis' : 'nowe'}
          color={color}
          mapa={mapa}
          nazwa={wyspa.nazwa}
          tor={!!wyspa.tor}
          initial={zapisMapy.restored}
          onState={zapisMapy.save}
          onZapisz={zapiszMape}
          zapisana={zapisana}
          onComplete={wyspaBlok.markBlockDone}
        />
        {wyspaBlok.done && (
          <div className="relative mx-auto mt-4 aspect-[4/3] w-full max-w-md overflow-hidden border">
            <Image
              src={IMAGES.zachod}
              alt="Akwarela: wyspa z daleka o zachodzie słońca, na wzgórzu latarnia z zapalonym światłem i kilka domków, z boku drewniany pomost, różowe niebo odbija się w wodzie, na pierwszym planie skały brzegu"
              width={448}
              height={336}
              className="h-full w-full object-cover"
            />
          </div>
        )}
      </LessonBlock>
    </>
  );
}

/** Przypominajka z L14: przybij tabliczkę „ten / ta / to” do dwóch rzeczy z wyspy — bez werdyktu. */
function PrzypominajkaTabliczki({ color }: { color: string }) {
  const { wyspa } = useWyspa();
  const [wynik, setWynik] = useState<Record<string, { t: Tabliczka; ok: boolean }>>({});
  const zWyspy = [...new Set(wyspa.rzeczy.map((r) => r.slowo))].filter((id) => {
    try {
      return stawia(slowo(id));
    } catch {
      return false;
    }
  });
  const dwie = (zWyspy.length >= 2 ? zWyspy : ['latarnia', 'drzewo']).slice(0, 2);
  return (
    <Przypominajka from={L14} distance={3} color={color}>
      <p className="text-sm leading-relaxed sm:text-base">Przybij tabliczkę „ten”, „ta” albo „to” do dwóch rzeczy z wyspy. Powiedz po cichu: brzmi?</p>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {dwie.map((id) => {
          const s = slowo(id);
          const w = wynik[id];
          return (
            <div key={id} className="flex items-center gap-2 border p-2">
              <RzeczWyspy id={id} className="h-10 w-10 shrink-0" />
              <div className="min-w-0">
                <p className="font-serif text-base">
                  {w?.ok ? <b style={{ color }}>{w.t} </b> : null}
                  {s.tekst}
                </p>
                <div className="mt-1 flex gap-1.5">
                  {(['ten', 'ta', 'to'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setWynik((p) => ({ ...p, [id]: { t, ok: ocenTabliczke(s, t).ok } }))}
                      className="border px-2 py-0.5 font-serif text-sm"
                      style={w?.t === t ? { borderColor: w.ok ? color : '#dc2626' } : undefined}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <p className="mt-1 min-h-[1.25rem] text-xs text-muted-foreground" aria-live="polite">
                  {w && !w.ok ? `„${w.t} ${s.tekst}” — nie brzmi, tabliczka odpada.` : w?.ok ? 'Wisi.' : ''}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </Przypominajka>
  );
}

function LessonIntro({ color, wyspa }: { color: string; wyspa?: string }) {
  return (
    <div className="grid gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_260px]">
      <div className="text-base leading-relaxed sm:text-lg">
        <p>
          W koszu „na później” od lekcji o rzeczowniku leży słówko „pod”. Spadło na piasek, bo samo niczego nie nazywa. Dziś na wyspie
          {wyspa ? ` ${wyspa}` : ''} znajdzie wreszcie robotę — razem z innymi małymi słowami.
        </p>
        <p className="mt-3">
          Poprzestawiasz kota w domku przy latarni, poprawisz opowiadanie o Tymku i obejrzysz całą wyspę z góry. Wszystko stoi na jednym
          zdaniu: <strong>małe słowa ustawiają świat — „na”, „pod”, „za” mówią, gdzie co jest, a „on” zastępuje imię, jeśli wiadomo, o kogo chodzi.</strong>
        </p>
      </div>
      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Akwarela: mały biały domek przy biało-czerwonej latarni na skalistym brzegu, z komina leci dym, wiatr pochyla trawę, nad morzem mewy"
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
