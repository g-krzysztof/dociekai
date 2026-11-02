/**
 * Streszczenie przewodnika „Słownik ułamków” w dwóch wariantach:
 * `SUMMARY_PLAIN_TEXT` to czysty ciąg znaków bez formatowania — payload do
 * syntezy mowy (TTS), więc każda liczba jest zapisana słownie.
 * `SummaryDisplay` renderuje tę samą treść jako czytelny, ostylowany tekst w
 * modalu — tam zapis ułamka (np. „3/8”) zostaje symboliczny, bo to tekst do
 * czytania wzrokiem, nie do syntezy — te dwa miejsca trzeba aktualizować
 * razem, żeby się nie rozjechały treściowo.
 */
export const SUMMARY_PLAIN_TEXT = `Ułamek to dwie liczby oddzielone poziomą kreską. Pokazuje, jaką część całości bierzesz — na przykład trzy z ośmiu kawałków pizzy.

Liczba pod kreską to mianownik. Mówi, na ile równych części podzielono całość. Liczba nad kreską to licznik. Mówi, ile z tych części bierzesz albo zamalowujesz.

Ten sam pomysł działa nie tylko dla podzielonego kształtu, ale też dla grupy osobnych przedmiotów — na przykład sześciu kredek w pudełku.

Ułamek właściwy to taki, w którym licznik jest mniejszy od mianownika — jest wtedy zawsze mniejszy niż jedna całość. Gdy licznik jest równy mianownikowi, masz całą całość. A gdy licznik jest większy od mianownika, masz więcej niż jedną całość — to ułamek niewłaściwy.

Ułamki spotkasz wszędzie: w pokrojonej pizzy, w tabliczce czekolady podzielonej na kostki, w kwadransie jako jednej czwartej godziny, a nawet w przepisie kulinarnym, gdzie „pół szklanki” to inny zapis ułamka jeden przez dwa.`;

interface SummaryDisplayProps {
  color: string;
}

export function SummaryDisplay({ color }: SummaryDisplayProps) {
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  return (
    <div className="space-y-4 text-sm leading-relaxed sm:text-base">
      <p>
        <strong style={{ color: textColor }}>Ułamek</strong> to dwie liczby oddzielone poziomą
        kreską. Pokazuje, jaką część całości bierzesz — na przykład 3 z 8 kawałków pizzy.
      </p>
      <p>
        Liczba pod kreską to <strong style={{ color: textColor }}>mianownik</strong> — mówi, na
        ile równych części podzielono całość. Liczba nad kreską to{' '}
        <strong style={{ color: textColor }}>licznik</strong> — mówi, ile z tych części bierzesz.
      </p>
      <p>
        Ten sam pomysł działa nie tylko dla podzielonego kształtu, ale i dla grupy osobnych
        przedmiotów, np. kredek w pudełku.
      </p>
      <p>
        <strong style={{ color: textColor }}>Ułamek właściwy</strong> ma licznik mniejszy od
        mianownika — jest zawsze mniejszy niż jedna całość. Licznik równy mianownikowi to cała
        całość, a licznik większy od mianownika to ułamek niewłaściwy.
      </p>
      <p className="text-muted-foreground">
        Pizza, tabliczka czekolady, kwadrans jako 1/4 godziny, „pół szklanki” w przepisie — ułamki
        są wszędzie.
      </p>
    </div>
  );
}
