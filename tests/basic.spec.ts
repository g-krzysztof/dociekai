import { test, expect, type Page } from '@playwright/test';
import { hideNextDevOverlay } from './helpers';

test.beforeEach(async ({ page }) => {
  await hideNextDevOverlay(page);
});

// Helper to ensure navigation is visible (opens mobile hamburger when needed)
async function openNavIfNeeded(page: Page) {
  const navRole = page.getByRole('navigation');
  if ((await navRole.count()) > 0) {
    try {
      if (await navRole.first().isVisible()) return;
    } catch (e) {
      // fall through to try mobile button
    }
  }

  const mobileButton = page.getByTestId('mobile-hamburger').first().or(
    page.getByRole('button', { name: /menu|hamburger|toggle/i }).first()
  );

  if (await mobileButton.isVisible()) {
    await mobileButton.click();
    // wait for mobile nav to appear
    const mobileNav = page.getByTestId('mobile-nav');
    await mobileNav.first().waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});
    return;
  }

  // Fallback: wait for any <nav> to be visible
  await page.locator('nav').first().waitFor({ state: 'visible', timeout: 3000 }).catch(() => {});
}

test.describe('BASIC', () => {
  test('render [desktop, mobile]', async ({ page }) => {
    await page.goto('/');

    // Check if the page loads correctly
    await expect(page).toHaveTitle(/DociekAI/);

    // Check if main heading is visible
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // Check if navigation is present. Some mobile browsers (or mobile emulation)
    // render navigation behind a hamburger — handle both cases robustly.
    const navRole = page.getByRole('navigation');
    if ((await navRole.count()) > 0) {
      await expect(navRole.first()).toBeVisible();
    } else {
      // Try opening mobile hamburger if present
      const mobileButton = page.getByTestId('mobile-hamburger').first().or(
        page.getByRole('button', { name: /menu|hamburger|toggle/i }).first()
      );
      if (await mobileButton.isVisible()) {
        await mobileButton.click();
        await expect(page.getByTestId('mobile-nav')).toBeVisible();
      } else {
        // Fallback: assert there is at least one <nav> visible
        await expect(page.locator('nav').first()).toBeVisible();
      }
    }
  });

  test('navigation [desktop, mobile]', async ({ page }) => {
    await page.goto('/');

    // Test navigation to Blog
    await openNavIfNeeded(page);
    // Use visible navigation link
    const blogLink = page.getByRole('link', { name: /Blog/i }).filter({ hasText: /^Blog$/i });
    await Promise.all([
      page.waitForURL(/\/blog/),
      blogLink.first().click(),
    ]);
    await expect(page).toHaveURL(/\/blog/);

    // Go back to home
    await page.goto('/');

  // Test navigation to Fishcards
  await openNavIfNeeded(page);
  const fishcardsLink = page.getByRole('link', { name: 'Fiszki' });
  await fishcardsLink.first().click();
    await expect(page).toHaveURL(/\/fishcards/);

    // Go back to home
    await page.goto('/');

  // Test navigation to Games
  await openNavIfNeeded(page);
  const gamesLink = page.getByRole('link', { name: 'Gry edukacyjne' });
  await gamesLink.first().click();
    await expect(page).toHaveURL(/\/gry-edukacyjne/);

    // Go back to home
    await page.goto('/');

  // Test navigation to Contact
  await openNavIfNeeded(page);
  const contactLink = page.getByRole('link', { name: 'Kontakt' });
  await contactLink.first().click();
    await expect(page).toHaveURL(/\/kontakt/);
  });

  test('responsive [desktop]', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.goto('/');
    
    // Navigation should be visible on desktop (or openable on mobile)
    const navRoleDesktop = page.getByRole('navigation');
    if ((await navRoleDesktop.count()) > 0) {
      await expect(navRoleDesktop.first()).toBeVisible();
    } else {
      const mobileButton = page.getByTestId('mobile-hamburger').first().or(
        page.getByRole('button', { name: /menu|hamburger|toggle/i }).first()
      );
      if (await mobileButton.isVisible()) {
        await mobileButton.click();
        await expect(page.getByTestId('mobile-nav')).toBeVisible();
      } else {
        await expect(page.locator('nav').first()).toBeVisible();
      }
    }
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // On mobile, navigation might be hidden behind hamburger menu
    // Look for hamburger/menu button and click it to open navigation
    const menuButton = page.getByRole('button', { name: /menu|hamburger|toggle/i }).or(
      page.locator('button[aria-expanded]')
    ).or(
      page.locator('[data-testid*="menu"], [aria-label*="menu"]')
    ).first();
    
    if (await menuButton.isVisible()) {
      await menuButton.click();
    }
    
    // Target the mobile navigation specifically (the one without 'hidden' in class)
    // Based on the error, the mobile nav has "container mx-auto px-4 py-4 space-y-3" classes
    await expect(page.locator('nav').nth(1)).toBeVisible();
  });
});
