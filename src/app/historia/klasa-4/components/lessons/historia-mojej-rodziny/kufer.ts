/**
 * Blok 3 — „Kufer pamiątek” (źródło) — dane i sędziowie, bez Reacta.
 *
 * Cztery przedmioty pradziadka Franka, Wincentego Lisieckiego (ur. 1924) —
 * rodzina z bloku 2, **wymyślona na potrzeby lekcji**
 * (przedmioty są rysunkiem, nie fotografiami). Napisy są tak drobne, że
 * czyta się je dopiero lupą (silnik `source-desk`, wspólna lupa
 * `LupaPlane`).
 *
 * Co zgadza się ze sobą (żeby źródła się potwierdzały, jak w L3):
 *  - Wincenty ur. 1924 (legitymacja), Józef ur. 1950 (drzewo z bloku 2),
 *  - list z 3 maja 1952 r.: „Józek kończy dziś dwa lata” → 1952 − 2 = 1950,
 *  - zegarek 1971 r. „za 25 lat pracy” → praca od 1946 r.; legitymacja z 1948 r.
 *    nie przeczy (zawód wykonywał już wcześniej jako czeladnik),
 *  - medal z biegu 1949 r. — Wincenty miał 25 lat.
 */

export type ChestId = 'zegarek' | 'legitymacja' | 'medal' | 'list';

export interface ChestItem {
  id: ChestId;
  /** Co to jest — pierwsza rubryka karty muzealnej. */
  what: string;
  /** Rubryka „co mówi”: wniosek, który wolno wyciągnąć z napisu. */
  says: string;
  /** Pytanie o rok — odpowiedź jest na przedmiocie, widoczna tylko przez lupę. */
  question: string;
  hint: string;
  year: number;
  /** Zdanie opowieści; `{y}` zastępuje rok odczytany przez dziecko. */
  story: string;
  /** Pomyłki, które mają konkretny powód (rok-wabik na przedmiocie itp.). */
  wrong: Record<number, string>;
}

export const CHEST: ChestItem[] = [
  {
    id: 'zegarek',
    what: 'zegarek kieszonkowy (odwrót koperty z grawerem)',
    says: 'Dostał go w podziękowaniu za 25 lat pracy w zakładzie zegarmistrzowskim.',
    question: 'W którym roku zakład podziękował Wincentemu? Rok jest na końcu grawerunku.',
    hint: 'Przesuwaj lupę po odwrocie koperty — napis jest na środku, w kilku wierszach.',
    year: 1971,
    story: 'W {y} roku zakład zegarmistrzowski podziękował mu zegarkiem za 25 lat pracy.',
    wrong: {
      25: '25 to liczba lat pracy, a pytanie dotyczy roku, w którym wręczono zegarek — szukaj ostatniego wiersza grawerunku.',
    },
  },
  {
    id: 'legitymacja',
    what: 'legitymacja cechu zegarmistrzów',
    says: 'Wincenty Lisiecki, urodzony w 1924 roku, był zegarmistrzem.',
    question: 'Kiedy legitymację wydano? Uwaga: na niej jest więcej niż jedna data.',
    hint: 'Szukaj słowa „wydana” — zwykle stoi na samym dole.',
    year: 1948,
    story: 'W {y} roku dostał legitymację i mógł pracować jako zegarmistrz.',
    wrong: {
      1924: 'To rok urodzenia Wincentego (stoi przy jego nazwisku), a pytanie jest o to, kiedy wydano legitymację.',
    },
  },
  {
    id: 'medal',
    what: 'medal sportowy na wstążce',
    says: 'Wincenty biegał — wygrał bieg na 5 kilometrów.',
    question: 'W którym roku odbył się bieg?',
    hint: 'Napis jest na samym medalu, nie na wstążce.',
    year: 1949,
    story: 'W {y} roku wygrał bieg na 5 kilometrów — był nie tylko rzemieślnikiem, ale i sportowcem.',
    wrong: {
      5: '5 to długość trasy w kilometrach — szukaj czterocyfrowego roku.',
    },
  },
  {
    id: 'list',
    what: 'list napisany ręcznie',
    says: 'Pisał z podróży do żony Stanisławy; wspomina syna Józka, który kończy dwa lata.',
    question: 'Z którego roku jest list? Data stoi w jego rogu.',
    hint: 'Data w liście zwykle stoi na samej górze, z prawej strony.',
    year: 1952,
    story: 'W {y} roku pisał z podróży do żony Stanisławy i pamiętał o urodzinach syna Józka.',
    wrong: {},
  },
];

/** Dodatkowe pytanie przy liście: źródło potwierdza drzewo z bloku 2. */
export const LIST_CROSSCHECK = {
  question: 'W liście Józek kończy dwa lata. W którym roku się urodził? Policz od roku listu.',
  answer: 1950,
  wrong: 'Józek ma w liście dwa lata, a list jest z 1952 roku — urodził się dwa lata wcześniej niż napisano list.',
  note: 'Józef urodził się w 1950 roku — dokładnie tak, jak stoi na drzewie rodziny z poprzedniego bloku. Dwa różne źródła mówią to samo, więc można im ufać.',
};

export interface YearVerdict {
  ok: boolean;
  note?: string;
}

/** Sędzia odczytu: sprawdza liczbę, a pomyłki ze znanym powodem nazywa konkretem. */
export function judgeYear(item: ChestItem, raw: string): YearVerdict {
  const text = raw.trim();
  if (!/^\d+$/.test(text)) return { ok: false, note: 'Wpisz samą liczbę — rok z napisu.' };
  const value = Number(text);
  if (value === item.year) return { ok: true };
  const known = item.wrong[value];
  if (known) return { ok: false, note: known };
  if (text.length !== 4) return { ok: false, note: 'Rok ma cztery cyfry. Przeczytaj napis lupą jeszcze raz.' };
  return { ok: false, note: 'Takiego roku nie ma na tym przedmiocie. Przesuń lupę po całym napisie i przeczytaj każdy wiersz.' };
}

export function judgeCrosscheck(raw: string): YearVerdict {
  const text = raw.trim();
  if (!/^\d{4}$/.test(text)) return { ok: false, note: 'Wpisz rok — cztery cyfry.' };
  return Number(text) === LIST_CROSSCHECK.answer ? { ok: true } : { ok: false, note: LIST_CROSSCHECK.wrong };
}

export interface OrderVerdict {
  ok: boolean;
  note?: string;
}

/**
 * Sędzia opowieści: karty układa się od najdawniejszej. Porównuje **lata
 * z kart dziecka**, a nie tablicę z gotową kolejnością.
 */
export function judgeStoryStep(
  years: Partial<Record<ChestId, number>>,
  picked: ChestId[],
  next: ChestId
): OrderVerdict {
  const remaining = (Object.keys(years) as ChestId[]).filter((id) => !picked.includes(id));
  const older = remaining.filter((id) => (years[id] as number) < (years[next] as number));
  if (older.length === 0) return { ok: true };
  const earliest = older.reduce((a, b) => ((years[b] as number) < (years[a] as number) ? b : a));
  const item = CHEST.find((c) => c.id === earliest)!;
  return {
    ok: false,
    note: `Ta karta jest z ${years[next]} roku, a w kufrze została starsza — z ${years[earliest]} roku (${item.what.split(' (')[0]}). Opowieść idzie od najdawniejszego.`,
  };
}
