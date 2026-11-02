import { plural } from '../../../lib/plural';
import { fitFontSize, words } from './slide-view';
import type { TalkSlide } from './dress-rehearsal';
import type { SlideContent } from './slide-view';

/**
 * Werdykt zadania praktycznego z lekcji o prezentacji.
 *
 * **Zadanie dzieje się w całości w lekcji** — tak jak Z-1 (`FloppyPour`) i Z-2
 * (`ProgramHunt`) po przeróbce z 2026-09-16. Dziecko składa pięć slajdów na
 * stronie i strona ocenia jego pracę, zamiast wysyłać je do prawdziwego
 * programu po plik. Odbiór plikiem wygląda mądrze i kosztuje dziesięciolatka
 * pół godziny walki z „Zapisz jako”, a potem połowa prób rozbija się o format,
 * którego nie umiał wybrać — za to samo zadanie można dostać tutaj, od razu, z
 * podglądem slajdu w prawdziwych proporcjach.
 *
 * Sześć kryteriów to **sześć zdań z tej lekcji**, po kolei: plan z bloku 3,
 * mało tekstu i duże litery z bloków 1–2, trzy punkty w „o czym powiem”, obraz,
 * notatki mówcy z bloku 2 i ostatni slajd z jedną myślą.
 *
 * **Czego nie oceniamy:** treści. Czy prezentacja jest ciekawa i czy fakty są
 * prawdziwe — o tym rozstrzyga człowiek, nie strona. Sprawdzamy kształt, bo
 * tylko kształtu uczyła ta lekcja.
 */

export type PictureKind = NonNullable<SlideContent['picture']>;

export interface StudioSlide {
  title: string;
  lines: string[];
  notes: string;
  picture: PictureKind | null;
}

export interface SlideStat {
  number: number;
  words: number;
  notesWords: number;
  /** Rozmiar liter, jaki wychodzi z autodopasowania — ten sam rachunek co w bloku 2. */
  points: number;
  lines: string[];
  hasPicture: boolean;
}

export interface DeckVerdict {
  id: string;
  label: string;
  ok: boolean;
  note: string;
}

/** Ile wyrazów może stanąć na jednym slajdzie, zanim zrobi się z niego kartka. */
export const MAX_WORDS = 25;
/** Litery mniejsze od tego znikają z ostatniej ławki. */
export const MIN_POINTS = 24;
/** Notatka krótsza niż to nie jest zdaniem, które da się powiedzieć. */
const NOTE_WORDS = 4;
const NOTE_SLIDES = 3;
const LAST_WORDS = 12;
const PLAN_POINTS = 3;

/** Role pięciu slajdów — ten sam plan, który dziecko przeszło w próbie generalnej. */
export const SLIDE_ROLES = [
  { hint: 'Tytuł i kto opowiada', placeholder: 'O czym opowiadasz?', linePlaceholder: 'Opowiada: twoje imię' },
  { hint: '„O czym powiem” — trzy punkty', placeholder: 'O czym powiem', linePlaceholder: 'Jedna rzecz, o której powiesz' },
  { hint: 'Pierwsza myśl, a do niej obraz', placeholder: 'Tytuł tej myśli', linePlaceholder: 'Hasło, nie zdanie' },
  { hint: 'Druga myśl', placeholder: 'Tytuł tej myśli', linePlaceholder: 'Hasło, nie zdanie' },
  { hint: 'Jedno zdanie, które ma zostać w głowie', placeholder: 'Tytuł zakończenia', linePlaceholder: 'To jedno zdanie' },
];

export const SLIDES = SLIDE_ROLES.length;

export function emptyDeck(): StudioSlide[] {
  return SLIDE_ROLES.map((_, index) => ({
    title: '',
    lines: index === 1 ? ['', '', ''] : [''],
    notes: '',
    picture: null,
  }));
}

function visibleLines(slide: StudioSlide): string[] {
  return slide.lines.map((line) => line.trim()).filter((line) => line.length > 0);
}

export function statsOf(deck: StudioSlide[]): SlideStat[] {
  return deck.map((slide, index) => {
    const lines = visibleLines(slide);
    return {
      number: index + 1,
      words: words([slide.title, ...lines].join(' ')),
      notesWords: words(slide.notes),
      points: fitFontSize(slide.picture ? lines.map((line) => `${line}          `) : lines),
      lines,
      hasPicture: slide.picture !== null,
    };
  });
}

/** Lista numerów slajdów po ludzku: „3”, „3 i 5”, „2, 3 i 5”. */
function listOf(numbers: number[]): string {
  if (numbers.length <= 1) return String(numbers[0] ?? '');
  return `${numbers.slice(0, -1).join(', ')} i ${numbers[numbers.length - 1]}`;
}

