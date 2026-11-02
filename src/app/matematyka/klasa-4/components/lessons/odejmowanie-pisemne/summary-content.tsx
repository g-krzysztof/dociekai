/**
 * Streszczenie lekcji „Odejmowanie pisemne" w dwóch wariantach — ta sama
 * dyscyplina co przewodnikowe `summary-content.tsx`: `SUMMARY_PLAIN_TEXT` to
 * czysty ciąg znaków ze słownie zapisanymi liczbami (payload do syntezy
 * mowy), `SummaryDisplay` to ta sama treść jako czytelny tekst w modalu, z
 * liczbami jako cyframi.
 *
 * Pierwsze użycie `<SummaryPlayer>` poza przewodnikiem — tu celowo na końcu
 * lekcji, przy Ściądze, a nie w nagłówku jak w każdym przewodniku dotąd.
 */
export const SUMMARY_PLAIN_TEXT = `Odejmowanie pisemne liczymy tak samo jak dodawanie — kolumna po kolumnie, zawsze od jedności w lewo. Różnica pojawia się, gdy górna cyfra jest mniejsza od dolnej: wtedy pożyczamy dziesięć z sąsiedniej kolumny po lewej, przekreślając jej cyfrę i zapisując nad nią cyfrę o jeden mniejszą.

Czasem ta sąsiednia kolumna ma zapisane zero, a zero nie ma nic do oddania. Wtedy ona sama najpierw pożycza od swojego sąsiada, i dopiero z tą pożyczką może oddać dziesiątkę dalej. Pożyczka potrafi w ten sposób przejść przez kilka kolejnych zer, zanim w końcu dotrze do pierwszej cyfry, która naprawdę ma czym się podzielić.

Ta sama zasada odpowiada za każdą pożyczoną resztę — od prostego sześćdziesiąt trzy minus dwadzieścia osiem, po tysiąc minus jeden, gdzie pożyczka przechodzi przez trzy zera naraz.`;

interface SummaryDisplayProps {
  color: string;
}

export function SummaryDisplay({ color }: SummaryDisplayProps) {
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  return (
    <div className="space-y-4 text-sm leading-relaxed sm:text-base">
      <p>
        Odejmowanie pisemne liczymy tak samo jak dodawanie — kolumna po kolumnie, zawsze od
        jedności w lewo. Różnica pojawia się, gdy górna cyfra jest mniejsza od dolnej.
      </p>
      <p>
        <strong style={{ color: textColor }}>Pożyczanie:</strong> gdy górna cyfra jest mniejsza od
        dolnej, pożyczamy{' '}
        <strong className="font-mono" style={{ color }}>
          10
        </strong>{' '}
        z sąsiedniej kolumny po lewej — jej cyfrę przekreślamy i zapisujemy nad nią cyfrę o jeden
        mniejszą.
      </p>
      <p>
        <strong style={{ color: textColor }}>Pożyczanie od zer:</strong> gdy ta sąsiednia kolumna
        ma zapisane zero, sama nic nie ma do oddania — więc najpierw pożycza od swojego sąsiada.
        Pożyczka może przejść przez kilka zer z rzędu, zanim dotrze do pierwszej cyfry, która
        naprawdę ma czym się podzielić.
      </p>
      <p className="text-muted-foreground">
        Ta sama zasada odpowiada za każdą pożyczoną resztę — od{' '}
        <span className="font-mono">63 − 28</span> po{' '}
        <span className="font-mono">1000 − 1</span>, gdzie pożyczka przechodzi przez trzy zera
        naraz.
      </p>
    </div>
  );
}
