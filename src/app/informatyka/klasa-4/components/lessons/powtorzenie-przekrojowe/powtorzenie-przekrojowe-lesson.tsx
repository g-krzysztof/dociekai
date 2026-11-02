'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Bot, Map as MapIcon, Printer, Zap } from 'lucide-react';
import {
  BLOCK_KINDS,
  InfoLessonShell,
  LessonBlock,
  useBlockDone,
  type LessonBlockMeta,
} from '../../lesson-shell';
import { LessonImageCard } from '@/components/ui/lesson-image-card';
import { RushRoku, type RushFirstTry } from './rush/rush-roku';
import { LiteralMachine, type LiteralSummary } from './literal-machine';
import { InvitationStudio } from './invitation-studio';
import { YearMap } from './year-map';
import type { InfoModule } from '../../../data/curriculum';
import type { InfoLesson } from '../../../data/lessons';
import { imgMap } from '@/lib/media';

/**
 * Pierwsza lekcja modułu 9 — **powtórzenie przekrojowe**. Przez cały rok dziecko
 * uczyło się ośmiu działów po kolei; ta lekcja przechodzi przez nie **w poprzek**
 * i stoi na jednym zdaniu, które wraca za każdym razem, tylko w innych słowach:
 * *komputer robi dokładnie to, co mu powiesz — dlatego najpierw pomyśl, a na
 * końcu sprawdź, czy wyszło to, o co ci chodziło.*
 *
 * Cztery bloki to cztery różne czasowniki, nie cztery przebrania jednego
 * widżetu:
 *
 * 1. **Rush roku** (haczyk) — *zrób*: dziewięć mikro-gier, po jednej na dział,
 *    każda odtwarza w kilkanaście sekund gest z jednej lekcji.
 * 2. **Dosłowniak** (wyjaśnienie) — *powiedz i sprawdź*: maszyna, która robi
 *    dokładnie to, co jej powiesz, a czego nie powiesz, tam wstawia coś od
 *    siebie. Trzy polecenia z trzech działów (Scratch, grafika, pliki); po
 *    trzecim dziecko dostaje zdanie całej lekcji, złożone z tego, co samo
 *    przed chwilą zrobiło.
 * 3. **Zaproszenie** (zadanie, w lekcji, bez pliku) — *zastosuj wszystko naraz*:
 *    plakat z pięcioma usterkami z pięciu działów i Zosia, która czyta go przez
 *    cztery sekundy.
 * 4. **Mapa roku** (refleksja) — *zaplanuj*: pierścień ośmiu działów ze znakami
 *    pamięci wynikającymi z bloków 1 i 2.
 *
 * Stan dzielony między blokami jest jeden i mały: wyniki pierwszych prób z
 * bloku 1 i podsumowanie Dosłowniaka z bloku 2 — oba czyta tylko mapa roku.
 */

const IMAGES = imgMap({
  intro: '/images/informatyka/lekcje/powtorzenie-przekrojowe/biurko-roku.jpg',
  rush: '/images/informatyka/lekcje/powtorzenie-przekrojowe/stoper-i-kostki.jpg',
  doslowniak: '/images/informatyka/lekcje/powtorzenie-przekrojowe/robot-z-klockiem.jpg',
  zaproszenie: '/images/informatyka/lekcje/powtorzenie-przekrojowe/plakat-na-korku.jpg',
  mapa: '/images/informatyka/lekcje/powtorzenie-przekrojowe/kompas-na-mapie.jpg',
});

const BLOCKS: LessonBlockMeta[] = [
  { id: 'rush', kind: 'haczyk', title: 'Rush roku: dziewięć mikro-gier', time: '6 min', icon: Zap },
  { id: 'doslowniak', kind: 'wyjasnienie', title: 'Dosłowniak: powiedz mu dokładnie', time: '8 min', icon: Bot },
  { id: 'zaproszenie', kind: 'zadanie', title: 'Zaproszenie: popraw i sprawdź', time: '10 min', icon: Printer },
  { id: 'mapa', kind: 'refleksja', title: 'Twoja mapa roku', time: '4 min', icon: MapIcon },
];

interface LessonProps {
  lesson: InfoLesson;
  infoModule: InfoModule;
  nextLesson?: InfoLesson;
}

export function PowtorzeniePrzekrojoweLesson({ lesson, infoModule, nextLesson }: LessonProps) {
  return (
    <InfoLessonShell
      lesson={lesson}
      infoModule={infoModule}
      blocks={BLOCKS}
      nextLesson={nextLesson}
      finishNote="Rok masz w rękach (mikro-gry), w głowie (Dosłowniak) i na papierze (plakat). Została jedna rzecz: sprawdzić, co z tego zostaje, gdy nikt nie podpowiada — czyli test końcowy."
    >
      <LessonBody color={infoModule.color} />
    </InfoLessonShell>
  );
}

