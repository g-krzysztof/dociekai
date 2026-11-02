/**
 * Streszczenie przewodnika „Język brył" w dwóch wariantach:
 * `SUMMARY_PLAIN_TEXT` to czysty ciąg znaków bez formatowania — payload do
 * syntezy mowy (TTS), więc liczby są zapisane słownie. `SummaryDisplay`
 * renderuje tę samą treść jako ostylowany tekst w modalu, gdzie liczby zostają
 * cyframi, bo to tekst do czytania wzrokiem. Te dwa miejsca aktualizuje się
 * razem, żeby się nie rozjechały treściowo.
 */
export const SUMMARY_PLAIN_TEXT = `Figura płaska mieści się cała na kartce — ma tylko długość i szerokość. Bryła zajmuje miejsce w przestrzeni, bo ma jeszcze trzeci wymiar: grubość.

Powierzchnia bryły składa się ze ścian. Ściana to płaski kawałek powierzchni bryły. Krawędź to odcinek, wzdłuż którego stykają się dwie ściany. Wierzchołek to punkt, w którym schodzą się krawędzie. Prostopadłościan ma sześć ścian, dwanaście krawędzi i osiem wierzchołków.

Bryłę rysuje się na płaskiej kartce, więc część krawędzi zawsze jest zasłonięta. Umowa jest taka: krawędzie widoczne rysujemy linią ciągłą, a zasłonięte linią przerywaną. Dlatego z płaskiego rysunku wiadomo, że pudełko ma sześć ścian, chociaż naraz widać najwyżej trzy.

Sześcian to prostopadłościan, którego wszystkie krawędzie są równej długości — wtedy każda jego ściana jest kwadratem. Każdy sześcian jest prostopadłościanem, ale nie każdy prostopadłościan jest sześcianem.

Oprócz prostopadłościanu warto znać jeszcze pięć brył. Graniastosłup ma dwie identyczne podstawy, a między nimi ściany boczne. Ostrosłup ma jedną podstawę i ściany boczne schodzące się w jednym wierzchołku na górze. Walec, stożek i kula mają powierzchnie zaokrąglone — a kula nie ma ani jednej krawędzi i ani jednego wierzchołka.`;

interface SummaryDisplayProps {
  color: string;
}

export function SummaryDisplay({ color }: SummaryDisplayProps) {
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  return (
    <div className="space-y-4 text-sm leading-relaxed sm:text-base">
      <p>
        <strong style={{ color: textColor }}>Figura płaska</strong> mieści się cała na kartce — ma
        tylko długość i szerokość. <strong style={{ color: textColor }}>Bryła</strong> zajmuje
        miejsce w przestrzeni, bo ma jeszcze trzeci wymiar: grubość.
      </p>
      <p>
        <strong style={{ color: textColor }}>Ściana</strong> to płaski kawałek powierzchni bryły.{' '}
        <strong style={{ color: textColor }}>Krawędź</strong> to odcinek, wzdłuż którego stykają się
        dwie ściany. <strong style={{ color: textColor }}>Wierzchołek</strong> to punkt, w którym
        schodzą się krawędzie.
      </p>
      <p>
        <strong className="font-mono" style={{ color }}>
          6 ścian · 12 krawędzi · 8 wierzchołków
        </strong>{' '}
        — tyle ma każdy prostopadłościan, niezależnie od wymiarów.
      </p>
      <p>
        Na rysunku krawędzie widoczne kreśli się linią ciągłą, a zasłonięte —{' '}
        <strong style={{ color: textColor }}>linią przerywaną</strong>. Dlatego z płaskiego rysunku
        wiadomo, że pudełko ma sześć ścian, choć naraz widać najwyżej trzy.
      </p>
      <p>
        <strong style={{ color: textColor }}>Sześcian</strong> to prostopadłościan o wszystkich
        krawędziach równej długości — wtedy każda ściana jest kwadratem. Każdy sześcian jest
        prostopadłościanem, ale nie odwrotnie.
      </p>
      <p className="text-muted-foreground">
        Poza prostopadłościanem warto znać graniastosłup (dwie identyczne podstawy), ostrosłup
        (jedna podstawa i jeden szczyt) oraz walec, stożek i kulę — te trzy mają powierzchnie
        zaokrąglone, a kula nie ma ani jednej krawędzi i ani jednego wierzchołka.
      </p>
    </div>
  );
}
