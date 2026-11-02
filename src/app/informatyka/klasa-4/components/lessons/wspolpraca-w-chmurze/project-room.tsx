'use client';

import { useMemo, useState } from 'react';
import { Check, ChevronDown, MessageSquare, Send, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AssignBoard } from './assign-board';
import {
  TRIP_BANKS,
  TRIP_PREFILLED,
  TRIP_PROJECT_TITLE,
  TRIP_SECTIONS,
  TRIP_TEAM,
  emptyAssignment,
  isAssignmentComplete,
  memberName,
  type Assignment,
  type MemberId,
} from './collab';
import { freshProjectState, judgeProject, type Criterion, type ProjectState } from './project-judge';

/**
 * Zadanie: ten sam plan wycieczki, który w bloku 1 krążył trzema mailami,
 * teraz jako jeden wspólny dokument. Trzy kryteria z bloków 2–4 wracają tu
 * jako jedno zlecenie: podziel się (blok 3), zostaw treść w swojej części,
 * przejrzyj cudze części, a poprawkę zostaw jako komentarz, nie nadpisanie
 * (blok 4). Cała praca dzieje się na stronie — zgodnie z zasadą kursu
 * z 2026-09-19, żadnego pliku do wgrania.
 */

export function ProjectRoom({ color, onComplete }: { color: string; onComplete?: () => void }) {
  const [assignment, setAssignment] = useState<Assignment>(() => emptyAssignment(TRIP_SECTIONS));
  const [ownPicks, setOwnPicks] = useState<string[]>([]);
  const [viewed, setViewed] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [comments, setComments] = useState<Record<string, string>>({});
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);

  const ownSectionId = TRIP_SECTIONS.find((section) => assignment[section.id] === 'ty')?.id ?? null;
  const complete = isAssignmentComplete(TRIP_SECTIONS, assignment);

  const state: ProjectState = useMemo(
    () => ({ ...freshProjectState(), assignment, ownPicks, viewed, comments }),
    [assignment, ownPicks, viewed, comments]
  );
  const criteria = useMemo(() => judgeProject(state), [state]);
  const allOk = criteria.every((c) => c.ok);

  const handleAssign = (sectionId: string, memberId: MemberId) => {
    setAssignment((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        if (next[key] === memberId) next[key] = null;
      });
      next[sectionId] = memberId;
      return next;
    });
  };

  const handleUnassign = (sectionId: string) => setAssignment((prev) => ({ ...prev, [sectionId]: null }));

  const togglePick = (chipId: string) =>
    setOwnPicks((prev) => (prev.includes(chipId) ? prev.filter((id) => id !== chipId) : [...prev, chipId]));

  const expand = (sectionId: string) => {
    setExpanded((prev) => (prev === sectionId ? null : sectionId));
    setViewed((prev) => (prev.includes(sectionId) ? prev : [...prev, sectionId]));
  };

  const submitComment = (sectionId: string) => {
    const text = (draft[sectionId] ?? '').trim();
    if (text.length < 3) return;
    setComments((prev) => ({ ...prev, [sectionId]: text }));
  };

  const runCheck = () => {
    setChecked(true);
    if (allOk) onComplete?.();
  };

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <p className="mb-2 text-sm font-bold">{TRIP_PROJECT_TITLE} — wspólny dokument</p>
      <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
        Zróbcie porządnie to, co w bloku 1 zepsuł mail. Sprawdzimy cztery rzeczy:
      </p>
      <ul className="mb-5 space-y-1 text-sm text-muted-foreground">
        {[
          'Wszystkie trzy części mają jednego, różnego właściciela.',
          'Twoja część ma co najmniej dwa trafne punkty i żadnego nie na temat.',
          'Zajrzałeś/aś do obu części kolegów.',
          'Zostawiłeś/aś komentarz zamiast poprawiać cudzy tekst wprost.',
        ].map((line) => (
          <li key={line} className="flex items-start gap-2">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-current" />
            {line}
          </li>
        ))}
      </ul>

      <AssignBoard
        color={color}
        team={TRIP_TEAM}
        sections={TRIP_SECTIONS}
        assignment={assignment}
        onAssign={handleAssign}
        onUnassign={handleUnassign}
      />

      {complete && (
        <div className="mt-6 space-y-4">
          {TRIP_SECTIONS.map((section) => {
            const owner = assignment[section.id]!;
            const isMine = section.id === ownSectionId;

            if (isMine) {
              const bank = TRIP_BANKS[section.id];
              return (
                <div key={section.id} className="border-2 p-4" style={{ borderColor: color }}>
                  <p className="mb-1 text-sm font-bold">
                    {section.title} <span className="font-normal text-muted-foreground">— Twoja część</span>
                  </p>
                  <p className="mb-3 text-xs text-muted-foreground">Wybierz punkty, które tu pasują.</p>
                  <div className="flex flex-wrap gap-2">
                    {bank.map((chip) => {
                      const picked = ownPicks.includes(chip.id);
                      return (
                        <button
                          key={chip.id}
                          type="button"
                          onClick={() => togglePick(chip.id)}
                          className="cursor-pointer border-2 px-3 py-1.5 text-left text-sm transition-colors"
                          style={
                            picked
                              ? { borderColor: color, backgroundColor: color, color: 'white' }
                              : { borderColor: 'var(--border)' }
                          }
                        >
                          {picked && <Check className="mr-1 inline h-3.5 w-3.5" />}
                          {chip.text}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            }

            const isOpen = expanded === section.id;
            const pre = TRIP_PREFILLED[section.id];
            const hasComment = Boolean(comments[section.id]);

            return (
              <div key={section.id} className="border">
                <button
                  type="button"
                  onClick={() => expand(section.id)}
                  className="flex w-full cursor-pointer items-center justify-between gap-2 p-4 text-left"
                >
                  <span className="text-sm font-bold">
                    {section.title}{' '}
                    <span className="font-normal text-muted-foreground">— {memberName(TRIP_TEAM, owner)}</span>
                  </span>
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    {hasComment && <MessageSquare className="h-3.5 w-3.5" style={{ color }} />}
                    <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
                  </span>
                </button>

                {isOpen && (
                  <div className="border-t p-4">
                    <ul className="mb-3 space-y-1 text-sm">
                      {pre.items.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-current" />
                          {item}
                        </li>
                      ))}
                    </ul>

                    {hasComment ? (
                      <p className="border-l-4 pl-3 text-sm" style={{ borderColor: color }}>
                        <strong>Twój komentarz:</strong> {comments[section.id]}
                      </p>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          value={draft[section.id] ?? ''}
                          onChange={(event) => setDraft((prev) => ({ ...prev, [section.id]: event.target.value }))}
                          placeholder="Zostaw komentarz zamiast poprawki wprost…"
                          className="min-w-0 flex-1 border-2 px-3 py-2 text-sm focus:outline-none"
                          style={{ borderColor: color }}
                        />
                        <button
                          type="button"
                          onClick={() => submitComment(section.id)}
                          disabled={(draft[section.id] ?? '').trim().length < 3}
                          className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                          style={{ backgroundColor: color }}
                        >
                          <Send className="h-3.5 w-3.5" />
                          Wyślij
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {complete && (
        <div className="mt-6 border-t pt-5">
          <button
            type="button"
            onClick={runCheck}
            className="cursor-pointer px-5 py-2.5 text-sm font-semibold text-white"
            style={{ backgroundColor: color }}
          >
            Sprawdź dokument
          </button>

          {checked && (
            <ul className="mt-4 space-y-2">
              {criteria.map((c) => (
                <CriterionRow key={c.id} criterion={c} color={color} />
              ))}
            </ul>
          )}

          {checked && allOk && (
            <p className="mt-4 text-sm leading-relaxed" style={{ color }}>
              Gotowe — i tym razem naprawdę jest tylko <strong>jedna</strong> wersja tego planu,
              zamiast trzech różnych mailowych kopii z bloku 1.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function CriterionRow({ criterion, color }: { criterion: Criterion; color: string }) {
  return (
    <li className="flex items-start gap-2.5 text-sm">
      {criterion.ok ? (
        <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} />
      ) : (
        <X className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
      )}
      <span>
        <span className={cn('block', !criterion.ok && 'font-medium')}>{criterion.label}</span>
        <span className="block text-xs text-muted-foreground">{criterion.detail}</span>
      </span>
    </li>
  );
}
