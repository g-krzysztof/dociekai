'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Cog, Presentation, Split } from 'lucide-react';
import { LessonBlock, POL_BLOCK_KINDS, PolLessonShell, Przypominajka, useBlockDone, type PolBlockMeta } from '../../lesson-shell';
import { LessonImageCard } from '@/components/ui/lesson-image-card';
import { imgMap } from '@/lib/media';
import { POL_LESSONS, type PolLesson } from '../../../data/lessons';
import type { PolModule } from '../../../data/curriculum';
import { useWyspa } from '../../../lib/wyspa/use-wyspa';
import { dodajDoMagazynu } from '../../../lib/wyspa/model';
import { useZapisBloku } from '../use-zapis-bloku';
import { PASKI, poWymianie } from '../frazeologizmy/zwroty';
import { Odmieniarka, type StanOdmieniarki } from './odmieniarka';
import { Zwrotnica, type StanZwrotnicy } from './zwrotnica';
import { ZdanieSieNieKlei, type StanTablic } from './tablica';
import { DO_MAGAZYNU } from './odmiana';

/**
 * L13 — odmieniarka. `[3.1]`, filary 1 i 2. Archetyp **Maszyna** (§ 3a Z5),
 * świat modułu 4: Wyspa bez nazw — port; bez dźwięku.
 *
 * **Zdanie lekcji: niektóre słowa zmieniają kształt, kiedy zmienia się
 * zdanie — inne zostają takie same.**
 *
 *  - `Odmieniarka` — dźwignie ile? kto? kiedy?, wynik po wszystkich trzech;
 *  - `Zwrotnica` — tor gumowy / kamienny przestawiany przed wjazdem (termin
 *    „wyrazy odmienne i nieodmienne” na magazynie dziecka);
 *  - `ZdanieSieNieKlei` — wyrazy z tablicy przez maszynę, obrazek się składa.
 *
 * Wyrazy z bloków 1–2 trafiają do magazynu Wyspy (`dociekai:pol-wyspa`,
 * tylko urządzenie) — L14–L17 z niego korzystają, ale działają też bez niego.
 */

const IMAGES = imgMap({
  intro: '/images/jezyk-polski/lekcje/odmienne-i-nieodmienne/wyspa-pusta.jpg',
  lodz: '/images/jezyk-polski/lekcje/odmienne-i-nieodmienne/lodz.jpg',
  maszyna: '/images/jezyk-polski/lekcje/odmienne-i-nieodmienne/maszyna-port.jpg',
  mewy: '/images/jezyk-polski/lekcje/odmienne-i-nieodmienne/mewy.jpg',
});

const BLOCKS: PolBlockMeta[] = [
  { id: 'odmieniarka', kind: 'odkrycie', title: 'Odmieniarka', time: '7 min', icon: Cog },
  { id: 'zwrotnica', kind: 'cwiczenie', title: 'Zwrotnica', time: '6 min', icon: Split },
  { id: 'tablica', kind: 'scena', title: 'Zdanie się nie klei', time: '7 min', icon: Presentation },
];

const SCOPE = 'pol-l13';
const L12 = POL_LESSONS.find((l) => l.slug === 'frazeologizmy')!;

interface LessonProps {
  lesson: PolLesson;
  polModule: PolModule;
  nextLesson?: PolLesson;
}

