/**
 * L10 blok 4 — szacunek w praktyce. Sędziowie trzech sytuacji, bez Reacta.
 * Werdykt to nie ocena, tylko to, co mówi ustawa o godle, barwach i hymnie
 * RP (tekst jednolity, isap.sejm.gov.pl):
 *  - art. 14 ust. 1 — podczas hymnu powaga i spokój, postawa wyrażająca
 *    szacunek (stoimy), mężczyźni w ubraniach cywilnych zdejmują nakrycia głowy;
 *  - art. 15 — godło i barwy umieszcza się tak, żeby zapewnić im cześć i szacunek;
 *  - art. 16 — symboli nie umieszcza się na towarach na sprzedaż, chyba że
 *    w formie stylizowanej albo artystycznie przetworzonej.
 */

export type Verdict = { ok: true; message: string } | { ok: false; message: string };

export function judgeHymn(s: { standing: boolean; capOff: boolean }): Verdict {
  if (!s.standing)
    return {
      ok: false,
      message:
        'Kuba wciąż siedzi. Ustawa mówi, że podczas hymnu wszyscy obecni stoją w postawie wyrażającej szacunek — nawet na trybunach.',
    };
  if (!s.capOff)
    return {
      ok: false,
      message:
        'Kuba stoi — dobrze. Ale ma na głowie czapkę. Ustawa: mężczyźni i chłopcy w zwykłym ubraniu zdejmują podczas hymnu nakrycie głowy.',
    };
  return {
    ok: true,
    message:
      'Tak mówi ustawa: podczas hymnu powaga i spokój, wszyscy stoją, a mężczyźni w zwykłym ubraniu zdejmują czapki. Żołnierz w mundurze czapki nie zdejmuje — salutuje.',
  };
}

export const FLAG_LIFTED_MESSAGE =
  'Po pochodzie flaga została na trawie. Nikt nie złamał tu żadnego przepisu — ale ustawa mówi, że barwy mają być otoczone czcią i szacunkiem. Podniesienie flagi z ziemi to najprostszy sposób, żeby to zrobić.';

export type ShopBin = 'tak' | 'nie';

export interface ShopItem {
  id: string;
  label: string;
  bin: ShopBin;
  /** Co mówi przepis o tym konkretnym przedmiocie. */
  why: string;
}

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'urzedowy',
    label: 'Koszulka z godłem dokładnie takim jak wzór z ustawy',
    bin: 'nie',
    why: 'To wierne godło, nie stylizacja. Takie godło wisi w urzędzie — na towarze na sprzedaż być nie może.',
  },
  {
    id: 'kreska',
    label: 'Koszulka z orłem narysowanym kilkoma kreskami',
    bin: 'tak',
    why: 'Orzeł jest stylizowany — narysowany po swojemu. Na to przepis pozwala.',
  },
  {
    id: 'klocki',
    label: 'Przypinka z orłem ułożonym z kolorowych klocków',
    bin: 'tak',
    why: 'To artystyczne przetworzenie godła. Wolno je sprzedawać.',
  },
];

export function judgeShop(placed: Partial<Record<string, ShopBin>>): {
  ok: boolean;
  wrong: { id: string; message: string }[];
} {
  const wrong = SHOP_ITEMS.filter((it) => placed[it.id] && placed[it.id] !== it.bin).map((it) => ({
    id: it.id,
    message: it.why,
  }));
  const all = SHOP_ITEMS.every((it) => placed[it.id]);
  return { ok: all && wrong.length === 0, wrong };
}
