/**
 * Streszczenie przewodnika „Jednostki objętości” w dwóch wariantach:
 * `SUMMARY_PLAIN_TEXT` to czysty tekst do syntezy mowy — symbole (cm³, dm³, m³)
 * są w nim rozpisane słownie, bo lektor przeczytałby „cm3” jako „cm trzy”.
 * `SummaryDisplay` renderuje tę samą treść do czytania wzrokiem, tam symbole
 * zostają symbolami. Te dwa miejsca trzeba aktualizować razem.
 */
export const SUMMARY_PLAIN_TEXT = `Jednostka objętości to zawsze sześcian. Jeden centymetr sześcienny to objętość sześcianu o krawędzi jednego centymetra, jeden metr sześcienny — o krawędzi jednego metra. Dlatego przy symbolu stoi trójka w górze: krawędź została wzięta trzy razy, raz wzdłuż, raz w poprzek i raz na wysokość.

Stąd bierze się najważniejsza rzecz w tym przewodniku. Kiedy krawędź sześcianu wydłuża się dziesięć razy, objętość nie rośnie dziesięć razy ani sto, tylko tysiąc. Podział działa bowiem we wszystkich trzech kierunkach naraz: dziesięć kostek wzdłuż i dziesięć w poprzek daje sto kostek w jednej warstwie, a warstw jest dziesięć.

Dlatego sąsiednie jednostki objętości dzieli tysiąc. Jeden centymetr sześcienny to tysiąc milimetrów sześciennych. Jeden decymetr sześcienny to tysiąc centymetrów sześciennych. Jeden metr sześcienny to tysiąc decymetrów sześciennych, czyli już milion centymetrów sześciennych.

Teraz druga połowa tego tematu. Objętość ma dwa zestawy nazw, a nie jeden. Mililitr i litr to nie jest inna wielkość niż centymetr i decymetr sześcienny — to ta sama wielkość nazwana inaczej. Jeden mililitr to jeden centymetr sześcienny. Jeden litr to jeden decymetr sześcienny, czyli sześcian o krawędzi dziesięciu centymetrów. A tysiąc litrów to jeden metr sześcienny.

To dlatego butelka półtoralitrowa mieści dokładnie półtora decymetra sześciennego, a rachunek za wodę, który podaje zużycie w metrach sześciennych, mówi tak naprawdę o tysiącach litrów. Liczba jest ta sama, zmienia się tylko słownik.

Na koniec praktyczna rada. Dobrze dobrana jednostka to taka, przy której wynik jest liczbą od kilku do kilkuset. Kostkę cukru mierz w centymetrach sześciennych, lekarstwo w mililitrach, wodę w wannie w litrach, a beton na budowie w metrach sześciennych.`;

interface SummaryDisplayProps {
  color: string;
}

export function SummaryDisplay({ color }: SummaryDisplayProps) {
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  return (
    <div className="space-y-4 text-sm leading-relaxed sm:text-base">
      <p>
        <strong style={{ color: textColor }}>Jednostka objętości to zawsze sześcian.</strong> 1 cm³
        to objętość sześcianu o krawędzi 1 cm, 1 m³ — o krawędzi 1 m. Trójka w górze mówi, że
        krawędź została wzięta trzy razy: wzdłuż, w poprzek i na wysokość.
      </p>
      <p>
        Stąd najważniejsza rzecz w tym przewodniku: gdy krawędź rośnie{' '}
        <strong style={{ color: textColor }}>10 razy</strong>, objętość rośnie{' '}
        <strong style={{ color: textColor }}>1000 razy</strong> — 100 kostek w warstwie razy 10
        warstw.
      </p>
      <p>
        Dlatego sąsiednie jednostki objętości dzieli 1000: 1 cm³ = 1000 mm³, 1 dm³ = 1000 cm³,
        1 m³ = 1000 dm³ (czyli już 1 000 000 cm³).
      </p>
      <p>
        Druga połowa tematu: <strong style={{ color: textColor }}>1 ml = 1 cm³</strong> i{' '}
        <strong style={{ color: textColor }}>1 l = 1 dm³</strong>, a 1000 l = 1 m³. Mililitry i litry
        to nie inna wielkość, tylko ta sama pod inną nazwą — dlatego butelka „1,5 l” mieści 1,5 dm³,
        a silnik „1600 cm³” to silnik 1,6-litrowy.
      </p>
      <p className="text-muted-foreground">
        Dobrze dobrana jednostka to taka, przy której wynik ma od kilku do kilkuset: kostka cukru w
        cm³, lekarstwo w ml, woda w wannie w litrach, beton na budowie w m³.
      </p>
    </div>
  );
}
