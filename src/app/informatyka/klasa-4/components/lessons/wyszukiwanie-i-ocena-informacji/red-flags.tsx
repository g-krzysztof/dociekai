'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Clock, Gift, KeyRound, X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Dylemat lekcji: cztery podejrzane treści z sieci i pytanie „co robisz”.
 * Realizuje drugą połowę `[4.3]` — podstawowe działania obronne. Wzorzec
 * `LicenseCall`: przy każdej odpowiedzi, także złej, dziecko widzi, co z niej
 * wynika. Pozycja zamyka się dopiero po wyborze bezpiecznej reakcji.
 *
 * Nad sytuacjami stoją trzy karty z sygnałami ostrzegawczymi (pośpiech, nagroda
 * za nic, prośba o dane/logowanie). Bezpieczne odpowiedzi są na pozycjach
 * 2, 1, 3, 2 — rozrzucone.
 */

interface Choice {
  text: string;
  ok: boolean;
  feedback: string;
}

interface Scenario {
  id: string;
  scene: string;
  choices: Choice[];
}

const SCENARIOS: Scenario[] = [
  {
    id: 'nagroda',
    scene:
      'Podczas gry wyskakuje okno: „GRATULACJE! Jesteś 1000. graczem — odbierz nowy telefon! Kliknij tutaj w ciągu 2 minut”.',
    choices: [
      {
        text: 'Klikam szybko, zanim minie te 2 minuty.',
        ok: false,
        feedback:
          'Właśnie na to liczą. Pośpiech („tylko teraz!”) ma sprawić, żebyś kliknął/kliknęła bez myślenia. Za oknem czeka strona, która poprosi o dane albo zainstaluje coś niedobrego.',
      },
      {
        text: 'Zamykam okno (albo całą kartę) i nic w nim nie klikam.',
        ok: true,
        feedback:
          'Dobrze. Nie da się „wygrać” w losowaniu, w którym się nie brało udziału. Takie okna zamyka się bez czytania — nawet przycisk „Nie, dziękuję” w środku bywa pułapką. Zamknij kartę krzyżykiem przeglądarki.',
      },
      {
        text: 'Podaję tylko swój e-mail, bez reszty danych.',
        ok: false,
        feedback:
          'E-mail to już za dużo. Od tej chwili trafia na listy do rozsyłania spamu i prób oszustwa. „Tylko e-mail” to nadal danie im czegoś swojego.',
      },
    ],
  },
  {
    id: 'lancuszek',
    scene:
      'Znajomy przysyła wiadomość: „Prześlij to 10 osobom w ciągu godziny, inaczej spotka cię pech i stracisz konto”.',
    choices: [
      {
        text: 'Nie przesyłam dalej i kasuję wiadomość.',
        ok: true,
        feedback:
          'Tak. Łańcuszek nie ma żadnej mocy — straszy pechem, żeby się sam rozsyłał. Możesz spokojnie napisać znajomemu, że to nieprawda i że nie warto tego podawać dalej.',
      },
      {
        text: 'Przesyłam dla pewności — a nuż coś w tym jest.',
        ok: false,
        feedback:
          'W ten sposób łańcuszek żyje. Nic ci nie grozi za nieprzesłanie — grozi za to, że zasypiesz znajomych bzdurą i przyzwyczaisz się słuchać gróźb „prześlij albo…”.',
      },
      {
        text: 'Przesyłam tylko najbliższym, żeby ich ostrzec.',
        ok: false,
        feedback:
          'To wciąż rozsyłanie łańcuszka, tylko w mniejszym gronie. Ostrzeżenie brzmi: „nie przesyłajcie takich rzeczy” — a nie „przekażcie dalej”.',
      },
    ],
  },
  {
    id: 'logowanie',
    scene:
      'Dostajesz wiadomość: „Twoje konto w grze zostanie skasowane za 24 h. Zaloguj się teraz przez ten link, żeby je uratować”.',
    choices: [
      {
        text: 'Klikam link i loguję się, żeby zdążyć.',
        ok: false,
        feedback:
          'Link w takiej wiadomości prowadzi do strony, która tylko wygląda jak logowanie do gry. Wpisany tam login i hasło od razu trafiają do oszusta — i to on przejmuje konto.',
      },
      {
        text: 'Odpisuję na wiadomość i pytam, o co chodzi.',
        ok: false,
        feedback:
          'Po drugiej stronie nie ma nikogo, kto chce pomóc. Odpisanie tylko potwierdza, że twój adres jest aktywny — dostaniesz więcej takich wiadomości.',
      },
      {
        text: 'Nie klikam linku. Wchodzę do gry normalnie i sprawdzam, czy konto działa.',
        ok: true,
        feedback:
          'Właśnie tak. Prawdziwe konto sprawdza się, wchodząc do gry swoją zwykłą drogą, nie przez link z wiadomości. Jeśli wszystko działa — wiadomość była próbą oszustwa. Pokaż ją dorosłemu.',
      },
    ],
  },
  {
    id: 'oburzenie',
    scene:
      'Widzisz film z krzykliwym podpisem, bez podania źródła: „UDOSTĘPNIJ, ZANIM TO USUNĄ!”. Treść cię złości i chce, żebyś od razu działał/działała.',
    choices: [
      {
        text: 'Udostępniam natychmiast, żeby inni zdążyli zobaczyć.',
        ok: false,
        feedback:
          '„Udostępnij, zanim usuną” to sztuczka — ma wyłączyć twoje myślenie i podać dalej coś, czego nikt nie sprawdził. Tak rozchodzą się plotki i zmyślone historie.',
      },
      {
        text: 'Najpierw sprawdzam w innym miejscu, czy to w ogóle prawda — dopiero potem decyduję.',
        ok: true,
        feedback:
          'Dobrze. Silne emocje (złość, oburzenie) to sygnał, żeby zwolnić, a nie przyspieszyć. Wpisz temat do wyszukiwarki i zobacz, czy piszą o tym poważne strony. Zwykle okazuje się, że nie ma o czym.',
      },
      {
        text: 'Piszę wściekły komentarz pod filmem.',
        ok: false,
        feedback:
          'Komentarz — nawet krytyczny — podbija film wyżej i pokazuje go kolejnym osobom. Autorowi o to właśnie chodzi. Najlepsza reakcja to sprawdzić i przewinąć dalej.',
      },
    ],
  },
];

