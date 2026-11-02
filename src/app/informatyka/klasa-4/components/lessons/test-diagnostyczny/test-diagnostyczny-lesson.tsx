'use client';

import { useCallback, useState } from 'react';
import Image from 'next/image';
import { AppWindow, MousePointer2, Save, ShieldCheck } from 'lucide-react';
import {
  InfoLessonShell,
  LessonBlock,
  useBlockDone,
  type LessonBlockMeta,
} from '../../lesson-shell';
import { LessonImageCard } from '@/components/ui/lesson-image-card';
import { MouseKeyboardDrill, type DrillScore } from './mouse-keyboard-drill';
import { DesktopFinder } from './desktop-finder';
import { SaveDialogDrill } from './save-dialog-drill';
import { SafetyCheck } from './safety-check';
import { DiagnosticResult, type DiagnosticDomain } from './diagnostic-result';
import type { InfoModule } from '../../../data/curriculum';
import type { InfoLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

/**
 * Ilustracje testu. Test jest celowo oszczędny — bez haczyka i wyjaśnień — więc
 * karty tylko orientują, co jest w danej części, i nie uczą. Hostowane na
 * Cloudinary (`informatyka4/`), rozwiązywane przez `imgMap()` po ścieżce-kluczu.
 */
const IMAGES = imgMap({
  intro: '/images/informatyka/lekcje/test-diagnostyczny/cztery-obszary.jpg',
  mysz: '/images/informatyka/lekcje/test-diagnostyczny/mysz-i-klawiatura.jpg',
  programy: '/images/informatyka/lekcje/test-diagnostyczny/pulpit-z-kafelkami.jpg',
  zapis: '/images/informatyka/lekcje/test-diagnostyczny/pendrive-i-dysk.jpg',
  bezpieczenstwo: '/images/informatyka/lekcje/test-diagnostyczny/klodka-na-laptopie.jpg',
});

/**
 * Test diagnostyczny na wejściu w kurs. Kształt podyktowany tym, co ma zmierzyć:
 * cztery sprawdziany + wynik, bez haczyka, wyjaśnień i nauczania — tu nikt
 * jeszcze niczego nie tłumaczy, tylko sprawdza stan wyjściowy.
 *
 * Trzy z czterech domen mierzą **umiejętność, nie wiedzę**, więc są zbudowane
 * jako zadania do wykonania (kliknij dwa razy, przeciągnij, zapisz plik
 * w odpowiednim folderze), a nie jako pytania o to, jak się to robi. Testem
 * wyboru jest tylko bezpieczeństwo w sieci — jedyny obszar, w którym
 * odpowiedź naprawdę jest wiedzą.
 *
 * Wyniki domen zbiera ta lekcja i podaje do `DiagnosticResult`; każdy widżet
 * raportuje `{ score, total }`, bo `total` bywa różne (blok myszy i klawiatury
 * zgłasza 1 zamiast 4, gdy dziecko pomija zadania wymagające myszy).
 */

const BLOCKS: LessonBlockMeta[] = [
  {
    id: 'mysz-klawiatura',
    kind: 'cwiczenie',
    title: 'Mysz i klawiatura',
    time: '7 min',
    icon: MousePointer2,
  },
  {
    id: 'programy',
    kind: 'symulator',
    title: 'Pulpit: znajdź właściwy program',
    time: '5 min',
    icon: AppWindow,
  },
  {
    id: 'zapis',
    kind: 'symulator',
    title: 'Okno „Zapisz jako”',
    time: '5 min',
    icon: Save,
  },
  {
    id: 'bezpieczenstwo',
    kind: 'cwiczenie',
    title: 'Bezpieczeństwo w sieci',
    time: '6 min',
    icon: ShieldCheck,
  },
  {
    id: 'wynik',
    kind: 'refleksja',
    title: 'Twój wynik i co z niego wynika',
    time: '3 min',
  },
];

/** Gdzie w kursie wraca każda z domen — linki prowadzą w kotwice tematów modułu. */
const DOMAINS: DiagnosticDomain[] = [
  {
    id: 'mysz-klawiatura',
    label: 'Mysz i klawiatura',
    icon: MousePointer2,
    href: '/informatyka/klasa-4/komputer-i-pliki#temat-2',
    hrefLabel: 'Moduł 1 · Zestaw komputerowy w praktyce',
  },
  {
    id: 'programy',
    label: 'Programy i pliki',
    icon: AppWindow,
    href: '/informatyka/klasa-4/komputer-i-pliki#temat-4',
    hrefLabel: 'Moduł 1 · Programy i ich zastosowania',
  },
  {
    id: 'zapis',
    label: 'Zapisywanie pliku',
    icon: Save,
    href: '/informatyka/klasa-4/komputer-i-pliki#temat-5',
    hrefLabel: 'Moduł 1 · Pliki i foldery',
  },
  {
    id: 'bezpieczenstwo',
    label: 'Bezpieczeństwo w sieci',
    icon: ShieldCheck,
    href: '/informatyka/klasa-4/internet-i-bezpieczenstwo',
    hrefLabel: 'Moduł 2 · Internet, bezpieczeństwo i dane',
  },
];

interface LessonProps {
  lesson: InfoLesson;
  infoModule: InfoModule;
  nextLesson?: InfoLesson;
}

export function TestDiagnostycznyLesson({ lesson, infoModule, nextLesson }: LessonProps) {
  return (
    <InfoLessonShell
      lesson={lesson}
      infoModule={infoModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
    >
      <LessonBody color={infoModule.color} />
    </InfoLessonShell>
  );
}

function LessonBody({ color }: { color: string }) {
  const mouse = useBlockDone('mysz-klawiatura');
  const programs = useBlockDone('programy');
  const saving = useBlockDone('zapis');
  const safety = useBlockDone('bezpieczenstwo');
  const result = useBlockDone('wynik');

  const [scores, setScores] = useState<Partial<Record<string, DrillScore>>>({});

  /** Wynik domeny i odhaczenie bloku lecą razem — jedno wywołanie z widżetu. */
  const finish = useCallback(
    (id: string, markDone: () => void) => (value: DrillScore) => {
      setScores((prev) => ({ ...prev, [id]: value }));
      markDone();
    },
    []
  );

  return (
    <>
      <div className="grid gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_240px]">
        <div>
          <p className="mb-4 text-base leading-relaxed sm:text-lg">
            Ten test <strong>nie jest na ocenę</strong> i nie da się do niego przygotować. Sprawdza
            cztery rzeczy, które przydadzą się od pierwszego modułu — a jego jedynym zadaniem jest
            pokazać, na co masz zwrócić uwagę, i czego możesz przejść szybciej.
          </p>
          <ul className="grid gap-2.5 sm:grid-cols-2">
            {DOMAINS.map((domain) => {
              const Icon = domain.icon;
              return (
                <li key={domain.id} className="flex items-start gap-2 text-sm">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
                  <span className="leading-relaxed">{domain.label}</span>
                </li>
              );
            })}
          </ul>
          <p className="mt-4 text-sm text-muted-foreground">
            Trzy pierwsze części to zadania do wykonania, nie pytania o to, jak się coś robi. Jeśli
            czegoś nie umiesz — zostaw i idź dalej. Właśnie po to jest ten test.
          </p>
        </div>

        <div className="md:border-l md:pl-5">
          <div className="relative mx-auto aspect-[4/3] w-full max-w-[240px] overflow-hidden">
            <Image
              src={IMAGES.intro}
              alt="Mysz komputerowa, pendrive i srebrna płyta CD ułożone równo na jasnym drewnianym blacie"
              width={240}
              height={180}
              className="absolute inset-0 h-full w-full object-contain"
              priority
            />
          </div>
        </div>
      </div>

      <LessonBlock id="mysz-klawiatura">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.mysz}
          alt="Mysz komputerowa na podkładce, za nią klawiatura z kolorowymi klawiszami bez opisów, ujęcie z niskiego kąta"
        >
          <p>
            Cztery krótkie zadania: podwójne kliknięcie, przeciąganie, prawy przycisk i przepisanie
            zdania z polskimi znakami. Rób swoim tempem — czego nie umiesz, zostaw i idź dalej.
          </p>
        </LessonImageCard>
        <MouseKeyboardDrill
          color={color}
          onFinish={finish('mysz-klawiatura', mouse.markBlockDone)}
        />
      </LessonBlock>

      <LessonBlock id="programy">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.programy}
          alt="Monitor komputera z pustym pulpitem i kilkoma kolorowymi kafelkami bez napisów, obok mysz i klawiatura"
          reverse
        >
          <p>
            Makieta pulpitu. Masz otworzyć właściwy program do podanego zadania — nic się nie
            zepsuje, klikaj śmiało.
          </p>
        </LessonImageCard>
        <DesktopFinder color={color} onFinish={finish('programy', programs.markBlockDone)} />
      </LessonBlock>

      <LessonBlock id="zapis">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.zapis}
          alt="Mały przenośny dysk z krótkim kablem leżący obok zamkniętego, gładkiego laptopa na drewnianym biurku"
        >
          <p>
            Okno „Zapisz jako”. Chodzi tylko o jedno: żeby plik trafił tam, gdzie go potem
            znajdziesz.
          </p>
        </LessonImageCard>
        <SaveDialogDrill color={color} onFinish={finish('zapis', saving.markBlockDone)} />
      </LessonBlock>

      <LessonBlock id="bezpieczenstwo">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.bezpieczenstwo}
          alt="Mała mosiężna kłódka leży zamknięta na wieku zamkniętego laptopa"
          reverse
        >
          <p>
            Pięć sytuacji z sieci. Tu nie ma zadania do wykonania — po prostu wybierasz, co byś
            zrobił lub zrobiła.
          </p>
        </LessonImageCard>
        <SafetyCheck color={color} onFinish={finish('bezpieczenstwo', safety.markBlockDone)} />
      </LessonBlock>

      <LessonBlock id="wynik">
        <DiagnosticResult
          domains={DOMAINS}
          scores={scores}
          color={color}
          onComplete={result.markBlockDone}
        />
      </LessonBlock>
    </>
  );
}
