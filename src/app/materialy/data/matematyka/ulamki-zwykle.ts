import type { Sciaga, ZestawFiszek } from '../types';

const MODUL = {
  numer: 5,
  tytul: 'Ułamki zwykłe',
  href: '/matematyka/klasa-4/ulamki-zwykle',
};

const ZAKRES = [
  'licznik i mianownik',
  'ułamki na osi liczbowej',
  'porównywanie ułamków',
  'rozszerzanie i skracanie',
  'liczby mieszane',
  'ułamek jako wynik dzielenia',
  'dodawanie i odejmowanie',
  'mnożenie przez liczbę naturalną',
];

export const ulamkiZwykleSciaga: Sciaga = {
  przedmiot: 'matematyka',
  klasa: 4,
  slug: 'ulamki-zwykle-sciaga',
  rodzaj: 'sciaga',
  modul: MODUL,
  tytul: 'Ułamki zwykłe — ściąga',
  opis: 'Cały moduł ułamków zwykłych z klasy 4 na jednej stronie A4: reguły, rozwiązane przykłady i trzy najczęstsze pułapki. Do druku i do zeszytu.',
  zakres: ZAKRES,
  aktualizacja: '2026-10-24',
  zdanie:
    'Mianownik mówi, na ile równych części dzielisz całość. Licznik mówi, ile tych części bierzesz.',
  bloki: [
    {
      typ: 'regula',
      tytul: 'Licznik i mianownik',
      tekst: 'Pasek podzielony na 8 równych części, zamalowane 3. To {3/8}.',
      schemat: { typ: 'pasek', licznik: 3, mianownik: 8 },
    },
    {
      typ: 'regula',
      tytul: 'Ułamek na osi',
      tekst: 'Odcinek od 0 do 1 dzielisz na tyle części, ile wynosi mianownik. Liczysz kreski od zera.',
      schemat: {
        typ: 'os',
        do: 2,
        podzial: 4,
        punkty: [
          { kreska: 3, podpis: '{3/4}' },
          { kreska: 6, podpis: '{6/4}' },
        ],
      },
    },
    {
      typ: 'regula',
      tytul: 'Porównywanie',
      tekst: 'Ten sam mianownik: większy jest ułamek z większym licznikiem. Ten sam licznik: większy jest ułamek z mniejszym mianownikiem.',
      przyklad: '{5/7} > {3/7}     {1/3} > {1/5}',
    },
    {
      typ: 'regula',
      tytul: 'Rozszerzanie i skracanie',
      tekst: 'Licznik i mianownik mnożysz albo dzielisz przez tę samą liczbę. Wartość się nie zmienia.',
      przyklad: '{2/3} = {8/12} (· 4)     {6/8} = {3/4} (: 2)',
      schemat: { typ: 'kolo', licznik: 3, mianownik: 4 },
    },
    {
      typ: 'regula',
      tytul: 'Liczby mieszane',
      tekst: 'Licznik dzielisz przez mianownik. Wynik to całości, reszta zostaje nad kreską.',
      przyklad: '{11/4}: 11 : 4 = 2 r. 3, więc {11/4} = {2 3/4}',
    },
    {
      typ: 'regula',
      tytul: 'Ułamek to dzielenie',
      tekst: 'Kreska ułamkowa zastępuje znak dzielenia.',
      przyklad: '3 : 4 = {3/4}     5 : 8 = {5/8}',
    },
    {
      typ: 'regula',
      tytul: 'Dodawanie i odejmowanie',
      tekst: 'Przy tych samych mianownikach dodajesz albo odejmujesz liczniki. Mianownik przepisujesz.',
      przyklad: '{2/9} + {5/9} = {7/9}     {7/10} − {3/10} = {4/10} = {2/5}',
    },
    {
      typ: 'regula',
      tytul: 'Mnożenie przez liczbę',
      tekst: 'Mnożysz tylko licznik. Mianownik zostaje.',
      przyklad: '4 · {2/7} = {8/7} = {1 1/7}',
    },
    {
      typ: 'pulapka',
      tytul: 'Nie dodawaj mianowników',
      zle: '{1/4} + {2/4} = {3/8}',
      dobrze: '{1/4} + {2/4} = {3/4}',
      dlaczego: 'Ćwiartki dodane do ćwiartek nadal są ćwiartkami.',
    },
    {
      typ: 'pulapka',
      tytul: 'Większy mianownik to mniejszy kawałek',
      zle: '{1/8} > {1/4}, bo 8 > 4',
      dobrze: '{1/8} < {1/4}',
      dlaczego: 'Im na więcej części dzielisz pizzę, tym mniejszy jest każdy kawałek.',
    },
    {
      typ: 'pulapka',
      tytul: 'Przy mnożeniu mianownik zostaje',
      zle: '3 · {2/5} = {6/15}',
      dobrze: '3 · {2/5} = {6/5} = {1 1/5}',
      dlaczego: 'Trzy razy po dwie piąte to sześć piątych, nie piętnaste.',
    },
  ],
};

