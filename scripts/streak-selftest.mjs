/**
 * Test krawędzi serii (`src/lib/streak/derive.ts` + `school-calendar.ts`).
 *
 * Ta logika ma za dużo przypadków brzegowych, żeby sprawdzać ją klikaniem:
 * zmiana czasu, przełom roku, zamrażarka na granicy tygodnia, ferie, powrót po
 * miesiącu. Odpalany przez `npm run test:unit`;
 * skrypt bundluje oba moduły esbuildem i odpala asercje na czystych funkcjach.
 *
 *   node scripts/streak-selftest.mjs
 */

import { build } from 'esbuild';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const dir = await mkdtemp(join(tmpdir(), 'streak-'));
const entry = join(dir, 'entry.ts');
const out = join(dir, 'bundle.mjs');

await writeFile(
  entry,
  `export * from '${process.cwd()}/src/lib/streak/school-calendar';\n` +
    `export * from '${process.cwd()}/src/lib/streak/derive';\n`
);
await build({ entryPoints: [entry], outfile: out, bundle: true, format: 'esm', platform: 'node' });

const lib = await import(pathToFileURL(out).href);
await rm(dir, { recursive: true, force: true });

const {
  addDays,
  dateKey,
  daysBetween,
  deriveStreak,
  isRestDay,
  isSchoolBreak,
  nextMilestone,
  schoolYearStart,
  weekdayIndex,
} = lib;

let failures = 0;
let checks = 0;

function check(label, actual, expected) {
  checks += 1;
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) {
    failures += 1;
    console.error(`  ✗ ${label}\n      oczekiwano: ${JSON.stringify(expected)}\n      otrzymano:  ${JSON.stringify(actual)}`);
  }
}

function group(name, fn) {
  console.log(`\n${name}`);
  fn();
}

/** Rekord z listy dat; każda dostaje jedną lekcję matematyki, chyba że podano inaczej. */
const record = (days, extra = {}) => ({
  days: Object.fromEntries(
    Array.isArray(days)
      ? days.map((d) => [d, ['matematyka/liczby-naturalne/lekcja']])
      : Object.entries(days)
  ),
  legacy: [],
  breaks: [],
  ...extra,
});

/* --- kalendarz ------------------------------------------------------- */

group('Kalendarz', () => {
  check('dateKey trzyma się czasu lokalnego', dateKey(new Date(2026, 8, 14, 23, 55)), '2026-09-14');
  check('poniedziałek ma indeks 0', weekdayIndex('2026-09-14'), 0);
  check('niedziela ma indeks 6', weekdayIndex('2026-09-20'), 6);

  // Zmiana czasu: doba ma wtedy 23 lub 25 godzin. Arytmetyka na Date to łapie,
  // dodawanie 86 400 000 ms — nie.
  check('addDays przez koniec czasu letniego', addDays('2026-10-24', 2), '2026-10-26');
  check('addDays przez początek czasu letniego', addDays('2027-03-27', 2), '2027-03-29');
  check('daysBetween przez zmianę czasu', daysBetween('2026-10-24', '2026-10-26'), 2);
  check('addDays przez przełom roku', addDays('2026-12-31', 1), '2027-01-01');
  check('addDays przez 29 lutego', addDays('2028-02-28', 1), '2028-02-29');

  check('sobota to dzień wolny', isRestDay('2026-09-19'), true);
  check('wtorek to dzień nauki', isRestDay('2026-09-15'), false);
  check('1 listopada wolne', isSchoolBreak('2026-11-01'), true);
  check('lipiec to wakacje', isSchoolBreak('2027-07-15'), true);
  check('Wielki Piątek 2027 wolny', isSchoolBreak('2027-03-26'), true);
  check('własne ferie liczą się jako wolne', isRestDay('2027-01-20', [['2027-01-18', '2027-01-29']]), true);

  check('rok szkolny od września', schoolYearStart('2026-09-14'), '2026-09-01');
  check('styczeń należy do poprzedniego września', schoolYearStart('2027-01-12'), '2026-09-01');
});

/* --- podstawowa seria ------------------------------------------------ */

