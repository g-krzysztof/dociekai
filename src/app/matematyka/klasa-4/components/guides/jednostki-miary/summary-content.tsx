/**
 * Streszczenie przewodnika „Jednostki długości i masy" w dwóch wariantach:
 * `SUMMARY_PLAIN_TEXT` to czysty ciąg znaków bez formatowania — payload do
 * syntezy mowy (TTS), więc liczby są zapisane słownie. `SummaryDisplay`
 * renderuje tę samą treść jako czytelny, ostylowany tekst w modalu — tam
 * liczby i jednostki zostają jako cyfry/skróty, bo to tekst do czytania
 * wzrokiem, nie do syntezy — te dwa miejsca trzeba aktualizować razem, żeby
 * się nie rozjechały treściowo.
 */
export const SUMMARY_PLAIN_TEXT = `Milimetr, centymetr, decymetr, metr, kilometr, gram, dekagram, kilogram, tona — dziewięć słów, które wyglądają jak dziewięć osobnych rzeczy do zapamiętania. To nieprawda. To jedna zasada, powtórzona dwa razy.

Każda jednostka długości i masy to jednostka bazowa — metr albo gram — z doczepionym przedrostkiem, który zawsze znaczy to samo. Mili- to zawsze jedna tysięczna. Centy- to zawsze jedna setna. Decy- to zawsze jedna dziesiąta. Deka- to zawsze dziesięć razy więcej. Kilo- to zawsze tysiąc razy więcej — czy to przy metrze, czy przy gramie.

Długość korzysta z czterech przedrostków: milimetr, centymetr, decymetr i kilometr. Masa korzysta tylko z dwóch: dekagram i kilogram — mili-, centy- i decygram w praktyce się nie stosuje, bo gram sam w sobie jest już wystarczająco małą jednostką.

Tona to wyjątek — to nie przedrostek doczepiony do słowa gram, tylko osobne słowo na tysiąc kilogramów, czyli milion gramów.

Zamieniając na mniejszą jednostkę, zawsze mnożysz. Zamieniając na większą, zawsze dzielisz. Ta sama zasada wróci jeszcze nie raz — na przykład przy mililitrze i litrze.`;

interface SummaryDisplayProps {
  color: string;
}

export function SummaryDisplay({ color }: SummaryDisplayProps) {
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  return (
    <div className="space-y-4 text-sm leading-relaxed sm:text-base">
      <p>
        <strong className="font-mono" style={{ color }}>
          mm, cm, dm, m, km, g, dag, kg, t
        </strong>{' '}
        — dziewięć słów, które wyglądają jak dziewięć osobnych rzeczy do zapamiętania. To
        nieprawda. To jedna zasada, powtórzona dwa razy.
      </p>
      <p>
        Każda jednostka to jednostka bazowa —{' '}
        <strong style={{ color: textColor }}>metr</strong> albo{' '}
        <strong style={{ color: textColor }}>gram</strong> — z doczepionym przedrostkiem, który
        zawsze znaczy to samo:{' '}
        <strong style={{ color: textColor }}>mili-</strong> to ÷1000,{' '}
        <strong style={{ color: textColor }}>centy-</strong> to ÷100,{' '}
        <strong style={{ color: textColor }}>decy-</strong> to ÷10,{' '}
        <strong style={{ color: textColor }}>deka-</strong> to ×10, a{' '}
        <strong style={{ color: textColor }}>kilo-</strong> to ×1000.
      </p>
      <p>
        Długość korzysta z czterech przedrostków (mm, cm, dm, km). Masa korzysta tylko z dwóch
        (dag, kg) — mili-, centy- i decygram w praktyce się nie stosuje.
      </p>
      <p>
        Tona to wyjątek: nie przedrostek, tylko osobne słowo na 1000 kg, czyli milion gramów.
      </p>
      <p className="text-muted-foreground">
        Zamieniając na mniejszą jednostkę — mnożysz. Zamieniając na większą — dzielisz.
      </p>
    </div>
  );
}
