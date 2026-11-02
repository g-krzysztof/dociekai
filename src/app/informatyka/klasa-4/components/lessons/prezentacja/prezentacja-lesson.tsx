'use client';

import Image from 'next/image';
import { Eye, Hourglass, Mic, Presentation, Users } from 'lucide-react';
import {
  BLOCK_KINDS,
  InfoLessonShell,
  LessonBlock,
  useBlockDone,
  type LessonBlockMeta,
} from '../../lesson-shell';
import { LessonImageCard } from '@/components/ui/lesson-image-card';
import { FlashSlide } from './flash-slide';
import { SlideDesk } from './slide-desk';
import { DressRehearsal } from './dress-rehearsal';
import { AudienceSeat } from './audience-seat';
import { DeckStudio } from './deck-studio';
import type { InfoModule } from '../../../data/curriculum';
import type { InfoLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

/**
 * Druga lekcja modułu 7 i trzydziesty pierwszy kształt lekcji w kursie.
 * Realizuje „prezentację na wybrany temat i dla wybranego odbiorcy” `[3.4]` —
 * plan, budowę slajdu, czytelność i dopasowanie do odbiorcy. Bez zadania
 * obowiązkowego.
 *
 * **Cała lekcja stoi na jednym zdaniu: widz ma jedną parę oczu i jedną parę
 * uszu.** Slajd nie jest kartką, bo przy kartce nikogo nie ma, a przy slajdzie
 * stoisz ty — więc każda sekunda, którą widz zużywa na czytanie, jest sekundą,
 * w której cię nie słucha. Z tego jednego zdania wypada cała reszta: mało
 * tekstu, duże litery, notatki mówcy, próba generalna i pytanie „dla kogo”.
 *
 * Pięć bloków, pięć różnych gestów — żaden nie jest „kliknij opcję, przeczytaj
 * wyjaśnienie”:
 *
 *  - `FlashSlide` — **pomiar na dziecku**: slajd widoczny 6 sekund, prelegent
 *    mówiący w tym czasie swoje i dwa pytania po zgaszeniu slajdu. Gęsty slajd
 *    zjada uszy, rzadki je oddaje;
 *  - `SlideDesk` — **przeciąganie zdań** ze slajdu do notatek mówcy, w którym
 *    nagrodą jest rozmiar liter rosnący sam (autodopasowanie liczone naprawdę);
 *  - `DressRehearsal` — **rytm nadawany palcem**: dziecko czyta notatki na głos
 *    i samo przechodzi dalej, a na końcu dostaje oś czasu swojego wystąpienia
 *    porównaną z długością tego, co miało do powiedzenia;
 *  - `AudienceSeat` — **stukanie w słowa na cudzym slajdzie** z trzech różnych
 *    miejsc na widowni; ten sam slajd wychodzi za trudny, nudny i nie do
 *    sprawdzenia;
 *  - `DeckStudio` — **pięć własnych slajdów składanych tutaj**, z werdyktem
 *    punkt po punkcie i próbą generalną na własnej pracy w nagrodę. Zadanie
 *    dzieje się w lekcji, nie w cudzym programie i nie przez plik: tak samo jak
 *    Z-1 i Z-2 po przeróbce z 2026-09-16.
 */

const IMAGES = imgMap({
  intro: '/images/informatyka/lekcje/prezentacja/latarnia-i-krag-swiatla.jpg',
  klepsydra: '/images/informatyka/lekcje/prezentacja/klepsydra.jpg',
  dzbanki: '/images/informatyka/lekcje/prezentacja/dwa-dzbanki.jpg',
  lupy: '/images/informatyka/lekcje/prezentacja/trzy-lupy.jpg',
  plansze: '/images/informatyka/lekcje/prezentacja/puste-plansze.jpg',
});

const BLOCKS: LessonBlockMeta[] = [
  {
    id: 'slajd-znika',
    kind: 'haczyk',
    title: 'Sześć sekund i slajd znika',
    time: '6 min',
    icon: Hourglass,
  },
  {
    id: 'co-mowie',
    kind: 'wyjasnienie',
    title: 'Co zostaje na slajdzie, a co mówisz',
    time: '6 min',
    icon: Mic,
  },
  {
    id: 'proba-generalna',
    kind: 'symulator',
    title: 'Próba generalna z zegarem',
    time: '6 min',
    icon: Presentation,
  },
  {
    id: 'widownia',
    kind: 'cwiczenie',
    title: 'Trzy miejsca na widowni',
    time: '5 min',
    icon: Users,
  },
  {
    id: 'twoja-prezentacja',
    kind: 'zadanie',
    title: 'Zadanie: pięć slajdów dla kogoś',
    time: '10 min',
    icon: Eye,
  },
];

interface LessonProps {
  lesson: InfoLesson;
  infoModule: InfoModule;
  nextLesson?: InfoLesson;
}

export function PrezentacjaLesson({ lesson, infoModule, nextLesson }: LessonProps) {
  return (
    <InfoLessonShell
      lesson={lesson}
      infoModule={infoModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Zabierz z tej lekcji trzy zdania. Kiedy widz czyta twój slajd, nie słucha ciebie — więc zdanie zdjęte ze slajdu nie znika, tylko przenosi się do twoich ust. Prezentacji nie liczy się na slajdy, tylko na sekundy, a dowiesz się tego jedyną możliwą drogą: robiąc próbę. I zanim zrobisz pierwszy slajd, odpowiedz sobie, dla kogo on jest — bo ten sam slajd bywa dla jednej osoby za trudny, a dla drugiej nudny."
    >
      <LessonBody color={infoModule.color} />
    </InfoLessonShell>
  );
}

/** Treść wydzielona z komponentu strony, bo `useBlockDone` działa dopiero w kontekście powłoki. */
function LessonBody({ color }: { color: string }) {
  const hook = useBlockDone('slajd-znika');
  const desk = useBlockDone('co-mowie');
  const rehearsal = useBlockDone('proba-generalna');
  const audience = useBlockDone('widownia');
  const task = useBlockDone('twoja-prezentacja');

  return (
    <>
      <LessonIntro color={color} />

      <LessonBlock id="slajd-znika">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.klepsydra}
          alt="Szklana klepsydra w toczonej drewnianej oprawie stoi na jasnym blacie; w górnej bańce został już tylko mały kopczyk piasku, a wąską szyjką sypie się cienka strużka do prawie pełnej dolnej bańki"
          lead="Slajd nie czeka. Wisi tyle, ile mówca przy nim stoi — a potem znika."
        >
          Kartkę można odłożyć i wrócić do niej jutro. Slajd zobaczysz <strong>raz</strong>, przez kilka sekund, i to w
          dodatku wtedy, kiedy ktoś do ciebie mówi. Sprawdźmy, ile da się z takiego slajdu wyjąć.
        </LessonImageCard>
        <FlashSlide color={color} onComplete={hook.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="co-mowie">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.dzbanki}
          alt="Dwa gliniane dzbany na jasnym blacie: lewy, pękaty, leży przechylony na drewnianym klocku i wylewa wąski strumień wody do stojącego obok mniejszego dzbanka, który jest już do połowy pełny; z prawej leży złożona lniana ściereczka w niebieskie paski"
          reverse
        >
          <p>
            Woda nie ubywa — <strong>zmienia naczynie</strong>. Z każdym zdaniem, które zdejmiesz ze slajdu, jest tak
            samo: nie kasujesz go, tylko przenosisz tam, skąd się je <strong>mówi</strong>. Na slajdzie zostaje tyle,
            ile widz zdąży ogarnąć jednym spojrzeniem.
          </p>
        </LessonImageCard>
        <SlideDesk color={color} onComplete={desk.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="proba-generalna">
        <DressRehearsal color={color} onComplete={rehearsal.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="widownia">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.lupy}
          alt="Na pofałdowanym jasnym lnianym płótnie leży jeden gładki szary kamyk, a wokół niego, każda pod innym kątem, trzy lupy w mosiężnych oprawkach z drewnianymi trzonkami — duża, mała i średnia"
          lead="Jeden kamyk, trzy szkła — i za każdym razem coś innego."
        >
          Ten sam slajd nie jest taki sam dla wszystkich. Dla jednej osoby jest za trudny, dla drugiej nudny, a trzecia
          zapyta: <strong>skąd to wiesz?</strong> Usiądź teraz na trzech miejscach na widowni i popatrz ich oczami.
        </LessonImageCard>
        <AudienceSeat color={color} onComplete={audience.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="twoja-prezentacja">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.plansze}
          alt="Pięć jednakowych, zupełnie pustych kremowych plansz opartych jedna za drugą o jasną ścianę, ustawionych lekko skośnie na drewnianej podłodze; widać brzegi wszystkich pięciu"
        >
          <p>
            Pięć pustych plansz. Nic na nich jeszcze nie ma i to jest najlepszy moment na jedno pytanie:{' '}
            <strong>dla kogo</strong>. Odpowiedź zmieni każdą z nich — a to, co powiesz, zapiszesz tam, gdzie widz tego
            nie zobaczy. Cała praca dzieje się tutaj, na stronie.
          </p>
        </LessonImageCard>
        <DeckStudio color={color} onComplete={task.markBlockDone} />
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
          Prezentacja wygląda na młodszą siostrę dokumentu: te same litery, ten sam program do pisania, tylko strony są
          poziome. Różnica jest gdzie indziej. <strong>Przy kartce nie ma nikogo</strong>, więc wszystko musi być na
          niej napisane. Przy slajdzie <strong>stoisz ty</strong> — i to ty jesteś tą częścią, która mówi.
        </p>
        <p className="mt-3">
          W tej lekcji zmierzysz na sobie, ile da się wyjąć ze slajdu w sześć sekund, przeniesiesz zdania ze slajdu do
          notatek mówcy, wygłosisz prawdziwą prezentację z zegarem — a na koniec obejrzysz jeden slajd oczami trzech
          różnych osób z widowni.
        </p>
      </div>

      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Stara mosiężna latarnia naftowa ze szklanym kloszem stoi na drewnianym blacie przy jasnej ścianie; płomień w jej wnętrzu rozświetla ścianę ciepłą plamą światła, która ku brzegom obrazu blednie"
            width={260}
            height={195}
            className="absolute inset-0 h-full w-full object-contain"
            priority
          />
        </div>

        {/* Plan tej lekcji — dla ekranów bez bocznej szyny; powyżej `lg` szyna go dubluje. */}
        <div className="lg:hidden">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Plan tej lekcji</p>
          <ol className="space-y-2">
            {BLOCKS.map((block, index) => (
              <li key={block.id} className="flex items-start gap-3">
                <span className="w-5 shrink-0 font-mono text-sm font-bold tabular-nums" style={{ color }}>
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
