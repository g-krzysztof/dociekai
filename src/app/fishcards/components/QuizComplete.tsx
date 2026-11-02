'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy } from 'lucide-react';
import { useApp } from '@/components/app-context';

interface QuizCompleteProps {
  quizCorrect: number;
  quizIncorrect: number;
  onRestart: () => void;
  onSwitchToFlashcards: () => void;
}

export const QuizComplete: React.FC<QuizCompleteProps> = ({
  quizCorrect,
  quizIncorrect,
  onRestart,
  onSwitchToFlashcards,
}) => {
  const { sidebarHeight } = useApp();
  const totalQuestions = quizCorrect + quizIncorrect;
  const accuracy = totalQuestions > 0 ? Math.round((quizCorrect / totalQuestions) * 100) : 0;

  return (
    <div 
      className="container mx-auto px-4 py-8"
      style={{ 
        minHeight: sidebarHeight.expandedSetsHeight > 0 
          ? `${sidebarHeight.expandedSetsHeight + 400}px` 
          : '100vh' 
      }}
    >
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4">🐟 Fishcards</h1>
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">🎯 Quiz ukończony!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2" data-testid="quiz-complete-score">
                {quizCorrect}/{totalQuestions}
              </div>
              <p className="text-lg text-muted-foreground" data-testid="quiz-complete-accuracy">Dokładność: {accuracy}%</p>
              {accuracy === 100 && (
                <div className="flex items-center justify-center gap-2 mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  <span className="text-yellow-700 font-medium">
                    Gratulacje! Zestaw ukończony na 100%!
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-green-600">✅ Poprawne:</span>
                <span className="font-medium">{quizCorrect}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-red-600">❌ Niepoprawne:</span>
                <span className="font-medium">{quizIncorrect}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button onClick={onRestart} className="w-full" data-testid="quiz-complete-restart">
                🔄 Spróbuj ponownie
              </Button>
              <Button variant="outline" onClick={onSwitchToFlashcards} className="w-full" data-testid="quiz-complete-switch-flashcards">
                🃏 Przejdź do Fiszek
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};