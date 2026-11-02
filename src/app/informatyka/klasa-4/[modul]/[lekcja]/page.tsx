import type { ComponentType } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { INFO_MODULES, getModuleBySlug, type InfoModule } from '../../data/curriculum';
import {
  getLesson,
  getNextLesson,
  getPublishedLessons,
  type InfoLesson,
} from '../../data/lessons';
import { JakSieUczycLesson } from '../../components/lessons/jak-sie-uczyc/jak-sie-uczyc-lesson';
import { TestDiagnostycznyLesson } from '../../components/lessons/test-diagnostyczny/test-diagnostyczny-lesson';
import { HistoriaKomputeraLesson } from '../../components/lessons/historia-komputera/historia-komputera-lesson';
import { ZestawKomputerowyLesson } from '../../components/lessons/zestaw-komputerowy/zestaw-komputerowy-lesson';
import { NosnikiDanychLesson } from '../../components/lessons/nosniki-danych/nosniki-danych-lesson';
import { ProgramyILicencjeLesson } from '../../components/lessons/programy-i-licencje/programy-i-licencje-lesson';
import { PlikiIChmuraLesson } from '../../components/lessons/pliki-i-chmura/pliki-i-chmura-lesson';
import { JakDzialaSiecLesson } from '../../components/lessons/jak-dziala-siec/jak-dziala-siec-lesson';
import { WyszukiwanieIOcenaInformacjiLesson } from '../../components/lessons/wyszukiwanie-i-ocena-informacji/wyszukiwanie-i-ocena-informacji-lesson';
import { DaneOsoboweIHaslaLesson } from '../../components/lessons/dane-osobowe-i-hasla/dane-osobowe-i-hasla-lesson';
import { ZagrozeniaIPomocLesson } from '../../components/lessons/zagrozenia-i-pomoc/zagrozenia-i-pomoc-lesson';
import { NetykietaIPocztaLesson } from '../../components/lessons/netykieta-i-poczta/netykieta-i-poczta-lesson';
import { PrawoAutorskieLesson } from '../../components/lessons/prawo-autorskie/prawo-autorskie-lesson';
import { EdytorGrafikiLesson } from '../../components/lessons/edytor-grafiki/edytor-grafiki-lesson';
import { KopiowanieIObracanieLesson } from '../../components/lessons/kopiowanie-i-obracanie/kopiowanie-i-obracanie-lesson';
import { RozmiarINapisyLesson } from '../../components/lessons/rozmiar-i-napisy/rozmiar-i-napisy-lesson';
import { FormatyIKartkaLesson } from '../../components/lessons/formaty-i-kartka/formaty-i-kartka-lesson';
import { CzcionkiIZasadyPisaniaLesson } from '../../components/lessons/czcionki-i-zasady-pisania/czcionki-i-zasady-pisania-lesson';
import { AkapityIListyLesson } from '../../components/lessons/akapity-i-listy/akapity-i-listy-lesson';
import { PodzialTekstuLesson } from '../../components/lessons/podzial-tekstu/podzial-tekstu-lesson';
import { IlustracjaITabelaLesson } from '../../components/lessons/ilustracja-i-tabela/ilustracja-i-tabela-lesson';
import { PorzadkowanieISzukanieLesson } from '../../components/lessons/porzadkowanie-i-szukanie/porzadkowanie-i-szukanie-lesson';
import { PlanDlaRobotaLesson } from '../../components/lessons/plan-dla-robota/plan-dla-robota-lesson';
import { ScenaDuszkiBlokiLesson } from '../../components/lessons/scena-duszki-bloki/scena-duszki-bloki-lesson';
import { RuchIStylObrotuLesson } from '../../components/lessons/ruch-i-styl-obrotu/ruch-i-styl-obrotu-lesson';
import { ZdarzeniaIKomunikatyLesson } from '../../components/lessons/zdarzenia-i-komunikaty/zdarzenia-i-komunikaty-lesson';
import { PetleIWarunkiLesson } from '../../components/lessons/petle-i-warunki/petle-i-warunki-lesson';
import { RobotNaEkranieLesson } from '../../components/lessons/robot-na-ekranie/robot-na-ekranie-lesson';
import { TestowanieIBledyLesson } from '../../components/lessons/testowanie-i-bledy/testowanie-i-bledy-lesson';
import { ArkuszPierwszeKrokiLesson } from '../../components/lessons/arkusz-pierwsze-kroki/arkusz-pierwsze-kroki-lesson';
import { PrezentacjaLesson } from '../../components/lessons/prezentacja/prezentacja-lesson';
import { MultimediaLesson } from '../../components/lessons/multimedia/multimedia-lesson';
import { SztucznaInteligencjaLesson } from '../../components/lessons/sztuczna-inteligencja/sztuczna-inteligencja-lesson';
import { TechnologiaISrodowiskoLesson } from '../../components/lessons/technologia-i-srodowisko/technologia-i-srodowisko-lesson';
import { WspolpracaWChmurzeLesson } from '../../components/lessons/wspolpraca-w-chmurze/wspolpraca-w-chmurze-lesson';
import { ProjektRocznyLesson } from '../../components/lessons/projekt-roczny/projekt-roczny-lesson';
import { PowtorzeniePrzekrojoweLesson } from '../../components/lessons/powtorzenie-przekrojowe/powtorzenie-przekrojowe-lesson';
import { TestKoncowyLesson } from '../../components/lessons/test-koncowy/test-koncowy-lesson';

