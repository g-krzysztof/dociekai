import type { ProofVerdicts } from '@/components/block-lesson/task-shell';

/**
 * L13, blok 4 — „Czy metoda działa gdzie indziej?”. Wymyślona wieś Olszynka.
 * Kuzyn z miasta twierdzi, że „tu nie ma żadnej historii”, i zadaje pięć
 * zwykłych pytań; dziecko odpowiada, wskazując miejsce na planie wsi.
 *
 * Sędzia nie ma klucza „to miejsce jest właściwe”: każde miejsce ma fakty,
 * które widać w jego zbliżeniu (rok, zawód, właściciel, czyje imię, jakie
 * nieszczęście, czy to, o czym mówi, jeszcze stoi), a każde pytanie czyta
 * tylko te fakty. „Najstarsza data” liczy się z lat na wszystkich miejscach.
 * Pytania pokrywają trzy rodzaje śladów z karty: budynek, nazwę i pamiątkę.
 */

export type VillageId =
  | 'kosciol'
  | 'kapliczka'
  | 'dworek'
  | 'dworska'
  | 'kowalska'
  | 'mlyn'
  | 'cmentarz'
  | 'szkola'
  | 'przystanek'
  | 'boisko'
  | 'sklep'
  | 'nowy-dom';

export interface VillageThing {
  id: VillageId;
  label: string;
  x: number;
  y: number;
  zoom: string;
  /** Co ten ślad mówi o przeszłości — jednym zdaniem. Brak = wabik. */
  tells?: string;
  /** Rok wypisany na śladzie. */
  year?: number;
  /** Ślad mówi, z jakiej pracy żyli ludzie. */
  work?: boolean;
  /** Ślad pamięta coś, czego dziś już nie ma. */
  gone?: boolean;
  /** Ślad nosi imię człowieka, którego mieszkańcy chcą pamiętać. */
  person?: boolean;
  /** Ślad pamięta nieszczęście, które spotkało wieś. */
  misfortune?: boolean;
  /** Dla wabika: dlaczego nic nie mówi o dawnych czasach. */
  hint?: string;
}

