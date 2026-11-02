import type { Sciaga, ZestawFiszek } from '../types';

const MODUL = {
  numer: 2,
  tytul: 'System zapisu liczb i obliczenia praktyczne',
  href: '/matematyka/klasa-4/obliczenia-praktyczne',
};

const ZAKRES = [
  'system rzymski do 3000',
  'złote i grosze',
  'jednostki długości',
  'jednostki masy',
  'obliczenia zegarowe',
  'obliczenia kalendarzowe',
];

export const obliczeniaPraktyczneSciaga: Sciaga = {
  przedmiot: 'matematyka',
  klasa: 4,
  slug: 'obliczenia-praktyczne-sciaga',
  rodzaj: 'sciaga',
  modul: MODUL,
  tytul: 'Obliczenia praktyczne — ściąga',
  opis: 'System rzymski i obliczenia praktyczne z klasy 4 na jednej stronie A4: cyfry rzymskie, złote i grosze, jednostki długości i masy, upływ czasu, kalendarz i trzy najczęstsze pułapki.',
  zakres: ZAKRES,
  aktualizacja: '2026-10-25',
  zdanie:
    'Zanim zamienisz jednostki, sprawdź, ile małych mieści się w dużej: 100 groszy, 1000 metrów, 60 minut.',
  bloki: [
    {
      typ: 'regula',
      tytul: 'Cyfry rzymskie',
      tekst: 'I = 1, V = 5, X = 10, L = 50, C = 100, D = 500, M = 1000. Większy przed mniejszym dodajesz, mniejszy przed większym odejmujesz.',
      przyklad: 'VI = 6     IV = 4     XL = 40     CM = 900',
    },
    {
      typ: 'regula',
      tytul: 'Rzymska liczba',
      tekst: 'Budujesz ją miejsce po miejscu: tysiące, setki, dziesiątki, jedności. Ten sam symbol stoi najwyżej trzy razy pod rząd.',
      przyklad: '1999 = M + CM + XC + IX = MCMXCIX',
    },
    {
      typ: 'regula',
      tytul: 'Złote i grosze',
      tekst: '1 zł = 100 gr. Na grosze mnożysz przez 100. Na złote dzielisz przez 100, a reszta to grosze.',
      przyklad: '4 zł 35 gr = 435 gr     650 gr = 6 zł 50 gr',
    },
    {
      typ: 'regula',
      tytul: 'Liczenie kwot',
      tekst: 'Grosze dodajesz osobno, złote osobno. Gdy groszy jest 100 lub więcej, 100 gr zamieniasz na 1 zł.',
      przyklad: '80 gr + 45 gr = 125 gr = 1 zł 25 gr',
    },
    {
      typ: 'regula',
      tytul: 'Długość',
      tekst: 'mm, cm, dm, m, km. Między sąsiednimi jest razy 10, tylko z m na km od razu razy 1000. Na mniejszą jednostkę mnożysz, na większą dzielisz.',
      przyklad: '1 m = 100 cm     1 km = 1000 m',
    },
    {
      typ: 'regula',
      tytul: 'Masa',
      tekst: 'g, dag, kg, t. Skoki są różne: dag to razy 10, kg razy 100, tona razy 1000.',
      przyklad: '1 kg = 100 dag = 1000 g     1 t = 1000 kg',
    },
    {
      typ: 'regula',
      tytul: 'Upływ czasu',
      tekst: 'Godzina ma 60 minut, minuta 60 sekund. Doliczasz: do pełnej godziny, potem pełne godziny, na końcu resztę minut.',
      przyklad: '7:40 → 10:15 = 20 min + 2 h + 15 min',
    },
    {
      typ: 'regula',
      tytul: 'Kalendarz',
      tekst: 'Tydzień ma 7 dni, miesiąc 30 albo 31, luty 28. Rok przestępny ma 366 dni i 29 lutego: liczba roku dzieli się przez 4 (pełne stulecie — przez 400).',
      przyklad: '2024 — przestępny     1900 — zwykły',
    },
    {
      typ: 'pulapka',
      tytul: 'Godzina to nie 100 minut',
      zle: '10:15 − 7:40 = 2 h 75 min',
      dobrze: '10:15 − 7:40 = 2 h 35 min',
      dlaczego: 'Odejmujesz jak zwykłe liczby, a godzina ma 60 minut — bezpieczniej doliczać po tarczy.',
    },
    {
      typ: 'pulapka',
      tytul: 'Grosze mają dwa miejsca',
      zle: '3 zł 5 gr = 350 gr',
      dobrze: '3 zł 5 gr = 305 gr',
      dlaczego: '5 groszy to 05, a nie 50 — 350 gr to już 3 zł 50 gr.',
    },
    {
      typ: 'pulapka',
      tytul: 'Kilogram to nie 1000 dag',
      zle: '1 kg = 1000 dag',
      dobrze: '1 kg = 100 dag = 1000 g',
      dlaczego: 'Tysiąc jest gramów. Dekagram waży aż 10 g, więc w kilogramie mieści się ich tylko sto.',
    },
  ],
};