export const ulamkiZwykleFiszki: ZestawFiszek = {
  przedmiot: 'matematyka',
  klasa: 4,
  slug: 'ulamki-zwykle-fiszki',
  rodzaj: 'fiszki',
  modul: MODUL,
  tytul: 'Ułamki zwykłe — fiszki',
  opis: '16 fiszek z ułamków zwykłych dla klasy 4: pytanie na awersie, odpowiedź z krótkim wyjaśnieniem na rewersie. Dwa arkusze A4 do druku dwustronnego albo do złożenia na pół.',
  zakres: ZAKRES,
  aktualizacja: '2026-10-24',
  karty: [
    {
      awers: { pytanie: 'Co mówi mianownik?' },
      rewers: { odpowiedz: 'Na ile równych części podzielono całość.', wyjasnienie: 'W {3/8} całość ma 8 części.' },
    },
    {
      awers: { pytanie: 'Co mówi licznik?' },
      rewers: { odpowiedz: 'Ile części bierzesz.', wyjasnienie: 'W {3/8} bierzesz 3 części.' },
    },
    {
      awers: { pytanie: 'Jaki ułamek paska jest zamalowany?', schemat: { typ: 'pasek', licznik: 5, mianownik: 6 } },
      rewers: { odpowiedz: '{5/6}', wyjasnienie: '6 równych części, zamalowane 5.' },
    },
    {
      awers: {
        pytanie: 'Jaki ułamek wskazuje znak zapytania?',
        schemat: { typ: 'os', do: 1, podzial: 4, punkty: [{ kreska: 3, podpis: '?' }] },
      },
      rewers: { odpowiedz: '{3/4}', wyjasnienie: 'Odcinek 0–1 ma 4 części, punkt leży na trzeciej kresce.' },
    },
    {
      awers: { pytanie: 'Który ułamek jest większy: {3/7} czy {5/7}?' },
      rewers: { odpowiedz: '{5/7}', wyjasnienie: 'Ten sam mianownik, więc wygrywa większy licznik.' },
    },
    {
      awers: { pytanie: 'Który ułamek jest większy: {1/3} czy {1/5}?' },
      rewers: { odpowiedz: '{1/3}', wyjasnienie: 'Z tego samego licznika większy jest kawałek z mniejszym mianownikiem.' },
    },
    {
      awers: { pytanie: 'Skróć ułamek {6/8}.' },
      rewers: { odpowiedz: '{3/4}', wyjasnienie: 'Licznik i mianownik dzielisz przez 2.' },
    },
    {
      awers: { pytanie: 'Rozszerz {2/3} tak, żeby mianownik wynosił 12.' },
      rewers: { odpowiedz: '{8/12}', wyjasnienie: '3 · 4 = 12, więc licznik też mnożysz przez 4.' },
    },
    {
      awers: { pytanie: 'Zamień {11/4} na liczbę mieszaną.' },
      rewers: { odpowiedz: '{2 3/4}', wyjasnienie: '11 : 4 = 2 reszty 3.' },
    },
    {
      awers: { pytanie: 'Zamień {3 1/2} na ułamek niewłaściwy.' },
      rewers: { odpowiedz: '{7/2}', wyjasnienie: '3 · 2 + 1 = 7 połówek.' },
    },
    {
      awers: { pytanie: 'Zapisz dzielenie 5 : 8 jako ułamek.' },
      rewers: { odpowiedz: '{5/8}', wyjasnienie: 'Kreska ułamkowa to znak dzielenia.' },
    },
    {
      awers: { pytanie: 'Ile to jest {2/9} + {5/9}?' },
      rewers: { odpowiedz: '{7/9}', wyjasnienie: 'Dodajesz liczniki, mianownik zostaje.' },
    },
    {
      awers: { pytanie: 'Ile to jest {7/10} − {3/10}?' },
      rewers: { odpowiedz: '{4/10} = {2/5}', wyjasnienie: 'Odejmujesz liczniki, potem możesz skrócić przez 2.' },
    },
    {
      awers: { pytanie: 'Ile to jest 4 · {2/7}?' },
      rewers: { odpowiedz: '{8/7} = {1 1/7}', wyjasnienie: 'Mnożysz tylko licznik: 4 · 2 = 8.' },
    },
    {
      awers: { pytanie: 'Ile minut to {1/4} godziny?' },
      rewers: { odpowiedz: '15 minut', wyjasnienie: '60 minut dzielisz na 4 równe części.' },
    },
    {
      awers: { pytanie: 'Kiedy ułamek jest niewłaściwy?' },
      rewers: { odpowiedz: 'Gdy licznik jest większy od mianownika albo mu równy.', wyjasnienie: 'Na przykład {5/3} albo {4/4}: to co najmniej jedna całość.' },
    },
  ],
};
