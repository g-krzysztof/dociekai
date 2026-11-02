'use client';

import Image from 'next/image';
import { Droplets, Gamepad2, Milestone, Scale } from 'lucide-react';
import {
  HIST_BLOCK_KINDS,
  HistLessonShell,
  LessonBlock,
  useBlockDone,
  type HistBlockMeta,
} from '../../lesson-shell';
import { Przypominajka } from '../../przypominajka';
import { imgMap } from '@/lib/media';
import { AkweduktWidget } from './akwedukt-widget';
import { DrogaWidget } from './droga-widget';
import { LacinaWidget } from './lacina-widget';
import { GraWidget } from './gra-widget';
import { EpidaurosPrzypominajka } from './epidauros-przypominajka';
import { getLesson } from '../../../data/lessons';
import type { HistModule } from '../../../data/curriculum';
import type { HistLesson } from '../../../data/lessons';

/**
 * L28 — Rzymianie budowali na zawsze. Niesie `[7.3 — kultura]` i `[7.2]`
 * oraz doświadczenie edukacyjne 2a (gra historyczna oceniana pod kątem realiów).
 *
 * **Zdanie lekcji: Rzymianie budowali tak, żeby przetrwało — dlatego ich drogi,
 * prawo i język wciąż są wokół nas.**
 *
 * Cztery bloki:
 *  - `akwedukt` — kanał prowadzony od źródła do miasta, ani razu pod górę,
 *    most do 50 m; prawdziwa fotografia Pont du Gard;
 *  - `droga` — warstwy w wykopie, sto lat wozów, kamień milowy XXIV;
 *  - `lacina` — łacińskie korzenie słów i flaga regulaminu w tygodniu
 *    (prawo nie działa wstecz);
 *  - `gra` — spacer po Rzymie w 44 p.n.e. z 7 anachronizmami, ocena gry,
 *    spacer domownika.
 *
 * Przypominajka: akustyka Epidauros (L25, dystans 3). Bloki R (Pompeje, Rzym
 * a ziemie polskie) odłożone.
 */

const IMAGES = imgMap({
  intro: '/images/historia/lekcje/dziedzictwo-rzymu/droga.jpg',
  pont: '/images/historia/lekcje/dziedzictwo-rzymu/pont-du-gard.jpg',
});

const BLOCKS: HistBlockMeta[] = [
  { id: 'akwedukt', kind: 'symulator', title: 'Akwedukt', time: '7 min', icon: Droplets },
  { id: 'droga', kind: 'symulator', title: 'Droga na tysiąc lat', time: '6 min', icon: Milestone },
  { id: 'lacina', kind: 'cwiczenie', title: 'Łacina i prawo wokół nas', time: '6 min', icon: Scale },
  { id: 'gra', kind: 'zadanie', title: 'Gra: spacer po Rzymie', time: '10 min', icon: Gamepad2 },
];

const L25_LESSON = getLesson('starozytna-grecja', 'teatr-igrzyska-filozofia');

interface LessonProps {
  lesson: HistLesson;
  histModule: HistModule;
  nextLesson?: HistLesson;
}

