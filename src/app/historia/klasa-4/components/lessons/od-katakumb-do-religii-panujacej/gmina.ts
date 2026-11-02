/**
 * Blok 2 — **Dlaczego się przyłączyli?** Pięć wymyślonych osób (takich ludzi
 * w pierwszych gminach było wielu — o niewolnikach, wdowach i bogatych
 * kobietach w gminach mówią listy Pawła i Dzieje Apostolskie) mówi o sobie
 * trzy zdania. Tylko jedno z nich mówi, co przyciągnęło tę osobę do gminy —
 * sędzią jest treść zdania, nie klucz autora: pozostałe opisują życie poza
 * gminą albo to, co osoba robi, a nie dlaczego przychodzi.
 */

export type ReasonId = 'rownosc' | 'pomoc' | 'wspolnota' | 'nadzieja';

export const REASONS: Record<ReasonId, string> = {
  rownosc: 'wszyscy są równi wobec Boga',
  pomoc: 'gmina pomaga ubogim',
  wspolnota: 'gmina jest jak rodzina',
  nadzieja: 'nadzieja na życie po śmierci',
};

export interface Sentence {
  id: string;
  text: string;
  /** Zdanie mówi o tym, co przyciągnęło — i co to jest. */
  reason?: ReasonId;
  /** Gdy to nie jest powód — co to zdanie mówi naprawdę. */
  whyNot?: string;
}

export interface Person {
  id: string;
  name: string;
  who: string;
  sentences: readonly Sentence[];
}

export const PEOPLE: readonly Person[] = [
  {
    id: 'feliks',
    name: 'Feliks',
    who: 'niewolnik w domu kupca',
    sentences: [
      { id: 'f1', text: 'Od świtu do nocy noszę towary mojego pana i nie mam nic swojego.', whyNot: 'To zdanie mówi, jak Feliksowi żyje się u pana — nie, co znalazł w gminie.' },
      {
        id: 'f2',
        text: 'Tutaj nikt nie pyta, czyj jestem: słyszę, że przed Bogiem niewolnik znaczy tyle samo co jego pan.',
        reason: 'rownosc',
      },
      { id: 'f3', text: 'Przychodzę wieczorem, kiedy pan już śpi.', whyNot: 'To zdanie mówi, kiedy Feliks przychodzi — nie, dlaczego.' },
    ],
  },
  {
    id: 'tercja',
    name: 'Tercja',
    who: 'uboga wdowa',
    sentences: [
      { id: 't1', text: 'Mój mąż umarł zimą i zostałam sama z dwójką dzieci.', whyNot: 'To zdanie mówi, co spotkało Tercję — jeszcze nie, co dała jej gmina.' },
      { id: 't2', text: 'Przędę wełnę, ale to za mało, żeby kupić chleb na cały tydzień.', whyNot: 'To zdanie mówi, z czego Tercja żyje.' },
      {
        id: 't3',
        text: 'Bracia i siostry z gminy składają się na wspólny koszyk i co tydzień dostaję z niego chleb i oliwę.',
        reason: 'pomoc',
      },
    ],
  },
  {
    id: 'lukios',
    name: 'Lukios',
    who: 'garncarz, przybysz z Efezu',
    sentences: [
      {
        id: 'l1',
        text: 'Przypłynąłem do Rzymu za pracą i nikogo tu nie znałem.',
        whyNot: 'To zdanie mówi, skąd Lukios się wziął — a co znalazł w gminie?',
      },
      {
        id: 'l2',
        text: 'W gminie od pierwszego wieczoru mówią do mnie „bracie”, jemy przy jednym stole i pytają, jak mi minął dzień.',
        reason: 'wspolnota',
      },
      { id: 'l3', text: 'Mój warsztat stoi przy porcie, blisko magazynów.', whyNot: 'To zdanie mówi, gdzie Lukios pracuje.' },
    ],
  },
  {
    id: 'marek',
    name: 'Marek',
    who: 'żołnierz, weteran legionu',
    sentences: [
      { id: 'm1', text: 'Przez dwadzieścia lat służyłem w legionie nad Dunajem.', whyNot: 'To zdanie mówi o służbie Marka.' },
      {
        id: 'm2',
        text: 'Widziałem, jak umierali moi towarzysze, i bałem się, że po śmierci nie ma już nic.',
        whyNot: 'To zdanie mówi, czego Marek się bał. A co usłyszał w gminie?',
      },
      {
        id: 'm3',
        text: 'Tutaj usłyszałem, że śmierć nie jest końcem — że kto wierzy, będzie żył na zawsze.',
        reason: 'nadzieja',
      },
    ],
  },
  {
    id: 'kornelia',
    name: 'Kornelia',
    who: 'bogata patrycjuszka',
    sentences: [
      { id: 'k1', text: 'Mam dom na Palatynie i dwudziestu niewolników.', whyNot: 'To zdanie mówi, jak bogata jest Kornelia.' },
      {
        id: 'k2',
        text: 'W gminie siedzę przy jednym stole z moją niewolnicą — i usłyszałam, że Bóg kocha nas obie tak samo.',
        reason: 'rownosc',
      },
      { id: 'k3', text: 'Moja rodzina nie wie, dokąd chodzę w niedzielę rano.', whyNot: 'To zdanie mówi, że Kornelia ukrywa swoje wizyty — nie, co ją przyciąga.' },
    ],
  },
];

export type SentenceVerdict = { ok: true; reason: ReasonId } | { ok: false; message: string };

export function judgeSentence(personId: string, sentenceId: string): SentenceVerdict {
  const p = PEOPLE.find((x) => x.id === personId);
  const s = p?.sentences.find((x) => x.id === sentenceId);
  if (!p || !s) return { ok: false, message: 'Nie ma takiego zdania.' };
  if (s.reason) return { ok: true, reason: s.reason };
  return { ok: false, message: s.whyNot ?? 'To zdanie nie mówi, co przyciągnęło tę osobę.' };
}

/** Ile osób przyszło z każdego powodu — w kolejności REASONS. */
export function tally(found: Record<string, ReasonId>): { id: ReasonId; label: string; who: string[] }[] {
  return (Object.keys(REASONS) as ReasonId[]).map((id) => ({
    id,
    label: REASONS[id],
    who: PEOPLE.filter((p) => found[p.id] === id).map((p) => p.name),
  }));
}
