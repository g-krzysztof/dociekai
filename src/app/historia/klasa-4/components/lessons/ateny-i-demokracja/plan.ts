/**
 * Czysta logika bloku 3 — **Dzień Ateńczyka**. Plan Aten jest schematem (położenie
 * agory, Pnyksu, Akropolu i teatru względem siebie — jak na planach z wykopalisk,
 * bez skali). Co wolno było córce obywatela: kobiety nie wchodziły na zgromadzenie
 * ani do sądów; dziewczęta z rodzin obywateli niosły kosze w procesji Panatenajów
 * (kanefory); po wodę do fontann chodziły kobiety i niewolnice; czy kobiety bywały
 * w teatrze — historycy się spierają (S. Blundell, „Women in Ancient Greece”, 1995).
 */
export type Role = 'kallias' | 'kleo';
export type PlaceId = 'dom' | 'fontanna' | 'agora' | 'sad' | 'pnyks' | 'akropol' | 'teatr';
export type Access = 'ok' | 'zakaz' | 'sporne';

export const PLAN_W = 420;
export const PLAN_H = 300;

export const PLACES: { id: PlaceId; name: string; x: number; y: number; r: number }[] = [
  { id: 'dom', name: 'dom Kalliasa', x: 62, y: 62, r: 24 },
  { id: 'fontanna', name: 'fontanna', x: 168, y: 46, r: 18 },
  { id: 'agora', name: 'agora', x: 190, y: 112, r: 32 },
  { id: 'sad', name: 'sąd', x: 132, y: 128, r: 16 },
  { id: 'pnyks', name: 'Pnyks', x: 92, y: 212, r: 28 },
  { id: 'akropol', name: 'Akropol', x: 282, y: 170, r: 38 },
  { id: 'teatr', name: 'teatr', x: 318, y: 246, r: 20 },
];

export const START: Record<Role, { x: number; y: number }> = {
  kallias: { x: 62, y: 62 },
  kleo: { x: 62, y: 62 },
};

const TEXT: Record<Role, Record<PlaceId, { access: Access; text: string }>> = {
  kallias: {
    dom: { access: 'ok', text: 'Dom: Kallias wychodzi rano, żona i córka zostają przy krosnach.' },
    fontanna: { access: 'ok', text: 'Fontanna: po wodę chodzą kobiety i niewolnicy — Kallias tylko przechodzi obok.' },
    agora: { access: 'ok', text: 'Agora: targ, kantory, rozmowy o polityce. Kallias kupuje ryby i słucha nowin z Pireusu.' },
    sad: { access: 'ok', text: 'Sąd: dziś losowanie wybrało Kalliasa na sędziego — dostanie za to zapłatę.' },
    pnyks: { access: 'ok', text: 'Pnyks: zgromadzenie. Kallias może zabrać głos i głosuje podniesieniem ręki.' },
    akropol: { access: 'ok', text: 'Akropol: Partenon, a w nim ogromny posąg Ateny ze złota i kości słoniowej, dzieło Fidiasza.' },
    teatr: { access: 'ok', text: 'Teatr: na święto Dionizosa całe miasto ogląda tragedie i komedie.' },
  },
  kleo: {
    dom: { access: 'ok', text: 'Dom: tu Kleo spędza większość dnia — przędzie wełnę i tka z matką. Do szkoły nie chodzi, w szkole są tylko chłopcy.' },
    fontanna: { access: 'ok', text: 'Fontanna: po wodę chodzą kobiety i niewolnice. Jedno z niewielu miejsc, gdzie Kleo spotka koleżanki.' },
    agora: { access: 'ok', text: 'Agora: Kleo może tu przyjść tylko z kimś dorosłym i rzadko — zakupy robi ojciec albo niewolnik. Uboższe kobiety same sprzedawały tu chleb i wstążki.' },
    sad: { access: 'zakaz', text: 'Sąd: sędziami są tylko obywatele. Kobieta nie może nawet sama wystąpić w swojej sprawie — mówi za nią mężczyzna.' },
    pnyks: { access: 'zakaz', text: 'Pnyks: zgromadzenie jest tylko dla obywateli. Kleo tu nie wejdzie — nigdy, nawet jako dorosła.' },
    akropol: { access: 'ok', text: 'Akropol: w święto Panatenajów dziewczęta z rodzin obywateli niosą na czele procesji kosze z darami dla Ateny. Dziś Kleo idzie z przodu!' },
    teatr: { access: 'sporne', text: 'Teatr: czy kobiety oglądały przedstawienia? Historycy się spierają — źródła mówią o tym niejasno.' },
  },
};

export function visit(role: Role, place: PlaceId) {
  return TEXT[role][place];
}

export function placeAt(x: number, y: number): PlaceId | null {
  const p = PLACES.find((q) => Math.hypot(q.x - x, q.y - y) <= q.r);
  return p ? p.id : null;
}

export const KALLIAS_GOAL: PlaceId[] = ['agora', 'pnyks', 'akropol'];

export function roleDone(role: Role, visited: readonly PlaceId[], refused: readonly PlaceId[]) {
  if (role === 'kallias') return KALLIAS_GOAL.every((p) => visited.includes(p));
  return refused.length >= 1 && visited.filter((p) => TEXT.kleo[p].access === 'ok').length >= 3;
}
