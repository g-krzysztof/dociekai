import type { Sciaga, ZestawFiszek } from '../types';

const MODUL = {
  numer: 3,
  tytul: 'Działania pisemne',
  href: '/matematyka/klasa-4/dzialania-pisemne',
};

const ZAKRES = [
  'dodawanie pisemne',
  'odejmowanie pisemne z pożyczaniem',
  'mnożenie pisemne przez liczbę jednocyfrową',
  'mnożenie pisemne przez liczbę wielocyfrową',
  'mnożenie liczb zakończonych zerami',
  'dzielenie pisemne przez liczbę jednocyfrową',
  'zadania tekstowe z działaniami pisemnymi',
];

export const dzialaniaPisemneSciaga: Sciaga = {
  przedmiot: 'matematyka',
  klasa: 4,
  slug: 'dzialania-pisemne-sciaga',
  rodzaj: 'sciaga',
  modul: MODUL,
  tytul: 'Działania pisemne — ściąga',
  opis: 'Działania pisemne z klasy 4 na jednej stronie A4: ustawianie liczb w słupku, dodawanie z przenoszeniem, odejmowanie z pożyczaniem, mnożenie przez liczbę jedno- i wielocyfrową, skrót z zerami, dzielenie pisemne, szacowanie i trzy najczęstsze pułapki.',
  zakres: ZAKRES,
  aktualizacja: '2026-10-25',
  zdanie:
    'W słupku każda cyfra ma swoją kolumnę, a to, co się w niej nie mieści, wędruje do sąsiada.',
  bloki: [
    {
      typ: 'regula',
      tytul: 'Ustaw kolumny',
      tekst: 'Jedności pod jednościami, dziesiątki pod dziesiątkami. Krótszą liczbę dosuwasz do prawej.',
      przyklad: '245 + 8 → 8 stoi pod 5',
    },
    {
      typ: 'regula',
      tytul: 'Dodawanie',
      tekst: 'Zaczynasz od jedności. Gdy w kolumnie wyjdzie 10 lub więcej, piszesz cyfrę jedności, a 1 przenosisz nad kolumnę po lewej.',
      przyklad: '999 + 1 = 1000',
      schemat: {
        typ: 'slupek',
        wiersze: [
          { kratki: '11 ', male: true },
          { kratki: '248' },
          { kratki: '176', znak: '+' },
          { kratki: '424', kreska: true },
        ],
      },
    },
    {
      typ: 'regula',
      tytul: 'Odejmowanie',
      tekst: 'Za mała górna cyfra pożycza 10 z kolumny po lewej — tamtą przekreślasz. Zero nie ma czego oddać, więc samo pożycza dalej.',
      przyklad: '1000 − 1 = 999',
      schemat: {
        typ: 'slupek',
        wiersze: [
          { kratki: '39 ', male: true },
          { kratki: '403', skreslone: [0, 1], pozyczone: [2] },
          { kratki: '128', znak: '−' },
          { kratki: '275', kreska: true },
        ],
      },
    },
    {
      typ: 'regula',
      tytul: 'Mnożenie przez cyfrę',
      tekst: 'Mnożysz każdą cyfrę od prawej i dodajesz przeniesienie. Tu przeniesienie może wynieść nawet 8.',
      przyklad: '6 · 5 = 30 → piszesz 0, przenosisz 3',
      schemat: {
        typ: 'slupek',
        wiersze: [
          { kratki: '3 ', male: true },
          { kratki: '306' },
          { kratki: '5', znak: '·' },
          { kratki: '1530', kreska: true },
        ],
      },
    },
    {
      typ: 'regula',
      tytul: 'Mnożnik z kilku cyfr',
      tekst: 'Każda cyfra mnożnika daje osobny wiersz. Wiersz z dziesiątek przesuwasz o kolumnę w lewo, a na końcu wszystko dodajesz.',
      schemat: {
        typ: 'slupek',
        wiersze: [
          { kratki: '34' },
          { kratki: '26', znak: '·' },
          { kratki: '204', kreska: true },
          { kratki: '68 ', znak: '+' },
          { kratki: '884', kreska: true },
        ],
      },
    },
    {
      typ: 'regula',
      tytul: 'Zera na końcu',
      tekst: 'Obcinasz zera z końca obu liczb, mnożysz to, co zostało, i doklejasz wszystkie zera z powrotem.',
      przyklad: '80 · 300 = 24 000     50 · 40 = 2000',
    },
    {
      typ: 'regula',
      tytul: 'Dzielenie',
      tekst: 'Jedyne działanie od lewej. Za małą cyfrę łączysz z następną. Co zostanie na końcu, to reszta.',
      przyklad: '153 : 3 = 51     743 : 6 = 123 r. 5',
    },
    {
      typ: 'regula',
      tytul: 'Najpierw oszacuj',
      tekst: 'Zaokrąglij liczby i policz z grubsza. Dokładny wynik ma wyjść blisko szacunku — jeśli nie, licz jeszcze raz.',
      przyklad: '2650 + 1780 ≈ 4500 → dokładnie 4430',
    },
    {
      typ: 'pulapka',
      tytul: 'Liczba dosunięta do lewej',
      zle: '84 + 9 = 174',
      dobrze: '84 + 9 = 93',
      dlaczego: '9 to jedności, a stanęło pod dziesiątkami i dodało się do 8.',
    },
    {
      typ: 'pulapka',
      tytul: 'Zapomniane przesunięcie',
      zle: '34 · 26 = 272',
      dobrze: '34 · 26 = 884',
      dlaczego: 'Wiersz z cyfry 2 to 34 · 20 = 680, a nie 68 — zaczyna się o kolumnę dalej.',
    },
    {
      typ: 'pulapka',
      tytul: 'Zgubione zero w ilorazie',
      zle: '618 : 6 = 13',
      dobrze: '618 : 6 = 103',
      dlaczego: 'Zniesiona 1 jest mniejsza od 6, więc w ilorazie piszesz 0 — bez niego wynikowi brakuje cyfry.',
    },
  ],
};

