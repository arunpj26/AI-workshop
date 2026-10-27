# TaskFlow — AI-Assisted Engineering Workshop

TaskFlow is a small task-management application for a four-hour GitHub Copilot workshop.

## Stack
- Java 21, Spring Boot 3.5.6, Maven
- H2 dependency (the starter uses in-memory sample data to minimise setup)
- JUnit 5 / Spring Boot Test
- HTML, CSS, JavaScript
- Playwright + TypeScript
- GitHub Actions

The starter displays five sample tasks. The optional priority filter is intentionally **not implemented**; attendees implement it in Session 5.

## Run the app
Prerequisites: JDK 21, Maven 3.9+, Node.js 20+, npm, Git, VS Code, and Copilot access.

```bash
mvn spring-boot:run
```
Open http://localhost:8080. The API is GET /api/tasks.

Run backend tests:
```bash
mvn test
```

Run Playwright (start the app in another terminal first):
```bash
npm install
npx playwright install chromium
npm run test:e2e
npm run test:e2e:report
```

See `docs/workshop/session-by-session-plan.md` for the repository evolution.

## Safety
Use only sample data. Never commit tokens, passwords, API keys, customer data, or confidential Jira content. Attendees should fork the public repository and work in their own forks/branches. Review AI-generated changes and run tests before opening a PR.

## Facilitator
Before distribution, run all commands above on a clean machine, confirm Copilot features work for the expected attendee accounts, and prepare a solution branch or patch as a recovery path.