export const VILLAGE: VillageThing[] = [
  {
    id: 'kosciol',
    label: 'Kościół',
    x: 300,
    y: 118,
    zoom: 'Drewniany kościół z dachem z gontu. Nad drzwiami wyrzeźbiono rok 1712.',
    tells: 'kościół stoi tu od 1712 roku',
    year: 1712,
  },
  {
    id: 'kapliczka',
    label: 'Kapliczka',
    x: 132,
    y: 292,
    zoom: 'Biała kapliczka przy polnej drodze. Na tabliczce: „1855 — za ocalenie od cholery”. Cholera to groźna choroba zakaźna.',
    tells: 'w 1855 roku okolicę nawiedziła cholera, a mieszkańcy dziękowali za ocalenie',
    year: 1855,
    misfortune: true,
  },
  {
    id: 'dworek',
    label: 'Dworek',
    x: 488,
    y: 104,
    zoom: 'Parterowy dworek z kolumnami przed wejściem, dookoła stary park z lipami. Mieszkał tu kiedyś właściciel ziemi, na której leży wieś.',
    tells: 'wieś należała kiedyś do właściciela ziemskiego',
  },
  {
    id: 'dworska',
    label: 'ul. Dworska',
    x: 404,
    y: 166,
    zoom: 'Tabliczka: „ul. Dworska”. Droga prowadzi od kościoła do dworku — dworek stoi do dziś.',
    tells: 'droga prowadziła do dworu, który stoi do dziś',
  },
  {
    id: 'kowalska',
    label: 'ul. Kowalska',
    x: 196,
    y: 206,
    zoom: 'Tabliczka: „ul. Kowalska”. Kuźni nigdzie nie ma — stoją tu zwykłe domy.',
    tells: 'kiedyś pracował tu kowal: podkuwał konie i robił narzędzia dla całej wsi',
    work: true,
    gone: true,
  },
  {
    id: 'mlyn',
    label: 'Młyn',
    x: 92,
    y: 344,
    zoom: 'Drewniany młyn nad rzeczką. Koło już się nie kręci, ale w środku leżą kamienie młyńskie do mielenia zboża.',
    tells: 'rolnicy uprawiali zboże i mielili je tu na mąkę',
    work: true,
  },
  {
    id: 'cmentarz',
    label: 'Stary cmentarz',
    x: 540,
    y: 286,
    zoom: 'Stary cmentarz z kamiennymi nagrobkami. Najstarszy, który da się odczytać, ma rok 1831.',
    tells: 'ludzie żyli i umierali tu już w 1831 roku',
    year: 1831,
  },
  {
    id: 'szkola',
    label: 'Szkoła',
    x: 330,
    y: 262,
    zoom: 'Nad wejściem: „Szkoła Podstawowa im. dr Zofii Brzozowskiej”. Tablica obok: lekarka, która przez czterdzieści lat leczyła mieszkańców wsi, często za darmo (postać wymyślona).',
    tells: 'mieszkańcy pamiętają lekarkę, która przez lata leczyła całą wieś',
    person: true,
  },
  {
    id: 'przystanek',
    label: 'Przystanek',
    x: 250,
    y: 352,
    zoom: 'Wiata przystanku autobusowego. Postawiona kilka lat temu.',
    hint: 'Przystanek postawiono kilka lat temu — o dawnych czasach nic nie mówi.',
  },
  {
    id: 'boisko',
    label: 'Boisko',
    x: 440,
    y: 330,
    zoom: 'Prostokątne boisko ze sztuczną trawą, otwarte kilka lat temu.',
    hint: 'Boisko otwarto kilka lat temu — o dawnych czasach nic nie mówi.',
  },
  {
    id: 'sklep',
    label: 'Sklep',
    x: 176,
    y: 128,
    zoom: 'Mały sklep spożywczy z nowym szyldem.',
    hint: 'Zwykły sklep, otwarty niedawno — nie pamięta dawnych czasów.',
  },
  {
    id: 'nowy-dom',
    label: 'Nowy dom',
    x: 526,
    y: 196,
    zoom: 'Dom z garażem, zbudowany trzy lata temu.',
    hint: 'Ten dom stoi dopiero od trzech lat — nie jest śladem przeszłości.',
  },
];

export const getVillage = (id: VillageId) => VILLAGE.find((v) => v.id === id)!;

/** Najstarszy rok wypisany na czymkolwiek we wsi. */
export const OLDEST_YEAR = Math.min(...VILLAGE.flatMap((v) => (v.year ? [v.year] : [])));

export type QuestionId = 'wiek' | 'praca' | 'zniklo' | 'pamiec' | 'nieszczescie';

export interface Question {
  id: QuestionId;
  /** Pytanie Antka — pełne. */
  text: string;
  /** Na przycisk. */
  short: string;
  /** Na co patrzeć we wsi — bez wskazywania miejsca. */
  tip: string;
  /** Czy miejsce odpowiada na pytanie — czyta wyłącznie fakty miejsca. */
  answers: (v: VillageThing) => boolean;
  /** Reakcja Antka, gdy odpowiedź pasuje. */
  reply: (v: VillageThing) => string;
}

