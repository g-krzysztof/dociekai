import type { Otwarcie } from './makieta';

/**
 * L18 — adnotacja otwarć pięciu książek Czytelni — cztery z pięciu (teksty: `data/czytelnia/<id>/odc-1.ts`,
 * akapity dzielone pustą linią). „Król Maciuś Pierwszy” celowo nie wszedł: w odc. 1 nie ma
 * czasu akcji (tylko „Dobry wieczór” w kwestii ambasadora i „Już było późno” dopiero w akapicie 44).
 */
export const OTWARCIA: Otwarcie[] = [
  // krasnoludki — zakres: akapity 0–3, czas: „Zima była tak ciężka i długa”
  {
    bookId: 'krasnoludki',
    start: 2,
    frazy: [
      [
        { tekst: 'Zima była tak ciężka i długa', rola: 'lampa', pora: 'zima' },
        { tekst: 'miłościwy Błystek, król Krasnoludków', rola: 'deski', ikona: 'krol' },
        { tekst: 'przymarzł do swojego tronu', rola: 'tasma' },
        { tekst: 'kryształowych ścianach jego skalnej groty', rola: 'tlo', ikona: 'grota' },
        { tekst: 'żwawe krasnoludki', rola: 'deski' },
        { tekst: 'otulali się jak mogli w swoje czerwone opończe', rola: 'tasma' },
      ],
      [
        { tekst: 'król Błystek', rola: 'deski', ikona: 'krol' },
        { tekst: 'nie mógł się odziewać tak ubogo i tak pospolicie', rola: 'narrator' },
        { tekst: 'zimą i latem musiał nosić purpurową szatę', rola: 'tasma' },
        { tekst: 'miała zaledwie grubość makowego listka', rola: 'narrator' },
      ],
      [
        { tekst: 'królisko', rola: 'deski', ikona: 'krol' },
        { tekst: 'chuchając w ręce', rola: 'tasma' },
      ],
      [
        { tekst: 'W kryształowym pałacu', rola: 'tlo', ikona: 'zamek' },
        { tekst: 'wiadomo', rola: 'narrator' },
        { tekst: 'Jakże?!', rola: 'narrator' },
        { tekst: 'Jeszcze by wszystko potrzaskało', rola: 'narrator' },
      ],
    ],
  },
  // ksiega-dzungli — zakres: akapity 0–4, czas: „Skwarny to był wieczór”
  {
    bookId: 'ksiega-dzungli',
    start: 5,
    frazy: [
      [
        { tekst: 'Skwarny to był wieczór', rola: 'lampa', pora: 'wieczor' },
        { tekst: 'wilk-ojciec', rola: 'deski', ikona: 'wilk' },
        { tekst: 'w jaskini na płaskowzgórzu Seeonee położonej', rola: 'tlo', ikona: 'grota' },
        { tekst: 'przebudził się', rola: 'tasma' },
        { tekst: 'zaczął przeciągać powoli, z namysłem łapy', rola: 'tasma' },
        { tekst: 'Matka-wilczyca', rola: 'deski', ikona: 'wilk' },
        { tekst: 'czeredę czworga wilcząt', rola: 'deski', ikona: 'wilk' },
      ],
      [{ tekst: 'mruknął wilk', rola: 'deski', ikona: 'wilk' }],
      [
        { tekst: 'ruszyć na łowy', rola: 'tasma' },
        { tekst: 'w wejściu zjawił się cień', rola: 'tasma' },
        { tekst: 'jakowegoś małego stworzenia o puszystym ogonie', rola: 'deski', ikona: 'zwierze' },
      ],
      [],
      [
        { tekst: 'szakal, zwany Tabaki-pieczeniarz', rola: 'deski', ikona: 'zwierze' },
        { tekst: 'Marną ową stworą', rola: 'narrator' },
        { tekst: 'dżungli Hindostanu', rola: 'tlo', ikona: 'las' },
        { tekst: 'natrętny gałgan', rola: 'narrator' },
        { tekst: 'wywołuje intrygi, plotkuje', rola: 'narrator' },
      ],
    ],
  },
  // dwoch-takich — zakres: akapity 0–3, czas: „sto trzy lata temu”
  {
    bookId: 'dwoch-takich',
    start: 2,
    frazy: [
      [
        { tekst: 'bardzo stare miasto', rola: 'tlo', ikona: 'miasto' },
        { tekst: 'wśród czterech drzew, nad bystrym potokiem', rola: 'tlo', ikona: 'woda' },
        { tekst: 'Musiało ono być stare', rola: 'narrator' },
        { tekst: 'Jest to nazwa skromna', rola: 'narrator' },
        { tekst: 'ludzie, dobrzy i poczciwi', rola: 'deski', ikona: 'czlowiek' },
        { tekst: 'Chwalili Pana Boga i wiedli pracowity żywot', rola: 'tasma' },
        { tekst: 'król, mieszkający daleko we wspaniałej stolicy', rola: 'deski', ikona: 'krol' },
        { tekst: 'raz na rok zapytywał', rola: 'tasma' },
      ],
      [],
      [
        { tekst: 'burmistrz', rola: 'deski', ikona: 'czlowiek' },
        { tekst: 'król się przyjemnie uśmiechał i dalej rządził', rola: 'tasma' },
      ],
      [
        { tekst: 'Zapiecku', rola: 'tlo', ikona: 'miasto' },
        { tekst: 'biednym', rola: 'narrator' },
        { tekst: 'Ja też byłbym o tym mieście nic nie wiedział', rola: 'narrator' },
        { tekst: 'sto trzy lata temu', rola: 'lampa', pora: 'dawno' },
        { tekst: 'kiedy wędrowałem po świecie', rola: 'narrator' },
        { tekst: 'zajechałem przypadkiem do tego miasta', rola: 'tasma' },
        { tekst: 'mojego konia', rola: 'deski', ikona: 'kon' },
      ],
    ],
  },
  // zlota-kaczka — zakres: akapity 0–16, czas: „Wieczór spadł na gwarną Warszawę…” (daleko — blok 3 każe czytać dalej; „W noc świętojańską” to słowa szewca w dialogu, nie czas akcji)
  {
    bookId: 'zlota-kaczka',
    start: 2,
    frazy: [
      [
        { tekst: 'szewczyk warszawski', rola: 'deski', ikona: 'dziecko' },
        { tekst: 'Dobre było chłopczysko, wesołe, pracowite, ale biedne', rola: 'narrator' },
        { tekst: 'jak ta mysz kościelna', rola: 'narrator' },
        { tekst: 'Pracował ci on u majstra jednego', rola: 'tasma' },
        { tekst: 'na Starym Mieście', rola: 'tlo', ikona: 'miasto' },
        { tekst: 'Majster', rola: 'deski', ikona: 'czlowiek' },
        { tekst: 'grosz zbierał do grosza', rola: 'tasma' },
        { tekst: 'a u chłopaka bieda, aż piszczy', rola: 'narrator' },
      ],
      [
        { tekst: 'Niby to mu tam pożywienie dawał', rola: 'tasma' },
        { tekst: 'Boże, zmiłuj się', rola: 'narrator' },
        { tekst: 'Lutka', rola: 'deski', ikona: 'dziecko' },
        { tekst: 'a cóż dopiero człowiek', rola: 'narrator' },
      ],
      [
        { tekst: 'Co to lepiej!', rola: 'narrator' },
        { tekst: 'wciąż nędza i nędza', rola: 'narrator' },
      ],
      [
        { tekst: 'Znudziło mu się', rola: 'narrator' },
        { tekst: 'Uciec chce', rola: 'tasma' },
      ],
      [
        { tekst: 'No nic!', rola: 'narrator' },
        { tekst: 'cierpi jeszcze, czeka', rola: 'tasma' },
      ],
      [
        { tekst: 'Aż ci tu kiedyś na wieczorynkę poszedł', rola: 'tasma' },
        { tekst: 'czeladnika jednego', rola: 'deski', ikona: 'czlowiek' },
        { tekst: 'Wieczorynka aż miło!', rola: 'narrator' },
        { tekst: 'Jedzą, piją, gawędzą', rola: 'tasma' },
      ],
      [{ tekst: 'jeden stary szewc, kuternoga', rola: 'deski', ikona: 'czlowiek' }],
      [{ tekst: 'w Warszawie', rola: 'tlo', ikona: 'miasto' }],
      [
        { tekst: 'Zaciekawił się', rola: 'narrator' },
        { tekst: 'Lutek', rola: 'deski', ikona: 'dziecko' },
        { tekst: 'pyta', rola: 'tasma' },
      ],
      [],
      [
        { tekst: 'kuternoga', rola: 'deski', ikona: 'czlowiek' },
        { tekst: 'w podziemiach starego zamku', rola: 'tlo', ikona: 'zamek' },
        { tekst: 'królewna taka, zaklęta w złotą kaczkę', rola: 'deski', ikona: 'kaczka' },
      ],
      [],
      [{ tekst: 'w lochach starego zamczyska', rola: 'tlo', ikona: 'zamek' }],
      [],
      [],
      [
        { tekst: 'Zapamiętał to sobie nasz Lutek', rola: 'tasma' },
      ],
      [
        { tekst: 'Wieczór spadł na gwarną Warszawę, gwiaździsty, ciepły, czerwcowy', rola: 'lampa', pora: 'wieczor' },
        { tekst: 'Na ulicy ludzi jak mrowia', rola: 'narrator' },
        { tekst: 'Panienki takie śliczne spacerują', rola: 'deski', ikona: 'czlowiek' },
      ],
    ],
  },
];
