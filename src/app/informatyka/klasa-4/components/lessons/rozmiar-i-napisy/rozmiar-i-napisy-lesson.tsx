'use client';

import Image from 'next/image';
import { Crop, Maximize2, Type } from 'lucide-react';
import {
  BLOCK_KINDS,
  InfoLessonShell,
  LessonBlock,
  useBlockDone,
  type LessonBlockMeta,
} from '../../lesson-shell';
import { PracticeTask } from '../../practice-task';
import { LessonImageCard } from '@/components/ui/lesson-image-card';
import { StretchTest } from './stretch-test';
import { CanvasOrImage } from './canvas-or-image';
import { FitOrCut } from './fit-or-cut';
import { CaptionLab } from './caption-lab';
import type { InfoModule } from '../../../data/curriculum';
import type { InfoLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

/**
 * Trzecia lekcja modułu 3 i szesnasty kształt lekcji w kursie. Realizuje temat
 * „rozmiar obrazu i płótna, piksel jako jednostka, napisy na obrazie — krój,
 * rozmiar, kolor” i niesie **zadanie obowiązkowe Z-6** (scena z przeczytanej
 * książki, 1096 × 756 px).
 *
 * Cała lekcja stoi na **jednym obrazku** — scenie z latarnią morską zapisanej
 * jako 32 × 24 piksele (`scene.ts`). Ten sam obrazek dziecko najpierw rozciąga
 * uchwytem, potem zmienia mu ramę, potem robi z niego trzy zamówienia o różnych
 * kształtach, a na końcu podpisuje na płótnie o wymiarach wprost z Z-6. Nic tu
 * nie jest opowiedziane: każdy blok to inna robota palcami.
 *  - `StretchTest` — **uchwyt zmiany rozmiaru**; powiększanie nie dorysowuje
 *    szczegółów, a zmniejszenie i powrót ich nie odzyskuje;
 *  - `CanvasOrImage` — dwa polecenia z tego samego menu, te same liczby,
 *    dwa różne wyniki; kotwica decyduje, z której strony;
 *  - `FitOrCut` — to samo zamówienie wykonane dwa razy: raz przez skalowanie,
 *    raz przez kadrowanie ramką przeciąganą po obrazku;
 *  - `CaptionLab` — pracownia podpisu, w której **kontrast liczy się z pikseli
 *    leżących pod napisem**, a miniaturka obok pokazuje, co z niego zostaje.
 *
 * Piąty blok to Z-6 w prawdziwym programie — w pełnym brzmieniu z
 * programu, z listą kontrolną rozbitą na osobne pozycje.
 */

const IMAGES = imgMap({
  intro: '/images/informatyka/lekcje/rozmiar-i-napisy/ramka-i-kartki.jpg',
  kamyki: '/images/informatyka/lekcje/rozmiar-i-napisy/mozaika-z-kamykow.jpg',
  passe: '/images/informatyka/lekcje/rozmiar-i-napisy/rama-i-passe-partout.jpg',
  kontrast: '/images/informatyka/lekcje/rozmiar-i-napisy/kamyk-na-lupku.jpg',
  ksiazka: '/images/informatyka/lekcje/rozmiar-i-napisy/otwarta-ksiazka.jpg',
});

const BLOCKS: LessonBlockMeta[] = [
  {
    id: 'ciagnij-za-rog',
    kind: 'haczyk',
    title: 'Ciągnij za róg, aż coś pęknie',
    time: '6 min',
    icon: Maximize2,
  },
  {
    id: 'obraz-czy-plotno',
    kind: 'wyjasnienie',
    title: 'Obraz czy płótno? Te same liczby, dwa różne wyniki',
    time: '7 min',
  },
  {
    id: 'ksztalt-zamowienia',
    kind: 'cwiczenie',
    title: 'Kwadrat, pasek i miniaturka',
    time: '6 min',
    icon: Crop,
  },
  {
    id: 'podpis-na-obrazie',
    kind: 'symulator',
    title: 'Podpis, który da się przeczytać',
    time: '8 min',
    icon: Type,
  },
  {
    id: 'scena-z6',
    kind: 'zadanie',
    title: 'Scena z przeczytanej książki, 1096 × 756 px',
    time: '12 min',
  },
];

interface LessonProps {
  lesson: InfoLesson;
  infoModule: InfoModule;
  nextLesson?: InfoLesson;
}

export function RozmiarINapisyLesson({ lesson, infoModule, nextLesson }: LessonProps) {
  return (
    <InfoLessonShell
      lesson={lesson}
      infoModule={infoModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Rozciągnąłeś/rozciągnęłaś obrazek, aż było widać każdy piksel, zmieniłeś/zmieniłaś mu ramę, oddałeś/oddałaś trzy zamówienia o trzech różnych kształtach i postawiłeś/postawiłaś na nim trzy napisy, które naprawdę da się przeczytać. Zdanie do zapamiętania: rozmiar obrazu ustawia się PRZED rysowaniem — potem można go już tylko zepsuć."
    >
      <LessonBody color={infoModule.color} />
    </InfoLessonShell>
  );
}

/** Treść wydzielona z komponentu strony, bo `useBlockDone` działa dopiero w kontekście powłoki. */
function LessonBody({ color }: { color: string }) {
  const stretch = useBlockDone('ciagnij-za-rog');
  const canvas = useBlockDone('obraz-czy-plotno');
  const fit = useBlockDone('ksztalt-zamowienia');
  const caption = useBlockDone('podpis-na-obrazie');
  const task = useBlockDone('scena-z6');

  return (
    <>
      <LessonIntro color={color} />

      <LessonBlock id="ciagnij-za-rog">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.kamyki}
          alt="Mozaika ułożona z gładkich, pastelowych kamyków wciśniętych w okrągłą plamę piasku, widziana z góry — każdy kamyk jest osobny i policzalny, a w kilku miejscach po kamykach zostały puste wgłębienia"
          lead="Z bliska widać, że to nie obrazek, tylko ułożone kamyki."
        >
          Obraz w komputerze też jest z kamyków. Nazywają się <strong>piksele</strong> i jest ich
          dokładnie tyle, ile ich zapisano — ani jednego więcej. Poniższy obrazek ma 32 na 24
          piksele. Złap go za róg i pociągnij.
        </LessonImageCard>
        <StretchTest color={color} onComplete={stretch.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="obraz-czy-plotno">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.passe}
          alt="Drewniana rama obrazu na jasnej ścianie, w środku kremowe passe-partout, a na jego środku dużo mniejsza, zupełnie pusta biała kartka, wokół której zostaje szeroki pusty margines"
          reverse
        >
          <p>
            W menu każdego edytora grafiki leżą obok siebie dwa polecenia:{' '}
            <strong>Rozmiar obrazu</strong> i <strong>Rozmiar płótna</strong>. Oba proszą o dwie
            liczby i oba kończą się przyciskiem OK. Robią jednak dwie zupełnie różne rzeczy — jedno
            zmienia rysunek, drugie ramę wokół niego. Trzy zamówienia niżej pokażą, które jest które.
          </p>
        </LessonImageCard>
        <CanvasOrImage color={color} onComplete={canvas.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="ksztalt-zamowienia">
        <FitOrCut color={color} onComplete={fit.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="podpis-na-obrazie">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.kontrast}
          alt="Gładki biały kamień leży na ciemnoszarej płycie łupka i wyraźnie się od niej odcina, a obok taki sam biały kamień leży na złożonym białym płótnie i prawie się w nim gubi"
          lead="Ten sam kamyk. Raz widać go z drugiego końca pokoju, raz nie widać wcale."
          reverse
        >
          Z napisem na obrazie jest dokładnie tak samo. W zeszycie tło jest zawsze białe, więc
          wystarczy pisać. Na obrazie <strong>każde miejsce ma inny kolor</strong> — i to ono
          decyduje, czy podpis da się przeczytać.
        </LessonImageCard>
        <CaptionLab color={color} onComplete={caption.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="scena-z6">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.ksiazka}
          alt="Otwarta książka w bordowej oprawie leży na jasnym blacie, jej kremowe stronice są zupełnie puste i nic na nich nie napisano, a na środku między kartkami spoczywa zasuszony żółty kwiatek"
        >
          <p>
            Teraz to samo w prawdziwym programie — i z prawdziwymi liczbami. Wymiary ustawiasz{' '}
            <strong>zanim</strong> zaczniesz rysować, bo po rysowaniu każda zmiana rozmiaru coś
            kosztuje. Wiesz to już z pierwszego bloku.
          </p>
        </LessonImageCard>
        <PracticeTask
          color={color}
          onComplete={task.markBlockDone}
          brief={
            <>
              <strong>Wykonaj obraz przedstawiający scenę z ostatnio przeczytanej książki.</strong>{' '}
              Ustaw wymiary grafiki na <strong>1096 × 756 px</strong>. Na obrazie napisz imię i
              nazwisko autora oraz tytuł książki. Umieść też informację, co przedstawia twój
              rysunek.
            </>
          }
          sections={[
            {
              label: 'Zanim narysujesz choć jedną kreskę',
              items: [
                'Otworzyłem/otworzyłam nowy obraz i ustawiłem/ustawiłam jego wymiary na dokładnie 1096 × 756 pikseli.',
                'Sprawdziłem/sprawdziłam w oknie rozmiaru, że w polach naprawdę stoi 1096 i 756 — a nie liczby, które program zaproponował sam.',
              ],
            },
            {
              label: 'Scena z książki',
              items: [
                'Narysowałem/narysowałam scenę z książki, którą ostatnio czytałem/czytałam.',
                'Zostawiłem/zostawiłam na obrazie miejsce na trzy napisy — takie, którego nie szkoda zasłonić.',
              ],
            },
            {
              label: 'Trzy napisy',
              items: [
                'Napisałem/napisałam na obrazie imię i nazwisko autora książki.',
                'Napisałem/napisałam na obrazie tytuł książki.',
                'Dopisałem/dopisałam informację, co przedstawia mój rysunek.',
                'Każdy napis da się przeczytać: jest dość duży i odcina się kolorem od tego, co pod nim leży.',
                'Zapisałem/zapisałam plik pod nazwą, po której poznam, co w nim jest.',
              ],
            },
          ]}
          hint={
            <>
              Rozmiar obrazu ustawisz w <strong>Paincie</strong> przez <strong>Plik → Właściwości
              obrazu</strong> (albo <strong>Obraz → Zmień rozmiar</strong>, przełączone na{' '}
              <strong>piksele</strong>), w <strong>GIMP-ie</strong> przez{' '}
              <strong>Plik → Nowy</strong>, w <strong>Kricie</strong> tak samo. Napisy dodaje
              narzędzie <strong>Tekst</strong> — zwykle ikona z literą <strong>A</strong>. Zanim
              zaczniesz pisać, wybierz kolor liter: to on decyduje, czy podpis będzie widać.
            </>
          }
        />
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
          Ramę do obrazu kupuje się w konkretnym rozmiarze. Nie „takim ładnym”, tylko{' '}
          <strong>30 na 40 centymetrów</strong> — bo inaczej obraz do niej nie wejdzie. Z obrazkami w
          komputerze jest tak samo: każdy ma swój rozmiar podany w pikselach i to od niego zależy,
          czy zmieści się tam, gdzie ma trafić.
        </p>
        <p className="mt-3">
          W tej lekcji cały czas pracujesz na jednym obrazku z latarnią morską. Najpierw rozciągniesz
          go, aż zobaczysz pojedyncze piksele, potem zmienisz mu ramę, wykonasz trzy zamówienia o
          trzech różnych kształtach, a na koniec postawisz na nim napisy — takie, które naprawdę da
          się przeczytać.
        </p>
      </div>

      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Pusta drewniana rama obrazu leży na jasnym kremowym blacie, a obok niej wysunięte jedna spod drugiej białe, zupełnie puste kartki papieru różnej wielkości"
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
