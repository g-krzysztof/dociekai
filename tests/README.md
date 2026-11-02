# End-to-end tests (Playwright)

Smoke tests against the dev server. `playwright.config.ts` starts `npm run dev` on port 3011 by itself, or reuses one that's already running locally.

```bash
npx playwright install                  # once: download the browsers
npm run test:e2e                        # all specs, all projects
npx playwright test tests/basic.spec.ts --project=chromium
npm run test:e2e:ui                     # interactive runner
```

## Projects and tags

Five projects: Chromium, Firefox and WebKit on desktop, and Pixel 5 and iPhone 12 on mobile. A test whose title contains `[desktop]` or `[mobile]` runs only on that side. Untagged tests run everywhere.

## What's covered

| Spec | What it checks |
| --- | --- |
| `basic.spec.ts` | Home page renders, header navigation works, layout responds to viewport size |
| `quizes.spec.ts` | Quiz flow on desktop and mobile |
| `fishcards.spec.ts` | Flashcards: login and the card list, with the backend mocked |
| `lekcja-postep.spec.ts` | Lesson progress in a CS lesson: a guest's progress comes back after a reload and stays in the tab only, the finished-lesson card appears, and logging in carries the guest's progress over to the account. Progress is seeded in storage, the widgets aren't solved in the browser |
| `rakieta-liczb.spec.ts` | Number-line mini-game: pick a level, finish a correct round, game over after three mistakes |

## Backend

No backend is needed. Calls to `/api/auth/*` and `/api/fishcards` are intercepted with `page.route()` (see [`api-mocks/`](api-mocks/)), so the suite runs in CI without secrets.

[`helpers.ts`](helpers.ts) hides the Next.js dev-tools overlay, which can otherwise cover clickable elements and make clicks time out.

Most of the correctness checking for lesson logic lives in the esbuild self-tests (`npm run test:unit`, `scripts/*-selftest.mjs`), not here. See "Known limitations" in the root README.
