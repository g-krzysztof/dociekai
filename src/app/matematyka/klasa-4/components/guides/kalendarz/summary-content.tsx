/**
 * Streszczenie przewodnika „Kalendarz: dni, miesiące i lata przestępne" w
 * dwóch wariantach: `SUMMARY_PLAIN_TEXT` to czysty ciąg znaków bez
 * formatowania — payload do syntezy mowy (TTS), więc liczby są zapisane
 * słownie. `SummaryDisplay` renderuje tę samą treść jako czytelny, ostylowany
 * tekst w modalu — tam liczby zostają jako cyfry, bo to tekst do czytania
 * wzrokiem, nie do syntezy — te dwa miejsca trzeba aktualizować razem, żeby
 * się nie rozjechały treściowo.
 */
export const SUMMARY_PLAIN_TEXT = `Kalendarz ma swoje własne zasady — inne niż liczenie w pamięci, ale równie logiczne. Ten przewodnik pokazuje, ile dni ma każdy miesiąc, kiedy luty ma dodatkowy dzień, i jak policzyć, ile dni zostało do wybranej daty.

Tydzień zawsze ma siedem dni: poniedziałek, wtorek, środę, czwartek, piątek, sobotę i niedzielę, i zaczyna się od nowa w kółko. Rok zwykły ma trzysta sześćdziesiąt pięć dni, czyli pięćdziesiąt dwa pełne tygodnie i jeszcze jeden dzień — dlatego ta sama data w przyszłym roku wypada zwykle jeden dzień tygodnia dalej. Rok przestępny ma trzysta sześćdziesiąt sześć dni, więc jeśli między dwiema takimi samymi datami zmieści się dwudziesty dziewiąty lutego, przesunięcie jest o dwa dni, nie o jeden.

Rok ma dwanaście miesięcy. Siedem z nich ma trzydzieści jeden dni, cztery mają trzydzieści dni, a luty jako jedyny ma dwadzieścia osiem albo dwadzieścia dziewięć. Łatwo to zapamiętać, zaciskając pięść — wypukłe kostki i wklęsłe doliny między nimi układają się naprzemiennie, dokładnie tak jak długości miesięcy. Jedyne miejsce, gdzie dwa trzydziestojednodniowe miesiące sąsiadują ze sobą, to lipiec i sierpień, dlatego licząc na kostkach, trzeba w tym miejscu wrócić na początek dłoni.

Ziemia okrąża Słońce nie w dokładnie trzysta sześćdziesiąt pięć dni, tylko w około trzysta sześćdziesiąt pięć i jedną czwartą dnia. Żeby kalendarz nie rozjechał się z porami roku, co cztery lata dokładamy jeden dodatkowy dzień — dwudziesty dziewiąty lutego. Rok jest przestępny, gdy liczba roku dzieli się przez cztery, z jednym wyjątkiem: pełne stulecia są przestępne tylko wtedy, gdy dzielą się przez czterysta. Dlatego rok tysiąc dziewięćsetny nie był przestępny, a rok dwutysięczny był.

Żeby policzyć, ile dni zostało do jakiejś daty, najpierw dolicz do końca bieżącego miesiąca — odejmij dzisiejszy dzień od liczby dni w tym miesiącu i dodaj jeden — a potem dolicz resztę dni w kolejnym miesiącu. Ten sam kalendarz w telefonie, na ścianie w kuchni, przy planowaniu urodzin, wakacji czy ferii — wszędzie liczysz dokładnie w ten sposób.`;

interface SummaryDisplayProps {
  color: string;
}

export function SummaryDisplay({ color }: SummaryDisplayProps) {
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  return (
    <div className="space-y-4 text-sm leading-relaxed sm:text-base">
      <p>
        Kalendarz ma swoje własne zasady — inne niż liczenie w pamięci, ale równie logiczne.
      </p>
      <p>
        Tydzień zawsze ma <strong style={{ color: textColor }}>7 dni</strong> i zaczyna się od
        nowa w kółko. Rok zwykły ma{' '}
        <span className="font-mono" style={{ color }}>
          365 = 52 × 7 + 1
        </span>{' '}
        dni, więc ta sama data w przyszłym roku wypada zwykle{' '}
        <strong style={{ color: textColor }}>jeden dzień tygodnia dalej</strong> — a w roku
        przestępnym, który ma 366 dni, o <strong style={{ color: textColor }}>dwa dni</strong>.
      </p>
      <p>
        Rok ma <strong style={{ color: textColor }}>12 miesięcy</strong>: siedem po 31 dni, cztery
        po 30, a luty ma 28 albo 29. Łatwo to zapamiętać na pięści — wypukłe kostki i wklęsłe
        doliny między nimi zmieniają się naprzemiennie, tak jak długości miesięcy. Wyjątek to
        lipiec i sierpień — dwa 31-dniowe miesiące obok siebie.
      </p>
      <p>
        Rok jest <strong style={{ color: textColor }}>przestępny</strong>, gdy dzieli się przez 4
        — z wyjątkiem pełnych stuleci, które są przestępne tylko, gdy dzielą się przez 400 (1900
        nie był, 2000 był).
      </p>
      <p className="text-muted-foreground">
        Żeby policzyć dni do jakiejś daty: dolicz do końca miesiąca (liczba dni w miesiącu minus
        dzisiejszy dzień, plus 1), a potem dolicz resztę w kolejnym miesiącu.
      </p>
    </div>
  );
}
