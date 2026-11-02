/**
 * Streszczenie przewodnika „Zapis dziesiętny” w dwóch wariantach:
 * `SUMMARY_PLAIN_TEXT` to czysty ciąg znaków bez formatowania — payload do
 * syntezy mowy (TTS), więc każda liczba jest zapisana słownie (lektor czytający
 * „0,05” potrafi powiedzieć „zero przecinek zero pięć”, a to nie jest odczyt,
 * którego uczy ten przewodnik). `SummaryDisplay` renderuje tę samą treść jako
 * ostylowany tekst w modalu — tam liczby zostają zapisane cyframi, bo to tekst
 * do czytania wzrokiem. Te dwa miejsca trzeba aktualizować razem.
 */
export const SUMMARY_PLAIN_TEXT = `Przecinek w liczbie oddziela całości od części całości. Przed nim stoją całe sztuki, za nim — kawałki jednej sztuki. Na przykład cena bułki, trzy całe i dwadzieścia pięć setnych złotego, to trzy złote i jeszcze dwadzieścia pięć groszy.

Za przecinkiem powtarza się jeden ruch. Dzielisz całość na dziesięć równych części i dostajesz części dziesiąte. Bierzesz jedną z nich i znów dzielisz na dziesięć — to części setne. Jeszcze raz to samo daje części tysięczne. Każde kolejne miejsce po przecinku to części dziesięć razy mniejsze od poprzednich.

Nazwy rzędów pasują do mianowników ułamków zwykłych, które już znasz. Jedna dziesiąta to jeden przez dziesięć, jedna setna to jeden przez sto, jedna tysięczna to jeden przez tysiąc.

Czytasz tak: najpierw całości, potem słowo „i”, a na końcu wszystkie cyfry zza przecinka przeczytane razem, jak jedną liczbę, z nazwą ostatniego rzędu. Dlatego wzrost czwartoklasisty, jedna cała i czterdzieści pięć setnych metra, czyta się w całości, a nie jako oddzielne cyfry.

I jeszcze zera. Zero dopisane na samym końcu niczego nie zmienia — pięć dziesiątych i pięćdziesiąt setnych to dokładnie ta sama długość. Ale zero wstawione zaraz za przecinkiem spycha wszystkie cyfry o jeden rząd dalej, więc pięć setnych jest już dziesięć razy mniejsze niż pięć dziesiątych.`;

interface SummaryDisplayProps {
  color: string;
}

export function SummaryDisplay({ color }: SummaryDisplayProps) {
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  return (
    <div className="space-y-4 text-sm leading-relaxed sm:text-base">
      <p>
        <strong style={{ color: textColor }}>Przecinek</strong> oddziela całości od części całości —
        przed nim całe sztuki, za nim kawałki jednej sztuki. Cena 3,25 zł to 3 złote i jeszcze 25
        groszy.
      </p>
      <p>
        Za przecinkiem powtarza się jeden ruch: dzielisz całość na 10 części (
        <strong style={{ color: textColor }}>dziesiąte</strong>), bierzesz jedną i znów dzielisz na
        10 (<strong style={{ color: textColor }}>setne</strong>), i jeszcze raz (
        <strong style={{ color: textColor }}>tysięczne</strong>). Każde miejsce dalej to części
        dziesięć razy mniejsze.
      </p>
      <p>
        Nazwy rzędów pasują do mianowników ułamków zwykłych: 0,1 to 1/10, 0,01 to 1/100, a 0,001 to
        1/1000.
      </p>
      <p>
        Czytasz: całości, słowo „i”, a potem wszystkie cyfry zza przecinka razem — z nazwą ostatniego
        rzędu. 1,45 m to „jedna cała i czterdzieści pięć setnych metra”.
      </p>
      <p className="text-muted-foreground">
        Zero na końcu nic nie zmienia (0,5 = 0,50), ale zero zaraz za przecinkiem zmienia wszystko —
        0,05 jest dziesięć razy mniejsze niż 0,5.
      </p>
    </div>
  );
}
