'use client';

import React, { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarSection,
  useSidebar
} from '@/components/ui/sidebar';
import { 
  FolderOpen, 
  CheckCircle,
  RotateCcw,
  Plus,
  Pencil,
  Trash2
} from 'lucide-react';
import { FlashcardSet, UserProgress } from './types';
import { useApp } from '@/components/app-context';

interface SetsSidebarProps {
  flashcardSets: FlashcardSet[];
  currentSetId: string;
  userProgress: UserProgress;
  completedSets: Set<string>;
  onSetChange: (setId: string) => void;
  onResetAllProgress: () => void;
  onAddPrivateSet?: () => void;
  onEditPrivateSet?: (setId: string) => void;
  onDeletePrivateSet?: (setId: string) => void;
}

export const SetsSidebar: React.FC<SetsSidebarProps> = ({
  flashcardSets,
  currentSetId,
  userProgress,
  completedSets,
  onSetChange,
  onResetAllProgress,
  onAddPrivateSet,
  onEditPrivateSet,
  onDeletePrivateSet
}) => {
  const { isOpen, setIsOpen } = useSidebar();
  const { sidebarHeight } = useApp();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const expandedSetsRef = useRef<HTMLDivElement>(null);
  const collapsedSetsRef = useRef<HTMLDivElement>(null);

  // Monitor sidebar height changes
  useEffect(() => {
    const sidebarElement = sidebarRef.current;
    if (!sidebarElement) return;

    // Create ResizeObserver to monitor height changes
    const resizeObserver = new ResizeObserver(() => {
      // Height monitoring for potential future use
    });

    // Start observing
    resizeObserver.observe(sidebarElement);

    // Cleanup
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Monitor flashcard sets container height
  useEffect(() => {
    const calculateSetsHeight = (container: HTMLDivElement | null, label: string) => {
      if (!container) return;
      
      // Calculate individual set heights
      const setElements = container.querySelectorAll('[data-set-item]');
      let totalHeight = 0;
      setElements.forEach((element) => {
        const elementHeight = (element as HTMLElement).offsetHeight;
        totalHeight += elementHeight;
      });
      
      // Update global state for both expanded and collapsed views
      if (label === 'Expanded') {
        sidebarHeight.setExpandedSetsHeight(totalHeight);
      } else if (label === 'Collapsed') {
        // Also update global state for collapsed view
        sidebarHeight.setExpandedSetsHeight(totalHeight);
      }
    };

    // Calculate heights for current visible container
    if (isOpen && expandedSetsRef.current) {
      calculateSetsHeight(expandedSetsRef.current, 'Expanded');
    } else if (!isOpen && collapsedSetsRef.current) {
      calculateSetsHeight(collapsedSetsRef.current, 'Collapsed');
    }
  }, [isOpen, flashcardSets, sidebarHeight]);

  // Function to generate initials from set name
  const getSetInitials = (name: string): string => {
    const words = name.trim().split(/\s+/);
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    } else {
      return words.slice(0, 2).map(word => word.charAt(0).toUpperCase()).join('');
    }
  };

  return (
    <Sidebar ref={sidebarRef} variant="default" collapsible="icon" side="left">
      <SidebarHeader className={cn(!isOpen && "px-3")}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              "p-2 rounded-lg transition-colors cursor-pointer",
              !isOpen && "mx-auto"
            )}
            title="Przełącz zestawy"
          >
            <FolderOpen className={cn(
              "h-5 w-5 text-secondary-foreground transition-transform duration-500",
              isOpen && "transform rotate-[360deg]"
            )} />
          </button>
          {isOpen && (
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-base truncate">Wybierz zestaw:</h2>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {isOpen ? (
          <>
            {/* Sets List */}
            <SidebarSection title="Wszystkie zestawy">
              <div ref={expandedSetsRef} className="space-y-2">
                {flashcardSets.map((set) => {
                  const isActive = set.id === currentSetId;
                  const isCompleted = completedSets.has(set.id);
                  const setProgress = userProgress.setsProgress[set.id];
                  const flashcardProgress = setProgress?.flashcardsLearned ? 
                    Math.round((setProgress.flashcardsLearned.length / set.cards.length) * 100) : 0;
                  
                  return (
                    <Button
                      key={set.id}
                      data-set-item
                      variant={isActive ? "light" : "ghost"}
                      size="sm"
                      onClick={() => onSetChange(set.id)}
                      className={cn(
                        "w-full justify-start h-auto p-3 flex flex-col items-start gap-1"
                      )}
                    >
                      <div className="flex items-center gap-2 w-full">
                        <FolderOpen className="h-4 w-4 flex-shrink-0" />
                        <span className="font-medium truncate flex-1 text-left">
                          {set.name}
                        </span>
                        {isCompleted && (
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        )}
                      </div>
                      
                      <div className="w-full space-y-1">
                        <div className="flex justify-between text-xs opacity-80">
                          <span>{set.category}</span>
                          <span>{set.cards.length} kart</span>
                        </div>
                        
                        {setProgress && isActive && (
                          <div className="w-full">
                            <div className="flex justify-between text-xs mb-1">
                              <span>Postęp</span>
                              <span>{flashcardProgress}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-1.5">
                              <div
                                className="bg-primary h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${flashcardProgress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </Button>
                  );
                })}
              </div>
            </SidebarSection>

            {/* Reset Progress */}
            <SidebarSection title="Zarządzanie">
              {onAddPrivateSet && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={onAddPrivateSet}
                  className="w-full justify-start gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Dodaj własne fiszki
                </Button>
              )}
              {onEditPrivateSet && currentSetId && flashcardSets.find(s => s.id === currentSetId)?.category === 'private' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditPrivateSet(currentSetId)}
                  className="w-full justify-start gap-2"
                >
                  <Pencil className="h-4 w-4" />
                  Edytuj aktualny zestaw
                </Button>
              )}
              {onDeletePrivateSet && currentSetId && flashcardSets.find(s => s.id === currentSetId)?.category === 'private' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDeletePrivateSet(currentSetId)}
                  className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  Usuń aktualny zestaw
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={onResetAllProgress}
                className="w-full justify-start gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Resetuj wszystkie postępy
              </Button>
            </SidebarSection>
          </>
        ) : (
          <div ref={collapsedSetsRef} className="flex flex-col items-center gap-4 py-4">
            {/* Set Icons */}
            {flashcardSets.map((set) => {
              const isActive = set.id === currentSetId;
              const isCompleted = completedSets.has(set.id);
              const initials = getSetInitials(set.name);
              
              return (
                <Button
                  key={set.id}
                  data-set-item
                  variant={isActive ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onSetChange(set.id)}
                  className="w-10 h-10 p-0 relative"
                  title={set.name}
                >
                  <span className="text-xs font-semibold">
                    {initials}
                  </span>
                  {isCompleted && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-2 w-2 text-white" />
                    </div>
                  )}
                </Button>
              );
            })}
            
            {/* Add Private Set Button - Collapsed */}
            {onAddPrivateSet && (
              <Button
                variant="default"
                size="sm"
                onClick={onAddPrivateSet}
                className="w-10 h-10 p-0"
                title="Dodaj własne fiszki"
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
            
            {/* Edit Private Set Button - Collapsed */}
            {onEditPrivateSet && currentSetId && flashcardSets.find(s => s.id === currentSetId)?.category === 'private' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEditPrivateSet(currentSetId)}
                className="w-10 h-10 p-0"
                title="Edytuj aktualny zestaw"
              >
                <Pencil className="h-4 w-4" />
              </Button>
            )}
            
            {/* Delete Private Set Button - Collapsed */}
            {onDeletePrivateSet && currentSetId && flashcardSets.find(s => s.id === currentSetId)?.category === 'private' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDeletePrivateSet(currentSetId)}
                className="w-10 h-10 p-0 text-destructive hover:text-destructive"
                title="Usuń aktualny zestaw"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
};