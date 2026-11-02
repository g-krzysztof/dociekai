import { Coins, Rocket, Store, Zap, type LucideIcon } from 'lucide-react';

export type LevelId = 'zlotowki' | 'grosze' | 'godzina-szczytu' | 'wielkie-zakupy';

export interface LevelConfig {
  id: LevelId;
  index: number;
  title: string;
  subtitle: string;
  description: string;
  color: string;
  icon: LucideIcon;
  /** Cierpliwość klienta (ms) w pierwszej rundzie. */
  patienceStartMs: number;
  /** Dolna granica cierpliwości — tempo nie rośnie w nieskończoność. */
  patienceMinMs: number;
  /** O ile skraca się cierpliwość z każdą kolejną rundą. */
  decayPerRoundMs: number;
  /** Zakres ceny towaru, w groszach. */
  priceMinGr: number;
  priceMaxGr: number;
  /** Czy ceny i reszta mogą zawierać grosze, czy tylko pełne złotówki. */
  useGrosze: boolean;
  /** Nominały dostępne w kasie do wydania reszty, w groszach. */
  tillDenominations: readonly number[];
  /** Nominały, którymi płacą klienci — wybierany jest najmniejszy przekraczający cenę. */
  paymentNominals: readonly number[];
}

export const SHIELDS_START = 3;
export const MILESTONE_STEP = 5;
/** Pauza po rozstrzygnięciu rundy zanim wystartuje kolejny klient. */
export const FEEDBACK_MS = 1300;

const COINS_ZLOTOWKI = [100, 200, 500, 1000, 2000, 5000] as const;
const COINS_PELNE = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000] as const;
const COINS_PELNE_Z_BANKNOTAMI = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000] as const;

export const LEVELS: LevelConfig[] = [
  {
    id: 'zlotowki',
    index: 1,
    title: 'Pełne złotówki',
    subtitle: 'Reszta bez groszy',
    description: 'Ceny w pełnych złotówkach. Policz resztę i dobierz monety oraz banknoty ze straganu.',
    color: '#22c55e',
    icon: Rocket,
    patienceStartMs: 8000,
    patienceMinMs: 5000,
    decayPerRoundMs: 150,
    priceMinGr: 100,
    priceMaxGr: 1900,
    useGrosze: false,
    tillDenominations: COINS_ZLOTOWKI,
    paymentNominals: [500, 1000, 2000, 5000],
  },
  {
    id: 'grosze',
    index: 2,
    title: 'Grosze do reszty',
    subtitle: 'Ceny z groszami',
    description: 'Teraz ceny mają też grosze. Zamień złote na grosze w głowie i wydaj dokładną resztę.',
    color: '#3b82f6',
    icon: Coins,
    patienceStartMs: 9000,
    patienceMinMs: 6000,
    decayPerRoundMs: 140,
    priceMinGr: 105,
    priceMaxGr: 1995,
    useGrosze: true,
    tillDenominations: COINS_PELNE,
    paymentNominals: [500, 1000, 2000, 5000],
  },
  {
    id: 'godzina-szczytu',
    index: 3,
    title: 'Godzina szczytu',
    subtitle: 'Kolejka klientów, mniej czasu',
    description: 'Ta sama trudność co wcześniej, ale klienci są coraz bardziej niecierpliwi.',
    color: '#a855f7',
    icon: Zap,
    patienceStartMs: 6500,
    patienceMinMs: 3800,
    decayPerRoundMs: 220,
    priceMinGr: 105,
    priceMaxGr: 1995,
    useGrosze: true,
    tillDenominations: COINS_PELNE,
    paymentNominals: [500, 1000, 2000, 5000],
  },
  {
    id: 'wielkie-zakupy',
    index: 4,
    title: 'Wielkie zakupy',
    subtitle: 'Wyższe ceny, duże banknoty',
    description: 'Najtrudniejszy poziom. Wyższe ceny, banknoty do 200 zł i pełna kasa nominałów do przejrzenia.',
    color: '#f97316',
    icon: Store,
    patienceStartMs: 9500,
    patienceMinMs: 6000,
    decayPerRoundMs: 180,
    priceMinGr: 2005,
    priceMaxGr: 15995,
    useGrosze: true,
    tillDenominations: COINS_PELNE_Z_BANKNOTAMI,
    paymentNominals: [2000, 5000, 10000, 20000],
  },
];

export function getLevelById(id: LevelId): LevelConfig {
  const level = LEVELS.find((l) => l.id === id);
  if (!level) throw new Error(`Nieznany poziom: ${id}`);
  return level;
}