export function OdmienneINieodmienneLesson({ lesson, polModule, nextLesson }: LessonProps) {
  return (
    <PolLessonShell
      lesson={lesson}
      polModule={polModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Wyrazy z tej lekcji leżą w magazynie w porcie. W następnej lekcji wyspa przestanie być pusta: niektóre z nich postawią na niej to, co nazywają."
      entry={<PrzypominajkaNozyczki color={polModule.color} />}
    >
      <LessonBody color={polModule.color} />
    </PolLessonShell>
  );
}

function LessonBody({ color }: { color: string }) {
  const odmieniarka = useBlockDone('odmieniarka');
  const zwrotnica = useBlockDone('zwrotnica');
  const tablica = useBlockDone('tablica');
  const zapisOdm = useZapisBloku<StanOdmieniarki>('odmieniarka', odmieniarka.done, SCOPE);
  const zapisZwr = useZapisBloku<StanZwrotnicy>('zwrotnica', zwrotnica.done, SCOPE);
  const zapisTab = useZapisBloku<StanTablic>('tablica', tablica.done, SCOPE);
  const { update } = useWyspa();
  const doMagazynu = () => update((rec, now) => dodajDoMagazynu(rec, DO_MAGAZYNU, now));

  return (
    <>
      <LessonIntro color={color} />
      <LessonBlock id="odmieniarka">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.lodz}
          alt="Akwarela: drewniana łódź wiosłowa przycumowana do pomostu, w łodzi stoi prosta drewniana skrzynia, spokojne morze i domy na brzegu w oddali"
          lead="Do portu przypłynęła łódź."
        >
          W skrzyni są wyrazy. Zanim trafią na wyspę, każdy przejdzie przez odmieniarkę — starą maszynę z nabrzeża.
        </LessonImageCard>
        <Odmieniarka
          key={zapisOdm.restored ? 'zapis' : 'nowe'}
          color={color}
          initial={zapisOdm.restored}
          onState={zapisOdm.save}
          onComplete={odmieniarka.markBlockDone}
        />
      </LessonBlock>
      <LessonBlock id="zwrotnica">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.maszyna}
          alt="Akwarela: dawna maszyna portowa z żeliwa i mosiądzu, z kołami zębatymi, wałkami, krótką taśmą i długą dźwignią z drewnianym uchwytem, na drewnianym nabrzeżu"
          reverse
          lead="Za maszyną taśma się rozdziela."
        >
          Jeden tor jest gumowy, drugi kamienny. Wyrazy jadą same — ty pilnujesz zwrotnicy.
        </LessonImageCard>
        <Zwrotnica
          key={zapisZwr.restored ? 'zapis' : 'nowe'}
          color={color}
          initial={zapisZwr.restored}
          onState={zapisZwr.save}
          onComplete={() => {
            doMagazynu();
            zwrotnica.markBlockDone();
          }}
        />
      </LessonBlock>
      <LessonBlock id="tablica">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.mewy}
          alt="Akwarela: mewy siedzą na starych drewnianych palach pomostu we mgle nad spokojnym morzem, w oddali wysepka z latarnią"
          lead="Na nabrzeżu wisi tablica."
        >
          Ktoś napisał na niej zdanie z samych wyrazów prosto ze słownika. Mewy patrzą na obrazek nad tablicą i nic nie rozumieją.
        </LessonImageCard>
        <ZdanieSieNieKlei
          key={zapisTab.restored ? 'zapis' : 'nowe'}
          color={color}
          initial={zapisTab.restored}
          onState={zapisTab.save}
          onComplete={tablica.markBlockDone}
        />
      </LessonBlock>
    </>
  );
}

/** Przypominajka z L12: wytnij słowo ze zwrotu i sprawdź, czy pęknie — bez werdyktu. */
const P_MUCHY = PASKI.find((p) => p.id === 'muchy')!;
const P_ARBUZ = PASKI.find((p) => p.id === 'arbuz')!;
function PrzypominajkaNozyczki({ color }: { color: string }) {
  const [pasek, setPasek] = useState<string | null>(null);
  const p = pasek === 'muchy' ? P_MUCHY : pasek === 'arbuz' ? P_ARBUZ : null;
  return (
    <Przypominajka from={L12} distance={1} color={color}>
      <p className="text-sm leading-relaxed sm:text-base">Wytnij słowo i wklej bliskoznaczne. Który pasek pęknie?</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {[P_MUCHY, P_ARBUZ].map((x) => (
          <button
            key={x.id}
            type="button"
            onClick={() => setPasek(x.id)}
            className="border px-3 py-1.5 font-serif text-sm"
            style={pasek === x.id ? { borderColor: color, background: `${color}18` } : undefined}
          >
            {x.slowo} → {x.szufladka[0]}
          </button>
        ))}
      </div>
      <p className="mt-2 min-h-[3rem] text-sm leading-relaxed sm:text-base" aria-live="polite">
        {p &&
          (p.frazeologizm ? (
            <>„{poWymianie(p, p.szufladka[0])}” — pęka. Związek frazeologiczny nie lubi wymiany. Dziś zobaczysz słowa, które zmieniają się same — razem ze zdaniem.</>
          ) : (
            <>„{poWymianie(p, p.szufladka[0])}” — wytrzymało. Dziś zobaczysz słowa, które zmieniają się same — razem ze zdaniem.</>
          ))}
      </p>
    </Przypominajka>
  );
}

function LessonIntro({ color }: { color: string }) {
  return (
    <div className="grid gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_260px]">
      <div className="text-base leading-relaxed sm:text-lg">
        <p>Na morzu leży mała wyspa. Jest na niej łąka, kilka drzew i pomost — i nic więcej. Nie ma nawet nazwy.</p>
        <p className="mt-3">
          W tym module zapełnisz ją słowami. Zaczynasz w porcie, przy starej maszynie. Wszystko stoi na jednym zdaniu:{' '}
          <strong>niektóre słowa zmieniają kształt, kiedy zmienia się zdanie — inne zostają takie same.</strong>
        </p>
      </div>
      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Akwarela: mała zielona wyspa widziana z lotu ptaka na turkusowym morzu — piaszczysty brzeg, łąka, kilka drzew i jeden drewniany pomost, żadnych domów"
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
