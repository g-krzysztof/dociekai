'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { LogOut, Menu, User, X } from 'lucide-react';

import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { GoogleIcon } from '@/components/ui/google-icon';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/components/auth-context';
import { StreakChip } from '@/components/streak/streak-chip';
import { cn } from '@/lib/utils';

/**
 * Nagłówek serwisu.
 *
 * Osiem pozycji z polskimi etykietami nie mieści się w jednym wierszu poniżej
 * ~1280 px (kontener Tailwinda jest tam przycięty do 1024 px), więc pasek ma
 * dwa tryby, a nie jeden rozciągany: pełny wiersz zakładek od `xl` w górę i
 * arkusz menu poniżej. Nic nie jest zwężane na siłę — etykiety nigdy się nie
 * łamią, a logo nigdy nie jest ściskane przez flexa.
 */

type NavGroupKey = 'nauka' | 'serwis' | 'dev';

interface NavItem {
  name: string;
  href: string;
  group: NavGroupKey;
}

const GROUP_TITLES: Record<NavGroupKey, string> = {
  nauka: 'Nauka',
  serwis: 'Serwis',
  dev: 'Dev',
};

const GROUP_ORDER: NavGroupKey[] = ['nauka', 'serwis', 'dev'];

const Header = () => {
  const pathname = usePathname();
  const { user, isAuthenticated, logout, loading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const isDev = process.env.NODE_ENV === 'development';

  const navigationItems: NavItem[] = [
    { name: 'Home', href: '/', group: 'serwis' },
    { name: 'Blog', href: '/blog', group: 'serwis' },
    { name: 'Fiszki', href: '/fishcards', group: 'nauka' },
    { name: 'Gry edukacyjne', href: '/gry-edukacyjne', group: 'nauka' },
    { name: 'Kurs kodowania', href: '/coding-course', group: 'nauka' },
    { name: 'Matematyka', href: '/matematyka', group: 'nauka' },
    { name: 'Informatyka', href: '/informatyka', group: 'nauka' },
    { name: 'Historia', href: '/historia', group: 'nauka' },
    { name: 'Język polski', href: '/jezyk-polski', group: 'nauka' },
    { name: 'Pobierz', href: '/materialy', group: 'nauka' },
    { name: 'Kontakt', href: '/kontakt', group: 'serwis' },
  ];

  const isActive = (href: string) => (href === '/' ? pathname === href : pathname.startsWith(href));

  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), []);

  // Menu zamyka się samo, gdy zmieni się strona — kliknięcie w link nie zostawia
  // otwartego arkusza nad nową treścią.
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Otwarty arkusz przejmuje ekran: blokuje przewijanie strony pod spodem
  // (z kompensacją szerokości paska przewijania, żeby nic nie drgnęło),
  // zamyka się Escapem i oddaje fokus przyciskowi, z którego wyszedł.
  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const { body } = document;
    const previousOverflow = body.style.overflow;
    const previousPadding = body.style.paddingRight;
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = 'hidden';
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setIsMobileMenuOpen(false);
      toggleRef.current?.focus();
    };
    window.addEventListener('keydown', onKeyDown);

    // Obrót tabletu w poziom odsłania pełny pasek — arkusz nie może zostać
    // otwarty (ani zablokować przewijania) za plecami użytkownika.
    const wide = window.matchMedia('(min-width: 1280px)');
    const onWide = (event: MediaQueryListEvent) => {
      if (event.matches && !isDev) setIsMobileMenuOpen(false);
    };
    wide.addEventListener('change', onWide);

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPadding;
      window.removeEventListener('keydown', onKeyDown);
      wide.removeEventListener('change', onWide);
    };
  }, [isMobileMenuOpen, isDev]);

  const groupedItems = GROUP_ORDER.map((group) => ({
    group,
    items: navigationItems.filter((item) => item.group === group),
  })).filter((section) => section.items.length > 0);

  return (
    <header className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 relative z-50">
      <div className="container relative z-50 mx-auto flex h-16 items-center gap-3 px-4 sm:gap-4">
        {/* Logo — nigdy nie oddaje szerokości nawigacji, więc nigdy się nie spłaszcza. */}
        <Link
          href="/"
          className="shrink-0 hover:cursor-pointer"
          aria-label="DociekAI — strona główna"
        >
          <Logo priority className="h-7 w-auto sm:h-8 xl:h-10" />
        </Link>

        {/* Pasek zakładek — pełna wysokość nagłówka, więc cel dotykowy ma 64 px,
            a znacznik aktywnej sekcji siada na dolnej krawędzi zamiast zjadać
            miejsce obok etykiety. */}
        {/* Pełny pasek mieści się dopiero od 2xl — na 1280–1440 px wylewał się pod
            przyciski konta gościa. Niżej wszystko jest w arkuszu menu (☰).
            „Home” pomijamy, bo tę rolę pełni logo. */}
        <nav aria-label="Menu główne" className="hidden h-16 min-w-0 items-stretch gap-x-1 2xl:flex">
          {navigationItems
            .filter((item) => item.group !== 'dev' && item.href !== '/')
            .map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'relative inline-flex items-center whitespace-nowrap px-2 text-sm font-medium',
                    'transition-colors hover:cursor-pointer',
                    'focus-visible:outline-2 focus-visible:outline-offset-[-6px] focus-visible:outline-ring',
                    'after:pointer-events-none after:absolute after:inset-x-2 after:bottom-0 after:h-0.5',
                    'after:rounded-full after:bg-primary after:transition-opacity after:duration-200',
                    active
                      ? 'text-[color-mix(in_oklch,var(--primary)_82%,var(--foreground))] after:opacity-100 dark:text-primary'
                      : 'text-muted-foreground after:opacity-0 hover:text-primary hover:after:opacity-40'
                  )}
                >
                  {item.name}
                </Link>
              );
            })}
        </nav>

        {/* Prawa strona: motyw, seria, konto. */}
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {/* Seria towarzyszy dziecku na każdej szerokości — to jedna z czterech
              powierzchni rytmu nauki, nie ozdoba ekranu desktopowego. */}
          <StreakChip />
          <ThemeToggle />

          {/* Konto mieści się już na tablecie — poniżej `sm` przenosi się do arkusza. */}
          <div className="hidden items-center gap-2 sm:flex">
            {loading ? (
              <div
                className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-primary"
                role="status"
                aria-label="Wczytywanie konta"
              />
            ) : isAuthenticated ? (
              <>
                <Link href="/profil">
                  <Button variant="outline" size="sm">
                    <User className="h-4 w-4" />
                    <span className="max-w-[10ch] truncate">
                      {user?.firstName || user?.username || 'Profil'}
                    </span>
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={logout} aria-label="Wyloguj się">
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth?mode=login">
                  <Button variant="outline" size="sm">
                    <GoogleIcon />
                    Zaloguj
                  </Button>
                </Link>
                <Link href="/auth?mode=register">
                  <Button size="sm" className="bg-primary hover:bg-primary/90">
                    <GoogleIcon />
                    Rejestracja
                  </Button>
                </Link>
              </>
            )}
          </div>

          <Button
            ref={toggleRef}
            variant="ghost"
            size="icon"
            className={cn(!isDev && '2xl:hidden')}
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            aria-label={isMobileMenuOpen ? 'Zamknij menu' : 'Otwórz menu'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-nav"
            id="mobile-hamburger"
            data-testid="mobile-hamburger"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Arkusz menu — zakotwiczony pod paskiem (a nie w viewporcie), więc trafia
          na swoje miejsce także wtedy, gdy strona jest przewinięta. */}
      {isMobileMenuOpen && (
        <>
          {/* Przyciemnienie zaczyna się pod paskiem, żeby nie brudzić półprzezroczystego tła nagłówka. */}
          <div
            className="absolute inset-x-0 top-full z-40 h-[100svh] bg-foreground/25 backdrop-blur-[2px] motion-safe:animate-in motion-safe:fade-in-0 motion-safe:duration-200"
            aria-hidden="true"
            onClick={closeMobileMenu}
          />
          <div
            id="mobile-nav"
            data-testid="mobile-nav"
            className="absolute inset-x-0 top-full z-50 max-h-[calc(100svh-4rem)] overflow-y-auto overscroll-contain border-b bg-background shadow-lg motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-top-2 motion-safe:duration-200"
          >
            <nav
              aria-label="Menu główne"
              data-testid="mobile-nav-list"
              className={cn(
                'container mx-auto grid gap-x-8 gap-y-6 px-4 py-6 sm:grid-cols-2',
                groupedItems.length > 2 && 'lg:grid-cols-3'
              )}
            >
              {groupedItems.map(({ group, items }) => (
                <section key={group}>
                  <h2 className="mb-1 px-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">
                    {GROUP_TITLES[group]}
                  </h2>
                  <ul>
                    {items.map((item) => {
                      const active = isActive(item.href);
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={closeMobileMenu}
                            aria-current={active ? 'page' : undefined}
                            className={cn(
                              'flex min-h-11 items-center rounded-md px-3 text-base font-medium transition-colors',
                              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
                              active
                                ? 'bg-primary/10 text-[color-mix(in_oklch,var(--primary)_82%,var(--foreground))] dark:bg-primary/20 dark:text-primary'
                                : 'text-muted-foreground hover:bg-accent hover:text-primary'
                            )}
                          >
                            {item.name}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))}

              {/* Konto tylko na telefonie — szerzej stoi już w pasku, więc się nie dubluje. */}
              <div className="border-t pt-4 sm:hidden">
                {loading ? (
                  <div className="flex justify-center py-1">
                    <div
                      className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-primary"
                      role="status"
                      aria-label="Wczytywanie konta"
                    />
                  </div>
                ) : isAuthenticated ? (
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Link href="/profil" onClick={closeMobileMenu} className="sm:w-auto">
                      <Button
                        variant="outline"
                        size="lg"
                        className="h-11 w-full justify-start sm:w-auto"
                      >
                        <User className="h-4 w-4" />
                        <span className="max-w-[16ch] truncate">
                          {user?.firstName || user?.username || 'Profil'}
                        </span>
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="lg"
                      onClick={() => {
                        logout();
                        closeMobileMenu();
                      }}
                      className="h-11 w-full justify-start sm:w-auto"
                    >
                      <LogOut className="h-4 w-4" />
                      Wyloguj
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Link href="/auth?mode=login" onClick={closeMobileMenu} className="sm:w-auto">
                      <Button variant="outline" size="lg" className="h-11 w-full sm:w-auto">
                        <GoogleIcon />
                        Zaloguj
                      </Button>
                    </Link>
                    <Link
                      href="/auth?mode=register"
                      onClick={closeMobileMenu}
                      className="sm:w-auto"
                    >
                      <Button
                        size="lg"
                        className="h-11 w-full bg-primary hover:bg-primary/90 sm:w-auto"
                      >
                        <GoogleIcon />
                        Rejestracja
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </>
      )}
    </header>
  );
};

export default Header;
