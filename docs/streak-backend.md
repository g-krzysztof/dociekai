# Backend dla serii nauki (Strapi)

Ten dokument opisuje, co trzeba dodać **po stronie Strapi**, żeby seria nauki
(„rytm nauki” — licznik dni z ukończoną lekcją, wspólny dla kursów matematyki i
informatyki) synchronizowała się z kontem użytkownika. Frontend jest gotowy i
działa bez tego; brakuje wyłącznie tej części.

Frontend woła **wyłącznie** dwa własne route'y Next.js, które proxy'ują do
Strapi — ten sam wzorzec co `math-progress`:

- `src/app/api/streak/route.ts` → `GET {STRAPI_API_URL}/streak`
- `src/app/api/streak/sync/route.ts` → `POST {STRAPI_API_URL}/streak/sync`

Obie strony przekazują nagłówek `Authorization: Bearer <jwt>` bez zmian.
**Dopóki poniższe endpointy nie istnieją w Strapi, frontend działa w pełni
poprawnie** — route'y łapią błąd/timeout i zwracają `{ data: null }`, więc
synchronizacja po prostu nie zachodzi, a seria żyje w `localStorage`
zalogowanego użytkownika. Nic tu nie jest blokujące.

## 1. Co w ogóle trzymamy

**Tylko surowe dni.** Seria, rekord, suma dni nauki, zużyte zamrażarki i
wszystkie odznaki są wyprowadzane w locie na frontendzie
(`src/lib/streak/derive.ts`, `badges.ts`) — dokładnie tak samo, jak postęp
modułu i kursu liczy się z listy lekcji. Backend nie liczy niczego i nie
przechowuje żadnej wartości zagregowanej. Gdyby kiedyś przechowywał, pierwsza
zmiana reguł (inny budżet zamrażarek, inny próg odznaki) rozjechałaby dane
z prawdą.

## 2. Content-type: `streak`

Rekord = cała seria jednego użytkownika. Jeden rekord na użytkownika, nie jeden
na dzień — całość waży kilka kilobajtów nawet po pełnym roku szkolnym.

| Pole | Typ | Uwagi |
|---|---|---|
| `user` | relacja do `plugin::users-permissions.user` | właściciel rekordu; wymagane |
| `days` | JSON (`Record<string, string[]>`) | lokalna data `YYYY-MM-DD` → klucze lekcji ukończonych tego dnia |
| `legacy` | JSON (`string[]`) | lekcje ukończone bez znanej daty (sprzed wdrożenia serii) |
| `breaks` | JSON (`Array<[string, string]>`) | własne przerwy użytkownika („moje ferie”) jako zakresy dat od–do |
| `updatedAt` | (automatyczne) | Strapi robi to samo |

**Unikalność logiczna: jeden rekord na użytkownika.** Ma to wyegzekwować
kontroler `sync` (find-or-create po `user.id`), nie constraint w bazie.

Klucz lekcji ma postać `<kurs>/<moduł>/<lekcja>`, np.
`matematyka/ulamki-zwykle/dodawanie-i-odejmowanie-ulamkow`. Kurs jest w kluczu,
bo na jego podstawie liczy się odznaka „Dwa fronty” (dwa różne przedmioty tego
samego dnia; kursy: `matematyka`, `informatyka`, od 2026-09-25 `historia`). Backend traktuje te klucze jako nieprzezroczyste stringi.

**Daty są lokalne, nie UTC.** Frontend zapisuje dzień tak, jak widziało go
dziecko: lekcja skończona o 23:55 należy do tego dnia, a nie do jutra. Backend
**nigdy nie przelicza** tych dat na strefę czasową ani nie porównuje ich
z własnym zegarem — to zwykłe stringi sortowane leksykograficznie.

## 3. `GET /streak`

Zwraca całą serię zalogowanego użytkownika.

- **Auth:** wymagany, standardowa policy `users-permissions` (ten sam mechanizm
  co `GET /math-progress`). Brak/nieważny token → 401.
- **Filtrowanie:** tylko rekord, gdzie `user.id === ctx.state.user.id` — nigdy
  nie ufaj identyfikatorowi użytkownika przekazanemu w query/body.
- **Response** (200):

```json
{
  "data": {
    "days": {
      "2026-09-14": ["matematyka/liczby-naturalne/zapis-duzych-liczb"],
      "2026-09-15": [
        "matematyka/liczby-naturalne/porownywanie",
        "informatyka/internet-i-bezpieczenstwo/netykieta-i-poczta"
      ]
    },
    "legacy": ["matematyka/start/jak-sie-uczyc"],
    "breaks": [["2027-01-18", "2027-01-29"]]
  }
}
```

Brak rekordu → `{ "data": null }`, nie 404.

## 4. `POST /streak/sync`

Upsert ze scalaniem po stronie serwera — **jedyny endpoint zapisu**. Frontend
wysyła całość (debounced 1500 ms) po każdym zaliczonym dniu.

- **Auth:** jak wyżej, 401 przy braku/nieważnym tokenie.
- **Request body:**

```json
{
  "record": {
    "days": { "2026-09-15": ["matematyka/liczby-naturalne/porownywanie"] },
    "legacy": [],
    "breaks": []
  }
}
```

- **Logika kontrolera:**
  1. Znajdź rekord po `user.id`; jeśli nie istnieje → utwórz z podanymi danymi.
  2. Jeśli istnieje → **scal, nie nadpisuj**, dokładnie tak jak
     `mergeRecords()` we frontendzie:
     - `days`: dla każdej daty suma zbiorów kluczy lekcji
       (`Array.from(new Set([...stare, ...nowe]))`). Daty tylko przybywają.
     - `legacy`: suma zbiorów.
     - `breaks`: suma zbiorów po parze `od/do`.
  3. Nic nigdy nie znika. To jest ta sama reguła, co `unionLessonProgress()`
     w postępie kursów, i ma ten sam powód: dwa urządzenia synchronizujące się
     niemal jednocześnie nie mają czego rozstrzygać, bo scalenie jest przemienne
     i nie gubi niczyjej pracy.
- **Response** (200): pełny, aktualny rekord po scaleniu — ten sam kształt co
  `GET /streak`.

Frontend odczytuje odpowiedź, ale nie jest od niej twardo zależny (błąd/timeout
traktuje jako „spróbuję przy następnej zmianie”).

## 5. Uprawnienia

Dokładnie ten sam model co `math-progress` i `private-fishcards`: rekord należy
do użytkownika, obie operacje wymagają zalogowania, a kontroler filtruje po
`ctx.state.user.id` i ignoruje jakiekolwiek identyfikatory z żądania.

## 6. Czego backend NIE robi

- Nie liczy serii, rekordu ani zamrażarek.
- Nie przyznaje odznak.
- Nie waliduje, czy lekcja o danym kluczu istnieje (kursy się rozrastają,
  a stare klucze mają zostać ważne).
- Nie zeruje ani nie kasuje dni — usunięcie serii to skasowanie całego rekordu
  przez administratora, nie operacja frontendu.
