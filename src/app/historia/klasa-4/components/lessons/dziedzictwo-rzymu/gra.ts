/**
 * Blok 4 — gra „Spacer po Rzymie w 44 r. p.n.e.” (doświadczenie edukacyjne 2a).
 * Czysta logika, bez Reacta.
 *
 * Scena jest rysowana kodem, więc wiemy dokładnie, co na niej jest: 7 anachronizmów
 * i 6 rzeczy, które do roku 44 p.n.e. pasują. Dziecko stuka podejrzaną rzecz
 * i wybiera powód z czterech kategorii; sędzią jest kategoria przypisana rzeczy
 * z jej datą (komentarz przy każdej).
 */

export type Reason = 'pozniej' | 'ameryka' | 'sredniowiecze' | 'biedni';

export const REASONS: { id: Reason; label: string }[] = [
  { id: 'pozniej', label: 'Za wcześnie — powstanie później, jeszcze w starożytności' },
  { id: 'ameryka', label: 'Przyjechało z Ameryki — po 1492 roku' },
  { id: 'sredniowiecze', label: 'Wymyślono to dopiero w średniowieczu' },
  { id: 'biedni', label: 'Tego nie mieli zwykli ludzie w Rzymie' },
];

export interface Thing {
  id: string;
  name: string;
  /** Pozycja w panoramie (środek, w jednostkach sceny). */
  x: number;
  reason: Reason | null;
  fact: string;
}

export const THINGS: Thing[] = [
  { id: 'akwedukt', name: 'akwedukt w tle', x: 90, reason: null, fact: 'Pasuje: akwedukty doprowadzały wodę do Rzymu od IV w. p.n.e., Aqua Marcia od 144 p.n.e.' },
  { id: 'szyby', name: 'szyby w oknach kamienicy', x: 230, reason: 'biedni', fact: 'Zwykła kamienica (insula) nie miała szyb — okna zamykano drewnianymi okiennicami. Szkło w oknach pojawiło się w I w. n.e. i tylko u bogatych.' },
  { id: 'cyfry', name: 'szyld z liczbą „25”', x: 360, reason: 'sredniowiecze', fact: 'Rzymianie pisali XXV. Cyfry 1, 2, 3… przyszły do Europy z Indii przez Arabów dopiero w średniowieczu.' },
  { id: 'chleb', name: 'okrągłe bochenki chleba', x: 455, reason: null, fact: 'Pasuje: takie okrągłe, podzielone na kawałki bochenki znaleziono w Pompejach.' },
  { id: 'pomidory', name: 'kosz pomidorów', x: 505, reason: 'ameryka', fact: 'Pomidory rosły tylko w Ameryce — do Europy przywieziono je w XVI wieku.' },
  { id: 'toga', name: 'mężczyzna w todze', x: 600, reason: null, fact: 'Pasuje: toga to strój obywatela rzymskiego.' },
  { id: 'strzemiona', name: 'jeździec w strzemionach', x: 710, reason: 'sredniowiecze', fact: 'Rzymscy jeźdźcy jeździli bez strzemion. Strzemiona dotarły do Europy ok. VI–VIII w. n.e.' },
  { id: 'swiatynia', name: 'świątynia z kolumnami i napisem SPQR', x: 840, reason: null, fact: 'Pasuje: świątynie stały wszędzie, a SPQR — „senat i lud rzymski” — było podpisem państwa.' },
  { id: 'koloseum', name: 'Koloseum w oddali', x: 960, reason: 'pozniej', fact: 'Koloseum otwarto w 80 r. n.e. — 124 lata po tym spacerze.' },
  { id: 'krzyz', name: 'kościół z krzyżem', x: 1070, reason: 'pozniej', fact: 'Chrześcijaństwo narodzi się kilkadziesiąt lat później, a kościoły w Rzymie zaczęto budować w IV w. n.e.' },
  { id: 'zegar', name: 'zegar na wieży', x: 1180, reason: 'sredniowiecze', fact: 'Zegary z tarczą i wskazówkami wymyślono w średniowieczu. Rzymianie mieli słoneczne i wodne.' },
  { id: 'amfory', name: 'amfory przy straganie', x: 1280, reason: null, fact: 'Pasuje: w amforach wożono wino, oliwę i sos rybny.' },
  { id: 'fontanna', name: 'fontanna z wodą', x: 1360, reason: null, fact: 'Pasuje: z publicznych fontann ludzie nosili wodę do domów.' },
];

export const SCENE_W = 1440;
export const ANACHRONISMS = THINGS.filter((t) => t.reason !== null).length;

export type TapResult =
  | { kind: 'pasuje'; fact: string }
  | { kind: 'anachronizm'; thing: Thing };

export function tapThing(id: string): TapResult {
  const t = THINGS.find((x) => x.id === id)!;
  return t.reason ? { kind: 'anachronizm', thing: t } : { kind: 'pasuje', fact: t.fact };
}

export type ReasonVerdict = { ok: true; fact: string } | { ok: false; message: string };

export function judgeReason(id: string, reason: Reason): ReasonVerdict {
  const t = THINGS.find((x) => x.id === id)!;
  if (t.reason === reason) return { ok: true, fact: t.fact };
  const hints: Record<Reason, string> = {
    pozniej: 'Zastanów się, czy to w ogóle starożytność.',
    ameryka: 'Czy to rośnie albo pochodzi z Ameryki?',
    sredniowiecze: 'Czy to naprawdę wymyślono aż w średniowieczu?',
    biedni: 'Czy chodzi o to, kto był bogaty, czy o to, kiedy to wymyślono?',
  };
  return { ok: false, message: `Tak, ${t.name} tu nie pasuje — ale z innego powodu. ${hints[reason]}` };
}

/** Kafelki oceny gry (doświadczenie 2a): co oddaje dobrze, w czym się myli. */
export const GOOD = ['stroje — togi', 'jedzenie — chleb i amfory', 'akwedukty i fontanny', 'świątynie'];
export const BAD = ['miesza epoki', 'pokazuje rzeczy z Ameryki', 'wynalazki ze średniowiecza', 'bogactwo dla wszystkich'];