export function judgeDeck(deck: StudioSlide[]): DeckVerdict[] {
  const stats = statsOf(deck);
  const first = deck[0];
  const firstLines = visibleLines(first);
  const last = deck[SLIDES - 1];
  const lastLines = visibleLines(last);
  const lastText = [last.title.trim(), ...lastLines].join(' ').trim();
  const planLines = visibleLines(deck[1]);

  const walls = stats.filter((stat) => stat.words > MAX_WORDS);
  const written = stats.filter((stat) => stat.lines.length > 0);
  const small = written.filter((stat) => stat.points < MIN_POINTS);
  const spoken = stats.filter((stat) => stat.notesWords >= NOTE_WORDS);
  const pictures = stats.filter((stat) => stat.hasPicture);
  const thanks = /dzi[eę]k|do widzenia|koniec prezentacji/i.test(lastText) && words(lastText) <= 6;

  return [
    {
      id: 'tytul',
      label: 'Slajd 1 mówi, o czym to jest i kto opowiada',
      ok: first.title.trim().length > 0 && firstLines.length > 0,
      note: !first.title.trim()
        ? 'Pierwszy slajd nie ma tytułu. To pierwsza rzecz, którą widz czyta — i często jedyna, którą zapamięta z początku.'
        : firstLines.length === 0
          ? `Tytuł jest („${first.title.trim()}”), ale nie ma pod nim ani słowa o tym, kto opowiada. Widz ma wiedzieć, kogo słucha.`
          : `„${first.title.trim()}” — ${firstLines[0]}.`,
    },
    {
      id: 'plan',
      label: `Slajd 2 zapowiada, o czym powiesz — ${PLAN_POINTS} punkty`,
      ok: planLines.length >= PLAN_POINTS,
      note:
        planLines.length >= PLAN_POINTS
          ? `Widz od razu wie, ile go czeka: ${planLines.slice(0, PLAN_POINTS).join(' · ')}.`
          : `Masz tu ${plural(planLines.length, 'punkt', 'punkty', 'punktów')}: ${planLines.length}. Trzy wystarczą — ale mniej niż trzy znaczy, że widz nie wie, dokąd go prowadzisz.`,
    },
    {
      id: 'hasla',
      label: `Żaden slajd nie jest ścianą tekstu — najwyżej ${MAX_WORDS} wyrazów, litery od ${MIN_POINTS} pt`,
      ok: walls.length === 0 && small.length === 0 && written.length > 0,
      note:
        walls.length > 0
          ? `Za dużo tekstu na ${plural(walls.length, 'slajdzie', 'slajdach', 'slajdach')} ${listOf(walls.map((stat) => stat.number))} (${walls
              .map((stat) => `${stat.words} wyrazów`)
              .join(', ')}). Nie kasuj tych zdań — przenieś je do notatek mówcy i powiedz je.`
          : small.length > 0
            ? `Na ${plural(small.length, 'slajdzie', 'slajdach', 'slajdach')} ${listOf(small.map((stat) => stat.number))} litery zeszły do ${small
                .map((stat) => `${stat.points} pt`)
                .join(', ')}, bo tekst przestał się mieścić. Program zmniejsza litery sam — to jest jego sposób powiedzenia ci, że tekstu jest za dużo.`
            : written.length === 0
              ? 'Pod tytułami nie ma jeszcze ani jednego hasła, więc nie mam czego zmierzyć. Wpisz pod tytułem kilka słów — najwyżej kilka, nie zdania.'
              : `Najmniejsze litery w całej prezentacji mają ${Math.min(...written.map((stat) => stat.points))} pt. Widać je z ostatniej ławki.`,
    },
    {
      id: 'obraz',
      label: 'Na co najmniej jednym slajdzie jest obraz, a nie sam tekst',
      ok: pictures.length > 0,
      note:
        pictures.length > 0
          ? `Obraz jest na ${plural(pictures.length, 'slajdzie', 'slajdach', 'slajdach')} ${listOf(pictures.map((stat) => stat.number))}. Zwróć uwagę, że zabrał miejsce tekstowi — i dobrze.`
          : 'Nie ma ani jednego obrazu. Rysunek mówi widzowi w sekundę to, na co zdaniem potrzebujesz dziesięciu — a przy okazji zabiera miejsce, którego nie zapełnisz tekstem.',
    },
    {
      id: 'notatki',
      label: `Notatki mówcy przy co najmniej ${NOTE_SLIDES} slajdach — to, co powiesz, a nie napiszesz`,
      ok: spoken.length >= NOTE_SLIDES,
      note:
        spoken.length >= NOTE_SLIDES
          ? `Notatki są przy ${plural(spoken.length, 'slajdzie', 'slajdach', 'slajdach')} ${listOf(spoken.map((stat) => stat.number))} — razem ${spoken.reduce((sum, stat) => sum + stat.notesWords, 0)} wyrazów do powiedzenia.`
          : spoken.length === 0
            ? 'Nie ma notatek mówcy przy żadnym slajdzie. A to właśnie tam trafiają zdania, które zdejmujesz ze slajdu — nie do kosza.'
            : `Notatki są przy ${spoken.length} z ${SLIDES} slajdów, a potrzebuję ich przy ${NOTE_SLIDES}. Notatka krótsza niż cztery wyrazy to nie zdanie, które da się powiedzieć.`,
    },
    {
      id: 'koniec',
      label: 'Ostatni slajd niesie jedno zdanie do zapamiętania (nie „dziękuję za uwagę”)',
      ok: lastText.length > 0 && words(lastText) <= LAST_WORDS && !thanks,
      note: thanks
        ? `Ostatni slajd mówi „${lastText}”. To jest zdanie, które się mówi na głos — a slajd, na który widz patrzy najdłużej, powinien nieść tę jedną rzecz, którą ma zapamiętać.`
        : lastText.length === 0
          ? 'Ostatni slajd jest pusty. Zostaw na nim jedno zdanie — to je widz zabierze ze sobą do domu.'
          : words(lastText) > LAST_WORDS
            ? `Ostatni slajd ma ${words(lastText)} wyrazów. Chodzi tu o jedną myśl, nie o podsumowanie wszystkiego — zostaw najwyżej ${LAST_WORDS} wyrazów.`
            : `Zostaje: „${lastText}”.`,
    },
  ];
}

/** Prezentacja dziecka podana próbie generalnej — nagrodą jest jego własna praca na zegarze. */
export function talkSlides(deck: StudioSlide[]): TalkSlide[] {
  return deck.map((slide, index) => ({
    id: `slajd-${index + 1}`,
    title: slide.title.trim() || `Slajd ${index + 1}`,
    lines: visibleLines(slide),
    picture: slide.picture ?? undefined,
    notes: slide.notes.trim(),
  }));
}
