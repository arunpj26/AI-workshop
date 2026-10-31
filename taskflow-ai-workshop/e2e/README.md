# Playwright end-to-end tests

The E2E tests verify the app through the browser. Test names and assertions should map to the acceptance criteria in `docs/requirements/acceptance-criteria.md`.

Typical workflow:
1. Install dependencies with `npm install`.
2. Install browser binaries using `npx playwright install`.
3. Start the application as required by `playwright.config.ts`.
4. Run `npx playwright test`.
5. For headed debugging, run `npx playwright test --headed`.
6. Inspect failure output and screenshots; do not claim success unless the command completed successfully.

Use stable user-facing locators and avoid production data/credentials. Check the configured base URL and package scripts before running.
