---
name: regression-test
description: Run a focused and full regression test after the new changes.
disable-model-invocation: true
---
Perform a regression test for the current changes. First inspect the Git diff, changed files, approved requirements, and existing test conventions so that the verification is mapped to the implemented behavior.

1. Identify the affected modules and risky integration points.
2. Run the smallest relevant focused tests first.
3. Add or update regression tests when existing coverage does not exercise the changed behavior. Preserve current assertions and test conventions; do not weaken tests to make them pass.
4. Run the complete backend test suite with `.\mvnw.cmd test`.
5. Run the Playwright smoke tests with `npm run test:e2e`.
6. If the application must be running for browser tests and is not already available, start it with `.\mvnw.cmd spring-boot:run` and verify the UI and API before running Playwright.
7. Exercise relevant error, empty, boundary, compatibility, and existing happy-path scenarios beyond the new code.

Fix only regressions caused by the current changes. Do not hide failures, alter unrelated behavior, or claim a check passed unless it was run and observed.

Report:
- changed behavior covered and regression risks
- exact commands run
- tests added or updated, with file references
- pass/fail counts and any failures with file or line references
- checks not run and why
- remaining risks or follow-up actions

End with a clear Regression status: PASS, PASS WITH RISKS, or FAIL.