export function DziedzictwoRzymuLesson({ lesson, histModule, nextLesson }: LessonProps) {
  return (
    <HistLessonShell
      lesson={lesson}
      histModule={histModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Doprowadziłeś/łaś wodę akweduktem do miasta, zbudowałeś/łaś drogę, która wytrzymała sto lat, znalazłeś/łaś łacinę we własnym zdaniu i rzymskie prawo w klasowym regulaminie, a na koniec złapałeś/łaś grę na anachronizmach. Od dziś wiesz: Rzymianie budowali tak, żeby przetrwało — dlatego ich drogi, prawo i język wciąż są wokół nas."
      entry={
        L25_LESSON ? (
          <Przypominajka from={L25_LESSON} distance={3} color={histModule.color}>
            <EpidaurosPrzypominajka color={histModule.color} />
          </Przypominajka>
        ) : undefined
      }
    >
      <LessonBody color={histModule.color} />
    </HistLessonShell>
  );
}

function LessonBody({ color }: { color: string }) {
  const akwedukt = useBlockDone('akwedukt');
  const droga = useBlockDone('droga');
  const lacina = useBlockDone('lacina');
  const gra = useBlockDone('gra');

  return (
    <>
      <LessonIntro color={color} />

      <LessonBlock id="akwedukt">
        <figure className="mb-4 border bg-white p-3 dark:bg-zinc-900">
          <Image
            src={IMAGES.pont}
            alt="Fotografia: trzypiętrowy kamienny most na łukach nad rzeką w zielonej dolinie — Pont du Gard; na samej górze biegnie zakryty kanał na wodę"
            width={1280}
            height={494}
            className="h-auto w-full"
          />
          <figcaption className="mt-2 text-xs text-muted-foreground">
            Pont du Gard we Francji — fragment rzymskiego akweduktu z I w. n.e., który prowadził wodę do miasta Nemausus (dziś
            Nîmes). Wysokość ok. 49 m. Fot. Benh LIEU SONG, Wikimedia Commons, CC BY-SA 3.0.
          </figcaption>
        </figure>
        <p className="mb-4 text-sm leading-relaxed sm:text-base">
          Rzymskie miasta potrzebowały mnóstwo wody: do fontann, łaźni i domów. Rzymianie nie mieli pomp — woda musiała
          płynąć sama, z gór do miasta. Zaprojektuj kanał: ustaw jego wysokość w sześciu punktach trasy i puść wodę.
        </p>
        <AkweduktWidget color={color} onDone={akwedukt.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="droga">
        <p className="mb-4 text-sm leading-relaxed sm:text-base">
          Rzymska droga to nie ścieżka, tylko budowla: rów głęboki na metr albo więcej, wypełniony warstwami. Ułóż warstwy w
          wykopie od dna do wierzchu i puść po drodze wozy przez sto lat.
        </p>
        <DrogaWidget color={color} onDone={droga.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="lacina">
        <LacinaWidget color={color} onDone={lacina.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="gra">
        <p className="mb-4 text-sm leading-relaxed sm:text-base">
          Ktoś zrobił grę o Rzymie w roku śmierci Cezara, 44 p.n.e. Wygląda pięknie — ale czy jest zgodna z prawdą? Przejdź
          ulicą, stuknij każdą rzecz, która do tego roku nie pasuje, i powiedz dlaczego. Takie rzeczy „nie ze swojego czasu”
          to <strong>anachronizmy</strong>. Uwaga: niektóre rzeczy tylko wyglądają podejrzanie.
        </p>
        <GraWidget color={color} onDone={gra.markBlockDone} />
      </LessonBlock>
    </>
  );
}

function LessonIntro({ color }: { color: string }) {
  return (
    <div className="grid gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_260px]">
      <div className="text-base leading-relaxed sm:text-lg">
        <p>
          Państwo rzymskie na zachodzie upadło ponad 1500 lat temu. A jednak jego drogi wciąż prowadzą przez Europę,
          akwedukty stoją nad dolinami, a słowa, których używasz w szkole, mają łacińskie korzenie.
        </p>
        <p className="mt-3">
          Dziś zaprojektujesz akwedukt i drogę, znajdziesz łacinę i rzymskie prawo w swoim życiu, a na koniec sprawdzisz,
          czy gra o Rzymie mówi prawdę. Wszystko stoi na jednym zdaniu:{' '}
          <strong>Rzymianie budowali tak, żeby przetrwało — dlatego ich drogi, prawo i język wciąż są wokół nas.</strong>
        </p>
      </div>

      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Akwarela: rzymska droga z dużych, dopasowanych płyt kamiennych biegnie przez wzgórza między cyprysami, przy drodze stoi gładki kamienny słup — kamień milowy"
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
