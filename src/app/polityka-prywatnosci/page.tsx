import { HeroTitle } from '@/components/hero-title';
import { Typography } from '@/components/ui/typography';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Polityka prywatności | DociekAI',
  description:
    'Jakie dane przetwarza DociekAI, w jakim celu, komu je powierzamy, jak długo je przechowujemy i jakie masz prawa.',
};

const ADMIN_NAME = 'Rubinowe Sp. z o.o.';
const ADMIN_NIP = '6462959929';
const CONTACT_EMAIL = 'hello@dociekai.pl';

const listClass = 'list-disc pl-6 space-y-2 text-sm leading-relaxed';

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <HeroTitle className="mb-6">Polityka prywatności</HeroTitle>
        <Typography variant="muted" className="mb-8">
          Data ostatniej aktualizacji: 11.10.2026
        </Typography>

        <section className="space-y-4 mb-10">
          <Typography>
            DociekAI to serwis z kursami i materiałami do nauki dla dzieci i rodziców. Z większości
            serwisu można korzystać bez konta i bez podawania jakichkolwiek danych. Ta strona
            opisuje, jakie dane przetwarzamy, gdy zakładasz konto, piszesz do nas albo korzystasz ze
            strony, po co to robimy i jakie masz prawa.
          </Typography>
        </section>

        <section className="space-y-3 mb-8">
          <Typography variant="h3">Kto jest administratorem danych</Typography>
          <Typography>
            Administratorem Twoich danych osobowych jest {ADMIN_NAME} (NIP {ADMIN_NIP}), która
            prowadzi serwis DociekAI (dalej: „my”). We wszystkich sprawach dotyczących danych osobowych napisz na{' '}
            <span className="font-medium">{CONTACT_EMAIL}</span> albo skorzystaj z{' '}
            <Link href="/kontakt" className="underline underline-offset-4">
              formularza kontaktowego
            </Link>
            .
          </Typography>
        </section>

        <section className="space-y-3 mb-8">
          <Typography variant="h3">Jakie dane przetwarzamy i po co</Typography>

          <Typography className="font-medium">Konto użytkownika</Typography>
          <ul className={listClass}>
            <li>
              Adres e-mail i nazwa użytkownika — wymagane, żeby założyć konto, logować się, odzyskać
              hasło i otrzymywać wiadomości związane z kontem (np. potwierdzenie adresu).
            </li>
            <li>Imię i nazwisko — opcjonalne; możesz je podać lub usunąć w profilu.</li>
            <li>
              Hasło — przechowujemy wyłącznie jego zaszyfrowany skrót (bcrypt), nigdy samo hasło.
            </li>
            <li>Data rejestracji i ostatniego logowania oraz informacja, czy adres e-mail jest potwierdzony.</li>
            <li>
              Jeśli logujesz się przez Google — otrzymujemy od Google Twój adres e-mail, imię,
              nazwisko i identyfikator konta Google. Nie dostajemy hasła ani dostępu do Twojej
              skrzynki czy innych danych z konta Google.
            </li>
          </ul>
          <Typography className="text-sm text-muted-foreground">
            Podstawa prawna: wykonanie umowy o świadczenie usługi konta (art. 6 ust. 1 lit. b RODO).
          </Typography>

          <Typography className="font-medium pt-2">Postępy w nauce</Typography>
          <ul className={listClass}>
            <li>
              Ukończone kroki i lekcje w kursach, dni nauki składające się na „rytm nauki” i
              zdobyte odznaki, a także własne fiszki.
            </li>
          </ul>
          <Typography className="text-sm text-muted-foreground">
            Zapisujemy je tylko na koncie, żeby można było wrócić do nauki na dowolnym urządzeniu.
            Podstawa prawna: wykonanie umowy (art. 6 ust. 1 lit. b RODO). Bez konta postęp zostaje
            wyłącznie w Twojej przeglądarce (w pamięci bieżącej karty) i do nas nie trafia.
          </Typography>

          <Typography className="font-medium pt-2">Zgłoszenia i opinie</Typography>
          <ul className={listClass}>
            <li>
              Gdy zalogowany użytkownik wyśle opinię lub zgłosi błąd, zapisujemy jej treść,
              kategorię, adres podstrony, nazwę przeglądarki i — jeśli zostanie dołączony — zrzut
              ekranu.
            </li>
          </ul>
          <Typography className="text-sm text-muted-foreground">
            Podstawa prawna: nasz prawnie uzasadniony interes, czyli naprawianie błędów i ulepszanie
            serwisu (art. 6 ust. 1 lit. f RODO).
          </Typography>

          <Typography className="font-medium pt-2">Formularz kontaktowy</Typography>
          <ul className={listClass}>
            <li>
              Imię, nazwisko, adres e-mail, opcjonalnie numer telefonu, temat i treść wiadomości.
              Formularz nie zapisuje ich w bazie danych — trafiają do nas jako e-mail, żebyśmy mogli
              odpowiedzieć.
            </li>
          </ul>
          <Typography className="text-sm text-muted-foreground">
            Podstawa prawna: prawnie uzasadniony interes polegający na odpowiedzi na Twoją
            wiadomość (art. 6 ust. 1 lit. f RODO).
          </Typography>

          <Typography className="font-medium pt-2">Statystyki i analityka</Typography>
          <ul className={listClass}>
            <li>
              Vercel Analytics i Ahrefs Web Analytics — zbiorcze statystyki odwiedzin (np. liczba
              wyświetleń podstron) bez plików cookies i bez identyfikowania konkretnych osób.
              Podstawa prawna: prawnie uzasadniony interes (art. 6 ust. 1 lit. f RODO).
            </li>
            <li>
              Microsoft Clarity (nagrania i mapy kliknięć pokazujące, jak korzystasz ze strony) oraz
              Meta Pixel (pokazuje, ile osób trafia do nas z Facebooka i Instagrama) — uruchamiają się{' '}
              <span className="font-medium">wyłącznie po Twojej zgodzie</span> wyrażonej w banerze
              cookies. Podstawa prawna: zgoda (art. 6 ust. 1 lit. a RODO), którą możesz w każdej
              chwili wycofać przyciskiem „Ustawienia cookies” w stopce strony.
            </li>
          </ul>
        </section>

        <section className="space-y-3 mb-8">
          <Typography variant="h3">Dzieci</Typography>
          <Typography>
            Serwis jest przeznaczony dla dzieci, ale konto powinien zakładać rodzic lub opiekun,
            podając swój adres e-mail. Dziecko poniżej 16. roku życia może korzystać z konta
            wyłącznie za zgodą rodzica lub opiekuna (art. 8 RODO). Nie prosimy o dane dziecka
            wykraczające poza to, co jest potrzebne do nauki. Jeśli dowiesz się, że dziecko założyło
            konto bez Twojej zgody, napisz do nas — usuniemy je.
          </Typography>
        </section>

        <section className="space-y-3 mb-8">
          <Typography variant="h3">Komu powierzamy dane</Typography>
          <Typography>
            Nie sprzedajemy danych. Korzystamy z usług dostawców, którzy przetwarzają dane w naszym
            imieniu i wyłącznie w celu świadczenia nam usług:
          </Typography>
          <ul className={listClass}>
            <li>cyber_Folks S.A. (Polska) — baza danych i wysyłka poczty e-mail,</li>
            <li>Salesforce, Inc. (Heroku) — serwer aplikacji obsługujący konta i postępy,</li>
            <li>Vercel Inc. — hosting strony internetowej,</li>
            <li>Cloudinary Ltd. — przechowywanie obrazów, w tym zrzutów ekranu z opinii,</li>
            <li>Microsoft Corporation (Clarity) i Meta Platforms Ireland Ltd. — tylko po zgodzie,</li>
            <li>Ahrefs Pte. Ltd. — zbiorcze statystyki odwiedzin,</li>
            <li>Google Ireland Ltd. — logowanie przez Google, jeśli z niego skorzystasz.</li>
          </ul>
          <Typography className="text-sm text-muted-foreground">
            Część tych dostawców działa w Stanach Zjednoczonych. Przekazanie danych poza Europejski
            Obszar Gospodarczy odbywa się na podstawie decyzji Komisji Europejskiej o odpowiednim
            stopniu ochrony (EU-U.S. Data Privacy Framework) lub standardowych klauzul umownych
            zatwierdzonych przez Komisję.
          </Typography>
        </section>

        <section className="space-y-3 mb-8">
          <Typography variant="h3">Jak długo przechowujemy dane</Typography>
          <ul className={listClass}>
            <li>
              Dane konta, postępy i fiszki — do czasu usunięcia konta. Po usunięciu konta kasujemy je
              w ciągu 30 dni.
            </li>
            <li>Opinie i zgłoszenia — do czasu ich rozpatrzenia, najdłużej do usunięcia konta.</li>
            <li>Wiadomości z formularza kontaktowego — do 12 miesięcy od zakończenia korespondencji.</li>
            <li>Dane z narzędzi analitycznych — zgodnie z okresami retencji ich dostawców.</li>
          </ul>
        </section>

        <section className="space-y-3 mb-8">
          <Typography variant="h3">Twoje prawa</Typography>
          <Typography>Masz prawo do:</Typography>
          <ul className={listClass}>
            <li>dostępu do swoich danych i otrzymania ich kopii,</li>
            <li>sprostowania danych,</li>
            <li>usunięcia danych („prawo do bycia zapomnianym”),</li>
            <li>ograniczenia przetwarzania,</li>
            <li>przeniesienia danych,</li>
            <li>sprzeciwu wobec przetwarzania opartego na prawnie uzasadnionym interesie,</li>
            <li>wycofania zgody w dowolnym momencie (bez wpływu na wcześniejsze przetwarzanie),</li>
            <li>
              wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych (ul. Stawki 2, 00-193
              Warszawa, uodo.gov.pl).
            </li>
          </ul>
          <Typography>
            Aby usunąć konto lub skorzystać z pozostałych praw, napisz na{' '}
            <span className="font-medium">{CONTACT_EMAIL}</span> z adresu e-mail przypisanego do
            konta. Odpowiemy w ciągu miesiąca.
          </Typography>
        </section>

        <section className="space-y-3 mb-8">
          <Typography variant="h3">Czy musisz podawać dane</Typography>
          <Typography>
            Nie. Podanie adresu e-mail i nazwy użytkownika jest dobrowolne, ale bez nich nie da się
            założyć konta. Z kursów możesz korzystać bez konta. Nie podejmujemy wobec Ciebie decyzji
            w sposób zautomatyzowany ani nie profilujemy Cię w rozumieniu RODO.
          </Typography>
        </section>

        <section className="space-y-3 mb-8">
          <Typography variant="h3">Bezpieczeństwo</Typography>
          <Typography>
            Połączenie ze stroną jest szyfrowane (HTTPS), hasła przechowujemy wyłącznie jako
            zaszyfrowane skróty, a dostęp do danych mają tylko osoby i usługi, które go potrzebują
            do działania serwisu.
          </Typography>
        </section>

        <section className="space-y-3 mb-8">
          <Typography variant="h3">Pliki cookies</Typography>
          <Typography>
            Szczegóły dotyczące plików cookies i podobnych technologii znajdziesz w{' '}
            <Link href="/cookies" className="underline underline-offset-4">
              polityce cookies
            </Link>
            .
          </Typography>
        </section>

        <section className="space-y-3">
          <Typography variant="h3">Zmiany polityki</Typography>
          <Typography>
            Gdy zmienimy sposób przetwarzania danych, zaktualizujemy tę stronę i datę na jej
            początku. O istotnych zmianach poinformujemy użytkowników kont e-mailem.
          </Typography>
        </section>
      </div>
    </div>
  );
}
