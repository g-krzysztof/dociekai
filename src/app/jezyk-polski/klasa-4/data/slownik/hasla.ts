/**
 * Słownik kursu (rejestr T-L10-1) — hasła i znaczenia **napisane dla kursu**,
 * nie przepisane z SJP PWN ani innego słownika. Lista haseł „grubego słownika”
 * (bez znaczeń) to osobny, wygenerowany `lematy.ts` (lematy SGJP — fakt, nie tekst).
 *
 * L10 używa haseł do szukania i wieloznacznych (`zamek`, `klucz`); L12 —
 * związków frazeologicznych za znakiem ◊ (`zwroty`; objaśnienia własne, nie ze
 * słowników frazeologicznych). Zwrot stoi pod jednym ze swoich wyrazów, nie
 * zawsze pod pierwszym („mieć złote ręce” — pod „ręka”).
 */

export type RysunekZnaczenia =
  | 'zamek-budowla'
  | 'zamek-drzwi'
  | 'zamek-blyskawiczny'
  | 'klucz-drzwi'
  | 'klucz-nuty'
  | 'klucz-ptaki';

export interface Znaczenie {
  /** Krótka nazwa do komunikatów („znaczenie 1: budowla”). */
  nazwa: string;
  tekst: string;
  rysunek?: RysunekZnaczenia;
}

/** Związek frazeologiczny za znakiem ◊ w haśle. `id` jest wspólne z danymi lekcji L12. */
export interface ZwrotKursu {
  id: string;
  zwrot: string;
  objasnienie: string;
}

export interface HasloKursu {
  haslo: string;
  znaczenia: Znaczenie[];
  zwroty?: ZwrotKursu[];
}

