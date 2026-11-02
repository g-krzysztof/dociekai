import type { Material, Przedmiot, WariantPdf } from './types';
import { brylyFiszki, brylySciaga } from './matematyka/bryly';
import { dzialaniaPisemneFiszki, dzialaniaPisemneSciaga } from './matematyka/dzialania-pisemne';
import { geometriaFiszki, geometriaSciaga } from './matematyka/geometria';
import { liczbyNaturalneFiszki, liczbyNaturalneSciaga } from './matematyka/liczby-naturalne';
import { obliczeniaPraktyczneFiszki, obliczeniaPraktyczneSciaga } from './matematyka/obliczenia-praktyczne';
import { polaFigurFiszki, polaFigurSciaga } from './matematyka/pola-figur';
import { ulamkiDziesietneFiszki, ulamkiDziesietneSciaga } from './matematyka/ulamki-dziesietne';
import { ulamkiZwykleFiszki, ulamkiZwykleSciaga } from './matematyka/ulamki-zwykle';

/**
 * Wszystkie opublikowane materiały. Wpis trafia tu dopiero wtedy, gdy ma
 * wygenerowany PDF w private/materialy/ — zero kart „wkrótce”.
 * Kolejność = kolejność na stronach (kurs → moduł → ściąga przed fiszkami).
 */
export const MATERIALY: Material[] = [
  liczbyNaturalneSciaga,
  liczbyNaturalneFiszki,
  obliczeniaPraktyczneSciaga,
  obliczeniaPraktyczneFiszki,
  dzialaniaPisemneSciaga,
  dzialaniaPisemneFiszki,
  geometriaSciaga,
  geometriaFiszki,
  ulamkiZwykleSciaga,
  ulamkiZwykleFiszki,
  ulamkiDziesietneSciaga,
  ulamkiDziesietneFiszki,
  polaFigurSciaga,
  polaFigurFiszki,
  brylySciaga,
  brylyFiszki,
];

export const PRZEDMIOTY: Record<Przedmiot, { nazwa: string; kurs: string }> = {
  matematyka: { nazwa: 'Matematyka', kurs: '/matematyka/klasa-4' },
  informatyka: { nazwa: 'Informatyka', kurs: '/informatyka/klasa-4' },
  historia: { nazwa: 'Historia', kurs: '/historia/klasa-4' },
  'jezyk-polski': { nazwa: 'Język polski', kurs: '/jezyk-polski/klasa-4' },
};

export const PRZEDMIOT_KEYS = Object.keys(PRZEDMIOTY) as Przedmiot[];

export const isPrzedmiot = (value: string): value is Przedmiot =>
  (PRZEDMIOT_KEYS as string[]).includes(value);

/** Przedmioty, które mają już co najmniej jeden materiał. */
export const przedmiotyZMaterialami = (): Przedmiot[] =>
  PRZEDMIOT_KEYS.filter((p) => MATERIALY.some((m) => m.przedmiot === p));

export const materialyPrzedmiotu = (przedmiot: Przedmiot): Material[] =>
  MATERIALY.filter((m) => m.przedmiot === przedmiot);

export const getMaterial = (przedmiot: string, slug: string): Material | undefined =>
  MATERIALY.find((m) => m.przedmiot === przedmiot && m.slug === slug);

export const materialHref = (m: Pick<Material, 'przedmiot' | 'slug'>) =>
  `/materialy/${m.przedmiot}/klasa-4/${m.slug}`;

export const drukHref = (m: Pick<Material, 'przedmiot' | 'slug'>, wariant?: WariantPdf) =>
  `/materialy/druk/${m.przedmiot}/${m.slug}${wariant === 'skladane' ? '?wariant=skladane' : ''}`;

export const wariantyPdf = (m: Material): WariantPdf[] =>
  m.rodzaj === 'fiszki' ? ['dwustronne', 'skladane'] : ['dwustronne'];

/** Nazwa pliku na dysku i przy pobraniu. */
export const pdfFileName = (m: Pick<Material, 'slug'>, wariant: WariantPdf = 'dwustronne') =>
  `${m.slug}${wariant === 'skladane' ? '-skladane' : ''}.pdf`;

/** Klucz materiału w teczce i w pomiarze pobrań. */
export const materialKey = (m: Pick<Material, 'przedmiot' | 'slug'>) => `${m.przedmiot}/${m.slug}`;

/** Ile stron A4 ma PDF — do opisu w panelu i do weryfikacji generatora. */
export const liczbaStron = (m: Material): number =>
  m.rodzaj === 'sciaga' ? 1 : Math.ceil(m.karty.length / 8) * 2;

export const URL_SERWISU = 'https://dociekai.pl';
