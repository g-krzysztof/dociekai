import type { DocContent } from '../../../lib/doc-model';
import { count } from '../../../lib/plural';
import type { ProofCriterion, ProofVerdicts } from '../../task-shell';

/**
 * Werdykt dla zadania praktycznego lekcji o prawie autorskim — notatki o
 * łące, zrobionej uczciwie w lekcji (`MiniWriter`).
 *
 * Sedno tej lekcji brzmi: **cudze rzeczy wolno brać, ale trzeba powiedzieć,
 * czyje są**. W notatce widać z tego trzy rzeczy i wszystkie trzy sprawdzamy:
 * czy jest obraz, czy pod nim stoi **autor i nazwa licencji**, i czy sekcja
 * „Źródła” niesie **prawdziwe adresy**, a nie zdanie „z internetu”.
 *
 * Czwarta rzecz nie ma jej w żadnej innej lekcji kursu:
 * **wklejenie ze strony**. Na stronie nie ma innego kroju, który by je zdradził
 * jak w pliku — więc notujemy sam akt wklejenia (`onPaste` edytora) i patrzymy,
 * czy wklejony fragment stoi w dokumencie dalej słowo w słowo. Mówimy o tym
 * **bez oskarżania**: to nie jest dowód przepisania, tylko ślad po nim —
 * wklejony akapit i tak trzeba napisać własnymi słowami.
 *
 * Czego **nie** robimy: nie wchodzimy do internetu, żeby porównać notatkę ze
 * źródłem. Obietnica „twoja praca zostaje na twoim komputerze” obowiązuje bez
 * wyjątków, a poza tym adres w notatce nie musi być tym, z którego dziecko
 * naprawdę czytało. Porównanie z konkretnym źródłem jest w nagrodzie i robi je
 * dziecko, wklejając akapit — tą samą regułą, co `OwnWords` (`copy-check.ts`).
 */

export interface PastedFragment {
  /** Początek wklejonego fragmentu — do pokazania w raporcie. */
  text: string;
}

export interface NatureNoteAnalysis {
  words: number;
  paragraphs: number;
  /** Nagłówek „Źródła” gdziekolwiek w dokumencie. */
  hasSourcesHeading: boolean;
  /** Prawdziwe adresy stron wyjęte z dokumentu. */
  links: string[];
  /** Nazwa licencji znaleziona przy zdjęciu albo w źródłach. */
  license: string | null;
  /** Zdanie, w którym pada autor zdjęcia. */
  author: string | null;
  /** Obrazy wstawione do notatki — po jednym wpisie na obraz. */
  images: string[];
  /** Wklejone fragmenty, które stoją w notatce dalej słowo w słowo. */
  pasted: PastedFragment[];
  /** Sama treść notatki, bez sekcji „Źródła” — to ją porównuje nagroda. */
  bodyText: string;
}

