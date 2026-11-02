import type { DiagnosticTask } from '../../diagnostic-quiz';

const MUTED = '#9ca3af';

/** Trójkąt z trzema kandydatkami na oś symetrii oznaczonymi literami — tylko B naprawdę przechodzi przez wierzchołek i środek podstawy. */
function AxisCandidatesGlyph({ color }: { color: string }) {
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;
  return (
    <svg viewBox="0 0 100 100" className="mx-auto h-auto w-full max-w-[220px]" role="img" aria-label="Trójkąt z trzema liniami A, B, C — tylko jedna jest osią symetrii">
      <polygon points="50,20 15,85 85,85" fill={`${color}22`} stroke={color} strokeWidth={2.5} strokeLinejoin="round" />
      <line x1={50} y1={20} x2={35} y2={85} stroke={MUTED} strokeWidth={1.5} strokeDasharray="3 3" />
      <text x={30} y={92} style={{ fontSize: 10, fontWeight: 800 }} fill={textColor}>A</text>
      <line x1={50} y1={10} x2={50} y2={95} stroke={MUTED} strokeWidth={1.5} strokeDasharray="3 3" />
      <text x={53} y={12} style={{ fontSize: 10, fontWeight: 800 }} fill={textColor}>B</text>
      <line x1={15} y1={55} x2={85} y2={55} stroke={MUTED} strokeWidth={1.5} strokeDasharray="3 3" />
      <text x={88} y={58} style={{ fontSize: 10, fontWeight: 800 }} fill={textColor}>C</text>
    </svg>
  );
}

function LetterPairGlyph({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 160 90" className="mx-auto h-auto w-full max-w-[220px]" role="img" aria-label="Litery M i Z obok siebie">
      <text x={40} y={68} textAnchor="middle" style={{ fontSize: 60, fontWeight: 800 }} fill={color}>M</text>
      <text x={120} y={68} textAnchor="middle" style={{ fontSize: 60, fontWeight: 800 }} fill={color}>Z</text>
    </svg>
  );
}

function ParallelogramGlyph({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 100 100" className="mx-auto h-auto w-full max-w-[200px]" role="img" aria-label="Równoległobok">
      <polygon points="25,75 55,75 75,25 45,25" fill={`${color}22`} stroke={color} strokeWidth={2.5} strokeLinejoin="round" />
    </svg>
  );
}

function HexagonGlyph({ color }: { color: string }) {
  const points = Array.from({ length: 6 }, (_, i) => {
    const angle = ((-90 + i * 60) * Math.PI) / 180;
    return `${50 + Math.cos(angle) * 38},${50 + Math.sin(angle) * 38}`;
  }).join(' ');
  return (
    <svg viewBox="0 0 100 100" className="mx-auto h-auto w-full max-w-[200px]" role="img" aria-label="Sześciokąt foremny">
      <polygon points={points} fill={`${color}22`} stroke={color} strokeWidth={2.5} strokeLinejoin="round" />
    </svg>
  );
}

/** Ćwiczenia: liczenie osi symetrii, rozpoznawanie na rysunku i pierwsze zastosowanie odległości od osi. */
export function buildDrillTasks(color: string): DiagnosticTask[] {
  return [
    {
      id: 'osie-kola',
      prompt: 'Ile osi symetrii ma koło?',
      type: 'choice',
      difficulty: { code: 'K', name: 'Konieczne' },
      options: [
        { id: 'a', text: '1' },
        { id: 'b', text: '4' },
        { id: 'c', text: '8' },
        { id: 'd', text: 'Nieskończenie wiele' },
      ],
      correctId: 'd',
      explanation: 'Każda linia przechodząca przez środek koła dzieli je na dwie identyczne połówki — a takich linii jest nieskończenie wiele.',
    },
    {
      id: 'rownoleglobok',
      prompt: 'Ten równoległobok (nie prostokąt) — czy ma oś symetrii?',
      type: 'choice',
      difficulty: { code: 'P', name: 'Podstawowe' },
      visual: <ParallelogramGlyph color={color} />,
      options: [
        { id: 'a', text: 'Tak, jedną poziomą' },
        { id: 'b', text: 'Tak, obie przekątne' },
        { id: 'c', text: 'Nie — żadna prosta linia nie da dwóch lustrzanych połówek' },
        { id: 'd', text: 'Tak, dokładnie cztery' },
      ],
      correctId: 'c',
      explanation: 'Wygląda „zrównoważony”, ale żadna prosta linia nie podzieli równoległoboku na dwie lustrzane części — to klasyczna pułapka.',
    },
    {
      id: 'litery-m-z',
      prompt: 'Która z tych dwóch liter ma oś symetrii?',
      type: 'choice',
      difficulty: { code: 'P', name: 'Podstawowe' },
      visual: <LetterPairGlyph color={color} />,
      options: [
        { id: 'a', text: 'Z' },
        { id: 'b', text: 'Obie' },
        { id: 'c', text: 'M' },
        { id: 'd', text: 'Żadna' },
      ],
      correctId: 'c',
      explanation: 'Pionowa linia przez środek litery M daje dwie lustrzane połówki. Z nie ma żadnej takiej linii.',
    },
    {
      id: 'ktora-linia-to-os',
      prompt: 'Który z trzech zaznaczonych odcinków jest prawdziwą osią symetrii tego trójkąta?',
      type: 'choice',
      difficulty: { code: 'P', name: 'Podstawowe' },
      visual: <AxisCandidatesGlyph color={color} />,
      options: [
        { id: 'a', text: 'Prosta A' },
        { id: 'b', text: 'Prosta B' },
        { id: 'c', text: 'Prosta C' },
        { id: 'd', text: 'Żadna z nich' },
      ],
      correctId: 'b',
      explanation: 'Tylko B przechodzi dokładnie przez wierzchołek i środek przeciwległego boku. A i C tego nie robią, mimo że na oko wyglądają podobnie.',
    },
    {
      id: 'odleglosc-motyla',
      prompt: 'Punkt na lewym skrzydle motyla leży 8 cm od osi jego ciała. W jakiej odległości od osi musi leżeć odpowiadający mu punkt na prawym skrzydle, żeby motyl był symetryczny?',
      type: 'input',
      answer: '8',
      unit: 'cm',
      difficulty: { code: 'R', name: 'Rozszerzające' },
      explanation: 'Odbicie zawsze zachowuje tę samą odległość od osi — tylko po drugiej stronie.',
    },
    {
      id: 'przekatne-prostokata',
      prompt: 'Prostokąt (nie kwadrat) ma 2 osie symetrii: poziomą i pionową. Czy jego przekątne też są osiami symetrii?',
      type: 'choice',
      difficulty: { code: 'R', name: 'Rozszerzające' },
      options: [
        { id: 'a', text: 'Nie — przekątne nie są osiami symetrii prostokąta' },
        { id: 'b', text: 'Tak, zawsze' },
        { id: 'c', text: 'Tylko gdy prostokąt jest bardzo długi' },
        { id: 'd', text: 'Tak, ale tylko jedna z nich' },
      ],
      correctId: 'a',
      explanation: 'Przekątna dzieli prostokąt na dwa trójkąty, ale nie są one lustrzanym odbiciem — dopiero w kwadracie przekątne stają się osiami symetrii.',
    },
    {
      id: 'osie-szesciokata',
      prompt: 'Ile osi symetrii ma sześciokąt foremny?',
      type: 'choice',
      difficulty: { code: 'D', name: 'Dopełniające' },
      visual: <HexagonGlyph color={color} />,
      options: [
        { id: 'a', text: '3' },
        { id: 'b', text: '12' },
        { id: 'c', text: '2' },
        { id: 'd', text: '6' },
      ],
      correctId: 'd',
      explanation: 'Sześciokąt foremny ma 6 osi symetrii — 3 przechodzące przez pary przeciwległych wierzchołków i 3 przez środki przeciwległych boków.',
    },
  ];
}

