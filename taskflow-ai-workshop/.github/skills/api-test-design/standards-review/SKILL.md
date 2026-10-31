---
name: standards-review
description: "Review current changes for repository standards, conventions, and maintainability."
disable-model-invocation: true
---
Review the current Git diff as a standards and code-quality audit. Do not edit files automatically.

1. Read the applicable repository instructions and conventions for every changed file:
   - `.github/instructions/backend.instructions.md`
   - `.github/instructions/frontend.instructions.md`
   - `.github/instructions/playwright.instructions.md`
   - package-specific README files and existing neighboring code
2. Check the diff against these standards:
   - architecture and separation of concerns
   - naming, formatting, package/file organization, and consistency with local patterns
   - dependency and framework choices approved by the repository
   - API compatibility, validation, error handling, and controller/service boundaries
   - frontend accessibility, responsive behavior, safe DOM handling, and error presentation
   - Playwright selector quality, isolation, determinism, and observable waits
   - test quality, coverage, and consistency with JUnit/MockMvc or Playwright conventions
   - security, secrets, logging of sensitive data, and dependency changes
   - documentation and comments that are necessary and accurate
   - focused scope; avoid unrelated formatting, refactoring, or feature creep
3. Distinguish confirmed violations from recommendations or risks. Do not treat tooling preferences without repository guidance as violations.
4. For each confirmed finding, provide file and line references, the specific standard being violated, impact, and the smallest recommended correction.
5. Run or inspect relevant focused checks when available. Report exact commands and results; do not claim unrun checks passed.

Return findings in this order:

## Standards Review Findings

| Severity | File | Lines | Standard | Finding | Recommended correction |
|---|---|---:|---|---|---|

Then provide:
- standards reviewed and changed areas covered
- checks run and observed results
- standards that could not be verified
- a final `Standards status: PASS`, `PASS WITH RISKS`, or `FAIL`
