'use client';

import { useRef, useState } from 'react';
import { DragGhost, useDragToken } from '../../family-tree/use-drag-token';
import { OsDziejow } from '../../timeline/os-dziejow';
import { CASES, LAWS, judgeCase } from './sad';

/**
 * Blok 3 (perspektywy): **sąd Hammurabiego**. Sprawy przychodzą po kolei;
 * dziecko czyta prawa na steli i **przykłada sprawę do prawa**, które ją
 * opisuje (przeciąga albo stuk-stuk). Wyrok wynika z prawa. Po czterech
 * sprawach tabela sama pokazuje: za to samo oko obywatel i niewolnik są
 * traktowani inaczej. Potem dwie perspektywy: wtedy i dziś.
 */

const LESSON = 'poczatki-cywilizacji/mezopotamia';

export function SadHammurabiego({ color, onComplete, done }: { color: string; onComplete: () => void; done: boolean }) {
  const [solved, setSolved] = useState<string[]>([]);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [picked, setPicked] = useState(false);
  const completed = useRef(false);

  const current = CASES.find((c) => !solved.includes(c.id));
  const allDone = !current;

  const tryLaw = (lawId: string) => {
    if (!current) return;
    const r = judgeCase(current.id, lawId);
    setMsg(r);
    setPicked(false);
    if (!r.ok) return;
    const next = [...solved, current.id];
    setSolved(next);
    if (next.length === CASES.length && !completed.current) {
      completed.current = true;
      onComplete();
    }
  };

  const { drag, hover, bind } = useDragToken({
    disabled: allDone,
    onDrop: (_id, target) => {
      if (target?.startsWith('prawo-')) tryLaw(target.slice(6));
    },
    onTap: () => setPicked((p) => !p),
  });

  const oko = (victim: 'obywatel' | 'niewolnik') => {
    const c = CASES.find((x) => x.harm === 'oko' && x.victim === victim)!;
    return LAWS.find((l) => l.id === c.law)!;
  };

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed">
        Jesteś sędzią w Babilonie, w XVIII wieku p.n.e. Król Hammurabi kazał wyryć prawa na kamiennej steli i postawić ją tam,
        gdzie każdy mógł ją zobaczyć. <strong>Przyłóż każdą sprawę do prawa, które ją opisuje</strong> — przeciągnij kartę
        sprawy na prawo albo stuknij sprawę, potem prawo. Prawa są opowiedziane naszymi słowami.
      </p>

      <div className="grid gap-4 md:grid-cols-[1fr_1.2fr]">
        <div className="space-y-3">
          {current ? (
            <button
              type="button"
              {...bind(current.id)}
              className="block w-full touch-none border-2 bg-white p-3 text-left text-sm leading-relaxed dark:bg-zinc-900"
              style={{ borderColor: color, outline: picked ? `3px solid ${color}` : undefined }}
            >
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Sprawa {solved.length + 1} z {CASES.length}
              </span>
              {current.text}
            </button>
          ) : (
            <p className="border p-3 text-sm">Wszystkie sprawy rozsądzone.</p>
          )}
          {msg && (
            <p className={`text-sm ${msg.ok ? '' : 'text-destructive'}`} aria-live="polite">
              {msg.text}
            </p>
          )}
          {solved.length > 0 && (
            <ol className="space-y-1 text-xs text-muted-foreground">
              {solved.map((id) => {
                const c = CASES.find((x) => x.id === id)!;
                const l = LAWS.find((x) => x.id === c.law)!;
                return (
                  <li key={id}>
                    <span className="font-semibold text-foreground">Prawo {l.no}:</span> {l.verdict}
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        {/* stela */}
        <div className="space-y-1.5 border-x-[10px] border-t-[10px] border-stone-700 bg-stone-800 p-2 text-stone-100" style={{ borderTopLeftRadius: '45% 30px', borderTopRightRadius: '45% 30px' }}>
          <p className="pt-2 text-center text-[11px] uppercase tracking-widest text-stone-400">stela praw</p>
          {LAWS.map((l) => (
            <button
              key={l.id}
              type="button"
              data-drop={`prawo-${l.id}`}
              onClick={() => picked && tryLaw(l.id)}
              className="block w-full border border-stone-600 p-2 text-left text-xs leading-relaxed sm:text-sm"
              style={{ background: hover === `prawo-${l.id}` ? '#57534e' : undefined, cursor: picked ? 'pointer' : 'default' }}
            >
              <span className="mr-1 font-mono font-bold text-amber-300">§ {l.no}</span>
              {l.text}
            </button>
          ))}
        </div>
      </div>
      <DragGhost drag={drag}>
        <span className="block max-w-[260px] border-2 bg-white p-2 text-xs" style={{ borderColor: color }}>
          {current?.text}
        </span>
      </DragGhost>

      {(allDone || done) && (
        <div className="space-y-3 border-t pt-4">
          <p className="text-sm font-semibold">Porównaj dwie sprawy o wybite oko:</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="border p-2">
              <p className="text-xs text-muted-foreground">poszkodowany: obywatel</p>
              <p>{oko('obywatel').verdict}</p>
            </div>
            <div className="border p-2">
              <p className="text-xs text-muted-foreground">poszkodowany: niewolnik</p>
              <p>{oko('niewolnik').verdict}</p>
            </div>
          </div>
          <p className="text-sm leading-relaxed">
            Ta sama szkoda — a kara zupełnie inna. W Babilonie <strong>obywatel miał większe prawa niż niewolnik</strong>,
            a niewolnik był traktowany jak własność swojego pana.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="border-l-2 pl-3 text-sm leading-relaxed" style={{ borderColor: color }}>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Wtedy</p>
              Ludziom wydawało się to sprawiedliwe: kara była spisana i taka sama dla każdego w tej samej sytuacji, a nie
              zależała od humoru sędziego. „Oko za oko” miało też powstrzymać zemstę — nie wolno było oddać więcej, niż się
              straciło.
            </div>
            <div className="border-l-2 pl-3 text-sm leading-relaxed" style={{ borderColor: color }}>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Dziś</p>
              Uważamy, że każdy człowiek ma taką samą wartość. Konstytucja RP mówi: „Wszyscy są wobec prawa równi” (art. 32).
              Nie ma niewolników, a kary nie polegają na zadawaniu tej samej krzywdy.
            </div>
          </div>
          <p className="text-sm leading-relaxed">
            Prawdziwa stela z prawami Hammurabiego stoi dziś w Luwrze w Paryżu. Na Osi dziejów pojawił się Hammurabi.
          </p>
          <OsDziejow color={color} lesson={LESSON} defaultMode="piramidy" highlightIds={['hammurabi']} />
        </div>
      )}
    </div>
  );
}
