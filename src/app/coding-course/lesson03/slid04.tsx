'use client';

import { Typography } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface Slid04Props {
  onNext?: () => void;
}

interface Fruit {
  name: string;
  emoji: string;
}

const availableFruits: Fruit[] = [
  { name: 'jabłko', emoji: '🍎' },
  { name: 'banan', emoji: '🍌' },
  { name: 'gruszka', emoji: '🍐' },
  { name: 'truskawka', emoji: '🍓' },
  { name: 'pomarańcza', emoji: '🍊' },
];

export const Slid04 = ({ onNext }: Slid04Props) => {
  const [selectedFruits, setSelectedFruits] = useState<Fruit[]>([]);

  const addFruit = (fruit: Fruit) => {
    setSelectedFruits([...selectedFruits, fruit]);
  };

  const removeFruit = (index: number) => {
    setSelectedFruits(selectedFruits.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setSelectedFruits([]);
  };

  return (
    <div className="mt-6 sm:mt-12 space-y-4 sm:space-y-6 max-w-3xl mx-auto px-4">
      <Typography variant="h3" className="mb-3 sm:mb-4 text-xl sm:text-2xl">
        Tablica - półka na pudełka
      </Typography>

      <Typography variant="lead" className="mb-4 sm:mb-6 text-base sm:text-lg">
        Co jeśli chcemy przechować wiele rzeczy tego samego typu? Wtedy używamy tablicy!
      </Typography>

      <Typography variant="p" className="text-sm sm:text-base">
        Wyobraź sobie półkę, na której możesz ustawić kilka pudełek obok siebie. 
        W każdym pudełku jest jakaś wartość, a ty możesz łatwo po kolei odczytać, co jest 
        w pierwszym, drugim, trzecim pudełku.
      </Typography>

      <Typography variant="p" className="text-sm sm:text-base">
        <strong>Ważne:</strong> Tablica to też zmienna! Tylko że zamiast przechowywać jedną wartość 
        (jak <code className="bg-muted px-2 py-1 rounded text-xs sm:text-sm">wiek</code> lub <code className="bg-muted px-2 py-1 rounded text-xs sm:text-sm">imię</code>), 
        tablica przechowuje wiele wartości naraz.
      </Typography>

      <Typography variant="p" className="mb-3 sm:mb-4 text-sm sm:text-base">
        Na przykład: masz tablicę-zmienną o nazwie <code className="bg-muted px-2 py-1 rounded text-xs sm:text-sm">ulubioneOwoce</code>. 
        Kliknij na owoce poniżej, aby dodać je do tablicy!
      </Typography>

      <div className="my-4 sm:my-6 p-3 sm:p-6 bg-blue-50 dark:bg-blue-950 rounded-lg border-2 border-blue-200 dark:border-blue-800">
        <div className="font-mono text-xs sm:text-sm mb-2 text-blue-900 dark:text-blue-100">
          ulubioneOwoce = [
          {selectedFruits.length > 0 && (
            <span className="text-purple-700">
              {selectedFruits.map((f, i) => (
                <span key={i}>
                  &quot;{f.name}&quot;{i < selectedFruits.length - 1 ? ', ' : ''}
                </span>
              ))}
            </span>
          )}
          ]
        </div>

        <div className="text-xs text-muted-foreground mb-3 sm:mb-4 text-center">
          {selectedFruits.length === 0 ? 'Tablica jest pusta - kliknij owoce, żeby je dodać!' : `Tablica ma ${selectedFruits.length} element${selectedFruits.length === 1 ? '' : selectedFruits.length < 5 ? 'y' : 'ów'}`}
        </div>

        {/* Available fruits to click */}
        <div className="mb-3 sm:mb-4">
          <div className="text-xs sm:text-sm font-semibold mb-2 text-center">Dostępne owoce (kliknij, aby dodać):</div>
          <div className="flex gap-2 items-center justify-center flex-wrap">
            {availableFruits.map((fruit, idx) => (
              <button
                key={idx}
                onClick={() => addFruit(fruit)}
                className="w-16 h-16 sm:w-20 sm:h-20 bg-white dark:bg-gray-800 border-2 border-blue-400 dark:border-blue-600 rounded-lg flex items-center justify-center shadow hover:shadow-lg hover:scale-105 transition-all cursor-pointer"
              >
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl">{fruit.emoji}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Display selected fruits in array */}
        {selectedFruits.length > 0 && (
          <div className="mt-3 sm:mt-4">
            <div className="text-xs sm:text-sm font-semibold mb-2 text-center">Twoja tablica (półka z pudełkami):</div>
            <div className="flex gap-2 items-center justify-center flex-wrap">
              {selectedFruits.map((fruit, idx) => (
                <div
                  key={idx}
                  onClick={() => removeFruit(idx)}
                  className="w-20 h-20 sm:w-24 sm:h-24 bg-white dark:bg-gray-800 border-2 border-green-400 dark:border-green-600 rounded-lg flex items-center justify-center shadow cursor-pointer hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors relative"
                  title="Kliknij, aby usunąć"
                >
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl">{fruit.emoji}</div>
                    <div className="text-xs mt-1">{fruit.name}</div>
                  </div>
                  <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-xs">
                    ×
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-3">
              <Button variant="outline" size="sm" onClick={clearAll}>
                Wyczyść tablicę
              </Button>
            </div>
          </div>
        )}
        
        <div className="text-center mt-3 text-xs sm:text-sm text-blue-700 dark:text-blue-300">
          Półka (tablica-zmienna) z pudełkami (elementami)
        </div>
      </div>

      <Typography variant="p" className="text-sm sm:text-base">
        W programowaniu tablicę zapisujemy używając nawiasów kwadratowych <code className="bg-muted px-2 py-1 rounded text-xs sm:text-sm">[ ]</code>. 
        Możemy w niej przechowywać wiele wartości tego samego typu - liczby, słowa, czy cokolwiek innego!
      </Typography>

      <Typography variant="blockquote" className="border-l-primary text-sm sm:text-base">
        Tablica to specjalny rodzaj zmiennej - półka, na której stoją pudełka (elementy) w określonej kolejności.
      </Typography>
      
      <div className="flex justify-end mt-6 sm:mt-8">
        <Button onClick={onNext}>Idź dalej!</Button>
      </div>
    </div>
  );
};
