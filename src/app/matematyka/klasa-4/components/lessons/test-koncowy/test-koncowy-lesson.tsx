'use client';

import { useState } from 'react';
import { Hash, Percent, PieChart, Ruler } from 'lucide-react';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { DiagnosticQuiz, type DiagnosticTask } from '../../diagnostic-quiz';
import { ReadinessBridge, type Bridge } from './readiness-bridge';
import { getLesson } from '../../../data/lessons';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';

const L = (moduleSlug: string, slug: string): MathLesson => {
  const lesson = getLesson(moduleSlug, slug);
  if (!lesson) throw new Error(`Brak lekcji ${moduleSlug}/${slug}`);
  return lesson;
};

const STEPS: LessonStepMeta[] = [
  { id: 'start', kind: 'Wstęp', title: 'Jak działa ten test', time: '1 min', icon: 'ListChecks' },
  { id: 'ulamki', kind: 'Część 1', title: 'Ułamki i wspólny mianownik', time: '6 min', icon: 'PieChart' },
  { id: 'os', kind: 'Część 2', title: 'Oś liczbowa i porównywanie', time: '5 min', icon: 'Hash' },
  { id: 'dziesietne', kind: 'Część 3', title: 'Ułamki dziesiętne i setne części', time: '5 min', icon: 'Percent' },
  { id: 'jednostki', kind: 'Część 4', title: 'Jednostki, droga i czas', time: '6 min', icon: 'Ruler' },
  { id: 'diagnoza', kind: 'Diagnoza', title: 'Twoja gotowość do klasy 5', time: '3 min', icon: 'Trophy' },
];

const BRIDGES: Bridge[] = [
  {
    id: 'ulamki',
    grade4: 'Wspólny mianownik, rozszerzanie i skracanie ułamków',
    grade4Icon: 'PieChart',
    grade5: 'Dodawanie i odejmowanie ułamków o różnych mianownikach',
    shoreUp: [
      L('ulamki-zwykle', 'rozszerzanie-i-skracanie-ulamkow'),
      L('ulamki-zwykle', 'porownywanie-ulamkow'),
    ],
  },
  {
    id: 'os',
    grade4: 'Oś liczbowa i porównywanie liczb',
    grade4Icon: 'Hash',
    grade5: 'Liczby całkowite i ujemne — oś przedłużona w lewo za zero',
    shoreUp: [
      L('liczby-naturalne', 'os-liczbowa'),
      L('liczby-naturalne', 'porownywanie-liczb'),
    ],
  },
  {
    id: 'dziesietne',
    grade4: 'Ułamki dziesiętne i setne części całości',
    grade4Icon: 'Percent',
    grade5: 'Procenty — 1% to jedna setna',
    shoreUp: [
      L('ulamki-dziesietne', 'zapis-ulamkow-dziesietnych'),
      L('ulamki-dziesietne', 'ulamek-zwykly-a-dziesietny'),
    ],
  },
  {
    id: 'jednostki',
    grade4: 'Jednostki miary i działania na nich',
    grade4Icon: 'Ruler',
    grade5: 'Prędkość, droga i czas (droga = prędkość · czas)',
    shoreUp: [
      L('obliczenia-praktyczne', 'jednostki-dlugosci'),
      L('obliczenia-praktyczne', 'obliczenia-zegarowe'),
    ],
  },
];

/* ─────────────── Część 1: ułamki zwykłe i wspólny mianownik ─────────────── */

