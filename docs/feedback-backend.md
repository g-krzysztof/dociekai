# Backend dla formularza zgłaszania uwag/błędów (Strapi)

Ten dokument opisuje, co trzeba dodać **po stronie Strapi**, żeby przycisk
zgłaszania uwag/błędów dla zalogowanych użytkowników działał od-końca-do-końca.
Frontend (to repozytorium, Next.js) jest już w pełni gotowy (klient:
`src/lib/feedback-api.ts`). Brakuje wyłącznie tej części.

Frontend woła **wyłącznie** jeden własny route Next.js, który proxy'uje do
Strapi (dokładnie ten sam wzorzec co istniejący `private-fishcards`):

- `src/app/api/feedback/route.ts` → `POST {STRAPI_API_URL}/feedback-entries`

Nagłówek `Authorization: Bearer <jwt>` jest przekazywany bez zmian.
**Dopóki poniższy endpoint nie istnieje w Strapi, wysyłka zgłoszenia kończy
się błędem widocznym dla użytkownika** — w odróżnieniu od `math-progress`,
ten proxy route **nie** połyka błędu cicho (formularz to świadoma akcja
usera, nie synchronizacja w tle — user musi wiedzieć, że się nie wysłało).

## 1. Content-type: `feedback-entries`

Rekord = jedno zgłoszenie jednego użytkownika. Nazwa przykładowa — dopasuj do
konwencji nazewnictwa już istniejących w Strapi (np. jeśli `private-fishcards`
używa innego wzorca liczby mnogiej, idź za tym wzorcem — wtedy zmień też
ścieżkę w `src/app/api/feedback/route.ts`).

| Pole | Typ | Uwagi |
|---|---|---|
| `user` | relacja do `plugin::users-permissions.user` | właściciel rekordu; ustawiane po stronie kontrolera z `ctx.state.user`, **nigdy** z body requestu |
| `message` | text | wymagane — jedyne wymagane pole formularza (zmiana 2026-08-17, wcześniej `category` też była wymagana) |
| `category` | enumeration: `bug`, `pomysl`, `pytanie`, `inne` | opcjonalne; pole w Strapi nie powinno być `required`, bo frontend może w ogóle nie wysłać tego klucza gdy user nic nie wybrał |
| `pageUrl` | string | wymagane; surowa ścieżka strony, z której wysłano zgłoszenie |
| `pageLabel` | string | opcjonalne; opis kontekstu edytowalny przez usera (domyślnie tytuł strony) |
| `userAgent` | string | opcjonalne; przeglądarka/OS, pomocne przy błędach |
| `status` | enumeration: `new`, `in_progress`, `resolved`, `wont_fix` | domyślnie `new`; ustawiane wyłącznie w panelu admina Strapi do triage'u, frontend go nigdy nie wysyła ani nie czyta |
| `screenshot` | media (single, image) | opcjonalne; zrzut zaznaczonego przez usera fragmentu strony, patrz punkt 2 |

Nie ma potrzeby żadnych pól agregujących — każdy rekord jest w pełni
samodzielny, lista/triage odbywa się w panelu admina Strapi.

## 2. `POST /feedback-entries`

Standardowy Strapi core-create na content-type z punktu 1, ale **multipart**,
nie czysty JSON — bo user może opcjonalnie dołączyć zrzut ekranu, a Strapi
tworzy rekord razem z plikiem w jednym requeście dokładnie w ten sposób
(to jest standardowy kontrakt Strapi REST create z plikiem, nie coś
custom napisanego w tym proxy).

- **Auth:** wymagany, standardowa policy `users-permissions` (ten sam
  mechanizm co `POST /private-fishcards`). Brak/nieważny token → 401.
- **Request body:** `multipart/form-data` z dwiema częściami:
  - `data` — string, JSON zawierający pola z tabeli wyżej (bez `screenshot`).
    `category` jest opcjonalne — klucz może być całkiem nieobecny, gdy user
    nie wybrał kategorii:
    ```json
    {
      "category": "bug",
      "message": "Przycisk Dalej nie reaguje na kliknięcie na tej stronie.",
      "pageUrl": "/matematyka/klasa-4/liczby-naturalne/zapis-duzych-liczb",
      "pageLabel": "Zapis dużych liczb — DociekAI",
      "userAgent": "Mozilla/5.0 (...)"
    }
    ```
  - `files.screenshot` — **opcjonalna** część z plikiem (PNG), obecna tylko
    gdy user faktycznie zaznaczył obszar i dodał zrzut. Gdy jej brak, to
    zwykły multipart create bez pliku — Strapi obsługuje to bez żadnej
    dodatkowej logiki.
