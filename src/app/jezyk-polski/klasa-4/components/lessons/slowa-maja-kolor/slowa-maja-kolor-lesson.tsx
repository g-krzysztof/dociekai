'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FlipHorizontal2, Gauge, Mail } from 'lucide-react';
import { LessonBlock, POL_BLOCK_KINDS, PolLessonShell, Przypominajka, useBlockDone, type PolBlockMeta } from '../../lesson-shell';
import { LessonImageCard } from '@/components/ui/lesson-image-card';
import { imgMap } from '@/lib/media';
import { POL_LESSONS, type PolLesson } from '../../../data/lessons';
import type { PolModule } from '../../../data/curriculum';
import { useZapisBloku } from '../use-zapis-bloku';
import { odznaka } from '../moje-wspolnoty/wspolnoty';
import { PokretloNastroju, type StanPokretla } from './pokretlo-nastroju';
import { ZacietePokretlo, type StanPocztowki } from './zaciete-pokretlo';
import { LustroAntonimow, type StanLustra } from './lustro-antonimow';

/**
 * L11 — słowa mają kolor. `[3.2]` `[3.6]` `[3.10]` (synonim, antonim),
 * filary 1 i 2. Archetyp **Maszyna** (§ 3a Z5), świat modułu 3: pracownia
 * słownikarza (maszyna nastroju na pulpicie); bez dźwięku (test głośnika).
 *
 * **Zdanie lekcji: pies, psisko i piesek to ten sam zwierzak — ale trzy różne
 * opinie.**
 *
 *  - `PokretloNastroju` — obrót pokrętła z zapadkami, sześć słów przeskakuje
 *    między bliskoznacznymi, ilustracja stoi (termin „wyrazy bliskoznaczne”);
 *  - `ZacietePokretlo` — szufladki bliskoznacznych, pocztówka spójna z wyborem
 *    dziecka (zabarwienie z budowy słowa; szufladki wracają w L12);
 *  - `LustroAntonimow` — lustro na torze: ostre odbicie przy przeciwieństwie,
 *    krzywe przy słowie tylko innym (termin „wyrazy przeciwstawne”).
 */

const IMAGES = imgMap({
  intro: '/images/jezyk-polski/lekcje/slowa-maja-kolor/maszyna.jpg',
  wycieczka: '/images/jezyk-polski/lekcje/slowa-maja-kolor/wycieczka.jpg',
  pocztowka: '/images/jezyk-polski/lekcje/slowa-maja-kolor/pocztowka.jpg',
  lustro: '/images/jezyk-polski/lekcje/slowa-maja-kolor/lustro.jpg',
});

const BLOCKS: PolBlockMeta[] = [
  { id: 'pokretlo', kind: 'scena', title: 'Pokrętło nastroju', time: '6 min', icon: Gauge },
  { id: 'pocztowka', kind: 'cwiczenie', title: 'Zacięte pokrętło', time: '7 min', icon: Mail },
  { id: 'lustro', kind: 'odkrycie', title: 'Lustro antonimów', time: '7 min', icon: FlipHorizontal2 },
];

const SCOPE = 'pol-l11';
const L8 = POL_LESSONS.find((l) => l.slug === 'moje-wspolnoty')!;

interface LessonProps {
  lesson: PolLesson;
  polModule: PolModule;
  nextLesson?: PolLesson;
}

