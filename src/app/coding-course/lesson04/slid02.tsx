'use client';

import { Typography } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface Slid02Props {
  onNext?: () => void;
}

export const Slid02 = ({ onNext }: Slid02Props) => {
  const [variableValue, setVariableValue] = useState<number>(7);
  const [constantValue] = useState<number>(2019);
  const [attemptedChange, setAttemptedChange] = useState<boolean>(false);

  const changeVariable = (newValue: number) => {
    setVariableValue(newValue);
  };

  const tryChangeConstant = () => {
    setAttemptedChange(true);
    setTimeout(() => setAttemptedChange(false), 2000);
  };

  return (
    <div className="mt-6 sm:mt-12 space-y-4 sm:space-y-6 max-w-4xl mx-auto px-4">
      <Typography variant="h3" className="mb-3 sm:mb-4 text-xl sm:text-2xl">
        Spróbuj sam! Zmień zmienną i spróbuj zmienić stałą
      </Typography>

      <Typography variant="p" className="mb-4 sm:mb-6 text-sm sm:text-base">
        Poniżej masz dwa pudełka. Kliknij przyciski, aby zobaczyć różnicę między zmienną a stałą!
      </Typography>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
        {/* Variable */}
        <div className="p-4 sm:p-6 bg-blue-50 dark:bg-blue-950 rounded-xl border-2 border-blue-300 dark:border-blue-700">
          <div className="text-center mb-3 sm:mb-4">
            <div className="text-4xl sm:text-5xl mb-2">📦</div>
            <div className="font-bold text-lg sm:text-xl mb-2">Zmienna: wiek</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Możesz zmieniać!</div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg border-2 border-blue-400 dark:border-blue-600 mb-3 sm:mb-4">
            <div className="text-center">
              <div className="text-xs sm:text-sm text-muted-foreground mb-2">Obecna wartość:</div>
              <div className="text-5xl sm:text-6xl font-bold text-blue-700 dark:text-blue-300">{variableValue}</div>
            </div>
          </div>

          <div className="space-y-2">
            <Button 
              onClick={() => changeVariable(7)} 
              className="w-full"
              size="sm"
              variant={variableValue === 7 ? "default" : "outline"}
            >
              Zmień na 7 lat
            </Button>
            <Button 
              onClick={() => changeVariable(8)} 
              className="w-full"
              size="sm"
              variant={variableValue === 8 ? "default" : "outline"}
            >
              Zmień na 8 lat
            </Button>
            <Button 
              onClick={() => changeVariable(10)} 
              className="w-full"
              size="sm"
              variant={variableValue === 10 ? "default" : "outline"}
            >
              Zmień na 10 lat
            </Button>
          </div>

          <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-green-100 dark:bg-green-950 rounded text-center text-green-800 dark:text-green-200 text-xs sm:text-sm">
            ✓ Zmiana się udała!
          </div>
        </div>

        {/* Constant */}
        <div className="p-4 sm:p-6 bg-purple-50 dark:bg-purple-950 rounded-xl border-2 border-purple-300 dark:border-purple-700">
          <div className="text-center mb-3 sm:mb-4">
            <div className="text-4xl sm:text-5xl mb-2">🔒</div>
            <div className="font-bold text-lg sm:text-xl mb-2">Stała: ROK_URODZENIA</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Nie można zmienić!</div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg border-2 border-purple-400 dark:border-purple-600 mb-3 sm:mb-4">
            <div className="text-center">
              <div className="text-xs sm:text-sm text-muted-foreground mb-2">Obecna wartość:</div>
              <div className="text-5xl sm:text-6xl font-bold text-purple-700 dark:text-purple-300">{constantValue}</div>
            </div>
          </div>

          <div className="space-y-2">
            <Button 
              onClick={tryChangeConstant}
              className="w-full"
              size="sm"
              variant="outline"
            >
              Spróbuj zmienić na 2020
            </Button>
            <Button 
              onClick={tryChangeConstant}
              className="w-full"
              size="sm"
              variant="outline"
            >
              Spróbuj zmienić na 2021
            </Button>
            <Button 
              onClick={tryChangeConstant}
              className="w-full"
              size="sm"
              variant="outline"
            >
              Spróbuj zmienić na 2022
            </Button>
          </div>

          {attemptedChange && (
            <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-red-100 dark:bg-red-950 rounded text-center text-red-800 dark:text-red-200 text-xs sm:text-sm animate-pulse">
              ✗ Błąd! Nie można zmienić stałej!
            </div>
          )}

          {!attemptedChange && (
            <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-purple-100 dark:bg-purple-900 rounded text-center text-purple-800 dark:text-purple-200 text-xs sm:text-sm">
              🔒 Stała jest chroniona
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-yellow-50 dark:bg-yellow-950 rounded-lg border-2 border-yellow-300 dark:border-yellow-700">
        <Typography variant="h4" className="mb-2 sm:mb-3 text-yellow-900 dark:text-yellow-100 text-base sm:text-lg">
          💡 Zapamiętaj!
        </Typography>
        <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm">
          <li><strong>Zmienna</strong> - możesz zmieniać jej wartość ile razy chcesz</li>
          <li><strong>Stała</strong> - raz ustawiona, nie można jej już zmienić</li>
          <li>Stałe używamy dla wartości, które zawsze są takie same (np. liczba dni w tygodniu)</li>
          <li>Zmienne używamy dla wartości, które mogą się zmieniać (np. wiek, punkty w grze)</li>
        </ul>
      </div>
      
      <div className="flex justify-end mt-6 sm:mt-8">
        <Button onClick={onNext}>Idź dalej!</Button>
      </div>
    </div>
  );
};