export const obliczeniaPraktyczneFiszki: ZestawFiszek = {
  przedmiot: 'matematyka',
  klasa: 4,
  slug: 'obliczenia-praktyczne-fiszki',
  rodzaj: 'fiszki',
  modul: MODUL,
  tytul: 'Obliczenia praktyczne — fiszki',
  opis: '24 fiszki z systemu rzymskiego i obliczeń praktycznych dla klasy 4: pieniądze, długość, masa, zegar i kalendarz. Pytanie na awersie, odpowiedź z krótkim wyjaśnieniem na rewersie. Trzy arkusze A4 do druku dwustronnego albo do złożenia na pół.',
  zakres: ZAKRES,
  aktualizacja: '2026-10-25',
  karty: [
    {
      awers: { pytanie: 'Jaką liczbę zapisano jako XLIV?' },
      rewers: { odpowiedz: '44', wyjasnienie: 'XL = 50 − 10 = 40, a IV = 5 − 1 = 4.' },
    },
    {
      awers: { pytanie: 'Zapisz po rzymsku: 149' },
      rewers: { odpowiedz: 'CXLIX', wyjasnienie: 'Setki C = 100, dziesiątki XL = 40, jedności IX = 9.' },
    },
    {
      awers: { pytanie: 'Zapisz po rzymsku: 1999' },
      rewers: { odpowiedz: 'MCMXCIX', wyjasnienie: 'M + CM + XC + IX, czyli 1000 + 900 + 90 + 9.' },
    },
    {
      awers: { pytanie: 'Co jest nie tak: 4 = IIII?' },
      rewers: { odpowiedz: '4 = IV', wyjasnienie: 'Ten sam symbol stoi najwyżej trzy razy pod rząd, więc 4 to 5 − 1.' },
    },
    {
      awers: { pytanie: 'Ile groszy to 27 zł 50 gr?' },
      rewers: { odpowiedz: '2750 gr', wyjasnienie: '27 · 100 = 2700, a 2700 + 50 = 2750.' },
    },
    {
      awers: { pytanie: 'Zamień 365 gr na złote i grosze.' },
      rewers: { odpowiedz: '3 zł 65 gr', wyjasnienie: '365 : 100 = 3 r. 65 — iloraz to złote, reszta to grosze.' },
    },
    {
      awers: { pytanie: 'Policz: 20 zł − 7 zł 60 gr' },
      rewers: { odpowiedz: '12 zł 40 gr', wyjasnienie: '20 zł to 19 zł i 100 gr: 100 − 60 = 40 gr, 19 − 7 = 12 zł.' },
    },
    {
      awers: { pytanie: 'Płacisz 10 zł za zakupy za 6 zł 35 gr. Ile dostaniesz reszty?' },
      rewers: { odpowiedz: '3 zł 65 gr', wyjasnienie: 'Doliczasz: 6 zł 35 gr + 65 gr = 7 zł, a do 10 zł brakuje jeszcze 3 zł.' },
    },
    {
      awers: { pytanie: 'Ile centymetrów to 3 m 25 cm?' },
      rewers: { odpowiedz: '325 cm', wyjasnienie: '3 m to 300 cm, a 300 + 25 = 325.' },
    },
    {
      awers: { pytanie: 'Ile metrów to 2 km?' },
      rewers: { odpowiedz: '2000 m', wyjasnienie: 'Z kilometrów na metry mnożysz od razu przez 1000.' },
    },
    {
      awers: { pytanie: 'Co jest dłuższe: 5 dm czy 40 cm?' },
      rewers: { odpowiedz: '5 dm', wyjasnienie: '5 dm to 50 cm, a 50 cm to więcej niż 40 cm.' },
    },
    {
      awers: { pytanie: 'Które jest najdłuższe: 950 cm, 8 m czy 99 dm?' },
      rewers: { odpowiedz: '99 dm', wyjasnienie: 'W centymetrach: 950, 800 i 990 — najwięcej ma 99 dm.' },
    },
    {
      awers: { pytanie: 'Ile gramów ma 1 kilogram, a ile dekagramów?' },
      rewers: { odpowiedz: '1000 g = 100 dag', wyjasnienie: 'Dekagram to 10 g, więc dekagramów jest dziesięć razy mniej niż gramów.' },
    },
    {
      awers: { pytanie: 'Zamień: 3 kg 5 dag = ? g' },
      rewers: { odpowiedz: '3050 g', wyjasnienie: '3 kg to 3000 g, a 5 dag to 50 g.' },
    },
    {
      awers: { pytanie: 'Ile kilogramów to 2 t?' },
      rewers: { odpowiedz: '2000 kg', wyjasnienie: 'Tona to od razu 1000 kg.' },
    },
    {
      awers: { pytanie: 'Co waży więcej: kilogram pierza czy kilogram żelaza?' },
      rewers: { odpowiedz: 'Tyle samo', wyjasnienie: 'Oba ważą 1 kg — żelazo zajmuje tylko mniej miejsca.' },
    },
    {
      awers: { pytanie: 'Ile minut to 3 h?' },
      rewers: { odpowiedz: '180 min', wyjasnienie: 'Godzina ma 60 minut: 3 · 60 = 180.' },
    },
    {
      awers: { pytanie: 'Ile minut to 180 s?' },
      rewers: { odpowiedz: '3 min', wyjasnienie: 'Minuta ma 60 sekund: 180 : 60 = 3.' },
    },
    {
      awers: { pytanie: 'Przerwa trwa od 10:50 do 11:05. Ile minut?' },
      rewers: { odpowiedz: '15 min', wyjasnienie: '10 minut do 11:00 i jeszcze 5 minut do 11:05.' },
    },
    {
      awers: { pytanie: 'Wyjazd o 7:40, przyjazd o 10:15. Ile trwała podróż?' },
      rewers: { odpowiedz: '2 h 35 min', wyjasnienie: '20 min do 8:00, 2 h do 10:00 i 15 min do 10:15.' },
    },
    {
      awers: { pytanie: 'Co jest nie tak w wyniku „3 h 75 min”?' },
      rewers: { odpowiedz: '4 h 15 min', wyjasnienie: '75 minut to już godzina i 15 minut.' },
    },
    {
      awers: { pytanie: '18 dni to ile tygodni i ile dni?' },
      rewers: { odpowiedz: '2 tygodnie i 4 dni', wyjasnienie: '18 : 7 = 2 r. 4, bo tydzień ma 7 dni.' },
    },
    {
      awers: { pytanie: 'Ile dni upłynie od 25 listopada do 3 grudnia?' },
      rewers: { odpowiedz: '8 dni', wyjasnienie: 'Listopad ma 30 dni: 5 dni do jego końca i jeszcze 3 dni grudnia.' },
    },
    {
      awers: { pytanie: 'Czy rok 1900 był przestępny?' },
      rewers: { odpowiedz: 'Nie', wyjasnienie: 'Pełne stulecie musi dzielić się przez 400, a 1900 się nie dzieli.' },
    },
  ],
};
