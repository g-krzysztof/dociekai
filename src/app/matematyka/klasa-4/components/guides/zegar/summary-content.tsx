/**
 * Streszczenie przewodnika „Zegar: jak odczytywać czas" w dwóch wariantach:
 * `SUMMARY_PLAIN_TEXT` to czysty ciąg znaków bez formatowania — payload do
 * syntezy mowy (TTS), więc liczby są zapisane słownie. `SummaryDisplay`
 * renderuje tę samą treść jako czytelny, ostylowany tekst w modalu — tam
 * liczby zostają jako cyfry/zapis godzinowy, bo to tekst do czytania wzrokiem,
 * nie do syntezy — te dwa miejsca trzeba aktualizować razem, żeby się nie
 * rozjechały treściowo.
 */
export const SUMMARY_PLAIN_TEXT = `Zegar ze wskazówkami i zapis cyfrowy wyglądają jak dwa różne języki, ale mówią o dokładnie tym samym czasie. Ten przewodnik pokazuje, jak przejść z jednego na drugi.

Zwykły zegar ma trzy wskazówki. Godzinowa jest najkrótsza i najgrubsza — okrąża tarczę raz na dwanaście godzin. Minutowa jest dłuższa i cieńsza — okrąża tarczę raz na godzinę, a każda kreska między cyframi to pięć minut. Sekundowa jest najdłuższa i najcieńsza, często czerwona, i jako jedyna nigdy się nie zatrzymuje. Sześćdziesiąt sekund to jedna minuta, sześćdziesiąt minut to jedna godzina, a dwadzieścia cztery godziny to jedna doba.

Wskazówka minutowa najczęściej zatrzymuje się w jednym z czterech miejsc, a każde z nich ma swoją polską nazwę. Na pełnej godzinie mówimy po prostu, która to godzina. Piętnaście minut później mówimy kwadrans po tej godzinie. Trzydzieści minut później mówimy wpół do następnej godziny. A piętnaście minut przed pełną godziną mówimy za kwadrans następna godzina. Wpół do i za kwadrans zawsze wołają już następną godzinę, chociaż wskazówka godzinowa jeszcze jej nie dosięgła.

Zegar ze wskazówkami liczy tylko do dwunastu, a potem zaczyna od nowa. Zapis cyfrowy, który znasz z rozkładów jazdy, liczy dalej — od trzynastu aż do dwudziestu trzech, zanim o północy znów zacznie od zera. Żeby zamienić popołudniową albo wieczorną godzinę z zapisu dwudziestoczterogodzinnego na dwunastogodzinny, wystarczy odjąć dwanaście — na przykład dziewiętnasta czterdzieści dwie minus dwanaście godzin to siódma czterdzieści dwie wieczorem.

Ten sam czas spotkasz zapisany na oba sposoby: w rozkładzie jazdy pociągów jako zapis dwudziestoczterogodzinny, a na zwykłym zegarku na ręku jako dwanaście cyfr i trzy wskazówki. Telefon czy kuchenka mikrofalowa pozwalają przełączyć się między nimi w ustawieniach — to dokładnie ta sama zamiana, której się właśnie nauczyłeś.`;

interface SummaryDisplayProps {
  color: string;
}

export function SummaryDisplay({ color }: SummaryDisplayProps) {
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  return (
    <div className="space-y-4 text-sm leading-relaxed sm:text-base">
      <p>
        Zegar ze wskazówkami i zapis cyfrowy wyglądają jak dwa różne języki, ale mówią o
        dokładnie tym samym czasie.
      </p>
      <p>
        Zwykły zegar ma trzy wskazówki:{' '}
        <strong style={{ color: textColor }}>godzinową</strong> (najkrótsza, okrąża tarczę raz na
        12 h), <strong style={{ color: textColor }}>minutową</strong> (dłuższa, raz na godzinę —
        każda kreska to 5 min) i <strong style={{ color: textColor }}>sekundową</strong>{' '}
        (najdłuższa, jako jedyna nigdy się nie zatrzymuje).{' '}
        <strong className="font-mono" style={{ color }}>
          60 s = 1 min, 60 min = 1 h, 24 h = 1 doba
        </strong>
        .
      </p>
      <p>
        Wskazówka minutowa najczęściej zatrzymuje się w jednym z czterech miejsc: na pełnej
        godzinie, <strong style={{ color: textColor }}>kwadrans po</strong> niej,{' '}
        <strong style={{ color: textColor }}>wpół do</strong> następnej albo{' '}
        <strong style={{ color: textColor }}>za kwadrans</strong> następna — dwa ostatnie zawsze
        wołają już następną godzinę.
      </p>
      <p>
        Zegar ze wskazówkami liczy tylko do 12 i zaczyna od nowa. Zapis cyfrowy z rozkładów jazdy
        liczy dalej, od 13 do 23. Żeby zamienić popołudniową lub wieczorną godzinę z zapisu
        24-godzinnego na 12-godzinny, odejmujesz 12 — np.{' '}
        <span className="font-mono" style={{ color }}>
          19:42 − 12 h = 7:42
        </span>{' '}
        wieczorem.
      </p>
      <p className="text-muted-foreground">
        Ten sam czas widzisz zapisany na oba sposoby: w rozkładzie jazdy jako 24-godzinny zapis, a
        na zwykłym zegarku jako 12 cyfr i trzy wskazówki.
      </p>
    </div>
  );
}
