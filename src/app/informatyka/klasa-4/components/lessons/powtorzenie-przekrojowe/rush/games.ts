import type { GameDef } from './types';
import { ScreenHeightGame } from './games/screen-height-game';
import { FoldersGame } from './games/folders-game';
import { PopupGame } from './games/popup-game';
import { ShrinkGame } from './games/shrink-game';
import { MarksGame } from './games/marks-game';
import { DrawersGame } from './games/drawers-game';
import { DirectionGame } from './games/direction-game';
import { LabelsGame } from './games/labels-game';
import { StandbyGame } from './games/standby-game';

/**
 * Dziewięć mikro-gier — po jednej na dział roku (0–8), w kolejności kursu.
 * Każda odtwarza w miniaturze **gest**, którym dziecko rozwiązywało
 * odpowiednią lekcję, i nie tłumaczy go od nowa: podaje tylko okrzyk i jedno
 * zdanie o celu. Kto lekcję zrobił, ręce pamiętają; kto nie — dostaje po grze
 * zdanie z wyjaśnieniem (`reveal`) i link do działu.
 */
export const GAMES: GameDef[] = [
  {
    id: 'ekran',
    n: 0,
    cue: 'USTAW EKRAN!',
    how: 'Przesuń monitor tak, żeby dało się przy nim pracować bez zadzierania głowy.',
    seconds: 12,
    reveal:
      'Górna krawędź ekranu ma stać na wysokości oczu albo do 10 cm niżej — wzrok pada wtedy lekko w dół, jak przy czytaniu książki.',
    Game: ScreenHeightGame,
  },
  {
    id: 'foldery',
    n: 1,
    cue: 'DO FOLDERÓW!',
    how: 'Przeciągnij każdy plik do folderu, w którym jest jego miejsce.',
    seconds: 12,
    reveal:
      'Rodzaj pliku zdradza jego rozszerzenie: .jpg i .png to obrazy, .docx i .odt to dokumenty, .mp3 i .wav to muzyka.',
    Game: FoldersGame,
  },
  {
    id: 'okno',
    n: 2,
    cue: 'ZAMKNIJ!',
    how: 'Na ekranie wyskoczyło okno z „nagrodą”. Zrób to, co trzeba.',
    seconds: 8,
    reveal:
      'Zamykasz okno małym krzyżykiem, niczego w nim nie klikasz — i mówisz o tym dorosłemu. Nagroda za jedno kliknięcie to prawie zawsze pułapka.',
    Game: PopupGame,
  },
  {
    id: 'obrazek',
    n: 3,
    cue: 'POMNIEJSZ!',
    how: 'Zmniejsz obrazek mniej więcej o połowę. Słońce ma zostać okrągłe.',
    seconds: 12,
    reveal:
      'Uchwyt narożny zmienia szerokość i wysokość osobno. Ciągnij tak, żeby oba wymiary malały razem — inaczej rysunek się rozciągnie.',
    Game: ShrinkGame,
  },
  {
    id: 'enter',
    n: 4,
    cue: 'ZNAJDŹ ENTER!',
    how: 'W tekście siedzą dwa błędy, których nie widać. Znajdź je i usuń.',
    seconds: 15,
    reveal:
      'Włącz znaki niedrukowane ¶. Dopiero wtedy widać zbędny Enter w środku zdania i dwie kropki zamiast jednej.',
    Game: MarksGame,
  },
  {
    id: 'szuflady',
    n: 5,
    cue: 'SZUKAJ!',
    how: 'Liczby w szufladach rosną. Znajdź szukaną kartkę w czterech otwarciach.',
    seconds: 15,
    reveal:
      'Zaczynasz od środka i po każdym otwarciu odrzucasz połowę szuflad. Cztery otwarcia wystarczą na piętnaście — bo liczby leżą po kolei.',
    Game: DrawersGame,
  },
  {
    id: 'kierunek',
    n: 6,
    cue: 'SKRĘĆ I IDŹ!',
    how: 'Kot idzie tam, gdzie patrzy nos. Obróć go do flagi i wyślij.',
    seconds: 12,
    reveal:
      'Najpierw ustawiasz kierunek, dopiero potem każesz iść — kroki zawsze biegną tam, gdzie patrzy duszek.',
    Game: DirectionGame,
  },
  {
    id: 'etykieta',
    n: 7,
    cue: 'ZŁA ETYKIETA!',
    how: 'Jeden przykład leży w złej tacy. Popraw dane maszyny.',
    seconds: 10,
    reveal:
      'Model uczy się z przykładów, więc źle podpisany przykład uczy go źle. Poprawiasz dane — przenosisz kartę do właściwej tacy, a nie „poprawiasz” maszynę.',
    Game: LabelsGame,
  },
  {
    id: 'czuwanie',
    n: 8,
    cue: 'WYŁĄCZ CZUWANIE!',
    how: 'Jest noc. Wyłącz to, co świeci lampką czuwania.',
    seconds: 10,
    reveal:
      'Wyłączasz urządzenia z lampką czuwania (telewizor, dekoder, mikrofalówka). Lodówka pracuje, a nie czuwa, więc zostaje. Czajnik w nocy nic nie bierze — nikt go nie włączył.',
    Game: StandbyGame,
  },
];
