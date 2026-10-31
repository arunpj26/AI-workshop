---
description: "TaskFlow workspace workflow for focused Spring Boot, frontend, and Playwright changes"
applyTo: "src/**,e2e/**"
---

# TaskFlow Workspace Workflow

- Follow the existing TaskFlow backend, backend-test, frontend, and Playwright conventions relevant to the files being changed.
- Keep changes minimal and focused on the requested behavior.
- Preserve the existing Spring Boot API contract and the static frontend served from `src/main/resources/static/`.
- Do not modify project configuration, dependencies, or application ports unless the user explicitly requests it.
- Use the Maven wrapper (`./mvnw` or `mvnw.cmd`) for backend commands.
- Use repository npm scripts for frontend and Playwright validation.
- Add or update focused tests for behavior changes.
- Run the narrowest relevant Maven or Playwright validation after edits.
- Report the files changed and the validation results.
- Never commit, push, create a pull request, merge, or deploy unless the user explicitly authorizes the action.
- Do not claim that a UI or API check succeeded unless an HTTP response confirms it.
