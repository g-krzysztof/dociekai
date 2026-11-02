import { KETTLE_WH, formatKettles, formatWh, hour, standbyOf } from './energy';

/**
 * Werdykt zadania z programatorami — czysty moduł, bez Reacta.
 *
 * Model jest mały i jawny, tak jak w prawdziwym programatorze mechanicznym:
 * tarcza doby ma bolce, a wciśnięty bolec znaczy „w tej chwili płynie prąd”.
 * Prawdziwe programatory mają zwykle bolec na kwadrans; tu bolec to pół godziny,
 * żeby dało się w niego trafić palcem na telefonie.
 *
 * Każde gniazdko ma dwie rzeczy: **kiedy ktoś z niego korzysta** (plan dnia
 * rodziny) i **ile bierze, kiedy nikt nie korzysta** (czuwanie — te same waty,
 * co w bloku 3). Prąd w pół godziny, w której nikt nie korzysta, to prąd
 * zmarnowany; brak prądu w pół godziny, w której ktoś korzysta, to skarga.
 */

export const SLOTS = 48;
export const SLOT_MIN = 1440 / SLOTS;

export type SocketId = 'salon' | 'pokoj' | 'przedpokoj' | 'kuchnia';

export interface UseEvent {
  label: string;
  /** Minuty od północy; `to` może wyjść poza dobę (nagrywanie po północy). */
  from: number;
  to: number;
}

export interface Socket {
  id: SocketId;
  name: string;
  devices: string;
  /** Ile bierze wszystko w tym gniazdku, kiedy nikt z niczego nie korzysta, W. */
  standby: number;
  /** Korzystanie widoczne na tarczy (wewnętrzny łuk). */
  events: UseEvent[];
  /** Korzystanie, o którym mówi tylko plan dnia — na tarczy go nie ma. */
  hidden?: UseEvent[];
  notes: string[];
}

export const SOCKETS: Socket[] = [
  {
    id: 'salon',
    name: 'Salon',
    devices: 'telewizor, dekoder, konsola, głośnik',
    standby: standbyOf(['telewizor', 'dekoder', 'konsola', 'soundbar']),
    events: [
      { label: 'Tata ogląda wiadomości', from: 420, to: 450 },
      { label: 'Ola gra na konsoli', from: 960, to: 1020 },
      { label: 'Cała rodzina ogląda film', from: 1140, to: 1260 },
    ],
    hidden: [{ label: 'Dekoder nagrywa mecz', from: 1380, to: 1500 }],
    notes: [
      'Tata ogląda wiadomości od 7:00 do 7:30.',
      'Ola gra na konsoli od 16:00 do 17:00.',
      'Wieczorem cała rodzina ogląda film od 19:00 do 21:00.',
      'Tata ustawił w dekoderze nagrywanie meczu: dziś w nocy, od 23:00 do 1:00.',
    ],
  },
  {
    id: 'pokoj',
    name: 'Pokój Oli',
    devices: 'komputer, monitor, głośniki',
    standby: standbyOf(['komputer', 'monitor', 'glosniki']),
    events: [{ label: 'Ola odrabia lekcje przy komputerze', from: 900, to: 1080 }],
    notes: ['Ola odrabia lekcje przy komputerze od 15:00 do 18:00.'],
  },
  {
    id: 'przedpokoj',
    name: 'Przedpokój',
    devices: 'router Wi-Fi',
    standby: standbyOf(['router']),
    events: [{ label: 'Ktoś korzysta z internetu', from: 360, to: 1350 }],
    notes: ['Rodzina ustaliła: internet działa od 6:00 do 22:30. W nocy nikt z niego nie korzysta.'],
  },
  {
    id: 'kuchnia',
    name: 'Kuchnia',
    devices: 'lodówka',
    // Lodówka nigdy nie czuwa — kiedy ma prąd, to chłodzi, więc nic tu nie jest zmarnowane.
    standby: 0,
    events: [{ label: 'Lodówka chłodzi', from: 0, to: 1440 }],
    notes: ['Lodówka chłodzi cały czas — w dzień i w nocy.'],
  },
];

