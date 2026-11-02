/**
 * Streszczenie przewodnika „Zapis działań pisemnych" w dwóch wariantach:
 * `SUMMARY_PLAIN_TEXT` to czysty ciąg znaków bez formatowania — payload do
 * syntezy mowy (TTS), więc liczby są zapisane słownie. `SummaryDisplay`
 * renderuje tę samą treść jako czytelny, ostylowany tekst w modalu — tam
 * liczby zostają jako cyfry, bo to tekst do czytania wzrokiem, nie do
 * syntezy — te dwa miejsca trzeba aktualizować razem, żeby się nie
 * rozjechały treściowo.
 */
export const SUMMARY_PLAIN_TEXT = `Zanim zaczniesz liczyć dodawanie i odejmowanie w słupku, warto poznać sam zapis — bo trzy jego elementy powtarzają się w każdym działaniu pisemnym.

Pierwszy element to ustawianie liczb. Cyfry ustawiamy jedna pod drugą tak, żeby te same miejsca dziesiętne stały w jednej kolumnie: jedności pod jednościami, dziesiątki pod dziesiątkami, setki pod setkami — licząc zawsze od prawej strony. Gdy jedna liczba jest krótsza od drugiej, jej brakujące kolumny po prostu zostają puste. Nigdy nie ustawiamy liczb według tego, którą cyfrę zapisaliśmy jako pierwszą — liczy się wyłącznie miejsce dziesiętne.

Drugi element to przenoszenie, używane przy dodawaniu. Gdy suma cyfr w jednej kolumnie wynosi dziesięć lub więcej, zapisujemy w wyniku tylko jej cyfrę jedności, a drugą dziesiątkę przenosimy małą jedynką nad sąsiednią kolumnę po lewej stronie. Tę przeniesioną jedynkę doliczamy razem z pozostałymi cyframi tamtej kolumny.

Trzeci element to pożyczanie, używane przy odejmowaniu. Gdy górna cyfra w kolumnie jest mniejsza od dolnej, nie da się jej odjąć wprost. Wtedy pożyczamy dziesięć z sąsiedniej kolumny po lewej stronie: jej cyfrę przekreślamy i zapisujemy nad nią cyfrę o jeden mniejszą, a do bieżącej kolumny dopisujemy dziesięć, dzięki czemu odejmowanie staje się możliwe.

Te trzy zasady — ustawianie, przenoszenie i pożyczanie — będą się powtarzać w każdej kolejnej lekcji tego działu: przy dodawaniu, odejmowaniu, a później także przy mnożeniu i dzieleniu pisemnym.`;

interface SummaryDisplayProps {
  color: string;
}

export function SummaryDisplay({ color }: SummaryDisplayProps) {
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  return (
    <div className="space-y-4 text-sm leading-relaxed sm:text-base">
      <p>
        Zanim zaczniesz liczyć dodawanie i odejmowanie w słupku, warto poznać sam zapis — trzy
        jego elementy powtarzają się w każdym działaniu pisemnym.
      </p>
      <p>
        <strong style={{ color: textColor }}>Ustawianie liczb:</strong> cyfry stają jedna pod
        drugą według miejsca dziesiętnego (jedności pod jednościami, dziesiątki pod
        dziesiątkami), licząc od prawej strony. Krótsza liczba zostaje wysunięta w prawo, jej
        brakujące kolumny zostają puste.
      </p>
      <p>
        <strong style={{ color: textColor }}>Przenoszenie</strong> (dodawanie): gdy suma w
        kolumnie to{' '}
        <strong className="font-mono" style={{ color }}>
          10
        </strong>{' '}
        lub więcej, zapisujemy tylko cyfrę jedności, a „1” przenosimy małą cyfrą nad kolumnę po
        lewej.
      </p>
      <p>
        <strong style={{ color: textColor }}>Pożyczanie</strong> (odejmowanie): gdy górna cyfra
        jest mniejsza od dolnej, pożyczamy{' '}
        <strong className="font-mono" style={{ color }}>
          10
        </strong>{' '}
        z sąsiedniej kolumny po lewej — jej cyfrę przekreślamy i zapisujemy nad nią cyfrę o jeden
        mniejszą.
      </p>
      <p className="text-muted-foreground">
        Te trzy zasady wrócą w każdej kolejnej lekcji tego działu — przy dodawaniu, odejmowaniu, a
        później przy mnożeniu i dzieleniu pisemnym.
      </p>
    </div>
  );
}
