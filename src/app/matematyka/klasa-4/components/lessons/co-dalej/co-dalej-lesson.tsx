'use client';

import Link from 'next/link';
import { Clock, Hash, Percent, PieChart } from 'lucide-react';
import { LessonSection, LessonShell, useStepDone, type LessonStepMeta } from '../../lesson-shell';
import { MiniFraction } from '../../mini-fraction';
import { PeekReveal } from './peek-reveal';
import { SetkaGrid } from './setka-grid';
import type { MathModule } from '../../../data/curriculum';
import type { MathLesson } from '../../../data/lessons';

const STEPS: LessonStepMeta[] = [
  { id: 'ulamki', kind: 'Zapowiedź 1', title: 'Ułamki o różnych mianownikach', time: '4 min', icon: 'PieChart' },
  { id: 'liczby', kind: 'Zapowiedź 2', title: 'Liczby ujemne — oś w lewo za zero', time: '4 min', icon: 'Hash' },
  { id: 'procenty', kind: 'Zapowiedź 3', title: 'Procenty — jedna setna', time: '5 min', icon: 'Percent' },
  { id: 'predkosc', kind: 'Zapowiedź 4', title: 'Prędkość, droga i czas', time: '4 min', icon: 'Clock' },
  { id: 'plan', kind: 'Na koniec', title: 'Cały rok za Tobą', time: '2 min', icon: 'Trophy' },
];

/** Mała oś liczbowa z liczbami ujemnymi — całkowicie na arytmetyce całkowitej,
 *  bez trygonometrii, więc bezpieczna dla SSR. */
function MiniAxis({ color }: { color: string }) {
  const xs = [-4, -3, -2, -1, 0, 1, 2, 3, 4];
  const px = (v: number) => 160 + v * 34;
  return (
    <svg viewBox="0 0 320 64" className="mt-3 w-full max-w-[320px]" role="img" aria-label="Oś liczbowa od minus 4 do 4, wyróżniona liczba minus 2">
      <line x1={12} y1={38} x2={308} y2={38} stroke="currentColor" strokeWidth={2} className="text-muted-foreground" />
      {xs.map((v) => (
        <g key={v}>
          <line
            x1={px(v)}
            y1={v === 0 ? 28 : 32}
            x2={px(v)}
            y2={v === 0 ? 48 : 44}
            stroke="currentColor"
            strokeWidth={v === 0 ? 2.5 : 1.5}
            className={v === 0 ? 'text-foreground' : 'text-muted-foreground'}
          />
          <text x={px(v)} y={20} textAnchor="middle" className="fill-muted-foreground text-[10px] font-mono">
            {v}
          </text>
        </g>
      ))}
      <circle cx={px(-2)} cy={38} r={5} style={{ fill: color }} />
      <text x={px(-2)} y={62} textAnchor="middle" className="text-[10px] font-mono font-bold" style={{ fill: color }}>
        −2
      </text>
    </svg>
  );
}

interface LessonProps {
  lesson: MathLesson;
  mathModule: MathModule;
  nextLesson?: MathLesson;
  nextModule?: MathModule;
}

export function CoDalejLesson({ lesson, mathModule, nextLesson, nextModule }: LessonProps) {
  return (
    <LessonShell
      lesson={lesson}
      mathModule={mathModule}
      steps={STEPS}
      nextLesson={nextLesson}
      nextModule={nextModule}
    >
      <LessonBody color={mathModule.color} />
    </LessonShell>
  );
}

