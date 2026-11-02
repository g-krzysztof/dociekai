'use client';

import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Assignment, AssignSection, Member, MemberId } from './collab';

/**
 * Tablica przydziału: przeciągnij imię na sekcję dokumentu, żeby zostać jej
 * właścicielem. Ten sam gest (przeciąganie z tacy na cel, z rozpoznawaniem
 * celu przez `document.elementFromPoint` i pułapką „to było stuknięcie, nie
 * przeciąganie") co w `program-hunt.tsx`, wspólny dla bloku 3 (ćwiczenie na
 * przykładzie) i bloku 5 (prawdziwe zadanie) — tak jak jedna mechanika Scratcha
 * służy kilku lekcjom modułu 6.
 */

interface AssignBoardProps {
  color: string;
  team: Member[];
  sections: AssignSection[];
  assignment: Assignment;
  onAssign: (sectionId: string, memberId: MemberId) => void;
  onUnassign: (sectionId: string) => void;
  /** Treść pod slotem, gdy jest przydzielony — zadanie pokazuje tu szkic osoby. */
  renderSlotBody?: (sectionId: string, owner: MemberId) => React.ReactNode;
}

export function AssignBoard({
  color,
  team,
  sections,
  assignment,
  onAssign,
  onUnassign,
  renderSlotBody,
}: AssignBoardProps) {
  const [selected, setSelected] = useState<MemberId | null>(null);
  const [ghost, setGhost] = useState<{ id: MemberId; x: number; y: number } | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const drag = useRef<{ id: MemberId; x: number; y: number; moved: boolean } | null>(null);

  const assignedIds = Object.values(assignment).filter((v): v is MemberId => v !== null);
  const tray = team.filter((member) => !assignedIds.includes(member.id));

  const sectionAt = (x: number, y: number): string | null => {
    const zone = document.elementFromPoint(x, y)?.closest<HTMLElement>('[data-drop-section]');
    return zone?.dataset.dropSection ?? null;
  };

  const place = (memberId: MemberId, sectionId: string) => {
    const current = assignment[sectionId];
    if (current === memberId) return;
    onAssign(sectionId, memberId);
    setSelected(null);
  };

  const chipHandlers = (memberId: MemberId) => ({
    onPointerDown: (event: ReactPointerEvent<HTMLButtonElement>) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      event.currentTarget.setPointerCapture(event.pointerId);
      drag.current = { id: memberId, x: event.clientX, y: event.clientY, moved: false };
    },
    onPointerMove: (event: ReactPointerEvent<HTMLButtonElement>) => {
      const current = drag.current;
      if (!current || current.id !== memberId) return;
      if (!current.moved && Math.hypot(event.clientX - current.x, event.clientY - current.y) < 6) return;
      current.moved = true;
      setGhost({ id: memberId, x: event.clientX, y: event.clientY });
      setHover(sectionAt(event.clientX, event.clientY));
    },
    onPointerUp: (event: ReactPointerEvent<HTMLButtonElement>) => {
      const current = drag.current;
      drag.current = null;
      setGhost(null);
      setHover(null);
      if (!current || current.id !== memberId) return;
      if (current.moved) {
        const sectionId = sectionAt(event.clientX, event.clientY);
        if (sectionId) place(memberId, sectionId);
      } else {
        setSelected((prev) => (prev === memberId ? null : memberId));
      }
    },
    onPointerCancel: () => {
      drag.current = null;
      setGhost(null);
      setHover(null);
    },
  });

  return (
    <div>
      {tray.length > 0 && (
        <div className="mb-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Przeciągnij imię na część dokumentu
          </p>
          <div className="flex flex-wrap gap-2">
            {tray.map((member) => (
              <button
                key={member.id}
                type="button"
                {...chipHandlers(member.id)}
                className={cn(
                  'cursor-grab touch-none select-none border-2 px-3.5 py-2 text-sm font-semibold transition-colors active:cursor-grabbing',
                  selected === member.id && 'ring-2 ring-offset-2'
                )}
                style={{
                  borderColor: color,
                  backgroundColor: selected === member.id ? color : `${color}14`,
                  color: selected === member.id ? 'white' : undefined,
                }}
              >
                {member.name}
              </button>
            ))}
          </div>
          {selected && (
            <p className="mt-2 text-xs text-muted-foreground">
              Wybrano „{team.find((m) => m.id === selected)?.name}” — stuknij teraz część dokumentu.
            </p>
          )}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        {sections.map((section) => {
          const owner = assignment[section.id];
          const ownerMember = owner ? team.find((m) => m.id === owner) : undefined;
          return (
            <div
              key={section.id}
              data-drop-section={section.id}
              onClick={() => selected && place(selected, section.id)}
              className={cn(
                'min-h-[120px] cursor-pointer border-2 border-dashed p-3 transition-colors',
                hover === section.id && 'border-solid'
              )}
              style={{
                borderColor: owner ? color : hover === section.id ? color : 'var(--border)',
                backgroundColor: owner ? `${color}0f` : hover === section.id ? `${color}0a` : undefined,
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-bold leading-snug">{section.title}</p>
                {ownerMember && (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onUnassign(section.id);
                    }}
                    aria-label={`Usuń przydział: ${ownerMember.name}`}
                    className="shrink-0 cursor-pointer text-muted-foreground hover:text-primary"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              {ownerMember ? (
                <div className="mt-2">
                  <span
                    className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold text-white"
                    style={{ backgroundColor: color }}
                  >
                    <Check className="h-3 w-3" />
                    {ownerMember.name}
                  </span>
                  {renderSlotBody && <div className="mt-2">{renderSlotBody(section.id, owner!)}</div>}
                </div>
              ) : (
                <p className="mt-2 text-xs text-muted-foreground">Nikt jeszcze tego nie robi.</p>
              )}
            </div>
          );
        })}
      </div>

      {ghost && (
        <div
          aria-hidden
          className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2 border-2 px-3.5 py-2 text-sm font-semibold shadow-lg"
          style={{ left: ghost.x, top: ghost.y, borderColor: color, backgroundColor: color, color: 'white' }}
        >
          {team.find((m) => m.id === ghost.id)?.name}
        </div>
      )}
    </div>
  );
}