const ULAMKI_TASKS: DiagnosticTask[] = [
  {
    id: 'rozszerz-2-3',
    prompt: 'Sprowadź ułamek 2/3 do mianownika 12. Jaki jest wtedy licznik?',
    type: 'input',
    answer: '8',
    explanation: 'Mianownik rośnie z 3 do 12, czyli razy 4. Licznik też mnożymy przez 4: 2 · 4 = 8. Więc 2/3 = 8/12.',
  },
  {
    id: 'wiekszy',
    prompt: 'Który ułamek jest większy: 3/4 czy 5/8?',
    type: 'choice',
    options: [
      { id: 'a', text: '5/8' },
      { id: 'b', text: '3/4' },
      { id: 'c', text: 'są równe' },
    ],
    correctId: 'b',
    explanation: '3/4 to 6/8. Porównujemy 6/8 i 5/8 — 6 > 5, więc 3/4 jest większe.',
  },
  {
    id: 'dodaj-dziesiate',
    prompt: 'Oblicz 3/10 + 4/10. Wpisz w formacie licznik/mianownik.',
    type: 'input',
    answer: '7/10',
    explanation: 'Mianowniki są równe, więc dodajesz tylko liczniki: 3 + 4 = 7. Wynik: 7/10.',
  },
  {
    id: 'skroc-6-9',
    prompt: 'Skróć ułamek 6/9 do postaci nieskracalnej. Wpisz w formacie licznik/mianownik.',
    type: 'input',
    answer: '2/3',
    explanation: 'Licznik i mianownik dzielą się przez 3: 6 : 3 = 2, 9 : 3 = 3. Czyli 6/9 = 2/3.',
  },
  {
    id: 'wspolny-4-6',
    prompt: 'Jaki jest najmniejszy wspólny mianownik ułamków 1/4 i 1/6?',
    type: 'input',
    answer: '12',
    explanation: 'Wielokrotności 4: 4, 8, 12… Wielokrotności 6: 6, 12… Pierwsza wspólna to 12.',
  },
];

/* ─────────────────── Część 2: oś liczbowa i porównywanie ─────────────────── */

const OS_TASKS: DiagnosticTask[] = [
  {
    id: 'srodek',
    prompt: 'Na osi liczbowej z podziałką co 5 zaznaczono 25 i 35. Jaka liczba jest dokładnie w połowie między nimi?',
    type: 'input',
    answer: '30',
    explanation: 'Między 25 a 35 jest jedna kreska podziałki: 30. To środek tego odcinka.',
  },
  {
    id: 'znak',
    prompt: 'Wstaw znak między liczby: 4 812 ___ 4 821',
    type: 'choice',
    options: [
      { id: 'a', text: '>' },
      { id: 'b', text: '=' },
      { id: 'c', text: '<' },
    ],
    correctId: 'c',
    explanation: 'Tysiące i setki takie same. Dziesiątki: 1 < 2, więc 4 812 < 4 821.',
  },
  {
    id: 'odleglosc',
    prompt: 'Jak daleko od zera na osi liczbowej leży liczba 7?',
    type: 'input',
    answer: '7',
    explanation: 'Liczba 7 leży 7 kroków od zera. W klasie 5 tę „odległość od zera" nazwiesz wartością bezwzględną.',
  },
  {
    id: 'polowa-100',
    prompt: 'Która liczba jest w połowie drogi między 0 a 100 na osi liczbowej?',
    type: 'input',
    answer: '50',
    explanation: '100 : 2 = 50. Liczba 50 dzieli odcinek od 0 do 100 na dwie równe części.',
  },
  {
    id: 'najblizej',
    prompt: 'Która z liczb 58, 63, 55 leży najbliżej liczby 60 na osi liczbowej?',
    type: 'input',
    answer: '58',
    explanation: 'Od 60: do 58 są 2 kroki, do 63 — 3 kroki, do 55 — 5 kroków. Najbliżej jest 58.',
  },
];

/* ───────────── Część 3: ułamki dziesiętne i setne części całości ───────────── */

