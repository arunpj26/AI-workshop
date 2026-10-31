---
description: Playwright end-to-end test conventions for TaskFlow.
applyTo: "e2e/**/*.ts,playwright.config.ts"
---
# Playwright instructions
- Prefer `getByRole`, `getByLabel`, and `getByText` over brittle selectors.
- Wait for observable conditions rather than arbitrary sleeps.
- Map tests to acceptance criteria and cover positive, negative, boundary, and regression cases.
- Keep tests isolated, deterministic, and safe to rerun.
- Use the base URL and scripts in `playwright.config.ts` and `package.json`.
- Capture screenshots when requested or on failure; confirm files exist before reporting them.
- Investigate failures instead of weakening assertions to make tests pass.
- Do not use production systems or real user credentials.
