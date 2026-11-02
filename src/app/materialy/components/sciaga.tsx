import { Check, TriangleAlert, X } from 'lucide-react';
import type { Sciaga as SciagaData } from '../data/types';
import { PRZEDMIOTY, URL_SERWISU } from '../data';
import { KodQr } from './kod-qr';
import { Schemat } from './schemat';
import { Tresc } from './tresc';

const dataStempla = (iso: string) => {
  const [r, m, d] = iso.split('-');
  return `${d}.${m}.${r}`;
};

/**
 * Ściąga — jedna strona A4. Ta sama komponenta jest miniaturą
 * (tryb „miniatura”), podglądem na stronie („czytaj”) i stroną PDF („druk”).
 */
export function Sciaga({
  sciaga,
  tryb,
}: {
  sciaga: SciagaData;
  tryb: 'miniatura' | 'czytaj' | 'druk';
}) {
  const reguly = sciaga.bloki.filter((b) => b.typ === 'regula');
  const pulapki = sciaga.bloki.filter((b) => b.typ === 'pulapka');
  const powrot = `${URL_SERWISU}${sciaga.modul.href}`;

  return (
    <article className="kartka" data-przedmiot={sciaga.przedmiot} data-tryb={tryb} aria-hidden={tryb === 'miniatura' || undefined}>
      <div className="sciaga-pasek-kontrolny" aria-hidden>
        <i />
        <i />
        <i />
        <i />
        <i />
        <i />
      </div>

      <div className="sciaga">
        <header className="sciaga-naglowek">
          <div>
            <p className="sciaga-metka">
              {PRZEDMIOTY[sciaga.przedmiot].nazwa} · klasa {sciaga.klasa} · moduł {sciaga.modul.numer} · ściąga
            </p>
            <p className="sciaga-tytul">{sciaga.modul.tytul}</p>
          </div>
          <div className="sciaga-stempel" aria-label={`Aktualizacja ${dataStempla(sciaga.aktualizacja)}`}>
            <span>DociekAI</span>
            <b>{dataStempla(sciaga.aktualizacja)}</b>
            <span>wydanie</span>
          </div>
        </header>

        <p className="sciaga-zdanie">
          <Tresc tekst={sciaga.zdanie} />
        </p>

        <div className="sciaga-reguly">
          {reguly.map((r, i) => (
            <section key={r.tytul} className="regula" data-schemat={r.schemat?.typ}>
              <h2 className="regula-tytul">
                <span>{String(i + 1).padStart(2, '0')}</span>
                {r.tytul}
              </h2>
              <p className="regula-tekst">
                <Tresc tekst={r.tekst} />
              </p>
              {r.schemat && (
                <div className="regula-schemat">
                  <Schemat schemat={r.schemat} />
                </div>
              )}
              {r.przyklad && (
                <p className="regula-przyklad">
                  <Tresc tekst={r.przyklad} />
                </p>
              )}
            </section>
          ))}
        </div>

        {pulapki.length > 0 && (
          <section className="sciaga-pulapki">
            <h2 className="sciaga-pulapki-tytul">
              <TriangleAlert aria-hidden strokeWidth={2.4} />
              Uważaj na pułapki
            </h2>
            <ul>
              {pulapki.map((p) => (
                <li key={p.tytul} className="pulapka">
                  <p className="pulapka-tytul">{p.tytul}</p>
                  <p className="pulapka-zle">
                    <span className="pulapka-znak" aria-hidden>
                      <X strokeWidth={3} />
                    </span>
                    <span className="sr-only">Źle:</span>
                    <span>
                      <Tresc tekst={p.zle} />
                    </span>
                  </p>
                  <p className="pulapka-dobrze">
                    <span className="pulapka-znak" aria-hidden>
                      <Check strokeWidth={3} />
                    </span>
                    <span className="sr-only">Dobrze:</span>
                    <span>
                      <Tresc tekst={p.dobrze} />
                    </span>
                  </p>
                  <p className="pulapka-dlaczego">
                    <Tresc tekst={p.dlaczego} />
                  </p>
                </li>
              ))}
            </ul>
          </section>
        )}

        <footer className="sciaga-stopka">
          <KodQr url={`${powrot}?utm_source=druk&utm_medium=sciaga`} etykieta="Kod QR do lekcji tego modułu" />
          <p>
            <b>Ćwicz dalej w darmowych lekcjach</b>
            {powrot.replace('https://', '')}
          </p>
          <span className="sciaga-stopka-marka">DociekAI</span>
        </footer>
      </div>
    </article>
  );
}
