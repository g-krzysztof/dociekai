/**
 * Blok 2 — „Kości smoka” (śledztwo) — dane i sędzia, bez Reacta.
 *
 * Przy wejściu do katedry na Wawelu od średniowiecza wiszą na łańcuchach
 * ogromne kości — mówiono, że smocze. To kość mamuta, żebro wieloryba
 * i czaszka nosorożca włochatego (Pakiet edukacyjny „Kraków Nieodkryty”,
 * plikimpi.krakow.pl; Radio Kraków „Czy istniały smoki”; zdjęcie: Wikimedia
 * Commons, „Bone of Wawel Dragon.JPG”, Yohan euan o4, CC BY-SA 3.0).
 *
 * Dziecko przykłada kość do zwierzęcia. **Sędzia nie zna „właściwego
 * zwierzęcia”** — porównuje kość z tym, co zwierzę ma w szkielecie: czy ma
 * taką kość w ogóle (wieloryb nie ma nóg), czy kształt się zgadza (garb na
 * nosie = róg) i czy długość mieści się w ±25%. Długości są przybliżone,
 * zaokrąglone do pokazania różnicy rzędu wielkości, nie do pomiaru.
 */

export type BoneKind = 'noga' | 'zebro' | 'czaszka';

export interface Bone {
  id: BoneKind;
  name: string;
  /** Jak wygląda — to dziecko widzi na tacy. */
  looks: string;
  lengthM: number;
  /** Czaszka z garbem na nosie — tam rósł róg. */
  noseHorn?: boolean;
}

export interface AnimalBone {
  lengthM: number;
  noseHorn?: boolean;
}

export interface Animal {
  id: string;
  name: string;
  /** Kiedy żył / żyje — puenta „ludzie ich nie znali”. */
  when: string;
  bones: Partial<Record<BoneKind, AnimalBone>>;
}

export const BONES: Bone[] = [
  { id: 'zebro', name: 'długa wygięta kość', looks: 'jak łuk, dłuższa niż dorosły człowiek', lengthM: 2 },
  { id: 'noga', name: 'gruba prosta kość', looks: 'z kulą na końcu, jak kość nogi', lengthM: 1.1 },
  { id: 'czaszka', name: 'czaszka z garbem', looks: 'nad nosem chropowaty garb', lengthM: 0.8, noseHorn: true },
];

export const ANIMALS: Animal[] = [
  {
    id: 'kon',
    name: 'koń',
    when: 'żyje dziś',
    bones: { noga: { lengthM: 0.45 }, zebro: { lengthM: 0.7 }, czaszka: { lengthM: 0.6 } },
  },
  {
    id: 'mamut',
    name: 'mamut',
    when: 'wymarł tysiące lat temu',
    bones: { noga: { lengthM: 1.1 }, zebro: { lengthM: 1 }, czaszka: { lengthM: 1 } },
  },
  {
    id: 'krowa',
    name: 'krowa',
    when: 'żyje dziś',
    bones: { noga: { lengthM: 0.4 }, zebro: { lengthM: 0.6 }, czaszka: { lengthM: 0.5 } },
  },
  {
    id: 'nosorozec',
    name: 'nosorożec włochaty',
    when: 'wymarł ok. 14 tysięcy lat temu',
    bones: { noga: { lengthM: 0.6 }, zebro: { lengthM: 0.7 }, czaszka: { lengthM: 0.8, noseHorn: true } },
  },
  {
    id: 'wieloryb',
    name: 'wieloryb',
    when: 'żyje w morzach',
    bones: { zebro: { lengthM: 2.2 }, czaszka: { lengthM: 3 } },
  },
];

export const LENGTH_TOLERANCE = 0.25;

export const formatM = (m: number) => `${String(m).replace('.', ',')} m`;

export type FitVerdict =
  | { ok: true }
  | { ok: false; kind: 'brak-kosci' | 'ksztalt' | 'dlugosc'; why: string };

/** Czy kość pasuje do zwierzęcia — z jego szkieletu, nie z klucza autora. */
export function judgeFit(bone: Bone, animal: Animal): FitVerdict {
  const slot = animal.bones[bone.id];
  if (!slot) {
    return {
      ok: false,
      kind: 'brak-kosci',
      why: `${cap(animal.name)} nie ma nóg — w jego szkielecie nie ma takiej kości.`,
    };
  }
  if (Boolean(bone.noseHorn) !== Boolean(slot.noseHorn)) {
    return {
      ok: false,
      kind: 'ksztalt',
      why: bone.noseHorn
        ? `Ta czaszka ma garb nad nosem — tam rósł róg. ${cap(animal.name)} nie ma rogu na nosie.`
        : `${cap(animal.name)} ma róg na nosie, a ta czaszka nie ma po nim śladu.`,
    };
  }
  const ratio = bone.lengthM / slot.lengthM;
  if (Math.abs(ratio - 1) > LENGTH_TOLERANCE) {
    const times = ratio > 1 ? ratio : 1 / ratio;
    const howMuch =
      times >= 3 ? 'ponad trzy razy' : times >= 2 ? 'ponad dwa razy' : times >= 1.5 ? 'półtora raza' : 'wyraźnie';
    return {
      ok: false,
      kind: 'dlugosc',
      why: `Ta kość ma ok. ${formatM(bone.lengthM)}, a taka sama kość u zwierzęcia „${animal.name}” — ok. ${formatM(slot.lengthM)}. Jest ${howMuch} ${ratio > 1 ? 'za duża' : 'za mała'}.`,
    };
  }
  return { ok: true };
}

/** Dla każdej kości — zwierzęta, do których pasuje (selftest: dokładnie jedno). */
export function fittingAnimals(bone: Bone): string[] {
  return ANIMALS.filter((a) => judgeFit(bone, a).ok).map((a) => a.id);
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