const FLAG_CARDS = [
  {
    icon: Clock,
    title: 'Pośpiech',
    body: '„Tylko teraz”, „masz 2 minuty”, „zanim usuną”. Presja czasu ma wyłączyć myślenie. Prawdziwe sprawy nie znikają w 2 minuty.',
  },
  {
    icon: Gift,
    title: 'Nagroda za nic',
    body: 'Wygrana w losowaniu, w którym nie brałeś/brałaś udziału. Darmowy telefon, punkty, skiny. Nikt nie rozdaje nic za darmo obcym.',
  },
  {
    icon: KeyRound,
    title: 'Prośba o dane albo logowanie',
    body: 'Wiadomość każe „zalogować się tutaj” albo podać dane, żeby coś odblokować. Loguj się tylko swoją zwykłą drogą, nie przez link.',
  },
];

interface RedFlagsProps {
  color: string;
  onComplete?: () => void;
}

export function RedFlags({ color, onComplete }: RedFlagsProps) {
  /** id sytuacji → indeks ostatnio wybranej opcji. */
  const [picks, setPicks] = useState<Record<string, number>>({});

  const isSettled = (scenario: Scenario) => {
    const i = picks[scenario.id];
    return i !== undefined && scenario.choices[i].ok;
  };
  const solved = SCENARIOS.filter(isSettled).length;
  const finished = solved === SCENARIOS.length;

  const choose = (scenario: Scenario, choiceIndex: number) => {
    if (isSettled(scenario)) return;
    const next = { ...picks, [scenario.id]: choiceIndex };
    setPicks(next);
    const allOk = SCENARIOS.every((item) => {
      const i = next[item.id];
      return i !== undefined && item.choices[i].ok;
    });
    if (allOk) onComplete?.();
  };

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {FLAG_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="border p-3" style={{ borderColor: `${color}55` }}>
              <p className="mb-1.5 flex items-center gap-2 font-bold" style={{ color }}>
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                {card.title}
              </p>
              <p className="text-xs leading-relaxed text-muted-foreground">{card.body}</p>
            </div>
          );
        })}
      </div>

      <div className="mb-4 flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
        <p className="max-w-2xl text-sm leading-relaxed sm:text-base">
          Cztery rzeczy, które naprawdę pojawiają się w sieci. Wybierz, <strong>co robisz</strong> —
          przy każdej odpowiedzi zobaczysz, co z niej wynika.
        </p>
        <p className="shrink-0 font-mono text-sm font-bold tabular-nums" style={{ color }}>
          {solved}/{SCENARIOS.length}
        </p>
      </div>

      <ol className="space-y-5">
        {SCENARIOS.map((scenario, index) => {
          const pickedIndex = picks[scenario.id];
          const settled = isSettled(scenario);

          return (
            <li key={scenario.id} className="border p-3 sm:p-4">
              <p className="mb-3 flex gap-2 text-sm leading-relaxed sm:text-base">
                <span className="font-mono font-bold" style={{ color }}>
                  {index + 1}.
                </span>
                <span>{scenario.scene}</span>
              </p>

              <div className="space-y-2">
                {scenario.choices.map((choice, choiceIndex) => {
                  const isPicked = pickedIndex === choiceIndex;
                  const showOk = isPicked && choice.ok;
                  const showWrong = isPicked && !choice.ok;
                  return (
                    <div key={choice.text}>
                      <button
                        type="button"
                        onClick={() => choose(scenario, choiceIndex)}
                        disabled={settled}
                        aria-pressed={isPicked}
                        className={cn(
                          'flex w-full items-start gap-2.5 border px-3 py-2 text-left text-sm leading-relaxed transition-colors',
                          settled ? 'cursor-default' : 'cursor-pointer hover:bg-muted/50',
                          showWrong && 'border-red-600 text-red-700 dark:text-red-400'
                        )}
                        style={
                          showOk
                            ? { borderColor: color, backgroundColor: `${color}14`, color }
                            : undefined
                        }
                      >
                        <span className="mt-0.5 shrink-0">
                          {showOk ? (
                            <Check className="h-4 w-4" aria-hidden />
                          ) : showWrong ? (
                            <X className="h-4 w-4" aria-hidden />
                          ) : (
                            <span
                              className="block h-4 w-4 border"
                              style={{ borderColor: 'var(--border)' }}
                            />
                          )}
                        </span>
                        {choice.text}
                      </button>

                      <AnimatePresence>
                        {isPicked && (
                          <motion.p
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="mt-1.5 border-l-2 pl-3 text-sm leading-relaxed text-muted-foreground"
                            style={{ borderColor: choice.ok ? color : '#dc2626' }}
                          >
                            {choice.feedback}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </li>
          );
        })}
      </ol>

      <AnimatePresence>
        {finished && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 border-t-2 pt-4 text-sm leading-relaxed"
            style={{ borderColor: color }}
          >
            <strong>Widzisz pośpiech, nagrodę za nic albo prośbę o logowanie — zwolnij.</strong>{' '}
            Nie klikaj, nie przesyłaj, nie odpisuj. Sprawdź spokojnie w innym miejscu, a jeśli coś
            cię niepokoi — pokaż wiadomość dorosłemu. Nic złego nie stanie się od tego, że{' '}
            <em>nie</em> zareagujesz od razu.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
