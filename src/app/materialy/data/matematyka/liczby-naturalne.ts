import type { Sciaga, ZestawFiszek } from '../types';

const MODUL = {
  numer: 1,
  tytul: 'Liczby naturalne i działania w pamięci',
  href: '/matematyka/klasa-4/liczby-naturalne',
};

const ZAKRES = [
  'zapis dużych liczb',
  'oś liczbowa',
  'porównywanie liczb',
  'dodawanie i odejmowanie w pamięci',
  'własności działań',
  'mnożenie i dzielenie przez 10, 100, 1000',
  'dzielenie z resztą',
  'kwadraty i sześciany',
  'cechy podzielności',
  'kolejność działań',
  'szacowanie wyników',
];

export const liczbyNaturalneSciaga: Sciaga = {
  przedmiot: 'matematyka',
  klasa: 4,
  slug: 'liczby-naturalne-sciaga',
  rodzaj: 'sciaga',
  modul: MODUL,
  tytul: 'Liczby naturalne — ściąga',
  opis: 'Liczby naturalne i działania w pamięci z klasy 4 na jednej stronie A4: klasy liczb, porównywanie, dzielenie z resztą, cechy podzielności, kolejność działań, szacowanie i trzy najczęstsze pułapki.',
  zakres: ZAKRES,
  aktualizacja: '2026-10-24',
  zdanie:
    'Każdą dużą liczbę i każde działanie rozkładasz na małe kawałki, które umiesz policzyć w pamięci.',
  bloki: [
    {
      typ: 'regula',
      tytul: 'Klasy liczby',
      tekst: 'Cyfry dzielisz od prawej na grupy po trzy: jedności, tysiące, miliony. Każdą grupę czytasz jak zwykłą liczbę.',
      przyklad: '4 208 306 → 4 miliony 208 tysięcy 306',
    },
    {
      typ: 'regula',
      tytul: 'Porównywanie',
      tekst: 'Więcej cyfr to większa liczba. Tyle samo cyfr: idziesz od lewej do pierwszej różnej cyfry.',
      przyklad: '987 000 < 1 002 000     30 412 < 30 500',
    },
    {
      typ: 'regula',
      tytul: 'Liczenie w pamięci',
      tekst: 'Rozkładasz liczbę na setki, dziesiątki i jedności i doskakujesz po kawałku. W dodawaniu i mnożeniu wolno zmienić kolejność.',
      przyklad: '348 + 267 = 348 + 200 + 60 + 7 = 615',
    },
    {
      typ: 'regula',
      tytul: 'Przez 10, 100, 1000',
      tekst: 'Mnożąc, dopisujesz tyle zer, ile ich ma 10, 100 albo 1000. Dzieląc, tyle zer skreślasz.',
      przyklad: '46 · 100 = 4600     72 000 : 1000 = 72',
    },
    {
      typ: 'regula',
      tytul: 'Dzielenie z resztą',
      tekst: 'Reszta jest zawsze mniejsza od dzielnika. Sprawdzasz: mnożysz z powrotem i dodajesz resztę.',
      przyklad: '34 : 5 = 6 r. 4, bo 5 · 6 + 4 = 34',
    },
    {
      typ: 'regula',
      tytul: 'Cechy podzielności',
      tekst: 'Przez 2, 5 i 10 patrzysz na ostatnią cyfrę, przez 4 i 100 na dwie ostatnie. Przez 3 i 9 dodajesz wszystkie cyfry.',
      przyklad: '5316 → 16 : 4 = 4     243 → 2 + 4 + 3 = 9',
    },
    {
      typ: 'regula',
      tytul: 'Kolejność działań',
      tekst: 'Najpierw nawiasy, potem mnożenie i dzielenie, na końcu dodawanie i odejmowanie. Równe działania liczysz od lewej.',
      przyklad: '(20 − 2) · 5 = 90     20 − 2 · 5 = 10',
    },
    {
      typ: 'regula',
      tytul: 'Szacowanie',
      tekst: 'Zaokrąglasz: cyfra 5 lub większa — w górę, mniejsza — w dół. Szacunek mówi, czy dokładny wynik ma sens.',
      przyklad: '489 + 312 ≈ 500 + 300 = 800',
    },
    {
      typ: 'pulapka',
      tytul: 'Kwadrat to nie razy dwa',
      zle: '4² = 8',
      dobrze: '4² = 4 · 4 = 16',
      dlaczego: 'Mała dwójka mówi, ile razy liczba stoi w mnożeniu, a nie przez co mnożysz.',
    },
    {
      typ: 'pulapka',
      tytul: 'Nie dorysowuj nawiasu',
      zle: '2 + 3 · 4 = 5 · 4 = 20',
      dobrze: '2 + 3 · 4 = 2 + 12 = 14',
      dlaczego: 'Nawiasu tu nie ma, więc mnożenie idzie przed dodawaniem.',
    },
    {
      typ: 'pulapka',
      tytul: 'Za duża reszta',
      zle: '35 : 6 = 4 r. 11',
      dobrze: '35 : 6 = 5 r. 5',
      dlaczego: 'Z 11 da się wydzielić jeszcze jedną szóstkę, więc dzielenie nie było skończone.',
    },
  ],
};