export interface TimerState {
  /** `always` — programator wyłączony, prąd płynie całą dobę (tak jak w domu bez programatorów). */
  mode: 'always' | 'timer';
  pins: boolean[];
}

export type Timers = Record<SocketId, TimerState>;

export const freshTimers = (): Timers =>
  Object.fromEntries(SOCKETS.map((socket) => [socket.id, { mode: 'always', pins: Array(SLOTS).fill(false) }])) as Timers;

/** Pół godziny, w których wypada dane korzystanie (z zawinięciem przez północ). */
export function slotsOf(event: UseEvent): number[] {
  const out: number[] = [];
  for (let minute = event.from; minute < event.to; minute += SLOT_MIN) {
    const slot = Math.floor((minute % 1440) / SLOT_MIN);
    if (!out.includes(slot)) out.push(slot);
  }
  return out;
}

export function needOf(socket: Socket): boolean[] {
  const need = Array(SLOTS).fill(false);
  [...socket.events, ...(socket.hidden ?? [])].forEach((event) => slotsOf(event).forEach((slot) => (need[slot] = true)));
  return need;
}

const NEED: Record<SocketId, boolean[]> = Object.fromEntries(SOCKETS.map((socket) => [socket.id, needOf(socket)])) as Record<
  SocketId,
  boolean[]
>;

export const isNeeded = (id: SocketId, slot: number) => NEED[id][slot];
export const powered = (state: TimerState, slot: number) => state.mode === 'always' || state.pins[slot];

/** Prąd zmarnowany w gniazdku przez dobę, Wh. */
export function wasteOf(socket: Socket, state: TimerState): number {
  let wh = 0;
  for (let slot = 0; slot < SLOTS; slot += 1) {
    if (powered(state, slot) && !NEED[socket.id][slot]) wh += (socket.standby * SLOT_MIN) / 60;
  }
  return wh;
}

export const totalWaste = (timers: Timers) => SOCKETS.reduce((acc, socket) => acc + wasteOf(socket, timers[socket.id]), 0);

/** Tyle marnuje dom bez żadnego programatora — punkt wyjścia zadania. */
export const BASELINE_WH = totalWaste(freshTimers());
export const TARGET_WH = KETTLE_WH;

/** Najdłuższy ciąg pół godzin spełniających warunek, liczony po kole doby. */
export function longestRun(flags: boolean[]): { start: number; length: number } | null {
  if (flags.every(Boolean)) return { start: 0, length: flags.length };
  let best: { start: number; length: number } | null = null;
  // Zaczynamy tuż za pierwszym „nie”, żeby ciąg przechodzący przez północ nie rozpadł się na dwa.
  const offset = flags.findIndex((flag) => !flag) + 1;
  let runStart = -1;
  for (let k = 0; k < flags.length; k += 1) {
    const slot = (offset + k) % flags.length;
    if (flags[slot]) {
      if (runStart < 0) runStart = k;
      const length = k - runStart + 1;
      if (!best || length > best.length) best = { start: (offset + runStart) % flags.length, length };
    } else {
      runStart = -1;
    }
  }
  return best;
}

const span = (run: { start: number; length: number }) =>
  `od ${hour(run.start * SLOT_MIN)} do ${hour((run.start + run.length) * SLOT_MIN)}`;

export interface Criterion {
  id: string;
  label: string;
  ok: boolean;
  detail: string;
}

const socketById = (id: SocketId) => SOCKETS.find((socket) => socket.id === id)!;

/** Pierwsza pół godziny wydarzenia bez prądu, albo `null`, gdy prąd jest przez całe wydarzenie. */
function firstDark(state: TimerState, event: UseEvent): number | null {
  const slot = slotsOf(event).find((item) => !powered(state, item));
  return slot === undefined ? null : slot;
}

