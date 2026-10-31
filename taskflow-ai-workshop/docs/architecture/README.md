# Workshop architecture and customization map

TaskFlow is a Java/Spring Boot API with a static frontend and Playwright E2E tests.

Copilot layers:
1. Instructions establish repository and file-specific conventions.
2. Prompt files package repeatable tasks.
3. Custom agents define role-focused workflows.
4. Skills provide reusable procedures explicitly referenced by agents.
5. MCP exposes approved external tools/context, including Jira through Atlassian MCP.
6. Hooks run at supported agent lifecycle events; the included hook is a limited guardrail, not a complete security boundary.

See `docs/workshop/ai-development-lifecycle.md` and `docs/workshop/session-by-session-plan.md`.
