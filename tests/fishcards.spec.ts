import { test, expect, type Page } from '@playwright/test';
import type { Locator } from '@playwright/test';

// Helper to ensure navigation is visible (open mobile hamburger when needed)
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

// After next/prev/toggle-learned the card remounts (AnimatePresence key={currentCard.id}),
// so the outgoing card can briefly stay in the DOM alongside the incoming one while its exit
// transition finishes — under slower/CI engines (seen on WebKit) that can take longer than a
// fixed sleep. Wait for the stale duplicate to unmount before asserting text, instead of racing it.
async function expectSingleText(page: Page, testId: string, pattern: RegExp, timeout = 8000) {
  const locator = page.getByTestId(testId);
  await expect(locator).toHaveCount(1, { timeout });
  await expect(locator).toHaveText(pattern);
}

async function emulateCardClick(page: Page, card: Locator) {
  // Use the first matching locator to avoid strict mode errors when
  // both front and back card elements exist in the DOM (they are stacked).
  const target = card.first();
  await target.scrollIntoViewIfNeeded();
  await expect(target).toBeVisible();
  await target.hover();
  const handle = await target.elementHandle();
  if (handle) {
    const box = await handle.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.up();
    } else {
      await target.click();
    }
    await handle.dispose();
  } else {
    await target.click();
  }
}
import { mockFishcards } from './api-mocks/fishcardsMock';
import { mockLogin } from './api-mocks/loginMock';
import { hideNextDevOverlay, acceptCookiesIfPresent } from './helpers';

test.beforeEach(async ({ page }) => {
  await hideNextDevOverlay(page);
});

test.describe('FISHCARDS', () => {
  test('[desktop]', async ({ page }) => {
    // register mocks from helpers
    await mockFishcards(page);
    await mockLogin(page);

    await page.goto('/auth?mode=login');

    await page.getByLabel('Email lub nazwa użytkownika').fill('test.user@example.com');
    await page.getByLabel('Hasło').fill('test-password');
    await page.getByRole('button', { name: /Zaloguj się/i }).click();

    await page.waitForURL(/\/profil/);
    await expect(page).toHaveURL(/\/profil/);

    // Ensure navigation is visible and then click the Fishcards link
    await openNavIfNeeded(page);
    const fiszkiLink = page.getByRole('navigation').getByRole('link', { name: 'Fiszki' }).first();
    await fiszkiLink.waitFor({ state: 'visible', timeout: 2000 }).catch(() => {});
    await Promise.all([
      page.waitForURL(/\/fishcards/),
      fiszkiLink.click(),
    ]);

    await acceptCookiesIfPresent(page);

    // Click next button - both desktop and mobile have chevron-right testid
    const nextBtn = page.getByTestId('chevron-right').first();
    await nextBtn.waitFor({ state: 'visible', timeout: 5000 });
    await nextBtn.click();
    await page.waitForTimeout(1000);

    await expectSingleText(page, 'flashcard-front-text', /we wtorek/);

    const card = page.locator('[data-testid="flashcard-card"]');
    await emulateCardClick(page, card);

    await page.waitForTimeout(1000);
    const back = page.getByTestId('flashcard-back-text');
    await expect(back).toHaveText(/on Tuesday/);

    const chevronLeft = page.getByTestId('chevron-left').first();
    await chevronLeft.waitFor({ state: 'visible', timeout: 5000 });
    await chevronLeft.click();
    await page.waitForTimeout(1000);
    await expectSingleText(page, 'flashcard-front-text', /w poniedziałek/);

    await emulateCardClick(page, card);

    await page.waitForTimeout(1000);
    const backText = page.getByTestId('flashcard-back-text');
    await expect(backText).toHaveText(/on Monday/);

    const chevronRight2 = page.getByTestId('chevron-right').first();
    await chevronRight2.waitFor({ state: 'visible', timeout: 5000 });
    await chevronRight2.click();
    await page.waitForTimeout(1000);

    await emulateCardClick(page, card);
    await page.waitForTimeout(1000);

    const toggleBack = page.locator('[data-testid="flashcard-button-toggle-learned-back"]');

    await toggleBack.click();
    await page.waitForTimeout(1000);

    await expectSingleText(page, 'flashcard-front-text', /w środę/);

  const progress = page.getByTestId('flashcard-progress-badge').first();
  await expect(progress).toHaveText('2 / 6');

    const fullscreenProgress = page.getByTestId('fullscreen-flashcards-progress');
    await expect(fullscreenProgress).toHaveText('1/7 (14%)');

    await page.waitForTimeout(1000);
  });

  test('[mobile]', async ({ page }) => {
    // Mobile viewport
    await page.setViewportSize({ width: 375, height: 812 });

    // register mocks from helpers
    await mockFishcards(page);
    await mockLogin(page);

    await page.goto('/auth?mode=login');

    await page.getByLabel('Email lub nazwa użytkownika').fill('test.user@example.com');
    await page.getByLabel('Hasło').fill('test-password');
    await page.getByRole('button', { name: /Zaloguj się/i }).click();

    await page.waitForURL(/\/profil/);
    await expect(page).toHaveURL(/\/profil/);
    // Ensure nav is visible (open mobile hamburger if needed) before clicking
    const mobileMenuButton = page.getByTestId('mobile-hamburger').first().or(
      page.getByRole('button', { name: /menu|hamburger|toggle/i }).first()
    );

    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();
      await page.getByTestId('mobile-nav').first().waitFor({ state: 'visible', timeout: 2000 }).catch(() => {});
    }

    const mobileFiszki = page.getByRole('navigation').getByRole('link', { name: 'Fiszki' }).first();
    await mobileFiszki.waitFor({ state: 'visible', timeout: 2000 }).catch(() => {});
    await Promise.all([
      page.waitForURL(/\/fishcards/),
      mobileFiszki.click(),
    ]);

    await acceptCookiesIfPresent(page);

    // Follow the same sequence as desktop: Next -> flip -> Previous -> flip -> Next -> flip -> toggle
    // 1) Next
    await page.getByTestId('button-next').click();
    await page.waitForTimeout(1000);

    // 2) Expect front text for the next card
    await expectSingleText(page, 'flashcard-front-text', /we wtorek/);

    const card = page.locator('[data-testid="flashcard-card"]');

    // 3) Flip (click card)
    await emulateCardClick(page, card);
    await page.waitForTimeout(1000);
    const back = page.getByTestId('flashcard-back-text');
    await expect(back).toHaveText(/on Tuesday/);

    // 4) Previous
    await page.getByTestId('button-prev').click();
    await page.waitForTimeout(1000);

    // 5) Expect front of previous card
    await expectSingleText(page, 'flashcard-front-text', /w poniedziałek/);

    // 6) Flip previous card
    await emulateCardClick(page, card);
    await page.waitForTimeout(1000);
    const backText = page.getByTestId('flashcard-back-text');
    await expect(backText).toHaveText(/on Monday/);

    // 7) Next
    await page.getByTestId('button-next').click();
    await page.waitForTimeout(1000);

    // 8) Flip
    await emulateCardClick(page, card);
    await page.waitForTimeout(1000);

    // 9) Toggle learned on back
    const toggleBack = page.locator('[data-testid="flashcard-button-toggle-learned-back"]');
    await toggleBack.click();
    await page.waitForTimeout(1000);

    // 10) Expect next card front
    await expectSingleText(page, 'flashcard-front-text', /w środę/);

  const progress = page.getByTestId('flashcard-progress-badge').first();
  await expect(progress).toHaveText('2 / 6');

    await page.waitForTimeout(1000);
  });
});
