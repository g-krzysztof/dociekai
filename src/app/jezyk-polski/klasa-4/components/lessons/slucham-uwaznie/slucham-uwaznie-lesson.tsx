'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { Ear, NotebookPen, ShoppingBasket } from 'lucide-react';
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
import { WiadomoscOdHaliny, type Blok1 } from './wiadomosc-od-haliny';
import { Zakupy } from './zakupy';
import { CoUcieka } from './co-ucieka';
import type { BladKuchni } from './sklep';

/**
 * L5 — słucham uważnie. `[1.2]` `[4.1]`, filary 2 i 4.
 *
 * **Zdanie lekcji: słuchanie to praca — kto słucha jednym uchem, przynosi nie
 * to, co trzeba.**
 *
 *  - `WiadomoscOdHaliny` — **słuchanie z licznikiem odsłuchań i notes obok**,
 *    jedno pytanie (o ser — jedyną rzecz spoza nagrania);
 *  - `Zakupy` — **wózek prowadzony po planie sklepu**, skutek na stole pani
 *    Haliny z cytatem z nagrania (`sklep.ts`);
 *  - `CoUcieka` — notes zestawiony z nagraniem, rama „co? ile? jaki? uwaga!”,
 *    druga wiadomość i **porcje odmierzane do miski** (Mruczek reaguje).
 *
 * Wiadomości nagrane głosem pani Haliny (`Jane`, D11). Notes i błędy
 * zakupów trzyma `sessionStorage` (blok 2 i 3 ich potrzebują).
 */

const IMAGES = imgMap({
  intro: '/images/jezyk-polski/lekcje/slucham-uwaznie/halina-telefon.jpg',
  sklep: '/images/jezyk-polski/lekcje/slucham-uwaznie/sklep-polki.jpg',
  miski: '/images/jezyk-polski/lekcje/slucham-uwaznie/mruczek-miski.jpg',
});

const BLOCKS: PolBlockMeta[] = [
  { id: 'wiadomosc', kind: 'glos', title: 'Wiadomość od pani Haliny', time: '6 min', icon: Ear },
  { id: 'zakupy', kind: 'scena', title: 'Zakupy', time: '6 min', icon: ShoppingBasket },
  { id: 'ucieka', kind: 'odkrycie', title: 'Co ucieka?', time: '8 min', icon: NotebookPen },
];

const STATE_KEY = 'dociekai:pol-l5';
const L4 = POL_LESSONS.find((l) => l.slug === 'twarz-i-ton')!;

interface LessonProps {
  lesson: PolLesson;
  polModule: PolModule;
  nextLesson?: PolLesson;
}

