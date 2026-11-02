'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Feather, Ruler, ScrollText, Stamp } from 'lucide-react';
import {
  HIST_BLOCK_KINDS,
  HistLessonShell,
  LessonBlock,
  useBlockDone,
  type HistBlockMeta,
} from '../../lesson-shell';
import { Przypominajka } from '../../przypominajka';
import { PrzypnijPinezke } from '../../timeline/przypnij-pinezke';
import { LessonImageCard } from '@/components/ui/lesson-image-card';
import { img, imgMap } from '@/lib/media';
import { KartuszeWidget } from './kartusze-widget';
import { ImieWidget } from './imie-widget';
import { MierniczyWidget } from './mierniczy-widget';
import { PapirusLekarzaWidget } from './papirus-lekarza-widget';
import { SpolgloskiPrzypominajka } from './spolgloski-przypominajka';
import { getCorePin } from '../../../lib/timeline/pins';
import { getLesson } from '../../../data/lessons';
import type { HistModule } from '../../../data/curriculum';
import type { HistLesson } from '../../../data/lessons';

/**
 * L21 — Co zawdzięczamy Egipcjanom. Niesie `[5.3]` (kultura Egiptu).
 *
 * **Zdanie lekcji: Wiele rzeczy, z których korzystasz codziennie — kalendarz,
 * pomiary, słowo „papier” — ma korzenie nad Nilem.**
 *
 * Cztery bloki:
 *  - `kartusze` — **nici między tymi samymi znakami** dwóch kartuszy
 *    (Ptolemeusz, Kleopatra), litery z miejsc w imionach, T jako dwa znaki,
 *    trzeci kartusz (Aleksander); pinezka „odczytanie hieroglifów” (1822);
 *  - `imie` — imię dziecka budowane ze znaków jednej głoski, kartusz
 *    w rzędzie/kolumnie, zwierzęta patrzą w stronę początku;
 *  - `mierniczy` — **paliki i sznur z węzłami** po wylewie (Herodot II 109),
 *    pole prostokąta i podatek;
 *  - `lekarz` — **paski papirusu na krzyż**, kamień, potem zakreślacz
 *    na przepisach z papirusów Smitha i Ebersa; obeliski w Europie i Syriusz.
 *
 * Przypominajka: Fenicjanin pisał same spółgłoski (L18, dystans 3).
 */

const IMAGES = imgMap({
  rosetta: '/images/historia/lekcje/osiagniecia-egipcjan/rosetta.jpg',
  mierniczy: '/images/historia/lekcje/osiagniecia-egipcjan/mierniczy.jpg',
  lekarz: '/images/historia/lekcje/osiagniecia-egipcjan/lekarz.jpg',
  obelisk: '/images/historia/lekcje/osiagniecia-egipcjan/obelisk.jpg',
});

const ROSETTA_PHOTO = img('/images/historia/lekcje/osiagniecia-egipcjan/kamien-z-rosetty.jpg');

const BLOCKS: HistBlockMeta[] = [
  { id: 'kartusze', kind: 'sledztwo', title: 'Jak odczytano hieroglify', time: '7 min', icon: Stamp },
  { id: 'imie', kind: 'cwiczenie', title: 'Twoje imię w kartuszu', time: '4 min', icon: Feather },
  { id: 'mierniczy', kind: 'symulator', title: 'Mierniczy po wylewie', time: '5 min', icon: Ruler },
  { id: 'lekarz', kind: 'zrodlo', title: 'Papirus lekarza', time: '6 min', icon: ScrollText },
];

const L18_LESSON = getLesson('poczatki-cywilizacji', 'od-pisma-do-alfabetu');
const LESSON = 'starozytny-egipt/osiagniecia-egipcjan';

/**
 * Obeliski egipskie w Europie. Źródła: Wikipedia — „Obelisk Flaminiusza”,
 * „Obelisk Laterański”, „Obelisk z Luksoru”, „Igła Kleopatry (Londyn)”,
 * „Piramida Luwru”.
 */
const OBELISKS = [
  { where: 'Rzym, Piazza del Popolo', what: 'obelisk faraonów Setiego I i Ramzesa II', when: 'przywieziony przez cesarza Augusta w 10 r. p.n.e.' },
  { where: 'Rzym, plac przed Lateranem', what: 'obelisk Totmesa III — najwyższy stojący obelisk egipski', when: 'przywieziony w 357 r. n.e.' },
  { where: 'Paryż, plac Zgody', what: 'obelisk Ramzesa II ze świątyni w Luksorze', when: 'postawiony w 1836 r.' },
  { where: 'Londyn, brzeg Tamizy', what: '„Igła Kleopatry” — obelisk Totmesa III', when: 'postawiony w 1878 r.' },
  { where: 'Paryż, dziedziniec Luwru', what: 'szklana piramida — wejście do muzeum, kształt wzięty od piramid', when: 'otwarta w 1989 r.' },
];

