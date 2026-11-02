import { Typography } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';

interface Slid02Props {
  onNext?: () => void;
}

export const Slid02 = ({ onNext }: Slid02Props) => {
  return (
    <div className="mt-6 sm:mt-12 space-y-4 sm:space-y-6">
      <div className="max-w-3xl mx-auto mb-6 sm:mb-8 px-4">
        <Typography variant="h3" className="mb-3 sm:mb-4 text-xl sm:text-2xl">
          Znajdź i napraw błędy!
        </Typography>

        <Typography variant="lead" className="mb-4 sm:mb-6 text-base sm:text-lg">
          Program w kolejnym slajdzie ma błędy! Robot nie może dotrzeć do jabłka, ponieważ 
          w sekwencji poleceń są niepotrzebne kroki.
        </Typography>

        <Typography variant="p" className="text-sm sm:text-base">
          <strong>Twoje zadanie:</strong> Usuń błędne polecenia z programu, oraz przesuń polecenia na odpowiednie miejsca, aby robot 
          mógł dotrzeć do jabłka. Kliknij przycisk × na poleceniu, które chcesz usunąć. Złap myszką i przeciągnij polecenie, które chcesz przestawić.
        </Typography>
      </div>

      <div className="flex justify-end mt-6 sm:mt-8 max-w-3xl mx-auto px-4">
        <Button onClick={onNext}>Idź dalej!</Button>
      </div>
    </div>
  );
};
