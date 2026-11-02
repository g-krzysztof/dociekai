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
          Czas na zabawę ze zmiennymi!
        </Typography>

        <Typography variant="lead" className="mb-4 sm:mb-6 text-base sm:text-lg">
          Teraz zobaczysz pudełka (zmienne) i różne wartości. Twoim zadaniem jest 
          przeciągnąć odpowiednią wartość do odpowiedniego pudełka.
        </Typography>

        <Typography variant="p" className="mb-3 sm:mb-4 text-sm sm:text-base">
          <strong>Jak grać?</strong>
        </Typography>
        
        <ul className="list-disc list-inside space-y-2 mb-4 text-sm sm:text-base">
          <li>Zobacz pudełka ze zmiennymi: <code className="bg-muted px-2 py-1 rounded text-xs sm:text-sm">wiek</code>, <code className="bg-muted px-2 py-1 rounded text-xs sm:text-sm">imię</code>, <code className="bg-muted px-2 py-1 rounded text-xs sm:text-sm">maZwierzaka</code></li>
          <li>Przeciągnij wartości (liczby, słowa, prawda/fałsz) do odpowiednich pudełek</li>
          <li>Każde pudełko może pomieścić tylko odpowiedni typ danych</li>
          <li>Kliknij &ldquo;Sprawdź&rdquo; aby zobaczyć, czy dobrze przypisałeś wartości!</li>
        </ul>
      </div>

      <div className="flex justify-end mt-6 sm:mt-8 max-w-3xl mx-auto px-4">
        <Button onClick={onNext}>Idź dalej!</Button>
      </div>
    </div>
  );
};
