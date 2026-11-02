'use client';

import Image from 'next/image';
import { useState } from 'react';
import { CalendarClock, Fish, Hourglass, Sailboat, Users } from 'lucide-react';
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
import { SzlakWidget } from './szlak-widget';
import { GminaWidget } from './gmina-widget';
import { PliniuszWidget } from './pliniusz-widget';
import { RachubaWidget } from './rachuba-widget';
import { StatekPrzypominajka } from './statek-przypominajka';
import { getCorePin } from '../../../lib/timeline/pins';
import { getLesson } from '../../../data/lessons';
import type { HistModule } from '../../../data/curriculum';
import type { HistLesson } from '../../../data/lessons';

/**
 * L30 — Od katakumb do religii panującej. Niesie `[8.2]` `[8.3]` `[8.4]`.
 *
 * **Zdanie lekcji: W ciągu trzystu lat chrześcijaństwo przeszło od małych,
 * prześladowanych wspólnot do religii panującej w Rzymie.**
 *
 * Pięć bloków:
 *  - `szlak` — dziennik podróży Pawła, statek od portu do portu, listy do gmin,
 *    szlaki handlu; pinezka `chrzescijanstwo`;
 *  - `gmina` — pięć osób sadzanych przy wspólnym stole, powód w ich słowach;
 *  - `pliniusz` — list Pliniusza do Trajana (paszport źródła) i akrostych ΙΧΘΥΣ;
 *  - `trzysta` — prześladowania, katakumby, 313 i koniec IV w.; pinezki
 *    `edykt` i `religia-panujaca`;
 *  - `rachuba` — linijka z ruchomym „rokiem 1” i wpływ na Europę;
 *    D (data narodzin Jezusa wg erraty) jako dopisek poza postępem.
 *
 * Neutralność światopoglądowa: „chrześcijanie wierzą…”, bez wizerunków Boga
 * i Jezusa; prześladowania bez opisów kar. Przypominajka: statek z L22 (dystans 8).
 */

const IMAGES = imgMap({
  port: '/images/historia/lekcje/od-katakumb-do-religii-panujacej/port.jpg',
  dom: '/images/historia/lekcje/od-katakumb-do-religii-panujacej/dom-gminy.jpg',
  katakumby: '/images/historia/lekcje/od-katakumb-do-religii-panujacej/katakumby.jpg',
  sala: '/images/historia/lekcje/od-katakumb-do-religii-panujacej/sala-mediolan.jpg',
  ichthys: '/images/historia/lekcje/od-katakumb-do-religii-panujacej/ichthys-efez.jpg',
});

const BLOCKS: HistBlockMeta[] = [
  { id: 'szlak', kind: 'mapa', title: 'Szlakiem Pawła', time: '7 min', icon: Sailboat },
  { id: 'gmina', kind: 'perspektywy', title: 'Dlaczego się przyłączyli?', time: '5 min', icon: Users },
  { id: 'pliniusz', kind: 'zrodlo', title: 'List namiestnika i znak ryby', time: '6 min', icon: Fish },
  { id: 'trzysta', kind: 'os-czasu', title: 'Trzysta lat', time: '4 min', icon: Hourglass },
  { id: 'rachuba', kind: 'os-czasu', title: 'Od kiedy liczymy lata?', time: '4 min', icon: CalendarClock },
];

const L22_LESSON = getLesson('starozytna-grecja', 'grecja-gory-i-morze');
const LESSON = 'narodziny-chrzescijanstwa/od-katakumb-do-religii-panujacej';

interface LessonProps {
  lesson: HistLesson;
  histModule: HistModule;
  nextLesson?: HistLesson;
  nextModule?: HistModule;
}

