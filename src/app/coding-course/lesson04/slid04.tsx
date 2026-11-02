'use client';

import { Button } from '@/components/ui/button';
import { RobotGame } from '../lesson01/RobotGame';
import { useState } from 'react';

interface Slid04Props {
  onNext?: () => void;
}

export const Slid04 = ({ onNext }: Slid04Props) => {
  const [gridSize, setGridSize] = useState<number>(5);

  const getObstacles = (size: number) => {
    if (size === 4) {
      return [
        { x: 1, y: 1 },
        { x: 2, y: 1 },
      ];
    }
    return [
      { x: 2, y: 2 },
      { x: 2, y: 3 },
      { x: 3, y: 2 },
    ];
  };

  const getApplePos = (size: number) => {
    return { x: size - 1, y: 0 };
  };

  const getRobotStart = (size: number) => {
    return { x: 0, y: size - 1 };
  };

  return (
    <div className="max-w-[1336px] mx-auto p-4">
      <h2 className="mb-6">
        <span className="font-bold">Zmienne w grze z robotem</span>
      </h2>

      <div className="mb-6 space-y-4">
        <p className="text-lg">
          Teraz zmieniamy stałą na <strong>zmienną</strong>! Dzięki temu możesz <strong>zmieniać rozmiar planszy</strong> podczas gry.
        </p>

        <div className="grid md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border-2 border-blue-300 dark:border-blue-700">
            <h4 className="font-bold mb-2 text-blue-900 dark:text-blue-100">💻 Kod z zmienną</h4>
            <div className="bg-gray-900 dark:bg-gray-950 p-3 rounded font-mono text-xs text-gray-100 space-y-1">
              <div><span className="text-blue-400">let</span> <span className="text-yellow-300">rozmiarPlanszy</span> = <span className="text-green-300">{gridSize}</span>;</div>
              <div className="text-gray-500">{`// 📦 Zmienna!`}</div>
              <div className="mt-2">
                <span className="text-yellow-300">rozmiarPlanszy</span> = <span className="text-green-300">4</span> <span className="text-green-400">✓</span>
              </div>
              <div>
                <span className="text-yellow-300">rozmiarPlanszy</span> = <span className="text-green-300">5</span> <span className="text-green-400">✓</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border-2 border-green-300 dark:border-green-700">
            <h4 className="font-bold mb-2 text-green-900 dark:text-green-100">📦 Zalety zmiennej</h4>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>Możesz <strong>zmieniać</strong> rozmiar</li>
              <li>Wybór poziomu trudności</li>
              <li>Gra jest elastyczna</li>
            </ul>
          </div>

          <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg border-2 border-orange-300 dark:border-orange-700">
            <h4 className="font-bold mb-2 text-orange-900 dark:text-orange-100">⚖️ Porównanie</h4>
            <div className="text-sm space-y-1">
              <div><strong>Stała:</strong> Zawsze 5×5</div>
              <div><strong>Zmienna:</strong> 4×4 lub 5×5</div>
            </div>
          </div>

          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border-2 border-gray-300 dark:border-gray-700">
            <h4 className="font-bold mb-3">🎮 Zmień rozmiar:</h4>
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => setGridSize(4)}
                variant={gridSize === 4 ? "default" : "outline"}
                size="sm"
              >
                4 × 4
              </Button>
              <Button
                onClick={() => setGridSize(5)}
                variant={gridSize === 5 ? "default" : "outline"}
                size="sm"
              >
                5 × 5
              </Button>
            </div>
            <p className="mt-2 text-xs text-center text-muted-foreground">
              Teraz: {gridSize}×{gridSize}
            </p>
          </div>
        </div>
      </div>

      <RobotGame
        key={gridSize}
        config={{
          GRID: gridSize,
          startRobot: getRobotStart(gridSize),
          applePos: getApplePos(gridSize),
          obstacles: getObstacles(gridSize),
        }}
      />

      <div className="flex justify-end mt-8">
        <Button onClick={onNext}>Idź do quizu!</Button>
      </div>
    </div>
  );
};
