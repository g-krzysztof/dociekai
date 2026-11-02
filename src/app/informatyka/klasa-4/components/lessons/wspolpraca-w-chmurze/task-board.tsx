'use client';

import { useState } from 'react';
import { AssignBoard } from './assign-board';
import { ANIMALS_PROJECT_TITLE, ANIMALS_SECTIONS, ANIMALS_TEAM, emptyAssignment, isAssignmentComplete, type Assignment, type MemberId } from './collab';

/**
 * Ćwiczenie: podział pracy na przykładzie innego projektu (prezentacja
 * o zwierzętach), zanim dziecko zrobi to samo naprawdę w zadaniu (blok 5) na
 * planie wycieczki z haczyka. Wskazówki przy każdej osobie pozwalają dobrać
 * część do umiejętności — ale nie blokują innego wyboru, żeby dziecko
 * zdecydowało samo, a nie zgadywało jedyną poprawną odpowiedź.
 */

export function TaskBoard({ color, onComplete }: { color: string; onComplete?: () => void }) {
  const [assignment, setAssignment] = useState<Assignment>(() => emptyAssignment(ANIMALS_SECTIONS));

  const complete = isAssignmentComplete(ANIMALS_SECTIONS, assignment);

  const handleAssign = (sectionId: string, memberId: MemberId) => {
    const next = { ...assignment };
    Object.keys(next).forEach((key) => {
      if (next[key] === memberId) next[key] = null;
    });
    next[sectionId] = memberId;
    setAssignment(next);
    if (isAssignmentComplete(ANIMALS_SECTIONS, next)) onComplete?.();
  };

  const handleUnassign = (sectionId: string) => {
    setAssignment((prev) => ({ ...prev, [sectionId]: null }));
  };

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <p className="mb-2 text-sm font-bold">{ANIMALS_PROJECT_TITLE}</p>
      <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
        Trzy części, trzy osoby. Zanim ktokolwiek zacznie pisać, podzielcie się —
        inaczej dwie osoby mogą trafić w to samo miejsce, tak jak w poprzednim bloku.
      </p>

      <div className="mb-4 grid gap-2 sm:grid-cols-3">
        {ANIMALS_TEAM.map((member) => (
          <div key={member.id} className="border-l-2 pl-2.5 text-xs leading-snug text-muted-foreground" style={{ borderColor: color }}>
            <span className="font-semibold text-foreground">{member.name}: </span>
            {member.blurb}
          </div>
        ))}
      </div>

      <AssignBoard
        color={color}
        team={ANIMALS_TEAM}
        sections={ANIMALS_SECTIONS}
        assignment={assignment}
        onAssign={handleAssign}
        onUnassign={handleUnassign}
      />

      {complete && (
        <p className="mt-4 text-sm leading-relaxed" style={{ color }}>
          Podzielone — każda część ma teraz jedną osobę. Tak samo zrobicie to naprawdę w zadaniu,
          na planie wycieczki.
        </p>
      )}
    </div>
  );
}
