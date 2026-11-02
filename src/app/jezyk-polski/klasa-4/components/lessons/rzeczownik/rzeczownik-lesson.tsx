'use client';

import { useState } from 'react';
import Image from 'next/image';
import { PawPrint, Shovel, Tags } from 'lucide-react';
import { LessonBlock, POL_BLOCK_KINDS, PolLessonShell, Przypominajka, useBlockDone, type PolBlockMeta } from '../../lesson-shell';
import { LessonImageCard } from '@/components/ui/lesson-image-card';
import { imgMap } from '@/lib/media';
import { POL_LESSONS, type PolLesson } from '../../../data/lessons';
import type { PolModule } from '../../../data/curriculum';
import { useWyspa } from '../../../lib/wyspa/use-wyspa';
import { dodajRzecz, ustawNazwe, zmienRzecz } from '../../../lib/wyspa/model';
import { useZapisBloku } from '../use-zapis-bloku';
import { torWyrazu, wyraz, type Tor } from '../odmienne-i-nieodmienne/odmiana';
import { SlowoStawia, type StanStawiania } from './slowo-stawia';
import { TenTaTo } from './ten-ta-to';
import { BurekNiePies, type StanImion } from './burek';
import type { Postawiona, StanTabliczek } from './rzeczy';

/**
 * L14 — słowo stawia rzecz. `[3.1]` `[3.8]` `[3.10]` (rzeczownik, liczba,
 * rodzaj, liczebnik — rozpoznanie), filary 1 i 2. Archetyp **Teatr
 * (tworzenie)** (§ 3a Z5), świat modułu 4: Wyspa bez nazw — łąka i wieś;
 * bez dźwięku (rodzaj dziecko sprawdza własnym głosem — zaproszenie, nie warunek).
 *
 * **Zdanie lekcji: rzeczownik nazywa — i ma rodzaj, który słychać w „ten,
 * ta, to”.**
 *
 *  - `SlowoStawia` — wyraz upuszczony na wyspę: rzeczownik staje się rzeczą;
 *  - `TenTaTo` — tabliczki ten/ta/to i kopie rzeczy z końcówką na żywo;
 *  - `BurekNiePies` — nazwa własna wskazuje jedną rzecz; imiona i nazwa
 *    wyspy wielką literą (tylko na urządzeniu, w stanie Wyspy).
 */

const IMAGES = imgMap({
  intro: '/images/jezyk-polski/lekcje/rzeczownik/wyspa-dom.jpg',
  koza: '/images/jezyk-polski/lekcje/rzeczownik/koza.jpg',
  latarnia: '/images/jezyk-polski/lekcje/rzeczownik/latarnia.jpg',
  pies: '/images/jezyk-polski/lekcje/rzeczownik/pies.jpg',
});

const BLOCKS: PolBlockMeta[] = [
  { id: 'stawia', kind: 'scena', title: 'Słowo stawia rzecz', time: '6 min', icon: Shovel },
  { id: 'tabliczki', kind: 'odkrycie', title: 'Ten, ta, to — i ile', time: '7 min', icon: Tags },
  { id: 'burek', kind: 'cwiczenie', title: 'Burek, nie pies', time: '6 min', icon: PawPrint },
];

const SCOPE = 'pol-l14';
const L13 = POL_LESSONS.find((l) => l.slug === 'odmienne-i-nieodmienne')!;

/** Wyspa dla dziecka, które weszło od środka lekcji: zestaw startowy. */
const STARTOWE: Postawiona[] = [
  { id: 'dom-s', slowo: 'dom', x: 34, y: 40 },
  { id: 'latarnia-s', slowo: 'latarnia', x: 70, y: 30 },
  { id: 'koza-s', slowo: 'koza', x: 46, y: 64 },
  { id: 'drzewo-s', slowo: 'drzewo', x: 24, y: 58 },
  { id: 'studnia-s', slowo: 'studnia', x: 60, y: 52 },
  { id: 'ognisko-s', slowo: 'ognisko', x: 72, y: 70 },
];

interface LessonProps {
  lesson: PolLesson;
  polModule: PolModule;
  nextLesson?: PolLesson;
}