interface LessonComponentProps {
  lesson: InfoLesson;
  infoModule: InfoModule;
  nextLesson?: InfoLesson;
  /** Tylko istotne dla `kind: 'podsumowanie'`. */
  nextModule?: InfoModule;
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
  'start/jak-sie-uczyc': JakSieUczycLesson,
  'start/test-diagnostyczny': TestDiagnostycznyLesson,
  'komputer-i-pliki/historia-komputera': HistoriaKomputeraLesson,
  'komputer-i-pliki/zestaw-komputerowy': ZestawKomputerowyLesson,
  'komputer-i-pliki/nosniki-danych': NosnikiDanychLesson,
  'komputer-i-pliki/programy-i-licencje': ProgramyILicencjeLesson,
  'komputer-i-pliki/pliki-i-chmura': PlikiIChmuraLesson,
  'internet-i-bezpieczenstwo/jak-dziala-siec': JakDzialaSiecLesson,
  'internet-i-bezpieczenstwo/wyszukiwanie-i-ocena-informacji': WyszukiwanieIOcenaInformacjiLesson,
  'internet-i-bezpieczenstwo/dane-osobowe-i-hasla': DaneOsoboweIHaslaLesson,
  'internet-i-bezpieczenstwo/zagrozenia-i-pomoc': ZagrozeniaIPomocLesson,
  'internet-i-bezpieczenstwo/netykieta-i-poczta': NetykietaIPocztaLesson,
  'internet-i-bezpieczenstwo/prawo-autorskie': PrawoAutorskieLesson,
  'grafika/edytor-grafiki': EdytorGrafikiLesson,
  'grafika/kopiowanie-i-obracanie': KopiowanieIObracanieLesson,
  'grafika/rozmiar-i-napisy': RozmiarINapisyLesson,
  'grafika/formaty-i-kartka': FormatyIKartkaLesson,
  'dokumenty-tekstowe/czcionki-i-zasady-pisania': CzcionkiIZasadyPisaniaLesson,
  'dokumenty-tekstowe/akapity-i-listy': AkapityIListyLesson,
  'dokumenty-tekstowe/podzial-tekstu': PodzialTekstuLesson,
  'dokumenty-tekstowe/ilustracja-i-tabela': IlustracjaITabelaLesson,
  'myslenie-komputacyjne/porzadkowanie-i-szukanie': PorzadkowanieISzukanieLesson,
  'myslenie-komputacyjne/plan-dla-robota': PlanDlaRobotaLesson,
  'programowanie-scratch/scena-duszki-bloki': ScenaDuszkiBlokiLesson,
  'programowanie-scratch/ruch-i-styl-obrotu': RuchIStylObrotuLesson,
  'programowanie-scratch/zdarzenia-i-komunikaty': ZdarzeniaIKomunikatyLesson,
  'programowanie-scratch/petle-i-warunki': PetleIWarunkiLesson,
  'programowanie-scratch/robot-na-ekranie': RobotNaEkranieLesson,
  'programowanie-scratch/testowanie-i-bledy': TestowanieIBledyLesson,
  'dane-i-ai/arkusz-pierwsze-kroki': ArkuszPierwszeKrokiLesson,
  'dane-i-ai/prezentacja': PrezentacjaLesson,
  'dane-i-ai/multimedia': MultimediaLesson,
  'dane-i-ai/sztuczna-inteligencja': SztucznaInteligencjaLesson,
  'technologia-i-projekt/technologia-i-srodowisko': TechnologiaISrodowiskoLesson,
  'technologia-i-projekt/wspolpraca-w-chmurze': WspolpracaWChmurzeLesson,
  'technologia-i-projekt/projekt-roczny': ProjektRocznyLesson,
  'podsumowanie/powtorzenie-przekrojowe': PowtorzeniePrzekrojoweLesson,
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
  const infoModule = getModuleBySlug(modul);

  if (!lesson || !infoModule) return { title: 'Nie znaleziono lekcji | DociekAI' };

  /**
   * `lesson.short` zamiast `lesson.title` — `title` bywa pełną nazwą tematu
   * z podstawy programowej, która w <title> ucina się w wynikach wyszukiwania.
   * Podsumowania modułów mają wspólny `short`, więc dokładamy nazwę modułu,
   * żeby <title> nie duplikował się między modułami.
   */
  const seoTitle =
    lesson.kind === 'podsumowanie' ? `Powtórzenie: ${infoModule.title}` : lesson.short;
  const title = `${seoTitle} — informatyka klasa 4 | DociekAI`;
  const url = `https://dociekai.pl/informatyka/klasa-4/${lesson.moduleSlug}/${lesson.slug}`;

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
  const infoModule = getModuleBySlug(modul);
  const LessonComponent = LESSON_COMPONENTS[`${modul}/${lekcja}`];

  if (!lesson || !infoModule || !LessonComponent || lesson.status !== 'available') notFound();

  /**
   * Kolejna lekcja w kolejności programu — także pierwsza z następnego modułu,
   * żeby po ostatniej lekcji modułu bez `podsumowania` (np. „Start kursu") był
   * dokąd przejść. Podsumowanie prowadzi do strony następnego modułu (`nextModule`
   * niżej), więc jemu `nextLesson` celowo nie dajemy.
   */
  const nextLesson = lesson.kind === 'podsumowanie' ? undefined : getNextLesson(modul, lekcja);

  /** Tylko podsumowanie (zawsze ostatnia lekcja modułu) dostaje `nextModule`. */
  const moduleIndex = INFO_MODULES.findIndex((item) => item.slug === modul);
  const nextModuleCandidate = INFO_MODULES[moduleIndex + 1];
  const nextModule =
    lesson.kind === 'podsumowanie' && nextModuleCandidate?.status === 'available'
      ? nextModuleCandidate
      : undefined;

  return (
    <LessonComponent
      lesson={lesson}
      infoModule={infoModule}
      nextLesson={nextLesson}
      nextModule={nextModule}
    />
  );
}
