'use client';

import { useState } from 'react';
import { MessageCircleQuestion, NotebookPen, Search, X } from 'lucide-react';
import { TaskShell, type ProofCriterion } from '@/components/block-lesson/task-shell';
import {
  QUESTIONS,
  VILLAGE,
  answerOk,
  getQuestion,
  getVillage,
  judgeVillage,
  type Answers,
  type QuestionId,
  type VillageId,
} from './wies';

const CRITERIA: ProofCriterion[] = QUESTIONS.map((q, i) => ({ id: q.id, label: `${i + 1}. ${q.text}` }));

/** Miejsca podpisane już tabliczką na planie — bez drugiego podpisu. */
const SIGNED: VillageId[] = ['dworska', 'kowalska'];

/**
 * Zadanie L13 — kuzyn z miasta mówi, że we wsi „nie ma historii”, i zadaje
 * pięć pytań. Dziecko wybiera pytanie, **stuka miejsca na planie wsi**
 * (zbliżenie mówi, co tam widać) i **pokazuje Antkowi** to, które odpowiada.
 * Wolno oglądać wszystko — odpowiedzią staje się dopiero pokazane miejsce.
 * Nagroda: karta badacza „Moja okolica”.
 */
export function MetodaWeWsi({ color, onComplete }: { color: string; onComplete: () => void }) {
  const [answers, setAnswers] = useState<Answers>({});
  const [activeQ, setActiveQ] = useState<QuestionId | null>(QUESTIONS[0].id);
  const [looked, setLooked] = useState<VillageId | null>(null);

  const show = (q: QuestionId, place: VillageId) => {
    const next = { ...answers, [q]: place };
    setAnswers(next);
    // Następne pytanie bez odpowiedzi — po bieżącym, potem od początku.
    const from = QUESTIONS.findIndex((x) => x.id === q);
    const order = [...QUESTIONS.slice(from + 1), ...QUESTIONS.slice(0, from)];
    setActiveQ(order.find((x) => !next[x.id])?.id ?? null);
    setLooked(null);
  };
  const clear = (q: QuestionId) => {
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[q];
      return next;
    });
    setActiveQ(q);
  };

  const lookedThing = looked ? getVillage(looked) : null;
  const activeIndex = activeQ ? QUESTIONS.findIndex((q) => q.id === activeQ) : -1;

  return (
    <TaskShell
      color={color}
      brief={
        <>
          <p>
            Do Olszynki (to wieś wymyślona) przyjechał kuzyn z miasta, Antek. Rozgląda się i mówi:{' '}
            <em>„Tu nie ma żadnej historii. Same pola i przystanek”.</em>
          </p>
          <p className="mt-2">
            Pokaż mu, że się myli. Antek ma <strong>pięć pytań</strong> — na każde odpowiedz miejscem we
            wsi. Patrz na daty, nazwy ulic, stare budynki i czyjeś imiona — tak samo jak w miasteczku.
          </p>
          <p className="mt-2 text-muted-foreground">
            Stuknij miejsce na planie, żeby obejrzeć je z bliska. Kiedy znajdziesz odpowiedź, naciśnij
            „Pokaż Antkowi”. Uważaj: nie wszystko we wsi jest stare.
          </p>
        </>
      }
      criteria={CRITERIA}
      criteriaHeading="Pytania Antka"
      workshop={
        <div className="grid gap-3 lg:grid-cols-[1fr_300px]">
          {/* Pytania — na telefonie nad planem, na szerokim ekranie obok. */}
          <ol className="space-y-1.5 lg:col-start-2 lg:row-start-1">
            {QUESTIONS.map((q, i) => {
              const place = answers[q.id];
              const on = activeQ === q.id;
              return (
                <li key={q.id} className="flex items-stretch gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActiveQ(q.id)}
                    aria-pressed={on}
                    className="flex min-w-0 flex-1 items-start gap-2 border-2 px-2 py-1.5 text-left text-sm leading-snug"
                    style={{
                      borderColor: on ? color : 'transparent',
                      background: on ? `${color}14` : undefined,
                    }}
                  >
                    <span
                      className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold text-white"
                      style={{ background: place ? color : '#a8a29e' }}
                    >
                      {i + 1}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-semibold">{q.short}</span>
                      <span className="block text-xs text-muted-foreground">
                        {place ? `Odpowiedź: ${getVillage(place).label}` : 'jeszcze bez odpowiedzi'}
                      </span>
                    </span>
                  </button>
                  {place && (
                    <button
                      type="button"
                      onClick={() => clear(q.id)}
                      className="shrink-0 border px-1.5"
                      aria-label={`Cofnij odpowiedź na pytanie ${i + 1}`}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </li>
              );
            })}
          </ol>

          <div className="border bg-white dark:bg-zinc-900 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:self-start">
            <PlanWsi color={color} answers={answers} looked={looked} onTap={setLooked} />
          </div>

          <div className="border p-3 text-sm lg:col-start-2" aria-live="polite">
            {activeQ ? (
              <p className="flex items-start gap-2 font-semibold">
                <MessageCircleQuestion className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} />
                <span>
                  Antek pyta ({activeIndex + 1}/{QUESTIONS.length}): {getQuestion(activeQ).text}
                </span>
              </p>
            ) : (
              <p className="font-semibold">Wszystkie pytania mają odpowiedź. Sprawdź pracę — albo zmień którąś odpowiedź.</p>
            )}
            {activeQ && <p className="mt-1 text-xs text-muted-foreground">Podpowiedź: {getQuestion(activeQ).tip}</p>}

            <div className="mt-3 border-t pt-3">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <Search className="h-3.5 w-3.5" /> Z bliska
              </p>
              {lookedThing ? (
                <>
                  <p className="mt-2 font-semibold">{lookedThing.label}</p>
                  <p className="mt-1">{lookedThing.zoom}</p>
                  {activeQ && (
                    <button
                      type="button"
                      onClick={() => show(activeQ, lookedThing.id)}
                      className="mt-3 w-full border-2 px-3 py-2 text-sm font-semibold text-white"
                      style={{ borderColor: color, background: color }}
                    >
                      Pokaż Antkowi — to odpowiedź na pytanie {activeIndex + 1}
                    </button>
                  )}
                </>
              ) : (
                <p className="mt-2 text-muted-foreground">Stuknij miejsce na planie wsi.</p>
              )}
            </div>
          </div>
        </div>
      }
      judge={() => ({ verdicts: judgeVillage(answers), data: answers })}
      renderReport={(data: Answers) => (
        <div className="space-y-1 text-sm">
          <p className="font-semibold">Co Antek usłyszał o Olszynce</p>
          <ul className="space-y-1">
            {QUESTIONS.filter((q) => data[q.id] && answerOk(q.id, data[q.id]!)).map((q) => (
              <li key={q.id}>{q.reply(getVillage(data[q.id]!))}</li>
            ))}
          </ul>
        </div>
      )}
      acceptedText="Antek milknie. Wieś „bez historii” ma ponad trzysta lat, swojego kowala i młyn, swoją lekarkę i epidemię sprzed prawie dwustu lat. Te same pytania możesz zadać swojej okolicy."
      reward={<KartaBadacza color={color} />}
      onReset={() => {
        setAnswers({});
        setActiveQ(QUESTIONS[0].id);
        setLooked(null);
      }}
      onComplete={onComplete}
    />
  );
}