export function RzeczownikLesson({ lesson, polModule, nextLesson }: LessonProps) {
  return (
    <PolLessonShell
      lesson={lesson}
      polModule={polModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Rzeczy, tabliczki i nazwa wyspy zostają na wyspie (na tym urządzeniu). Słowa z kosza „na później” wrócą w następnej lekcji — jedno z nich sprawi, że na wyspie zacznie się dziać."
      entry={<PrzypominajkaZwrotnica color={polModule.color} />}
    >
      <LessonBody color={polModule.color} />
    </PolLessonShell>
  );
}

function LessonBody({ color }: { color: string }) {
  const stawia = useBlockDone('stawia');
  const tabliczki = useBlockDone('tabliczki');
  const burek = useBlockDone('burek');
  const zapisStaw = useZapisBloku<StanStawiania>('stawia', stawia.done, SCOPE);
  const zapisTab = useZapisBloku<StanTabliczek>('tabliczki', tabliczki.done, SCOPE);
  const zapisImion = useZapisBloku<StanImion>('burek', burek.done, SCOPE);
  const { wyspa, update } = useWyspa();
  // Rzeczy żyją w lekcji: blok 2 przybija tabliczki do rzeczy z bloku 1.
  const [postawione, setPostawione] = useState<Postawiona[] | null>(null);
  const teraz = postawione ?? zapisStaw.restored?.postawione ?? [];
  const doTabliczek = teraz.length >= 6 ? teraz : STARTOWE;

  const imie = (k: string, v: string) =>
    update((rec, now) => {
      if (k === 'wyspa') return ustawNazwe(rec, v, now);
      const r = rec.rzeczy.find((x) => x.slowo === k);
      if (r) return zmienRzecz(rec, r.id, { imie: v }, now);
      return dodajRzecz(rec, { id: `l14-${k}`, slowo: k, x: 50, y: 50, imie: v }, now);
    });

  return (
    <>
      <LessonIntro color={color} />
      <LessonBlock id="stawia">
        <SlowoStawia
          key={zapisStaw.restored ? 'zapis' : 'nowe'}
          color={color}
          zMagazynu={wyspa.magazyn.length > 0}
          initial={zapisStaw.restored}
          onState={(s) => {
            setPostawione(s.postawione);
            zapisStaw.save(s);
          }}
          onPostaw={(r) => update((rec, now) => dodajRzecz(rec, { id: r.id, slowo: r.slowo, x: r.x, y: r.y }, now))}
          onComplete={stawia.markBlockDone}
        />
      </LessonBlock>
      <LessonBlock id="tabliczki">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.koza}
          alt="Akwarela: biała koza pasie się na łące przy starej drewnianej studni z daszkiem, w tle morze, wysepka i żaglówka"
          lead="Każda rzecz dostaje tabliczkę."
        >
          Na tabliczce stanie jedno małe słowo: „ten”, „ta” albo „to”. Które pasuje — usłyszysz, kiedy powiesz je razem z nazwą rzeczy.
        </LessonImageCard>
        <TenTaTo
          key={`${zapisTab.restored ? 'zapis' : 'nowe'}-${doTabliczek === STARTOWE ? 's' : 'd'}`}
          color={color}
          rzeczy={doTabliczek}
          initial={zapisTab.restored}
          onState={zapisTab.save}
          onZmiana={(id, patch) => update((rec, now) => zmienRzecz(rec, id, patch, now))}
          onComplete={tabliczki.markBlockDone}
        />
      </LessonBlock>
      <LessonBlock id="burek">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.pies}
          alt="Akwarela: kudłaty jasny pies siedzi na końcu drewnianego pomostu i patrzy w morze, w oddali latarnia i żaglówka"
          reverse
          lead="Na pomoście siedzi pies."
        >
          Na razie to po prostu „pies” — taki jak każdy inny. Zaraz dostanie imię. I nie tylko on.
        </LessonImageCard>
        <BurekNiePies
          key={zapisImion.restored ? 'zapis' : 'nowe'}
          color={color}
          initial={zapisImion.restored}
          onState={zapisImion.save}
          onImie={imie}
          onComplete={burek.markBlockDone}
        />
        {burek.done && (
          <div className="relative mx-auto mt-4 aspect-[4/3] w-full max-w-md overflow-hidden border">
            <Image
              src={IMAGES.latarnia}
              alt="Akwarela: biała latarnia morska z czerwonym szczytem na skałach nad morzem o zmierzchu, lampa jeszcze nie zapalona, na niebie pierwsze gwiazdy i sierp księżyca"
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

/** Przypominajka z L13: przestaw zwrotnicę dla dwóch wyrazów — bez werdyktu. */
const P_WYRAZY = ['ryba', 'czesto'];
function PrzypominajkaZwrotnica({ color }: { color: string }) {
  const [tory, setTory] = useState<Record<string, Tor>>({});
  return (
    <Przypominajka from={L13} distance={1} color={color}>
      <p className="text-sm leading-relaxed sm:text-base">Na który tor? Przestaw zwrotnicę dla dwóch wyrazów.</p>
      <ul className="mt-2 space-y-1.5">
        {P_WYRAZY.map((id) => {
          const w = wyraz(id);
          const t = tory[id];
          return (
            <li key={id} className="flex flex-wrap items-center gap-2 text-sm sm:text-base">
              <span className="w-16 font-serif">{w.tekst}</span>
              {(['guma', 'kamien'] as const).map((x) => (
                <button
                  key={x}
                  type="button"
                  onClick={() => setTory((p) => ({ ...p, [id]: x }))}
                  className="border px-2 py-0.5 text-sm"
                  style={t === x ? { borderColor: color, background: `${color}18` } : undefined}
                >
                  {x === 'guma' ? 'guma' : 'kamień'}
                </button>
              ))}
              <span className="text-muted-foreground">
                {t && (torWyrazu(w) === t ? 'dojechał' : torWyrazu(w) === 'guma' ? `utknął: ${w.liczba?.join(' → ')}` : 'utknął: zawsze taki sam')}
              </span>
            </li>
          );
        })}
      </ul>
    </Przypominajka>
  );
}

function LessonIntro({ color }: { color: string }) {
  return (
    <div className="grid gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_260px]">
      <div className="text-base leading-relaxed sm:text-lg">
        <p>Wyspa wciąż jest pusta. Ale słowa z magazynu mają moc: niektóre z nich potrafią postawić na łące to, co nazywają.</p>
        <p className="mt-3">
          Sprawdzisz które, przybijesz tabliczki i nadasz wyspie nazwę. Wszystko stoi na jednym zdaniu:{' '}
          <strong>rzeczownik nazywa — i ma rodzaj, który słychać w „ten, ta, to”.</strong>
        </p>
      </div>
      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Akwarela: mała zielona wyspa z lotu ptaka na turkusowym morzu, z piaszczystym brzegiem, pomostem i łódką, a pośrodku łąki jeden mały dom z dymem z komina"
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