export const liczbyNaturalneFiszki: ZestawFiszek = {
  przedmiot: 'matematyka',
  klasa: 4,
  slug: 'liczby-naturalne-fiszki',
  rodzaj: 'fiszki',
  modul: MODUL,
  tytul: 'Liczby naturalne — fiszki',
  opis: '24 fiszki z liczb naturalnych i działań w pamięci dla klasy 4: pytanie na awersie, odpowiedź z krótkim wyjaśnieniem na rewersie. Trzy arkusze A4 do druku dwustronnego albo do złożenia na pół.',
  zakres: ZAKRES,
  aktualizacja: '2026-10-24',
  karty: [
    {
      awers: { pytanie: 'Ile milionów jest w liczbie 4 208 306?' },
      rewers: { odpowiedz: '4', wyjasnienie: 'Pierwsza grupa cyfr od lewej to klasa milionów.' },
    },
    {
      awers: { pytanie: 'Zapisz cyframi: dwa miliony piętnaście tysięcy trzy.' },
      rewers: { odpowiedz: '2 015 003', wyjasnienie: 'Puste miejsca w klasach wypełniasz zerami: 2 | 015 | 003.' },
    },
    {
      awers: { pytanie: 'Co sprawdzasz najpierw, zanim odczytasz liczbę na osi?' },
      rewers: { odpowiedz: 'Ile wart jest jeden odstęp.', wyjasnienie: 'Ta sama metoda działa przy każdej skali.' },
    },
    {
      awers: { pytanie: 'Odstęp na osi to 100. Punkt stoi 3 kreski za 200. Jaka to liczba?' },
      rewers: { odpowiedz: '500', wyjasnienie: '200 + 3 · 100 = 500.' },
    },
    {
      awers: { pytanie: 'Która liczba jest większa: 987 000 czy 1 002 000?' },
      rewers: { odpowiedz: '1 002 000', wyjasnienie: 'Ma 7 cyfr, a 987 000 tylko 6.' },
    },
    {
      awers: { pytanie: 'Która liczba jest większa: 8102 czy 8120?' },
      rewers: { odpowiedz: '8120', wyjasnienie: 'Pierwsza różnica jest na dziesiątkach: 2 > 0.' },
    },
    {
      awers: { pytanie: 'Policz w pamięci: 348 + 267' },
      rewers: { odpowiedz: '615', wyjasnienie: '348 + 200 = 548, + 60 = 608, + 7 = 615.' },
    },
    {
      awers: { pytanie: 'Policz w pamięci: 830 − 465' },
      rewers: { odpowiedz: '365', wyjasnienie: '830 − 400 = 430, − 60 = 370, − 5 = 365.' },
    },
    {
      awers: { pytanie: 'Jak najszybciej policzyć 25 · 7 · 4?' },
      rewers: { odpowiedz: '700', wyjasnienie: 'Zamieniasz kolejność: 25 · 4 = 100, a 100 · 7 = 700.' },
    },
    {
      awers: { pytanie: 'Zapisz 3 · (4 + 2) bez nawiasu.' },
      rewers: { odpowiedz: '3 · 4 + 3 · 2', wyjasnienie: 'Mnożysz każdy składnik w nawiasie: 12 + 6 = 18.' },
    },
    {
      awers: { pytanie: 'Ile to jest 56 : 8?' },
      rewers: { odpowiedz: '7', wyjasnienie: 'Bo 7 · 8 = 56. Dzielenie sprawdzasz mnożeniem.' },
    },
    {
      awers: { pytanie: 'Ile to jest 46 · 100?' },
      rewers: { odpowiedz: '4600', wyjasnienie: '100 ma dwa zera, więc dopisujesz dwa zera.' },
    },
    {
      awers: { pytanie: 'Ile to jest 72 000 : 1000?' },
      rewers: { odpowiedz: '72', wyjasnienie: '1000 ma trzy zera, więc trzy zera skreślasz.' },
    },
    {
      awers: { pytanie: 'Podziel z resztą: 34 : 5' },
      rewers: { odpowiedz: '6 r. 4', wyjasnienie: '5 · 6 = 30, a do 34 brakuje jeszcze 4.' },
    },
    {
      awers: { pytanie: '27 dzieci, w łódce mieszczą się 4 osoby. Ile łódek trzeba?' },
      rewers: { odpowiedz: '7 łódek', wyjasnienie: '27 : 4 = 6 r. 3, a te 3 osoby też muszą popłynąć.' },
    },
    {
      awers: { pytanie: 'Co jest nie tak: 17 : 4 = 3 r. 5?' },
      rewers: { odpowiedz: '17 : 4 = 4 r. 1', wyjasnienie: 'Reszta 5 jest większa od dzielnika 4, więc mieści się jeszcze jedna czwórka.' },
    },
    {
      awers: { pytanie: 'Ile to jest 6²?' },
      rewers: { odpowiedz: '36', wyjasnienie: '6 · 6 = 36, a nie 6 · 2.' },
    },
    {
      awers: { pytanie: 'Ile to jest 3³?' },
      rewers: { odpowiedz: '27', wyjasnienie: '3 · 3 · 3 = 27: trzy trójki w mnożeniu.' },
    },
    {
      awers: { pytanie: 'Czy 243 dzieli się przez 9?' },
      rewers: { odpowiedz: 'Tak', wyjasnienie: 'Suma cyfr 2 + 4 + 3 = 9, a 9 dzieli się przez 9.' },
    },
    {
      awers: { pytanie: 'Czy 5316 dzieli się przez 4?' },
      rewers: { odpowiedz: 'Tak', wyjasnienie: 'Dwie ostatnie cyfry to 16, a 16 dzieli się przez 4.' },
    },
    {
      awers: { pytanie: 'Liczba kończy się zerem. Przez co na pewno się dzieli?' },
      rewers: { odpowiedz: 'Przez 2, 5 i 10', wyjasnienie: 'Wszystkie trzy cechy patrzą tylko na ostatnią cyfrę.' },
    },
    {
      awers: { pytanie: 'Ile to jest 20 − 2 · 5?' },
      rewers: { odpowiedz: '10', wyjasnienie: 'Mnożenie przed odejmowaniem: 20 − 10 = 10.' },
    },
    {
      awers: { pytanie: 'Ile to jest (20 − 2) · 5?' },
      rewers: { odpowiedz: '90', wyjasnienie: 'Nawias pierwszy: 18 · 5 = 90.' },
    },
    {
      awers: { pytanie: 'Zaokrąglij 2996 do setek.' },
      rewers: { odpowiedz: '3000', wyjasnienie: 'Cyfra dziesiątek to 9, więc w górę: 2900 + 100 = 3000.' },
    },
  ],
};
