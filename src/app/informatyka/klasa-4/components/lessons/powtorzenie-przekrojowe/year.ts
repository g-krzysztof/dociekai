import {
  Blocks,
  Compass,
  FileText,
  Globe,
  HardDrive,
  Leaf,
  Palette,
  Sparkles,
  Workflow,
  type LucideIcon,
} from 'lucide-react';
import { INFO_MODULES } from '../../../data/curriculum';
import { INFO_LESSONS } from '../../../data/lessons';

/**
 * Rok w dziewięciu kawałkach — wspólne dane widżetów lekcji
 * `powtorzenie-przekrojowe` (Rush roku i Mapa roku).
 *
 * Moduł 0 (`start`) nie leży na pierścieniu: to **środek** — „Ty przy biurku”.
 * Wszystko, czego dziecko uczyło się przez rok, wychodziło od niego i do niego
 * wracało, więc osiem działów stoi wokół, a dziewiąty jest tym, kto na nie patrzy.
 */

export interface YearModule {
  /** Numer modułu z programu (0–8). */
  n: number;
  slug: string;
  /** Krótka nazwa do etykiet pod węzłem i w komunikatach. */
  short: string;
  /** Pełny tytuł modułu z `curriculum.ts`. */
  title: string;
  color: string;
  icon: LucideIcon;
  /** Lekcje modułu (krótkie tytuły) — podpowiedź „gdzie to było”. */
  lessons: string[];
  /** Te same lekcje jako odnośniki — tylko opublikowane. */
  lessonLinks: { title: string; href: string }[];
  href: string;
}

const SHORT: Record<string, string> = {
  start: 'Start',
  'komputer-i-pliki': 'Komputer',
  'internet-i-bezpieczenstwo': 'Internet',
  grafika: 'Grafika',
  'dokumenty-tekstowe': 'Dokumenty',
  'myslenie-komputacyjne': 'Myślenie',
  'programowanie-scratch': 'Scratch',
  'dane-i-ai': 'Dane i AI',
  'technologia-i-projekt': 'Projekt',
};

const ICON: Record<string, LucideIcon> = {
  start: Compass,
  'komputer-i-pliki': HardDrive,
  'internet-i-bezpieczenstwo': Globe,
  grafika: Palette,
  'dokumenty-tekstowe': FileText,
  'myslenie-komputacyjne': Workflow,
  'programowanie-scratch': Blocks,
  'dane-i-ai': Sparkles,
  'technologia-i-projekt': Leaf,
};

export const YEAR_MODULES: YearModule[] = INFO_MODULES.filter((item) => item.number <= 8).map((item) => ({
  n: item.number,
  slug: item.slug,
  short: SHORT[item.slug] ?? item.title,
  title: item.title,
  color: item.color,
  icon: ICON[item.slug] ?? Compass,
  lessons: INFO_LESSONS.filter((lesson) => lesson.moduleSlug === item.slug).map((lesson) => lesson.short),
  lessonLinks: INFO_LESSONS.filter((lesson) => lesson.moduleSlug === item.slug && lesson.status === 'available').map((lesson) => ({
    title: lesson.short,
    href: `/informatyka/klasa-4/${lesson.moduleSlug}/${lesson.slug}`,
  })),
  href: `/informatyka/klasa-4/${item.slug}`,
}));

/** Środek pierścienia — moduł 0. */
export const CENTER_MODULE = YEAR_MODULES[0];
/** Osiem działów wokół — moduły 1–8. */
export const RING_MODULES = YEAR_MODULES.slice(1);

export const moduleByN = (n: number): YearModule => YEAR_MODULES[n] ?? YEAR_MODULES[0];

/** Zaokrąglenie do setnych — geometria z sin/cos musi być taka sama na serwerze i w przeglądarce. */
export const r2 = (value: number) => Math.round(value * 100) / 100;

/* ------------------------------------------------------------------ */
/* Geometria pierścienia                                               */
/* ------------------------------------------------------------------ */

export const RING = { w: 440, h: 384, cx: 220, cy: 192, radius: 128, node: 24, center: 30 } as const;

/** Środek węzła działu `n` (1–8): osiem punktów co 45°, pierwszy na godzinie dwunastej. */
export function nodePos(n: number): { x: number; y: number } {
  const angle = ((n - 1) * 45 - 90) * (Math.PI / 180);
  return {
    x: r2(RING.cx + RING.radius * Math.cos(angle)),
    y: r2(RING.cy + RING.radius * Math.sin(angle)),
  };
}

/** Szprycha od działu do środka — złota linia, którą mapa roku rysuje po odsłonięciu zdania lekcji. */
export function spokePath(n: number): string {
  const p = nodePos(n);
  return `M ${p.x} ${p.y} L ${RING.cx} ${RING.cy}`;
}