function PlanWsi({
  color,
  answers,
  looked,
  onTap,
}: {
  color: string;
  answers: Answers;
  looked: VillageId | null;
  onTap: (id: VillageId) => void;
}) {
  return (
    <svg viewBox="0 0 600 400" className="block h-auto w-full select-none" role="img" aria-label="Plan wymyślonej wsi Olszynka">
      <rect width="600" height="400" fill="#f3f1e2" />
      {/* pola */}
      {[
        [20, 20, 110, 70, '#e7e2b8'],
        [20, 96, 110, 60, '#dfe8c4'],
        [400, 20, 40, 60, '#e7e2b8'],
        [20, 160, 80, 90, '#e9e0c4'],
      ].map(([x, y, w, h, f], i) => (
        <rect key={i} x={x as number} y={y as number} width={w as number} height={h as number} fill={f as string} stroke="#d2caa8" />
      ))}
      {/* rzeczka */}
      <path d="M0 330 C60 320 100 360 160 380 L150 400 L0 400 Z" fill="#c9dff0" />
      <path d="M0 330 C60 320 100 360 160 380" stroke="#a9c8e0" strokeWidth="2" fill="none" />
      {/* drogi */}
      <g stroke="#e0d6bd" strokeWidth="12" fill="none" strokeLinecap="round">
        <path d="M0 230 L600 230" />
        <path d="M300 230 L300 140" />
        <path d="M320 140 L470 110" />
        <path d="M196 230 L196 150" />
        <path d="M120 400 L170 300 L250 230" />
      </g>
      {/* stary park dworski */}
      {[460, 512, 530].map((x, i) => (
        <circle key={x} cx={x} cy={i === 1 ? 62 : 78} r="14" fill="#cfdcae" stroke="#a9bb83" />
      ))}
      {/* miejsca — glify */}
      <Glyph id="kosciol" />
      <Glyph id="kapliczka" />
      <Glyph id="dworek" />
      <Glyph id="mlyn" />
      <Glyph id="cmentarz" />
      <Glyph id="szkola" />
      <Glyph id="przystanek" />
      <Glyph id="boisko" />
      <Glyph id="sklep" />
      <Glyph id="nowy-dom" />
      {/* tabliczki ulic */}
      <g>
        <rect x="364" y="155" width="80" height="20" fill="#2f5d8a" />
        <text x="404" y="169" textAnchor="middle" fontSize="13" fill="#fff">ul. Dworska</text>
        <rect x="152" y="195" width="88" height="20" fill="#2f5d8a" />
        <text x="196" y="209" textAnchor="middle" fontSize="13" fill="#fff">ul. Kowalska</text>
      </g>
      {/* podpisy miejsc */}
      <g fontSize="15" fill="#4a4337" textAnchor="middle" stroke="#f3f1e2" strokeWidth="4" paintOrder="stroke" pointerEvents="none">
        {VILLAGE.filter((v) => !SIGNED.includes(v.id)).map((v) => (
          <text key={v.id} x={v.x} y={v.y + (v.id === 'boisko' || v.id === 'cmentarz' ? 38 : 32)}>
            {v.label}
          </text>
        ))}
      </g>
      <text x="590" y="392" textAnchor="end" fontSize="10" fill="#8a8172" fontStyle="italic">
        Olszynka — wieś wymyślona
      </text>
      {/* pola trafienia i numery pytań, na które miejsce jest odpowiedzią */}
      {VILLAGE.map((v) => {
        const nums = QUESTIONS.flatMap((q, i) => (answers[q.id] === v.id ? [i + 1] : []));
        const lit = looked === v.id;
        return (
          <g key={v.id} onClick={() => onTap(v.id)} style={{ cursor: 'pointer' }} role="button" aria-label={v.label}>
            <circle cx={v.x} cy={v.y} r="28" fill={lit ? `${color}22` : 'transparent'} stroke={lit ? color : 'none'} strokeWidth="2.5" />
            {nums.map((n, k) => (
              <g key={n}>
                <circle cx={v.x - 26 - k * 22} cy={v.y - 22} r="11" fill={color} stroke="#fff" strokeWidth="2" />
                <text x={v.x - 26 - k * 22} y={v.y - 17.5} textAnchor="middle" fontSize="13" fontWeight="700" fill="#fff">
                  {n}
                </text>
              </g>
            ))}
          </g>
        );
      })}
    </svg>
  );
}