export function judgeTimers(timers: Timers): Criterion[] {
  const salon = socketById('salon');
  const room = socketById('pokoj');

  // 1. Rodzina ma prąd wtedy, kiedy z czegoś korzysta.
  const family = [
    ...salon.events.map((event) => ({ socket: salon, event })),
    ...room.events.map((event) => ({ socket: room, event })),
  ];
  const dark = family
    .map(({ socket, event }) => ({ socket, event, slot: firstDark(timers[socket.id], event) }))
    .find((item) => item.slot !== null);

  // 2. Lodówka ma prąd całą dobę.
  const fridge = timers.kuchnia;
  const fridgeGap = longestRun(Array.from({ length: SLOTS }, (_, slot) => !powered(fridge, slot)));

  // 3. Nagrywanie meczu.
  const record = salon.hidden![0];
  const recordDark = firstDark(timers.salon, record);

  // 4. Internet od 6:00 do 22:30.
  const net = socketById('przedpokoj').events[0];
  const netDark = firstDark(timers.przedpokoj, net);

  // 5. Czuwanie najwyżej jeden czajnik.
  const waste = totalWaste(timers);
  const worst = SOCKETS.map((socket) => {
    const run = longestRun(
      Array.from({ length: SLOTS }, (_, slot) => powered(timers[socket.id], slot) && !NEED[socket.id][slot])
    );
    return { socket, run, wh: run ? (run.length * SLOT_MIN * socket.standby) / 60 : 0 };
  }).sort((a, b) => b.wh - a.wh)[0];

  return [
    {
      id: 'rodzina',
      label: 'Rodzina ma prąd zawsze wtedy, kiedy z czegoś korzysta — w salonie i w pokoju Oli.',
      ok: !dark,
      detail: dark
        ? `${dark.event.label} od ${hour(dark.event.from)} — a o ${hour(dark.slot! * SLOT_MIN)} w gniazdku „${dark.socket.name}” nie ma prądu.`
        : 'Wiadomości, konsola, film i lekcje — każda z tych chwil ma prąd od początku do końca.',
    },
    {
      id: 'lodowka',
      label: 'Lodówka ma prąd przez całą dobę.',
      ok: !fridgeGap,
      detail: fridgeGap
        ? `${span(fridgeGap)[0].toUpperCase()}${span(fridgeGap).slice(1)} lodówka stoi bez prądu — rano jedzenie jest ciepłe.`
        : 'Kuchnia ma prąd bez przerwy.',
    },
    {
      id: 'nagranie',
      label: 'Dekoder nagra mecz, który tata ustawił na dzisiejszą noc.',
      ok: recordDark === null,
      detail:
        recordDark !== null
          ? `O ${hour(recordDark * SLOT_MIN)} dekoder miał nagrywać mecz, a w salonie nie ma prądu — rano nagrania nie będzie.`
          : `Salon ma prąd od ${hour(record.from)} do ${hour(record.to)} — mecz się nagra.`,
    },
    {
      id: 'internet',
      label: 'Internet działa od 6:00 do 22:30, tak jak ustaliła rodzina.',
      ok: netDark === null,
      detail:
        netDark !== null
          ? `O ${hour(netDark * SLOT_MIN)} ktoś chce skorzystać z internetu, a router nie ma prądu.`
          : 'Router ma prąd przez cały czas, kiedy rodzina go potrzebuje.',
    },
    {
      id: 'marnowanie',
      label: `Na czuwanie idzie najwyżej jeden czajnik prądu na dobę (${formatWh(TARGET_WH)}). Bez programatorów idzie ponad ${Math.floor(BASELINE_WH / KETTLE_WH)}.`,
      ok: waste <= TARGET_WH,
      detail:
        waste <= TARGET_WH
          ? `Zmarnowane: ${formatWh(waste)} (${formatKettles(waste)}) zamiast ${formatWh(BASELINE_WH)}.`
          : `Zmarnowane: ${formatWh(waste)} — ${formatKettles(waste)}. Najwięcej w gniazdku „${worst.socket.name}”: ${
              worst.run ? span(worst.run) : ''
            } płynie tam prąd, choć nikt z niczego nie korzysta.`,
    },
  ];
}