export function SluchamUwaznieLesson({ lesson, polModule, nextLesson }: LessonProps) {
  return (
    <PolLessonShell
      lesson={lesson}
      polModule={polModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Pani Halina ma swoje zakupy, Mruczek jest najedzony — a ty masz ramkę, która łapie to, co ucieka."
      entry={<PrzypominajkaKlatka color={polModule.color} />}
    >
      <LessonBody color={polModule.color} />
    </PolLessonShell>
  );
}

interface L5State {
  b1: Blok1;
  bledy: BladKuchni[] | null;
}

function LessonBody({ color }: { color: string }) {
  const wiadomosc = useBlockDone('wiadomosc');
  const zakupy = useBlockDone('zakupy');
  const ucieka = useBlockDone('ucieka');
  const [st, setSt] = useState<L5State>({ b1: { notatka: '', pytanie: null }, bledy: null });

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(STATE_KEY);
      if (raw) setSt(JSON.parse(raw) as L5State);
    } catch {
      /* prywatne okno */
    }
  }, []);
  const save = useCallback((next: L5State) => {
    setSt(next);
    try {
      window.sessionStorage.setItem(STATE_KEY, JSON.stringify(next));
    } catch {
      /* prywatne okno */
    }
  }, []);

  const { markBlockDone: zakupyDone } = zakupy;
  const onZakupy = useCallback(
    (bledy: BladKuchni[]) => {
      setSt((cur) => {
        const next = { ...cur, bledy };
        try {
          window.sessionStorage.setItem(STATE_KEY, JSON.stringify(next));
        } catch {
          /* prywatne okno */
        }
        return next;
      });
      zakupyDone();
    },
    [zakupyDone]
  );

  return (
    <>
      <LessonIntro color={color} />
      <LessonBlock id="wiadomosc">
        <WiadomoscOdHaliny color={color} value={st.b1} onChange={(b1) => save({ ...st, b1 })} onComplete={wiadomosc.markBlockDone} />
      </LessonBlock>
      <LessonBlock id="zakupy">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.sklep}
          alt="Akwarela: mały sklep — regał z chlebem w koszykach, skrzynkami zielonych i czerwonych jabłek oraz gruszek, lodówka z kartonami mleka i kostkami masła bez napisów, pośrodku wózek na zakupy"
          lead="Sklep na rogu Lipowej."
        >
          Notes w kieszeni, wózek w ręce. Teraz już tylko to, co zapisane.
        </LessonImageCard>
        {st.b1.pytanie ? (
          <Zakupy color={color} notatka={st.b1.notatka} pytanie={st.b1.pytanie} onDone={onZakupy} />
        ) : (
          <p className="border border-dashed bg-white p-4 text-sm text-muted-foreground dark:bg-zinc-900/80">Najpierw wysłuchaj wiadomości i zadaj pytanie w bloku 1.</p>
        )}
      </LessonBlock>
      <LessonBlock id="ucieka">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.miski}
          alt="Akwarela: szary pręgowany kot z białą piersią i łapkami siedzi w kuchni między niebieską a żółtą miską i patrzy w górę z nadzieją"
          reverse
          lead="Pani Halina wyjeżdża na weekend."
        >
          Najpierw sprawdzisz, co uciekło przy zakupach. Potem druga wiadomość — o Mruczku.
        </LessonImageCard>
        {st.bledy ? (
          <CoUcieka color={color} notatka={st.b1.notatka} bledy={st.bledy} onComplete={ucieka.markBlockDone} />
        ) : (
          <p className="border border-dashed bg-white p-4 text-sm text-muted-foreground dark:bg-zinc-900/80">Najpierw zrób zakupy w bloku 2.</p>
        )}
      </LessonBlock>
    </>
  );
}

/** Przypominajka z L4: jedna klatka niemego filmu — co mówi ciało? */
function PrzypominajkaKlatka({ color }: { color: string }) {
  const [pick, setPick] = useState<string | null>(null);
  const OPCJE = [
    { id: 'rece', label: 'ręce skrzyżowane', ok: true },
    { id: 'usmiech', label: 'szeroki uśmiech', ok: false },
    { id: 'skok', label: 'podskoki', ok: false },
  ];
  return (
    <Przypominajka from={L4} distance={1} color={color}>
      <p className="text-sm leading-relaxed sm:text-base">
        Tymek mówi „Nic mi nie jest”. Co w jego ciele mówiło coś innego? Stuknij.
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {OPCJE.map((o) => (
          <button key={o.id} type="button" onClick={() => setPick(o.id)} className="border px-3 py-1.5 text-sm" style={{ borderColor: pick === o.id ? color : undefined }}>
            {o.label}
          </button>
        ))}
      </div>
      <p className="mt-2 min-h-[2.5rem] text-sm" aria-live="polite">
        {pick && (OPCJE.find((o) => o.id === pick)!.ok ? 'Tak — i zgarbione ramiona. Dziś słuchasz uszami: słowa, liczby, szczegóły.' : 'Tego w filmie nie było. Tymek stał zgarbiony.')}
      </p>
    </Przypominajka>
  );
}

function LessonIntro({ color }: { color: string }) {
  return (
    <div className="grid gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_260px]">
      <div className="text-base leading-relaxed sm:text-lg">
        <p>Słyszeć to nie to samo co słuchać. Usłyszysz każde słowo — a i tak przyniesiesz nie ten chleb.</p>
        <p className="mt-3">
          Dziś zrobisz zakupy dla pani Haliny według wiadomości głosowej, sprawdzisz, co ci uciekło, i nakarmisz Mruczka.
          Wszystko stoi na jednym zdaniu: <strong>słuchanie to praca — kto słucha jednym uchem, przynosi nie to, co trzeba.</strong>
        </p>
      </div>
      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Akwarela: pani Halina w okularach, liliowym swetrze i fartuszku w kwiatki rozmawia przez telefon i się uśmiecha; na parapecie siedzi szary pręgowany kot i patrzy na deszcz za oknem"
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
