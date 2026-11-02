/**
 * Blok 4 — „Przepytaj domownika” (zadanie) — bank pytań i sędziowie, bez Reacta.
 *
 * Dziecko układa **trzy pytania do wywiadu** z bliskim dorosłym. Werdykt
 * sprawdza **strukturę** zestawu (decyzja programowa: wolnego tekstu
 * nie oceniamy po treści): czy są trzy, czy któreś pyta o czas (żeby z rozmowy
 * wyszła data), czy któreś zaprasza do opowieści (nie da się na nie odpowiedzieć
 * „tak” albo „nie”) i czy któreś pyta o ślad — pamiątkę albo zdjęcie
 * (F-I.3-01, F-I.3-04). Własne pytanie jest sprawdzane tylko pod względem formy.
 */

import type { PersonalPins, PersonalRole } from '../../../lib/timeline/personal-storage';

export type QuestionTag = 'czas' | 'otwarte' | 'slad';

export interface InterviewQuestion {
  id: string;
  text: string;
  tags: QuestionTag[];
}

/** Bank: część pytań dobra, część zamknięta (tak/nie) — dziecko widzi różnicę po sformułowaniu. */
export const QUESTION_BANK: InterviewQuestion[] = [
  { id: 'urodziny', text: 'W którym roku się urodziłaś/eś i gdzie wtedy mieszkała nasza rodzina?', tags: ['czas', 'otwarte'] },
  { id: 'szkola', text: 'Czy lubiłaś/eś szkołę?', tags: [] },
  { id: 'dzien', text: 'Jak wyglądał twój zwykły dzień, kiedy byłaś/eś w moim wieku?', tags: ['otwarte'] },
  { id: 'pamiatka', text: 'Jaką pamiątkę z dawnych lat masz do dziś i skąd ją masz?', tags: ['slad', 'otwarte'] },
  { id: 'pies', text: 'Czy miałaś/eś w dzieciństwie psa?', tags: [] },
  { id: 'zdjecia', text: 'Czy ktoś w rodzinie zachował stare zdjęcia albo listy?', tags: ['slad'] },
  { id: 'dlaczego', text: 'Dlaczego nasza rodzina mieszka tam, gdzie mieszka?', tags: ['otwarte'] },
  { id: 'tradycja', text: 'Jaką tradycję rodzinną pamiętasz z dzieciństwa i kiedy ostatnio ją obchodziliśmy?', tags: ['otwarte', 'czas'] },
  { id: 'najstarszy', text: 'Czy pamiętasz swoich dziadków?', tags: [] },
];

export const OWN_ID = 'wlasne';

const OPEN_STARTS = ['jak', 'jaki', 'jaka', 'jakie', 'jakiej', 'dlaczego', 'co', 'kto', 'gdzie', 'kiedy', 'ile', 'opowiedz', 'skąd', 'w którym', 'od kiedy', 'po co'];
const TIME_STARTS = ['kiedy', 'w którym roku', 'od kiedy', 'ile lat'];

/** Forma własnego pytania: pytanie z „?”, co najmniej cztery słowa. */
export function ownQuestionForm(text: string): { valid: boolean; tags: QuestionTag[]; problem?: string } {
  const t = text.trim();
  if (!t) return { valid: false, tags: [] };
  const words = t.split(/\s+/).filter(Boolean);
  if (!t.endsWith('?')) return { valid: false, tags: [], problem: 'Własne pytanie powinno kończyć się znakiem zapytania.' };
  if (words.length < 4) return { valid: false, tags: [], problem: 'Własne pytanie jest za krótkie — rozmówca nie będzie wiedział, o co pytasz (min. 4 słowa).' };
  const lower = t.toLowerCase();
  const tags: QuestionTag[] = [];
  if (OPEN_STARTS.some((s) => lower.startsWith(s))) tags.push('otwarte');
  if (TIME_STARTS.some((s) => lower.startsWith(s))) tags.push('czas');
  return { valid: true, tags };
}

export const INTERVIEW_CRITERIA = [
  { id: 'trzy', label: 'Masz dokładnie trzy pytania (własne też się liczy).' },
  { id: 'czas', label: 'Co najmniej jedno pyta o czas — żeby z rozmowy wyszedł rok.' },
  { id: 'otwarte', label: 'Co najmniej jedno zaprasza do opowieści — nie da się na nie odpowiedzieć samym „tak” albo „nie”.' },
  { id: 'slad', label: 'Co najmniej jedno pyta o ślad: pamiątkę, zdjęcie albo list.' },
];

