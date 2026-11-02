/**
 * L13, blok 3 — „Spichlerz czy parking?”. Wymyślony spichlerz z 1792 roku
 * w Zawidełkach, wpisany do rejestru zabytków. `[2.4]`: zabytek ma wartość
 * historyczną i podlega ochronie prawnej (F-II.3-14) — ustawa z 23 lipca 2003 r.
 * o ochronie zabytków i opiece nad zabytkami: zabytku z rejestru nie wolno
 * rozebrać ani przebudować bez pozwolenia wojewódzkiego konserwatora zabytków.
 */

export type Choice = 'parking' | 'spichlerz';

export interface Voice {
  who: string;
  text: string;
  /** Opóźnienie po poprzednim głosie, ms. */
  delay: number;
}

export const VOICES: Voice[] = [
  {
    who: 'Pan Marek, właściciel sklepu przy rynku',
    text: 'Klienci krążą po miasteczku i nie mają gdzie stanąć. Parking w centrum to więcej ludzi w sklepach.',
    delay: 900,
  },
  {
    who: 'Pani Irena, emerytka',
    text: 'Pamiętam, jak mój tata zwoził tu zboże. Ten spichlerz to kawałek naszego życia. Jak go rozbierzemy, nic go nie wróci.',
    delay: 2600,
  },
  {
    who: 'Zosia i Kuba z klasy 4b',
    text: 'Nie mamy w miasteczku żadnego miejsca na zajęcia po szkole. W spichlerzu zmieściłaby się biblioteka albo pracownia.',
    delay: 2600,
  },
  {
    who: 'Pani Anna, konserwator zabytków',
    text: 'Spichlerz z 1792 roku jest wpisany do rejestru zabytków. Takiego budynku nie wolno rozebrać ani przebudować bez pozwolenia wojewódzkiego konserwatora zabytków — tak mówi ustawa o ochronie zabytków. Dbać o zabytek musi jego właściciel, czyli tu miasteczko, ale pilnować go powinni wszyscy.',
    delay: 3000,
  },
];

export const AFTER_STAMP: Record<Choice, string> = {
  parking:
    'Uchwała trafia do konserwatora zabytków — i wraca z odmową. Rada miasteczka nie może zdecydować wbrew ustawie: spichlerz zostaje. Ale zobacz, co by się stało, gdyby prawo go nie chroniło.',
  spichlerz:
    'Uchwała przyjęta — i zgodna z prawem, bo spichlerz i tak jest pod ochroną. Ochrona to jednak nie wszystko: ktoś musi zapłacić za remont i wymyślić, czemu budynek ma służyć. Zobacz oba warianty po 20 latach.',
};

export const YEARS = [2026, 2028, 2032, 2040, 2046] as const;

export const CAPTIONS: Record<Choice, string[]> = {
  parking: [
    'Spichlerz stoi pusty.',
    'Rozbiórka. Ponad dwieście lat historii jedzie na wysypisko w dwa dni.',
    'Parking na czterdzieści aut. W soboty pełny.',
    'Na skraju miasteczka otwarto duży sklep z własnym parkingiem — tu stoi coraz mniej aut.',
    'Asfalt pęka. Szkolna wycieczka pyta, gdzie stał stary spichlerz. Zostało tylko zdjęcie.',
  ],
  spichlerz: [
    'Spichlerz stoi pusty.',
    'Rusztowania. Cieśle wymieniają zbutwiałe belki na nowe, z takiego samego drewna.',
    'W spichlerzu działa biblioteka i pracownia. Parking zrobiono trzysta metrów dalej.',
    'Przyjeżdżają goście z innych miast — zostają na obiad, kupują w sklepach przy rynku.',
    'Szkolna wycieczka dotyka belek sprzed ponad dwustu pięćdziesięciu lat — prawdziwego źródła, nie zdjęcia.',
  ],
};

/** Indeks etapu dla roku z suwaka. */
export function stageOf(year: number): number {
  let i = 0;
  YEARS.forEach((y, k) => {
    if (year >= y) i = k;
  });
  return i;
}
