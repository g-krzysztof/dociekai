import { Typography } from '@/components/ui/typography';
import { Button } from '@/components/ui/button';

interface Slid01Props {
  onNext?: () => void;
}

export const Slid01 = ({ onNext }: Slid01Props) => {
  return (
    <div className="mt-6 sm:mt-12 space-y-4 sm:space-y-6 max-w-3xl mx-auto px-4">
      <Typography variant="h3" className="mb-3 sm:mb-4 text-xl sm:text-2xl">
        Zmienna vs Stała
      </Typography>

      <Typography variant="lead" className="mb-4 sm:mb-6 text-base sm:text-lg">
        Poznaliśmy już zmienne - pudełka, w których możemy przechowywać dane. 
        Ale co jeśli chcemy, żeby niektóre wartości nigdy się nie zmieniały?
      </Typography>

      <Typography variant="p" className="text-sm sm:text-base">
        Wyobraź sobie, że masz dwa pudełka:
      </Typography>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 my-4 sm:my-6">
        <div className="p-4 sm:p-6 bg-blue-50 dark:bg-blue-950 rounded-lg border-2 border-blue-300 dark:border-blue-700">
          <div className="text-center mb-3 sm:mb-4">
            <div className="text-3xl sm:text-4xl mb-2">📦</div>
            <div className="font-bold text-base sm:text-lg">Zmienna</div>
          </div>
          <Typography variant="p" className="text-xs sm:text-sm">
            To pudełko, które <strong>możesz otworzyć</strong> i zmienić zawartość ile razy chcesz.
            Dzisiaj jest tam liczba 5, jutro możesz włożyć liczbę 10.
          </Typography>
          <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-white dark:bg-gray-800 rounded border">
            <code className="text-xs">
              <span className="text-blue-700 dark:text-blue-300">wiek</span> = 7<br/>
              <span className="text-blue-700 dark:text-blue-300">wiek</span> = 8 <span className="text-green-600 dark:text-green-400">✓ Można zmienić!</span>
            </code>
          </div>
        </div>

        <div className="p-4 sm:p-6 bg-purple-50 dark:bg-purple-950 rounded-lg border-2 border-purple-300 dark:border-purple-700">
          <div className="text-center mb-3 sm:mb-4">
            <div className="text-3xl sm:text-4xl mb-2">🔒</div>
            <div className="font-bold text-base sm:text-lg">Stała</div>
          </div>
          <Typography variant="p" className="text-xs sm:text-sm">
            To pudełko <strong>zamknięte na kłódkę</strong>. Możesz zobaczyć co w środku, 
            ale nie możesz tego zmienić. Raz włożysz wartość i już zostaje na zawsze.
          </Typography>
          <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-white dark:bg-gray-800 rounded border">
            <code className="text-xs">
              <span className="text-purple-700 dark:text-purple-300">ROK_URODZENIA</span> = 2019<br/>
              <span className="text-purple-700 dark:text-purple-300">ROK_URODZENIA</span> = 2020 <span className="text-red-600 dark:text-red-400">✗ Nie można!</span>
            </code>
          </div>
        </div>
      </div>

      <Typography variant="p" className="text-sm sm:text-base">
        <strong>Kiedy używamy stałych?</strong> Gdy mamy wartości, które zawsze są takie same, 
        np. liczba dni w tygodniu (7), liczba miesięcy w roku (12), czy Twój rok urodzenia.
      </Typography>

      <Typography variant="blockquote" className="border-l-primary text-sm sm:text-base">
        Zmienna = pudełko, które można zmieniać 📦<br/>
        Stała = pudełko zamknięte na kłódkę 🔒
      </Typography>
      
      <div className="flex justify-end mt-6 sm:mt-8">
        <Button onClick={onNext}>Idź dalej!</Button>
      </div>
    </div>
  );
};
