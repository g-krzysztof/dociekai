/**
 * Streszczenie przewodnika „Słownik działań” w dwóch wariantach:
 * `SUMMARY_PLAIN_TEXT` to czysty ciąg znaków bez formatowania — docelowo payload
 * do API syntezy mowy (TTS), więc każda liczba jest zapisana słownie.
 * `SummaryDisplay` renderuje tę samą treść jako czytelny, ostylowany tekst w
 * modalu — tam liczby i równania zostają w postaci cyfr, bo to tekst do
 * czytania wzrokiem, nie do syntezy — te dwa miejsca trzeba aktualizować
 * razem, żeby się nie rozjechały treściowo.
 */
export const SUMMARY_PLAIN_TEXT = `Osiem plus pięć równa się trzynaście, cztery razy trzy równa się dwanaście — te wyniki policzysz bez trudu. Ten przewodnik uczy czegoś innego: jak nazywają się poszczególne liczby w tych działaniach. Takich nazw jest osiem, a większości z nich jeszcze nie znasz.

W dodawaniu liczby, które do siebie dodajesz, nazywają się składnikami, a wynik to suma. W odejmowaniu liczba, od której odejmujesz, to odjemna, liczba, którą odejmujesz, to odjemnik, a wynik to różnica.

W mnożeniu liczby, które mnożysz, nazywają się czynnikami, a wynik to iloczyn. W dzieleniu liczba, którą dzielisz, to dzielna, liczba, przez którą dzielisz, to dzielnik, a wynik to iloraz.

Te same trzy liczby działają w obie strony: skoro osiem plus pięć daje trzynaście, to trzynaście minus pięć daje osiem, a trzynaście minus osiem daje pięć — jedna rodzina liczb, trzy prawdziwe równania. Dokładnie tak samo jest z mnożeniem i dzieleniem. Odejmowanie odwraca dodawanie, a dzielenie odwraca mnożenie.

Tych słów szukaj w poleceniach zadań: „oblicz sumę” znaczy dodaj, „jaka jest różnica” znaczy odejmij, „znajdź iloczyn” znaczy pomnóż, a „oblicz iloraz” znaczy podziel.`;

interface SummaryDisplayProps {
  color: string;
}

export function SummaryDisplay({ color }: SummaryDisplayProps) {
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  return (
    <div className="space-y-4 text-sm leading-relaxed sm:text-base">
      <p>
        <strong className="font-mono" style={{ color }}>
          8 + 5 = 13
        </strong>
        ,{' '}
        <strong className="font-mono" style={{ color }}>
          4 × 3 = 12
        </strong>{' '}
        — te wyniki policzysz bez trudu. Ten przewodnik uczy czegoś innego: jak nazywają się
        poszczególne liczby w tych działaniach.
      </p>
      <p>
        W dodawaniu liczby, które dodajesz, to <strong style={{ color: textColor }}>składniki</strong>,
        a wynik to <strong style={{ color: textColor }}>suma</strong>. W odejmowaniu:{' '}
        <strong style={{ color: textColor }}>odjemna</strong> minus{' '}
        <strong style={{ color: textColor }}>odjemnik</strong> daje{' '}
        <strong style={{ color: textColor }}>różnicę</strong>.
      </p>
      <p>
        W mnożeniu liczby, które mnożysz, to <strong style={{ color: textColor }}>czynniki</strong>,
        a wynik to <strong style={{ color: textColor }}>iloczyn</strong>. W dzieleniu:{' '}
        <strong style={{ color: textColor }}>dzielna</strong> podzielona przez{' '}
        <strong style={{ color: textColor }}>dzielnik</strong> daje{' '}
        <strong style={{ color: textColor }}>iloraz</strong>.
      </p>
      <p>
        Te same trzy liczby działają w obie strony: skoro 8 + 5 = 13, to także 13 − 5 = 8 i
        13 − 8 = 5 — jedna rodzina, trzy równania. Odejmowanie odwraca dodawanie, dzielenie
        odwraca mnożenie.
      </p>
      <p className="text-muted-foreground">
        Szukaj tych słów w poleceniach zadań: „oblicz sumę”, „jaka jest różnica”, „znajdź
        iloczyn”, „oblicz iloraz”.
      </p>
    </div>
  );
}
