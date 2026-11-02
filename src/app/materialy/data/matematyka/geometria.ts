import type { Sciaga, ZestawFiszek } from '../types';

const MODUL = {
  numer: 4,
  tytul: 'Podstawy geometrii',
  href: '/matematyka/klasa-4/geometria',
};

const ZAKRES = [
  'punkt, prosta, półprosta, odcinek',
  'proste prostopadłe i równoległe',
  'mierzenie odcinków w cm i mm',
  'kąty i kątomierz',
  'rodzaje kątów, kąty przyległe i wierzchołkowe',
  'wielokąty, prostokąty i kwadraty',
  'obwody wielokątów',
  'koło i okrąg: promień, średnica, cięciwa',
  'oś symetrii',
  'skala na planie i mapie',
];

export const geometriaSciaga: Sciaga = {
  przedmiot: 'matematyka',
  klasa: 4,
  slug: 'geometria-sciaga',
  rodzaj: 'sciaga',
  modul: MODUL,
  tytul: 'Podstawy geometrii — ściąga',
  opis: 'Podstawy geometrii z klasy 4 na jednej stronie A4: prosta, półprosta i odcinek, proste prostopadłe i równoległe, kąty i kątomierz, rodzaje kątów, prostokąt i obwód, koło i okrąg, oś symetrii, skala oraz trzy najczęstsze pułapki przy mierzeniu.',
  zakres: ZAKRES,
  aktualizacja: '2026-10-25',
  zdanie: 'Najpierw nazywasz, co widzisz, a potem mierzysz — i zawsze liczysz od zera.',
  bloki: [
    {
      typ: 'regula',
      tytul: 'Prosta, półprosta, odcinek',
      tekst: 'Prosta nie ma końców, półprosta ma jeden początek, odcinek — dwa końce. Linijką zmierzysz tylko odcinek.',
      przyklad: '1 cm = 10 mm     7 cm 4 mm = 74 mm',
      schemat: { typ: 'linie' },
    },
    {
      typ: 'regula',
      tytul: 'Prostopadłe i równoległe',
      tekst: 'Proste prostopadłe przecinają się pod kątem prostym. Proste równoległe nigdy się nie przetną.',
      przyklad: 'a ⊥ b     k || l',
      schemat: { typ: 'proste' },
    },
    {
      typ: 'regula',
      tytul: 'Kąt i kątomierz',
      tekst: 'Kąt to dwa ramiona z jednego wierzchołka. Mierzysz go w stopniach: środek kątomierza w wierzchołku, 0° na ramieniu.',
      przyklad: 'przyległe: razem 180°\nwierzchołkowe: równe',
    },
    {
      typ: 'regula',
      tytul: 'Rodzaje kątów',
      tekst: 'Ostry: mniej niż 90°. Prosty: 90°. Rozwarty: między 90° a 180°.',
      schemat: { typ: 'kat', stopnie: [40, 90, 130], podpisy: true },
    },
    {
      typ: 'regula',
      tytul: 'Prostokąt i obwód',
      tekst: 'Prostokąt ma 4 kąty proste i równe boki naprzeciwko siebie; kwadrat — wszystkie boki równe. Obwód to suma wszystkich boków.',
      przyklad: '2 · (6 + 3) = 18 cm     kwadrat: 4 · bok',
      schemat: { typ: 'figura', ksztalt: 'prostokat', boki: ['6 cm', '3 cm'] },
    },
    {
      typ: 'regula',
      tytul: 'Koło i okrąg',
      tekst: 'Okrąg to sama linia, koło — linia razem z wnętrzem. Promień r łączy środek z okręgiem, średnica d przechodzi przez środek.',
      przyklad: 'd = 2 · r     r = 6 cm → d = 12 cm',
      schemat: {
        typ: 'okrag',
        odcinki: [
          { rodzaj: 'promien', podpis: 'r' },
          { rodzaj: 'srednica', podpis: 'd' },
        ],
      },
    },
    {
      typ: 'regula',
      tytul: 'Oś symetrii',
      tekst: 'Po złożeniu wzdłuż osi obie połówki się pokrywają. Odbity punkt leży po drugiej stronie, tak samo daleko od osi.',
      przyklad: 'prostokąt: 2 osie     kwadrat: 4 osie',
      schemat: { typ: 'figura', ksztalt: 'kwadrat', osie: true },
    },
    {
      typ: 'regula',
      tytul: 'Skala',
      tekst: 'Skala 1 : 100 znaczy, że 1 cm na planie to 100 cm naprawdę. Z planu do rzeczywistości mnożysz, z powrotem dzielisz.',
      przyklad: '1 : 50, na planie 8 cm → 400 cm = 4 m',
    },
    {
      typ: 'pulapka',
      tytul: 'Od zera, nie od brzegu',
      zle: '15–69 mm → 69 mm',
      dobrze: '69 − 15 = 54 mm',
      dlaczego: 'Brzeg linijki to nie zero — długość liczysz od kreski, przy której odcinek się zaczyna.',
    },
    {
      typ: 'pulapka',
      tytul: 'Dwie podziałki',
      zle: 'kąt ostry: 140°',
      dobrze: '40° — od 0° na Twoim ramieniu',
      dlaczego: 'Każda kreska ma dwie liczby; czytasz tę, która liczy od Twojego ramienia.',
    },
    {
      typ: 'pulapka',
      tytul: 'Przekątna to nie oś',
      zle: 'prostokąt ma 4 osie',
      dobrze: 'prostokąt ma 2 osie',
      dlaczego: 'Złóż prostokąt wzdłuż przekątnej, a rogi wystaną — połówki się nie pokryją.',
    },
  ],
};

