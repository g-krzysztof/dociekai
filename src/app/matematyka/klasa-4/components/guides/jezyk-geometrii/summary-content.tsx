/**
 * Streszczenie przewodnika „Język geometrii" w dwóch wariantach:
 * `SUMMARY_PLAIN_TEXT` to czysty ciąg znaków bez formatowania — payload do
 * syntezy mowy (TTS), więc symbole (⊥, ∥, °) są zapisane słownie, tak jak w
 * innych przewodnikach liczby są zapisane słownie. `SummaryDisplay`
 * renderuje tę samą treść jako czytelny, ostylowany tekst w modalu — tam
 * symbole zostają jako znaki, bo to tekst do czytania wzrokiem, nie do
 * syntezy — te dwa miejsca trzeba aktualizować razem, żeby się nie
 * rozjechały treściowo.
 */
export const SUMMARY_PLAIN_TEXT = `Zanim zaczniesz rysować i mierzyć figury geometryczne, warto poznać sam język, którym się o nich mówi — bo te same nazwy i symbole będą się powtarzać w każdej kolejnej lekcji tego działu.

Punkt oznaczamy jedną wielką literą, na przykład A albo B. To najprostszy obiekt w geometrii — miejsce bez rozmiaru.

Prostą oznaczamy dwiema literami punktów, które na niej leżą, na przykład prosta AB, albo jedną małą literą, na przykład prosta k. Prosta biegnie w nieskończoność w obie strony, a kolejność liter nie ma znaczenia — prosta AB to ta sama prosta co BA.

Odcinek ma dwa równorzędne końce i też nie ma znaczenia kolejność liter — odcinek AB to to samo co odcinek BA.

Półprosta ma tylko jeden początek i biegnie w nieskończoność w jedną stronę. Tutaj kolejność liter ma ogromne znaczenie — pierwsza litera to zawsze punkt startowy. Półprosta AB zaczyna się w punkcie A, a półprosta BA zaczynałaby się w punkcie B i biegła w zupełnie inną stronę.

Kąt oznaczamy trzema literami, a środkowa litera to zawsze wierzchołek kąta — na przykład kąt ABC ma wierzchołek w punkcie B. Wielkość kąta mierzymy w stopniach.

Na koniec dwa przydatne symbole: znak prostopadłości mówi, że dwie proste przecinają się pod kątem prostym, a znak równoległości mówi, że dwie proste nigdy się nie przetną i zawsze zostają w tej samej odległości od siebie.

Te nazwy i symbole będą wracać w każdej kolejnej lekcji tego działu — przy rysowaniu prostych i odcinków, mierzeniu kątów, wielokątach i kołach.`;

interface SummaryDisplayProps {
  color: string;
}

export function SummaryDisplay({ color }: SummaryDisplayProps) {
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  return (
    <div className="space-y-4 text-sm leading-relaxed sm:text-base">
      <p>
        Zanim zaczniesz rysować i mierzyć figury, warto poznać sam język geometrii — te same nazwy
        i symbole wracają w każdej kolejnej lekcji tego działu.
      </p>
      <p>
        <strong style={{ color: textColor }}>Punkt:</strong> jedna wielka litera, np.{' '}
        <span className="font-mono" style={{ color }}>
          A
        </span>
        .
      </p>
      <p>
        <strong style={{ color: textColor }}>Prosta:</strong> dwie litery punktów na niej (
        <span className="font-mono" style={{ color }}>
          prosta AB
        </span>
        ) albo jedna mała litera; biegnie w nieskończoność w obie strony, kolejność liter bez
        znaczenia.
      </p>
      <p>
        <strong style={{ color: textColor }}>Odcinek:</strong> dwa równorzędne końce, kolejność
        liter bez znaczenia —{' '}
        <span className="font-mono" style={{ color }}>
          AB
        </span>{' '}
        ={' '}
        <span className="font-mono" style={{ color }}>
          BA
        </span>
        .
      </p>
      <p>
        <strong style={{ color: textColor }}>Półprosta:</strong> jeden początek, kolejność liter
        ma znaczenie — pierwsza litera to zawsze start.
      </p>
      <p>
        <strong style={{ color: textColor }}>Kąt:</strong> trzy litery, środkowa to wierzchołek (
        <span className="font-mono" style={{ color }}>
          ∠ABC
        </span>
        ), mierzony w{' '}
        <span className="font-mono" style={{ color }}>
          °
        </span>
        .
      </p>
      <p className="text-muted-foreground">
        Dwa symbole na później:{' '}
        <span className="font-mono" style={{ color }}>
          ⊥
        </span>{' '}
        — prostopadłość,{' '}
        <span className="font-mono" style={{ color }}>
          ∥
        </span>{' '}
        — równoległość.
      </p>
    </div>
  );
}
