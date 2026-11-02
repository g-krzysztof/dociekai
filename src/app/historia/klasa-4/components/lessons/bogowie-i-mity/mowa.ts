/**
 * Blok 3 — mitologia w naszej mowie. Sześć wyrażeń i sześć zdań z dzisiejszego
 * życia. Znaczenia są jednoznaczne (słownikowe), więc sędzią jest znaczenie
 * wyrażenia, nie klucz autora: odrzut mówi, co wyrażenie znaczy i czego
 * potrzebuje zdanie. Mity streszczone własnymi słowami, w wersji dla dzieci.
 */

export interface Phrase {
  id: string;
  text: string;
  /** Co wyrażenie znaczy dziś. */
  meaning: string;
  /** Skąd się wzięło — mit opowiedziany po trafieniu. */
  myth: string;
}

export interface Sentence {
  id: string;
  /** Zdanie z luką `___`. */
  text: string;
  /** Wyrażenie, które pasuje. */
  answer: string;
  /** Czego zdanie potrzebuje — do odrzutu. */
  need: string;
}

export const PHRASES: Phrase[] = [
  {
    id: 'syzyf',
    text: 'syzyfowa praca',
    meaning: 'praca, która nie ma końca i nic nie daje',
    myth: 'Król Syzyf oszukał bogów, więc dostał karę: musi wtaczać na wysoką górę ogromny głaz. Gdy jest już prawie na szczycie, kamień stacza się w dół — i wszystko zaczyna się od nowa. Bez końca.',
  },
  {
    id: 'piet',
    text: 'pięta achillesowa',
    meaning: 'słaby punkt kogoś, kto poza tym jest bardzo mocny',
    myth: 'Matka Achillesa zanurzyła synka w czarodziejskiej rzece Styks, żeby nic nie mogło go zranić. Trzymała go jednak za piętę — i tylko pięta nie zamoczyła się w wodzie. Wiele lat później, pod Troją, strzała trafiła Achillesa właśnie tam.',
  },
  {
    id: 'kon',
    text: 'koń trojański',
    meaning: 'podstęp ukryty w czymś, co wygląda jak prezent',
    myth: 'Grecy przez dziesięć lat nie mogli zdobyć Troi. Zbudowali więc wielkiego drewnianego konia, ukryli w nim żołnierzy i zostawili pod murami jak dar. Trojanie wciągnęli konia do miasta, a w nocy Grecy wyszli ze środka i otworzyli bramy.',
  },
  {
    id: 'stajnia',
    text: 'stajnia Augiasza',
    meaning: 'miejsce, w którym panuje ogromny bałagan',
    myth: 'Król Augiasz miał wielkie stado krów, a jego stajni nie sprzątano od lat. Herakles wyczyścił je w jeden dzień: przekopał rowy i puścił przez stajnie dwie rzeki.',
  },
  {
    id: 'nic',
    text: 'nić Ariadny',
    meaning: 'coś, co pomaga wyjść z zagmatwanej sytuacji',
    myth: 'Królewna Ariadna dała Tezeuszowi kłębek nici. Rozwijał go, idąc przez labirynt, a potem wrócił po nim do wyjścia — sprawdziłeś/łaś to przed chwilą.',
  },
  {
    id: 'puszka',
    text: 'puszka Pandory',
    meaning: 'coś, co uruchamia całą lawinę kłopotów',
    myth: 'Bogowie dali Pandorze zamkniętą puszkę i zakazali jej zaglądać do środka. Ciekawość wygrała: Pandora uchyliła wieczko, a na świat wyleciały choroby, kłótnie i smutki. Na dnie została tylko nadzieja.',
  },
];

export const SENTENCES: Sentence[] = [
  {
    id: 's-szachy',
    text: 'Kuba świetnie gra w szachy, ale końcówki partii to jego ___.',
    answer: 'piet',
    need: 'jedyny słaby punkt mocnego gracza',
  },
  {
    id: 's-gra',
    text: 'Darmowa gra z nieznanej strony to był ___: razem z nią na komputer wszedł wirus.',
    answer: 'kon',
    need: 'podstęp schowany w „prezencie”',
  },
  {
    id: 's-piwnica',
    text: 'Po urodzinach w piwnicy była prawdziwa ___ — sprzątaliśmy cały dzień.',
    answer: 'stajnia',
    need: 'ogromny bałagan',
  },
  {
    id: 's-zamek',
    text: 'Budowanie zamku z piasku tuż przy wodzie to ___: fala zabiera go co chwilę, a ty zaczynasz od nowa.',
    answer: 'syzyf',
    need: 'pracę, która się nie kończy',
  },
  {
    id: 's-muzeum',
    text: 'W wielkim muzeum zgubiliśmy drogę. Strzałki na podłodze były dla nas jak ___ — doprowadziły nas do wyjścia.',
    answer: 'nic',
    need: 'coś, co wyprowadza z zagmatwanej sytuacji',
  },
  {
    id: 's-klotnia',
    text: 'Pytanie „kto zaczął?” to była prawdziwa ___: każdy przypomniał sobie inną krzywdę i kłótnia tylko urosła.',
    answer: 'puszka',
    need: 'coś, co wypuszcza lawinę kłopotów',
  },
];

export type MowaVerdict = { ok: true } | { ok: false; message: string };

export function judgePhrase(phraseId: string, sentenceId: string): MowaVerdict {
  const phrase = PHRASES.find((p) => p.id === phraseId);
  const sentence = SENTENCES.find((s) => s.id === sentenceId);
  if (!phrase || !sentence) return { ok: false, message: 'Nie ma takiego wyrażenia albo zdania.' };
  if (sentence.answer === phrase.id) return { ok: true };
  return {
    ok: false,
    message: `„${phrase.text}” znaczy: ${phrase.meaning}. A to zdanie potrzebuje słów na ${sentence.need}.`,
  };
}
