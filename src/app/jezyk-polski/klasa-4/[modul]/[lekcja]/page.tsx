import type { ComponentType } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { POL_MODULES, getModuleBySlug, type PolModule } from '../../data/curriculum';
import {
  getLesson,
  getNextLesson,
  getPublishedLessons,
  type PolLesson,
} from '../../data/lessons';
import { JezykDzialaLesson } from '../../components/lessons/jezyk-dziala/jezyk-dziala-lesson';
import { JaCzytelnikLesson } from '../../components/lessons/ja-czytelnik/ja-czytelnik-lesson';
import { DoKogoMowieLesson } from '../../components/lessons/do-kogo-mowie/do-kogo-mowie-lesson';
import { TwarzITonLesson } from '../../components/lessons/twarz-i-ton/twarz-i-ton-lesson';
import { SluchamUwaznieLesson } from '../../components/lessons/slucham-uwaznie/slucham-uwaznie-lesson';
import { MojeZdanieLesson } from '../../components/lessons/moje-zdanie/moje-zdanie-lesson';
import { EmocjeIPotrzebyLesson } from '../../components/lessons/emocje-i-potrzeby/emocje-i-potrzeby-lesson';
import { MojeWspolnotyLesson } from '../../components/lessons/moje-wspolnoty/moje-wspolnoty-lesson';
import { MazurekIRotaLesson } from '../../components/lessons/mazurek-i-rota/mazurek-i-rota-lesson';
import { SlownikLesson } from '../../components/lessons/slownik/slownik-lesson';
import { SlowaMajaKolorLesson } from '../../components/lessons/slowa-maja-kolor/slowa-maja-kolor-lesson';
import { FrazeologizmyLesson } from '../../components/lessons/frazeologizmy/frazeologizmy-lesson';
import { OdmienneINieodmienneLesson } from '../../components/lessons/odmienne-i-nieodmienne/odmienne-i-nieodmienne-lesson';
import { RzeczownikLesson } from '../../components/lessons/rzeczownik/rzeczownik-lesson';
import { CzasownikLesson } from '../../components/lessons/czasownik/czasownik-lesson';
import { PrzymiotnikIPrzyslowekLesson } from '../../components/lessons/przymiotnik-i-przyslowek/przymiotnik-i-przyslowek-lesson';
import { MaleSlowaLesson } from '../../components/lessons/male-slowa/male-slowa-lesson';
import { SwiatPrzedstawionyLesson } from '../../components/lessons/swiat-przedstawiony/swiat-przedstawiony-lesson';

interface LessonComponentProps {
  lesson: PolLesson;
  polModule: PolModule;
  nextLesson?: PolLesson;
  /** Tylko istotne dla `kind: 'podsumowanie'`. */
  nextModule?: PolModule;
}

/**
 * Każda lekcja to osobny komponent z własnymi interakcjami — tutaj tylko
 * mapowanie `modul/lekcja` na ten komponent. Dodając lekcję: wpis w
 * `data/lessons.ts`, komponent w `components/lessons/<slug>/` i jedna linijka
 * poniżej. Kalka kursu historii.
 *
 * Slug spoza tej mapy (albo lekcja ze `status: 'soon'`) daje 404 —
 * `dynamicParams = false` nie pozwala wyrenderować jej na żądanie.
 */
