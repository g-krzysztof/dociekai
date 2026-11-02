import type { Sciaga, ZestawFiszek } from '../types';

const MODUL = {
  numer: 6,
  tytul: 'Ułamki dziesiętne',
  href: '/matematyka/klasa-4/ulamki-dziesietne',
};

const ZAKRES = [
  'zapis i odczyt ułamków dziesiętnych',
  'wyrażenia dwumianowane jako ułamek dziesiętny',
  'zamiana ułamek zwykły ↔ ułamek dziesiętny',
  'porównywanie ułamków dziesiętnych',
  'dodawanie ułamków dziesiętnych',
  'odejmowanie ułamków dziesiętnych',
  'mnożenie i dzielenie przez 10, 100, 1000',
];

export const ulamkiDziesietneSciaga: Sciaga = {
  przedmiot: 'matematyka',
  klasa: 4,
  slug: 'ulamki-dziesietne-sciaga',
  rodzaj: 'sciaga',
  modul: MODUL,
  tytul: 'Ułamki dziesiętne — ściąga',
  opis: 'Ułamki dziesiętne z klasy 4 na jednej stronie A4: zapis i odczyt liczby z przecinkiem, metry z centymetrami i złote z groszami jako jedna liczba, zamiana na ułamek zwykły i z powrotem, porównywanie, dodawanie i odejmowanie w słupku, mnożenie i dzielenie przez 10, 100, 1000 oraz trzy najczęstsze pułapki.',
  zakres: ZAKRES,
  aktualizacja: '2026-10-27',
  zdanie:
    'Przecinek oddziela całe od części, a każde miejsce za nim jest dziesięć razy mniejsze od poprzedniego.',
  bloki: [
    {
      typ: 'regula',
      tytul: 'Zapis z przecinkiem',
      tekst: 'Mianownik 10, 100 albo 1000 ma tyle zer, ile cyfr stoi po przecinku. Brakujące miejsca zajmują zera z przodu.',
      przyklad: '{3/10} = 0,3     {7/100} = 0,07     {25/1000} = 0,025',
    },
    {
      typ: 'regula',
      tytul: 'Odczyt',
      tekst: 'Najpierw całe, potem część po przecinku. Nazwę daje ostatnie miejsce: dziesiąte, setne albo tysięczne.',
      przyklad: '3,25 — trzy całe i dwadzieścia pięć setnych',
    },
    {
      typ: 'regula',
      tytul: 'Dwie jednostki naraz',
      tekst: 'Mniejszą jednostkę wpisujesz po przecinku od prawej. 1 m = 100 cm, więc centymetry zajmują dwa miejsca, a gramy w kilogramie — trzy.',
      przyklad: '3 m 25 cm = 3,25 m     2 zł 50 gr = 2,50 zł     1 kg 7 g = 1,007 kg',
    },
    {
      typ: 'regula',
      tytul: 'Zwykły ↔ dziesiętny',
      tekst: 'W obie strony przez mianownik 10, 100 lub 1000: rozszerzasz albo skracasz. Uda się, gdy mianownik ma same dwójki i piątki.',
      przyklad: '{3/4} = {75/100} = 0,75     0,6 = {6/10} = {3/5}',
    },
    {
      typ: 'regula',
      tytul: 'Porównywanie',
      tekst: 'Najpierw całe, potem rząd po rzędzie od lewej. Wyrównaj liczbę miejsc zerami — 0,5 to to samo co 0,50.',
      przyklad: '0,5 > 0,45     2,309 < 2,31',
    },
    {
      typ: 'regula',
      tytul: 'Dodawanie',
      tekst: 'Przecinek pod przecinkiem, krótszej liczbie dopisz zera. Liczysz od prawej, a przeniesienie może przeskoczyć przecinek.',
      przyklad: '0,8 + 0,7 = 1,5',
      schemat: {
        typ: 'slupek',
        wiersze: [
          { kratki: '1  ', male: true },
          { kratki: '2,40' },
          { kratki: '1,85', znak: '+' },
          { kratki: '4,25', kreska: true },
        ],
      },
    },
    {
      typ: 'regula',
      tytul: 'Odejmowanie',
      tekst: 'Tak samo jak dodawanie, tylko z pożyczaniem. Zera pożyczają dalej, a pożyczka też przechodzi przez przecinek.',
      przyklad: '1,2 − 0,5 = 0,7',
      schemat: {
        typ: 'slupek',
        wiersze: [
          { kratki: '59 ', male: true },
          { kratki: '6,00', skreslone: [0, 1], pozyczone: [2] },
          { kratki: '2,63', znak: '−' },
          { kratki: '3,37', kreska: true },
        ],
      },
    },
    {
      typ: 'regula',
      tytul: 'Razy i przez 10, 100, 1000',
      tekst: 'Ile zer, o tyle miejsc skacze przecinek: przy mnożeniu w prawo, przy dzieleniu w lewo. Brakujące miejsca dopełnij zerami.',
      przyklad: '3,5 · 100 = 350     4,2 : 100 = 0,042',
    },
    {
      typ: 'pulapka',
      tytul: 'Zgubione zero',
      zle: '3 m 5 cm = 3,5 m',
      dobrze: '3 m 5 cm = 3,05 m',
      dlaczego: '5 cm to pięć setnych metra, a 3,5 m to trzy metry i aż 50 cm.',
    },
    {
      typ: 'pulapka',
      tytul: 'Więcej cyfr to nie więcej',
      zle: '0,45 > 0,5',
      dobrze: '0,45 < 0,5',
      dlaczego: 'Porównujesz dziesiąte: 4 < 5. Długość zapisu nic nie mówi o wielkości.',
    },
    {
      typ: 'pulapka',
      tytul: 'Zera doklejone na końcu',
      zle: '5,2 · 100 = 5,200',
      dobrze: '5,2 · 100 = 520',
      dlaczego: 'Zero na końcu po przecinku nic nie zmienia — 5,200 to wciąż 5,2. Mnożenie przesuwa przecinek.',
    },
  ],
};

