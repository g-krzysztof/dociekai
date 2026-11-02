'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Cake, Flag } from 'lucide-react';
import { LessonBlock, POL_BLOCK_KINDS, PolLessonShell, Przypominajka, useBlockDone, type PolBlockMeta } from '../../lesson-shell';
import { LessonImageCard } from '@/components/ui/lesson-image-card';
import { imgMap } from '@/lib/media';
import { POL_LESSONS, type PolLesson } from '../../../data/lessons';
import type { PolModule } from '../../../data/curriculum';
import { useWyspa } from '../../../lib/wyspa/use-wyspa';
import { ustawTor, ustawTort } from '../../../lib/wyspa/model';
import { useZapisBloku } from '../use-zapis-bloku';
import { START, skutek, wyraz } from '../odmienne-i-nieodmienne/odmiana';
import { WyscigSlimakow, type StanWyscigu } from './wyscig-slimakow';
import { TortNaZamowienie, type StanTortu } from './tort-na-zamowienie';
import { doWyspy } from './tort';

/**
 * L16 — wyścig i tort. `[3.1]` `[3.10]` (przymiotnik, przysłówek;
 * stopniowanie — tylko zajrzenie) `[4.5]`, filary 1 i 2. Archetyp **Gra**
 * (jedna gra z etapami, § 3a Z5), świat modułu 4: tor wokół wyspy i
 * cukiernia na przystani; bez dźwięku. Jedyna „postać reaguje” w module 4:
 * klient cukierni zapala przymiotniki zamówienia.
 *
 * **Zdanie lekcji: przymiotnik maluje przedmiot, przysłówek mówi, jak coś
 * się dzieje.**
 *
 *  - `WyscigSlimakow` — karta przysłówka zmienia fizykę ślimaka, pięć odcinków;
 *  - `TortNaZamowienie` — tort budowany według przymiotników, cecha po cesze,
 *    potem terminy i słowa z kosza L14 w ramach „jak?” / „jaki?”.
 */

const IMAGES = imgMap({
  intro: '/images/jezyk-polski/lekcje/przymiotnik-i-przyslowek/slimaki.jpg',
  pies: '/images/jezyk-polski/lekcje/przymiotnik-i-przyslowek/pies-spi.jpg',
  cukiernia: '/images/jezyk-polski/lekcje/przymiotnik-i-przyslowek/cukiernia.jpg',
  tort: '/images/jezyk-polski/lekcje/przymiotnik-i-przyslowek/tort.jpg',
});

const BLOCKS: PolBlockMeta[] = [
  { id: 'wyscig', kind: 'cwiczenie', title: 'Wyścig ślimaków', time: '10 min', icon: Flag },
  { id: 'tort', kind: 'cwiczenie', title: 'Tort na zamówienie', time: '9 min', icon: Cake },
];

const SCOPE = 'pol-l16';
const L13 = POL_LESSONS.find((l) => l.slug === 'odmienne-i-nieodmienne')!;

interface LessonProps {
  lesson: PolLesson;
  polModule: PolModule;
  nextLesson?: PolLesson;
}

