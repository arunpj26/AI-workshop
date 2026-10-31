---
name: application-run-local
description: Start TaskFlow locally, verify backend and frontend availability, and open the app in a browser when supported.
agent: agent
---

# Run TaskFlow Locally

Prepare and run the existing TaskFlow application locally so the user can inspect the current UI before making changes.

## Guardrails
- Inspect `README.md`, `pom.xml`, available Maven wrapper files, and the existing application configuration first.
- Do not install packages, change project files, or alter configuration just to make the app start without explaining the need and asking for approval.
- Exception: this prompt pre-authorises installing only what the repository already declares: `npm install` for `package.json` and `npx playwright install chromium`. State each command before running it. Do not edit `package.json`, add other packages, or install system software (Java, Node.js, Maven, Git); if one of those is missing, report it with the install link and stop.
- Do not claim the app is running unless the command output confirms it.
- Do not claim that the browser was opened unless the available environment actually opened it.
- Never print secrets or environment-variable values.
- Do not create a second frontend server unless the repository explicitly uses one.

## Procedure
0. Check prerequisites and set up workshop dependencies:
   - Run `java -version` (Java 25 expected per `pom.xml`/CI), `node --version` (Node 20+), and `npm --version`. Maven is not required when the wrapper (`mvnw`/`mvnw.cmd`) exists. Report any missing tool and stop.
   - If `node_modules/` is missing or `node_modules/@playwright/test` does not exist, run `npm install` in the repository root.
   - Run `npx playwright install chromium`. It is quick when the browser is already installed. On Linux CI-like machines that report missing system libraries, tell the user to run `npx playwright install --with-deps chromium` themselves because it may need elevated rights.
   - Confirm both commands succeeded from their output before continuing. If they fail (for example, no internet or a proxy), report the exact error and continue with the app start, noting that E2E tests will not be runnable.
1. Check whether the project uses Spring Boot to serve the static frontend from `src/main/resources/static/`.
2. Identify the correct run command:
   - Prefer the project Maven wrapper if it exists.
   - Otherwise use `mvn spring-boot:run` if Maven is available.
3. Check whether the expected application port (normally 8080) is already occupied or the app is already running, using tools available in the environment.
4. Start the Spring Boot app using an appropriate terminal/process tool if one is available. If the environment cannot keep a process running, provide the exact command for the user to run in the VS Code terminal.
5. Wait for startup confirmation and inspect logs for startup errors.
6. Verify the configured base URL and the `/api/tasks` endpoint with available local tools, if supported. Do not invent responses or infer success solely from the process starting.
7. When the application is confirmed to be running, provide the URL, normally `http://localhost:8080/`.
8. If the environment supports opening a browser, open the URL. Otherwise tell the user to open it manually.
9. Report the actual startup result, URL, API check result, prerequisite and dependency setup results (Java/Node versions, `npm install`, Playwright Chromium), and any limitations.

## Expected result
The user can open TaskFlow in a browser and inspect the baseline UI before beginning the feature workflow. In this repository, the frontend is expected to be served by Spring Boot on the same port as the API unless inspection proves otherwise.
