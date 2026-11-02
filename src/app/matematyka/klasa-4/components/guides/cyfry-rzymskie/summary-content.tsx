/**
 * Streszczenie przewodnika „Cyfry rzymskie” w dwóch wariantach:
 * `SUMMARY_PLAIN_TEXT` to czysty ciąg znaków bez formatowania — docelowo payload
 * do API syntezy mowy (TTS), więc każda liczba jest zapisana słownie, a same
 * symbole rzymskie (I, V, X...) celowo nie pojawiają się w treści — TTS czyta
 * pojedyncze litery i skróty nieprzewidywalnie, więc opisujemy je słowami
 * („siedem znaków”, „trzy z tych znaków”) zamiast wypisywać litery wprost.
 * `SummaryDisplay` renderuje tę samą treść jako czytelny, ostylowany tekst w
 * modalu — tam symbole i cyfry zostają, bo to tekst do czytania wzrokiem, nie
 * do syntezy — te dwa miejsca trzeba aktualizować razem, żeby się nie
 * rozjechały treściowo.
 */
export const SUMMARY_PLAIN_TEXT = `Na starym kamieniu wykuty jest napis z sześciu liter, zamiast czterech zwykłych cyfr. To zapis roku dwa tysiące dwudziestego szóstego. Ten przewodnik uczy, jak taki napis przeczytać.

Zanim powstały litery, liczono kreskami — ale trzydzieści osiem kresek pod rząd trudno policzyć na oko. Dlatego grupom kresek nadano osobne znaki. Tych znaków jest tylko siedem, o wartościach: jeden, pięć, dziesięć, pięćdziesiąt, sto, pięćset i tysiąc. Rządzi nimi jeden prosty rytm: razy pięć, razy dwa, razy pięć, razy dwa, i tak dalej.

Kiedy znaki stoją od największego do najmniejszego, po prostu je dodajesz, czytając od lewej do prawej. Tego samego znaku nie powtarza się więcej niż trzy razy pod rząd, a trzy z tych znaków w ogóle się nie powtarzają.

Gdy mniejszy znak stoi przed większym, odejmujesz go zamiast dodawać. Takich par jest dokładnie sześć — i tylko trzy znaki mogą w ten sposób odejmować, zawsze przed dwoma najbliższymi większymi znakami.

Tymi siedmioma znakami zapiszesz każdą liczbę od jednego do trzech tysięcy dziewięciuset dziewięćdziesięciu dziewięciu — i spotkasz je wszędzie: na tarczy zegara, w numerach wieków, na starych budynkach.`;

interface SummaryDisplayProps {
  color: string;
}

export function SummaryDisplay({ color }: SummaryDisplayProps) {
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  return (
    <div className="space-y-4 text-sm leading-relaxed sm:text-base">
      <p>
        Na starym kamieniu wykuty jest napis:{' '}
        <strong className="font-mono tracking-wide" style={{ color }}>
          MMXXVI
        </strong>{' '}
        — sześć liter zamiast czterech cyfr. To rok{' '}
        <strong style={{ color: textColor }}>2026</strong>. Ten przewodnik uczy, jak taki napis
        przeczytać.
      </p>
      <p>
        Zanim powstały litery, liczono kreskami — ale{' '}
        <strong style={{ color: textColor }}>38</strong> kresek pod rząd trudno policzyć na oko.
        Dlatego grupom kresek nadano osobne znaki. Tych znaków jest tylko{' '}
        <strong style={{ color: textColor }}>siedem</strong>:{' '}
        <strong className="font-mono tracking-wide" style={{ color }}>
          I V X L C D M
        </strong>
        , o wartościach 1, 5, 10, 50, 100, 500 i 1000. Rządzi nimi jeden rytm: razy pięć, razy dwa.
      </p>
      <p>
        Kiedy znaki stoją od największego do najmniejszego, po prostu je{' '}
        <strong style={{ color: textColor }}>dodajesz</strong>, czytając od lewej. Tego samego
        znaku nie powtarza się więcej niż trzy razy pod rząd, a{' '}
        <strong className="font-mono" style={{ color }}>
          V, L i D
        </strong>{' '}
        nie powtarzają się nigdy.
      </p>
      <p>
        Gdy mniejszy znak stoi przed większym, <strong style={{ color: textColor }}>odejmujesz</strong>{' '}
        go zamiast dodawać — sześć takich par, zawsze z użyciem{' '}
        <strong className="font-mono" style={{ color }}>
          I, X
        </strong>{' '}
        lub{' '}
        <strong className="font-mono" style={{ color }}>
          C
        </strong>
        .
      </p>
      <p className="text-muted-foreground">
        Tymi siedmioma znakami zapiszesz każdą liczbę od 1 do 3999 — i spotkasz je na tarczy
        zegara, w numerach wieków, na starych budynkach.
      </p>
    </div>
  );
}
