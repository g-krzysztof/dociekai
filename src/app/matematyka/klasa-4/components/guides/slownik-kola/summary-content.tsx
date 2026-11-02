/**
 * Streszczenie przewodnika „Słownik koła” w dwóch wariantach:
 * `SUMMARY_PLAIN_TEXT` to czysty ciąg znaków bez formatowania — payload do
 * syntezy mowy (TTS), więc każda liczba jest zapisana słownie.
 * `SummaryDisplay` renderuje tę samą treść jako czytelny, ostylowany tekst w
 * modalu — tam wzory (np. „2 × promień”) zostają w zapisie symbolicznym, bo to
 * tekst do czytania wzrokiem, nie do syntezy — te dwa miejsca trzeba
 * aktualizować razem, żeby się nie rozjechały treściowo.
 */
export const SUMMARY_PLAIN_TEXT = `Okrąg i koło to nie to samo. Okrąg to tylko linia — brzeg, zamknięta krzywa. Koło to cała powierzchnia — okrąg razem z tym, co jest w jego wnętrzu. Dlatego mówimy „narysuj okrąg”, ale „pole koła”.

Środek to punkt w samym sercu koła — każdy punkt okręgu jest od niego w tej samej odległości. Promień to odcinek łączący środek z dowolnym punktem na okręgu. Promień poprowadzony w każdym kierunku ma dokładnie tę samą długość.

Średnica łączy dwa punkty okręgu i przechodzi przez środek — to najdłuższa możliwa cięciwa. Cięciwa łączy dwa dowolne punkty okręgu, ale nie musi przechodzić przez środek. Średnica to dwa promienie ułożone w linii prostej, w przeciwne strony — dlatego średnica to dwa razy promień.

Te słowa spotkasz wszędzie: piasta koła rowerowego to środek, a szprychy to promienie. Cięcia pizzy od brzegu do środka to promienie. A „średnica osiem centymetrów” na opakowaniu talerza czy monety to odległość w poprzek, przez środek.`;

interface SummaryDisplayProps {
  color: string;
}

export function SummaryDisplay({ color }: SummaryDisplayProps) {
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  return (
    <div className="space-y-4 text-sm leading-relaxed sm:text-base">
      <p>
        <strong style={{ color: textColor }}>Okrąg</strong> i{' '}
        <strong style={{ color: textColor }}>koło</strong> to nie to samo. Okrąg to tylko linia —
        brzeg, zamknięta krzywa. Koło to cała powierzchnia — okrąg razem z tym, co jest w jego
        wnętrzu. Dlatego mówimy „narysuj okrąg”, ale „pole koła”.
      </p>
      <p>
        <strong style={{ color: textColor }}>Środek</strong> to punkt w samym sercu koła — każdy
        punkt okręgu jest od niego w tej samej odległości.{' '}
        <strong style={{ color: textColor }}>Promień</strong> to odcinek łączący środek z
        dowolnym punktem na okręgu, i ma tę samą długość w każdym kierunku.
      </p>
      <p>
        <strong style={{ color: textColor }}>Średnica</strong> łączy dwa punkty okręgu i
        przechodzi przez środek — to najdłuższa możliwa cięciwa.{' '}
        <strong style={{ color: textColor }}>Cięciwa</strong> łączy dwa dowolne punkty okręgu, ale
        nie musi przechodzić przez środek.
      </p>
      <p>
        <strong className="font-mono" style={{ color }}>
          średnica = 2 × promień
        </strong>{' '}
        — dwa promienie ułożone w linii prostej, w przeciwne strony.
      </p>
      <p className="text-muted-foreground">
        Piasta koła rowerowego to środek, szprychy to promienie, a „średnica 8 cm” na opakowaniu
        talerza to odległość w poprzek, przez środek.
      </p>
    </div>
  );
}
