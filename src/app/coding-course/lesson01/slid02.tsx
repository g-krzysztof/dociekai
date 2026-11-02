import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';

interface Slid02Props {
  onNext?: () => void;
}

export const Slid02 = ({ onNext }: Slid02Props) => {
  return (
    <div className="mt-6 sm:mt-12 flex justify-center">
      <div className="w-full max-w-5xl px-4">
        <div className="flex flex-col md:flex-row items-start gap-4 sm:gap-8">
          <div className="w-full md:w-1/2">
            <Typography variant="h3" className="mb-3 sm:mb-4 text-xl sm:text-2xl">Pierwszy program</Typography>

            <Typography variant="lead" className="mb-2 text-base sm:text-lg">Za chwilę zagrasz w grę, w której programujesz robota!</Typography>

            <Typography as="div" variant="p" className="list-disc list-inside space-y-1 text-sm sm:text-base">
              <ul>
                <li>Klikając na kierunki ustalisz jego ruchy.</li>
                <li>Wybrane ruchy możesz przeciągać, aby zmienić ich kolejność.</li>
                <li>{`Gdy klikniesz "Uruchom", robot wykona zaprogramowaną sekwencję.`}</li>
              </ul>
            </Typography>

            <Typography variant="p" className="mt-3 sm:mt-4 text-sm sm:text-base">Zobacz jak dodawać ruchy na video po prawej stronie.</Typography>
          </div>
          <div className="w-full md:w-1/2 flex justify-center">
            <video controls className="rounded-lg shadow-lg w-full max-w-[394px]">
              <source src="/video/coding-course/lesson01/robo-krok-instrukcja-1.mov" type="video/mp4" />
              Twoja przeglądarka nie obsługuje odtwarzania wideo.
            </video>
          </div>
        </div>

        <div className="flex justify-end mt-6 sm:mt-8">
          <Button onClick={onNext}>Idź dalej!</Button>
        </div>
      </div>
    </div>
  );
};
