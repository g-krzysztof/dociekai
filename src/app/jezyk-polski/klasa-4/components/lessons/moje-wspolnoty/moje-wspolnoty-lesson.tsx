'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Award, CircleDot, Drama, FolderOpen } from 'lucide-react';
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
import { Pisarnia } from '../../pisarnia/pisarnia';
import { useTeczka } from '../../../lib/teczka/use-teczka';
import { useZapisBloku } from '../use-zapis-bloku';
import { Kregi } from './kregi';
import { GdybyMnieZabraklo } from './gdyby-mnie-zabraklo';
import { PodiumWartosci } from './podium-wartosci';
import { kartkaTeczki, sceny as wybierzSceny, type MiejscePodium, type Przypiecie, type StanSceny } from './wspolnoty';

/**
 * L8 — moje wspólnoty. `[5.1]` `[5.2]` `[5.3]` (moduł filozoficzny), filary 2 i 4.
 * Archetyp **Teatr** (§ 3a Z5), bez dźwięku (test głośnika: nic nie traci).
 *
 * **Zdanie lekcji: jestem kimś innym w domu, w klasie i na podwórku — i w
 * każdym z tych miejsc coś od siebie daję.**
 *
 *  - `Kregi` — odznaki ról przypinane do kręgów wokół „ja” (pinezka zostaje
 *    tam, gdzie upadła; krąg z odległości od środka);
 *  - `GdybyMnieZabraklo` — **trzon: dziecko wyjmuje siebie ze sceny** i patrzy,
 *    czego brakuje; trzy sceny z jego własnych odznak;
 *  - `PodiumWartosci` — trzy wartości na podium, przy każdej scena „tu to
 *    widać”; bez klucza. Pod spodem (R) jedno zdanie z życia w Pisarni, bez
 *    werdyktu (zwrot 2026-10-19: Pisarnia z werdyktem byłaby trzecia z rzędu).
 *
 * Temat dotyka domu: żadnych pytań o skład rodziny, role zamiast imion,
 * kartka tylko w Teczce na urządzeniu (D3).
 */

const IMAGES = imgMap({
  intro: '/images/jezyk-polski/lekcje/moje-wspolnoty/kregi-z-gory.jpg',
  kuchnia: '/images/jezyk-polski/lekcje/moje-wspolnoty/kuchnia-wieczorem.jpg',
  klasa: '/images/jezyk-polski/lekcje/moje-wspolnoty/klasa-kwiatek.jpg',
  boisko: '/images/jezyk-polski/lekcje/moje-wspolnoty/boisko.jpg',
});

const BLOCKS: PolBlockMeta[] = [
  { id: 'kregi', kind: 'haczyk', title: 'Kręgi', time: '5 min', icon: CircleDot },
  { id: 'zabraklo', kind: 'scena', title: 'Gdyby mnie zabrakło', time: '6 min', icon: Drama },
  { id: 'wartosci', kind: 'refleksja', title: 'Moje wartości', time: '6 min', icon: Award },
];

const SCOPE = 'pol-l8';
const LESSON = 'ja-i-my/moje-wspolnoty';
const TECZKA_ID = `${LESSON}#wartosci`;

const L7 = POL_LESSONS.find((l) => l.slug === 'emocje-i-potrzeby')!;

interface LessonProps {
  lesson: PolLesson;
  polModule: PolModule;
  nextLesson?: PolLesson;
}

