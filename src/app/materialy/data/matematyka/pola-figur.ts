import type { Schemat, Sciaga, ZestawFiszek } from '../types';

const MODUL = {
  numer: 7,
  tytul: 'Pola figur',
  href: '/matematyka/klasa-4/pola-figur',
};

const ZAKRES = [
  'pole jako liczba kwadratów jednostkowych',
  'połówki kratek i różnica między polem a obwodem',
  'jednostki pola: mm², cm², dm², m², ar, hektar, km²',
  'zamiana jednostek pola krokiem ×100',
  'pole prostokąta i kwadratu, brakujący bok',
  'pola figur metodą podziału i uzupełniania',
];

/** Ośmiokąt: 8 całych kratek i 4 połówki = 10 kratek. */
const OSMIOKAT: Schemat = { typ: 'kratki', wiersze: ['◢##◣', '####', '◥##◤'] };

/** Litera L: prostokąty 2 · 4 i 3 · 2 = 14 kratek. */
const LITERA_L = ['##...', '##...', '#####', '#####'];

/** Domek: 4 całe kratki i 2 połówki = 5 kratek. */
const DOMEK: Schemat = { typ: 'kratki', wiersze: ['◢◣', '##', '##'] };

/** Litera T: poprzeczka 6 · 1 i nóżka 2 · 3 = 12 kratek. */
const LITERA_T = ['######', '..##..', '..##..', '..##..'];

/** Ramka 5 · 4 z dziurą 2 · 2 = 16 kratek. */
const RAMKA = ['#####', '#..##', '#..##', '#####'];

export const polaFigurSciaga: Sciaga = {
  przedmiot: 'matematyka',
  klasa: 4,
  slug: 'pola-figur-sciaga',
  rodzaj: 'sciaga',
  modul: MODUL,
  tytul: 'Pola figur — ściąga',
  opis: 'Pola figur z klasy 4 na jednej stronie A4: pole jako liczba kwadratów jednostkowych, połówki kratek, pole a obwód, jednostki pola od mm² do km² z drabinką ×100, ar i hektar, wzór na pole prostokąta i kwadratu, brakujący bok, metody podziału i uzupełniania oraz trzy najczęstsze pułapki.',
  zakres: ZAKRES,
  aktualizacja: '2026-10-27',
  zdanie: 'Pole mówi, ile kwadratów jednostkowych mieści się w figurze — wzór i sprytne cięcie policzą je szybciej niż palec.',
  bloki: [
    {
      typ: 'regula',
      tytul: 'Pole to kratki',
      tekst: 'Pole to powierzchnia figury: liczysz, ile kwadratów jednostkowych się w niej mieści. Dwie połówki to jedna cała kratka.',
      przyklad: '8 całych + 4 połówki = 8 + 2 = 10 kratek',
      schemat: OSMIOKAT,
    },
    {
      typ: 'regula',
      tytul: 'Pole to nie obwód',
      tekst: 'Obwód mierzysz wzdłuż brzegu, pole liczysz w środku. Przesunięty kawałek figury nie zmienia jej pola.',
      przyklad: 'kwadrat 3 cm: P = 9 cm², obwód 12 cm',
    },
    {
      typ: 'regula',
      tytul: 'Jednostki pola',
      tekst: 'Jednostka pola to kwadrat: 1 cm² ma bok 1 cm. Sąsiednie jednostki dzieli zawsze 100 — w dół ×100, w górę :100.',
      przyklad: '1 cm² = 100 mm²     700 cm² = 7 dm²',
      schemat: { typ: 'drabinka', szczeble: ['mm²', 'cm²', 'dm²', 'm²', 'a', 'ha', 'km²'] },
    },
    {
      typ: 'regula',
      tytul: 'Ar i hektar',
      tekst: 'Ar to kwadrat o boku 10 m, hektar — o boku 100 m. Działki mierzysz w arach, pola i lasy w hektarach.',
      przyklad: '1 a = 100 m²     1 ha = 100 a = 10 000 m²',
    },
    {
      typ: 'regula',
      tytul: 'Pole prostokąta',
      tekst: 'W rzędzie jest a kratek, rzędów jest b, więc P = a · b. Kwadrat: bok razy ten sam bok.',
      przyklad: '6 · 3 = 18 cm²     kwadrat 9 · 9 = 81 cm²',
      schemat: { typ: 'kratki', wiersze: ['######', '######', '######'], boki: ['6 cm', '3 cm'] },
    },
    {
      typ: 'regula',
      tytul: 'Brakujący bok',
      tekst: 'Znasz pole i jeden bok? Drugi bok policzysz dzieleniem: b = P : a.',
      przyklad: 'P = 45 cm², a = 9 cm → b = 45 : 9 = 5 cm',
    },
    {
      typ: 'regula',
      tytul: 'Podział',
      tekst: 'Potnij figurę na prostokąty, policz pole każdego i dodaj. Każde cięcie daje ten sam wynik.',
      przyklad: '2 · 4 + 3 · 2 = 8 + 6 = 14 kratek',
      schemat: { typ: 'kratki', wiersze: LITERA_L, ciecia: [[2, 2, 2, 4]] },
    },
    {
      typ: 'regula',
      tytul: 'Uzupełnianie',
      tekst: 'Domknij figurę do prostokąta, policz jego pole i odejmij to, czego brakuje.',
      przyklad: '5 · 4 − 2 · 2 = 20 − 4 = 16 kratek',
      schemat: { typ: 'kratki', wiersze: ['###xx', '###xx', '#####', '#####'] },
    },
    {
      typ: 'pulapka',
      tytul: 'Pole czy obwód?',
      zle: 'bok 9 cm: P = 36 cm²',
      dobrze: 'P = 9 · 9 = 81 cm²',
      dlaczego: '36 cm to droga dookoła kwadratu, a pole to kratki w jego środku.',
    },
    {
      typ: 'pulapka',
      tytul: 'Krok to 100, nie 10',
      zle: '700 cm² = 70 dm²',
      dobrze: '700 cm² = 7 dm²',
      dlaczego: 'Kwadrat rośnie wzdłuż i w poprzek naraz: 10 · 10 = 100.',
    },
    {
      typ: 'pulapka',
      tytul: 'Pole w kwadratowych',
      zle: '5 m · 4 m = 20 m',
      dobrze: '5 m · 4 m = 20 m²',
      dlaczego: '„20 m” to długość — metr razy metr daje metr kwadratowy.',
    },
  ],
};

