import type { Schemat, Sciaga, ZestawFiszek } from '../types';

const MODUL = {
  numer: 8,
  tytul: 'Bryły: prostopadłościany i sześciany',
  href: '/matematyka/klasa-4/bryly',
};

const ZAKRES = [
  'ściany, krawędzie i wierzchołki prostopadłościanu',
  'długość, szerokość i wysokość, sześcian, szkielet bryły',
  'graniastosłupy, ostrosłupy, walec, stożek i kula',
  'siatki prostopadłościanu i sześcianu',
  'objętość prostopadłościanu i jednostki objętości: ml, l, cm³, dm³, m³',
  'pole powierzchni prostopadłościanu',
];

/** Pudełko 3 × 2 × 2: rysunek do liczenia krawędzi i kostek. */
const PUDELKO: [number, number, number] = [3, 2, 2];

/**
 * Siatka pudełka 2 × 1 × 1: pas przód–bok–tył–bok, nad i pod przodem wieko i dno.
 * Cięcia (przerywane) oddzielają ściany — 3 pary: 2 × 1, 2 × 1 i 1 × 1.
 */
const SIATKA_PUDELKA: Schemat = {
  typ: 'kratki',
  wiersze: ['##....', '######', '##....'],
  ciecia: [
    [0, 1, 2, 1],
    [0, 2, 2, 2],
    [2, 1, 2, 2],
    [3, 1, 3, 2],
    [5, 1, 5, 2],
  ],
};

export const brylySciaga: Sciaga = {
  przedmiot: 'matematyka',
  klasa: 4,
  slug: 'bryly-sciaga',
  rodzaj: 'sciaga',
  modul: MODUL,
  tytul: 'Bryły — ściąga',
  opis: 'Bryły z klasy 4 na jednej stronie A4: ściany, krawędzie i wierzchołki prostopadłościanu, długość, szerokość i wysokość, graniastosłupy i ostrosłupy z wzorami na liczbę ścian, krawędzi i wierzchołków, siatki, objętość z jednostkami (ml, l, cm³, dm³, m³), pole powierzchni oraz trzy najczęstsze pułapki.',
  zakres: ZAKRES,
  aktualizacja: '2026-10-28',
  zdanie: 'Pudełko opisują trzy liczby — długość, szerokość i wysokość. Z nich policzysz krawędzie, siatkę, objętość i pole powierzchni.',
  bloki: [
    {
      typ: 'regula',
      tytul: 'Ściany, krawędzie, wierzchołki',
      tekst: 'Prostopadłościan ma 6 ścian, 12 krawędzi i 8 wierzchołków. Krawędzie zasłonięte rysujesz linią przerywaną.',
      przyklad: 'widać naraz najwyżej 3 ściany',
      schemat: { typ: 'prostopadloscian', wymiary: [4, 3, 2], podpisy: ['a', 'b', 'c'] },
    },
    {
      typ: 'regula',
      tytul: 'Trzy wymiary',
      tekst: 'Ściany przeciwległe są identyczne, a krawędzie chodzą czwórkami: długość a, szerokość b, wysokość c. Sześcian ma a = b = c.',
      przyklad: '4 krawędzie po 9, po 6 i po 4 cm',
    },
    {
      typ: 'regula',
      tytul: 'Rodziny brył',
      tekst: 'Graniastosłup (np. prostopadłościan) ma 2 identyczne podstawy, ostrosłup — 1 podstawę i szczyt. Walec, stożek i kula mają powierzchnię zaokrągloną.',
      przyklad: 'namiot to graniastosłup trójkątny',
    },
    {
      typ: 'regula',
      tytul: 'Nazwa od podstawy',
      tekst: 'Policz boki podstawy: n. Graniastosłup ma n + 2 ściany, 3n krawędzi, 2n wierzchołków. Ostrosłup: n + 1 ścian, 2n krawędzi, n + 1 wierzchołków.',
      przyklad: 'graniastosłup 6-kątny: 18 krawędzi',
    },
    {
      typ: 'regula',
      tytul: 'Siatka',
      tekst: 'Siatka to bryła rozcięta po krawędziach i rozłożona: 6 prostokątów w 3 parach.',
      przyklad: 'sześcian ma 11 różnych siatek',
      schemat: SIATKA_PUDELKA,
    },
    {
      typ: 'regula',
      tytul: 'Objętość',
      tekst: 'Objętość to liczba kostek w środku. Dno mieści a · b kostek, a warstw jest c, więc V = a · b · c.',
      przyklad: '4 · 3 · 2 = 24 cm³',
      schemat: { typ: 'prostopadloscian', wymiary: [4, 3, 2], kostki: true },
    },
    {
      typ: 'regula',
      tytul: 'Jednostki objętości',
      tekst: 'Sąsiednie jednostki dzieli 1000: 10 kostek wzdłuż, 10 w poprzek i 10 w górę. Mililitr to cm³, a litr to dm³.',
      przyklad: '1 dm³ = 1000 cm³     1 m³ = 1000 l',
      schemat: { typ: 'drabinka', szczeble: ['mm³', 'cm³ = ml', 'dm³ = l', 'm³'] },
    },
    {
      typ: 'regula',
      tytul: 'Pole powierzchni',
      tekst: 'To pole całej siatki: 3 różne prostokąty, każdy 2 razy. P = 2 · (a · b + a · c + b · c).',
      przyklad: '4 × 3 × 2: 2 · (12 + 8 + 6) = 52 cm²',
    },
    {
      typ: 'pulapka',
      tytul: 'Objętość czy pole?',
      zle: '4 × 3 × 2: P = 24 cm²',
      dobrze: 'V = 24 cm³, P = 52 cm²',
      dlaczego: 'Objętość to kostki w środku, pole — papier na wierzchu.',
    },
    {
      typ: 'pulapka',
      tytul: 'Krok to 1000',
      zle: '1 dm³ = 100 cm³',
      dobrze: '1 dm³ = 1000 cm³',
      dlaczego: 'Kostka rośnie naraz wzdłuż, w poprzek i w górę: 10 · 10 · 10 = 1000.',
    },
    {
      typ: 'pulapka',
      tytul: 'Szkielet to 12 krawędzi',
      zle: 'drut na 10 × 4 × 2: 16 cm',
      dobrze: '4 · (10 + 4 + 2) = 64 cm',
      dlaczego: 'Każdy wymiar to 4 krawędzie, a nie jedna.',
    },
  ],
};

