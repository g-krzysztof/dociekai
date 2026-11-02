'use client';

import Image from 'next/image';
import { KeyRound, ListChecks, Lock, ShieldCheck, UserRoundX } from 'lucide-react';
import {
  BLOCK_KINDS,
  InfoLessonShell,
  LessonBlock,
  useBlockDone,
  type LessonBlockMeta,
} from '../../lesson-shell';
import { PracticeTask } from '../../practice-task';
import { LessonImageCard } from '@/components/ui/lesson-image-card';
import { OnePost } from './one-post';
import { KeepOrShare } from './keep-or-share';
import { PasswordLab } from './password-lab';
import { PrivacyCall } from './privacy-call';
import { MyDataCard } from './my-data-card';
import type { InfoModule } from '../../../data/curriculum';
import type { InfoLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

/**
 * Lekcja o danych osobowych i hasłach — trzecia zbudowana w module 2 i
 * dziesiąty różny kształt lekcji w kursie. Realizuje `[5.5]`: ochrona danych
 * osobowych przez hasła i podstawowe ustawienia prywatności.
 *
 * Kształt: haczyk (co obcy wie z jednego posta) → ćwiczenie (sortowanie danych
 * do trzech koszy) → symulator (pracownia hasła — autorski akcent) → dylemat
 * (cztery sytuacje o udostępnianiu i prywatności) → zadanie praktyczne (zmień
 * jedno hasło i jedno ustawienie, z rodzicem) → refleksja (kartka „zostawiam
 * dla siebie”). Pierwsza lekcja kursu z „labem” — symulatorem, który ocenia
 * konstrukcję dziecka według reguły — i pierwsza z tap-skanem pojedynczego
 * wpisu jako haczykiem. Zadanie praktyczne NIE jest zadaniem obowiązkowym
 * Z-1…Z-10 (te mają w module 2 osobną lekcję), więc jego lista jest krótka
 * i domowa.
 */

const IMAGES = imgMap({
  intro: '/images/informatyka/lekcje/dane-osobowe-i-hasla/skrzynia-z-klodka.jpg',
  hook: '/images/informatyka/lekcje/dane-osobowe-i-hasla/puzzle-z-okruchow.jpg',
  sort: '/images/informatyka/lekcje/dane-osobowe-i-hasla/trzy-szufladki.jpg',
  password: '/images/informatyka/lekcje/dane-osobowe-i-hasla/klodka-i-klucze.jpg',
  privacy: '/images/informatyka/lekcje/dane-osobowe-i-hasla/firana-w-oknie.jpg',
});

const BLOCKS: LessonBlockMeta[] = [
  {
    id: 'jeden-post',
    kind: 'haczyk',
    title: 'Ile o tobie mówi jeden wpis?',
    time: '5 min',
    icon: UserRoundX,
  },
  {
    id: 'sortowanie',
    kind: 'cwiczenie',
    title: 'Co podać, a co zostawić dla siebie',
    time: '6 min',
    icon: Lock,
  },
  {
    id: 'haslo',
    kind: 'symulator',
    title: 'Pracownia hasła — zbuduj i sprawdź',
    time: '8 min',
    icon: KeyRound,
  },
  {
    id: 'prywatnosc',
    kind: 'dylemat',
    title: 'Udostępnianie i ustawienia — co robisz?',
    time: '7 min',
    icon: ShieldCheck,
  },
  {
    id: 'zadanie',
    kind: 'zadanie',
    title: 'Zmień jedno hasło i jedno ustawienie',
    time: '15 min',
    icon: ListChecks,
  },
  {
    id: 'kartka',
    kind: 'refleksja',
    title: 'Twoja kartka „zostawiam dla siebie”',
    time: '4 min',
  },
];

interface LessonProps {
  lesson: InfoLesson;
  infoModule: InfoModule;
  nextLesson?: InfoLesson;
}

export function DaneOsoboweIHaslaLesson({ lesson, infoModule, nextLesson }: LessonProps) {
  return (
    <InfoLessonShell
      lesson={lesson}
      infoModule={infoModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Wiesz już, które dane o sobie trzymać dla siebie, jak zbudować hasło, którego nikt nie zgadnie, i gdzie sprawdzić ustawienia prywatności. W następnej lekcji: co robić, gdy mimo wszystko ktoś w sieci ci zagraża — i gdzie wtedy szukać pomocy."
    >
      <LessonBody color={infoModule.color} />
    </InfoLessonShell>
  );
}

/** Treść wydzielona z komponentu strony, bo `useBlockDone` działa dopiero w kontekście powłoki. */
function LessonBody({ color }: { color: string }) {
  const post = useBlockDone('jeden-post');
  const sort = useBlockDone('sortowanie');
  const password = useBlockDone('haslo');
  const privacy = useBlockDone('prywatnosc');
  const task = useBlockDone('zadanie');
  const card = useBlockDone('kartka');

  return (
    <>
      <LessonIntro color={color} />

      <LessonBlock id="jeden-post">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.hook}
          alt="Rozsypane elementy układanki na drewnianym stole, kilka z nich złożonych w mały fragment obrazka przedstawiającego dom"
          lead="Z kilku okruchów składa się całość."
        >
          Zaraz zobaczysz jeden wesoły wpis. Wygląda niewinnie — a ktoś obcy wyczyta z niego więcej,
          niż byś chciał/chciała. Stuknij fragmenty, które mówią za dużo.
        </LessonImageCard>
        <OnePost color={color} onComplete={post.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="sortowanie">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.sort}
          alt="Mała drewniana szafka katalogowa z trzema szufladkami, jedna wysunięta, w środku złożone puste karteczki"
        >
          <p>
            Nie każda informacja o tobie jest tajemnicą — i nie każdą można podawać wszędzie.{' '}
            <strong>Rozłóż dziewięć rzeczy</strong> do trzech koszy: podać spokojnie, tylko za zgodą
            rodzica, zostawić dla siebie.
          </p>
        </LessonImageCard>
        <KeepOrShare color={color} onComplete={sort.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="haslo">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.password}
          alt="Ciężka mosiężna kłódka na stole, obok trzy klucze bardzo różnej wielkości: maleńki wygięty, zwykły i długi ozdobny"
          lead="Krótkie hasło to mały kluczyk — łatwo dorobić."
          reverse
        >
          W pracowni obok złożysz hasło z klocków i zobaczysz na żywo, jak długo ktoś musiałby je
          zgadywać. Jeden z klocków to pułapka — sprawdź, który.
        </LessonImageCard>
        <PasswordLab color={color} onComplete={password.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="prywatnosc">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.privacy}
          alt="Wnętrze przytulnego pokoju, w oknie do połowy zaciągnięta cienka firanka, przez którą wpada miękkie światło; na parapecie doniczka"
          reverse
        >
          <p>
            Ile widać z zewnątrz, <strong>ustawiasz sam/sama</strong> — jak firanką w oknie. Rozegraj
            cztery sytuacje o udostępnianiu, uprawnieniach aplikacji i haśle.
          </p>
        </LessonImageCard>
        <PrivacyCall color={color} onComplete={privacy.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="zadanie">
        <PracticeTask
          color={color}
          onComplete={task.markBlockDone}
          brief={
            <>
              <strong>Zrób dwie rzeczy naprawdę</strong> — najlepiej razem z rodzicem albo
              opiekunem. To nie ćwiczenie na stronie: chodzi o twoje prawdziwe konta.
            </>
          }
          sections={[
            {
              label: 'Jedno mocne hasło',
              items: [
                'Wybrałem/wybrałam jedno swoje słabe hasło — krótkie, ze słowem ze słownika, z imieniem albo datą urodzenia.',
                'Wymyśliłem/wymyśliłam nowe: co najmniej 14 znaków, z trzech przypadkowych słów, z cyfrą i znakiem, bez moich danych.',
                'Zmieniłem/zmieniłam to hasło w ustawieniach konta.',
                'Zapisałem/zapisałam je tam, gdzie w domu trzymacie hasła (menedżer haseł albo kartka w szufladzie) — NIE w zwykłym pliku na pulpicie.',
              ],
            },
            {
              label: 'Jedno ustawienie prywatności',
              items: [
                'Z rodzicem otworzyłem/otworzyłam ustawienia jednej aplikacji albo gry, której używam.',
                'Sprawdziłem/sprawdziłam, czy mój profil jest ustawiony na „znajomi”, a nie „publiczny” — i poprawiłem/poprawiłam, jeśli trzeba.',
                'Przejrzałem/przejrzałam uprawnienia (lokalizacja, kontakty, mikrofon, aparat) i wyłączyłem/wyłączyłam te, których ta aplikacja nie potrzebuje.',
              ],
            },
          ]}
          hint={
            <>
              <strong>Mocne hasło</strong> to np. <span className="font-mono">rower-chmura-gitara-7!</span> —
              długie, łatwe do zapamiętania, nie do zgadnięcia. <strong>Menedżer haseł</strong>{' '}
              (wbudowany w przeglądarkę, w telefon, albo osobny jak Bitwarden) pamięta hasła za
              ciebie, więc każde może być inne. Jeśli nie wiesz, gdzie są ustawienia prywatności,
              szukaj w aplikacji sekcji „Konto”, „Prywatność” albo „Ustawienia”.
            </>
          }
          doneText="Masz jedno prawdziwe hasło mocniejsze i jedno konto lepiej ustawione. To jest ta część lekcji, która realnie coś zmienia."
        />
      </LessonBlock>

      <LessonBlock id="kartka">
        <MyDataCard color={color} onComplete={card.markBlockDone} />
      </LessonBlock>
    </>
  );
}

/**
 * Wejście w lekcję: pytanie, na które odpowiada, i plan bloków dla ekranów bez
 * bocznej szyny. Bez numeru — nie jest blokiem, więc nie liczy się do postępu.
 */
function LessonIntro({ color }: { color: string }) {
  return (
    <div className="grid gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_260px]">
      <div className="text-base leading-relaxed sm:text-lg">
        <p>
          W sieci zostawiasz po sobie ślad, nawet gdy o tym nie myślisz: imię w profilu, miasto na
          zdjęciu, hasło wpisane w pośpiechu. Pojedynczo nic z tego nie wygląda groźnie — razem{' '}
          <strong>składa się na obraz ciebie</strong>, którego nie chcesz dawać obcym.
        </p>
        <p className="mt-3">
          W tej lekcji zobaczysz, ile mówi jeden wpis, nauczysz się rozróżniać dane do ochrony,
          zbudujesz mocne hasło w pracowni i rozegrasz sytuacje o ustawieniach prywatności. Na koniec
          zmienisz u siebie jedno prawdziwe hasło.
        </p>
      </div>

      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Mała drewniana skrzynia zamknięta na solidną mosiężną kłódkę stoi na biurku, spod wieka wystają rogi kilku pustych złożonych kartek"
            width={260}
            height={195}
            className="absolute inset-0 h-full w-full object-contain"
            priority
          />
        </div>

        {/* Plan tej lekcji — dla ekranów bez bocznej szyny; powyżej `lg` szyna go dubluje. */}
        <div className="lg:hidden">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Plan tej lekcji
          </p>
          <ol className="space-y-2">
            {BLOCKS.map((block, index) => (
              <li key={block.id} className="flex items-start gap-3">
                <span
                  className="w-5 shrink-0 font-mono text-sm font-bold tabular-nums"
                  style={{ color }}
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="min-w-0 text-sm leading-snug">
                  <span className="block font-medium">{BLOCK_KINDS[block.kind].label}</span>
                  <span className="block text-xs text-muted-foreground">{block.time}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
