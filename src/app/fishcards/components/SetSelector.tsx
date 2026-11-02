'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Trophy, RotateCcw } from 'lucide-react';
import { FlashcardSet, UserProgress } from './types';

interface SetSelectorProps {
  flashcardSets: FlashcardSet[];
  currentSetId: string;
  userProgress: UserProgress;
  completedSets: Set<string>;
  onSetChange: (setId: string) => void;
  onResetAllProgress: () => void;
  isMobile?: boolean;
}

export const SetSelector: React.FC<SetSelectorProps> = ({
  flashcardSets,
  currentSetId,
  userProgress,
  completedSets,
  onSetChange,
  onResetAllProgress,
  isMobile = false,
}) => {
  const containerClass = isMobile
    ? "grid grid-cols-1 sm:grid-cols-2 gap-3"
    : "space-y-3";

  return (
    <Card className={isMobile ? "" : "top-4"}>
      <CardHeader>
        <CardTitle className="flex justify-between items-center gap-2 text-lg">
          {isMobile ? "Wybierz zestaw" : "Zestawy"}
          <Button
            variant="outline"
            onClick={onResetAllProgress}
            size="sm"
            className="text-red-600 hover:text-red-700"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Resetuj
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className={containerClass}>
        {flashcardSets.map((set) => {
          const isActive = currentSetId === set.id;
          
          return (
            <div
              key={set.id}
              className={`p-3 rounded-lg border cursor-pointer transition-all hover:border-primary/30 ${
                isActive
                  ? 'border-primary bg-primary/10 shadow-sm'
                  : 'border-border hover:bg-muted'
              }`}
              onClick={() => onSetChange(set.id)}
            >
              <div className={`flex items-center justify-between ${isActive ? 'mb-1' : ''}`}>
                <h4 className="font-medium text-sm">{set.name}</h4>
                <div className="flex items-center gap-1">
                  {completedSets.has(set.id) && (
                    <div title="Ukończono na 100%!">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                    </div>
                  )}
                  {isActive && <Check className="w-4 h-4 text-primary" />}
                </div>
              </div>

              {/* Szczegóły tylko dla aktywnego zestawu */}
              {isActive && (
                <>
                  <p className="text-xs text-muted-foreground mb-2">{set.description}</p>

                  {userProgress.setsProgress[set.id] && (
                    <div className="mb-2">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>
                          Fiszki: {userProgress.setsProgress[set.id].flashcardsLearned.length}/{set.cards.length}
                        </span>
                        <span>
                          Quiz: {Math.round(userProgress.setsProgress[set.id].quizStats.lastAccuracy)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                        <div
                          className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                          style={{
                            width: `${
                              (userProgress.setsProgress[set.id].flashcardsLearned.length / set.cards.length) * 100
                            }%`,
                          }}
                        ></div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Ostatnio: {new Date(userProgress.setsProgress[set.id].lastStudied).toLocaleDateString('pl-PL')}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {set.cards.length} kart
                    </Badge>
                    <Badge
                      variant={
                        set.difficulty === 'beginner'
                          ? 'default'
                          : set.difficulty === 'intermediate'
                          ? 'secondary'
                          : 'outline'
                      }
                      className="text-xs"
                    >
                      {set.difficulty === 'beginner'
                        ? 'Początkujący'
                        : set.difficulty === 'intermediate'
                        ? 'Średni'
                        : 'Zaawansowany'}
                    </Badge>
                  </div>
                </>
              )}
            </div>
          );
        })}
      
      </CardContent>
    </Card>
  );
};