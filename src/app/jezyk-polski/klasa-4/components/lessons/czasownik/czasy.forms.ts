// WYGENEROWANE przez scripts/polski-czasy-l15.mjs ze słownika SGJP. Nie edytuj ręcznie.
export interface FormyCzasownika {
  aspekt: 'perf' | 'imperf';
  /** Formy osobowe czasu nieprzeszłego (tag fin): dla imperf to czas teraźniejszy, dla perf — przyszły. */
  fin: string[];
  /** Formy czasu przeszłego (praet), także z końcówkami osobowymi (łowiłem, łowiłyśmy...). */
  praet: string[];
  inf: string[];
}

export const CZASY: Record<string, FormyCzasownika> = {
  "płynąć": {
    aspekt: 'imperf',
    fin: ["płyną", "płynę", "płynie", "płyniecie", "płyniemy", "płyniesz"],
    praet: ["płynął", "płynąłem", "płynąłeś", "płynęli", "płynęliście", "płynęliśmy", "płynęła", "płynęłam", "płynęłaś", "płynęło", "płynęłom", "płynęłoś", "płynęły", "płynęłyście", "płynęłyśmy"],
    inf: ["płynąć"],
  },
  "łowić": {
    aspekt: 'imperf',
    fin: ["łowi", "łowią", "łowicie", "łowię", "łowimy", "łowisz"],
    praet: ["łowili", "łowiliście", "łowiliśmy", "łowił", "łowiła", "łowiłam", "łowiłaś", "łowiłem", "łowiłeś", "łowiło", "łowiłom", "łowiłoś", "łowiły", "łowiłyście", "łowiłyśmy"],
    inf: ["łowić"],
  },
  "naprawić": {
    aspekt: 'perf',
    fin: ["naprawi", "naprawią", "naprawicie", "naprawię", "naprawimy", "naprawisz"],
    praet: ["naprawili", "naprawiliście", "naprawiliśmy", "naprawił", "naprawiła", "naprawiłam", "naprawiłaś", "naprawiłem", "naprawiłeś", "naprawiło", "naprawiłom", "naprawiłoś", "naprawiły", "naprawiłyście", "naprawiłyśmy"],
    inf: ["naprawić"],
  },
  "zbudować": {
    aspekt: 'perf',
    fin: ["zbudują", "zbuduje", "zbudujecie", "zbudujemy", "zbudujesz", "zbuduję"],
    praet: ["zbudowali", "zbudowaliście", "zbudowaliśmy", "zbudował", "zbudowała", "zbudowałam", "zbudowałaś", "zbudowałem", "zbudowałeś", "zbudowało", "zbudowałom", "zbudowałoś", "zbudowały", "zbudowałyście", "zbudowałyśmy"],
    inf: ["zbudować"],
  },
  "zapalić": {
    aspekt: 'perf',
    fin: ["zapalą", "zapalę", "zapali", "zapalicie", "zapalimy", "zapalisz"],
    praet: ["zapalili", "zapaliliście", "zapaliliśmy", "zapalił", "zapaliła", "zapaliłam", "zapaliłaś", "zapaliłem", "zapaliłeś", "zapaliło", "zapaliłom", "zapaliłoś", "zapaliły", "zapaliłyście", "zapaliłyśmy"],
    inf: ["zapalić"],
  },
  "karmić": {
    aspekt: 'imperf',
    fin: ["karmi", "karmią", "karmicie", "karmię", "karmimy", "karmisz"],
    praet: ["karmili", "karmiliście", "karmiliśmy", "karmił", "karmiła", "karmiłam", "karmiłaś", "karmiłem", "karmiłeś", "karmiło", "karmiłom", "karmiłoś", "karmiły", "karmiłyście", "karmiłyśmy"],
    inf: ["karmić"],
  },
  "szukać": {
    aspekt: 'imperf',
    fin: ["szuka", "szukacie", "szukają", "szukam", "szukamy", "szukasz"],
    praet: ["szukali", "szukaliście", "szukaliśmy", "szukał", "szukała", "szukałam", "szukałaś", "szukałem", "szukałeś", "szukało", "szukałom", "szukałoś", "szukały", "szukałyście", "szukałyśmy"],
    inf: ["szukać"],
  },
  "spać": {
    aspekt: 'imperf',
    fin: ["śpi", "śpią", "śpicie", "śpię", "śpimy", "śpisz"],
    praet: ["spali", "spaliście", "spaliśmy", "spał", "spała", "spałam", "spałaś", "spałem", "spałeś", "spało", "spałom", "spałoś", "spały", "spałyście", "spałyśmy"],
    inf: ["spać"],
  },
};

/** Formy czasu przyszłego „być”, które tworzą czas przyszły złożony (tag `bedzie`). */
export const BEDZIE: string[] = ["będą", "będę", "będzie", "będziecie", "będziemy", "będziesz"];
