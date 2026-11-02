import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileX } from 'lucide-react';

export function generateMetadata() {
  return {
    title: `Strona nie znaleziona | Dociekai Blog`,
    description: `Strona o podanym adresie nie istnieje. Sprawdź inne artykuły na blogu Dociekai o kompetencjach przyszłości dla dzieci.`,
    robots: 'noindex, nofollow',
  };
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mb-8">
          <FileX className="w-24 h-24 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-4xl font-bold mb-4 text-foreground">Artykuł nie znaleziony</h1>
          <p className="text-muted-foreground text-lg mb-8">
            Przepraszamy, ale artykuł o podanym adresie nie istnieje lub został przeniesiony.
          </p>
        </div>

        <div className="space-y-4">
          <Link href="/blog">
            <Button className="bg-cyan-500 hover:bg-cyan-600 text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Powrót do bloga
            </Button>
          </Link>
          <br />
          <Link href="/">
            <Button variant="outline">Strona główna</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
