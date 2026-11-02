import { Coins, Rocket, Shapes, Fuel, type LucideIcon } from 'lucide-react';

export type GameStatus = 'available' | 'soon';

export interface GameConfig {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  tags: string[];
  color: string;
  icon: LucideIcon;
  image: string;
  imageAlt: string;
  ctaLabel: string;
  status: GameStatus;
}

export const GAMES: GameConfig[] = [
  {
    slug: 'kupiec-kosmiczny',
    title: 'Kupiec Kosmiczny',
    tagline: 'Wydaj dokładną resztę, zanim klient odleci!',
    description:
      'Prowadź stragan na stacji kosmicznej. Przyjmuj zapłatę od klientów i wydawaj dokładną resztę z monet i banknotów, zanim skończy im się cierpliwość. Złotówki, grosze i coraz większe zakupy.',
    tags: ['Matematyka', 'Pieniądze i reszta', 'Tryb na czas'],
    color: '#f59e0b',
    icon: Coins,
    image: '/images/games/kupiec-kosmiczny.jpg',
    imageAlt: 'Kupiec Kosmiczny — kosmita-kupiec przy straganie pełnym monet i banknotów na stacji kosmicznej',
    ctaLabel: 'Zagraj w Kupca Kosmicznego',
    status: 'available',
  },
  {
    slug: 'rakieta-liczb',
    title: 'Rakieta Liczb',
    tagline: 'Pilotuj rakietę przez kosmiczny korytarz!',
    description:
      'Wybieraj pas z poprawną odpowiedzią, zanim portal dotrze do rakiety. 4 poziomy trudności — od dodawania do kolejności działań — z rosnącym tempem i lokalnym rekordem wyniku.',
    tags: ['Matematyka', '4 poziomy trudności', 'Tryb na czas'],
    color: '#3b82f6',
    icon: Rocket,
    image: '/images/games/rakieta-liczb.jpg',
    imageAlt: 'Rakieta Liczb — rakieta lecąca przez kosmiczny korytarz pełen świecących portali z liczbami',
    ctaLabel: 'Zagraj w Rakietę Liczb',
    status: 'available',
  },
  {
    slug: 'straznicy-konstelacji',
    title: 'Strażnicy Konstelacji',
    tagline: 'Posortuj kryształy do właściwego doku, zanim wylądują!',
    description:
      'Prowadź stację sortującą na skraju konstelacji. Rozpoznawaj kształty, licz boki, oceniaj kąty i sprawdzaj symetrię kosmicznych kryształów, zanim dotrą do lądowiska. 4 poziomy trudności — od nazw figur po pełny miks geometrii.',
    tags: ['Matematyka', 'Geometria', 'Tryb na czas'],
    color: '#a855f7',
    icon: Shapes,
    image: '/images/games/straznicy-konstelacji.jpg',
    imageAlt: 'Strażnicy Konstelacji — kosmita-strażnik sortujący świecące kryształy geometryczne na stacji kosmicznej',
    ctaLabel: 'Zagraj w Strażników Konstelacji',
    status: 'available',
  },
  {
    slug: 'ulamkowa-stacja',
    title: 'Ułamkowa Stacja Paliw',
    tagline: 'Dolej dokładną dawkę paliwa — policz ułamek zbiornika!',
    description:
      'Obsługuj kosmiczną stację paliw. Statki żądają 3/4, 5/8, 2/3 pojemności zbiornika — policz ile to litrów i dolej, zanim odlecią. 4 poziomy: od części całości po dodawanie ułamków i porównywanie z ułamkami dziesiętnymi.',
    tags: ['Matematyka', 'Ułamki', 'Tryb na czas'],
    color: '#ec4899',
    icon: Fuel,
    image: '/images/games/ulamkowa-stacja.jpg',
    imageAlt: 'Ułamkowa Stacja Paliw — kosmiczna stacja dolewania paliwa z wizualizacją ułamków na zbiornikach',
    ctaLabel: 'Zagraj w Ułamkową Stację',
    status: 'available',
  },
];