const DZIESIETNE_TASKS: DiagnosticTask[] = [
  {
    id: 'zapis-7-100',
    prompt: 'Zapisz ułamek 7/100 jako ułamek dziesiętny. Wpisz z przecinkiem.',
    type: 'input',
    answer: '0,07',
    explanation: 'Setne to drugie miejsce po przecinku. 7 setnych to 0,07 — na miejscu dziesiątych trzeba wpisać zero.',
  },
  {
    id: 'ile-setnych',
    prompt: 'Ile setnych to 0,3?',
    type: 'input',
    answer: '30',
    explanation: '0,3 to 3 dziesiąte, a jedna dziesiąta to 10 setnych: 3 · 10 = 30 setnych.',
  },
  {
    id: 'cwiartka',
    prompt: 'Liczba 0,25 to ten sam ułamek co:',
    type: 'choice',
    options: [
      { id: 'a', text: '1/5' },
      { id: 'b', text: '2/5' },
      { id: 'c', text: '1/2' },
      { id: 'd', text: '1/4' },
    ],
    correctId: 'd',
    explanation: '0,25 to 25/100, a 25/100 po skróceniu przez 25 to 1/4. W klasie 5 zapiszesz to samo jako 25%.',
  },
  {
    id: 'dodaj-dz',
    prompt: 'Oblicz 0,4 + 0,25. Wpisz z przecinkiem.',
    type: 'input',
    answer: '0,65',
    explanation: 'Wyrównaj: 0,40 + 0,25. 40 setnych + 25 setnych = 65 setnych = 0,65.',
  },
  {
    id: 'polowa-ze-100',
    prompt: 'Ile to jedna druga (1/2) ze 100?',
    type: 'input',
    answer: '50',
    explanation: '1/2 ze 100 to 100 : 2 = 50. W klasie 5: „50% ze 100" znaczy dokładnie to samo.',
  },
];

/* ─────────────────── Część 4: jednostki, droga i czas ─────────────────── */

const JEDNOSTKI_TASKS: DiagnosticTask[] = [
  {
    id: 'km-m',
    prompt: 'Ile metrów to 3 km?',
    type: 'input',
    unit: 'm',
    answer: '3000',
    explanation: '1 km = 1000 m, więc 3 km = 3 · 1000 = 3000 m.',
  },
  {
    id: 'godz-min',
    prompt: 'Ile minut to 2 godziny?',
    type: 'input',
    unit: 'min',
    answer: '120',
    explanation: '1 godzina = 60 minut, więc 2 godziny = 2 · 60 = 120 minut.',
  },
  {
    id: 'droga',
    prompt: 'Samochód jedzie ze stałą prędkością 60 km na godzinę. Ile kilometrów przejedzie w 3 godziny?',
    type: 'input',
    unit: 'km',
    answer: '180',
    explanation: 'W każdą godzinę 60 km, przez 3 godziny: 60 · 3 = 180 km. W klasie 5 to wzór droga = prędkość · czas.',
  },
  {
    id: 'predkosc',
    prompt: 'Rowerzysta przejechał 24 km w 2 godziny, jadąc równo. Ile kilometrów robił w ciągu jednej godziny?',
    type: 'input',
    unit: 'km',
    answer: '12',
    explanation: '24 km podzielone na 2 godziny: 24 : 2 = 12 km na godzinę. To wzór prędkość = droga : czas.',
  },
  {
    id: 'pol-dwie-godziny',
    prompt: 'Rowerzysta jedzie ze stałą prędkością 15 km na godzinę. Ile przejedzie w 2 godziny?',
    type: 'choice',
    options: [
      { id: 'a', text: '30 km' },
      { id: 'b', text: '15 km' },
      { id: 'c', text: '17 km' },
      { id: 'd', text: '7,5 km' },
    ],
    correctId: 'a',
    explanation: '15 km na godzinę przez 2 godziny: 15 · 2 = 30 km.',
  },
];

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
  nextModule?: MathModule;
}

export function TestKoncowyLesson({ lesson, mathModule, nextLesson, nextModule }: LessonProps) {
  return (
    <LessonShell
      lesson={lesson}
      mathModule={mathModule}
      steps={STEPS}
      nextLesson={nextLesson}
      nextModule={nextModule}
    >
      <LessonBody color={mathModule.color} />
    </LessonShell>
  );
}

type Scores = Partial<Record<string, { score: number; total: number }>>;

