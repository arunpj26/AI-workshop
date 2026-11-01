# TaskFlow AI Workshop Starter

Small TaskFlow sample app for a five-session workshop on AI-assisted engineering with GitHub Copilot.

## Sample feature
Add optional `priority` filtering to `GET /api/tasks`: `LOW`, `MEDIUM`, `HIGH`; omitted means all tasks; invalid means HTTP 400. Preserve existing behaviour. Read `docs/requirements/task-priority-filter.md` and `docs/requirements/acceptance-criteria.md` first.

## Repository map
- `.github/copilot-instructions.md`: repository-wide rules.
- `.github/instructions/`: Java, frontend, Playwright conventions.
- `.github/prompts/`: requirement, plan, tests, review prompts.
- `.github/agents/`: six role-based agents, including a dedicated frontend developer.
- `.github/skills/`: four reusable procedures.
- `.github/hooks/`: hook config and limited network guardrail.
- `.vscode/mcp.json`: optional Atlassian MCP v2 workspace connection.
- `docs/workshop/session-by-session-plan.md`: agenda and file count.
- `docs/workshop/configuration-reference.md`: component mappings.
- `docs/workshop/ai-assisted-engineering-workshop-guide.html`: shareable HTML guide.
- `docs/security/README.md`: hook limitations.
- `e2e/`: Playwright tests.

## Prerequisites
Java/Maven, Node/npm, VS Code, Git, GitHub Copilot, and Playwright browser dependencies. Jira MCP also needs Atlassian Cloud access and permission to authenticate.

## Run backend
```bash
mvn test
mvn spring-boot:run
```
Open `http://localhost:8080`.

## User profile

The dashboard reads the current profile from `GET /api/users/current`. Configure
`TASKFLOW_USER_NAME`, `TASKFLOW_USER_ROLE`, and `TASKFLOW_USER_IMAGE_URL` in the
application environment when a profile is available. If these values are absent,
the dashboard uses a generic greeting and initials rather than sample personal
details. This starter has no authentication system; connect the endpoint to the
trusted current-user source when integrating it with an authenticated application.

## Run Playwright
```bash
npm install
npx playwright install
npx playwright test
```
Use `npx playwright test --headed` for headed mode. Check `package.json` and `playwright.config.ts` for actual scripts/base URL.

## Jira MCP
Follow `.vscode/README.md`. This repository contains the endpoint, not credentials. Complete OAuth through the supported client and verify access to an authorized issue. Use `docs/requirements/jira-sample-issue.md` if unavailable.

## Safety
Approve the plan before coding. Never store secrets in the repository. The hook example is not complete network/IP/location enforcement. Do not commit, push, create a PR, merge, or deploy without explicit approval. Run checks in your environment before relying on this starter.


### Session 5: run the app and follow the Jira-to-PR workflow

- Prompt: `.github/prompts/application-run-local.prompt.md`
- Step-by-step instructor/attendee guide: `docs/workshop/session-5-jira-to-pr-workflow.md`
- Run the prompt from Copilot Chat using `/application-run-local` if prompt discovery supports that syntax. If the prompt cannot keep a process running or open a browser, start the app in the VS Code terminal and open `http://localhost:8080/` manually.


### End-to-end Jira-to-PR workflow

- Orchestrator agent: `.github/agents/jira-to-pr.agent.md`
- Reusable workflow skill: `.github/skills/jira-to-pr/SKILL.md`
- The orchestrator reuses the existing specialist agents and skills. Runtime delegation, Jira access and PR publication depend on supported Copilot features, authentication and explicit approval.


Jira synchronization: the `jira-to-pr` agent/skill now describes approved Jira status transitions (`In Progress` when implementation starts and `Code Review` when a real PR is ready) plus a verified end-of-work summary comment. Jira writes require authenticated MCP permissions and explicit user authorisation; actual transition names depend on the Jira workflow.


The `/application-run-local` prompt checks prerequisites first and reuses compatible installations. It prefers the Maven Wrapper. Java/JDK, Maven, Node.js, and Playwright are not blindly installed or upgraded; missing prerequisites are explained and installation requires attendee approval. Playwright is only needed for browser E2E tests, not to launch the TaskFlow UI.