function FoldedPaperGlyph({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 140 100" className="mx-auto h-auto w-full max-w-[220px]" role="img" aria-label="Złożona na pół kartka z wyciętym trójkątem przy zgięciu">
      <rect x={15} y={15} width={110} height={70} fill={`${color}18`} stroke={color} strokeWidth={2} />
      <line x1={70} y1={15} x2={70} y2={85} stroke={color} strokeWidth={1.5} strokeDasharray="4 3" />
      <polygon points="70,42 88,50 70,58" fill="white" stroke={color} strokeWidth={2} strokeLinejoin="round" />
    </svg>
  );
}

/** Zadanie problemowe: papierowe łamigłówki — to, co dziecko zna z wycinanek, jest odbiciem względem zgięcia. */
export function buildProblemTasks(color: string): DiagnosticTask[] {
  return [
    {
      id: 'wycinanka-trojkat',
      prompt: 'Złożyłeś prostokątną kartkę dokładnie na pół i przy samym zgięciu wyciąłeś mały trójkąt, dotykający zgięcia jednym bokiem. Jaki kształt będzie miał otwór po rozłożeniu kartki?',
      type: 'choice',
      visual: <FoldedPaperGlyph color={color} />,
      options: [
        { id: 'a', text: 'Trójkąt' },
        { id: 'b', text: 'Kwadrat' },
        { id: 'c', text: 'Romb — dwa trójkąty złączone dłuższym bokiem' },
        { id: 'd', text: 'Koło' },
      ],
      correctId: 'c',
      explanation: 'Zgięcie to oś symetrii. Wycięty trójkąt i jego lustrzane odbicie po rozłożeniu łączą się w jednej figurze — romb.',
    },
    {
      id: 'kartka-osie',
      prompt: 'Ile osi symetrii ma zwykła kartka papieru w kształcie prostokąta (nie kwadratu)?',
      type: 'choice',
      options: [
        { id: 'a', text: '1' },
        { id: 'b', text: '2' },
        { id: 'c', text: '4' },
        { id: 'd', text: '0' },
      ],
      correctId: 'b',
      explanation: 'Jak każdy prostokąt — pozioma i pionowa oś przez środek, żadna inna linia nie zadziała.',
    },
    {
      id: 'kanapka-symetria',
      prompt: 'Mama kroi prostokątną kromkę chleba dokładnie przez środek, prostopadle do dłuższego boku. Czy obie połówki na pewno będą lustrzanym odbiciem?',
      type: 'choice',
      options: [
        { id: 'a', text: 'Tak — cięcie przechodzi dokładnie przez oś symetrii kromki' },
        { id: 'b', text: 'Nie, kromka nie ma osi symetrii' },
        { id: 'c', text: 'Tak, ale tylko jeśli kromka jest kwadratowa' },
        { id: 'd', text: 'Nie, trzeba ciąć po przekątnej' },
      ],
      correctId: 'a',
      explanation: 'Prostokątna kromka ma oś symetrii dokładnie tam, gdzie mama tnie — środkiem, prostopadle do dłuższego boku.',
    },
  ];
}