export const brylyFiszki: ZestawFiszek = {
  przedmiot: 'matematyka',
  klasa: 4,
  slug: 'bryly-fiszki',
  rodzaj: 'fiszki',
  modul: MODUL,
  tytul: 'Bryły — fiszki',
  opis: '24 fiszki do wycięcia z brył w klasie 4: ściany, krawędzie i wierzchołki, sześcian i szkielet pudełka, graniastosłupy i ostrosłupy, siatki sześcianu, objętość i jednostki objętości oraz pole powierzchni prostopadłościanu. Pytanie z przodu, odpowiedź z wyjaśnieniem z tyłu.',
  zakres: ZAKRES,
  aktualizacja: '2026-10-28',
  karty: [
    {
      awers: { pytanie: 'Ile ścian, krawędzi i wierzchołków ma prostopadłościan?' },
      rewers: {
        odpowiedz: '6 ścian, 12 krawędzi, 8 wierzchołków',
        wyjasnienie: 'Tyle ma każdy prostopadłościan, mały czy duży.',
      },
    },
    {
      awers: {
        pytanie: 'Ile krawędzi na tym rysunku jest zasłoniętych?',
        schemat: { typ: 'prostopadloscian', wymiary: PUDELKO },
      },
      rewers: {
        odpowiedz: '3 krawędzie',
        wyjasnienie: 'Krawędzie, których nie widać, rysujesz linią przerywaną.',
      },
    },
    {
      awers: { pytanie: 'Ile różnych prostokątów ma prostopadłościan, który nie jest sześcianem?' },
      rewers: {
        odpowiedz: '3 rodzaje, każdy 2 razy',
        wyjasnienie: 'Ściany przeciwległe są identyczne: dno i wieko, przód i tył, dwa boki.',
      },
    },
    {
      awers: { pytanie: 'Czym sześcian różni się od innych prostopadłościanów?' },
      rewers: {
        odpowiedz: 'Ma wszystkie krawędzie równe',
        wyjasnienie: 'Dlatego każda jego ściana jest kwadratem, a opisuje go jedna liczba.',
      },
    },
    {
      awers: { pytanie: 'Ile drutu potrzeba na szkielet pudełka 10 cm × 4 cm × 2 cm?' },
      rewers: {
        odpowiedz: '64 cm',
        wyjasnienie: '4 · (10 + 4 + 2) = 4 · 16 = 64, bo każdy wymiar to 4 krawędzie.',
      },
    },
    {
      awers: { pytanie: 'Czym graniastosłup różni się od ostrosłupa?' },
      rewers: {
        odpowiedz: '2 podstawy kontra 1 i szczyt',
        wyjasnienie: 'Ściany boczne ostrosłupa schodzą się w jednym wierzchołku na górze.',
      },
    },
    {
      awers: { pytanie: 'Ile krawędzi ma graniastosłup sześciokątny?' },
      rewers: { odpowiedz: '18 krawędzi', wyjasnienie: 'Graniastosłup ma 3n krawędzi: 3 · 6 = 18.' },
    },
    {
      awers: { pytanie: 'Ile wierzchołków ma ostrosłup pięciokątny?' },
      rewers: { odpowiedz: '6 wierzchołków', wyjasnienie: '5 na podstawie i 1 na szczycie, czyli n + 1.' },
    },
    {
      awers: { pytanie: 'Graniastosłup ma 21 krawędzi. Jaki wielokąt jest jego podstawą?' },
      rewers: {
        odpowiedz: 'Siedmiokąt',
        wyjasnienie: '3n = 21, więc n = 7 — krawędzi jest 3 razy więcej niż boków podstawy.',
      },
    },
    {
      awers: { pytanie: 'Która bryła ma dokładnie jedną płaską ścianę?' },
      rewers: { odpowiedz: 'Stożek', wyjasnienie: 'Ma jedną okrągłą podstawę; walec ma dwie, a kula żadnej.' },
    },
    {
      awers: { pytanie: 'Które bryły się toczą?' },
      rewers: {
        odpowiedz: 'Kula, walec i stożek',
        wyjasnienie: 'Toczy się to, co ma powierzchnię zaokrągloną — krawędź zatrzymuje obrót.',
      },
    },
    {
      awers: { pytanie: 'Co to jest siatka bryły?' },
      rewers: {
        odpowiedz: 'Bryła rozcięta i rozłożona',
        wyjasnienie: 'Tniesz po krawędziach, więc żadna ściana nie znika i żadna nie dochodzi.',
      },
    },
    {
      awers: { pytanie: 'Czy to jest siatka sześcianu?', schemat: { typ: 'kratki', wiersze: ['###', '###'] } },
      rewers: {
        odpowiedz: 'Nie',
        wyjasnienie: 'Po złożeniu dwa kwadraty trafią w to samo miejsce, a jedna ściana zostanie odkryta.',
      },
    },
    {
      awers: { pytanie: 'Czy to jest siatka sześcianu?', schemat: { typ: 'kratki', wiersze: ['.#..', '####', '.#..'] } },
      rewers: {
        odpowiedz: 'Tak',
        wyjasnienie: 'Pas 4 kwadratów zwija się w boki, a 2 kwadraty zamykają górę i dół.',
      },
    },
    {
      awers: { pytanie: 'Ile różnych siatek ma sześcian?' },
      rewers: {
        odpowiedz: '11',
        wyjasnienie: '6 kwadratów da się ułożyć na 35 sposobów, ale tylko 11 składa się w sześcian.',
      },
    },
    {
      awers: { pytanie: 'Ile kostek 1 cm³ mieści ta bryła?', schemat: { typ: 'prostopadloscian', wymiary: PUDELKO, kostki: true } },
      rewers: { odpowiedz: '12 cm³', wyjasnienie: 'Dno mieści 3 · 2 = 6 kostek, a warstwy są 2: 6 · 2 = 12.' },
    },
    {
      awers: { pytanie: 'Pudełko robisz 2 razy wyższe, dno zostaje to samo. Co z objętością?' },
      rewers: {
        odpowiedz: 'Rośnie 2 razy',
        wyjasnienie: 'Warstwa mieści tyle samo kostek, tylko warstw jest 2 razy więcej.',
      },
    },
    {
      awers: { pytanie: 'Szuflada ma 720 cm³, a jej dno 12 cm na 10 cm. Ile ma wysokości?' },
      rewers: { odpowiedz: '6 cm', wyjasnienie: 'c = V : (a · b) = 720 : 120 = 6.' },
    },
    {
      awers: { pytanie: 'Ile cm³ ma 1 litr?' },
      rewers: {
        odpowiedz: '1000 cm³',
        wyjasnienie: '1 l = 1 dm³, a w kostce 1 dm³ mieści się 10 · 10 · 10 kostek 1 cm³.',
      },
    },
    {
      awers: { pytanie: 'Akwarium ma dno 50 cm na 30 cm, a woda sięga 20 cm. Ile to litrów?' },
      rewers: { odpowiedz: '30 litrów', wyjasnienie: '50 · 30 · 20 = 30 000 cm³, a 1000 cm³ to 1 litr.' },
    },
    {
      awers: { pytanie: 'Dobierz jednostkę: lekarstwo, woda w wannie, beton na budowie.' },
      rewers: {
        odpowiedz: 'ml, l, m³',
        wyjasnienie: 'Dobra jednostka daje wygodną liczbę — od kilku do kilkuset.',
      },
    },
    {
      awers: { pytanie: 'Ile papieru pójdzie na owinięcie pudełka — to objętość czy pole powierzchni?' },
      rewers: {
        odpowiedz: 'Pole powierzchni',
        wyjasnienie: 'Papier kładziesz na ścianach; litry i kostki w środku to objętość.',
      },
    },
    {
      awers: { pytanie: 'Jakie pole powierzchni ma sześcian o krawędzi 5 cm?' },
      rewers: { odpowiedz: '150 cm²', wyjasnienie: '6 identycznych kwadratów: 6 · 5 · 5 = 150.' },
    },
    {
      awers: { pytanie: 'Skrzynia 5 dm × 4 dm × 3 dm nie ma wieka. Ile kartonu na nią poszło?' },
      rewers: {
        odpowiedz: '74 dm²',
        wyjasnienie: '2 · (20 + 15 + 12) = 94, a bez wieka: 94 − 20 = 74.',
      },
    },
  ],
};
