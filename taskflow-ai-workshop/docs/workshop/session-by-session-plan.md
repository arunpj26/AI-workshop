# Session-by-session repository evolution

The repository starts with a runnable baseline. Copilot customisation artifacts are placeholders so attendees create them in the relevant sessions.

## Before the workshop — facilitator
Included: baseline Spring Boot API/UI, sample tasks, backend test, Playwright smoke test, feature requirement, folder placeholders, CI workflow.
Verify before distributing: run `mvn test`; run `mvn spring-boot:run` and open `http://localhost:8080`; run `npm install`, `npx playwright install chromium`, `npm run test:e2e`; verify attendees' Copilot feature access; prepare a completed solution branch/patch.

## Session 1 — Prompting and workflow (45 min)
Attendees create:
- `docs/requirements/acceptance-criteria.md`
- `.github/prompts/understand-requirement.prompt.md`
- `.github/prompts/plan-feature.prompt.md`
- `.github/prompts/generate-tests.prompt.md`
- `.github/prompts/review-changes.prompt.md`
Activity: compare vague and structured prompts; ask Copilot to restate the requirement, identify edge cases, and plan files/tests. Do not implement yet.

## Session 2 — Repository instructions (35 min)
Attendees create:
- `.github/copilot-instructions.md`
- `.github/instructions/backend.instructions.md`
- `.github/instructions/frontend.instructions.md`
- `.github/instructions/testing.instructions.md`
Activity: compare Copilot's proposed approach before/after instructions. Verify the instructions are discovered and applied.

## Session 3 — Custom agents and reusable skills (35 min)
Attendees create:
- `.github/agents/task-planner.agent.md`
- `.github/agents/task-api-developer.agent.md`
- `.github/agents/test-engineer.agent.md`
- `.github/agents/code-reviewer.agent.md`
- `.github/skills/requirement-analysis/SKILL.md`
- `.github/skills/api-test-design/SKILL.md`
- `.github/skills/change-validation/SKILL.md`
Activity: facilitator builds one agent end to end; attendees create/customise at least one agent and one skill and verify discovery. Confirm current filename/frontmatter conventions for the installed VS Code/Copilot version.

## Session 4 — MCP, security, responsible AI (45 min)
Attendees create:
- `docs/integrations/mcp-workshop.md`
- `docs/security/ai-and-mcp-checklist.md`
- `docs/requirements/jira-sample-issue.md` (fallback)
Activity: use an approved read-only Jira MCP connection if available; otherwise use the fictional sample issue. Discuss least privilege, prompt injection, data minimisation, approvals, and secret handling. Never commit MCP credentials.

## Session 5 — End-to-end implementation (60 min)
Timebox:
- 0–5: confirm app and baseline tests run
- 5–10: planner agent and requirement
- 10–25: implement optional API priority filter
- 25–35: unit/integration tests
- 35–43: Playwright filter test and report
- 43–50: reviewer agent, inspect findings and fix valid issues
- 50–57: commit/push branch and create PR
- 57–60: inspect PR/CI
Likely files changed: `TaskController`/`TaskService`, `app.js`/`index.html`, backend tests, `e2e/tests/task-priority.spec.ts`, and optionally clarified requirement docs.

## Recovery priority
If time runs short: API behaviour → backend tests → one Playwright test → review → PR. MCP integration and multi-agent orchestration are optional enhancements. The goal is to experience the complete lifecycle.
