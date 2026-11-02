import { HeroTitle } from '@/components/hero-title';
import { Typography } from '@/components/ui/typography';
import { CookieSettingsButton } from '@/components/cookie-consent';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Pliki cookies | DociekAI',
  description:
    'Informacje o tym, czym są pliki cookies, jak ich używamy na stronie DociekAI oraz jak możesz nimi zarządzać.',
  robots: { index: false, follow: false },
};

const listClass = 'list-disc pl-6 space-y-2 text-sm leading-relaxed';

export default function CookiesPage() {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <HeroTitle className="mb-6">Polityka plików cookies</HeroTitle>
        <Typography variant="muted" className="mb-8">
          Data ostatniej aktualizacji: 11.10.2026
        </Typography>

        <section className="space-y-4 mb-10">
          <Typography>
            Ta strona wyjaśnia, jakie pliki cookies i podobne technologie (pamięć przeglądarki
            localStorage i sessionStorage) wykorzystuje serwis DociekAI i jak możesz decydować o ich
            użyciu. Narzędzia analityczne, które zapisują cookies, włączamy wyłącznie po Twojej
            zgodzie. Jak przetwarzamy dane osobowe, opisuje{' '}
            <Link href="/polityka-prywatnosci" className="underline underline-offset-4">
              polityka prywatności
            </Link>
            .
          </Typography>
        </section>

        <section className="space-y-3 mb-8">
          <Typography variant="h3">Czym są pliki cookies?</Typography>
          <Typography>
            Cookies to niewielkie pliki tekstowe zapisywane na Twoim urządzeniu podczas korzystania
            ze stron internetowych. Podobnie działa pamięć przeglądarki (localStorage,
            sessionStorage), w której strona może przechowywać informacje na Twoim urządzeniu.
          </Typography>
        </section>

        <section className="space-y-3 mb-8">
          <Typography variant="h3">Niezbędne — zawsze włączone</Typography>
          <Typography>Bez nich strona nie działa tak, jak tego oczekujesz. Nie wymagają zgody.</Typography>
          <ul className={listClass}>
            <li>
              <span className="font-medium">cookie_consent</span> (cookie, 180 dni) — zapamiętuje
              Twój wybór w banerze cookies.
            </li>
            <li>
              <span className="font-medium">Token logowania</span> (localStorage) — utrzymuje Cię
              zalogowanym; usuwany przy wylogowaniu.
            </li>
            <li>
              <span className="font-medium">Postęp w lekcjach</span> (sessionStorage, dla gości) —
              znika po zamknięciu karty przeglądarki.
            </li>
            <li>
              <span className="font-medium">Ustawienia</span> (localStorage) — np. motyw jasny lub
              ciemny i wybrana kategoria fiszek.
            </li>
          </ul>
        </section>

        <section className="space-y-3 mb-8">
          <Typography variant="h3">Statystyki bez cookies</Typography>
          <Typography>
            Vercel Analytics i Ahrefs Web Analytics liczą odwiedziny podstron w sposób zbiorczy, bez
            zapisywania cookies na Twoim urządzeniu i bez identyfikowania konkretnych osób.
          </Typography>
        </section>

        <section className="space-y-3 mb-8">
          <Typography variant="h3">Tylko za Twoją zgodą</Typography>
          <Typography>
            Te narzędzia nie ładują się wcale, dopóki nie klikniesz „Zgadzam się” w banerze.
          </Typography>
          <ul className={listClass}>
            <li>
              <span className="font-medium">Microsoft Clarity</span> — analityka: nagrania sesji i
              mapy kliknięć, które pokazują nam, jak korzystasz ze strony i co jest niezrozumiałe.
              Cookies: <span className="font-medium">_clck</span> (do 1 roku),{' '}
              <span className="font-medium">_clsk</span> (1 dzień).
            </li>
            <li>
              <span className="font-medium">Meta Pixel</span> — pokazuje nam, ile osób trafia do
              DociekAI z Facebooka i Instagrama. Cookies:{' '}
              <span className="font-medium">_fbp</span> (90 dni),{' '}
              <span className="font-medium">_fbc</span> (90 dni, tylko po wejściu z linku na Facebooku lub Instagramie).
            </li>
          </ul>
        </section>

        <section className="space-y-3 mb-8">
          <Typography variant="h3">Zmiana decyzji</Typography>
          <Typography>
            Zgodę możesz w każdej chwili zmienić lub wycofać. Po wycofaniu zgody usuwamy cookies
            narzędzi analitycznych i przeładowujemy stronę już bez nich.
          </Typography>
          <CookieSettingsButton className="text-sm font-medium underline underline-offset-4">
            Otwórz ustawienia cookies
          </CookieSettingsButton>
          <Typography className="text-sm text-muted-foreground">
            Możesz też blokować lub usuwać cookies w ustawieniach swojej przeglądarki (np. Chrome,
            Firefox, Safari, Edge). Pamiętaj, że wyłączenie niezbędnych cookies może wpłynąć na
            działanie strony, np. wylogować Cię.
          </Typography>
        </section>

        <section className="space-y-3 mb-8">
          <Typography variant="h3">Zmiany w polityce cookies</Typography>
          <Typography>
            Gdy zmienimy narzędzia, z których korzystamy, zaktualizujemy tę stronę i datę na jej
            początku.
          </Typography>
        </section>

        <section className="space-y-3">
          <Typography variant="h3">Kontakt</Typography>
          <Typography>
            Jeśli masz pytania dotyczące plików cookies lub prywatności, skontaktuj się z nami:{' '}
            <span className="font-medium">hello@dociekai.pl</span>. Możesz też skorzystać z
            formularza na stronie{' '}
            <a href="/kontakt" className="underline underline-offset-4">
              Kontakt
            </a>
            .
          </Typography>
        </section>
      </div>
    </div>
  );
}