export interface InterviewData {
  /** Pytania w kolejności, w jakiej trafią na kartę. */
  questions: string[];
}

export interface InterviewVerdict {
  ok: boolean;
  note: string;
}

export function judgeInterview(
  chosenIds: string[],
  own: string
): { verdicts: Record<string, InterviewVerdict>; data: InterviewData } {
  const chosen = chosenIds
    .map((id) => QUESTION_BANK.find((q) => q.id === id))
    .filter((q): q is InterviewQuestion => Boolean(q));
  const ownForm = ownQuestionForm(own);
  const ownText = own.trim();

  const all: { text: string; tags: QuestionTag[] }[] = chosen.map((q) => ({ text: q.text, tags: q.tags }));
  if (ownText && ownForm.valid) all.push({ text: ownText, tags: ownForm.tags });
  const count = chosen.length + (ownText ? 1 : 0);

  const findTag = (tag: QuestionTag) => all.find((q) => q.tags.includes(tag));

  const trzy: InterviewVerdict =
    count === 3 && (!ownText || ownForm.valid)
      ? { ok: true, note: 'Masz trzy pytania.' }
      : ownText && !ownForm.valid
        ? { ok: false, note: ownForm.problem ?? 'Popraw własne pytanie.' }
        : { ok: false, note: `Masz ${count} — potrzebne dokładnie trzy. ${count > 3 ? 'Odznacz te, które są najsłabsze.' : 'Dobierz jeszcze kilka.'}` };

  const czas = findTag('czas');
  const otwarte = findTag('otwarte');
  const slad = findTag('slad');

  return {
    verdicts: {
      trzy,
      czas: czas
        ? { ok: true, note: `„${czas.text}” — z odpowiedzi wyjdzie rok albo okres.` }
        : { ok: false, note: 'Żadne z pytań nie pyta o czas. Bez roku rozmowa nie trafi na oś — dodaj pytanie, które zaczyna się od „kiedy” albo „w którym roku”.' },
      otwarte: otwarte
        ? { ok: true, note: `„${otwarte.text}” — na to nie da się odpowiedzieć jednym słowem.` }
        : { ok: false, note: 'Na każde twoje pytanie można odpowiedzieć „tak” albo „nie” — a ty chcesz, żeby ktoś opowiedział. Zamień jedno na pytanie od „jak”, „dlaczego” albo „co”.' },
      slad: slad
        ? { ok: true, note: `„${slad.text}” — pamiątka albo zdjęcie to źródło, jak z kufra.` }
        : { ok: false, note: 'Żadne pytanie nie dotyczy śladu. Dopytaj o pamiątkę, zdjęcie albo list — rzecz, którą można potem obejrzeć jak źródło.' },
    },
    data: { questions: all.map((q) => q.text) },
  };
}

/**
 * Lata rodzinne na Osi dziejów: rodzic musi być starszy od dziecka, dziadek od
 * rodzica (reguła z drzewa — dziecko jest młodsze o pokolenie).
 */
export function judgeFamilyYear(pins: PersonalPins, role: PersonalRole, year: number): string | null {
  const ja = pins.ja;
  const rodzic = pins.rodzic;
  const dziadek = pins.dziadek;
  if (role === 'rodzic') {
    if (ja !== undefined && year >= ja) return `Rodzic jest starszy od ciebie — ty urodziłaś/eś się w ${ja}, więc rok rodzica musi być wcześniejszy.`;
    if (dziadek !== undefined && year <= dziadek) return `Rodzic jest dzieckiem babci albo dziadka, więc urodził się później niż oni (${dziadek}).`;
  }
  if (role === 'dziadek') {
    if (rodzic !== undefined && year >= rodzic) return `Babcia albo dziadek są rodzicami twojego rodzica (ur. ${rodzic}), więc muszą być starsi.`;
    if (ja !== undefined && year >= ja) return `Babcia albo dziadek są starsi od ciebie — ty urodziłaś/eś się w ${ja}.`;
  }
  return null;
}