function Glyph({ id }: { id: VillageId }) {
  const v = getVillage(id);
  const { x, y } = v;
  switch (id) {
    case 'kosciol':
      return (
        <g stroke="#6e5232" fill="#c9a77c">
          <rect x={x - 22} y={y - 6} width="40" height="22" />
          <path d={`M${x - 26} ${y - 6} L${x - 2} ${y - 22} L${x + 22} ${y - 6} Z`} fill="#9c7b56" />
          <rect x={x + 14} y={y - 30} width="12" height="46" />
          <path d={`M${x + 12} ${y - 30} L${x + 20} ${y - 44} L${x + 28} ${y - 30} Z`} fill="#9c7b56" />
        </g>
      );
    case 'kapliczka':
      return (
        <g stroke="#8a8579">
          <rect x={x - 7} y={y - 14} width="14" height="22" fill="#fbfaf6" />
          <path d={`M${x - 10} ${y - 14} L${x} ${y - 24} L${x + 10} ${y - 14} Z`} fill="#c98d74" />
          <circle cx={x - 26} cy={y - 18} r="16" fill="#cfdcae" stroke="#a9bb83" />
        </g>
      );
    case 'dworek':
      return (
        <g stroke="#a08a69">
          <rect x={x - 30} y={y - 4} width="60" height="20" fill="#f4ecdc" />
          <path d={`M${x - 34} ${y - 4} L${x} ${y - 20} L${x + 34} ${y - 4} Z`} fill="#c98d74" />
          {[-8, -2, 4, 10].map((dx) => (
            <rect key={dx} x={x + dx - 3} y={y} width="3" height="16" fill="#fff" />
          ))}
        </g>
      );
    case 'mlyn':
      return (
        <g stroke="#6e5232" fill="#c9a77c">
          <rect x={x - 14} y={y - 16} width="26" height="22" />
          <circle cx={x + 20} cy={y} r="11" fill="none" strokeWidth="2" />
          <path d={`M${x + 9} ${y}h22M${x + 20} ${y - 11}v22`} />
        </g>
      );
    case 'cmentarz':
      return (
        <g stroke="#8a8579" fill="#d6d0c4">
          <rect x={x - 34} y={y - 22} width="68" height="40" fill="none" strokeDasharray="3 2" />
          {[-20, -4, 12].map((dx) => (
            <path key={dx} d={`M${x + dx} ${y + 8} v-12 a5 5 0 0 1 10 0 v12 z`} />
          ))}
        </g>
      );
    case 'szkola':
      return (
        <g stroke="#c19e8c">
          <rect x={x - 28} y={y - 14} width="56" height="28" fill="#efd9cf" />
          <rect x={x - 5} y={y} width="10" height="14" fill="#8f6a52" />
        </g>
      );
    case 'przystanek':
      return (
        <g stroke="#6f6a60" fill="none" strokeWidth="2">
          <path d={`M${x - 16} ${y + 10} V${y - 10} H${x + 16} V${y + 10}`} />
        </g>
      );
    case 'boisko':
      return (
        <g stroke="#fff" strokeWidth="1.5">
          <rect x={x - 40} y={y - 22} width="80" height="44" fill="#9cc58a" />
          <line x1={x} y1={y - 22} x2={x} y2={y + 22} />
          <circle cx={x} cy={y} r="8" fill="none" />
        </g>
      );
    case 'sklep':
      return (
        <g stroke="#a08a69">
          <rect x={x - 18} y={y - 10} width="36" height="22" fill="#f2e3c9" />
          <rect x={x - 18} y={y - 16} width="36" height="6" fill="#d9826b" />
        </g>
      );
    case 'nowy-dom':
      return (
        <g stroke="#8a8579">
          <rect x={x - 16} y={y - 6} width="26" height="20" fill="#f4f0e6" />
          <path d={`M${x - 20} ${y - 6} L${x - 3} ${y - 18} L${x + 14} ${y - 6} Z`} fill="#8c8a84" />
          <rect x={x + 10} y={y + 2} width="14" height="12" fill="#d6d0c4" />
        </g>
      );
    default:
      return null;
  }
}

function KartaBadacza({ color }: { color: string }) {
  return (
    <div className="border-2 bg-[#fffaf0] p-4 text-sm dark:bg-zinc-900" style={{ borderColor: color }}>
      <p className="flex items-center gap-2 font-semibold">
        <NotebookPen className="h-4 w-4" style={{ color }} /> Karta badacza: moja okolica
      </p>
      <p className="mt-1 text-muted-foreground">Na drogę do szkoły — patrz i pytaj:</p>
      <ol className="mt-2 list-decimal space-y-1.5 pl-5">
        <li>Od czego wzięły się nazwy ulic, którymi idziesz? Od budowli, zawodu czy od człowieka?</li>
        <li>Czy mijasz pomnik, tablicę albo mural? Kogo lub co upamiętnia — i dlaczego właśnie tutaj?</li>
        <li>Który budynek wygląda na najstarszy? Czy jest na nim data?</li>
        <li>Kto jest bohaterem twojej okolicy? Zapytaj dorosłych — może to nauczyciel, lekarz albo sąsiad.</li>
        <li>
          Gdzie sprawdzisz więcej: muzeum, biblioteka, dom kultury albo strona internetowa twojej gminy.
        </li>
      </ol>
    </div>
  );
}
