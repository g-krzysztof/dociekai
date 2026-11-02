import { Button } from '@/components/ui/button';
import { VariableGame } from './VariableGame';

interface Slid03Props {
  onNext?: () => void;
}

export const Slid03 = ({ onNext }: Slid03Props) => {
  return (
    <div className="w-full mx-auto px-2 sm:px-4">
      <h2 className="text-base sm:text-lg mb-4">
        <span className="font-bold">wyzwanie 1</span>: Przypisz wartości do zmiennych!
      </h2>
      <div className="mt-4 sm:mt-6">
        <VariableGame />
      </div>

      <div className="flex justify-end mt-6 sm:mt-8">
        <Button onClick={onNext}>Idź dalej!</Button>
      </div>
    </div>
  );
};
