import type { ComponentType } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { HIST_MODULES, getModuleBySlug, type HistModule } from '../../data/curriculum';
import {
  getLesson,
  getNextLesson,
  getPublishedLessons,
  type HistLesson,
} from '../../data/lessons';
import { PierwszaLekcjaHistoriiLesson } from '../../components/lessons/pierwsza-lekcja-historii/pierwsza-lekcja-historii-lesson';
import { ZrodlaHistoryczneLesson } from '../../components/lessons/zrodla-historyczne/zrodla-historyczne-lesson';
import { WiarygodnoscZrodlaLesson } from '../../components/lessons/wiarygodnosc-zrodla/wiarygodnosc-zrodla-lesson';
import { PrzyczynySkutkiLesson } from '../../components/lessons/przyczyny-i-skutki/przyczyny-i-skutki-lesson';
import { HistoriaMojejRodzinyLesson } from '../../components/lessons/historia-mojej-rodziny/historia-mojej-rodziny-lesson';
import { OsCzasuIEpokiLesson } from '../../components/lessons/os-czasu-i-epoki/os-czasu-i-epoki-lesson';
import { WiekiITysiacleciaLesson } from '../../components/lessons/wieki-i-tysiaclecia/wieki-i-tysiaclecia-lesson';
import { ObliczanieCzasuLesson } from '../../components/lessons/obliczanie-czasu/obliczanie-czasu-lesson';
import { MapaIPlanLesson } from '../../components/lessons/mapa-i-plan/mapa-i-plan-lesson';
import { SymboleNarodoweLesson } from '../../components/lessons/symbole-narodowe/symbole-narodowe-lesson';
import { SwietaIWspolnotyLesson } from '../../components/lessons/swieta-i-wspolnoty/swieta-i-wspolnoty-lesson';
import { RegionyIMalaOjczyznaLesson } from '../../components/lessons/regiony-i-mala-ojczyzna/regiony-i-mala-ojczyzna-lesson';
import { SladyHistoriiWOkolicyLesson } from '../../components/lessons/slady-historii-w-okolicy/slady-historii-w-okolicy-lesson';
import { LegendyPrawdaIFikcjaLesson } from '../../components/lessons/legendy-prawda-i-fikcja/legendy-prawda-i-fikcja-lesson';
import { PierwsiLudzieLesson } from '../../components/lessons/pierwsi-ludzie/pierwsi-ludzie-lesson';
import { RewolucjaNeolitycznaLesson } from '../../components/lessons/rewolucja-neolityczna/rewolucja-neolityczna-lesson';
import { MezopotamiaLesson } from '../../components/lessons/mezopotamia/mezopotamia-lesson';
import { OdPismaDoAlfabetuLesson } from '../../components/lessons/od-pisma-do-alfabetu/od-pisma-do-alfabetu-lesson';
import { EgiptDarNiluLesson } from '../../components/lessons/egipt-dar-nilu/egipt-dar-nilu-lesson';
import { BogowieMumiePiramidyLesson } from '../../components/lessons/bogowie-mumie-piramidy/bogowie-mumie-piramidy-lesson';
import { OsiagnieciaEgipcjanLesson } from '../../components/lessons/osiagniecia-egipcjan/osiagniecia-egipcjan-lesson';
import { GrecjaGoryIMorzeLesson } from '../../components/lessons/grecja-gory-i-morze/grecja-gory-i-morze-lesson';
import { AtenyIDemokracjaLesson } from '../../components/lessons/ateny-i-demokracja/ateny-i-demokracja-lesson';
import { BogowieIMityLesson } from '../../components/lessons/bogowie-i-mity/bogowie-i-mity-lesson';
import { TeatrIgrzyskaFilozofiaLesson } from '../../components/lessons/teatr-igrzyska-filozofia/teatr-igrzyska-filozofia-lesson';
import { OdWioskiDoImperiumLesson } from '../../components/lessons/od-wioski-do-imperium/od-wioski-do-imperium-lesson';
import { RzymCzasowCezaraLesson } from '../../components/lessons/rzym-czasow-cezara/rzym-czasow-cezara-lesson';
import { DziedzictwoRzymuLesson } from '../../components/lessons/dziedzictwo-rzymu/dziedzictwo-rzymu-lesson';
import { JudaizmINauczanieJezusaLesson } from '../../components/lessons/judaizm-i-nauczanie-jezusa/judaizm-i-nauczanie-jezusa-lesson';
import { OdKatakumbDoReligiiPanujacejLesson } from '../../components/lessons/od-katakumb-do-religii-panujacej/od-katakumb-do-religii-panujacej-lesson';
import { TeczkaPostaciLesson } from '../../components/lessons/teczka-postaci/teczka-postaci-lesson';
import { WykopaliskoRokuLesson } from '../../components/lessons/wykopalisko-roku/wykopalisko-roku-lesson';
import { TestKoncowyLesson } from '../../components/lessons/test-koncowy/test-koncowy-lesson';

interface LessonComponentProps {
  lesson: HistLesson;
  histModule: HistModule;
  nextLesson?: HistLesson;
  /** Tylko istotne dla `kind: 'podsumowanie'`. */
  nextModule?: HistModule;
}

/**
 * Każda lekcja to osobny komponent z własnymi interakcjami — tutaj tylko
 * mapowanie `modul/lekcja` na ten komponent. Dodając lekcję: wpis w
 * `data/lessons.ts`, komponent w `components/lessons/<slug>/` i jedna linijka
 * poniżej.
 *
 * Slug spoza tej mapy (albo lekcja ze `status: 'soon'`) daje 404 —
 * `dynamicParams = false` nie pozwala wyrenderować jej na żądanie.
 */
