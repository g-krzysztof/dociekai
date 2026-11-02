import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileX, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="bg-background flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4 py-24">
        <div className="mb-8">
          <FileX className="w-24 h-24 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-4xl font-bold mb-4 text-foreground">404 - Strona nie znaleziona</h1>
          <p className="text-muted-foreground text-lg mb-8">
            Przepraszamy, ale strona o podanym adresie nie istnieje. Sprawdź czy adres jest poprawny
            lub wróć na stronę główną.
          </p>
        </div>

        <div className="space-y-4 flex justify-center">
          <Link href="/" className="pr-3">
            <Button className="bg-cyan-500 hover:bg-cyan-600 text-white">
              <Home className="w-4 h-4 mr-2" />
              Strona główna
            </Button>
          </Link>
          <Link href="/blog" className="pl-3">
            <Button variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Przejdź do bloga
            </Button>
          </Link>
        </div>

        <div className="mt-8 text-sm text-muted-foreground">
          <p>Kod błędu: 404</p>
        </div>
      </div>
    </div>
  );
}
