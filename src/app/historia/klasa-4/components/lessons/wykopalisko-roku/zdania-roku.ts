/** Zdania lekcji L1–L31 (dosłownie) — do wyboru „najważniejsze dla mnie” w bloku 4 L32. */
export interface ZdanieRoku {
  lesson: number;
  slug: string;
  title: string;
  text: string;
}
export const ZDANIA_ROKU: readonly ZdanieRoku[] = [
  {
    lesson: 1,
    slug: 'pierwsza-lekcja-historii',
    title: 'Co to jest historia?',
    text: 'Historia stara się opowiadać o tym, co naprawdę się zdarzyło — dlatego zawsze pyta: skąd to wiemy?',
  },
  {
    lesson: 2,
    slug: 'zrodla-historyczne',
    title: 'Ślady przeszłości',
    text: 'Wszystko, co zostawił człowiek, może opowiedzieć o przeszłości — także to, co dziś wyrzucasz do kosza.',
  },
  {
    lesson: 3,
    slug: 'wiarygodnosc-zrodla',
    title: 'Czy źródło mówi prawdę?',
    text: 'Źródłu wierzymy bardziej, gdy wiemy, kto je napisał, kiedy i po co — i gdy potwierdza je inne, niezależne źródło.',
  },
  {
    lesson: 4,
    slug: 'przyczyny-i-skutki',
    title: 'Dlaczego i co z tego wynikło',
    text: 'Każde wydarzenie ma swoje „dlaczego” i swoje „co z tego wynikło” — a skutek jednego zdarzenia bywa przyczyną następnego.',
  },
  {
    lesson: 5,
    slug: 'historia-mojej-rodziny',
    title: 'Historia mojej rodziny',
    text: 'Twoja rodzina też ma źródła — trzeba tylko wiedzieć, kogo zapytać i na co patrzeć.',
  },
  {
    lesson: 6,
    slug: 'os-czasu-i-epoki',
    title: 'Oś czasu i epoki',
    text: 'Na osi czasu liczy się kolejność — a im bliżej dziś, tym gęściej od wydarzeń i tym krótsze epoki.',
  },
  {
    lesson: 7,
    slug: 'wieki-i-tysiaclecia',
    title: 'W którym to wieku?',
    text: 'Wiek zaczyna się w roku z końcówką 01, bo pierwsze sto lat liczy się od jedynki, nie od zera.',
  },
  {
    lesson: 8,
    slug: 'obliczanie-czasu',
    title: 'Ile lat minęło?',
    text: 'Między 1 r. p.n.e. a 1 r. n.e. jest tylko jeden krok — dlatego przy datach z dwóch er odejmujemy jedynkę.',
  },
  {
    lesson: 9,
    slug: 'mapa-i-plan',
    title: 'Mapa i plan historyczny',
    text: 'Mapa bez legendy to obrazek — legenda zamienia ją w opowieść.',
  },
  {
    lesson: 10,
    slug: 'symbole-narodowe',
    title: 'Godło, barwy, hymn',
    text: 'Symbole mówią „to jesteśmy my” — i dlatego mają swoje zasady.',
  },
  {
    lesson: 11,
    slug: 'swieta-i-wspolnoty',
    title: 'Wspólnoty i święta',
    text: 'Święto państwowe to dzień, w którym cała wspólnota pamięta o tym samym.',
  },
  {
    lesson: 12,
    slug: 'regiony-i-mala-ojczyzna',
    title: 'Dlaczego regiony się różnią',
    text: 'Mieszkamy w jednym kraju, ale każdy region ma swoją historię — i dlatego trochę inaczej mówi, gotuje i świętuje.',
  },
  {
    lesson: 13,
    slug: 'slady-historii-w-okolicy',
    title: 'Jak czytać swoją okolicę',
    text: 'Historia każdej okolicy jest zapisana w nazwach ulic, kształcie rynku i starych murach — trzeba tylko wiedzieć, na co patrzeć.',
  },
  {
    lesson: 14,
    slug: 'legendy-prawda-i-fikcja',
    title: 'Co w legendzie jest prawdą?',
    text: 'W legendzie prawda miesza się ze zmyśleniem — a rzeczy, które da się sprawdzić, są jak kamienie wystające z rzeki.',
  },
  {
    lesson: 15,
    slug: 'pierwsi-ludzie',
    title: 'Koczownicy',
    text: 'Przez prawie całe swoje dzieje ludzie wędrowali za jedzeniem — a ogień pozwolił im zajść coraz dalej.',
  },
  {
    lesson: 16,
    slug: 'rewolucja-neolityczna',
    title: 'Od zbieracza do rolnika',
    text: 'Kiedy człowiek zaczął siać, musiał zostać przy polu — i z tej jednej zmiany wyrosły wioski, miasta i państwa.',
  },
  {
    lesson: 17,
    slug: 'mezopotamia',
    title: 'Pierwsze miasta',
    text: 'Wspólna praca przy kanałach wymagała kogoś, kto liczy, zapisuje i rozkazuje — tak rodziło się miasto-państwo.',
  },
  {
    lesson: 18,
    slug: 'od-pisma-do-alfabetu',
    title: 'Po co ludziom pismo',
    text: 'Pismo pozwoliło zapamiętać więcej, niż mieści się w jednej głowie — a alfabet sprawił, że może się go nauczyć każdy.',
  },
  {
    lesson: 19,
    slug: 'egipt-dar-nilu',
    title: 'Egipt darem Nilu',
    text: 'Bez wylewów Nilu Egipt byłby pustynią — cały rok Egipcjan kręcił się wokół rzeki.',
  },
  {
    lesson: 20,
    slug: 'bogowie-mumie-piramidy',
    title: 'Bogowie, mumie, piramidy',
    text: 'Egipcjanie wierzyli, że życie trwa po śmierci — i dla tej wiary zbudowali najtrwalsze budowle świata.',
  },
  {
    lesson: 21,
    slug: 'osiagniecia-egipcjan',
    title: 'Co zawdzięczamy Egipcjanom',
    text: 'Wiele rzeczy, z których korzystasz codziennie — kalendarz, pomiary, słowo „papier” — ma korzenie nad Nilem.',
  },
  {
    lesson: 22,
    slug: 'grecja-gory-i-morze',
    title: 'Kraina gór i morza',
    text: 'Góry dzieliły Greków, a morze ich łączyło — dlatego powstało wiele polis zamiast jednego państwa.',
  },
  {
    lesson: 23,
    slug: 'ateny-i-demokracja',
    title: 'Ateny Peryklesa',
    text: 'W Atenach o sprawach miasta decydowali obywatele — ale obywatelem był tylko co któryś mieszkaniec.',
  },
  {
    lesson: 24,
    slug: 'bogowie-i-mity',
    title: 'Olimp i mity',
    text: 'Mity wyjaśniały Grekom świat — a my wciąż mówimy ich słowami.',
  },
  {
    lesson: 25,
    slug: 'teatr-igrzyska-filozofia',
    title: 'Teatr, igrzyska, filozofia',
    text: 'Grecy pytali „dlaczego?” — w teatrze, na stadionie i na agorze — i z tych pytań wyrosła duża część naszej kultury.',
  },
  {
    lesson: 26,
    slug: 'od-wioski-do-imperium',
    title: 'Od wioski do imperium',
    text: 'Rzym rósł przez wieki: najpierw zmieniał się sposób rządzenia, potem granice — aż jedno miasto rządziło całym Morzem Śródziemnym.',
  },
  {
    lesson: 27,
    slug: 'rzym-czasow-cezara',
    title: 'Jeden dzień, trzy życia',
    text: 'W Rzymie ta sama ulica wyglądała zupełnie inaczej dla patrycjusza, plebejusza i niewolnika.',
  },
  {
    lesson: 28,
    slug: 'dziedzictwo-rzymu',
    title: 'Rzymianie budowali na zawsze',
    text: 'Rzymianie budowali tak, żeby przetrwało — dlatego ich drogi, prawo i język wciąż są wokół nas.',
  },
  {
    lesson: 29,
    slug: 'judaizm-i-nauczanie-jezusa',
    title: 'Z judaizmu do chrześcijaństwa',
    text: 'Chrześcijaństwo wyrosło z judaizmu — z wiary w jednego Boga — i przejęło z niego Dekalog.',
  },
  {
    lesson: 30,
    slug: 'od-katakumb-do-religii-panujacej',
    title: 'Od katakumb do religii cesarza',
    text: 'W ciągu trzystu lat chrześcijaństwo przeszło od małych, prześladowanych wspólnot do religii panującej w Rzymie.',
  },
  {
    lesson: 31,
    slug: 'teczka-postaci',
    title: 'Teczka postaci (doświadczenie edukacyjne 1b)',
    text: 'Żeby ocenić człowieka sprzed wieków, trzeba znać fakty, znać jego czasy i wysłuchać więcej niż jednego świadka.',
  },
];