/** Treść wydzielona z komponentu strony, bo `useStepDone` wymaga kontekstu `LessonShell`. */
function LessonBody({ color }: { color: string }) {
  const ulamki = useStepDone('ulamki');
  const liczby = useStepDone('liczby');
  const procenty = useStepDone('procenty');
  const predkosc = useStepDone('predkosc');
  const plan = useStepDone('plan');

  const textColor = `color-mix(in oklch, ${color} 82%, black)`;

  return (
    <>
      {/* Wstęp */}
      <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
        <p className="mb-4 text-base leading-relaxed sm:text-lg">
          Klasa 4 za Tobą. Ta lekcja niczego już nie sprawdza — to <strong>zapowiedź</strong>.
          Zobaczysz <strong>cztery tematy</strong>, od których zacznie się klasa 5, i przekonasz
          się, że każdy z nich zaczyna się od czegoś, co <strong>już umiesz</strong>.
        </p>
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
          Nic nie musisz tu ćwiczyć. Przejrzyj, pobaw się „setką” do procentów i wróć tu za rok —
          zobaczysz, jak dużo z tego już rozumiesz.
        </p>
        <ul className="grid gap-2 sm:grid-cols-2">
          {[
            { icon: PieChart, text: 'Ułamki o różnych mianownikach' },
            { icon: Hash, text: 'Liczby ujemne' },
            { icon: Percent, text: 'Procenty' },
            { icon: Clock, text: 'Prędkość, droga i czas' },
          ].map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-2 text-sm">
              <Icon className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
              <span className="leading-relaxed">{text}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 1. Ułamki o różnych mianownikach */}
      <LessonSection id="ulamki">
        <PeekReveal
          color={color}
          title="Ułamki o różnych mianownikach"
          known={
            <>
              Dodajesz i odejmujesz ułamki o <strong>tym samym</strong> mianowniku (
              <MiniFraction licznik={3} mianownik={8} /> +{' '}
              <MiniFraction licznik={2} mianownik={8} /> ={' '}
              <MiniFraction licznik={5} mianownik={8} />) oraz potrafisz rozszerzyć ułamek do
              innego mianownika.
            </>
          }
          whatsNew={
            <>
              <p className="mb-2">
                Łączysz jedno z drugim. Żeby dodać{' '}
                <MiniFraction licznik={1} mianownik={2} /> +{' '}
                <MiniFraction licznik={1} mianownik={3} />, najpierw sprowadzasz oba ułamki do{' '}
                <strong>wspólnego mianownika 6</strong>:
              </p>
              <p className="font-semibold" style={{ color: textColor }}>
                <MiniFraction licznik={1} mianownik={2} /> ={' '}
                <MiniFraction licznik={3} mianownik={6} />
                {'  ·  '}
                <MiniFraction licznik={1} mianownik={3} /> ={' '}
                <MiniFraction licznik={2} mianownik={6} />
              </p>
              <p className="mt-2">
                a wtedy dodawanie jest już „po staremu”:{' '}
                <MiniFraction licznik={3} mianownik={6} /> +{' '}
                <MiniFraction licznik={2} mianownik={6} /> ={' '}
                <MiniFraction licznik={5} mianownik={6} />.
              </p>
            </>
          }
          onSeen={ulamki.markStepDone}
        />
      </LessonSection>

      {/* 2. Liczby ujemne */}
      <LessonSection id="liczby">
        <PeekReveal
          color={color}
          title="Liczby ujemne — oś w lewo za zero"
          known={
            <>
              Znasz oś liczbową w prawo od zera, umiesz porównywać liczby i powiedzieć, jak daleko
              od zera leży dana liczba.
            </>
          }
          whatsNew={
            <>
              <p className="mb-1">
                Oś przedłuża się <strong>w lewo, za zero</strong>: −1, −2, −3… Jak termometr zimą —
                −5°C to pięć kresek poniżej zera.
              </p>
              <MiniAxis color={color} />
              <p className="mt-2">
                Wtedy <strong>3 − 5</strong> przestaje być „nie da się” i daje −2. A porządek liczb
                zna nowy początek: −3 &lt; −1 &lt; 0 &lt; 2.
              </p>
            </>
          }
          onSeen={liczby.markStepDone}
        />
      </LessonSection>

      {/* 3. Procenty — widżet „setka" */}
      <LessonSection id="procenty">
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
          Procent to po prostu <strong>setna część całości</strong> — a setne części już liczysz w
          ułamkach dziesiętnych. Pobaw się „setką” poniżej: zacieniuj kilkanaście kwadracików i
          popatrz, jak ten sam kawałek zapisuje się na trzy sposoby.
        </p>
        <SetkaGrid color={color} onSeen={procenty.markStepDone} />
      </LessonSection>

      {/* 4. Prędkość, droga i czas */}
      <LessonSection id="predkosc">
        <PeekReveal
          color={color}
          title="Prędkość, droga i czas"
          known={
            <>
              Zamieniasz jednostki (3 km = 3000 m, 2 godziny = 120 minut) oraz mnożysz i dzielisz
              liczby.
            </>
          }
          whatsNew={
            <>
              <p className="mb-2">Składasz to w jeden wzór z trzema wielkościami:</p>
              <ul className="ml-4 list-disc space-y-1">
                <li>
                  jedziesz 60 km na godzinę przez 3 godziny →{' '}
                  <strong style={{ color: textColor }}>droga = 60 · 3 = 180 km</strong>
                </li>
                <li>
                  przejechałeś 24 km w 2 godziny →{' '}
                  <strong style={{ color: textColor }}>prędkość = 24 : 2 = 12 km na godzinę</strong>
                </li>
              </ul>
              <p className="mt-2">
                Trzy wielkości, jeden trójkąt: <strong>droga</strong>, <strong>prędkość</strong>,{' '}
                <strong>czas</strong> — znasz dwie, trzecią wyliczysz.
              </p>
            </>
          }
          onSeen={predkosc.markStepDone}
        />
      </LessonSection>

      {/* 5. Na koniec */}
      <LessonSection id="plan">
        <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
          <p className="mb-4 text-base leading-relaxed sm:text-lg">
            To był ostatni temat kursu matematyki klasy 4. Za Tobą osiem działów, wielkie
            powtórzenie przekrojowe i test końcowy — <strong>cały rok</strong>.
          </p>
          <p className="mb-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Twój postęp zostaje zapisany. Jeśli coś z testu wypadło słabiej, spokojnie wróć do
            wskazanych lekcji — a za rok zajrzyj tu jeszcze raz i sprawdź, ile z tych czterech
            tematów klasy 5 już rozumiesz.
          </p>
          <div className="mb-5 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <Link
              href="/matematyka/klasa-4/podsumowanie/powtorzenie-przekrojowe"
              className="font-semibold underline-offset-4 hover:underline"
              style={{ color: textColor }}
            >
              Duże powtórzenie przekrojowe
            </Link>
            <Link
              href="/matematyka/klasa-4/podsumowanie/test-koncowy"
              className="font-semibold underline-offset-4 hover:underline"
              style={{ color: textColor }}
            >
              Test końcowy i diagnoza
            </Link>
          </div>
          {!plan.done ? (
            <button
              type="button"
              onClick={plan.markStepDone}
              className="inline-flex cursor-pointer items-center gap-2 px-5 py-2.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
              style={{ backgroundColor: color }}
            >
              Kończę klasę 4
            </button>
          ) : (
            <p className="text-sm font-semibold" style={{ color: textColor }}>
              Do zobaczenia w klasie 5! 🎉
            </p>
          )}
        </div>
      </LessonSection>
    </>
  );
}