const LESSON_COMPONENTS: Record<string, ComponentType<LessonComponentProps>> = {
  'start/jezyk-dziala': JezykDzialaLesson,
  'start/ja-czytelnik': JaCzytelnikLesson,
  'komunikacja/do-kogo-mowie': DoKogoMowieLesson,
  'komunikacja/twarz-i-ton': TwarzITonLesson,
  'komunikacja/slucham-uwaznie': SluchamUwaznieLesson,
  'komunikacja/moje-zdanie': MojeZdanieLesson,
  'ja-i-my/emocje-i-potrzeby': EmocjeIPotrzebyLesson,
  'ja-i-my/moje-wspolnoty': MojeWspolnotyLesson,
  'ja-i-my/mazurek-i-rota': MazurekIRotaLesson,
  'slowa/slownik': SlownikLesson,
  'slowa/slowa-maja-kolor': SlowaMajaKolorLesson,
  'slowa/frazeologizmy': FrazeologizmyLesson,
  'czesci-mowy/odmienne-i-nieodmienne': OdmienneINieodmienneLesson,
  'czesci-mowy/rzeczownik': RzeczownikLesson,
  'czesci-mowy/czasownik': CzasownikLesson,
  'czesci-mowy/przymiotnik-i-przyslowek': PrzymiotnikIPrzyslowekLesson,
  'czesci-mowy/male-slowa': MaleSlowaLesson,
  'opowiesci/swiat-przedstawiony': SwiatPrzedstawionyLesson,
};

interface LessonPageProps {
  params: Promise<{ modul: string; lekcja: string }>;
}

export const dynamic = 'force-static';
/** Tylko lekcje z rejestru — reszta ścieżek to 404, bez renderowania na żądanie. */
export const dynamicParams = false;

export function generateStaticParams() {
  return getPublishedLessons().map((lesson) => ({
    modul: lesson.moduleSlug,
    lekcja: lesson.slug,
  }));
}

export async function generateMetadata({ params }: LessonPageProps): Promise<Metadata> {
  const { modul, lekcja } = await params;
  const lesson = getLesson(modul, lekcja);
  const polModule = getModuleBySlug(modul);

  if (!lesson || !polModule) return { title: 'Nie znaleziono lekcji | DociekAI' };

  /**
   * `lesson.short` zamiast `lesson.title` — `title` bywa pełną nazwą tematu
   * z podstawy programowej, która w <title> ucina się w wynikach wyszukiwania.
   * Podsumowania modułów mają wspólny `short`, więc dokładamy nazwę modułu,
   * żeby <title> nie duplikował się między modułami.
   */
  const seoTitle =
    lesson.kind === 'podsumowanie' ? `Powtórzenie: ${polModule.title}` : lesson.short;
  const title = `${seoTitle} — język polski klasa 4 | DociekAI`;
  const url = `https://dociekai.pl/jezyk-polski/klasa-4/${lesson.moduleSlug}/${lesson.slug}`;

  return {
    title,
    description: lesson.description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description: lesson.description,
      url,
      siteName: 'Dociekai.pl',
      locale: 'pl_PL',
      type: 'article',
    },
  };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { modul, lekcja } = await params;
  const lesson = getLesson(modul, lekcja);
  const polModule = getModuleBySlug(modul);
  const LessonComponent = LESSON_COMPONENTS[`${modul}/${lekcja}`];

  if (!lesson || !polModule || !LessonComponent || lesson.status !== 'available') notFound();

  /**
   * Kolejna lekcja w kolejności programu — także pierwsza z następnego modułu,
   * żeby po ostatniej lekcji modułu był dokąd przejść. Podsumowanie prowadzi
   * do strony następnego modułu (`nextModule` niżej), więc jemu `nextLesson`
   * celowo nie dajemy.
   */
  const nextLesson = lesson.kind === 'podsumowanie' ? undefined : getNextLesson(modul, lekcja);

  /** Tylko podsumowanie (zawsze ostatnia lekcja modułu) dostaje `nextModule`. */
  const moduleIndex = POL_MODULES.findIndex((item) => item.slug === modul);
  const nextModuleCandidate = POL_MODULES[moduleIndex + 1];
  const nextModule =
    lesson.kind === 'podsumowanie' && nextModuleCandidate?.status === 'available'
      ? nextModuleCandidate
      : undefined;

  return (
    <LessonComponent
      lesson={lesson}
      polModule={polModule}
      nextLesson={nextLesson}
      nextModule={nextModule}
    />
  );
}
