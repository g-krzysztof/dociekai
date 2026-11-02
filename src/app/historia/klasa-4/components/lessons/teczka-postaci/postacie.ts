/**
 * L31 — Teczka postaci. Cztery postaci ze starożytności, każda z teczką
 * kart źródłowych: starożytnych i współczesnych, celowo niezgodnych
 * w ocenach. Każda karta to omówienie własnymi słowami (nie cytat
 * z przekładu), z „paszportem”: kto, kiedy, po co.
 *
 * Każde zdanie karty jest albo **do sprawdzenia** (`fakt` — kto, co, kiedy,
 * gdzie), albo **czyimś zdaniem** (`zdanie` — ocena autora; `cue` to słowo,
 * które ją zdradza). `lean` mówi, w którą stronę zdanie przechyla ocenę
 * postaci (−1 szkodził, 0 obojętne, +1 pomagał) — używa go tylko sędzia
 * kontrargumentu w bloku 3.
 *
 * Źródła faktów: Plutarch (Antoniusz 27, Perykles 12–13), Horacy (Pieśni
 * I 37), Kasjusz Dion (XLII–LI), papirus berliński P. 25239 (33 p.n.e.),
 * Tukidydes (II 65), Arystoteles (Ustrój polityczny Aten 26–27), Euzebiusz
 * (Życie Konstantyna), Zosimos (Nowa historia II), Ammian Marcellin
 * (XXI 10), Laktancjusz (O śmierci prześladowców 48); Encyclopaedia
 * Britannica, hasła o każdej postaci; The Metropolitan Museum of Art
 * (posąg Hatszepsut, 29.3.2). Daty Hatszepsut są przybliżone (chronologia
 * Egiptu bywa przesunięta o kilka–kilkanaście lat).
 */

import { img } from '@/lib/media';

export type Kind = 'fakt' | 'zdanie';
export type Lean = -1 | 0 | 1;

export interface Sentence {
  id: string;
  text: string;
  kind: Kind;
  lean: Lean;
  /** Dla `zdanie`: słowo albo zwrot, które zdradza ocenę. */
  cue?: string;
}

export interface SourceCard {
  id: string;
  author: string;
  /** Kto to był — jednym zdaniem. */
  who: string;
  when: string;
  /** Starożytne (z epoki albo bliskie) czy współczesne. */
  age: 'dawne' | 'wspolczesne';
  sentences: readonly Sentence[];
}

export interface LifeEvent {
  id: string;
  /** Rok historyczny bez zera: −69 = 69 p.n.e. */
  year: number;
  approx?: boolean;
  text: string;
}

export interface Figure {
  id: 'kleopatra' | 'hatszepsut' | 'perykles' | 'konstantyn';
  name: string;
  /** Biernik — „oceniasz Kleopatrę”. */
  acc: string;
  she: boolean;
  role: string;
  lived: string;
  photo: string;
  photoAlt: string;
  photoCredit: string;
  /** „Dla swoich” i „dla innych” w tej konkretnej historii — w dopełniaczu. */
  own: string;
  others: string;
  /** Karta, od której zaczyna się teczka — pierwsze wrażenie. */
  firstCard: string;
  cards: readonly SourceCard[];
  life: readonly LifeEvent[];
}

const s = (id: string, text: string, kind: Kind, lean: Lean, cue?: string): Sentence => ({ id, text, kind, lean, cue });

