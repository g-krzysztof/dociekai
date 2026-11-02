import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ['html'],
    ['list'], // Better for UI mode
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: 'http://localhost:3011',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Take screenshot only when test fails */
    screenshot: 'only-on-failure',

    /* Capture video on failure for better debugging */
    video: 'retain-on-failure',

    /* Slow down actions for better visibility in UI mode */
    actionTimeout: 10000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      // Run tests tagged [desktop], and also run tests that are NOT explicitly tagged [mobile].
      // This allows untagged/common tests (e.g., basic, fishcards) to run on desktop.
      grep: /(\[desktop\])|(^((?!\[mobile\]).)*$)/,
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
      grep: /(\[desktop\])|(^((?!\[mobile\]).)*$)/,
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
      grep: /(\[desktop\])|(^((?!\[mobile\]).)*$)/,
    },

    /* Test against mobile viewports. */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
      // Run tests tagged [mobile], and also run tests that are NOT explicitly tagged [desktop].
      // This allows untagged/common tests (e.g., basic, fishcards) to run on mobile.
      grep: /(\[mobile\])|(^((?!\[desktop\]).)*$)/,
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
      grep: /(\[mobile\])|(^((?!\[desktop\]).)*$)/,
    },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3011',
    reuseExistingServer: !process.env.CI,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
