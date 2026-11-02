/**
 * Streszczenie przewodnika „Liczby, cyfry i oś liczbowa" w dwóch wariantach:
 * `SUMMARY_PLAIN_TEXT` to czysty ciąg znaków bez formatowania — docelowo payload
 * do API syntezy mowy (TTS), więc każda liczba jest zapisana słownie (naturalna
 * mowa, nie cyfry — TTS czyta cyfry nienaturalnie). `SummaryDisplay` renderuje
 * tę samą treść jako czytelny, ostylowany tekst w modalu, tam liczby zostają w
 * postaci cyfr, bo to tekst do czytania wzrokiem, nie do syntezy — te dwa
 * miejsca trzeba aktualizować razem, żeby się nie rozjechały treściowo.
 */
export const SUMMARY_PLAIN_TEXT = `Sekund w roku jest aż trzydzieści jeden milionów pięćset trzydzieści sześć tysięcy — osiem cyfr, które trudno przeczytać jednym tchem. Ten przewodnik pokazuje, jak sobie z tym poradzić.

Cyfr jest tylko dziesięć — to znaki, którymi zapisujesz każdą liczbę. Liczb jest nieskończenie wiele, bo liczy się to, co z tych cyfr ułożysz. Kolejność ma znaczenie: te same cztery cyfry — dwa, zero, dwa i sześć — dają zupełnie różne liczby, zależnie od ustawienia.

Ta sama cyfra znaczy co innego w zależności od miejsca, na którym stoi — piątka na miejscu jedności to po prostu pięć, ale ta sama piątka na miejscu dziesiątek to już pięćdziesiąt. Rzędy grupują się po trzy w klasy: jedności, tysiące, miliony. Dzięki temu długą liczbę czytasz klasa po klasie, zamiast liczyć cyfry jedna po drugiej.

Oś liczbowa to prosta linia, na której liczby stoją w kolejności, w równych odstępach. Zero to początek, a im dalej w prawo, tym liczba większa.

Te same zasady spotkasz wszędzie: w liczniku samochodu, na tablicy wyników, w cenie mieszkania czy w numerze strony książki.`;

interface SummaryDisplayProps {
  color: string;
}

export function SummaryDisplay({ color }: SummaryDisplayProps) {
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  return (
    <div className="space-y-4 text-sm leading-relaxed sm:text-base">
      <p>
        Sekund w roku jest aż{' '}
        <strong className="font-mono tabular-nums" style={{ color }}>
          31 536 000
        </strong>{' '}
        — osiem cyfr, które trudno przeczytać jednym tchem. Ten przewodnik pokazuje, jak sobie z
        tym poradzić.
      </p>
      <p>
        Cyfr jest tylko <strong style={{ color: textColor }}>dziesięć</strong> — to znaki, którymi
        zapisujesz każdą liczbę. Liczb jest nieskończenie wiele, bo liczy się to, co z tych cyfr
        ułożysz. Kolejność ma znaczenie: te same cyfry 2, 0, 2, 6 dają zupełnie różne liczby,
        zależnie od ustawienia.
      </p>
      <p>
        Ta sama cyfra znaczy co innego w zależności od{' '}
        <strong style={{ color: textColor }}>miejsca</strong>, na którym stoi — 5 to pięć jedności,
        ale 50 to pięć dziesiątek. Rzędy grupują się po trzy w{' '}
        <strong style={{ color: textColor }}>klasy</strong>: jedności, tysiące, miliony. Dzięki
        temu długą liczbę czytasz klasa po klasie, zamiast liczyć cyfry jedna po drugiej.
      </p>
      <p>
        <strong style={{ color: textColor }}>Oś liczbowa</strong> to prosta linia, na której liczby
        stoją w kolejności, w równych odstępach. Zero to początek, a im dalej w prawo, tym liczba
        większa.
      </p>
      <p className="text-muted-foreground">
        Te same zasady spotkasz wszędzie: w liczniku samochodu, na tablicy wyników, w cenie
        mieszkania czy w numerze strony książki.
      </p>
    </div>
  );
}
