import { Typography } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';

interface Slid01Props {
  onNext?: () => void;
}

export const Slid01 = ({ onNext }: Slid01Props) => {
  return (
    <div className="mt-6 sm:mt-12 space-y-4 sm:space-y-6 max-w-3xl mx-auto px-4">
      <Typography variant="h3" className="mb-3 sm:mb-4 text-xl sm:text-2xl">
        Co to jest zmienna?
      </Typography>

      <Typography variant="lead" className="mb-4 sm:mb-6 text-base sm:text-lg">
        Zmienna to jak pudełko, w którym komputer przechowuje różne rzeczy - liczby, słowa, czy inne informacje.
      </Typography>

      <Typography variant="p" className="text-sm sm:text-base">
        Wyobraź sobie, że masz kilka pudełek. Każde pudełko ma swoją naklejkę z nazwą, 
        na przykład &ldquo;wiek&rdquo;, &ldquo;imię&rdquo; lub &ldquo;punkty&rdquo;. Do każdego pudełka możesz 
        włożyć odpowiednią rzecz: do pudełka &ldquo;wiek&rdquo; — liczbę lat, do pudełka &ldquo;imię&rdquo; — swoje imię.
      </Typography>

      <Typography variant="p" className="text-sm sm:text-base">
        W programowaniu takie pudełka nazywamy <strong>zmiennymi</strong>. Dzięki nim komputer 
        pamięta różne informacje i może z nich korzystać później.
      </Typography>

      <Typography variant="blockquote" className="border-l-primary text-sm sm:text-base">
        Zmienna = pudełko z nazwą, w którym trzymamy dane.
      </Typography>
      <div className="flex justify-end mt-6 sm:mt-8">
        <Button onClick={onNext}>Idź dalej!</Button>
      </div>
    </div>
  );
};
