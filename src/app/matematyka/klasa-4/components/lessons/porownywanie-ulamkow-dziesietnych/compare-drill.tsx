import type { DiagnosticTask } from '../../diagnostic-quiz';
import { DECIMAL_PLACES, padDecimalPlaces, parseDecimal } from '../../../lib/decimal';

/** Dwie liczby wyrównane przecinkiem, z dopisanymi zerami — dokładnie tak, jak stawia się je do porównania. */
function AlignedPair({ a, b, color }: { a: string; b: string; color: string }) {
  const av = parseDecimal(a);
  const bv = parseDecimal(b);
  const places = Math.max(av.digits.length, bv.digits.length);
  const rows = [
    { raw: av, own: av.digits.length },
    { raw: bv, own: bv.digits.length },
  ].map(({ raw, own }) => ({ padded: padDecimalPlaces(raw, places), own }));

  const cell =
    'flex h-11 w-9 items-center justify-center border font-mono text-lg font-bold tabular-nums sm:h-12 sm:w-10';

  return (
    <div className="mx-auto w-fit">
      <div className="mb-1 flex gap-1">
        <span className="flex w-9 items-end justify-center pb-1 text-[9px] font-bold uppercase text-muted-foreground sm:w-10">
          jedn.
        </span>
        <span className="w-3" aria-hidden />
        {DECIMAL_PLACES.slice(0, places).map((p) => (
          <span
            key={p.name}
            className="flex w-9 items-end justify-center pb-1 text-[9px] font-bold uppercase text-muted-foreground sm:w-10"
          >
            {p.name}
          </span>
        ))}
      </div>
      {rows.map(({ padded, own }, r) => (
        <div key={r} className="mb-1 flex gap-1">
          <span className={cell} style={{ borderColor: `${color}40`, color }}>
            {padded.whole}
          </span>
          <span className="flex w-3 items-center justify-center text-xl font-black" style={{ color }} aria-hidden>
            ,
          </span>
          {padded.digits.map((digit, i) => (
            <span
              key={i}
              className={cell}
              style={{
                borderColor: `${color}40`,
                color: i < own ? color : 'var(--muted-foreground)',
              }}
            >
              {digit}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Ćwiczenia: od prostego porównania dwóch liczb, przez porządkowanie trzech,
 * po klasyczną pułapkę „więcej cyfr = większa liczba” i zadanie tekstowe.
 * Poziomy K/P/R/D.
 */
export function buildCompareDrill(color: string): DiagnosticTask[] {
  return [
    {
      id: 'znak-06-058',
      prompt: 'Jaki znak stoi między liczbami: 0,6 ___ 0,58?',
      type: 'choice',
      visual: <AlignedPair a="0,6" b="0,58" color={color} />,
      difficulty: { code: 'K', name: 'Konieczne' },
      options: [
        { id: 'a', text: '0,6 < 0,58' },
        { id: 'b', text: '0,6 > 0,58' },
        { id: 'c', text: '0,6 = 0,58' },
        { id: 'd', text: 'Nie da się porównać' },
      ],
      correctId: 'b',
      explanation:
        'Po wyrównaniu: 0,60 i 0,58. W rzędzie dziesiątych 6 > 5, więc 0,6 jest większe — mimo że 0,58 ma więcej cyfr.',
    },
    {
      id: 'wpisz-znak-34-340',
      prompt: 'Wpisz znak (<, > lub =), który stoi między liczbami: 3,4 ___ 3,40',
      type: 'input',
      answer: '=',
      difficulty: { code: 'K', name: 'Konieczne' },
      explanation: 'Dopisane zero na końcu części dziesiętnej nic nie zmienia: 3,4 = 3,40.',
    },
    {
      id: 'najwieksza-z-trzech',
      prompt: 'Która z liczb jest największa: 0,7 · 0,68 · 0,709?',
      type: 'choice',
      difficulty: { code: 'P', name: 'Podstawowe' },
      options: [
        { id: 'a', text: '0,709' },
        { id: 'b', text: '0,7' },
        { id: 'c', text: '0,68' },
        { id: 'd', text: 'Wszystkie są równe' },
      ],
      correctId: 'a',
      explanation:
        'Wyrównaj do trzech miejsc: 0,700 · 0,680 · 0,709. Największa jest 0,709 — w rzędzie tysięcznych ma 9, reszta ma tam 0.',
    },
    {
      id: 'ile-wiekszych-od-03',
      prompt: 'Ile spośród liczb 0,3 · 0,29 · 0,31 · 0,309 jest większych od 0,3? Wpisz liczbę.',
      type: 'input',
      answer: '2',
      difficulty: { code: 'P', name: 'Podstawowe' },
      explanation:
        'Po wyrównaniu: 0,300 · 0,290 · 0,310 · 0,309. Większe od 0,300 są 0,31 i 0,309 — czyli dwie.',
    },
    {
      id: 'srodkowa-rosnaco',
      prompt: 'Ustaw rosnąco liczby 1,2 · 1,08 · 1,199. Która stanie w środku?',
      type: 'choice',
      difficulty: { code: 'R', name: 'Rozszerzające' },
      options: [
        { id: 'a', text: '1,2' },
        { id: 'b', text: '1,08' },
        { id: 'c', text: 'Nie da się ustawić' },
        { id: 'd', text: '1,199' },
      ],
      correctId: 'd',
      explanation:
        'Wyrównaj: 1,200 · 1,080 · 1,199. Rosnąco: 1,08 < 1,199 < 1,2 — w środku stoi 1,199.',
    },
    {
      id: 'pulapka-wiecej-cyfr',
      prompt:
        'Kasia napisała: „0,9 < 0,12, bo 12 to więcej niż 9”. Wpisz znak, który naprawdę powinien stać między 0,9 a 0,12.',
      type: 'input',
      answer: '>',
      visual: <AlignedPair a="0,9" b="0,12" color={color} />,
      difficulty: { code: 'R', name: 'Rozszerzające' },
      explanation:
        'Po wyrównaniu: 0,90 i 0,12. W rzędzie dziesiątych 9 > 1, więc 0,9 > 0,12. Liczba cyfr po przecinku się nie liczy.',
    },
    {
      id: 'skok-w-dal',
      prompt: 'Trzy skoki w dal: Ala 3,45 m, Borys 3,4 m, Celina 3,405 m. Kto skoczył najdalej?',
      type: 'choice',
      difficulty: { code: 'D', name: 'Dopełniające' },
      options: [
        { id: 'a', text: 'Borys' },
        { id: 'b', text: 'Celina' },
        { id: 'c', text: 'Ala' },
        { id: 'd', text: 'Wszyscy skoczyli tak samo' },
      ],
      correctId: 'c',
      explanation:
        'Wyrównaj do trzech miejsc: 3,450 · 3,400 · 3,405. Największa jest 3,450 — najdalej skoczyła Ala.',
    },
  ];
}
