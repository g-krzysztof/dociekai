import { test, expect, type Page } from '@playwright/test';
import { mockLogin } from './api-mocks/loginMock';
import { hideNextDevOverlay, acceptCookiesIfPresent } from './helpers';

// Zwykła, wczesna lekcja kursu informatyki klasy 4 (moduł 1), która ma lekcję następną.
const LESSON_URL = '/informatyka/klasa-4/komputer-i-pliki/historia-komputera';
// Klucz postępu gościa/konta — prefiks z src/app/informatyka/klasa-4/lib/progress-storage.ts.
const PROGRESS_KEY = 'dociekai:info-lesson:komputer-i-pliki/historia-komputera';

test.beforeEach(async ({ page }) => {
  await hideNextDevOverlay(page);
});

/** Id-ki wszystkich bloków lekcji (sekcje oznaczone data-lesson-block w powłoce lekcji). */
async function collectBlockIds(page: Page): Promise<string[]> {
  const ids = await page
    .locator('[data-lesson-block]')
    .evaluateAll((nodes) => nodes.map((n) => n.getAttribute('data-lesson-block') ?? ''));
  return ids.filter(Boolean);
}

/** Zapisuje postęp w sessionStorage (magazyn gościa) i przeładowuje stronę. */
async function seedGuestProgress(page: Page, completed: string[], total: number) {
  await page.evaluate(
    ([key, value]) => window.sessionStorage.setItem(key, value),
    [PROGRESS_KEY, JSON.stringify({ completed, total })],
  );
  await page.reload();
}

async function openLessonAsGuest(page: Page): Promise<string[]> {
  await page.goto(LESSON_URL);
  await acceptCookiesIfPresent(page);
  await expect(page.locator('[data-lesson-block]').first()).toBeAttached({ timeout: 20_000 });
  const ids = await collectBlockIds(page);
  expect(ids.length).toBeGreaterThan(2);
  return ids;
}

test.describe('POSTĘP LEKCJI INFORMATYKI', () => {
  test('gość: postęp wraca po odświeżeniu, lekcja się kończy i postęp zostaje tylko w karcie', async ({
    page,
    browser,
  }) => {
    test.setTimeout(90_000);

    const ids = await openLessonAsGuest(page);
    const n = ids.length;
    const endHeading = (re: RegExp) => page.getByRole('heading', { name: re });

    await expect(endHeading(new RegExp(`Zrobione: 0 z ${n} bloków`))).toBeVisible({ timeout: 15_000 });

    // Wszystkie bloki oprócz ostatniego.
    await seedGuestProgress(page, ids.slice(0, -1), n);
    await expect(endHeading(new RegExp(`Zrobione: ${n - 1} z ${n} bloków`))).toBeVisible({ timeout: 15_000 });

    // Wszystkie bloki — lekcja ukończona, jest link do następnej.
    await seedGuestProgress(page, ids, n);
    await expect(endHeading(/Lekcja ukończona!/)).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('link', { name: /Następna lekcja/ })).toBeVisible();

    // Postęp gościa nigdy nie trafia do localStorage.
    const persisted = await page.evaluate((key) => window.localStorage.getItem(key), PROGRESS_KEY);
    expect(persisted).toBeNull();

    // Świeży kontekst (nowa karta/przeglądarka) nie widzi sessionStorage poprzedniego.
    const context = await browser.newContext();
    try {
      const fresh = await context.newPage();
      await hideNextDevOverlay(fresh);
      await fresh.goto(LESSON_URL);
      await acceptCookiesIfPresent(fresh);
      await expect(fresh.getByRole('heading', { name: new RegExp(`Zrobione: 0 z ${n} bloków`) })).toBeVisible({
        timeout: 15_000,
      });
    } finally {
      await context.close();
    }
  });

  test('logowanie przenosi postęp gościa na konto', async ({ page }) => {
    test.setTimeout(90_000);

    // Logowanie i synchronizacja nie mogą dotknąć prawdziwego backendu.
    await mockLogin(page);
    await page.route('**/api/auth/profile', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          user: {
            id: 3,
            documentId: 'test-document-id-0000000',
            username: 'test-user',
            email: 'test.user@example.com',
            confirmed: true,
            blocked: false,
            firstName: 'Jan',
            lastName: 'Testowy',
          },
        }),
      });
    });
    for (const pattern of ['**/api/info-progress**', '**/api/streak**']) {
      await page.route(pattern, (route) =>
        route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: null }) }),
      );
    }

    // Gość z częściowym postępem.
    const ids = await openLessonAsGuest(page);
    const n = ids.length;
    const partial = ids.slice(0, 2);
    await seedGuestProgress(page, partial, n);
    await expect(page.getByRole('heading', { name: new RegExp(`Zrobione: 2 z ${n} bloków`) })).toBeVisible({
      timeout: 15_000,
    });

    // Logowanie.
    await page.goto('/auth?mode=login');
    await page.getByLabel('Email lub nazwa użytkownika').fill('test.user@example.com');
    await page.getByLabel('Hasło').fill('test-password');
    await page.getByRole('button', { name: /Zaloguj się/i }).click();
    // Po zalogowaniu aplikacja sama przekierowuje na profil — czekamy na to, żeby nasza nawigacja nie została przerwana.
    await page.waitForURL(/\/profil/, { timeout: 20_000 });
    // Scalenie jest synchroniczne po login(), ale zapis na konto kończy się po (zamockowanym) fetchu.
    await expect
      .poll(() => page.evaluate((key) => window.localStorage.getItem(key), PROGRESS_KEY), { timeout: 15_000 })
      .not.toBeNull();

    // Z powrotem na lekcję — postęp jest już na koncie.
    await page.goto(LESSON_URL);
    await expect(page.getByRole('heading', { name: new RegExp(`Zrobione: 2 z ${n} bloków`) })).toBeVisible({
      timeout: 20_000,
    });
    const stored = await page.evaluate((key) => window.localStorage.getItem(key), PROGRESS_KEY);
    expect(JSON.parse(stored ?? 'null').completed.sort()).toEqual([...partial].sort());
  });
});
