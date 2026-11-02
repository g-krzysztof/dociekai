import type { ComponentType } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MATH_MODULES, getModuleBySlug, type MathModule } from '../../data/curriculum';
import {
  getLesson,
  getNextLesson,
  getPublishedLessons,
  type MathLesson,
} from '../../data/lessons';
import { JakSieUczycLesson } from '../../components/lessons/jak-sie-uczyc/jak-sie-uczyc-lesson';
import { TestDiagnostycznyLesson } from '../../components/lessons/test-diagnostyczny/test-diagnostyczny-lesson';
import { ZapisDuzychLiczbLesson } from '../../components/lessons/zapis-duzych-liczb/zapis-duzych-liczb-lesson';
import { OsLiczbowaLesson } from '../../components/lessons/os-liczbowa/os-liczbowa-lesson';
import { PorownywanieLiczbLesson } from '../../components/lessons/porownywanie-liczb/porownywanie-liczb-lesson';
import { DodawanieOdejmowanieWPamieciLesson } from '../../components/lessons/dodawanie-odejmowanie-w-pamieci/dodawanie-odejmowanie-w-pamieci-lesson';
import { WlasnosciDzialanLesson } from '../../components/lessons/wlasnosci-dzialan/wlasnosci-dzialan-lesson';
import { TabliczkaMnozeniaLesson } from '../../components/lessons/tabliczka-mnozenia/tabliczka-mnozenia-lesson';
import { MnozenieDzielenie101001000Lesson } from '../../components/lessons/mnozenie-dzielenie-10-100-1000/mnozenie-dzielenie-10-100-1000-lesson';
import { DzielenieZResztaLesson } from '../../components/lessons/dzielenie-z-reszta/dzielenie-z-reszta-lesson';
import { KwadratyISzescianyLesson } from '../../components/lessons/kwadraty-i-szesciany/kwadraty-i-szesciany-lesson';
import { CechyPodzielnosciLesson } from '../../components/lessons/cechy-podzielnosci/cechy-podzielnosci-lesson';
import { KolejnoscDzialanLesson } from '../../components/lessons/kolejnosc-dzialan/kolejnosc-dzialan-lesson';
import { SzacowanieWynikowLesson } from '../../components/lessons/szacowanie-wynikow/szacowanie-wynikow-lesson';
import { ZadaniaTekstoweLesson } from '../../components/lessons/zadania-tekstowe/zadania-tekstowe-lesson';
import { PodsumowanieLiczbyNaturalneLesson } from '../../components/lessons/podsumowanie-liczby-naturalne/podsumowanie-lesson';
import { SystemRzymskiLesson } from '../../components/lessons/system-rzymski/system-rzymski-lesson';
import { JednostkiMonetarneLesson } from '../../components/lessons/jednostki-monetarne/jednostki-monetarne-lesson';
import { JednostkiDlugosciLesson } from '../../components/lessons/jednostki-dlugosci/jednostki-dlugosci-lesson';
import { JednostkiMasyLesson } from '../../components/lessons/jednostki-masy/jednostki-masy-lesson';
import { ObliczeniaZegaroweLesson } from '../../components/lessons/obliczenia-zegarowe/obliczenia-zegarowe-lesson';
import { ObliczeniaKalendarzoweLesson } from '../../components/lessons/obliczenia-kalendarzowe/obliczenia-kalendarzowe-lesson';
import { PodsumowanieObliczeniaPraktyczneLesson } from '../../components/lessons/podsumowanie-obliczenia-praktyczne/podsumowanie-lesson';
import { CyfryRzymskieGuide } from '../../components/guides/cyfry-rzymskie/cyfry-rzymskie-guide';
import { JednostkiMiaryGuide } from '../../components/guides/jednostki-miary/jednostki-miary-guide';
import { ZegarGuide } from '../../components/guides/zegar/zegar-guide';
import { LiczbyIOsGuide } from '../../components/guides/liczby-i-os/liczby-i-os-guide';
import { SlownikDzialanGuide } from '../../components/guides/slownik-dzialan/slownik-dzialan-guide';
import { KolejnoscDzialanGuide } from '../../components/guides/kolejnosc-dzialan/kolejnosc-dzialan-guide';
import { KalendarzGuide } from '../../components/guides/kalendarz/kalendarz-guide';
import { ZapisPisemnyGuide } from '../../components/guides/zapis-pisemny/zapis-pisemny-guide';
import { DodawaniePisemneLesson } from '../../components/lessons/dodawanie-pisemne/dodawanie-pisemne-lesson';
import { OdejmowaniePisemneLesson } from '../../components/lessons/odejmowanie-pisemne/odejmowanie-pisemne-lesson';
import { MnozeniePisemneJednocyfrowaLesson } from '../../components/lessons/mnozenie-pisemne-jednocyfrowa/mnozenie-pisemne-jednocyfrowa-lesson';
import { MnozeniePisemneWielocyfrowaLesson } from '../../components/lessons/mnozenie-pisemne-wielocyfrowa/mnozenie-pisemne-wielocyfrowa-lesson';
import { MnozenieZakonczoneZeramiLesson } from '../../components/lessons/mnozenie-zakonczone-zerami/mnozenie-zakonczone-zerami-lesson';
import { DzielenniePisemneLesson } from '../../components/lessons/dzielenie-pisemne/dzielenie-pisemne-lesson';
import { ZadaniaTekstowePisemneLesson } from '../../components/lessons/zadania-tekstowe-pisemne/zadania-tekstowe-pisemne-lesson';
import { PodsumowanieDzialaniaPisemneLesson } from '../../components/lessons/podsumowanie-dzialania-pisemne/podsumowanie-lesson';
import { JezykGeometriiGuide } from '../../components/guides/jezyk-geometrii/jezyk-geometrii-guide';
import { PunktProstaPolprostaOdcinekLesson } from '../../components/lessons/punkt-prosta-polprosta-odcinek/punkt-prosta-polprosta-odcinek-lesson';
import { ProsteProstopadleRownolegleLesson } from '../../components/lessons/proste-prostopadle-rownolegle/proste-prostopadle-rownolegle-lesson';
import { MierzenieOdcinkowLesson } from '../../components/lessons/mierzenie-odcinkow/mierzenie-odcinkow-lesson';
import { KatyIKatomierzLesson } from '../../components/lessons/katy-i-katomierz/katy-i-katomierz-lesson';
import { RodzajeKatowLesson } from '../../components/lessons/rodzaje-katow/rodzaje-katow-lesson';
import { WielokatyLesson } from '../../components/lessons/wielokaty/wielokaty-lesson';
import { ProstokatyIKwadratyLesson } from '../../components/lessons/prostokaty-i-kwadraty/prostokaty-i-kwadraty-lesson';
import { ObwodyWielokatowLesson } from '../../components/lessons/obwody-wielokatow/obwody-wielokatow-lesson';
import { SlownikKolaGuide } from '../../components/guides/slownik-kola/slownik-kola-guide';
import { KolaIOkregiLesson } from '../../components/lessons/kola-i-okregi/kola-i-okregi-lesson';
import { SymetriaOsiowaLesson } from '../../components/lessons/symetria-osiowa/symetria-osiowa-lesson';
import { SkalaGuide } from '../../components/guides/skala/skala-guide';
import { SkalaLesson } from '../../components/lessons/skala/skala-lesson';
import { RysunekPomocniczyLesson } from '../../components/lessons/rysunek-pomocniczy/rysunek-pomocniczy-lesson';
import { UkladanieZadanLesson } from '../../components/lessons/ukladanie-zadan/ukladanie-zadan-lesson';
import { PodsumowanieGeometriaLesson } from '../../components/lessons/podsumowanie-geometria/podsumowanie-lesson';
import { SlownikUlamkowGuide } from '../../components/guides/slownik-ulamkow/slownik-ulamkow-guide';
import { UlamekJakoCzescCalosciLesson } from '../../components/lessons/ulamek-jako-czesc-calosci/ulamek-jako-czesc-calosci-lesson';
import { UlamkiNaOsiLiczbowejLesson } from '../../components/lessons/ulamki-na-osi-liczbowej/ulamki-na-osi-liczbowej-lesson';
import { PorownywanieUlamkowLesson } from '../../components/lessons/porownywanie-ulamkow/porownywanie-ulamkow-lesson';
import { RozszerzanieSkracanieUlamkowLesson } from '../../components/lessons/rozszerzanie-i-skracanie-ulamkow/rozszerzanie-i-skracanie-ulamkow-lesson';
import { LiczbyMieszaneLesson } from '../../components/lessons/liczby-mieszane/liczby-mieszane-lesson';
import { UlamekJakoWynikDzieleniaLesson } from '../../components/lessons/ulamek-jako-wynik-dzielenia/ulamek-jako-wynik-dzielenia-lesson';
import { DodawanieIOdejmowanieUlamkowLesson } from '../../components/lessons/dodawanie-i-odejmowanie-ulamkow/dodawanie-i-odejmowanie-ulamkow-lesson';
import { MnozenieUlamkaPrzezLiczbeNaturalnaLesson } from '../../components/lessons/mnozenie-ulamka-przez-liczbe-naturalna/mnozenie-ulamka-przez-liczbe-naturalna-lesson';
import { ZadaniaTekstoweZUlamkamiLesson } from '../../components/lessons/zadania-tekstowe-z-ulamkami/zadania-tekstowe-z-ulamkami-lesson';
import { PodsumowanieUlamkiZwykleLesson } from '../../components/lessons/podsumowanie-ulamki-zwykle/podsumowanie-lesson';
import { ZapisDziesietnyGuide } from '../../components/guides/zapis-dziesietny/zapis-dziesietny-guide';
import { ZapisUlamkowDziesietnychLesson } from '../../components/lessons/zapis-ulamkow-dziesietnych/zapis-ulamkow-dziesietnych-lesson';
import { WyrazeniaDwumianowaneLesson } from '../../components/lessons/wyrazenia-dwumianowane/wyrazenia-dwumianowane-lesson';
import { UlamekZwyklyADziesietnyLesson } from '../../components/lessons/ulamek-zwykly-a-dziesietny/ulamek-zwykly-a-dziesietny-lesson';
import { PorownywanieUlamkowDziesietnychLesson } from '../../components/lessons/porownywanie-ulamkow-dziesietnych/porownywanie-ulamkow-dziesietnych-lesson';
import { DodawanieUlamkowDziesietnychLesson } from '../../components/lessons/dodawanie-ulamkow-dziesietnych/dodawanie-ulamkow-dziesietnych-lesson';
import { OdejmowanieUlamkowDziesietnychLesson } from '../../components/lessons/odejmowanie-ulamkow-dziesietnych/odejmowanie-ulamkow-dziesietnych-lesson';
import { MnozenieDzieleniePrzez101001000Lesson } from '../../components/lessons/mnozenie-dzielenie-przez-10-100-1000/mnozenie-dzielenie-przez-10-100-1000-lesson';
import { PodsumowanieUlamkiDziesietneLesson } from '../../components/lessons/podsumowanie-ulamki-dziesietne/podsumowanie-lesson';
import { PoleFiguryLesson } from '../../components/lessons/pole-figury/pole-figury-lesson';
import { JednostkiPolaGuide } from '../../components/guides/jednostki-pola/jednostki-pola-guide';
import { JednostkiPolaLesson } from '../../components/lessons/jednostki-pola/jednostki-pola-lesson';
import { PoleProstokataIKwadratuLesson } from '../../components/lessons/pole-prostokata-i-kwadratu/pole-prostokata-i-kwadratu-lesson';
import { PodzialIUzupelnianieLesson } from '../../components/lessons/podzial-i-uzupelnianie/podzial-i-uzupelnianie-lesson';
import { PodsumowaniePolaFigurLesson } from '../../components/lessons/podsumowanie-pola-figur/podsumowanie-lesson';
import { JezykBrylGuide } from '../../components/guides/jezyk-bryl/jezyk-bryl-guide';
import { JednostkiObjetosciGuide } from '../../components/guides/jednostki-objetosci/jednostki-objetosci-guide';
import { ObjetoscProstopadloscianuLesson } from '../../components/lessons/objetosc-prostopadloscianu/objetosc-prostopadloscianu-lesson';
import { PolePowierzchniProstopadloscianuLesson } from '../../components/lessons/pole-powierzchni-prostopadloscianu/pole-powierzchni-prostopadloscianu-lesson';
import { PodsumowanieBrylLesson } from '../../components/lessons/podsumowanie-bryly/podsumowanie-lesson';
import { OpisProstopadloscianuLesson } from '../../components/lessons/opis-prostopadloscianu/opis-prostopadloscianu-lesson';
import { RozpoznawanieBrylLesson } from '../../components/lessons/rozpoznawanie-bryl/rozpoznawanie-bryl-lesson';
import { SiatkiProstopadloscianowLesson } from '../../components/lessons/siatki-prostopadloscianow/siatki-prostopadloscianow-lesson';
import { PowtorzeniePrzekrojoweLesson } from '../../components/lessons/powtorzenie-przekrojowe/powtorzenie-przekrojowe-lesson';
import { TestKoncowyLesson } from '../../components/lessons/test-koncowy/test-koncowy-lesson';
import { CoDalejLesson } from '../../components/lessons/co-dalej/co-dalej-lesson';