export const dzialaniaPisemneFiszki: ZestawFiszek = {
  przedmiot: 'matematyka',
  klasa: 4,
  slug: 'dzialania-pisemne-fiszki',
  rodzaj: 'fiszki',
  modul: MODUL,
  tytul: 'Działania pisemne — fiszki',
  opis: '24 fiszki z działań pisemnych dla klasy 4: dodawanie, odejmowanie, mnożenie i dzielenie w słupku, skrót z zerami, szacowanie i szukanie błędów w cudzym rachunku. Pytanie na awersie, odpowiedź z krótkim wyjaśnieniem na rewersie. Trzy arkusze A4 do druku dwustronnego albo do złożenia na pół.',
  zakres: ZAKRES,
  aktualizacja: '2026-10-25',
  karty: [
    {
      awers: { pytanie: 'Jak ustawić w słupku 8 pod liczbą 245?' },
      rewers: { odpowiedz: 'Pod cyfrą 5', wyjasnienie: '8 to jedności, a jedności stoją pod jednościami.' },
    },
    {
      awers: {
        pytanie: 'Co jest nie tak w tym słupku?',
        schemat: {
          typ: 'slupek',
          wiersze: [
            { kratki: '84' },
            { kratki: '9 ', znak: '+' },
            { kratki: '174', kreska: true },
          ],
        },
      },
      rewers: { odpowiedz: '84 + 9 = 93', wyjasnienie: '9 stanęło pod dziesiątkami, a powinno pod jednościami.' },
    },
    {
      awers: { pytanie: 'Od której kolumny zaczynasz dodawanie, odejmowanie i mnożenie w słupku?' },
      rewers: { odpowiedz: 'Od jedności', wyjasnienie: 'Liczysz od prawej, więc przeniesienie od razu trafia tam, gdzie trzeba.' },
    },
    {
      awers: { pytanie: 'Policz: 2650 + 1780' },
      rewers: { odpowiedz: '4430', wyjasnienie: 'W dziesiątkach i w setkach wychodzi ponad 10, więc przenosisz dwa razy.' },
    },
    {
      awers: { pytanie: 'Policz: 999 + 1' },
      rewers: { odpowiedz: '1000', wyjasnienie: 'Przeniesienie przechodzi przez trzy dziewiątki i tworzy nową kolumnę tysięcy.' },
    },
    {
      awers: { pytanie: 'Kiedy w odejmowaniu pisemnym trzeba pożyczyć?' },
      rewers: { odpowiedz: 'Gdy górna cyfra jest mniejsza', wyjasnienie: 'Wtedy nie da się odjąć wprost, więc bierzesz 10 z kolumny po lewej.' },
    },
    {
      awers: { pytanie: 'Policz: 702 − 345' },
      rewers: { odpowiedz: '357', wyjasnienie: 'Zero dziesiątek pożycza od setek: 7 zmienia się w 6, 0 w 9, a 2 w 12.' },
    },
    {
      awers: { pytanie: 'Policz: 5000 − 2340' },
      rewers: { odpowiedz: '2660', wyjasnienie: 'Pożyczka dla dziesiątek wędruje przez zero setek aż do tysięcy.' },
    },
    {
      awers: { pytanie: 'Policz: 1000 − 1' },
      rewers: { odpowiedz: '999', wyjasnienie: 'Pożyczka przechodzi przez trzy zera — jak 999 + 1 = 1000, tylko w drugą stronę.' },
    },
    {
      awers: { pytanie: 'Policz: 306 · 5' },
      rewers: { odpowiedz: '1530', wyjasnienie: '6 · 5 = 30: piszesz 0, przenosisz 3; 0 · 5 + 3 = 3; 3 · 5 = 15.' },
    },
    {
      awers: { pytanie: 'Ile najwięcej może wynieść przeniesienie w mnożeniu przez jedną cyfrę?' },
      rewers: { odpowiedz: '8', wyjasnienie: 'Nawet 9 · 9 + 8 = 89 daje tylko 8 dziesiątek do przeniesienia.' },
    },
    {
      awers: { pytanie: 'Ile wierszy cząstkowych będzie w mnożeniu 47 · 236?' },
      rewers: { odpowiedz: '3', wyjasnienie: 'Po jednym na każdą cyfrę mnożnika: 6, 3 i 2.' },
    },
    {
      awers: { pytanie: 'Wiersz z cyfry setek mnożnika przesuwasz o ile kolumn w lewo?' },
      rewers: { odpowiedz: 'O 2 kolumny', wyjasnienie: 'Cyfra setek mnoży sto razy więcej, więc wiersz zaczyna się dwie kolumny dalej.' },
    },
    {
      awers: {
        pytanie: 'Co jest nie tak w tym słupku?',
        schemat: {
          typ: 'slupek',
          wiersze: [
            { kratki: '34' },
            { kratki: '26', znak: '·' },
            { kratki: '204', kreska: true },
            { kratki: '68', znak: '+' },
            { kratki: '272', kreska: true },
          ],
        },
      },
      rewers: { odpowiedz: '34 · 26 = 884', wyjasnienie: 'Wiersz 68 nie został przesunięty: trzeba dodać 204 + 680.' },
    },
    {
      awers: { pytanie: 'Policz: 45 · 62' },
      rewers: { odpowiedz: '2790', wyjasnienie: '45 · 2 = 90 i 45 · 6 = 270 przesunięte o kolumnę: 90 + 2700.' },
    },
    {
      awers: { pytanie: 'Ile zer końcowych ma liczba 4050?' },
      rewers: { odpowiedz: 'Jedno', wyjasnienie: 'Zero między 4 a 5 stoi w środku — liczą się tylko zera na samym końcu.' },
    },
    {
      awers: { pytanie: 'Policz bez słupka: 80 · 300' },
      rewers: { odpowiedz: '24 000', wyjasnienie: 'Obcinasz 3 zera, liczysz 8 · 3 = 24 i doklejasz 3 zera.' },
    },
    {
      awers: { pytanie: 'Policz bez słupka: 50 · 40' },
      rewers: { odpowiedz: '2000', wyjasnienie: '5 · 4 = 20 ma własne zero, a do niego doklejasz jeszcze dwa obcięte.' },
    },
    {
      awers: { pytanie: 'Od której cyfry zaczynasz dzielenie pisemne?' },
      rewers: { odpowiedz: 'Od pierwszej z lewej', wyjasnienie: 'To jedyne działanie pisemne, które nie zaczyna się od jedności.' },
    },
    {
      awers: { pytanie: 'Policz: 153 : 3' },
      rewers: { odpowiedz: '51', wyjasnienie: '1 to za mało, więc zaczynasz od 15 : 3 = 5, potem 3 : 3 = 1.' },
    },
    {
      awers: { pytanie: 'Co jest nie tak: 618 : 6 = 13?' },
      rewers: { odpowiedz: '618 : 6 = 103', wyjasnienie: 'Zniesiona 1 jest mniejsza od 6, więc w ilorazie trzeba zapisać 0.' },
    },
    {
      awers: { pytanie: 'Policz: 743 : 6' },
      rewers: { odpowiedz: '123 r. 5', wyjasnienie: '6 · 123 = 738, a do 743 brakuje jeszcze 5 — to reszta.' },
    },
    {
      awers: { pytanie: 'Oszacuj z grubsza: 2980 + 4030' },
      rewers: { odpowiedz: 'Około 7000', wyjasnienie: '3000 + 4000 = 7000, a dokładnie wychodzi 7010 — blisko, więc wynik ma sens.' },
    },
    {
      awers: { pytanie: 'Bilet kosztuje 28 zł. Ile zapłaci 24 uczniów?' },
      rewers: { odpowiedz: '672 zł', wyjasnienie: '28 · 24: 28 · 4 = 112 i 28 · 2 = 56 przesunięte, czyli 112 + 560.' },
    },
  ],
};
