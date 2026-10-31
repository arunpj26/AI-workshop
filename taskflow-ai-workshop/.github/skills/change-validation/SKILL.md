---
name: change-validation
description: Validate changes with build, tests, local checks, Playwright, and evidence.
---
# Change validation
1. Read approved criteria and identify changed components.
2. Inspect scripts and prerequisites.
3. Run focused backend tests, then broader tests when feasible.
4. Start the app using the documented local workflow.
5. Verify relevant API and UI behaviour.
6. Run Playwright; use headed mode when requested.
7. Capture requested screenshots in the agreed folder and verify they exist.
8. Review output for failures, flaky behaviour, and skipped checks.
9. Report exact commands, outcomes, and blockers.
10. Do not claim success without evidence or hide failures.
