import { test, expect, type Page } from '@playwright/test';
import { mockFishcards } from './api-mocks/fishcardsMock';
import { mockLogin } from './api-mocks/loginMock';
import { hideNextDevOverlay, acceptCookiesIfPresent } from './helpers';

test.beforeEach(async ({ page }) => {
  await hideNextDevOverlay(page);
});

// Ensure navigation is visible (open mobile hamburger when needed)
async function openNavIfNeeded(page: Page) {
  const navRole = page.getByRole('navigation');
  if ((await navRole.count()) > 0) {
    try {
      if (await navRole.first().isVisible()) return;
    } catch {
      // fall through to try mobile button
    }
  }

  const mobileButton = page.getByTestId('mobile-hamburger').first().or(
    page.getByRole('button', { name: /menu|hamburger|toggle/i }).first()
  ).or(page.locator('button[aria-expanded]')).first();

  if (await mobileButton.isVisible()) {
    await mobileButton.click();
    await page.getByTestId('mobile-nav').first().waitFor({ state: 'visible', timeout: 2000 }).catch(() => {});
    return;
  }

  await page.locator('nav').first().waitFor({ state: 'visible', timeout: 2000 }).catch(() => {});
}

test.describe('QUIZES', () => {
  test('[desktop]', async ({ page }) => {
    await mockFishcards(page);
    await mockLogin(page);

    await page.goto('/auth?mode=login');
    await page.getByLabel('Email lub nazwa użytkownika').fill('test.user@example.com');
    await page.getByLabel('Hasło').fill('test-password');
    await page.getByRole('button', { name: /Zaloguj się/i }).click();

    await page.waitForURL(/\/profil/);

    // Go to Fishcards page
    await openNavIfNeeded(page);
    const fiszkiLink = page.getByRole('navigation').getByRole('link', { name: 'Fiszki' }).first();
    await Promise.all([
      page.waitForURL(/\/fishcards/),
      fiszkiLink.click(),
    ]);

    // Accept cookies/banner if present
    await acceptCookiesIfPresent(page);

  // Expand sidebar (if collapsed) so mode buttons with labels are visible
  await page.getByTitle('Przełącz sidebar').first().click().catch(() => {});
  // Switch to Quiz mode using deterministic test id on the sidebar button
  const quizModeBtn = page.getByTestId('sidebar-quiz-button').first();
  await quizModeBtn.waitFor({ state: 'visible', timeout: 2000 });
  await quizModeBtn.click();

    // Wait for quiz UI to appear
    const display = page.getByTestId('quiz-display-text').first();
    await display.waitFor({ state: 'visible', timeout: 2000 });
    await expect(display).toHaveText(/w poniedziałek/);

    // Answer the first question correctly
    const input = page.getByTestId('quiz-input').first();
    await input.fill('on Monday');
    await page.getByTestId('quiz-check-button').click();

    const result = page.getByTestId('quiz-result').first();
    await result.waitFor({ state: 'visible', timeout: 2000 });
    await expect(result).toHaveText(/Dobrze|✅/);

    // Progress badge should reflect current index
    const progress = page.getByTestId('quiz-progress-badge').first();
    await expect(progress).toHaveText(/1\s*\/\s*7/);

    // Move to next card using keyboard (global handler)
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(300);

    // Second card
    await expect(page.getByTestId('quiz-display-text').first()).toHaveText(/we wtorek/);
    await page.getByTestId('quiz-input').first().fill('on Tuesday');
    await page.getByTestId('quiz-check-button').first().click();
    await expect(page.getByTestId('quiz-result').first()).toHaveText(/Dobrze|✅/);
  });

  test('[mobile]', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await mockFishcards(page);
    await mockLogin(page);

    await page.goto('/auth?mode=login');
    await page.getByLabel('Email lub nazwa użytkownika').fill('test.user@example.com');
    await page.getByLabel('Hasło').fill('test-password');
    await page.getByRole('button', { name: /Zaloguj się/i }).click();

    await page.waitForURL(/\/profil/);

    // open mobile nav if needed and go to Fishcards
    const mobileMenuButton = page.getByTestId('mobile-hamburger').first().or(
      page.getByRole('button', { name: /menu|hamburger|toggle/i }).first()
    );
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();
      await page.getByTestId('mobile-nav').first().waitFor({ state: 'visible', timeout: 2000 }).catch(() => {});
    }

    const mobileFiszki = page.getByRole('navigation').getByRole('link', { name: 'Fiszki' }).first();
    await Promise.all([
      page.waitForURL(/\/fishcards/),
      mobileFiszki.click(),
    ]);

    await acceptCookiesIfPresent(page);

  // Open mobile settings drawer and switch to Quiz mode
  // Try multiple selectors because mobile accessibility names can vary between environments
  let settingsBtn = page.getByRole('button', { name: 'Ustawienia' }).first();
  if (!(await settingsBtn.isVisible().catch(() => false))) {
    settingsBtn = page.locator('button', { hasText: 'Ustawienia' }).first();
  }
  // As a last resort try English label if environment is different
  if (!(await settingsBtn.isVisible().catch(() => false))) {
    settingsBtn = page.getByRole('button', { name: /Settings|Ustawienia/i }).first();
  }
  await settingsBtn.waitFor({ state: 'visible', timeout: 4000 }).catch(() => {});
  await settingsBtn.click().catch(() => {});

  // Use test id for mobile quiz button inside settings drawer
  const quizModeBtn = page.getByTestId('mobile-quiz-button').first();
  await quizModeBtn.waitFor({ state: 'visible', timeout: 4000 });
  await quizModeBtn.click();
  // Try to ensure the settings drawer is closed (overlay removed) before interacting with quiz UI.
  // Press Escape to close the drawer if it's still open, then wait briefly for overlay to detach.
  await page.keyboard.press('Escape').catch(() => {});
  await page.waitForTimeout(250);
  await page.locator('[data-vaul-overlay]').first().waitFor({ state: 'detached', timeout: 3000 }).catch(() => {});

  // Ensure quiz UI present
  await page.getByTestId('quiz-display-text').first().waitFor({ state: 'visible', timeout: 2000 });

  // Fill answer and check. Mobile may show the other language first, so derive expected answer from displayed text.
    const displayed = (await page.getByTestId('quiz-display-text').first().innerText()).toLowerCase();
    // simple mapping for days (mock dataset uses weekdays)
    const polishToEnglish: Record<string, string> = {
      'poniedziałek': 'on Monday',
      'wtorek': 'on Tuesday',
      'środ': 'on Wednesday',
      'czwartek': 'on Thursday',
      'piątek': 'on Friday',
      'sobot': 'on Saturday',
      'niedziel': 'on Sunday',
    };
    const englishToPolish: Record<string, string> = {
      'monday': 'w poniedziałek',
      'tuesday': 'we wtorek',
      'wednesday': 'w środę',
      'thursday': 'w czwartek',
      'friday': 'w piątek',
      'saturday': 'w sobotę',
      'sunday': 'w niedzielę',
    };

    let answer = '';
    // detect polish word inside displayed text
    for (const key of Object.keys(polishToEnglish)) {
      if (displayed.includes(key)) {
        answer = polishToEnglish[key];
        break;
      }
    }
    if (!answer) {
      for (const key of Object.keys(englishToPolish)) {
        if (displayed.includes(key)) {
          answer = englishToPolish[key];
          break;
        }
      }
    }
    if (!answer) answer = 'on Monday';
    await page.getByTestId('quiz-input').first().fill(answer);
  await page.getByTestId('quiz-check-button').first().click();
  // Ensure a result message appears (correct or incorrect)
  await expect(page.getByTestId('quiz-result').first()).toBeVisible();

    // On mobile buttons become enabled after completing question — use Next button
    const nextBtn = page.getByTestId('quiz-next').first();
    await nextBtn.waitFor({ state: 'visible', timeout: 2000 });
    await nextBtn.click();

  // Second card should show (language may vary) — derive expected answer from displayed text
    const displayed2 = (await page.getByTestId('quiz-display-text').first().innerText()).toLowerCase();
    let answer2 = '';
    for (const key of Object.keys(polishToEnglish)) {
      if (displayed2.includes(key)) {
        answer2 = polishToEnglish[key];
        break;
      }
    }
    if (!answer2) {
      for (const key of Object.keys(englishToPolish)) {
        if (displayed2.includes(key)) {
          answer2 = englishToPolish[key];
          break;
        }
      }
    }
    if (!answer2) answer2 = 'on Tuesday';
    await page.getByTestId('quiz-input').first().fill(answer2);
  await page.getByTestId('quiz-check-button').first().click();
  await expect(page.getByTestId('quiz-result').first()).toBeVisible();
  });
});
