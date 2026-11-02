# Backend dla postępu kursu matematyki (Strapi)

Ten dokument opisuje, co trzeba dodać **po stronie Strapi**, żeby postęp kursu
„Matematyka — klasa 4" (`/matematyka/klasa-4`) synchronizował się z kontem
użytkownika. Frontend (ten repozytorium, Next.js) jest już w pełni gotowy i
wdrożony (sesja dla gości, cache zapisany na koncie dla zalogowanych).
Brakuje wyłącznie tej części.

Frontend woła **wyłącznie** dwa własne route'y Next.js, które proxy'ują do
Strapi (dokładnie ten sam wzorzec co istniejący `private-fishcards`):

- `src/app/api/math-progress/route.ts` → `GET {STRAPI_API_URL}/math-progress`
- `src/app/api/math-progress/sync/route.ts` → `POST {STRAPI_API_URL}/math-progress/sync`

Obie strony przekazują nagłówek `Authorization: Bearer <jwt>` bez zmian.
**Dopóki poniższe endpointy nie istnieją w Strapi, frontend działa w pełni
poprawnie** — Next.js route'y łapią błąd/timeout i zwracają `{ data: [] }`,
więc synchronizacja po prostu nie zachodzi, a nauka (magazyn lokalny) działa
jak dotychczas. Nic tu nie jest blokujące.

## 1. Content-type: `math-progress`

Rekord = postęp jednej lekcji/przewodnika jednego użytkownika. Nazwa
przykładowa — dopasuj do konwencji nazewnictwa już istniejących w Strapi
(np. jeśli `private-fishcards` używa liczby mnogiej/innego prefiksu, idź za
tym wzorcem).

| Pole | Typ | Uwagi |
|---|---|---|
| `user` | relacja do `plugin::users-permissions.user` | właściciel rekordu; wymagane |
| `moduleSlug` | string | slug modułu, np. `liczby-naturalne` |
| `lessonSlug` | string | slug lekcji/przewodnika, np. `zapis-duzych-liczb` |
| `completed` | JSON (`string[]`) | id-ki ukończonych kroków/aktów lekcji |
| `total` | integer | liczba kroków/aktów w tej lekcji |
| `updatedAt` | (automatyczne) | Strapi robi to samo |

**Unikalność logiczna: jeden rekord na `(user, moduleSlug, lessonSlug)`.**
Strapi nie wymusi tego łatwo przez UI na polu relacyjnym — ma to wyegzekwować
logika kontrolera endpointu `sync` (find-or-create po tej trójce, patrz niżej),
nie constraint na poziomie bazy.

Nie ma potrzeby przechowywać żadnych zagregowanych danych (postęp modułu,
postęp całego kursu, procenty) — to wszystko liczy frontend w locie z listy
rekordów lekcji + własnych danych `curriculum.ts`/`lessons.ts`. Backend
trzyma tylko surowe rekordy per lekcja.

## 2. `GET /math-progress`

Zwraca cały postęp zalogowanego użytkownika.

- **Auth:** wymagany, standardowa policy `users-permissions` (ten sam
  mechanizm co istniejący `GET /private-fishcards`). Brak/nieważny token → 401.
- **Filtrowanie:** tylko rekordy, gdzie `user.id === ctx.state.user.id` —
  nigdy nie ufaj żadnemu identyfikatorowi usera przekazanemu w query/body.
- **Response** (200):

```json
{
  "data": [
    {
      "moduleSlug": "liczby-naturalne",
      "lessonSlug": "zapis-duzych-liczb",
      "completed": ["rozgrzewka", "nowe-pojecie", "przyklady"],
      "total": 6
    }
  ]
}
```

Brak rekordów → `{ "data": [] }`, nie 404.

## 3. `POST /math-progress/sync`

Zbiorczy upsert ze scalaniem po stronie serwera — **to jest jedyny endpoint
zapisu**, nie ma osobnego "update pojedynczej lekcji" ani "create". Frontend
wysyła go zarówno po ukończeniu jednego kroku (tablica z jednym elementem,
debounced 1500 ms), jak i zaraz po zalogowaniu (tablica ze wszystkim, co user
zrobił jako gość + to, co ma cache lokalny).

