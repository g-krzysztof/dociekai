'use client';

import { useEffect, useRef } from 'react';
import { YEARS_FROM, YEARS_TO, tasksOf, type PartId } from './zadania';
import {
  AxisTask,
  CenturiesTask,
  ColonyTask,
  EgyptTask,
  FlagTask,
  OpinionTask,
  PlanTask,
  QuizTask,
  ReachTask,
  SourcesTask,
  StreetTask,
  WitnessTask,
  YearsTask,
} from './zadania-widgets';
import { useTest } from './test-state';

/**
 * Jedna część testu = trzy zadania w ramkach `QuizTask`. Blok jest zaliczony,
 * gdy wszystkie trzy mają odpowiedź (trafną albo nie — to test, nie ćwiczenie).
 */
export function Czesc({ part, color, onDone }: { part: PartId; color: string; onDone: () => void }) {
  const { results } = useTest();
  const ids = tasksOf(part).map((t) => t.id);
  const all = ids.every((id) => id in results);
  const reported = useRef(false);

  useEffect(() => {
    if (all && !reported.current) {
      reported.current = true;
      onDone();
    }
  }, [all, onDone]);

  const base = { czas: 1, slady: 4, mapa: 7, dziedzictwo: 10 }[part];

  return (
    <div className="space-y-3">
      {part === 'czas' && (
        <>
          <QuizTask id="os" n={base} color={color} title={<><strong>Ułóż wydarzenia na osi</strong> — stuknij je od najdawniejszego.</>} explain="Kolejność: piramidy (ok. 2500 p.n.e.) → igrzyska (776 p.n.e.) → śmierć Cezara (44 p.n.e.) → wolność dla chrześcijan (313). Przed naszą erą większa liczba znaczy dawniej.">
            {(a) => <AxisTask color={color} onAnswer={a} />}
          </QuizTask>
          <QuizTask id="lata" n={base + 1} color={color} title={<><strong>Ile lat minęło</strong> od śmierci Cezara ({-YEARS_FROM} p.n.e.) do wolności dla chrześcijan ({YEARS_TO} n.e.)? Wpisz liczbę.</>} explain="44 + 313 − 1 = 356 lat. Odejmujemy jedynkę, bo roku zero nie było.">
            {(a) => <YearsTask color={color} onAnswer={a} />}
          </QuizTask>
          <QuizTask id="wieki" n={base + 2} color={color} title={<><strong>W którym wieku?</strong> Wybierz wiek przy każdym roku.</>} explain="1900 to ostatni rok XIX wieku (1801–1900). 480 p.n.e. należy do V wieku p.n.e. (500–401 p.n.e.).">
            {(a) => <CenturiesTask color={color} onAnswer={a} />}
          </QuizTask>
        </>
      )}
      {part === 'slady' && (
        <>
          <QuizTask id="bramki" n={base} color={color} title={<><strong>Przepuść źródła przez bramki</strong> — jakiego rodzaju jest każde?</>} explain="List — źródło pisane, grot — niepisane (da się go dotknąć, nie ma na nim pisma), legenda opowiadana przez babcię — niematerialne.">
            {(a) => <SourcesTask color={color} onAnswer={a} />}
          </QuizTask>
          <QuizTask id="opinia" n={base + 1} color={color} title={<><strong>Stuknij zdanie, które jest czyjąś opinią</strong>, a nie faktem.</>} explain="„Najpiękniejsza” to ocena — ktoś inny może uważać zupełnie inaczej. Pozostałe dwa zdania da się sprawdzić.">
            {(a) => <OpinionTask onAnswer={a} />}
          </QuizTask>
          <QuizTask id="swiadek" n={base + 2} color={color} title={<><strong>Które źródło stoi bliżej</strong> czasów Peryklesa?</>} explain="Tukidydes żył w tych samych czasach i znał Peryklesa. Film nakręcono prawie 2500 lat później.">
            {(a) => <WitnessTask onAnswer={a} />}
          </QuizTask>
        </>
      )}
      {part === 'mapa' && (
        <>
          <QuizTask id="legenda" n={base} color={color} title={<><strong>Przeczytaj legendę</strong> i stuknij na planie młyn wodny.</>} explain="Młyn ma w legendzie znak koła z krzyżem — stoi nad rzeką, po prawej.">
            {(a) => <PlanTask color={color} onAnswer={a} />}
          </QuizTask>
          <QuizTask id="kolonia" n={base + 1} color={color} title={<>Grecy założyli na Sycylii miasto Syrakuzy. <strong>Stuknij dzisiejsze państwo</strong>, w którym leżą.</>} explain="Sycylia należy dziś do Włoch.">
            {(a) => <ColonyTask color={color} onAnswer={a} />}
          </QuizTask>
          <QuizTask id="zasieg" n={base + 2} color={color} title={<><strong>Zatrzymaj suwak</strong> przy największym zasięgu państwa rzymskiego.</>} explain="Największe było za cesarza Trajana, około 117 roku — potem zaczęło tracić ziemie.">
            {(a) => <ReachTask color={color} onAnswer={a} />}
          </QuizTask>
        </>
      )}
      {part === 'dziedzictwo' && (
        <>
          <QuizTask id="ulica" n={base} color={color} title={<>Idziesz dzisiejszą ulicą. <strong>Wybierz trzy ślady Grecji i Rzymu.</strong></>} explain="Kolumny i łuk to pomysły budowniczych Grecji i Rzymu, a słowo „teatr” pochodzi z greki.">
            {(a) => <StreetTask color={color} onAnswer={a} />}
          </QuizTask>
          <QuizTask id="anachronizmy" n={base + 1} color={color} title={<>Scena: budowa piramid, ok. 2500 p.n.e. <strong>Wybierz dwie rzeczy nie z tej epoki.</strong></>} explain="Wielbłądy rozpowszechniły się w Egipcie ponad 1500 lat później, a kolumny z kręconą głowicą wymyślili Grecy prawie 2000 lat później.">
            {(a) => <EgyptTask color={color} onAnswer={a} />}
          </QuizTask>
          <QuizTask id="flaga" n={base + 2} color={color} title={<><strong>Wywieś flagę Polski</strong> tak, jak mówi prawo.</>} explain="Biały pas u góry, czerwony u dołu — tak mówi ustawa o godle, barwach i hymnie.">
            {(a) => <FlagTask color={color} onAnswer={a} />}
          </QuizTask>
        </>
      )}
    </div>
  );
}
