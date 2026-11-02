'use client';

import { useState } from 'react';
import { NotebookPen } from 'lucide-react';
import { TaskShell, type ProofCriterion, type ProofVerdicts } from '@/components/block-lesson/task-shell';
import { DragGhost, useDragToken } from '../../family-tree/use-drag-token';
import { KINDS, QUESTIONS, TRADITIONS, judgeTradition, type KindId, type Placement, type QuestionId } from './tradycje';

const CRITERIA: ProofCriterion[] = TRADITIONS.map((t) => ({
  id: t.id,
  label: `${t.name}: „Skąd?”, „Dawniej?” i „Dziś?” stoją przy zdaniach, które na nie odpowiadają`,
}));

const tokenId = (t: string, q: QuestionId) => `${t}|${q}`;

/**
 * Zadanie L12 — trzy pytania do tradycji. Dziecko **przynosi pytanie do tekstu**:
 * przeciąga zakładkę „Skąd? / Dawniej? / Dziś?” na zdanie opisu (albo stuka
 * zakładkę, potem zdanie). Stuknięcie przypiętej zakładki ją zdejmuje.
 * Nagroda: karta badacza z tymi samymi trzema pytaniami do tradycji z domu.
 */
export function TrzyPytania({ color, onComplete }: { color: string; onComplete: () => void }) {
  const [placement, setPlacement] = useState<Placement>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [kind, setKind] = useState<KindId | null>(null);

  /**
   * Przypina pytanie do zdania. Zakładka już przypięta przenosi się; jeśli w zdaniu
   * stało inne pytanie, zamieniają się miejscami (albo tamto wraca na górę).
   */
  const put = (tok: string, sentence: string) => {
    const [t, q] = tok.split('|') as [string, QuestionId];
    if (!sentence.startsWith(`${t}:`)) return; // zakładka z innej tradycji
    const sid = sentence.slice(t.length + 1);
    setPlacement((prev) => {
      const cur = { ...(prev[t] ?? {}) };
      const from = cur[q];
      const other = (Object.keys(cur) as QuestionId[]).find((k) => k !== q && cur[k] === sid);
      if (other) {
        if (from) cur[other] = from;
        else delete cur[other];
      }
      cur[q] = sid;
      return { ...prev, [t]: cur };
    });
    setSelected(null);
  };

  const unpin = (tok: string) => {
    const [t, q] = tok.split('|') as [string, QuestionId];
    setPlacement((prev) => {
      const cur = { ...(prev[t] ?? {}) };
      delete cur[q];
      return { ...prev, [t]: cur };
    });
    setSelected(null);
  };

  const { drag, hover, bind } = useDragToken({
    onTap: (id) => setSelected((s) => (s === id ? null : id)),
    onDrop: (id, target) => {
      if (target?.startsWith('zdanie:')) put(id, target.slice(7));
      else if (target === null) {
        const [t, q] = id.split('|') as [string, QuestionId];
        if (placement[t]?.[q]) unpin(id); // przypięta upuszczona obok tekstu wraca na górę
      }
    },
  });

  const judge = () => {
    const verdicts: ProofVerdicts = {};
    for (const t of TRADITIONS) verdicts[t.id] = judgeTradition(t, placement[t.id] ?? {});
    return { verdicts, data: null };
  };

  const chosenKind = KINDS.find((k) => k.id === kind);

  return (
    <>
      <TaskShell
        color={color}
        brief={
          <>
            <p>
              Każdą tradycję da się zbadać trzema pytaniami: <strong>skąd się wzięła? co znaczyła
              dawniej? co znaczy dziś?</strong> Przy trzech tradycjach z różnych stron Polski przypnij
              każde pytanie do zdania, które na nie odpowiada. Jedno zdanie w każdym opisie tylko
              opisuje — na żadne pytanie nie odpowiada.
            </p>
            <p className="mt-2 text-muted-foreground">
              Przeciągnij zakładkę na zdanie albo stuknij zakładkę, potem zdanie. Przypiętą zakładkę
              przeniesiesz tak samo; na zajętym zdaniu dwie zakładki zamienią się miejscami, a upuszczona
              obok tekstu wraca na górę.
            </p>
          </>
        }
        criteria={CRITERIA}
        criteriaHeading="Co sprawdzę"
        workshop={
          <div className="space-y-5">
            {TRADITIONS.map((t) => {
              const placed = placement[t.id] ?? {};
              return (
                <div key={t.id} className="border p-3">
                  <p className="font-semibold">
                    {t.name} <span className="font-normal text-muted-foreground">· {t.where}</span>
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {QUESTIONS.filter((q) => !placed[q.id]).map((q) => {
                      const id = tokenId(t.id, q.id);
                      return (
                        <button
                          key={q.id}
                          type="button"
                          {...bind(id)}
                          className="touch-none border-2 px-3 py-1 text-sm font-semibold"
                          style={{
                            borderColor: color,
                            background: selected === id ? color : undefined,
                            color: selected === id ? '#fff' : undefined,
                            opacity: drag?.id === id ? 0.35 : 1,
                          }}
                        >
                          {q.label}
                        </button>
                      );
                    })}
                    {QUESTIONS.every((q) => placed[q.id]) && (
                      <span className="text-xs text-muted-foreground">
                        wszystkie trzy przypięte — każdą zakładkę możesz przenieść na inne zdanie
                      </span>
                    )}
                  </div>
                  <ol className="mt-3 space-y-2">
                    {t.sentences.map((s) => {
                      const drop = `zdanie:${t.id}:${s.id}`;
                      const q = QUESTIONS.find((x) => placed[x.id] === s.id);
                      const armed = selected?.startsWith(`${t.id}|`);
                      return (
                        <li
                          key={s.id}
                          data-drop={drop}
                          onClick={() => selected && put(selected, `${t.id}:${s.id}`)}
                          className="flex items-start gap-2 border p-2 text-sm leading-relaxed transition-colors"
                          style={{
                            borderColor: hover === drop ? color : 'var(--border)',
                            background: hover === drop || (armed && !q) ? `${color}14` : undefined,
                            cursor: armed ? 'pointer' : undefined,
                          }}
                        >
                          {q ? (
                            <button
                              type="button"
                              {...bind(tokenId(t.id, q.id))}
                              onClick={(e) => e.stopPropagation()}
                              className="shrink-0 touch-none border-2 px-2 py-0.5 text-xs font-bold"
                              style={{
                                borderColor: color,
                                background: selected === tokenId(t.id, q.id) ? '#fff' : color,
                                color: selected === tokenId(t.id, q.id) ? color : '#fff',
                                opacity: drag?.id === tokenId(t.id, q.id) ? 0.35 : 1,
                              }}
                              aria-label={`Przypięte pytanie ${q.label} — przeciągnij na inne zdanie albo stuknij, a potem stuknij zdanie`}
                            >
                              {q.label}
                            </button>
                          ) : (
                            <span className="w-[62px] shrink-0 border border-dashed px-2 py-0.5 text-center text-xs text-muted-foreground">
                              …
                            </span>
                          )}
                          <span>{s.text}</span>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              );
            })}
          </div>
        }
        judge={judge}
        acceptedText="Każde pytanie trafiło do zdania, które na nie odpowiada. Te trzy pytania działają przy każdej tradycji — także przy tej z twojego domu."
        reward={
          <div className="space-y-3 text-sm">
            <p className="font-semibold">Karta badacza: moja tradycja</p>
            <p>Jaką tradycję z twojego domu albo okolicy chcesz zbadać? Wybierz rodzaj:</p>
            <div className="flex flex-wrap gap-2">
              {KINDS.map((k) => (
                <button
                  key={k.id}
                  type="button"
                  onClick={() => setKind(k.id)}
                  className="border-2 px-3 py-1 font-medium"
                  style={{ borderColor: kind === k.id ? color : 'var(--border)', background: kind === k.id ? `${color}22` : undefined }}
                >
                  {k.label}
                </button>
              ))}
            </div>
            {chosenKind && (
              <div className="border-2 bg-[#fffaf0] p-4 dark:bg-zinc-900" style={{ borderColor: color }}>
                <p className="flex items-center gap-2 font-semibold">
                  <NotebookPen className="h-4 w-4" style={{ color }} /> Moja tradycja — {chosenKind.label}
                </p>
                <ol className="mt-2 space-y-2">
                  {chosenKind.questions.map((text, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="font-mono font-bold" style={{ color }}>
                        {QUESTIONS[i].label}
                      </span>
                      <span>{text}</span>
                    </li>
                  ))}
                </ol>
                <p className="mt-3 text-xs text-muted-foreground">
                  Zadaj te pytania dorosłemu z rodziny albo sąsiadowi. Jeśli odpowiedzi się różnią —
                  świetnie: tradycja zmienia się razem z ludźmi.
                </p>
              </div>
            )}
          </div>
        }
        onReset={() => {
          setPlacement({});
          setSelected(null);
        }}
        onComplete={onComplete}
      />
      <DragGhost drag={drag}>
        {drag && (
          <span className="block border-2 bg-white px-3 py-1 text-sm font-semibold" style={{ borderColor: color }}>
            {QUESTIONS.find((q) => q.id === drag.id.split('|')[1])?.label}
          </span>
        )}
      </DragGhost>
    </>
  );
}