export function SlowaMajaKolorLesson({ lesson, polModule, nextLesson }: LessonProps) {
  return (
    <PolLessonShell
      lesson={lesson}
      polModule={polModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Szufladki z wyrazami bliskoznacznymi zostają w pracowni. W następnej lekcji przydadzą się do śledztwa: są słowa, których nie da się wymienić bez szkody."
      entry={<PrzypominajkaRola color={polModule.color} />}
    >
      <LessonBody color={polModule.color} />
    </PolLessonShell>
  );
}

function LessonBody({ color }: { color: string }) {
  const pokretlo = useBlockDone('pokretlo');
  const pocztowka = useBlockDone('pocztowka');
  const lustro = useBlockDone('lustro');
  const zapisPokretla = useZapisBloku<StanPokretla>('pokretlo', pokretlo.done, SCOPE);
  const zapisPocztowki = useZapisBloku<StanPocztowki>('pocztowka', pocztowka.done, SCOPE);
  const zapisLustra = useZapisBloku<StanLustra>('lustro', lustro.done, SCOPE);

  return (
    <>
      <LessonIntro color={color} />
      <LessonBlock id="pokretlo">
        <PokretloNastroju
          key={zapisPokretla.restored ? 'zapis' : 'nowe'}
          color={color}
          obraz={IMAGES.wycieczka}
          initial={zapisPokretla.restored}
          onState={zapisPokretla.save}
          onComplete={pokretlo.markBlockDone}
        />
      </LessonBlock>
      <LessonBlock id="pocztowka">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.pocztowka}
          alt="Akwarela: chłopiec w koszulce w paski siedzi przy składanym stoliku wśród wydm i pisze ołówkiem na pocztówce, obok blaszany kubek i muszelki, w tle morze i żaglówka"
          lead="Antek pisze z wakacji."
        >
          Antek wrzucił pocztówkę do maszyny nastroju, żeby brzmiała ładniej. Maszyna się zacięła i pomieszała słowa — teraz pocztówka nie
          wie, czy się cieszy, czy narzeka.
        </LessonImageCard>
        <ZacietePokretlo
          key={zapisPocztowki.restored ? 'zapis' : 'nowe'}
          color={color}
          initial={zapisPocztowki.restored}
          onState={zapisPocztowki.save}
          onComplete={pocztowka.markBlockDone}
        />
      </LessonBlock>
      <LessonBlock id="lustro">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.lustro}
          alt="Akwarela: wysokie stare lustro w rzeźbionej drewnianej ramie oparte o regał z książkami na strychu, w lustrze odbija się pusty pokój z oknem"
          reverse
          lead="Lustro, które odwraca znaczenie."
        >
          Na strychu pracowni stoi stare lustro. Odbija rzeczy na odwrót — ale tylko wtedy, kiedy położysz przed nim słowo, które naprawdę
          znaczy przeciwnie.
        </LessonImageCard>
        <LustroAntonimow
          key={zapisLustra.restored ? 'zapis' : 'nowe'}
          color={color}
          initial={zapisLustra.restored}
          onState={zapisLustra.save}
          onComplete={lustro.markBlockDone}
        />
      </LessonBlock>
    </>
  );
}

/** Przypominajka z L8: wyjmij siebie ze sceny jednej roli — bez werdyktu. */
const ROLE = ['dyzurny', 'kapitan', 'sasiad'].map((id) => odznaka(id)!);
function PrzypominajkaRola({ color }: { color: string }) {
  const [rola, setRola] = useState<string | null>(null);
  const [bez, setBez] = useState(false);
  const r = ROLE.find((x) => x.id === rola);
  return (
    <Przypominajka from={L8} distance={3} color={color}>
      <p className="text-sm leading-relaxed sm:text-base">Wybierz jedną rolę i wyjdź ze sceny. Czego brakuje?</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {ROLE.map((x) => (
          <button
            key={x.id}
            type="button"
            onClick={() => {
              setRola(x.id);
              setBez(false);
            }}
            className="border px-3 py-1.5 text-sm"
            style={rola === x.id ? { borderColor: color, background: `${color}22` } : undefined}
          >
            {x.label}
          </button>
        ))}
      </div>
      <div className="mt-2 min-h-[4.5rem] text-sm leading-relaxed sm:text-base" aria-live="polite">
        {r && !bez && (
          <p>
            {r.scena.z}{' '}
            <button type="button" onClick={() => setBez(true)} className="ml-1 border-2 px-2 py-0.5 text-sm font-medium" style={{ borderColor: color }}>
              Wyjdź ze sceny
            </button>
          </p>
        )}
        {r && bez && (
          <p>
            {r.scena.bez} <strong>{r.scena.dajesz}</strong> Dziś zobaczysz, że słowa też coś dają: oprócz nazwy niosą opinię.
          </p>
        )}
      </div>
    </Przypominajka>
  );
}

function LessonIntro({ color }: { color: string }) {
  return (
    <div className="grid gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_260px]">
      <div className="text-base leading-relaxed sm:text-lg">
        <p>Na pulpicie pracowni stoi mosiężna maszyna z jednym pokrętłem. Słownikarz nazywa ją maszyną nastroju.</p>
        <p className="mt-3">
          Pokręcisz nią, naprawisz to, co popsuła, i sprawdzisz stare lustro ze strychu. Wszystko stoi na jednym zdaniu:{' '}
          <strong>pies, psisko i piesek to ten sam zwierzak — ale trzy różne opinie.</strong>
        </p>
      </div>
      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Akwarela: pracownia na strychu — na drewnianym biurku mosiężna maszyna z dużym pokrętłem i tarczą bez podziałki, obok gruby zamknięty tom z pustą okładką i mosiężna lampa, w tle regał z książkami i okno w skosie dachu"
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