export const polaFigurFiszki: ZestawFiszek = {
  przedmiot: 'matematyka',
  klasa: 4,
  slug: 'pola-figur-fiszki',
  rodzaj: 'fiszki',
  modul: MODUL,
  tytul: 'Pola figur — fiszki',
  opis: '24 fiszki do wycięcia z pól figur w klasie 4: liczenie kratek i połówek, pole a obwód, jednostki pola i ich zamiana, ar i hektar, pole prostokąta i kwadratu, brakujący bok oraz metody podziału i uzupełniania. Pytanie z przodu, odpowiedź z wyjaśnieniem z tyłu.',
  zakres: ZAKRES,
  aktualizacja: '2026-10-27',
  karty: [
    {
      awers: { pytanie: 'Co mówi pole figury?' },
      rewers: {
        odpowiedz: 'Ile kratek mieści się w środku',
        wyjasnienie: 'Kratka jednostkowa to wspólna miarka — dlatego pola da się porównywać.',
      },
    },
    {
      awers: { pytanie: 'Ile kratek ma pole tej figury?', schemat: DOMEK },
      rewers: { odpowiedz: '5 kratek', wyjasnienie: '4 całe kratki i 2 połówki, które razem dają 1 całą.' },
    },
    {
      awers: { pytanie: 'Dwie figury o różnych kształtach mają po 10 kratek. Która ma większe pole?' },
      rewers: { odpowiedz: 'Mają równe pola', wyjasnienie: 'Pole nie zależy od kształtu, tylko od liczby kratek.' },
    },
    {
      awers: { pytanie: 'Przesuwasz jeden kawałek figury w inne miejsce. Co dzieje się z polem?' },
      rewers: { odpowiedz: 'Zostaje takie samo', wyjasnienie: 'Kratek jest tyle samo, tylko leżą gdzie indziej.' },
    },
    {
      awers: { pytanie: 'Czym różni się pole od obwodu?' },
      rewers: {
        odpowiedz: 'Obwód — brzeg, pole — środek',
        wyjasnienie: 'Obwód to długość drogi dookoła figury, pole to powierzchnia jej wnętrza.',
      },
    },
    {
      awers: { pytanie: 'Dlaczego figura z przerwą w obrysie nie ma pola?' },
      rewers: {
        odpowiedz: 'Bo nie jest zamknięta',
        wyjasnienie: 'Przez przerwę środek łączy się z tym, co na zewnątrz — nie ma czego liczyć.',
      },
    },
    {
      awers: { pytanie: 'Prostokąty 6 × 6 i 4 × 9 mają pole 36. Czy mają równe obwody?' },
      rewers: {
        odpowiedz: 'Nie: 24 i 26',
        wyjasnienie: 'Pole i obwód to dwie osobne miary — równe pola nie dają równych obwodów.',
      },
    },
    {
      awers: { pytanie: 'Ile mm² ma 1 cm²?' },
      rewers: {
        odpowiedz: '100 mm²',
        wyjasnienie: 'Kwadrat o boku 1 cm mieści 10 rzędów po 10 kwadracików 1 mm.',
      },
    },
    {
      awers: { pytanie: 'Dlaczego sąsiednie jednostki pola dzieli 100, a nie 10?' },
      rewers: {
        odpowiedz: '10 razy wzdłuż i 10 w poprzek',
        wyjasnienie: 'Bok 10 razy dłuższy daje 10 rzędów po 10 kratek, czyli 100.',
      },
    },
    {
      awers: { pytanie: '6 dm² = ? cm²' },
      rewers: { odpowiedz: '600 cm²', wyjasnienie: 'W dół drabinki krok ×100 — dopisujesz dwa zera.' },
    },
    {
      awers: { pytanie: 'Kasia zamieniła 700 cm² na 70 dm². Co jest nie tak?' },
      rewers: { odpowiedz: 'Powinno być 7 dm²', wyjasnienie: 'W górę drabinki idzie się krokiem :100, a nie :10.' },
    },
    {
      awers: { pytanie: 'Ile cm² ma 1 m²?' },
      rewers: {
        odpowiedz: '10 000 cm²',
        wyjasnienie: 'Z m² na cm² są dwa szczeble: ×100 i jeszcze raz ×100.',
        schemat: { typ: 'drabinka', szczeble: ['cm²', 'dm²', 'm²'] },
      },
    },
    {
      awers: { pytanie: 'Ile m² ma 1 ar?' },
      rewers: { odpowiedz: '100 m²', wyjasnienie: 'Ar to kwadrat o boku 10 m: 10 · 10 = 100.' },
    },
    {
      awers: { pytanie: 'Ile m² ma 1 hektar?' },
      rewers: { odpowiedz: '10 000 m²', wyjasnienie: 'Hektar to kwadrat o boku 100 m: 100 · 100 = 10 000.' },
    },
    {
      awers: { pytanie: 'Ile arów ma 1 hektar?' },
      rewers: { odpowiedz: '100 arów', wyjasnienie: '100 arów po 100 m² to 10 000 m² — tyle, ile ma hektar.' },
    },
    {
      awers: { pytanie: 'Dobierz jednostkę: znaczek pocztowy, podłoga pokoju, las.' },
      rewers: {
        odpowiedz: 'cm², m², ha',
        wyjasnienie: 'Dobra jednostka daje wygodną liczbę — od kilku do kilkuset.',
      },
    },
    {
      awers: { pytanie: 'Jak liczy się pole prostokąta o bokach a i b?' },
      rewers: { odpowiedz: 'P = a · b', wyjasnienie: 'W każdym rzędzie jest a kratek, a rzędów jest b.' },
    },
    {
      awers: {
        pytanie: 'Jakie pole ma ten pokój?',
        schemat: { typ: 'figura', ksztalt: 'prostokat', boki: ['5 m', '4 m'] },
      },
      rewers: { odpowiedz: '20 m²', wyjasnienie: '5 · 4 = 20, a metr razy metr daje metr kwadratowy.' },
    },
    {
      awers: { pytanie: 'Kwadrat ma bok 9 cm. Jakie ma pole?' },
      rewers: { odpowiedz: '81 cm²', wyjasnienie: '9 · 9 = 81. Liczba 36 to obwód, nie pole.' },
    },
    {
      awers: { pytanie: 'Prostokąt ma pole 45 cm² i jeden bok 9 cm. Ile ma drugi bok?' },
      rewers: { odpowiedz: '5 cm', wyjasnienie: '45 : 9 = 5. Sprawdzenie: 9 · 5 = 45.' },
    },
    {
      awers: { pytanie: 'Ile kratek ma pole tej figury?', schemat: { typ: 'kratki', wiersze: LITERA_T } },
      rewers: {
        odpowiedz: '12 kratek',
        wyjasnienie: 'Podział: poprzeczka 6 · 1 i nóżka 2 · 3, czyli 6 + 6 = 12.',
        schemat: { typ: 'kratki', wiersze: LITERA_T, ciecia: [[2, 1, 4, 1]] },
      },
    },
    {
      awers: { pytanie: 'Ile kratek ma pole tej figury?', schemat: { typ: 'kratki', wiersze: RAMKA } },
      rewers: {
        odpowiedz: '16 kratek',
        wyjasnienie: 'Uzupełnianie: 5 · 4 − 2 · 2 = 20 − 4 = 16.',
        schemat: { typ: 'kratki', wiersze: RAMKA.map((w) => w.replaceAll('.', 'x')) },
      },
    },
    {
      awers: { pytanie: 'Kiedy wygodniej uzupełniać niż dzielić?' },
      rewers: {
        odpowiedz: 'Gdy brakuje 1 lub 2 kawałków',
        wyjasnienie: 'Wtedy wystarczy jedno mnożenie i jedno albo dwa odejmowania.',
      },
    },
    {
      awers: { pytanie: 'Podział i uzupełnianie dały różne pola. Co to znaczy?' },
      rewers: {
        odpowiedz: 'Gdzieś jest błąd w rachunku',
        wyjasnienie: 'To ta sama figura, więc obie metody muszą dać to samo pole.',
      },
    },
  ],
};
