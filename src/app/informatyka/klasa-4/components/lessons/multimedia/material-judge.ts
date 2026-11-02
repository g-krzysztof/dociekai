import { count } from '../../../lib/plural';
import { sceneById, type SceneId } from './scene';

/**
 * Werdykt zadania praktycznego z lekcji o materiałach multimedialnych.
 *
 * Oddzielony od widżetu z tego samego powodu co `deck-judge.ts` w lekcji
 * o prezentacji: reguły, według których strona ocenia pracę dziecka, mają dać
 * się przeczytać bez przedzierania się przez JSX i mają być **jedną** wersją
 * prawdy — tę samą listę widzi dziecko w „Zleceniu”, zanim zacznie.
 *
 * Najtrudniejsze jest tu kryterium podpisu. Nie da się sprawdzić, czy zdanie
 * jest mądre, ale da się sprawdzić coś węższego i uczciwego: **czy podpis mówi
 * cokolwiek poza nazwaniem tego, co i tak widać na obrazku**. Dlatego każda
 * scena ma w `scene.tsx` listę `visible`, a werdykt odejmuje ją od podpisu
 * i **wypisuje dziecku, które wyrazy odjął** — reguła, której nie widać, byłaby
 * dla dziesięciolatka magią.
 */

export interface StudioScene {
  picture: SceneId;
  caption: string;
  /** Czy scena jest animacją, czy zwykłym rysunkiem. */
  moving: boolean;
  /** Ile sekund trwa ruch. */
  duration: number;
  /** Migająca ramka „NOWOŚĆ” w rogu. */
  badge: boolean;
}

export interface Topic {
  id: string;
  question: string;
  subject: string;
  /** Obrazek, który pokazuje to, o co pyta temat. */
  picture: SceneId;
  /** Podpowiedź, co warto pokazać — nie gotowa treść, tylko kierunek. */
  hint: string;
}

export const TOPICS: Topic[] = [
  {
    id: 'deszcz',
    question: 'Skąd bierze się deszcz?',
    subject: 'przyroda',
    picture: 'woda',
    hint: 'Woda musi gdzieś zniknąć i skądś wrócić — pokaż tę drogę.',
  },
  {
    id: 'cien',
    question: 'Dlaczego cień raz jest długi, a raz krótki?',
    subject: 'przyroda',
    picture: 'cien',
    hint: 'Cień zmienia się nie sam z siebie — coś innego się przesuwa.',
  },
  {
    id: 'polowa',
    question: 'Ile to jest połowa, a ile ćwierć?',
    subject: 'matematyka',
    picture: 'ulamek',
    hint: 'Połowy nie widać na jednym obrazku — widać ją, kiedy coś ubywa.',
  },
];

export const SCENE_COUNT = 3;
export const MIN_CAPTION_WORDS = 3;
export const MAX_CAPTION_WORDS = 12;
/** Poniżej tylu sekund ruchu nie da się prześledzić — wniosek z bloku 4. */
export const MIN_DURATION = 3;

export const emptyMaterial = (): StudioScene[] =>
  Array.from({ length: SCENE_COUNT }, () => ({
    picture: 'woda' as SceneId,
    caption: '',
    moving: false,
    duration: 5,
    badge: false,
  }));

export interface Criterion {
  id: string;
  /** Zdanie widoczne w „Zleceniu”, zanim dziecko cokolwiek zrobi. */
  label: string;
  ok: boolean;
  /** Co strona znalazła w pracy dziecka — zawsze konkret, nigdy „coś nie tak”. */
  detail: string;
}

/** Bez ogonków i małymi literami — dziecko pisze „lodyga” równie często jak „łodyga”. */
function plain(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ł/g, 'l');
}

const STOP_WORDS = new Set(
  [
    'i', 'w', 'we', 'na', 'z', 'ze', 'do', 'od', 'sie', 'to', 'jest', 'sa', 'a', 'o', 'po', 'ze',
    'nie', 'juz', 'tak', 'przez', 'dla', 'jak', 'co', 'ale', 'oraz', 'ten', 'ta', 'te', 'tym',
    'jego', 'jej', 'byc', 'bo', 'wiec', 'tu', 'tam', 'gdy', 'kiedy', 'ktory', 'ktora', 'ktore',
  ].map(plain)
);

export function words(text: string): string[] {
  return text.split(/\s+/).filter((word) => /[\p{L}\p{N}]/u.test(word));
}

/** Czy wyraz nazywa którąś z rzeczy widocznych na obrazku (po rdzeniu, nie co do litery). */
function namesVisible(word: string, visible: string[]): boolean {
  const plainWord = plain(word).replace(/[^\p{L}\p{N}]/gu, '');
  return visible.some((name) => {
    const root = plain(name).slice(0, Math.min(5, Math.max(3, plain(name).length - 1)));
    return plainWord.startsWith(root);
  });
}

/** Wyrazy podpisu, które mówią coś więcej niż nazwanie tego, co widać. */
export function extraWords(caption: string, picture: SceneId): string[] {
  const visible = sceneById(picture).visible;
  return words(caption).filter((word) => {
    const bare = plain(word).replace(/[^\p{L}\p{N}]/gu, '');
    if (bare.length < 3) return false;
    if (STOP_WORDS.has(bare)) return false;
    return !namesVisible(word, visible);
  });
}