interface LessonProps {
  lesson: HistLesson;
  histModule: HistModule;
  nextLesson?: HistLesson;
}

export function OsiagnieciaEgipcjanLesson({ lesson, histModule, nextLesson }: LessonProps) {
  return (
    <HistLessonShell
      lesson={lesson}
      histModule={histModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Odczytałeś/łaś hieroglify metodą Champolliona i zapisałeś/łaś swoje imię w kartuszu. Wytyczyłeś/łaś pole sznurem z węzłami i policzyłeś/łaś podatek jak mierniczy faraona. Zrobiłeś/łaś kartkę papirusu i oddzieliłeś/łaś wiedzę lekarzy od zaklęć. Od dziś wiesz: wiele rzeczy, z których korzystasz codziennie — kalendarz, pomiary, słowo „papier” — ma korzenie nad Nilem."
      entry={
        L18_LESSON ? (
          <Przypominajka from={L18_LESSON} distance={3} color={histModule.color}>
            <SpolgloskiPrzypominajka color={histModule.color} />
          </Przypominajka>
        ) : undefined
      }
    >
      <LessonBody color={histModule.color} />
    </HistLessonShell>
  );
}

function LessonBody({ color }: { color: string }) {
  const kartusze = useBlockDone('kartusze');
  const imie = useBlockDone('imie');
  const mierniczy = useBlockDone('mierniczy');
  const lekarz = useBlockDone('lekarz');
  const pin = getCorePin('hieroglify');
  const [decoded, setDecoded] = useState(false);
  const [healed, setHealed] = useState(false);

  return (
    <>
      <LessonIntro color={color} />

      <LessonBlock id="kartusze">
        <div className="mb-4 grid gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
          <figure className="mx-auto w-full max-w-[220px] space-y-1">
            <Image
              src={ROSETTA_PHOTO}
              alt="Fotografia Kamienia z Rosetty w muzeum: ciemnoszara kamienna płyta z ukruszonym górnym brzegiem; u góry rzędy drobnych hieroglifów, w środku gęste linijki drugiego pisma, na dole równe wiersze liter greckich"
              width={769}
              height={900}
              className="h-auto w-full border"
            />
            <figcaption className="text-[11px] leading-snug text-muted-foreground">
              Kamień z Rosetty, British Museum. Fot. Hans Hillewaert, Wikimedia Commons, CC BY-SA 4.0.
            </figcaption>
          </figure>
          <div className="space-y-3 text-sm leading-relaxed">
            <p>
              Ostatni napis hieroglifami wykuto w IV wieku naszej ery. Potem przez prawie 1500 lat <strong>nikt na świecie nie umiał ich
              czytać</strong>. Uczeni myśleli, że każdy znak to tylko obrazek-symbol.
            </p>
            <p>
              W 1799 roku żołnierze francuscy znaleźli w Egipcie ten kamień. Ten sam tekst wykuto na nim trzy razy: <strong>hieroglifami</strong>{' '}
              (u góry), pismem codziennym Egipcjan (w środku) i <strong>po grecku</strong> (na dole). A grekę uczeni znali. W hieroglifach
              niektóre znaki zamknięto w owalnych ramkach — <strong>kartuszach</strong>. Domyślano się, że to imiona królów.
            </p>
          </div>
        </div>
        <KartuszeWidget color={color} onDone={() => setDecoded(true)} />
        {pin && (decoded || kartusze.done) && (
          <div className="mt-6 border-t pt-4">
            <p className="mb-3 text-sm leading-relaxed">
              Od 1822 roku znów potrafimy czytać, co Egipcjanie pisali o sobie — a nie tylko to, co pisali o nich Grecy. Przypnij ten rok na
              Osi dziejów.
            </p>
            <PrzypnijPinezke pin={pin} color={color} lesson={LESSON} mode="piramidy" done={kartusze.done} onPinned={kartusze.markBlockDone} />
          </div>
        )}
      </LessonBlock>

      <LessonBlock id="imie">
        <p className="mb-4 text-sm leading-relaxed">
          Hieroglifów było ponad 5000. Jedne oznaczały całe słowa, inne kilka głosek, a mniej więcej 24 — <strong>jedną spółgłoskę</strong>.
          Tymi ostatnimi Egipcjanie zapisywali obce imiona, jak Ptolemeusz czy Kleopatra. Zapisz nimi swoje.
        </p>
        <ImieWidget color={color} onDone={imie.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="mierniczy">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.mierniczy}
          alt="Akwarela: szerokie, płaskie pole mokrego brązowego mułu z kałużami po opadnięciu Nilu; mężczyzna w białej lnianej przepasce trzyma długi sznur z węzłami rozciągnięty po ziemi między dwoma drewnianymi palikami, drugi wbija palik; z mułu wystaje szary kamień graniczny, z boku rzeka i palmy"
          lead="Co roku to samo pytanie: czyje to pole?"
        >
          Wylew przynosił żyzny muł — ale zmywał też miedze. Po każdym wylewie mierniczy faraona chodzili po polach ze sznurami, na których
          w równych odstępach zawiązano węzły. Grecki podróżnik Herodot pisał, że właśnie stąd Grecy nauczyli się <strong>geometrii</strong>{' '}
          — po grecku to słowo znaczy „mierzenie ziemi”.
        </LessonImageCard>
        <div className="mt-4">
          <MierniczyWidget color={color} onDone={mierniczy.markBlockDone} />
        </div>
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          Herodot, Dzieje II 109 (omówienie): król dał każdemu Egipcjaninowi pole i brał od niego podatek; gdy rzeka zabrała część pola,
          wysyłał ludzi, żeby zmierzyli, o ile się zmniejszyło — i podatek malał. Liczby w zadaniu są wymyślone.
        </p>
      </LessonBlock>

      <LessonBlock id="lekarz">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.lekarz}
          alt="Akwarela: na drewnianym stole gliniany dzbanek złotego miodu z drewnianym kijkiem do nabierania, pęczki suszonych ziół i zielonych liści, kamienny moździerz z tłuczkiem, zwój białych lnianych bandaży i czysta kartka papirusu; w tle Nil, palmy i świątynia"
          lead="Egipscy lekarze słynęli w całym starożytnym świecie."
        >
          Królowie innych krajów prosili faraona, żeby przysłał im swojego lekarza. Lekarze nastawiali złamania, opatrywali rany, znali setki leków
          z roślin. Swoją wiedzę zapisywali na papirusie — i niektóre z tych zapisów przetrwały do dziś.
        </LessonImageCard>
        <div className="mt-4">
          <PapirusLekarzaWidget
            color={color}
            onDone={() => {
              setHealed(true);
              lekarz.markBlockDone();
            }}
          />
        </div>
        {(healed || lekarz.done) && <EuropeNote color={color} />}
      </LessonBlock>
    </>
  );
}