group('Seria', () => {
  const week = ['2026-09-14', '2026-09-15', '2026-09-16', '2026-09-17', '2026-09-18'];

  let s = deriveStreak(record(week), '2026-09-18');
  check('pięć dni nauki z rzędu', s.streak, 5);
  check('rekord równy serii', s.longest, 5);
  check('suma dni', s.totalDays, 5);
  check('dziś zaliczone', s.todayDone, true);
  check('zamrażarki nietknięte', s.freezesLeft, 2);

  // Piątek i poniedziałek bez weekendu w środku — weekend nic nie kosztuje.
  s = deriveStreak(record(['2026-09-18', '2026-09-21']), '2026-09-21');
  check('weekend nie łamie serii', s.streak, 2);

  // Lekcja w sobotę dokłada dzień, mimo że nikt jej nie wymagał.
  s = deriveStreak(record(['2026-09-18', '2026-09-19', '2026-09-21']), '2026-09-21');
  check('lekcja w weekend dokłada dzień', s.streak, 3);
  check('licznik weekendów', s.weekendDays, 1);

  // Dzień jeszcze trwa: brak lekcji dziś nie zeruje wczorajszej serii.
  s = deriveStreak(record(week), '2026-09-21');
  check('dzisiejszy brak lekcji nie zrywa serii', s.streak, 5);
  check('dziś oznaczone jako otwarte', s.week[0].state, 'pending');
  check('dziś niezaliczone', s.todayDone, false);
});

/* --- zamrażarki ------------------------------------------------------ */

group('Zamrażarki', () => {
  // Środa opuszczona, reszta tygodnia zrobiona.
  let s = deriveStreak(
    record(['2026-09-14', '2026-09-15', '2026-09-17', '2026-09-18']),
    '2026-09-18'
  );
  check('zamrażarka ratuje opuszczony dzień', s.streak, 4);
  check('opuszczony dzień oznaczony jako zamrożony', s.week[2].state, 'frozen');
  check('została jedna zamrażarka', s.freezesLeft, 1);
  check('zamrożony dzień nie liczy się do sumy', s.totalDays, 4);

  // Dwa opuszczone dni — obie zamrażarki w ruch, seria stoi.
  s = deriveStreak(record(['2026-09-14', '2026-09-17', '2026-09-18']), '2026-09-18');
  check('dwie zamrażarki ratują dwa dni', s.streak, 3);
  check('budżet tygodnia wyczerpany', s.freezesLeft, 0);

  // Trzy opuszczone dni w jednym tygodniu — trzeciego nie ma czym uratować.
  s = deriveStreak(record(['2026-09-14', '2026-09-18']), '2026-09-18');
  check('trzeci opuszczony dzień zrywa serię', s.streak, 1);
  check('rekord przeżywa zerwanie', s.longest, 1);
  check('suma dni nie spada', s.totalDays, 2);

  // Budżet odnawia się w poniedziałek: po jednym opuszczonym dniu w każdym tygodniu.
  s = deriveStreak(
    record([
      '2026-09-14', '2026-09-15', '2026-09-17', '2026-09-18',
      '2026-09-21', '2026-09-22', '2026-09-24', '2026-09-25',
    ]),
    '2026-09-25'
  );
  check('zamrażarki odnawiają się co tydzień', s.streak, 8);
  check('nowy tydzień, jedna zużyta', s.freezesLeft, 1);
});

/* --- zerwanie i rekord ----------------------------------------------- */

group('Zerwanie', () => {
  const s = deriveStreak(
    record([
      '2026-09-14', '2026-09-15', '2026-09-16', '2026-09-17', '2026-09-18',
      // cały tydzień przerwy — zamrażarki nie wystarczą
      '2026-10-05',
    ]),
    '2026-10-05'
  );
  check('po długiej przerwie seria startuje od nowa', s.streak, 1);
  check('rekord zostaje', s.longest, 5);
  check('data rekordu', s.longestEndedOn, '2026-09-18');
  check('suma dni rośnie mimo zerwania', s.totalDays, 6);
  check('powrót policzony', s.returns, 1);

  // Pt nauka, Pn–Wt zamrożone, Śr przepada → passa pęka. Zamrożone dni nie
  // uratowały niczego: nie mogą wisieć jako „uratowane” obok serii 1.
  const broken = deriveStreak(record(['2026-10-09', '2026-10-17']), '2026-10-17');
  check('passa pęknięta mimo zamrażarek: seria od nowa', broken.streak, 1);
  check('pęknięta passa: brak „uratowanych” w tygodniu', broken.frozenThisWeek, []);
  check('pęknięta passa: Pn–Wt to dni opuszczone', broken.week.slice(0, 3).map((c) => c.state), ['missed', 'missed', 'missed']);
  check('pęknięta passa: zamrażarki wracają do budżetu', broken.freezesLeft, 2);
});

