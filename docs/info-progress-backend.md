# Backend dla postępu kursu informatyki (Strapi)

Ten dokument opisuje, co trzeba dodać **po stronie Strapi**, żeby postęp kursu
„Informatyka — klasa 4” (`/informatyka/klasa-4`) synchronizował się z kontem
użytkownika. Frontend (ten repozytorium, Next.js) jest już w pełni gotowy.
Brakuje wyłącznie tej części.

**Kontrakt jest identyczny z kursem matematyki** — te same pola, te same
kształty odpowiedzi, ta sama logika scalania. Pełny opis (schemat rekordu,
przykłady JSON, logika kontrolera `sync`, uprawnienia, lista rzeczy do
sprawdzenia przy wdrożeniu) stoi w [math-progress-backend.md](math-progress-backend.md)
i **nie jest tu powtarzany**. Poniżej tylko różnice.

## Co jest inne niż w `math-progress`

| | matematyka | informatyka |
|---|---|---|
| content-type | `math-progress` | `info-progress` |
| odczyt | `GET {STRAPI_API_URL}/math-progress` | `GET {STRAPI_API_URL}/info-progress` |
| zapis | `POST {STRAPI_API_URL}/math-progress/sync` | `POST {STRAPI_API_URL}/info-progress/sync` |
| route Next.js | `src/app/api/math-progress/` | `src/app/api/info-progress/` |

Pola rekordu (`user`, `moduleSlug`, `lessonSlug`, `completed`, `total`),
unikalność logiczna `(user, moduleSlug, lessonSlug)`, scalanie przez sumę
zbiorów `completed` i `Math.max` na `total` — **bez zmian**. `completed` niesie
tu id-ki **bloków** lekcji zamiast kroków szablonu, ale dla backendu to dalej
tablica stringów, których nie interpretuje.

Przykładowy rekord:

```json
{
  "moduleSlug": "internet-i-bezpieczenstwo",
  "lessonSlug": "dane-osobowe-i-hasla",
  "completed": ["haczyk", "cwiczenie", "symulator"],
  "total": 6
}
```

**Dopóki te endpointy nie istnieją w Strapi, frontend działa w pełni
poprawnie** — route'y Next.js łapią błąd/timeout i zwracają `{ data: [] }`, więc
synchronizacja po prostu nie zachodzi, a nauka (magazyn lokalny) działa jak
dotychczas. Nic tu nie jest blokujące.

## Czy nie zrobić jednego content-type na oba kursy?

Można — wtedy dochodzi pole `course` (`'matematyka' | 'informatyka'`) i wchodzi
do klucza unikalności, a oba route'y Next.js celują w ten sam endpoint Strapi.
Frontend jest na to gotowy bez zmian w logice: jedyne, co musiałoby się zmienić,
to `apiBase` w `progress-sync.ts` obu kursów (po jednej linijce) plus dopisanie
`course` w proxy. Wybór należy do backendu — **dwa osobne content-type'y są
wariantem domyślnym**, bo nie wymagają ruszania niczego, co w matematyce już
stoi lub jest w trakcie wdrażania.
