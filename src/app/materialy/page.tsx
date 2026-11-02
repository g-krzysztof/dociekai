import type { Metadata } from 'next';
import Link from 'next/link';
import { MATERIALY, PRZEDMIOTY, przedmiotyZMaterialami } from './data';
import { FiltrRodzaju } from './components/filtr-rodzaju';
import { Linijka, ModulyPrzedmiotu } from './components/lista';
import { Wachlarz } from './components/wachlarz';

export const metadata: Metadata = {
  title: 'Ściągi i fiszki do druku — klasa 4 | DociekAI',
  description:
    'Darmowe ściągi i fiszki do druku z programu klasy 4: jedna strona A4 na moduł i karty do wycięcia. Treść czytasz online, gotowy PDF pobierasz z darmowym kontem.',
  alternates: { canonical: '/materialy' },
  openGraph: {
    title: 'Ściągi i fiszki do druku — klasa 4 | DociekAI',
    description: 'Ściąga na każdy moduł i fiszki do wycięcia, zgodne z kursami klasy 4 DociekAI.',
    url: '/materialy',
  },
};

const materialWord = (n: number) => (n === 1 ? 'materiał' : n < 5 ? 'materiały' : 'materiałów');

const KROKI = [
  {
    tytul: 'Skala 100%',
    tekst: 'W oknie drukowania wybierz „Rzeczywisty rozmiar”, nie „Dopasuj do strony”. Inaczej karty wyjdą mniejsze, a linie cięcia się przesuną.',
  },
  {
    tytul: 'Fiszki: druk dwustronny',
    tekst: 'Obracanie wzdłuż dłuższej krawędzi. Drukarka nie drukuje dwustronnie? Pobierz wersję składaną na pół.',
  },
  {
    tytul: 'Tnij po przerywanych',
    tekst: 'Kreski na marginesach pokazują, gdzie zaczyna się każda linia. Nożyczki wystarczą, gilotyna jest szybsza.',
  },
];

export default function MaterialyPage() {
  const przedmioty = przedmiotyZMaterialami();
  const nazwyPrzedmiotow = przedmioty.map((p) => PRZEDMIOTY[p].nazwa.toLowerCase()).join(', ');

  return (
    <div className="mata min-h-screen overflow-hidden">
      <Linijka />

      <section className="container mx-auto grid items-center gap-8 px-4 pb-10 pt-12 sm:pt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-6 lg:pb-16">
        <div className="max-w-xl">
          <h1 className="text-[clamp(2.4rem,6vw,4.4rem)] font-black leading-[0.98] tracking-[-0.035em] text-balance">
            Ściągi i fiszki do druku
          </h1>
          <p className="mt-6 max-w-[34rem] text-lg leading-relaxed text-[var(--mata-tekst-cichy)]">
            Program klasy 4 na kartkach A4: ściąga na każdy moduł i fiszki do wycięcia. Całą treść czytasz tu
            za darmo, a gotowy plik PDF pobierasz z darmowym kontem — dla siebie albo dla dziecka.
          </p>
          <p className="mt-6 font-mono text-sm tabular-nums text-[var(--mata-tekst-cichy)]">
            {MATERIALY.length} {materialWord(MATERIALY.length)} · {nazwyPrzedmiotow} · klasa 4
          </p>
        </div>
        <Wachlarz materialy={MATERIALY} />
      </section>

      <section aria-label="Materiały" className="container mx-auto px-4 pb-20">
        <FiltrRodzaju>
          <div className="space-y-20">
            {przedmioty.map((p) => (
              <section key={p} aria-labelledby={`przedmiot-${p}`}>
                <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
                  <h2 id={`przedmiot-${p}`} className="text-3xl font-black tracking-tight sm:text-4xl">
                    {PRZEDMIOTY[p].nazwa} <span className="text-[var(--mata-tekst-cichy)]">klasa 4</span>
                  </h2>
                  <Link
                    href={`/materialy/${p}/klasa-4`}
                    className="text-sm font-semibold text-[var(--mata-tekst-cichy)] underline underline-offset-4 hover:text-[var(--mata-tekst)]"
                  >
                    Wszystkie materiały z tego kursu
                  </Link>
                </div>
                <ModulyPrzedmiotu przedmiot={p} />
              </section>
            ))}
          </div>
        </FiltrRodzaju>
      </section>

      <section
        aria-label="O materiałach i drukowaniu"
        className="container mx-auto grid items-start gap-x-16 gap-y-14 px-4 pb-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,25rem)]"
      >
        <div className="max-w-[68ch]">
          <h2 id="o-materialach" className="text-2xl font-bold tracking-tight">
            Ściągi do druku zgodne z kursem klasy 4
          </h2>
          <p className="mt-4 leading-relaxed text-[var(--mata-tekst-cichy)]">
            Każda ściąga mieści cały moduł na jednej stronie A4: zdanie, które trzeba zapamiętać, reguły z
            rozwiązanymi przykładami i najczęstsze pułapki. Fiszki mają pytanie na awersie i odpowiedź z krótkim
            wyjaśnieniem na rewersie, więc dziecko sprawdza się samo, bez klucza odpowiedzi.
          </p>
          <p className="mt-4 leading-relaxed text-[var(--mata-tekst-cichy)]">
            Materiały powstają z tych samych lekcji co nasze kursy online i trzymają się podstawy programowej.
            Kod QR w stopce ściągi prowadzi do lekcji modułu — kto chce poćwiczyć, przechodzi z kartki prosto do
            zadań.
          </p>
        </div>

        <aside aria-labelledby="jak-drukowac" className="bilet cien-kartki px-6 pb-9 pt-9 sm:px-8">
          <h2 id="jak-drukowac" className="text-xl font-black leading-tight tracking-tight text-balance">
            Jak wydrukować, żeby się udało
          </h2>
          <ol className="mt-6">
            {KROKI.map((k, i) => (
              <li key={k.tytul} className="grid grid-cols-[2rem_1fr] gap-x-3">
                {i > 0 && <hr aria-hidden className="bilet-linia col-span-2 my-5" />}
                <span className="font-mono text-2xl font-bold leading-none tabular-nums text-[var(--bilet-cichy)]">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-bold leading-tight">{k.tytul}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-[var(--bilet-cichy)]">{k.tekst}</p>
                </div>
              </li>
            ))}
          </ol>
        </aside>
      </section>
    </div>
  );
}