- **Auth:** jak wyżej, wymagany, 401 przy braku/nieważnym tokenie.
- **Request body:**

```json
{
  "entries": [
    {
      "moduleSlug": "liczby-naturalne",
      "lessonSlug": "zapis-duzych-liczb",
      "completed": ["rozgrzewka", "nowe-pojecie"],
      "total": 6
    }
  ]
}
```

- **Logika kontrolera, dla każdego elementu `entries`:**
  1. Znajdź istniejący rekord po `(user.id, moduleSlug, lessonSlug)`.
  2. Jeśli nie istnieje → utwórz z podanymi `completed`/`total`.
  3. Jeśli istnieje → **scal, nie nadpisuj**:
     - `completed` = suma zbiorów (unikalne id-ki) starego i nowego `completed`
       (dokładnie ten sam algorytm co `unionLessonProgress()` we frontendzie:
       `Array.from(new Set([...stare, ...nowe]))`) — kroki tylko przybywają,
       nigdy nie znikają, nawet jeśli dwa urządzenia synchronizują się prawie
       jednocześnie z różnym zestawem ukończonych kroków tej samej lekcji.
     - `total` = `Math.max(stare.total, nowe.total)` (asekuracyjnie, na
       wypadek gdyby liczba kroków lekcji się kiedyś zmieniła).
- **Response** (200): pełny, aktualny zestaw rekordów użytkownika po scaleniu
  — ten sam kształt co `GET /math-progress`:

```json
{ "data": [ /* wszystkie rekordy usera, jak w GET */ ] }
```

Frontend odczytuje response, ale nie jest od niego twardo zależny (traktuje
błąd/timeout jako "spróbuję przy następnej zmianie") — zwrócenie pełnego
stanu jest wygodą, nie wymogiem bezpieczeństwa danych.

## 4. Uprawnienia

Dokładnie ten sam model co istniejący `private-fishcards`: rekord należy do
jednego użytkownika, każdy request musi być autoryzowany JWT-em z pluginu
`users-permissions`, a `find`/`sync` zawsze filtrują/przypisują po
`ctx.state.user.id` z tokena — nigdy po wartości przysłanej przez klienta.
Jeśli `private-fishcards` ma dedykowaną policy/middleware ograniczającą
dostęp do własnych rekordów, zastosuj tę samą na `math-progress`.

## 5. Rzeczy do sprawdzenia przy wdrażaniu

- **Pusty request** (`{ "entries": [] }`) → no-op, zwróć aktualny stan bez
  błędu (frontend nigdy tego nie wyśle celowo, ale nie powinno wywalać 500).
- **Dwa elementy `entries` dla tej samej lekcji w jednym requeście** (nie
  powinno się zdarzyć przy obecnej logice frontu, ale kontroler powinien
  obsłużyć to bez duplikowania rekordu — przetwarzaj sekwencyjnie, nie
  równolegle, w ramach jednego requestu).
- **User bez żadnych rekordów** → `GET` zwraca `{ "data": [] }`, nie błąd.
- **Redeploy `math-progress` między środowiskami** (dev/staging/prod) — jeśli
  Strapi ma osobne środowiska/bazy, upewnij się, że nowy content-type i jego
  ewentualne uprawnienia (Settings → Roles → Authenticated) są włączone
  wszędzie tam, gdzie stoi odpowiadający `STRAPI_API_URL`.

## 6. Czego NIE trzeba robić

- Nie trzeba żadnego endpointu kasowania rekordów — wylogowanie czyści tylko
  magazyn w przeglądarce (`localStorage`/`sessionStorage`), serwer zawsze
  zostaje trwałą kopią pod kontem.
- Nie trzeba przechowywać ani liczyć agregatów (postęp modułu/kursu, %) — to
  robi frontend z surowych rekordów per lekcja + własnych danych o programie.
- Nie trzeba UI do rozwiązywania konfliktów między urządzeniami — scalanie
  przez sumę zbiorów `completed` z założenia nigdy niczego nie gubi, więc nie
  ma czego rozstrzygać.