interface LessonComponentProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
  /** Tylko istotne dla `kind: 'podsumowanie'` — patrz `LessonShell`. */
  nextModule?: MathModule;
}

/**
 * Każda lekcja to osobny komponent z własnymi interakcjami — tutaj tylko
 * mapowanie `modul/lekcja` na ten komponent. Dodając lekcję: wpis w
 * `data/lessons.ts` + jedna linijka poniżej.
 */
const LESSON_COMPONENTS: Record<string, ComponentType<LessonComponentProps>> = {
  'start/jak-sie-uczyc': JakSieUczycLesson,
  'start/test-diagnostyczny': TestDiagnostycznyLesson,
  'liczby-naturalne/przewodnik-liczby-i-os': LiczbyIOsGuide,
  'liczby-naturalne/przewodnik-slownik-dzialan': SlownikDzialanGuide,
  'liczby-naturalne/przewodnik-kolejnosc-dzialan': KolejnoscDzialanGuide,
  'liczby-naturalne/zapis-duzych-liczb': ZapisDuzychLiczbLesson,
  'liczby-naturalne/os-liczbowa': OsLiczbowaLesson,
  'liczby-naturalne/porownywanie-liczb': PorownywanieLiczbLesson,
  'liczby-naturalne/dodawanie-odejmowanie-w-pamieci': DodawanieOdejmowanieWPamieciLesson,
  'liczby-naturalne/wlasnosci-dzialan': WlasnosciDzialanLesson,
  'liczby-naturalne/tabliczka-mnozenia': TabliczkaMnozeniaLesson,
  'liczby-naturalne/mnozenie-dzielenie-10-100-1000': MnozenieDzielenie101001000Lesson,
  'liczby-naturalne/dzielenie-z-reszta': DzielenieZResztaLesson,
  'liczby-naturalne/kwadraty-i-szesciany': KwadratyISzescianyLesson,
  'liczby-naturalne/cechy-podzielnosci': CechyPodzielnosciLesson,
  'liczby-naturalne/kolejnosc-dzialan': KolejnoscDzialanLesson,
  'liczby-naturalne/szacowanie-wynikow': SzacowanieWynikowLesson,
  'liczby-naturalne/zadania-tekstowe': ZadaniaTekstoweLesson,
  'liczby-naturalne/podsumowanie': PodsumowanieLiczbyNaturalneLesson,
  'obliczenia-praktyczne/system-rzymski': SystemRzymskiLesson,
  'obliczenia-praktyczne/jednostki-monetarne': JednostkiMonetarneLesson,
  'obliczenia-praktyczne/jednostki-dlugosci': JednostkiDlugosciLesson,
  'obliczenia-praktyczne/jednostki-masy': JednostkiMasyLesson,
  'obliczenia-praktyczne/obliczenia-zegarowe': ObliczeniaZegaroweLesson,
  'obliczenia-praktyczne/obliczenia-kalendarzowe': ObliczeniaKalendarzoweLesson,
  'obliczenia-praktyczne/podsumowanie': PodsumowanieObliczeniaPraktyczneLesson,
  'obliczenia-praktyczne/przewodnik-cyfry-rzymskie': CyfryRzymskieGuide,
  'obliczenia-praktyczne/przewodnik-jednostki-miary': JednostkiMiaryGuide,
  'obliczenia-praktyczne/przewodnik-zegar': ZegarGuide,
  'obliczenia-praktyczne/przewodnik-kalendarz': KalendarzGuide,
  'dzialania-pisemne/przewodnik-zapis-pisemny': ZapisPisemnyGuide,
  'dzialania-pisemne/dodawanie-pisemne': DodawaniePisemneLesson,
  'dzialania-pisemne/odejmowanie-pisemne': OdejmowaniePisemneLesson,
  'dzialania-pisemne/mnozenie-pisemne-jednocyfrowa': MnozeniePisemneJednocyfrowaLesson,
  'dzialania-pisemne/mnozenie-pisemne-wielocyfrowa': MnozeniePisemneWielocyfrowaLesson,
  'dzialania-pisemne/mnozenie-zakonczone-zerami': MnozenieZakonczoneZeramiLesson,
  'dzialania-pisemne/dzielenie-pisemne': DzielenniePisemneLesson,
  'dzialania-pisemne/zadania-tekstowe-pisemne': ZadaniaTekstowePisemneLesson,
  'dzialania-pisemne/podsumowanie': PodsumowanieDzialaniaPisemneLesson,
  'geometria/przewodnik-jezyk-geometrii': JezykGeometriiGuide,
  'geometria/punkt-prosta-polprosta-odcinek': PunktProstaPolprostaOdcinekLesson,
  'geometria/proste-prostopadle-rownolegle': ProsteProstopadleRownolegleLesson,
  'geometria/mierzenie-odcinkow': MierzenieOdcinkowLesson,
  'geometria/katy-i-katomierz': KatyIKatomierzLesson,
  'geometria/rodzaje-katow': RodzajeKatowLesson,
  'geometria/wielokaty': WielokatyLesson,
  'geometria/prostokaty-i-kwadraty': ProstokatyIKwadratyLesson,
  'geometria/obwody-wielokatow': ObwodyWielokatowLesson,
  'geometria/przewodnik-slownik-kola': SlownikKolaGuide,
  'geometria/kola-i-okregi': KolaIOkregiLesson,
  'geometria/symetria-osiowa': SymetriaOsiowaLesson,
  'geometria/przewodnik-skala': SkalaGuide,
  'geometria/skala': SkalaLesson,
  'geometria/rysunek-pomocniczy': RysunekPomocniczyLesson,
  'geometria/ukladanie-zadan': UkladanieZadanLesson,
  'geometria/podsumowanie': PodsumowanieGeometriaLesson,
  'ulamki-zwykle/przewodnik-slownik-ulamkow': SlownikUlamkowGuide,
  'ulamki-zwykle/ulamek-jako-czesc-calosci': UlamekJakoCzescCalosciLesson,
  'ulamki-zwykle/ulamki-na-osi-liczbowej': UlamkiNaOsiLiczbowejLesson,
  'ulamki-zwykle/porownywanie-ulamkow': PorownywanieUlamkowLesson,
  'ulamki-zwykle/rozszerzanie-i-skracanie-ulamkow': RozszerzanieSkracanieUlamkowLesson,
  'ulamki-zwykle/liczby-mieszane': LiczbyMieszaneLesson,
  'ulamki-zwykle/ulamek-jako-wynik-dzielenia': UlamekJakoWynikDzieleniaLesson,
  'ulamki-zwykle/dodawanie-i-odejmowanie-ulamkow': DodawanieIOdejmowanieUlamkowLesson,
  'ulamki-zwykle/mnozenie-ulamka-przez-liczbe-naturalna': MnozenieUlamkaPrzezLiczbeNaturalnaLesson,
  'ulamki-zwykle/zadania-tekstowe-z-ulamkami': ZadaniaTekstoweZUlamkamiLesson,
  'ulamki-zwykle/podsumowanie': PodsumowanieUlamkiZwykleLesson,
  'ulamki-dziesietne/przewodnik-zapis-dziesietny': ZapisDziesietnyGuide,
  'ulamki-dziesietne/zapis-ulamkow-dziesietnych': ZapisUlamkowDziesietnychLesson,
  'ulamki-dziesietne/wyrazenia-dwumianowane': WyrazeniaDwumianowaneLesson,
  'ulamki-dziesietne/ulamek-zwykly-a-dziesietny': UlamekZwyklyADziesietnyLesson,
  'ulamki-dziesietne/porownywanie-ulamkow-dziesietnych': PorownywanieUlamkowDziesietnychLesson,
  'ulamki-dziesietne/dodawanie-ulamkow-dziesietnych': DodawanieUlamkowDziesietnychLesson,
  'ulamki-dziesietne/odejmowanie-ulamkow-dziesietnych': OdejmowanieUlamkowDziesietnychLesson,
  'ulamki-dziesietne/mnozenie-dzielenie-przez-10-100-1000': MnozenieDzieleniePrzez101001000Lesson,
  'ulamki-dziesietne/podsumowanie': PodsumowanieUlamkiDziesietneLesson,
  'pola-figur/pole-figury': PoleFiguryLesson,
  'pola-figur/przewodnik-jednostki-pola': JednostkiPolaGuide,
  'pola-figur/jednostki-pola': JednostkiPolaLesson,
  'pola-figur/pole-prostokata-i-kwadratu': PoleProstokataIKwadratuLesson,
  'pola-figur/podzial-i-uzupelnianie': PodzialIUzupelnianieLesson,
  'pola-figur/podsumowanie': PodsumowaniePolaFigurLesson,
  'bryly/przewodnik-jezyk-bryl': JezykBrylGuide,
  'bryly/opis-prostopadloscianu': OpisProstopadloscianuLesson,
  'bryly/rozpoznawanie-bryl': RozpoznawanieBrylLesson,
  'bryly/siatki-prostopadloscianow': SiatkiProstopadloscianowLesson,
  'bryly/przewodnik-jednostki-objetosci': JednostkiObjetosciGuide,
  'bryly/objetosc-prostopadloscianu': ObjetoscProstopadloscianuLesson,
  'bryly/pole-powierzchni-prostopadloscianu': PolePowierzchniProstopadloscianuLesson,
  'bryly/podsumowanie': PodsumowanieBrylLesson,
  'podsumowanie/powtorzenie-przekrojowe': PowtorzeniePrzekrojoweLesson,
  'podsumowanie/test-koncowy': TestKoncowyLesson,
  'podsumowanie/co-dalej': CoDalejLesson,
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
  const mathModule = getModuleBySlug(modul);

  if (!lesson || !mathModule) return { title: 'Nie znaleziono lekcji | DociekAI' };

  /**
   * `lesson.short` zamiast `lesson.title` — `title` bywa pełną nazwą tematu
   * z podstawy programowej (potrafi przekroczyć 100 znaków), która w <title>
   * ucina się w wynikach wyszukiwania. `title` zostaje jako H1 na stronie.
   * Podsumowania modułów mają wspólny, ogólny `short` ("Podsumowanie modułu")
   * powtórzony w każdym module — tu dokładamy nazwę modułu, żeby <title>
   * nie duplikował się między modułami (np. Moduł 1 i Moduł 2 miały identyczny
   * <title>, dopóki tego nie było).
   */
  const seoTitle =
    lesson.kind === 'podsumowanie' ? `Powtórzenie: ${mathModule.title}` : lesson.short;
  const title = `${seoTitle} — matematyka klasa 4 | DociekAI`;
  const url = `https://dociekai.pl/matematyka/klasa-4/${lesson.moduleSlug}/${lesson.slug}`;

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
  const mathModule = getModuleBySlug(modul);
  const LessonComponent = LESSON_COMPONENTS[`${modul}/${lekcja}`];

  if (!lesson || !mathModule || !LessonComponent || lesson.status !== 'available') notFound();

  /**
   * Kolejna pozycja w kolejności programu — także pierwsza z następnego modułu,
   * żeby po ostatniej lekcji modułu bez `podsumowania` (np. „Start kursu") był
   * dokąd przejść. Podsumowanie prowadzi do strony następnego modułu (`nextModule`
   * niżej), więc jemu `nextLesson` celowo nie dajemy.
   */
  const nextLesson = lesson.kind === 'podsumowanie' ? undefined : getNextLesson(modul, lekcja);

  /** Tylko podsumowanie (zawsze ostatnia lekcja modułu) dostaje `nextModule` —
   *  patrz `LessonShell`'s finish CTA. */
  const moduleIndex = MATH_MODULES.findIndex((item) => item.slug === modul);
  const nextModuleCandidate = MATH_MODULES[moduleIndex + 1];
  const nextModule =
    lesson.kind === 'podsumowanie' && nextModuleCandidate?.status === 'available'
      ? nextModuleCandidate
      : undefined;

  return (
    <LessonComponent
      lesson={lesson}
      mathModule={mathModule}
      nextLesson={nextLesson}
      nextModule={nextModule}
    />
  );
}