export const FIGURES: readonly Figure[] = [
  {
    id: 'kleopatra',
    name: 'Kleopatra VII',
    acc: 'Kleopatrę',
    she: true,
    role: 'ostatnia królowa Egiptu',
    lived: '69–30 p.n.e.',
    photo: img('/images/historia/lekcje/teczka-postaci/kleopatra.jpg'),
    photoAlt: 'Fotografia: marmurowe popiersie młodej kobiety z włosami zaczesanymi do tyłu w pasma i upiętymi w kok, z przepaską na głowie',
    photoCredit: 'Popiersie Kleopatry VII, ok. 40 p.n.e., Altes Museum w Berlinie. Fot. Louis le Grand, Wikimedia Commons, domena publiczna.',
    own: 'Egipcjan',
    others: 'Rzymian',
    firstCard: 'k-horacy',
    cards: [
      {
        id: 'k-horacy',
        author: 'Horacy',
        who: 'rzymski poeta; wiersz na wieść o jej śmierci, pisany dla zwycięzcy — Oktawiana',
        when: '30 p.n.e.',
        age: 'dawne',
        sentences: [
          s('k1', 'Szalona królowa szykowała zgubę Rzymowi.', 'zdanie', -1, 'Szalona'),
          s('k2', 'Po klęsce pod Akcjum uciekła z okrętami do Egiptu.', 'fakt', 0),
          s('k3', 'Nie dała się poprowadzić w triumfie przez Rzym — umarła dumnie.', 'zdanie', 1, 'dumnie'),
        ],
      },
      {
        id: 'k-plutarch',
        author: 'Plutarch',
        who: 'grecki pisarz; życiorys Marka Antoniusza, pisany ponad 100 lat po jej śmierci',
        when: 'ok. 100 n.e.',
        age: 'dawne',
        sentences: [
          s('k4', 'Jako pierwsza z greckiej rodziny władców Egiptu nauczyła się języka egipskiego.', 'fakt', 1),
          s('k5', 'Jej uroda nie była podobno niezwykła, ale rozmowa z nią czarowała każdego.', 'zdanie', 0, 'czarowała'),
        ],
      },
      {
        id: 'k-dion',
        author: 'Kasjusz Dion',
        who: 'rzymski senator i historyk',
        when: 'ok. 220 n.e.',
        age: 'dawne',
        sentences: [
          s('k6', 'Cezar osadził ją na tronie Egiptu razem z jej młodszym bratem.', 'fakt', 0),
          s('k7', 'Swoim urokiem omotała dwóch najpotężniejszych Rzymian swoich czasów.', 'zdanie', -1, 'omotała'),
        ],
      },
      {
        id: 'k-papirus',
        author: 'Papirus z kancelarii królowej',
        who: 'urzędowy dokument z jej dworu, dziś w muzeum w Berlinie',
        when: '33 p.n.e.',
        age: 'dawne',
        sentences: [
          s('k8', 'Królowa zwolniła z podatków rzymskiego dowódcę Publiusza Kanidiusza i jego ziemie w Egipcie.', 'fakt', 0),
          s('k9', 'Pod spodem ktoś dopisał po grecku „niech się stanie” — być może ręką samej królowej.', 'fakt', 0),
        ],
      },
      {
        id: 'k-dendera',
        author: 'Płaskorzeźba w Denderze',
        who: 'ściana egipskiej świątyni bogini Hathor, wykuta na zlecenie kapłanów',
        when: 'ok. 40–30 p.n.e.',
        age: 'dawne',
        sentences: [
          s('k10', 'Kleopatra i jej syn Cezarion składają dary egipskim bogom, ubrani jak faraonowie.', 'fakt', 1),
          s('k11', 'Dla egipskich kapłanów była prawdziwą królową, tak jak dawni faraonowie.', 'zdanie', 1, 'prawdziwą królową'),
        ],
      },
      {
        id: 'k-schiff',
        author: 'Stacy Schiff',
        who: 'amerykańska pisarka, autorka biografii Kleopatry',
        when: '2010',
        age: 'wspolczesne',
        sentences: [
          s('k12', 'Starożytne opisy Kleopatry pisali prawie wyłącznie Grecy i Rzymianie.', 'fakt', 0),
          s('k13', 'Była zręczną władczynią, która przez ponad 20 lat chroniła bogate królestwo przed Rzymem.', 'zdanie', 1, 'zręczną'),
        ],
      },
    ],
    life: [
      { id: 'kl1', year: -69, text: 'urodziła się w Aleksandrii' },
      { id: 'kl2', year: -51, text: 'została królową Egiptu' },
      { id: 'kl3', year: -48, text: 'spotkała Juliusza Cezara' },
      { id: 'kl4', year: -41, text: 'zawarła sojusz z Markiem Antoniuszem' },
      { id: 'kl5', year: -31, text: 'przegrała bitwę pod Akcjum' },
      { id: 'kl6', year: -30, text: 'zmarła; Egipt stał się rzymską prowincją' },
    ],
  },
  {
    id: 'hatszepsut',
    name: 'Hatszepsut',
    acc: 'Hatszepsut',
    she: true,
    role: 'kobieta faraon Egiptu',
    lived: 'ok. 1507–1458 p.n.e.',
    photo: img('/images/historia/lekcje/teczka-postaci/hatszepsut.jpg'),
    photoAlt: 'Fotografia: jasny kamienny posąg siedzącej postaci w pasiastej chuście faraona, o łagodnej twarzy, na ciemnym tle',
    photoCredit: 'Posąg Hatszepsut z jej świątyni w Deir el-Bahari, ok. 1470 p.n.e., Metropolitan Museum of Art w Nowym Jorku. Wikimedia Commons, CC0.',
    own: 'Egipcjan',
    others: 'sąsiednich ludów',
    firstCard: 'h-hayes',
    cards: [
      {
        id: 'h-hayes',
        author: 'William Hayes',
        who: 'amerykański egiptolog; książka o zbiorach muzeum w Nowym Jorku',
        when: '1959',
        age: 'wspolczesne',
        sentences: [
          s('h1', 'Była ambitną kobietą, która zagarnęła tron należny młodemu Totmesowi.', 'zdanie', -1, 'zagarnęła'),
          s('h2', 'Totmes III był małym dzieckiem, gdy zmarł jego ojciec, i to Hatszepsut rządziła w jego imieniu.', 'fakt', 0),
        ],
      },
      {
        id: 'h-swiatynia',
        author: 'Napisy w jej świątyni',
        who: 'płaskorzeźby i napisy w świątyni w Deir el-Bahari, wykonane na rozkaz samej królowej',
        when: 'ok. 1470 p.n.e.',
        age: 'dawne',
        sentences: [
          s('h3', 'Bóg Amon sam wybrał ją na króla Egiptu.', 'zdanie', 1, 'sam wybrał'),
          s('h4', 'Jej statki popłynęły do krainy Punt i przywiozły drzewka kadzidłowe, heban i złoto.', 'fakt', 1),
        ],
      },
      {
        id: 'h-posag',
        author: 'Jej posąg',
        who: 'kamienny posąg z jej świątyni, dziś w muzeum w Nowym Jorku',
        when: 'ok. 1470 p.n.e.',
        age: 'dawne',
        sentences: [
          s('h5', 'Ma na głowie chustę faraona, a na innych posągach — także sztuczną brodę króla.', 'fakt', 0),
          s('h6', 'Napis na posągu nazywa ją „królem Górnego i Dolnego Egiptu”.', 'fakt', 0),
        ],
      },
      {
        id: 'h-totmes',
        author: 'Ślady po Totmesie III',
        who: 'zniszczone posągi i napisy — robota ludzi jej następcy',
        when: 'ok. 20 lat po jej śmierci',
        age: 'dawne',
        sentences: [
          s('h7', 'Jej posągi rozbito, a jej imię wykuto z murów świątyń.', 'fakt', -1),
          s('h8', 'Na liście królów wykutej w Abydos ponad 150 lat później jej imienia nie ma.', 'fakt', 0),
        ],
      },
      {
        id: 'h-cooney',
        author: 'Kara Cooney',
        who: 'amerykańska egiptolożka, autorka biografii Hatszepsut',
        when: '2014',
        age: 'wspolczesne',
        sentences: [
          s('h9', 'Była jedną z najzdolniejszych władczyń Egiptu — jej rządy dały krajowi bogactwo i spokój.', 'zdanie', 1, 'najzdolniejszych'),
          s('h10', 'Zbudowała świątynię w Deir el-Bahari i postawiła w Karnaku obeliski wysokie na blisko 30 metrów.', 'fakt', 1),
        ],
      },
      {
        id: 'h-mumia',
        author: 'Egipscy naukowcy',
        who: 'zespół badaczy z Kairu',
        when: '2007',
        age: 'wspolczesne',
        sentences: [
          s('h11', 'Jej mumię rozpoznano po zębie, który leżał w szkatułce z jej imieniem.', 'fakt', 0),
          s('h12', 'Mumia przez ponad sto lat leżała nierozpoznana w cudzym grobowcu.', 'fakt', 0),
        ],
      },
    ],
    life: [
      { id: 'hl1', year: -1479, approx: true, text: 'zaczęła rządzić w imieniu małego Totmesa III' },
      { id: 'hl2', year: -1473, approx: true, text: 'ogłosiła się faraonem' },
      { id: 'hl3', year: -1471, approx: true, text: 'wysłała wyprawę do krainy Punt' },
      { id: 'hl4', year: -1458, approx: true, text: 'zmarła; władzę objął Totmes III' },
      { id: 'hl5', year: -1437, approx: true, text: 'jej posągi zaczęto niszczyć' },
    ],
  },
  {
    id: 'perykles',
    name: 'Perykles',
    acc: 'Peryklesa',
    she: false,
    role: 'przywódca demokratycznych Aten',
    lived: 'ok. 495–429 p.n.e.',
    photo: img('/images/historia/lekcje/teczka-postaci/perykles.jpg'),
    photoAlt: 'Fotografia: marmurowe popiersie brodatego mężczyzny w greckim hełmie zsuniętym na czoło, na czerwonym tle',
    photoCredit: 'Popiersie Peryklesa — rzymska kopia greckiego posągu, Muzea Watykańskie. Wikimedia Commons, domena publiczna.',
    own: 'Ateńczyków',
    others: 'sojuszników Aten',
    firstCard: 'p-kratinos',
    cards: [
      {
        id: 'p-kratinos',
        author: 'Kratinos',
        who: 'ateński autor komedii, wystawianych w teatrze dla całego miasta',
        when: 'V w. p.n.e.',
        age: 'dawne',
        sentences: [
          s('p1', 'Wyśmiewał Peryklesa jako „Zeusa z głową jak cebula”.', 'zdanie', -1, 'głową jak cebula'),
          s('p2', 'W ateńskim teatrze wolno było publicznie wyśmiewać najważniejszych polityków.', 'fakt', 0),
        ],
      },
      {
        id: 'p-tukidydes',
        author: 'Tukidydes',
        who: 'ateński historyk, który znał Peryklesa; opisał wojnę ze Spartą',
        when: 'ok. 400 p.n.e.',
        age: 'dawne',
        sentences: [
          s('p3', 'Perykles był uczciwy i nie dał się przekupić żadnymi pieniędzmi.', 'zdanie', 1, 'uczciwy'),
          s('p4', 'Po wybuchu wojny ze Spartą kazał mieszkańcom wsi schronić się za murami Aten.', 'fakt', 0),
        ],
      },
      {
        id: 'p-plutarch',
        author: 'Plutarch',
        who: 'grecki pisarz; życiorys Peryklesa',
        when: 'ok. 100 n.e.',
        age: 'dawne',
        sentences: [
          s('p5', 'Za pieniądze ze wspólnej kasy związku greckich miast budował w Atenach świątynie, m.in. Partenon.', 'fakt', 0),
          s('p6', 'Przeciwnicy mówili, że stroi Ateny jak próżną kobietę — za cudze pieniądze.', 'zdanie', -1, 'jak próżną kobietę'),
        ],
      },
      {
        id: 'p-arystoteles',
        author: 'Arystoteles',
        who: 'grecki filozof; książka o ustroju Aten',
        when: 'ok. 330 p.n.e.',
        age: 'dawne',
        sentences: [
          s('p7', 'Na wniosek Peryklesa uchwalono, że obywatelem jest tylko ten, czyi oboje rodzice są Ateńczykami.', 'fakt', -1),
          s('p8', 'Perykles wprowadził zapłatę dla obywateli, którzy zasiadali w sądach.', 'fakt', 1),
        ],
      },
      {
        id: 'p-duris',
        author: 'Duris z Samos',
        who: 'historyk z wyspy Samos, która walczyła z Atenami; znany z przytoczeń u Plutarcha',
        when: 'ok. 280 p.n.e.',
        age: 'dawne',
        sentences: [
          s('p9', 'Ateny pod wodzą Peryklesa traktowały sojuszników jak poddanych, a nie jak przyjaciół.', 'zdanie', -1, 'jak poddanych'),
          s('p10', 'W 440 r. p.n.e. Samos zbuntowało się przeciw Atenom, a Perykles stłumił bunt.', 'fakt', -1),
        ],
      },
      {
        id: 'p-kagan',
        author: 'Donald Kagan',
        who: 'amerykański historyk, autor biografii Peryklesa',
        when: '1991',
        age: 'wspolczesne',
        sentences: [
          s('p11', 'Był wielkim przywódcą, który uczył Ateńczyków, że miasto należy do wszystkich obywateli.', 'zdanie', 1, 'wielkim'),
          s('p12', 'Zmarł w 429 r. p.n.e. podczas zarazy, która spadła na zatłoczone Ateny.', 'fakt', 0),
        ],
      },
    ],
    life: [
      { id: 'pl1', year: -495, approx: true, text: 'urodził się w Atenach' },
      { id: 'pl2', year: -461, approx: true, text: 'stanął na czele zwolenników demokracji' },
      { id: 'pl3', year: -451, text: 'przeprowadził prawo o obywatelstwie' },
      { id: 'pl4', year: -447, text: 'zaczęto budować Partenon' },
      { id: 'pl5', year: -431, text: 'wybuchła wojna ze Spartą' },
      { id: 'pl6', year: -429, text: 'zmarł podczas zarazy' },
    ],
  },
  {
    id: 'konstantyn',
    name: 'Konstantyn Wielki',
    acc: 'Konstantyna',
    she: false,
    role: 'cesarz rzymski',
    lived: 'ok. 272–337 n.e.',
    photo: img('/images/historia/lekcje/teczka-postaci/konstantyn.jpg'),
    photoAlt: 'Fotografia: olbrzymia marmurowa głowa mężczyzny o wielkich oczach i krótkich włosach, ustawiona na postumencie przy ścianie',
    photoCredit: 'Głowa z olbrzymiego posągu Konstantyna, ok. 315 n.e., Muzea Kapitolińskie w Rzymie. Fot. Jean-Christophe Benoist, Wikimedia Commons, CC BY 2.5.',
    own: 'mieszkańców imperium',
    others: 'wyznawców dawnych bogów',
    firstCard: 'c-euzebiusz',
    cards: [
      {
        id: 'c-euzebiusz',
        author: 'Euzebiusz z Cezarei',
        who: 'biskup i przyjaciel cesarza; „Życie Konstantyna”, napisane tuż po jego śmierci',
        when: 'ok. 338 n.e.',
        age: 'dawne',
        sentences: [
          s('c1', 'Był najpobożniejszym z cesarzy, wybranym przez Boga.', 'zdanie', 1, 'najpobożniejszym'),
          s('c2', 'Kazał budować kościoły i dawał na nie pieniądze z kasy państwa.', 'fakt', 0),
        ],
      },
      {
        id: 'c-zosimos',
        author: 'Zosimos',
        who: 'grecki urzędnik i historyk, wyznawca dawnych bogów',
        when: 'ok. 500 n.e.',
        age: 'dawne',
        sentences: [
          s('c3', 'Zniszczył dawne obyczaje i obciążył ludzi okropnymi podatkami.', 'zdanie', -1, 'okropnymi'),
          s('c4', 'Przeniósł stolicę do nowego miasta nad cieśniną Bosfor, nazwanego od jego imienia.', 'fakt', 0),
        ],
      },
      {
        id: 'c-luk',
        author: 'Napis na łuku Konstantyna',
        who: 'łuk triumfalny, który postawił mu senat w Rzymie',
        when: '315 n.e.',
        age: 'dawne',
        sentences: [
          s('c5', 'Łuk upamiętnia jego zwycięstwo w bitwie przy Moście Mulwijskim w 312 roku.', 'fakt', 0),
          s('c6', 'Napis głosi, że wybawił państwo od tyrana.', 'zdanie', 1, 'wybawił'),
        ],
      },
      {
        id: 'c-edykt',
        author: 'Edykt z Mediolanu',
        who: 'porozumienie cesarzy Konstantyna i Licyniusza, przepisane przez pisarza Laktancjusza',
        when: '313 n.e.',
        age: 'dawne',
        sentences: [
          s('c7', 'Każdy mieszkaniec imperium może swobodnie wyznawać religię, jaką wybierze.', 'fakt', 1),
          s('c8', 'Chrześcijanom zwrócono domy i ziemie zabrane w czasie prześladowań.', 'fakt', 1),
        ],
      },
      {
        id: 'c-julian',
        author: 'Julian',
        who: 'bratanek Konstantyna, później cesarz i wyznawca dawnych bogów; jego słowa zapisał historyk Ammian',
        when: 'ok. 362 n.e.',
        age: 'dawne',
        sentences: [
          s('c9', 'Był wywrotowcem, który pomieszał dawne prawa i obyczaje.', 'zdanie', -1, 'wywrotowcem'),
          s('c10', 'Jako cesarz Julian próbował przywrócić w imperium cześć dawnych bogów.', 'fakt', 0),
        ],
      },
      {
        id: 'c-barnes',
        author: 'Timothy Barnes',
        who: 'brytyjski historyk, autor książek o Konstantynie',
        when: '2011',
        age: 'wspolczesne',
        sentences: [
          s('c11', 'Należał do władców, którzy najmocniej zmienili dzieje Europy.', 'zdanie', 1, 'najmocniej zmienili'),
          s('c12', 'W 326 roku kazał stracić swojego najstarszego syna, Kryspusa — źródła nie mówią jasno, dlaczego.', 'fakt', -1),
        ],
      },
    ],
    life: [
      { id: 'cl1', year: 272, approx: true, text: 'urodził się w Naissus (dziś Nisz w Serbii)' },
      { id: 'cl2', year: 306, text: 'żołnierze w Brytanii ogłosili go cesarzem' },
      { id: 'cl3', year: 312, text: 'wygrał bitwę przy Moście Mulwijskim' },
      { id: 'cl4', year: 313, text: 'ogłosił z Licyniuszem wolność wyznania' },
      { id: 'cl5', year: 330, text: 'Konstantynopol został nową stolicą' },
      { id: 'cl6', year: 337, text: 'zmarł, ochrzczony tuż przed śmiercią' },
    ],
  },
];

export function getFigure(id: string): Figure | undefined {
  return FIGURES.find((f) => f.id === id);
}

export function allSentences(f: Figure): { card: SourceCard; sentence: Sentence }[] {
  return f.cards.flatMap((card) => card.sentences.map((sentence) => ({ card, sentence })));
}

export function findSentence(f: Figure, id: string): { card: SourceCard; sentence: Sentence } | undefined {
  return allSentences(f).find((x) => x.sentence.id === id);
}
