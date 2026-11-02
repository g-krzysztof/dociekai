import { Button } from '@/components/ui/button';
import { BuggyRobotGame } from './BuggyRobotGame';

interface Slid05Props {
  onNext?: () => void;
}

export const Slid05 = ({ onNext }: Slid05Props) => {
  return (
    <div className="w-full mx-auto px-2 sm:px-4">
      <h2 className="text-base sm:text-lg mb-4"><span className="font-bold">wyzwanie 3</span>: Ostatnie wyzwanie! Ten program ma najwięcej błędów - znajdź je wszystkie!</h2>
      <BuggyRobotGame
        config={{
          GRID: 5,
          startRobot: { x: 0, y: 4 },
          applePos: { x: 4, y: 0 },
          obstacles: [{ x: 1, y: 3 }, { x: 2, y: 2 }, { x: 3, y: 1 }],
        }}
        initialSequence={['up', 'right', 'left', 'right', 'up', 'left', 'right', 'up', 'right', 'left', 'up', 'pick']}
      />

      <div className="flex justify-end mt-6 sm:mt-8">
        <Button onClick={onNext}>Idź dalej!</Button>
      </div>
    </div>
  );
};