export function PrzymiotnikIPrzyslowekLesson({ lesson, polModule, nextLesson }: LessonProps) {
  return (
    <PolLessonShell
      lesson={lesson}
      polModule={polModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Tor ślimaków i ostatni tort zostają na przystani wyspy. W następnej lekcji przypłynie łódką Tymek, a na wyspie zamieszka kot, który nie usiedzi w jednym miejscu."
      entry={<PrzypominajkaOdmieniarka color={polModule.color} />}
    >
      <LessonBody color={polModule.color} />
    </PolLessonShell>
  );
}

function LessonBody({ color }: { color: string }) {
  const wyscig = useBlockDone('wyscig');
  const tort = useBlockDone('tort');
  const zapisWyscigu = useZapisBloku<StanWyscigu>('wyscig', wyscig.done, SCOPE);
  const zapisTortu = useZapisBloku<StanTortu>('tort', tort.done, SCOPE);
  const { wyspa, update } = useWyspa();

  const poWyscigu = () => {
    update((rec, now) => ustawTor(rec, now));
    wyscig.markBlockDone();
  };

  return (
    <>
      <LessonIntro color={color} wyspa={wyspa.nazwa} />
      <LessonBlock id="wyscig">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.pies}
          alt="Akwarela: rudo-biały pies śpi zwinięty w słońcu przy drewnianym płocie, wysoko na sztachecie siedzi mały ślimak, obok doniczka ze stokrotkami"
          lead="Jak pełznie ślimak?"
        >
          Zwykły ślimak pełznie zwyczajnie: trochę na boki, a muszla czasem stuknie o kamień. Karta, którą na nim położysz, zmieni tylko to, co mówi jej słowo.
        </LessonImageCard>
        <WyscigSlimakow
          key={zapisWyscigu.restored ? 'zapis' : 'nowe'}
          color={color}
          initial={zapisWyscigu.restored}
          onState={zapisWyscigu.save}
          onComplete={poWyscigu}
        />
      </LessonBlock>
      <LessonBlock id="tort">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.cukiernia}
          alt="Akwarela: mała drewniana cukiernia na przystani, w witrynie torty, przed nią beczki i pomost z łódką, w oddali domy na wzgórzu, latarnia i żaglówka"
          reverse
          lead="Cukiernia na przystani"
        >
          Cukiernik ma trzy zamówienia od mieszkańców wyspy. Każde opisuje tort samymi słowami — trzeba je tylko dokładnie przeczytać.
        </LessonImageCard>
        <TortNaZamowienie
          key={zapisTortu.restored ? 'zapis' : 'nowe'}
          color={color}
          initial={zapisTortu.restored}
          onState={zapisTortu.save}
          onTort={(b) => {
            const t = doWyspy(b);
            if (t) update((rec, now) => ustawTort(rec, t, now));
          }}
          onComplete={tort.markBlockDone}
        />
        {tort.done && (
          <div className="relative mx-auto mt-4 aspect-[4/3] w-full max-w-md overflow-hidden border">
            <Image
              src={IMAGES.tort}
              alt="Akwarela: trzypiętrowy tort czekoladowy z wiśniami na szklanej paterze, na stole w ogrodzie, obok miseczka wiśni i dzbanek z kwiatami"
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

/** Przypominajka z L13: odmieniarka zmienia „zielony”, a „szybko” zostawia — bez werdyktu. */
function PrzypominajkaOdmieniarka({ color }: { color: string }) {
  const [id, setId] = useState<string | null>(null);
  const s = id ? skutek(wyraz(id), START, 'ile') : null;
  return (
    <Przypominajka from={L13} distance={3} color={color}>
      <p className="text-sm leading-relaxed sm:text-base">Przepuść wyraz przez dźwignię „ile?” odmieniarki.</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {['zielony', 'szybko'].map((w) => (
          <button
            key={w}
            type="button"
            onClick={() => setId(w)}
            className="border px-3 py-1.5 font-serif text-sm"
            style={id === w ? { borderColor: color, background: `${color}18` } : undefined}
          >
            {w}
          </button>
        ))}
      </div>
      <p className="mt-2 min-h-[3rem] text-sm leading-relaxed sm:text-base" aria-live="polite">
        {s && (s.zmiana ? `„${s.przed}” → „${s.po}” — zmienił kształt.` : `„${s.przed}” wyszło takie samo — maszyna nic nie musiała robić.`)}
        {s && ' Oba słowa wróciły dziś z kosza i każde znajdzie swoją robotę.'}
      </p>
    </Przypominajka>
  );
}

function LessonIntro({ color, wyspa }: { color: string; wyspa?: string }) {
  return (
    <div className="grid gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_260px]">
      <div className="text-base leading-relaxed sm:text-lg">
        <p>
          Wokół wyspy{wyspa ? ` ${wyspa}` : ''} biegnie tor dla ślimaków, a na mecie, na przystani, stoi cukiernia. Dziś wielki wyścig.
        </p>
        <p className="mt-3">
          Poprowadzisz ślimaka kartami, a potem upieczesz torty na zamówienie. Wszystko stoi na jednym zdaniu:{' '}
          <strong>przymiotnik maluje przedmiot, przysłówek mówi, jak coś się dzieje.</strong>
        </p>
      </div>
      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Akwarela: dwa ślimaki na omszałym kamieniu z kroplami rosy, z bliska, w tle rozmyta zieleń i kwiatki"
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