function EuropeNote({ color }: { color: string }) {
  return (
    <div className="mt-6 space-y-4 border-t pt-4">
      <LessonImageCard
        variant="secondary"
        color={color}
        image={IMAGES.obelisk}
        alt="Akwarela: słoneczny plac europejskiego miasta z eleganckimi kamienicami i fontanną; pośrodku wysoki, smukły obelisk z różowego granitu o ostrym, piramidalnym czubku na kamiennym cokole; kilka gołębi i przechodniów"
        lead="Kawałek Egiptu na placu w Europie."
      >
        Egipt zachwycał Rzymian, a potem całą Europę. Obeliski — wysokie kamienne słupy z czubkiem jak mała piramida — przewożono statkami przez
        morze i stawiano na placach.
      </LessonImageCard>
      <ul className="space-y-1.5 text-sm leading-relaxed">
        {OBELISKS.map((o) => (
          <li key={o.where} className="border-l-2 pl-3" style={{ borderColor: color }}>
            <strong>{o.where}</strong> — {o.what}, {o.when}
          </li>
        ))}
      </ul>
      <div className="border bg-muted/30 p-3 text-sm leading-relaxed">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Dla ciekawych · Syriusz i kalendarz</p>
        <p>
          Egipcjanie zauważyli, że najjaśniejsza gwiazda nocnego nieba, <strong>Syriusz</strong>, po kilku tygodniach niewidoczności pojawia się
          znowu tuż przed świtem — mniej więcej wtedy, gdy zaczyna się wylew Nilu. Od tego czasu liczyli nowy rok. Pamiętasz ich kalendarz?{' '}
          <strong>365 dni</strong>: 12 miesięcy po 30 dni i 5 dni dodatkowych. Kiedy Juliusz Cezar zmieniał kalendarz rzymski, pomagał mu
          astronom z egipskiej Aleksandrii — i stąd, przez Rzym, Twój kalendarz na ścianie ma 365 dni.
        </p>
      </div>
    </div>
  );
}

function LessonIntro({ color }: { color: string }) {
  return (
    <div className="grid gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_260px]">
      <div className="text-base leading-relaxed sm:text-lg">
        <p>
          Kartka w Twoim zeszycie, kalendarz na ścianie, wzór na pole prostokąta. Co je łączy? Wszystkie mają korzenie w kraju nad Nilem.
        </p>
        <p className="mt-3">
          Dziś odczytasz hieroglify tak jak człowiek, który zrobił to pierwszy, zapiszesz w nich swoje imię, wytyczysz pole po wylewie i zrobisz
          kartkę papirusu. Wszystko stoi na jednym zdaniu:{' '}
          <strong>
            wiele rzeczy, z których korzystasz codziennie — kalendarz, pomiary, słowo „papier” — ma korzenie nad Nilem.
          </strong>
        </p>
      </div>

      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.rosetta}
            alt="Akwarela: cicha sala muzeum; w szklanej gablocie na niskim cokole stoi duża ciemnoszara kamienna płyta z ukruszonym górnym brzegiem; przed nią, tyłem do nas, babcia i chłopiec oglądają kamień"
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