const LESSON_COMPONENTS: Record<string, ComponentType<LessonComponentProps>> = {
  'start/pierwsza-lekcja-historii': PierwszaLekcjaHistoriiLesson,
  'warsztat-historyka/zrodla-historyczne': ZrodlaHistoryczneLesson,
  'warsztat-historyka/wiarygodnosc-zrodla': WiarygodnoscZrodlaLesson,
  'warsztat-historyka/przyczyny-i-skutki': PrzyczynySkutkiLesson,
  'warsztat-historyka/historia-mojej-rodziny': HistoriaMojejRodzinyLesson,
  'czas-i-miejsce/os-czasu-i-epoki': OsCzasuIEpokiLesson,
  'czas-i-miejsce/wieki-i-tysiaclecia': WiekiITysiacleciaLesson,
  'czas-i-miejsce/obliczanie-czasu': ObliczanieCzasuLesson,
  'czas-i-miejsce/mapa-i-plan': MapaIPlanLesson,
  'mala-i-duza-ojczyzna/symbole-narodowe': SymboleNarodoweLesson,
  'mala-i-duza-ojczyzna/swieta-i-wspolnoty': SwietaIWspolnotyLesson,
  'mala-i-duza-ojczyzna/regiony-i-mala-ojczyzna': RegionyIMalaOjczyznaLesson,
  'mala-i-duza-ojczyzna/slady-historii-w-okolicy': SladyHistoriiWOkolicyLesson,
  'mala-i-duza-ojczyzna/legendy-prawda-i-fikcja': LegendyPrawdaIFikcjaLesson,
  'poczatki-cywilizacji/pierwsi-ludzie': PierwsiLudzieLesson,
  'poczatki-cywilizacji/rewolucja-neolityczna': RewolucjaNeolitycznaLesson,
  'poczatki-cywilizacji/mezopotamia': MezopotamiaLesson,
  'poczatki-cywilizacji/od-pisma-do-alfabetu': OdPismaDoAlfabetuLesson,
  'starozytny-egipt/egipt-dar-nilu': EgiptDarNiluLesson,
  'starozytny-egipt/bogowie-mumie-piramidy': BogowieMumiePiramidyLesson,
  'starozytny-egipt/osiagniecia-egipcjan': OsiagnieciaEgipcjanLesson,
  'starozytna-grecja/grecja-gory-i-morze': GrecjaGoryIMorzeLesson,
  'starozytna-grecja/ateny-i-demokracja': AtenyIDemokracjaLesson,
  'starozytna-grecja/bogowie-i-mity': BogowieIMityLesson,
  'starozytna-grecja/teatr-igrzyska-filozofia': TeatrIgrzyskaFilozofiaLesson,
  'starozytny-rzym/od-wioski-do-imperium': OdWioskiDoImperiumLesson,
  'starozytny-rzym/rzym-czasow-cezara': RzymCzasowCezaraLesson,
  'starozytny-rzym/dziedzictwo-rzymu': DziedzictwoRzymuLesson,
  'narodziny-chrzescijanstwa/judaizm-i-nauczanie-jezusa': JudaizmINauczanieJezusaLesson,
  'narodziny-chrzescijanstwa/od-katakumb-do-religii-panujacej': OdKatakumbDoReligiiPanujacejLesson,
  'podsumowanie/teczka-postaci': TeczkaPostaciLesson,
  'podsumowanie/wykopalisko-roku': WykopaliskoRokuLesson,
  'podsumowanie/test-koncowy': TestKoncowyLesson,
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
  const histModule = getModuleBySlug(modul);

  if (!lesson || !histModule) return { title: 'Nie znaleziono lekcji | DociekAI' };

  /**
   * `lesson.short` zamiast `lesson.title` — `title` bywa pełną nazwą tematu
   * z podstawy programowej, która w <title> ucina się w wynikach wyszukiwania.
   * Podsumowania modułów mają wspólny `short`, więc dokładamy nazwę modułu,
   * żeby <title> nie duplikował się między modułami.
   */
  const seoTitle =
    lesson.kind === 'podsumowanie' ? `Powtórzenie: ${histModule.title}` : lesson.short;
  const title = `${seoTitle} — historia klasa 4 | DociekAI`;
  const url = `https://dociekai.pl/historia/klasa-4/${lesson.moduleSlug}/${lesson.slug}`;

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
  const histModule = getModuleBySlug(modul);
  const LessonComponent = LESSON_COMPONENTS[`${modul}/${lekcja}`];

  if (!lesson || !histModule || !LessonComponent || lesson.status !== 'available') notFound();

  /**
   * Kolejna lekcja w kolejności programu — także pierwsza z następnego modułu,
   * żeby po ostatniej lekcji modułu bez `podsumowania` (np. „Start kursu") był
   * dokąd przejść. Podsumowanie prowadzi do strony następnego modułu (`nextModule`
   * niżej), więc jemu `nextLesson` celowo nie dajemy.
   */
  const nextLesson = lesson.kind === 'podsumowanie' ? undefined : getNextLesson(modul, lekcja);

  /** Tylko podsumowanie (zawsze ostatnia lekcja modułu) dostaje `nextModule`. */
  const moduleIndex = HIST_MODULES.findIndex((item) => item.slug === modul);
  const nextModuleCandidate = HIST_MODULES[moduleIndex + 1];
  const nextModule =
    lesson.kind === 'podsumowanie' && nextModuleCandidate?.status === 'available'
      ? nextModuleCandidate
      : undefined;

  return (
    <LessonComponent
      lesson={lesson}
      histModule={histModule}
      nextLesson={nextLesson}
      nextModule={nextModule}
    />
  );
}