export const geometriaFiszki: ZestawFiszek = {
  przedmiot: 'matematyka',
  klasa: 4,
  slug: 'geometria-fiszki',
  rodzaj: 'fiszki',
  modul: MODUL,
  tytul: 'Podstawy geometrii — fiszki',
  opis: '24 fiszki do wycięcia z podstaw geometrii w klasie 4: prosta i odcinek, proste prostopadłe i równoległe, milimetry, kąty i kątomierz, wielokąty, obwody, koło, osie symetrii i skala. Pytanie z przodu, odpowiedź z wyjaśnieniem z tyłu.',
  zakres: ZAKRES,
  aktualizacja: '2026-10-25',
  karty: [
    {
      awers: { pytanie: 'Ile końców ma odcinek?' },
      rewers: { odpowiedz: 'Dwa końce', wyjasnienie: 'Dlatego tylko odcinek ma długość, którą zmierzysz linijką.' },
    },
    {
      awers: { pytanie: 'Światło latarki: prosta, półprosta czy odcinek?' },
      rewers: { odpowiedz: 'Półprosta', wyjasnienie: 'Ma początek w latarce i biegnie dalej bez końca.' },
    },
    {
      awers: { pytanie: 'Półprosta zaczyna się w G i biegnie przez H. Jak ją zapiszesz?' },
      rewers: { odpowiedz: 'Półprosta GH', wyjasnienie: 'Pierwsza litera to zawsze początek półprostej.' },
    },
    {
      awers: { pytanie: 'Co znaczy zapis a ⊥ b?' },
      rewers: { odpowiedz: 'a jest prostopadła do b', wyjasnienie: 'Te proste przecinają się pod kątem prostym, czyli 90°.' },
    },
    {
      awers: { pytanie: 'Czy dwie proste równoległe mogą się kiedyś przeciąć?' },
      rewers: { odpowiedz: 'Nie, nigdy', wyjasnienie: 'Przez całą drogę są tak samo daleko od siebie.' },
    },
    {
      awers: { pytanie: '7 cm 4 mm to ile milimetrów?' },
      rewers: { odpowiedz: '74 mm', wyjasnienie: '7 cm to 70 mm, a do tego jeszcze 4 mm.' },
    },
    {
      awers: { pytanie: 'Zapisz 62 mm w centymetrach i milimetrach.' },
      rewers: { odpowiedz: '6 cm 2 mm', wyjasnienie: '60 mm to 6 pełnych centymetrów, zostają 2 mm.' },
    },
    {
      awers: { pytanie: 'Odcinek zaczyna się przy kresce 23 mm, a kończy przy 81 mm. Ile ma?' },
      rewers: { odpowiedz: '58 mm', wyjasnienie: 'Nie zaczyna się od zera, więc odejmujesz: 81 − 23.' },
    },
    {
      awers: { pytanie: 'Gdzie kładziesz środek kątomierza?' },
      rewers: { odpowiedz: 'W wierzchołku kąta', wyjasnienie: 'A kreskę 0° ustawiasz na jednym z ramion.' },
    },
    {
      awers: { pytanie: 'Ostry, prosty czy rozwarty?', schemat: { typ: 'kat', stopnie: [130] } },
      rewers: {
        odpowiedz: 'Rozwarty',
        wyjasnienie: 'Jest większy niż kąt prosty, a mniejszy niż 180°.',
        schemat: { typ: 'kat', stopnie: [130], podpisy: true },
      },
    },
    {
      awers: { pytanie: 'Kąt ma 35°. Jaki to rodzaj kąta?' },
      rewers: { odpowiedz: 'Ostry', wyjasnienie: 'Każdy kąt mniejszy niż 90° jest ostry.' },
    },
    {
      awers: { pytanie: 'Jeden z dwóch kątów przyległych ma 65°. Ile ma drugi?' },
      rewers: { odpowiedz: '115°', wyjasnienie: 'Kąty przyległe dają razem 180°: 180° − 65° = 115°.' },
    },
    {
      awers: { pytanie: 'Dwie proste się przecinają, jeden kąt ma 40°. Ile ma kąt wierzchołkowy?' },
      rewers: { odpowiedz: '40°', wyjasnienie: 'Kąty wierzchołkowe, leżące naprzeciw siebie, są zawsze równe.' },
    },
    {
      awers: { pytanie: 'Figura jest zamknięta i ma 5 prostych boków. Jak się nazywa?' },
      rewers: { odpowiedz: 'Pięciokąt', wyjasnienie: 'Nazwę wielokąta dajesz od liczby jego boków.' },
    },
    {
      awers: { pytanie: 'Figura ma 3 proste boki i jeden łuk. Czy to wielokąt?' },
      rewers: { odpowiedz: 'Nie', wyjasnienie: 'Wielokąt jest zamknięty i ma wszystkie boki proste.' },
    },
    {
      awers: { pytanie: 'Czy każdy kwadrat jest prostokątem?' },
      rewers: { odpowiedz: 'Tak', wyjasnienie: 'Ma 4 kąty proste — a do tego wszystkie boki równe.' },
    },
    {
      awers: {
        pytanie: 'Ile wynosi obwód tego prostokąta?',
        schemat: { typ: 'figura', ksztalt: 'prostokat', boki: ['10 cm', '6 cm'] },
      },
      rewers: { odpowiedz: '32 cm', wyjasnienie: '2 · (10 + 6) = 2 · 16 = 32, bo boki naprzeciwko są równe.' },
    },
    {
      awers: { pytanie: 'Kwadrat ma obwód 20 cm. Ile ma jeden bok?' },
      rewers: { odpowiedz: '5 cm', wyjasnienie: 'Kwadrat ma 4 równe boki, więc 20 : 4 = 5.' },
    },
    {
      awers: { pytanie: 'Promień koła ma 6 cm. Ile ma średnica?' },
      rewers: { odpowiedz: '12 cm', wyjasnienie: 'Średnica to dwa promienie w jednej linii: 2 · 6.' },
    },
    {
      awers: {
        pytanie: 'Który odcinek jest cięciwą, ale nie średnicą?',
        schemat: {
          typ: 'okrag',
          odcinki: [
            { rodzaj: 'promien', podpis: 'A' },
            { rodzaj: 'srednica', podpis: 'B' },
            { rodzaj: 'cieciwa', podpis: 'C' },
          ],
        },
      },
      rewers: { odpowiedz: 'C', wyjasnienie: 'Łączy dwa punkty okręgu, ale omija środek. B też jest cięciwą — przez środek.' },
    },
    {
      awers: { pytanie: 'Ile osi symetrii ma prostokąt?', schemat: { typ: 'figura', ksztalt: 'prostokat' } },
      rewers: {
        odpowiedz: '2',
        wyjasnienie: 'Pionowa i pozioma przez środek. Przekątne nie są osiami.',
        schemat: { typ: 'figura', ksztalt: 'prostokat', osie: true },
      },
    },
    {
      awers: { pytanie: 'Ile osi symetrii ma trójkąt równoboczny?', schemat: { typ: 'figura', ksztalt: 'trojkat' } },
      rewers: {
        odpowiedz: '3',
        wyjasnienie: 'Każda biegnie przez wierzchołek i środek boku naprzeciwko.',
        schemat: { typ: 'figura', ksztalt: 'trojkat', osie: true },
      },
    },
    {
      awers: { pytanie: 'Punkt leży 5 cm od osi symetrii. Jak daleko od osi jest jego odbicie?' },
      rewers: { odpowiedz: '5 cm', wyjasnienie: 'Odbicie ląduje po drugiej stronie osi, ale tak samo daleko.' },
    },
    {
      awers: { pytanie: 'Mapa w skali 1 : 50 000. Prawdziwa droga ma 2 km. Ile cm to na mapie?' },
      rewers: { odpowiedz: '4 cm', wyjasnienie: '2 km = 200 000 cm, a 200 000 : 50 000 = 4.' },
    },
  ],
};
