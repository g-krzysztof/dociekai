'use client';

import Image from 'next/image';
import { Mail, Save, Scale } from 'lucide-react';
import {
  BLOCK_KINDS,
  InfoLessonShell,
  LessonBlock,
  useBlockDone,
  type LessonBlockMeta,
} from '../../lesson-shell';
import { PracticeTask } from '../../practice-task';
import { LessonImageCard } from '@/components/ui/lesson-image-card';
import { SaveAgain } from './save-again';
import { FormatScale } from './format-scale';
import { BadSave } from './bad-save';
import { AttachIt } from './attach-it';
import type { InfoModule } from '../../../data/curriculum';
import type { InfoLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

/**
 * Czwarta lekcja modułu 3 i siedemnasty kształt lekcji w kursie. **Domyka moduł
 * 3** i niesie zadanie obowiązkowe **Z-4** (kartka okolicznościowa + e-mail z
 * załącznikiem), które świadomie wraca do poczty z modułu 2.
 *
 * Kręgosłupem lekcji jest **waga liczona naprawdę z pikseli** (`card.ts`): ten
 * sam obrazek kładzie się na wadze osiem razy i reguła „rysunek → PNG, zdjęcie
 * → JPG” wychodzi z liczb, które dziecko samo zmierzyło, a nie z akapitu do
 * zapamiętania. Cztery bloki to cztery różne roboty:
 *  - `SaveAgain` — ten sam przycisk nad dwoma plikami; **tylko jeden niszczeje**,
 *    a drugi jest grupą kontrolną;
 *  - `FormatScale` — osiem ważeń i dwóch różnych zwycięzców;
 *  - `BadSave` — trzy reklamacje z trzech różnych porządków (przezroczystość,
 *    ostre krawędzie, nadwaga bez usterki);
 *  - `AttachIt` — załącznik widziany z drugiej strony: skrzynka odbija za ciężki
 *    plik, a odbiorczyni nie otwiera pliku roboczego edytora.
 */

const IMAGES = imgMap({
  intro: '/images/informatyka/lekcje/formaty-i-kartka/sloiki-i-puszka.jpg',
  kalka: '/images/informatyka/lekcje/formaty-i-kartka/blednace-kopie.jpg',
  waga: '/images/informatyka/lekcje/formaty-i-kartka/waga-szalkowa.jpg',
  szyba: '/images/informatyka/lekcje/formaty-i-kartka/szyba-i-mleczne-szklo.jpg',
  koperta: '/images/informatyka/lekcje/formaty-i-kartka/koperta-i-sznurek.jpg',
});

const BLOCKS: LessonBlockMeta[] = [
  {
    id: 'zapisz-jeszcze-raz',
    kind: 'haczyk',
    title: 'Zapisz jeszcze raz. I jeszcze raz',
    time: '6 min',
    icon: Save,
  },
  {
    id: 'osiem-wazen',
    kind: 'wyjasnienie',
    title: 'Osiem ważeń, dwóch zwycięzców',
    time: '8 min',
    icon: Scale,
  },
  {
    id: 'trzy-reklamacje',
    kind: 'debugowanie',
    title: 'Trzy pliki wróciły od odbiorcy',
    time: '7 min',
  },
  {
    id: 'zalacznik',
    kind: 'symulator',
    title: 'Załącznik, który naprawdę dojedzie',
    time: '6 min',
    icon: Mail,
  },
  {
    id: 'kartka-z4',
    kind: 'zadanie',
    title: 'Kartka okolicznościowa i e-mail z życzeniami',
    time: '12 min',
  },
];

interface LessonProps {
  lesson: InfoLesson;
  infoModule: InfoModule;
  nextLesson?: InfoLesson;
}

export function FormatyIKartkaLesson({ lesson, infoModule, nextLesson }: LessonProps) {
  return (
    <InfoLessonShell
      lesson={lesson}
      infoModule={infoModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Zepsułeś/zepsułaś plik samym zapisywaniem, zważyłeś/zważyłaś ten sam obrazek osiem razy, naprawiłeś/naprawiłaś trzy reklamacje i wysłałeś/wysłałaś załącznik, który naprawdę dojechał. Na tym kończy się moduł o grafice — a zdanie, które z niego zostaje, brzmi: format pliku wybiera się nie dla siebie, tylko dla tego, co jest na obrazku i dokąd on jedzie."
    >
      <LessonBody color={infoModule.color} />
    </InfoLessonShell>
  );
}

/** Treść wydzielona z komponentu strony, bo `useBlockDone` działa dopiero w kontekście powłoki. */
function LessonBody({ color }: { color: string }) {
  const again = useBlockDone('zapisz-jeszcze-raz');
  const scale = useBlockDone('osiem-wazen');
  const bad = useBlockDone('trzy-reklamacje');
  const mail = useBlockDone('zalacznik');
  const task = useBlockDone('kartka-z4');

  return (
    <>
      <LessonIntro color={color} />

      <LessonBlock id="zapisz-jeszcze-raz">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.kalka}
          alt="Cztery kartki papieru leżą w rzędzie na kremowym tle, na każdej ten sam liść klonu — na pierwszej wyraźny i kolorowy, na każdej następnej coraz bledszy i bardziej rozmyty, na ostatniej ledwo widoczny"
          lead="Odbitka z odbitki jest bledsza. Odbitka z tamtej — jeszcze bledsza."
        >
          Tak działał kiedyś każdy kserograf i tak samo działa dziś{' '}
          <strong>zapis stratny</strong>. Poniżej leżą dwa pliki z tą samą kartką. Klikaj „Zapisz”,
          ile chcesz, i patrz, czy oba wytrzymają.
        </LessonImageCard>
        <SaveAgain color={color} onComplete={again.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="osiem-wazen">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.waga}
          alt="Mosiężna waga szalkowa stoi na jasnym blacie, na lewej szalce leży kilka gładkich, nieopisanych odważników, przez co prawa szalka jest pusta i uniesiona do góry"
          reverse
        >
          <p>
            Nie ma jednego „najlepszego formatu” — tak samo jak nie ma jednego najlepszego pudełka na
            wszystko. Jest tylko pytanie, <strong>co dokładnie jest na obrazku</strong>. Zważ ten sam
            rysunek i to samo zdjęcie w czterech formatach, a odpowiedź wyjdzie z liczb.
          </p>
        </LessonImageCard>
        <FormatScale color={color} onComplete={scale.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="trzy-reklamacje">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.szyba}
          alt="Dwie szybki oparte obok siebie o jasną ścianę — przez lewą, zupełnie przezroczystą, widać gałązkę zielonych liści, prawa jest mleczna i nic przez nią nie widać"
          lead="Przez jedną widać, co jest pod spodem. Przez drugą — nic."
          reverse
        >
          Format pliku działa jak taka szybka: jeden potrafi zapisać, że w tym miejscu obrazka{' '}
          <strong>nic nie ma</strong>, a inny wstawi tam biel. Trzy pliki niżej wróciły od
          odbiorców z trzema różnymi pretensjami. Napraw każdy.
        </LessonImageCard>
        <BadSave color={color} onComplete={bad.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="zalacznik">
        <AttachIt color={color} onComplete={mail.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="kartka-z4">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.koperta}
          alt="Jasna koperta bez adresu leży na kremowym blacie, obok wije się cienki sznurek, a z prawej strony spoczywają dwie gałązki lawendy"
        >
          <p>
            Teraz naprawdę: własna kartka, własny e-mail i własny załącznik. To ostatnie zadanie
            modułu o grafice — i pierwsze, które łączy go z{' '}
            <strong>pocztą z modułu drugiego</strong>. Kartkę trzeba najpierw{' '}
            <strong>zapisać jako plik</strong> i wiedzieć, gdzie leży.
          </p>
        </LessonImageCard>
        <PracticeTask
          color={color}
          onComplete={task.markBlockDone}
          brief={
            <>
              <strong>
                Przygotuj w dowolnym programie kartkę okolicznościową, na przykład urodzinową.
              </strong>{' '}
              Napisz e-mail z życzeniami do wybranej osoby. Do listu dołącz kartkę.
            </>
          }
          sections={[
            {
              label: 'Kartka',
              items: [
                'Zrobiłem/zrobiłam kartkę okolicznościową w edytorze grafiki albo w edytorze tekstu.',
                'Zapisałem/zapisałam ją jako plik i wiem, w którym folderze leży.',
                'Wybrałem/wybrałam format świadomie: dla rysunku PNG, dla zdjęcia JPG — i umiem powiedzieć dlaczego.',
              ],
            },
            {
              label: 'E-mail z życzeniami',
              items: [
                'Napisałem/napisałam e-mail do wybranej osoby: temat, treść z życzeniami i podpis.',
                'W treści zapowiedziałem/zapowiedziałam załącznik („przesyłam kartkę”).',
              ],
            },
            {
              label: 'Załącznik',
              items: [
                'Dołączyłem/dołączyłam do listu plik z kartką — obrazek, nie plik roboczy programu.',
                'Sprawdziłem/sprawdziłam, że załącznik naprawdę się doczepił, zanim kliknąłem/kliknęłam „Wyślij”.',
              ],
            },
          ]}
          hint={
            <>
              Kartkę zrobisz w <strong>Paincie</strong>, <strong>GIMP-ie</strong> albo{' '}
              <strong>Kricie</strong>, a jeśli wolisz tekst — w <strong>Wordzie</strong> czy{' '}
              <strong>Dokumentach Google</strong>. W programach graficznych zapis obrazka bywa
              schowany pod <strong>Plik → Eksportuj</strong> (samo „Zapisz” robi wtedy plik roboczy,
              którego nikt poza tym programem nie otworzy). Załącznik w poczcie to zwykle{' '}
              <strong>spinacz</strong> obok pola treści.
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
          Truskawek nikt nie wkłada do worka na ziemniaki. Do jednych rzeczy są słoiki, do innych
          puszki, a do jeszcze innych zamrażarka — bo{' '}
          <strong>opakowanie dobiera się do tego, co w nim będzie</strong>. Z obrazkami jest
          dokładnie tak samo, tylko opakowanie nazywa się <strong>formatem pliku</strong>.
        </p>
        <p className="mt-3">
          PNG, JPG, GIF i BMP to cztery różne umowy o tym, jak zapisać ten sam obrazek. Zaczniesz od
          tego, że zepsujesz plik samym zapisywaniem, potem zważysz ten sam rysunek i to samo zdjęcie
          w każdym z czterech formatów, naprawisz trzy reklamacje od odbiorców i wyślesz załącznik,
          który naprawdę dojedzie.
        </p>
      </div>

      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Szklany słoik, szklana butelka i metalowa puszka stoją obok siebie na kremowym blacie, wszystkie zupełnie gładkie i bez naklejek, a przed nimi leży zwinięty sznurek"
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
