/**
 * Streszczenie przewodnika „Skala” w dwóch wariantach: `SUMMARY_PLAIN_TEXT` to
 * payload do syntezy mowy (TTS), liczby zapisane słownie; `SummaryDisplay`
 * renderuje tę samą treść wzrokowo, tam liczby i wzory zostają w zapisie
 * cyfrowym/symbolicznym — te dwa miejsca trzeba aktualizować razem.
 */
export const SUMMARY_PLAIN_TEXT = `Skala to zapis w rodzaju jeden do stu, który mówi, ile razy pomniejszono rzeczywistość na rysunku, planie albo mapie. Pierwsza liczba to zawsze jeden, druga liczba mówi, ile razy większa jest prawdziwa długość.

Żeby przejść z rysunku na rzeczywistość, mnożysz długość na rysunku przez drugą liczbę skali. Przy skali jeden do stu pięć centymetrów na planie oznacza pięćset centymetrów, czyli pięć metrów w rzeczywistości.

Żeby przejść z rzeczywistości na rysunek, dzielisz przez tę samą liczbę. Odległość trzysta kilometrów przy skali jeden do miliona to trzydzieści centymetrów na mapie — ale najpierw trzeba zamienić kilometry na centymetry, bo obie strony skali muszą być zapisane w tej samej jednostce.

Skalę spotkasz wszędzie — na mapie w atlasie, na planie mieszkania i w modelach samochodów kolekcjonerskich.`;

interface SummaryDisplayProps {
  color: string;
}

export function SummaryDisplay({ color }: SummaryDisplayProps) {
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  return (
    <div className="space-y-4 text-sm leading-relaxed sm:text-base">
      <p>
        <strong style={{ color: textColor }}>Skala</strong> to zapis w rodzaju{' '}
        <strong className="font-mono" style={{ color }}>
          1:100
        </strong>{' '}
        — mówi, ile razy pomniejszono rzeczywistość na rysunku, planie albo mapie. Pierwsza liczba
        to zawsze 1, druga mówi, ile razy większa jest prawdziwa długość.
      </p>
      <p>
        Z rysunku na rzeczywistość: <strong style={{ color: textColor }}>mnożysz</strong> przez
        drugą liczbę skali. Przy skali 1:100, 5 cm na planie to 500 cm, czyli 5 m w rzeczywistości.
      </p>
      <p>
        Z rzeczywistości na rysunek: <strong style={{ color: textColor }}>dzielisz</strong> przez
        tę samą liczbę. 300 km przy skali 1:1 000 000 to 30 cm na mapie — po zamianie kilometrów
        na centymetry, bo obie strony skali muszą być w tej samej jednostce.
      </p>
      <p className="text-muted-foreground">
        Skalę spotkasz na mapie w atlasie, na planie mieszkania i w modelach samochodów
        kolekcjonerskich.
      </p>
    </div>
  );
}
