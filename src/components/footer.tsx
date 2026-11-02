import Link from 'next/link';
import { Typography } from '@/components/ui/typography';
import { Logo } from '@/components/logo';
import { Mail } from 'lucide-react';
import { CookieSettingsButton } from '@/components/cookie-consent';
import { FacebookFooterLink } from '@/components/social/facebook-follow';

export function Footer() {
  return (
    <footer className="bg-secondary dark:bg-card border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo */}
          <div className="space-y-4">
            <Link href="/" className="inline-block">
              <Logo />
            </Link>
            <Typography variant="small" className="text-muted-foreground max-w-xs">
              Miejsce w sieci poświęcone rozwojowi kompetencji przyszłości u dzieci i młodzieży.
            </Typography>
          </div>

          {/* Kontakt */}
          <div className="space-y-4">
            <Typography variant="h4" className="font-semibold">
              Kontakt
            </Typography>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>hello@dociekai.pl</span>
              </div>
              <FacebookFooterLink className="text-muted-foreground hover:text-foreground transition-colors" />
            </div>
          </div>

          {/* Nawigacja */}
          <div className="space-y-4">
            <Typography variant="h4" className="font-semibold">
              Nawigacja
            </Typography>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Strona główna
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/matematyka/klasa-4"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Matematyka klasa 4
                </Link>
              </li>
              <li>
                <Link
                  href="/informatyka/klasa-4"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Informatyka klasa 4
                </Link>
              </li>
              <li>
                <Link
                  href="/historia/klasa-4"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Historia klasa 4
                </Link>
              </li>
              <li>
                <Link
                  href="/jezyk-polski/klasa-4"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Język polski klasa 4
                </Link>
              </li>
              <li>
                <Link
                  href="/materialy"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Ściągi i fiszki do druku
                </Link>
              </li>
              <li>
                <Link
                  href="/kontakt"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Kontakt
                </Link>
              </li>
            </ul>
          </div>

          {/* Tematy */}
          <div className="space-y-4">
            <Typography variant="h4" className="font-semibold">
              Tematy
            </Typography>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/blog?tag=kompetencje-przyszlosci"
                  rel="nofollow"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Kompetencje przyszłości
                </Link>
              </li>
              <li>
                <Link
                  href="/blog?tag=edukacja-domowa"
                  rel="nofollow"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Edukacja domowa
                </Link>
              </li>
              <li>
                <Link
                  href="/blog?tag=gry-edukacyjne"
                  rel="nofollow"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Gry edukacyjne
                </Link>
              </li>
              <li>
                <Link
                  href="/blog?tag=rozwoj-dziecka"
                  rel="nofollow"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Rozwój dziecka
                </Link>
              </li>
              <li>
                <Link
                  href="/blog?tag=kodowanie-dla-dzieci"
                  rel="nofollow"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Kodowanie dla dzieci
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <Typography variant="small" className="text-muted-foreground">
            © {new Date().getFullYear()} DociekAI. Wszystkie prawa zastrzeżone.
          </Typography>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
            <Link
              href="/polityka-prywatnosci"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Polityka prywatności
            </Link>
            <Link
              href="/cookies"
              rel="nofollow"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Cookies
            </Link>
            <CookieSettingsButton className="text-muted-foreground hover:text-foreground transition-colors" />
          </div>
        </div>
      </div>
    </footer>
  );
}
