'use client';

import { Typography } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface Slid05Props {
  onNext?: () => void;
}

export const Slid05 = ({ onNext }: Slid05Props) => {
  const [actions, setActions] = useState<string[]>([]);

  const addAction = (action: string) => {
    setActions([...actions, action]);
  };

  const removeAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setActions([]);
  };

  const actionButtons = [
    { id: 'up', label: 'góra', icon: '⬆️', value: 'góra' },
    { id: 'left', label: 'lewo', icon: '⬅️', value: 'lewo' },
    { id: 'right', label: 'prawo', icon: '➡️', value: 'prawo' },
    { id: 'pick', label: 'podnieś', icon: '🤖', value: 'podnieś' },
  ];

  return (
    <div className="mt-6 sm:mt-12 space-y-4 sm:space-y-6 max-w-4xl mx-auto px-4">
      <Typography variant="h3" className="mb-3 sm:mb-4 text-xl sm:text-2xl">
        Zmienne i tablice w praktyce!
      </Typography>

      <Typography variant="lead" className="mb-4 sm:mb-6 text-base sm:text-lg">
        Pamiętasz grę z robotem? Tam właśnie używaliśmy zmiennych i tablic!
      </Typography>

      <div className="bg-yellow-50 dark:bg-yellow-950 border-2 border-yellow-300 dark:border-yellow-700 rounded-lg p-3 sm:p-6 mb-4 sm:mb-6">
        <Typography variant="h4" className="mb-2 sm:mb-3 text-yellow-900 dark:text-yellow-100 text-base sm:text-lg">
          💡 Jak to działa?
        </Typography>
        
        <div className="space-y-2 sm:space-y-3">
          <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="font-semibold mb-2 text-sm sm:text-base">1. Każdy ruch to zmienna:</div>
            <div className="font-mono text-xs sm:text-sm bg-gray-100 dark:bg-gray-900 p-2 rounded overflow-x-auto">
              <span className="text-blue-700 dark:text-blue-300">kierunek</span> = <span className="text-purple-700 dark:text-purple-300">&quot;góra&quot;</span>
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground mt-2">
              Każde polecenie (góra, lewo, prawo, podnieś) to wartość, którą można przypisać do zmiennej!
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="font-semibold mb-2 text-sm sm:text-base">2. Program to tablica akcji:</div>
            <div className="font-mono text-xs sm:text-sm bg-gray-100 dark:bg-gray-900 p-2 rounded overflow-x-auto">
              <span className="text-blue-700 dark:text-blue-300">program</span> = [<span className="text-purple-700 dark:text-purple-300">&quot;góra&quot;</span>, <span className="text-purple-700 dark:text-purple-300">&quot;prawo&quot;</span>, <span className="text-purple-700 dark:text-purple-300">&quot;podnieś&quot;</span>]
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground mt-2">
              Wszystkie ruchy robota zapisane w tablicy wykonują się kolejno, jeden po drugim!
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="font-semibold mb-2 text-sm sm:text-base">3. Komputer czyta tablicę krok po kroku:</div>
            <div className="text-xs sm:text-sm space-y-1">
              <div>Krok 1: wykonaj <code className="bg-gray-200 dark:bg-gray-700 px-1 text-xs">program[0]</code> → &quot;góra&quot;</div>
              <div>Krok 2: wykonaj <code className="bg-gray-200 dark:bg-gray-700 px-1 text-xs">program[1]</code> → &quot;prawo&quot;</div>
              <div>Krok 3: wykonaj <code className="bg-gray-200 dark:bg-gray-700 px-1 text-xs">program[2]</code> → &quot;podnieś&quot;</div>
            </div>
          </div>
        </div>
      </div>

      <Typography variant="p" className="mb-3 sm:mb-4 text-sm sm:text-base">
        <strong>Spróbuj sam!</strong> Stwórz program dla robota, klikając polecenia poniżej:
      </Typography>

      <div className="bg-blue-50 dark:bg-blue-950 rounded-lg border-2 border-blue-200 dark:border-blue-800 p-3 sm:p-6">
        <div className="font-mono text-xs sm:text-sm mb-3 sm:mb-4 text-blue-900 dark:text-blue-100 overflow-x-auto">
          program = [
          {actions.length > 0 && (
            <span className="text-purple-700">
              {actions.map((a, i) => (
                <span key={i}>
                  &quot;{a}&quot;{i < actions.length - 1 ? ', ' : ''}
                </span>
              ))}
            </span>
          )}
          ]
        </div>

        <div className="text-xs text-muted-foreground mb-3 sm:mb-4 text-center">
          {actions.length === 0 ? 'Twój program jest pusty - dodaj polecenia!' : `Program ma ${actions.length} poleceń`}
        </div>

        {/* Action buttons */}
        <div className="mb-3 sm:mb-4">
          <div className="text-xs sm:text-sm font-semibold mb-2 text-center">Dostępne polecenia (kliknij, aby dodać):</div>
          <div className="flex gap-2 sm:gap-3 justify-center flex-wrap">
            {actionButtons.map((action) => (
              <button
                key={action.id}
                onClick={() => addAction(action.value)}
                className="w-20 h-16 sm:w-28 sm:h-20 bg-white dark:bg-gray-800 border-2 border-blue-400 dark:border-blue-600 rounded-lg flex flex-col items-center justify-center shadow hover:shadow-lg hover:scale-105 transition-all cursor-pointer"
              >
                <div className="text-2xl sm:text-3xl mb-1">{action.icon}</div>
                <div className="text-xs font-medium">{action.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Display program sequence */}
        {actions.length > 0 && (
          <div className="mt-3 sm:mt-4">
            <div className="text-xs sm:text-sm font-semibold mb-2 text-center">Twój program (tablica poleceń):</div>
            <div className="flex gap-2 items-center justify-center flex-wrap">
              {actions.map((action, idx) => {
                const actionBtn = actionButtons.find((a) => a.value === action);
                return (
                  <div
                    key={idx}
                    onClick={() => removeAction(idx)}
                    className="relative w-16 h-16 sm:w-20 sm:h-20 bg-white dark:bg-gray-800 border-2 border-green-400 dark:border-green-600 rounded-lg flex flex-col items-center justify-center shadow cursor-pointer hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                    title="Kliknij, aby usunąć"
                  >
                    <div className="absolute -top-2 -left-2 bg-blue-500 text-white rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center text-xs font-bold">
                      {idx}
                    </div>
                    <div className="text-xl sm:text-2xl mb-1">{actionBtn?.icon}</div>
                    <div className="text-xs">{action}</div>
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-xs">
                      ×
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="text-center mt-3">
              <Button variant="outline" size="sm" onClick={clearAll}>
                Wyczyść program
              </Button>
            </div>
          </div>
        )}
        
        <div className="text-center mt-3 sm:mt-4 text-xs sm:text-sm text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900 p-2 sm:p-3 rounded">
          <strong>To jest dokładnie to, co robiłeś w grze z robotem!</strong><br />
          Każdy program to tablica zmiennych z poleceniami! 🤖
        </div>
      </div>

      <Typography variant="blockquote" className="border-l-primary mt-4 sm:mt-6 text-sm sm:text-base">
        Teraz rozumiesz: programy w grach używają zmiennych i tablic do przechowywania poleceń!
        Każdy ruch robota to zmienna, a cała sekwencja ruchów to tablica!
      </Typography>
      
      <div className="flex justify-end mt-6 sm:mt-8">
        <Button onClick={onNext}>Idź dalej!</Button>
      </div>
    </div>
  );
};