const SOURCES_HEADING = /^[\s„"]*(źródł|zrodl|bibliograf|skąd to wziąłem|skad to wzialem)/iu;

const LICENSES: { name: string; pattern: RegExp }[] = [
  { name: 'CC BY', pattern: /\bcc[\s-]?by(?![\s-]?(sa|nc|nd))/iu },
  { name: 'CC BY-SA', pattern: /\bcc[\s-]?by[\s-]?sa\b/iu },
  { name: 'CC BY-NC', pattern: /\bcc[\s-]?by[\s-]?nc\b/iu },
  { name: 'CC0', pattern: /\bcc\s?0\b/iu },
  { name: 'domena publiczna', pattern: /domen\w*\s+publiczn|public\s+domain/iu },
  { name: 'licencja Pixabay', pattern: /pixabay\s+licen/iu },
  { name: 'Creative Commons', pattern: /creative\s+commons/iu },
];

const AUTHOR = /(autor\w*|zdj[ęe]ci\w*\s+(zrobi|wykona)|fot\.|foto:|\bautor:)/iu;

export const NATURE_CRITERIA: ProofCriterion[] = [
  { id: 'notatka', label: 'Notatka: co najmniej dwa akapity i co najmniej 30 wyrazów.' },
  { id: 'obraz', label: 'W notatce siedzi obraz — nie link do niego, tylko wstawiony plik.' },
  { id: 'zrodla', label: 'Na dole jest sekcja „Źródła”, a w niej co najmniej dwa prawdziwe adresy.' },
  { id: 'licencja', label: 'Przy zdjęciu stoi autor i nazwa licencji.' },
  { id: 'jednolite', label: 'Wszystko napisane własnymi słowami — nic nie stoi tu słowo w słowo po wklejeniu.' },
];

/**
 * Wklejony fragment, który stoi w dokumencie dalej słowo w słowo.
 *
 * Bierzemy trzy próbki z wklejki (początek, środek, koniec po 40 znaków) —
 * wystarczy, że jedna z nich ocalała, żeby poznać, że fragmentu nikt własnymi
 * słowami nie przepisał. Krótkie wklejki (adresy, pojedyncze wyrazy) odpadają:
 * to nie jest tekst, tylko dane.
 */
const PASTE_MIN = 40;

function unrewritten(docText: string, paste: string): string | null {
  const flat = paste.replace(/\s+/g, ' ').trim();
  if (flat.length < PASTE_MIN) return null;
  const probes = [
    flat.slice(0, 40),
    flat.slice(Math.max(0, Math.floor(flat.length / 2) - 20), Math.floor(flat.length / 2) + 20),
    flat.slice(-40),
  ];
  const body = docText.replace(/\s+/g, ' ');
  if (probes.some((probe) => probe.length >= 30 && body.includes(probe))) return flat;
  return null;
}

export function analyseNatureNote(doc: DocContent, pastes: string[]): NatureNoteAnalysis {
  const filled = doc.paragraphs.filter((paragraph) => paragraph.text.trim() !== '');

  const pasted: PastedFragment[] = [];
  const seen = new Set<string>();
  for (const paste of pastes) {
    const hit = unrewritten(doc.text, paste);
    if (hit && !seen.has(hit.slice(0, 60))) {
      seen.add(hit.slice(0, 60));
      pasted.push({ text: hit });
    }
  }

  /* Treść kończy się na nagłówku „Źródła” — adresy i podpisy to nie jest tekst dziecka. */
  const sourcesAt = filled.findIndex((paragraph) => SOURCES_HEADING.test(paragraph.text.trim()));
  const bodyText = (sourcesAt >= 0 ? filled.slice(0, sourcesAt) : filled)
    .map((paragraph) => paragraph.text.trim())
    .join('\n');

  const license = LICENSES.find((item) => item.pattern.test(doc.text));
  const authorLine = filled.find((paragraph) => AUTHOR.test(paragraph.text));

  return {
    words: doc.words,
    images: doc.images,
    paragraphs: filled.filter((paragraph) => paragraph.heading === null && !paragraph.list).length,
    hasSourcesHeading: filled.some((paragraph) => SOURCES_HEADING.test(paragraph.text.trim())),
    links: doc.links.filter((link) => /^https?:\/\//i.test(link)),
    license: license?.name ?? null,
    author: authorLine?.text.trim() ?? null,
    pasted,
    bodyText,
  };
}

export function judgeNatureNoteContent(report: NatureNoteAnalysis): ProofVerdicts {
  const { links } = report;
  /* Adresy z sekcji źródeł liczymy bez powtórek. */
  const unique = Array.from(new Set(links.map((link) => link.replace(/\/+$/, ''))));

  return {
    notatka: {
      ok: report.words >= 30 && report.paragraphs >= 2,
      note:
        report.words >= 30 && report.paragraphs >= 2
          ? 'Notatka rozbita na akapity.'
          : report.words < 30
            ? `Wyrazów w notatce: ${report.words}. Do zaliczenia trzeba ich co najmniej trzydziestu — napisz o wyglądzie, o tym, gdzie żyje, i o czymś, co cię zaskoczyło.`
            : `Akapitów z tekstem: ${report.paragraphs}. Rozbij notatkę na co najmniej dwa — każdy o czymś innym.`,
    },
    obraz: {
      ok: report.images.length > 0,
      note:
        report.images.length > 0
          ? `W dokumencie siedzi ${count(report.images.length, 'obraz', 'obrazy', 'obrazów')}.`
          : 'Nie ma w tym dokumencie żadnego obrazu. Kliknij akapit, pod którym ma stanąć, i wybierz „Wstaw obraz” na pasku narzędzi. Sam adres strony ze zdjęciem to nie jest wstawiony obraz.',
    },
    zrodla: {
      ok: report.hasSourcesHeading && unique.length >= 2,
      note:
        !report.hasSourcesHeading
          ? `Nie znalazłam w notatce nagłówka „Źródła”.${unique.length > 0 ? ` Adresy są (${unique.length}), ale nikt nie pozna, że to źródła — dopisz nad nimi ten nagłówek.` : ''}`
          : unique.length >= 2
            ? `Źródła na miejscu: ${unique.length} adresy. Pierwszy z nich to ${unique[0].slice(0, 60)}${unique[0].length > 60 ? '…' : ''}`
            : `Pod „Źródłami” mam ${unique.length === 1 ? 'jeden adres' : 'zero adresów'}. Zadanie prosi o co najmniej dwa źródła — i o **adresy**, nie o słowo „internet”.`,
    },
    licencja: {
      ok: report.license !== null && report.author !== null,
      note:
        report.license && report.author
          ? `Licencja: ${report.license}. Autor podany w wierszu „${report.author.slice(0, 70)}${report.author.length > 70 ? '…' : ''}”.`
          : !report.license && !report.author
            ? 'Przy zdjęciu nie ma ani autora, ani licencji. Bez tego nie wiadomo, czy wolno go było użyć — a to jest cała ta lekcja. Dopisz: tytuł, autor, skąd i jaka licencja.'
            : !report.license
              ? 'Autor jest, ale nie widzę nazwy licencji. Napisz ją wprost: CC BY, CC0, domena publiczna, licencja Pixabay — tak, jak stała przy pliku.'
              : `Licencja jest (${report.license}), ale brakuje autora. Przy zdjęciu na wolnej licencji prawie zawsze trzeba podać, kto je zrobił.`,
    },
    jednolite: {
      ok: report.pasted.length === 0,
      note:
        report.pasted.length === 0
          ? 'Cała notatka twoimi słowami — nic tu nie stoi słowo w słowo po wklejeniu ze strony.'
          : `${count(report.pasted.length, 'fragment stoi', 'fragmenty stoją', 'fragmentów stoi')} tu dalej słowo w słowo po wklejeniu ze strony (wypisane niżej). To nie jest dowód ściągnięcia, ale powód, żeby te zdania przeczytać jeszcze raz i napisać własnymi słowami — albo je usunąć.`,
    },
  };
}
