/**
 * Streszczenie przewodnika „Jednostki pola” w dwóch wariantach:
 * `SUMMARY_PLAIN_TEXT` to czysty tekst do syntezy mowy — symbole (cm², m², ha)
 * są w nim rozpisane słownie, bo lektor przeczytałby „cm2” jako „cm dwa”.
 * `SummaryDisplay` renderuje tę samą treść do czytania wzrokiem, tam symbole
 * zostają symbolami. Te dwa miejsca trzeba aktualizować razem.
 */
export const SUMMARY_PLAIN_TEXT = `Jednostka pola to zawsze kwadrat. Jeden centymetr kwadratowy to pole kwadratu o boku jednego centymetra, jeden metr kwadratowy — o boku jednego metra. Dlatego przy symbolu stoi dwójka w górze: bok został wzięty dwa razy, raz wzdłuż i raz w poprzek.

Stąd bierze się najważniejsza rzecz w tym przewodniku. Kiedy bok kwadratu wydłuża się dziesięć razy, pole nie rośnie dziesięć razy, tylko sto. Podział działa bowiem w obu kierunkach naraz: dziesięć części wzdłuż i dziesięć w poprzek daje sto kratek.

Dlatego sąsiednie jednostki pola dzieli sto, a nie dziesięć. Jeden centymetr kwadratowy to sto milimetrów kwadratowych. Jeden decymetr kwadratowy to sto centymetrów kwadratowych. Jeden metr kwadratowy to sto decymetrów kwadratowych, czyli już milion milimetrów kwadratowych.

Do dużych powierzchni służą jeszcze trzy jednostki. Ar to kwadrat o boku dziesięciu metrów, czyli sto metrów kwadratowych. Hektar to kwadrat o boku stu metrów, czyli sto arów i dziesięć tysięcy metrów kwadratowych. Kilometr kwadratowy to kwadrat o boku kilometra, czyli sto hektarów i milion metrów kwadratowych.

Cała drabinka — od milimetra kwadratowego, przez centymetr, decymetr, metr, ar i hektar, aż po kilometr kwadratowy — idzie równym krokiem po sto, bez ani jednego wyjątku. Drabinka długości ma wyjątek przy kilometrze, drabinka pola nie ma żadnego.

Na koniec praktyczna rada. Dobrze dobrana jednostka to taka, przy której wynik jest liczbą od kilku do kilkuset. Znaczek pocztowy mierz w centymetrach kwadratowych, podłogę pokoju w metrach kwadratowych, boisko w hektarach, a miasto w kilometrach kwadratowych.`;

interface SummaryDisplayProps {
  color: string;
}

export function SummaryDisplay({ color }: SummaryDisplayProps) {
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  return (
    <div className="space-y-4 text-sm leading-relaxed sm:text-base">
      <p>
        <strong style={{ color: textColor }}>Jednostka pola to zawsze kwadrat.</strong> 1 cm² to pole
        kwadratu o boku 1 cm, 1 m² — o boku 1 m. Dwójka w górze mówi, że bok został wzięty dwa razy:
        raz wzdłuż i raz w poprzek.
      </p>
      <p>
        Stąd najważniejsza rzecz w tym przewodniku: gdy bok rośnie{' '}
        <strong style={{ color: textColor }}>10 razy</strong>, pole rośnie{' '}
        <strong style={{ color: textColor }}>100 razy</strong> — bo podział działa w obu kierunkach
        naraz.
      </p>
      <p>
        Dlatego sąsiednie jednostki pola dzieli 100, a nie 10: 1 cm² = 100 mm², 1 dm² = 100 cm²,
        1 m² = 100 dm² (czyli już 1 000 000 mm²).
      </p>
      <p>
        Do dużych powierzchni: 1 ar to kwadrat o boku 10 m (100 m²), 1 hektar to kwadrat o boku
        100 m (100 arów, 10 000 m²), a 1 km² to 100 hektarów i milion m².
      </p>
      <p className="text-muted-foreground">
        Cała drabinka mm² → cm² → dm² → m² → ar → hektar → km² idzie równym krokiem ×100, bez ani
        jednego wyjątku. Dobrze dobrana jednostka to taka, przy której wynik ma od kilku do kilkuset.
      </p>
    </div>
  );
}