export function OdKatakumbDoReligiiPanujacejLesson({ lesson, histModule, nextLesson, nextModule }: LessonProps) {
  return (
    <HistLessonShell
      lesson={lesson}
      histModule={histModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      nextModule={nextModule}
      finishNote="Przepłynąłeś/łaś z Pawłem od portu do portu i zaniosłeś/łaś jego listy do gmin, posadziłeś/łaś przy jednym stole niewolnika i patrycjuszkę, wypełniłeś/łaś paszport listu rzymskiego namiestnika i odczytałeś/łaś rybę ΙΧΘΥΣ, przypiąłeś/łaś na osi rok 313 i przestawiłeś/łaś początek rachuby lat. Od dziś wiesz: w ciągu trzystu lat chrześcijaństwo przeszło od małych, prześladowanych wspólnot do religii panującej w Rzymie."
      entry={
        L22_LESSON ? (
          <Przypominajka from={L22_LESSON} distance={8} color={histModule.color}>
            <StatekPrzypominajka color={histModule.color} />
          </Przypominajka>
        ) : undefined
      }
    >
      <LessonBody color={histModule.color} />
    </HistLessonShell>
  );
}

function LessonBody({ color }: { color: string }) {
  const szlak = useBlockDone('szlak');
  const gmina = useBlockDone('gmina');
  const pliniusz = useBlockDone('pliniusz');
  const trzysta = useBlockDone('trzysta');
  const rachuba = useBlockDone('rachuba');
  const [sailed, setSailed] = useState(false);
  const [edykt, setEdykt] = useState(false);
  const pinI = getCorePin('chrzescijanstwo');
  const pinEdykt = getCorePin('edykt');
  const pinIV = getCorePin('religia-panujaca');

  return (
    <>
      <LessonIntro color={color} />

      <LessonBlock id="szlak">
        <p className="mb-4 text-sm leading-relaxed sm:text-base">
          Po śmierci Jezusa jego uczniowie — apostołowie — zaczęli opowiadać o nim innym. Najdalej dotarł Paweł z Tarsu. Był Żydem
          i obywatelem rzymskim, mówił po grecku i znał imperium jak mało kto. Prowadzimy go po mapie według jego podróży opisanych
          w Dziejach Apostolskich — księdze, która jest częścią Biblii.
        </p>
        <SzlakWidget color={color} onDone={() => setSailed(true)} />
        {(sailed || szlak.done) && pinI && (
          <div className="mt-5 border-t pt-4">
            <p className="mb-3 text-sm leading-relaxed">
              Wszystko, co widziałeś/łaś na mapie, wydarzyło się w I wieku naszej ery — wtedy powstały pierwsze gminy chrześcijan.
              Przypnij narodziny chrześcijaństwa na Osi dziejów.
            </p>
            <PrzypnijPinezke pin={pinI} color={color} lesson={LESSON} mode="piramidy" done={szlak.done} onPinned={szlak.markBlockDone} />
          </div>
        )}
      </LessonBlock>

      <LessonBlock id="gmina">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.dom}
          alt="Akwarela: wnętrze rzymskiego domu wieczorem — długi drewniany stół, na nim chleb, dzbanek i gliniane lampki oliwne, wokół proste ławy i stołki, pod sufitem wisząca lampka, a przez otwarte drzwi widać dziedziniec z drzewem oliwnym"
          lead="Rzym, około 100 roku. Wieczór w zwykłym domu."
        >
          Pierwsi chrześcijanie nie mieli kościołów. Gmina spotykała się w domu któregoś z wiernych — na modlitwę i wspólny posiłek.
          Przychodzili tu bardzo różni ludzie. Dlaczego?
        </LessonImageCard>
        <div className="mt-4">
          <GminaWidget color={color} onDone={gmina.markBlockDone} />
        </div>
      </LessonBlock>

      <LessonBlock id="pliniusz">
        <p className="mb-4 text-sm leading-relaxed sm:text-base">
          Co robili chrześcijanie na swoich spotkaniach? Najstarszy rzymski opis napisał ktoś, kto chrześcijaninem nie był. Około
          112 roku Pliniusz, rzymski namiestnik prowincji Bitynii (dziś północna Turcja), wysłał list do cesarza Trajana. Poniżej
          jego treść, opowiedziana prostymi słowami.
        </p>
        <PliniuszWidget color={color} photo={IMAGES.ichthys} onDone={pliniusz.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="trzysta">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.katakumby}
          alt="Akwarela: wąski podziemny korytarz wykuty w jasnobrązowej skale, w ścianach rzędy prostokątnych, zamkniętych płytami nisz, na półce skalnej gliniana lampka oliwna z małym płomieniem"
          lead="Pod Rzymem ciągną się kilometry podziemnych korytarzy."
        >
          To <strong>katakumby</strong> — podziemne cmentarze, w których chrześcijanie chowali zmarłych w niszach wykutych w skale.
          Długo opowiadano, że ukrywali się tam przed prześladowcami. Historycy uważają, że były to przede wszystkim cmentarze,
          a na modlitwę gmina zbierała się zwykle w domach.
        </LessonImageCard>
        <div className="mt-4 space-y-3 text-sm leading-relaxed sm:text-base">
          <p>
            Rzymianie czcili wielu bogów i zwykle pozwalali innym ludom czcić własnych. Wymagali jednak od wszystkich, żeby złożyli
            ofiarę bogom Rzymu i cesarzowi. Chrześcijanie odmawiali — wierzyli w jednego Boga. Dlatego uważano ich za nieposłusznych
            i podejrzanych.
          </p>
          <p>
            W 64 roku cesarz Neron obwinił ich o wielki pożar Rzymu. Potem <strong>prześladowania</strong> wracały falami: czasem
            w jednym mieście, czasem w całym imperium. Najcięższe przyszły na początku IV wieku, za cesarza Dioklecjana. Tych, którzy
            zginęli, bo nie chcieli wyrzec się wiary, chrześcijanie nazywają <strong>męczennikami</strong>.
          </p>
          <p>
            Wszystko zmieniło się w 313 roku. Cesarz Konstantyn razem z drugim cesarzem, Licyniuszem, ogłosił w Mediolanie, że
            każdy mieszkaniec imperium może wyznawać taką religię, jaką chce — także chrześcijaństwo. To <strong>edykt mediolański</strong>.
          </p>
        </div>
        {pinEdykt && (
          <div className="mt-4">
            <PrzypnijPinezke
              pin={pinEdykt}
              color={color}
              lesson={LESSON}
              mode="piramidy"
              done={trzysta.done || edykt}
              onPinned={() => setEdykt(true)}
            />
          </div>
        )}
        {(edykt || trzysta.done) && pinIV && (
          <div className="mt-5 border-t pt-4">
            <figure className="mb-4">
              <Image
                src={IMAGES.sala}
                alt="Akwarela: wysoka, pusta rzymska sala z ceglanymi ścianami i drewnianym dachem, ściany do połowy wyłożone kolorowym marmurem, na końcu półkolista nisza ze schodami, przez łukowe okna wpada jasne światło"
                width={640}
                height={480}
                className="h-auto w-full max-w-[520px]"
              />
            </figure>
            <p className="mb-3 text-sm leading-relaxed sm:text-base">
              Konstantyn wspierał chrześcijan i budował dla nich wielkie kościoły. Pod koniec IV wieku cesarz Teodozjusz ogłosił
              chrześcijaństwo religią państwa, a kilka lat później zakazał składania ofiar dawnym bogom. Religia, której wyznawców
              prześladowano, stała się <strong>religią panującą</strong>. Przypnij to na osi i zobacz, ile lat minęło od Pawła.
            </p>
            <PrzypnijPinezke pin={pinIV} color={color} lesson={LESSON} mode="piramidy" done={trzysta.done} onPinned={trzysta.markBlockDone} />
          </div>
        )}
      </LessonBlock>

      <LessonBlock id="rachuba">
        <RachubaWidget color={color} onDone={rachuba.markBlockDone} />
        {rachuba.done && (
          <div className="mt-5 space-y-3 border-t pt-4 text-sm leading-relaxed sm:text-base">
            <p>
              Rachuba lat to nie jedyny ślad chrześcijaństwa w Europie. Rozejrzyj się wokół siebie:
            </p>
            <ul className="grid gap-2 sm:grid-cols-2">
              <li className="border bg-white p-2.5 dark:bg-zinc-900">
                <strong>Niedziela</strong> — dzień wolny od pracy. W 321 roku Konstantyn ogłosił ją dniem odpoczynku.
              </li>
              <li className="border bg-white p-2.5 dark:bg-zinc-900">
                <strong>Święta</strong> — Boże Narodzenie i Wielkanoc to dni wolne w całej Polsce, nawet dla tych, którzy nie są
                chrześcijanami.
              </li>
              <li className="border bg-white p-2.5 dark:bg-zinc-900">
                <strong>Kościoły</strong> — stoją niemal w każdej miejscowości; często to najstarszy budynek w okolicy.
              </li>
              <li className="border bg-white p-2.5 dark:bg-zinc-900">
                <strong>Polska</strong> — przyjęła chrześcijaństwo w 966 roku, razem z pierwszym władcą, Mieszkiem I.
              </li>
            </ul>
            <p>Dziś chrześcijaństwo wyznaje około 2,5 miliarda ludzi — to najliczniejsza religia świata.</p>
          </div>
        )}
        {rachuba.done && (
          <aside className="mt-5 border-l-2 bg-muted/40 p-3 text-sm leading-relaxed" style={{ borderColor: color }}>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Dla dociekliwych</p>
            <p>
              Czy Dionizy policzył dobrze? Według Ewangelii Jezus urodził się za panowania króla Heroda. Z innych źródeł wiemy, że Herod
              zmarł w 4 roku p.n.e. Dlatego historycy datują narodziny Jezusa na około 6–4 rok <em>przed</em> naszą erą — Dionizy
              pomylił się o kilka lat. Numerów lat nikt już jednak nie zmieniał: cały świat liczy według jego rachuby.
            </p>
          </aside>
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
          Kiedy umarł Jezus, jego uczniów było niewielu. Trzysta lat później do ich wiary należał sam cesarz Rzymu. Jak to się
          stało, skoro przez większość tego czasu chrześcijan prześladowano?
        </p>
        <p className="mt-3">
          Dziś popłyniesz z Pawłem od portu do portu, posadzisz przy jednym stole bardzo różnych ludzi, przeczytasz list
          rzymskiego urzędnika i przestawisz początek rachuby lat. Wszystko stoi na jednym zdaniu:{' '}
          <strong>
            W ciągu trzystu lat chrześcijaństwo przeszło od małych, prześladowanych wspólnot do religii panującej w Rzymie.
          </strong>
        </p>
      </div>

      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.port}
            alt="Akwarela: rzymski port nad Morzem Śródziemnym — przy kamiennym nabrzeżu stoją drewniane statki handlowe z prostokątnymi żaglami, tragarze niosą gliniane amfory, w tle białe domy na zboczu i kamienna latarnia morska"
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