export const QUESTIONS: Question[] = [
  {
    id: 'wiek',
    text: 'Ile lat ma ta wieś? Pokaż mi najstarszą datę, jaką tu znajdziesz.',
    short: 'Ile lat ma wieś?',
    tip: 'Daty bywają wyryte nad drzwiami, na tabliczkach i na nagrobkach. Obejrzyj kilka miejsc i porównaj lata.',
    answers: (v) => v.year === OLDEST_YEAR,
    reply: (v) => `${v.label}, rok ${v.year}. Antek liczy na palcach: „To ponad trzysta lat! Starsze niż moje osiedle”.`,
  },
  {
    id: 'praca',
    text: 'Z czego ludzie tu dawniej żyli? Co robili?',
    short: 'Z czego żyli?',
    tip: 'Szukaj starego budynku, w którym się pracowało, albo ulicy nazwanej od zawodu.',
    answers: (v) => v.work === true,
    reply: (v) => `${v.label}: ${v.tells}. Antek: „Czyli nie same pola — była tu robota”.`,
  },
  {
    id: 'zniklo',
    text: 'Co było tu kiedyś, a dziś tego nie zobaczysz?',
    short: 'Co zniknęło?',
    tip: 'Nazwa ulicy czasem pamięta coś, czego już nie widać. Sprawdź, czy to, od czego ją nazwano, jeszcze stoi.',
    answers: (v) => v.gone === true,
    reply: (v) => `${v.label}: ${v.tells}. Antek: „Kuźni nie ma, a nazwa została. Sprytne”.`,
  },
  {
    id: 'pamiec',
    text: 'Kogo mieszkańcy chcą tu pamiętać?',
    short: 'Kogo pamiętają?',
    tip: 'Szukaj czyjegoś imienia — na budynku, tablicy albo pomniku.',
    answers: (v) => v.person === true,
    reply: (v) => `${v.label}: ${v.tells}. Antek: „U nas szkoła ma numer, a nie czyjeś imię”.`,
  },
  {
    id: 'nieszczescie',
    text: 'Czy wieś spotkało kiedyś coś złego?',
    short: 'Co złego się stało?',
    tip: 'Szukaj napisu, który mówi, za co mieszkańcy komuś dziękowali.',
    answers: (v) => v.misfortune === true,
    reply: (v) => `${v.label}: ${v.tells}. Antek poważnieje: „To było naprawdę”.`,
  },
];

export const getQuestion = (id: QuestionId) => QUESTIONS.find((q) => q.id === id)!;

/** Odpowiedzi dziecka: pytanie → wskazane miejsce. */
export type Answers = Partial<Record<QuestionId, VillageId>>;

export function answerOk(q: QuestionId, place: VillageId): boolean {
  return getQuestion(q).answers(getVillage(place));
}

/** Dlaczego wskazane miejsce nie odpowiada — z faktów miejsca, bez klucza. */
export function whyNot(q: QuestionId, place: VillageId): string {
  const v = getVillage(place);
  if (!v.tells) return v.hint ?? `${v.label} nic nie mówi o dawnych czasach.`;
  if (q === 'wiek' && v.year)
    return `${v.label} ma rok ${v.year}, więc wieś jest co najmniej tak stara — ale gdzieś we wsi jest starsza data. Obejrzyj inne miejsca.`;
  if (q === 'wiek') return `${v.label} to ślad przeszłości, ale nie ma na nim żadnej daty.`;
  if (q === 'zniklo' && place === 'dworska')
    return 'Ulica Dworska prowadzi do dworku, a dworek stoi do dziś — ta nazwa nie pamięta niczego, co zniknęło.';
  return `${v.label} to prawdziwy ślad, ale mówi o czymś innym: ${v.tells}.`;
}

/** Werdykt zadania: po jednym na każde pytanie Antka. */
export function judgeVillage(answers: Answers): ProofVerdicts {
  const verdicts: ProofVerdicts = {};
  for (const q of QUESTIONS) {
    const place = answers[q.id];
    verdicts[q.id] = !place
      ? { ok: false, note: 'Na to pytanie jeszcze nie odpowiedziałeś/łaś — wybierz je i stuknij miejsce na planie.' }
      : answerOk(q.id, place)
        ? { ok: true, note: q.reply(getVillage(place)) }
        : { ok: false, note: whyNot(q.id, place) };
  }
  return verdicts;
}