function list(items: string[]): string {
  return items.map((item) => `„${item}”`).join(', ');
}

export function judgeMaterial(topic: Topic, scenes: StudioScene[]): Criterion[] {
  const withCaption = scenes.filter((scene) => words(scene.caption).length >= MIN_CAPTION_WORDS);
  const tooLong = scenes
    .map((scene, index) => (words(scene.caption).length > MAX_CAPTION_WORDS ? index + 1 : 0))
    .filter(Boolean);
  const onTopic = scenes.filter((scene) => scene.picture === topic.picture).length;
  const offTopic = scenes
    .map((scene, index) => (scene.picture === topic.picture ? 0 : index + 1))
    .filter(Boolean);
  const movingScenes = scenes.filter((scene) => scene.moving);
  const deadMotion = scenes
    .map((scene, index) => (scene.moving && !sceneById(scene.picture).changes ? index + 1 : 0))
    .filter(Boolean);
  const tooFast = scenes
    .map((scene, index) => (scene.moving && scene.duration < MIN_DURATION ? index + 1 : 0))
    .filter(Boolean);
  const doubled = scenes
    .map((scene, index) => (scene.badge && scene.moving ? index + 1 : 0))
    .filter(Boolean);
  const thin = scenes
    .map((scene, index) =>
      words(scene.caption).length >= MIN_CAPTION_WORDS && extraWords(scene.caption, scene.picture).length < 2
        ? index + 1
        : 0
    )
    .filter(Boolean);

  return [
    {
      id: 'podpisy',
      label: `Trzy sceny, a przy każdej podpis — co najmniej ${MIN_CAPTION_WORDS} wyrazy, najwyżej ${MAX_CAPTION_WORDS}.`,
      ok: withCaption.length === SCENE_COUNT && tooLong.length === 0,
      detail:
        withCaption.length < SCENE_COUNT
          ? `Podpis mają ${count(withCaption.length, 'scena', 'sceny', 'scen')} z ${SCENE_COUNT}.`
          : tooLong.length > 0
            ? `Podpis sceny ${tooLong.join(' i ')} jest dłuższy niż ${MAX_CAPTION_WORDS} wyrazów — to już nie podpis, tylko akapit.`
            : 'Każda scena ma swój podpis.',
    },
    {
      id: 'temat',
      label: 'Co najmniej dwie sceny pokazują to, o co pyta twój temat.',
      ok: onTopic >= 2,
      detail:
        onTopic >= 2
          ? `${count(onTopic, 'scena', 'sceny', 'scen')} pokazuje to, o czym jest twoje pytanie.`
          : `Scena ${offTopic.join(', ')} pokazuje co innego niż „${topic.question}”.`,
    },
    {
      id: 'ruch',
      label: 'Co najmniej jedna scena jest animacją — bez ruchu to nie jest materiał multimedialny.',
      ok: movingScenes.length >= 1,
      detail:
        movingScenes.length >= 1
          ? `Ruch jest w ${count(movingScenes.length, 'scenie', 'scenach', 'scenach')}.`
          : 'Wszystkie trzy sceny to nieruchome rysunki.',
    },
    {
      id: 'zywy-ruch',
      label: 'Ruch stoi tylko tam, gdzie naprawdę coś się zmienia.',
      ok: deadMotion.length === 0,
      detail:
        deadMotion.length === 0
          ? 'Każda twoja animacja ma co pokazywać.'
          : `Scena ${deadMotion.join(' i ')} to rysunek, w którym nic się nie zmienia — animacja nie ma tam czego pokazać (sprawdź przewijakiem).`,
    },
    {
      id: 'tempo',
      label: `Ruch trwa co najmniej ${MIN_DURATION} sekundy, żeby dało się go prześledzić.`,
      ok: tooFast.length === 0,
      detail:
        tooFast.length === 0
          ? 'Tempo daje widzowi czas.'
          : `Ruch w scenie ${tooFast.join(' i ')} przelatuje za szybko — widz zobaczy, że coś mignęło.`,
    },
    {
      id: 'jedno-naraz',
      label: 'Na żadnej scenie nie ruszają się dwie rzeczy naraz.',
      ok: doubled.length === 0,
      detail:
        doubled.length === 0
          ? 'Na każdej scenie oko ma jedno miejsce do patrzenia.'
          : `W scenie ${doubled.join(' i ')} miga ramka i jednocześnie idzie animacja — oko będzie skakać, a podpis zostanie nieprzeczytany.`,
    },
    {
      id: 'podpis-mowi',
      label: 'Podpis mówi coś, czego na obrazku nie widać — nie samą nazwę tego, co widać.',
      ok: thin.length === 0 && withCaption.length === SCENE_COUNT,
      detail:
        withCaption.length < SCENE_COUNT
          ? 'Najpierw dopisz brakujące podpisy.'
          : thin.length === 0
            ? scenes
                .map((scene, index) => `scena ${index + 1}: ${list(extraWords(scene.caption, scene.picture).slice(0, 4))}`)
                .join(' · ')
            : `W podpisie sceny ${thin.join(' i ')} są prawie same nazwy tego, co i tak widać. Dopisz, co się z tym dzieje albo dlaczego.`,
    },
  ];
}