export const HASLA_KURSU: Record<string, HasloKursu> = {
  kot: {
    haslo: 'kot',
    znaczenia: [{ nazwa: 'zwierzę', tekst: 'zwierzę domowe z wąsami i miękkimi łapami, które chowają pazury; mruczy, kiedy jest zadowolone' }],
  },
  krowa: {
    haslo: 'krowa',
    znaczenia: [{ nazwa: 'zwierzę', tekst: 'duże zwierzę z rogami, które pasie się na łące; daje mleko' }],
  },
  kreda: {
    haslo: 'kreda',
    znaczenia: [{ nazwa: 'kamień', tekst: 'biały, miękki kamień; kawałkiem kredy pisze się na tablicy albo rysuje na chodniku' }],
  },
  zamek: {
    haslo: 'zamek',
    znaczenia: [
      { nazwa: 'budowla', tekst: 'duża, dawna budowla z grubymi murami i wieżami; mieszkali w niej królowie, książęta i rycerze', rysunek: 'zamek-budowla' },
      { nazwa: 'w drzwiach', tekst: 'to, co zamyka drzwi, szafę albo szufladę; otwiera się go kluczem', rysunek: 'zamek-drzwi' },
      { nazwa: 'błyskawiczny', tekst: 'zamek błyskawiczny: dwa rzędy ząbków w kurtce, plecaku albo śpiworze, które suwak łączy i rozdziela', rysunek: 'zamek-blyskawiczny' },
    ],
  },
  klucz: {
    haslo: 'klucz',
    znaczenia: [
      { nazwa: 'do drzwi', tekst: 'metalowy przedmiot, którym otwiera się i zamyka zamek', rysunek: 'klucz-drzwi' },
      { nazwa: 'nutowy', tekst: 'znak na początku pięciolinii; od niego zależy, jak czytać nuty', rysunek: 'klucz-nuty' },
      { nazwa: 'ptaków', tekst: 'ptaki, które lecą razem, ustawione w kształcie litery V — na przykład dzikie gęsi', rysunek: 'klucz-ptaki' },
    ],
  },
  mucha: {
    haslo: 'mucha',
    znaczenia: [{ nazwa: 'owad', tekst: 'mały owad z przezroczystymi skrzydłami; bzyczy i lubi siadać na jedzeniu' }],
    zwroty: [{ id: 'muchy-w-nosie', zwrot: 'mieć muchy w nosie', objasnienie: 'być w złym humorze i gniewać się o byle co' }],
  },
  noga: {
    haslo: 'noga',
    znaczenia: [{ nazwa: 'część ciała', tekst: 'część ciała, na której się stoi, chodzi i biega' }],
    zwroty: [
      { id: 'od-rana-na-nogach', zwrot: 'być na nogach od rana', objasnienie: 'nie odpoczywać od samego rana, cały czas coś robić' },
      { id: 'nogi-za-pas', zwrot: 'wziąć nogi za pas', objasnienie: 'szybko uciec' },
    ],
  },
  pas: {
    haslo: 'pas',
    znaczenia: [{ nazwa: 'pasek', tekst: 'pasek ze skóry albo materiału, którym przytrzymuje się spodnie' }],
  },
  głowa: {
    haslo: 'głowa',
    znaczenia: [{ nazwa: 'część ciała', tekst: 'część ciała nad szyją; są na niej oczy, uszy, nos i usta' }],
    zwroty: [{ id: 'glowa-na-karku', zwrot: 'mieć głowę na karku', objasnienie: 'być rozsądnym i umieć sobie poradzić' }],
  },
  garść: {
    haslo: 'garść',
    znaczenia: [{ nazwa: 'dłoń', tekst: 'dłoń zwinięta tak, żeby coś w niej trzymać; także tyle, ile się w niej zmieści' }],
    zwroty: [{ id: 'wziac-sie-w-garsc', zwrot: 'wziąć się w garść', objasnienie: 'opanować się i nie poddawać' }],
  },
  wiatr: {
    haslo: 'wiatr',
    znaczenia: [{ nazwa: 'powietrze', tekst: 'ruch powietrza; porusza liśćmi, chmurami i żaglami' }],
    zwroty: [{ id: 'slowa-na-wiatr', zwrot: 'rzucać słowa na wiatr', objasnienie: 'obiecywać i nie dotrzymywać obietnic' }],
  },
  ręka: {
    haslo: 'ręka',
    znaczenia: [{ nazwa: 'część ciała', tekst: 'część ciała od ramienia do palców' }],
    zwroty: [
      { id: 'pelne-rece-roboty', zwrot: 'mieć pełne ręce roboty', objasnienie: 'mieć bardzo dużo pracy' },
      { id: 'zlote-rece', zwrot: 'mieć złote ręce', objasnienie: 'umieć wszystko zrobić i naprawić własnymi rękami' },
    ],
  },
  złoty: {
    haslo: 'złoty',
    znaczenia: [{ nazwa: 'ze złota', tekst: 'zrobiony ze złota albo mający jego żółty, błyszczący kolor' }],
  },
  kamień: {
    haslo: 'kamień',
    znaczenia: [{ nazwa: 'skała', tekst: 'twardy kawałek skały; leży na drodze, w rzece i w górach' }],
    zwroty: [{ id: 'kamien-z-serca', zwrot: 'kamień spadł komuś z serca', objasnienie: 'ktoś poczuł ulgę, bo skończył się strach albo zmartwienie' }],
  },
  serce: {
    haslo: 'serce',
    znaczenia: [{ nazwa: 'narząd', tekst: 'narząd w piersi, który bez przerwy pompuje krew' }],
    zwroty: [{ id: 'serce-na-dloni', zwrot: 'mieć serce na dłoni', objasnienie: 'być dobrym i chętnie pomagać innym' }],
  },
  park: {
    haslo: 'park',
    znaczenia: [{ nazwa: 'ogród', tekst: 'duży ogród w mieście, z alejkami, drzewami i ławkami' }],
  },
  pies: {
    haslo: 'pies',
    znaczenia: [{ nazwa: 'zwierzę', tekst: 'zwierzę domowe, które szczeka, merda ogonem i pilnuje domu' }],
  },
  karmnik: {
    haslo: 'karmnik',
    znaczenia: [{ nazwa: 'dla ptaków', tekst: 'domek z daszkiem, do którego zimą sypie się ziarno dla ptaków' }],
  },
};
