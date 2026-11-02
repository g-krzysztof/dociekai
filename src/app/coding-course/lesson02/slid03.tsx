import { Button } from '@/components/ui/button';
import { BuggyRobotGame } from './BuggyRobotGame';

interface Slid03Props {
  onNext?: () => void;
}

export const Slid03 = ({ onNext }: Slid03Props) => {
  return (
    <div className="w-full mx-auto px-2 sm:px-4">
      <h2 className="text-base sm:text-lg mb-4"><span className="font-bold">wyzwanie 1</span>: Popraw program tak, aby doprowadzić robota do jabłka i podnieść je.</h2>
      <BuggyRobotGame
        config={{
          GRID: 5,
          startRobot: { x: 0, y: 4 },
          applePos: { x: 3, y: 1 },
          obstacles: [{ x: 1, y: 2 }, { x: 2, y: 3 }],
        }}
      />

      <div className="flex justify-end mt-6 sm:mt-8">
        <Button onClick={onNext}>Idź dalej!</Button>
      </div>
    </div>
  );
};
