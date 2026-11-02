'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Gavel, Hourglass, ScrollText } from 'lucide-react';
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
import { imgMap } from '@/lib/media';
import { DzienWidget } from './dzien-widget';
import { SenekaWidget } from './seneka-widget';
import { CezarWidget } from './cezar-widget';
import { UstrojPrzypominajka } from './ustroj-przypominajka';
import { getCorePin } from '../../../lib/timeline/pins';
import { getLesson } from '../../../data/lessons';
import type { HistModule } from '../../../data/curriculum';
import type { HistLesson } from '../../../data/lessons';

/**
 * L27 — Jeden dzień, trzy życia. Niesie `[7.1]`.
 *
 * **Zdanie lekcji: w Rzymie ta sama ulica wyglądała zupełnie inaczej dla
 * patrycjusza, plebejusza i niewolnika.**
 *
 * Trzy bloki:
 *  - `dzien` — dzień triumfu Cezara (46 p.n.e.) jako Gajusz, Tulia i Dawos:
 *    zajęcia wkładane w wolne godziny (12 godzin rzymskich), tabela z tego,
 *    co dziecko ułożyło;
 *  - `seneka` — zakreślacz na omówieniu listu 47 i paszport źródła;
 *  - `cezar` — trzy źródła, suwaki zaufania, ocena; pinezka `cezar` (44 p.n.e.).
 *
 * Przypominajka: ustrój Rzymu w 46 p.n.e. (L26, dystans 1). Blok D (imię
 * rzymskie) odłożony.
 */

const IMAGES = imgMap({
  intro: '/images/historia/lekcje/rzym-czasow-cezara/triumf.jpg',
  gajusz: '/images/historia/lekcje/rzym-czasow-cezara/atrium.jpg',
  tulia: '/images/historia/lekcje/rzym-czasow-cezara/piekarnia.jpg',
  dawos: '/images/historia/lekcje/rzym-czasow-cezara/kuchnia.jpg',
  uczta: '/images/historia/lekcje/rzym-czasow-cezara/uczta.jpg',
});

const BLOCKS: HistBlockMeta[] = [
  { id: 'dzien', kind: 'perspektywy', title: 'Jeden dzień, trzy życia', time: '9 min', icon: Hourglass },
  { id: 'seneka', kind: 'zrodlo', title: 'Seneka o niewolnikach', time: '6 min', icon: ScrollText },
  { id: 'cezar', kind: 'sledztwo', title: 'Cezar: bohater czy tyran?', time: '7 min', icon: Gavel },
];

const L26_LESSON = getLesson('starozytny-rzym', 'od-wioski-do-imperium');
const LESSON = 'starozytny-rzym/rzym-czasow-cezara';

interface LessonProps {
  lesson: HistLesson;
  histModule: HistModule;
  nextLesson?: HistLesson;
}

export function RzymCzasowCezaraLesson({ lesson, histModule, nextLesson }: LessonProps) {
  return (
    <HistLessonShell
      lesson={lesson}
      histModule={histModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Przeżyłeś/łaś dzień triumfu Cezara trzy razy — jako syn senatora, córka piekarza i niewolnik — przeczytałeś/łaś list Seneki i oceniłeś/łaś Cezara na podstawie trzech źródeł. Od dziś wiesz: w Rzymie ta sama ulica wyglądała zupełnie inaczej dla patrycjusza, plebejusza i niewolnika."
      entry={
        L26_LESSON ? (
          <Przypominajka from={L26_LESSON} distance={1} color={histModule.color}>
            <UstrojPrzypominajka color={histModule.color} />
          </Przypominajka>
        ) : undefined
      }
    >
      <LessonBody color={histModule.color} />
    </HistLessonShell>
  );
}

function LessonBody({ color }: { color: string }) {
  const dzien = useBlockDone('dzien');
  const seneka = useBlockDone('seneka');
  const cezar = useBlockDone('cezar');
  const [judged, setJudged] = useState(false);
  const pin = getCorePin('cezar');

  return (
    <>
      <LessonIntro color={color} />

      <LessonBlock id="dzien">
        <p className="mb-4 text-sm leading-relaxed sm:text-base">
          Jesień 46 roku p.n.e. Cezar wrócił ze zwycięskich wojen i przez Rzym przejdzie jego triumf: wozy z łupami,
          jeńcy, żołnierze, a na końcu sam Cezar na rydwanie. Całe miasto chce to zobaczyć. Przeżyj ten dzień trzy razy —
          jako każda z trzech osób, które mieszkają kilka ulic od siebie.
        </p>
        <DzienWidget color={color} images={{ gajusz: IMAGES.gajusz, tulia: IMAGES.tulia, dawos: IMAGES.dawos }} onDone={dzien.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="seneka">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.uczta}
          alt="Akwarela: rzymska uczta — goście w jasnych szatach leżą na łożach wokół niskiego stołu z owocami i dzbanami, w tle pod ścianą stoją w milczeniu młodzi służący w prostych tunikach, jeden trzyma dzban"
          lead="Uczta oczami tego, kto przy niej stoi."
        >
          Bogaci Rzymianie jedli, leżąc na łożach. Przy stołach stali niewolnicy — czasem całą noc. Sto lat po Cezarze
          filozof Seneka napisał o nich list do przyjaciela.
        </LessonImageCard>
        <div className="mt-4">
          <SenekaWidget color={color} onDone={seneka.markBlockDone} />
        </div>
      </LessonBlock>

      <LessonBlock id="cezar">
        <p className="mb-4 text-sm leading-relaxed sm:text-base">
          Dwa lata po triumfie, 15 marca 44 roku p.n.e., grupa senatorów zabiła Cezara w sali obrad. Jedni mówili, że
          uratowali republikę przed tyranem, inni — że zabili bohatera. Co mówią źródła? Najpierw zdecyduj, którym ufasz.
        </p>
        <CezarWidget color={color} onDone={() => setJudged(true)} />
        {(judged || cezar.done) && pin && (
          <div className="mt-5 border-t pt-4">
            <p className="mb-3 text-sm leading-relaxed">
              Śmierć Cezara nie uratowała republiki: po kilkunastu latach wojen domowych władzę objął jego przybrany syn,
              August — pierwszy cesarz. Przypnij śmierć Cezara na Osi dziejów.
            </p>
            <PrzypnijPinezke pin={pin} color={color} lesson={LESSON} mode="piramidy" done={cezar.done} onPinned={cezar.markBlockDone} />
          </div>
        )}
      </LessonBlock>
    </>
  );
}

function LessonIntro({ color }: { color: string }) {
  return (
    <div className="grid gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_260px]">
      <div className="text-base leading-relaxed sm:text-lg">
        <p>
          W czasach Cezara Rzym miał około miliona mieszkańców — więcej niż dzisiejszy Kraków. Ale nie był jednym miastem
          dla wszystkich. Dla jednych był miastem marmurowych domów i uczt, dla innych — ciasnych kamienic i pracy od świtu.
        </p>
        <p className="mt-3">
          Dziś przeżyjesz jeden dzień trzy razy, przeczytasz list filozofa o niewolnikach i ocenisz samego Cezara. Wszystko
          stoi na jednym zdaniu:{' '}
          <strong>w Rzymie ta sama ulica wyglądała zupełnie inaczej dla patrycjusza, plebejusza i niewolnika.</strong>
        </p>
      </div>

      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Akwarela: pochód triumfalny widziany z daleka — tłum ludzi wzdłuż ulicy, żołnierze w czerwonych płaszczach, rydwan zaprzężony w białe konie, łuki z zielonych gałęzi i girland nad ulicą"
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
