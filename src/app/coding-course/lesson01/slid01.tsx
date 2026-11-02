import { Typography } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';

interface Slid01Props {
  onNext?: () => void;
}

export const Slid01 = ({ onNext }: Slid01Props) => {
  return (
    <div className="mt-6 sm:mt-12 space-y-4 sm:space-y-6 max-w-3xl mx-auto px-4">
      <Typography variant="h3" className="mb-3 sm:mb-4 text-xl sm:text-2xl">
        Czym jest program?
      </Typography>

      <Typography variant="lead" className="mb-4 sm:mb-6 text-base sm:text-lg">
        Program to zestaw poleceń, które komputer wykonuje krok po kroku — jak
        przepis na ciasto albo instrukcja LEGO.
      </Typography>

      <Typography variant="p" className="text-sm sm:text-base">
        Możesz wyobrazić sobie, że komputer jest jak bardzo szybki robot, który
        sam nic nie zrobi, dopóki mu nie powiesz co i w jakiej kolejności ma
        zrobić. A program to właśnie takie polecenia: &ldquo;zrób to&rdquo;, &ldquo;policz tamto&rdquo;,
        &ldquo;narysuj to&rdquo;, &ldquo;idź tutaj&rdquo;.
      </Typography>

      <Typography variant="blockquote" className="border-l-primary text-sm sm:text-base">
        Czyli: program to przepis, a komputer to kucharz, który ten przepis
        wykonuje.
      </Typography>
      <div className="flex justify-end mt-6 sm:mt-8">
        <Button onClick={onNext}>Idź dalej!</Button>
      </div>
    </div>
  );
};