import { test, expect, type Page } from '@playwright/test';
import { mockLogin } from './api-mocks/loginMock';
import { hideNextDevOverlay, acceptCookiesIfPresent } from './helpers';

test.beforeEach(async ({ page }) => {
  await hideNextDevOverlay(page);
});

// Tyle samo co FEEDBACK_MS w src/app/gry-edukacyjne/rakieta-liczb/data/levels.ts (1100ms) plus zapas —
// pauza między rozstrzygnięciem rundy a startem kolejnej; bez niej odczyt równania trafiłby
// jeszcze w stary, "zamrożony" stan rundy, którą właśnie rozstrzygnięto.
const ROUND_TRANSITION_BUFFER_MS = 1400;
const RESOLUTION_TIMEOUT_MS = 8000;

async function openNavIfNeeded(page: Page) {
  const navRole = page.getByRole('navigation');
  if ((await navRole.count()) > 0) {
    try {
      if (await navRole.first().isVisible()) return;
    } catch {
      // fall through to try mobile button
    }
  }
  const mobileButton = page
    .getByTestId('mobile-hamburger')
    .first()
    .or(page.getByRole('button', { name: /menu|hamburger|toggle/i }).first())
    .or(page.locator('button[aria-expanded]'))
    .first();
  if (await mobileButton.isVisible()) {
    await mobileButton.click();
    await page.getByTestId('mobile-nav').first().waitFor({ state: 'visible', timeout: 2000 }).catch(() => {});
  }
}

/** Wyciąga poprawny wynik z tekstu równania Poziomu 1 ("13 + 5 = ?", "18 − 7 = ?"). */
function computeCorrectAnswer(questionText: string): number {
  const match = questionText.match(/(\d+)\s*([+−])\s*(\d+)/);
  if (!match) throw new Error(`Nie rozpoznano równania: "${questionText}"`);
  const a = parseInt(match[1], 10);
  const b = parseInt(match[3], 10);
  return match[2] === '+' ? a + b : a - b;
}

async function readLaneOptions(page: Page): Promise<[number, number, number]> {
  const values = await Promise.all(
    [0, 1, 2].map(async (lane) => parseInt(await page.getByTestId(`lane-${lane}-value`).innerText(), 10)),
  );
  return values as [number, number, number];
}

test.describe('RAKIETA LICZB', () => {
  test('wybór poziomu, poprawna runda i koniec gry po 3 błędach', async ({ page }) => {
    test.setTimeout(60_000);

    await mockLogin(page);
    await page.goto('/auth?mode=login');
    await page.getByLabel('Email lub nazwa użytkownika').fill('test.user@example.com');
    await page.getByLabel('Hasło').fill('test-password');
    await page.getByRole('button', { name: /Zaloguj się/i }).click();
    await page.waitForURL(/\/profil/);

    // Nawigacja po stronie klienta (nie page.goto) — AuthProvider zostaje zamontowany,
    // dzięki czemu nie wywoła ponownie realnego zapytania o profil przy starcie.
    await openNavIfNeeded(page);
    const gryLink = page.getByRole('navigation').getByRole('link', { name: 'Gry edukacyjne' }).first();
    await gryLink.waitFor({ state: 'visible', timeout: 2000 }).catch(() => {});
    await Promise.all([page.waitForURL(/\/gry-edukacyjne$/), gryLink.click()]);

    await acceptCookiesIfPresent(page);

    // Hub prezentuje teraz dwie misje (Kupiec Kosmiczny + Rakieta Liczb) — CTA rozróżniamy po data-testid,
    // bo oba mają wspólną rolę "button" i zbliżone etykiety ("Zagraj w ...").
    const zagrajButton = page.getByTestId('game-cta-rakieta-liczb');
    await Promise.all([page.waitForURL(/\/gry-edukacyjne\/rakieta-liczb/), zagrajButton.click()]);

    // Cztery poziomy trudności, wszystkie odblokowane od razu.
    for (let i = 1; i <= 4; i++) {
      await expect(page.getByTestId(`level-card-${i}`)).toBeVisible();
    }

    await page.getByTestId('level-card-1').click();

    // Odliczanie 3-2-1-Start! (4 kroki × 650ms, patrz components/countdown.tsx) samo w sobie
    // zajmuje ~2.6s zanim HUD się pojawi — na wolniejszym CI 5s bywało za ciasne, stąd RESOLUTION_TIMEOUT_MS.
    const question = page.getByTestId('hud-question');
    await expect(question).toBeVisible({ timeout: RESOLUTION_TIMEOUT_MS });

    const score = page.getByTestId('score');
    await expect(score).toHaveText('0');

    let questionText = await question.innerText();
    let options = await readLaneOptions(page);
    let correctAnswer = computeCorrectAnswer(questionText);
    let correctLane = options.findIndex((v) => v === correctAnswer);
    expect(correctLane).toBeGreaterThanOrEqual(0);

    await page.getByTestId(`lane-${correctLane}`).click();
    await expect(score).toHaveText('10', { timeout: RESOLUTION_TIMEOUT_MS });

    const shields = page.getByTestId('shields');
    await expect(shields).toHaveText('3');

    // Trzy błędne rundy z rzędu — gra powinna skończyć się po utracie ostatniej osłony.
    for (let attempt = 0; attempt < 3; attempt++) {
      await page.waitForTimeout(ROUND_TRANSITION_BUFFER_MS);
      questionText = await question.innerText();
      options = await readLaneOptions(page);
      correctAnswer = computeCorrectAnswer(questionText);
      correctLane = options.findIndex((v) => v === correctAnswer);
      const wrongLane = [0, 1, 2].find((lane) => lane !== correctLane)!;

      await page.getByTestId(`lane-${wrongLane}`).click();
      await expect(shields).toHaveText(String(2 - attempt), { timeout: RESOLUTION_TIMEOUT_MS });
    }

    await expect(page.getByTestId('results-screen')).toBeVisible({ timeout: RESOLUTION_TIMEOUT_MS });
    await expect(page.getByTestId('final-score')).toHaveText('10');
    await expect(page.getByRole('button', { name: 'Zagraj ponownie' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Zmień poziom' })).toBeVisible();

    // "Zmień poziom" wraca do ekranu wyboru poziomu.
    await page.getByRole('button', { name: 'Zmień poziom' }).click();
    await expect(page.getByTestId('level-card-1')).toBeVisible();
  });
});