export const ulamkiDziesietneFiszki: ZestawFiszek = {
  przedmiot: 'matematyka',
  klasa: 4,
  slug: 'ulamki-dziesietne-fiszki',
  rodzaj: 'fiszki',
  modul: MODUL,
  tytul: 'Ułamki dziesiętne — fiszki',
  opis: '24 fiszki z ułamków dziesiętnych dla klasy 4: zapis i odczyt, metry, złote i kilogramy z przecinkiem, zamiana na ułamek zwykły, porównywanie, dodawanie i odejmowanie w słupku, przesuwanie przecinka i szukanie błędów w cudzym rachunku. Pytanie na awersie, odpowiedź z krótkim wyjaśnieniem na rewersie. Trzy arkusze A4 do druku dwustronnego albo do złożenia na pół.',
  zakres: ZAKRES,
  aktualizacja: '2026-10-27',
  karty: [
    {
      awers: { pytanie: 'Zapisz {7/100} jako ułamek dziesiętny.' },
      rewers: { odpowiedz: '0,07', wyjasnienie: 'Mianownik 100 ma dwa zera, więc po przecinku są dwa miejsca — puste zajmuje zero.' },
    },
    {
      awers: { pytanie: 'Zapisz liczbą: osiem dziesiątych.' },
      rewers: { odpowiedz: '0,8', wyjasnienie: '{8/10} to jedna cyfra po przecinku. 0,08 to już osiem setnych.' },
    },
    {
      awers: { pytanie: 'Jak przeczytać liczbę 3,25?' },
      rewers: { odpowiedz: 'trzy całe i dwadzieścia pięć setnych', wyjasnienie: 'Po przecinku są dwie cyfry, więc nazwę daje rząd setnych.' },
    },
    {
      awers: { pytanie: 'Która cyfra stoi na miejscu setnych w liczbie 4,187?' },
      rewers: { odpowiedz: '8', wyjasnienie: 'Po przecinku idą kolejno: dziesiąte (1), setne (8), tysięczne (7).' },
    },
    {
      awers: { pytanie: 'Czy 0,7 i 0,70 to różne liczby?' },
      rewers: { odpowiedz: 'Nie, to ta sama liczba', wyjasnienie: '7 dziesiątych to 70 setnych — zero dopisane na końcu nic nie zmienia.' },
    },
    {
      awers: { pytanie: 'Zapisz 3 m 25 cm w metrach.' },
      rewers: { odpowiedz: '3,25 m', wyjasnienie: '1 m = 100 cm, więc centymetry zajmują dwa miejsca po przecinku.' },
    },
    {
      awers: { pytanie: 'Zapisz 3 m 5 cm w metrach.' },
      rewers: { odpowiedz: '3,05 m', wyjasnienie: '5 cm to pięć setnych metra. Puste miejsce dziesiątych zajmuje zero.' },
    },
    {
      awers: { pytanie: 'Zapisz 1 kg 7 g w kilogramach.' },
      rewers: { odpowiedz: '1,007 kg', wyjasnienie: '1 kg = 1000 g, więc gramy zajmują trzy miejsca po przecinku.' },
    },
    {
      awers: { pytanie: 'Zamień {3/4} na ułamek dziesiętny.' },
      rewers: { odpowiedz: '0,75', wyjasnienie: 'Mnożysz licznik i mianownik przez 25: {3/4} = {75/100}.' },
    },
    {
      awers: { pytanie: 'Zamień 0,6 na ułamek zwykły i skróć.' },
      rewers: { odpowiedz: '{3/5}', wyjasnienie: '0,6 = {6/10}, a 6 i 10 dzielą się przez 2.' },
    },
    {
      awers: { pytanie: 'Zamień 0,08 na ułamek zwykły i skróć.' },
      rewers: { odpowiedz: '{2/25}', wyjasnienie: '0,08 = {8/100}, a 8 i 100 dzielą się przez 4.' },
    },
    {
      awers: { pytanie: 'Ile to {1/3} jako ułamek dziesiętny?' },
      rewers: { odpowiedz: '0,333… bez końca', wyjasnienie: 'Do 10, 100 lub 1000 rozszerzysz tylko mianownik z samych dwójek i piątek.' },
    },
    {
      awers: { pytanie: 'Która liczba jest większa: 0,5 czy 0,45?' },
      rewers: { odpowiedz: '0,5', wyjasnienie: 'Wyrównujesz: 0,50 i 0,45. Na miejscu dziesiątych 5 > 4.' },
    },
    {
      awers: { pytanie: 'Wstaw znak <, > lub =:   2,309 … 2,31' },
      rewers: { odpowiedz: '2,309 < 2,31', wyjasnienie: 'Wyrównujesz: 2,309 i 2,310. Na miejscu setnych 0 < 1.' },
    },
    {
      awers: { pytanie: 'Ułóż od najmniejszej:   1,2   1,08   1,15' },
      rewers: { odpowiedz: '1,08 < 1,15 < 1,2', wyjasnienie: 'Całe są równe, więc rozstrzygają dziesiąte: 0, potem 1, potem 2.' },
    },
    {
      awers: { pytanie: 'Policz w pamięci: 0,8 + 0,7' },
      rewers: { odpowiedz: '1,5', wyjasnienie: '15 dziesiątych to 1 cała i 5 dziesiątych — przeniesienie przeskakuje przecinek.' },
    },
    {
      awers: { pytanie: 'Policz pisemnie: 5,7 + 4,58' },
      rewers: {
        odpowiedz: '10,28',
        schemat: {
          typ: 'slupek',
          wiersze: [
            { kratki: '1  ', male: true },
            { kratki: '5,70' },
            { kratki: '4,58', znak: '+' },
            { kratki: '10,28', kreska: true },
          ],
        },
      },
    },
    {
      awers: { pytanie: 'Policz w pamięci: 1,2 − 0,5' },
      rewers: { odpowiedz: '0,7', wyjasnienie: '2 dziesiąte to za mało, więc pożyczasz 1 całą: 12 dziesiątych − 5 = 7.' },
    },
    {
      awers: { pytanie: 'Policz pisemnie: 6 − 2,47' },
      rewers: {
        odpowiedz: '3,53',
        schemat: {
          typ: 'slupek',
          wiersze: [
            { kratki: '59 ', male: true },
            { kratki: '6,00', skreslone: [0, 1], pozyczone: [2] },
            { kratki: '2,47', znak: '−' },
            { kratki: '3,53', kreska: true },
          ],
        },
      },
    },
    {
      awers: { pytanie: 'Ola: „5,2 − 3,15 = 2,63, bo 315 − 52 = 263”. Co jest nie tak?' },
      rewers: { odpowiedz: '5,2 − 3,15 = 2,05', wyjasnienie: 'Przecinek pod przecinkiem: 5,20 − 3,15. Liczb nie wolno zamieniać miejscami.' },
    },
    {
      awers: { pytanie: 'Policz: 3,5 · 100' },
      rewers: { odpowiedz: '350', wyjasnienie: '100 ma dwa zera: przecinek skacze o 2 w prawo, puste miejsce wypełnia zero.' },
    },
    {
      awers: { pytanie: 'Policz: 4,2 : 100' },
      rewers: { odpowiedz: '0,042', wyjasnienie: 'Przecinek skacze o 2 w lewo. Z przodu dochodzą zera, a przed przecinkiem piszesz 0.' },
    },
    {
      awers: { pytanie: 'Kuba: „5,2 · 100 = 5,200, bo dopisuję dwa zera”. Ile powinno wyjść?' },
      rewers: { odpowiedz: '520', wyjasnienie: 'Zera na końcu po przecinku nic nie zmieniają — trzeba przesunąć przecinek.' },
    },
    {
      awers: { pytanie: '1000 jednakowych gwoździ waży 4,5 kg. Ile waży jeden gwóźdź?' },
      rewers: { odpowiedz: '0,0045 kg', wyjasnienie: 'Dzielisz przez 1000: przecinek skacze o 3 miejsca w lewo.' },
    },
  ],
};