/** Treść wydzielona z komponentu strony, bo `useStepDone` wymaga kontekstu `LessonShell`. */
function LessonBody({ color }: { color: string }) {
  const start = useStepDone('start');
  const ulamki = useStepDone('ulamki');
  const os = useStepDone('os');
  const dziesietne = useStepDone('dziesietne');
  const jednostki = useStepDone('jednostki');
  const diagnoza = useStepDone('diagnoza');

  const [scores, setScores] = useState<Scores>({});
  const recordScore = (id: string) => (score: number, total: number) =>
    setScores((prev) => ({ ...prev, [id]: { score, total } }));

  return (
    <>
      {/* Wstęp */}
      <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
        <p className="mb-4 text-base leading-relaxed sm:text-lg">
          To <strong>test końcowy</strong> klasy 4 — i zarazem <strong>diagnoza na wejście do
          klasy 5</strong>. Sprawdza cztery umiejętności, na których w przyszłym roku stanie
          najwięcej nowego materiału. Nie wszystko z całego roku — tylko te <strong>filary</strong>.
        </p>
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
          Cztery części po 5 zadań. Licz w pamięci lub na kartce, nie na kalkulatorze — chodzi o to,
          co naprawdę umiesz. Na końcu zobaczysz, do czego każdy filar Ci się przyda w klasie 5.
        </p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {[
            { icon: PieChart, text: 'Ułamki i wspólny mianownik' },
            { icon: Hash, text: 'Oś liczbowa i porównywanie' },
            { icon: Percent, text: 'Ułamki dziesiętne i setne części' },
            { icon: Ruler, text: 'Jednostki, droga i czas' },
          ].map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-2 text-sm">
              <Icon className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
              <span className="leading-relaxed">{text}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Wstęp — brama startu */}
      <LessonSection id="start">
        <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
          <p className="mb-4 text-sm leading-relaxed sm:text-base">
            Za chwilę cztery części testu. Po każdej odpowiedzi od razu zobaczysz, czy jest dobrze,
            i krótkie wyjaśnienie. Odpowiedzi nie da się cofnąć — zastanów się przed kliknięciem.
          </p>
          <p className="mb-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            To nie klasówka — nikt nie stawia ocen. Wynik jest dla Ciebie: pokazuje, co dopiąć
            przed wakacjami.
          </p>
          {!start.done ? (
            <button
              type="button"
              onClick={start.markStepDone}
              className="inline-flex cursor-pointer items-center gap-2 px-5 py-2.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
              style={{ backgroundColor: color }}
            >
              Zaczynam test
            </button>
          ) : (
            <p className="text-sm font-semibold" style={{ color }}>
              Powodzenia — jedziemy ↓
            </p>
          )}
        </div>
      </LessonSection>

      {/* Część 1 */}
      <LessonSection id="ulamki">
        <DiagnosticQuiz
          tasks={ULAMKI_TASKS}
          color={color}
          onFinish={(score, total) => {
            recordScore('ulamki')(score, total);
            ulamki.markStepDone();
          }}
        />
      </LessonSection>

      {/* Część 2 */}
      <LessonSection id="os">
        <DiagnosticQuiz
          tasks={OS_TASKS}
          color={color}
          onFinish={(score, total) => {
            recordScore('os')(score, total);
            os.markStepDone();
          }}
        />
      </LessonSection>

      {/* Część 3 */}
      <LessonSection id="dziesietne">
        <DiagnosticQuiz
          tasks={DZIESIETNE_TASKS}
          color={color}
          onFinish={(score, total) => {
            recordScore('dziesietne')(score, total);
            dziesietne.markStepDone();
          }}
        />
      </LessonSection>

      {/* Część 4 */}
      <LessonSection id="jednostki">
        <DiagnosticQuiz
          tasks={JEDNOSTKI_TASKS}
          color={color}
          onFinish={(score, total) => {
            recordScore('jednostki')(score, total);
            jednostki.markStepDone();
          }}
        />
      </LessonSection>

      {/* Diagnoza */}
      <LessonSection id="diagnoza">
        <ReadinessBridge
          bridges={BRIDGES}
          scores={scores}
          color={color}
          onComplete={diagnoza.markStepDone}
        />
      </LessonSection>
    </>
  );
}
