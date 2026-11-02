'use client';

import { Button } from '@/components/ui/button';
import { RobotGame } from '../lesson01/RobotGame';

interface Slid03Props {
  onNext?: () => void;
}

export const Slid03 = ({ onNext }: Slid03Props) => {
  return (
    <div className="max-w-[1336px] mx-auto p-4">
      <h2 className="mb-6">
        <span className="font-bold">Stałe w grze z robotem</span>
      </h2>

      <div className="mb-6 space-y-4">
        <p className="text-lg">
          W grze z robotem używamy <strong>stałej</strong> do określenia rozmiaru planszy. 
          Zobacz, jak wygląda plansza o stałym rozmiarze <strong>ROZMIAR_PLANSZY = 5</strong>.
        </p>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg border-2 border-purple-300 dark:border-purple-700">
            <h4 className="font-bold mb-2 text-purple-900 dark:text-purple-100">💻 Kod gry</h4>
            <div className="bg-gray-900 dark:bg-gray-950 p-3 rounded font-mono text-xs text-gray-100">
              <div><span className="text-purple-400">const</span> <span className="text-yellow-300">ROZMIAR_PLANSZY</span> = <span className="text-green-300">5</span>;</div>
              <div className="text-gray-500 mt-1">{`// 🔒 Ta wartość jest stała!`}</div>
            </div>
          </div>

          <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border-2 border-yellow-300 dark:border-yellow-700">
            <h4 className="font-bold mb-2 text-yellow-900 dark:text-yellow-100">🔒 Dlaczego stała?</h4>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>Rozmiar <strong>nie zmienia się</strong> podczas gry</li>
              <li>Wszyscy grają na tej samej planszy</li>
              <li>Łatwiej tworzyć poziomy</li>
            </ul>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border-2 border-blue-300 dark:border-blue-700">
            <h4 className="font-bold mb-2 text-blue-900 dark:text-blue-100">💡 Wskazówka</h4>
            <p className="text-sm">
              W następnym slajdzie zobaczysz, co się stanie, gdy zmienimy stałą na zmienną!
            </p>
          </div>
        </div>
      </div>

      <RobotGame
        config={{
          GRID: 5,
          startRobot: { x: 0, y: 4 },
          applePos: { x: 4, y: 0 },
          obstacles: [
            { x: 2, y: 2 },
            { x: 2, y: 3 },
            { x: 3, y: 2 },
          ],
        }}
      />

      <div className="flex justify-end mt-8">
        <Button onClick={onNext}>Zobacz jak działa zmienna!</Button>
      </div>
    </div>
  );
};
