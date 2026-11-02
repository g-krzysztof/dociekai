/**
 * Streszczenie przewodnika „Kolejność wykonywania działań” w dwóch wariantach:
 * `SUMMARY_PLAIN_TEXT` to czysty ciąg znaków bez formatowania — payload do
 * syntezy mowy (TTS), więc każda liczba i każdy znak działania jest zapisany
 * słownie. `SummaryDisplay` renderuje tę samą treść jako czytelny, ostylowany
 * tekst w modalu — tam liczby i znaki zostają w postaci cyfr/symboli, bo to
 * tekst do czytania wzrokiem, nie do syntezy — te dwa miejsca trzeba
 * aktualizować razem, żeby się nie rozjechały treściowo.
 */
export const SUMMARY_PLAIN_TEXT = `Dwa plus trzy razy cztery — ile to jest? Licząc od lewej do prawej wyjdzie dwadzieścia, ale to nieprawidłowy sposób. Poprawna odpowiedź to czternaście, bo matematycy umówili się na jedną, stałą kolejność liczenia działań.

Zasada pierwsza: nawiasy liczymy zawsze najpierw, bez wyjątku.

Zasada druga: mnożenie i dzielenie liczymy przed dodawaniem i odejmowaniem, nawet jeśli w zapisie stoją dalej.

Zasada trzecia: jeśli w wyrażeniu jest kilka działań o tym samym priorytecie, na przykład samo dodawanie i odejmowanie, liczymy je po kolei, od lewej do prawej.

Dzięki tym trzem zasadom dwa plus trzy razy cztery zawsze wychodzi czternaście — bo najpierw liczysz trzy razy cztery, czyli dwanaście, a dopiero potem dodajesz dwa.

Tej samej kolejności działań przestrzega każdy kalkulator naukowy, każdy arkusz kalkulacyjny i każdy program komputerowy na świecie — to nie jest zasada szkolna, to międzynarodowa umowa.`;

interface SummaryDisplayProps {
  color: string;
}

export function SummaryDisplay({ color }: SummaryDisplayProps) {
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  return (
    <div className="space-y-4 text-sm leading-relaxed sm:text-base">
      <p>
        <strong className="font-mono" style={{ color }}>
          2 + 3 × 4
        </strong>{' '}
        — licząc od lewej do prawej wyjdzie 20, ale to nieprawidłowy sposób. Poprawna odpowiedź to{' '}
        <strong className="font-mono" style={{ color }}>
          14
        </strong>
        , bo matematycy umówili się na jedną, stałą kolejność liczenia działań.
      </p>
      <p>
        <strong style={{ color: textColor }}>Zasada 1:</strong> nawiasy liczymy zawsze najpierw, bez
        wyjątku.
      </p>
      <p>
        <strong style={{ color: textColor }}>Zasada 2:</strong> mnożenie i dzielenie liczymy przed
        dodawaniem i odejmowaniem, nawet jeśli w zapisie stoją dalej.
      </p>
      <p>
        <strong style={{ color: textColor }}>Zasada 3:</strong> działania o tym samym priorytecie
        (samo + i −, albo samo × i :) liczymy od lewej do prawej.
      </p>
      <p>
        Dzięki tym trzem zasadom 2 + 3 × 4 zawsze wychodzi 14 — najpierw 3 × 4 = 12, a dopiero
        potem 2 + 12.
      </p>
      <p className="text-muted-foreground">
        Tej samej kolejności przestrzega każdy kalkulator naukowy, arkusz kalkulacyjny i program
        komputerowy na świecie — to nie zasada szkolna, to międzynarodowa umowa.
      </p>
    </div>
  );
}