- **Logika kontrolera:**
  1. Przypisz `user` z `ctx.state.user.id` — nigdy z body (klient nie
     przysyła tego pola w ogóle, ale kontroler i tak nie powinien mu ufać,
     gdyby kiedyś zaczął).
  2. Ustaw `status: 'new'` niezależnie od tego, co (jeśli cokolwiek) przyszło
     w body na tym polu.
  3. Utwórz rekord standardowym create — Strapi sam podłącza część
     `files.screenshot` (jeśli obecna) do pola `screenshot` po nazwie, nie
     trzeba nic ręcznie wiązać.
- **Response** (200/201): utworzony rekord, standardowy kształt Strapi
  create response. Frontend nie czyta nic poza statusem `response.ok` —
  sukces to sukces, treść odpowiedzi jest tu bez znaczenia.

Na błąd walidacji/serwera Strapi zwraca standardowy błąd Strapi; proxy route
przekazuje `response.status` i `details` dalej, a formularz pokazuje
komunikat inline i zachowuje wpisaną treść (nic nie ginie, user może
ponowić).

## 3. Uprawnienia

Dokładnie ten sam model co istniejący `private-fishcards`: każdy request musi
być autoryzowany JWT-em z pluginu `users-permissions`; `create` zawsze
przypisuje właściciela z `ctx.state.user.id` z tokena, nigdy z wartości
przysłanej przez klienta. Nie ma potrzeby endpointu `find`/`findOne` po
stronie publicznego API — triage odbywa się wyłącznie w panelu admina Strapi,
więc wystarczy uprawnienie `create` dla roli Authenticated; `find`/`update`/
`delete` zostają dostępne tylko z poziomu admina (domyślne zachowanie Strapi
dla contentu niewystawionego w Settings → Roles → Authenticated).

## 4. Rzeczy do sprawdzenia przy wdrażaniu

- **Pusta treść** (`message` puste/whitespace) → 400, frontend i tak
  blokuje wysyłkę pustego pola po swojej stronie, ale kontroler nie powinien
  ufać samemu frontendowi.
- **Nieznana wartość `category`** spoza czterech dopuszczonych → 400
  (standardowe zachowanie Strapi dla enumeration przy złej wartości).
- **Redeploy między środowiskami** (dev/staging/prod) — jeśli Strapi ma
  osobne środowiska/bazy, upewnij się, że nowy content-type i uprawnienie
  `create` dla roli Authenticated są włączone wszędzie tam, gdzie stoi
  odpowiadający `STRAPI_API_URL`.

## 5. Czego NIE trzeba robić (poza zakresem v1)

- Nie trzeba endpointu `GET`/listy "moje zgłoszenia" po stronie użytkownika —
  triage tylko przez panel admina Strapi.
- Nie trzeba webhooka/powiadomienia zespołu (Slack/e-mail) na start — do
  potwierdzenia later.

## 6. Zrzut ekranu — co warto sprawdzić

- **Rozmiar pliku:** frontend nie kompresuje/nie ogranicza rozdzielczości
  poza `scale: min(devicePixelRatio, 2)` przy renderowaniu, więc duże
  zaznaczenie na ekranie retina może dać plik rzędu kilku MB. Upewnij się,
  że domyślny limit rozmiaru uploadu w Strapi (`plugins.upload` config,
  domyślnie 200 MB, ale warto sprawdzić ustawienia tego środowiska) nie
  odrzuca tego cicho ani z niejasnym błędem.
- **Provider uploadu:** jakikolwiek provider Strapi już ma skonfigurowany
  (lokalny dysk / S3 / Cloudinary) obsłuży to bez zmian — `screenshot` to
  zwykłe pole media, nic specyficznego dla tego content-type.