/** Treść wydzielona z komponentu strony, bo `useBlockDone` działa dopiero w kontekście powłoki. */
function LessonBody({ color }: { color: string }) {
  const [rush, setRush] = useState<RushFirstTry>({});
  const [literal, setLiteral] = useState<LiteralSummary | null>(null);

  const rushDone = useBlockDone('rush');
  const literalDone = useBlockDone('doslowniak');
  const posterDone = useBlockDone('zaproszenie');
  const mapDone = useBlockDone('mapa');

  return (
    <>
      <LessonIntro color={color} />

      <LessonBlock id="rush">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.rush}
          alt="Drewniany zegar piaskowy i trzy gładkie drewniane klocki w pastelowych kolorach — różowym, niebieskim i zielonym — na jasnym blacie"
        >
          <p>
            Zaczynamy od rąk, nie od głowy. Dziewięć krótkich gier — po jednej z każdego działu roku. Nikt nie
            powtórzy ci, co robić: rozpoznasz to po tym, co masz przed sobą.
          </p>
        </LessonImageCard>
        <RushRoku color={color} onResults={setRush} onComplete={rushDone.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="doslowniak">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.doslowniak}
          alt="Mały drewniany robot zabawka z okrągłą, gładką głową i korpusem z klocka stoi na blacie i niesie w ramionach jeden drewniany klocek, a przed nim leży równy rząd sześciu takich samych klocków"
          lead="Maszyna nie zgaduje — robi dokładnie to, co jej powiesz."
        >
          Człowiek dopowie sobie resztę, komputer nie. Czego mu nie powiesz, tam wstawi coś od siebie — i zrobi to bez
          mrugnięcia okiem.
        </LessonImageCard>
        <LiteralMachine color={color} onSummary={setLiteral} onComplete={literalDone.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="zaproszenie">
        <LessonImageCard
          variant="basic"
          color={color}
          image={IMAGES.zaproszenie}
          alt="Pusty biały arkusz papieru przypięty czterema kolorowymi pinezkami do korkowej tablicy, pod nią leży ołówek"
          reverse
        >
          <p>
            Teraz wszystko naraz. Jeden plakat, w którym pięć rzeczy z pięciu działów jest zepsutych — i jedna osoba,
            która zobaczy go po raz pierwszy w życiu.
          </p>
        </LessonImageCard>
        <InvitationStudio color={color} onComplete={posterDone.markBlockDone} />
      </LessonBlock>

      <LessonBlock id="mapa">
        <LessonImageCard
          variant="secondary"
          color={color}
          image={IMAGES.mapa}
          alt="Stary mosiężny kompas z czerwoną igłą leżący na pustym arkuszu papieru, obok zwinięty w rulon kawałek papieru"
          lead="Kompas pokazuje kierunek, nie drogę."
        >
          Mapa roku składa się z tego, co zrobiłeś/zrobiłaś w poprzednich blokach. Zobacz, gdzie jest pewnie, a gdzie
          warto zajrzeć przed testem.
        </LessonImageCard>
        <YearMap color={color} rush={rush} literal={literal} onComplete={mapDone.markBlockDone} />
      </LessonBlock>
    </>
  );
}

/**
 * Wejście w lekcję: o czym jest i plan bloków dla ekranów bez bocznej szyny.
 * Bez numeru — nie jest blokiem, więc nie liczy się do postępu.
 */
function LessonIntro({ color }: { color: string }) {
  return (
    <div className="grid gap-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[1fr_260px]">
      <div className="text-base leading-relaxed sm:text-lg">
        <p>
          Cały rok to <strong>osiem działów</strong>: sprzęt i pliki, internet, grafika, tekst, myślenie
          komputacyjne, Scratch, dane z AI i projekt. Uczyłeś/uczyłaś się ich po kolei — tu przejdziemy przez nie{' '}
          <strong>w poprzek</strong>.
        </p>
        <p className="mt-3">
          Cały rok mieści się w <strong>jednym zdaniu</strong>. Nie podam go od razu: znajdziesz je sam/sama, gdy
          poinstruujesz maszynę, która robi dokładnie to, co jej powiesz. Zanim to zrobisz, sprawdź, co masz w rękach.
        </p>
      </div>

      <div className="space-y-5 md:border-l md:pl-5">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[260px] overflow-hidden">
          <Image
            src={IMAGES.intro}
            alt="Drewniane biurko z drobnymi przedmiotami z całego roku: pendrive, lupa, papierowy samolocik, mały klocek i zielony liść"
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
