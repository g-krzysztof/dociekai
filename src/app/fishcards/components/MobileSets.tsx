'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  CheckCircle,
  BookOpen,
} from 'lucide-react';
import { FlashcardSet } from './types';

interface MobileSetsProps {
  sets: FlashcardSet[];
  currentSet: FlashcardSet;
  userProgress: Record<string, { flashcards: number; quiz: number }>;
  onSetChange: (set: FlashcardSet) => void;
}

export const MobileSets: React.FC<MobileSetsProps> = ({
  sets,
  currentSet,
  userProgress,
  onSetChange,
}) => {

  const getProgressInfo = (set: FlashcardSet) => {
    const progress = userProgress[set.id];
    if (!progress) return { completed: 0, total: set.cards.length, percentage: 0 };
    
    const averageProgress = (progress.flashcards + progress.quiz) / 2;
    return {
      completed: Math.round((averageProgress / 100) * set.cards.length),
      total: set.cards.length,
      percentage: Math.round(averageProgress)
    };
  };

  return (
    <div className="lg:hidden">
      {/* Sets List */}
      <div className="p-4">
        <div className="space-y-3">
          {sets.map((set) => {
            const progressInfo = getProgressInfo(set);
            const isActive = currentSet.id === set.id;
            
            return (
              <Card
                key={set.id}
                className={`cursor-pointer transition-all p-[0] ${
                  isActive 
                    ? 'ring-2 ring-primary bg-primary/5' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => onSetChange(set)}
              >
                <CardContent className={`${'p-4'}`}>
                  <div className={`flex items-center gap-3`}>
                    
                    {/* Set Info */}
                    <div className={`flex-1 min-w-0`}>
                      <h3 className={`font-medium text-base truncate`}>
                        {set.name}
                      </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {set.description}
                        </p>
                      
                      {/* Badges */}
                      <div className={`flex items-center gap-1 mt-2`}>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="outline" className="text-xs">
                            {set.category}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {set.difficulty === 'beginner'
                              ? 'Początkujący'
                              : set.difficulty === 'intermediate'
                              ? 'Średni'
                              : 'Zaawansowany'}
                          </Badge>
                        </div>
                        
                        {/* Progress */}
                        <div className={`flex items-center gap-2 text-xs text-muted-foreground`}>
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            <span>{set.cards.length}</span>
                          </div>
                          {progressInfo.percentage > 0 && (
                            <div className="flex items-center gap-1">
                              <CheckCircle className="h-3 w-3 text-green-600" />
                              <span>{progressInfo.percentage}%</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {sets.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Brak zestawów</h3>
          </div>
        )}
      </div>
    </div>
  );
};