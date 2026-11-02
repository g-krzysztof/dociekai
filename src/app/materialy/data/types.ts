/**
 * Model treści działu „Pobierz” (/materialy) — ściągi i fiszki do druku.
 *
 * Jedna komponenta renderuje materiał na stronie i w wersji do druku, więc
 * dane opisują TREŚĆ, nie wygląd. Tekst w polach typu `Tresc` może zawierać
 * ułamki w klamrach: `{3/4}` (ułamek) i `{2 1/3}` (liczba mieszana) —
 * rozwija je `<Tresc>` z components/tresc.tsx.
 */

export type Przedmiot = 'matematyka' | 'informatyka' | 'historia' | 'jezyk-polski';

export type RodzajMaterialu = 'sciaga' | 'fiszki';

/** Tekst z opcjonalnymi ułamkami w klamrach, np. „{2/9} + {5/9} = {7/9}”. */
export type Tresc = string;

/** Rysunki na kartkach — zawsze SVG z kodu, ostre w druku i czytelne w czerni. */
export type Schemat =
  | { typ: 'pasek'; licznik: number; mianownik: number }
  | { typ: 'kolo'; licznik: number; mianownik: number }
  | {
      typ: 'os';
      /** Ile całości ma oś (0…do). */
      do: number;
      /** Na ile części dzielimy każdą całość. */
      podzial: number;
      /** Zaznaczone punkty: pozycja w częściach od zera i podpis (`?` = pytanie). */
      punkty: { kreska: number; podpis: Tresc }[];
    }
  | {
      /** Działanie pisemne w kratkach, jak w zeszycie. Wiersze od góry. */
      typ: 'slupek';
      wiersze: WierszSlupka[];
    }
  /** Od góry: prosta (strzałki w obie strony), półprosta, odcinek. */
  | { typ: 'linie' }
  /** Para prostych prostopadłych (z kwadracikiem) i para równoległych. */
  | { typ: 'proste' }
  | {
      /** Kąty obok siebie, każdy z ramieniem poziomym; 90° = kwadracik. */
      typ: 'kat';
      stopnie: number[];
      /** Miara przy każdym łuku. */
      podpisy?: boolean;
    }
  | {
      /** Okrąg ze środkiem i wybranymi odcinkami, każdy z podpisem. */
      typ: 'okrag';
      odcinki: { rodzaj: 'promien' | 'srednica' | 'cieciwa'; podpis: string }[];
    }
  | {
      typ: 'figura';
      ksztalt: 'prostokat' | 'kwadrat' | 'latawiec' | 'trojkat' | 'rownoleglobok';
      /** Wszystkie osie symetrii figury, przerywane. */
      osie?: boolean;
      /** Prostokąt/kwadrat: podpis boku dolnego i prawego. */
      boki?: [string, string];
    }
  | {
      /**
       * Figura na kratkownicy. Wiersze od góry, znak = kratka:
       * `#` cała, `.` pusta, `x` brak (kreskowany — metoda uzupełniania),
       * połówki przez przekątną: `◣` `◢` `◤` `◥` (zamalowany róg jak w znaku).
       */
      typ: 'kratki';
      wiersze: string[];
      /** Linie cięcia w węzłach kratownicy: [x1, y1, x2, y2], (0, 0) = lewy górny róg. */
      ciecia?: [number, number, number, number][];
      /** Podpis boku dolnego i prawego figury. */
      boki?: [string, string];
    }
  | {
      /**
       * Prostopadłościan w rzucie ukośnym, krawędzie zasłonięte przerywane.
       * Wymiary: długość (szerokość ściany przedniej), szerokość (głębokość), wysokość.
       */
      typ: 'prostopadloscian';
      wymiary: [number, number, number];
      /** Podpisy długości (pod spodem), szerokości (przy krawędzi w głąb) i wysokości (z lewej). */
      podpisy?: [string, string, string];
      /** Podział widocznych ścian na kostki jednostkowe (wymiary całkowite). */
      kostki?: boolean;
    }
  /** Szczeble jednostek od najmniejszej; `krok` nad każdą strzałką, bez niego same strzałki. */
  | { typ: 'drabinka'; szczeble: string[]; krok?: string };

export interface WierszSlupka {
  /**
   * Kratki wiersza, dosunięte do prawej krawędzi. Napis dzieli się na
   * pojedyncze znaki (spacja = pusta kratka); tablica pozwala wpisać do
   * jednej kratki więcej niż jeden znak. Przecinek (`,`, także jako osobny
   * element tablicy) nie zajmuje kratki — staje na prawej krawędzi kratki
   * przed nim, jak w zeszycie; numery w `skreslone`/`pozyczone` go pomijają.
   */
  kratki: string | string[];
  /** Znak działania w kolumnie przed liczbą. */
  znak?: '+' | '−' | '·';
  /** Kreska nad wierszem — oddziela wynik. */
  kreska?: boolean;
  /** Mały wiersz nad liczbą: przeniesienia albo nowe cyfry po pożyczce. */
  male?: boolean;
  /** Numery kratek (od lewej, w obrębie `kratki`) do przekreślenia — kolumna oddała dziesiątkę. */
  skreslone?: number[];
  /** Numery kratek, które dostały pożyczoną dziesiątkę — mała „1” przed cyfrą. */
  pozyczone?: number[];
}

export type BlokSciagi =
  | { typ: 'regula'; tytul: string; tekst: Tresc; przyklad?: Tresc; schemat?: Schemat }
  | { typ: 'pulapka'; tytul: string; zle: Tresc; dobrze: Tresc; dlaczego: Tresc };

export interface Fiszka {
  awers: { pytanie: Tresc; schemat?: Schemat };
  rewers: { odpowiedz: Tresc; wyjasnienie?: Tresc; schemat?: Schemat };
}

interface MaterialBase {
  przedmiot: Przedmiot;
  klasa: 4;
  slug: string;
  rodzaj: RodzajMaterialu;
  /** Moduł kursu, z którego jest materiał — link wraca do lekcji. */
  modul: { numer: number; tytul: string; href: string };
  /** Tytuł na stronie i w PDF, np. „Ułamki zwykłe — ściąga”. */
  tytul: string;
  /** Meta description i opis na karcie — tor dorosły, rzeczowo. */
  opis: string;
  /** Co obejmuje — tematy lekcji modułu. */
  zakres: string[];
  /** Data ostatniej zmiany treści (YYYY-MM-DD) — trafia na pieczątkę. */
  aktualizacja: string;
}

export interface Sciaga extends MaterialBase {
  rodzaj: 'sciaga';
  /** Zdanie lekcji — jedno, na górze kartki. */
  zdanie: Tresc;
  bloki: BlokSciagi[];
}

export interface ZestawFiszek extends MaterialBase {
  rodzaj: 'fiszki';
  /** Wielokrotność 8 — tyle kart mieści arkusz A4 (2 × 4). */
  karty: Fiszka[];
}

export type Material = Sciaga | ZestawFiszek;

/** Wariant pliku: ściąga ma jeden, fiszki dwa. */
export type WariantPdf = 'dwustronne' | 'skladane';
