'use client';

import Image from 'next/image';
import { BookOpen, IdCard, MailOpen } from 'lucide-react';
import {
  LessonBlock,
  POL_BLOCK_KINDS,
  PolLessonShell,
  useBlockDone,
  type PolBlockMeta,
} from '../../lesson-shell';
import { LessonImageCard } from '@/components/ui/lesson-image-card';
import { imgMap } from '@/lib/media';
import { KartkaPodDrzwi } from './kartka-pod-drzwi';
import { CoZrobilySlowa } from './co-zrobily-slowa';
import { WizytowkaNaKlatce } from './wizytowka-na-klatce';
import { useZapisBloku } from '../use-zapis-bloku';
import type { Wyslana } from './kartka-pod-drzwi';
import type { Wizytowka } from './wizytowka';
import type { PolModule } from '../../../data/curriculum';
import type { PolLesson } from '../../../data/lessons';

/**
 * L1 — język działa. `[1.1]` `[1.8]` `[1.9]`, filary 2 i 3.
 *
 * **Zdanie lekcji: słowa nie tylko coś znaczą — one coś robią: zapraszają,
 * każą, przepraszają, obiecują, ranią.**
 *
 * Trzy bloki, trzy gesty nowe dla kursu:
 *
 *  - `KartkaPodDrzwi` — **kartka składana ze słów i wsuwana pod drzwi**: pięć
 *    spraw (ostrzec, poprosić, przeprosić, podać coś, obiecać), odbiorca czyta
 *    słowa i znak razem (`czytaj` w `kartki.ts`) i podświetla te, które
 *    zdecydowały; potem nazwy nadawca / odbiorca / intencja na dzienniku.
 *    Id bloku `przyjdz` zostaje z pierwszej wersji (postęp już zapisany);
 *  - `CoZrobilySlowa` — **para stuknięć „słowo → skutek”** na tekście z
 *    adnotacją; sędzia czyta kotwice „Poranka przy Lipowej”;
 *  - `WizytowkaNaKlatce` — zadanie: wizytówka z części, werdykt struktury,
 *    a w nagrodę **przypięcie na tablicy i karteczki od mieszkańców**;
 *    wizytówka to pierwsza kartka Teczki autora.
 */

const IMAGES = imgMap({
  intro: '/images/jezyk-polski/lekcje/jezyk-dziala/kamienica-rano.jpg',
  klatka: '/images/jezyk-polski/lekcje/jezyk-dziala/klatka-drzwi.jpg',
  schody: '/images/jezyk-polski/lekcje/jezyk-dziala/zuzia-tymek-schody.jpg',
  tablica: '/images/jezyk-polski/lekcje/jezyk-dziala/tablica-korkowa.jpg',
});

const BLOCKS: PolBlockMeta[] = [
  { id: 'przyjdz', kind: 'rozmowa', title: 'Kartki pod drzwiami', time: '8 min', icon: MailOpen },
  { id: 'skutki', kind: 'tekst', title: 'Co zrobiły słowa', time: '8 min', icon: BookOpen },
  { id: 'wizytowka', kind: 'zadanie', title: 'Wizytówka na klatce', time: '8 min', icon: IdCard },
];

interface LessonProps {
  lesson: PolLesson;
  polModule: PolModule;
  nextLesson?: PolLesson;
}