export function MojeWspolnotyLesson({ lesson, polModule, nextLesson }: LessonProps) {
  return (
    <PolLessonShell
      lesson={lesson}
      polModule={polModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Twoje kręgi i podium wartości leżą w Teczce autora — tylko na tym urządzeniu."
      entry={<PrzypominajkaZawsze color={polModule.color} />}
    >
      <LessonBody color={polModule.color} />
    </PolLessonShell>
  );
}

function LessonBody({ color }: { color: string }) {
  const kregi = useBlockDone('kregi');
  const zabraklo = useBlockDone('zabraklo');
  const wartosci = useBlockDone('wartosci');
  const zapisKregow = useZapisBloku<Przypiecie[]>('kregi', kregi.done, SCOPE);
  const zapisScen = useZapisBloku<Record<string, StanSceny>>('zabraklo', zabraklo.done, SCOPE);
  const zapisPodium = useZapisBloku<MiejscePodium[]>('wartosci', wartosci.done, SCOPE);
  const { items, save } = useTeczka();

  const [przypiecia, setPrzypiecia] = useState<Przypiecie[]>([]);
  const [podium, setPodium] = useState<MiejscePodium[] | null>(null);
  const [zdanie, setZdanie] = useState('');
  const [dolozone, setDolozone] = useState(false);

  // Zapis wraca asynchronicznie (po odczycie magazynu) — wtedy wypełnia pustą planszę.
  const restoredKregi = zapisKregow.restored;
  useEffect(() => {
    if (restoredKregi?.length) setPrzypiecia((p) => (p.length ? p : restoredKregi));
  }, [restoredKregi]);
  const restoredPodium = zapisPodium.restored;
  useEffect(() => {
    if (restoredPodium) setPodium((p) => p ?? restoredPodium);
  }, [restoredPodium]);
  const zapisane = items.find((i) => i.id === TECZKA_ID);
  useEffect(() => {
    if (zapisane?.parts?.zdanie) setZdanie((z) => z || zapisane.parts!.zdanie);
  }, [zapisane]);

  const sceny = useMemo(() => wybierzSceny(przypiecia), [przypiecia]);
  const scenyIds = sceny.map((s) => s.id);

  const zmienKregi = (p: Przypiecie[]) => {
    setPrzypiecia(p);
    zapisKregow.save(p);
  };

  const doTeczki = (pod: MiejscePodium[], z: string) =>
    save({
      id: TECZKA_ID,
      lesson: LESSON,
      kind: 'wspolnoty',
      title: 'Moje kręgi i wartości',
      text: kartkaTeczki(przypiecia, pod, z),
      parts: { kregi: JSON.stringify(przypiecia), podium: JSON.stringify(pod), ...(z.trim() ? { zdanie: z.trim() } : {}) },
    });

  const podiumGotowe = (pod: MiejscePodium[]) => {
    setPodium(pod);
    zapisPodium.save(pod);
    doTeczki(pod, zdanie);
    wartosci.markBlockDone();
  };

  return (
    <>
      <LessonIntro color={color} />
      <LessonBlock id="kregi">
        <LessonImageCard variant="secondary" color={color} image={IMAGES.kuchnia} alt="Akwarela: wieczorem w kuchni, widzianej z przedpokoju przez otwarte drzwi, kilka osób siedzi tyłem przy stole pod lampą" lead="Ten sam człowiek, różne miejsca.">
          W domu ktoś na ciebie czeka z kolacją. W klasie masz swoją ławkę. Na podwórku — swoją drużynę albo swoją ławkę pod kasztanem.
        </LessonImageCard>
        <Kregi color={color} value={przypiecia} onChange={zmienKregi} onComplete={kregi.markBlockDone} />
      </LessonBlock>
      <LessonBlock id="zabraklo">
        <LessonImageCard variant="secondary" color={color} image={IMAGES.klasa} alt="Akwarela: pusta klasa po lekcjach, ławki, czysta zielona tablica, na parapecie doniczka z czerwonym kwiatkiem i konewka" reverse lead="Kiedy nikogo nie ma.">
          Czasem najlepiej widać, co ktoś robi, kiedy go zabraknie. Dziś sprawdzisz to na sobie — na niby.
        </LessonImageCard>
        <GdybyMnieZabraklo
          key={zapisScen.restored ? 'zapis' : 'nowe'}
          color={color}
          sceny={sceny}
          przypiecia={przypiecia}
          initial={zapisScen.restored}
          onState={zapisScen.save}
          onComplete={zabraklo.markBlockDone}
        />
      </LessonBlock>
      <LessonBlock id="wartosci">
        <PodiumWartosci key={podium ? 'zapis' : 'nowe'} color={color} sceny={scenyIds} initial={podium} onComplete={podiumGotowe} />
        {podium && (
          <div className="mt-4 border bg-white p-4 dark:bg-zinc-900/80 sm:p-5">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <FolderOpen className="h-4 w-4" style={{ color }} aria-hidden />
              Kręgi i podium są już w Teczce autora.
            </p>
            <p className="mt-2 text-sm leading-relaxed">
              Jeśli chcesz, dopisz jedno zdanie o czymś, co naprawdę się zdarzyło — kiedy widać było jedną z twoich wartości. Nikt
              tego nie sprawdza i nie ocenia; zdanie zostaje tylko na tym urządzeniu.
            </p>
            <div className="mt-3">
              <Pisarnia
                value={zdanie}
                onChange={(v) => {
                  setZdanie(v);
                  setDolozone(false);
                }}
                color={color}
                label="Jedno zdanie z twojego życia (nieobowiązkowe)"
                placeholder="Na przykład: W soboty pomagam sąsiadce wnieść zakupy."
                minRows={2}
                maxLength={300}
              />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={!zdanie.trim()}
                onClick={() => {
                  doTeczki(podium, zdanie);
                  setDolozone(true);
                }}
                className="border-2 px-3 py-1.5 text-sm font-medium disabled:opacity-40"
                style={{ borderColor: color }}
              >
                Dołóż do kartki w Teczce
              </button>
              <span className="min-h-[1.25rem] text-sm" aria-live="polite">
                {dolozone ? 'Dołożone.' : ''}
              </span>
            </div>
          </div>
        )}
        <div className="mt-4">
          <LessonImageCard variant="secondary" color={color} image={IMAGES.boisko} alt="Akwarela: jesienią chłopiec z piłką pod pachą macha do trojga dzieci na małym boisku z bramkami" lead="Jutro znów ktoś zwoła mecz.">
            Może ty. Każde z twoich miejsc trochę na ciebie liczy.
          </LessonImageCard>
        </div>
      </LessonBlock>
    </>
  );
}

/** Przypominajka z L7: jedno „zawsze” przebudowane na komunikat z trzech części. */
const PASKI: { dobry: string; zly: string; dobryNaLewo: boolean }[] = [
  { dobry: 'Czuję złość,', zly: 'Jesteś złodziejem,', dobryNaLewo: false },
  { dobry: 'kiedy bierzesz moje kredki bez pytania.', zly: 'bo zawsze wszystko mi bierzesz.', dobryNaLewo: true },
  { dobry: 'Proszę, zapytaj najpierw.', zly: 'Oddawaj natychmiast!', dobryNaLewo: false },
];
function PrzypominajkaZawsze({ color }: { color: string }) {
  const [krok, setKrok] = useState(0);
  const [msg, setMsg] = useState('');
  const done = krok >= PASKI.length;
  const p = PASKI[krok];
  const wybierz = (dobry: boolean) => {
    if (dobry) {
      setKrok((k) => k + 1);
      setMsg('');
    } else setMsg('Ten pasek znowu oskarża. Poszukaj tego, który mówi o tobie albo o tym, co się stało.');
  };
  const opcje = p ? (p.dobryNaLewo ? [true, false] : [false, true]) : [];
  return (
    <Przypominajka from={L7} distance={1} color={color}>
      <p className="text-sm leading-relaxed sm:text-base">
        Na kartce stoi: <span className="font-serif text-lg">„Zawsze zabierasz moje kredki!”</span> Złóż z niej komunikat z trzech
        części — wybierz po jednym pasku.
      </p>
      <p className="mt-2 min-h-[1.75rem] font-serif text-lg">{PASKI.slice(0, krok).map((x) => x.dobry).join(' ')}</p>
      {!done && p && (
        <div className="mt-1 flex flex-wrap gap-2">
          {opcje.map((dobry) => (
            <button key={String(dobry)} type="button" onClick={() => wybierz(dobry)} className="border px-3 py-1.5 text-sm" style={{ borderColor: color }}>
              {dobry ? p.dobry : p.zly}
            </button>
          ))}
        </div>
      )}
      <p className="mt-2 min-h-[2.5rem] text-sm" aria-live="polite">
        {done ? 'Tak — czuję, kiedy, proszę. Dziś zobaczysz, ile znaczysz dla ludzi wokół.' : msg}
      </p>
    </Przypominajka>
  );
}

function LessonIntro({ color }: { color: string }) {
  return (
    <div className="grid gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_260px]">
      <div className="text-base leading-relaxed sm:text-lg">
        <p>W domu jesteś kimś innym niż w klasie, a na podwórku jeszcze kimś innym. To nie udawanie — to różne role.</p>
        <p className="mt-3">
          Dziś przypniesz swoje role do kręgów, wyjmiesz siebie z kilku scen i ustawisz na podium to, co dla ciebie ważne. Wszystko
          stoi na jednym zdaniu:{' '}
          <strong>jestem kimś innym w domu, w klasie i na podwórku — i w każdym z tych miejsc coś od siebie daję.</strong>
        </p>
      </div>
      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image src={IMAGES.intro} alt="Akwarela: jesienne miasteczko z lotu ptaka — w środku kremowa kamienica z ogródkiem, wokół brukowana ulica, domy, szkoła z boiskiem, a dalej rzeka i stary młyn" width={260} height={195} className="absolute inset-0 h-full w-full object-contain" priority />
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