/* --- przerwy w roku szkolnym ----------------------------------------- */

group('Przerwy', () => {
  // Przerwa świąteczna: 23.12 – 01.01 nie kosztuje nic, mimo że to dni robocze.
  const s = deriveStreak(record(['2026-12-22', '2027-01-04']), '2027-01-04');
  check('przerwa świąteczna nie łamie serii', s.streak, 2);

  // Własne ferie zimowe zaznaczone przez użytkownika.
  const withBreak = {
    ...record(['2027-01-15', '2027-02-01']),
    breaks: [['2027-01-18', '2027-01-29']],
  };
  check('własne ferie nie łamią serii', deriveStreak(withBreak, '2027-02-01').streak, 2);
});

/* --- kamienie milowe i liczniki -------------------------------------- */

group('Kamienie milowe', () => {
  const days = [];
  for (let i = 0; i < 21; i++) days.push(addDays('2026-09-14', i));
  const s = deriveStreak(record(days), days[days.length - 1]);

  check('trzy tygodnie z weekendami', s.streak, 21);
  check('data progu 5 dni', s.milestones.get(5), '2026-09-18');
  check('data progu 20 dni', s.milestones.get(20), '2026-10-03');
  check('aktywne poniedziałki', s.mondayDays, 3);
  check('następny próg po 21 dniach', nextMilestone(21), { target: 40, left: 19 });
  check('po najwyższym progu nie ma następnego', nextMilestone(200), null);

  const mixed = deriveStreak(
    record({
      '2026-09-14': ['matematyka/liczby-naturalne/lekcja', 'informatyka/komputer-i-pliki/lekcja'],
      '2026-09-15': ['matematyka/liczby-naturalne/inna'],
    }),
    '2026-09-15'
  );
  check('dzień z dwoma przedmiotami', mixed.twoSubjectDays, 1);
  check('suma lekcji', mixed.totalLessons, 3);
});

/* --- taśma roku ------------------------------------------------------ */

group('Taśma roku', () => {
  const s = deriveStreak(record(['2026-09-14', '2026-09-19']), '2026-09-14');
  check('taśma zaczyna się w tygodniu 1 września', s.tape[0].start, '2026-08-31');
  check('taśma sięga końca zajęć', s.tape[s.tape.length - 1].start <= '2027-06-30', true);
  check('kolumna ma pięć dni nauki', s.tape[0].days.length, 5);

  const septemberWeek = s.tape.find((column) => column.start === '2026-09-14');
  check('lekcja widoczna w kolumnie', septemberWeek.doneCount, 1);
  check('weekend zaznaczony osobno', septemberWeek.weekendDone, true);

  const future = s.tape[s.tape.length - 1];
  check('przyszłe tygodnie są puste', future.days.every((d) => d.state === 'blank'), true);
});

/* --- pusty stan ------------------------------------------------------ */

group('Pusty stan', () => {
  const s = deriveStreak({ days: {}, legacy: [], breaks: [] }, '2026-09-14');
  check('brak serii', s.streak, 0);
  check('brak rekordu', s.longest, 0);
  check('pełny budżet zamrażarek', s.freezesLeft, 2);
  check('tydzień ma siedem pól', s.week.length, 7);
  check('nic nie jest zaliczone', s.week.every((d) => d.state !== 'done'), true);
  // Świeże konto też ma „dziś" — dzień nauki bez lekcji jest otwarty, nie pusty.
  check('dzisiejszy dzień jest otwarty', s.week[0].state, 'pending');
  check('pozostałe dni puste', s.week.slice(1, 5).every((d) => d.state === 'blank'), true);
  check('weekend świeżego konta pusty', s.week.slice(5).every((d) => d.state === 'blank'), true);

  const seeded = deriveStreak({ days: {}, legacy: ['matematyka/a/b', 'matematyka/a/c'], breaks: [] }, '2026-09-14');
  check('lekcje sprzed serii liczą się do odznak', seeded.totalLessons, 2);
  check('ale nie dają dni', seeded.totalDays, 0);
});

console.log(
  failures === 0
    ? `\n✓ ${checks} sprawdzeń przeszło\n`
    : `\n✗ ${failures} z ${checks} sprawdzeń nie przeszło\n`
);
process.exit(failures === 0 ? 0 : 1);