export function JezykDzialaLesson({ lesson, polModule, nextLesson }: LessonProps) {
  return (
    <PolLessonShell
      lesson={lesson}
      polModule={polModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Kamienica już wie, jak do ciebie mówić. Twoje kartki załatwiły dziś pięć spraw — bo słowa nie tylko coś znaczą, one coś robią."
    >
      <LessonBody color={polModule.color} />
    </PolLessonShell>
  );
}

/** Treść wydzielona z komponentu strony, bo `useBlockDone` działa dopiero w kontekście powłoki. */
function LessonBody({ color }: { color: string }) {
  const przyjdz = useBlockDone('przyjdz');
  const skutki = useBlockDone('skutki');
  const wizytowka = useBlockDone('wizytowka');
  // Stan ukończonych bloków przeżywa odświeżenie (raport testera 2026-10-19).
  const zapisKartek = useZapisBloku<{ log: Wyslana[] }>('przyjdz', przyjdz.done);
  const zapisGumki = useZapisBloku<{ found: Record<string, string[]> }>('skutki', skutki.done);
  const zapisWizytowki = useZapisBloku<{ w: Wizytowka }>('wizytowka', wizytowka.done);

  return (
    <>
      <LessonIntro color={color} />

      <LessonBlock id="przyjdz">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.klatka}
          alt="Akwarela: półpiętro starej kamienicy, czworo drewnianych drzwi obok siebie — jasne, szarozielone, brązowe i bladoniebieskie — każde z wycieraczką w swoim kolorze; z lewej drewniana balustrada schodów i okno z pelargonią, pod sufitem lampa"
          lead="Czworo drzwi, pięć spraw."
        >
          Na klatce mieszkają Zuzia, Tymek, Ola i pani Halina. Masz do nich kilka spraw, ale nie możesz zapukać — możesz
          tylko wsunąć kartkę pod drzwi. Sąsiad zrozumie dokładnie to, co na niej napiszesz.
        </LessonImageCard>
        <KartkaPodDrzwi color={color} onComplete={przyjdz.markBlockDone} restored={zapisKartek.restored} onSave={zapisKartek.save} />
      </LessonBlock>

      <LessonBlock id="skutki">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.schody}
          alt="Akwarela: na drewnianych schodach kamienicy siedzą obok siebie mała jasnowłosa dziewczynka w żółtym płaszczyku, różowej sukience i czerwonych kaloszach, z czerwonym balonikiem, oraz rudy chłopiec w koszulce w pomarańczowo-szare paski, z kluczem do roweru w ręku; patrzą na siebie i się uśmiechają"
          reverse
          lead="Sobotni poranek na klatce schodowej."
        >
          Posłuchaj, co powiedzieli sobie sąsiedzi. Każde ich zdanie coś zrobiło — a w tekście zawsze widać, po czym to
          poznać.
        </LessonImageCard>
        <CoZrobilySlowa color={color} onComplete={skutki.markBlockDone} restored={zapisGumki.restored} onSave={zapisGumki.save} />
      </LessonBlock>

      <LessonBlock id="wizytowka">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.tablica}
          alt="Akwarela: korkowa tablica w drewnianej ramie na ścianie klatki schodowej, przypięte kolorowymi pinezkami puste karteczki — białe, różowa, niebieska, żółta, zielona; obok kilka wolnych pinezek, z lewej schody z poręczą"
          lead="Na klatce wisi tablica, na której jest jeszcze miejsce."
        >
          Sąsiedzi chcą cię poznać. Napisz im, jak masz na imię, co lubisz — i o co chcesz ich zapytać.
        </LessonImageCard>
        <WizytowkaNaKlatce
          color={color}
          onComplete={wizytowka.markBlockDone}
          restored={zapisWizytowki.restored}
          onSave={zapisWizytowki.save}
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
          W Zawidełkach, przy ulicy Lipowej, stoi stara kamienica. Mieszkają w niej pani Halina z kotem Mruczkiem, pan
          Bogdan, który pisze do gazety, Ola i Tymek z czwartej klasy, mała Zuzia — a co dzień wpada listonoszka, pani
          Ewa. Przez cały rok będziesz z nimi rozmawiać.
        </p>
        <p className="mt-3">
          Dziś załatwisz z sąsiadami pięć spraw samymi kartkami pod drzwiami, znajdziesz w opowiadaniu słowa, które kogoś
          rozśmieszyły albo zraniły, i przedstawisz się sąsiadom. Wszystko stoi na jednym zdaniu:{' '}
          <strong>słowa nie tylko coś znaczą — one coś robią.</strong>
        </p>
      </div>
      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Akwarela: jasna kamienica z drewnianymi drzwiami i skrzynkami kwiatów w oknach przy brukowanej uliczce, rano w jesiennym słońcu; w głębi rzeka, stary drewniany młyn z kołem i wieża kościoła"
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
                  <span className="block font-medium">{POL_BLOCK_KINDS[block.kind].label}</span>
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
