'use client';

import { braki, pora, scena, type Fraza, type Pora } from './makieta';
import { Lampa, RekaZaKulis, Wycinanka } from './wycinanki';

/**
 * Scenka papierowego teatru (L18, bloki 1 i 3): szyna tła u góry, lampa na
 * sznurku, deski z figurkami, taśma zdarzeń pod rampą i ręka zza kulis.
 * Puste miejsca widać (przerywana ramka, lampa szara) — dziecko samo wie,
 * czego szukać. Cała scenka jest celem `data-drop="scena"`: teatr sam wie,
 * gdzie postawić frazę.
 */

const NIEBO: Record<Pora, string> = {
  dzien: '#dbeafe',
  lato: '#fef3c7',
  wiosna: '#ecfccb',
  jesien: '#fed7aa',
  zima: '#e0f2fe',
  wieczor: '#fbcfe8',
  noc: '#334155',
  dawno: '#ede9fe',
};
const PUSTE_NIEBO = '#e7e5e4';

const Pusty = ({ className }: { className: string }) => (
  <div className={`pointer-events-none absolute border-2 border-dashed border-stone-400/70 ${className}`} />
);

export function Scenka({
  frazy,
  postawione,
  ostatnia,
  hover,
  trzyma,
  onTap,
}: {
  frazy: Fraza[];
  postawione: string[];
  /** Id ostatnio postawionej frazy — gra na scenie (zdarzenie) albo mruga. */
  ostatnia: string | null;
  hover: boolean;
  /** Dziecko trzyma frazę — scenka zaprasza do stuknięcia. */
  trzyma: boolean;
  onTap: () => void;
}) {
  const s = scena(frazy, postawione);
  const b = braki(frazy, postawione);
  const p = pora(frazy, postawione);
  const niebo = p ? NIEBO[p] : PUSTE_NIEBO;
  const noc = p === 'noc';
  const graZdarzenie = s.tasma.find((f) => f.id === ostatnia);
  const tla = s.tlo.slice(-6);
  const postacie = s.deski.slice(-5);

  return (
    <div
      data-drop="scena"
      onClick={trzyma ? onTap : undefined}
      className={`relative select-none border-[6px] border-[#8b5e3c] bg-[#8b5e3c] ${trzyma ? 'cursor-pointer' : ''}`}
      style={hover ? { outline: '3px solid #f59e0b', outlineOffset: 2 } : undefined}
      aria-label="Scena teatru"
    >
      {/* okno sceny */}
      <div className="relative aspect-[16/10] overflow-hidden transition-colors duration-700" style={{ background: niebo }}>
        {/* szyna tła */}
        <div className="absolute inset-x-0 top-[5%] h-[3px] bg-[#5b4636]" />
        {s.tlo.length === 0 ? (
          <Pusty className="left-[14%] right-[14%] top-[8%] h-[46%]" />
        ) : (
          <>
            {/* karta tła: sylwetki pejzażu */}
            <div className="absolute inset-x-[8%] top-[8%] flex h-[50%] items-end justify-around animate-[spadek_.6s_ease-out]">
              {tla.map((f) => (
                <Wycinanka
                  key={f.id}
                  ikona={f.ikona}
                  rola="tlo"
                  fill={noc ? '#64748b' : '#e7dcc7'}
                  className={`h-[70%] max-h-24 drop-shadow-[2px_3px_0_rgba(0,0,0,0.18)] ${f.id === ostatnia ? 'animate-[spadek_.6s_ease-out]' : ''}`}
                />
              ))}
            </div>
            {/* napis ostatniej karty tła */}
            <p className="absolute left-1/2 top-[6%] max-w-[64%] -translate-x-1/2 truncate border border-[#5b4636]/40 bg-[#fffaf0] px-1.5 font-serif text-[10px] leading-4 text-stone-800 sm:text-xs">
              {s.tlo[s.tlo.length - 1].tekst}
            </p>
          </>
        )}

        {/* lampa */}
        <div className="absolute right-[15%] top-0 flex w-[12%] flex-col items-center">
          <Lampa zapalona={!!p} className="w-full" />
          {s.lampa.length > 0 && (
            <p className="mt-0.5 w-[160%] border border-[#5b4636]/40 bg-[#fffaf0] px-1 text-center font-serif text-[9px] leading-3 text-stone-800 sm:text-[11px] sm:leading-4">
              {s.lampa[s.lampa.length - 1].tekst}
            </p>
          )}
        </div>

        {/* deski */}
        <div className="absolute inset-x-0 bottom-0 h-[24%] bg-[#c08a5a]">
          <div className="h-[3px] bg-[#8b5e3c]" />
        </div>
        {s.deski.length === 0 ? (
          <Pusty className="bottom-[4%] left-[22%] right-[22%] h-[36%]" />
        ) : (
          <div className="absolute inset-x-[16%] bottom-[2%] flex h-[42%] items-end justify-around gap-1">
            {postacie.map((f) => (
              <div key={f.id} className={`flex h-full min-w-0 flex-col items-center justify-end ${f.id === ostatnia ? 'animate-[wjazd_.5s_ease-out]' : ''}`}>
                <Wycinanka ikona={f.ikona} rola="deski" fill="#fffaf0" className="h-[62%] drop-shadow-[2px_3px_0_rgba(0,0,0,0.2)]" />
                <span className="h-[14%] w-[3px] bg-[#5b4636]" />
                <span className="max-w-[5.5rem] truncate bg-[#fffaf0]/90 px-0.5 font-serif text-[9px] leading-3 text-stone-800 sm:text-[11px] sm:leading-4">
                  {f.tekst}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* zdarzenie gra na scenie */}
        {graZdarzenie && (
          <div key={graZdarzenie.id} className="pointer-events-none absolute left-1/2 top-[38%] w-[16%] -translate-x-1/2 animate-[gra_1.6s_ease-out_forwards]">
            <Wycinanka ikona={graZdarzenie.ikona} rola="tasma" fill="#fde68a" className="w-full drop-shadow-[2px_3px_0_rgba(0,0,0,0.2)]" />
          </div>
        )}

        {/* kulisy */}
        <div className="absolute inset-y-0 left-0 w-[7%] bg-[#9f1239]" />
        <div className="absolute inset-y-0 right-0 w-[7%] bg-[#9f1239]" />
        {/* ręka zza kulis */}
        <div className="absolute bottom-[26%] right-[1%] flex w-[30%] flex-col items-end gap-0.5">
          {s.narrator.slice(-2).map((f) => (
            <p
              key={f.id}
              className={`max-w-full truncate border border-[#5b4636]/40 bg-white px-1 font-serif text-[9px] italic leading-3 text-stone-800 sm:text-[11px] sm:leading-4 ${f.id === ostatnia ? 'animate-[wjazd_.5s_ease-out]' : ''}`}
            >
              {f.tekst}
            </p>
          ))}
          <RekaZaKulis className={`w-[52%] scale-x-[-1] transition-opacity ${b.reka ? 'opacity-100' : 'opacity-60'}`} />
        </div>
      </div>

      {/* taśma zdarzeń pod rampą */}
      <div className="relative flex h-9 items-center gap-1 overflow-x-auto bg-[#57534e] px-2 sm:h-10">
        {s.tasma.length === 0 ? (
          <span className="w-full border border-dashed border-stone-300/70 py-0.5 text-center text-[10px] text-stone-300">&nbsp;</span>
        ) : (
          s.tasma.map((f) => (
            <span
              key={f.id}
              className={`flex shrink-0 items-center gap-1 bg-[#fffaf0] px-1.5 py-0.5 font-serif text-[10px] text-stone-800 sm:text-xs ${f.id === ostatnia ? 'animate-[wjazd_.5s_ease-out]' : ''}`}
            >
              <Wycinanka ikona={f.ikona} rola="tasma" className="h-4 w-4" />
              {f.tekst}
            </span>
          ))
        )}
      </div>
      <style>{`
        @keyframes spadek { from { transform: translateY(-60%); opacity: 0 } to { transform: none; opacity: 1 } }
        @keyframes wjazd { from { transform: translateY(40%); opacity: 0 } to { transform: none; opacity: 1 } }
        @keyframes gra { 0% { transform: translate(-50%, 30%) scale(.4); opacity: 0 } 25% { transform: translate(-50%, 0) scale(1.1); opacity: 1 } 45% { transform: translate(-50%, 0) rotate(-8deg) } 60% { transform: translate(-50%, 0) rotate(8deg) } 80% { opacity: 1 } 100% { transform: translate(-50%, 0) scale(1); opacity: 0 } }
      `}</style>
    </div>
  );
}
