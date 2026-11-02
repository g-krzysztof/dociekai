import { Typography } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';

interface Slid01Props {
  onNext?: () => void;
}

export const Slid01 = ({ onNext }: Slid01Props) => {
  return (
    <div className="mt-6 sm:mt-12 space-y-4 sm:space-y-6 max-w-3xl mx-auto px-4">
      <Typography variant="h3" className="mb-3 sm:mb-4 text-xl sm:text-2xl">
        Błędy się zdarzają!
      </Typography>

      <Typography variant="lead" className="mb-4 sm:mb-6 text-base sm:text-lg">
        Nawet najlepsi programiści robią błędy. To całkowicie normalne!
      </Typography>

      <Typography variant="p" className="text-sm sm:text-base">
        W programowaniu błędy nazywamy &ldquo;bugami&rdquo;. Kiedy program nie działa tak, jak powinien,
        to znaczy, że gdzieś jest bug. Znalezienie i naprawienie błędów to bardzo ważna
        część programowania!
      </Typography>

      <Typography variant="blockquote" className="border-l-primary text-sm sm:text-base">
        Pamiętaj: każdy błąd to okazja do nauki. Im więcej błędów znajdziesz i naprawisz,
        tym lepszym programistą się staniesz!
      </Typography>
      <div className="flex justify-end mt-6 sm:mt-8">
        <Button onClick={onNext}>Idź dalej!</Button>
      </div>
    </div>
  );
};
