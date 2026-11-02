import { Button } from '@/components/ui/button';
import { BuggyRobotGame } from './BuggyRobotGame';

interface Slid04Props {
  onNext?: () => void;
}

export const Slid04 = ({ onNext }: Slid04Props) => {
  return (
    <div className="w-full mx-auto px-2 sm:px-4">
      <h2 className="text-base sm:text-lg mb-4"><span className="font-bold">wyzwanie 2</span>: Kolejny błędny program! Usuń niepotrzebne kroki i popraw kolejność.</h2>
      <BuggyRobotGame
        config={{
          GRID: 5,
          startRobot: { x: 0, y: 4 },
          applePos: { x: 4, y: 1 },
          obstacles: [{ x: 2, y: 3 }, { x: 3, y: 2 }, { x: 1, y: 1 }],
        }}
        initialSequence={['right', 'right', 'left', 'up', 'right', 'left', 'up', 'right', 'up', 'right', 'left', 'pick']}
      />

      <div className="flex justify-end mt-6 sm:mt-8">
        <Button onClick={onNext}>Idź dalej!</Button>
      </div>
    </div>
  );
};
